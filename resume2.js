/* ================= RESUME BUILDER v2: upload → ATS parse → role gaps → export ================= */
const LIBS = {pdf:"https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js", pdfw:"https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js", mammoth:"https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js", jszip:"https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js", jspdf:"https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"};
const libCache = {};
function loadScript(url){ return libCache[url] ||= new Promise((res, rej) => { const s = document.createElement("script"); s.src = url; s.async = true; s.crossOrigin = "anonymous"; s.onload = () => res(); s.onerror = () => { delete libCache[url]; rej(new Error("Couldn't load a file-reading library.")); }; document.head.appendChild(s); }); }
let RS2 = {busy:"", err:"", review:null, reviewing:false, gen:null};

async function extractPdf(buf){
  await loadScript(LIBS.pdfw); await loadScript(LIBS.pdf);
  const lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = LIBS.pdfw;
  const doc = await lib.getDocument({data:new Uint8Array(buf), isEvalSupported:false}).promise;
  const out = [], fonts = new Set(); let sideRows = 0, rowsTotal = 0, images = 0, chars = 0, colPages = 0;
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p), vp = page.getViewport({scale:1}), tc = await page.getTextContent();
    Object.values(tc.styles||{}).forEach(st => st && st.fontFamily && fonts.add(st.fontFamily));
    const items = tc.items.filter(i => i.str && i.str.trim()).map(i => ({s:i.str, x:i.transform[4], y:i.transform[5], w:i.width||0, f:i.fontName}));
    chars += items.reduce((a,i) => a + i.s.length, 0);
    const rows = [];
    items.sort((a,b) => b.y - a.y || a.x - b.x).forEach(it => { const r = rows.find(r => Math.abs(r.y - it.y) < 3); r ? r.items.push(it) : rows.push({y:it.y, items:[it]}); });
    const W = vp.width, lineOf = its => { let line = "", prevEnd = null; its.forEach(it => { if (prevEnd !== null) { const gap = it.x - prevEnd; if (gap > 1.5) line += gap > W * 0.18 ? "    " : " "; } line += it.s; prevEnd = it.x + it.w; }); return line.replace(/\s+$/,""); };
    const starts = [];
    rows.forEach(r => { r.items.sort((a,b) => a.x - b.x); for (let k = 1; k < r.items.length; k++) { const gap = r.items[k].x - (r.items[k-1].x + r.items[k-1].w); if (gap > W * 0.18) { starts.push(r.items[k].x); if (r.items[0].x < W * 0.3) sideRows++; break; } } rowsTotal++; });
    starts.sort((a,b) => a - b); const med = starts.length ? starts[Math.floor(starts.length / 2)] : 0, splitX = med - 4;
    const clustered = starts.filter(x => Math.abs(x - med) < 10).length >= starts.length * 0.7, rightOnly = rows.filter(r => r.items.every(it => it.x >= splitX)).length;
    if (rows.length > 6 && starts.length / rows.length > 0.22 && clustered && rightOnly >= Math.max(2, rows.length * 0.08)) {
      /* two columns: read the left column top to bottom, then the right one (rows spanning both stay in place) */
      const top = [], left = [], right = []; let started = false;
      rows.forEach(r => { const L = r.items.filter(it => it.x < splitX), R = r.items.filter(it => it.x >= splitX);
        if (L.some(it => it.x + it.w > splitX + 4)) { (started ? left : top).push(lineOf(r.items)); return; }
        if (!started && !R.length) { top.push(lineOf(L)); return; }
        if (R.length) started = true; if (L.length) left.push(lineOf(L)); if (R.length) right.push(lineOf(R)); });
      colPages++;
      out.push(...top, ...left, "", ...right);
    } else rows.forEach(r => out.push(lineOf(r.items)));
    out.push("");
    try { const ops = await page.getOperatorList(); images += ops.fnArray.filter(f => f === lib.OPS.paintImageXObject || f === lib.OPS.paintJpegXObject).length; } catch(e) {}
  }
  return {text:out.join("\n").replace(/\n{3,}/g,"\n\n").trim(), pages:doc.numPages, columns: colPages > 0, images, fonts:[...fonts], scanned: chars < 150, tables:0, textboxes:0, headerContact:false};
}
async function extractDocx(buf){
  await loadScript(LIBS.mammoth); await loadScript(LIBS.jszip);
  const raw = (await window.mammoth.extractRawText({arrayBuffer:buf})).value || "";
  const html = (await window.mammoth.convertToHtml({arrayBuffer:buf})).value || "";
  const zip = await window.JSZip.loadAsync(buf); let headerText = "", docXml = "";
  for (const name of Object.keys(zip.files)) { if (/^word\/(header|footer)\d*\.xml$/.test(name)) headerText += " " + (await zip.files[name].async("string")).replace(/<[^>]+>/g," "); if (name === "word/document.xml") docXml = await zip.files[name].async("string"); }
  const contactRe = /[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s-]{9,}/;
  let text = raw; try { const t2 = docxHtmlText(html); if (t2.replace(/\s/g,"").length >= raw.replace(/\s/g,"").length * 0.8) text = t2; } catch(e) {}
  return {text:text.replace(/\n{3,}/g,"\n\n").trim(), pages:Math.max(1, Math.round(raw.split(/\s+/).length / 480)), columns:/<w:cols [^>]*w:num="[2-9]"/.test(docXml), images:(html.match(/<img/g)||[]).length, tables:(html.match(/<table/g)||[]).length, textboxes:(docXml.match(/<w:txbxContent/g)||[]).length, headerContact: contactRe.test(headerText), headerOnly: contactRe.test(headerText) && !contactRe.test(raw), fonts:[], scanned: raw.trim().length < 150};
}
function docxHtmlText(html){
  /* keep bullets and table rows that mammoth's raw text flattens */
  const doc = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html"), out = [];
  const walk = el => { for (const n of [...el.children]) { const tag = n.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") { [...n.children].forEach(li => { const t = [...li.childNodes].filter(c => !(c.nodeType === 1 && /^(ul|ol)$/i.test(c.tagName))).map(c => c.textContent).join("").trim(); if (t) out.push("• " + t); [...li.children].filter(c => /^(ul|ol)$/i.test(c.tagName)).forEach(sub => walk({children:[sub]})); }); }
    else if (tag === "table") n.querySelectorAll("tr").forEach(tr => { const cells = [...tr.children].map(td => td.textContent.trim()).filter(Boolean); if (cells.length) out.push(cells.join(" | ")); });
    else if (/^(p|h[1-6])$/.test(tag)) out.push(n.textContent.trim());
    else walk(n); } };
  walk(doc.body.firstChild); return out.join("\n");
}
async function readResumeFile(file){
  const name = file.name || "resume", ext = (name.split(".").pop()||"").toLowerCase(), buf = await file.arrayBuffer();
  let r;
  if (ext === "pdf") r = await extractPdf(buf);
  else if (ext === "docx") r = await extractDocx(buf);
  else if (ext === "txt" || ext === "md") r = {text:new TextDecoder().decode(buf), pages:1, columns:false, images:0, tables:0, textboxes:0, headerContact:false, fonts:[], scanned:false};
  else if (ext === "doc") throw new Error("Old .doc files can't be read here. Save it as .docx or PDF and upload again.");
  else throw new Error("Upload a PDF, DOCX or TXT file.");
  return Object.assign(r, {name, ext, size:file.size, words:r.text.split(/\s+/).filter(Boolean).length});
}

/* ---------- ATS-style parse ---------- */
const CITY_RE = /\b(Delhi|New Delhi|Noida|Gurugram|Gurgaon|Ghaziabad|Faridabad|Mumbai|Pune|Bengaluru|Bangalore|Hyderabad|Chennai|Kolkata|Ahmedabad|Jaipur|Chandigarh|Lucknow|Indore|Kochi|Thane|Navi Mumbai|Remote)\b/i;
const DATE_RANGE = /\b((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*(–|-|—|to)\s*((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|present|current|now|till date)\b/i;
function atsFields(raw){
  const M = parseResume(raw), lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const email = (raw.match(/[\w.+-]+@[\w-]+\.[\w.]+/)||[""])[0], phone = (raw.match(/(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/)||raw.match(/\+?\d[\d\s-]{9,}\d/)||[""])[0].trim();
  const li = (raw.match(/linkedin\.com\/in\/[\w-]+/i)||[""])[0], city = (raw.match(CITY_RE)||[""])[0];
  const exp = M.exp.map(e => { const dm = (e.head||"").match(DATE_RANGE); const parts = (e.head||"").replace(DATE_RANGE, " ").split(/\s*[|,–—]\s*|\s{3,}/).map(x => x.trim()).filter(Boolean); return {head:e.head, title:parts[0]||"", company:parts[1]||"", dates: dm ? dm[0] : "", bullets:e.bullets.length}; });
  const fields = [
    ["Name", M.name && M.name.split(/\s+/).length <= 5 && !/@|\d/.test(M.name) ? M.name : "", "Put your full name alone on the first line."],
    ["Email", email, "Add your email in the body text (not a header or image)."],
    ["Phone", phone, "Add a 10-digit mobile number with +91 in the body."],
    ["LinkedIn", li, "Add linkedin.com/in/your-name."],
    ["Location", city, "Add your city (e.g. Ghaziabad, Delhi NCR)."],
    ["Headline / title", M.title, "Add a target title line under your name (e.g. Privacy & GRC Analyst)."],
    ["Summary", M.summary ? M.summary.slice(0,90) + (M.summary.length>90?"…":"") : "", "Add a 3–4 line professional summary under a 'Summary' heading."],
    ["Skills", M.skills.length ? M.skills.length + " lines" : "", "Add a 'Skills' section with keywords from job posts."],
    ["Experience entries", M.exp.length ? M.exp.length + " found" : "", "Use a standard 'Experience' heading with one entry per job."],
    ["Dates on each job", exp.length && exp.every(e => e.dates) ? "all parsed" : exp.length ? exp.filter(e=>e.dates).length + "/" + exp.length + " parsed" : "", "Write dates as 'Sep 2025 – May 2026' on the job's heading line."],
    ["Education", M.education.length ? M.education.length + " lines" : "", "Add an 'Education' section."],
    ["Certifications", M.certs.length ? M.certs.length + " found" : "", "Add a 'Certifications' section."],
    ["Projects", M.projects.length ? M.projects.length + " found" : "", "Add a 'Projects' section; for freshers it's often the strongest proof."]
  ];
  return {M, fields, exp, email, phone, li, city};
}
function roleFit(raw, rid){
  const req = ROLE_REQ[rid] || [], t = raw.toLowerCase();
  const rows = req.map(([label, kws, how, must]) => ({label, how, must, found: kws.some(k => hasTerm(t, k.toLowerCase()))}));
  const tot = rows.reduce((a,r) => a + (r.must?2:1), 0), got = rows.reduce((a,r) => a + (r.found ? (r.must?2:1) : 0), 0);
  return {rows, pct: tot ? Math.round(got/tot*100) : 0};
}
function formatIssues(meta, raw){
  const F = [];
  if (!meta) return F;
  if (meta.scanned) F.push(["hi","No readable text found: this looks like a scanned or image PDF. ATS software can't read it. Export a text-based PDF or DOCX."]);
  if (meta.columns) F.push(["hi","Two-column layout detected. Many ATS read across both columns and scramble your sections. Use one column."]);
  if (meta.tables) F.push(["hi",`${meta.tables} table(s) found. Tables often scramble or disappear in parsing. Use plain lines.`]);
  if (meta.textboxes) F.push(["hi",`${meta.textboxes} text box(es) found. Text boxes are skipped by many parsers.`]);
  if (meta.headerOnly) F.push(["hi","Your contact details are only in the page header/footer. Several ATS ignore headers; put them in the body."]);
  else if (meta.headerContact) F.push(["md","Contact details also appear in the page header. Keep a copy in the body text."]);
  if (meta.images) F.push(["md",`${meta.images} image(s) or graphic(s) found (photo, icons, logos). Remove them; Indian ATS don't need a photo.`]);
  if (meta.fonts && meta.fonts.length > 3) F.push(["md",`${meta.fonts.length} font families used. Stick to one (Calibri or Arial).`]);
  if (meta.pages > 2) F.push(["md",`${meta.pages} pages. Keep to 1–2 pages at your level.`]);
  if (meta.ext === "pdf") F.push(["ok","PDF is fine for most portals; keep a DOCX for Naukri and older ATS."]);
  if (meta.name && !/resume|cv/i.test(meta.name)) F.push(["md",`File name "${meta.name}". Use Firstname_Lastname_Resume_Role.pdf so recruiters can find it.`]);
  if (/[★☆✓✔●◆■▶➤⭐📧📞🔗]/u.test(raw)) F.push(["md","Icon characters found (📞 ✉ ★). Replace with plain words like 'Phone:'."]);
  return F;
}
function bestRoles(raw){ return ROLES.filter(r => ROLE_REQ[r.id]).map(r => ({r, pct: roleFit(raw, r.id).pct})).sort((a,b) => b.pct - a.pct); }
function topFixes(A, fit, fmt, rid){
  const out = [];
  fmt.filter(f => f[0] === "hi").forEach(f => out.push(["Format", f[1]]));
  fit.rows.filter(r => r.must && !r.found).forEach(r => out.push(["Role gap", `Employers hiring a ${roleShort(rid)} ask for "${r.label}". It's not on your resume.` , r.how]));
  A.flags.filter(f => f[0] === "hi" && !/keywords/i.test(f[1])).forEach(f => out.push(["Content", f[1]]));
  A.flags.filter(f => f[0] === "md").slice(0,4).forEach(f => out.push(["Polish", f[1]]));
  return out.slice(0, 10);
}

/* ---------- view ---------- */
function viewResume2(){
  const r = S.resume, meta = r.fileMeta || null, rid = (r.role && ROLE[r.role]) ? r.role : (focusRole() || "privacy");
  const hasText = !!(r.raw && r.raw.trim());
  const A = hasText ? analyse(r.raw, r.jd||"", rid) : null, F = hasText ? atsFields(r.raw) : null, fit = hasText ? roleFit(r.raw, rid) : null, fmt = hasText ? formatIssues(meta, r.raw) : [];
  const parsed = F ? F.fields.filter(f => f[1]).length : 0, parseScore = F ? Math.round(parsed / F.fields.length * 100) - fmt.filter(f=>f[0]==="hi").length*12 : 0;
  const atsScore = A ? Math.max(0, Math.min(100, Math.round(A.score*0.6 + Math.max(0,parseScore)*0.4))) : 0;
  const best = hasText ? bestRoles(r.raw).slice(0,6) : [], fixes = hasText ? topFixes(A, fit, fmt, rid) : [];
  const howLink = h => !h ? "" : h.startsWith("cert:") ? (CERT[h.slice(5)] ? `<button class="link" data-go="cert-${h.slice(5)}">Get: ${esc(shortCert(CERT[h.slice(5)]))}</button>` : "") : (TOPIC[h] ? `<button class="link" data-go="${h}">Learn: ${esc(TOPIC[h].title.replace(/ \(.*\)/,""))}</button>${typeof ladderCurrent==="function"&&ladderCurrent(h)?` <button class="link" data-go="proj-${ladderCurrent(h).id}">Prove it: project</button>`:""}` : "");
  return `<div><span class="eyebrow">Resume builder</span><h2>Upload, see what the ATS sees, fix, export</h2></div>
  <p class="lede">Upload your resume first. The checker reads it the way applicant tracking systems do (Workday, SuccessFactors, Taleo, Greenhouse, Naukri's parser): plain text, top to bottom, field by field. Then it compares it with what employers ask for in your target role, and the builder exports a clean single-column file those systems parse reliably.</p>
  <div class="card upcard"><div class="row between"><div><span class="eyebrow">Step 1</span><h3>Upload your resume</h3></div>${meta?`<span class="pill ok">${esc(meta.name)} · ${esc(meta.ext.toUpperCase())} · ${meta.pages} page${meta.pages>1?"s":""} · ${meta.words} words</span>`:""}</div>
    <label class="drop" for="rsFile"><input type="file" id="rsFile" accept=".pdf,.docx,.txt" hidden><span class="dropi">⇪</span><b>${RS2.busy||"Choose a PDF, DOCX or TXT file"}</b><span class="num">Read in your browser; the file itself isn't uploaded anywhere.</span></label>
    ${RS2.err?`<div class="note">${esc(RS2.err)}</div>`:""}
    <details ${!meta&&hasText?"open":""}><summary class="link" style="cursor:pointer">Or paste the text instead</summary><textarea id="rsRaw" style="min-height:180px;margin-top:8px" placeholder="Paste the full text of your resume">${esc(r.raw)}</textarea>
      <div class="row"><button class="btn sm" id="rsRun">Check pasted text</button><button class="btn ghost sm" id="rsSample">Load my current draft</button></div></details></div>
  ${linCard()}
  <div class="card"><span class="eyebrow">Step 2</span><h3>Which role are you applying for?</h3>
    <div class="rolechips">${[...new Set([rid, focusRole(), ...(S.profile.targets||[])].filter(x=>ROLE[x]))].map(id=>`<button class="rchip ${id===rid?"on":""}" data-rsrole="${id}">${esc(roleShort(id))}</button>`).join("")}
      <select id="rsRole" aria-label="All roles">${ROLES.map(x=>`<option value="${x.id}" ${x.id===rid?"selected":""}>${esc(x.name)}</option>`).join("")}</select></div>
    <details ${r.jd?"open":""}><summary class="link" style="cursor:pointer">Add a job description for exact keyword matching (optional)</summary><textarea id="rsJd" style="min-height:140px;margin-top:8px" placeholder="Paste the job posting">${esc(r.jd)}</textarea><button class="btn sm" id="rsRun2">Re-check with this job</button></details></div>
  ${hasText ? `
  <div class="card"><div class="score">${ring(atsScore, atsScore>=75?"":"acc")}<div style="display:grid;gap:4px"><h3>ATS readiness ${atsScore}/100</h3><span class="muted" style="font-size:.9rem">${atsScore>=80?"Parses cleanly. Now tailor keywords for each job.":atsScore>=60?"Mostly readable; fix the red items first.":"Likely to lose information in parsing. Fix the format issues below before applying."}</span></div>
    <div class="score">${ring(fit.pct,"acc")}<div style="display:grid;gap:4px"><h3>${esc(roleShort(rid))} fit ${fit.pct}%</h3><span class="muted" style="font-size:.9rem">Share of what employers ask for that your resume already shows.</span></div></div></div>
    <div class="grid4">${[["Parsing & structure",A.parts.parse],["Keyword match",A.parts.keywords],["Impact (numbers, verbs)",A.parts.impact],["Clarity",A.parts.clarity]].map(([l,v])=>`<div class="inset tile"><span class="lbl">${l}</span><span class="big">${v}</span>${bar(v,v>=70?"":"acc")}</div>`).join("")}</div></div>
  <div class="card"><h3>Top fixes, in order</h3>${fixes.length?`<ol class="fixlist">${fixes.map(([k,t,h])=>`<li><span class="pill ${k==="Format"||k==="Role gap"?"hot":k==="Content"?"warn":""}">${k}</span> ${esc(t)} ${h?howLink(h):""}</li>`).join("")}</ol>`:`<p class="muted">Nothing urgent. Tailor to each job description.</p>`}</div>
  <div class="grid2">
    <div class="card"><h3>What the ATS sees</h3><p class="muted" style="font-size:.88rem">Fields a parser tries to fill from your file. Empty fields usually mean the recruiter's database shows a blank.</p>
      <div class="tbl"><table><tbody>${F.fields.map(([l,v,fix])=>`<tr><th style="text-transform:none;color:var(--ink);font-size:.86rem">${l}</th><td>${v?`<span class="pill ok">✓</span> ${esc(String(v).slice(0,80))}`:`<span class="pill bad">missing</span> <span class="num">${esc(fix)}</span>`}</td></tr>`).join("")}</tbody></table></div>
      ${F.exp.length?`<b style="font-size:.88rem">Jobs as parsed</b>${F.exp.map(e=>`<div class="num">• ${esc(e.title||"?")} — ${esc(e.company||"?")} — ${esc(e.dates||"no dates found")} — ${e.bullets} bullets</div>`).join("")}`:""}</div>
    <div class="card"><h3>File format check</h3>${fmt.length?fmt.map(([s,t])=>`<div class="flag"><b class="sev ${s}">${s==="hi"?"Fix":s==="md"?"Improve":"Good"}</b><span>${esc(t)}</span></div>`).join(""):`<p class="muted">${meta?"No format problems found.":"Upload the file itself to check layout, tables, headers and images."}</p>`}</div></div>
  <div class="grid2">
    <div class="card"><h3>What employers ask a ${esc(roleShort(rid))} for</h3>${fit.rows.map(x=>`<div class="reqrow"><span class="pill ${x.must?"hot":""}">${x.must?"Must":"Plus"}</span><span style="flex:1;min-width:0">${esc(x.label)} ${x.found?'<span class="pill ok">shown</span>':'<span class="pill bad">not shown</span>'}</span><span class="num">${x.found?"":howLink(x.how)}</span></div>`).join("")}
      <p class="num" style="margin-top:8px">Only add what you genuinely have. For gaps, learn the subject and do the project, then add the project to your resume.</p></div>
    <div class="card"><h3>Roles this resume fits best right now</h3>${best.map(x=>`<div class="rrow"><div style="min-width:0"><button class="link" data-rsrole="${x.r.id}" style="font-weight:600;text-decoration:none;color:var(--ink)">${esc(x.r.name)}</button>${bar(x.pct,"acc")}</div><span class="num">${x.pct}%</span></div>`).join("")}
      <div class="grid2" style="margin-top:8px"><div><b style="font-size:.86rem">Keywords found</b><div class="kw">${A.kwHit.map(k=>`<span class="pill ok">${esc(k)}</span>`).join("")||'<span class="muted">None</span>'}</div></div><div><b style="font-size:.86rem">Keywords missing</b><div class="kw">${A.kwMiss.map(k=>`<span class="pill bad">${esc(k)}</span>`).join("")||'<span class="muted">None</span>'}</div></div></div></div></div>
  <div class="card"><div class="row between"><h3>Recruiter-style review by Claude</h3><button class="btn" id="rsAI" ${RS2.reviewing?"disabled":""}>${RS2.reviewing?"Reviewing…":r.review?"Review again":"Review for "+esc(roleShort(rid))}</button></div>
    ${r.review?reviewHTML(r.review):`<p class="muted" style="font-size:.9rem">Claude reads your resume as an Indian recruiter for this role would: verdict, strengths, gaps with fixes, rewritten summary and bullets (without inventing anything), and what interviewers will probe.</p>`}</div>
  <div class="card"><span class="eyebrow">Step 3</span><div class="row between"><h3>Build the ATS-safe version</h3>${r.model?"":`<button class="btn" id="rsBuild">Send to builder</button>`}</div>
    ${r.model?`<p class="muted" style="font-size:.9rem">Edit below. Downloads use one column, standard headings, plain bullets, one font, and contact details in the body, so the recruiter's database fills every field.</p>
      <div class="row"><button class="btn" data-rsdl="docx">Download DOCX</button><button class="btn" data-rsdl="pdf">Download PDF</button><button class="btn ghost" data-rsdl="txt">Download TXT</button><button class="btn ghost" data-rsdl="check">Parse-check the new version</button><button class="btn ghost" data-go="cover">Write a cover letter</button></div>
      ${RS2.gen?`<div class="info">${esc(RS2.gen)}</div>`:""}`:`<p class="muted">Send your resume to the builder to edit it section by section and download a clean version.</p>`}</div>
  ${r.model?resumeEditor(r.model):""}` : `<div class="card"><p class="muted">Upload a file (or paste text) to see the ATS view, role gaps and fixes.</p></div>`}
  <div class="card"><h3>How applicant tracking systems read resumes</h3><div class="grid2"><ul class="clean"><li>One column, top to bottom; no tables, text boxes or graphics.</li><li>Standard headings: Summary, Skills, Experience, Projects, Education, Certifications.</li><li>Contact details in the body text, not the page header.</li><li>Dates on the job line in one format: 'Sep 2025 – May 2026'.</li><li>Use the job post's exact words ("ISO/IEC 27001", "DPIA", "KYC").</li></ul>
    <ul class="clean"><li><b>DOCX</b> for Naukri and older portals; text-based <b>PDF</b> elsewhere.</li><li>Know the system from the apply link: myworkdayjobs.com = Workday, successfactors = SAP SuccessFactors, taleo.net = Taleo, greenhouse.io = Greenhouse, lever.co = Lever.</li><li>Recruiters search databases by keywords and filters (location, notice period, skills); keep your Naukri profile's skills in sync.</li><li>No photo, date of birth or marital status needed.</li></ul></div></div>`;
}
function reviewHTML(v){
  if (!v || typeof v !== "object") return "";
  return `<div style="display:grid;gap:10px">${v.verdict?`<div class="info"><b>Verdict:</b> ${esc(v.verdict)}</div>`:""}
    ${Array.isArray(v.strengths)&&v.strengths.length?`<div><b style="font-size:.9rem">Strengths</b><ul class="clean">${v.strengths.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`:""}
    ${Array.isArray(v.gaps)&&v.gaps.length?`<div><b style="font-size:.9rem">Gaps and how to fix them</b>${v.gaps.map(g=>`<div class="flag"><b class="sev hi">Gap</b><span>${esc(g.gap||"")}${g.fix?`<br><span class="muted">Fix: ${esc(g.fix)}</span>`:""}</span></div>`).join("")}</div>`:""}
    ${v.summary?`<div><b style="font-size:.9rem">Suggested summary</b><div class="inset">${esc(v.summary)}</div><button class="btn sm ghost" data-copystr="${esc(v.summary)}">Copy</button></div>`:""}
    ${Array.isArray(v.bullets)&&v.bullets.length?`<div><b style="font-size:.9rem">Bullet rewrites</b>${v.bullets.map(b=>`<div class="inset"><div class="num">Before: ${esc(b.before||"")}</div><div>After: ${esc(b.after||"")}</div></div>`).join("")}</div>`:""}
    ${Array.isArray(v.probe)&&v.probe.length?`<div><b style="font-size:.9rem">What interviewers will probe</b><ul class="clean">${v.probe.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`:""}</div>`;
}
async function aiResumeReview(){
  const r = S.resume, rid = (r.role && ROLE[r.role]) ? r.role : (focusRole() || "privacy");
  if (!cap.sample) { toast("Claude isn't available in this view."); return; }
  RS2.reviewing = true; rerender();
  const req = (ROLE_REQ[rid]||[]).map(x => (x[3]?"MUST: ":"PLUS: ") + x[0]).join("\n");
  try {
    const v = await cap.sample.json(`You are a senior Indian recruiter screening resumes for: ${ROLE[rid].name}. Review the resume below honestly and kindly. Do NOT invent experience, employers, numbers, tools or certifications; rewrites may only rephrase facts already present (use [number] placeholders where a metric would help).

WHAT EMPLOYERS ASK FOR IN THIS ROLE
${req}
${r.jd ? "JOB DESCRIPTION:\n" + r.jd.slice(0,5000) : ""}

RESUME
${r.raw.slice(0,14000)}

Reply with only JSON: {"verdict":"2 sentences: shortlist likelihood and the main reason","strengths":["3 short points"],"gaps":[{"gap":"what's missing or weak","fix":"concrete fix: learn/do/add"}],"summary":"a rewritten 3-4 line professional summary using only facts from the resume","bullets":[{"before":"an existing weak bullet","after":"rewrite: action verb + what + law/tool + result"}],"probe":["3 things interviewers will ask about"]} with 3-6 gaps and 2-4 bullets.`, {cache:false});
    r.review = v; save("resume");
  } catch(e) { toast(e.code === "invalid_json" ? "The review didn't come back in a readable form; try again." : aiErr(e)); }
  RS2.reviewing = false; rerender();
}

/* ---------- export ---------- */
const xmlEsc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function resumeLines(M){
  const L = [], H = h => L.push({k:"h", t:h.toUpperCase()});
  L.push({k:"name", t:M.name||S.profile.name||""}); if (M.title) L.push({k:"title", t:M.title}); if (M.contact) L.push({k:"contact", t:M.contact});
  if (M.summary) { H("Professional Summary"); L.push({k:"p", t:M.summary}); }
  if (M.skills.length) { H("Skills"); M.skills.forEach(s => L.push({k:"p", t:s})); }
  if (M.exp.length) { H("Professional Experience"); M.exp.forEach(e => { L.push({k:"eh", t:e.head}); e.bullets.forEach(b => L.push({k:"b", t:b})); }); }
  if (M.projects.length) { H("Projects"); M.projects.forEach(e => { L.push({k:"eh", t:e.head}); e.bullets.forEach(b => L.push({k:"b", t:b})); }); }
  if (M.education.length) { H("Education"); M.education.forEach(s => L.push({k:"p", t:s})); }
  if (M.certs.length) { H("Certifications"); M.certs.forEach(s => L.push({k:"b", t:s})); }
  if (M.other.length) { H("Additional Information"); M.other.forEach(s => L.push({k:"b", t:s})); }
  return L;
}
async function buildDocx(M){
  await loadScript(LIBS.jszip);
  const run = (t, o={}) => `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>${o.b?"<w:b/>":""}<w:sz w:val="${o.sz||21}"/></w:rPr><w:t xml:space="preserve">${xmlEsc(t)}</w:t></w:r>`;
  const para = (inner, o={}) => `<w:p><w:pPr><w:spacing w:before="${o.before||0}" w:after="${o.after||40}"/>${o.ind?'<w:ind w:left="284" w:hanging="284"/>':""}${o.center?'<w:jc w:val="center"/>':""}${o.border?'<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr>':""}</w:pPr>${inner}</w:p>`;
  const body = resumeLines(M).map(l => l.k==="name" ? para(run(l.t,{b:1,sz:32}),{after:40}) : l.k==="title" ? para(run(l.t,{sz:22}),{after:20}) : l.k==="contact" ? para(run(l.t,{sz:20}),{after:120}) : l.k==="h" ? para(run(l.t,{b:1,sz:22}),{before:160,after:60,border:1}) : l.k==="eh" ? para(run(l.t,{b:1}),{before:80,after:30}) : l.k==="b" ? para(run("• " + l.t),{ind:1,after:30}) : para(run(l.t),{after:40})).join("");
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900" w:header="400" w:footer="400" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const zip = new window.JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file("docProps/core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEsc((M.name||"")+" Resume")}</dc:title><dc:creator>${xmlEsc(M.name||"")}</dc:creator></cp:coreProperties>`);
  zip.file("word/document.xml", doc);
  return zip.generateAsync({type:"blob", mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
async function buildPdf(M){
  await loadScript(LIBS.jspdf);
  const {jsPDF} = window.jspdf, pdf = new jsPDF({unit:"pt", format:"a4"}), W = 595, margin = 48, maxW = W - margin*2; let y = margin;
  const clean = s => String(s||"").replace(/₹/g,"Rs. ").replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/[–—]/g,"-").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF•]/g,"");
  const write = (t, size, bold, indent=0, gap=3) => { pdf.setFont("helvetica", bold?"bold":"normal"); pdf.setFontSize(size); const lines = pdf.splitTextToSize(clean(t), maxW - indent); lines.forEach(line => { if (y > 842 - margin) { pdf.addPage(); y = margin; } pdf.text(line, margin + indent, y); y += size * 1.25; }); y += gap; };
  pdf.setProperties({title:(M.name||"")+" Resume", author:M.name||""});
  resumeLines(M).forEach(l => { if (l.k==="name") write(l.t, 18, true, 0, 2); else if (l.k==="title") write(l.t, 11, false, 0, 1); else if (l.k==="contact") write(l.t, 10, false, 0, 8); else if (l.k==="h") { y += 6; write(l.t, 11, true, 0, 0); pdf.setDrawColor(150); pdf.line(margin, y - 8, W - margin, y - 8); y += 4; } else if (l.k==="eh") write(l.t, 10.5, true, 0, 1); else if (l.k==="b") write("• " + l.t, 10.5, false, 10, 1); else write(l.t, 10.5, false, 0, 2); });
  return pdf.output("blob");
}
async function downloadResume(kind){
  const M = S.resume.model; if (!M) return;
  if (kind === "check") { const t = modelToText(M), F = atsFields(t), n = F.fields.filter(f=>f[1]).length; RS2.gen = `Parse check of the builder version: ${n}/${F.fields.length} fields found${n===F.fields.length?" — every field parses.":". Missing: " + F.fields.filter(f=>!f[1]).map(f=>f[0]).join(", ")}`; rerender(); return; }
  const base = ((M.name||S.profile.name||"Resume").trim().replace(/\s+/g,"_").replace(/[^\w]/g,"") || "Resume") + "_Resume" + (S.resume.role && ROLE[S.resume.role] ? "_" + roleShort(S.resume.role).replace(/[^\w]+/g,"_").replace(/_+$/,"") : "");
  RS2.gen = "Preparing your file…"; rerender();
  try {
    const data = kind === "docx" ? await buildDocx(M) : kind === "pdf" ? await buildPdf(M) : modelToText(M);
    const dl = await claude.use("downloads").catch(() => null);
    if (!dl) { RS2.gen = "Downloads aren't available in this view. Use Copy text in the ATS-ready output below and paste into Word."; rerender(); return; }
    const res = await dl.save({filename: base + "." + kind, data});
    RS2.gen = res && res.status === "saved" ? `Saved ${base}.${kind}. Name it the same way when you apply.` : "File handed over.";
  } catch(e) { RS2.gen = e && e.code === "declined" ? "Download cancelled." : e && e.code === "rate_limited" ? "A download prompt is already open." : "Couldn't create the file: " + (e && e.message ? e.message : "unknown error") + ". Copy the text below instead."; }
  rerender();
}

/* ---------- events ---------- */
document.addEventListener("change", async e => {
  if (e.target.id !== "rsFile") return;
  const f = e.target.files && e.target.files[0]; if (!f) return;
  RS2.err = ""; RS2.busy = "Reading " + f.name + "…"; rerender();
  try { const x = await readResumeFile(f);
    S.resume.raw = x.text; S.resume.fileMeta = {name:x.name, ext:x.ext, pages:x.pages, words:x.words, columns:x.columns, tables:x.tables, images:x.images, textboxes:x.textboxes, headerContact:x.headerContact, headerOnly:!!x.headerOnly, fonts:x.fonts.slice(0,8), scanned:x.scanned};
    S.resume.model = parseResume(x.text); S.resume.review = null; RA = null;
    const A = analyse(x.text, S.resume.jd||"", S.resume.role||focusRole()||"privacy"); S.resume.last = {score:A.score, date:today()};
    save("resume"); logActivity(1); save("progress");
  } catch(err) { RS2.err = err && err.message ? err.message : "Couldn't read that file."; }
  RS2.busy = ""; rerender();
});
document.addEventListener("click", e => {
  const el = e.target.closest("[data-rsrole],[data-rsdl],#rsAI,#rsRun2"); if (!el) return;
  if (el.dataset.rsrole) { S.resume.role = el.dataset.rsrole; S.resume.review = null; save("resume"); if (current !== "resume") return; rerender(); return; }
  if (el.dataset.rsdl) { downloadResume(el.dataset.rsdl); return; }
  if (el.id === "rsAI") { aiResumeReview(); return; }
  if (el.id === "rsRun2") { if (S.resume.raw) { const A = analyse(S.resume.raw, S.resume.jd||"", S.resume.role||"privacy"); S.resume.last = {score:A.score, date:today()}; save("resume"); } rerender(); return; }
});
