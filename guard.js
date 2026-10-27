/* Tap guard: run before every publish. Fails if any visible control can't be tapped (something covers it),
   if LabOS controls are hidden under windows, or if the daily drill can't be answered. */
const {chromium}=require('playwright');const fs=require('fs');
const src=fs.readFileSync(__dirname+'/shot4.js','utf8');const i=src.indexOf('const MOCK=`')+12,j=src.indexOf('`;',i);const MOCK=eval('`'+src.slice(i,j)+'`');
const CHECK=`(root, limit)=>{ const bad=[]; const els=[...root.querySelectorAll('button:not([disabled]),a[href],select:not([disabled]),input:not([type=hidden]):not([disabled]),textarea,[data-go],[data-drill]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden],details:not([open])')}).slice(0,limit);
  for (const e of els){ e.scrollIntoView({block:'center',inline:'nearest'}); const r=e.getBoundingClientRect(); if (r.bottom<0||r.top>innerHeight) continue; const x=r.left+Math.min(r.width/2,20), y=r.top+r.height/2; if (x<0||x>innerWidth) continue;
    const t=document.elementFromPoint(x,y); if (t && getComputedStyle(t.closest('th,td,div')||t).position==='sticky' && t.closest('table')) continue; if (!t || !(t===e||e.contains(t)||t.contains(e)||(e.labels&&[...e.labels].some(l=>l.contains(t))))) { const lbl=(e.textContent||e.getAttribute('aria-label')||e.id||e.tagName).trim().slice(0,30); const by=t?((t.closest('[id]')||{}).id||'')+'.'+String(t.className).slice(0,20):'none'; bad.push(lbl+' ← '+by); } }
  return bad; }`;
(async()=>{ const b=await chromium.launch(); let fails=0;
 for (const [vp,tag] of [[{width:390,height:844},'phone'],[{width:820,height:1000},'tablet'],[{width:1280,height:860},'desktop']]) {
  const c=await b.newContext({viewport:vp,hasTouch:tag!=='desktop'}); await c.addInitScript(MOCK); await c.addInitScript(`__mock.store.set('data/users/u1/progress',{done:{'grc|0':true},quiz:{},log:{'2026-01-01':2},doneAt:{},reviewed:{},tlog:{},labos:{xp:10,ops:{},quest:{level:0,flag:false},drill:{date:'2026-01-01',qs:[],ans:{},done:false,streak:0},mail:{best:0,rounds:0},apps:{},stats:{cmds:0}},lab:{}});`); await c.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(1200);
  const res=await p.evaluate(async (CHECK)=>{ const check=eval(CHECK); const out={}; const routes=[...Object.keys(VIEWS).filter(r=>r!=='lab'), TOPICS[0].id, 'role-privacy', 'proj-'+ALLPROJ[0].id];
    for (const r of routes){ go(r); await new Promise(z=>setTimeout(z,30)); const bad=check(document.getElementById('main'),80); if (bad.length) out[r]=bad.slice(0,4); }
    /* LabOS: open every app; the board, taskbar and the drill must stay tappable */
    go('lab'); await new Promise(z=>setTimeout(z,300)); const lab={};
    for (const id of LOS.order){ losOpen(id); await new Promise(z=>setTimeout(z,60)); const pn=document.getElementById('losPanel'); if (!pn.hidden){ const bad=check(pn,6); if (bad.length) lab['board after '+id]=bad.slice(0,2); } const tb=check(document.querySelector('.taskbar'),6); if (tb.length) lab['taskbar after '+id]=tb.slice(0,2); }
    LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen('drill'); await new Promise(z=>setTimeout(z,100));
    const dbad=check(document.querySelector('.win.focus .wbody'),20); if (dbad.length) lab.drill=dbad.slice(0,3);
    const btn=document.querySelector('[data-drill^="0|"]'); if (!btn) lab.drillMissing=true; else { btn.click(); if (drillToday().ans[0]===undefined) lab.drillNoAnswer=true; }
    if (Object.keys(lab).length) out.lab=lab;
    /* saved data loaded from the account must stay editable (the platform returns it read-only) */
    const st={}; go(TOPICS[0].id); await new Promise(z=>setTimeout(z,50)); const box=document.querySelector('[data-k]'); const k=box&&box.dataset.k; const was=k&&!!S.progress.done[k]; if (box) box.click(); if (!k || !!S.progress.done[k]===was) st.tickNotSaved=true;
    const n0=S.progress.log[today()]||0; logActivity(1); if ((S.progress.log[today()]||0)!==n0+1) st.activityNotCounted=true;
    if (Object.isFrozen(S.progress) || Object.isFrozen(S.progress.labos||{}) || Object.isFrozen(S.progress.done)) st.stateFrozen=true;
    if (Object.keys(st).length) out.state=st; return out; }, CHECK);
  const n=Object.keys(res).length+errs.length; fails+=n; console.log(tag, n?'FAIL':'ok', n?JSON.stringify(res,null,1):'', errs.length?errs:''); await c.close(); }
 await b.close(); if (fails) { console.log('GUARD FAILED'); process.exit(1); } console.log('GUARD PASSED'); })();
