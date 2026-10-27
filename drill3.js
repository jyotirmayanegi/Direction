const {chromium}=require('playwright');const fs=require('fs');const src=fs.readFileSync(__dirname+'/shot4.js','utf8');const i=src.indexOf('const MOCK=`')+12,j=src.indexOf('`;',i);const MOCK=eval('`'+src.slice(i,j)+'`');
(async()=>{const b=await chromium.launch(); for (const w of [360,600,700,768,820,1000,1100,1440]) {
 const c=await b.newContext({viewport:{width:w,height:800}});await c.addInitScript(MOCK);const p=await c.newPage();
 await p.goto('file:///home/claude/grc-hub.html#lab');await p.waitForTimeout(1500);
 const hit=sel=>p.evaluate(sel=>{const b=document.querySelector(sel); if(!b) return 'missing'; b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===b||b.contains(e)?'ok':'covered by '+(e?(e.closest('[id]')||e).id+' '+e.className:'none')},sel);
 const r={start:await hit('#losPanel [data-losopen="drill"]')};
 await p.evaluate(()=>losOpen('term')); await p.waitForTimeout(200); r.startAfterTerm=await hit('#losPanel [data-losopen="drill"]');
 await p.evaluate(()=>losOpen('drill')); await p.waitForTimeout(300);
 r.opts=await p.evaluate(()=>[...document.querySelectorAll('[data-drill]')].map(b=>{b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===b||b.contains(e)?1:0}).join(''));
 console.log(w, JSON.stringify(r)); await c.close(); } await b.close();})();
