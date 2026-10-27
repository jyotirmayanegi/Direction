const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('/home/claude/grc-hub.html','utf8');
const errs=[];const dom=new JSDOM('<!doctype html><body>'+html+'</body>',{runScripts:'dangerously',url:'https://x.test/',beforeParse(w){w.claude={use:async()=>null};w.scrollTo=()=>{};w.addEventListener('error',e=>errs.push(e.message));}});
const w=dom.window; w.HTMLElement.prototype.scrollIntoView=function(){}; w.HTMLElement.prototype.focus=function(){};
const $=s=>w.document.querySelector(s), main=()=>w.document.getElementById('main').textContent;
const fire=(el,type)=>el.dispatchEvent(new w.Event(type,{bubbles:true}));
(async()=>{ await new Promise(r=>setTimeout(r,250)); try{
 const views0=['home','insights','lab','projects','learn','roles','certs','network','updates','profile','videos','resume','linkedin','jobs',...w.eval('TOPICS.map(t=>t.id)'),...w.eval('CERTS.map(c=>"cert-"+c.id)'),...w.eval('ALLPROJ.map(p=>"proj-"+p.id)'),...w.eval('MISSIONS.map(m=>"lab-"+m.id)')];
 const views=views0.filter(v=>!/^lab-/.test(v)||v.endsWith('1'));
 for(const v of views){ try{ w.eval(`go(${JSON.stringify(v)})`); if(main().length<200) errs.push(v+' short '+main().length);}catch(e){errs.push(v+': '+e.message);} }
 console.log('views ok', views.length, 'topics', w.eval('TOPICS.length'));
 // unlock all lab missions in order by solving
 const term = async (cmds) => { for (const c of cmds) { const i=$('#termIn'); i.value=c; i.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true})); } await new Promise(r=>setTimeout(r,350)); };
 w.eval('go("lab-t1")'); await term(['whoami','pwd','ls']); console.log('t1', w.eval('labGet("t1").done'), w.eval('labGet("t1").stars'));
 w.eval('go("lab-t2")'); await term(['cd cases','cat case-101.txt']); console.log('t2', w.eval('labGet("t2").done'));
 w.eval('go("lab-t3")'); await term(['grep "Failed password" /var/log/auth.log | grep 198.51.100.23 | wc -l','grep -c "Failed password" /var/log/auth.log','submit 1.2.3.4','submit 198.51.100.23']);
 console.log('t3', w.eval('labGet("t3").done'), 'stars', w.eval('labGet("t3").stars'), 'out tail:', $('#termOut').textContent.split('\n').slice(-8).join(' | '));
 w.eval('go("lab-t4")'); await term(['ls -l /home/analyst/finance','chmod 600 /home/analyst/finance/salaries.csv','ls -l finance']); console.log('t4', w.eval('labGet("t4").done'));
 w.eval('go("lab-t5")'); await term(['ps aux','kill 612','kill 4242']); console.log('t5', w.eval('labGet("t5").done'));
 w.eval('go("lab-t6")'); await term(['cat /etc/passwd | grep ":0:"','submit backup2','find / -name auth','cat nofile','foo','help']); console.log('t6', w.eval('labGet("t6").done'), $('#termOut').textContent.slice(-300).replace(/\n/g,' / '));
 // wire
 w.eval('go("lab-n1")'); const link=(a,b)=>{ $(`[data-lnode="${a}"]`).dispatchEvent(new w.MouseEvent('click',{bubbles:true})); $(`[data-lnode="${b}"]`).dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
 link('lap1','sw'); link('lap2','sw'); link('srv','sw'); link('sw','rt'); link('rt','net'); $('[data-lcheck]').click(); console.log('n1 bypass msg:', $('#labFeedback').textContent.slice(0,80));
 link('sw','rt'); link('sw','fw'); link('fw','rt'); $('[data-lcheck]').click(); console.log('n1', w.eval('labGet("n1").done'));
 // classify generic solve
 for (const id of w.eval('MISSIONS.filter(m=>m.type==="classify").map(m=>m.id)')) { w.eval(`go("lab-${id}")`); if(!w.eval(`missionUnlocked(MISSION["${id}"])`)) continue; const m=w.eval(`MISSION["${id}"]`);
   m.items.forEach((it,i)=>{ const b=[...w.document.querySelectorAll(`[data-lpick^="${i}|"]`)].find(b=>b.dataset.lpick===`${i}|${it[1]}`); b.click(); }); $('[data-lcheck]').click();  }
 // order
 w.eval('go("lab-th2")'); w.eval('LRT.order = MISSION.th2.items.slice()'); $('[data-lcheck]').click(); console.log('th2', w.eval('labGet("th2").done'));
 // matrix
 w.eval('go("lab-i1")'); const m=w.eval('MISSION.i1'); m.roles.forEach(([r],ri)=>m.systems.forEach((s,si)=>{ if((m.target[r]||[]).includes(s)) $(`#mx-${ri}-${si}`).checked=true; })); $('#mx-2-1').checked=true; $('[data-lcheck]').click(); console.log('i1 extra msg:', $('#labFeedback').textContent.slice(0,70)); $('#mx-2-1').checked=false; $('[data-lcheck]').click(); console.log('i1', w.eval('labGet("i1").done'));
 // hash
 w.eval('go("lab-cr1")'); await new Promise(r=>setTimeout(r,100)); $('[data-lhash="1"]').click(); await new Promise(r=>setTimeout(r,100)); console.log('hash shown', $('#hc-1').textContent.slice(0,12), $('#hs-1').textContent.slice(0,12)); $('#tp-1').checked=true; $('[data-lcheck]').click(); console.log('cr1', w.eval('labGet("cr1").done'));
 w.eval('go("lab-cr2")'); const sh=$('#shift'); sh.value='7'; fire(sh,'input'); console.log('decoded', $('#decoded').textContent); $('#cipherAns').value='patch the servers on friday'; $('[data-lcheck]').click(); console.log('cr2', w.eval('labGet("cr2").done'));
 // sim
 w.eval('go("lab-ir1")'); const steps=w.eval('MISSION.ir1.steps'); for (const s of steps){ const wrongI=s[2].findIndex(o=>!o[1]); $(`[data-lsim="${wrongI}"]`).click(); const ri=s[2].findIndex(o=>o[1]); $(`[data-lsim="${ri}"]`).click(); } console.log('ir1', w.eval('labGet("ir1").done'), 'stars', w.eval('labGet("ir1").stars'));
 // logs
 w.eval('go("lab-ir2")'); const ev=$('#lgEvt'); ev.value='login_failed'; fire(ev,'change'); console.log('log rows', $('#lgTable').textContent.match(/(\d+) of/)[1]); ['m.rao','185.199.110.42','02:14','clients_2026.zip'].forEach((a,i)=>$('#lq-'+i).value=a); $('[data-lcheck]').click(); console.log('ir2', w.eval('labGet("ir2").done'));
 // toggles
 w.eval('go("lab-cl2")'); ['root-mfa','kyc-public','kyc-enc','trail','db-open','intern-admin'].forEach(k=>$(`[data-ltg="${k}"]`).click()); $('[data-lcheck]').click(); console.log('cl2', w.eval('labGet("cl2").done'));
 // classify generic solve
 for (const id of w.eval('MISSIONS.filter(m=>m.type==="classify").map(m=>m.id)')) { w.eval(`go("lab-${id}")`); if(!w.eval(`missionUnlocked(MISSION["${id}"])`)) continue; const m=w.eval(`MISSION["${id}"]`);
   m.items.forEach((it,i)=>{ const b=[...w.document.querySelectorAll(`[data-lpick^="${i}|"]`)].find(b=>b.dataset.lpick===`${i}|${it[1]}`); b.click(); }); $('[data-lcheck]').click();  }
 // classify generic solve
 for (const id of w.eval('MISSIONS.filter(m=>m.type==="classify").map(m=>m.id)')) { w.eval(`go("lab-${id}")`); if(!w.eval(`missionUnlocked(MISSION["${id}"])`)) continue; const m=w.eval(`MISSION["${id}"]`);
   m.items.forEach((it,i)=>{ const b=[...w.document.querySelectorAll(`[data-lpick^="${i}|"]`)].find(b=>b.dataset.lpick===`${i}|${it[1]}`); b.click(); }); $('[data-lcheck]').click();  }
 console.log('classify undone', w.eval('MISSIONS.filter(m=>m.type==="classify"&&!labGet(m.id).done).map(m=>m.id).join()'));
 console.log('lab done', w.eval('MISSIONS.filter(m=>labGet(m.id).done).length'), '/', w.eval('MISSIONS.length'), 'xp', w.eval('labXP()'));
 // projects ladder
 w.eval('go("proj-grc-3")'); console.log('grc-3 locked', /Locked\./.test(main()));
 let coachPrompt=''; w.eval(`cap.sample = Object.assign(async(p,o)=>{ window.__cp=p; o&&o.onText&&o.onText({text:"Coach reply"}); return {text:"Coach reply"}; },{json: async(p)=>{ window.__rp=p; const P=PROJ[current.slice(5)]; return {items:P.rubric.map((_,i)=>({i,met:window.__pass?true:i===0,note:"n",why:"w"})),strengths:"s",approach:"a",metrics:["m1","m2"],fix:"f",weak:[0,1]}; }})`);
 w.eval('go("proj-grc-1")'); const d=$('#pjDraft'); d.value='z'.repeat(300); fire(d,'input');
 $('[data-pquick="grc-1|start"]').click(); await new Promise(r=>setTimeout(r,30)); console.log('coach guide mode in prompt', /MODE: GUIDE/.test(w.__cp), 'key absent', !/MODEL ANSWER:/.test(w.__cp), 'chat len', w.eval('projState("grc-1").chat.length'));
 for (let k=0;k<5;k++){ $('[data-pjreview]').click(); await new Promise(r=>setTimeout(r,30)); }
 console.log('fails', w.eval('projFails(projState("grc-1"))'), 'mode', w.eval('coachMode(projState("grc-1"))'), 'hints shown', /Hints/.test(main()), 'review metrics shown', /How professionals judge/.test(main()), 'study again', /Study these again/.test(main()));
 $('[data-pquick="grc-1|hint"]').click(); await new Promise(r=>setTimeout(r,30)); console.log('hint mode prompt', /MODE: HINTS/.test(w.__cp));
 for (let k=0;k<5;k++){ $('[data-pjreview]').click(); await new Promise(r=>setTimeout(r,30)); }
 console.log('mode now', w.eval('coachMode(projState("grc-1"))'), 'key shown', /Model answer \(excerpt\)/.test(main()));
 w.__pass=true; $('[data-pjreview]').click(); await new Promise(r=>setTimeout(r,30));
 console.log('passed', w.eval('projState("grc-1").passed'), 'levelup', /Intermediate level unlocked/.test(main()), 'p-policy unlocked', w.eval('projUnlocked(PROJ["p-policy"])'));
 w.eval('go("proj-p-policy")'); console.log('policy open', !/Locked\./.test(main()));
 w.eval('go("insights")'); console.log('insights count', w.eval('collectInsights().length'), 'kinds', w.eval('[...new Set(collectInsights().map(i=>i.kind))].join(",")'));
 w.eval('go("home")'); console.log('home', /Mastery map/.test(main()), /Coach: what to fix next/.test(main()), 'xp', w.eval('totalXP()'));
 w.eval('go("projects")'); $('[data-pgroup="path"]').click(); $('[data-pfilter="cyber"]').click(); console.log('projects filtered', main().length);
 w.eval('go("learn")'); $('[data-lgroup="intensity"]').click(); console.log('learn intensity', /Foundation: no background/.test(main()));
 $('#moreBtn').click(); console.log('more opens sheet', !!$('.sheet')); 
 w.eval('go("c-linux")'); console.log('topic practice card', /Practise it/.test(main()), /Terminal Town/.test(main()));
 console.log('mastery grc', w.eval('Math.round(topicMastery(TOPIC.grc)*100)'), 'c-linux', w.eval('Math.round(topicMastery(TOPIC["c-linux"])*100)'));
 console.log('progress json size', JSON.stringify(w.eval('S.progress')).length);
}catch(e){errs.push('test: '+e.stack);} console.log('errors', errs); })();
