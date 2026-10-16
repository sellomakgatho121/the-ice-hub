/* Cascade-aware contrast gate.
 *
 * Parses styles.css into rules, resolves the cascade for every element that
 * actually sits inside a bright counter surface, and checks the winning
 * foreground/background pair against WCAG 1.4.3.
 *
 * A flat grep cannot answer this question: it sees a dark token somewhere in
 * a rule, not whether that token wins where the element actually sits. This
 * runs on this host; the Playwright gate does not.
 */

import { readFileSync } from "node:fs";

const RAW = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const HTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");

/* Comments must go before parsing. The selector scanner splits on commas,
   and prose in a comment contains commas, which turns comment text into
   phantom selectors and hides the real ones glued to the end of it. */
const CSS = RAW.replace(/\/\*[\s\S]*?\*\//g, "");

const WIDTHS = [1440, 768, 390];
const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "use", "path", "rect", "circle"]);

/* ------------------------------------------------------------------ colour */
const VARS = {};
for (const [, name, value] of CSS.matchAll(/(--[\w-]+):\s*([^;}]+)/g)) VARS[name] = value.trim();

function expandHex(h) {
  let s = h.replace(/^#/, "");
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return `#${s.toUpperCase()}`;
}

/** Solid hex, or null when the value is translucent or otherwise unknown. */
function resolve(value) {
  if (!value) return null;
  const raw = value.trim();
  if (/^#[0-9a-f]{3,6}$/i.test(raw)) return expandHex(raw);
  const ref = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (ref) return resolve(VARS[ref[1]]);
  return null;
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  return [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* ------------------------------------------------------------ rule parsing */
const RULES = [];
(function parse(block, ctx) {
  const at = /@(media|supports)([^{]*)\{([\s\S]*?)\n\}/g;
  let rest = block;
  let m;
  while ((m = at.exec(block))) {
    rest = rest.replace(m[0], "");
    const next = m[1] === "supports"
      ? { media: ctx.media, supports: ctx.supports ?? m[2].trim() }
      : { media: (ctx.media ? `${ctx.media} and ` : "") + m[2].trim(), supports: ctx.supports };
    parse(m[3], next);
  }
  for (const r of rest.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const decls = {};
    for (const [, prop, val] of r[2].matchAll(/([-a-z]+)\s*:\s*([^;]+)/g)) decls[prop.trim()] = val.trim();
    if (Object.keys(decls).length) {
      RULES.push({
        selectors: r[1].split(",").map((s) => s.trim()).filter(Boolean),
        decls,
        media: ctx.media,
        supports: ctx.supports,
        order: RULES.length,
      });
    }
  }
})(CSS, { media: null, supports: null });

/* Modelled as a modern browser that supports backdrop-filter, so the
   @supports-not fallbacks are inactive and the real (translucent) fill is
   what paints. Those fills are reported as unresolvable, never as passing. */
function applicable(rule) {
  return rule.supports === null;
}
function mediaApplies(query, width) {
  if (!query) return true;
  for (const clause of query.split(/\s+and\s+/)) {
    const min = clause.match(/min-width:\s*(\d+)px/);
    if (min && width < Number(min[1])) return false;
    const max = clause.match(/max-width:\s*(\d+)px/);
    if (max && width > Number(max[1])) return false;
  }
  return true;
}

const specificity = (sel) => {
  const ids = (sel.match(/#[\w-]+/g) ?? []).length;
  const cls = (sel.match(/\.[\w-]+|\[[^\]]+\]|::?[a-z-]+/g) ?? []).length;
  return ids * 1000 + cls;
};

function matches(sel, chain) {
  const parts = sel.match(/\.[\w-]+|\[[^\]]+\]|:{1,2}[a-z-]+/g) ?? [];
  if (parts.length === 0) return sel === "*";
  return parts.every((p) => {
    if (p.startsWith(".")) return chain.includes(p.slice(1));
    if (p.startsWith("[")) return chain.includes((p.match(/\[([^\]=~|^$*]+)/) ?? [])[1]);
    return true; /* pseudo-classes are assumed satisfied */
  });
}

/** Highest (specificity, source order) declaration of one property. */
function winning(chain, prop, width) {
  let best = null;
  for (const rule of RULES) {
    if (!applicable(rule) || !mediaApplies(rule.media, width)) continue;
    const decl = rule.decls[prop];
    if (!decl) continue;
    for (const sel of rule.selectors) {
      if (!matches(sel, chain)) continue;
      const spec = specificity(sel);
      if (!best || spec > best.spec || (spec === best.spec && rule.order > best.order)) {
        best = { value: decl, spec, order: rule.order, sel };
      }
    }
  }
  return best;
}

/* ------------------------------------------------------------- DOM scoping */
function elementsWithin(html, rootClasses) {
  const found = [];
  const stack = [];
  let current = [...rootClasses];
  for (const t of html.matchAll(/<(\/?)([a-z0-9]+)([^>]*?)(\/?)>/gi)) {
    const [, closing, tag, attrs, selfClose] = t;
    if (closing) {
      const popped = stack.pop() ?? [];
      current = current.slice(0, current.length - popped.length);
      continue;
    }
    const classes = (attrs.match(/class="([^"]+)"/)?.[1] ?? "").trim().split(/\s+/).filter(Boolean);
    if (classes.length) found.push({ tag, classes, chain: [...current, ...classes] });
    if (!selfClose && !VOID.has(tag.toLowerCase())) {
      stack.push(classes);
      current = [...current, ...classes];
    }
  }
  return found;
}

/** Nearest resolvable background, searched ancestor-outward to self. */
function backgroundFor(chain, width) {
  for (let i = 1; i <= chain.length; i += 1) {
    const sub = chain.slice(0, i);
    for (const prop of ["background-color", "background"]) {
      const win = winning(sub, prop, width);
      if (!win) continue;
      const hex = resolve(win.value);
      if (hex) return { hex, via: sub.join(" > ") };
    }
  }
  return null;
}

/* -------------------------------------------------------------------- run */
const failures = [];
const uncheckable = new Set();
const sections = [...HTML.matchAll(/<section class="([^"]*counter-surface[^"]*)"/g)];
const allElements = [];
let checked = 0;

for (const [, sectionClass] of sections) {
  const rootClasses = sectionClass.split(/\s+/).filter(Boolean);
  const start = HTML.indexOf(`<section class="${sectionClass}"`);
  const chunk = HTML.slice(start).match(/[\s\S]*?<\/section>/)[0];
  const inner = chunk.replace(/^[\s\S]*?<section[^>]*>/, "").replace(/<\/section>[\s\S]*$/, "");

  for (const el of elementsWithin(inner, rootClasses)) {
    allElements.push(el);
    const label = `.${el.classes.join(".")}`;
    for (const width of WIDTHS) {
      const fgWin = winning(el.chain, "color", width);
      const bg = backgroundFor(el.chain, width);
      const fg = fgWin && resolve(fgWin.value);
      if (!fg || !bg) {
        uncheckable.add(label);
        continue;
      }
      checked += 1;
      const ratio = contrast(fg, bg.hex);
      if (!Number.isFinite(ratio)) {
        /* A NaN ratio would sail through `ratio < 4.5` because every
           comparison with NaN is false. That is a silent pass, which is the
           one outcome this gate exists to prevent. */
        failures.push({ el: label, width, fg, bg: bg.hex, via: bg.via, ratio, sel: fgWin.sel, nan: true });
        continue;
      }
      if (ratio < 4.5) {
        failures.push({ el: label, width, fg, bg: bg.hex, via: bg.via, ratio, sel: fgWin.sel });
      }
    }
  }
}

/* DEBUG_CLASS=.button node scripts/check-contrast.mjs — prints how the cascade
   was resolved, so a pass can be audited rather than believed. */
const debugTarget = process.env.DEBUG_CLASS;
if (debugTarget) {
  for (const el of allElements) {
    if (!el.classes.includes(debugTarget)) continue;
    const fgWin = winning(el.chain, "color", WIDTHS[0]);
    const bg = backgroundFor(el.chain, WIDTHS[0]);
    console.log(`  ${el.tag}.${el.classes.join(".")}`);
    console.log(`    chain            ${el.chain.join(" > ")}`);
    console.log(`    colour winner    ${fgWin ? `${fgWin.sel} => ${fgWin.value} (spec ${fgWin.spec}, order ${fgWin.order})` : "NONE"}`);
    console.log(`    colour resolved  ${fgWin ? resolve(fgWin.value) : "unresolved"}`);
    console.log(`    background       ${bg ? `${bg.hex} from "${bg.via}"` : "unresolved"}`);
  }
}

const header = `contrast gate: ${sections.length} counter section(s) x ${WIDTHS.length} widths, ${checked} pair(s) resolved`;

/* A gate that resolves nothing and passes is worse than no gate: it reports
   success while examining zero pairs. Refuse to pass on an empty run. */
if (checked === 0 && failures.length === 0) {
  console.error(`${header}\n  FAIL - vacuous: no pair resolved, so nothing was actually checked`);
  console.error(`  unresolved: ${[...uncheckable].sort().join(", ") || "(nothing found in the DOM either)"}`);
  process.exitCode = 1;
} else if (failures.length === 0) {
  console.log(`${header}\n  PASS - every resolvable pair clears 4.5:1`);
  if (uncheckable.size) console.log(`  unresolved (translucent or material-dependent): ${[...uncheckable].sort().join(", ")}`);
} else {
  const seen = new Set();
  const rows = failures.filter((f) => {
    const k = `${f.el}|${f.fg}|${f.bg}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  console.log(`${header}\n  ${rows.length} FAILING pair(s)\n`);
  for (const f of rows) {
    console.log(`  ${f.el} @${f.width}px  ${f.fg} on ${f.bg} = ${f.nan ? "NaN (unparseable colour)" : `${f.ratio.toFixed(2)}:1`}`);
    console.log(`    winning colour rule : ${f.sel}`);
    console.log(`    background resolved from: ${f.via}`);
  }
  process.exitCode = 1;
}