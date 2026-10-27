const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('/home/claude/grc-hub.html','utf8');
const errs=[];const dom=new JSDOM('<!doctype html><body>'+html+'</body>',{runScripts:'dangerously',url:'https://x.test/',beforeParse(w){w.claude={use:async()=>null};w.scrollTo=()=>{};w.addEventListener('error',e=>errs.push(e.message));}});
const w=dom.window; w.HTMLElement.prototype.scrollIntoView=function(){};
const views=['home','learn','roles','certs','network','updates','profile','videos','resume','linkedin','jobs',...w.eval('TOPICS.map(t=>t.id)'),...w.eval('CERTS.map(c=>"cert-"+c.id)')];
for(const v of views){ try{ w.eval(`go(${JSON.stringify(v)})`); const t=w.document.getElementById('main').textContent.length; if(t<300) errs.push(v+' short '+t);}catch(e){errs.push(v+': '+e.message);} }
try{
 w.eval('go("dpdp")'); w.document.querySelector('[data-depth="3"]').click(); w.document.querySelector('[data-quiz]').click();
 for (const c of w.document.querySelectorAll('[data-k]')) { c.checked=true; c.dispatchEvent(new w.Event('change',{bubbles:true})); }
 w.document.getElementById('menuBtn').click(); if(!w.document.querySelector('.sheet')) errs.push('menu did not open'); w.document.querySelector('.sheet [data-go="certs"]').click();
 const sel=w.document.getElementById('certCo'); sel.value='tech'; sel.dispatchEvent(new w.Event('change',{bubbles:true}));
 w.eval('go("resume")'); w.document.getElementById('rsSample').click(); w.document.getElementById('rsRun').click();
 console.log('resume score', w.eval('RA.score'), JSON.stringify(w.eval('RA.parts')), 'flags', w.eval('RA.flags.length'));
 w.document.getElementById('rsBuild').click(); console.log('parsed exp', w.eval('S.resume.model.exp.length'), 'proj', w.eval('S.resume.model.projects.length'), 'skills', w.eval('S.resume.model.skills.length'), 'name', w.eval('S.resume.model.name'), '| title', w.eval('S.resume.model.title'));
 const jd=w.document.getElementById('rsJd'); jd.value='We need a Privacy Analyst with GDPR, DPDP, OneTrust and DPIA experience. OneTrust admin. Knowledge of CCPA and Vendor Risk. Vendor Risk reviews.'; jd.dispatchEvent(new w.Event('input',{bubbles:true})); w.document.getElementById('rsRun').click();
 console.log('jd kw hit', w.eval('RA.kwHit.join(",")'), '| miss', w.eval('RA.kwMiss.join(",")'));
 w.eval('go("jobs")'); w.document.getElementById('apCo').value='Deloitte'; w.document.getElementById('apAdd').click();
 w.eval('go("home")'); console.log('home has streak', /day streak/.test(w.document.getElementById('main').textContent), 'week', w.eval('weekCount()'));
 console.log('cert ready cippe', w.eval('certReady(CERT.cippe)'), 'roles', w.eval('ROLES.map(r=>r.id+":"+roleReady(r)).join(" ")'));
}catch(e){errs.push('interact: '+e.stack);}
console.log('views',views.length,'errors',errs);
// projects
(async()=>{try{
 await new Promise(r=>setTimeout(r,200));
 const errs2=[];
 for (const id of w.eval('PROJECTS.map(p=>p.id)')) { w.eval(`go("proj-${id}")`); if (w.document.getElementById('main').textContent.length<800) errs2.push('short '+id); }
 w.eval('go("projects")'); w.document.querySelector('[data-pfilter="Starter"]').click();
 // mock sample review
 w.eval(`cap.sample = Object.assign(async()=>({text:""}),{json: async()=>({items:PROJ["p-audit"].rubric.map((_,i)=>({i,met:i<2,note:"x"})),feedback:"Fix E146."})})`);
 w.eval('go("proj-p-audit")');
 const t=w.document.getElementById('pjDraft'); t.value='x'.repeat(300); t.dispatchEvent(new w.Event('input',{bubbles:true}));
 for (let k=0;k<5;k++){ w.document.querySelector('[data-pjreview]').click(); await new Promise(r=>setTimeout(r,20)); }
 console.log('attempts', w.eval('projState("p-audit").attempts'), 'unlocked', w.eval('keyUnlocked(projState("p-audit"))'), 'key shown', /Model answer/.test(w.document.getElementById('main').textContent));
 w.eval('go("proj-p-risk")'); const st=w.document.querySelector('[data-pstep]'); st.checked=true; st.dispatchEvent(new w.Event('change',{bubbles:true}));
 w.eval(`cap.sample.json = async()=>({items:PROJ["p-risk"].rubric.map((_,i)=>({i,met:true,note:""})),feedback:"Good"})`);
 const t2=w.document.getElementById('pjDraft'); t2.value='y'.repeat(300); t2.dispatchEvent(new w.Event('input',{bubbles:true})); w.document.querySelector('[data-pjreview]').click(); await new Promise(r=>setTimeout(r,20));
 console.log('risk passed', w.eval('projState("p-risk").passed'), 'bullet shown', /Copy resume bullet/.test(w.document.getElementById('main').textContent));
 w.eval('go("home")'); console.log('home tile', /Portfolio projects/.test(w.document.getElementById('main').textContent));
 console.log('proj errors', errs2, errs);
}catch(e){console.log('proj test error', e.stack);}})();
