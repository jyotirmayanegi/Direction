const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('/home/claude/grc-hub.html','utf8');
const errs=[];const dom=new JSDOM('<!doctype html><body>'+html+'</body>',{runScripts:'dangerously',url:'https://x.test/',beforeParse(w){w.claude={use:async()=>null};w.scrollTo=()=>{};w.addEventListener('error',e=>errs.push(e.message));}});
const w=dom.window; w.HTMLElement.prototype.scrollIntoView=function(){}; w.HTMLElement.prototype.focus=function(){};
const $=s=>w.document.querySelector(s), main=()=>w.document.getElementById('main').textContent;
(async()=>{ await new Promise(r=>setTimeout(r,250)); try{
 console.log('topics',w.eval('TOPICS.length'),'projects',w.eval('ALLPROJ.length'),'missions',w.eval('MISSIONS.length'),'zones',w.eval('ZONES.length'),'certs',w.eval('CERTS.length'));
 console.log('ladder bad', w.eval('TOPICS.filter(t=>(LADDER[t.id]||[]).map(p=>p.lvl).join("")!=="123").map(t=>t.id)'));
 console.log('missing intensity', w.eval('TOPICS.filter(t=>!INTENSITY[t.id]).map(t=>t.id)'), 'cert topic refs bad', w.eval('CERTS.flatMap(c=>c.domains.flatMap(d=>d[1])).filter(id=>!TOPIC[id])'));
 console.log('company skills bad', w.eval('COMPANIES.flatMap(c=>c.skills).filter(k=>!SKILLS[k])'), 'role skills bad', w.eval('ROLES.flatMap(r=>Object.keys(r.need)).filter(k=>!SKILLS[k])'), 'skills w/o topic', w.eval('Object.keys(SKILLS).filter(k=>!TOPICS.some(t=>t.sk.includes(k)))'));
 const views=['home','insights','lab','projects','learn','roles','certs',...w.eval('TOPICS.map(t=>t.id)'),...w.eval('CERTS.map(c=>"cert-"+c.id)'),...w.eval('ALLPROJ.map(p=>"proj-"+p.id)'),...w.eval('MISSIONS.map(m=>"lab-"+m.id)')];
 // unlock all missions to render
 w.eval('MISSIONS.forEach(m=>labState(m.id).done=true)');
 for(const v of views){ try{ w.eval(`go(${JSON.stringify(v)})`); if(main().length<200) errs.push(v+' short '+main().length);}catch(e){errs.push(v+': '+e.message);} }
 w.eval('S.progress.lab={}');
 const q=(s)=>{ $('#kqlIn').value=s; $('[data-lkqlrun]').click(); return $('#kqlOut').textContent.replace(/\s+/g,' ').slice(0,220); };
 w.eval('go("lab-so1")');
 console.log('Q count:', q('SigninLogs\n| where ResultType != "0"\n| count'));
 console.log('Q by user:', q('SigninLogs | where ResultType != "0" | summarize count() by UserPrincipalName | sort by count_ desc | take 2'));
 console.log('Q by ip:', q('SigninLogs | where ResultType != "0" | summarize Fails=count() by IPAddress | sort by Fails desc'));
 console.log('Q err:', q('SigninLogs | where user == "x"'));
 console.log('Q err2:', q('Signins | take 1'));
 console.log('Q in/project:', q('SigninLogs | where Location !in ("IN") and ResultType == "0" | project TimeGenerated, UserPrincipalName, Location'));
 ['13','r.verma@kavach.in','203.0.113.77'].forEach((a,i)=>$('#lq-'+i).value=a); $('[data-lcheck]').click(); console.log('so1 done', w.eval('labGet("so1").done'));
 w.eval('go("lab-so2")'); $('[data-lkqlex="0"]').click(); console.log('ex0:', $('#kqlOut').textContent.replace(/\s+/g,' ').slice(0,200));
 console.log('OA:', q('OfficeActivity | where ClientIP == "45.83.10.9" | project Operation, Item'));
 ['p.shah','BR','SharePoint','kyc_batch_oct.zip'].forEach((a,i)=>$('#lq-'+i).value=a); $('[data-lcheck]').click(); console.log('so2 done', w.eval('labGet("so2").done'));
 // classify generic for new zones
 for (let pass=0; pass<2; pass++) for (const id of w.eval('NEWM.filter(m=>m.type==="classify").map(m=>m.id)')) { if(w.eval(`labGet("${id}").done`)) continue; w.eval(`go("lab-${id}")`); if(!w.eval(`missionUnlocked(MISSION["${id}"])`)) continue; const m=w.eval(`MISSION["${id}"]`);
   m.items.forEach((it,i)=>{ const b=[...w.document.querySelectorAll(`[data-lpick^="${i}|"]`)].find(b=>b.dataset.lpick===`${i}|${it[1]}`); b.click(); }); $('[data-lcheck]').click(); }
 w.eval('go("lab-az2")'); w.eval('MISSION.az2.toggles.forEach(t=>{ if(LRT.tg[t[0]]!==t[3]) document.querySelector(`[data-ltg="${t[0]}"]`).click(); })'); $('[data-lcheck]').click();
 w.eval('go("lab-gr2")'); w.eval('LRT.order = MISSION.gr2.items.slice()'); $('[data-lcheck]').click();
 console.log('new missions done', w.eval('NEWM.filter(m=>labGet(m.id).done).map(m=>m.id).join()'));
 w.eval('go("lab")'); console.log('lab groups', /Tool zones/.test(main()), /SOC Desk/.test(main()));
 w.eval('go("t-sentinel")'); console.log('sentinel topic practice', /SOC Desk/.test(main()), 'mastery', w.eval('Math.round(topicMastery(TOPIC["t-sentinel"])*100)'));
 w.eval('go("certs")'); console.log('certs page has SC-900', /SC-900/.test(main()));
 w.eval('go("learn")'); console.log('learn has phase 8', /Cloud & security platforms/.test(main()));
 w.eval('go("roles")'); console.log('roles ok', main().length);
}catch(e){errs.push('test: '+e.stack);} console.log('errors', errs); })();
