const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const out='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/';
 const html=require('fs').readFileSync('/home/claude/grc-hub.html','utf8');
 const page=await b.newPage({viewport:{width:1360,height:900}});
 await page.setContent('<!doctype html><html><head><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'+html+'</body></html>');
 await page.waitForTimeout(300); await page.evaluate(()=>{go('projects'); document.querySelector('.lrow').scrollIntoView();}); await page.waitForTimeout(200);
 await page.screenshot({path:out+'d-ladder.png'});
 await page.evaluate(()=>go('lab')); await page.waitForTimeout(200); await page.screenshot({path:out+'d-lab.png'});
 await b.close();})();
