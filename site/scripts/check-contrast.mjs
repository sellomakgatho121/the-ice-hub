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

/** Solid hex, or null when the value is not a parseable colour. */
function parseColor(value) {
  if (!value) return null;
  const raw = value.trim();
  if (/^#[0-9a-f]{3,6}$/i.test(raw)) {
    const s = expandHex(raw).slice(1);
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
      a: 1,
    };
  }
  const ref = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (ref) return parseColor(VARS[ref[1]]);
  const m = raw.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (!m) return null;
  const a = m[4] === undefined ? 1
    : m[4].endsWith("%") ? Number(m[4].slice(0, -1)) / 100
    : Number(m[4]);
  return { r: +m[1], g: +m[2], b: +m[3], a: Math.min(1, Math.max(0, a)) };
}

function mixOver(layer, base) {
  const a = layer.a;
  return {
    r: layer.r * a + base.r * (1 - a),
    g: layer.g * a + base.g * (1 - a),
    b: layer.b * a + base.b * (1 - a),
  };
}

function toHex({ r, g, b }) {
  const c = (x) => Math.round(x).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/* Translucent faces are real paint now, not unknowns. They composite over the
   darkest real backdrop, --abyss: the glass pass computed its floors against
   exactly that worst case. For dark ink a darker face is the low side of
   contrast; every lighter backdrop behind the glass only raises the ratio,
   so a pass on this floor holds wherever the element can actually sit. */
const FLOOR = parseColor(VARS["--abyss"]) ?? { r: 5, g: 9, b: 12, a: 1 };

/** Effective colour of a value: opaque input unchanged, translucent input
    resolved over the worst-case floor. */
function resolve(value) {
  const c = parseColor(value);
  return c ? toHex(mixOver(c, FLOOR)) : null;
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
        /* Pseudo-element rules style a different box, never the element's own
           paint, so the walk excludes them outright. */
        pseudoEl: /::[-\w]+/.test(r[1]),
        /* Interaction-state rules describe transient pixels. The walk keeps
           the rest-state face (see winning()). */
        stateful: /:[-\w]+/.test(r[1]) && !/(::|:[\w-]+\([^()]*:)/.test(r[1]),
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

/* Selector tokens: classes, attribute tests, pseudo-classes (with inner
   argument for :not/:where), pseudo-elements, and bare tag names.
   :where(...) is zero-weight in real CSS, bare tags count in the element
   bucket of their own bucket math — this gate keeps the legacy convention:
   class-like tokens count, tags do not, so that relative weights between
   old and new selectors do not shift under a rewrite. */
const SEL_TOKEN = /\.[-\w]+|\[[^\]]+\]|::[-\w]+|:(?:not|where)\([^()]*\)|:[-\w]+|(?<=[\s>~+]|^)\b[a-z][-\w]*\b(?=[\s>~+,]|$)/g;

function selectorTokens(sel) {
  return sel.match(SEL_TOKEN) ?? [];
}

/* Evaluate one selector against a class chain + the terminal element's tag.
   Pseudo-classes like :hover are interaction STATE — always "satisfied" here;
   the rest-state preference in winning() models their cascade instead. */
function selectorMatches(sel, chain, tag) {
  for (const tok of sel.match(/\.[-\w]+|\[[^\]]+\]|::[-\w]+|:(?:not|where)\([^()]*\)|:[-\w]+|\b[a-z][-\w]*\b/g) ?? []) {
    if (tok.startsWith(".")) {
      if (!chain.includes(tok.slice(1))) return false;
    } else if (tok.startsWith("[")) {
      const name = (tok.match(/\[([^\]=~|^$*]+)/) ?? [])[1];
      if (!name || !chain.includes(name)) return false;
    } else if (tok.startsWith("::")) {
      return false; /* pseudo-element rules style another box */
    } else if (tok.startsWith(":")) {
      if (tok.startsWith(":not(")) {
        if (innerPartMatches(tok.slice(5, -1), chain, tag)) return false;
      } else if (tok.startsWith(":where(")) {
        if (!innerPartMatches(tok.slice(7, -1), chain, tag)) return false;
      }
    } else if (/^[a-z][-\w]*$/i.test(tok) && tok === tok.toLowerCase()) {
      if (tag && tok.toLowerCase() !== tag.toLowerCase()) return false;
    }
  }
  return true;
}

/* Inner arguments of :not(...) / :where(...) — single compound supported.
   A state pseudo inside the argument reads as satisfied (:not(:disabled)
   matches enabled and disabled buttons alike; interaction state is
   unknowable statically). */
function innerPartMatches(inner, chain, tag) {
  const t = inner.trim();
  if (!t) return true;
  if (t.startsWith(":")) return true;
  if (t.startsWith(".")) return chain.includes(t.slice(1));
  if (t.startsWith("[")) return chain.includes((t.match(/\[([^\]=~|^$*]+)/) ?? [])[1] ?? "");
  if (/^[a-z][-\w]*$/i.test(t)) return Boolean(tag) && t.toLowerCase() === tag.toLowerCase();
  return true;
}

const legacySpecificity = (sel) => {
  const ids = (sel.match(/#[\w-]+/g) ?? []).length;
  let cls = 0;
  for (const tok of selectorTokens(sel)) {
    if (tok.startsWith("::")) continue;      /* pseudo-elements: another box */
    if (tok.startsWith(":where(")) continue; /* zero weight in real CSS */
    cls += 1;
  }
  return ids * 1000 + cls;
};

/** Highest (specificity, source order) declaration of one property, with the
    rest-state bias: when a stateful rule (:hover, :disabled, ...) competes,
    a stateless declaration wins if one exists, and only outright stateless-
    absent properties degrade to the stateful winner. In steady view the
    rest-state pair is the pair axe measures; modelling the transient state
    as the effective paint would under-check the pair that actually ships. */
function winning(chain, prop, width, tags) {
  const terminal = Array.isArray(tags) ? tags[tags.length - 1] : tags ?? null;
  let bestN = null;
  let bestS = null;
  for (const rule of RULES) {
    if (rule.pseudoEl || !applicable(rule) || !mediaApplies(rule.media, width)) continue;
    const decl = rule.decls[prop];
    if (!decl) continue;
    for (const sel of rule.selectors) {
      if (!selectorMatches(sel, chain, terminal)) continue;
      const spec = legacySpecificity(sel);
      const slot = rule.stateful ? "bestS" : "bestN";
      const target = rule.stateful ? bestS : bestN;
      if (!target || spec > target.spec || (spec === target.spec && rule.order > target.order)) {
        const cand = { value: decl, spec, order: rule.order, sel };
        if (rule.stateful) bestS = cand; else bestN = cand;
      }
    }
  }
  return bestN ?? bestS;
}

/* ------------------------------------------------------------- DOM scoping */
function elementsWithin(html, rootClasses) {
  const found = [];
  const stack = [];
  const tags = [];
  const tagStack = [];
  let current = [...rootClasses];
  let currentTags = [...rootClasses.map(() => "section")];
  let pending = null;
  const openTag = (tag, classes, decorativish) => {
    pending = { classes, tag, decorative: decorativish };
    if (!decorativish && classes.length) {
      found.push({ tag, classes, chain: [...current, ...classes], chainTags: [...currentTags, ...classes.map(() => tag)], decorative: false });
    } else {
      pending.decorative = true;
    }
    if (!VOID.has(tag.toLowerCase())) {
      stack.push(classes);
      tagStack.push(tag);
      current = [...current, ...classes];
      currentTags = [...currentTags, ...classes.map(() => tag)];
    }
  };
  for (const t of html.matchAll(/<(\/?)([a-z0-9]+)([^>]*?)(\/?)>/gi)) {
    const [, closing, tag, attrs, selfClose] = t;
    if (closing) {
      const low = tag.toLowerCase();
      if (VOID.has(low)) continue; /* void closes were never opened here */
      const popped = stack.pop() ?? [];
      tagStack.pop();
      current = current.slice(0, current.length - popped.length);
      currentTags = currentTags.slice(0, currentTags.length - popped.length);
      continue;
    }
    const classes = (attrs.match(/class="([^"]+)"/)?.[1] ?? "").trim().split(/\s+/).filter(Boolean);
    /* WCAG 1.4.3 governs text pairs only; aria-hidden elements carry no text
       of their own, so they contribute nothing to check. The walker tracks
       them for chain continuity, but never audits their own colour. */
    const decorative = /aria-hidden=["']true["']/.test(attrs);
    const selfClosing = Boolean(selfClose) || VOID.has(tag.toLowerCase());
    if (classes.length || !decorative) {
      openTag(tag, classes, decorative && classes.length > 0 ? true : decorative);
    }
    if (selfClosing && pending) {
      /* aria-hidden containers are still chain members for descendants */
      if (decorative && classes.length) {
        found.push({ tag, classes, chain: [...current, ...classes], chainTags: [...currentTags, ...classes.map(() => tag)], decorative: true });
      }
      pending = null;
      continue;
    }
    if (!selfClosing && pending) {
      if (decorative && classes.length) {
        found.push({ tag, classes, chain: [...current, ...classes], chainTags: [...currentTags, ...classes.map(() => tag)], decorative: true });
      }
      pending = null;
    }
  }
  return found;
}

/** Effective background: composite the whole ancestor stack, root face first,
    over the floor. Stopping at the first translucent face would drop the
    surface's lightening (a card's 26% face composited straight over the
    abyss misses the 72% stage behind it) and report false failures. */
function backgroundFor(chain, width, chainTags) {
  const layers = [];
  for (let i = 0; i < chain.length; i += 1) {
    const sub = chain.slice(0, i + 1);
    const subTags = chainTags ? chainTags.slice(0, i + 1) : null;
    for (const prop of ["background-color", "background"]) {
      const win = winning(sub, prop, width, subTags);
      if (!win) continue;
      const c = parseColor(win.value);
      if (c) layers.push(c);
      break;
    }
  }
  if (!layers.length) return null;
  let eff = FLOOR;
  for (const layer of layers) eff = mixOver(layer, eff);
  return { hex: toHex(eff), via: `stack of ${layers.length} face(s) over the floor` };
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
    if (el.decorative) {
      uncheckable.add(`${label} (aria-hidden, decorative)`);
      continue;
    }
    for (const width of WIDTHS) {
      const fgWin = winning(el.chain, "color", width, el.chainTags);
      const bg = backgroundFor(el.chain, width, el.chainTags);
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
    const fgWin = winning(el.chain, "color", WIDTHS[0], el.chainTags);
    const bg = backgroundFor(el.chain, WIDTHS[0], el.chainTags);
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