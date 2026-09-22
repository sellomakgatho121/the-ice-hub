#!/usr/bin/env node
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const URL = arg("--url", "http://localhost:8000");
const OUT = arg("--out", path.join(ROOT, "lab", "shots"));
await fs.mkdir(OUT, { recursive: true });

const CHROMIUM = process.env.CHROMIUM_PATH;
const launchOpts = { headless: true };
if (CHROMIUM) {
  launchOpts.executablePath = CHROMIUM;
  launchOpts.args = ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];
}
const browser = await chromium.launch(launchOpts);
const report = { url: URL, steps: [], errors: [] };

async function openPage(context, collectRequestFailures = true) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (collectRequestFailures && url.startsWith(URL)) pageErrors.push(`request failed: ${url}`);
  });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.state !== "loading");
  await page.waitForTimeout(500);
  return { page, pageErrors };
}

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
const { page, pageErrors } = await openPage(desktopContext);

const heroMetrics = await page.locator("#top").evaluate((element) => ({ top: element.offsetTop, height: element.offsetHeight, viewport: innerHeight }));
const positions = [0, .2, .4, .6, .8, 1];
const seen = [];
for (const [index, fraction] of positions.entries()) {
  const y = heroMetrics.top + (heroMetrics.height - heroMetrics.viewport) * fraction;
  await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: "instant" }), y);
  await page.waitForTimeout(170);
  seen.push(await page.locator("#reel-img").getAttribute("src"));
  await page.screenshot({ path: path.join(OUT, `hero-${String(index + 1).padStart(2, "0")}.png`) });
}
report.steps.push({ name: "hero frame scrub", distinct: new Set(seen).size, frames: seen, ok: new Set(seen).size === 6 });

const sectionIds = ["origin", "crack", "material", "range", "hours", "visit"];
for (const id of sectionIds) {
  const metrics = await page.locator(`#${id}`).evaluate((element) => ({ top: element.offsetTop, height: element.offsetHeight, viewport: innerHeight }));
  const fraction = id === "visit" ? 0 : .48;
  const y = metrics.top + Math.max(0, metrics.height - metrics.viewport) * fraction;
  await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: "instant" }), y);
  await page.waitForTimeout(260);
  await page.screenshot({ path: path.join(OUT, `${id}.png`) });
}

const runtime = await page.evaluate(() => ({
  canvas: Boolean(document.querySelector("[data-crystal]")),
  webgl: Boolean(document.querySelector("[data-crystal]")?.getContext("webgl2") || document.querySelector("[data-crystal]")?.getContext("webgl")),
  pageWidth: document.documentElement.scrollWidth,
  viewportWidth: document.documentElement.clientWidth,
  fonts: document.fonts.status,
  cards: document.querySelectorAll("[data-product-card]").length,
  framesLoaded: performance.getEntriesByType("resource").filter((entry) => entry.name.includes("ezgif-frame-")).length
}));
report.steps.push({ name: "runtime systems", ...runtime, ok: runtime.canvas && runtime.webgl && runtime.cards === 5 && runtime.pageWidth <= runtime.viewportWidth && runtime.fonts === "loaded" });

await page.locator('input[name="email"]').fill("not-an-email");
await page.locator('.reserve__form button[type="submit"]').click();
const formMessage = await page.locator("[data-reserve-hint]").textContent();
report.steps.push({ name: "form validation", message: formMessage, ok: formMessage.includes("Enter a valid email") });

await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
await page.waitForTimeout(80);
const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
report.steps.push({ name: "axe", violations: axe.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })), ok: axe.violations.length === 0 });

const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const { page: reducedPage, pageErrors: reducedErrors } = await openPage(reducedContext, false);
const reducedState = await reducedPage.evaluate(() => ({
  bodyState: document.body.dataset.state,
  heroHeight: document.querySelector("#top").getBoundingClientRect().height,
  viewport: innerHeight,
  frame: document.querySelector("#reel-img").getAttribute("src"),
  rangeHeight: document.querySelector("#range").getBoundingClientRect().height
}));
report.steps.push({ name: "reduced motion", ...reducedState, ok: reducedState.bodyState === "still" && reducedState.heroHeight <= reducedState.viewport + 2 && reducedState.frame.includes("021") });

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const { page: mobile, pageErrors: mobileErrors } = await openPage(mobileContext, false);
await mobile.screenshot({ path: path.join(OUT, "mobile-top.png") });
const mobileCrack = await mobile.locator("#crack").evaluate((element) => ({ top: element.offsetTop, height: element.offsetHeight, viewport: innerHeight }));
await mobile.evaluate((metrics) => window.scrollTo({ top: metrics.top + (metrics.height - metrics.viewport) * .5, behavior: "instant" }), mobileCrack);
await mobile.waitForTimeout(240);
await mobile.screenshot({ path: path.join(OUT, "mobile-crack.png") });
await mobile.locator("#range").scrollIntoViewIfNeeded();
await mobile.waitForTimeout(200);
await mobile.screenshot({ path: path.join(OUT, "mobile-range.png") });
const mobileLayout = await mobile.evaluate(() => ({
  pageWidth: document.documentElement.scrollWidth,
  viewportWidth: document.documentElement.clientWidth,
  minTarget: Math.min(...[...document.querySelectorAll("a,button,input,select")].filter((element) => element.offsetParent !== null && element.getAttribute("aria-hidden") !== "true" && element.tabIndex !== -1).map((element) => Math.min(element.getBoundingClientRect().width, element.getBoundingClientRect().height)))
}));
report.steps.push({ name: "mobile layout", ...mobileLayout, ok: mobileLayout.pageWidth <= mobileLayout.viewportWidth && mobileLayout.minTarget >= 44 });

report.errors.push(...pageErrors, ...reducedErrors, ...mobileErrors);
await browser.close();
await fs.writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
const ok = report.steps.every((step) => step.ok) && report.errors.length === 0;
console.log(JSON.stringify({ ok, steps: report.steps, errors: report.errors }, null, 2));
process.exit(ok ? 0 : 1);
