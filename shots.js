const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const out='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/';
 const html=require('fs').readFileSync('/home/claude/grc-hub.html','utf8');
 const page=await b.newPage({viewport:{width:1360,height:900}}); const errs=[]; page.on('pageerror',e=>errs.push(e.message));
 await page.setContent('<!doctype html><html><head><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'+html+'</body></html>');
 await page.waitForTimeout(400);
 const shot=async(k,name,full=false)=>{ await page.evaluate(k=>go(k),k); await page.waitForTimeout(300); await page.screenshot({path:out+name+'.png',fullPage:full}); };
 await shot('home','d-home'); await shot('lab','d-lab');
 await page.evaluate(()=>go('lab-t1')); await page.waitForTimeout(200); for (const c of ['whoami','ls -l']) { await page.fill('#termIn',c); await page.press('#termIn','Enter'); }
 await page.screenshot({path:out+'d-term.png'});
 await shot('lab-n1','d-wire'); await shot('projects','d-projects'); await shot('proj-grc-1','d-proj');
 await page.evaluate(()=>document.getElementById('pp-coach').scrollIntoView()); await page.screenshot({path:out+'d-coach.png'});
 await page.setViewportSize({width:390,height:844}); await shot('home','m-home'); await shot('projects','m-projects');
 await page.emulateMedia({colorScheme:'dark'}); await shot('lab-t1','m-term-dark');
 console.log(errs); await b.close();})();
