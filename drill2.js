const {chromium}=require('playwright');const fs=require('fs');const src=fs.readFileSync(__dirname+'/shot4.js','utf8');const i=src.indexOf('const MOCK=`')+12,j=src.indexOf('`;',i);const MOCK=eval('`'+src.slice(i,j)+'`');
const REAL=fs.readFileSync('/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/db/data/users/me/progress.json','utf8');
const OUT='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/shots';
(async()=>{const b=await chromium.launch(); for (const [vp,n] of [[{width:390,height:844},'m'],[{width:1280,height:860},'d']]) {
 const c=await b.newContext({viewport:vp,hasTouch:true});await c.addInitScript(MOCK);await c.addInitScript(`__mock.store.set('data/users/u1/progress',${REAL});`);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file:///home/claude/grc-hub.html#lab');await p.waitForTimeout(2500);
 const st=await p.$('[data-losopen="drill"]'); console.log(n,'start',!!st); if(st) await st.tap().catch(e=>console.log('tapErr',e.message.slice(0,200)));
 await p.waitForTimeout(500);
 const hits=await p.evaluate(()=>[...document.querySelectorAll('[data-drill]')].map(b=>{b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===b||b.contains(e)?'ok':(e?e.className||e.tagName:'none')}));
 console.log(n,'hits',JSON.stringify(hits));
 const bt=await p.$('[data-drill^="0|"]'); if(bt){ await bt.tap().catch(e=>console.log('t',e.message.slice(0,300))); await p.waitForTimeout(300);} console.log(n,await p.evaluate(()=>JSON.stringify(drillToday())), errs);
 await p.screenshot({path:OUT+'/drill2-'+n+'.png'}); await c.close(); } await b.close();})();
