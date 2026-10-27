const {chromium}=require('playwright');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', OUT=SP+'/shots';
(async()=>{ const b=await chromium.launch(); const logs=[];
 for (const [vp,scheme,tag] of [[{width:1280,height:900},'light','d'],[{width:390,height:844},'dark','m']]) {
 const ctx=await b.newContext({viewport:vp,colorScheme:scheme}); await ctx.addInitScript('window.claude={use:async()=>null}');
 const p=await ctx.newPage(); p.on('pageerror',e=>logs.push(e.message));
 await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(500);
 const info = await p.evaluate(()=>{ ["privacy","dpdp","gdpr","c-basics"].forEach(id=>{ const t=TOPIC[id]; if(t) t.subs.forEach((s,i)=>S.progress.done[key(id,i)]=true); }); setFocus("privacy"); go('learn'); const D=vennData("privacy"); return Object.fromEntries(Object.entries(D.R).map(([k,v])=>[k,v.map(t=>t.id)])); });
 if (tag==='d') console.log(JSON.stringify(info));
 await p.waitForTimeout(200); const el = await p.$('.venncard'); await el.screenshot({path:`${OUT}/${tag}-venn.png`});
 await p.click('g[data-vsel="b"]'); await p.waitForTimeout(150); await (await p.$('.venncard')).screenshot({path:`${OUT}/${tag}-venn-sel.png`});
 await p.selectOption('#vennRole','grcan'); await p.waitForTimeout(150); await (await p.$('.venncard')).screenshot({path:`${OUT}/${tag}-venn-grc.png`});
 await ctx.close(); }
 console.log('errors', logs); await b.close(); })();
