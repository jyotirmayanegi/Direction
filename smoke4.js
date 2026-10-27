const {JSDOM}=require('jsdom');const fs=require('fs');const nodeCrypto=require('crypto');
const html=fs.readFileSync('/home/claude/grc-hub.html','utf8');
const errs=[];
const dom=new JSDOM('<!doctype html><body>'+html+'</body>',{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.claude={use:async()=>null};w.scrollTo=()=>{};w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;Object.defineProperty(w,'crypto',{value:nodeCrypto.webcrypto,configurable:true});w.addEventListener('error',e=>errs.push('winerr: '+e.message));const ce=w.console.error;w.console.error=(...a)=>{errs.push('console.error: '+a.join(' '));};}});
const w=dom.window; w.HTMLElement.prototype.scrollIntoView=function(){}; w.HTMLElement.prototype.focus=function(){};
const $=s=>w.document.querySelector(s), main=()=>w.document.getElementById('main').textContent, sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fire=(el,type)=>el.dispatchEvent(new w.Event(type,{bubbles:true}));
const click=el=>{ if(!el) throw new Error('click on missing element'); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
const winEl=app=>w.eval(`(LOS.wins.find(x=>x.app===${JSON.stringify(app)})||{}).el`);
const q=(app,sel)=>winEl(app).querySelector(sel), qa=(app,sel)=>[...winEl(app).querySelectorAll(sel)];
const setSel=(el,v)=>{ if(!el) throw new Error('select missing for '+v); el.value=v; fire(el,'change'); };
const setChk=(el,v)=>{ if(!el) throw new Error('checkbox missing'); el.checked=v; fire(el,'change'); };
const opDone=id=>w.eval(`opGet(${JSON.stringify(id)}).done`), opSteps=id=>w.eval(`JSON.stringify(opGet(${JSON.stringify(id)}).steps)`);
(async()=>{ await sleep(300); try{
 /* ---------- data integrity ---------- */
 console.log('topics',w.eval('TOPICS.length'),'projects',w.eval('ALLPROJ.length'),'roles',w.eval('ROLES.length'),'ops',w.eval('OPS.length'),'apps',w.eval('LOS.order.join(",")'));
 console.log('ladder bad', w.eval('TOPICS.filter(t=>(LADDER[t.id]||[]).map(p=>p.lvl).join("")!=="123").map(t=>t.id)'));
 console.log('topic fields bad', w.eval('TOPICS.filter(t=>!(t.title&&t.short&&t.obj&&t.why&&t.subs&&t.subs.length>=5&&t.case&&t.ben&&t.trap&&t.quiz&&t.quiz.length>=3&&t.refs&&t.terms&&t.track&&t.sk&&TRACKS[t.track])).map(t=>t.id)'));
 console.log('sub fields bad', w.eval('TOPICS.flatMap(t=>t.subs.map((s,i)=>[t.id,i,s])).filter(([,,s])=>!(s.t&&s.b&&s.l&&s.v)).map(x=>x[0]+"#"+x[1]).slice(0,10)'));
 console.log('quiz bad', w.eval('TOPICS.flatMap(t=>t.quiz.map((q,i)=>[t.id,i,q])).filter(([,,q])=>!(q.q&&q.o&&q.o.length>=3&&q.a>=0&&q.a<q.o.length&&q.w)).map(x=>x[0]+"#"+x[1])'));
 console.log('role path bad', w.eval('ROLES.filter(r=>!ROLE_PATH[r.id]).map(r=>r.id)'), w.eval('Object.entries(ROLE_PATH).flatMap(([r,p])=>[...p.core,...p.support,...p.stages.flatMap(s=>s[2])].filter(id=>!TOPIC[id]).map(id=>r+":"+id))'));
 console.log('role req bad', w.eval('Object.entries(ROLE_REQ).flatMap(([r,L])=>L.filter(x=>x[2]&&!(x[2].startsWith("cert:")?CERT[x[2].slice(5)]:TOPIC[x[2]])).map(x=>r+":"+x[2]))'), 'roles w/o req', w.eval('ROLES.filter(r=>!ROLE_REQ[r.id]).map(r=>r.id)'));
 console.log('role certs bad', w.eval('Object.entries(ROLE_CERTS).flatMap(([r,L])=>L.filter(x=>!CERT[x[0]]).map(x=>r+":"+x[0]))'), 'role skills bad', w.eval('ROLES.flatMap(r=>Object.keys(r.need)).filter(k=>!SKILLS[k])'));
 console.log('role groups', w.eval('ROLE_GROUPS.flatMap(g=>g[1]).filter(id=>!ROLE[id])'), 'ungrouped', w.eval('ROLES.filter(r=>!ROLE_GROUPS.some(g=>g[1].includes(r.id))).map(r=>r.id)'));
 console.log('cert topic refs bad', w.eval('CERTS.flatMap(c=>c.domains.flatMap(d=>d[1])).filter(id=>!TOPIC[id])'), 'missing intensity', w.eval('TOPICS.filter(t=>!INTENSITY[t.id]).map(t=>t.id)'), 'pre bad', w.eval('Object.entries(PRE).flatMap(([k,v])=>[k,...v]).filter(id=>!TOPIC[id])'));
 console.log('ops topic bad', w.eval('OPS.flatMap(o=>[o.topic,...(o.topics||[])]).filter(id=>!TOPIC[id])'), 'ops app bad', w.eval('OPS.filter(o=>!LOS.apps[o.app]).map(o=>o.id)'));
 console.log('proj fields bad', w.eval('ALLPROJ.filter(p=>!(p.title&&p.objective&&p.steps&&p.steps.length&&p.rubric&&p.rubric.length&&TOPIC[p.topic])).map(p=>p.id)'));
 /* ---------- every view renders ---------- */
 const views=['home','insights','lab','lab-map','projects','learn','path','matrix','roles','certs','network','news','applications','updates','profile','videos','resume','linkedin','jobs',...w.eval('TOPICS.map(t=>t.id)'),...w.eval('CERTS.map(c=>"cert-"+c.id)'),...w.eval('ALLPROJ.map(p=>"proj-"+p.id)'),...w.eval('MISSIONS.filter((m,i)=>i%3===0).map(m=>"lab-"+m.id)')];
 for(const v of views){ try{ w.eval(`go(${JSON.stringify(v)})`); if(main().length<150) errs.push(v+' short '+main().length);}catch(e){errs.push(v+': '+e.message);} }
 console.log('views rendered', views.length);
 // focus role switching across views
 for (const r of w.eval('ROLES.map(r=>r.id)')) { w.eval(`setFocus(${JSON.stringify(r)})`); for (const v of ['home','learn','path','projects','resume']) { try { w.eval(`go("${v}")`); } catch(e) { errs.push(`focus ${r} ${v}: ${e.message}`); } } }
 w.eval('setFocus("privacy")'); w.eval('go("learn")'); console.log('learn privacy: hides cyber track?', /not needed for/.test(main()), 'shows Core badge', /Core/.test(main()));
 w.eval('learnGroup2="role"; go("learn")'); console.log('role order view', /CORE/.test(main()) );
 w.eval('go("matrix")'); console.log('matrix rows', w.document.querySelectorAll('table.rmx tbody tr').length);
 /* ---------- LabOS ---------- */
 w.eval('go("lab")'); await sleep(80);
 console.log('desktop icons', w.document.querySelectorAll('.dicon').length, 'ops rows', w.document.querySelectorAll('.oprow').length);
 // open every app
 for (const a of w.eval('LOS.order')) { w.eval(`losOpen(${JSON.stringify(a)})`); }
 console.log('windows open', w.eval('LOS.wins.length'), 'app errors', w.eval('LOS.wins.filter(x=>/hit an error/.test(x.el.textContent)).map(x=>x.app)'));
 // re-render the page: windows persist
 w.eval('go("home")'); w.eval('go("lab")'); console.log('windows after re-render', w.eval('LOS.wins.length'), 'attached', w.eval('LOS.wins.every(x=>document.body.contains(x.el))'));
 // ---- Terminal: Shell Quest ----
 const T=()=>q('term','.tcmd'); const out=()=>[...q('term','.tout2').children].map(d=>d.textContent).join('\n');
 const run=async (cmd)=>{ const i=T(); i.value=cmd; i.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await sleep(5); return out(); };
 const lastOut=(n=6)=>out().split('\n').slice(-n).join('\n');
 const pw=[ 'quest0' ];
 const login=async (lvl)=>{ await run(`ssh quest${lvl}@quest`); await run(pw[lvl]); if(!/Welcome to quest/.test(lastOut(4))) throw new Error('login failed at '+lvl+': '+lastOut(4)); };
 const grab=(re,n=5)=>{ const txt=lastOut(n).split('\n').filter(l=>!/^[a-z0-9]+@[a-z0-9]+:.*[$#] /.test(l)).join('\n'); const m=txt.match(re); if(!m) throw new Error('no match '+re+' in '+lastOut(8)); return m[m.length-1]; };
 await login(0); await run('cat readme'); pw[1]=grab(/The password for quest1 is: (\S+)/);
 await login(1); await run('cat -'); console.log('cat - hint:', /cat \.\/-/.test(lastOut(2))); await run('cat ./-'); pw[2]=lastOut(1).trim();
 await login(2); await run('cat "spaces in this filename"'); pw[3]=lastOut(1).trim();
 await login(3); await run('ls inhere'); console.log('hidden not shown:', !/hidden_password/.test(lastOut(1))); await run('ls -a inhere'); await run('cat inhere/.hidden_password'); pw[4]=lastOut(1).trim();
 await login(4); await run('file ./inhere/*'); const asc=grab(/(\.\/inhere\/-file0\d): ASCII text/); await run('cat '+asc); pw[5]=lastOut(1).trim();
 await login(5); await run('find inhere -type f -size 1033c ! -executable'); const f5=lastOut(1).trim(); console.log('L5 find ->', JSON.stringify(f5)); await run('cat '+f5); pw[6]=lastOut(1).trim();
 await login(6); await run('find / -user quest7 -group quest6 -size 33c 2>/dev/null'); const f6=lastOut(1).trim(); console.log('L6 find ->', f6); await run('cat '+f6); pw[7]=grab(/The quest7 password: (\S+)/);
 await login(7); await run('grep millionth data.txt'); pw[8]=grab(/millionth\s+(\S+)/);
 await login(8); await run('sort data.txt | uniq -u'); pw[9]=lastOut(1).trim();
 await login(9); await run('base64 -d data.txt'); pw[10]=grab(/The password is (\S+)/);
 await login(10); await run(`echo ${pw[10]} | nc localhost 30000`); pw[11]=grab(/Password for quest11: (\S+)/);
 await login(11); await run('ls /etc/cron.d/'); await run('cat /etc/cron.d/cronjob_quest12'); await run('cat /usr/bin/cronjob_quest12.sh'); const tmpf=grab(/> (\/tmp\/\S+)/); await run('cat '+tmpf); pw[12]=lastOut(1).trim();
 await login(12); await run('sudo -l'); console.log('sudo -l:', lastOut(2).replace(/\n/g,' | ')); await run('cat /root/flag.txt'); console.log('flag denied:', /Permission denied/.test(lastOut(1)));
 await run('sudo cat /root/flag.txt'); const flag=grab(/(FLAG\{[^}]+\})/); await run('submit '+flag);
 console.log('quest level', w.eval('losState().quest.level'), 'flag', w.eval('losState().quest.flag'), 'passwords', pw.length);
 // misc commands sanity
 for (const c of ['pwd','whoami','id','ls -la','ls /etc','tree ~','history | tail -3','wc -l data.txt','echo hello > /tmp/x.txt','cat /tmp/x.txt','head -n 2 /etc/passwd','grep -c quest /etc/passwd','sha256sum README','ps aux','ss -tlnp','ping -c 2 web01','dig web01','nmap web01','curl http://intranet.lab','man chmod','foo','cd /nonexistent','cat "unterminated']) { await run(c); }
 console.log('misc tail:', lastOut(6).replace(/\n/g,' | ').slice(0,300));
 for (let i=0;i<13;i++) await run('exit');
 await run('touch notes2.txt'); await run('echo "my notes" > notes2.txt'); await run('cat notes2.txt'); console.log('home persisted', /notes2/.test(w.eval('losState().fs||""')));
 // ---- Terminal: hardening ----
 await run('ssh admin@web01'); await run('Adm1n!2026'); await run('cat TICKET-SEC-118.txt');
 await run("sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config"); console.log('sudo prompt:', /\[sudo\] password/.test(q('term','.tps').textContent)); await run('Adm1n!2026');
 await run("sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config");
 await run('grep -E "Permit|Password" /etc/ssh/sshd_config'); console.log('cfg:', lastOut(3).replace(/\n/g,' | '));
 await run('sudo systemctl restart ssh'); await run('sudo systemctl disable --now telnet'); await run('systemctl status telnet'); console.log('telnet:', lastOut(3).replace(/\n/g,' | '));
 await run('ls -l /var/www/app'); await run('sudo chmod 640 /var/www/app/config.php'); await run('ls -l /var/www/app/config.php'); console.log('perm:', lastOut(1));
 await run('grep ":0:" /etc/passwd'); await run('sudo userdel backup2');
 await run('sudo ufw default deny incoming'); await run('sudo ufw allow 22/tcp'); await run('sudo ufw allow 443/tcp'); await run('sudo ufw enable'); await run('sudo ufw status'); console.log('ufw:', lastOut(4).replace(/\n/g,' | '));
 await run('exit'); await run('nmap web01'); console.log('nmap after:', lastOut(5).replace(/\n/g,' | '));
 await run('ssh admin@web01'); console.log('key login after hardening:', lastOut(2).replace(/\n/g,' | ').slice(0,160)); await run('exit');
 console.log('op-harden', opDone('op-harden'), opSteps('op-harden'));
 // nano editor
 await run('nano ~/plan.txt'); const ed=q('term','.ntext'); console.log('nano open', !q('term','.nano').hidden); ed.value='line1\nline2'; click(q('term','[data-nsave]')); click(q('term','[data-nexit]')); await run('cat plan.txt'); console.log('nano saved:', lastOut(2).replace(/\n/g,' | '));
 // ---- Inbox Defender ----
 click(q('mail','[data-mstart]'));
 for (let k=0;k<10;k++) { const id=w.eval('losApp("mail").shift.cur'); const ph=w.eval(`MAILBY[${JSON.stringify(id)}].phish`);
   if (k===0) { click(q('mail','[data-mdet]')); const l=q('mail','.mlink'); if (l) l.dispatchEvent(new w.MouseEvent('mouseover',{bubbles:true})); }
   if (k===1 && !w.eval('losApp("mail").hovered')) { const l=q('mail','.mlink'); if (l) click(l); }
   click(q('mail',`[data-mjudge="${ph?"phish":"safe"}"]`)); const nx=q('mail','[data-mnext]'); if (nx && k<9) click(nx); }
 console.log('mail best', w.eval('losState().mail.best'), 'hovered', w.eval('!!losApp("mail").hovered'), 'op-phish', opDone('op-phish'), opSteps('op-phish'));
 if (!w.eval('losApp("mail").hovered')) { click(q('mail','[data-mstart]')); for (let k=0;k<10&&!w.eval('losApp("mail").hovered');k++){ const l=q('mail','.mlink'); if(l){ l.dispatchEvent(new w.MouseEvent('mouseover',{bubbles:true})); break;} click(q('mail','[data-mjudge="safe"]')); const nx=q('mail','[data-mnext]'); if(nx) click(nx);} console.log('op-phish after hover', opDone('op-phish')); }
 // ---- NetBuilder ----
 setSel(q('net','[data-nplace="web01"]'),'dmz'); setSel(q('net','[data-nplace="db01"]'),'internal'); setSel(q('net','[data-nplace="lap"]'),'internal');
 const rule=(i,f,v)=>setSel(q('net',`[data-nrule="${i}|${f}"]`),v);
 rule(0,'src','internet'); rule(0,'dst','web01'); rule(0,'port','443');
 click(q('net','[data-nadd]')); rule(1,'src','web01'); rule(1,'dst','db01'); rule(1,'port','3306');
 click(q('net','[data-nadd]')); rule(2,'src','internal'); rule(2,'dst','internet'); rule(2,'port','443');
 click(q('net','[data-ndef="deny"]'));
 console.log('net need ok', w.eval('netNeedOk(losApp("net"))'), 'block ok (internal->internet should fail db01 test)', w.eval('netBlockOk(losApp("net"))'));
 rule(2,'src','lap'); console.log('block ok now', w.eval('netBlockOk(losApp("net"))'));
 click(q('net','[data-nrun]')); await sleep(9000);
 console.log('net tested', w.eval('!!losApp("net").tested'), 'results', qa('net','.ntests li.pass').length+'/7', 'op-dmz', opDone('op-dmz'));
 // ---- VulnScan ----
 click(q('scan','[data-vrun]')); await sleep(3200);
 console.log('scan findings', qa('scan','.vfrow').length);
 const pri={f1:'P1',f2:'P1',f3:'P1',f4:'P2',f5:'P3',f6:'P4',f7:'FP'}; for (const [k,v] of Object.entries(pri)) setSel(q('scan',`[data-vpri="${k}"]`),v);
 click(q('scan','[data-vtab="scope"]')); setChk(q('scan','[data-vscope="payroll-db"]'),true); click(q('scan','[data-vrun]')); await sleep(3500);
 setSel(q('scan','[data-vpri="f8"]'),'P2');
 console.log('op-scan', opDone('op-scan'), opSteps('op-scan'));
 // ---- Crypto Bench ----
 click(q('crypto','[data-cbcmp]')); console.log('bits differ', (q('crypto','.bitgrid')||{querySelectorAll:()=>[]}).querySelectorAll('i.d').length);
 click(q('crypto','[data-cbtab="enc"]')); const pin=q('crypto','#cbPass'); pin.value='lantern river copper 27'; fire(pin,'input'); click(q('crypto','[data-cbenc]')); await sleep(2500);
 console.log('encrypted', w.eval('!!losApp("crypto").enc'));
 click(q('crypto','[data-cbdec]')); await sleep(2500); console.log('decrypt ok:', /Decrypted/.test(winEl('crypto').textContent));
 click(q('crypto','[data-cbtamper]')); click(q('crypto','[data-cbdec]')); await sleep(2500); console.log('tamper caught:', /authentication tag/.test(winEl('crypto').textContent));
 click(q('crypto','[data-cbtab="pw"]')); let pi=q('crypto','#cbPw'); pi.value='Jyotirmaya@2026'; fire(pi,'input'); console.log('weak pw text:', /first pattern/.test(winEl('crypto').textContent));
 pi=q('crypto','#cbPw'); pi.value='lantern river copper basket violin meadow'; fire(pi,'input');
 console.log('op-crypto', opDone('op-crypto'), opSteps('op-crypto'));
 // ---- SIEM Hunt ----
 const sq=s=>{ const t=q('siem','#sQ'); t.value=s; fire(t,'input'); click(q('siem','[data-srun]')); return (q('siem','.kqlout2')||{}).textContent||''; };
 console.log('h1 q:', sq('DeviceProcessEvents | where InitiatingProcessFileName == "EXCEL.EXE" and FileName == "powershell.exe" | project DeviceName, AccountName').replace(/\s+/g,' ').slice(0,90));
 console.log('h3 q:', sq('DeviceProcessEvents | where ProcessCommandLine contains "delete shadows" | summarize dcount(DeviceName)').replace(/\s+/g,' ').slice(0,90));
 console.log('h4 q:', sq('DeviceProcessEvents | where FileName == "schtasks.exe" | project ProcessCommandLine').replace(/\s+/g,' ').slice(0,140));
 const ans=(id,v)=>{ const i=q('siem',`[data-hans="${id}"]`); i.value=v; click(q('siem',`[data-hchk="${id}"]`)); };
 ans('h1','FIN-LT-07'); ans('h2','certutil.exe'); ans('h3','2'); ans('h4','OneDriveSync');
 click(q('siem','[data-stab="tune"]')); click(q('siem','[data-tby="ip"]')); const rg=q('siem','#tN'); rg.value='11'; fire(rg,'input');
 console.log('tuned', w.eval('tuneGood(losApp("siem"))'), w.eval('JSON.stringify(tuneStats("ip",11))'), 'by user best', w.eval('JSON.stringify([2,3,5,9,12].map(n=>{const s=tuneStats("user",n);return [n,s.rec,+s.prec.toFixed(2)]}))'));
 click(q('siem','[data-stab="save"]')); setSel(q('siem','#rSev'),'High'); setChk(q('siem','[data-rresp="delmb"]'),true); setChk(q('siem','[data-rresp="notify"]'),true); setChk(q('siem','[data-rresp="block"]'),true); click(q('siem','[data-rsave]'));
 console.log('destructive msg:', /destructive/.test(winEl('siem').textContent)); setChk(q('siem','[data-rresp="delmb"]'),false); click(q('siem','[data-rsave]'));
 console.log('op-rule', opDone('op-rule'), opSteps('op-rule'));
 // ---- GRC Console ----
 const C=w.eval('GRC_CTL'); for (const c of C) { setSel(q('grc',`[data-gown="${c.id}"]`), c.own); setSel(q('grc',`[data-gv="${c.id}"]`), c.eff?'eff':'ineff'); if(!c.eff) setSel(q('grc',`[data-giss="${c.id}"]`), 'High'); }
 click(q('grc','[data-gpub]')); console.log('report shown', /attestation report/.test(winEl('grc').textContent), 'op-attest', opDone('op-attest'), opSteps('op-attest'));
 click(q('grc','[data-gtab="risk"]'));
 for (const r of w.eval('GRC_RISKS')) { setSel(q('grc',`[data-gr="${r.id}|l"]`), String(r.l)); setSel(q('grc',`[data-gr="${r.id}|i"]`), String(r.i)); setSel(q('grc',`[data-gr="${r.id}|tr"]`), r.tr[0]); if (r.l*r.i>=10) { setSel(q('grc',`[data-gr="${r.id}|own"]`), 'IT Security'); const d=q('grc',`[data-gr="${r.id}|due"]`); d.value='2026-12-15'; fire(d,'change'); } }
 click(q('grc','[data-gheat]')); console.log('heat chips', qa('grc','.heat5 .hc b').length, 'op-risk', opDone('op-risk'), opSteps('op-risk'));
 click(q('grc','[data-gtab="vend"]')); setSel(q('grc','[data-vtier]'),'High'); for (const id of ['q2','q3','q4','q5']) click(q('grc',`[data-vflag="${id}"]`));
 setChk(q('grc','[data-vev="soc2"]'),true); setChk(q('grc','[data-vev="subp"]'),true); click(q('grc','[data-vdec="cond"]')); for (const k of ['mfa','b24','subp','bkp','audit']) setChk(q('grc',`[data-vcl="${k}"]`),true);
 console.log('op-vendor', opDone('op-vendor'), opSteps('op-vendor'));
 // ---- Privacy Console ----
 const otp=q('privacy','[data-dsrid="otp"]'); otp.checked=true; fire(otp,'change'); click(q('privacy','[data-dsrsearch]')); await sleep(2200);
 for (const s of w.eval('DSR_SYS')) setSel(q('privacy',`[data-dsract="${s.id}"]`), s.act);
 const dl30=q('privacy','[data-dsrdl="30"]'); dl30.checked=true; fire(dl30,'change'); click(q('privacy','[data-dsrsend]')); console.log('wrong deadline msg:', /Pune/.test(winEl('privacy').textContent));
 const dl=q('privacy','[data-dsrdl="90"]'); dl.checked=true; fire(dl,'change'); click(q('privacy','[data-dsrsend]'));
 console.log('op-dsar', opDone('op-dsar'), opSteps('op-dsar'));
 click(q('privacy','[data-ptab="map"]')); for (const r of w.eval('ROPA')) { click(q('privacy',`[data-madd="${r.id}"]`)); setSel(q('privacy',`[data-mg="${r.id}"]`), r.g); if (r.hr) setChk(q('privacy',`[data-mhr="${r.id}"]`),true); if (r.xb) setChk(q('privacy',`[data-mxb="${r.id}"]`),true); }
 console.log('op-map', opDone('op-map'), opSteps('op-map'));
 click(q('privacy','[data-ptab="ck"]')); click(q('privacy','[data-ckscan]')); for (const c of w.eval('CK')) setSel(q('privacy',`[data-ckc="${c.id}"]`), c.cat);
 click(q('privacy','[data-ckpub]')); console.log('banner block msg:', /switched on by default/.test(winEl('privacy').textContent));
 for (const [k,v] of [['defFunc',false],['defAna',false],['defMkt',false],['reject1',true],['equal',true],['wall',false],['notice',true],['log',true]]) setChk(q('privacy',`[data-cko="${k}"]`),v);
 click(q('privacy','[data-ckprefs]')); click(q('privacy','[data-ckpub]'));
 console.log('op-cookie', opDone('op-cookie'), opSteps('op-cookie'));
 // ---- summary ----
 console.log('ALL OPS DONE', w.eval('OPS.filter(o=>!opGet(o.id).done).map(o=>o.id)'), 'labos xp', w.eval('losState().xp'), 'ach', w.eval('Object.keys(losState().ach||{}).join(",")'));
 w.eval('losOpen("ach")'); w.eval('losOpen("drill")'); const dr=w.eval('drillToday()'); for (let k=0;k<dr.qs.length;k++){ const b=q('drill',`[data-drill^="${k}|"]`); if(b) click(b); } console.log('drill done', w.eval('drillToday().done'), 'streak', w.eval('drillToday().streak'));
 // window controls
 const id0=w.eval('LOS.wins[0].id'); click(w.document.querySelector(`[data-wmax="${id0}"]`)); click(w.document.querySelector(`[data-wmin="${id0}"]`)); click(w.document.querySelector(`[data-lostask="${id0}"]`)); click(w.document.querySelector(`[data-wclose="${id0}"]`)); console.log('wins after close', w.eval('LOS.wins.length'));
 click(w.document.querySelector('[data-losstart]')); console.log('start menu open', !w.document.querySelector('#losStart').hidden);
 // op launch from topic page
 w.eval('go("dpdp")'); console.log('topic hands-on card', /Try it hands-on/.test(main())); const hb=w.document.querySelector('.handson [data-labop]'); click(hb); await sleep(80); console.log('current after op click', w.eval('current'), 'privacy win focused', w.eval('LOS.wins.find(x=>x.el.classList.contains("focus"))?.app'));
 // XP and dashboard
 w.eval('go("home")'); console.log('home has activity at top', w.document.querySelector('.toprow .actcard')!==null, 'focus card', /Studying for/.test(main()), 'xp', w.eval('totalXP()'));
 w.eval('go("projects")'); console.log('projects focus filter', !!w.document.querySelector('[data-pfilter="focus"]'));
}catch(e){errs.push('test: '+e.stack);} console.log('errors', errs.slice(0,30)); process.exit(0); })();
