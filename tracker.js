/* ================= APPLICATIONS & INTERVIEWS (Gmail-linked) ================= */
const APP_STAGES = ["Saved","Applied","Screening","Assessment","Interview","Offer","Rejected","Withdrawn"];
const OPEN_STAGES = ["Applied","Screening","Assessment","Interview","Offer"];
const STAGE_RANK = {Saved:0,Applied:1,Screening:2,Assessment:3,Interview:4,Offer:5,Rejected:6,Withdrawn:6};
const MAIL_TYPES = {applied:["Application received","acc"],sent:["You applied","acc"],assessment:["Assessment","warn"],interview:["Interview","ok"],offer:["Offer","ok"],rejected:["Rejection","bad"],outreach:["Recruiter outreach","hot"],alert:["Job alert",""],other:["Other",""]};
const SYNC_EVERY = 6 * 3600 * 1000;
const TRK = {started:false, ok:false, owner:false, apps:[], threads:[], meta:null, prefs:null, syncing:false, err:"", tab:"reply", open:null, busy:{}, confirm:null, permState:"unknown", edits:{}};
const Q_STATUS = 'newer_than:90d -category:promotions -from:jobalerts-noreply@linkedin.com -from:ambitionbox.com -from:invitations@linkedin.com (subject:(application OR applied OR interview OR assessment OR offer OR shortlisted OR "next steps" OR candidature OR candidacy) OR "thank you for applying" OR "received your application" OR "regret to inform" OR "not moving forward")';
const Q_OUTREACH = 'newer_than:45d in:inbox -category:promotions -category:social -from:noreply -from:no-reply -from:jobalerts-noreply@linkedin.com (opportunity OR opening OR "your profile" OR position OR "job description" OR hiring)';
const Q_SENT = 'newer_than:90d in:sent (resume OR CV OR "applying for" OR application OR "job opening" OR position)';
const BOARD_DOMAINS = ["gmail","yahoo","outlook","hotmail","myworkday","myworkdayjobs","workday","greenhouse","lever","successfactors","taleo","icims","smartrecruiters","naukri","linkedin","instahyre","foundit","hirist","iimjobs","cutshort","wellfound","indeed","apna","google","mail","email","notifications","hire","jobs","careers","talent","recruit"];
const ATS_NAMES = {myworkday:"Workday",myworkdayjobs:"Workday",greenhouse:"Greenhouse",lever:"Lever",successfactors:"SuccessFactors",taleo:"Taleo",icims:"iCIMS",smartrecruiters:"SmartRecruiters",naukri:"Naukri",linkedin:"LinkedIn",instahyre:"Instahyre",foundit:"foundit",hirist:"Hirist",iimjobs:"iimjobs",cutshort:"Cutshort",wellfound:"Wellfound",indeed:"Indeed",apna:"apna"};

function decodeEnt(s){ return String(s||"").replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(+n)).replace(/&quot;/g,'"').replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'").replace(/[͏‌​ ]+/g," ").replace(/\s{2,}/g," ").trim(); }
function addrOf(s){ const m = String(s||"").match(/<([^>]+)>/); return (m ? m[1] : String(s||"")).trim().toLowerCase(); }
function domainOf(a){ const m = addrOf(a).match(/@([^>\s]+)/); return m ? m[1] : ""; }
function normCo(s){ return String(s||"").toLowerCase().replace(/\b(pvt|private|ltd|limited|llp|inc|india|technologies|technology|solutions|services|consulting|group|the|co)\b/g,"").replace(/[^a-z0-9]/g,""); }
function titleCase(s){ return String(s||"").replace(/\b\w/g, c => c.toUpperCase()); }
function companyFrom(subject, sender){
  const s = decodeEnt(subject);
  const pats = [/applying (?:to|at|with) ([A-Z][\w&.' -]{1,40}?)(?:[!.,|:-]|$| for )/, /application (?:to|at|with) ([A-Z][\w&.' -]{1,40}?)(?:[!.,|:-]|$| for )/, / at ([A-Z][\w&.' -]{1,40}?)(?:[!.,|:]|$| - )/, /interest in ([A-Z][\w&.' -]{1,40}?)(?:[!.,|:]|$)/, /^([A-Z][\w&.' ]{1,30}) [-|–] /, / [-|–] ([A-Z][\w&.' ]{1,30})$/];
  for (const p of pats) { const m = s.match(p); if (m && m[1] && !/^(the|your|our|a|an|this|we|you)$/i.test(m[1].trim()) && !/interview|application|applying|invitation|opportunit|opening|position|thank|assessment|offer|update|analyst|associate|manager|officer|consultant|engineer|executive|specialist|intern|\blead\b|counsel|auditor|developer/i.test(m[1])) return m[1].trim(); }
  const d = domainOf(sender).split("."), base = d.length >= 3 && ["co","com","org","net","ac","gov","edu","firm","gen","ind"].includes(d[d.length-2]) ? d[d.length-3] : d.length >= 2 ? d[d.length-2] : "";
  if (base && !BOARD_DOMAINS.includes(base) && base.length > 1) return base.length <= 4 ? base.toUpperCase() : titleCase(base);
  const sub = d.length >= 3 && BOARD_DOMAINS.includes(base) ? d[0] : ""; if (sub && !/^(mail|email|e|noreply|no-reply|jobs|careers|career|hr|talent|recruiting|recruitment|notifications?|alerts?|www|wd\d*|apply)$/.test(sub)) return sub.length <= 4 ? sub.toUpperCase() : titleCase(sub);
  return "";
}
function roleFrom(subject){
  const s = decodeEnt(subject).replace(/^(re|fwd?):\s*/i, "");
  const pats = [/(?:role|position|post|opening) (?:of|for)\s+([A-Z][\w&/(),.' -]{2,60}?)(?: at | with |[!.,|:]|$)/i, /application for (?:the )?([A-Z][\w&/(),.' -]{2,60}?)(?: at | with | role| position|[!.,|:]|$)/i, /applying for (?:the )?([A-Z][\w&/(),.' -]{2,60}?)(?: at | role| position|[!.,|:]|$)/i,
    /(?:interview|assessment|offer|shortlisted)(?: invitation)? (?:for|-|–) (?:the )?([A-Z][\w&/(),.' -]{2,60}?)(?: at | with | role| position|[!.,|:]|$)/i, /^(?:opportunity|opening|hiring)\s*[:-]\s*([A-Z][\w&/(),.' -]{2,60}?)(?: at | role| position| opening|[!.,|]|$)/i,
    /^([A-Z][\w&/(),.' -]{2,50}?) (?:role|position|opening|opportunity)\b/i, / for (?:the )?([A-Z][\w&/(),.' -]{2,60}?)(?: role| position| at |[!.,|:]|$)/];
  for (const p of pats) { const m = s.match(p); if (m && m[1] && !/^(application|applying|interview|thank you|your|the)\b/i.test(m[1].trim())) return m[1].trim(); }
  return "";
}
function classifyThread(th){
  const msgs = th.messages || [], first = msgs[0] || {}, sender = first.sender || "", labels = msgs.flatMap(m => m.labelIds || []);
  const subject = decodeEnt(first.subject || ""), text = (subject + " " + msgs.map(m => decodeEnt(m.snippet||"")).join(" ")).toLowerCase(), from = addrOf(sender);
  let type = "other";
  if (/jobalerts|job-alerts|alerts?@|ambitionbox|glassdoor|jobs-noreply|recommend/.test(from) || /job alert|jobs for you|recommended jobs|new jobs|is hiring|posted on \d|jobs in |people you may know|invitation/.test(subject.toLowerCase()) || /invitations@linkedin/.test(from)) type = "alert";
  else if (/offer letter|pleased to offer|offer of employment|letter of intent|congratulations[^.]{0,40}(offer|selected)/.test(text)) type = "offer";
  else if (/unfortunately|regret to inform|not (be )?moving forward|other candidates|not been selected|not shortlisted|position has been filled|decided to (pursue|proceed with) other|will not be proceeding|unsuccessful/.test(text)) type = "rejected";
  else if (/interview|schedule (a|your|the) (call|chat|discussion|meeting)|your availability|calendly|teams meeting|meet\.google|zoom\.us|round of|hr round|technical round|discussion with/.test(text)) type = "interview";
  else if (/assessment|online test|hackerrank|mettl|codility|testgorilla|aptitude test|case study|take-home|assignment/.test(text)) type = "assessment";
  else if (labels.includes("SENT") && /resume|cv|application|applying|position|opening|role/.test(text)) type = "sent";
  else if (/thank you for (applying|your application|your interest)|application (received|submitted|has been received)|received your application|successfully applied|your application (for|to|has)|applied for/.test(text)) type = "applied";
  else if (!/no-?reply|donotreply|notifications?@/.test(from) && /opportunit|opening|your profile|are you (interested|open)|position|job description|\bjd\b|hiring|role/.test(text)) type = "outreach";
  const needsReply = ["outreach","interview","offer"].includes(type) && !labels.includes("SENT");
  const ats = (domainOf(sender).split(".").find(p => ATS_NAMES[p])) || "";
  const isSent = labels.includes("SENT"), to0 = (first.toRecipients || [])[0] || "";
  return {type, company: companyFrom(subject, isSent && to0 ? to0 : sender), role: roleFrom(subject), needsReply, source: ATS_NAMES[ats] || (type==="sent"?"Direct email":"Email")};
}

/* ---------- db plumbing ---------- */
function trkRoot(){ return TRK.owner ? "private" : "data/users/" + (TRK.uid || ACCESS.uid || "me"); }
const trkCol = name => cap.db.collection(trkRoot() + "/tracker/" + name);
async function trackerInit(){
  if (TRK.started || !cap.db) return; TRK.started = true;
  try { TRK.owner = cap.user ? await cap.user.isOwner() : false; } catch(e) { TRK.owner = false; }
  try { TRK.uid = cap.user ? await cap.user.id() : ""; } catch(e) { TRK.uid = ""; }
  if (!TRK.owner && !TRK.uid) { TRK.ok = false; return; }
  try {
    trkCol("apps").onSnapshot(s => { TRK.apps = s.docs.map(d => Object.assign({id:d.id}, d.data())); TRK.ok = true; trkRefresh(); }, () => {});
    trkCol("mail").onSnapshot(s => { TRK.threads = s.docs.map(d => Object.assign({id:d.id}, d.data())); trkRefresh(); }, () => {});
    cap.db.doc(trkRoot() + "/tracker").onSnapshot(s => { TRK.meta = s.exists ? s.data() : null; trkRefresh(); }, () => {});
    const p = await cap.db.doc(trkRoot() + "/prefs").get(); TRK.prefs = p.exists ? p.data() : null;
    TRK.ok = true;
    /* one-time move of applications logged before the tracker existed */
    if ((S.network.apps||[]).length && !S.network.appsMoved) {
      const ex = (await trkCol("apps").get()).docs.length;
      if (!ex) for (const a of S.network.apps) { await trkCol("apps").add({company:a.company||"", role:a.role||"", url:a.url||"", source:"Manual", status:a.status||"Applied", appliedAt:a.date||today(), updatedAt:new Date().toISOString(), origin:"manual", stages:[{s:a.status||"Applied", at:a.date||today()}]}); }
      S.network.appsMoved = true; save("network");
    }
  } catch(e) { TRK.err = "Couldn't open the tracker data."; }
  try { const perms = await claude.use("permissions"); if (perms) TRK.permState = await perms.state("mcp:Gmail").catch(() => "unavailable"); } catch(e) {}
  if (!TRK.timer) TRK.timer = setInterval(trkTick, 30000);
  trkRefresh();
}
let trkRT = null;
function trkRefresh(){ clearTimeout(trkRT); trkRT = setTimeout(() => { if (current === "applications" && !document.activeElement?.closest?.(".trk-noreflow")) rerender(); if (current === "home") { const w = document.getElementById("homeApps"); if (w) w.outerHTML = appsWidget(); } }, 120); }
function lastSyncMs(){ const t = TRK.meta && TRK.meta.lastSync ? Date.parse(TRK.meta.lastSync) : 0; return isNaN(t) ? 0 : t; }
function fmtLeft(ms){ if (ms <= 0) return "due now"; const h = Math.floor(ms/3600000), m = Math.floor(ms%3600000/60000), s = Math.floor(ms%60000/1000); return `${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`; }
function trkTick(){
  const due = lastSyncMs() + SYNC_EVERY - Date.now(), el = document.getElementById("syncLeft");
  if (el) el.textContent = lastSyncMs() ? fmtLeft(due) : "after first sync";
  if (lastSyncMs() && due <= 0 && !TRK.syncing && cap.mcp && TRK.permState === "granted") gmailSync(false);
}
setInterval(() => { const el = document.getElementById("syncLeft"); if (el && lastSyncMs()) el.textContent = fmtLeft(lastSyncMs() + SYNC_EVERY - Date.now()); document.querySelectorAll("[data-countdown]").forEach(n => { const t = Date.parse(n.dataset.countdown); if (!isNaN(t)) n.textContent = cdText(t - Date.now()); }); }, 1000);
function cdText(ms){ if (ms <= 0) return "now / passed"; const d = Math.floor(ms/864e5), h = Math.floor(ms%864e5/36e5), m = Math.floor(ms%36e5/6e4); return d ? `${d}d ${h}h` : `${h}h ${m}m`; }
function mcpMsg(e){
  const c = e && e.code;
  return c==="needs_reauth" ? "Gmail needs reconnecting: claude.ai Settings → Connectors → Gmail." : c==="server_not_connected" ? "Add the Gmail connector in claude.ai Settings → Connectors, then sync again." : c==="not_in_manifest" ? "Gmail is turned off for this page. Turn it on from the page's Permissions menu." : c==="approval_required" ? "Gmail needs your approval. Press Sync now and choose Allow." : c==="selection_required" ? "Choose which Gmail account this page should use when prompted." : c==="blocked_by_policy" ? "Your organisation's policy blocks this Gmail action." : (c==="server_unavailable"||c==="upstream_error") ? "Gmail didn't respond. Try again in a minute." : c==="tool_error" ? "Gmail reported an error: " + String(e.message||"").slice(0,140) : "Gmail sync isn't available in this view.";
}

/* ---------- Gmail sync ---------- */
async function gmailSync(manual){
  if (TRK.syncing) return;
  if (!cap.mcp) { TRK.err = "Gmail sync isn't available in this view. The background task still syncs every 6 hours."; trkRefresh(); return; }
  TRK.syncing = true; TRK.err = ""; trkRefresh();
  const found = new Map(); let failed = null;
  for (const q of [Q_STATUS, Q_OUTREACH, Q_SENT]) {
    try { const r = await cap.mcp.callTool("Gmail", "search_threads", {query:q, pageSize:25}, {cache:false}); const p = r.payload || {}; (p.threads||[]).forEach(t => found.set(t.id, t)); }
    catch(e) { failed = e; break; }
  }
  if (failed && !found.size) { TRK.syncing = false; TRK.err = mcpMsg(failed); trkRefresh(); return; }
  TRK.permState = "granted";
  const byId = Object.fromEntries(TRK.threads.map(t => [t.id, t])); let added = 0, changed = 0, appsTouched = 0;
  for (const th of found.values()) {
    const c = classifyThread(th); if (c.type === "alert" || c.type === "other") continue;
    const msgs = th.messages||[], last = msgs[msgs.length-1] || {}, first = msgs[0] || {};
    const doc = {threadId:th.id, subject:decodeEnt(first.subject||"").slice(0,200), from:addrOf(first.sender||""), date:last.date||first.date||"", snippet:decodeEnt(last.snippet||first.snippet||"").slice(0,300), type:c.type, company:c.company, role:c.role, needsReply:c.needsReply, source:c.source, messageCount:th.messageCount||msgs.length, lastMessageId:last.id||"", viewUrl:th.viewUrl||"", syncedAt:new Date().toISOString()};
    const prev = byId[th.id];
    if (prev && prev.date === doc.date && prev.type === doc.type) continue;
    const merged = Object.assign({}, prev||{}, doc, prev ? {company: prev.companyEdited ? prev.company : doc.company, role: prev.roleEdited ? prev.role : doc.role, appId: prev.appId||"", ignored: !!prev.ignored, replied: !!prev.replied && prev.date === doc.date, draft: prev.draft||null} : {});
    delete merged.id;
    try { await trkCol("mail").doc(th.id).set(merged); prev ? changed++ : added++; } catch(e) {}
    if (!merged.ignored) { try { if (await linkToApp(Object.assign({id:th.id}, merged))) appsTouched++; } catch(e) {} }
  }
  try { await cap.db.doc(trkRoot() + "/tracker").set(Object.assign({}, TRK.meta||{}, {lastSync:new Date().toISOString(), lastSyncBy:"page", note:`${added} new, ${changed} updated job emails; ${appsTouched} applications updated`})); } catch(e) {}
  TRK.syncing = false; if (failed) TRK.err = mcpMsg(failed); trkRefresh();
  if (!failed && typeof liGmailSync === "function") { try { if (!LI.loaded) await liLoad(); liGmailSync(false); } catch(e) {} }
}
async function linkToApp(t){
  if (!t.company) return false;
  const key = normCo(t.company), when = (t.date||"").slice(0,10) || today();
  let app = (t.appId && TRK.apps.find(a => a.id === t.appId)) || TRK.apps.find(a => normCo(a.company) === key && (!t.role || !a.role || normCo(a.role) === normCo(t.role))) || TRK.apps.find(a => normCo(a.company) === key);
  const stageFor = {applied:"Applied", sent:"Applied", assessment:"Assessment", interview:"Interview", offer:"Offer", rejected:"Rejected", outreach:"Saved"}[t.type];
  if (!app) {
    if (!["applied","sent","assessment","interview","offer"].includes(t.type)) return false;
    const rec = {company:t.company, role:t.role||"", url:"", source:t.source||"Email", status:stageFor, appliedAt:when, updatedAt:new Date().toISOString(), origin:"gmail", threadIds:[t.id], stages:[{s:stageFor, at:when}], nextStep: stageFor==="Interview"?"Confirm interview time":""};
    const ref = await trkCol("apps").add(rec);
    if (!TRK.apps.some(a => a.id === ref.id)) TRK.apps.push(Object.assign({id:ref.id}, rec));
    await trkCol("mail").doc(t.id).update({appId:ref.id});
    return true;
  }
  const upd = {threadIds:[...new Set([...(app.threadIds||[]), t.id])], updatedAt:new Date().toISOString()};
  if (stageFor && STAGE_RANK[stageFor] > STAGE_RANK[app.status||"Applied"] && !["Rejected","Withdrawn"].includes(app.status)) { upd.status = stageFor; upd.stages = [...(app.stages||[]), {s:stageFor, at:when}]; if (stageFor === "Interview" && !app.interviewAt) upd.nextStep = "Confirm interview time"; }
  await trkCol("apps").doc(app.id).update(upd); Object.assign(app, upd);
  if (t.appId !== app.id) await trkCol("mail").doc(t.id).update({appId:app.id});
  return true;
}

/* ---------- preferences & candidate summary ---------- */
function candidateSummary(){
  const p = S.profile, m = S.resume.model, tg = (p.targets||[]).map(id => ROLE[id] && roleShort(id)).filter(Boolean);
  return [p.name||"", p.headline||"", p.education ? "Education: " + p.education.replace(/\n/g,"; ") : "", p.experience ? "Experience: " + p.experience.replace(/\n/g,"; ") : "", m && m.skills && m.skills.length ? "Skills: " + m.skills.join("; ").slice(0,400) : "", p.certs ? "Certificates: " + p.certs.replace(/\n/g,"; ") : "", tg.length ? "Target roles: " + tg.join(", ") : ""].filter(Boolean).join("\n");
}
function prefsDefaults(){ const p = S.profile; return {expectedCtc:"", currentCtc:"", notice:"Immediate joiner", locations:p.location||"", workMode:"Hybrid", availability:"Weekdays 11:00–18:00 IST", priorities:["Learning and mentorship","Career growth in privacy/GRC"], tone:"Warm and professional", signature:[p.name||"", p.phone||"", p.linkedin||""].filter(Boolean).join(" | "), candidateSummary:candidateSummary(), notes:"", autoDraft:true}; }
async function savePrefs(){
  const f = id => (document.getElementById(id)||{}).value || "";
  const pr = Object.assign(prefsDefaults(), TRK.prefs||{}, {expectedCtc:f("pfCtc"), currentCtc:f("pfCur"), notice:f("pfNotice"), locations:f("pfLoc"), workMode:f("pfMode"), availability:f("pfAvail"), tone:f("pfTone"), signature:f("pfSig"), candidateSummary:f("pfSum"), notes:f("pfNotes"), autoDraft:!!(document.getElementById("pfAuto")||{}).checked,
    priorities:[...document.querySelectorAll("[data-pfprio]:checked")].map(x => x.value), targetRoles:(S.profile.targets||[]).map(id => ROLE[id] && ROLE[id].name).filter(Boolean), updatedAt:new Date().toISOString()});
  TRK.prefs = pr;
  try { await cap.db.doc(trkRoot() + "/prefs").set(pr); toast("Reply preferences saved."); } catch(e) { toast("Couldn't save preferences."); }
}

/* ---------- AI replies ---------- */
async function draftReplyFor(id){
  const t = TRK.threads.find(x => x.id === id); if (!t || TRK.busy[id]) return;
  const out = document.getElementById("rep-" + id); if (out) { out.hidden = false; out.querySelector("textarea").value = "Reading the email thread…"; }
  if (!cap.sample) { if (out) out.querySelector("textarea").value = "Drafting needs Claude, which isn't available in this view."; return; }
  TRK.busy[id] = true;
  let body = t.snippet, lastId = t.lastMessageId, lastFrom = t.from;
  if (cap.mcp) { try { const r = await cap.mcp.callTool("Gmail", "get_thread", {threadId:t.threadId, messageFormat:"PLAIN_TEXT"}); const ms = (r.payload && r.payload.messages) || []; const others = ms.filter(m => !addrOf(m.sender).includes((S.profile.email||"@@").toLowerCase())); const last = others[others.length-1] || ms[ms.length-1]; if (last) { body = String(last.plaintextBody || last.plaintext_body || last.snippet || body).slice(0, 6000); lastId = last.id || lastId; lastFrom = addrOf(last.sender) || lastFrom; } } catch(e) { /* fall back to the snippet */ } }
  const pr = Object.assign(prefsDefaults(), TRK.prefs||{}), fr = focusRole(), P = fr && pathOf(fr);
  const prompt = `You write email replies for a job candidate, in the candidate's own voice (first person). Write ONLY the email body (no subject line), plain text, under 170 words, ${pr.tone || "warm and professional"}.

RULES
- Reply to what the sender actually asked. If they ask for a call or interview, offer 2–3 slots within: ${pr.availability || "weekdays"}.
- If they ask about compensation, notice period, location or work mode, answer from the preferences below. If a value is empty, write a bracketed placeholder like [expected CTC] for the candidate to fill. Never invent numbers.
- Never invent experience, employers, certifications, skills or dates beyond the candidate summary.
- Show genuine interest and fit: connect 1–2 true points from the candidate summary to the role.
- Ask 1–2 thoughtful questions about the role's scope, the team, learning and mentorship, or growth opportunities, matching the candidate's priorities.
- If it is a rejection, reply graciously, thank them and ask to be considered for future roles. If it is an offer, thank them and ask for the written offer details and a time to discuss; don't accept or negotiate numbers beyond the preferences.
- Sign off with: ${pr.signature || S.profile.name || "the candidate's name"}

CANDIDATE SUMMARY
${(pr.candidateSummary || candidateSummary()).slice(0,1800)}
${fr ? "Currently preparing for: " + ROLE[fr].name + (P ? " (core subjects: " + P.core.slice(0,6).map(x => TOPIC[x] ? TOPIC[x].title : x).join(", ") + ")" : "") : ""}

PREFERENCES
Expected CTC: ${pr.expectedCtc || "(empty)"} | Current CTC: ${pr.currentCtc || "(not to be shared unless asked)"} | Notice period: ${pr.notice || "(empty)"} | Locations: ${pr.locations || "(empty)"} | Work mode: ${pr.workMode || "(empty)"}
What matters to the candidate: ${(pr.priorities||[]).join(", ") || "learning and growth"}
${pr.notes ? "Extra notes: " + pr.notes : ""}

EMAIL TYPE (detected): ${MAIL_TYPES[t.type] ? MAIL_TYPES[t.type][0] : t.type}
COMPANY: ${t.company || "unknown"} | ROLE: ${t.role || "unknown"}
FROM: ${lastFrom}
SUBJECT: ${t.subject}
MESSAGE:
${body}`;
  try {
    const ta = out && out.querySelector("textarea");
    const r = await cap.sample(prompt, {onText:({text}) => { if (ta) ta.value = text; }, cache:false});
    const draft = {text:String(r.text||"").trim(), at:new Date().toISOString(), messageId:lastId, to:lastFrom, by:"page"};
    delete TRK.edits[id]; await trkCol("mail").doc(id).update({draft});
  } catch(e) { if (out) out.querySelector("textarea").value = (e.text ? e.text + "\n\n" : "") + aiErr(e); }
  TRK.busy[id] = false;
}
async function saveGmailDraft(id){
  const t = TRK.threads.find(x => x.id === id), ta = document.querySelector(`#rep-${id} textarea`); if (!t || !ta || !cap.mcp) { toast(cap.mcp ? "Nothing to save." : "Gmail isn't available in this view."); return; }
  const to = (t.draft && t.draft.to) || t.from, body = ta.value.trim(); if (!body) return;
  try { const r = await cap.mcp.callTool("Gmail", "create_draft", {to:[to], subject:/^re:/i.test(t.subject) ? t.subject : "Re: " + t.subject, body, replyToMessageId:(t.draft && t.draft.messageId) || t.lastMessageId || undefined});
    await trkCol("mail").doc(id).update({draft:Object.assign({}, t.draft||{}, {text:body, gmailDraftId:(r.payload && r.payload.id) || "", savedAt:new Date().toISOString()})});
    toast("Saved to your Gmail drafts.");
  } catch(e) { toast(mcpMsg(e) + " Check Gmail drafts before trying again."); }
}
async function sendReply(id){
  const t = TRK.threads.find(x => x.id === id), ta = document.querySelector(`#rep-${id} textarea`); if (!t || !ta || !cap.mcp) return;
  const body = ta.value.trim(), msgId = (t.draft && t.draft.messageId) || t.lastMessageId;
  if (!body || !msgId) { toast("Draft a reply first."); return; }
  if (/\[[^\]]{3,40}\]/.test(body)) { toast("Fill the [placeholders] before sending."); return; }
  try { await cap.mcp.callTool("Gmail", "reply", {messageId:msgId, body});
    await trkCol("mail").doc(id).update({replied:true, needsReply:false, repliedAt:new Date().toISOString(), draft:Object.assign({}, t.draft||{}, {text:body, sentAt:new Date().toISOString()})});
    toast("Reply sent.");
  } catch(e) { toast(mcpMsg(e) + " It may or may not have sent; check Gmail's Sent folder before retrying."); }
  TRK.confirm = null; trkRefresh();
}

/* ---------- views ---------- */
function appsWidget(){
  if (!TRK.ok) return `<div class="card" id="homeApps"><div class="row between"><span class="eyebrow">Applications</span><button class="link" data-go="applications">Open tracker</button></div><p class="muted">Track applications and interviews, synced with Gmail.</p></div>`;
  const act = TRK.apps.filter(a => OPEN_STAGES.includes(a.status)), ints = TRK.apps.filter(a => a.interviewAt && Date.parse(a.interviewAt) > Date.now()).sort((a,b) => Date.parse(a.interviewAt) - Date.parse(b.interviewAt)), reply = TRK.threads.filter(t => t.needsReply && !t.replied && !t.ignored).length;
  return `<div class="card" id="homeApps"><div class="row between"><span class="eyebrow">Applications</span><button class="link" data-go="applications">Open tracker</button></div>
    <div class="row"><span class="pill acc">${act.length} active</span><span class="pill ${reply?"hot":""}">${reply} need a reply</span><span class="pill">${TRK.apps.filter(a=>a.status==="Offer").length} offers</span></div>
    ${ints[0]?`<div class="inset"><b style="font-size:.88rem">Next interview: ${esc(ints[0].company)}</b><div class="num">in <span data-countdown="${esc(ints[0].interviewAt)}">${cdText(Date.parse(ints[0].interviewAt)-Date.now())}</span></div></div>`:""}
    <span class="num">Gmail ${lastSyncMs()?"synced "+new Date(lastSyncMs()).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"not synced yet"}</span></div>`;
}
function prepList(a){ const P = pathOf(focusRole() || ""), core = P ? P.core.slice(0,3).map(id => TOPIC[id] ? TOPIC[id].title.replace(/ \(.*\)/,"") : id) : ["the role's core subjects"];
  return [["research","Research the company: products, regulators, recent news"],["jd","Map the job description to 3 STAR stories from your experience"],["subjects","Revise: " + core.join(", ")],["questions","Prepare 2 questions about the team, learning and growth"],["tech","Test the joining link, camera and mic; keep resume open"],["thanks","Send a thank-you email within 24 hours"]]; }
function viewApplications(){
  if (!cap.db) return `<div><span class="eyebrow">Applications</span><h2>Applications & interviews</h2></div><div class="card"><p class="muted">The tracker needs Career Count's storage, which loads when it's opened on claude.ai.</p></div>`;
  if (!TRK.ok) return `<div><span class="eyebrow">Applications</span><h2>Applications & interviews</h2></div><div class="card"><p class="muted">Loading your tracker…</p></div>`;
  const A = TRK.apps, T = TRK.threads.filter(t => !t.ignored), last = lastSyncMs(), pr = Object.assign(prefsDefaults(), TRK.prefs||{});
  const act = A.filter(a => OPEN_STAGES.includes(a.status)), responded = A.filter(a => STAGE_RANK[a.status] >= 2 || a.status === "Rejected"), ints = A.filter(a => a.interviewAt).sort((a,b) => Date.parse(a.interviewAt) - Date.parse(b.interviewAt));
  const weeks = Array.from({length:8}, (_,i) => { const end = Date.now() - i*7*864e5, start = end - 7*864e5; return A.filter(a => { const d = Date.parse(a.appliedAt); return d >= start && d < end; }).length; }).reverse(), wmax = Math.max(1, ...weeks);
  const tabs = [["reply","Needs reply", T.filter(t => t.needsReply && !t.replied)],["int","Interviews & tests", T.filter(t => ["interview","assessment"].includes(t.type))],["app","Applications", T.filter(t => ["applied","sent"].includes(t.type))],["out","Offers & rejections", T.filter(t => ["offer","rejected"].includes(t.type))],["all","All job emails", T]];
  const curTab = tabs.find(x => x[0] === TRK.tab) || tabs[0], rows = curTab[2].slice().sort((a,b) => String(b.date).localeCompare(String(a.date)));
  const appOpts = sel => `<option value="">Link to…</option>${A.map(a => `<option value="${a.id}" ${a.id===sel?"selected":""}>${esc(a.company)}${a.role?" · "+esc(a.role):""}</option>`).join("")}`;
  const mailRow = t => { const [lbl, cls] = MAIL_TYPES[t.type] || ["Other",""], d = t.draft;
    return `<div class="mailrow"><div class="row between"><div class="row" style="min-width:0"><span class="pill ${cls}">${lbl}</span><b>${esc(t.company || "Unknown company")}</b>${t.role?`<span class="num">${esc(t.role)}</span>`:""}</div><span class="num">${esc(String(t.date).slice(0,10))}</span></div>
      <div style="font-size:.9rem"><b>${esc(t.subject)}</b> <span class="muted">— ${esc(t.snippet)}</span></div>
      <div class="row"><button class="btn sm" data-trkdraft="${t.id}">${d?"Redraft reply":"Draft reply with AI"}</button>${t.viewUrl?`<a class="btn sm ghost" href="${esc(t.viewUrl)}" target="_blank" rel="noopener">Open in Gmail</a>`:""}<select data-trklink="${t.id}" aria-label="Link to application">${appOpts(t.appId)}</select><button class="link" data-trkignore="${t.id}">Not a job email</button>${t.replied?'<span class="pill ok">Replied</span>':""}</div>
      <div id="rep-${t.id}" class="replybox trk-noreflow" ${d?"":"hidden"}><textarea aria-label="Reply draft" rows="8" data-trkedit="${t.id}">${esc(TRK.edits[t.id] ?? (d?d.text:""))}</textarea>
        <div class="row"><button class="btn sm ghost" data-trksave="${t.id}">Save to Gmail drafts</button>${TRK.confirm===t.id?`<span class="num">Send this reply to ${esc((d&&d.to)||t.from)}?</span><button class="btn sm" data-trksendgo="${t.id}">Yes, send</button><button class="link" data-trkcancel="1">Cancel</button>`:`<button class="btn sm" data-trksend="${t.id}">Send reply…</button>`}${d&&d.gmailDraftId?'<span class="pill ok">In Gmail drafts</span>':""}${d&&d.by==="scheduled"?'<span class="pill">Drafted by background task</span>':""}</div></div></div>`; };
  const card = a => { const days = a.appliedAt ? Math.floor((Date.now() - Date.parse(a.appliedAt))/864e5) : null, open = TRK.open === a.id, mails = TRK.threads.filter(t => t.appId === a.id);
    return `<div class="appcard ${open?"open":""}"><button class="appcard-h" data-trkopen="${a.id}"><b>${esc(a.company||"?")}</b><span class="num">${esc(a.role||"Role not set")}</span><span class="num">${days!==null?days+"d since applied":""}${mails.length?" · "+mails.length+" email"+(mails.length>1?"s":""):""}</span>${a.interviewAt&&Date.parse(a.interviewAt)>Date.now()?`<span class="pill ok">Interview in <span data-countdown="${esc(a.interviewAt)}">${cdText(Date.parse(a.interviewAt)-Date.now())}</span></span>`:""}</button>
      ${open?`<div class="appcard-b trk-noreflow"><div class="form"><label class="f">Status<select data-trkf="${a.id}|status">${APP_STAGES.map(s=>`<option ${a.status===s?"selected":""}>${s}</option>`).join("")}</select></label><label class="f">Role<input type="text" data-trkf="${a.id}|role" value="${esc(a.role||"")}"></label>
        <label class="f">Interview date & time<input type="datetime-local" data-trkf="${a.id}|interviewAt" value="${esc((a.interviewAt||"").slice(0,16))}"></label><label class="f">Job link<input type="url" data-trkf="${a.id}|url" value="${esc(a.url||"")}"></label></div>
        <label class="f">Next step<input type="text" data-trkf="${a.id}|nextStep" value="${esc(a.nextStep||"")}"></label><label class="f">Notes<textarea data-trkf="${a.id}|notes" rows="3">${esc(a.notes||"")}</textarea></label>
        ${a.status==="Interview"||a.interviewAt?`<div class="inset"><b style="font-size:.88rem">Interview prep</b>${prepList(a).map(([k,l]) => `<label class="learned" style="color:var(--ink)"><input type="checkbox" data-trkprep="${a.id}|${k}" ${(a.prep||{})[k]?"checked":""}> ${esc(l)}</label>`).join("")}</div>`:""}
        ${mails.length?`<div><b style="font-size:.88rem">Emails</b>${mails.map(m=>`<div class="num">${esc(String(m.date).slice(0,10))} · ${esc((MAIL_TYPES[m.type]||["Other"])[0])} · ${esc(m.subject)}</div>`).join("")}</div>`:""}
        <div class="row">${a.url?`<a href="${esc(a.url)}" target="_blank" rel="noopener">Job posting ↗</a>`:""}<button class="link" data-trkdel="${a.id}">Delete application</button></div></div>`:""}</div>`; };
  return `<div><span class="eyebrow">Applications & interviews</span><h2>Every application, synced with Gmail</h2></div>
  <p class="lede">Applications you log here and job emails found in Gmail land on one board. Gmail is checked every 6 hours: by a background task even when this page is closed, and by this page whenever it's open. AI drafts replies in your voice from your preferences; nothing is sent until you press Send.</p>
  <div class="grid4">
    <div class="card tile"><span class="lbl">Active applications</span><span class="big">${act.length}</span><span class="num">${A.length} total · ${A.filter(a=>a.status==="Offer").length} offers</span></div>
    <div class="card tile"><span class="lbl">Response rate</span><span class="big">${A.length?Math.round(responded.length/A.length*100):0}%</span><span class="num">screening or further, or a decision</span></div>
    <div class="card tile"><span class="lbl">Interviews</span><span class="big">${ints.filter(a=>Date.parse(a.interviewAt)>Date.now()).length}</span><span class="num">${ints.filter(a=>Date.parse(a.interviewAt)>Date.now())[0]?"next in "+cdText(Date.parse(ints.filter(a=>Date.parse(a.interviewAt)>Date.now())[0].interviewAt)-Date.now()):"none scheduled"}</span></div>
    <div class="card tile syncbox"><span class="lbl">Gmail sync</span><span class="num">${last?"Last: "+new Date(last).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+(TRK.meta&&TRK.meta.lastSyncBy==="scheduled"?" (background)":""):"Not synced yet"}</span><span class="num">Next in <b id="syncLeft">${last?fmtLeft(last+SYNC_EVERY-Date.now()):"after first sync"}</b></span>
      <button class="btn sm" data-trksync="1" ${TRK.syncing?"disabled":""}>${TRK.syncing?"Syncing…":last?"Sync now":"Connect Gmail & sync"}</button></div>
  </div>
  ${TRK.err?`<div class="note">${esc(TRK.err)}</div>`:""}
  <div class="card"><div class="row between"><h3>Pipeline</h3><button class="btn sm ghost" data-trkadd="1">+ Add application</button></div>
    <div id="trkAddBox" hidden class="trk-noreflow"><div class="form"><label class="f">Company<input type="text" id="taCo"></label><label class="f">Role<input type="text" id="taRole"></label><label class="f">Job link<input type="url" id="taUrl"></label><label class="f">Date applied<input type="date" id="taDate" value="${today()}"></label><label class="f">Source<select id="taSrc">${["LinkedIn","Naukri","Company site","Referral","Email","Other"].map(s=>`<option>${s}</option>`).join("")}</select></label></div><button class="btn sm" data-trkaddgo="1">Save application</button></div>
    <div class="kanban">${[...OPEN_STAGES, "Closed"].map(st => { const list = A.filter(a => st === "Closed" ? ["Rejected","Withdrawn"].includes(a.status) : a.status === st).sort((a,b) => String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
      return `<div class="kcol"><div class="kh"><b>${st}</b><span class="num">${list.length}</span></div>${list.map(card).join("") || `<p class="num" style="padding:6px">Empty</p>`}</div>`; }).join("")}</div>
    ${A.filter(a=>a.status==="Saved").length?`<details><summary class="link" style="cursor:pointer">Saved leads (${A.filter(a=>a.status==="Saved").length})</summary>${A.filter(a=>a.status==="Saved").map(card).join("")}</details>`:""}</div>
  <div class="grid2">
    <div class="card"><h3>Applications per week</h3><div class="wbars">${weeks.map((n,i)=>`<div class="wb"><i style="height:${Math.round(n/wmax*100)}%"></i><span class="num">${n}</span></div>`).join("")}</div><span class="num">Last 8 weeks, oldest to newest. Aim for 10–15 tailored applications a week.</span></div>
    <div class="card"><h3>Funnel</h3>${["Applied","Screening","Assessment","Interview","Offer"].map(s => { const n = A.filter(a => STAGE_RANK[a.status] >= STAGE_RANK[s] && a.status !== "Withdrawn" && (a.status !== "Rejected" || (a.stages||[]).some(x => STAGE_RANK[x.s] >= STAGE_RANK[s]))).length; return `<div class="skillrow"><span>${s}</span>${bar(A.length?Math.round(n/A.length*100):0,"acc")}<span class="num">${n}</span></div>`; }).join("")}</div>
  </div>
  <div class="card"><div class="row between"><h3>Job emails from Gmail</h3><div class="seg" role="group" aria-label="Email filter">${tabs.map(([k,l,list])=>`<button aria-pressed="${TRK.tab===k}" data-trktab="${k}">${l} (${list.length})</button>`).join("")}</div></div>
    ${rows.length?rows.slice(0,40).map(mailRow).join(""):`<p class="muted">${last?"Nothing here.":"Press Connect Gmail & sync to pull in job emails."}</p>`}</div>
  <div class="card trk-noreflow"><div class="row between"><h3>Reply preferences</h3><span class="num">Used by the AI replier, here and in the background task</span></div>
    <div class="form"><label class="f">Expected CTC<input type="text" id="pfCtc" placeholder="e.g. ₹5–6 LPA" value="${esc(pr.expectedCtc)}"></label><label class="f">Current CTC (shared only if asked)<input type="text" id="pfCur" value="${esc(pr.currentCtc)}"></label>
      <label class="f">Notice period<input type="text" id="pfNotice" value="${esc(pr.notice)}"></label><label class="f">Preferred locations<input type="text" id="pfLoc" value="${esc(pr.locations)}"></label>
      <label class="f">Work mode<select id="pfMode">${["Onsite","Hybrid","Remote","Any"].map(m=>`<option ${pr.workMode===m?"selected":""}>${m}</option>`).join("")}</select></label><label class="f">Interview availability<input type="text" id="pfAvail" value="${esc(pr.availability)}"></label>
      <label class="f">Tone<select id="pfTone">${["Warm and professional","Formal","Concise and direct"].map(m=>`<option ${pr.tone===m?"selected":""}>${m}</option>`).join("")}</select></label><label class="f">Signature<input type="text" id="pfSig" value="${esc(pr.signature)}"></label></div>
    <div><b style="font-size:.88rem">What matters to you</b><div class="row">${["Learning and mentorship","Career growth in privacy/GRC","Certification support","Exposure to DPDP/GDPR work","Compensation","Stability","Remote flexibility"].map(x=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" data-pfprio value="${esc(x)}" ${(pr.priorities||[]).includes(x)?"checked":""}> ${esc(x)}</label>`).join("")}</div></div>
    <label class="f">How replies should describe you (edit freely; the AI won't add anything beyond this)<textarea id="pfSum" rows="6">${esc(pr.candidateSummary)}</textarea></label>
    <label class="f">Anything else the replier should know<textarea id="pfNotes" rows="2">${esc(pr.notes)}</textarea></label>
    <label class="learned" style="color:var(--ink)"><input type="checkbox" id="pfAuto" ${pr.autoDraft!==false?"checked":""}> Let the 6-hourly background task save AI reply drafts in Gmail (it never sends)</label>
    <div class="row"><button class="btn" data-trkprefs="1">Save preferences</button><button class="btn ghost sm" data-trksum="1">Rebuild summary from my profile</button></div></div>`;
}

/* ---------- events ---------- */
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-trksync],[data-trktab],[data-trkopen],[data-trkdraft],[data-trksave],[data-trksend],[data-trksendgo],[data-trkcancel],[data-trkignore],[data-trkdel],[data-trkadd],[data-trkaddgo],[data-trkprefs],[data-trksum]"); if (!el) return;
  const d = el.dataset;
  if (d.trksync) { gmailSync(true); return; }
  if (d.trktab) { TRK.tab = d.trktab; rerender(); return; }
  if (d.trkopen) { TRK.open = TRK.open === d.trkopen ? null : d.trkopen; rerender(); return; }
  if (d.trkdraft) { const box = document.getElementById("rep-" + d.trkdraft); if (box) box.hidden = false; draftReplyFor(d.trkdraft); return; }
  if (d.trksave) { saveGmailDraft(d.trksave); return; }
  if (d.trksend) { TRK.confirm = d.trksend; const ta = document.querySelector(`#rep-${d.trksend} textarea`); const keep = ta ? ta.value : null; rerender(); const ta2 = document.querySelector(`#rep-${d.trksend} textarea`); if (ta2 && keep !== null) { ta2.value = keep; ta2.closest(".replybox").hidden = false; } return; }
  if (d.trksendgo) { sendReply(d.trksendgo); return; }
  if (d.trkcancel) { TRK.confirm = null; rerender(); return; }
  if (d.trkignore) { try { await trkCol("mail").doc(d.trkignore).update({ignored:true}); } catch(_) {} return; }
  if (d.trkdel) { try { await trkCol("apps").doc(d.trkdel).delete(); TRK.open = null; } catch(_) {} return; }
  if (d.trkadd) { const b = document.getElementById("trkAddBox"); if (b) b.hidden = !b.hidden; return; }
  if (d.trkaddgo) { const v = id => (document.getElementById(id)||{}).value.trim(); if (!v("taCo")) { document.getElementById("taCo").focus(); return; }
    try { await trkCol("apps").add({company:v("taCo"), role:v("taRole"), url:/^https?:\/\//.test(v("taUrl"))?v("taUrl"):"", source:v("taSrc"), status:"Applied", appliedAt:v("taDate")||today(), updatedAt:new Date().toISOString(), origin:"manual", stages:[{s:"Applied", at:v("taDate")||today()}]}); logActivity(1); save("progress"); } catch(_) { toast("Couldn't save the application."); } return; }
  if (d.trkprefs) { savePrefs(); return; }
  if (d.trksum) { const ta = document.getElementById("pfSum"); if (ta) ta.value = candidateSummary(); return; }
});
document.addEventListener("input", e => { const id = e.target.dataset && e.target.dataset.trkedit; if (id) TRK.edits[id] = e.target.value; });
document.addEventListener("change", async e => {
  const d = e.target.dataset || {};
  if (d.trklink) { const app = e.target.value; try { await trkCol("mail").doc(d.trklink).update({appId:app}); if (app) { const a = TRK.apps.find(x => x.id === app); if (a) await trkCol("apps").doc(app).update({threadIds:[...new Set([...(a.threadIds||[]), d.trklink])]}); } } catch(_) {} return; }
  if (d.trkf) { const [id, f] = d.trkf.split("|"), a = TRK.apps.find(x => x.id === id); if (!a) return; const upd = {[f]: e.target.value, updatedAt:new Date().toISOString()};
    if (f === "status" && e.target.value !== a.status) upd.stages = [...(a.stages||[]), {s:e.target.value, at:today()}];
    if (f === "interviewAt" && e.target.value) upd.interviewAt = new Date(e.target.value).toISOString();
    try { await trkCol("apps").doc(id).update(upd); } catch(_) {} return; }
  if (d.trkprep) { const [id, k] = d.trkprep.split("|"), a = TRK.apps.find(x => x.id === id); if (!a) return; try { await trkCol("apps").doc(id).update({prep:Object.assign({}, a.prep||{}, {[k]: e.target.checked})}); } catch(_) {} return; }
});
