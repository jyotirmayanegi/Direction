/* ================= LINKEDIN NETWORKING TRACKER ================= */
/* Two sources (LinkedIn has no API for personal connections or messages):
   1. Gmail (automatic, every sync): LinkedIn's notification emails — invitations accepted, invitations received,
      "X just messaged you", recruiter InMails.
   2. LinkedIn data export (full history): Connections.csv, Invitations.csv, messages.csv from
      linkedin.com → Settings → Data privacy → Get a copy of your data. Message text is never stored; only who, when, and direction. */
const LI = {loaded:false, conns:[], invs:[], convs:[], events:{}, meta:{}, busy:false, msg:"", goal:{inv:20, msg:10}};
const LI_URL_EXPORT = "https://www.linkedin.com/mypreferences/d/download-my-data";
const LI_REL = /privacy|data protection|\bdpo\b|grc|governance|compliance|risk|legal|counsel|advocate|lawyer|audit|security|cyber|\bai\b|regulat|policy|kyc|aml|contract|talent|recruit|hr\b|human resources/i;
const liCol = () => cap.db.collection(trkRoot() + "/linkedin/data");
async function liLoad(){
  if (LI.loaded || !cap.db) return; LI.loaded = true;
  if (!TRK.started) { try { await trackerInit(); } catch(e) {} }
  try { const s = await liCol().get(); const docs = Object.fromEntries(s.docs.map(d => [d.id, d.data()]));
    LI.meta = docs.meta || {}; LI.events = (docs.events && docs.events.e) || {}; if (LI.meta.goal) LI.goal = Object.assign(LI.goal, LI.meta.goal);
    LI.conns = Object.keys(docs).filter(k => /^conns-\d+$/.test(k)).sort((a,b)=>+a.split("-")[1]-+b.split("-")[1]).flatMap(k => docs[k].rows || []);
    LI.convs = Object.keys(docs).filter(k => /^convs-\d+$/.test(k)).sort().flatMap(k => docs[k].rows || []);
    LI.invs = (docs.invs && docs.invs.rows) || []; } catch(e) {}
  if (current === "network") rerender();
}
async function liSaveChunks(prefix, rows, size){
  const col = liCol(), old = (LI.meta[prefix + "Chunks"] || 0);
  const n = Math.ceil(rows.length / size);
  for (let i = 0; i < n; i++) await col.doc(prefix + "-" + i).set({rows: rows.slice(i*size, (i+1)*size)});
  for (let i = n; i < old; i++) { try { await col.doc(prefix + "-" + i).delete(); } catch(e) {} }
  LI.meta[prefix + "Chunks"] = n;
}
async function liSaveMeta(){ try { await liCol().doc("meta").set(LI.meta); } catch(e) {} }
async function liSaveEvents(){ try { await liCol().doc("events").set({e: LI.events}); } catch(e) {} }

/* ---------- CSV ---------- */
function parseCSV(text){
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) { const ch = text[i];
    if (q) { if (ch === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; continue; }
    if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i+1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; } else cur += ch; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}
function csvObjects(text, mustHave){
  const rows = parseCSV(text.replace(/^﻿/, "")); const h = rows.findIndex(r => r.some(c => c.trim().toLowerCase() === mustHave.toLowerCase())); if (h < 0) return [];
  const head = rows[h].map(c => c.trim().toLowerCase()); return rows.slice(h+1).map(r => Object.fromEntries(head.map((k,i) => [k, (r[i]||"").trim()])));
}
const MON = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function liDate(s){
  s = String(s||"").trim(); if (!s) return "";
  let m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/); if (m && MON[m[2].toLowerCase()] !== undefined) return dayStr(new Date(+m[3], MON[m[2].toLowerCase()], +m[1]));
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/); if (m) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; return dayStr(new Date(y, +m[1]-1, +m[2])); }
  const d = new Date(s); return isNaN(d) ? "" : dayStr(d);
}
const normUrl = u => String(u||"").toLowerCase().replace(/^https?:\/\/(www\.)?/,"").replace(/\/+$/,"");

/* ---------- import ---------- */
async function liImport(files){
  LI.busy = true; LI.msg = "Reading your LinkedIn export…"; rerender();
  const texts = {};
  try {
    for (const f of files) {
      if (/\.zip$/i.test(f.name)) { await loadScript(LIBS.jszip); const zip = await window.JSZip.loadAsync(await f.arrayBuffer());
        for (const name of Object.keys(zip.files)) { const base = name.split("/").pop().toLowerCase(); if (["connections.csv","invitations.csv","messages.csv","profile.csv"].includes(base)) texts[base] = await zip.files[name].async("string"); } }
      else if (/\.csv$/i.test(f.name)) texts[f.name.toLowerCase().split("/").pop()] = await f.text();
    }
  } catch(e) { LI.busy = false; LI.msg = "Couldn't read that file. Upload the ZIP LinkedIn emailed you, or the CSV files inside it."; rerender(); return; }
  const got = [];
  if (texts["connections.csv"]) { const o = csvObjects(texts["connections.csv"], "First Name");
    LI.conns = o.map(r => [r["first name"]||"", r["last name"]||"", r["url"]||"", r["company"]||"", r["position"]||"", liDate(r["connected on"])]).filter(r => r[0] || r[1]);
    await liSaveChunks("conns", LI.conns, 400); got.push(`${LI.conns.length} connections`); }
  if (texts["invitations.csv"]) { const o = csvObjects(texts["invitations.csv"], "From");
    LI.invs = o.map(r => { const out = /out/i.test(r["direction"]||""); return [out ? "out" : "in", out ? (r["to"]||"") : (r["from"]||""), liDate(r["sent at"]), !!(r["message"]||"").trim(), out ? (r["inviteeprofileurl"]||"") : (r["inviterprofileurl"]||"")]; }).filter(r => r[1]);
    try { await liCol().doc("invs").set({rows: LI.invs}); } catch(e) {} got.push(`${LI.invs.length} invitations`); }
  if (texts["messages.csv"]) { const o = csvObjects(texts["messages.csv"], "CONVERSATION ID");
    const freq = {}; o.forEach(r => { const k = normUrl(r["sender profile url"]) || r["from"]; freq[k] = (freq[k]||0) + 1; });
    const myName = (S.profile.name || "").toLowerCase().trim(), meKey = (o.find(r => myName && (r["from"]||"").toLowerCase().trim() === myName) || {})["sender profile url"];
    const me = normUrl(meKey) || Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0] || "";
    const by = {}; o.forEach(r => { if (/draft/i.test(r["folder"]||"") || /true/i.test(r["is message draft"]||"")) return; const id = r["conversation id"]; if (!id) return;
      const fromMe = (normUrl(r["sender profile url"]) || r["from"]) === me, d = liDate(r["date"]);
      const c = (by[id] ||= {name:"", url:"", first:d, last:"", mine:0, theirs:0, lastMe:false});
      if (!fromMe && !c.name) { c.name = r["from"]; c.url = r["sender profile url"]; }
      if (fromMe && !c.name) { c.name = (r["to"]||"").split(",")[0]; c.url = (r["recipient profile urls"]||"").split(",")[0]; }
      fromMe ? c.mine++ : c.theirs++; if (d && d < c.first) c.first = d; if (!c.last || d >= c.last) { c.last = d; c.lastMe = fromMe; } });
    LI.convs = Object.values(by).filter(c => c.name).map(c => [c.name, c.url, c.last, c.mine, c.theirs, c.lastMe, c.first]).sort((a,b) => String(b[2]).localeCompare(String(a[2])));
    await liSaveChunks("convs", LI.convs, 400); got.push(`${LI.convs.length} conversations`); }
  LI.busy = false;
  if (!got.length) { LI.msg = "No LinkedIn files found. The ZIP should contain Connections.csv, Invitations.csv or messages.csv."; rerender(); return; }
  LI.meta.importedAt = new Date().toISOString(); await liSaveMeta();
  const moved = liUpdatePipeline(); logActivity(1); save("progress");
  LI.msg = `Imported ${got.join(", ")}.${moved ? ` ${moved} pipeline contact${moved>1?"s":""} moved forward.` : ""} Message text is not stored, only who and when.`; rerender();
}

/* ---------- Gmail: LinkedIn notification emails ---------- */
const LI_Q = 'from:(invitations@linkedin.com OR messaging-digest-noreply@linkedin.com OR inmail-hit-reply@linkedin.com OR notifications-noreply@linkedin.com OR messages-noreply@linkedin.com) newer_than:365d';
function liClassify(th){
  const m = (th.messages || [])[0] || {}, subj = decodeEnt(m.subject || ""), snip = decodeEnt(m.snippet || "").replace(/[͏‌ ]+/g," ").replace(/\s+/g," ").trim(), from = String(m.sender || "").toLowerCase(), date = (m.date || "").slice(0,10);
  let r;
  if ((r = subj.match(/^(.+?) (?:has )?accepted your invitation/i))) { const full = (snip.match(/See (.+?)'s connections/) || [])[1]; return ["accepted", full || r[1], "", date]; }
  if ((r = snip.match(/^(.+?), (.+?) from (.+?) is waiting for your response/))) return ["invite_in", r[1], (r[2] + " · " + r[3]).slice(0,120), date];
  if ((r = snip.match(/^(.+?) is waiting for your response/))) return ["invite_in", r[1], "", date];
  if (/new invitation/i.test(subj)) return ["invite_in", "", "", date];
  if ((r = subj.match(/^(.+?) (?:just )?messaged you/i)) || (r = subj.match(/new message from (.+)$/i))) return ["msg_in", r[1], "", date];
  if ((r = subj.match(/^(.+?) replied to your/i))) return ["msg_in", r[1], "reply", date];
  if (/inmail/.test(from)) return ["inmail", "", subj.replace(/^\[[^\]]*\]\s*/,"").slice(0,120), date];
  if (/viewed your profile|appeared in \d+ searches/i.test(subj)) return ["views", "", subj.slice(0,80), date];
  return null;
}
async function liGmailSync(manual){
  if (!cap.mcp || !cap.db) { if (manual) { LI.msg = "Gmail isn't available in this view."; rerender(); } return; }
  if (manual) { LI.busy = true; LI.msg = "Reading LinkedIn emails in Gmail…"; rerender(); }
  let added = 0, token = "", pages = 0;
  try {
    do { const r = await cap.mcp.callTool("Gmail", "search_threads", Object.assign({query: LI_Q, pageSize: 50}, token ? {pageToken: token} : {}), {cache:false}); const p = r.payload || {};
      (p.threads || []).forEach(th => { if (LI.events[th.id]) return; const c = liClassify(th); if (c) { LI.events[th.id] = c; added++; } });
      token = p.nextPageToken || ""; pages++; } while (token && pages < (LI.meta.gmailAt ? 2 : 6));
    LI.meta.gmailAt = new Date().toISOString(); await liSaveEvents(); await liSaveMeta();
    const moved = liUpdatePipeline();
    LI.msg = manual ? `${added} new LinkedIn update${added===1?"":"s"} from Gmail.${moved ? ` ${moved} pipeline contact${moved>1?"s":""} moved forward.` : ""}` : LI.msg;
  } catch(e) { if (manual) LI.msg = typeof mcpMsg === "function" ? mcpMsg(e) : "Couldn't read Gmail."; }
  LI.busy = false; if (current === "network") rerender();
}

/* ---------- pipeline sync: move tracked contacts forward automatically ---------- */
function liUpdatePipeline(){
  const cs = S.network.contacts || [], rank = s => STAGES.indexOf(s); let moved = 0;
  const conn = new Set(LI.conns.map(r => normUrl(r[2])).filter(Boolean)), connNames = new Set([...LI.conns.map(r => (r[0] + " " + r[1]).toLowerCase().trim()), ...Object.values(LI.events).filter(e => e[0] === "accepted").map(e => String(e[1]).toLowerCase())]);
  const talked = new Set([...LI.convs.filter(c => c[3] > 0 && c[4] > 0).flatMap(c => [normUrl(c[1]), String(c[0]).toLowerCase()]), ...Object.values(LI.events).filter(e => e[0] === "msg_in" && e[1]).map(e => String(e[1]).toLowerCase())]);
  cs.forEach(c => { const u = normUrl(c.li), n = String(c.name||"").toLowerCase().trim(), first = n.split(" ")[0];
    const isConn = (u && conn.has(u)) || connNames.has(n) || (first && [...connNames].some(x => x === first)), isTalk = (u && talked.has(u)) || talked.has(n);
    const sent = LI.invs.some(r => r[0] === "out" && ((u && normUrl(r[4]) === u) || String(r[1]).toLowerCase().trim() === n));
    const target = isTalk ? "Talked" : isConn ? "Connected" : sent ? "Request sent" : null;
    if (target && rank(target) > rank(c.stage) && c.stage !== "Referral") { c.stage = target; moved++; } });
  if (moved) save("network"); return moved;
}

/* ---------- stats ---------- */
function liStats(){
  const ev = Object.values(LI.events), since = d => { const x = new Date(); x.setDate(x.getDate() - d); return dayStr(x); }, d30 = since(30), d7 = since(7), d60 = since(60);
  const outInv = LI.invs.filter(r => r[0] === "out"), inInv = LI.invs.filter(r => r[0] === "in");
  const acceptedEv = ev.filter(e => e[0] === "accepted"), inviteInEv = ev.filter(e => e[0] === "invite_in"), msgInEv = ev.filter(e => e[0] === "msg_in"), inmail = ev.filter(e => e[0] === "inmail");
  const connNames = new Set(LI.conns.map(r => (r[0] + " " + r[1]).toLowerCase().trim()));
  const outAccepted = outInv.filter(r => connNames.has(String(r[1]).toLowerCase().trim())).length;
  const newConn30 = Math.max(LI.conns.filter(r => r[5] >= d30).length, 0) + acceptedEv.filter(e => e[3] >= d30 && !connNames.has(String(e[1]).toLowerCase())).length;
  const awaiting = LI.convs.filter(c => !c[5] && c[2] >= d30), noReply = LI.convs.filter(c => c[5] && c[4] === 0 && c[2] <= since(7) && c[2] >= since(45));
  const msgNames = new Set(LI.convs.map(c => String(c[0]).toLowerCase()));
  const neverMsg = [...LI.conns.filter(r => r[5] >= d60).map(r => ({name:(r[0]+" "+r[1]).trim(), url:r[2], role:[r[4], r[3]].filter(Boolean).join(" · "), date:r[5]})), ...acceptedEv.filter(e => e[3] >= d60).map(e => ({name:e[1], url:"", role:"", date:e[3]}))]
    .filter((x,i,a) => x.name && !msgNames.has(x.name.toLowerCase()) && a.findIndex(y => y.name.toLowerCase() === x.name.toLowerCase()) === i).sort((a,b) => String(b.date).localeCompare(String(a.date)));
  const relevant = LI.conns.filter(r => LI_REL.test(r[4] + " " + r[3]));
  const companies = Object.entries(LI.conns.reduce((m, r) => { if (r[3]) m[r[3]] = (m[r[3]]||0) + 1; return m; }, {})).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const weekOut = outInv.filter(r => r[2] >= d7).length, weekMsg = LI.convs.filter(c => c[5] && c[2] >= d7).length;
  return {outInv, inInv, acceptedEv, inviteInEv, msgInEv, inmail, outAccepted, newConn30, awaiting, noReply, neverMsg, relevant, companies, weekOut, weekMsg,
    acceptRate: outInv.length ? Math.round(outAccepted / outInv.length * 100) : null, pendingIn: inviteInEv.filter(e => e[3] >= d30)};
}
function liDayCounts(){
  const m = {}; const add = (d, n=1) => { if (d) m[d] = (m[d]||0) + n; };
  LI.invs.forEach(r => { if (r[0] === "out") add(r[2]); }); LI.conns.forEach(r => add(r[5]));
  LI.convs.forEach(c => { if (c[5]) add(c[2]); }); Object.values(LI.events).forEach(e => { if (["accepted","msg_in","inmail"].includes(e[0])) add(e[3]); });
  (S.network.contacts||[]).forEach(c => add(c.added));
  return m;
}
function liWeekly(){
  const out = []; for (let w = 11; w >= 0; w--) { const end = new Date(); end.setDate(end.getDate() - w*7); const start = new Date(end); start.setDate(end.getDate() - 6); const a = dayStr(start), b = dayStr(end);
    out.push({label: a.slice(5), conn: LI.conns.filter(r => r[5] >= a && r[5] <= b).length + Object.values(LI.events).filter(e => e[0] === "accepted" && e[3] >= a && e[3] <= b && !LI.conns.length).length, inv: LI.invs.filter(r => r[0] === "out" && r[2] >= a && r[2] <= b).length}); }
  return out;
}

/* ---------- UI ---------- */
function liSection(){
  if (!LI.loaded) liLoad();
  const st = liStats(), dc = liDayCounts(), wk = liWeekly(), wmax = Math.max(1, ...wk.map(w => Math.max(w.conn, w.inv)));
  const hasExport = LI.conns.length || LI.invs.length || LI.convs.length, ev = Object.values(LI.events);
  const feed = Object.entries(LI.events).map(([id, e]) => ({id, e})).sort((a,b) => String(b.e[3]).localeCompare(String(a.e[3]))).slice(0, 12);
  const label = {accepted:"accepted your invitation", invite_in:"invited you to connect", msg_in:"messaged you", inmail:"InMail", views:"Profile activity"};
  return `<section class="card licard"><div class="row between"><div><span class="eyebrow">LinkedIn</span><h3>Your networking, tracked</h3></div>
      <div class="row"><button class="btn sm" data-lisync="1" ${LI.busy?"disabled":""}>Sync from Gmail</button><label class="btn sm ghost lifile">Import LinkedIn data<input type="file" id="liFile" accept=".zip,.csv" multiple hidden></label></div></div>
    <div class="lisrc"><div><b>Gmail (automatic)</b><span class="num">${LI.meta.gmailAt?`Last read ${esc(String(LI.meta.gmailAt).slice(0,16).replace("T"," "))} · ${ev.length} LinkedIn updates`:"Not synced yet: press Sync from Gmail"} · also runs with every 6-hour application sync</span></div>
      <div><b>LinkedIn data export (full history)</b><span class="num">${hasExport?`Imported ${esc(String(LI.meta.importedAt||"").slice(0,10))} · ${LI.conns.length} connections · ${LI.invs.length} invitations · ${LI.convs.length} conversations`:`Not imported: <a href="${LI_URL_EXPORT}" target="_blank" rel="noopener">request your data</a>, then upload the ZIP here`}</span></div></div>
    ${LI.msg?`<div class="${/Couldn|No LinkedIn|isn't/.test(LI.msg)?"note":"info"}">${esc(LI.msg)}</div>`:""}
    <div class="grid4 litiles">
      <div class="tile inset"><span class="lbl">Connections</span><span class="big">${LI.conns.length || "–"}</span><span class="num">${st.newConn30} new in 30 days</span></div>
      <div class="tile inset"><span class="lbl">Invitations sent</span><span class="big">${st.outInv.length || "–"}</span><span class="num">${st.acceptRate!==null?`${st.acceptRate}% accepted`:`${st.acceptedEv.length} accepted (Gmail)`}</span></div>
      <div class="tile inset"><span class="lbl">Conversations</span><span class="big">${LI.convs.length || st.msgInEv.length || "–"}</span><span class="num">${st.awaiting.length} awaiting your reply</span></div>
      <div class="tile inset"><span class="lbl">Recruiter InMails</span><span class="big">${st.inmail.length}</span><span class="num">${st.pendingIn.length} invitations to respond to</span></div>
    </div>
    <div class="duo">
      <div class="inset"><div class="row between"><span class="eyebrow">Networking activity, 18 weeks</span><span class="num">invites, connections, messages</span></div>${heatCal(k => dc[k] || 0, 18, "Networking activity")}</div>
      <div class="inset"><span class="eyebrow">This week's goal</span>
        <div class="ligoal"><span>Invitations sent</span>${bar(Math.min(100, Math.round(st.weekOut / Math.max(1, LI.goal.inv) * 100)), "acc")}<span class="num">${st.weekOut}/${LI.goal.inv}</span></div>
        <div class="ligoal"><span>Messages sent</span>${bar(Math.min(100, Math.round(st.weekMsg / Math.max(1, LI.goal.msg) * 100)), "acc")}<span class="num">${st.weekMsg}/${LI.goal.msg}</span></div>
        <div class="row"><label class="f" style="width:110px">Invites / week<input type="number" id="liGoalInv" value="${LI.goal.inv}" min="1"></label><label class="f" style="width:110px">Messages / week<input type="number" id="liGoalMsg" value="${LI.goal.msg}" min="1"></label></div>
        <span class="num">Weekly counts come from your LinkedIn export; import it weekly for exact numbers.</span>
        <div class="liweeks" aria-label="New connections and invitations per week">${wk.map(w => `<div title="Week of ${w.label}: ${w.conn} new connections, ${w.inv} invitations"><i style="height:${Math.round(w.conn/wmax*100)}%"></i><b style="height:${Math.round(w.inv/wmax*100)}%"></b><span>${w.label.slice(3)}</span></div>`).join("")}</div>
        <span class="num"><i class="lk1"></i> new connections <i class="lk2"></i> invitations sent</span></div>
    </div>
    <div class="grid3">
      <div class="inset"><span class="eyebrow">Reply to these</span>${st.awaiting.length || st.msgInEv.length ? `${st.awaiting.slice(0,6).map(c => `<div class="lirow"><span><b>${esc(c[0])}</b><span class="num"> · ${esc(c[2])}</span></span>${c[1]?`<a href="${esc(c[1])}" target="_blank" rel="noopener">Open</a>`:""}</div>`).join("")}${!LI.convs.length ? st.msgInEv.slice(0,6).map(e => `<div class="lirow"><span><b>${esc(e[1])}</b><span class="num"> messaged you · ${esc(e[3])}</span></span><a href="https://www.linkedin.com/messaging/" target="_blank" rel="noopener">Open</a></div>`).join("") : ""}` : `<p class="num">Nothing waiting.</p>`}</div>
      <div class="inset"><span class="eyebrow">Accepted, not messaged yet</span>${st.neverMsg.length ? st.neverMsg.slice(0,6).map(x => `<div class="lirow"><span><b>${esc(x.name)}</b>${x.role?`<span class="num"> · ${esc(x.role.slice(0,50))}</span>`:""}</span><button class="link" data-liadd="${esc(JSON.stringify([x.name, x.url, x.role]))}">Follow up</button></div>`).join("") : `<p class="num">Everyone you connected with recently has a conversation.</p>`}</div>
      <div class="inset"><span class="eyebrow">No reply after 7 days</span>${st.noReply.length ? st.noReply.slice(0,6).map(c => `<div class="lirow"><span><b>${esc(c[0])}</b><span class="num"> · last ${esc(c[2])}</span></span><button class="link" data-liadd="${esc(JSON.stringify([c[0], c[1], ""]))}">Track</button></div>`).join("") : `<p class="num">${LI.convs.length ? "No stalled conversations." : "Import your export to see stalled conversations."}</p>`}</div>
    </div>
    <div class="grid2">
      <div class="inset"><span class="eyebrow">People in your field (${st.relevant.length})</span><p class="num" style="margin:2px 0 6px">Connections whose title mentions privacy, GRC, compliance, risk, legal, security, AI, HR or recruiting.</p>${st.relevant.slice(0,8).map(r => `<div class="lirow"><span><b>${esc((r[0]+" "+r[1]).trim())}</b><span class="num"> · ${esc((r[4]||"").slice(0,40))}${r[3]?" @ "+esc(r[3].slice(0,30)):""}</span></span><button class="link" data-liadd="${esc(JSON.stringify([(r[0]+" "+r[1]).trim(), r[2], [r[4], r[3]].filter(Boolean).join(" · ")]))}">Add</button></div>`).join("") || `<p class="num">Import your export to see this.</p>`}</div>
      <div class="inset"><span class="eyebrow">Recent LinkedIn activity</span>${feed.length ? feed.map(({e}) => `<div class="lirow"><span>${e[1]?`<b>${esc(e[1])}</b> `:""}${esc(label[e[0]]||e[0])}${e[2]?`<span class="num"> · ${esc(e[2].slice(0,60))}</span>`:""}</span><span class="num">${esc(e[3])}</span></div>`).join("") : `<p class="num">Press Sync from Gmail to pull LinkedIn notifications.</p>`}
        ${st.companies.length?`<span class="eyebrow" style="margin-top:8px;display:block">Top companies in your network</span><div class="row">${st.companies.map(([c,n])=>`<span class="pill">${esc(c)} · ${n}</span>`).join("")}</div>`:""}</div>
    </div>
    <details class="faq"><summary>How to download your LinkedIn data (2 minutes, arrives by email)</summary><ol class="clean numbered"><li>Open <a href="${LI_URL_EXPORT}" target="_blank" rel="noopener">LinkedIn → Settings → Data privacy → Get a copy of your data</a>.</li><li>Choose "Want something in particular?" and tick Connections, Invitations and Messages (faster than the full archive).</li><li>Press Request archive. LinkedIn emails a download link, usually within 10–30 minutes.</li><li>Download the ZIP and upload it here with "Import LinkedIn data". Repeat weekly to keep counts exact.</li></ol><p class="num">Your data stays in your private Career Count storage. Message text is never saved, only names, dates and who wrote last. Email addresses from the export aren't stored.</p></details>
  </section>`;
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-lisync],[data-liadd]"); if (!el) return;
  if (el.dataset.lisync) { liGmailSync(true); return; }
  if (el.dataset.liadd) { let x; try { x = JSON.parse(el.dataset.liadd); } catch(_) { return; } const [name, url, role] = x;
    const cs = (S.network.contacts ||= []); if (cs.some(c => c.name.toLowerCase() === String(name).toLowerCase())) { toast("Already in your pipeline below."); return; }
    cs.unshift({name, role:role||"", company:"", li:/^https?:\/\//.test(url||"") ? url : "", email:"", phone:"", stage:"Connected", tpl:"follow", follow:today(), notes:"", added:today()}); save("network"); logActivity(1); toast(`${name} added to your pipeline with a follow-up note.`); rerender(); }
});
document.addEventListener("change", async e => {
  if (e.target.id === "liFile" && e.target.files.length) { liImport([...e.target.files]); return; }
  if (e.target.id === "liGoalInv" || e.target.id === "liGoalMsg") { const g = {inv: Math.max(1, +document.getElementById("liGoalInv").value || 20), msg: Math.max(1, +document.getElementById("liGoalMsg").value || 10)}; if (g.inv === LI.goal.inv && g.msg === LI.goal.msg) return; LI.goal = g; LI.meta.goal = g; liSaveMeta(); setTimeout(rerender, 0); }
});
