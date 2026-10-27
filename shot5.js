const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP='/tmp/claude-0/-home-claude/bbc92bc2-2460-5c51-8cb3-a5572324ac99/scratchpad', LIB=SP+'/libs';
const libFor=u=>u.includes('pdfjs-dist')?LIB+'/pdfjs-dist-3.11.174/package/build/'+path.basename(u):u.includes('mammoth')?LIB+'/mammoth-1.8.0/package/mammoth.browser.min.js':u.includes('jszip')?LIB+'/jszip-3.10.1/package/dist/jszip.min.js':u.includes('jspdf')?LIB+'/jspdf-2.5.1/package/dist/jspdf.umd.min.js':null;
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext(); await ctx.addInitScript('window.claude={use:async()=>null}');
 await ctx.route('https://cdn.jsdelivr.net/**', r=>{ const f=libFor(r.request().url()); f&&fs.existsSync(f)?r.fulfill({path:f,contentType:'application/javascript'}):r.abort(); });
 const p=await ctx.newPage(); const logs=[]; p.on('pageerror',e=>logs.push(e.message));
 await p.goto('file:///home/claude/grc-hub.html'); await p.waitForTimeout(500); await p.evaluate(()=>go('resume'));
 for (const f of ['test_resume_2col.pdf','test_resume_1col.pdf','test_resume.docx']) { await p.setInputFiles('#rsFile', SP+'/'+f); await p.waitForTimeout(2200);
   const r=await p.evaluate(()=>({meta:S.resume.fileMeta, raw:S.resume.raw, exp:atsFields(S.resume.raw).exp, model:{exp:(S.resume.model&&S.resume.model.exp||[]).map(e=>e.head+' ['+e.bullets.length+']')}}));
   console.log('=== '+f, 'columns', r.meta.columns, 'tables', r.meta.tables); console.log(r.raw.split('\n').slice(0,40).join('\n')); console.log('parsed jobs', JSON.stringify(r.exp)); console.log('builder exp', JSON.stringify(r.model.exp)); }
 console.log('errors', logs); await b.close(); })();
