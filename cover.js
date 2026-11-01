/* ================= COVER LETTER BUILDER =================
   Writes a cover letter instantly from the resume (the builder's model) and the job description.
   It uses only text that is already in the resume: the summary's first sentence, the experience and
   project bullets that match the job's keywords, and the certifications the job names. No AI call, no
   invented facts. Everything stays editable. Saved with the resume (S.resume.cover). */

const clFirst = s => { const m = String(s || "").trim().match(/^.*?[.!?](\s|$)/); return (m ? m[0] : String(s || "")).trim(); };
const clSentence = b => { const t = String(b || "").trim().replace(/[.;:]+$/, ""); return (t.charAt(0).toLowerCase() + t.slice(1)) + "."; };
function clModel(){ return S.resume.model || (S.resume.raw && S.resume.raw.trim() ? parseResume(S.resume.raw) : null); }
function clRoleDefault(){ return ROLE[S.resume.role] ? ROLE[S.resume.role].name : ""; }

/* What the letter draws on, from the resume and the job description. */
function clAnalyse(M, jd){
  const resumeText = modelToText(M).toLowerCase();
  const terms = jd ? jdTerms(jd) : [];
  const matched = terms.filter(k => hasTerm(resumeText, k.toLowerCase()));
  const missing = terms.filter(k => !matched.includes(k));
  const scored = [];
  [...M.exp.map(e => [e, "exp"]), ...M.projects.map(e => [e, "proj"])].forEach(([e, kind]) => e.bullets.forEach(b => {
    const sc = matched.filter(k => hasTerm(b.toLowerCase(), k.toLowerCase())).length;
    scored.push({b, head: e.head || "", sc, kind});
  }));
  scored.sort((a, b) => b.sc - a.sc);
  return {matched, missing, picks: scored.slice(0, 2)};
}

function clWrite(){
  const c = S.resume.cover || {}, M = clModel(); if (!M) return "";
  const jd = (S.resume.jd || "").trim(), A = clAnalyse(M, jd);
  const role = (c.role !== undefined ? c.role : clRoleDefault()).trim() || "[Role title]";
  const company = (c.company || "").trim();
  const co = company || "[Company name]";
  const who = (M.name || "").trim() || "[Your name]";
  const contact = (M.contact || "").split("|")[0].trim();
  const date = new Date().toLocaleDateString("en-IN", {day: "numeric", month: "long", year: "numeric"});
  const paras = [];
  paras.push(`I am writing to apply for the ${role} position at ${co}.`);
  if (M.summary) paras.push(clFirst(M.summary));
  if (A.picks.length) {
    const p = A.picks.map(x => {
      const parts = x.head.split("|").map(s => s.trim());
      const title = parts[0] || "", org = x.kind === "proj" ? "" : (parts[1] || "");
      if (x.kind === "proj") return `In the ${title || "project"} I ${clSentence(x.b)}`;
      const where = org ? `At ${org}${title ? ", as " + title : ""}, I` : (title ? `As ${title}, I` : "I");
      return `${where} ${clSentence(x.b)}`;
    });
    paras.push(p.join(" "));
  }
  if (A.matched.length) paras.push(`My background already covers several areas in your posting, including ${A.matched.slice(0, 6).join(", ")}.`);
  const jdLow = jd.toLowerCase();
  const cert = (M.certs || []).find(x => x.split(/[^A-Za-z0-9]+/).some(w => w.length > 3 && jdLow.includes(w.toLowerCase())));
  if (cert) paras.push(`I have also completed ${cert.replace(/\s*\([^)]*\)\s*$/, "").trim()}, which is relevant to this role.`);
  if ((c.why || "").trim()) paras.push(c.why.trim());
  paras.push(`I would welcome the chance to discuss how I can contribute${company ? " to " + company : ""}. Thank you for considering my application.`);
  const salute = company ? `Dear ${company} Hiring Team,` : "Dear Hiring Manager,";
  return [date, "", salute, "", ...paras.map(p => p + "\n"), "Yours sincerely,", who + (contact ? "\n" + contact : "")].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function viewCover(){
  const c = S.resume.cover || {}, M = clModel(), text = c.text || "";
  const A = M && S.resume.jd ? clAnalyse(M, S.resume.jd.trim()) : null;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const warn = [];
  if (text && /\[[^\]]*\]/.test(text)) warn.push("Fill in the square-bracket spaces before you send it.");
  if (text && !(S.resume.jd || "").trim()) warn.push("Paste the job description so the letter can match its wording.");
  if (text && A && !A.picks.length) warn.push("Your resume has no bullets to draw on yet, so the letter is general.");
  return `<div><span class="eyebrow">Cover letter builder</span><h2>Write a cover letter from your resume and the job</h2></div>
  <p class="lede">It uses only what is already in your resume, plus the job description and the company details you add. It writes instantly, and you can edit every line afterwards.</p>
  <div class="card"><span class="eyebrow">Step 1</span><h3>The job</h3>
    <div class="row" style="align-items:flex-end">
      <label class="f" style="flex:1;min-width:200px">Company<input id="clCo" value="${esc(c.company || "")}" placeholder="e.g. Acme Privacy Pvt Ltd"></label>
      <label class="f" style="flex:1;min-width:200px">Role title<input id="clRole" value="${esc(c.role !== undefined ? c.role : clRoleDefault())}" placeholder="e.g. Privacy Analyst"></label>
    </div>
    <label class="f">Why this company (optional, one sentence in your own words)<textarea id="clWhy" style="min-height:70px">${esc(c.why || "")}</textarea></label>
    <label class="f">Job description (shared with the resume builder)<textarea id="clJd" style="min-height:160px" placeholder="Paste the full job posting">${esc(S.resume.jd || "")}</textarea></label>
    ${M ? "" : `<div class="note">There is no resume yet. <button class="link" data-go="resume">Build your resume first</button>, then come back here.</div>`}
    <div class="row"><button class="btn" id="clBuild" ${M ? "" : "disabled"}>Write my cover letter</button>${text ? '<span class="num">Writes over the letter below.</span>' : ""}</div>
  </div>
  ${text ? `<div class="card"><span class="eyebrow">Step 2</span><div class="row between"><h3>Your cover letter</h3><span class="num">${words} words</span></div>
    <textarea id="clOut" style="min-height:380px;font-family:inherit;line-height:1.55">${esc(text)}</textarea>
    ${warn.map(w => `<div class="note">${esc(w)}</div>`).join("")}
    <div class="row"><button class="btn" id="clPdf">Download PDF</button><button class="btn ghost" id="clCopy">Copy</button><button class="btn ghost" id="clTxt">Download TXT</button></div>
    ${CLMSG ? `<div class="info">${esc(CLMSG)}</div>` : ""}
    <p class="muted" style="font-size:.9rem">Check every line before you send it. Only facts from your resume are used.</p></div>
    ${A ? `<div class="card"><span class="eyebrow">What the letter draws on</span>
      <h3>Matched to the job</h3>
      <div class="kw">${A.matched.map(k => `<span class="pill ok">${esc(k)}</span>`).join("") || '<span class="muted">No job keywords matched your resume yet.</span>'}</div>
      ${A.missing.length ? `<b style="display:block;margin-top:12px;font-size:.9rem">In the job, not in your resume</b><p class="muted" style="font-size:.9rem">Add these only if they are true for you. Learn them first if you do not have them yet.</p><div class="kw">${A.missing.slice(0, 12).map(k => `<span class="pill bad">${esc(k)}</span>`).join("")}</div>` : ""}
    </div>` : ""}` : ""}
  <div class="card"><span class="eyebrow">Tip</span><p class="muted" style="font-size:.9rem">Keep it to one page, about 250 to 350 words. Use the company's own name, and do not repeat your whole resume.</p></div>`;
}

/* PDF of the letter, built the same way as the resume PDF (jsPDF, one column, one font). */
var CLMSG = "";
async function buildCoverPdf(text){
  await loadScript(LIBS.jspdf);
  const {jsPDF} = window.jspdf, pdf = new jsPDF({unit: "pt", format: "a4"}), W = 595, H = 842, margin = 60, maxW = W - margin * 2, lh = 15;
  const clean = s => String(s || "").replace(/₹/g, "Rs. ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF•]/g, "");
  let y = margin;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
  String(text).replace(/\r/g, "").split("\n").forEach(line => {
    if (!line.trim()) { y += lh * 0.6; return; }
    pdf.splitTextToSize(clean(line), maxW).forEach(w => { if (y > H - margin) { pdf.addPage(); y = margin; } pdf.text(w, margin, y); y += lh; });
  });
  pdf.setProperties({title: "Cover letter"});
  return pdf.output("blob");
}
async function clPdf(){
  const t = (document.getElementById("clOut") || {}).value || "";
  if (!t.trim()) { CLMSG = "Write the letter first."; render(); return; }
  CLMSG = "Preparing your PDF…"; render();
  try {
    const data = await buildCoverPdf(t);
    const co = ((S.resume.cover || {}).company || "").trim().replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
    const who = ((S.resume.model && S.resume.model.name) || S.profile.name || "").trim().replace(/\s+/g, "_").replace(/[^\w]/g, "") || "Cover";
    const filename = "Cover_Letter_" + who + (co ? "_" + co : "") + ".pdf";
    const dl = await claude.use("downloads").catch(() => null);
    if (!dl) { CLMSG = "Downloads aren't available in this view. Use Copy, paste into Word and save as PDF."; render(); return; }
    const res = await dl.save({filename, data});
    CLMSG = res && res.status === "saved" ? `Saved ${filename}. Name it the same way when you apply.` : "File handed over.";
  } catch (e) { CLMSG = e && e.code === "declined" ? "Download cancelled." : e && e.code === "rate_limited" ? "A download prompt is already open." : "Couldn't create the PDF: " + (e && e.message ? e.message : "unknown error") + "."; }
  render();
}

document.addEventListener("click", e => {
  const el = e.target.closest && e.target.closest("#clBuild,#clCopy,#clTxt,#clPdf"); if (!el) return;
  if (el.id === "clPdf") { clPdf(); return; }
  if (el.id === "clBuild") { S.resume.cover = Object.assign({}, S.resume.cover || {}, {text: clWrite()}); CLMSG = ""; save("resume"); render(); return; }
  if (el.id === "clCopy") { const t = (document.getElementById("clOut") || {}).value || ""; copyText(el, t); return; }
  const t = (document.getElementById("clOut") || {}).value || "";
  const url = URL.createObjectURL(new Blob([t], {type: "text/plain"}));
  const a = document.createElement("a"); a.href = url; a.download = "cover-letter.txt"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.addEventListener("input", e => {
  const id = e.target.id, map = {clCo: "company", clRole: "role", clWhy: "why"};
  if (map[id]) { S.resume.cover = Object.assign({}, S.resume.cover || {}, {[map[id]]: e.target.value}); return; }
  if (id === "clJd") { S.resume.jd = e.target.value; return; }
  if (id === "clOut") { S.resume.cover = Object.assign({}, S.resume.cover || {}, {text: e.target.value}); }
});

document.addEventListener("change", e => {
  if (["clCo", "clRole", "clWhy", "clJd", "clOut"].includes(e.target.id)) save("resume");
});
