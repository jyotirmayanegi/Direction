const {chromium}=require('playwright');const fs=require('fs');
const src=fs.readFileSync(__dirname+'/shot4.js','utf8'); const i=src.indexOf('const MOCK=`')+12, j=src.indexOf('`;',i); const MOCK=eval('`'+src.slice(i,j)+'`');
const SEED=`(()=>{ const d=new Date(),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); window.__k=k; __mock.store.set('data/users/u1/progress',{done:{},quiz:{},log:{},doneAt:{},reviewed:{},tlog:{[k]:{grc:8}}}); })()`;
(async()=>{ const b=await chromium.launch(); const errs=[]; const c=await b.newContext({viewport:{width:1280,height:860}}); await c.addInitScript(MOCK); await c.addInitScript(SEED);
 const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(2000);
 const T={};
 T.healed=await p.evaluate(()=>({log:S.progress.log, stored:__mock.store.get('data/users/u1/progress').log, cell:document.querySelector('.actcard .heatcal .wk:last-child .d:last-child').className}));
 // another device writes yesterday's work into the account copy
 await p.evaluate(()=>{ const y=new Date(); y.setDate(y.getDate()-1); const yk=dayStr(y); window.__yk=yk; const r=JSON.parse(JSON.stringify(__mock.store.get('data/users/u1/progress'))); r.log[yk]=5; r.done={'grc|0':true}; __mock.store.set('data/users/u1/progress',r); __mock.listeners.forEach(l=>{try{l()}catch(e){}}); });
 await p.waitForTimeout(400);
 T.synced=await p.evaluate(()=>({log:S.progress.log, done:S.progress.done}));
 // this tab acts: quiz + topic open + stale overwrite guard
 await p.evaluate(()=>{ go('dpdp'); }); await p.waitForTimeout(1200);
 T.afterOpen=await p.evaluate(()=>({log:S.progress.log, stored:__mock.store.get('data/users/u1/progress').log}));
 await p.evaluate(()=>{ S.progress.log={}; save('progress'); }); await p.waitForTimeout(1200); // simulate a stale tab saving
 T.staleGuard=await p.evaluate(()=>__mock.store.get('data/users/u1/progress').log);
 console.log(JSON.stringify(T,null,1),'ERR',errs); await b.close(); })();
