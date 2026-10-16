Object.defineProperty(process, "platform", { value: "linux" });
const { chromium } = await import("playwright");
const b = await chromium.launch({
  executablePath: "/root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell",
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--force-device-scale-factor=1"] });
const ctx = await b.newContext({ viewport:{width:1280,height:800}, deviceScaleFactor:1 });
const p = await ctx.newPage();
await p.goto("http://localhost:8000",{waitUntil:"domcontentloaded"});
await p.waitForFunction(()=>document.body.dataset.state==="ready"||document.body.dataset.state==="still");
await p.waitForTimeout(900);
await p.screenshot({ path:"lab/shots/v2-hero.png" });
const box = await p.evaluate(()=>{const e=document.querySelector("[data-hero]");return {t:e.offsetTop,h:e.offsetHeight,v:innerHeight};});
for (const [n,f] of [["v2-beat2",0.28],["v2-beat3",0.6],["v2-seam",0.56]]) {
  await p.evaluate(y=>scrollTo({top:y,behavior:"instant"}), box.t+(box.h-box.v)*f);
  await p.waitForTimeout(420);
  await p.screenshot({ path:`lab/shots/${n}.png` });
}
await p.evaluate(()=>scrollTo({top:document.querySelector("#products").offsetTop,behavior:"instant"}));
await p.waitForTimeout(400);
await p.screenshot({ path:"lab/shots/v2-counter.png" });
for (let i=0;i<2;i++) await p.locator('[data-step="1"]').nth(0).click();
await p.waitForTimeout(300);
await p.screenshot({ path:"lab/shots/v2-summary.png" });
await p.evaluate(()=>scrollTo({top:document.querySelector("#delivery").offsetTop-40,behavior:"instant"}));
await p.waitForTimeout(400);
await p.screenshot({ path:"lab/shots/v2-audience.png" });
await p.evaluate(()=>scrollTo({top:document.querySelector("#visit").offsetTop-40,behavior:"instant"}));
await p.waitForTimeout(400);
await p.screenshot({ path:"lab/shots/v2-visit.png" });
console.log("  desktop shots written");
const m = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
const mp = await m.newPage();
await mp.goto("http://localhost:8000",{waitUntil:"domcontentloaded"});
await mp.waitForTimeout(900);
await mp.screenshot({ path:"lab/shots/v2-mobile-hero.png" });
await mp.evaluate(()=>scrollTo({top:document.querySelector("#products").offsetTop,behavior:"instant"}));
await mp.waitForTimeout(400);
await mp.screenshot({ path:"lab/shots/v2-mobile-counter.png" });
console.log("  mobile shots written");
await b.close();
