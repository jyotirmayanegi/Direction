const {chromium}=require('playwright');const fs=require('fs');const src=fs.readFileSync(__dirname+'/shot4.js','utf8');const i=src.indexOf('const MOCK=`')+12,j=src.indexOf('`;',i);const MOCK=eval('`'+src.slice(i,j)+'`');
const OUT='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/shots';
(async()=>{const b=await chromium.launch(); for (const [vp,n] of [[{width:390,height:844},'m'],[{width:1280,height:860},'d'],[{width:820,height:1100},'t']]) {
 const c=await b.newContext({viewport:vp,hasTouch:n!=='d',isMobile:false});await c.addInitScript(MOCK);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/claude/grc-hub.html');await p.waitForTimeout(1500);await p.evaluate(()=>go('lab'));await p.waitForTimeout(800);
 const st=await p.$('[data-losopen="drill"]'); if(!st){ const pb=await p.$('[data-lospanel]'); console.log(n,'no start btn; panel toggle',!!pb); if(pb){await pb.click();await p.waitForTimeout(300);} }
 const st2=await p.$('[data-losopen="drill"]'); let r={}; if(st2){ try{ await st2.click({timeout:3000}); }catch(e){ r.startErr=e.message.slice(0,200);} }
 await p.waitForTimeout(400); await p.screenshot({path:OUT+'/drill-'+n+'.png'});
 for (let k=0;k<3;k++){ const bt=await p.$(`[data-drill^="${k}|"]`); if(!bt){r['q'+k]='missing';continue;} try{ await bt.click({timeout:3000}); r['q'+k]='ok'; }catch(e){ r['q'+k]=e.message.split('\n').filter(l=>/intercept|outside|not visible|stable/.test(l)).slice(0,2).join(' | ');} await p.waitForTimeout(200);}
 r.state=await p.evaluate(()=>JSON.stringify(drillToday().ans)); console.log(n, JSON.stringify(r), errs); await c.close(); } await b.close();})();
