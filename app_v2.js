/* ================= REFERENCE DATA ================= */
const TOPICS = [...LAW_A, ...LAW_B, ...CYBER, ...TOOLS];
const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const TRACKS = {law:"Law & frameworks", cyber:"Cyber course", tool:"Tools"};

const SKILLS = {
  grc:"GRC fundamentals", privacy:"Privacy principles", dpdp:"DPDP Act & Rules", gdpr:"GDPR", hipaa:"HIPAA",
  finreg:"GLBA / US financial privacy", usconsumer:"FCRA / FDCPA", iso:"ISO 27001 / 27701", soc2:"SOC 2 / NIST / PCI",
  controls:"Security controls", risk:"Risk assessment", audit:"Audit & evidence", tprm:"Vendor risk", contracts:"Contract & DPA review",
  privops:"Privacy operations", itbasics:"IT basics", network:"Networking", iam:"Identity & access", threats:"Threats & attacks",
  crypto:"Encryption & data protection", incident:"Incident response", cloud:"Cloud security",
  servicenow:"ServiceNow IRM", onetrust:"OneTrust", excel:"Excel / reporting", drafting:"Legal drafting & research"
};
const ROLES = [
 {id:"privacy",name:"Privacy Analyst / Data Protection Analyst",fit:"Best fit",need:{privacy:3,dpdp:3,gdpr:3,privops:3,onetrust:2,drafting:2,tprm:1,crypto:1},
  where:"Big 4 privacy teams, global banks' privacy offices in India, IT services privacy teams, privacy consultancies (e.g. Tsaaro), SaaS companies",q:"privacy analyst"},
 {id:"grcan",name:"GRC Analyst",fit:"Strong fit",need:{grc:3,iso:3,risk:3,audit:3,controls:2,soc2:2,excel:2,servicenow:2,iam:1},
  where:"Deloitte, EY, KPMG, PwC risk advisory; TCS, Infosys, Wipro, HCLTech, Accenture; GCCs in Gurugram/Noida/Bengaluru",q:"GRC analyst"},
 {id:"bfsi",name:"Compliance Analyst (BFSI)",fit:"Strong fit — uses Provana",need:{grc:2,finreg:3,usconsumer:3,risk:2,audit:2,excel:3,privacy:1},
  where:"Ameriprise, American Express, JPMorgan, Goldman Sachs, Wells Fargo, Barclays, HSBC, Deutsche Bank (India centres)",q:"compliance analyst"},
 {id:"tprm",name:"Third-Party / Vendor Risk Analyst",fit:"Good fit",need:{tprm:3,contracts:3,risk:2,iso:2,soc2:2,onetrust:1,excel:2},
  where:"Banks and GCCs, Big 4 TPRM teams, large IT services",q:"third party risk analyst"},
 {id:"legal",name:"Legal Associate — Privacy / Technology",fit:"Good fit — law first",need:{drafting:3,contracts:3,dpdp:3,gdpr:2,privacy:2,privops:1},
  where:"Cyril Amarchand Mangaldas, AZB, Khaitan & Co, Trilegal, Ikigai Law; in-house legal at tech companies",q:"legal associate data privacy"},
 {id:"itaudit",name:"IT Audit Associate",fit:"Stretch",need:{audit:3,controls:3,iso:2,soc2:2,iam:2,itbasics:2,excel:2,network:1},
  where:"Big 4 technology risk / IT audit, Grant Thornton Bharat, BDO India, Protiviti",q:"IT audit associate"},
 {id:"cyberrisk",name:"Cyber Risk Analyst",fit:"Stretch",need:{risk:3,controls:3,threats:2,network:2,cloud:2,incident:2,iso:2,iam:1},
  where:"Banks, insurers, IT services security teams",q:"cyber risk analyst"},
 {id:"dpo",name:"Data Protection Officer (3–5 year goal)",fit:"Long-term",need:{dpdp:3,gdpr:3,privops:3,iso:2,incident:2,risk:2,tprm:2,hipaa:1},
  where:"Significant Data Fiduciaries under DPDP: large platforms, banks, telecom, healthcare",q:"data protection officer"}
];

/* ================= STATE & STORAGE ================= */
const DOCS = ["progress","profile","network","videos"];
const S = {
  progress:{done:{}, quiz:{}},
  profile:{name:"", headline:"", location:"", email:"", phone:"", linkedin:"", github:"", education:"", experience:"", certs:"", targets:[], claims:[], color:"#1D5C86", avatarId:"", extra:[]},
  network:{contacts:[]},
  videos:{map:{}}
};
const LS = k => "docket2-" + k;
for (const k of DOCS) { try { const v = JSON.parse(localStorage.getItem(LS(k)) || "null"); if (v) S[k] = Object.assign(S[k], v); } catch(e) {} }
let depth = 2; try { depth = +localStorage.getItem(LS("depth")) || 2; } catch(e) {}
let track = "all"; let query = "";
let refs = {}, cap = {db:null, user:null, sample:null, mcp:null, assets:null}, saveLabel = "Saved in this browser";
const timers = {};
function save(k){
  try { localStorage.setItem(LS(k), JSON.stringify(S[k])); } catch(e) {}
  if (!refs[k]) return;
  clearTimeout(timers[k]); setSaved("Saving…");
  timers[k] = setTimeout(async () => {
    try { await refs[k].set(JSON.parse(JSON.stringify(S[k]))); setSaved("Saved to your account"); }
    catch(e) { setSaved("Saved in this browser only"); }
  }, 700);
}
function setSaved(t){ saveLabel = t; document.querySelectorAll(".saved").forEach(n => n.textContent = t); }

let UPDATES = null, FEEDMETA = null;
(async function connect(){
  try {
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    cap.db = db; cap.user = user;
    if (db && user) {
      const id = await user.id();
      if (id) {
        const col = db.collection("data/users/" + id);
        let changed = false;
        for (const k of DOCS) {
          refs[k] = col.doc(k);
          try {
            const snap = await refs[k].get();
            if (snap.exists) { S[k] = Object.assign(S[k], snap.data()); changed = true; try { localStorage.setItem(LS(k), JSON.stringify(S[k])); } catch(e) {} }
            else if (JSON.stringify(S[k]).length > 60) save(k);
          } catch(e) {}
        }
        setSaved("Saved to your account");
        if (changed) render();
      }
      loadUpdates();
    }
  } catch(e) {}
  claude.use("sample").then(s => { cap.sample = s; if (s && current.length) refreshAI(); }).catch(()=>{});
  claude.use("mcp").then(m => { cap.mcp = m; }).catch(()=>{});
  claude.use("assets").then(a => { cap.assets = a; if (current === "profile") render(); }).catch(()=>{});
})();
async function loadUpdates(){
  if (!cap.db) return;
  try {
    const snap = await cap.db.collection("updates").get();
    UPDATES = snap.docs.map(d => Object.assign({id:d.id}, d.data())).sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")));
    const m = await cap.db.collection("meta").doc("feed").get();
    FEEDMETA = m.exists ? m.data() : null;
  } catch(e) { UPDATES = UPDATES || []; }
  if (["home","updates","roles"].includes(current)) render();
}

/* ================= HELPERS ================= */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const yt = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
const key = (t,i) => t + "." + i;
const LV = {1:"Must know",2:"Core",3:"Deep dive"};
const lv = l => `<span class="lv lv${l}">${LV[l]}</span>`;
const bar = (p,cls="") => `<div class="bar ${cls}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>`;
function topicStats(t){ const n=t.subs.length; let d=0; t.subs.forEach((s,i)=>{ if (S.progress.done[key(t.id,i)]) d++; }); return {d,n,p:n?Math.round(d/n*100):0}; }
function quizStats(t){ const a = S.progress.quiz[t.id] || {}; let r=0,ans=0; t.quiz.forEach((q,i)=>{ if (a[i]!==undefined){ ans++; if (a[i]===q.a) r++; } }); return {r,ans,n:t.quiz.length,pass:ans===t.quiz.length && r>=Math.ceil(t.quiz.length*2/3)}; }
function trackStats(tr){ let d=0,n=0; TOPICS.filter(t=>tr==="all"||t.track===tr).forEach(t=>{ const s=topicStats(t); d+=s.d; n+=s.n; }); return {d,n,p:n?Math.round(d/n*100):0}; }
function skillLevel(sk){
  const ts = TOPICS.filter(t => t.sk.includes(sk));
  let lvl = 0;
  if (ts.length) lvl = ts.reduce((a,t) => a + topicStats(t).p/100*0.8 + (quizStats(t).pass?0.2:0), 0) / ts.length;
  if ((S.profile.claims||[]).includes(sk)) lvl = Math.max(lvl, 0.7);
  return Math.round(lvl*100);
}
function roleReady(r){ let w=0,s=0; for (const [k,v] of Object.entries(r.need)){ w+=v; s+=v*skillLevel(k)/100; } return Math.round(s/w*100); }
function readyPill(p){ return p>=70?`<span class="pill ok">Apply now</span>`:p>=40?`<span class="pill warn">Apply + keep learning</span>`:`<span class="pill bad">Building up</span>`; }
function gaps(r){ return Object.entries(r.need).map(([k,v])=>({k,v,l:skillLevel(k)})).filter(x=>x.l<70).sort((a,b)=>(b.v*(100-b.l))-(a.v*(100-a.l))); }
function topicForSkill(k){ return TOPICS.filter(t=>t.sk.includes(k)).sort((a,b)=>topicStats(a).p-topicStats(b).p)[0]; }
function initials(n){ const p=String(n||"").trim().split(/\s+/).filter(Boolean); return ((p[0]||"?")[0] + (p.length>1?p[p.length-1][0]:"")).toUpperCase(); }
function avatarHTML(cls=""){ const p=S.profile; const img = p.avatarId ? `<img alt="" src="/_blob/${esc(p.avatarId)}">` : esc(initials(p.name||"Jyotirmaya Negi")); return `<span class="avatar ${cls}" style="background:${esc(p.color||"#1D5C86")}">${img}</span>`; }
function tsParse(s){ s=String(s||"").trim(); if(!s) return null; const p=s.split(":").map(Number); if(p.some(isNaN)) return null; return p.reduce((a,b)=>a*60+b,0); }
function tsFmt(n){ n=Math.max(0,Math.floor(n)); const h=Math.floor(n/3600), m=Math.floor(n%3600/60), s=n%60; return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0"); }
function ytAt(url, sec){ try { const u = new URL(url); if (!/youtube\.com|youtu\.be/.test(u.hostname)) return url; u.searchParams.set("t", sec + "s"); return u.toString(); } catch(e) { return url; } }
function addTerms(html, terms){
  if (!terms) return html;
  const slots = [];
  for (const [term, def] of Object.entries(terms)) {
    const re = new RegExp("(^|[^\\w\u0001])(" + term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")(?=[^\\w]|$)");
    html = html.replace(re, (m, pre, t) => { slots.push(`<button class="term" data-def="${esc(def)}">${t}</button>`); return pre + "\u0001" + (slots.length-1) + "\u0002"; });
  }
  return html.replace(/\u0001(\d+)\u0002/g, (m, i) => slots[+i]);
}
async function copyText(btn, text){
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
  catch(e) { btn.textContent = "Select and copy manually"; }
  setTimeout(() => btn.textContent = old, 1600);
}

/* ================= ILLUSTRATIONS ================= */
function wrapWords(s, max){ const w=String(s).split(" "); const L=[]; let c=""; w.forEach(x=>{ if((c+" "+x).trim().length>max){ if(c)L.push(c); c=x; } else c=(c+" "+x).trim(); }); if(c)L.push(c); return L; }
function svgRing(nodes, center, arrows){
  const n=nodes.length, R=128, cx=210, cy=190;
  let s=`<svg class="ills" viewBox="0 0 420 380" role="img" aria-label="${esc(center)}">`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line)" stroke-width="2" ${arrows?'stroke-dasharray="6 6"':''}/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="56" fill="var(--paper)" stroke="var(--accent)" stroke-width="1.5"/>`;
  wrapWords(center,12).forEach((l,i,a)=>{ s+=`<text x="${cx}" y="${cy+5+(i-(a.length-1)/2)*16}" text-anchor="middle" font-family="Newsreader,Georgia,serif" font-weight="650" font-size="15" fill="var(--ink)">${esc(l)}</text>`; });
  nodes.forEach((t,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/n, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    const lines=wrapWords(t,14), h=18+lines.length*14, w=118;
    s+=`<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="7" fill="var(--paper)" stroke="var(--accent)" stroke-width="1.2"/>`;
    lines.forEach((l,j)=>{ s+=`<text x="${x}" y="${y+4+(j-(lines.length-1)/2)*14}" text-anchor="middle" font-family="Public Sans,system-ui,sans-serif" font-size="11.5" font-weight="600" fill="var(--ink)">${esc(l)}</text>`; });
    if (arrows){ const a2=a+Math.PI/n, ax=cx+R*Math.cos(a2), ay=cy+R*Math.sin(a2), rot=a2*180/Math.PI+90; s+=`<path d="M -5 -4 L 5 0 L -5 4 Z" transform="translate(${ax},${ay}) rotate(${rot-90})" fill="var(--seal)"/>`; }
  });
  return s + `</svg>`;
}
function illustrate(t){
  const I = t.ill; if (!I) return "";
  switch (I.type) {
    case "flow": return `<div class="flow">${I.steps.map((s,i)=>`${i?'<span class="arr" aria-hidden="true">→</span>':''}<div class="node"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join("")}</div>`;
    case "cycle": return svgRing(I.steps, I.center, true);
    case "hub": return svgRing(I.spokes, I.center, false);
    case "stack": return `<div class="stackv">${I.title?`<b class="num">${esc(I.title)}</b>`:""}${I.layers.map(l=>`<div class="lay"><b>${esc(l[0])}</b><span>${esc(l[1])}</span></div>`).join("")}</div>`;
    case "compare": return `<div class="cmp"><div><div class="ch">${esc(I.left[0])}</div>${I.left.slice(1).map(x=>`<div class="ci">${esc(x)}</div>`).join("")}</div><div><div class="ch">${esc(I.right[0])}</div>${I.right.slice(1).map(x=>`<div class="ci">${esc(x)}</div>`).join("")}</div></div>`;
    case "actors": { const N=I.nodes; const c=(n)=>`<div class="an"><b>${esc(n[0])}</b><span>${esc(n[1])}</span></div>`;
      return `<div class="actors"><div></div>${c(N[1])}<div></div>${c(N[0])}<div class="ar">consent →<br>← notice, rights</div>${c(N[2])}<div></div><div class="ar">↓ complaints<br>penalties ↑</div><div class="ar">→ instructions</div><div></div>${c(N[4])}${c(N[3])}</div>`; }
    case "map": return `<div class="mapv"><div class="mc">${esc(I.control)}</div><div class="num">satisfies ↓</div><div class="mt">${I.targets.map(x=>`<div><b>${esc(x[0])}</b><br><span class="muted">${esc(x[1])}</span></div>`).join("")}</div></div>`;
    case "grid": return `<div class="tbl"><table><thead><tr><th></th>${I.cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${I.rows.map((r,i)=>`<tr><th>${esc(r)}</th>${I.cells[i].map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    case "table": return `<div class="tbl"><table><thead><tr>${I.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${I.rows.map(r=>`<tr>${r.map((c,i)=>`<td${i===5?` style="font-weight:600;color:${+c>=15?'var(--seal)':+c>=8?'var(--warn)':'var(--ok)'}"`:''}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    case "heat": {
      let h=`<div class="heat" role="grid" aria-label="5 by 5 risk matrix"><div class="hl"></div>${[1,2,3,4,5].map(i=>`<div class="hl">I${i}</div>`).join("")}`;
      for (let L=5; L>=1; L--) { h+=`<div class="hl">L${L}</div>`; for (let I2=1; I2<=5; I2++){ const s=L*I2, bg=s>=15?'var(--h3)':s>=8?'var(--h2)':'var(--h1)'; h+=`<button class="hc" style="background:${bg}" data-heat="${L},${I2}">${s}</button>`; } }
      return h+`</div><p class="num" id="heatOut" style="margin-top:10px">L = likelihood, I = impact. Tap a cell.</p>`; }
  }
  return "";
}

/* ================= VIEWS ================= */
const NAV = [["home","Home"],["learn","Learn"],["roles","Roles & readiness"],["network","Network"],["updates","Updates"],["resume","Resume"],["linkedin","LinkedIn"],["jobs","Jobs"]];
let current = "home";

function viewHome(){
  const all = trackStats("all"), p = S.profile;
  const next = TOPICS.find(t => topicStats(t).p < 100 && t.prio) || TOPICS.find(t => topicStats(t).p < 100);
  const ranked = ROLES.map(r => ({r, p:roleReady(r)})).sort((a,b) => b.p - a.p).slice(0,3);
  const due = (S.network.contacts||[]).filter(c => c.follow && c.follow <= new Date().toISOString().slice(0,10) && c.stage !== "Referral");
  return `
  <div class="card"><div class="row" style="gap:16px">${avatarHTML("lg")}<div style="display:grid;gap:4px;min-width:0;flex:1">
    <span class="eyebrow">Welcome back</span><h2>${esc(p.name || "Jyotirmaya Negi")}</h2>
    <p class="muted">${esc(p.headline || "Law graduate moving into Privacy & GRC")} · <button class="link" data-go="profile">Edit profile</button></p></div></div></div>
  <div class="grid3">
    <div class="card"><span class="num">Overall learning</span><span class="big">${all.p}%</span>${bar(all.p)}<span class="num">${all.d}/${all.n} sub-topics · <span class="saved">${saveLabel}</span></span></div>
    ${["law","cyber","tool"].map(tr=>{const s=trackStats(tr);return `<div class="card"><span class="num">${TRACKS[tr]}</span><span class="big">${s.p}%</span>${bar(s.p)}<span class="num">${s.d}/${s.n}</span></div>`;}).join("")}
  </div>
  <div class="grid2">
    ${next?`<div class="card"><span class="eyebrow">Continue learning</span><h3>${esc(next.title)}</h3><p class="muted">${esc(next.short)}</p>${bar(topicStats(next).p)}<div><button class="btn" data-go="${next.id}">Open topic</button></div></div>`:""}
    <div class="card"><div class="row between"><span class="eyebrow">Closest roles</span><button class="link" data-go="roles">All roles</button></div>
      ${ranked.map(x=>`<div class="rrow"><div style="min-width:0"><b style="font-size:.9rem">${esc(x.r.name)}</b>${bar(x.p,"acc")}</div><div class="row" style="justify-content:flex-end"><span class="num">${x.p}%</span></div></div>`).join("")}</div>
  </div>
  <div class="grid2">
    <div class="card"><div class="row between"><span class="eyebrow">Follow-ups due</span><button class="link" data-go="network">Network</button></div>
      ${due.length?due.slice(0,4).map(c=>`<div class="row between"><span>${esc(c.name)} · <span class="muted">${esc(c.company||"")}</span></span><span class="num">${esc(c.follow)}</span></div>`).join(""):`<p class="muted">Nothing due. Add people you want to reach on the Network page.</p>`}</div>
    <div class="card"><div class="row between"><span class="eyebrow">Latest updates</span><button class="link" data-go="updates">All updates</button></div>
      ${UPDATES&&UPDATES.length?UPDATES.slice(0,3).map(u=>`<div><b style="font-size:.9rem">${esc(u.title)}</b><div class="num">${esc(u.date||"")} · ${esc(u.source||"")}</div></div>`).join(""):`<p class="muted">Your weekly web check fills this in with new laws, rule changes and in-demand skills.</p>`}</div>
  </div>
  <div class="card"><h3>16-week roadmap</h3><div class="tbl"><table><thead><tr><th>Weeks</th><th>Law</th><th>Cyber</th><th>Tools</th><th>Job hunt</th></tr></thead><tbody>
    <tr><td>1–2</td><td>GRC foundations, privacy principles</td><td>Computers, networking</td><td>Excel basics</td><td>Fix resume + LinkedIn</td></tr>
    <tr><td>3–4</td><td>DPDP Act + Rules</td><td>Identity & access</td><td>Excel formulas</td><td>Apply 5/week, connect 10/day</td></tr>
    <tr><td>5–7</td><td>GDPR, HIPAA, GLBA/FCRA/FDCPA</td><td>Threats, encryption</td><td>ServiceNow PDI</td><td>Post 1 learning note/week</td></tr>
    <tr><td>8–10</td><td>ISO 27001/27701, SOC 2, NIST</td><td>Controls, incident response</td><td>Risk register + control matrix</td><td>Apply 10/week</td></tr>
    <tr><td>11–14</td><td>Risk, audit, vendor risk, privacy ops</td><td>Cloud; book ISC2 CC or Security+</td><td>OneTrust demos + paper workflows</td><td>Mock interviews</td></tr>
    <tr><td>15–16</td><td colspan="3">Revise, finish portfolio, sit the cyber exam</td><td>Full applications push</td></tr></tbody></table></div></div>`;
}

function depthControl(){
  return `<div class="row"><span class="num">Show depth</span><div class="seg" role="group" aria-label="Depth">${[[1,"Must know only"],[2,"+ Core"],[3,"Everything"]].map(([v,l])=>`<button aria-pressed="${depth===v}" data-depth="${v}">${l}</button>`).join("")}</div></div>`;
}
function legend(){ return `<div class="legend">${lv(1)}<span class="muted">interview essentials</span>${lv(2)}<span class="muted">working knowledge</span>${lv(3)}<span class="muted">detail, read later</span><span class="src">Primary</span><span class="muted">official source</span></div>`; }

function viewLearn(){
  const q = query.toLowerCase();
  const list = TOPICS.filter(t => (track==="all"||t.track===track) && (!q || (t.title+" "+t.short+" "+t.subs.map(s=>s.t+" "+s.b).join(" ")).toLowerCase().includes(q)));
  const hits = q ? TOPICS.flatMap(t => t.subs.map((s,i)=>({t,s,i}))).filter(x => (x.s.t+" "+x.s.b).toLowerCase().includes(q)).slice(0,12) : [];
  return `<div><span class="eyebrow">Study library</span><h2>Learn</h2></div>
  <p class="lede">${TOPICS.length} topics, ${TOPICS.reduce((a,t)=>a+t.subs.length,0)} sub-topics. Each topic page is split into the same parts: objective, why it exists, key ideas, a picture, a real example, benefits, mistakes, a quiz and where to watch.</p>
  <div class="card">${legend()}<div class="row between">
    <div class="seg" role="group" aria-label="Track">${[["all","All"],["law","Law"],["cyber","Cyber"],["tool","Tools"]].map(([v,l])=>`<button aria-pressed="${track===v}" data-track="${v}">${l}</button>`).join("")}</div>
    <input type="search" id="q" placeholder="Search topics, e.g. consent, MFA, SoA" value="${esc(query)}" style="max-width:340px"></div></div>
  ${hits.length?`<div class="card"><span class="eyebrow">Matching sub-topics</span>${hits.map(x=>`<div class="row between"><button class="link" data-go="${x.t.id}" data-anchor="s-${x.i}">${esc(x.s.t)}</button><span class="row">${lv(x.s.l)}<span class="num">${esc(x.t.title)}</span></span></div>`).join("")}</div>`:""}
  <div class="grid3">${list.map(t=>{ const s=topicStats(t), qz=quizStats(t); const c=[1,2,3].map(l=>t.subs.filter(x=>x.l===l).length);
    return `<article class="card tcard" data-go="${t.id}" tabindex="0" role="link">
      <div class="row between"><span class="eyebrow">${esc(TRACKS[t.track])} · ${esc(t.weeks)}</span>${t.prio?'<span class="pill hot">Priority</span>':''}</div>
      <h3>${esc(t.title)}</h3><p class="muted" style="font-size:.9rem">${esc(t.short)}</p>
      <div class="dots"><span class="d1">${c[0]}</span><span class="d2">${c[1]}</span><span class="d3">${c[2]}</span><span>sub-topics</span></div>
      ${bar(s.p)}<div class="row between"><span class="num">${s.d}/${s.n} learned</span>${qz.pass?'<span class="pill ok">Quiz passed</span>':qz.ans?`<span class="num">Quiz ${qz.r}/${qz.n}</span>`:''}</div></article>`;}).join("")}</div>`;
}

const PARTS = [["obj","Objective"],["why","Why it exists"],["ideas","Key ideas"],["pic","Picture it"],["case","Real example"],["ben","Why employers care"],["trap","Mistakes & traps"],["quiz","Check yourself"],["terms","Jargon decoder"],["watch","Watch & read"],["ask","Ask Claude"]];
function part(n, id, title, inner){ return `<section class="card part" id="p-${id}"><div class="ph"><span class="pn">${String(n).padStart(2,"0")}</span><h3>${title}</h3></div>${inner}</section>`; }

function subHTML(t, s, i){
  const k = key(t.id,i), done = !!S.progress.done[k];
  const bms = (S.videos.map[k] || []);
  if (s.l > depth) return `<div class="sub L${s.l} collapsed" id="s-${i}"><div class="top"><span><b>${esc(s.t)}</b></span><span class="row">${lv(s.l)}<button class="link" data-reveal="${i}">Show</button></span></div></div>`;
  return `<div class="sub L${s.l} ${done?"done":""}" id="s-${i}">
    <div class="top"><h4>${esc(s.t)}</h4>${lv(s.l)}</div>
    <p>${addTerms(esc(s.b), t.terms)}</p>
    ${s.ex?`<div class="ex"><b>Example:</b> ${esc(s.ex)}</div>`:""}
    <div class="vrow"><span class="src video">Video</span><a href="${yt(s.v)}" target="_blank" rel="noopener">Find videos on this sub-topic</a>
      <button class="link" data-bmform="${k}">+ Save a timestamp</button></div>
    <div id="bmf-${k.replace(".","_")}" hidden></div>
    ${bms.map((b,j)=>`<div class="bm"><span class="ts">${tsFmt(b.sec)}</span><a href="${esc(ytAt(b.url,b.sec))}" target="_blank" rel="noopener">${esc(b.label||"Jump to this part")}</a><button class="link" data-bmdel="${k}|${j}">Remove</button></div>`).join("")}
    <label class="learned"><input type="checkbox" id="chk-${k}" data-k="${k}" ${done?"checked":""}> I can explain this in my own words</label>
  </div>`;
}

function viewTopic(t){
  const st = topicStats(t), idx = TOPICS.indexOf(t), prev = TOPICS[idx-1], next = TOPICS[idx+1];
  const qa = S.progress.quiz[t.id] || {};
  let n = 0;
  return `<div class="thead"><button class="link" data-go="learn">← All topics</button>
    <span class="eyebrow">${esc(TRACKS[t.track])} · ${esc(t.weeks)}${t.prio?" · priority":""}</span>
    <h2>${esc(t.title)}</h2><p class="lede">${esc(t.short)}</p>
    <div class="row">${bar(st.p).replace('class="bar','style="flex:1;min-width:160px" class="bar')}<span class="num">${st.d}/${st.n} learned</span></div>
    <div class="card" style="gap:10px">${depthControl()}${legend()}</div>
    <nav class="parts" aria-label="Parts">${PARTS.map(([id,l],i)=>`<a href="#${t.id}" data-anchor="p-${id}">${i+1}. ${l}</a>`).join("")}</nav></div>
  ${part(++n,"obj","Objective",`<p>${esc(t.obj)}</p>`)}
  ${part(++n,"why","Why it exists",`<p>${addTerms(esc(t.why), t.terms)}</p>`)}
  ${part(++n,"ideas","Key ideas",`<div style="display:grid;gap:10px">${t.subs.map((s,i)=>subHTML(t,s,i)).join("")}</div>`)}
  ${part(++n,"pic","Picture it",`<div class="ill">${illustrate(t)}</div><p class="muted">${esc(t.illCap||"")}</p>`)}
  ${part(++n,"case","Real example",`<h4>${esc(t.case.t)}</h4><p>${addTerms(esc(t.case.b), t.terms)}</p>`)}
  ${part(++n,"ben","Why employers care",`<ul class="clean">${t.ben.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`)}
  ${part(++n,"trap","Mistakes & interview traps",`<ul class="clean">${t.trap.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`)}
  ${part(++n,"quiz","Check yourself",`<div>${t.quiz.map((q,i)=>{ const a=qa[i]; return `<div class="quizq"><b>${i+1}. ${esc(q.q)}</b><div class="opts">${q.o.map((o,j)=>`<button data-quiz="${t.id}|${i}|${j}" ${a!==undefined?"disabled":""} class="${a!==undefined?(j===q.a?"right":(j===a?"wrong":"")):""}">${esc(o)}</button>`).join("")}</div>${a!==undefined?`<p class="muted" style="font-size:.88rem">${a===q.a?"Correct. ":"Not quite. "}${esc(q.w)}</p>`:""}</div>`;}).join("")}</div>
    <div class="row between"><span class="num">${(()=>{const s=quizStats(t);return s.ans?`Score ${s.r}/${s.n}${s.pass?" · passed":""}`:"Answer all three to record a score";})()}</span><button class="btn ghost sm" data-quizreset="${t.id}">Retake</button></div>`)}
  ${part(++n,"terms","Jargon decoder",`<div class="tbl"><table><tbody>${Object.entries(t.terms||{}).map(([k,v])=>`<tr><th style="text-transform:none;font-family:var(--body);font-size:.88rem;color:var(--ink)">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div><p class="muted" style="font-size:.88rem">Dotted words on this page show these meanings when tapped.</p>`)}
  ${part(++n,"watch","Watch & read",`
    <div style="display:grid;gap:8px">${t.refs.map(([l,u,k])=>`<div class="vrow"><span class="src ${k==="primary"?"":k}">${k==="primary"?"Primary":k}</span><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div>
    <div class="info"><b>Jump straight to the right minute.</b> I can't watch videos, so I don't make up timestamps. Instead: open a video, copy its chapter list from the description (or its transcript via "Show transcript"), paste it below, and Claude matches each sub-topic of this page to the minute it starts. Results save as jump links under each sub-topic.</div>
    <div class="form"><label class="f">Video link<input type="url" id="tfUrl" placeholder="https://www.youtube.com/watch?v=..."></label></div>
    <label class="f">Chapters or transcript (with times)<textarea id="tfText" placeholder="0:00 Intro&#10;2:15 What is personal data&#10;6:40 Consent..."></textarea></label>
    <div class="row"><button class="btn" id="tfGo" data-tid="${t.id}">Find sub-topic timestamps</button><span class="num" id="tfMsg"></span></div>
    <div id="tfOut" style="display:grid;gap:6px"></div>`)}
  ${part(++n,"ask","Ask Claude about this topic",`
    <p class="muted" style="font-size:.9rem">Answers come from Claude's own knowledge, not a live web search. Check dates and numbers against the primary sources above.</p>
    <div class="row">${[["simple","Explain it more simply"],["india","Give me an Indian example"],["interview","Ask me 3 interview questions"],["deeper","Go one level deeper"]].map(([k,l])=>`<button class="btn ghost sm" data-ask="${t.id}|${k}">${l}</button>`).join("")}</div>
    <div class="row"><input type="text" id="askQ" placeholder="Or type your own question about ${esc(t.title)}" style="flex:1;min-width:200px"><button class="btn sm" data-ask="${t.id}|free">Ask</button><button class="btn ghost sm" id="askStop" hidden>Stop</button></div>
    <div class="ai" id="aiOut" aria-live="polite">Pick a button above.</div>`)}
  <div class="pager">${prev?`<button class="btn ghost" data-go="${prev.id}">← ${esc(prev.title)}</button>`:"<span></span>"}${next?`<button class="btn ghost" data-go="${next.id}">${esc(next.title)} →</button>`:""}</div>`;
}

function viewRoles(){
  const ranked = ROLES.map(r => ({r, p:roleReady(r)})).sort((a,b) => b.p - a.p);
  const targets = S.profile.targets||[];
  const trend = (UPDATES||[]).filter(u=>u.kind==="skill"||u.kind==="tool").slice(0,6);
  return `<div><span class="eyebrow">Readiness tracker</span><h2>Roles you can apply for</h2></div>
  <p class="lede">Each role needs a weighted set of skills. Your level in a skill comes from sub-topics you've marked as learned, quizzes you've passed, and skills you've said you already have from work (set in your profile).</p>
  <div class="card"><span class="eyebrow">How to read this</span><div class="row">${readyPill(80)}<span class="muted">70%+</span>${readyPill(50)}<span class="muted">40–69%</span>${readyPill(10)}<span class="muted">under 40%</span></div></div>
  ${ranked.map(({r,p})=>{ const g=gaps(r).slice(0,3); return `<article class="card">
    <div class="row between"><div style="min-width:0"><span class="eyebrow">${esc(r.fit)}${targets.includes(r.id)?" · your target":""}</span><h3>${esc(r.name)}</h3></div><div class="row"><span class="big">${p}%</span>${readyPill(p)}</div></div>
    ${bar(p,"acc")}
    <details><summary class="link" style="cursor:pointer;font-weight:600">Skill breakdown</summary><div style="display:grid;gap:6px;margin-top:10px">
      ${Object.entries(r.need).sort((a,b)=>b[1]-a[1]).map(([k,w])=>{const l=skillLevel(k);return `<div class="skillrow"><span>${esc(SKILLS[k])} <span class="num">×${w}</span></span>${bar(l)}<span class="num">${l}%</span></div>`;}).join("")}</div></details>
    ${g.length?`<div><b style="font-size:.9rem">Learn next for this role</b><div style="display:grid;gap:4px;margin-top:6px">${g.map(x=>{const tp=topicForSkill(x.k);return `<div class="row between"><span>${esc(SKILLS[x.k])} <span class="num">${x.l}%</span></span>${tp?`<button class="link" data-go="${tp.id}">${esc(tp.title)}</button>`:`<button class="link" data-go="profile">Mark in profile if you have it</button>`}</div>`;}).join("")}</div></div>`:`<p class="muted">All core skills covered. Apply.</p>`}
    <p style="font-size:.88rem"><b>Where they hire:</b> <span class="muted">${esc(r.where)}</span></p>
    <div class="row"><a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(r.q)}&location=India" target="_blank" rel="noopener">LinkedIn jobs</a><a href="https://www.naukri.com/${r.q.toLowerCase().replace(/\s+/g,"-")}-jobs" target="_blank" rel="noopener">Naukri jobs</a><button class="link" data-roleask="${r.id}">Ask Claude what else this role needs</button></div>
    <div class="ai" id="ra-${r.id}" hidden></div></article>`;}).join("")}
  <div class="card"><span class="eyebrow">From your weekly web check</span><h3>Skills and tools showing up in job posts</h3>
    ${trend.length?trend.map(u=>`<div><b style="font-size:.92rem">${esc(u.title)}</b><p class="muted" style="font-size:.88rem">${esc(u.summary||"")}</p></div>`).join(""):`<p class="muted">Nothing yet. The weekly task adds skills it sees trending in Indian GRC and privacy postings.</p>`}</div>
  <div class="card"><span class="eyebrow">Your own extra skills to learn</span>
    ${(S.profile.extra||[]).length?(S.profile.extra).map((x,i)=>`<div class="row between"><span>${esc(x)}</span><button class="link" data-extradel="${i}">Remove</button></div>`).join(""):`<p class="muted">Add skills Claude or a job post suggests that aren't in this docket yet.</p>`}
    <div class="row"><input type="text" id="extraIn" placeholder="e.g. AI governance (ISO 42001)" style="flex:1;min-width:200px"><button class="btn sm" id="extraAdd">Add</button></div></div>`;
}

const STAGES = ["To connect","Request sent","Connected","Talked","Referral"];
const NOTES = {
  pro:(c)=>`Hi ${c.name||"[Name]"}, I'm a law graduate moving into privacy and GRC, studying DPDP and ISO 27001. Your work at ${c.company||"[Company]"} stood out. Would love to connect and learn from your posts.`,
  rec:(c)=>`Hi ${c.name||"[Name]"}, I'm an Advocate with US compliance experience (FCRA/FDCPA), now focused on DPDP and GRC. I saw ${c.company||"[Company]"} hires for privacy/compliance roles and would be glad to connect.`,
  alum:(c)=>`Hi ${c.name||"[Name]"}, fellow law alum here. I see you moved into ${c.role||"privacy/risk"} — I'm on the same path. Could I ask you two quick questions about how you made the switch?`,
  follow:(c)=>`Hi ${c.name||"[Name]"}, thanks for connecting. I'm building skills in DPDP and ISO 27001 and would value 10 minutes of your advice on breaking into ${c.role||"GRC"} at ${c.company||"your company"}. Happy to work around your schedule.`
};
let netFilter = "All";
function viewNetwork(){
  const cs = S.network.contacts||[];
  const shown = netFilter==="All"?cs:cs.filter(c=>c.stage===netFilter);
  return `<div><span class="eyebrow">Your networking desk</span><h2>Network</h2></div>
  <p class="lede">Track the people you're reaching out to, write notes with one tap, and open LinkedIn, WhatsApp or a Gmail draft from here.</p>
  <div class="info">LinkedIn doesn't let outside apps send messages or connection requests for you. So this page prepares the note, copies it, and opens the person's LinkedIn profile; you press Send there. Email drafts go straight into your Gmail Drafts folder (you approve Gmail access the first time).</div>
  <div class="card"><h3>Find people</h3><div class="form">
    <label class="f">Role<select id="fpRole">${["GRC Analyst","Privacy Analyst","Data Protection Officer","Privacy Counsel","Compliance Analyst","Talent Acquisition","Third Party Risk"].map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label class="f">Company (optional)<input type="text" id="fpCo" placeholder="e.g. Deloitte"></label>
    <label class="f">Location<input type="text" id="fpLoc" value="India"></label></div>
    <div class="row"><a class="btn" id="fpLink" style="text-decoration:none" href="https://www.linkedin.com/search/results/people/?keywords=GRC%20Analyst%20India" target="_blank" rel="noopener">Search on LinkedIn</a><span class="num">Opens LinkedIn people search in a new tab</span></div></div>
  <div class="card"><h3>Add a contact</h3><div class="form">
    <label class="f">Name<input type="text" id="ncName"></label><label class="f">Role<input type="text" id="ncRole"></label>
    <label class="f">Company<input type="text" id="ncCo"></label><label class="f">LinkedIn URL<input type="url" id="ncLi" placeholder="https://www.linkedin.com/in/..."></label>
    <label class="f">Email (optional)<input type="email" id="ncEmail"></label><label class="f">WhatsApp number (optional)<input type="text" id="ncPhone" placeholder="+91..."></label></div>
    <div><button class="btn" id="ncAdd">Add contact</button></div></div>
  <div class="row"><div class="seg" role="group" aria-label="Stage filter">${["All",...STAGES].map(s=>`<button aria-pressed="${netFilter===s}" data-netf="${s}">${s} (${s==="All"?cs.length:cs.filter(c=>c.stage===s).length})</button>`).join("")}</div></div>
  <div style="display:grid;gap:10px">${shown.length?shown.map(c=>{const i=cs.indexOf(c);return `<div class="contact">
    <div class="row between"><div><b>${esc(c.name)}</b> <span class="muted">${esc(c.role||"")}${c.company?" · "+esc(c.company):""}</span></div>
      <select data-stage="${i}" aria-label="Stage" style="width:auto">${STAGES.map(s=>`<option ${c.stage===s?"selected":""}>${s}</option>`).join("")}</select></div>
    <div class="row"><label class="f" style="flex:1;min-width:160px">Note template<select data-tpl="${i}">${[["pro","To a professional"],["rec","To a recruiter"],["alum","To an alumnus"],["follow","Follow-up after connecting"]].map(([k,l])=>`<option value="${k}" ${c.tpl===k?"selected":""}>${l}</option>`).join("")}</select></label>
      <label class="f">Follow up on<input type="date" data-follow="${i}" value="${esc(c.follow||"")}"></label></div>
    <p style="font-size:.9rem;background:var(--bg);padding:8px 10px;border-radius:6px" id="nt-${i}">${esc(NOTES[c.tpl||"pro"](c))}</p>
    <div class="row"><button class="btn sm" data-copynote="${i}">Copy note</button>
      ${c.li?`<a href="${esc(c.li)}" target="_blank" rel="noopener">Open LinkedIn profile</a>`:""}
      ${c.phone?`<a href="https://wa.me/${esc(String(c.phone).replace(/\D/g,""))}?text=${encodeURIComponent(NOTES[c.tpl||"pro"](c))}" target="_blank" rel="noopener">Open in WhatsApp</a>`:""}
      ${c.email?`<button class="btn ghost sm" data-gmail="${i}">Draft in Gmail</button>`:""}
      <button class="link" data-netdel="${i}">Remove</button></div>
    <span class="num" id="gm-${i}"></span>
    <textarea data-cnotes="${i}" placeholder="Notes: what you talked about, who referred you…" style="min-height:50px">${esc(c.notes||"")}</textarea></div>`;}).join(""):`<div class="card"><p class="muted">No contacts here yet. Use "Find people" to search LinkedIn, then add the people you want to reach. Aim for 10 a day for two weeks.</p></div>`}</div>`;
}

function viewUpdates(){
  const U = UPDATES||[];
  const groups = [["law","Law and regulation changes"],["news","News and enforcement"],["skill","Skills in demand"],["tool","Tools in demand"]];
  return `<div><span class="eyebrow">Live from the web</span><h2>Updates</h2></div>
  <p class="lede">A scheduled task searches the web every week for changes to DPDP, GDPR, CERT-In rules and other laws in this docket, plus skills and tools trending in Indian GRC and privacy job posts, and posts them here with sources.</p>
  <div class="row between"><span class="num">${FEEDMETA&&FEEDMETA.lastRun?"Last web check: "+esc(String(FEEDMETA.lastRun).slice(0,10)):"Waiting for the first web check"}</span><button class="btn ghost sm" id="updRefresh">Refresh</button></div>
  ${U.length?groups.map(([k,l])=>{const items=U.filter(u=>u.kind===k);return items.length?`<div class="card"><h3>${l}</h3>${items.map(u=>`<div style="display:grid;gap:3px;padding-block:8px;border-bottom:1px solid var(--line)">
    <b>${esc(u.title)}</b><p style="font-size:.9rem">${esc(u.summary||"")}</p>
    <div class="row"><span class="num">${esc(u.date||"")}</span>${u.url?`<a href="${esc(u.url)}" target="_blank" rel="noopener">${esc(u.source||"Source")}</a>`:""}${u.topic&&TOPIC[u.topic]?`<button class="link" data-go="${u.topic}">Related: ${esc(TOPIC[u.topic].title)}</button>`:""}</div></div>`).join("")}</div>`:"";}).join(""):`<div class="card"><p class="muted">No updates yet. The first weekly check will fill this page; you can also ask in chat for a check any time.</p></div>`}`;
}

function viewProfile(){
  const p = S.profile;
  const swatches = ["#1D5C86","#A8462A","#2F7A4E","#6A4A96","#13202D","#9A6A12"];
  return `<div><span class="eyebrow">Profile</span><h2>Your profile</h2></div>
  <div class="card"><div class="row" style="gap:18px">${avatarHTML("lg")}<div style="display:grid;gap:8px">
    <span class="num">Avatar colour</span><div class="row">${swatches.map(c=>`<button aria-label="Colour ${c}" data-color="${c}" style="width:28px;height:28px;border-radius:50%;border:${p.color===c?"3px solid var(--ink)":"1px solid var(--line)"};background:${c};cursor:pointer"></button>`).join("")}</div>
    ${cap.assets?`<label class="f">Or upload a photo<input type="file" id="avFile" accept="image/png,image/jpeg,image/webp"></label>${p.avatarId?`<button class="link" id="avClear">Use initials instead</button>`:""}`:`<span class="num">Photo upload isn't available in this view; initials are used.</span>`}
  </div></div></div>
  <div class="card"><div class="row between"><h3>Details</h3><button class="btn ghost sm" id="prefill">Fill from my resume</button></div>
  <div class="form">
    ${[["name","Full name"],["headline","Headline"],["location","Location"],["email","Email"],["phone","Phone"],["linkedin","LinkedIn URL"],["github","GitHub URL"],["education","Education"]].map(([k,l])=>`<label class="f">${l}<input type="text" id="pf-${k}" data-pf="${k}" value="${esc(p[k]||"")}"></label>`).join("")}</div>
  <label class="f">Experience (one line per role)<textarea id="pf-experience" data-pf="experience">${esc(p.experience||"")}</textarea></label>
  <label class="f">Certifications (one per line)<textarea id="pf-certs" data-pf="certs">${esc(p.certs||"")}</textarea></label>
  <span class="saved num">${saveLabel}</span></div>
  <div class="card"><h3>Skills you already have from work</h3><p class="muted" style="font-size:.9rem">Tick only what you've done in a job. These count at 70% toward role readiness.</p>
    <div class="grid3" style="gap:4px">${Object.entries(SKILLS).map(([k,l])=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="cl-${k}" data-claim="${k}" ${(p.claims||[]).includes(k)?"checked":""}> ${esc(l)}</label>`).join("")}</div></div>
  <div class="card"><h3>Target roles</h3><div class="grid2" style="gap:4px">${ROLES.map(r=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="tr-${r.id}" data-target="${r.id}" ${(p.targets||[]).includes(r.id)?"checked":""}> ${esc(r.name)}</label>`).join("")}</div></div>
  <div class="card"><h3>Your learning record</h3><div class="tbl"><table><thead><tr><th>Topic</th><th>Learned</th><th>Quiz</th></tr></thead><tbody>
    ${TOPICS.map(t=>{const s=topicStats(t),q=quizStats(t);return `<tr><td><button class="link" data-go="${t.id}">${esc(t.title)}</button></td><td class="num">${s.d}/${s.n}</td><td class="num">${q.ans?q.r+"/"+q.n:"–"}</td></tr>`;}).join("")}</tbody></table></div></div>`;
}

function viewVideos(){
  const all = Object.entries(S.videos.map).flatMap(([k,arr]) => arr.map((b,j)=>({k,b,j})));
  return `<div><span class="eyebrow">Video bookmarks</span><h2>Saved timestamps</h2></div>
  <p class="lede">Every timestamp you or Claude saved, grouped by topic, so you can jump straight to the minute that covers a sub-topic.</p>
  ${all.length?TOPICS.filter(t=>all.some(x=>x.k.startsWith(t.id+"."))).map(t=>`<div class="card"><h3>${esc(t.title)}</h3>${all.filter(x=>x.k.startsWith(t.id+".")).map(x=>{const si=+x.k.split(".")[1];return `<div class="bm"><span class="ts">${tsFmt(x.b.sec)}</span><a href="${esc(ytAt(x.b.url,x.b.sec))}" target="_blank" rel="noopener">${esc(x.b.label||t.subs[si].t)}</a><span class="num">${esc(t.subs[si].t)}</span></div>`;}).join("")}</div>`).join(""):`<div class="card"><p class="muted">No timestamps yet. On any topic page, use "Save a timestamp" under a sub-topic, or paste a video's chapters in "Watch & read" to let Claude find them.</p></div>`}`;
}

/* Resume / LinkedIn / Jobs carry over from v1 */
const RESUME_TEXT = `JYOTIRMAYA NEGI
Privacy & GRC Analyst | Advocate (Bar Council of Delhi) | DPDP • GDPR • ISO 27001
Ghaziabad, Uttar Pradesh | +91 XXXXX XXXXX | jyotirmayanegi1311@gmail.com | linkedin.com/in/your-custom-url | github.com/jyotirmayanegi

PROFESSIONAL SUMMARY
Law graduate and enrolled Advocate with hands-on US regulatory compliance experience (FCRA, FDCPA) in SOP compliance checks, file quality assurance and sensitive-data redaction. Trained in regulatory compliance (University of Pennsylvania) and cyber compliance (incident response, data mapping). Building practical skills in India's DPDP Act 2023 and DPDP Rules 2025, GDPR, ISO 27001 risk assessment and GRC tooling. Seeking Privacy Analyst, GRC Analyst or Compliance Analyst roles.

CORE SKILLS
Privacy & Regulation: DPDP Act 2023, DPDP Rules 2025, GDPR, HIPAA (awareness), GLBA, FCRA, FDCPA
GRC: Risk Assessment, Risk Register, Control Testing, Audit Evidence, Policy Review, Vendor Risk, DPIA, Data Mapping, Gap Analysis
Frameworks: ISO/IEC 27001:2022, ISO 27701, NIST CSF 2.0, SOC 2 (awareness)
Tools: Microsoft Excel (XLOOKUP, Pivot Tables), Microsoft 365, Nitro PDF, ServiceNow IRM (PDI practice), GitHub
Legal: Legal Drafting, Contract Review, Data Processing Agreements, Regulatory Research

PROFESSIONAL EXPERIENCE
Legal Associate Specialist | Provana Pvt Ltd | Sep 2025 – May 2026
- Performed SOP compliance checks on US consumer debt and credit files across NY, NJ, OK and Philadelphia jurisdictions under FCRA and FDCPA.
- Conducted quality assurance reviews on [X] files per week, identifying documentation gaps before attorney filing.
- Drafted attorney suit packets ensuring statutory and client SOP requirements were met.
- Redacted personally identifiable information (PII) from legal documents using Nitro PDF and Microsoft 365, supporting data protection obligations.

Immigration Executive (Legal Assistant) | Sprint Legal (Remote) | Jun 2026 – Present   [keep only if current]
- Managed immigration compliance documentation across multiple visa categories, verifying completeness against regulatory checklists.

PROJECTS
DPDP vs GDPR Compliance Mapping | GitHub
- Compared obligations of Data Fiduciaries (DPDP) and Controllers (GDPR) across consent, rights, breach notice and penalties; produced a gap-assessment checklist.
Risk Register & Control Matrix (ISO 27001) | Excel
- Built a 5x5 risk register with inherent/residual scoring for a sample SaaS company, mapped to Annex A controls.
Data Guard — PII Redaction Tool | GitHub
- Led legal requirements for a tool that detects and redacts personal data for privacy compliance.
Compliance+ / ComplyWatch — DPDP Compliance Checker | GitHub
- Defined legal requirements and audit workflow for an app that checks DPDP and ISO 27001 readiness.

EDUCATION
B.A. LL.B. | [University Name] | 2025

CERTIFICATIONS
Regulatory Compliance Certificate | University of Pennsylvania (Coursera)
Cyber Security / Cyber Compliance Certification | [Provider] | [Year]
ICSI — Company Secretary | [Level cleared]
In progress: ISC2 Certified in Cybersecurity (CC) / CompTIA Security+ | Target [Month 2027]

ADDITIONAL
Enrolled Advocate, Bar Council of Delhi (2025) | Languages: English, Hindi`;

function viewResume(){
  return `<div><span class="eyebrow">Resume</span><h2>Resume upgrade for Indian ATS</h2></div>
  <p class="lede">Before a recruiter sees your resume, software reads it. In India that's usually Workday (MNCs, global centres), SAP SuccessFactors, Oracle Taleo (banks), Greenhouse/Lever (startups) or Naukri's own system. They read plain text top to bottom and score keyword matches against the job description.</p>
  <div class="card"><h3>Spot the system from the apply link</h3><p><b>myworkdayjobs.com</b> = Workday · <b>successfactors.com</b> = SAP SuccessFactors · <b>taleo.net</b> = Oracle Taleo · <b>boards.greenhouse.io</b> = Greenhouse · <b>jobs.lever.co</b> = Lever.</p></div>
  <div class="grid2"><div class="card"><h4 style="color:var(--ok)">Do</h4><ul class="clean"><li>One column, reverse-chronological.</li><li>Standard headings: Summary, Skills, Experience, Projects, Education, Certifications.</li><li>Contact details in the body, not the page header.</li><li><b>.docx on Naukri</b>; text-based PDF elsewhere.</li><li>Copy the job's exact words ("ISO/IEC 27001", not "ISO27k").</li><li>Target title under your name.</li><li>Calibri, Arial or Georgia, 10.5–11pt; two pages max.</li></ul></div>
  <div class="card"><h4 style="color:var(--seal)">Avoid</h4><ul class="clean"><li>Canva or two-column templates.</li><li>Tables, text boxes, icons, photos, skill bars.</li><li>Contact info in headers/footers.</li><li>Scanned or image PDFs.</li><li>Tools you haven't used.</li><li>"Responsible for…" bullets.</li></ul></div></div>
  <div class="card"><h3>Tailor each application in 15 minutes</h3><ol class="clean"><li>Paste the job description; highlight every skill, law, framework and tool.</li><li>Anything appearing 2+ times goes in Skills and one bullet, if you genuinely have it.</li><li>Match the title line to the posting.</li><li>Rewrite the last summary sentence for that role.</li><li>Save as Jyotirmaya_Negi_Privacy_Analyst.docx.</li></ol></div>
  <div class="card"><h3>Your upgraded resume (ATS-ready draft)</h3><p>Paste into a blank Word document, apply one font, fill the bracketed parts.</p>
    <div><button class="btn" data-copyid="resumeText">Copy resume text</button></div><pre class="doc" id="resumeText">${esc(RESUME_TEXT)}</pre></div>
  <div class="card"><h3>Bullet formula</h3><p><b>Action verb + what you did + law/tool/standard + result.</b></p><p class="muted">Weak: "Responsible for checking files." Strong: "Performed SOP compliance checks on US credit files under FCRA, catching documentation gaps before attorney filing."</p></div>`;
}
const LI_HEAD = ["Privacy & GRC Analyst | Advocate | DPDP Act • GDPR • ISO 27001 | US Compliance (FCRA/FDCPA) | Turning law into controls","Data Privacy & Compliance | Law Graduate & Advocate | DPDP • GDPR • HIPAA • ISO 27001 | Risk & Audit","Aspiring Privacy Counsel & GRC Analyst | DPDP Act 2023 | ISO 27001 | Regulatory Compliance | Bar Council of Delhi"];
const LI_ABOUT = `I'm a law graduate and enrolled Advocate moving into data privacy and GRC, where reading the law carefully meets making sure a company actually follows it.

At Provana I worked on US consumer credit files under FCRA and FDCPA: SOP compliance checks, file quality reviews, attorney suit packets and redaction of personal data. That work taught me that compliance is evidence, not intention: every requirement needs a control, and every control needs proof.

Now I'm building that into a privacy and GRC skill set:
• India's DPDP Act 2023 and DPDP Rules 2025, GDPR, HIPAA and GLBA
• ISO/IEC 27001:2022 risk assessment and control mapping
• GRC tools: ServiceNow IRM (practice instance), Excel risk registers, OneTrust training
• Cyber fundamentals: networking, incident response, data mapping

I share what I learn here, especially plain-English notes on DPDP for non-lawyers.

Open to Privacy Analyst, GRC Analyst, Compliance Analyst and Legal Associate (Privacy) roles in Delhi NCR or remote.

Projects: github.com/jyotirmayanegi`;
function viewLinkedIn(){
  return `<div><span class="eyebrow">LinkedIn</span><h2>LinkedIn rebuild</h2></div>
  <p class="lede">Recruiters search LinkedIn by keyword, just like an ATS. Match your headline, About, Skills and titles to the resume so both tell one story.</p>
  <div class="card"><h3>1 · Headline (pick one)</h3>${LI_HEAD.map((h,i)=>`<div class="row between"><p style="flex:1;min-width:0">${esc(h)}</p><button class="btn ghost sm" data-copyhead="${i}">Copy</button></div>`).join("")}</div>
  <div class="card"><h3>2 · About</h3><div><button class="btn" data-copyid="aboutText">Copy About text</button></div><pre class="doc" id="aboutText">${esc(LI_ABOUT)}</pre></div>
  <div class="grid2"><div class="card"><h3>3 · Profile basics</h3><ul class="clean"><li>Photo: plain background, face fills most of the frame.</li><li>Banner: "Data Privacy • GRC • DPDP Act • ISO 27001".</li><li>Custom URL: linkedin.com/in/jyotirmaya-negi.</li><li>Location: Delhi NCR.</li><li>Open to Work: recruiters only; titles from the Roles page.</li></ul></div>
  <div class="card"><h3>4 · Pin these top 5 skills</h3><div class="row">${["Data Privacy","DPDP Act 2023","GDPR","ISO/IEC 27001","Regulatory Compliance"].map(s=>`<span class="pill hot">${s}</span>`).join("")}</div><p class="muted" style="font-size:.9rem">Then add: Risk Assessment, GRC, Data Protection, Compliance Management, Legal Drafting, FCRA, FDCPA, Policy Review, Third-Party Risk Management, Microsoft Excel, ServiceNow, Incident Response, Data Mapping.</p></div></div>
  <div class="card"><h3>5 · Experience and Featured</h3><ul class="clean"><li>Use the resume's Provana bullets; add skills to each role.</li><li>Featured: DPDP vs GDPR table, risk register, one post.</li><li>Projects: Data Guard and Compliance+ with GitHub links.</li></ul></div>
  <div class="card"><h3>6 · Grow your network</h3><p>Use the <button class="link" data-go="network">Network page</button> to find people, prepare personalised notes and track follow-ups.</p></div>`;
}
function viewJobs(){
  return `<div><span class="eyebrow">Jobs</span><h2>Jobs to target</h2></div>
  <p class="lede">Your readiness for each role is on the <button class="link" data-go="roles">Roles page</button>. Use these searches and set daily alerts.</p>
  <div class="card"><h3>Copy-paste searches</h3>${['"privacy analyst" OR "data protection analyst" India','"GRC analyst" (fresher OR "0-2 years") Gurugram OR Noida OR Delhi','"compliance analyst" (DPDP OR GDPR OR "data privacy")','"legal associate" (privacy OR "data protection" OR DPDP)','"third party risk" analyst India'].map((s,i)=>`<div class="row between"><code style="font-family:var(--mono);font-size:.84rem;overflow-wrap:anywhere;flex:1;min-width:0">${esc(s)}</code><button class="btn ghost sm" data-copystr="${esc(s)}">Copy</button></div>`).join("")}</div>
  <div class="card"><h3>Weekly routine</h3><ul class="clean"><li>Monday: save 10 postings to your tracker.</li><li>Tue–Thu: tailor and apply to 5–10.</li><li>Daily: 10 personalised connection requests.</li><li>Friday: follow up on applications older than 7 days.</li><li>Saturday: one portfolio piece or LinkedIn post.</li></ul></div>`;
}

/* ================= ROUTER ================= */
const VIEWS = {home:viewHome, learn:viewLearn, roles:viewRoles, network:viewNetwork, updates:viewUpdates, profile:viewProfile, videos:viewVideos, resume:viewResume, linkedin:viewLinkedIn, jobs:viewJobs};
try { const h = location.hash.replace("#",""); if (VIEWS[h] || TOPIC[h]) current = h; } catch(e) {}
let menuOpen = false;
function renderHeader(){
  const navKey = TOPIC[current] ? "learn" : current;
  document.getElementById("hdr").innerHTML = `<div class="wrap">
    <div class="brand"><h1 data-go="home">GRC Career Docket</h1>
      <button class="avbtn" id="avbtn" aria-haspopup="menu" aria-expanded="${menuOpen}">${avatarHTML()}<span class="nm">${esc((S.profile.name||"Jyotirmaya").split(" ")[0])}</span></button></div>
    <nav class="tabs" role="tablist">${NAV.map(([k,l])=>`<button role="tab" aria-selected="${k===navKey}" data-go="${k}">${l}</button>`).join("")}</nav></div>
    ${menuOpen?`<div class="menu" role="menu"><button role="menuitem" data-go="profile">My profile & avatar</button><button role="menuitem" data-go="roles">Role readiness</button><button role="menuitem" data-go="videos">Video bookmarks</button><button role="menuitem" data-go="network">My network</button></div>`:""}`;
}
function render(){
  renderHeader();
  const v = TOPIC[current] ? viewTopic(TOPIC[current]) : (VIEWS[current]||viewHome)();
  document.getElementById("main").innerHTML = `<div class="view">${v}</div>`;
}
function go(k, anchor){
  menuOpen = false; current = k;
  try { history.replaceState(null, "", "#" + k); } catch(e) {}
  render();
  if (anchor) { const el = document.getElementById(anchor); if (el) { el.scrollIntoView({behavior:"smooth", block:"start"}); return; } }
  window.scrollTo(0,0);
}

/* ================= AI (sample) ================= */
let aiCtl = null;
function refreshAI(){}
function topicContext(t){ return `Topic: ${t.title}\nObjective: ${t.obj}\nSub-topics:\n${t.subs.map(s=>"- "+s.t+": "+s.b).join("\n")}`.slice(0,6000); }
const ASK = {
  simple:"Explain this topic again in very plain English for a law graduate with no tech background. Use one legal analogy. Under 220 words.",
  india:"Give one realistic Indian workplace example (company type, what happens, which rule applies, what the compliance team does). Under 220 words.",
  interview:"Ask me 3 interview questions an Indian employer might ask on this topic for an entry-level role, each followed by a model answer in 2–3 sentences.",
  deeper:"Go one level deeper than the sub-topics listed: what would a working analyst need to know next? Use short headed sections, plain words, under 300 words."
};
async function ask(tid, kind, outId){
  const out = document.getElementById(outId||"aiOut"); const t = TOPIC[tid];
  if (!cap.sample) { out.hidden=false; out.textContent = "Asking Claude isn't available in this view. Open the docket on claude.ai to use it."; return; }
  let instr = ASK[kind];
  if (kind === "free") { const q = (document.getElementById("askQ")||{}).value||""; if (!q.trim()) { out.textContent = "Type a question first."; return; } instr = "Answer this learner's question in plain English (under 250 words): " + q; }
  aiCtl?.abort(); aiCtl = new AbortController();
  const stop = document.getElementById("askStop"); if (stop) { stop.hidden = false; stop.onclick = () => aiCtl.abort(); }
  out.hidden = false; out.textContent = "Thinking…";
  try {
    await cap.sample(`You are tutoring Jyotirmaya, a law graduate moving into privacy and GRC in India. Plain text only, no markdown symbols.\n\n${topicContext(t)}\n\nTask: ${instr}`, Object.assign({signal: aiCtl.signal, onText: ({text}) => { out.textContent = text; }}, kind==="free"?{cache:false}:{}));
  } catch(e) {
    if (e.text) out.textContent = e.text;
    if (e.code === "cancelled") {}
    else if (["not_granted","sampling_disabled","capability_disabled","not_declared"].includes(e.code)) out.textContent = "Claude isn't allowed for this page right now. You can allow it from the artifact's permissions menu.";
    else if (e.code === "rate_limited") out.textContent = (e.text||"") + "\n\nToo many questions at once. Try again in a minute.";
    else out.textContent = (e.text||"") + "\n\nThe answer was interrupted. Try again.";
  } finally { if (stop) stop.hidden = true; }
}
async function roleAsk(rid){
  const r = ROLES.find(x=>x.id===rid), out = document.getElementById("ra-"+rid);
  out.hidden = false;
  if (!cap.sample) { out.textContent = "Asking Claude isn't available in this view."; return; }
  out.textContent = "Thinking…";
  const have = Object.keys(SKILLS).filter(k=>skillLevel(k)>=50).map(k=>SKILLS[k]).join(", ") || "none yet";
  try {
    await cap.sample(`A law graduate in India targets the role "${r.name}". Employers: ${r.where}. Skills already at a working level: ${have}. List up to 5 additional skills, tools or certifications this role commonly asks for in India that are NOT in that list, each with one line on why and one free way to start learning it. Plain text, no markdown. Note that this is general knowledge, not live job data.`, {onText: ({text}) => { out.textContent = text; }});
  } catch(e) { out.textContent = (e.text||"") + (e.code==="not_granted"?"Claude isn't allowed for this page.":"\n\nCouldn't finish. Try again."); }
}
async function findTimestamps(tid){
  const t = TOPIC[tid], url = document.getElementById("tfUrl").value.trim(), text = document.getElementById("tfText").value.trim(), msg = document.getElementById("tfMsg"), out = document.getElementById("tfOut");
  if (!/youtube\.com|youtu\.be/.test(url)) { msg.textContent = "Paste a YouTube link first."; return; }
  if (text.length < 20) { msg.textContent = "Paste the video's chapter list or transcript with times."; return; }
  if (!cap.sample) { msg.textContent = "Claude isn't available in this view. Add timestamps by hand under each sub-topic."; return; }
  msg.textContent = "Matching sub-topics to the video…"; out.innerHTML = "";
  try {
    const res = await cap.sample.json(`Below is a YouTube video's chapter list or transcript with timestamps, and a numbered list of sub-topics. For each sub-topic that the video clearly covers, return the timestamp where that coverage starts, using ONLY times that appear in the text. Skip sub-topics the video does not cover. Reply with only a JSON array of {"i": sub-topic number, "time": "m:ss" or "h:mm:ss", "label": short description of what is said there}.\n\nSUB-TOPICS:\n${t.subs.map((s,i)=>i+". "+s.t).join("\n")}\n\nVIDEO TEXT:\n${text.slice(0,60000)}`, {modelTier:"quick"});
    const rows = (Array.isArray(res)?res:[]).map(r=>({i:+r.i, sec:tsParse(r.time), label:String(r.label||"")})).filter(r=>t.subs[r.i] && r.sec!==null);
    if (!rows.length) { msg.textContent = "The video doesn't seem to cover these sub-topics."; return; }
    msg.textContent = `Found ${rows.length} match${rows.length>1?"es":""}. Check them, then save.`;
    out.innerHTML = rows.map(r=>`<div class="bm"><span class="ts">${tsFmt(r.sec)}</span><a href="${esc(ytAt(url,r.sec))}" target="_blank" rel="noopener">${esc(t.subs[r.i].t)}</a><span class="num">${esc(r.label)}</span></div>`).join("") + `<div><button class="btn sm" id="tfSave">Save all as bookmarks</button></div>`;
    document.getElementById("tfSave").onclick = () => { rows.forEach(r => { const k=key(t.id,r.i); (S.videos.map[k] ||= []).push({url, sec:r.sec, label:r.label}); }); save("videos"); render(); go(t.id,"p-ideas"); };
  } catch(e) { msg.textContent = e.code==="invalid_json" ? "Couldn't read the result. Try pasting a cleaner chapter list." : e.code==="not_granted" ? "Claude isn't allowed for this page." : "Something interrupted the match. Try again."; }
}

/* ================= GMAIL ================= */
async function gmailDraft(i){
  const c = S.network.contacts[i], msg = document.getElementById("gm-"+i);
  if (!cap.mcp) { msg.textContent = "Gmail isn't available in this view. Copy the note instead."; return; }
  msg.textContent = "Creating draft…";
  try {
    const r = await cap.mcp.callTool("Gmail","create_draft",{to:[c.email], subject:`Connecting about ${c.role||"privacy and GRC"}`, body:NOTES[c.tpl||"pro"](c) + `\n\nBest regards,\n${S.profile.name||"Jyotirmaya Negi"}${S.profile.linkedin?"\n"+S.profile.linkedin:""}`});
    const url = r && r.payload && r.payload.viewUrl;
    msg.innerHTML = url ? `Draft saved. <a href="${esc(url)}" target="_blank" rel="noopener">Open it in Gmail</a>` : "Draft saved in your Gmail Drafts folder.";
  } catch(e) {
    const m = {needs_reauth:"Reconnect Gmail in claude.ai Settings → Connectors.", server_not_connected:"Add the Gmail connector in claude.ai Settings → Connectors.", not_in_manifest:"Gmail is turned off for this page.", approval_required:"Creating a draft needs your approval. Click again and allow it.", blocked_by_policy:"Your organisation blocks this Gmail action.", tool_error:"Gmail refused the draft: "+(e.message||"check the email address.")};
    msg.textContent = m[e.code] || "The draft may not have been created. Check your Gmail Drafts before trying again.";
  }
}

/* ================= EVENTS ================= */
let pop = null;
function closePop(){ if (pop) { pop.remove(); pop = null; } }
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-go],[data-depth],[data-track],[data-reveal],[data-quiz],[data-quizreset],[data-ask],[data-bmform],[data-bmdel],[data-heat],[data-color],[data-copyid],[data-copyhead],[data-copystr],[data-copynote],[data-gmail],[data-netdel],[data-netf],[data-roleask],[data-extradel],[data-anchor],.term,#avbtn,#tfGo,#fpGo,#ncAdd,#prefill,#avClear,#extraAdd,#updRefresh");
  if (!e.target.closest(".term")) closePop();
  if (menuOpen && !e.target.closest(".menu,#avbtn")) { menuOpen = false; renderHeader(); }
  if (!el) return;
  const d = el.dataset;
  if (el.id === "avbtn") { menuOpen = !menuOpen; renderHeader(); return; }
  if (el.classList.contains("term")) { closePop(); pop = document.createElement("div"); pop.className = "pop"; pop.textContent = d.def; document.body.appendChild(pop); const r = el.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 316)) + "px"; pop.style.top = (window.scrollY + r.bottom + 6) + "px"; return; }
  if (d.go) { e.preventDefault(); go(d.go, d.anchor); return; }
  if (d.anchor) { e.preventDefault(); const t = document.getElementById(d.anchor); if (t) t.scrollIntoView({behavior:"smooth", block:"start"}); return; }
  if (d.depth) { depth = +d.depth; try { localStorage.setItem(LS("depth"), depth); } catch(_) {} const y = scrollY; render(); scrollTo(0,y); return; }
  if (d.track) { track = d.track; render(); return; }
  if (d.reveal) { const t = TOPIC[current], i = +d.reveal; const tmp = depth; depth = 3; const html = subHTML(t, t.subs[i], i); depth = tmp; document.getElementById("s-"+i).outerHTML = html; return; }
  if (d.quiz) { const [tid,qi,oi] = d.quiz.split("|"); (S.progress.quiz[tid] ||= {})[qi] = +oi; save("progress"); const y = scrollY; render(); scrollTo(0,y); return; }
  if (d.quizreset) { delete S.progress.quiz[d.quizreset]; save("progress"); const y = scrollY; render(); scrollTo(0,y); return; }
  if (d.ask) { const [tid,k] = d.ask.split("|"); ask(tid,k); return; }
  if (d.roleask) { roleAsk(d.roleask); return; }
  if (d.bmform) { const k = d.bmform, box = document.getElementById("bmf-"+k.replace(".","_")); box.hidden = !box.hidden;
    box.innerHTML = `<div class="form"><label class="f">YouTube link<input type="url" id="bu-${k.replace(".","_")}" placeholder="https://www.youtube.com/watch?v=..."></label><label class="f">Starts at (m:ss)<input type="text" id="bt-${k.replace(".","_")}" placeholder="4:35"></label><label class="f">Label (optional)<input type="text" id="bl-${k.replace(".","_")}"></label></div><div class="row"><button class="btn sm" data-bmsave="${k}">Save</button><span class="num" id="bm-msg-${k.replace(".","_")}"></span></div>`;
    box.querySelector("[data-bmsave]").onclick = () => { const s = k.replace(".","_"); const url = document.getElementById("bu-"+s).value.trim(), sec = tsParse(document.getElementById("bt-"+s).value), label = document.getElementById("bl-"+s).value.trim();
      if (!/^https?:\/\//.test(url) || sec===null) { document.getElementById("bm-msg-"+s).textContent = "Add a link and a time like 4:35."; return; }
      (S.videos.map[k] ||= []).push({url, sec, label}); save("videos"); const y = scrollY; render(); scrollTo(0,y); };
    return; }
  if (d.bmdel) { const [k,j] = d.bmdel.split("|"); S.videos.map[k].splice(+j,1); if (!S.videos.map[k].length) delete S.videos.map[k]; save("videos"); const y = scrollY; render(); scrollTo(0,y); return; }
  if (d.heat) { const [L,I] = d.heat.split(",").map(Number), s = L*I; document.getElementById("heatOut").textContent = `Likelihood ${L} × Impact ${I} = ${s} → ${s>=15?"High: treat now, report to management":s>=8?"Medium: plan a treatment with an owner and date":"Low: monitor or accept with sign-off"}`; return; }
  if (d.color) { S.profile.color = d.color; save("profile"); render(); return; }
  if (d.copyid) { copyText(el, document.getElementById(d.copyid).textContent); return; }
  if (d.copyhead) { copyText(el, LI_HEAD[+d.copyhead]); return; }
  if (d.copystr) { copyText(el, d.copystr); return; }
  if (d.copynote) { const c = S.network.contacts[+d.copynote]; copyText(el, NOTES[c.tpl||"pro"](c)); if (c.stage === "To connect") { c.stage = "Request sent"; save("network"); } return; }
  if (d.gmail) { gmailDraft(+d.gmail); return; }
  if (d.netdel) { S.network.contacts.splice(+d.netdel,1); save("network"); render(); return; }
  if (d.netf) { netFilter = d.netf; render(); return; }
  if (d.extradel) { S.profile.extra.splice(+d.extradel,1); save("profile"); render(); return; }
  if (el.id === "tfGo") { findTimestamps(d.tid); return; }
  if (false) { const kw = [document.getElementById("fpRole").value, document.getElementById("fpCo").value, document.getElementById("fpLoc").value].filter(x=>x.trim()).join(" "); const a = document.createElement("a"); a.href = "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(kw); a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); return; }
  if (el.id === "ncAdd") { const v = id => document.getElementById(id).value.trim(); if (!v("ncName")) { document.getElementById("ncName").focus(); return; }
    S.network.contacts.unshift({name:v("ncName"), role:v("ncRole"), company:v("ncCo"), li:/^https?:\/\//.test(v("ncLi"))?v("ncLi"):"", email:v("ncEmail"), phone:v("ncPhone"), stage:"To connect", tpl:"pro", follow:"", notes:""}); save("network"); netFilter = "All"; render(); return; }
  if (el.id === "prefill") { Object.assign(S.profile, {name:S.profile.name||"Jyotirmaya Negi", headline:S.profile.headline||"Privacy & GRC Analyst | Advocate | DPDP • GDPR • ISO 27001", location:S.profile.location||"Ghaziabad, Uttar Pradesh", email:S.profile.email||"jyotirmayanegi1311@gmail.com", github:S.profile.github||"https://github.com/jyotirmayanegi", education:S.profile.education||"B.A. LL.B. (2025); Advocate, Bar Council of Delhi",
      experience:S.profile.experience||"Legal Associate Specialist, Provana Pvt Ltd (Sep 2025 – May 2026)\nImmigration Executive (Legal Assistant), Sprint Legal (Jun 2026 – present)",
      certs:S.profile.certs||"Regulatory Compliance — University of Pennsylvania\nCyber security / cyber compliance certification\nICSI (Company Secretary) — level taken"});
    S.profile.claims = Array.from(new Set([...(S.profile.claims||[]), "usconsumer","drafting"])); save("profile"); render(); return; }
  if (el.id === "avClear") { S.profile.avatarId = ""; save("profile"); render(); return; }
  if (el.id === "extraAdd") { const v = document.getElementById("extraIn").value.trim(); if (v) { (S.profile.extra ||= []).push(v); save("profile"); render(); } return; }
  if (el.id === "updRefresh") { el.textContent = "Refreshing…"; loadUpdates().then(()=>{ if (current==="updates") render(); }); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("tcard")) go(e.target.dataset.go); if (e.key === "Escape") { closePop(); if (menuOpen) { menuOpen=false; renderHeader(); } } });
document.addEventListener("input", e => {
  const d = e.target.dataset;
  if (e.target.id === "q") { query = e.target.value; clearTimeout(timers.q); timers.q = setTimeout(() => { render(); const q = document.getElementById("q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); return; }
  if (["fpRole","fpCo","fpLoc"].includes(e.target.id)) { const kw = ["fpRole","fpCo","fpLoc"].map(i=>document.getElementById(i).value.trim()).filter(Boolean).join(" "); document.getElementById("fpLink").href = "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(kw); return; }
  if (d.pf) { S.profile[d.pf] = e.target.value; save("profile"); return; }
  if (d.cnotes) { S.network.contacts[+d.cnotes].notes = e.target.value; save("network"); return; }
});
document.addEventListener("change", async e => {
  const d = e.target.dataset;
  if (d.k) { if (e.target.checked) S.progress.done[d.k] = true; else delete S.progress.done[d.k]; save("progress"); e.target.closest(".sub").classList.toggle("done", e.target.checked);
    const t = TOPIC[current]; if (t) { const s = topicStats(t); const b = document.querySelector(".thead .bar i"); if (b) b.style.width = s.p + "%"; const n = document.querySelector(".thead .num"); if (n) n.textContent = `${s.d}/${s.n} learned`; } return; }
  if (d.claim) { const set = new Set(S.profile.claims||[]); e.target.checked ? set.add(d.claim) : set.delete(d.claim); S.profile.claims = [...set]; save("profile"); return; }
  if (d.target) { const set = new Set(S.profile.targets||[]); e.target.checked ? set.add(d.target) : set.delete(d.target); S.profile.targets = [...set]; save("profile"); return; }
  if (d.stage) { S.network.contacts[+d.stage].stage = e.target.value; save("network"); render(); return; }
  if (d.tpl) { const c = S.network.contacts[+d.tpl]; c.tpl = e.target.value; save("network"); document.getElementById("nt-"+d.tpl).textContent = NOTES[c.tpl](c); return; }
  if (d.follow) { S.network.contacts[+d.follow].follow = e.target.value; save("network"); return; }
  if (e.target.id === "avFile" && cap.assets) { const f = e.target.files[0]; if (!f) return;
    try { const r = await cap.assets.upload(f); S.profile.avatarId = r.id; save("profile"); render(); }
    catch(err) { alertBox("Couldn't upload that photo. Try a JPG or PNG under 5 MB."); } }
});
function alertBox(t){ const m = document.createElement("div"); m.className = "note"; m.textContent = t; document.getElementById("main").prepend(m); setTimeout(()=>m.remove(), 5000); }
render();
