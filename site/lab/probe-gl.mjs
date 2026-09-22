import {chromium} from 'playwright';
for(const flags of [[],['--use-gl=egl'],['--use-gl=angle','--use-angle=gl'],['--use-gl=swiftshader']]) {
 const browser=await chromium.launch({headless:true,executablePath:'/data/data/com.termux/files/usr/bin/chromium-browser',args:['--no-sandbox','--ignore-gpu-blocklist',...flags]});
 const page=await browser.newPage();
 page.on('console',m=>{if(m.type()==='error') console.log('console',m.text().slice(0,300));});
 await page.goto('http://127.0.0.1:8018');
 console.log(JSON.stringify({flags,gl:await page.evaluate(()=>{const c=document.querySelector('[data-crystal]'); const gl=c?.getContext('webgl2');if(!gl)return 'unavailable'; const ext=gl.getExtension('WEBGL_debug_renderer_info');return {lost:gl.isContextLost(),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};})}));
 await browser.close();
}
