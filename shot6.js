const {chromium}=require('playwright');const fs=require('fs');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', OUT=SP+'/shots';
(async()=>{ const b=await chromium.launch(); const logs=[];
 for (const [vp,scheme,tag] of [[{width:1280,height:860},'light','d'],[{width:390,height:844},'dark','m']]) {
 const ctx=await b.newContext({viewport:vp,colorScheme:scheme}); await ctx.addInitScript('window.claude={use:async()=>null}');
 const p=await ctx.newPage(); p.on('pageerror',e=>logs.push(e.message));
 await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(500);
 await p.evaluate(()=>{ S.progress.log={}; for(let i=0;i<126;i+=1){ const d=new Date(); d.setDate(d.getDate()-i); if(Math.random()<.55) S.progress.log[dayStr(d)]=Math.ceil(Math.random()*8);} setFocus("privacy"); go('home'); });
 await p.waitForTimeout(300); await p.screenshot({path:`${OUT}/${tag}-home2.png`, clip:{x:0,y:0,width:vp.width,height:Math.min(1400, 2400)}});
 await p.evaluate(()=>{ go('lab'); }); await p.waitForTimeout(200);
 await p.evaluate(()=>{ losOpen("mail"); }); await p.click('[data-mstart]'); await p.waitForTimeout(200); await p.screenshot({path:`${OUT}/${tag}-mail2.png`});
 await p.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("siem"); }); await p.click('[data-stab="tune"]'); await p.waitForTimeout(150); await p.screenshot({path:`${OUT}/${tag}-siem2.png`});
 await p.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("net"); }); await p.waitForTimeout(150); await p.screenshot({path:`${OUT}/${tag}-net2.png`});
 await p.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("term"); }); await p.waitForTimeout(150); await p.fill('.tcmd','ls -la'); await p.press('.tcmd','Enter'); await p.fill('.tcmd','cat welcome.txt'); await p.press('.tcmd','Enter'); await p.waitForTimeout(150); await p.screenshot({path:`${OUT}/${tag}-term2.png`});
 await p.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); }); await p.waitForTimeout(100); await p.screenshot({path:`${OUT}/${tag}-desk2.png`});
 await ctx.close(); }
 console.log('errors', logs); await b.close(); })();
