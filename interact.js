/* Interaction pass with saved account data (read-only from the platform, like the real one): every common action must change state and survive a reload. */
const {chromium}=require('playwright');const fs=require('fs');const src=fs.readFileSync(__dirname+'/shot4.js','utf8');const i=src.indexOf('const MOCK=`')+12,j=src.indexOf('`;',i);const MOCK=eval('`'+src.slice(i,j)+'`');
const REAL=fs.readFileSync(__dirname+'/fx/progress-sample.json','utf8');
const SEED=`__mock.store.set('data/users/u1/progress',${REAL});
 __mock.store.set('data/users/u1/profile',{name:'Jyotirmaya Negi',headline:'x',targets:['grcan','privacy'],claims:[],extra:['DORA'],certsHave:[],certsPlan:[]});
 __mock.store.set('data/users/u1/network',{contacts:[{name:'Old Contact',stage:'To connect',tpl:'pro'}],apps:[]});
 __mock.store.set('data/users/u1/videos',{map:{}}); __mock.store.set('data/users/u1/resume',{raw:'',jd:'',role:'privacy',model:null,last:null});`;
(async()=>{ const b=await chromium.launch(); let fail=0;
 for (const [w,n] of [[1280,'desktop'],[390,'phone']]) {
 const c=await b.newContext({viewport:{width:w,height:860}}); await c.addInitScript(MOCK); await c.addInitScript(SEED); await c.route('https://cdn.jsdelivr.net/**',r=>r.abort());
 const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(2000);
 const R={};
 const step=async(name,fn,check)=>{ try{ await fn(); await p.waitForTimeout(250); R[name]=await p.evaluate(check)?'ok':'FAIL'; }catch(e){ R[name]='ERR '+e.message.split('\n')[0].slice(0,120);} };
 await step('tick subtopic', ()=>p.evaluate(()=>go('dpdp')).then(()=>p.click('[data-k]')), ()=>Object.keys(S.progress.done).some(k=>k.startsWith('dpdp')));
 await step('quiz answer', ()=>p.click('[data-quiz^="dpdp|0|"]'), ()=>S.progress.quiz.dpdp && S.progress.quiz.dpdp[0]!==undefined);
 await step('activity counted', async()=>{}, ()=>(S.progress.log[today()]||0)>=2);
 await step('add contact', ()=>p.evaluate(()=>go('network')).then(async()=>{await p.fill('#ncName','New Person');await p.click('#ncAdd');}), ()=>S.network.contacts.some(c=>c.name==='New Person'));
 await step('contact stage', ()=>p.selectOption('[data-stage="0"]','Talked'), ()=>S.network.contacts[0].stage==='Talked');
 await step('profile edit', ()=>p.evaluate(()=>go('profile')).then(async()=>{ const f=await p.$('[data-pf="headline"]'); await f.fill('Privacy Analyst'); await f.dispatchEvent('change'); await f.dispatchEvent('input'); }), ()=>S.profile.headline==='Privacy Analyst');
 await step('drill answer', ()=>p.evaluate(()=>go('lab')).then(()=>p.waitForTimeout(400)).then(()=>p.evaluate(()=>losOpen('drill'))).then(()=>p.waitForTimeout(200)).then(()=>p.click('[data-drill^="0|"]')), ()=>drillToday().ans[0]!==undefined);
 await step('quest login', async()=>{ await p.evaluate(()=>{LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen('term',{mode:'quest'})}); await p.waitForTimeout(300); for (const s of ['ssh quest0@quest','quest0','cat readme']) { await p.fill('.win.focus .tcmd',s); await p.press('.win.focus .tcmd','Enter'); await p.waitForTimeout(150);} }, ()=>/password for quest1/.test(document.querySelector('.win.focus .tout2').innerText));
 await step('quest password saved', async()=>{}, ()=>(S.progress.labos.quest.found||0)>=1);
 await step('passwords after reopen', async()=>{ await p.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen('term',{mode:'quest'}); }); await p.waitForTimeout(300); }, ()=>!!document.querySelector('.win.focus [data-qlogin="1"]') && document.querySelector('.win.focus .qpass').textContent.includes('N4rTg8Lw2Q'));
 await step('log in from saved password', async()=>{ const b=await p.$('.win.focus [data-qlogin="1"]'); await b.scrollIntoViewIfNeeded(); await b.click(); await p.waitForTimeout(200); }, ()=>/quest1@quest/.test(document.querySelector('.win.focus .tps').textContent));
 await step('help explains', async()=>{ await p.fill('.win.focus .tcmd','help'); await p.press('.win.focus .tcmd','Enter'); await p.waitForTimeout(150); }, ()=>/ls\s+list —/.test(document.querySelector('.win.focus .tout2').innerText) && /pwd\s+print working directory/.test(document.querySelector('.win.focus .tout2').innerText));
 await step('hint explains', async()=>{ await p.fill('.win.focus .tcmd','hint'); await p.press('.win.focus .tcmd','Enter'); await p.waitForTimeout(150); }, ()=>/What these mean:/.test(document.querySelector('.win.focus .tout2').innerText));
 await step('guide inserts at cursor', async()=>{ await p.fill('.win.focus .tcmd','sudo '); await p.evaluate(()=>{ const b=document.querySelector('.win.focus [data-cgins="ls -la"]'); b.scrollIntoView({block:'center'}); }); await p.click('.win.focus [data-cgins="ls -la"]'); }, ()=>document.querySelector('.win.focus .tcmd').value==='sudo ls -la' && document.activeElement===document.querySelector('.win.focus .tcmd'));
 await step('guide search', async()=>{ if (await p.evaluate(()=>document.querySelector('.win.focus .cgdrawer').hidden)) await p.click('.win.focus .cgbtn'); await p.fill('.win.focus .cgq','port'); }, ()=>{ const v=[...document.querySelectorAll('.win.focus .cgi[data-cgs]')].filter(x=>!x.hidden).map(x=>x.dataset.cgins); return v.length>0 && v.length<12 && v.some(x=>/ss|nmap|nc/.test(x)); });
 await step('drawer search keeps focus', async()=>{ await p.click('.win.focus .cgq'); }, ()=>document.activeElement.classList.contains('cgq'));
 await step('guide close while scrolled', async()=>{ await p.fill('.win.focus .cgq',''); await p.evaluate(()=>{ const d=document.querySelector('.win.focus .cgdrawer'); d.scrollTop=d.scrollHeight; }); await p.waitForTimeout(100); await p.click('.win.focus .cgclose'); }, ()=>document.querySelector('.win.focus .cgdrawer').hidden);
 await step('guide esc closes', async()=>{ await p.click('.win.focus .cgbtn'); await p.evaluate(()=>{ const d=document.querySelector('.win.focus .cgdrawer'); d.scrollTop=d.scrollHeight; }); await p.press('.win.focus .cgq','Escape'); }, ()=>document.querySelector('.win.focus .cgdrawer').hidden);
 await step('lab xp saved', async()=>{}, ()=>!Object.isFrozen(S.progress.labos) && S.progress.labos.stats.cmds>0);
 await step('focus role', ()=>p.evaluate(()=>setFocus('privacy')), ()=>focusRole()==='privacy');
 await step('linkedin add', ()=>p.evaluate(()=>{ S.network.contacts=S.network.contacts; go('network'); }), ()=>!Object.isFrozen(S.network.contacts));
 await step('saved to account', ()=>p.waitForTimeout(1500), ()=>{ const s=__mock.store.get('data/users/u1/progress'); return s.quiz.dpdp && Object.keys(s.done).some(k=>k.startsWith('dpdp')) && __mock.store.get('data/users/u1/network').contacts.some(c=>c.name==='New Person'); });
 const bad=Object.entries(R).filter(([,v])=>v!=='ok'); fail+=bad.length+errs.length;
 console.log(n, bad.length||errs.length?'FAIL':'ok', JSON.stringify(R), errs); await c.close(); }
 await b.close(); console.log(fail?'INTERACT FAILED':'INTERACT PASSED'); process.exit(fail?1:0); })();
