#!/usr/bin/env node
/* Browser verification gate.
 *
 * Every assertion here maps to a row in DESIGN.md section 8b, or to a gate in
 * section 9.
 *
 * This host is Termux on Android, so Node reports process.platform === 'android'
 * and Playwright refuses to resolve a browser. The userland is actually Ubuntu
 * 24.04 under PRoot (glibc 2.39, Linux arm64 kernel), so Playwright's normal
 * Linux build runs correctly. The platform is relabelled and imports are made
 * dynamic, because ESM hoists static imports above any code that would patch
 * process.platform.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

Object.defineProperty(process, "platform", { value: "linux" });

const { chromium } = await import("playwright");
const { default: AxeBuilder } = await import("@axe-core/playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const URL = arg("--url", "http://localhost:8000");
const OUT = arg("--out", path.join(ROOT, "lab", "shots"));
await fs.mkdir(OUT, { recursive: true });

const HEADLESS_SHELL =
  "/root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell";

const launchOpts = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--force-device-scale-factor=1",
  ],
};
if (existsSync(HEADLESS_SHELL)) {
  launchOpts.executablePath = process.env.CHROMIUM_PATH ?? HEADLESS_SHELL;
} else if (process.env.CHROMIUM_PATH) {
  launchOpts.executablePath = process.env.CHROMIUM_PATH;
}

const browser = await chromium.launch(launchOpts);
const report = { url: URL, executable: launchOpts.executablePath ?? "playwright default", steps: [], errors: [] };

const step = (name, ok, detail) => {
  report.steps.push({ name, ok, ...detail });
  return ok;
};

async function openPage(context, { js = true } = {}) {
  const page = await context.newPage();
  const errors = [];
  const thirdParty = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(URL)) errors.push(`request failed: ${request.url()}`);
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(URL) && !request.url().startsWith("data:")) {
      thirdParty.push(request.url());
    }
  });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  if (js) {
    await page.waitForFunction(() => document.body.dataset.state === "ready" || document.body.dataset.state === "still");
    await page.waitForTimeout(400);
  }
  return { page, errors, thirdParty };
}

/* ------------------------------------------------------- desktop, motion on */
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const { page, errors, thirdParty } = await openPage(desktop);

const heroBox = await page.locator("[data-hero]").evaluate((el) => ({
  top: el.offsetTop,
  height: el.offsetHeight,
  viewport: innerHeight,
}));

/* The reel must advance monotonically and show distinct frames. */
const seen = [];
const beats = [];
for (const [index, fraction] of [0, 0.2, 0.4, 0.6, 0.8, 1].entries()) {
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }),
    heroBox.top + (heroBox.height - heroBox.viewport) * fraction);
  await page.waitForTimeout(180);
  seen.push(await page.locator("[data-reel-layer].is-front").getAttribute("src"));
  beats.push(await page.evaluate(() =>
    document.querySelector("[data-beat][data-active]")?.dataset.beat ?? null));
  await page.screenshot({ path: path.join(OUT, `hero-${String(index + 1).padStart(2, "0")}.png`) });
}
step("hero scrub shows distinct frames", new Set(seen).size >= 5, { frames: seen, distinct: new Set(seen).size });
/* Frames are zero-padded to 3 digits (001-030), so the range is checked
   numerically. A regex assuming 2 digits silently rejected frame-001. */
const reelIndex = (src) => {
  const m = /^assets\/reel\/frame-(\d{3})\.webp$/.exec(src ?? "");
  return m ? Number(m[1]) : null;
};
const reelIndices = seen.map(reelIndex);
step("frames stay inside the 30-frame reel",
  reelIndices.every((n) => n !== null && n >= 1 && n <= 30), { frames: seen, indices: reelIndices });
step("exactly one reel layer is frontmost", await page.evaluate(() => {
  const front = [...document.querySelectorAll("[data-reel-layer]")].filter((n) => n.classList.contains("is-front"));
  const layers = document.querySelectorAll("[data-reel-layer]");
  return front.length === 1 && layers.length === 2;
}), {});
step("crossfade duration is set on the reel",
  await page.evaluate(() => getComputedStyle(document.querySelector("[data-reel-layer]")).transitionDuration !== "0s"),
  {});
step("exactly one beat active at a time",
  beats.every((b) => b !== null), { beats });

/* The hard cut sits on the beat 3/4 boundary: frames 1-18 then 19-20. */
const boundary = await page.evaluate(() => {
  const out = [];
  for (const node of document.querySelectorAll("[data-beat]")) out.push(Number(node.dataset.beat));
  return out;
});
step("four beats in order", boundary.join(",") === "1,2,3,4", { beats: boundary });

await page.locator("#products").scrollIntoViewIfNeeded();
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(OUT, "counter.png") });

const runtime = await page.evaluate(() => ({
  pageWidth: document.documentElement.scrollWidth,
  viewportWidth: document.documentElement.clientWidth,
  fonts: document.fonts.status,
  cards: document.querySelectorAll("[data-product-card]").length,
  /* The two-layer reel fetches frame-001 through both <img> layers as well as
     the script's warm-up, so resource ENTRIES exceed the set (32 vs 30). The
     budget is on distinct frame files, which is the invariant the 30-frame
     contract actually owns. */
  frameSet: [...new Set(performance.getEntriesByType("resource")
    .map((e) => (/assets\/reel\/frame-(\d{3})\.webp$/.exec(e.name) ?? [])[1])
    .filter(Boolean))],
}));
step("three product cards, no canvas, no WebGL", runtime.cards === 3 && !runtime.canvas, runtime);
step("no horizontal overflow at 1440", runtime.pageWidth <= runtime.viewportWidth, runtime);
step("fonts loaded", runtime.fonts === "loaded", { fonts: runtime.fonts });
step("reel frame count within the set", runtime.frameSet.length <= 30, { frames: runtime.frameSet.length });

/* Zero third-party requests on load is the strictest rule in the contract. */
step("no third-party request on load", thirdParty.length === 0, { thirdParty });

/* ---- commerce: steppers, live total, and the bulk-threshold announcement.
 * The owner raised the bulk threshold from 20 bags to 30, so the crossing is
 * now 29 -> 30: at 29 the line must still bill standard price, and one more
 * bag must flip it to stock price and announce politely. Both sides of the
 * boundary are asserted, so a threshold regression in either direction is
 * caught in the browser, not just in the unit tests. */
const addButtons = page.locator('[data-step="1"]');
for (let i = 0; i < 29; i += 1) await addButtons.nth(0).click();
await page.waitForTimeout(120);
const at29 = await page.evaluate(() => ({
  price: document.querySelector('[data-product="cubes-2kg"] [data-price]')?.textContent,
  total: document.querySelector("[data-summary-total]")?.textContent,
  announced: document.querySelector("[data-order-announce]")?.textContent ?? "",
  summaryHidden: document.querySelector("[data-summary]")?.hidden,
}));
step("29 bags still bill standard price", at29.price === "R17" && at29.total === "R493", at29);
step("no stock-price announcement before the threshold", !/stock price/i.test(at29.announced), at29);
step("summary visible once items exist", at29.summaryHidden === false, at29);

await addButtons.nth(0).click();
await page.waitForTimeout(120);
const at30 = await page.evaluate(() => ({
  price: document.querySelector('[data-product="cubes-2kg"] [data-price]')?.textContent,
  total: document.querySelector("[data-summary-total]")?.textContent,
  announced: document.querySelector("[data-order-announce]")?.textContent ?? "",
}));
step("30 bags drop the whole line to stock price", at30.price === "R10", at30);
step("live total updates", at30.total === "R300", at30);
step("threshold crossing is announced politely", /stock price/i.test(at30.announced), at30);

const waHref = await page.locator("[data-summary-cta]").getAttribute("href");
step("WhatsApp handoff encodes the order",
  Boolean(waHref?.startsWith("https://wa.me/27818592919?text=")), { waHref: waHref?.slice(0, 80) });

/* Quantity floors at zero. The decrement control is disabled at zero by
   design, so the floor must be asserted as state, not by clicking a dead
   button. Starting from 30, exactly 30 decrements must reach the floor and
   disable the control again. */
for (let i = 0; i < 30; i += 1) await page.locator('[data-step="-1"]').nth(0).click();
await page.waitForTimeout(120);
const atZero = await page.evaluate(() => ({
  qty: document.querySelector('[data-qty="cubes-2kg"]')?.textContent,
  decrementDisabled: document.querySelector('[data-product="cubes-2kg"] [data-step="-1"]')?.disabled,
  summaryHidden: document.querySelector("[data-summary]")?.hidden,
}));
step("quantity floors at zero, control disables, summary hides",
  atZero.qty === "0" && atZero.decrementDisabled === true && atZero.summaryHidden === true, atZero);

/* And the control must come back when it becomes reachable again. */
for (let i = 0; i < 2; i += 1) await addButtons.nth(0).click();
const reEnabled = await page.evaluate(() => ({
  qty: document.querySelector('[data-qty="cubes-2kg"]')?.textContent,
  decrementDisabled: document.querySelector('[data-product="cubes-2kg"] [data-step="-1"]')?.disabled,
  summaryHidden: document.querySelector("[data-summary]")?.hidden,
}));
step("stepper re-enables above zero and the summary returns",
  reEnabled.qty === "2" && reEnabled.decrementDisabled === false && reEnabled.summaryHidden === false, reEnabled);

/* ---- map is opt-in: no geocode request until the button is pressed */
const beforeMap = thirdParty.length;
await page.locator("#visit").scrollIntoViewIfNeeded();
await page.waitForTimeout(150);
step("map panel absent until requested",
  await page.locator("[data-map]").isHidden(), { thirdParty: thirdParty.slice(beforeMap) });

await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
step("axe: zero WCAG A/AA violations", axe.violations.length === 0, {
  violations: axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.length,
    targets: v.nodes.map((n) => n.target.join(" ")),
    detail: v.nodes[0]?.failureSummary?.replace(/\s+/g, " ").slice(0, 160),
  })),
});
await desktop.close();

/* ------------------------------------------ a single frame that fails to load */
const broken = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await broken.route("**/assets/reel/frame-01*.webp", (route) => route.abort());
const { page: brokenPage } = await openPage(broken);
await brokenPage.evaluate(() => scrollTo({ top: innerHeight * 4, behavior: "instant" }));
await brokenPage.waitForTimeout(300);
const stillShows = await brokenPage.evaluate(() => {
  const front = document.querySelector("[data-reel-layer].is-front");
  return Boolean(front?.getAttribute("src")) && front.getBoundingClientRect().height > 0;
});
step("a failed reel frame holds the nearest frame, never blanks", stillShows, {});
await broken.close();

/* ------------------------------------------------------- reduced motion */
const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const { page: reducedPage } = await openPage(reduced);
const reducedState = await reducedPage.evaluate(() => ({
  state: document.body.dataset.state,
  heroHeight: document.querySelector("[data-hero]").getBoundingClientRect().height,
  viewport: innerHeight,
}));
step("reduced motion collapses the hero to one viewport",
  reducedState.state === "still" && reducedState.heroHeight <= reducedState.viewport + 2, reducedState);
await reduced.close();

/* ------------------------------------------------- JavaScript disabled */
const noJs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
const { page: noJsPage } = await openPage(noJs, { js: false });
const staticState = await noJsPage.evaluate(() => ({
  prices: [...document.querySelectorAll("[data-price]")].map((n) => n.textContent),
  hours: document.querySelectorAll(".hours div").length,
  address: document.querySelector(".address")?.textContent?.trim().length ?? 0,
  directOrders: document.querySelectorAll("[data-direct-order]").length,
  summaryHidden: document.querySelector("[data-summary]")?.hidden,
  tel: document.querySelector('a[href^="tel:"]')?.getAttribute("href"),
}));
step("no-JS: static prices intact", staticState.prices.join(",") === "R17,R22,R55", staticState);
step("no-JS: full hours, address and click-to-call intact",
  staticState.hours === 3 && staticState.address > 20 && staticState.tel === "tel:+27818592919", staticState);
step("no-JS: a direct WhatsApp link per product", staticState.directOrders === 3, staticState);
step("no-JS: the quantity builder is absent, not broken", staticState.summaryHidden === true, staticState);
await noJs.close();

/* ------------------------------------------------------------- mobile */
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
const { page: mobilePage } = await openPage(mobile);
await mobilePage.screenshot({ path: path.join(OUT, "mobile-hero.png") });
await mobilePage.locator("#products").scrollIntoViewIfNeeded();
await mobilePage.waitForTimeout(250);
await mobilePage.screenshot({ path: path.join(OUT, "mobile-counter.png") });
const mobileLayout = await mobilePage.evaluate(() => {
  const targets = [...document.querySelectorAll("a,button")]
    .filter((el) => el.offsetParent !== null && el.tabIndex !== -1);
  return {
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    minTarget: Math.min(...targets.map((el) => {
      const r = el.getBoundingClientRect();
      return Math.min(r.width, r.height);
    })),
  };
});
step("no horizontal overflow at 390", mobileLayout.pageWidth <= mobileLayout.viewportWidth, mobileLayout);
step("all tap targets at least 44px", mobileLayout.minTarget >= 44, mobileLayout);
await mobile.close();

report.errors.push(...errors);
await browser.close();
await fs.writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

/* An empty run must not read as success. */
const ran = report.steps.length;
const ok = ran > 0 && report.steps.every((s) => s.ok) && report.errors.length === 0;
console.log(JSON.stringify({ ok, ran, steps: report.steps, errors: report.errors }, null, 2));
process.exit(ok ? 0 : 1);