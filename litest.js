const {chromium}=require('playwright');const fs=require('fs');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', OUT=SP+'/shots';
const src=fs.readFileSync(__dirname+'/shot4.js','utf8'); const i=src.indexOf('const MOCK=`')+'const MOCK=`'.length, j=src.indexOf('`;',i);
const MOCK=eval('`'+src.slice(i,j)+'`');
const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString();};
const LIMOCK=`(()=>{ const o=window.claude.use; const TH=[
 {id:'l1',messages:[{sender:'LinkedIn <invitations@linkedin.com>',subject:'Rahul accepted your invitation, explore their network',snippet:'See Rahul Verma&#39;s connections and more',date:'${d(4)}'}]},
 {id:'l2',messages:[{sender:'LinkedIn <invitations@linkedin.com>',subject:'You have an invitation ✉️',snippet:'Neha Gupta, Privacy Analyst from EY is waiting for your response',date:'${d(2)}'}]},
 {id:'l3',messages:[{sender:'LinkedIn <messaging-digest-noreply@linkedin.com>',subject:'Sameer Khan just messaged you',snippet:'1 new message awaits your response',date:'${d(1)}'}]},
 {id:'l4',messages:[{sender:'LinkedIn <inmail-hit-reply@linkedin.com>',subject:'[Invitation] Compliance Associate role at Acme',snippet:'Hi',date:'${d(5)}'}]}];
 window.claude={use:async n=>{ const r=await o(n); if(n==='mcp'&&r){ return {callTool:async(s,t,inp,op)=>{ if(t==='search_threads'&&/linkedin\\.com/.test(inp.query||'')) return {payload:{threads:TH}}; return r.callTool(s,t,inp,op); }}; } return r; }}; })()`;
(async()=>{
 const browser=await chromium.launch(); const errs=[]; const T={};
 for (const [vp,name] of [[{width:1280,height:860},'d'],[{width:390,height:844},'m']]) {
 const ctx=await browser.newContext({viewport:vp}); await ctx.addInitScript(MOCK); await ctx.addInitScript(LIMOCK);
 await ctx.route(/jszip/, r=>r.fulfill({path:'/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',contentType:'application/javascript'}));
 const page=await ctx.newPage(); page.on('pageerror',e=>errs.push(name+' pageerror: '+e.message)); page.on('console',m=>{ if(m.type()==='error'&&!/Failed to load/.test(m.text())) errs.push(name+' console: '+m.text()); });
 await page.goto('file:///home/claude/grc-hub.html'); await page.waitForTimeout(1500);
 await page.evaluate(()=>{ S.network.contacts=[{name:'Priya Sharma',li:'https://www.linkedin.com/in/priyasharma',stage:'To connect',tpl:'pro'},{name:'Rahul Verma',stage:'Request sent',tpl:'pro'},{name:'Sameer Khan',li:'https://www.linkedin.com/in/sameerk',stage:'To connect',tpl:'pro'}]; go('network'); });
 await page.waitForTimeout(500);
 T[name+'empty']=await page.evaluate(()=>({card:!!document.querySelector('.licard'), over:document.documentElement.scrollWidth>innerWidth}));
 await page.click('[data-lisync]'); await page.waitForTimeout(600);
 T[name+'gmail']=await page.evaluate(()=>({ev:Object.values(LI.events), msg:LI.msg, stages:S.network.contacts.map(c=>c.stage)}));
 await page.setInputFiles('#liFile', __dirname+'/fx/li.zip'); await page.waitForTimeout(1500);
 T[name+'import']=await page.evaluate(()=>({conns:LI.conns.length, invs:LI.invs, convs:LI.convs, msg:LI.msg, stages:S.network.contacts.map(c=>c.stage), st:(()=>{const s=liStats();return {acc:s.acceptRate,never:s.neverMsg.map(x=>x.name),noReply:s.noReply.map(c=>c[0]),awaiting:s.awaiting.map(c=>c[0]),rel:s.relevant.length,weekOut:s.weekOut}})(), stored:__mock.store.get ? [...__mock.store.keys()].filter(k=>/linkedin/.test(k)) : null, over:document.documentElement.scrollWidth>innerWidth}));
 const b=await page.$('[data-liadd]'); if (b) { await b.click(); await page.waitForTimeout(200); }
 T[name+'added']=await page.evaluate(()=>S.network.contacts.length);
 await page.fill('#liGoalInv','5'); await page.dispatchEvent('#liGoalInv','change'); await page.waitForTimeout(200); T[name+'goal']=await page.evaluate(()=>LI.goal);
 await page.evaluate(()=>document.querySelector('.licard').scrollIntoView()); await page.screenshot({path:OUT+'/li-'+name+'.png', fullPage:true});
 await ctx.close(); }
 console.log(JSON.stringify(T,null,1)); console.log('ERRORS',JSON.stringify(errs,null,1)); await browser.close(); })();
