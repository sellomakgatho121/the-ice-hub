import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const url = process.env.SITE_URL || 'http://127.0.0.1:8018';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/data/data/com.termux/files/usr/bin/chromium-browser',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const report = { checks:[], errors:[] };
const out = new URL('../lab/redesign/', import.meta.url);
await fs.mkdir(out,{recursive:true});
try {
  for (const width of [320,390,768,1440]) {
    const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror',error=>report.errors.push(String(error)));
    await page.goto(url);
    await page.waitForFunction(()=>document.body.dataset.state==='still');
    await page.evaluate(()=>document.fonts.ready);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#main').evaluate(el=>el===document.activeElement),true);
    const nav = await page.locator('.topbar').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
    assert.ok(nav.scroll<=nav.width,`navigation overflow at ${width}`);
    const choices=[];
    for (const key of ['cubes','blocks','spheres','drinks','venue']) {
      await page.locator(`[data-order="${key}"]`).click();
      assert.equal(await page.locator('select[name="order"]').inputValue(),key);
      assert.equal(await page.locator('input[name="email"]').evaluate(el=>el===document.activeElement),true);
      choices.push(key);
    }
    const visible = await page.locator('input[name="email"]').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=72 && r.bottom<=innerHeight;});
    assert.ok(visible,`email not visible after product link at ${width}`);
    const frame = await page.locator('#reel-img').getAttribute('src');
    assert.ok(frame.endsWith('021.jpg'),'reduced frame changes on scroll');
    await page.locator('input[name="email"]').fill('not-valid');
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('[data-reserve-hint]').innerText(),/Enter a valid email/);
    const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false,`page overflow at ${width}`);
    await page.screenshot({path:fileURLToPath(new URL(`collection-${width}.png`,out))});
    report.checks.push({width,keyboard:true,choices,axeViolations:axe.violations.length,overflow,reducedFrame:frame});
    await context.close();
  }
  const fallback = await browser.newContext({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});
  const page = await fallback.newPage();
  page.on('pageerror',error=>report.errors.push(String(error)));
  await page.route('https://api.web3forms.com/**',route=>route.abort());
  await page.goto(url);
  await page.waitForSelector('.crystal--still',{state:'attached'});
  assert.equal(await page.locator('.crystal--still').evaluate(el=>el.complete && el.naturalWidth>0),true);
  report.checks.push({webglUnavailable:'static image rendered, no uncaught exception'});
  await page.locator('#crack').evaluate(el=>scrollTo({top:el.offsetTop,behavior:'instant'}));
  await page.screenshot({path:fileURLToPath(new URL('fallback-mobile.png',out))});
  if ((await page.locator('[data-reserve-hint]').innerText()).includes('Demo mode')) {
    await page.locator('input[name="email"]').fill('design-test@example.com');
    await page.locator('button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-reserve-hint]').textContent.includes('no email was sent'));
    report.checks.push({demoSubmit:'validation and no-email confirmation verified'});
  } else report.checks.push({demoSubmit:'not executed: live configuration'});
  await fallback.close();
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));
  report.ok=true;
} catch(error) {report.ok=false;report.failure=error.stack;process.exitCode=1;}
finally { await browser.close(); await fs.writeFile(new URL('interaction-report.json',out),JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); }
