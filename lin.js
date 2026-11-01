/* ================= LINKEDIN IMPORT FOR THE RESUME BUILDER =================
   LinkedIn cannot be read from its profile link, so the user downloads their own data
   (Settings > Data privacy > Get a copy of your data). That ZIP holds CSV files. This reads them in
   the browser, shows each item with a tick box, and adds the ticked items to the resume model.
   Nothing is uploaded anywhere. Items already in the resume are left out. */
var LINUI = {files: null, cands: null, msg: "", url: "", cparts: []};

/* Read a ZIP without a library: find the central directory, then inflate each CSV with DecompressionStream. */
async function linUnzip(buf){
  const dv = new DataView(buf), u8 = new Uint8Array(buf), out = {}, dec = new TextDecoder();
  let e = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) { if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; } }
  if (e < 0) throw new Error("That file is not a ZIP archive.");
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), loff = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (!/\.csv$/i.test(name)) continue;
    const start = loff + 30 + dv.getUint16(loff + 26, true) + dv.getUint16(loff + 28, true);
    const data = u8.subarray(start, start + csize);
    let bytes = data;
    if (method === 8) {
      if (typeof DecompressionStream === "undefined") throw new Error("This browser can't open ZIP files. Upload the CSV files one at a time instead.");
      bytes = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    }
    out[name.split("/").pop().toLowerCase().replace(/\s+/g, "")] = dec.decode(bytes);
  }
  return out;
}

/* RFC 4180 CSV: quoted fields may hold commas and line breaks. */
function linCSV(text){
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = (rows.shift() || []).map(h => h.trim());
  return rows.filter(r => r.some(x => x.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
}

const linSpan = (a, b) => (a || b) ? [a, b || "Present"].filter(Boolean).join(" – ") : "";
function linBullets(desc){
  return String(desc || "").split(/\r?\n|•/).map(s => s.replace(/^\s*[-*▪►]\s*/, "").trim()).filter(s => s.length > 3).slice(0, 8).map(s => s.slice(0, 240));
}

/* Turn the CSV files into candidate items, one per LinkedIn entry. */
function linBuild(files, url){
  const T = n => linCSV(files[n] || ""), cands = [];
  const prof = T("profile.csv")[0] || {};
  const email = (T("emailaddresses.csv").find(r => /yes/i.test(r.Primary || "")) || T("emailaddresses.csv")[0] || {})["Email Address"] || "";
  const phone = (T("phonenumbers.csv")[0] || {}).Number || "";
  LINUI.cparts = [email, phone, prof["Geo Location"] || ""].filter(Boolean);
  const contact = [...LINUI.cparts, url].filter(Boolean).join(" | ");
  if (contact) cands.push({sec: "contact", key: "contact", text: contact, label: "Contact line: " + contact});
  if (prof.Headline) cands.push({sec: "title", key: "headline", text: prof.Headline, label: "Headline: " + prof.Headline});
  if (prof.Summary) cands.push({sec: "summary", key: "summary", text: prof.Summary, label: "Summary (your LinkedIn About section)"});
  T("positions.csv").forEach(r => { const dates = linSpan(r["Started On"], r["Finished On"]), t = r.Title || "";
    if (!t) return; cands.push({sec: "exp", key: t.toLowerCase().slice(0, 30), head: [t, r["Company Name"], dates].filter(Boolean).join(" | "), bullets: linBullets(r.Description), label: [t, r["Company Name"]].filter(Boolean).join(" at ") + (dates ? " · " + dates : "")}); });
  T("projects.csv").forEach(r => { const dates = linSpan(r["Started On"], r["Finished On"]), t = r.Title || "";
    if (!t) return; cands.push({sec: "projects", key: t.toLowerCase().slice(0, 30), head: [t, dates].filter(Boolean).join(" | "), bullets: linBullets(r.Description), label: t + (dates ? " · " + dates : "")}); });
  T("education.csv").forEach(r => { const school = r["School Name"] || "", dates = linSpan(r["Start Date"], r["End Date"]);
    if (!school) return; const text = [school, r["Degree Name"]].filter(Boolean).join(", ") + (dates ? " (" + dates + ")" : "");
    cands.push({sec: "education", key: school.toLowerCase().slice(0, 30), text, label: text}); });
  T("certifications.csv").forEach(r => { if (!r.Name) return; const text = [r.Name, r.Authority].filter(Boolean).join(" — ") + (r["Started On"] ? " (" + r["Started On"] + ")" : "");
    cands.push({sec: "certs", key: r.Name.toLowerCase().slice(0, 30), text, label: text}); });
  T("skills.csv").forEach(r => { if (r.Name) cands.push({sec: "skills", key: r.Name.toLowerCase(), text: r.Name, label: "Skill: " + r.Name}); });
  T("honors.csv").forEach(r => { if (!r.Title) return; const text = [r.Title, r.Issuer].filter(Boolean).join(" — ") + (r["Issued On"] ? " (" + r["Issued On"] + ")" : "");
    cands.push({sec: "other", key: r.Title.toLowerCase().slice(0, 30), text, label: "Honour: " + text}); });
  T("languages.csv").forEach(r => { if (!r.Name) return; const text = "Language: " + r.Name + (r.Proficiency ? " (" + r.Proficiency + ")" : "");
    cands.push({sec: "other", key: r.Name.toLowerCase(), text, label: text}); });
  T("volunteering.csv").forEach(r => { const org = r["Company Name"] || r.Organization || "", role = r.Role || "";
    if (!org && !role) return; const dates = linSpan(r["Started On"], r["Finished On"]);
    const text = [role, org].filter(Boolean).join(" at ") + (dates ? " (" + dates + ")" : "");
    cands.push({sec: "other", key: (role || org).toLowerCase().slice(0, 30), text: "Volunteer: " + text, label: "Volunteer: " + text}); });
  return cands.map((c, i) => Object.assign(c, {id: i}));
}

function linModel(){ return S.resume.model || parseResume(""); }
/* Already in the resume? Skip it so nothing is duplicated. */
function linDup(M, c){
  if (c.sec === "title" || c.sec === "summary" || c.sec === "contact") return !!M[c.sec];
  if (!c.key) return false;
  if (c.sec === "exp" || c.sec === "projects") return (M[c.sec] || []).some(e => String(e.head || "").toLowerCase().includes(c.key));
  return (M[c.sec] || []).some(x => String(x).toLowerCase().includes(c.key));
}

function linAdd(){
  const M = JSON.parse(JSON.stringify(linModel()));
  let n = 0, skipped = 0;
  (LINUI.cands || []).forEach(c => {
    const on = c.on !== undefined ? c.on : !linDup(M, c);
    if (!on) return;
    if (linDup(M, c)) { skipped++; return; }
    if (c.sec === "exp" || c.sec === "projects") M[c.sec].push({head: c.head, bullets: c.bullets});
    else if (c.sec === "title" || c.sec === "summary" || c.sec === "contact") M[c.sec] = c.text;
    else { M[c.sec] = M[c.sec] || []; M[c.sec].push(c.text); }
    n++;
  });
  S.resume.model = M; save("resume");
  LINUI.msg = n ? `Added ${n} item${n === 1 ? "" : "s"} to your resume below.` : "Nothing new was ticked.";
  if (skipped) LINUI.msg += ` ${skipped} already in your resume ${skipped === 1 ? "was" : "were"} left out.`;
  render();
}

const LIN_GROUPS = [["contact", "Contact"], ["title", "Headline"], ["summary", "Summary"], ["exp", "Experience"], ["projects", "Projects"], ["education", "Education"], ["certs", "Certifications"], ["skills", "Skills"], ["other", "Honours, languages and volunteering"]];

function linCard(){
  const M = linModel(), cands = LINUI.cands || [];
  const list = cands.length ? `<div style="margin-top:10px">${LIN_GROUPS.map(([sec, name]) => { const items = cands.filter(c => c.sec === sec);
      return items.length ? `<b style="display:block;margin-top:10px;font-size:.9rem">${esc(name)} <span class="num">· ${items.length}</span></b>` +
        items.map(c => { const dup = linDup(M, c), on = c.on !== undefined ? c.on : !dup;
          return `<label class="reqrow" style="cursor:pointer"><input type="checkbox" data-linpick="${c.id}" ${on ? "checked" : ""} style="margin-right:8px"><span style="flex:1;min-width:0">${esc(c.label)}</span>${dup ? '<span class="pill ok">already in resume</span>' : ""}</label>`; }).join("") : ""; }).join("")}
    <div class="row" style="margin-top:12px"><button class="btn" id="linAdd">Add ticked items to my resume</button><button class="btn ghost" id="linClear">Clear</button></div></div>` : "";
  return `<div class="card"><span class="eyebrow">Import from LinkedIn</span><h3>Add the details you forgot to put on your resume</h3>
    <p class="muted" style="font-size:.9rem">LinkedIn blocks reading a profile from its link, so use LinkedIn's own download of your data. On LinkedIn go to Settings, then Data privacy, then "Get a copy of your data", and pick the profile, positions, education, skills, certifications, projects and honours. LinkedIn emails a ZIP when it is ready, which can take a little while. Upload that ZIP here. It is read in your browser and nothing is sent anywhere.</p>
    <label class="f">Your public LinkedIn address (optional, added to the contact line)<input id="linUrl" value="${esc(LINUI.url)}" placeholder="https://www.linkedin.com/in/your-name"></label>
    <label class="drop" for="linFile"><input type="file" id="linFile" accept=".zip,.csv" multiple hidden><span class="dropi">⇪</span><b>Upload the LinkedIn ZIP (or its CSV files)</b><span class="num">Only the profile details are read. Nothing is saved except what you add.</span></label>
    ${LINUI.msg ? `<div class="info">${esc(LINUI.msg)}</div>` : ""}
    ${list}
  </div>`;
}

document.addEventListener("click", e => {
  const el = e.target.closest && e.target.closest("#linAdd,#linClear"); if (!el) return;
  if (el.id === "linAdd") { linAdd(); return; }
  LINUI.files = null; LINUI.cands = null; LINUI.msg = ""; render();
});

document.addEventListener("change", async e => {
  const t = e.target;
  if (t.id === "linUrl") {
    LINUI.url = t.value.trim();
    if (LINUI.files) { LINUI.cands = linBuild(LINUI.files, LINUI.url); LINUI.msg = "Contact line updated. Tick what to add."; render(); }
    return;
  }
  if (t.matches && t.matches("[data-linpick]")) { const c = (LINUI.cands || [])[+t.dataset.linpick]; if (c) c.on = t.checked; return; }
  if (t.id !== "linFile") return;
  const fs = [...(t.files || [])]; if (!fs.length) return;
  LINUI.msg = "Reading " + fs.map(f => f.name).join(", ") + "…"; render();
  try {
    const files = Object.assign({}, LINUI.files || {});
    for (const f of fs) {
      const buf = await f.arrayBuffer();
      if (/\.zip$/i.test(f.name)) Object.assign(files, await linUnzip(buf));
      else if (/\.csv$/i.test(f.name)) files[f.name.split("/").pop().toLowerCase().replace(/\s+/g, "")] = new TextDecoder().decode(buf);
      else throw new Error("Upload the ZIP or CSV files from LinkedIn.");
    }
    LINUI.files = files;
    LINUI.cands = linBuild(files, LINUI.url);
    LINUI.msg = LINUI.cands.length ? `Found ${LINUI.cands.length} items in ${Object.keys(files).length} file${Object.keys(files).length === 1 ? "" : "s"}. Tick what to add.` : "No LinkedIn profile files were found. The ZIP should contain files such as Profile.csv and Positions.csv.";
  } catch (err) { LINUI.msg = err.message || "Could not read that file."; }
  render();
});
