const {chromium}=require('playwright');const fs=require('fs');const src=fs.readFileSync(__dirname+'/shot4.js','utf8');const i=src.indexOf('const MOCK=`')+12,j=src.indexOf('`;',i);const MOCK=eval('`'+src.slice(i,j)+'`');
const REAL=fs.readFileSync('/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad/db/data/users/me/progress.json','utf8');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:860}});await c.addInitScript(MOCK);await c.addInitScript(`__mock.store.set('data/users/u1/progress',${REAL});`);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///home/claude/grc-hub.html#lab');await p.waitForTimeout(2500);
 await p.click('#losPanel [data-losopen="drill"]');await p.waitForTimeout(300);await p.click('[data-drill^="0|"]');await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{ go('dpdp'); const before=S.progress.log[today()]||0; const box=document.querySelector('[data-k]'); if(box){box.click();} return {ans:drillToday().ans, log:S.progress.log, done:Object.keys(S.progress.done).length, frozen:Object.isFrozen(S.progress.labos)}; });
 console.log(JSON.stringify(r), errs); await b.close();})();
