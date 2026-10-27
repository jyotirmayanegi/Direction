/* Full sweep: every route on desktop + phone, capture errors and overflow; then exercise the new features. */
const {chromium}=require('playwright');const fs=require('fs');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', OUT=SP+'/shots';
const src=fs.readFileSync(__dirname+'/shot4.js','utf8'); const i=src.indexOf('const MOCK=`')+'const MOCK=`'.length, j=src.indexOf('`;',i);
const MOCK=eval('`'+src.slice(i,j)+'`');
const EXTRA=`(()=>{const o=window.claude.use; const L={}; const me={peer:'p1',by:'u1',isMe:true,sameTab:true,kind:'viewer',guest:false};
 const peers=[Object.assign({presence:{nick:'Jyotirmaya'},updatedAt:Date.now()},me)];
 const named=name=>({name, emit:async(t,d)=>{window.__emits=(window.__emits||[]).concat([[name,t,d]]);(L[name+t]||[]).forEach(h=>h(Object.assign({topic:t,data:d},me)))}, on:(t,h)=>{(L[name+t] ||= []).push(h); return ()=>{}}, presence:async()=>{}, peers:()=>peers, onPeers:(h)=>{setTimeout(()=>h({peers,joined:peers,left:[],updated:[]}),5); return ()=>{}}, connected:()=>true, onConnection:(h)=>{setTimeout(()=>h(true),5); return ()=>{}}, leave:async()=>{}});
 const room={join:async n=>named(n)}; window.__assetsOn = true;
 const assets={upload:async b=>{ if(!window.__assetsOn) throw Object.assign(new Error('x'),{code:'unavailable'}); window.__uploaded=b; return {id:'a'.repeat(32),url:'data:image/gif;base64,R0lGODlhAQABAAAAACw=',sizeBytes:b.size,contentType:b.type}; }};
 window.claude={use:async n=> n==='room'?room: n==='assets'?assets : o(n)};})()`;
(async()=>{
 const browser=await chromium.launch(); const errs=[]; const report={};
 const mk=async (vp, scheme, mobile)=>{ const ctx=await browser.newContext({viewport:vp, colorScheme:scheme, isMobile:!!mobile, hasTouch:!!mobile}); await ctx.addInitScript(MOCK); await ctx.addInitScript(EXTRA);
   await ctx.route('https://cdn.jsdelivr.net/**', r=>r.abort());
   const page=await ctx.newPage(); page.on('pageerror',e=>errs.push(vp.width+' pageerror: '+e.message)); page.on('console',m=>{ if(m.type()==='error' && !/net::ERR|Failed to load resource/.test(m.text())) errs.push(vp.width+' console: '+m.text()); });
   await page.goto('file:///home/claude/grc-hub.html'); await page.waitForTimeout(900); return {ctx,page}; };
 for (const [vp,scheme,tag,mobile] of [[{width:1280,height:860},'light','d',false],[{width:390,height:844},'dark','m',true]]) {
  const {ctx,page}=await mk(vp,scheme,mobile);
  await page.evaluate(()=>{ const m=document.createElement('meta'); m.name='viewport'; m.content='width=device-width,initial-scale=1'; document.head.appendChild(m); });
  const res=await page.evaluate(async()=>{
    const out={bad:[],overflow:[],n:0};
    const routes=[...Object.keys(VIEWS), ...TOPICS.map(t=>t.id), ...ROLES.filter(r=>pathOf(r.id)).map(r=>'role-'+r.id), ...ALLPROJ.map(p=>'proj-'+p.id), ...CERTS.map(c=>'cert-'+c.id), ...MISSIONS.slice(0,6).map(m=>'lab-'+m.id)];
    for (const r of routes){ try { go(r); } catch(e){ out.bad.push(r+' THROW '+e.message); continue; } out.n++;
      const m=document.getElementById('main'); const len=(m.textContent||'').length; if (current!==r && !(r==='lab'&&current==='lab')) out.bad.push(r+' resolved to '+current); else if (len<150 && r!=='lab') out.bad.push(r+' short '+len);
      if (document.documentElement.scrollWidth > innerWidth+2) out.overflow.push(r+' '+document.documentElement.scrollWidth); }
    return out; });
  report[tag]=res; console.log(tag,'routes',res.n,'bad',JSON.stringify(res.bad.slice(0,30)),'overflow',JSON.stringify(res.overflow.slice(0,30)));
  await ctx.close();
 }
 /* ---------- feature tests (desktop) ---------- */
 const {ctx,page}=await mk({width:1280,height:860},'light',false);
 await page.route('https://api.github.com/**', async r=>{ const u=r.request().url(), m=r.request().method();
   if (m==='GET' && /\/repos\/[^/]+\/[^/]+$/.test(u.split('?')[0])) return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({full_name:'jn/grc-portfolio',private:false,default_branch:'main'})});
   if (m==='GET' && u.includes('/contents/') && u.includes('deliverable.md') && globalThis.__pullMode) return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({sha:'s1',content:Buffer.from('# X — deliverable\n\nRemote improved text from GitHub').toString('base64')})});
   if (m==='GET') return r.fulfill({status:404,contentType:'application/json',body:'{"message":"Not Found"}'});
   if (m==='PUT') { globalThis.__puts=(globalThis.__puts||0)+1; return r.fulfill({status:201,contentType:'application/json',body:JSON.stringify({content:{sha:'abc'+globalThis.__puts}})}); }
   r.fulfill({status:500,body:'{}'}); });
 const T={};
 // home layout: duo with tracker and cube side by side, same height
 await page.evaluate(()=>go('home')); await page.waitForTimeout(300);
 T.duo=await page.evaluate(()=>{ const d=document.querySelector('.homeduo'); if(!d) return 'missing'; const [a,b]=[...d.children].map(x=>x.getBoundingClientRect()); return {sameRow:Math.abs(a.top-b.top)<2, sameH:Math.abs(a.height-b.height)<2, wA:Math.round(a.width), wB:Math.round(b.width)}; });
 await page.screenshot({path:OUT+'/v8-home.png'});
 // focus role always set, no "All subjects"
 T.noAll=await page.evaluate(()=>!document.body.innerHTML.includes('>All subjects<'));
 // role page
 await page.evaluate(()=>go('role-aigov')); await page.waitForTimeout(250);
 T.role=await page.evaluate(()=>({h:document.querySelector('.thead h2').textContent, parts:document.querySelectorAll('.parts a').length, jargon:document.querySelectorAll('.jargon .jg').length, ai:!!document.querySelector('#r-ai .aimeter'), must:document.querySelectorAll('#r-must .mk-list li').length, cmd:!!document.querySelector('#r-ask .cmdbar')}));
 await page.screenshot({path:OUT+'/v8-role.png', fullPage:true});
 // command bar on role page
 await page.fill('#cmd-role-aigov','/'); await page.waitForTimeout(100); T.sug=await page.evaluate(()=>document.querySelectorAll('#r-ask .cmdsug button').length);
 await page.fill('#cmd-role-aigov','/what FRIA'); await page.press('#cmd-role-aigov','Enter'); await page.waitForTimeout(500);
 T.cmdOut=await page.evaluate(()=>{ const o=document.querySelector('#r-ask .cmdout'); return o && !o.hidden ? o.textContent.slice(0,80) : 'none'; });
 await page.click('#r-ask [data-cmdrun$="|/help"]'); await page.waitForTimeout(100); T.help=await page.evaluate(()=>document.querySelectorAll('#r-ask .cmdhelp>div').length);
 // topic page: AI impact + command bar + jargon local
 await page.evaluate(()=>go('ai-euact')); await page.waitForTimeout(250);
 T.topic=await page.evaluate(()=>({ai:!!document.getElementById('p-ai'), cmd:!!document.querySelector('#p-ask .cmdbar'), subs:document.querySelectorAll('.sub').length}));
 await page.click('#p-ask [data-cmdrun$="|/jargon"]'); await page.waitForTimeout(100); T.jargon=await page.evaluate(()=>document.querySelectorAll('#p-ask .jargon .jg').length);
 // learning page: must-know default, venn present, full toggle works
 await page.evaluate(()=>{ setFocus('aigov'); go('learn'); }); await page.waitForTimeout(200);
 T.learn=await page.evaluate(()=>({venn:!!document.querySelector('.vennsvg'), must:document.querySelectorAll('.mkcard .mk-list li').length, tracks:!!document.querySelector('[data-trackf]')}));
 await page.click('[data-lmode="full"]'); await page.waitForTimeout(150); T.full=await page.evaluate(()=>!!document.querySelector('[data-trackf]'));
 await page.click('[data-lmode="must"]');
 // menu search (sidebar) + ctrl-k
 await page.keyboard.press('Control+k'); await page.waitForTimeout(100); T.ctrlk=await page.evaluate(()=>document.activeElement && document.activeElement.classList.contains('navq'));
 await page.keyboard.type('owasp'); await page.waitForTimeout(150);
 T.search=await page.evaluate(()=>[...document.querySelectorAll('#side .navres button.item')].map(b=>b.textContent.trim()).slice(0,3));
 await page.keyboard.press('Enter'); await page.waitForTimeout(200); T.searchGo=await page.evaluate(()=>current);
 // icons visible: contrast check of lab icon background in dark mode later; check presence of all items
 T.menuItems=await page.evaluate(()=>document.querySelectorAll('#side .grp button.item').length);
 // support
 await page.evaluate(()=>go('support')); await page.waitForTimeout(150);
 await page.fill('#supText','Test report'); await page.click('#supSend'); await page.waitForTimeout(150); T.support=await page.evaluate(()=>document.getElementById('supMsg').textContent);
 await page.fill('#cmd-app-support','/where resume upload'); await page.press('#cmd-app-support','Enter'); await page.waitForTimeout(300); T.supportAI=await page.evaluate(()=>!document.querySelector('.supportcard .cmdout').hidden);
 // mentors
 await page.evaluate(()=>go('mentors')); await page.waitForTimeout(250);
 await page.click('[data-medit^="new"]'); await page.fill('#mfName','Asha Rao'); await page.fill('#mfEmail','asha@example.com'); await page.fill('#mfPhone','+91 98100 00000'); await page.click('[data-msave]'); await page.waitForTimeout(400);
 T.mentors=await page.evaluate(()=>({n:(MENTORS||[]).length, cards:document.querySelectorAll('.mentor:not(.empty)').length, rooms:document.querySelectorAll('.roomtile').length}));
 await page.click('.roomtile'); await page.waitForTimeout(400); await page.fill('#roomIn','Hello mentor'); await page.press('#roomIn','Enter'); await page.waitForTimeout(150);
 await page.click('#roomRing'); await page.waitForTimeout(150);
 T.room=await page.evaluate(()=>({log:document.getElementById('roomLog').textContent.slice(-120), emits:(window.__emits||[]).map(e=>e[1]), status:document.getElementById('roomStatus').textContent, link:document.querySelector('.roomside a.btn').href}));
 await page.screenshot({path:OUT+'/v8-mentors.png', fullPage:true});
 await page.click('[data-mleave]'); await page.click('[data-mmsg]'); await page.click('[data-mdraft]'); await page.waitForTimeout(300); T.mdraft=await page.evaluate(()=>document.getElementById('mmMsg').textContent);
 // GitHub push / pull / zip
 await page.evaluate(()=>{ const p=PROJ['ai-euact-1']; projState(p.id).draft='My classification table '.repeat(20); go('proj-ai-euact-1'); }); await page.waitForTimeout(250);
 await page.fill('#ghRepo','jn/grc-portfolio'); await page.click('details.ghsetup summary'); await page.fill('#ghTok','github_pat_TEST123'); await page.click('[data-ghsave]'); await page.waitForTimeout(200);
 await page.click('[data-ghtest]'); await page.waitForTimeout(300); T.ghTest=await page.evaluate(()=>document.getElementById('ghMsg').textContent);
 await page.click('[data-ghpush]'); await page.waitForTimeout(800); T.ghPush=await page.evaluate(()=>({msg:document.getElementById('ghMsg').textContent, v:projGet('ai-euact-1').gh.version}));
 await page.evaluate(()=>{}); await page.route('https://api.github.com/**', r=>r.fallback());
 await page.evaluate(()=>{ window.__pullTest=true; });
 globalThis.__pullMode=true; await page.click('[data-ghpull]'); await page.waitForTimeout(500); T.ghPull1=await page.evaluate(()=>document.getElementById('ghMsg').textContent.slice(0,80));
 const ap=await page.$('[data-ghapply]'); if (ap){ await ap.click(); await page.waitForTimeout(200); } T.ghPull2=await page.evaluate(()=>projGet('ai-euact-1').draft.slice(0,40));
 await page.click('[data-ghzip]'); await page.waitForTimeout(400); T.zip=await page.evaluate(()=>{ const s=__mock.saved[__mock.saved.length-1]; return s ? s.filename+' '+atob(s.b64).slice(0,2) : 'none'; });
 await page.screenshot({path:OUT+'/v8-github.png', fullPage:false});
 // ideas
 await page.evaluate(()=>go('ideas')); await page.waitForTimeout(200); T.ideas=await page.evaluate(()=>document.querySelectorAll('.idea').length);
 await page.click('[data-ideast$="|doing"]'); await page.waitForTimeout(100); T.ideaPlan=await page.evaluate(()=>Object.values(S.progress.ideas||{}).filter(x=>x.status).length);
 // automation flow builder
 await page.evaluate(()=>go('automation')); await page.waitForTimeout(150);
 await page.selectOption('[data-flow="tool"]','pa'); await page.selectOption('[data-flow="trig"]','schedule'); await page.selectOption('[data-flow="cond"]','status-due');
 for (const a of ['email-owner','teams-remind','mark-received']) { await page.check(`[data-flowact="${a}"]`); await page.waitForTimeout(40); }
 await page.click('[data-flowcheck]'); await page.waitForTimeout(100); T.flow=await page.evaluate(()=>flowRes.slice(0,30));
 await page.screenshot({path:OUT+'/v8-automation.png', fullPage:true});
 // AI governance desk op
 await page.evaluate(()=>{ go('lab'); }); await page.waitForTimeout(300);
 await page.evaluate(()=>losStartOp('op-aigov')); await page.waitForTimeout(300);
 await page.evaluate(()=>{ const w=document.querySelector('.win:last-of-type'); AIDESK_SYS.forEach((s,i)=>{ const a=document.querySelector(`[data-aicls="${i}"]`), b=document.querySelector(`[data-airole="${i}"]`); a.value=s[1]; a.dispatchEvent(new Event('change',{bubbles:true})); b.value=s[2]; b.dispatchEvent(new Event('change',{bubbles:true})); }); document.querySelector('[data-aicheck]').click(); });
 await page.waitForTimeout(200);
 await page.evaluate(()=>{ document.querySelector('[data-aitab="safe"]').click(); });
 await page.waitForTimeout(100);
 await page.evaluate(()=>{ AIDESK_SAFE.forEach((s,i)=>{ const c=document.querySelector(`[data-aisafe="${i}"]`); c.checked=!!s[1]; c.dispatchEvent(new Event('change',{bubbles:true})); }); document.querySelector('[data-aisafecheck]').click(); });
 await page.waitForTimeout(200); T.aiop=await page.evaluate(()=>({done:opGet('op-aigov').done, steps:opGet('op-aigov').steps}));
 await page.screenshot({path:OUT+'/v8-aidesk.png'});
 // avatar upload (assets) then fallback (no assets)
 await page.evaluate(()=>go('profile')); await page.waitForTimeout(150);
 const png=SP+'/test_avatar.png'; if(!fs.existsSync(png)){ const b=await page.evaluate(()=>{ const c=document.createElement('canvas'); c.width=1200;c.height=900; const x=c.getContext('2d'); x.fillStyle='#c33'; x.fillRect(0,0,1200,900); x.fillStyle='#fff'; x.fillRect(400,200,400,500); return c.toDataURL('image/png').split(',')[1]; }); fs.writeFileSync(png, Buffer.from(b,'base64')); }
 await page.setInputFiles('#avFile', png); await page.waitForTimeout(800); T.av1=await page.evaluate(()=>({id:S.profile.avatarId.slice(0,4), url:!!S.profile.avatarUrl, up:window.__uploaded? window.__uploaded.size : 0}));
 await page.evaluate(()=>{ window.__assetsOn=false; }); await page.setInputFiles('#avFile', png); await page.waitForTimeout(800); T.av2=await page.evaluate(()=>({data:(S.profile.avatarData||'').slice(0,22), len:(S.profile.avatarData||'').length, img:!!document.querySelector('.avatar img')}));
 // per-role activity logging
 await page.evaluate(()=>{ go('ai-risk'); logActivity(2); go('role-aigov'); }); await page.waitForTimeout(150); T.tlog=await page.evaluate(()=>roleDayCount('aigov', today()));
 console.log(JSON.stringify(T,null,1));
 await ctx.close();
 /* dark mode menu on phone for icon visibility */
 const m=await mk({width:390,height:844},'dark',true); await m.page.evaluate(()=>{ const x=document.createElement('meta'); x.name='viewport'; x.content='width=device-width,initial-scale=1'; document.head.appendChild(x); });
 await m.page.click('#menuBtn'); await m.page.waitForTimeout(200); await m.page.screenshot({path:OUT+'/v8-menu-dark.png'}); await m.page.fill('.sheet .navq','dpdp'); await m.page.waitForTimeout(150); await m.page.screenshot({path:OUT+'/v8-menu-search.png'});
 await m.page.keyboard.press('Escape'); await m.page.evaluate(()=>go('home')); await m.page.waitForTimeout(200); await m.page.screenshot({path:OUT+'/v8-m-home.png', fullPage:false});
 await m.page.evaluate(()=>go('role-privacy')); await m.page.waitForTimeout(200); await m.page.screenshot({path:OUT+'/v8-m-role.png', fullPage:false});
 await m.ctx.close();
 console.log('ERRORS', JSON.stringify(errs.slice(0,40), null, 1));
 await browser.close(); })();
