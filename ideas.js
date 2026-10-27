/* ================= PROJECT IDEAS (weighted) + AI SUGGESTER · AUTOMATION TOOLS PAGE · AI GOVERNANCE DESK (LabOS) ================= */
/* weight: 5 = strong hiring signal for the role; effort is a realistic estimate for a beginner. */
const IDEAS = [
 {id:"i-dpdp-kit",t:"DPDP readiness toolkit for a mid-size Indian company",roles:["privacy","consult","dpo","legal"],w:5,eff:"2 weeks",tools:["Word/Docs","Excel","GitHub"],topics:["dpdp","privops"],why:"DPDP duties land by May 2027; a ready toolkit shows you can do the job on day one.",show:"Notice template, consent-record schema, rights-request SOP with 90-day grievance clock, breach playbook with CERT-In 6h and Board 72h steps."},
 {id:"i-law-matrix",t:"DPDP vs GDPR vs CCPA comparison matrix with citations",roles:["privacy","legal","dpo"],w:4,eff:"1 week",tools:["Sheets","GitHub"],topics:["dpdp","gdpr","ccpa"],why:"Interviewers love candidates who can compare regimes precisely.",show:"30-row matrix (scope, bases, rights, timelines, penalties) with section numbers and a one-page summary."},
 {id:"i-ai-inventory",t:"AI system inventory + EU AI Act classifier spreadsheet",roles:["aigov","privacy","consult"],w:5,eff:"1 week",tools:["Excel/Sheets formulas"],topics:["ai-euact","ai-risk"],why:"Every company starting AI governance needs exactly this; few candidates can show one.",show:"Inventory template with drop-downs that suggest role (provider/deployer) and risk tier, plus 10 worked examples."},
 {id:"i-ai-impact",t:"AI impact assessment of a public AI product",roles:["aigov","privacy"],w:5,eff:"2 weeks",tools:["Docs"],topics:["ai-risk","ai-std"],why:"Shows judgement on a real system using ISO/IEC 42005 headings and EU AI Act duties.",show:"Assessment of a publicly described CV-screening or credit tool: affected groups, harms, safeguards, residual risk."},
 {id:"i-mini-isms",t:"Mini ISMS for a fictional start-up (ISO 27001)",roles:["grcan","consult","itaudit"],w:5,eff:"3 weeks",tools:["Docs","Sheets"],topics:["iso","risk"],why:"The classic GRC portfolio piece; recruiters recognise it instantly.",show:"Scope, risk register (20 risks), Statement of Applicability, five policies, internal audit plan."},
 {id:"i-soc2-tracker",t:"SOC 2 readiness tracker with evidence map",roles:["grcan","platcons","tprm"],w:4,eff:"1 week",tools:["Notion or Sheets"],topics:["frameworks","audit"],why:"Start-ups selling to the US need SOC 2; mapping evidence is the core skill.",show:"Criteria → controls → evidence → owner → frequency, with a status dashboard."},
 {id:"i-tprm-pack",t:"Vendor risk programme pack",roles:["tprm","grcan","clm"],w:5,eff:"2 weeks",tools:["Sheets","Docs"],topics:["tprm","clm"],why:"TPRM teams hire people who can tier vendors and read evidence.",show:"Tiering model, 40-question questionnaire, DPA checklist, scoring sheet, sample assessment of a public SaaS vendor's trust centre."},
 {id:"i-notice-teardown",t:"Privacy notice teardown of 5 Indian apps",roles:["privacy","legal","tns"],w:4,eff:"1 week",tools:["Docs","LinkedIn article"],topics:["dpdp","privops"],why:"Public, shareable, and shows you can apply DPDP Rules to real documents.",show:"Scorecard per app against DPDP notice requirements; a LinkedIn article with findings."},
 {id:"i-cookie-audit",t:"Cookie consent audit of 5 websites",roles:["privacy","platcons"],w:4,eff:"1 weekend",tools:["Browser developer tools"],topics:["privops","t-onetrust"],why:"Hands-on proof you can test whether consent really works.",show:"Screenshots of tags firing before consent, a findings table and fixes."},
 {id:"i-pa-flow",t:"Power Automate evidence-chasing flow",roles:["grcan","platcons","privacy"],w:4,eff:"1 week",tools:["Power Automate"],topics:["t-automate","audit"],why:"Automation is a rising keyword; a working flow beats a claim.",show:"Flow diagram, screenshots of run history, a short write-up of hours saved and controls on the flow."},
 {id:"i-py-leavers",t:"Python leaver-access reconciliation script",roles:["grcan","itaudit","cyberrisk"],w:4,eff:"1 week",tools:["Python (pandas)"],topics:["t-automate","c-iam"],why:"Access reviews are in every audit; scripting them shows technical comfort.",show:"Script, synthetic test data, output, and an explanation an auditor can follow."},
 {id:"i-breach-tree",t:"Breach notification decision tree (India, EU, US)",roles:["privacy","dpo","cyberrisk","legal"],w:5,eff:"1 week",tools:["Diagram tool","Docs"],topics:["c-ir","dpdp","gdpr"],why:"Clocks are the most-asked incident question; a clear tree is memorable.",show:"Flowchart covering CERT-In 6h, DPDP Board 72h detailed report, GDPR 72h, US state laws, with a worked example."},
 {id:"i-reg-tracker",t:"RBI/SEBI regulatory change digest (3 months)",roles:["bfsi","aml","grcan"],w:4,eff:"Ongoing, 2 hrs/week",tools:["Docs","LinkedIn"],topics:["indiafin"],why:"Shows you follow Indian financial regulation like a compliance professional.",show:"Monthly digest: circular, who it applies to, impact, action — posted publicly."},
 {id:"i-aml-cases",t:"AML alert investigations on synthetic transactions",roles:["aml","bfsi"],w:4,eff:"1 week",tools:["Excel"],topics:["aml"],why:"KYC/AML teams test narrative writing in interviews.",show:"Five alerts with dispositions, two narratives and an STR-style write-up."},
 {id:"i-dpa-playbook",t:"Data processing agreement playbook",roles:["clm","legal","tprm"],w:5,eff:"1 week",tools:["Docs"],topics:["clm","privacy"],why:"Legal ops and privacy teams both need playbooks; your law degree shines.",show:"Clause-by-clause standard position, fallbacks, red flags and escalation rules."},
 {id:"i-ediscovery",t:"Search-term report and privilege log (public Enron data)",roles:["edisc"],w:4,eff:"1 week",tools:["Spreadsheet","search tools"],topics:["ediscovery"],why:"Proves review judgement with a famous public dataset.",show:"Term hit report with narrowing, sample privilege log, QC notes."},
 {id:"i-deepfake-policy",t:"Deepfake content policy for an Indian platform",roles:["tns","aigov","legal"],w:4,eff:"1 week",tools:["Docs"],topics:["tns","ai-sec"],why:"Synthetic media rules are new; policy writing is the T&S core skill.",show:"Policy, enforcement matrix, labelling rules aligned to the IT Rules amendments."},
 {id:"i-grc-dashboard",t:"GRC dashboard from a synthetic risk register",roles:["grcan","consult","bfsi"],w:4,eff:"1 week",tools:["Power BI or Excel"],topics:["t-excel","risk"],why:"Boards consume dashboards; this shows reporting skill.",show:"Dashboard with risk heatmap, overdue actions, KRIs and a one-page board note."},
 {id:"i-snow-pdi",t:"ServiceNow attestation workflow in a free developer instance",roles:["platcons","grcan"],w:5,eff:"2 weeks",tools:["ServiceNow PDI"],topics:["t-servicenow"],why:"Hands-on ServiceNow is rare among freshers and highly valued.",show:"Screenshots of records, workflow, report; honest label 'personal developer instance'."},
 {id:"i-dsar-bpmn",t:"DSAR workflow design with SLAs (BPMN)",roles:["platcons","privacy"],w:4,eff:"1 week",tools:["draw.io / Lucid"],topics:["privops","t-onetrust"],why:"Platform consultants design workflows before configuring tools.",show:"BPMN diagram, SLA rules, role matrix and test cases."},
 {id:"i-bd-accounts",t:"Account research pack: 20 companies with DPDP triggers",roles:["bda","bdc"],w:4,eff:"1 week",tools:["Sheets","LinkedIn"],topics:["bd-assoc"],why:"BD managers hire people who can find real buying triggers.",show:"Account list with trigger, buyer, angle and a 4-touch outreach sequence."},
 {id:"i-proposal",t:"Proposal and SOW for a DPDP gap assessment",roles:["bdc","consult"],w:5,eff:"1 week",tools:["Docs","Excel pricing"],topics:["bd-consult","consulting"],why:"Shows you can scope, price and explain value.",show:"Proposal, SOW with deliverables and RACI, pricing model and timeline."},
 {id:"i-ai-aup",t:"AI acceptable-use policy and 1-page staff guide for a law firm",roles:["aigov","legal","privacy"],w:4,eff:"3–4 days",tools:["Docs"],topics:["ai-sec","aigov"],why:"Every firm needs one now; practical and quick to show.",show:"Policy, one-page guide, rollout and training plan."},
 {id:"i-llm-threat",t:"OWASP LLM Top 10 threat model of a public chatbot feature",roles:["aigov","cyberrisk"],w:4,eff:"1 week",tools:["Docs","diagram"],topics:["ai-sec"],why:"Bridges AI governance and security vocabulary.",show:"Components, trust boundaries, threats mapped to LLM01–LLM10, controls and residual risk."},
 {id:"i-newsletter",t:"Monthly 'DPDP & AI regulation' LinkedIn newsletter (3 issues)",roles:["privacy","aigov","legal","consult","bda"],w:4,eff:"Ongoing, 3 hrs/month",tools:["LinkedIn"],topics:["dpdp","ai-euact"],why:"Visible expertise attracts recruiters; consistency matters more than length.",show:"Three issues with sources, each ending with 'what this means for companies'."},
 {id:"i-iso42001-map",t:"ISO 42001 ↔ ISO 27001 reuse map",roles:["aigov","grcan","consult"],w:4,eff:"3–4 days",tools:["Sheets"],topics:["ai-std","iso"],why:"Firms with ISO 27001 are adding 42001; this map is exactly what they need.",show:"Clause-by-clause reuse/extend/new table and an artefact checklist."}
];
let ideaRole = "", ideaSort = "weight";
function ideaState(id){ const all = (S.progress.ideas ||= {}); return (all[id] ||= {status:"", note:""}); }
function ideaGet(id){ return (S.progress.ideas || {})[id] || {status:"", note:""}; }
let AIIDEAS = null, AIIDEAMETA = null;
async function loadAiIdeas(){
  if (!cap.db) return;
  try { const s = await cap.db.collection("ideas").get(); AIIDEAS = s.docs.map(d => Object.assign({id:d.id}, d.data())).sort((a,b) => String(b.month||"").localeCompare(String(a.month||""))); const m = await cap.db.collection("meta").doc("ideas").get(); AIIDEAMETA = m.exists ? m.data() : null; } catch(e) { AIIDEAS = AIIDEAS || []; }
  if (current === "ideas") rerender();
}
function stars(n){ return `<span class="stars5" aria-label="${n} of 5">${"★".repeat(n)}${"☆".repeat(5-n)}</span>`; }
function ideaCard(x, ai){
  const st = ideaGet(x.id);
  return `<div class="card idea ${st.status?"is-"+st.status:""}"><div class="row between"><span class="eyebrow">${ai?"AI pick"+(x.month?" · "+esc(x.month):""):"Weight"}</span>${stars(Math.max(1,Math.min(5,+x.w||3)))}</div>
    <h3>${esc(x.t)}</h3><p style="font-size:.9rem;margin:0">${esc(x.why||"")}</p>
    <p class="num" style="margin:0"><b>Publish:</b> ${esc(x.show||"")}</p>
    <div class="row"><span class="pill">${esc(x.eff||"")}</span>${(x.tools||[]).map(t=>`<span class="pill">${esc(t)}</span>`).join("")}</div>
    <div class="row">${(x.roles||[]).filter(r=>ROLE[r]).map(r=>`<button class="link" data-go="role-${r}">${esc(roleShort(r))}</button>`).join(" · ")}</div>
    ${x.source?`<a class="num" href="${esc(x.source)}" target="_blank" rel="noopener">Why now: source</a>`:""}
    <div class="row"><div class="seg" role="group" aria-label="Status">${[["","Not started"],["plan","Planned"],["doing","Doing"],["done","Done"]].map(([v,l])=>`<button aria-pressed="${st.status===v}" data-ideast="${esc(x.id)}|${v}">${l}</button>`).join("")}</div><button class="btn sm ghost" data-ideaask="${esc(x.id)}">How do I start?</button></div>
    <div class="ai" id="ia-${esc(x.id)}" hidden></div></div>`;
}
function viewIdeas(){
  if (AIIDEAS === null && cap.db) loadAiIdeas();
  const rid = ideaRole || focusRole(), list = IDEAS.filter(x => !rid || rid === "all" || x.roles.includes(rid)).slice().sort((a,b) => ideaSort === "weight" ? b.w - a.w : ideaSort === "effort" ? String(a.eff).localeCompare(String(b.eff)) : 0);
  const mine = Object.entries(S.progress.ideas || {}).filter(([,v]) => v.status).map(([id,v]) => ({x: IDEAS.find(i=>i.id===id) || (AIIDEAS||[]).find(i=>i.id===id) || ((S.progress.aiIdeas||{}).items||[]).find(i=>i.id===id), v})).filter(o => o.x);
  const ai = (AIIDEAS || []).filter(x => !rid || rid === "all" || !(x.roles||[]).length || x.roles.includes(rid)).slice(0, 6), mineAi = (S.progress.aiIdeas || {}).items || [];
  return `<div><span class="eyebrow">Cyber Lab · Project ideas</span><h2>Portfolio projects that add weight</h2></div>
  <p class="lede">Ideas you can build and publish to stand out, weighted by how strongly they signal readiness for a role. Pick one or two, build them properly, and publish them to GitHub from a project page or as their own folder.</p>
  <div class="card"><div class="row between"><div class="row"><label class="f" style="min-width:220px">Role<select id="ideaRole"><option value="all" ${rid==="all"?"selected":""}>All roles</option>${PERSON_ROLES().map(r=>`<option value="${r.id}" ${r.id===rid?"selected":""}>${esc(roleShort(r.id))}</option>`).join("")}</select></label>
    <div class="seg" role="group" aria-label="Sort">${[["weight","Highest weight"],["effort","Quickest"]].map(([v,l])=>`<button aria-pressed="${ideaSort===v}" data-ideasort="${v}">${l}</button>`).join("")}</div></div>
    <button class="btn" id="ideaSuggest">Suggest 5 ideas for me now</button></div>
    <div id="ideaSugOut" class="num"></div></div>
  ${mine.length?`<div class="card"><span class="eyebrow">My plan</span>${mine.map(({x,v})=>`<div class="row between"><span><b>${esc(x.t)}</b></span><span class="pill ${v.status==="done"?"ok":v.status==="doing"?"warn":"acc"}">${v.status==="done"?"Done":v.status==="doing"?"Doing":"Planned"}</span></div>`).join("")}</div>`:""}
  <div class="card"><div class="row between"><div><span class="eyebrow">This month's AI picks</span><h3>Based on where the industry is moving</h3></div><span class="num">${AIIDEAMETA&&AIIDEAMETA.lastRun?"Updated "+esc(String(AIIDEAMETA.lastRun).slice(0,10))+" · refreshes monthly":"First monthly update pending"}</span></div>
    ${AIIDEAMETA&&AIIDEAMETA.trends?`<div class="row">${AIIDEAMETA.trends.slice(0,5).map(t=>`<span class="pill acc">${esc(t)}</span>`).join("")}</div>`:""}
    ${ai.length?`<div class="grid3">${ai.map(x=>ideaCard(x,true)).join("")}</div>`:`<p class="muted">A scheduled task researches hiring and regulation trends each month and adds fresh project ideas here.</p>`}
    ${mineAi.length?`<span class="eyebrow">Suggested for you (${esc(String((S.progress.aiIdeas||{}).at||"").slice(0,10))})</span><div class="grid3">${mineAi.map(x=>ideaCard(x,true)).join("")}</div>`:""}</div>
  <div class="grid3">${list.map(x=>ideaCard(x,false)).join("")}</div>`;
}
async function ideaSuggest(){
  const out = document.getElementById("ideaSugOut"), rid = ideaRole && ideaRole !== "all" ? ideaRole : focusRole();
  if (!cap.sample) { out.textContent = "Claude isn't available in this view."; return; }
  out.textContent = "Thinking about your progress and the market…";
  const done = ALLPROJ.filter(p => projGet(p.id).passed).map(p => p.title).slice(0, 15), learned = TOPICS.filter(t => topicStats(t).p >= 70).map(t => t.title);
  try {
    const res = await cap.sample.json(`Suggest 5 portfolio project ideas for Jyotirmaya, a 2025 Indian law graduate (Advocate) with US consumer-credit compliance experience, targeting the role "${ROLE[rid].name}" in India. Today is ${today()}. Consider current hiring and regulatory trends you know of (DPDP Rules 2025 deadlines, EU AI Act timeline, RBI/SEBI cyber rules, AI governance), and avoid duplicating these existing ideas: ${IDEAS.map(i=>i.t).join("; ")}. Subjects she has covered: ${learned.join(", ") || "few so far"}. Projects passed: ${done.join(", ") || "none yet"}. Each idea must be buildable by one person with free tools in 1–3 weeks using synthetic or public data only. Reply with only JSON: {"items":[{"t":"title","why":"why it adds weight now (one sentence)","show":"what to publish","eff":"time estimate","tools":["tool"],"w":1-5,"roles":["${rid}"]}]}`, {cache:false});
    const items = (res && Array.isArray(res.items) ? res.items : []).slice(0,5).map((x,i) => ({id:"ai-" + Date.now().toString(36) + i, t:String(x.t||"").slice(0,120), why:String(x.why||"").slice(0,300), show:String(x.show||"").slice(0,300), eff:String(x.eff||"").slice(0,40), tools:(Array.isArray(x.tools)?x.tools:[]).map(String).slice(0,4), w:Math.max(1,Math.min(5,+x.w||3)), roles:[rid]})).filter(x => x.t);
    if (!items.length) { out.textContent = "No ideas came back. Try again."; return; }
    S.progress.aiIdeas = {at:today(), role:rid, items}; save("progress"); out.textContent = ""; rerender();
  } catch(e) { out.textContent = e.code === "invalid_json" ? "Couldn't read the suggestions. Try again." : aiErr(e); }
}
async function ideaAsk(id){
  const x = IDEAS.find(i=>i.id===id) || (AIIDEAS||[]).find(i=>i.id===id) || ((S.progress.aiIdeas||{}).items||[]).find(i=>i.id===id), out = document.getElementById("ia-"+id); if (!x || !out) return;
  stream(`Coach a law graduate in India to build this portfolio project: "${x.t}". What to publish: ${x.show}. Give: 1) a 7-step plan with what to produce at each step, 2) free tools and where to get synthetic or public data, 3) how to structure the GitHub folder and README, 4) how to describe it in one resume bullet. Plain text, no markdown symbols, under 280 words.`, out, {cache:false});
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-ideast],[data-ideasort],[data-ideaask],#ideaSuggest"); if (!el) return;
  const d = el.dataset;
  if (d.ideast !== undefined) { const [id, v] = d.ideast.split("|"); const st = ideaState(id), was = st.status; st.status = v; if (v === "done" && was !== "done") logActivity(2); save("progress"); rerender(); return; }
  if (d.ideasort) { ideaSort = d.ideasort; rerender(); return; }
  if (d.ideaask) { ideaAsk(d.ideaask); return; }
  if (el.id === "ideaSuggest") { ideaSuggest(); return; }
});
document.addEventListener("change", e => { if (e.target.id === "ideaRole") { ideaRole = e.target.value; rerender(); } });

/* LabOS desktop shortcut to the ideas board */
losRegister({id:"ideas", title:"Project Ideas", icon:"💡", color:"#A2620A", size:[760,560], mount(body){
  const rid = focusRole(), top = IDEAS.filter(x => x.roles.includes(rid)).sort((a,b)=>b.w-a.w).slice(0,5);
  body.innerHTML = `<div class="wpad"><h3 style="margin:0">Top ideas for ${esc(roleShort(rid))}</h3><p class="num">Build one, publish it, and it counts more than three certificates on a fresher's CV.</p>
    ${top.map(x=>`<div class="inset" style="display:grid;gap:4px;margin:6px 0"><div class="row between"><b>${esc(x.t)}</b>${stars(x.w)}</div><span class="num">${esc(x.eff)} · ${esc(x.tools.join(", "))}</span></div>`).join("")}
    <button class="btn" data-go="ideas">Open the full ideas board</button></div>`;
}});

/* ---------- AI Governance Desk (LabOS app + tool project) ---------- */
const AIDESK_SYS = [
 ["CV-ranking tool sold by an Indian vendor to a Dutch employer (you are the vendor)","high","provider","Annex III employment → provider duties (risk management, documentation, oversight design, conformity) by Dec 2027."],
 ["Website chatbot answering customers' FAQs for an Irish bank (you are the bank)","limited","deployer","Transparency: tell people they're talking to AI (Art. 50)."],
 ["Emotion recognition of call-centre staff in an EU office to score their mood","prohibited","deployer","Emotion recognition in the workplace is banned (Art. 5), except medical or safety reasons."],
 ["Spam filter on the company mailbox","minimal","deployer","No new AI Act duties."],
 ["Credit-scoring model a German bank bought and uses for consumer loans (you are the bank)","high","deployer","Annex III creditworthiness → deployer duties incl. oversight, logs and a FRIA."],
 ["Large foundation model your start-up trains and offers via API in the EU","gpai","provider","General-purpose AI duties since Aug 2025: documentation, copyright policy, training summary."],
 ["AI that scores entrance exams for a French university (you are the university)","high","deployer","Annex III education → high-risk deployer duties."],
 ["Your firm rebrands a US vendor's hiring model as its own product in the EU","high","provider","Putting your name on it makes you the provider."]
];
const AIDESK_SAFE = [
 ["Bias testing across gender, age and region before launch",1],["Human review of every rejection, with the reviewer's reasons recorded",1],["Candidates told AI is used and how to ask for human review",1],["Logs of inputs and outputs kept at least 6 months",1],["Impact assessment (DPIA + FRIA-style) signed off",1],["Workers' representatives informed before use",1],["Vendor contract: documentation, incident notice, no training on our data",1],
 ["Hide the AI from candidates to avoid complaints",0],["Let the AI auto-reject below a score with no review",0],["Delete all logs weekly to reduce data",0],["Skip testing because the vendor says it's fair",0],["Use candidates' social media photos to improve accuracy",0]
];
losRegister({id:"aigov", title:"AI Governance Desk", icon:"⚖", color:"#6D28D9", size:[1000,640], mount(body, ctx, args){
  const st = ctx.st; st.cls ||= {}; st.role ||= {}; st.safe ||= {}; if (!Array.isArray(st.order) || st.order.length !== AIDESK_SAFE.length) st.order = shuffle(AIDESK_SAFE.map((_,i)=>i)); let tab = (args && args.op && opTabFor("aigov", args.op)) || (args && args.tab) || st.tab || "cls";
  const draw = () => {
    const tiers = [["prohibited","Prohibited"],["high","High-risk"],["limited","Transparency"],["minimal","Minimal"],["gpai","GPAI model"]];
    const clsOk = AIDESK_SYS.every((s,i) => st.cls[i] === s[1] && st.role[i] === s[2]);
    body.innerHTML = `<div class="wpad">${appTabs([["cls","1 · Classify systems"],["safe","2 · Safeguards for a hiring tool"]], tab, "aitab")}${opStrip("aigov", tab)}
    ${tab === "cls" ? `<p class="num">For each system choose the EU AI Act category and your role. Check to see explanations.</p>
      <div class="aidesk">${AIDESK_SYS.map((s,i) => { const done = st.checked && st.cls[i] !== undefined; const ok = st.cls[i] === s[1] && st.role[i] === s[2];
        return `<div class="aisys ${st.checked ? (ok ? "good" : "bad") : ""}"><b>${esc(s[0])}</b><div class="row"><select data-aicls="${i}" aria-label="Category">${[["","Category…"],...tiers].map(([v,l])=>`<option value="${v}" ${st.cls[i]===v?"selected":""}>${l}</option>`).join("")}</select><select data-airole="${i}" aria-label="Role"><option value="">Role…</option><option value="provider" ${st.role[i]==="provider"?"selected":""}>Provider</option><option value="deployer" ${st.role[i]==="deployer"?"selected":""}>Deployer</option></select></div>${done?`<span class="num">${ok?"✓ ":"✗ "}${esc(s[3])}</span>`:""}</div>`; }).join("")}</div>
      <div class="row"><button class="btn" data-aicheck="1">Check</button>${clsOk?'<span class="pill ok">All correct</span>':""}</div>`
    : `<p class="num">An Indian vendor's AI interview-scoring tool will be used by your EU client to shortlist applicants. Select the safeguards you'd require before go-live (pick all that apply).</p>
      <div class="aisafe">${st.order.map(i=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" data-aisafe="${i}" ${st.safe[i]?"checked":""}> ${esc(AIDESK_SAFE[i][0])}</label>`).join("")}</div>
      <div class="row"><button class="btn" data-aisafecheck="1">Score my safeguards</button>${st.safeScore!==undefined?`<span class="pill ${st.safeScore===AIDESK_SAFE.length?"ok":"warn"}">${st.safeScore}/${AIDESK_SAFE.length} right</span>`:""}</div>
      ${st.safeShown?`<div class="inset">${st.order.map(i=>[AIDESK_SAFE[i],i]).map(([s,i])=>`<div class="num">${(!!st.safe[i]) === !!s[1] ? "✓" : "✗"} ${esc(s[0])} — ${s[1] ? "required" : "don't"}</div>`).join("")}</div>`:""}`}</div>`;
  };
  body.addEventListener("click", e => { const el = e.target.closest("[data-aitab],[data-aicheck],[data-aisafecheck]"); if (!el) return; const d = el.dataset;
    if (d.aitab) { tab = st.tab = d.aitab; ctx.save(); draw(); return; }
    if (d.aicheck) { st.checked = true; const ok = AIDESK_SYS.every((s,i) => st.cls[i] === s[1] && st.role[i] === s[2]); if (ok && !st.clsDone) { st.clsDone = true; logActivity(1); ctx.xp(60, "AI Act classification (8/8)"); } ctx.save(); ctx.check(); draw(); return; }
    if (d.aisafecheck) { st.safeShown = true; st.safeScore = AIDESK_SAFE.filter((s,i) => (!!st.safe[i]) === !!s[1]).length; if (st.safeScore === AIDESK_SAFE.length && !st.safeDone) { st.safeDone = true; logActivity(1); ctx.xp(60, "High-risk safeguards set"); } ctx.save(); ctx.check(); draw(); return; } });
  body.addEventListener("change", e => { const d = e.target.dataset;
    if (d.aicls !== undefined) { st.cls[d.aicls] = e.target.value; st.checked = false; ctx.save(); }
    if (d.airole !== undefined) { st.role[d.airole] = e.target.value; st.checked = false; ctx.save(); }
    if (d.aisafe !== undefined) { st.safe[d.aisafe] = e.target.checked; st.safeShown = false; ctx.save(); } });
  draw();
}});
OPS.push({id:"op-aigov",kind:"GRC tool",app:"aigov",tab:"cls",topic:"ai-euact",topics:["ai-euact","ai-risk","aigov"],xp:120,title:"Classify AI systems and set high-risk safeguards",
  brief:"Classify eight AI systems under the EU AI Act with your role, then choose the safeguards a high-risk hiring tool needs before go-live.",
  steps:[["Classify all 8 systems (category + role) correctly", st => !!st.clsDone],["Select exactly the right safeguards for the hiring tool", st => !!st.safeDone]]});

/* ---------- Automation tools page ---------- */
const AUTO_TOOLS = [
 {id:"pa",name:"Microsoft Power Automate",color:"#0066FF",icon:"⟳",tag:"Low-code workflows inside Microsoft 365",
  where:"Most Indian enterprises, banks, GCCs and IT services firms run Microsoft 365, so Power Automate is often already licensed. Used for approvals, reminders, form intake and moving data between Outlook, Teams, SharePoint and Excel.",
  free:"Learn free on Microsoft Learn; practise with a Microsoft 365 work/school account, a free trial, or the Power Automate free plan where available in your region.",
  uses:["Quarterly evidence-request emails with reminders","Breach-report form → SharePoint list → Teams alert to the DPO","Policy attestation with an Approve button in Teams"],
  plan:[["Week 1","Microsoft Learn: 'Get started with Power Automate'. Build a flow: new Form response → email."],["Week 2","Approvals and conditions: policy sign-off flow with reminders."],["Week 3","SharePoint lists as a tracker; scheduled flows; error handling (configure run after)."],["Week 4","Build the evidence-chasing flow end to end; document owner, service account and run history as audit evidence."]],
  cert:"PL-900: Microsoft Power Platform Fundamentals",links:[["Microsoft Learn: Power Automate","https://learn.microsoft.com/en-us/training/powerplatform/power-automate"],["Power Automate documentation","https://learn.microsoft.com/en-us/power-automate/"]],yt:"Power Automate tutorial for beginners approval flow"},
 {id:"py",name:"Python",color:"#2B5B84",icon:"🐍",tag:"Scripts for data, checks and reports",
  where:"Used everywhere for data work: reconciling lists, cleaning exports, filling templates, calling APIs. Audit, risk and compliance analytics teams increasingly expect basic Python, and AI assistants make writing scripts faster (you still must read and check them).",
  free:"Completely free: install Python or use Google Colab in the browser. Courses: Python for Everybody, Automate the Boring Stuff.",
  uses:["Leavers vs active accounts reconciliation","Combining 30 evidence spreadsheets into one report","Scanning a folder of PDFs for PAN or Aadhaar patterns (on synthetic data)"],
  plan:[["Week 1","Python basics in Colab: variables, lists, loops, if-statements (Python for Everybody ch. 1–5)."],["Week 2","Files and CSV: read and write CSVs; pandas read_csv, filter, merge."],["Week 3","Excel with openpyxl/pandas; dates; simple charts."],["Week 4","Build the leaver-access check project; explain each line in plain words."]],
  cert:"PCEP: Certified Entry-Level Python Programmer (Python Institute)",links:[["Python for Everybody","https://www.py4e.com/"],["Automate the Boring Stuff","https://automatetheboringstuff.com/"],["Google Colab","https://colab.research.google.com/"]],yt:"Python pandas tutorial beginners compare two excel files"},
 {id:"zp",name:"Zapier (or n8n / Make)",color:"#FF4F00",icon:"⚡",tag:"No-code links between cloud apps",
  where:"Start-ups and SaaS companies outside the Microsoft world glue Google Workspace, Slack, HubSpot, Jira and forms together with Zapier. n8n is open source and can be self-hosted, which matters when data must stay in-house or in India; Make is another popular option.",
  free:"Zapier and Make have free tiers; n8n is free to self-host. Zapier Learn has short free courses.",
  uses:["Vendor-intake form → Jira security ticket → Slack alert","New DSAR web form → Google Sheet tracker with due date","Weekly reminder to control owners from a Sheet"],
  plan:[["Week 1","Zapier Learn basics: triggers, actions, a two-step Zap."],["Week 2","Filters and paths; formatter steps for dates (due date = +30 days)."],["Week 3","Build the vendor-intake Zap; add error notifications."],["Week 4","Rebuild one flow in n8n to understand self-hosting and data control; write the governance note."]],
  cert:"No formal certificate; Zapier Learn courses and a public demo are the proof",links:[["Zapier Learn","https://zapier.com/learn"],["n8n documentation","https://docs.n8n.io/"]],yt:"Zapier tutorial for beginners 2026"}
];
const FLOW_SCEN = [
 {id:"ev",t:"Quarterly evidence chasing (company runs Microsoft 365)",tool:"pa",trig:"schedule",cond:"status-due",acts:["email-owner","teams-remind","mark-received"]},
 {id:"dsar",t:"DSAR intake from a web form (start-up on Google Workspace)",tool:"zp",trig:"form",cond:"none",acts:["sheet-row","due-date","ack-email"]},
 {id:"leaver",t:"Compare 40,000-row HR leavers file with account export",tool:"py",trig:"schedule",cond:"mismatch",acts:["csv-report","email-it"]}
];
const FLOW_OPTS = {
 trig:[["schedule","Every quarter / month (schedule)"],["form","A new form submission"],["email","A new email arrives"],["file","A file is uploaded"]],
 cond:[["none","No condition"],["status-due","Only controls with status 'evidence due'"],["mismatch","Only people who left but still have access"],["vip","Only emails from the CEO"]],
 acts:[["email-owner","Email each control owner an upload link"],["teams-remind","Remind in Teams after 5 and 10 days"],["mark-received","Mark 'Received' when a file lands"],["sheet-row","Add a tracker row"],["due-date","Calculate the due date"],["ack-email","Send an acknowledgement"],["csv-report","Write an exceptions CSV"],["email-it","Email the report to IT"],["delete-users","Delete the accounts automatically"]],
 tool:[["pa","Power Automate"],["py","Python"],["zp","Zapier / n8n"]]
};
let flowScen = "ev", flowPick = {trig:"", cond:"", acts:[], tool:""}, flowRes = "";
function viewAutomation(){
  const sc = FLOW_SCEN.find(s => s.id === flowScen), lab = (k, v) => (FLOW_OPTS[k].find(x => x[0] === v) || ["", "—"])[1];
  return `<div><span class="eyebrow">Tools · Automation</span><h2>The three automation tools used almost everywhere</h2></div>
  <p class="lede">Compliance work is full of chasing, copying and checking. These three tools cover nearly every workplace: <b>Power Automate</b> (Microsoft 365 companies), <b>Python</b> (any data work) and <b>Zapier/n8n</b> (cloud start-ups). Learn the shared logic once: trigger → condition → actions.</p>
  <div class="row"><button class="btn" data-go="t-automate">Study the subject</button><button class="btn ghost" data-go="proj-t-automate-1">Start the Beginner project</button></div>
  <div class="grid3 autogrid">${AUTO_TOOLS.map(t=>`<div class="card autotool" style="--tc:${t.color}"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="aticon">${t.icon}</span><div><h3>${esc(t.name)}</h3><span class="num">${esc(t.tag)}</span></div></div>
    <p style="font-size:.9rem;margin:0"><b>Where you'll meet it:</b> ${esc(t.where)}</p>
    <p style="font-size:.88rem;margin:0" class="muted"><b>Free access:</b> ${esc(t.free)}</p>
    <b style="font-size:.9rem">GRC uses</b><ul class="clean">${t.uses.map(u=>`<li>${esc(u)}</li>`).join("")}</ul>
    <details><summary class="link">4-week study plan</summary><div style="display:grid;gap:6px;margin-top:6px">${t.plan.map(([w,d])=>`<div><b>${w}</b> <span class="num">${esc(d)}</span></div>`).join("")}</div></details>
    <span class="num"><b>Certificate:</b> ${esc(t.cert)}</span>
    <div class="row">${t.links.map(([l,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join(" · ")}<a href="${yt(t.yt)}" target="_blank" rel="noopener">Videos</a></div></div>`).join("")}</div>
  <div class="card"><span class="eyebrow">Which tool should I use?</span>
    <div class="decide"><div><b>Is the work inside Outlook, Teams, SharePoint or Excel at a Microsoft 365 company?</b><span>→ Power Automate</span></div><div><b>Is it lots of data, messy files, or logic too complex for drag-and-drop?</b><span>→ Python</span></div><div><b>Is it connecting cloud apps like Google Sheets, Slack, HubSpot or Jira?</b><span>→ Zapier, or n8n if data must stay in-house</span></div></div></div>
  <div class="card flowcard"><div class="row between"><div><span class="eyebrow">Practice</span><h3>Flow builder</h3></div><select id="flowScen" aria-label="Scenario">${FLOW_SCEN.map(s=>`<option value="${s.id}" ${s.id===flowScen?"selected":""}>${esc(s.t)}</option>`).join("")}</select></div>
    <p class="num">Design the automation: pick the tool, trigger, condition and actions, then check.</p>
    <div class="form">${["tool","trig","cond"].map(k=>`<label class="f">${k==="tool"?"Tool":k==="trig"?"Trigger":"Condition"}<select data-flow="${k}"><option value="">Choose…</option>${FLOW_OPTS[k].map(([v,l])=>`<option value="${v}" ${flowPick[k]===v?"selected":""}>${esc(l)}</option>`).join("")}</select></label>`).join("")}</div>
    <b style="font-size:.9rem">Actions</b><div class="grid2" style="gap:4px">${FLOW_OPTS.acts.map(([v,l])=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" data-flowact="${v}" ${flowPick.acts.includes(v)?"checked":""}> ${esc(l)}</label>`).join("")}</div>
    <div class="flowviz">${[["Trigger",lab("trig",flowPick.trig)],["Condition",lab("cond",flowPick.cond)],...(flowPick.acts.length?flowPick.acts.map(a=>["Action",lab("acts",a)]):[["Action","—"]])].map(([h,v],i)=>`${i?'<span class="arr" aria-hidden="true">→</span>':""}<div class="fnode"><span class="num">${h}</span><b>${esc(v)}</b></div>`).join("")}</div>
    <div class="row"><button class="btn" data-flowcheck="1">Check my design</button><button class="link" data-flowreset="1">Reset</button></div>
    ${flowRes?`<div class="${flowRes.startsWith("✓")?"info":"note"}">${flowRes}</div>`:""}</div>`;
}
function flowCheck(){
  const sc = FLOW_SCEN.find(s => s.id === flowScen), p = flowPick, msgs = [];
  if (p.tool !== sc.tool) msgs.push(`Tool: ${sc.tool === "pa" ? "Power Automate fits a Microsoft 365 company." : sc.tool === "py" ? "Python handles 40,000-row comparisons easily." : "Zapier/n8n connect cloud apps like Google Workspace."}`);
  if (p.trig !== sc.trig) msgs.push(`Trigger: this should start ${sc.trig === "schedule" ? "on a schedule" : "when the form is submitted"}.`);
  if (p.cond !== sc.cond) msgs.push(`Condition: ${sc.cond === "none" ? "no filter needed; every request counts" : sc.cond === "status-due" ? "only chase controls whose evidence is due" : "only flag people who left but still have access"}.`);
  const miss = sc.acts.filter(a => !p.acts.includes(a)), extra = p.acts.filter(a => !sc.acts.includes(a));
  if (miss.length) msgs.push("Missing actions: " + miss.map(a => FLOW_OPTS.acts.find(x=>x[0]===a)[1]).join("; ") + ".");
  if (extra.includes("delete-users")) msgs.push("Never delete accounts automatically: a human must confirm (people return, names collide, legal holds apply).");
  else if (extra.length) msgs.push("Not needed here: " + extra.map(a => FLOW_OPTS.acts.find(x=>x[0]===a)[1]).join("; ") + ".");
  if (!msgs.length) { if (!(S.progress.flows||{})[sc.id]) { (S.progress.flows ||= {})[sc.id] = today(); logActivity(1); save("progress"); } flowRes = "✓ Solid design. Add an owner, a service account and a failure alert, and it's audit-ready."; }
  else flowRes = esc(msgs.join(" "));
  rerender();
}
document.addEventListener("change", e => {
  const d = e.target.dataset;
  if (e.target.id === "flowScen") { flowScen = e.target.value; flowPick = {trig:"", cond:"", acts:[], tool:""}; flowRes = ""; rerender(); return; }
  if (d && d.flow) { flowPick[d.flow] = e.target.value; flowRes = ""; rerender(); return; }
  if (d && d.flowact) { const s = new Set(flowPick.acts); e.target.checked ? s.add(d.flowact) : s.delete(d.flowact); flowPick.acts = FLOW_OPTS.acts.map(x=>x[0]).filter(v => s.has(v)); flowRes = ""; rerender(); }
});
document.addEventListener("click", e => { const el = e.target.closest("[data-flowcheck],[data-flowreset]"); if (!el) return; if (el.dataset.flowcheck) flowCheck(); else { flowPick = {trig:"", cond:"", acts:[], tool:""}; flowRes = ""; rerender(); } });
