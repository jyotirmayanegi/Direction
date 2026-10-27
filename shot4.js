const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', LIB=SP+'/libs', OUT=SP+'/shots';
fs.mkdirSync(OUT,{recursive:true});
const libFor=u=>u.includes('pdfjs-dist')?LIB+'/pdfjs-dist-3.11.174/package/build/'+path.basename(u):u.includes('mammoth')?LIB+'/mammoth-1.8.0/package/mammoth.browser.min.js':u.includes('jszip')?LIB+'/jszip-3.10.1/package/dist/jszip.min.js':u.includes('jspdf')?LIB+'/jspdf-2.5.1/package/dist/jspdf.umd.min.js':null;
const MOCK=`(()=>{
 const M=window.__mock={store:new Map(),listeners:[],calls:[],saved:[]};
 const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x)), notify=()=>setTimeout(()=>M.listeners.forEach(l=>{try{l()}catch(e){}}),10);
 const deepFreeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;};
 const snapDoc=p=>Object.freeze({id:p.split('/').pop(),exists:M.store.has(p),data:()=>deepFreeze(clone(M.store.get(p)))});
 const snapCol=p=>{const docs=[...M.store.keys()].filter(k=>k.startsWith(p+'/')&&!k.slice(p.length+1).includes('/')).map(k=>Object.freeze({id:k.split('/').pop(),data:()=>deepFreeze(clone(M.store.get(k)))}));return Object.freeze({docs:Object.freeze(docs),size:docs.length,empty:!docs.length});};
 const docRef=p=>({id:p.split('/').pop(),path:p,get:async()=>snapDoc(p),set:async d=>{M.store.set(p,clone(d));notify();},update:async d=>{M.store.set(p,Object.assign({},M.store.get(p)||{},clone(d)));notify();},delete:async()=>{M.store.delete(p);notify();},onSnapshot:(cb)=>{const l=()=>cb(snapDoc(p));M.listeners.push(l);setTimeout(l,5);return()=>{};}});
 const colRef=p=>({path:p,doc:id=>docRef(p+'/'+(id||Math.random().toString(36).slice(2,10))),add:async d=>{const id=Math.random().toString(36).slice(2,10);M.store.set(p+'/'+id,clone(d));notify();return docRef(p+'/'+id);},get:async()=>snapCol(p),onSnapshot:(cb)=>{const l=()=>cb(snapCol(p));M.listeners.push(l);setTimeout(l,5);return()=>{};}});
 const db={collection:colRef,doc:docRef};
 const today=new Date(), iso=d=>d.toISOString(), ago=h=>iso(new Date(Date.now()-h*3600e3));
 const news=[{title:"DPDP Rules: Consent Manager registration window opens",regulator:"MeitY",jurisdiction:"India",type:"deadline",date:"2026-10-20",deadline:"2026-11-13",impact:"high",summary:"Test item for layout.",finding:"Test finding.",topics:["dpdp"],url:"https://www.meity.gov.in/",source:"MeitY"},{title:"EDPB guidance on pseudonymisation",regulator:"EDPB",jurisdiction:"EU",type:"guidance",date:"2026-10-15",impact:"medium",summary:"Test item.",finding:"Test.",topics:["gdpr"],url:"https://www.edpb.europa.eu/",source:"EDPB"}];
 news.forEach((n,i)=>M.store.set('news/n'+i,n)); M.store.set('meta/news',{lastRun:iso(today),highlights:["Test highlight one","Test highlight two"],note:"test run"});
 const TH=[
  {id:"t1",messageCount:1,viewUrl:"https://mail.google.com/x1",messages:[{id:"m1",threadId:"t1",date:ago(30),sender:"Acme Careers <no-reply@acme.myworkdayjobs.com>",subject:"Thank you for applying to Acme Fintech for Privacy Analyst",snippet:"We have received your application for Privacy Analyst",labelIds:["INBOX"]}]},
  {id:"t2",messageCount:2,viewUrl:"https://mail.google.com/x2",messages:[{id:"m2",threadId:"t2",date:ago(20),sender:"Riya HR <riya@kavachsec.in>",subject:"Interview for GRC Analyst role at Kavach Security",snippet:"Please share your availability for a 30 minute interview on Teams this week.",labelIds:["INBOX"]}]},
  {id:"t3",messageCount:1,viewUrl:"https://mail.google.com/x3",messages:[{id:"m3",threadId:"t3",date:ago(10),sender:"Talent Team <talent@ledgerwise.in>",subject:"Opportunity: Compliance Analyst opening",snippet:"Came across your profile and wanted to check if you are open to a Compliance Analyst role. Expected CTC?",labelIds:["INBOX"]}]},
  {id:"t4",messageCount:1,viewUrl:"https://mail.google.com/x4",messages:[{id:"m4",threadId:"t4",date:ago(5),sender:"Jobs <jobalerts-noreply@linkedin.com>",subject:"30 new jobs for Privacy Analyst",snippet:"jobs for you",labelIds:["INBOX"]}]},
  {id:"t5",messageCount:1,viewUrl:"https://mail.google.com/x5",messages:[{id:"m5",threadId:"t5",date:ago(50),sender:"me@example.com",subject:"Application for Vendor Risk Analyst position",snippet:"Please find my resume attached for the Vendor Risk Analyst position.",labelIds:["SENT"],toRecipients:["hr@trustbridge.co.in"]}]}];
 const mcp={callTool:async(server,tool,input)=>{M.calls.push({server,tool,input});
   if(tool==='search_threads'){const q=input.query||'';return {payload:{threads:q.includes('in:sent')?TH.filter(t=>t.id==='t5'):TH.filter(t=>t.id!=='t5')}};}
   if(tool==='get_thread'){const t=TH.find(x=>x.id===input.threadId)||TH[1];return {payload:{messages:t.messages.map(m=>Object.assign({},m,{body:m.snippet}))}};}
   if(tool==='create_draft')return {payload:{id:'draft1'}}; if(tool==='reply')return {payload:{id:'sent1'}}; throw Object.assign(new Error('nope'),{code:'tool_error'});}};
 const sample=async(input,opts)=>{const text="Dear Riya,\\n\\nThank you for reaching out. I'd be glad to interview for the GRC Analyst role. I'm available Tuesday or Wednesday between 11:00 and 18:00 IST.\\n\\nBest regards,\\nAsha";if(opts&&opts.onText)opts.onText({text,delta:text});return {text,truncated:false};};
 sample.json=async()=>({verdict:"Likely shortlist for privacy roles.",strengths:["DPDP knowledge"],gaps:[{gap:"No OneTrust project",fix:"Do the DSAR op"}],summary:"Test summary.",bullets:[{before:"Did things",after:"Reviewed 40+ disputes"}],probe:["DPDP rights"]});
 sample.limits=async()=>({images:false});
 const user={isOwner:async()=>true,canEdit:async()=>true,id:async()=>'u1',me:async()=>({id:'u1'})};
 const permissions={state:async()=> 'granted',request:async()=>({}),manage:async()=>{}};
 const downloads={save:async({filename,data})=>{let b64='';if(data instanceof Blob){const buf=new Uint8Array(await data.arrayBuffer());let s='';buf.forEach(x=>s+=String.fromCharCode(x));b64=btoa(s);}else b64=btoa(unescape(encodeURIComponent(String(data))));M.saved.push({filename,b64,type:data&&data.type||'text'});return {status:'saved'};}};
 const caps={db,user,mcp,sample,permissions,downloads,assets:null};
 window.claude={use:async n=>caps[n]===undefined?null:caps[n]};
})();`;
(async()=>{
 const browser=await chromium.launch(); const logs=[];
 const mk=async (vp, scheme)=>{ const ctx=await browser.newContext({viewport:vp, colorScheme:scheme, acceptDownloads:true}); await ctx.addInitScript(MOCK);
   await ctx.route('https://cdn.jsdelivr.net/**', r=>{ const f=libFor(r.request().url()); if(f&&fs.existsSync(f)) r.fulfill({path:f, contentType:'application/javascript', headers:{'access-control-allow-origin':'*'}}); else r.abort(); });
   const page=await ctx.newPage(); page.on('pageerror',e=>logs.push('pageerror: '+e.message)); page.on('console',m=>{ if(m.type()==='error') logs.push('console: '+m.text()); });
   await page.goto('file:///home/claude/grc-hub.html'); await page.waitForTimeout(900); return {ctx,page}; };
 const shot=async (page,name,full=true)=>{ await page.screenshot({path:OUT+'/'+name+'.png', fullPage:full}); };
 const go=async (page,v)=>{ await page.evaluate(v=>go(v), v); await page.waitForTimeout(350); };
 /* desktop light */
 let {ctx,page}=await mk({width:1280,height:860},'light');
 await page.evaluate(()=>{ setFocus("privacy"); });
 await go(page,'home'); await shot(page,'d-home');
 await go(page,'applications'); await page.click('[data-trksync]'); await page.waitForTimeout(1500); await shot(page,'d-apps');
 const st=await page.evaluate(()=>({apps:TRK.apps.map(a=>a.company+':'+a.status+':'+(a.role||'')), threads:TRK.threads.map(t=>t.type+':'+t.company+':'+t.needsReply), meta:TRK.meta&&TRK.meta.note}));
 console.log('tracker after sync', JSON.stringify(st));
 const draftBtn=await page.$('[data-trkdraft]'); if(draftBtn){ await draftBtn.click(); await page.waitForTimeout(800); const saveBtn=await page.$('[data-trksave]'); if(saveBtn){ await saveBtn.click(); await page.waitForTimeout(500);} }
 console.log('mcp calls', JSON.stringify(await page.evaluate(()=>__mock.calls.map(c=>c.tool))));
 await shot(page,'d-apps-draft');
 await go(page,'news'); await shot(page,'d-news');
 await go(page,'path'); await shot(page,'d-path');
 await go(page,'matrix'); await shot(page,'d-matrix',false);
 await go(page,'learn'); await shot(page,'d-learn');
 await go(page,'resume'); await page.setInputFiles('#rsFile', SP+'/test_resume_2col.pdf'); await page.waitForTimeout(2500);
 console.log('pdf meta', JSON.stringify(await page.evaluate(()=>S.resume.fileMeta)), 'raw head', JSON.stringify(await page.evaluate(()=>S.resume.raw.slice(0,260))));
 await shot(page,'d-resume-pdf');
 await page.setInputFiles('#rsFile', SP+'/test_resume.docx'); await page.waitForTimeout(2000);
 console.log('docx meta', JSON.stringify(await page.evaluate(()=>S.resume.fileMeta)), 'fmt issues', JSON.stringify(await page.evaluate(()=>formatIssues(S.resume.fileMeta,S.resume.raw).map(f=>f[0]+':'+f[1].slice(0,60)))));
 const b=await page.$('#rsBuild'); if(b){ await b.click(); await page.waitForTimeout(400); }
 for (const k of ['docx','pdf','txt']) { const el=await page.$(`[data-rsdl="${k}"]`); if(el){ await el.click(); await page.waitForTimeout(1500);} }
 const saved=await page.evaluate(()=>__mock.saved.map(s=>({filename:s.filename,type:s.type,len:s.b64.length,b64:s.b64})));
 saved.forEach(s=>{ fs.writeFileSync(OUT+'/'+s.filename, Buffer.from(s.b64,'base64')); });
 console.log('downloads', JSON.stringify(saved.map(s=>[s.filename,s.type,s.len])));
 await shot(page,'d-resume-docx');
 await go(page,'lab'); await page.evaluate(()=>{ losOpen("term"); }); await page.waitForTimeout(200);
 await page.fill('.tcmd','ls -la'); await page.press('.tcmd','Enter'); await page.fill('.tcmd','nmap web01'); await page.press('.tcmd','Enter'); await page.waitForTimeout(200);
 await page.evaluate(()=>{ losOpen("grc"); }); await page.waitForTimeout(200); await shot(page,'d-labos',false);
 await page.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("net"); }); await page.waitForTimeout(250); await shot(page,'d-labos-net',false);
 await page.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("mail"); }); await page.click('[data-mstart]'); await page.waitForTimeout(150); await page.click('[data-mdet]'); await page.waitForTimeout(150); await shot(page,'d-labos-mail',false);
 await page.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("siem"); }); await page.waitForTimeout(200); await page.click('[data-stab="tune"]'); await page.waitForTimeout(150); await shot(page,'d-labos-siem',false);
 await page.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("privacy"); }); await page.waitForTimeout(150); await page.click('[data-ptab="ck"]'); await page.click('[data-ckscan]'); await page.waitForTimeout(150); await shot(page,'d-labos-privacy',false);
 await page.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("scan"); }); await page.click('[data-vrun]'); await page.waitForTimeout(3000); await shot(page,'d-labos-scan',false);
 await page.evaluate(()=>{ LOS.wins.slice().forEach(w=>losClose(w.id)); losOpen("crypto"); }); await page.click('[data-cbcmp]'); await page.waitForTimeout(150); await shot(page,'d-labos-crypto',false);
 await go(page,'dpdp'); await page.evaluate(()=>document.querySelector('.handson')?.scrollIntoView()); await shot(page,'d-topic-handson',false);
 await ctx.close();
 /* mobile dark */
 ({ctx,page}=await mk({width:390,height:844},'dark'));
 await page.evaluate(()=>{ setFocus("grcan"); });
 await go(page,'home'); await shot(page,'m-home');
 await go(page,'lab'); await shot(page,'m-labos',false); await page.evaluate(()=>{ losOpen("term"); }); await page.waitForTimeout(200); await shot(page,'m-labos-term',false);
 await go(page,'applications'); await page.click('[data-trksync]'); await page.waitForTimeout(1500); await shot(page,'m-apps');
 await go(page,'news'); await shot(page,'m-news');
 await go(page,'path'); await shot(page,'m-path');
 await go(page,'learn'); await shot(page,'m-learn');
 await page.evaluate(()=>openRolePicker()); await page.waitForTimeout(150); await shot(page,'m-rolepicker',false);
 await ctx.close();
 await browser.close();
 console.log('logs', JSON.stringify(logs.slice(0,20)));
})();
