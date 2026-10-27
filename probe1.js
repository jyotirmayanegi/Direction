const {chromium}=require('playwright');
const OUT='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/shots';
(async()=>{ const b=await chromium.launch(); const logs=[];
 for (const [vp,scheme,tag] of [[{width:390,height:844},'dark','m'],[{width:390,height:844},'light','ml'],[{width:1280,height:900},'dark','d']]) {
 const ctx=await b.newContext({viewport:vp,colorScheme:scheme,hasTouch:tag!=='d',isMobile:tag!=='d'}); await ctx.addInitScript('window.claude={use:async()=>null}');
 const p=await ctx.newPage(); p.on('pageerror',e=>logs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') logs.push('console:'+m.text()); });
 await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(400);
 if (tag!=='d') { await p.click('#menuBtn'); await p.waitForTimeout(200); await p.screenshot({path:`${OUT}/${tag}-menu.png`});
   await p.evaluate(()=>document.querySelector('.sheet').scrollTo(0,9999)); await p.waitForTimeout(100); await p.screenshot({path:`${OUT}/${tag}-menu2.png`}); }
 else { await p.screenshot({path:`${OUT}/${tag}-side.png`}); }
 await ctx.close(); }
 console.log(logs); await b.close(); })();
