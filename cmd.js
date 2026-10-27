/* ================= COMMAND BAR · HELP & SUPPORT · STUDENT SUPPORT (MENTORS) · MENU SEARCH ================= */

/* ---------- command bar ---------- */
const CMDS = [
 {c:"/help",d:"List every command",k:"all"},
 {c:"/about",d:"What this is, in plain words",k:"all"},
 {c:"/what",d:"Define a term: /what consent manager",k:"all",arg:"term"},
 {c:"/how",d:"Step-by-step how-to: /how run a DPIA",k:"all",arg:"task"},
 {c:"/why",d:"Why it matters to employers and to you",k:"topic role"},
 {c:"/example",d:"A realistic Indian workplace example",k:"topic role"},
 {c:"/eli5",d:"The simplest possible explanation, with a legal analogy",k:"topic role"},
 {c:"/jargon",d:"Key terms decoded",k:"topic role"},
 {c:"/summary",d:"Five-line recap",k:"topic role"},
 {c:"/mistakes",d:"Common mistakes and interview traps",k:"topic role"},
 {c:"/quiz",d:"Three practice questions with answers",k:"topic role"},
 {c:"/interview",d:"Interview questions with model answers",k:"topic role"},
 {c:"/compare",d:"Compare two things: /compare GDPR vs DPDP",k:"topic role",arg:"a vs b"},
 {c:"/tools",d:"Tools used and what each does",k:"topic role"},
 {c:"/career",d:"Where this leads: roles and progression",k:"topic role"},
 {c:"/steps",d:"A two-week study plan using this app",k:"topic role"},
 {c:"/ai",d:"How AI is changing this, next year and in 10 years",k:"topic role"},
 {c:"/where",d:"Find a feature in this app: /where resume upload",k:"app",arg:"feature"},
 {c:"/fix",d:"Troubleshoot a problem: /fix Gmail not syncing",k:"app",arg:"problem"}
];
const CMDH = {};
function cmdCtxName(kind, id){ return kind === "topic" ? TOPIC[id].title : kind === "role" ? ROLE[id].name : "the Career Count app"; }
function cmdBar(kind, id){
  const key = kind + "|" + id, list = CMDS.filter(x => x.k === "all" || x.k.split(" ").includes(kind));
  const hist = CMDH[key] || [];
  return `<div class="cmdbar" data-cmdctx="${key}">
    <div class="cmdin"><span class="cmdp" aria-hidden="true">›</span><input type="text" class="cmdinput" id="cmd-${kind}-${id}" data-cmdinput="${key}" autocomplete="off" spellcheck="false" placeholder="${kind==="app"?"Ask how to do anything in this app, or type / for commands":"Ask anything about "+esc(cmdCtxName(kind,id).slice(0,40))+", or type / for commands"}" aria-label="Command or question"><button class="btn sm" data-cmdgo="${key}">Ask</button></div>
    <div class="cmdsug" hidden role="listbox"></div>
    <div class="cmdchips">${list.filter(x=>x.c!=="/help").slice(0, kind==="app"?6:12).map(x=>`<button class="chip" data-cmdrun="${key}|${x.c}${x.arg?" ":""}" title="${esc(x.d)}">${x.c}</button>`).join("")}<button class="chip" data-cmdrun="${key}|/help">/help</button></div>
    <div class="cmdout" aria-live="polite" hidden></div>
    ${hist.length?`<details class="cmdhist"><summary class="link">Earlier answers (${hist.length})</summary>${hist.slice().reverse().map(h=>`<div class="cmdh"><b>${esc(h.q)}</b><p>${esc(h.a)}</p></div>`).join("")}</details>`:""}</div>`;
}
function cmdContext(kind, id){
  if (kind === "topic") { const t = TOPIC[id]; return topicContext(t) + "\nKey terms: " + Object.keys(t.terms||{}).join(", ") + "\nRoles that need it: " + rolesNeeding(id).map(x=>roleShort(x.r.id)+" ("+x.need+")").join(", "); }
  if (kind === "role") { const R = ROLE[id], P = pathOf(id), I = ROLE_INFO[id] || {}; return `Role: ${R.name}\nThe job: ${I.what||""}\nCore subjects: ${(P?P.core:[]).map(x=>TOPIC[x]&&TOPIC[x].title).filter(Boolean).join(", ")}\nSupporting: ${(P?P.support:[]).map(x=>TOPIC[x]&&TOPIC[x].title).filter(Boolean).join(", ")}\nEmployers ask for: ${(ROLE_REQ[id]||[]).map(r=>r[0]).join("; ")}\nIndustry: ${I.industry||""}\nAI outlook: ${AI_ROLE[id]?AI_ROLE[id].y10:""}`.slice(0,6000); }
  return APP_GUIDE();
}
function cmdPrompt(kind, id, raw){
  const subj = cmdCtxName(kind, id), m = raw.match(/^\/(\w+)\s*(.*)$/), cmd = m ? "/" + m[1].toLowerCase() : "", arg = m ? m[2].trim() : raw.trim();
  const who = "You help Jyotirmaya, a 2025 Indian law graduate (Advocate) with US consumer-credit compliance experience, who is moving into privacy, GRC and AI governance roles. Plain English, short paragraphs or numbered lines, no markdown symbols like # or **. Explain any jargon in a few words.";
  if (kind === "app") {
    const base = `${who}\nYou are the in-app help assistant for the Career Count web app. Answer ONLY about using this app, based on the guide below. If something isn't in the guide, say so and suggest the closest feature. Mention the exact menu item to tap.\n\nAPP GUIDE:\n${APP_GUIDE()}\n\n`;
    if (cmd === "/where") return base + `Where in the app can the user find: "${arg || "the main features"}"? Give the menu path and one tip. Under 120 words.`;
    if (cmd === "/fix") return base + `Help troubleshoot: "${arg || "something isn't working"}". Give likely causes and numbered fixes, including permissions (the artifact's Permissions menu), reconnecting connectors in claude.ai Settings → Connectors, and refreshing. Under 180 words.`;
    if (cmd === "/how") return base + `Explain step by step how to "${arg || "get started"}" in this app. Numbered steps, under 180 words.`;
    if (cmd === "/about") return base + `Give a short tour of the app: the five most useful features for a job seeker and where they are. Under 180 words.`;
    return base + `User's question: ${arg || raw}\nAnswer in under 180 words.`;
  }
  const ctx = `CONTEXT (${kind === "role" ? "role" : "subject"}: ${subj}):\n${cmdContext(kind, id)}\n\n`;
  const P = {
    "/about":`Explain what ${subj} is in plain words: what it is, why it exists, who does it, and a one-line Indian example. Under 200 words.`,
    "/what": arg ? `Define "${arg}" in the context of ${subj}: plain-words meaning, an everyday analogy, and one workplace example. Under 150 words.` : `List the 6 most important terms in ${subj}, each with a one-line plain definition.`,
    "/how": arg ? `Explain step by step how to ${arg}, in the context of ${subj}. Numbered steps a beginner can follow, the evidence or output at the end, and one common mistake. Under 230 words.` : `Explain how this work is actually done day to day in ${subj}, as numbered steps. Under 220 words.`,
    "/why":`Why does ${subj} matter: to companies, to regulators, and to Jyotirmaya's job search in India? Under 180 words.`,
    "/example":`Give one realistic Indian workplace example for ${subj}: the company, what happens, which rule or practice applies, what the analyst does. Under 200 words.`,
    "/eli5":`Explain ${subj} as simply as possible, using an analogy from law or court practice. Under 150 words.`,
    "/jargon":`List 8 jargon terms used in ${subj} that aren't already obvious, each with a one-line plain meaning.`,
    "/summary":`Summarise ${subj} in five short lines a learner can memorise.`,
    "/mistakes":`List the 5 most common mistakes beginners and interview candidates make about ${subj}, each with the correct view.`,
    "/quiz":`Write 3 multiple-choice questions on ${subj} (4 options each). Put all answers with one-line explanations at the end under 'Answers'.`,
    "/interview":`Give 3 interview questions an Indian employer might ask about ${subj} for an entry-level role, each followed by a model answer in 2–3 sentences that uses Jyotirmaya's legal and compliance background.`,
    "/compare": `Compare ${arg || "the two most commonly confused ideas in " + subj} in plain words: a short table-like list of differences (purpose, who it applies to, key duties, deadlines or numbers), then one line on when each matters.`,
    "/tools":`Which tools and software are used for ${subj} in Indian workplaces? For each: what it does in one line, and a free way to try or learn it.`,
    "/career":`Where can knowledge of ${subj} take Jyotirmaya? Entry roles, next steps after 2–3 years, and longer-term options, with one line each.`,
    "/steps":`Make a two-week study plan for ${subj} (one short line per day) using: reading the sub-topics, the quiz, the Beginner project and, if relevant, the Lab. End with how she will know she's ready.`,
    "/ai":`How is AI changing ${subj}? Next 12 months, 3 years, 10 years; what AI will automate; what stays human; three things to learn now. Honest about uncertainty. Under 230 words.`
  };
  return `${who}\n\n${ctx}TASK: ${P[cmd] || `Answer this question about ${subj}: ${raw}\nUnder 220 words.`}`;
}
function cmdHelpHTML(kind){ return `<div class="cmdhelp">${CMDS.filter(x => x.k === "all" || x.k.split(" ").includes(kind)).map(x=>`<div><code>${x.c}${x.arg?" <"+x.arg+">":""}</code><span>${esc(x.d)}</span></div>`).join("")}<p class="num">Or just type a question in your own words.</p></div>`; }
async function cmdRun(key, raw){
  raw = String(raw||"").trim(); if (!raw) return;
  const [kind, id] = key.split("|"), box = document.querySelector(`.cmdbar[data-cmdctx="${CSS.escape(key)}"]`); if (!box) return;
  const out = box.querySelector(".cmdout"), inp = box.querySelector(".cmdinput"); out.hidden = false; box.querySelector(".cmdsug").hidden = true;
  if (inp) inp.value = "";
  if (/^\/help\b/i.test(raw)) { out.innerHTML = cmdHelpHTML(kind); return; }
  if (/^\/jargon\s*$/i.test(raw)) { const terms = kind === "topic" ? (TOPIC[id].terms||{}) : kind === "role" ? ((ROLE_INFO[id]||{}).jargon||{}) : {};
    if (Object.keys(terms).length) { out.innerHTML = `<div class="cmdq">${esc(raw)}</div><div class="jargon">${Object.entries(terms).map(([k,v])=>`<div class="jg"><b>${esc(k)}</b><span>${esc(v)}</span><button class="link" data-cmdrun="${key}|/what ${esc(k)}">Explain more</button></div>`).join("")}</div><button class="link" data-cmdrun="${key}|/jargon more">More terms from Claude</button>`; return; } }
  const q = document.createElement("div"); q.className = "cmdq"; q.textContent = raw;
  const a = document.createElement("div"); a.className = "ai cmda"; out.innerHTML = ""; out.append(q, a);
  const text = await stream(cmdPrompt(kind, id, raw.replace(/^\/jargon more$/i, "/jargon")), a, {cache:false});
  if (text) { (CMDH[key] ||= []).push({q:raw, a:String(text).slice(0,3000)}); if (CMDH[key].length > 8) CMDH[key].shift(); }
}
function cmdSuggest(inp){
  const key = inp.dataset.cmdinput, kind = key.split("|")[0], box = inp.closest(".cmdbar").querySelector(".cmdsug"), v = inp.value;
  if (!v.startsWith("/") || v.includes(" ")) { box.hidden = true; return; }
  const list = CMDS.filter(x => (x.k === "all" || x.k.split(" ").includes(kind)) && x.c.startsWith(v.toLowerCase()));
  if (!list.length) { box.hidden = true; return; }
  box.hidden = false; box.innerHTML = list.map((x,i)=>`<button role="option" class="${i===0?"on":""}" data-cmdpick="${x.c}${x.arg?" ":""}"><code>${x.c}</code><span>${esc(x.d)}</span></button>`).join("");
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-cmdgo],[data-cmdrun],[data-cmdpick]"); if (!el) return;
  if (el.dataset.cmdgo) { const box = el.closest(".cmdbar"), v = box.querySelector(".cmdinput").value; cmdRun(el.dataset.cmdgo, v); return; }
  if (el.dataset.cmdrun) { const s = el.dataset.cmdrun, i1 = s.indexOf("|"), i2 = s.indexOf("|", i1+1), key = s.slice(0,i2), cmd = s.slice(i2+1);
    const meta = CMDS.find(x => x.c === cmd.trim()); const box = document.querySelector(`.cmdbar[data-cmdctx="${CSS.escape(key)}"]`);
    if (meta && meta.arg && cmd.endsWith(" ") && box) { const inp = box.querySelector(".cmdinput"); inp.value = cmd; inp.focus(); return; }
    if (!box) { const tgt = key.split("|"); if (tgt[0] === "role") { go("role-" + tgt[1], "r-ask"); setTimeout(() => cmdRun(key, cmd), 60); } return; }
    box.scrollIntoView({block:"nearest"}); cmdRun(key, cmd); return; }
  if (el.dataset.cmdpick) { const inp = el.closest(".cmdbar").querySelector(".cmdinput"); inp.value = el.dataset.cmdpick; inp.focus(); el.closest(".cmdsug").hidden = true; const meta = CMDS.find(x => x.c === el.dataset.cmdpick.trim()); if (meta && !meta.arg) cmdRun(inp.dataset.cmdinput, inp.value); }
});
document.addEventListener("input", e => { if (e.target.dataset && e.target.dataset.cmdinput) cmdSuggest(e.target); });
document.addEventListener("keydown", e => {
  const inp = e.target; if (!(inp.dataset && inp.dataset.cmdinput)) return;
  const sug = inp.closest(".cmdbar").querySelector(".cmdsug"), opts = sug.hidden ? [] : [...sug.querySelectorAll("button")], cur = opts.findIndex(b => b.classList.contains("on"));
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && opts.length) { e.preventDefault(); const n = (cur + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length; opts.forEach((b,i)=>b.classList.toggle("on", i===n)); return; }
  if (e.key === "Tab" && opts.length) { e.preventDefault(); inp.value = opts[Math.max(0,cur)].dataset.cmdpick; sug.hidden = true; return; }
  if (e.key === "Enter") { e.preventDefault(); if (opts.length && cur >= 0 && !inp.value.includes(" ")) { inp.value = opts[cur].dataset.cmdpick; sug.hidden = true; const meta = CMDS.find(x => x.c === inp.value.trim()); if (meta && meta.arg) return; } cmdRun(inp.dataset.cmdinput, inp.value); }
  if (e.key === "Escape") sug.hidden = true;
});

/* ---------- app guide (used by Help & support) ---------- */
const APP_NOTES = {
 home:"Dashboard: greeting, continue-learning shortcuts, activity squares (each square is a day), the 'Studying for' cube with your role, tiles for Lab, applications, news and more.",
 insights:"Insights & coach: what you got wrong in quizzes, projects and Lab, plus a 7-day plan from Claude.",
 learn:"Learning path: the Venn overview (covered / required / should cover) for your role, then 'Must know' (only what to read and tools to use) or the full path. Tap a subject to open its page with sub-topics, quiz, jargon, videos, AI impact and the command bar.",
 path:"Role roadmaps: stage-by-stage plan for any role, employer requirements checked against your resume, certificates.",
 lab:"Cyber Lab (LabOS): a simulated computer desktop. Apps: Terminal (Linux practice, Shell Quest, server hardening), Inbox Defender (phishing), NetBuilder, VulnScan, Crypto Bench, SIEM Hunt, GRC Console, Privacy Console. Tool projects are listed in the Projects/Ops panel.",
 ideas:"Project ideas: weighted portfolio project ideas per role, plus AI suggestions refreshed monthly. Add ideas to your plan and track them.",
 automation:"Automation tools: Power Automate, Python and Zapier explained side by side with study plans and a flow builder.",
 projects:"Projects: three projects per subject (Beginner, Intermediate, Advanced). Submit work for Claude's review; hints after 5 failed reviews, cheatsheet after 10. Each project page has 'Publish to GitHub' to package or push your work.",
 certs:"Certifications: pick role and company type; see which certificates to do in which order and how much of each exam you've covered.",
 videos:"Video bookmarks: timestamps you saved from YouTube videos.",
 roles:"Roles & readiness: every role with readiness %; tap a role to open its own page (job explained, typical day, career ladder, jargon, must-know subjects and tools, AI impact over 10 years, employer requirements, roadmap, projects, command bar).",
 matrix:"Roles × subjects: a grid showing which roles need which subjects (core or supporting).",
 applications:"Applications & Gmail: tracker synced from Gmail every 6 hours (background task) or with Sync now; AI reply drafts saved to Gmail drafts; sending needs your click and confirmation. Reply preferences (salary, notice, availability) on the Preferences tab.",
 jobs:"Jobs to target: search strings and company lists.",
 resume:"Resume builder: upload a PDF or Word resume first; see how hiring systems read it, gaps per role, what employers want, and an ATS-friendly rebuilt version to download.",
 linkedin:"LinkedIn: headline options, About text, skills and profile checklist.",
 network:"Network: find people, prepare connection notes, track follow-ups; draft emails into Gmail.",
 news:"News & regulations: regulatory news from governments and institutions, updated twice a week (Monday and Thursday) by a scheduled task; filter by jurisdiction, type and impact.",
 updates:"Updates: weekly web check on law changes and skills trending in job posts.",
 support:"Help & support: this AI help assistant, troubleshooting and problem reports.",
 mentors:"Student support: mentor directory (add mentors), message or ring a mentor, and 3 rooms per mentor with live chat and a voice & screen-share link. Full in-app calling is planned for a future integration.",
 profile:"Profile & avatar: details, target roles, skills from work, certificates held, photo upload (photos are resized on your device)."
};
function APP_GUIDE(){
  const items = MENU.flatMap(([g, list]) => list.map(([k,l]) => `- ${g} → ${l}: ${APP_NOTES[k] || ""}`)).join("\n");
  return `Navigation: on a computer the left sidebar lists everything; on a phone tap Menu (top right) or More (bottom bar). The menu has a search box. The 'Studying for' button picks your role; subjects, Venn overview, projects and Lab follow it.\nPermissions: AI features need 'Claude' allowed, Gmail features need the Gmail connector allowed, file downloads need 'Downloads' — all from the artifact's Permissions menu; Gmail must be connected in claude.ai Settings → Connectors.\nSaving: progress saves to your claude.ai account automatically (and in this browser).\nPages:\n${items}\nCommand bar: on every subject page and role page; type / to see commands such as /what, /how, /about, /quiz, /interview, /ai.`;
}

/* ---------- Help & support page ---------- */
const FAQ = [
 ["The AI buttons say Claude isn't allowed","Open the artifact's Permissions menu (top of the page on claude.ai) and allow Claude. If you declined once, reload the page and try again."],
 ["Gmail isn't syncing","Check Gmail is connected in claude.ai Settings → Connectors, then on Applications press Sync now and choose Allow. The background task also syncs every 6 hours."],
 ["My photo won't upload from my phone","Photos are now resized on your phone before upload (HEIC, large JPEGs and PNGs work where your phone's browser can open them). If storage isn't available, the photo is saved in a compact form with your profile instead."],
 ["My progress disappeared","Progress saves to your claude.ai account. Make sure you're signed in to the same account; the 'Saved' note on Profile shows where it saved."],
 ["The page feels cramped on my phone","Use the bottom bar for Home, Learn, Lab and Projects; More opens the full menu with search. Rotate to landscape for the Lab desktop."],
 ["Downloads don't start","Allow Downloads in the Permissions menu; the page asks before saving any file."]
];
let supportLog = [];
function viewSupport(){
  return `<div><span class="eyebrow">Help & support</span><h2>Ask anything about using the app</h2></div>
  <p class="lede">The help assistant knows every page of this app. Ask in your own words, or use /where, /how and /fix.</p>
  <div class="card supportcard">${cmdBar("app","support")}</div>
  <div class="grid2">
    <div class="card"><span class="eyebrow">Getting started</span><ol class="clean numbered"><li>Pick the role you're studying for (the 'Studying for' button).</li><li>Open <button class="link" data-go="learn">Learning path</button> and read the 'Must know' list in order.</li><li>Take each subject's quiz, then its Beginner project.</li><li>Practise in the <button class="link" data-go="lab">Cyber Lab</button> if your role needs tools.</li><li>Upload your resume in the <button class="link" data-go="resume">Resume builder</button> and fix the gaps it lists.</li><li>Publish passed projects to GitHub from each project page.</li></ol></div>
    <div class="card"><span class="eyebrow">Common problems</span>${FAQ.map(([q,a])=>`<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </div>
  <div class="card"><span class="eyebrow">Report a problem</span><h3>Tell me what went wrong</h3>
    <label class="f">What happened, and on which page?<textarea id="supText" placeholder="e.g. On the Lab page the Terminal window won't open on my phone"></textarea></label>
    <div class="row"><button class="btn" id="supSend">Save report</button><button class="btn ghost" id="supDiag">Copy diagnostic info</button><span class="num" id="supMsg"></span></div>
    <p class="num">Reports are saved privately to your account so you can share them later. Diagnostic info contains only the page, screen size and which permissions are on, never your data.</p></div>
  <div class="card"><span class="eyebrow">Keyboard shortcuts</span><div class="cmdhelp"><div><code>Ctrl/⌘ + K</code><span>Jump to any page, subject or role</span></div><div><code>/</code><span>In a command bar: list commands</span></div><div><code>Esc</code><span>Close menus and pop-ups</span></div></div></div>`;
}
function diagInfo(){ return `Career Count diagnostics\nPage: ${current}\nScreen: ${innerWidth}x${innerHeight} (dpr ${devicePixelRatio})\nUser agent: ${navigator.userAgent}\nCapabilities: db=${!!cap.db} sample=${!!cap.sample} mcp=${!!cap.mcp} assets=${!!cap.assets}\nRole: ${focusRole()}\nDate: ${new Date().toISOString()}`; }
document.addEventListener("click", async e => {
  const el = e.target.closest("#supSend,#supDiag"); if (!el) return;
  const msg = document.getElementById("supMsg");
  if (el.id === "supDiag") { copyText(el, diagInfo()); return; }
  const t = (document.getElementById("supText").value || "").trim(); if (!t) { document.getElementById("supText").focus(); return; }
  const rec = {text:t.slice(0,4000), diag:diagInfo(), at:new Date().toISOString()};
  try { if (!cap.db) throw new Error("no db"); await cap.db.collection(trkRoot() + "/support/reports").add(rec); msg.textContent = "Saved to your account. Thank you."; }
  catch(err) { try { const a = JSON.parse(localStorage.getItem(LS("reports"))||"[]"); a.push(rec); localStorage.setItem(LS("reports"), JSON.stringify(a.slice(-20))); msg.textContent = "Saved in this browser."; } catch(_) { msg.textContent = "Couldn't save. Use Copy diagnostic info and keep it."; } }
  document.getElementById("supText").value = "";
});

/* ---------- Student support: mentors, rooms, ring, message ---------- */
const MENTOR_AREAS = ["Privacy & DPDP","GRC & ISO 27001","AI governance","Cybersecurity","Business development","Legal & contracts"];
let MENTORS = null, ROOM = {cap:null, cur:null, unsub:[], log:[], who:[]};
function mentorCode(){ const a = "abcdefghjkmnpqrstuvwxyz23456789"; let s = ""; for (let i=0;i<10;i++) s += a[Math.floor(Math.random()*a.length)]; return s; }
async function loadMentors(){
  if (cap.db) { try { const snap = await cap.db.collection("mentors").get(); MENTORS = snap.docs.map(d => Object.assign({id:d.id}, d.data())); } catch(e) { MENTORS = null; } }
  if (!MENTORS) { try { MENTORS = JSON.parse(localStorage.getItem(LS("mentors")) || "[]"); } catch(e) { MENTORS = []; } }
  if (current === "mentors") rerender();
}
async function saveMentor(m){
  m.updatedAt = new Date().toISOString();
  if (cap.db) { try { const data = Object.assign({}, m); delete data.id; if (m.id) await cap.db.collection("mentors").doc(m.id).set(data); else { const r = await cap.db.collection("mentors").add(data); m.id = r.id; } await loadMentors(); return true; } catch(e) {} }
  if (!m.id) m.id = "local-" + mentorCode(); const i = (MENTORS||[]).findIndex(x => x.id === m.id); if (i >= 0) MENTORS[i] = m; else (MENTORS ||= []).push(m);
  try { localStorage.setItem(LS("mentors"), JSON.stringify(MENTORS)); } catch(e) {} rerender(); return true;
}
function roomLink(m, n){ const r = (m.rooms||[])[n-1] || {}; return r.link && /^https:\/\//.test(r.link) ? r.link : `https://meet.jit.si/CareerCount-${m.code||"room"}-${n}`; }
function viewMentors(){
  if (MENTORS === null) { loadMentors(); }
  const list = MENTORS || [];
  return `<div><span class="eyebrow">Student support</span><h2>Mentors, rooms and help from qualified people</h2></div>
  <div class="info"><b>Preview of a future feature.</b> Add mentors you know (a senior from Provana, a privacy lawyer, a professor). Each mentor gets three rooms with live chat in this page and a voice & screen-share link. When the app grows, mentors will be able to sign in and answer students here directly.</div>
  <div class="grid3 mentorgrid">${list.map(m => `<div class="card mentor"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="avatar lg" style="background:${esc(m.color||"#1E8A4C")}">${esc(initials(m.name))}</span><div style="min-width:0"><h3>${esc(m.name)}</h3><span class="num">${esc(m.area||"")}${m.title?" · "+esc(m.title):""}</span></div></div>
      <p style="font-size:.9rem;margin:0">${esc(m.bio||"")}</p>
      <div class="row"><span class="pill ${m.available?"ok":""}">${m.available?"Available":"Busy"}</span>${m.slots?`<span class="num">${esc(m.slots)}</span>`:""}</div>
      <div class="row"><button class="btn sm" data-mring="${esc(m.id)}">📞 Ring</button><button class="btn sm ghost" data-mmsg="${esc(m.id)}">✉ Message</button><button class="link" data-medit="${esc(m.id)}">Edit</button></div>
      <div class="rooms">${[1,2,3].map(n => `<button class="roomtile" data-mroom="${esc(m.id)}|${n}"><b>${esc(((m.rooms||[])[n-1]||{}).name || "Room "+n)}</b><span class="num">Chat · voice · screen share</span></button>`).join("")}</div></div>`).join("")}
    ${MENTOR_AREAS.slice(0, Math.max(0, 3 - list.length)).map(a => `<div class="card mentor empty"><span class="eyebrow">Open slot</span><h3>${esc(a)} mentor</h3><p class="muted" style="font-size:.9rem">Add someone you trust in ${esc(a.toLowerCase())}.</p><button class="btn sm" data-medit="new|${esc(a)}">+ Add mentor</button></div>`).join("")}</div>
  <div class="card"><button class="btn ghost sm" data-medit="new|">+ Add another mentor</button></div>
  <div id="mentorPanel"></div>
  <div class="card"><span class="eyebrow">How rooms work</span><ul class="clean"><li>Each mentor has three rooms (for example: '1:1 doubts', 'Mock interviews', 'Portfolio review').</li><li>Live chat works for everyone in the same room right now; messages aren't stored.</li><li>'Start voice & screen share' opens the room's meeting link (the mentor's Google Meet, Zoom or Teams link, or a private Jitsi room by default) in a new tab.</li><li>Ring sends an alert to anyone in that room and offers to call the mentor's phone if they shared one.</li><li>Messages to a mentor are saved to your Gmail drafts for you to review and send; nothing is sent automatically.</li></ul></div>`;
}
function mentorById(id){ return (MENTORS||[]).find(m => m.id === id); }
function mentorForm(m, area){
  m = m || {name:"", area: area || MENTOR_AREAS[0], title:"", bio:"", email:"", phone:"", slots:"", available:true, rooms:[{name:"1:1 doubts"},{name:"Mock interviews"},{name:"Portfolio review"}]};
  return `<div class="card"><div class="row between"><h3>${m.id?"Edit mentor":"Add a mentor"}</h3><button class="link" data-mclose="1">Close</button></div>
    <div class="form"><label class="f">Name<input type="text" id="mfName" value="${esc(m.name)}"></label><label class="f">Area<select id="mfArea">${MENTOR_AREAS.map(a=>`<option ${a===m.area?"selected":""}>${esc(a)}</option>`).join("")}</select></label>
      <label class="f">Title / company<input type="text" id="mfTitle" value="${esc(m.title||"")}"></label><label class="f">Email<input type="email" id="mfEmail" value="${esc(m.email||"")}"></label>
      <label class="f">Phone (for Ring, optional)<input type="tel" id="mfPhone" value="${esc(m.phone||"")}" placeholder="+91…"></label><label class="f">Office hours<input type="text" id="mfSlots" value="${esc(m.slots||"")}" placeholder="Sat 11:00–13:00"></label></div>
    <label class="f">Short bio<textarea id="mfBio">${esc(m.bio||"")}</textarea></label>
    <div class="form">${[0,1,2].map(i=>`<label class="f">Room ${i+1} name<input type="text" id="mfR${i}" value="${esc(((m.rooms||[])[i]||{}).name||"")}"></label><label class="f">Room ${i+1} meeting link (optional)<input type="url" id="mfL${i}" value="${esc(((m.rooms||[])[i]||{}).link||"")}" placeholder="https://meet.google.com/…"></label>`).join("")}</div>
    <label class="learned" style="color:var(--ink)"><input type="checkbox" id="mfAvail" ${m.available?"checked":""}> Available now</label>
    <div class="row"><button class="btn" data-msave="${esc(m.id||"")}">Save mentor</button>${m.id?`<button class="link" data-mdel="${esc(m.id)}">Remove</button>`:""}</div></div>`;
}
function messageForm(m){
  return `<div class="card"><div class="row between"><h3>Message ${esc(m.name)}</h3><button class="link" data-mclose="1">Close</button></div>
    <label class="f">Subject<input type="text" id="mmSub" value="Guidance on ${esc((m.area||"").toLowerCase())}"></label>
    <label class="f">Message<textarea id="mmBody" style="min-height:140px">Dear ${esc((m.name||"").split(" ")[0])},\n\nI'm Jyotirmaya, a 2025 law graduate (Advocate) moving into privacy and GRC. I'd value 20 minutes of your advice on …\n\nThank you,\n${esc(S.profile.name||"Jyotirmaya Negi")}</textarea></label>
    <div class="row"><button class="btn ghost sm" data-mpolish="${esc(m.id)}">Polish with AI</button><button class="btn sm" data-mdraft="${esc(m.id)}">Save to Gmail drafts</button><button class="btn ghost sm" data-mcopy="1">Copy</button><span class="num" id="mmMsg"></span></div>
    <p class="num">Nothing is sent automatically: the message lands in your Gmail drafts for you to review.</p></div>`;
}
function roomPanel(m, n){
  const r = (m.rooms||[])[n-1] || {}, name = r.name || "Room " + n;
  return `<div class="card roompanel"><div class="row between"><div><span class="eyebrow">${esc(m.name)} · Room ${n}</span><h3>${esc(name)}</h3></div><button class="btn ghost sm" data-mleave="1">Leave room</button></div>
    <div class="row"><span class="pill" id="roomStatus">Connecting…</span><span class="num" id="roomWho"></span></div>
    <div class="roomgrid"><div class="roomchat"><div class="roomlog" id="roomLog" aria-live="polite"><p class="num">Live chat with everyone in this room right now. Messages aren't stored.</p></div>
      <div class="chatin"><input type="text" id="roomIn" placeholder="Type a message" aria-label="Room message"><button class="btn sm" id="roomSend">Send</button></div></div>
      <div class="roomside"><a class="btn" href="${esc(roomLink(m, n))}" target="_blank" rel="noopener">🎙 Start voice & screen share</a><span class="num">Opens the room's meeting link in a new tab; share your screen from there.</span>
        <button class="btn ghost" id="roomRing">📞 Ring ${esc((m.name||"mentor").split(" ")[0])}</button>${m.phone?`<a class="btn ghost" href="tel:${esc(String(m.phone).replace(/[^\d+]/g,""))}">Call ${esc(m.phone)}</a>`:""}</div></div></div>`;
}
async function roomEnter(m, n){
  await roomLeave();
  const panel = document.getElementById("mentorPanel"); panel.innerHTML = roomPanel(m, n); panel.scrollIntoView({block:"start"});
  const status = document.getElementById("roomStatus");
  try { ROOM.cap = ROOM.cap || await claude.use("room"); } catch(e) { ROOM.cap = null; }
  if (!ROOM.cap) { status.textContent = "Live chat unavailable in this view"; status.className = "pill warn"; return; }
  const name = ("m-" + String(m.code || m.id).toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,30) + "-r" + n);
  try { ROOM.cur = await ROOM.cap.join(name); } catch(e) { status.textContent = e.code === "not_permitted" ? "Rooms aren't available to you here" : "Couldn't join the room"; status.className = "pill warn"; return; }
  const R = ROOM.cur, me = (S.profile.name || "Me").split(" ")[0];
  R.presence({nick: me.slice(0,30), role: "student"}).catch(()=>{});
  const upd = () => { const ps = R.peers(); const w = document.getElementById("roomWho"); if (w) w.textContent = `${ps.length} here: ${ps.map(p => (p.isMe ? "you" : String((p.presence||{}).nick || "someone").slice(0,20))).join(", ")}`; };
  ROOM.unsub.push(R.onPeers(upd, () => {}));
  ROOM.unsub.push(R.onConnection(c => { const s = document.getElementById("roomStatus"); if (s) { s.textContent = c ? "Connected" : "Reconnecting…"; s.className = "pill " + (c ? "ok" : "warn"); } }, () => {}));
  ROOM.unsub.push(R.on("msg", msg => roomAppend(msg.sameTab ? "You" : String((msg.data||{}).nick || "Someone").slice(0,20), String((msg.data||{}).text || "").slice(0,1000), msg.isMe), () => {}));
  ROOM.unsub.push(R.on("ring", msg => { if (!msg.sameTab) { toast(`📞 ${String((msg.data||{}).nick || "Someone").slice(0,20)} is ringing in this room`); roomAppend("System", `${String((msg.data||{}).nick || "Someone").slice(0,20)} rang the room.`); } }, () => {}));
  upd();
}
function roomAppend(who, text, mine){ const log = document.getElementById("roomLog"); if (!log) return; const d = document.createElement("div"); d.className = "msg " + (mine ? "me" : "ai"); const b = document.createElement("b"); b.textContent = who + ": "; d.append(b, document.createTextNode(text)); log.appendChild(d); log.scrollTop = log.scrollHeight; }
async function roomLeave(){ ROOM.unsub.forEach(u => { try { u(); } catch(e) {} }); ROOM.unsub = []; if (ROOM.cur) { try { await ROOM.cur.leave(); } catch(e) {} ROOM.cur = null; } }
async function roomSend(){ const i = document.getElementById("roomIn"); const t = (i.value||"").trim(); if (!t || !ROOM.cur) return; i.value = ""; try { await ROOM.cur.emit("msg", {text:t.slice(0,1000), nick:(S.profile.name||"Me").split(" ")[0]}); } catch(e) { roomAppend("System", e.code === "not_permitted" ? "You can't send messages in this room." : "Message not sent; check your connection."); } }
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-mring],[data-mmsg],[data-medit],[data-mroom],[data-msave],[data-mdel],[data-mclose],[data-mleave],[data-mdraft],[data-mpolish],[data-mcopy],#roomSend,#roomRing"); if (!el) return;
  const d = el.dataset, panel = document.getElementById("mentorPanel");
  if (d.medit) { const [id, area] = d.medit.split("|"); panel.innerHTML = mentorForm(id === "new" ? null : mentorById(id), area); panel.scrollIntoView({block:"start"}); return; }
  if (d.mclose) { panel.innerHTML = ""; return; }
  if (d.msave !== undefined) { const v = id => (document.getElementById(id).value || "").trim(); const old = d.msave ? mentorById(d.msave) : null;
    if (!v("mfName")) { document.getElementById("mfName").focus(); return; }
    const m = Object.assign({}, old || {code: mentorCode(), color: ["#1E8A4C","#0A6CDF","#7A4BC4","#C2410C","#0E7490"][Math.floor(Math.random()*5)]}, {name:v("mfName"), area:v("mfArea"), title:v("mfTitle"), email:v("mfEmail"), phone:v("mfPhone"), slots:v("mfSlots"), bio:v("mfBio"), available:document.getElementById("mfAvail").checked,
      rooms:[0,1,2].map(i => ({name:v("mfR"+i) || "Room "+(i+1), link:/^https:\/\//.test(v("mfL"+i)) ? v("mfL"+i) : ""}))});
    await saveMentor(m); return; }
  if (d.mdel) { if (cap.db && !String(d.mdel).startsWith("local-")) { try { await cap.db.collection("mentors").doc(d.mdel).delete(); } catch(e) {} } MENTORS = (MENTORS||[]).filter(x => x.id !== d.mdel); try { localStorage.setItem(LS("mentors"), JSON.stringify(MENTORS.filter(x=>String(x.id).startsWith("local-")))); } catch(e) {} rerender(); return; }
  if (d.mmsg) { const m = mentorById(d.mmsg); if (m) { panel.innerHTML = messageForm(m); panel.scrollIntoView({block:"start"}); } return; }
  if (d.mcopy) { copyText(el, document.getElementById("mmSub").value + "\n\n" + document.getElementById("mmBody").value); return; }
  if (d.mpolish) { const m = mentorById(d.mpolish), body = document.getElementById("mmBody"), msg = document.getElementById("mmMsg");
    if (!cap.sample) { msg.textContent = "Claude isn't available in this view."; return; } msg.textContent = "Polishing…";
    try { const r = await cap.sample(`Polish this short email from a law graduate to a potential mentor (${m.name}, ${m.area}). Keep it warm, specific, respectful of their time, under 150 words, one clear ask. Keep facts unchanged. Return only the email body.\n\n${body.value}`, {cache:false}); body.value = String(r.text||"").trim() || body.value; msg.textContent = "Done — review before saving."; } catch(err) { msg.textContent = aiErr(err) || "Stopped."; } return; }
  if (d.mdraft) { const m = mentorById(d.mdraft), msg = document.getElementById("mmMsg");
    if (!m.email) { msg.textContent = "Add the mentor's email first (Edit)."; return; }
    if (!cap.mcp) { msg.textContent = "Gmail isn't available in this view. Use Copy instead."; return; }
    msg.textContent = "Saving draft…";
    try { const r = await cap.mcp.callTool("Gmail","create_draft",{to:[m.email], subject:document.getElementById("mmSub").value, body:document.getElementById("mmBody").value}); msg.textContent = "Saved in your Gmail drafts.";
      try { if (cap.db) await cap.db.collection(trkRoot() + "/support/mentormsgs").add({mentor:m.id, subject:document.getElementById("mmSub").value.slice(0,200), at:new Date().toISOString()}); } catch(_) {} }
    catch(err) { msg.textContent = (typeof mcpMsg === "function" ? mcpMsg(err) : "Couldn't save the draft."); } return; }
  if (d.mring) { const m = mentorById(d.mring); if (!m) return; await roomEnter(m, 1); setTimeout(() => document.getElementById("roomRing")?.click(), 400); return; }
  if (d.mroom) { const [id, n] = d.mroom.split("|"); const m = mentorById(id); if (m) roomEnter(m, +n); return; }
  if (d.mleave) { await roomLeave(); panel.innerHTML = ""; return; }
  if (el.id === "roomSend") { roomSend(); return; }
  if (el.id === "roomRing") { if (ROOM.cur) { try { await ROOM.cur.emit("ring", {nick:(S.profile.name||"Me").split(" ")[0]}); roomAppend("System", "You rang the room. Anyone here gets an alert."); } catch(err) { roomAppend("System", "Couldn't ring right now."); } } else toast("Join a room first."); return; }
});
document.addEventListener("keydown", e => { if (e.target.id === "roomIn" && e.key === "Enter") { e.preventDefault(); roomSend(); } });

/* ---------- menu search + quick jump (Ctrl/⌘+K) ---------- */
function navSearchHTML(){ return `<div class="navsearch"><span aria-hidden="true">⌕</span><input type="search" class="navq" placeholder="Search menu, subjects, roles" aria-label="Search the menu"><div class="navres" role="listbox"></div></div>`; }
function navMatches(q){
  q = q.toLowerCase().trim(); if (!q) return [];
  const out = [];
  TOPICS.forEach(t => { if ((t.title + " " + t.short).toLowerCase().includes(q)) out.push({go:t.id, l:t.title, k:"Subject", c:(TRACK_INFO[t.track]||{}).color||"#0A6CDF", ic:(TRACK_INFO[t.track]||{}).icon||"▤"}); });
  ROLES.forEach(r => { if (pathOf(r.id) && r.name.toLowerCase().includes(q)) out.push({go:"role-"+r.id, l:r.name, k:"Role page", c:"#0E7490", ic:"◆"}); });
  ALLPROJ.forEach(p => { if (p.title.toLowerCase().includes(q)) out.push({go:"proj-"+p.id, l:p.title, k:"Project", c:"#7A4BC4", ic:"⚒"}); });
  return out.slice(0, 8);
}
function navFilter(inp){
  const root = inp.closest(".side, .sheet"), q = inp.value.toLowerCase().trim(); if (!root) return;
  root.querySelectorAll(".grp").forEach(g => { let any = false; g.querySelectorAll("button.item").forEach(b => { const hit = !q || b.textContent.toLowerCase().includes(q); b.hidden = !hit; if (hit) any = true; }); g.hidden = !any; });
  const res = root.querySelector(".navres"), M = navMatches(q);
  res.innerHTML = M.length ? `<span class="num">Pages inside</span>` + M.map(x => `<button class="item" data-go="${esc(x.go)}"><i style="background:${x.c}">${esc(x.ic)}</i><span>${esc(x.l)}<small class="num"> · ${x.k}</small></span></button>`).join("") : (q && !root.querySelector(".grp:not([hidden])") ? `<p class="num">Nothing matches "${esc(q)}".</p>` : "");
}
document.addEventListener("input", e => { if (e.target.classList && e.target.classList.contains("navq")) navFilter(e.target); });
document.addEventListener("keydown", e => {
  if (e.target.classList && e.target.classList.contains("navq") && e.key === "Enter") { e.preventDefault(); const root = e.target.closest(".side, .sheet"); const first = root.querySelector(".navres button.item, .grp:not([hidden]) button.item:not([hidden])"); if (first) first.click(); }
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault();
    const side = document.querySelector("#side .navq"); if (side && side.offsetParent) { side.focus(); side.select(); return; }
    if (!menuOpen) { menuOpen = true; renderHeader(); } setTimeout(() => document.querySelector(".sheet .navq")?.focus(), 30); }
});
