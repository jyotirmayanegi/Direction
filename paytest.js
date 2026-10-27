const {chromium}=require('playwright');const fs=require('fs');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', OUT=SP+'/shots';
const src=fs.readFileSync(__dirname+'/shot4.js','utf8'); const i=src.indexOf('const MOCK=`')+'const MOCK=`'.length, j=src.indexOf('`;',i);
const MOCK=eval('`'+src.slice(i,j)+'`');
const asUser=(owner,uid)=>`(()=>{ const o=window.claude.use; __mock.store.set('meta/pay',{std:1500,intro:1200,introOn:true,introEnds:'2026-12-31',months:12,gst:18,biz:'Career Count',payee:'Jyotirmaya Negi',vpa:'jyoti@okaxis',link:'https://rzp.io/l/careercount',email:'help@careercount.in'});
 ${owner?`__mock.store.set('claims/cust9',{uid:'cust9',name:'Riya S',contact:'riya@example.com',method:'upi',ref:'412345678901',amount:1200,at:'2026-10-26T10:00:00Z',status:'pending'});`:''}
 window.claude={use:async n=>{ const r=await o(n); if(n==='user'&&r) return Object.assign({},r,{isOwner:async()=>${owner},id:async()=>'${uid}'}); return r; }}; })()`;
(async()=>{
 const browser=await chromium.launch(); const errs=[]; const T={};
 const mk=async (owner,uid,vp={width:1280,height:860},scheme='light')=>{ const ctx=await browser.newContext({viewport:vp,colorScheme:scheme}); await ctx.addInitScript(MOCK); await ctx.addInitScript(asUser(owner,uid));
   await ctx.route('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', r=>r.fulfill({path:SP+'/qrpkg/package/qrcode.js',contentType:'application/javascript'}));
   const page=await ctx.newPage(); page.on('pageerror',e=>errs.push('pageerror: '+e.message)); page.on('console',m=>{ if(m.type()==='error'&&!/Failed to load/.test(m.text())) errs.push('console: '+m.text()); });
   await page.goto('file:///home/claude/grc-hub.html'); await page.waitForTimeout(1800); return {ctx,page}; };
 /* ---- customer ---- */
 let {ctx,page}=await mk(false,'cust1');
 T.popup=await page.evaluate(()=>!!document.querySelector('.paymodal'));
 await page.screenshot({path:OUT+'/pay-popup.png'});
 await page.click('.pmx'); await page.waitForTimeout(100);
 T.freeHome=await page.evaluate(()=>({free:!!document.querySelector('.freehero'), chip:!!document.querySelector('.unlockchip'), locks:document.querySelectorAll('#side button.item.locked').length, admin:!!document.querySelector('#side [data-go="admin"]'), title:document.title}));
 await page.screenshot({path:OUT+'/pay-freehome.png', fullPage:true});
 const routeCheck=await page.evaluate(()=>{ const o={}; for (const r of ['projects','lab','insights','resume','applications','proj-dpdp-1','dpdp','role-privacy','learn','pricing','admin','news']){ go(r); const m=document.getElementById('main'); o[r]= m.querySelector('.lockhero:not(.sm)')?'locked': m.querySelector('.lockhero.sm')?'preview': m.querySelector('.plans')?'pricing':'open'; } return o; });
 T.routes=routeCheck;
 await page.evaluate(()=>go('dpdp')); await page.waitForTimeout(100); await page.screenshot({path:OUT+'/pay-topic-preview.png', fullPage:true});
 // AI gated
 await page.evaluate(()=>go('pricing')); await page.waitForTimeout(100); await page.screenshot({path:OUT+'/pay-pricing.png', fullPage:true});
 T.priceText=await page.evaluate(()=>document.querySelector('.plan.best .pricebox').textContent.replace(/\s+/g,' ').trim());
 // checkout
 await page.click('.plan.best [data-paynow]'); await page.waitForTimeout(150);
 await page.click('[data-paymeth="upi"]'); await page.waitForTimeout(600);
 T.qr=await page.evaluate(()=>{ const s=document.querySelector('#upiQr svg'); return s ? s.getAttribute('width') : document.getElementById('upiQr').textContent; });
 T.upi=await page.evaluate(()=>upiLink());
 await page.screenshot({path:OUT+'/pay-upi.png'});
 await page.click('[data-paymeth="card"]'); await page.waitForTimeout(100); T.cardLink=await page.evaluate(()=>document.querySelector('#payBox a.btn').href);
 await page.click('[data-paymeth="upi"]'); await page.waitForTimeout(300);
 await page.click('[data-paystep="confirm"]'); await page.waitForTimeout(100);
 await page.fill('#pcName','Asha Test'); await page.fill('#pcContact','asha@example.com'); await page.fill('#pcRef','4123 4567 8901'); await page.click('[data-paysubmit]'); await page.waitForTimeout(150);
 T.noAgree=await page.evaluate(()=>document.getElementById('pcMsg').textContent);
 await page.check('#pcAgree'); await page.click('[data-paysubmit]'); await page.waitForTimeout(300);
 T.claim=await page.evaluate(()=>__mock.store.get('claims/cust1'));
 T.done=await page.evaluate(()=>document.getElementById('payBox').textContent.slice(0,60));
 await page.screenshot({path:OUT+'/pay-done.png'});
 // owner approves (simulate) -> unlock live
 await page.evaluate(()=>{ __mock.store.set('subs/cust1',{active:true,plan:'full',start:'2026-10-26',until:'2027-10-26',amount:1200,ref:'412345678901'}); __mock.listeners.forEach(l=>{try{l()}catch(e){}}); });
 await page.waitForTimeout(400);
 T.unlocked=await page.evaluate(()=>{ go('projects'); return {access:hasAccess(), locked:!!document.querySelector('.lockhero'), modal:!!document.getElementById('payModal')}; });
 await ctx.close();
 /* ---- phone customer popup ---- */
 ({ctx,page}=await mk(false,'cust2',{width:390,height:844},'dark')); await page.screenshot({path:OUT+'/pay-popup-m.png'}); await page.click('.paymodal [data-paynow]'); await page.waitForTimeout(150); await page.click('[data-paymeth="upi"]'); await page.waitForTimeout(500); await page.screenshot({path:OUT+'/pay-upi-m.png'}); await ctx.close();
 /* ---- owner admin ---- */
 ({ctx,page}=await mk(true,'owner1'));
 T.ownerPopup=await page.evaluate(()=>!!document.getElementById('payModal'));
 await page.evaluate(()=>go('admin')); await page.waitForTimeout(400);
 T.admin=await page.evaluate(()=>({rows:document.querySelectorAll('[data-adapprove]').length, adminMenu:!!document.querySelector('#side [data-go="admin"]')}));
 await page.screenshot({path:OUT+'/pay-admin.png', fullPage:true});
 await page.click('[data-adapprove="cust9"]'); await page.waitForTimeout(400);
 T.approved=await page.evaluate(()=>({sub:__mock.store.get('subs/cust9'), claim:__mock.store.get('claims/cust9').status}));
 await page.fill('#ad-intro','999'); await page.click('[data-adsave]'); await page.waitForTimeout(200); T.cfg=await page.evaluate(()=>__mock.store.get('meta/pay').intro);
 await page.click('[data-adpreview]'); await page.waitForTimeout(500); T.preview=await page.evaluate(()=>({access:hasAccess(), free:!!document.querySelector('.freehero'), bar:!!document.querySelector('.previewbar'), modal:!!document.getElementById('payModal')}));
 await page.evaluate(()=>closePaywall()); await page.click('[data-adexit]'); await page.waitForTimeout(200); T.exit=await page.evaluate(()=>({access:hasAccess(), cur:current}));
 await ctx.close();
 console.log(JSON.stringify(T,null,1)); console.log('ERRORS',JSON.stringify(errs,null,1));
 await browser.close(); })();
