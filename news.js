/* ================= NEWS & REGULATIONS ================= */
let NEWS = null, NEWSMETA = null, newsF = {jur:"all", type:"all", q:"", impact:"all"};
const NEWS_TYPES = {law:"New law / rule", amendment:"Amendment", guidance:"Guidance", enforcement:"Enforcement & fines", court:"Court ruling", consultation:"Consultation", deadline:"Deadline"};
const JURS = [["India","🇮🇳"],["EU","🇪🇺"],["UK","🇬🇧"],["US","🇺🇸"],["Global","🌐"]];
async function loadNews(){
  if (!cap.db) { NEWS = NEWS || []; return; }
  try {
    const snap = await cap.db.collection("news").get();
    NEWS = snap.docs.map(d => Object.assign({id:d.id}, d.data())).sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")));
    const m = await cap.db.collection("meta").doc("news").get();
    NEWSMETA = m.exists ? m.data() : null;
  } catch(e) { NEWS = NEWS || []; }
  if (["home","news"].includes(current)) render();
}
function nextNewsRun(){
  /* Mondays 07:41 and Thursdays 19:41 India time (3.5 days apart) */
  const now = new Date(), ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const cands = [];
  for (let d = 0; d < 8; d++) { const x = new Date(ist); x.setDate(ist.getDate() + d); const dow = x.getDay();
    if (dow === 1) { const c = new Date(x); c.setHours(7,41,0,0); cands.push(c); }
    if (dow === 4) { const c = new Date(x); c.setHours(19,41,0,0); cands.push(c); } }
  const nx = cands.filter(c => c > ist).sort((a,b) => a - b)[0];
  return nx ? new Date(nx.getTime() - (330 + now.getTimezoneOffset()) * 60000) : null;
}
function daysUntil(dateStr){ const d = new Date(dateStr + "T00:00:00"); if (isNaN(d)) return null; return Math.ceil((d - new Date(today() + "T00:00:00")) / 864e5); }
function newsCard(n){
  const imp = n.impact || "medium";
  return `<article class="card newscard imp-${esc(imp)}"><div class="row between"><div class="row"><span class="pill">${esc((JURS.find(j=>j[0]===n.jurisdiction)||["",""])[1])} ${esc(n.jurisdiction||"")}</span><span class="pill acc">${esc(NEWS_TYPES[n.type]||n.type||"Update")}</span><span class="pill ${imp==="high"?"hot":imp==="low"?"":"warn"}">${imp==="high"?"High impact":imp==="low"?"Low impact":"Medium impact"}</span></div><span class="num">${esc(n.date||"")}</span></div>
    <h3>${esc(n.title)}</h3><span class="num">${esc(n.regulator||n.source||"")}${n.effective?` · effective ${esc(n.effective)}`:""}${n.deadline?` · deadline ${esc(n.deadline)}`:""}</span>
    <p style="margin:0;font-size:.94rem">${esc(n.summary||"")}</p>
    ${n.finding?`<div class="info"><b>What it means for you:</b> ${esc(n.finding)}</div>`:""}
    <div class="row">${n.url?`<a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.source||"Source")} ↗</a>`:""}${(n.topics||[]).filter(t=>TOPIC[t]).map(t=>`<button class="pill" data-go="${t}">${esc(TOPIC[t].title.replace(/ \(.*\)/,""))}</button>`).join("")}</div></article>`;
}
function viewNews(){
  const N = NEWS || [], nx = nextNewsRun();
  const list = N.filter(n => (newsF.jur==="all" || n.jurisdiction===newsF.jur) && (newsF.type==="all" || n.type===newsF.type) && (newsF.impact==="all" || (n.impact||"medium")===newsF.impact) && (!newsF.q || (n.title+" "+(n.summary||"")+" "+(n.regulator||"")).toLowerCase().includes(newsF.q.toLowerCase())));
  const cal = N.filter(n => n.deadline && daysUntil(n.deadline) !== null && daysUntil(n.deadline) >= -7).sort((a,b) => String(a.deadline).localeCompare(String(b.deadline)));
  const hl = (NEWSMETA && Array.isArray(NEWSMETA.highlights)) ? NEWSMETA.highlights : [];
  return `<div><span class="eyebrow">News & regulations</span><h2>What regulators changed, and what it means</h2></div>
  <p class="lede">Updates from governments, regulators, courts and standards bodies across India, the EU, the UK and the US, each with a plain-English finding. A scheduled task researches and adds items twice a week, every 3.5 days (Monday 07:41 and Thursday 19:41, India time).</p>
  <div class="grid4">
    <div class="card tile"><span class="lbl">Items tracked</span><span class="big">${N.length}</span><span class="num">${N.filter(n=>(n.impact||"")==="high").length} high impact</span></div>
    <div class="card tile"><span class="lbl">Last research run</span><span class="big" style="font-size:1.1rem">${NEWSMETA&&NEWSMETA.lastRun?esc(String(NEWSMETA.lastRun).slice(0,10)):"—"}</span><span class="num">${NEWSMETA&&NEWSMETA.note?esc(String(NEWSMETA.note).slice(0,90)):"Waiting for the first run"}</span></div>
    <div class="card tile"><span class="lbl">Next update</span><span class="big" style="font-size:1.1rem">${nx?nx.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"}):"—"}</span><span class="num">${nx?nx.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):""}</span></div>
    <div class="card tile"><span class="lbl">Upcoming deadlines</span><span class="big">${cal.filter(n=>daysUntil(n.deadline)>=0).length}</span><span class="num">${cal[0]?esc(cal.find(n=>daysUntil(n.deadline)>=0)?.title?.slice(0,50)||""):""}</span></div>
  </div>
  ${hl.length?`<div class="card"><span class="eyebrow">This mid-week's key findings</span><ol class="clean">${hl.map(h=>`<li>${esc(h)}</li>`).join("")}</ol></div>`:""}
  ${cal.length?`<div class="card"><span class="eyebrow">Regulatory calendar</span><div class="calrow">${cal.map(n=>{ const d = daysUntil(n.deadline); return `<div class="calitem ${d<0?"past":d<=30?"soon":""}"><b>${d<0?"Passed":d===0?"Today":d+" days"}</b><span class="num">${esc(n.deadline)}</span><span>${esc(n.title)}</span></div>`; }).join("")}</div></div>`:""}
  <div class="card"><div class="row between"><div class="row"><div class="seg" role="group" aria-label="Jurisdiction">${[["all","All"],...JURS.map(j=>[j[0],j[1]+" "+j[0]])].map(([v,l])=>`<button aria-pressed="${newsF.jur===v}" data-newsjur="${esc(v)}">${esc(l)}</button>`).join("")}</div>
    <select id="newsType" aria-label="Type"><option value="all">All types</option>${Object.entries(NEWS_TYPES).map(([k,l])=>`<option value="${k}" ${newsF.type===k?"selected":""}>${esc(l)}</option>`).join("")}</select>
    <select id="newsImpact" aria-label="Impact"><option value="all">Any impact</option>${["high","medium","low"].map(k=>`<option value="${k}" ${newsF.impact===k?"selected":""}>${k[0].toUpperCase()+k.slice(1)} impact</option>`).join("")}</select></div>
    <input type="search" id="newsQ" placeholder="Search news" value="${esc(newsF.q)}" style="max-width:240px"></div></div>
  ${N.length ? (list.length ? list.map(newsCard).join("") : `<div class="card"><p class="muted">No items match these filters.</p></div>`) : `<div class="card"><p class="muted">${cap.db?"No items yet. The first research run fills this page.":"News loads when Career Count is opened on claude.ai."}</p></div>`}`;
}
function newsWidget(){
  const N = (NEWS||[]).slice(0,3), cal = (NEWS||[]).filter(n => n.deadline && daysUntil(n.deadline) >= 0).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)))[0];
  return `<div class="card"><div class="row between"><span class="eyebrow">News & regulations</span><button class="link" data-go="news">All news</button></div>
    ${cal?`<div class="inset"><b style="font-size:.86rem">Next deadline: ${esc(cal.title)}</b><div class="num">${esc(cal.deadline)} · ${daysUntil(cal.deadline)} days</div></div>`:""}
    ${N.length?N.map(n=>`<div><b style="font-size:.88rem">${esc(n.title)}</b><div class="num">${esc(n.jurisdiction||"")} · ${esc(n.date||"")}</div></div>`).join(""):`<p class="muted">Twice-weekly research fills this in.</p>`}</div>`;
}
document.addEventListener("click", e => { const el = e.target.closest("[data-newsjur]"); if (!el) return; newsF.jur = el.dataset.newsjur; render(); });
document.addEventListener("change", e => { if (e.target.id === "newsType") { newsF.type = e.target.value; render(); } if (e.target.id === "newsImpact") { newsF.impact = e.target.value; render(); } });
document.addEventListener("input", e => { if (e.target.id === "newsQ") { newsF.q = e.target.value; clearTimeout(timers.nq); timers.nq = setTimeout(() => { render(); const i = document.getElementById("newsQ"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); } });
