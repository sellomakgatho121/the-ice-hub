#!/usr/bin/env node
/* Before/after captures for the glass pass.
 *
 * Usage: node lab/glass/capture.mjs <prefix>
 * Writes lab/glass/<prefix>-<width>-<anchor>.png — viewport-only shots at
 * hero / counter / audience / visit for the 1440 desktop and 390 mobile
 * contexts. (Full-page rasters are too big for this device's headless shell.)
 */

import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const [, , PREFIX = "shot"] = process.argv;
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROOT = path.join(REPO, "site");
const OUT = path.join(REPO, "lab", "glass");

// Playwright gates on process.platform; under Termux node reports "android"
// even though the userland is Ubuntu-on-PRoot. NODE_OPTIONS is only honoured
// at process START, so if the spoof is not already loaded, re-exec ourselves
// with it before playwright is imported below.
if (process.platform !== "linux") {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    cwd: REPO,
    env: { ...process.env, NODE_OPTIONS: `--require ${path.join(REPO, "site", "platform-spoof.cjs")}` },
    stdio: "inherit",
  });
  process.exit(r.status ?? 1);
}

// Playwright is installed under site/node_modules — outside this file's
// resolution chain — so import it by absolute path, and pin the same
// headless-shell executable verify.mjs uses.
const { chromium } = await import(
  pathToFileURL(path.join(ROOT, "node_modules", "playwright", "index.mjs")).href
);
const { createServer } = await import("node:http");
const { readFile } = await import("node:fs/promises");
const { mkdir } = await import("node:fs/promises");

const MIME = { html: "text/html", css: "text/css", js: "text/javascript", mjs: "text/javascript", webp: "image/webp", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml", woff2: "font/woff2", json: "application/json" };

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x").pathname;
    const file = path.join(ROOT, url === "/" ? "index.html" : url.slice(1));
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[file.split(".").pop()] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise((ok) => server.listen(8123, ok));

const browser = await chromium.launch({
  executablePath: "/root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell",
});
const shots = [
  { w: 1440, h: 900, name: "1440" },
  { w: 390, h: 844, dpr: 2, mobile: true, name: "390" },
];
await mkdir(OUT, { recursive: true });
const anchors = [
  { name: "hero", sel: null },
  { name: "counter", sel: "#products" },
  { name: "audience", sel: "#audience-title" },
  { name: "visit", sel: "#visit" },
];
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dpr ?? 1,
    isMobile: Boolean(s.mobile), hasTouch: Boolean(s.mobile),
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:8123/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  for (const a of anchors) {
    if (a.sel) await page.locator(a.sel).scrollIntoViewIfNeeded();
    else await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, `${PREFIX}-${s.name}-${a.name}.png`) });
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`captured lab/glass/${PREFIX}-<width>-<anchor> for 8 anchor shots`);
process.exit(0);
