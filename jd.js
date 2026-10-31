/* ================= JOB DESCRIPTIONS =================
   Paste or upload a job description. The app reads the skills, tools and certifications it names,
   and the requirement lines (must-have and nice-to-have), then saves it to the account.
   Saved descriptions build a picture per role: which skills keep appearing, and which of them
   you have not learned yet. Reading happens in the browser; the file itself is not uploaded. */
var JDUI = {text: "", title: "", role: "auto", msg: "", last: null};

/* Skills, laws, frameworks and tools that job descriptions name. t = the app subject that teaches it. */
var JD_TERMS = [
 {l:"DPDP Act 2023 and Rules", k:["dpdp","digital personal data protection"], t:"dpdp"},
 {l:"GDPR", k:["gdpr","general data protection regulation"], t:"gdpr"},
 {l:"HIPAA", k:["hipaa"], t:"hipaa"},
 {l:"GLBA and Reg S-P", k:["glba","gramm-leach","regulation s-p"], t:"glba"},
 {l:"CCPA and CPRA", k:["ccpa","cpra"], t:"ccpa"},
 {l:"ISO 27001", k:["iso 27001","iso/iec 27001","isms"], t:"iso"},
 {l:"ISO 27701 and privacy management", k:["iso 27701","pims"], t:"iso"},
 {l:"ISO 42001 and AI governance", k:["iso 42001","ai governance","eu ai act","ai act"], t:"aigov"},
 {l:"SOC 2", k:["soc 2","soc2"], t:"frameworks"},
 {l:"NIST CSF and 800-53", k:["nist"], t:"frameworks"},
 {l:"PCI DSS", k:["pci dss","pci-dss"], t:"frameworks"},
 {l:"RBI and SEBI rules", k:["rbi","sebi"], t:"indiafin"},
 {l:"AML and KYC", k:["aml","kyc","anti-money laundering","money laundering"], t:"aml"},
 {l:"Risk assessment and risk register", k:["risk assessment","risk register","risk management","risk treatment"], t:"risk"},
 {l:"Internal audit", k:["internal audit","audit","auditing"], t:"audit"},
 {l:"Control testing and evidence", k:["control testing","controls testing","evidence collection","control design","controls"], t:"c-controls"},
 {l:"Vendor and third-party risk", k:["vendor risk","third party","third-party","tprm","vendor due diligence","supplier"], t:"tprm"},
 {l:"DPIA and privacy impact assessment", k:["dpia","privacy impact assessment","impact assessment"], t:"privops"},
 {l:"Data mapping and records of processing", k:["data mapping","ropa","records of processing"], t:"privops"},
 {l:"Consent and cookie management", k:["consent management","consent","cookie"], t:"privops"},
 {l:"Incident and breach response", k:["incident response","breach","incident management"], t:"c-ir"},
 {l:"Contracts and DPA review", k:["data processing agreement","dpa","msa","contract review","contract","nda"], t:"clm"},
 {l:"Identity and access management", k:["iam","identity and access","access review","access management","privileged access"], t:"c-iam"},
 {l:"Network security", k:["network security","firewall","vpn"], t:"c-network"},
 {l:"Cloud security (AWS, Azure)", k:["cloud security","aws","azure","gcp","cloud"], t:"c-cloud"},
 {l:"Encryption and cryptography", k:["encryption","cryptograph","kms"], t:"c-crypto"},
 {l:"Linux and the command line", k:["linux","bash","command line"], t:"c-linux"},
 {l:"Vulnerability management", k:["vulnerability","vapt","penetration testing"], t:"t-vuln"},
 {l:"SIEM and log monitoring", k:["siem","splunk","sentinel","log analysis"], t:"t-sentinel"},
 {l:"OneTrust", k:["onetrust"], t:"t-onetrust"},
 {l:"Microsoft Purview", k:["purview"], t:"t-purview"},
 {l:"ServiceNow", k:["servicenow"], t:"t-servicenow"},
 {l:"GRC platforms (Archer, Vanta, Drata)", k:["archer","vanta","drata","metricstream","grc platform","grc tool","grc software"], t:"t-grcauto"},
 {l:"Excel", k:["excel","pivot table","vlookup","xlookup"], t:"t-excel"},
 {l:"SQL", k:["sql"], t:null},
 {l:"Python", k:["python"], t:null},
 {l:"Power BI and dashboards", k:["power bi","tableau","dashboard"], t:null},
 {l:"CRM (HubSpot, Salesforce, Zoho)", k:["crm","hubspot","salesforce","zoho"], t:"bd-assoc"},
 {l:"Lead generation and pipeline", k:["lead generation","pipeline","business development","client acquisition"], t:"bd-assoc"},
 {l:"Client proposals and presentations", k:["proposal","rfp","presentation","presentations"], t:"consulting"},
 {l:"CIPP, CIPM or CIPT certification", k:["cipp","cipm","cipt"], t:null},
 {l:"CISA, CISM or CISSP certification", k:["cisa","cism","cissp"], t:null},
 {l:"Stakeholder management", k:["stakeholder","stakeholders"], t:null},
 {l:"Legal drafting", k:["drafting","legal opinion","draft policies"], t:null},
 {l:"Regulatory monitoring", k:["regulatory updates","regulatory changes","monitor regulatory"], t:null}
];

var JD_MUST = /\b(must|required|requirements?|should have|need to|essential|mandatory|minimum|at least)\b/i;
var JD_NICE = /\b(preferred|nice to have|good to have|bonus|desirable|an asset|advantage)\b/i;

/* Words in a job title that point to one of the app's roles. First match wins. */
var JD_GUESS = [
 [/\bdpo\b|data protection officer/i, "dpo"], [/privacy|dpdp|gdpr/i, "privacy"],
 [/ai gov|ai risk|iso 42001|ai act/i, "aigov"], [/vendor|third.?party|tprm/i, "tprm"],
 [/audit/i, "itaudit"], [/cyber.*risk|security risk/i, "cyberrisk"],
 [/\baml\b|kyc|money laundering/i, "aml"], [/bfsi|bank|fintech|financ/i, "bfsi"],
 [/business development|sales|\bbd\b/i, "bda"], [/consult/i, "consult"],
 [/legal/i, "legal"], [/contract|clm/i, "clm"], [/e-?discovery|edisc/i, "edisc"],
 [/grc|governance|risk|compliance/i, "grcan"]
];

function jdGuess(s){ const hit = JD_GUESS.find(([re]) => re.test(s || "")); return hit && ROLE[hit[1]] ? hit[1] : null; }
function jdEsc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function jdCount(lt, k){ return (lt.match(new RegExp("(^|[^a-z0-9])" + jdEsc(k) + "(?=$|[^a-z0-9])", "g")) || []).length; }

function analyseJD(text){
  const lt = " " + text.toLowerCase().replace(/\s+/g, " ") + " ";
  const terms = {};
  JD_TERMS.forEach(e => { const c = e.k.reduce((a, k) => a + jdCount(lt, k), 0); if (c) terms[e.l] = c; });
  const lines = text.split(/\r?\n|(?<=[.;!?])\s+/)
    .map(s => s.replace(/^[\s\-•*·▪►\d.)]+/, "").replace(/\s+/g, " ").trim())
    .filter(s => s.length > 25 && s.length < 260);
  const must = [], nice = [];
  lines.forEach(s => {
    if (JD_NICE.test(s)) { if (nice.length < 8) nice.push(s); }
    else if (JD_MUST.test(s)) { if (must.length < 12) must.push(s); }
  });
  return {terms, must, nice, words: text.split(/\s+/).filter(Boolean).length};
}

/* Status of one skill for the learner: taught in the app, learned, or not in the app yet. */
function jdStatus(label, t){
  if (t && String(t).startsWith("cert:")) return {txt: "Certification", cls: "", act: `<button class="link" data-go="certs">See certifications</button>`};
  if (!t || !TOPIC[t]) return {txt: "Not in the app yet", cls: "", act: `<a class="link" href="${yt(label + " tutorial for beginners")}" target="_blank" rel="noopener">Find a free video ▶</a>`};
  const p = topicStats(TOPIC[t]).p;
  if (p >= PATH_DONE) return {txt: "Learned", cls: "ok", act: `<button class="link" data-go="${t}">Review</button>`};
  return {txt: p + "% learned", cls: p > 0 ? "warn" : "bad", act: `<button class="btn sm" data-go="${t}">Study</button>`};
}

function jdRoleOptions(){
  return `<option value="auto" ${JDUI.role === "auto" ? "selected" : ""}>Work it out from the title</option>` +
    ROLE_GROUPS.map(([g, ids]) => `<optgroup label="${esc(g)}">${ids.filter(id => ROLE[id]).map(id => `<option value="${id}" ${JDUI.role === id ? "selected" : ""}>${esc(ROLE[id].name)}</option>`).join("")}</optgroup>`).join("");
}

function runJD(){
  const text = (JDUI.text || "").trim().slice(0, 60000);
  if (text.length < 120) { JDUI.msg = "Paste or upload the full job description first. It needs a few sentences at least."; render(); return; }
  const roleId = (JDUI.role !== "auto" && ROLE[JDUI.role]) ? JDUI.role : (jdGuess(JDUI.title) || jdGuess(text.slice(0, 400)) || focusRole());
  const A = analyseJD(text);
  const item = {id: "jd" + Date.now(), title: (JDUI.title || "").trim().slice(0, 120) || (ROLE[roleId] ? ROLE[roleId].name : "Job description"),
    roleId, date: today(), words: A.words, terms: A.terms, must: A.must, nice: A.nice};
  S.jds = {items: [item].concat((S.jds && S.jds.items) || []).slice(0, 60)};
  save("jds");
  const names = Object.keys(A.terms), unmapped = names.filter(l => { const e = JD_TERMS.find(x => x.l === l); return !e || !e.t || !TOPIC[e.t]; }).length;
  JDUI.last = item.id; JDUI.role = roleId; JDUI.text = ""; JDUI.title = "";
  JDUI.msg = names.length ? `Saved to your library. Found ${names.length} skills and tools; ${unmapped} are not in the app yet.` : "Saved, but no known skills or tools were found. Check that the text was read correctly.";
  render();
}

function viewJD(){
  const view = (JDUI.role !== "auto" && ROLE[JDUI.role]) ? JDUI.role : focusRole();
  const RN = ROLE[view] ? ROLE[view].name : "this role";
  const items = (S.jds && S.jds.items) || [];
  const mine = items.filter(j => j.roleId === view);
  const N = mine.length;
  const agg = JD_TERMS.map(e => ({e, n: mine.filter(j => j.terms && j.terms[e.l]).length})).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const toLearn = agg.filter(x => jdStatus(x.e.l, x.e.t).cls !== "ok").slice(0, 6);
  const base = ROLE_REQ[view] || [];
  const last = items.find(j => j.id === JDUI.last);
  const lastRows = last ? Object.keys(last.terms || {}).map(l => { const e = JD_TERMS.find(x => x.l === l) || {l, t: null}, s = jdStatus(e.l, e.t);
    return `<div class="reqrow"><span style="flex:1;min-width:160px">${esc(l)}</span><span class="pill ${s.cls}">${esc(s.txt)}</span><span>${s.act}</span></div>`; }).join("") : "";

  return `<div class="thead"><button class="link" data-go="roles">← Roles & readiness</button><span class="eyebrow">Job descriptions</span></div>
  <h2>Check a job description</h2>
  <p class="lede">Paste or upload a job description. The app reads the skills, tools and certifications it asks for, saves it to your library, and shows what to learn for the role. The more descriptions you save for a role, the clearer the pattern.</p>

  <section class="card"><span class="eyebrow">Add a job description</span>
    <label class="drop" for="jdFile"><input type="file" id="jdFile" accept=".pdf,.docx,.txt,.md" hidden><span class="dropi">⇪</span><b>Upload a PDF, DOCX, TXT or MD file</b><span class="num">Read in your browser. The file is not uploaded anywhere.</span></label>
    <label class="f">Or paste the job description<textarea id="jdText" rows="8" placeholder="Paste the full text of the job posting here">${esc(JDUI.text)}</textarea></label>
    <div class="row" style="align-items:flex-end">
      <label class="f" style="flex:1;min-width:200px">Job title as written<input id="jdTitle" value="${esc(JDUI.title)}" placeholder="e.g. Privacy Analyst"></label>
      <label class="f" style="flex:1;min-width:200px">Which role is this for<select id="jdRole">${jdRoleOptions()}</select></label>
    </div>
    <div class="row"><button class="btn" id="jdRun">Analyse and save</button><span class="num">${esc(JDUI.msg)}</span></div>
  </section>

  ${last ? `<section class="card"><span class="eyebrow">What this job asks for</span><h3>${esc(last.title)}</h3>
    <span class="num">${esc(last.date)} · ${last.words} words · ${esc((ROLE[last.roleId] || {}).name || "")}</span>
    <div style="margin-top:8px">${lastRows || '<span class="muted">No known skills or tools were named.</span>'}</div>
    ${(last.must || []).length ? `<b style="display:block;margin-top:12px">Must-have lines</b><ul class="clean">${last.must.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${(last.nice || []).length ? `<b style="display:block;margin-top:8px">Nice-to-have lines</b><ul class="clean">${last.nice.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
  </section>` : ""}

  <section class="card"><span class="eyebrow">Learn for ${esc(RN)}</span><h3>What to learn next</h3>
    <p class="muted" style="margin:4px 0 8px">${N ? `Built from ${N} saved job description${N === 1 ? "" : "s"} for this role. Skills that appear in the most postings come first.` : "No descriptions saved for this role yet. Upload one above to see what employers ask for here. Until then, the list below comes from the app's role data."}</p>
    ${toLearn.length ? `<div class="row" style="margin-bottom:8px"><b>From your job descriptions</b></div>${toLearn.map(x => { const s = jdStatus(x.e.l, x.e.t); return `<div class="reqrow"><span style="flex:1;min-width:160px">${esc(x.e.l)} <span class="num">· in ${x.n} of ${N}</span></span><span class="pill ${s.cls}">${esc(s.txt)}</span><span>${s.act}</span></div>`; }).join("")}` : ""}
    ${base.length ? `<div class="row" style="margin:12px 0 8px"><b>From the app's role data</b></div>${base.map(([label, kws, t, must]) => { const s = jdStatus(label, t);
      return `<div class="reqrow"><span style="flex:1;min-width:160px">${esc(label)}${must ? "" : ' <span class="num">· nice to have</span>'}</span><span class="pill ${s.cls}">${esc(s.txt)}</span><span>${s.act}</span></div>`; }).join("")}` : ""}
  </section>

  <section class="card"><span class="eyebrow">Your library</span><h3>Saved job descriptions</h3>
    ${items.length ? items.slice(0, 20).map(j => `<div class="reqrow"><span style="flex:1;min-width:160px"><b>${esc(j.title)}</b> <span class="num">· ${esc((ROLE[j.roleId] || {}).name || "Role")} · ${esc(j.date)}</span></span><button class="link" data-jddel="${esc(j.id)}">Delete</button></div>`).join("")
      : '<span class="muted">Nothing saved yet.</span>'}
  </section>`;
}

/* Role chosen from a role page, so the page opens on that role. Capture phase runs before the app's own handler. */
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-jdrole]");
  if (b && ROLE[b.dataset.jdrole]) { JDUI.role = b.dataset.jdrole; JDUI.msg = ""; }
}, true);

document.addEventListener("click", e => {
  const el = e.target.closest && e.target.closest("#jdRun,[data-jddel]"); if (!el) return;
  if (el.id === "jdRun") { runJD(); return; }
  const id = el.dataset.jddel;
  S.jds = {items: ((S.jds && S.jds.items) || []).filter(j => j.id !== id)};
  save("jds"); render();
});

document.addEventListener("input", e => {
  if (e.target.id === "jdText") JDUI.text = e.target.value;
  if (e.target.id === "jdTitle") JDUI.title = e.target.value;
});

document.addEventListener("change", async e => {
  if (e.target.id === "jdRole") { JDUI.role = e.target.value; render(); return; }
  if (e.target.id !== "jdFile") return;
  const f = e.target.files && e.target.files[0]; if (!f) return;
  JDUI.msg = "Reading " + f.name + "…"; render();
  try {
    const x = await readResumeFile(f);
    JDUI.text = x.text || "";
    JDUI.msg = JDUI.text.trim() ? "Read " + f.name + ". Check the text, then analyse." : "No text found in that file. Paste the text instead.";
    if (!JDUI.title) JDUI.title = f.name.replace(/\.[a-z]+$/i, "").replace(/[_-]+/g, " ");
  } catch (err) { JDUI.msg = "Could not read that file. Paste the text instead."; }
  render();
});
