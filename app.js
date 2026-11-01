/* ================= REFERENCE DATA ================= */
const ALL = [...LAW_A, ...LAW_B, ...LAW_C, ...CYBER, ...CYBER_LINUX, ...TOOLS, ...TOOLS2, ...TOPICS_BIZ, ...TOPICS_SPEC, ...TOPICS_AI];
const BYID = Object.fromEntries(ALL.map(t => [t.id, t]));
const TOPICS = PHASES.flatMap(p => p.ids.map(id => BYID[id]));      // learning sequence order
const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const PHASE_OF = Object.fromEntries(PHASES.flatMap((p,i) => p.ids.map(id => [id, i])));
const CERT = Object.fromEntries(CERTS.map(c => [c.id, c]));
const TRACKS = {law:"Law & frameworks", cyber:"Cyber course", tool:"Tools", biz:"Business & consulting", legal:"Specialist legal"};

const SKILLS = {
  grc:"GRC fundamentals", privacy:"Privacy principles", dpdp:"DPDP Act & Rules", gdpr:"GDPR", ccpa:"CCPA / US state privacy", hipaa:"HIPAA",
  finreg:"GLBA / US financial privacy", usconsumer:"FCRA / consumer credit data", secfinra:"SEC, FINRA & NYDFS", indiafin:"RBI, SEBI & CERT-In",
  iso:"ISO 27001 / 27701", soc2:"SOC 2 / NIST / PCI", controls:"Security controls", risk:"Risk assessment", audit:"Audit & evidence",
  tprm:"Vendor risk", contracts:"Contract & DPA review", privops:"Privacy operations", aigov:"AI governance", itbasics:"IT basics",
  network:"Networking", iam:"Identity & access", threats:"Threats & attacks", crypto:"Encryption & data protection", incident:"Incident response",
  cloud:"Cloud security", servicenow:"ServiceNow IRM", onetrust:"OneTrust", excel:"Excel / reporting", drafting:"Legal drafting & research",
  azure:"Microsoft Azure & Entra ID", aws:"AWS", purview:"Microsoft Purview", siem:"SIEM (Sentinel / Splunk)", grcauto:"Compliance automation (Vanta, Drata, Archer)", vuln:"Vulnerability management"
};
const KW = {grc:["GRC","governance","compliance"],privacy:["data privacy","data protection"],dpdp:["DPDP"],gdpr:["GDPR"],ccpa:["CCPA","CPRA"],hipaa:["HIPAA"],
  finreg:["GLBA"],usconsumer:["FCRA"],secfinra:["SEC","FINRA","NYDFS","Regulation S-P"],indiafin:["RBI","SEBI","CERT-In"],iso:["ISO 27001","ISO/IEC 27001","ISO 27701","ISMS"],
  soc2:["SOC 2","NIST","PCI DSS"],controls:["control testing","controls"],risk:["risk assessment","risk register","risk management"],audit:["audit","evidence"],
  tprm:["third-party risk","vendor risk","TPRM"],contracts:["contract review","data processing agreement"],privops:["DPIA","data mapping","RoPA","DSAR"],
  aigov:["AI governance","ISO 42001","EU AI Act"],itbasics:[],network:["networking"],iam:["access management","MFA","IAM"],threats:["phishing","vulnerability"],
  crypto:["encryption"],incident:["incident response","breach notification"],cloud:["cloud"],servicenow:["ServiceNow"],onetrust:["OneTrust"],
  excel:["Excel","pivot","XLOOKUP","Power BI"],drafting:["legal drafting","legal research"],
  azure:["Azure","Entra ID","Microsoft 365","Conditional Access"],aws:["AWS","CloudTrail","IAM policies"],purview:["Purview","DLP","sensitivity labels","eDiscovery"],siem:["SIEM","Sentinel","Splunk","KQL"],
  grcauto:["Vanta","Drata","Archer","MetricStream","AuditBoard","Jira"],vuln:["vulnerability management","Qualys","Tenable","Nessus","CVSS"]};
Object.assign(SKILLS, SKILLS_EXTRA); Object.assign(KW, KW_EXTRA);
const ROLES = [
 {id:"privacy",name:"Privacy Analyst / Data Protection Analyst",fit:"Best fit",need:{privacy:3,dpdp:3,gdpr:3,privops:3,ccpa:2,onetrust:2,purview:2,drafting:2,tprm:1,crypto:1},q:"privacy analyst"},
 {id:"grcan",name:"GRC Analyst",fit:"Strong fit",need:{grc:3,iso:3,risk:3,audit:3,controls:2,soc2:2,excel:2,servicenow:2,grcauto:2,iam:1,azure:1,aws:1,vuln:1},q:"GRC analyst"},
 {id:"bfsi",name:"Compliance Analyst (banking & wealth)",fit:"Strong fit — uses Provana",need:{grc:2,finreg:3,secfinra:3,usconsumer:2,indiafin:2,risk:2,audit:2,excel:3,privacy:1,grcauto:1},q:"compliance analyst"},
 {id:"tprm",name:"Third-Party / Vendor Risk Analyst",fit:"Good fit",need:{tprm:3,contracts:3,risk:2,iso:2,soc2:2,onetrust:1,grcauto:1,excel:2},q:"third party risk analyst"},
 {id:"legal",name:"Legal Associate — Privacy / Technology",fit:"Good fit — law first",need:{drafting:3,contracts:3,dpdp:3,gdpr:2,privacy:2,privops:1,aigov:1},q:"legal associate data privacy"},
 {id:"itaudit",name:"IT Audit Associate",fit:"Stretch",need:{audit:3,controls:3,iso:2,soc2:2,iam:2,itbasics:2,excel:2,network:1,azure:1,aws:1},q:"IT audit associate"},
 {id:"cyberrisk",name:"Cyber Risk Analyst",fit:"Stretch",need:{risk:3,controls:3,threats:2,network:2,cloud:2,incident:2,iso:2,iam:1,vuln:2,siem:2,azure:1,aws:1},q:"cyber risk analyst"},
 {id:"aigov",name:"AI Governance Analyst",fit:"Emerging",need:{aigov:3,privacy:2,privops:2,gdpr:2,risk:2,iso:1},q:"AI governance"},
 {id:"dpo",name:"Data Protection Officer (3–5 year goal)",fit:"Long-term",need:{dpdp:3,gdpr:3,privops:3,iso:2,incident:2,risk:2,tprm:2,indiafin:1,hipaa:1,purview:1},q:"data protection officer"}
];
ROLES.push(...ROLES_EXTRA);
const ROLE = Object.fromEntries(ROLES.map(r => [r.id, r]));

/* ================= STATE & STORAGE ================= */
const DOCS = ["progress","profile","network","videos","resume","jds"];
const S = {
  progress:{done:{}, quiz:{}, log:{}, doneAt:{}, reviewed:{}},
  profile:{name:"", headline:"", location:"", email:"", phone:"", linkedin:"", github:"", education:"", experience:"", certs:"", targets:[], claims:[], color:"#0A6CDF", avatarId:"", extra:[], company:"bank", certsHave:[], certsPlan:[]},
  network:{contacts:[], apps:[]},
  videos:{map:{}},
  resume:{raw:"", jd:"", role:"privacy", model:null, last:null},
  jds:{items:[]}
};
const LS = k => "docket3-" + k;
for (const k of DOCS) { try { const v = JSON.parse(localStorage.getItem(LS(k)) || "null"); if (v) S[k] = Object.assign(S[k], v); } catch(e) {} }
healLog(S.progress);
let depth = 2; try { depth = +localStorage.getItem(LS("depth")) || 2; } catch(e) {}
let track = "all", query = "";
let refs = {}, cap = {db:null, user:null, sample:null, mcp:null, assets:null}, saveLabel = "Saved in this browser";
const timers = {};
/* The platform hands back database documents frozen (read-only). Everything read from the database is
   copied into ordinary objects here, so later edits (answers, ticks, counts) are never silently dropped. */
function thaw(v){ return v == null || typeof v !== "object" ? v : JSON.parse(JSON.stringify(v)); }
function dbWrap(real){
  if (!real || typeof real !== "object") return real;
  const wrapArg = y => y && typeof y === "object" && ("docs" in y || "exists" in y) ? dbWrap(y) : y;
  return new Proxy({}, {
    get(_, k){ const v = real[k];
      if (k === "data" && typeof v === "function") return (...a) => thaw(v.apply(real, a));
      if (k === "docs" && Array.isArray(v)) return v.map(dbWrap);
      if (typeof v === "function") return (...a) => { const r = v.apply(real, a.map(x => typeof x === "function" ? (...c) => x(...c.map(wrapArg)) : x));
        return r && typeof r.then === "function" ? r.then(y => y && typeof y === "object" ? dbWrap(y) : y) : (r && typeof r === "object" ? dbWrap(r) : r); };
      return v; },
    has(_, k){ return k in real; }
  });
}
/* activity counts never go down when two tabs or devices save: each day keeps the higher count */
function maxMerge(a, b){ const o = Object.assign({}, a || {}); for (const [k, v] of Object.entries(b || {})) o[k] = Math.max(+o[k] || 0, +v || 0); return o; }
function healLog(p){ p.log ||= {}; for (const [d, m] of Object.entries(p.tlog || {})) { const n = Object.values(m || {}).reduce((a, b) => a + (+b || 0), 0); if (n > (p.log[d] || 0)) p.log[d] = n; } }
function mergeActivity(dst, src){ if (!src) return; dst.log = maxMerge(dst.log, src.log); const t = Object.assign({}, dst.tlog || {}); for (const [d, m] of Object.entries(src.tlog || {})) t[d] = maxMerge(t[d], m); dst.tlog = t; healLog(dst); }
const pending = {}, lastWrite = {};
function save(k){
  try { localStorage.setItem(LS(k), JSON.stringify(S[k])); } catch(e) {}
  if (!refs[k]) return;
  clearTimeout(timers[k]); pending[k] = true; setSaved("Saving…");
  timers[k] = setTimeout(async () => {
    try {
      if (k === "progress") { try { const r = await refs[k].get(); if (r.exists) mergeActivity(S.progress, r.data()); } catch(e) {} }
      const data = JSON.parse(JSON.stringify(S[k])); lastWrite[k] = JSON.stringify(data);
      await refs[k].set(data); try { localStorage.setItem(LS(k), lastWrite[k]); } catch(e) {} setSaved("Saved to your account");
    }
    catch(e) { setSaved("Saved in this browser only"); }
    pending[k] = false;
  }, 700);
}
/* keep this tab in step with work done in another tab or on another device */
function watchProgress(){
  try { refs.progress.onSnapshot(s => {
    if (!s.exists || pending.progress) return; const data = s.data(), j = JSON.stringify(data); if (j === lastWrite.progress) return;
    const local = JSON.parse(JSON.stringify(S.progress)); Object.assign(S.progress, data); mergeActivity(S.progress, local);
    try { localStorage.setItem(LS("progress"), JSON.stringify(S.progress)); } catch(e) {}
    const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (!typing && (current === "home" || current === "insights" || /^role-/.test(current))) rerender();
  }, () => {}); } catch(e) {}
}
function setSaved(t){ saveLabel = t; document.querySelectorAll(".saved").forEach(n => n.textContent = t); }
const dayStr = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today = () => dayStr(new Date());

let UPDATES = null, FEEDMETA = null;
(async function connect(){
  try {
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    cap.db = dbWrap(db); cap.user = user;
    if (db && user) {
      const id = await user.id();
      if (id) {
        const col = cap.db.collection("data/users/" + id);
        let changed = false;
        for (const k of DOCS) {
          refs[k] = col.doc(k);
          try {
            const snap = await refs[k].get();
            if (snap.exists) { const local = k === "progress" ? JSON.parse(JSON.stringify(S.progress)) : null, remote = snap.data();
              S[k] = Object.assign(S[k], remote); changed = true;
              if (local) { mergeActivity(S.progress, local); if (JSON.stringify(S.progress.log) !== JSON.stringify(remote.log || {}) || JSON.stringify(S.progress.tlog || {}) !== JSON.stringify(remote.tlog || {})) save("progress"); }
              try { localStorage.setItem(LS(k), JSON.stringify(S[k])); } catch(e) {} }
            else if (JSON.stringify(S[k]).length > 90) save(k);
          } catch(e) {}
        }
        setSaved("Saved to your account"); watchProgress();
        if (changed) render();
      }
      loadUpdates(); loadNews(); trackerInit();
    }
  } catch(e) {}
  claude.use("sample").then(s => { cap.sample = s; }).catch(()=>{});
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
const ring = (p,cls="") => `<div class="ring ${cls}" style="--p:${p}" role="img" aria-label="${p}%"><span>${p}%</span></div>`;
function topicStats(t){ const n=t.subs.length; let d=0; t.subs.forEach((s,i)=>{ if (S.progress.done[key(t.id,i)]) d++; }); return {d,n,p:n?Math.round(d/n*100):0}; }
function quizStats(t){ const a = S.progress.quiz[t.id] || {}; let r=0,ans=0; t.quiz.forEach((q,i)=>{ if (a[i]!==undefined){ ans++; if (a[i]===q.a) r++; } }); return {r,ans,n:t.quiz.length,pass:ans===t.quiz.length && r>=Math.ceil(t.quiz.length*2/3)}; }
function topicMastery(t){ return topicStats(t).p/100*0.55 + (quizStats(t).pass?0.2:0) + practiceScore(t.id)*0.25; }
function groupStats(list){ let d=0,n=0; list.forEach(t=>{ const s=topicStats(t); d+=s.d; n+=s.n; }); return {d,n,p:n?Math.round(d/n*100):0}; }
function skillLevel(sk){
  const ts = TOPICS.filter(t => t.sk.includes(sk));
  let lvl = ts.length ? ts.reduce((a,t) => a + topicMastery(t), 0) / ts.length : 0;
  if ((S.profile.claims||[]).includes(sk)) lvl = Math.max(lvl, 0.7);
  return Math.round(lvl*100);
}
function roleReady(r){ let w=0,s=0; for (const [k,v] of Object.entries(r.need)){ w+=v; s+=v*skillLevel(k)/100; } return Math.round(s/w*100); }
function domainReady(ids){ return Math.round(ids.reduce((a,id)=>a+topicMastery(TOPIC[id]),0)/ids.length*100); }
function certReady(c){ if ((S.profile.certsHave||[]).includes(c.id)) return 100; return Math.round(c.domains.reduce((a,[,ids])=>a+domainReady(ids),0)/c.domains.length); }
function readyPill(p){ return p>=70?`<span class="pill ok">Apply now</span>`:p>=40?`<span class="pill warn">Apply + keep learning</span>`:`<span class="pill bad">Building up</span>`; }
function gaps(r){ return Object.entries(r.need).map(([k,v])=>({k,v,l:skillLevel(k)})).filter(x=>x.l<70).sort((a,b)=>(b.v*(100-b.l))-(a.v*(100-a.l))); }
function topicForSkill(k){ return TOPICS.filter(t=>t.sk.includes(k)).sort((a,b)=>topicStats(a).p-topicStats(b).p)[0]; }
function certsForTopic(id){ return CERTS.filter(c => c.domains.some(([,ids]) => ids.includes(id))); }
function initials(n){ const p=String(n||"").trim().split(/\s+/).filter(Boolean); return ((p[0]||"?")[0] + (p.length>1?p[p.length-1][0]:"")).toUpperCase(); }
function avatarHTML(cls=""){ const p=S.profile; const src = p.avatarUrl || (p.avatarId ? "/_blob/" + p.avatarId : "") || p.avatarData || ""; const ini = esc(initials(p.name||"Jyotirmaya Negi")), img = src ? `<img alt="" src="${esc(src)}" data-i="${ini}" onerror="this.parentNode.textContent=this.dataset.i">` : ini; return `<span class="avatar ${cls}" style="background:${esc(p.color||"#0A6CDF")}">${img}</span>`; }
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
function logActivity(n){ const d = today(); S.progress.log[d] = Math.max(0, (S.progress.log[d]||0) + n);
  try { const tid = activityTopic(); if (tid) { const L = (S.progress.tlog ||= {}), day = (L[d] ||= {}); day[tid] = Math.max(0, (day[tid]||0) + n); const keys = Object.keys(L).sort(); if (keys.length > 200) keys.slice(0, keys.length - 200).forEach(k => delete L[k]); } } catch(e) {} }
function streak(){ let s=0; const d=new Date(); if (!S.progress.log[dayStr(d)]) d.setDate(d.getDate()-1); while (S.progress.log[dayStr(d)]) { s++; d.setDate(d.getDate()-1); } return s; }
function weekCount(){ const d=new Date(); let n=0; for (let i=0;i<7;i++){ n+=S.progress.log[dayStr(d)]||0; d.setDate(d.getDate()-1); } return n; }
function reviewsDue(){ const now = Date.now(); return Object.entries(S.progress.doneAt).filter(([id])=>TOPIC[id]).map(([id,dt])=>{ const age=(now-new Date(dt))/864e5; const last=S.progress.reviewed[id]; const sinceRev=last?(now-new Date(last))/864e5:age; return {id, due: (!last && age>=7) || (last && sinceRev>=30)}; }).filter(x=>x.due); }
function nextSubs(n){ const out=[]; for (const t of TOPICS) { t.subs.forEach((s,i)=>{ if (out.length<n && !S.progress.done[key(t.id,i)] && s.l<=depth) out.push({t,s,i}); }); if (out.length>=n) break; } return out; }
function currentPhase(){ for (let i=0;i<PHASES.length;i++){ if (groupStats(PHASES[i].ids.map(id=>TOPIC[id])).p<100) return i; } return PHASES.length-1; }

/* ================= ILLUSTRATIONS ================= */
function wrapWords(s, max){ const w=String(s).split(" "); const L=[]; let c=""; w.forEach(x=>{ if((c+" "+x).trim().length>max){ if(c)L.push(c); c=x; } else c=(c+" "+x).trim(); }); if(c)L.push(c); return L; }
function svgRing(nodes, center, arrows){
  const n=nodes.length, R=128, cx=210, cy=190;
  let s=`<svg class="ills" viewBox="0 0 420 380" role="img" aria-label="${esc(center)}">`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line)" stroke-width="2" ${arrows?'stroke-dasharray="6 6"':''}/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="56" fill="var(--glass-strong)" stroke="var(--accent)" stroke-width="1.5"/>`;
  wrapWords(center,12).forEach((l,i,a)=>{ s+=`<text x="${cx}" y="${cy+5+(i-(a.length-1)/2)*16}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-weight="700" font-size="14" fill="var(--ink)">${esc(l)}</text>`; });
  nodes.forEach((t,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/n, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    const lines=wrapWords(t,14), h=18+lines.length*14, w=118;
    s+=`<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="10" fill="var(--glass-strong)" stroke="var(--accent)" stroke-width="1.2"/>`;
    lines.forEach((l,j)=>{ s+=`<text x="${x}" y="${y+4+(j-(lines.length-1)/2)*14}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="11.5" font-weight="600" fill="var(--ink)">${esc(l)}</text>`; });
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

/* ================= NAVIGATION ================= */
const MENU = [
 ["Overview",[["home","Dashboard","#0A6CDF","◎"],["insights","Insights & coach","#C2410C","✚"]]],
 ["Study",[["learn","Learn by role","#1E8A4C","▤"],["lab","Cyber Lab (LabOS)","#334155","$_"],["ideas","Project ideas","#A2620A","◇"],["projects","Projects","#7A4BC4","⚒"],["automation","Automation tools","#0F766E","⟳"],["certs","Certifications","#0E7490","✦"],["videos","Video bookmarks","#C2410C","▶"]]],
 ["Career",[["roles","Role pages & readiness","#0E7490","◆"],["jd","Job descriptions","#7C3AED","≡"],["matrix","Roles × subjects","#155E75","▦"],["applications","Applications & Gmail","#B42318","✉"],["jobs","Jobs to target","#A2620A","▣"],["resume","Resume builder","#0A6CDF","¶"],["cover","Cover letter builder","#0A6CDF","✎"],["linkedin","LinkedIn","#2563EB","in"]]],
 ["People & news",[["network","Network","#1E8A4C","☍"],["news","News & regulations","#9D174D","§"],["updates","Updates","#C2410C","↻"]]],
 ["Help",[["support","Help & support (AI)","#2563EB","?"],["mentors","Student support","#15803D","☏"]]],
 ["You",[["pricing","Plans & pricing","#B45309","₹"],["admin","Admin: payments","#7C2D12","⚙"],["profile","Profile & avatar","#4F5D6E","●"]]]
];
const TABS = [["home","Home","◎"],["learn","Learn","▤"],["lab","Lab","$_"],["projects","Projects","⚒"]];
const TITLES = Object.fromEntries(MENU.flatMap(([,items])=>items.map(([k,l])=>[k,l]))); TITLES["lab-map"] = "Cyber Lab · Mission map";
let current = "home", menuOpen = false;

/* ================= DASHBOARD ================= */
function totalXP(){ return Object.keys(S.progress.done).length*10 + TOPICS.filter(t=>quizStats(t).pass).length*30 + ALLPROJ.filter(p=>projGet(p.id).passed).reduce((a,p)=>a+p.lvl*60,0) + totalLabXPAll(); }
function levelOf(xp){ const lvl = Math.floor(Math.sqrt(xp/60)) + 1, cur = (lvl-1)**2*60, nx = lvl**2*60; return {lvl, pct: Math.round((xp-cur)/(nx-cur)*100), toNext: nx-xp}; }
function nextMission(){ return MISSIONS.find(m => missionUnlocked(m) && !labGet(m.id).done); }
function greeting(){ const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

/* ================= LEARNING PATH ================= */
function depthControl(){ return `<div class="row"><span class="num">Show depth</span><div class="seg" role="group" aria-label="Depth">${[[1,"Must know only"],[2,"+ Core"],[3,"Everything"]].map(([v,l])=>`<button aria-pressed="${depth===v}" data-depth="${v}">${l}</button>`).join("")}</div></div>`; }
function legend(){ return `<div class="legend">${lv(1)}<span class="muted">interview essentials</span>${lv(2)}<span class="muted">working knowledge</span>${lv(3)}<span class="muted">detail, read later</span><span class="src">Primary</span><span class="muted">official source</span></div>`; }
function topicCard(t, n, need){ const s=topicStats(t), qz=quizStats(t); const c=[1,2,3].map(l=>t.subs.filter(x=>x.l===l).length);
  const pre=(PRE[t.id]||[]).filter(id=>topicStats(TOPIC[id]).p<100);
  return `<article class="card tcard" data-go="${t.id}" tabindex="0" role="link">
    <div class="row between"><span class="step-n">STEP ${n} · ${esc(TRACKS[t.track])}</span><span class="row" style="gap:6px">${need==="core"?'<span class="pill acc">Core</span>':need==="support"?'<span class="pill">Supporting</span>':''}${lvBadge(INTENSITY[t.id])}${t.prio?'<span class="pill hot">Priority</span>':''}${aiBadge(t.id)}</span></div>
    <h3>${esc(t.title)}</h3><p class="muted" style="font-size:.88rem">${esc(t.short)}</p>
    <div class="dots"><span class="d1">${c[0]}</span><span class="d2">${c[1]}</span><span class="d3">${c[2]}</span></div>
    ${bar(s.p)}<div class="row between"><span class="num">${s.d}/${s.n} learned</span>${qz.pass?'<span class="pill ok">Quiz passed</span>':qz.ans?`<span class="num">Quiz ${qz.r}/${qz.n}</span>`:''}</div>
    <div class="row between"><span class="num">Projects ${ladderPassed(t.id)}/3 · mastery ${Math.round(topicMastery(t)*100)}%</span><span class="mini3">${[0,1,2].map(k=>`<em class="${k<ladderPassed(t.id)?"on":""}"></em>`).join("")}</span></div>
    ${pre.length?`<span class="num">Best after: ${pre.map(id=>esc(TOPIC[id].title)).join(", ")}</span>`:""}</article>`; }
let learnGroup = "path";
function viewLearn(){
  const q = query.toLowerCase();
  const hits = q ? TOPICS.flatMap(t => t.subs.map((s,i)=>({t,s,i}))).filter(x => (x.s.t+" "+x.s.b).toLowerCase().includes(q)).slice(0,14) : [];
  let n = 0;
  return `<div><span class="eyebrow">Learning path</span><h2>Study in this order</h2></div>
  <div class="card"><h3>Why this order</h3><p>Topics follow a prerequisite-first sequence (switch to "By intensity" to see them sorted Beginner → Intermediate → Advanced instead): each phase uses ideas from the one before. Foundations give you the vocabulary; privacy laws come next because they're your target; security concepts follow so frameworks make sense; then risk and audit (with Excel practice), sector rules, AI governance, and finally the enterprise tools that automate work you already understand.</p>
    <p class="muted" style="font-size:.9rem">Inside every topic the parts follow the same teaching cycle: goal → why it matters → key ideas → picture → real example → common mistakes → self-test → review. Finished topics come back for review after 7 days and again after 30, so they stick.</p>
    ${legend()}
    <div class="row between"><div class="row"><div class="seg" role="group" aria-label="Group by">${[["path","By learning order"],["intensity","By intensity"]].map(([v,l])=>`<button aria-pressed="${learnGroup===v}" data-lgroup="${v}">${l}</button>`).join("")}</div><div class="seg" role="group" aria-label="Track">${[["all","All"],["law","Law"],["cyber","Cyber"],["tool","Tools"]].map(([v,l])=>`<button aria-pressed="${track===v}" data-track="${v}">${l}</button>`).join("")}</div></div>
    <input type="search" id="q" placeholder="Search, e.g. consent, MFA, Reg S-P" value="${esc(query)}" style="max-width:340px"></div></div>
  ${hits.length?`<div class="card"><span class="eyebrow">Matching sub-topics</span>${hits.map(x=>`<div class="row between"><button class="link" data-go="${x.t.id}" data-anchor="s-${x.i}">${esc(x.s.t)}</button><span class="row">${lv(x.s.l)}<span class="num">${esc(x.t.title)}</span></span></div>`).join("")}</div>`:""}
  ${learnGroup==="intensity" ? [1,2,3].map(l=>{ const shown=TOPICS.filter(t=>INTENSITY[t.id]===l && (track==="all"||t.track===track)); if(!shown.length) return ""; const s=groupStats(shown);
    return `<section class="phase"><div class="phase-h">${lvBadge(l)}<h3>${l===1?"Foundation: no background needed":l===2?"Working knowledge: needs the foundations":"Specialist: sector rules, incidents and enterprise tools"}</h3><span class="num">${s.p}% learned</span></div>
    <div class="grid3">${shown.map(t=>topicCard(t, TOPICS.indexOf(t)+1)).join("")}</div></section>`; }).join("") :
  PHASES.map((ph,pi)=>{ const ts=ph.ids.map(id=>TOPIC[id]); const shown=ts.filter(t=>track==="all"||t.track===track); const startN=n; n+=ts.length; if(!shown.length) return ""; const s=groupStats(ts);
    return `<section class="phase"><div class="phase-h"><span class="pn">PHASE ${pi+1}</span><h3>${esc(ph.name)}</h3><span class="num">${s.p}% · ${esc(ph.why)}</span></div>
    <div class="grid3">${shown.map(t=>topicCard(t, startN+ts.indexOf(t)+1)).join("")}</div></section>`; }).join("")}`;
}

const PARTS = [["obj","Objective"],["why","Why it exists"],["ideas","Key ideas"],["pic","Picture it"],["case","Real example"],["ben","Why employers care"],["trap","Mistakes & traps"],["quiz","Check yourself"],["terms","Jargon decoder"],["watch","Watch & read"],["ai","AI impact"],["ask","Ask & commands"]];
function part(n, id, title, inner){ return `<section class="card part" id="p-${id}"><div class="ph"><span class="pn">${String(n).padStart(2,"0")}</span><h3>${title}</h3></div>${inner}</section>`; }
function subHTML(t, s, i){
  const k = key(t.id,i), done = !!S.progress.done[k], bms = (S.videos.map[k] || []);
  if (s.l > depth) return `<div class="sub L${s.l} collapsed" id="s-${i}"><div class="top"><span><b>${esc(s.t)}</b></span><span class="row">${lv(s.l)}<button class="link" data-reveal="${i}">Show</button></span></div></div>`;
  return `<div class="sub L${s.l} ${done?"done":""}" id="s-${i}">
    <div class="top"><h4>${esc(s.t)}</h4>${lv(s.l)}</div>
    <p>${addTerms(esc(s.b), t.terms)}</p>
    ${s.ex?`<div class="ex"><b>Example:</b> ${esc(s.ex)}</div>`:""}
    <div class="vrow"><span class="src video">Video</span><a href="${yt(s.v)}" target="_blank" rel="noopener">Find videos on this sub-topic</a><button class="link" data-bmform="${k}">+ Save a timestamp</button></div>
    <div id="bmf-${k.replace(".","_")}" hidden></div>
    ${bms.map((b,j)=>`<div class="bm"><span class="ts">${tsFmt(b.sec)}</span><a href="${esc(ytAt(b.url,b.sec))}" target="_blank" rel="noopener">${esc(b.label||"Jump to this part")}</a><button class="link" data-bmdel="${k}|${j}">Remove</button></div>`).join("")}
    <label class="learned"><input type="checkbox" id="chk-${k}" data-k="${k}" ${done?"checked":""}> I can explain this in my own words</label></div>`;
}
function practiceCard(t){
  const l = LADDER[t.id] || [], z = ZONES.find(x => x.topic === t.id), cur = ladderCurrent(t.id);
  return `<div class="card"><div class="row between"><div><span class="eyebrow">Practise it</span><h3>${cur?`Next project: ${esc(cur.title)}`:"All three projects passed"}</h3></div>${cur?`<button class="btn sm" data-go="proj-${cur.id}">${projUnlocked(cur)?"Open project":"View"} →</button>`:""}</div>
    ${l.length?ladderBar(cur||l[2]):""}
    ${z?`<div class="row between inset"><span><b>${esc(z.icon)} ${esc(z.name)}</b> <span class="num">· ${zoneMissions(z.id).filter(m=>labGet(m.id).done).length}/${zoneMissions(z.id).length} Lab missions</span></span><button class="btn sm ghost" data-go="${(()=>{ const ms = zoneMissions(z.id), nx = ms.find(m => missionUnlocked(m) && !labGet(m.id).done) || ms[0]; return nx ? "lab-" + nx.id : "lab-map"; })()}">Play in Cyber Lab</button></div>`:""}</div>
    ${handsOnCard(t)}`;
}
function viewTopic(t){
  const st = topicStats(t), idx = TOPICS.indexOf(t), prev = TOPICS[idx-1], next = TOPICS[idx+1];
  const qa = S.progress.quiz[t.id] || {}, ph = PHASES[PHASE_OF[t.id]];
  const pre = PRE[t.id]||[], certs = certsForTopic(t.id);
  let n = 0;
  return `<div class="thead"><button class="link" data-go="learn">← Learning path</button>
    <span class="eyebrow">Step ${idx+1} of ${TOPICS.length} · Phase ${PHASE_OF[t.id]+1}: ${esc(ph.name)}${t.prio?" · priority":""}</span><div class="row">${lvBadge(INTENSITY[t.id])}<span class="num">Mastery ${Math.round(topicMastery(t)*100)}%</span></div>
    <h2>${esc(t.title)}</h2><p class="lede">${esc(t.short)}</p>
    <div class="row"><div style="flex:1;min-width:160px">${bar(st.p)}</div><span class="num" id="topicNum">${st.d}/${st.n} learned</span></div>
    ${pre.length?`<div class="row"><span class="num">Builds on:</span>${pre.map(id=>`<button class="pill ${topicStats(TOPIC[id]).p===100?"ok":""}" data-go="${id}">${esc(TOPIC[id].title)}</button>`).join("")}</div>`:""}
    ${certs.length?`<div class="row"><span class="num">Counts toward:</span>${certs.map(c=>`<button class="pill acc" data-go="cert-${c.id}">${esc(c.name.replace(/\s*\(.*\)/,""))}</button>`).join("")}</div>`:""}
    <div class="card" style="gap:10px">${depthControl()}${legend()}</div>
    <nav class="parts" aria-label="Parts">${PARTS.map(([id,l],i)=>`<a href="#${t.id}" data-anchor="p-${id}">${i+1}. ${l}</a>`).join("")}</nav></div>
  ${materialsCard(t)}
  ${practiceCard(t)}
  ${aiImpactCard(t)}
  ${part(++n,"obj","Objective",`<p>${esc(t.obj)}</p>`)}
  ${part(++n,"why","Why it exists",`<p>${addTerms(esc(t.why), t.terms)}</p>`)}
  ${part(++n,"ideas","Key ideas",`<div style="display:grid;gap:10px">${t.subs.map((s,i)=>subHTML(t,s,i)).join("")}</div>`)}
  ${part(++n,"pic","Picture it",`<div class="ill">${illustrate(t)}</div><p class="muted">${esc(t.illCap||"")}</p>`)}
  ${part(++n,"case","Real example",`<h4>${esc(t.case.t)}</h4><p>${addTerms(esc(t.case.b), t.terms)}</p>`)}
  ${part(++n,"ben","Why employers care",`<ul class="clean">${t.ben.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`)}
  ${part(++n,"trap","Mistakes & interview traps",`<ul class="clean">${t.trap.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`)}
  ${part(++n,"quiz","Check yourself",`<div>${t.quiz.map((q,i)=>{ const a=qa[i]; return `<div class="quizq"><b>${i+1}. ${esc(q.q)}</b><div class="opts">${q.o.map((o,j)=>`<button data-quiz="${t.id}|${i}|${j}" ${a!==undefined?"disabled":""} class="${a!==undefined?(j===q.a?"right":(j===a?"wrong":"")):""}">${esc(o)}</button>`).join("")}</div>${a!==undefined?`<p class="muted" style="font-size:.88rem">${a===q.a?"Correct. ":"Not quite. "}${esc(q.w)}</p>`:""}</div>`;}).join("")}</div>
    <div class="row between"><span class="num">${(()=>{const s=quizStats(t);return s.ans?`Score ${s.r}/${s.n}${s.pass?" · passed":""}`:"Answer all three to record a score";})()}</span><button class="btn ghost sm" data-quizreset="${t.id}">Retake (counts as a review)</button></div>`)}
  ${part(++n,"terms","Jargon decoder",`<div class="tbl"><table><tbody>${Object.entries(t.terms||{}).map(([k,v])=>`<tr><th style="text-transform:none;font-size:.88rem;color:var(--ink)">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div><p class="muted" style="font-size:.88rem">Dotted words on this page show these meanings when tapped.</p>`)}
  ${part(++n,"watch","Watch & read",`
    <div style="display:grid;gap:8px">${t.refs.map(([l,u,k])=>`<div class="vrow"><span class="src ${k==="primary"?"":k}">${k==="primary"?"Primary":k}</span><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div>
    <div class="info"><b>Jump straight to the right minute.</b> I don't make up timestamps. Open a video, copy its chapter list from the description (or its transcript via "Show transcript"), paste it below, and Claude matches each sub-topic on this page to the minute it starts. Results save as jump links under each sub-topic.</div>
    <div class="form"><label class="f">Video link<input type="url" id="tfUrl" placeholder="https://www.youtube.com/watch?v=..."></label></div>
    <label class="f">Chapters or transcript (with times)<textarea id="tfText" placeholder="0:00 Intro&#10;2:15 What is personal data&#10;6:40 Consent..."></textarea></label>
    <div class="row"><button class="btn" id="tfGo" data-tid="${t.id}">Find sub-topic timestamps</button><span class="num" id="tfMsg"></span></div>
    <div id="tfOut" style="display:grid;gap:6px"></div>`)}
  ${part(++n,"ask","Ask about this topic",`
    ${cmdBar("topic", t.id)}
    <p class="muted" style="font-size:.9rem">Answers come from Claude's own knowledge, not a live web search. Check dates and numbers against the primary sources above.</p>
    <div class="row">${[["simple","Explain it more simply"],["india","Give me an Indian example"],["interview","Ask me 3 interview questions"],["exam","Exam-style questions for my certification"],["deeper","Go one level deeper"]].map(([k,l])=>`<button class="btn ghost sm" data-ask="${t.id}|${k}">${l}</button>`).join("")}</div>
    <div class="row"><input type="text" id="askQ" placeholder="Or type your own question about ${esc(t.title)}" style="flex:1;min-width:200px"><button class="btn sm" data-ask="${t.id}|free">Ask</button><button class="btn ghost sm" id="askStop" hidden>Stop</button></div>
    <div class="ai" id="aiOut" aria-live="polite">Pick a button above.</div>`)}
  <div class="pager">${prev?`<button class="btn ghost" data-go="${prev.id}">← ${esc(prev.title)}</button>`:"<span></span>"}${next?`<button class="btn ghost" data-go="${next.id}">Next: ${esc(next.title)} →</button>`:""}</div>`;
}

/* ================= CERTIFICATIONS ================= */
let certRole = null, certCo = null;
function recommendedCerts(roleId, coId){
  const m = new Map();
  (ROLE_CERTS[roleId]||[]).forEach(([id,pri]) => m.set(id, {id, pri, why:["role"]}));
  const co = COMPANIES.find(c=>c.id===coId);
  (co?co.certs:[]).forEach((id,i) => { const x = m.get(id); if (x) { x.why.push("company"); if (i===0) x.pri = Math.max(1, x.pri - 1); } else m.set(id, {id, pri: 3, why:["company"]}); });
  return [...m.values()].sort((a,b) => a.pri-b.pri || certReady(CERT[b.id]) - certReady(CERT[a.id]));
}
function shortCert(c){ return c.name.replace(/^(IAPP|ISC2|CompTIA|ISACA|ServiceNow|DSCI)\s*/,"").replace(/\s*\(.*\)/,"").replace("Certified System Administrator","CSA").replace("Certified Privacy Professional","DCPP").replace("ISO/IEC 27001 Lead Auditor","27001 LA").replace("Certified in Cybersecurity","CC"); }
function viewCerts(){
  const p = S.profile;
  const role = certRole || (p.targets||[])[0] || "privacy", co = certCo || p.company || "bank";
  const R = ROLE[role], C = COMPANIES.find(c=>c.id===co);
  const rec = recommendedCerts(role, co);
  const stage = {1:["Do now","ok"],2:["Next","warn"],3:["Later","acc"]};
  const coSkills = C.skills.map(k=>({k,l:skillLevel(k)}));
  const mapCerts = CERTS.filter(c=>COMPANIES.some(k=>k.certs.includes(c.id)));
  return `<div><span class="eyebrow">Certifications</span><h2>What the job asks for, and how ready you are</h2></div>
  <p class="lede">Pick the role and the type of company you're targeting. The dashboard shows what those employers look for, which certifications to do in what order, and how much of each exam your reading already covers.</p>
  <div class="card"><div class="form">
    <label class="f">Target role<select id="certRole">${ROLES.map(r=>`<option value="${r.id}" ${r.id===role?"selected":""}>${esc(r.name)}</option>`).join("")}</select></label>
    <label class="f">Target company type<select id="certCo">${COMPANIES.map(c=>`<option value="${c.id}" ${c.id===co?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label></div></div>
  <div class="grid2">
    <div class="card"><span class="eyebrow">What ${esc(C.name)} want</span><p class="muted" style="font-size:.9rem">${esc(C.eg)}</p><p>${esc(C.note)}</p>
      <b style="font-size:.88rem">Skills they test, and your level</b>
      ${coSkills.map(x=>`<div class="skillrow"><span>${esc(SKILLS[x.k])}</span>${bar(x.l, x.l>=70?"":"acc")}<span class="num">${x.l}%</span></div>`).join("")}
      <p style="font-size:.88rem"><b>Tools they use:</b> <span class="muted">${esc(C.tools)}</span></p>
      <div class="row"><b style="font-size:.88rem">Roles they hire:</b>${C.roles.map(id=>`<span class="pill">${esc(ROLE[id].name.split(" (")[0])}</span>`).join("")}</div></div>
    <div class="card"><span class="eyebrow">Your readiness for ${esc(R.name)}</span><div class="row">${ring(roleReady(R),"acc")}<div>${readyPill(roleReady(R))}<p class="muted" style="font-size:.88rem;margin-top:6px">Skills from your learning, quizzes and work experience.</p></div></div>
      <b style="font-size:.88rem">Biggest gaps</b>
      ${gaps(R).slice(0,4).map(x=>{const tp=topicForSkill(x.k);return `<div class="row between"><span>${esc(SKILLS[x.k])} <span class="num">${x.l}%</span></span>${tp?`<button class="link" data-go="${tp.id}">${esc(tp.title)}</button>`:`<button class="link" data-go="profile">Mark if you have it</button>`}</div>`;}).join("")||`<p class="muted">No major gaps.</p>`}</div>
  </div>
  <div class="card"><span class="eyebrow">Your certification path</span><h3>For ${esc(R.name)} at ${esc(C.name)}</h3>
    ${rec.map(x=>{const c=CERT[x.id],r=certReady(c),[lbl,cls]=stage[x.pri];const have=(p.certsHave||[]).includes(c.id);
      return `<div class="inset" style="display:grid;gap:8px"><div class="row between"><div style="min-width:0"><b>${esc(c.name)}</b> <span class="num">${esc(c.body)} · ${esc(c.level)}</span></div><div class="row">${have?'<span class="pill ok">You have this</span>':`<span class="pill ${cls}">${lbl}</span>`}<span class="num">${r}% covered</span></div></div>
      ${bar(r,"l3")}<p style="font-size:.88rem">${esc(c.why)} <span class="muted">Valued by ${x.why.includes("role")&&x.why.includes("company")?"this role and these companies":x.why.includes("role")?"this role":"these companies"}.</span></p>
      <div><button class="btn sm ghost" data-go="cert-${c.id}">Open study plan</button></div></div>`;}).join("")}</div>
  <div class="card"><span class="eyebrow">Market map</span><h3>Which company types value which certifications</h3>
    <div class="tbl"><table class="matrix"><thead><tr><th>Company type</th>${mapCerts.map(c=>`<th title="${esc(c.name)}">${esc(shortCert(c))}</th>`).join("")}</tr></thead>
    <tbody>${COMPANIES.map(k=>`<tr ${k.id===co?'style="background:var(--accent-soft)"':''}><td><b>${esc(k.name)}</b></td>${mapCerts.map(c=>`<td>${k.certs.includes(c.id)?`<span class="dot ${(p.certsHave||[]).includes(c.id)?"have":""}" title="Valued"></span>`:""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <span class="num">Green dot = a certification you've marked as held in your profile.</span></div>`;
}
function viewCert(c){
  const r = certReady(c), have = (S.profile.certsHave||[]).includes(c.id), plan = (S.profile.certsPlan||[]).includes(c.id);
  const topicsInOrder = TOPICS.filter(t => c.domains.some(([,ids]) => ids.includes(t.id)));
  const roles = Object.entries(ROLE_CERTS).filter(([,l])=>l.some(x=>x[0]===c.id)).map(([id])=>ROLE[id].name);
  const cos = COMPANIES.filter(k=>k.certs.includes(c.id)).map(k=>k.name);
  return `<div class="thead"><button class="link" data-go="certs">← Certifications</button><span class="eyebrow">${esc(c.body)} · ${esc(c.level)}</span><h2>${esc(c.name)}</h2><p class="lede">${esc(c.why)}</p></div>
  <div class="grid2"><div class="card"><div class="row">${ring(r)}<div><b>${r}% of the exam areas covered</b><p class="muted" style="font-size:.88rem">Based on sub-topics learned and quizzes passed in the mapped topics.</p></div></div>
    <div class="row"><label class="learned" style="color:var(--ink)"><input type="checkbox" id="ch-${c.id}" data-certhave="${c.id}" ${have?"checked":""}> I hold this</label><label class="learned" style="color:var(--ink)"><input type="checkbox" id="cp-${c.id}" data-certplan="${c.id}" ${plan?"checked":""}> I'm preparing for it</label></div></div>
  <div class="card"><p><b>Eligibility:</b> ${esc(c.eligible)}</p><p><b>Cost:</b> ${esc(c.cost)}</p><p><b>Valued for:</b> ${esc(roles.join(", ")||"—")}</p><p><b>By:</b> ${esc(cos.join(", ")||"—")}</p><a href="${esc(c.url)}" target="_blank" rel="noopener">Official page</a></div></div>
  <div class="card"><span class="eyebrow">Exam areas → what to read</span>
    ${c.domains.map(([d,ids])=>{const dr=domainReady(ids);return `<div class="inset" style="display:grid;gap:6px"><div class="row between"><b style="font-size:.92rem">${esc(d)}</b><span class="num">${dr}%</span></div>${bar(dr,"l3")}<div class="row">${ids.map(id=>`<button class="pill ${topicStats(TOPIC[id]).p===100?"ok":""}" data-go="${id}">${esc(TOPIC[id].title)} · ${topicStats(TOPIC[id]).p}%</button>`).join("")}</div></div>`;}).join("")}</div>
  <div class="card"><span class="eyebrow">Study sequence for this certification</span><p class="muted" style="font-size:.9rem">The same topics in learning-path order, so earlier ones prepare you for later ones.</p>
    ${topicsInOrder.map((t,i)=>{const s=topicStats(t),q=quizStats(t);return `<div class="row between"><span><span class="step-n">${i+1}</span> <button class="link" data-go="${t.id}">${esc(t.title)}</button></span><span class="row"><span class="num">${s.d}/${s.n}</span>${q.pass?'<span class="pill ok">Quiz passed</span>':''}</span></div>`;}).join("")}
    <div class="row"><button class="btn sm ghost" data-certask="${c.id}">Ask Claude for a 4-week plan to this exam</button></div><div class="ai" id="ca-${c.id}" hidden></div></div>`;
}

/* ================= ROLES ================= */
function viewRoles(){
  const ranked = ROLES.map(r => ({r, p:roleReady(r)})).sort((a,b) => b.p - a.p), targets = S.profile.targets||[];
  const trend = (UPDATES||[]).filter(u=>u.kind==="skill"||u.kind==="tool").slice(0,6);
  return `<div><span class="eyebrow">Readiness tracker</span><h2>Roles you can apply for</h2></div>
  <p class="lede">Each role needs a weighted set of skills. Your level comes from sub-topics learned, quizzes passed, and skills you've said you have from work (Profile).</p>
  <div class="row"><button class="btn ghost" data-go="jd">Check a job description</button><span class="num">See what a posting asks for and what to learn next.</span></div>
  <div class="card"><div class="row">${readyPill(80)}<span class="muted">70%+</span>${readyPill(50)}<span class="muted">40–69%</span>${readyPill(10)}<span class="muted">under 40%</span></div></div>
  ${ranked.map(({r,p})=>{ const g=gaps(r).slice(0,3), rc=(ROLE_CERTS[r.id]||[]).filter(x=>x[1]===1).map(x=>CERT[x[0]]); return `<article class="card">
    <div class="row between"><div style="min-width:0"><span class="eyebrow">${esc(r.fit)}${targets.includes(r.id)?" · your target":""}</span><h3>${pathOf(r.id)?`<button class="link strong" data-go="role-${r.id}">${esc(r.name)}</button>`:esc(r.name)}</h3></div><div class="row"><span class="big">${p}%</span>${readyPill(p)}${pathOf(r.id)?`<button class="btn sm" data-go="role-${r.id}">Role page</button>`:""}</div></div>
    ${bar(p,"acc")}
    <details><summary class="link" style="cursor:pointer;font-weight:600">Skill breakdown</summary><div style="display:grid;gap:6px;margin-top:10px">
      ${Object.entries(r.need).sort((a,b)=>b[1]-a[1]).map(([k,w])=>{const l=skillLevel(k);return `<div class="skillrow"><span>${esc(SKILLS[k])} <span class="num">×${w}</span></span>${bar(l)}<span class="num">${l}%</span></div>`;}).join("")}</div></details>
    ${g.length?`<div><b style="font-size:.9rem">Learn next</b><div style="display:grid;gap:4px;margin-top:6px">${g.map(x=>{const tp=topicForSkill(x.k);return `<div class="row between"><span>${esc(SKILLS[x.k])} <span class="num">${x.l}%</span></span>${tp?`<button class="link" data-go="${tp.id}">${esc(tp.title)}</button>`:`<button class="link" data-go="profile">Mark in profile if you have it</button>`}</div>`;}).join("")}</div></div>`:`<p class="muted">All core skills covered. Apply.</p>`}
    ${rc.length?`<div class="row"><span class="num">First certification:</span>${rc.map(c=>`<button class="pill acc" data-go="cert-${c.id}">${esc(c.name)}</button>`).join("")}</div>`:""}
    ${(()=>{const ps=ALLPROJ.filter(x=>projRoles(x).includes(r.id)&&projUnlocked(x)&&!projGet(x.id).passed).slice(0,3);return ps.length?`<div class="row"><span class="num">Projects that prove it:</span>${ps.map(x=>`<button class="pill ${projGet(x.id).passed?"ok":""}" data-go="proj-${x.id}">${esc(x.title)}</button>`).join("")}</div>`:"";})()}
    <div class="row"><a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(r.q)}&location=India" target="_blank" rel="noopener">LinkedIn jobs</a><a href="https://www.naukri.com/${r.q.toLowerCase().replace(/\s+/g,"-")}-jobs" target="_blank" rel="noopener">Naukri jobs</a><button class="link" data-roleask="${r.id}">Ask Claude what else this role needs</button></div>
    <div class="ai" id="ra-${r.id}" hidden></div></article>`;}).join("")}
  <div class="card"><span class="eyebrow">From your weekly web check</span><h3>Skills and tools showing up in job posts</h3>
    ${trend.length?trend.map(u=>`<div><b style="font-size:.92rem">${esc(u.title)}</b><p class="muted" style="font-size:.88rem">${esc(u.summary||"")}</p></div>`).join(""):`<p class="muted">Nothing yet.</p>`}</div>
  <div class="card"><span class="eyebrow">Your own extra skills to learn</span>
    ${(S.profile.extra||[]).length?(S.profile.extra).map((x,i)=>`<div class="row between"><span>${esc(x)}</span><button class="link" data-extradel="${i}">Remove</button></div>`).join(""):`<p class="muted">Add skills a job post or Claude suggests that aren't in this docket yet.</p>`}
    <div class="row"><input type="text" id="extraIn" placeholder="e.g. DORA, NIS2" style="flex:1;min-width:200px"><button class="btn sm" id="extraAdd">Add</button></div></div>`;
}

/* ================= NETWORK ================= */
const STAGES = ["To connect","Request sent","Connected","Talked","Referral"];
const NOTES = {
  pro:(c)=>`Hi ${c.name||"[Name]"}, I'm a law graduate moving into privacy and GRC, studying DPDP and ISO 27001. Your work at ${c.company||"[Company]"} stood out. Would love to connect and learn from your posts.`,
  rec:(c)=>`Hi ${c.name||"[Name]"}, I'm an Advocate with US financial compliance experience (FCRA), now focused on DPDP and GRC. I saw ${c.company||"[Company]"} hires for privacy/compliance roles and would be glad to connect.`,
  alum:(c)=>`Hi ${c.name||"[Name]"}, fellow law alum here. I see you moved into ${c.role||"privacy/risk"} — I'm on the same path. Could I ask you two quick questions about how you made the switch?`,
  follow:(c)=>`Hi ${c.name||"[Name]"}, thanks for connecting. I'm building skills in DPDP and ISO 27001 and would value 10 minutes of your advice on breaking into ${c.role||"GRC"} at ${c.company||"your company"}. Happy to work around your schedule.`
};
let netFilter = "All";
function viewNetwork(){
  const cs = S.network.contacts||[], shown = netFilter==="All"?cs:cs.filter(c=>c.stage===netFilter);
  return `<div><span class="eyebrow">Your networking desk</span><h2>Network</h2></div>
  ${liSection()}
  <h3 style="margin-top:6px">Your outreach pipeline</h3>
  <div class="grid4">${STAGES.map(s=>`<div class="card tile"><span class="lbl">${s}</span><span class="big">${cs.filter(c=>c.stage===s).length}</span></div>`).join("")}</div>
  <div class="info">LinkedIn doesn't let outside apps send messages or connection requests. Contacts here move forward on their own when your LinkedIn data shows they accepted or replied. This page prepares the note, copies it and opens the person's profile; you press Send there. Email drafts go straight into your Gmail Drafts (you approve Gmail access the first time).</div>
  <div class="card"><h3>Find people</h3><div class="form">
    <label class="f">Role<select id="fpRole">${["GRC Analyst","Privacy Analyst","Data Protection Officer","Privacy Counsel","Compliance Analyst","Talent Acquisition","Third Party Risk"].map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label class="f">Company (optional)<input type="text" id="fpCo" placeholder="e.g. Deloitte"></label>
    <label class="f">Location<input type="text" id="fpLoc" value="India"></label></div>
    <div class="row"><a class="btn" id="fpLink" href="https://www.linkedin.com/search/results/people/?keywords=GRC%20Analyst%20India" target="_blank" rel="noopener">Search on LinkedIn</a></div></div>
  <div class="card"><h3>Add a contact</h3><div class="form">
    <label class="f">Name<input type="text" id="ncName"></label><label class="f">Role<input type="text" id="ncRole"></label>
    <label class="f">Company<input type="text" id="ncCo"></label><label class="f">LinkedIn URL<input type="url" id="ncLi" placeholder="https://www.linkedin.com/in/..."></label>
    <label class="f">Email (optional)<input type="email" id="ncEmail"></label><label class="f">WhatsApp number (optional)<input type="text" id="ncPhone" placeholder="+91..."></label></div>
    <div><button class="btn" id="ncAdd">Add contact</button></div></div>
  <div class="seg" role="group" aria-label="Stage filter">${["All",...STAGES].map(s=>`<button aria-pressed="${netFilter===s}" data-netf="${s}">${s} (${s==="All"?cs.length:cs.filter(c=>c.stage===s).length})</button>`).join("")}</div>
  <div style="display:grid;gap:10px">${shown.length?shown.map(c=>{const i=cs.indexOf(c);return `<div class="contact">
    <div class="row between"><div><b>${esc(c.name)}</b> <span class="muted">${esc(c.role||"")}${c.company?" · "+esc(c.company):""}</span></div>
      <select data-stage="${i}" aria-label="Stage" style="width:auto">${STAGES.map(s=>`<option ${c.stage===s?"selected":""}>${s}</option>`).join("")}</select></div>
    <div class="row"><label class="f" style="flex:1;min-width:160px">Note template<select data-tpl="${i}">${[["pro","To a professional"],["rec","To a recruiter"],["alum","To an alumnus"],["follow","Follow-up after connecting"]].map(([k,l])=>`<option value="${k}" ${c.tpl===k?"selected":""}>${l}</option>`).join("")}</select></label>
      <label class="f">Follow up on<input type="date" data-follow="${i}" value="${esc(c.follow||"")}"></label></div>
    <p style="font-size:.9rem" class="inset" id="nt-${i}">${esc(NOTES[c.tpl||"pro"](c))}</p>
    <div class="row"><button class="btn sm" data-copynote="${i}">Copy note</button>
      ${c.li?`<a href="${esc(c.li)}" target="_blank" rel="noopener">Open LinkedIn profile</a>`:""}
      ${c.phone?`<a href="https://wa.me/${esc(String(c.phone).replace(/\D/g,""))}?text=${encodeURIComponent(NOTES[c.tpl||"pro"](c))}" target="_blank" rel="noopener">Open in WhatsApp</a>`:""}
      ${c.email?`<button class="btn ghost sm" data-gmail="${i}">Draft in Gmail</button>`:""}
      <button class="link" data-netdel="${i}">Remove</button></div>
    <span class="num" id="gm-${i}"></span>
    <textarea data-cnotes="${i}" placeholder="Notes: what you talked about, who referred you…" style="min-height:50px">${esc(c.notes||"")}</textarea></div>`;}).join(""):`<div class="card"><p class="muted">No contacts here yet. Use "Find people" to search LinkedIn, then add the people you want to reach. Aim for 10 a day for two weeks.</p></div>`}</div>`;
}

/* ================= UPDATES / PROFILE / VIDEOS ================= */
function viewUpdates(){
  const U = UPDATES||[], groups = [["law","Law and regulation changes"],["news","News and enforcement"],["skill","Skills in demand"],["tool","Tools in demand"]];
  return `<div><span class="eyebrow">Live from the web</span><h2>Updates</h2></div>
  <p class="lede">A scheduled task searches the web every Monday for changes to the laws in this course and for skills and tools trending in Indian GRC and privacy job posts, and posts them here with sources.</p>
  <div class="row between"><span class="num">${FEEDMETA&&FEEDMETA.lastRun?"Last web check: "+esc(String(FEEDMETA.lastRun).slice(0,10)):"Waiting for the first web check"}</span><button class="btn ghost sm" id="updRefresh">Refresh</button></div>
  ${U.length?groups.map(([k,l])=>{const items=U.filter(u=>u.kind===k);return items.length?`<div class="card"><h3>${l}</h3>${items.map(u=>`<div style="display:grid;gap:3px;padding-block:8px;border-bottom:1px solid var(--line)">
    <b>${esc(u.title)}</b><p style="font-size:.9rem">${esc(u.summary||"")}</p>
    <div class="row"><span class="num">${esc(u.date||"")}</span>${u.url?`<a href="${esc(u.url)}" target="_blank" rel="noopener">${esc(u.source||"Source")}</a>`:""}${u.topic&&TOPIC[u.topic]?`<button class="link" data-go="${u.topic}">Related: ${esc(TOPIC[u.topic].title)}</button>`:""}</div></div>`).join("")}</div>`:"";}).join(""):`<div class="card"><p class="muted">No updates yet.</p></div>`}`;
}
function viewProfile(){
  const p = S.profile, swatches = ["#0A6CDF","#C2410C","#1E8A4C","#7A4BC4","#0E1621","#A2620A"];
  return `<div><span class="eyebrow">Profile</span><h2>Your profile</h2></div>
  ${activityCard()}
  <div class="card"><div class="row" style="gap:18px">${avatarHTML("lg")}<div style="display:grid;gap:8px">
    <span class="num">Avatar colour</span><div class="row">${swatches.map(c=>`<button aria-label="Colour ${c}" data-color="${c}" style="width:28px;height:28px;border-radius:50%;border:${p.color===c?"3px solid var(--ink)":"1px solid var(--line)"};background:${c};cursor:pointer"></button>`).join("")}</div>
    <label class="f">Upload a photo<input type="file" id="avFile" accept="image/*"></label><span class="num" id="avMsg">Any phone photo works: it is resized on your device first.</span>${(p.avatarId||p.avatarUrl||p.avatarData)?`<button class="link" id="avClear">Use initials instead</button>`:""}</div></div></div>
  <div class="card"><div class="row between"><h3>Details</h3><button class="btn ghost sm" id="prefill">Fill from my resume</button></div>
  <div class="form">${[["name","Full name"],["headline","Headline"],["location","Location"],["email","Email"],["phone","Phone"],["linkedin","LinkedIn URL"],["github","GitHub URL"],["education","Education"]].map(([k,l])=>`<label class="f">${l}<input type="text" id="pf-${k}" data-pf="${k}" value="${esc(p[k]||"")}"></label>`).join("")}</div>
  <label class="f">Experience (one line per role)<textarea id="pf-experience" data-pf="experience">${esc(p.experience||"")}</textarea></label>
  <label class="f">Certifications (one per line)<textarea id="pf-certs" data-pf="certs">${esc(p.certs||"")}</textarea></label>
  <span class="saved num">${saveLabel}</span></div>
  <div class="card"><h3>Targets</h3><div class="form"><label class="f">Company type you're aiming for<select id="pfCo">${COMPANIES.map(c=>`<option value="${c.id}" ${c.id===p.company?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label></div>
    <div class="grid2" style="gap:4px">${ROLES.map(r=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="tr-${r.id}" data-target="${r.id}" ${(p.targets||[]).includes(r.id)?"checked":""}> ${esc(r.name)}</label>`).join("")}</div></div>
  <div class="card"><h3>Skills you already have from work</h3><p class="muted" style="font-size:.9rem">Tick only what you've done in a job. These count at 70% toward role readiness.</p>
    <div class="grid3" style="gap:4px">${Object.entries(SKILLS).map(([k,l])=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="cl-${k}" data-claim="${k}" ${(p.claims||[]).includes(k)?"checked":""}> ${esc(l)}</label>`).join("")}</div></div>
  <div class="card"><h3>Certifications you hold</h3><div class="grid2" style="gap:4px">${CERTS.map(c=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="hv-${c.id}" data-certhave="${c.id}" ${(p.certsHave||[]).includes(c.id)?"checked":""}> ${esc(c.name)}</label>`).join("")}</div></div>`;
}
function viewVideos(){
  const all = Object.entries(S.videos.map).flatMap(([k,arr]) => arr.map((b,j)=>({k,b,j})));
  return `<div><span class="eyebrow">Video bookmarks</span><h2>Saved timestamps</h2></div>
  ${all.length?TOPICS.filter(t=>all.some(x=>x.k.startsWith(t.id+"."))).map(t=>`<div class="card"><h3>${esc(t.title)}</h3>${all.filter(x=>x.k.startsWith(t.id+".")).map(x=>{const si=+x.k.split(".")[1];return `<div class="bm"><span class="ts">${tsFmt(x.b.sec)}</span><a href="${esc(ytAt(x.b.url,x.b.sec))}" target="_blank" rel="noopener">${esc(x.b.label||t.subs[si].t)}</a><span class="num">${esc(t.subs[si].t)}</span></div>`;}).join("")}</div>`).join(""):`<div class="card"><p class="muted">No timestamps yet. On any topic page, use "Save a timestamp" under a sub-topic, or paste a video's chapters in "Watch & read" to let Claude find them.</p></div>`}`;
}

/* ================= JOBS & APPLICATIONS ================= */
const APP_STATUS = ["Applied","Screening","Interview","Offer","Rejected"];
function viewJobs(){
  const apps = S.network.apps||[];
  return `<div><span class="eyebrow">Jobs</span><h2>Jobs & applications</h2></div>
  <div class="grid4">${APP_STATUS.map(s=>`<div class="card tile"><span class="lbl">${s}</span><span class="big">${apps.filter(a=>a.status===s).length}</span></div>`).join("")}</div>
  <div class="card"><h3>Log an application</h3><div class="form">
    <label class="f">Company<input type="text" id="apCo"></label><label class="f">Role<input type="text" id="apRole"></label>
    <label class="f">Job link<input type="url" id="apUrl"></label><label class="f">Date applied<input type="date" id="apDate" value="${today()}"></label></div>
    <div><button class="btn" id="apAdd">Add application</button></div></div>
  ${apps.length?`<div class="card"><div class="tbl"><table><thead><tr><th>Company</th><th>Role</th><th>Applied</th><th>Status</th><th></th></tr></thead><tbody>
    ${apps.map((a,i)=>`<tr><td>${a.url?`<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.company)}</a>`:esc(a.company)}</td><td>${esc(a.role)}</td><td class="num">${esc(a.date)}</td><td><select data-apst="${i}" aria-label="Status">${APP_STATUS.map(s=>`<option ${a.status===s?"selected":""}>${s}</option>`).join("")}</select></td><td><button class="link" data-apdel="${i}">Remove</button></td></tr>`).join("")}</tbody></table></div></div>`:""}
  <div class="card"><h3>Copy-paste searches</h3>${['"privacy analyst" OR "data protection analyst" India','"GRC analyst" (fresher OR "0-2 years") Gurugram OR Noida OR Delhi','"compliance analyst" (DPDP OR GDPR OR "data privacy")','"compliance analyst" (FINRA OR SEC OR "Regulation S-P") India','"legal associate" (privacy OR "data protection" OR DPDP)','"third party risk" analyst India'].map(s=>`<div class="row between"><code style="font-family:var(--mono);font-size:.84rem;overflow-wrap:anywhere;flex:1;min-width:0">${esc(s)}</code><button class="btn ghost sm" data-copystr="${esc(s)}">Copy</button></div>`).join("")}</div>
  <div class="card"><h3>Weekly routine</h3><ul class="clean"><li>Monday: save 10 postings.</li><li>Tue–Thu: tailor your resume in the Resume builder and apply to 5–10.</li><li>Daily: 10 personalised connection requests.</li><li>Friday: follow up on applications older than 7 days.</li><li>Saturday: one portfolio piece or LinkedIn post.</li></ul></div>`;
}

/* ================= RESUME BUILDER ================= */
const RESUME_TEXT = `JYOTIRMAYA NEGI
Privacy & GRC Analyst | Advocate (Bar Council of Delhi) | DPDP • GDPR • ISO 27001
Ghaziabad, Uttar Pradesh | +91 XXXXX XXXXX | jyotirmayanegi1311@gmail.com | linkedin.com/in/your-custom-url | github.com/jyotirmayanegi

PROFESSIONAL SUMMARY
Law graduate and enrolled Advocate with hands-on US financial compliance experience (FCRA) in SOP compliance checks, file quality assurance and personal-data redaction. Trained in regulatory compliance (University of Pennsylvania) and cyber compliance (incident response, data mapping). Building practical skills in India's DPDP Act 2023 and DPDP Rules 2025, GDPR, ISO 27001 risk assessment and GRC tooling. Seeking Privacy Analyst, GRC Analyst or Compliance Analyst roles.

CORE SKILLS
Privacy & Regulation: DPDP Act 2023, DPDP Rules 2025, GDPR, CCPA, HIPAA (awareness), GLBA, FCRA, SEC Regulation S-P (awareness)
GRC: Risk Assessment, Risk Register, Control Testing, Audit Evidence, Policy Review, Vendor Risk, DPIA, Data Mapping, Gap Analysis
Frameworks: ISO/IEC 27001:2022, ISO 27701, NIST CSF 2.0, SOC 2 (awareness)
Tools: Microsoft Excel (XLOOKUP, Pivot Tables), Microsoft 365, Nitro PDF, ServiceNow IRM (PDI practice), GitHub
Legal: Legal Drafting, Contract Review, Data Processing Agreements, Regulatory Research

PROFESSIONAL EXPERIENCE
Legal Associate Specialist | Provana Pvt Ltd | Sep 2025 – May 2026
- Performed SOP compliance checks on US consumer credit files across NY, NJ, OK and Philadelphia jurisdictions under FCRA and client requirements.
- Conducted quality assurance reviews on [X] files per week, identifying documentation gaps before attorney filing.
- Drafted attorney case packets ensuring statutory and client SOP requirements were met.
- Redacted personally identifiable information (PII) from legal documents using Nitro PDF and Microsoft 365, supporting data protection obligations.

Immigration Executive (Legal Assistant) | Sprint Legal (Remote) | Jun 2026 – Present
- Managed immigration compliance documentation across multiple visa categories, verifying completeness against regulatory checklists.

PROJECTS
DPDP vs GDPR Compliance Mapping | GitHub
- Compared obligations of Data Fiduciaries (DPDP) and Controllers (GDPR) across consent, rights, breach notice and penalties; produced a gap-assessment checklist.
Risk Register & Control Matrix (ISO 27001) | Excel
- Built a 5x5 risk register with inherent/residual scoring for a sample SaaS company, mapped to Annex A controls.
Data Guard — PII Redaction Tool | GitHub
- Led legal requirements for a tool that detects and redacts personal data for privacy compliance.

EDUCATION
B.A. LL.B. | [University Name] | 2025

CERTIFICATIONS
Regulatory Compliance Certificate | University of Pennsylvania (Coursera)
Cyber Security / Cyber Compliance Certification | [Provider] | [Year]
In progress: ISC2 Certified in Cybersecurity (CC) | Target [Month 2027]

ADDITIONAL
Enrolled Advocate, Bar Council of Delhi (2025) | Languages: English, Hindi`;

const VERBS = ["achieved","analysed","analyzed","assessed","audited","automated","built","collaborated","completed","conducted","coordinated","created","defined","delivered","designed","developed","documented","drafted","drove","established","evaluated","executed","identified","implemented","improved","increased","led","maintained","managed","mapped","monitored","negotiated","organised","organized","performed","prepared","presented","produced","redacted","reduced","remediated","reviewed","researched","resolved","streamlined","supported","tested","tracked","trained","translated","verified","wrote","advised","compared","investigated","processed","handled","ensured"];
const WEAK = ["responsible for","worked on","helped","assisted with","duties included","involved in","various","etc"];
const HEADS = {summary:/^(professional summary|summary|profile|career objective|objective|about me)$/i, skills:/^(core skills|skills|technical skills|key skills|core competencies|competencies)$/i, exp:/^(professional experience|work experience|experience|employment history|employment|internships?)$/i, projects:/^(projects|academic projects|key projects|portfolio)$/i, education:/^(education|academic qualifications?|qualifications)$/i, certs:/^(certifications?|licenses? (and|&) certifications?|courses)$/i, other:/^(additional|additional information|achievements|awards|languages|interests|extra-curricular|activities)$/i};
const BULLET = /^\s*([-•*–▪●◦·]|\d+[.)])\s+/;
function parseResume(raw){
  const lines = raw.replace(/\r/g,"").split("\n").map(l=>l.replace(/\s+$/,""));
  const M = {name:"", title:"", contact:"", summary:"", skills:[], exp:[], projects:[], education:[], certs:[], other:[]};
  let sec = "head", headLines = [], cur = null;
  for (const lnRaw of lines) {
    const ln = lnRaw.trim(); if (!ln) continue;
    const bare = ln.replace(/[:\-–—_]+$/,"").trim();
    const hk = Object.keys(HEADS).find(k => HEADS[k].test(bare));
    if (hk) { sec = hk; cur = null; continue; }
    if (sec === "head") { headLines.push(ln); continue; }
    if (sec === "summary") { M.summary += (M.summary?" ":"") + ln.replace(BULLET,""); continue; }
    if (sec === "skills" || sec === "education" || sec === "certs" || sec === "other") { M[sec].push(ln.replace(BULLET,"")); continue; }
    if (sec === "exp" || sec === "projects") {
      if (BULLET.test(ln) && cur) cur.bullets.push(ln.replace(BULLET,""));
      else if (BULLET.test(ln) && !cur) { cur = {head:"", bullets:[ln.replace(BULLET,"")]}; M[sec].push(cur); }
      else if (cur && !cur.bullets.length && /\d{4}/.test(ln) && !/\d{4}/.test(cur.head)) cur.head += " | " + ln;
      else { cur = {head:ln, bullets:[]}; M[sec].push(cur); }
    }
  }
  const contactIdx = headLines.findIndex(l => /@|\+?\d[\d\s-]{8,}|linkedin/i.test(l));
  M.name = headLines[0] || "";
  M.contact = contactIdx > 0 ? headLines.slice(contactIdx).join(" | ") : "";
  M.title = headLines.slice(1, contactIdx > 0 ? contactIdx : headLines.length).join(" | ");
  return M;
}
function modelToText(M){
  const o = [];
  o.push((M.name||"").toUpperCase()); if (M.title) o.push(M.title); if (M.contact) o.push(M.contact);
  if (M.summary) o.push("", "PROFESSIONAL SUMMARY", M.summary);
  if (M.skills.length) o.push("", "CORE SKILLS", ...M.skills);
  if (M.exp.length) { o.push("", "PROFESSIONAL EXPERIENCE"); M.exp.forEach((e,i)=>{ if(i) o.push(""); if (e.head) o.push(e.head); e.bullets.forEach(b=>o.push("- "+b)); }); }
  if (M.projects.length) { o.push("", "PROJECTS"); M.projects.forEach(e=>{ if (e.head) o.push(e.head); e.bullets.forEach(b=>o.push("- "+b)); }); }
  if (M.education.length) o.push("", "EDUCATION", ...M.education);
  if (M.certs.length) o.push("", "CERTIFICATIONS", ...M.certs);
  if (M.other.length) o.push("", "ADDITIONAL", ...M.other);
  return o.join("\n");
}
function jdTerms(jd){
  const found = new Set(), low = jd.toLowerCase();
  Object.values(KW).flat().forEach(k => { if (k && low.includes(k.toLowerCase())) found.add(k); });
  const stop = new Set("The And For With You Your Our Will Are This That From Have Has Who What Must Should Able Strong Good Excellent Experience Role Team Work Including Job Description About Responsibilities Requirements Qualifications Skills Ability Knowledge Years Year India Remote Hybrid Location We They It In On Of To A An As Or By At Be Is If Key Preferred Required".split(" "));
  const counts = {};
  (jd.match(/\b[A-Z][A-Za-z0-9/&+.-]{1,}(?:\s+[A-Z][A-Za-z0-9/&+.-]{1,}){0,2}\b/g)||[]).forEach(w=>{ w=w.replace(/[.]+$/,""); if (stop.has(w.split(" ")[0])) return; counts[w]=(counts[w]||0)+1; });
  Object.entries(counts).filter(([w,c])=>c>=2 && w.length>2).sort((a,b)=>b[1]-a[1]).slice(0,12).forEach(([w])=>found.add(w));
  return [...found];
}
function hasTerm(text, k){ return new RegExp("(^|[^a-z0-9])" + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "($|[^a-z0-9])").test(text); }
function analyse(raw, jd, roleId){
  const M = parseResume(raw), text = raw.toLowerCase(), words = raw.split(/\s+/).filter(Boolean).length;
  const bullets = [...M.exp, ...M.projects].flatMap(e => e.bullets);
  const quant = bullets.filter(b => /\d|%|₹|\$|lakh|crore/i.test(b.replace(/\[[^\]]*\]/g,"")));
  const verbStart = bullets.filter(b => VERBS.includes(b.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g,"")));
  const weak = bullets.filter(b => WEAK.some(w => hasTerm(b.toLowerCase(), w)));
  const pron = (raw.match(/\b(I|me|my)\b/g)||[]).length;
  const placeholders = (raw.match(/\[[^\]]+\]/g)||[]).length;
  const fancy = (raw.match(/[★☆✓✔●◆■▶➤⭐📧📞🔗]/gu)||[]).length;
  const tabs = (raw.match(/\t/g)||[]).length;
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(raw), phone = /(\+?\d[\d\s-]{9,})/.test(raw) || /\+91/.test(raw), li = /linkedin\.com\/in\//i.test(raw);
  const dateStyles = new Set();
  if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/.test(raw)) dateStyles.add("Mon YYYY");
  if (/\b\d{1,2}\/\d{4}\b/.test(raw)) dateStyles.add("MM/YYYY");
  if (/\b\d{1,2}-\d{4}\b/.test(raw)) dateStyles.add("MM-YYYY");
  const R = ROLE[roleId], roleKw = [...new Set(Object.keys(R.need).flatMap(k => (KW[k]||[]).slice(0,2)))];
  const jdKw = jd.trim() ? jdTerms(jd) : [];
  const kwList = jdKw.length ? jdKw : roleKw;
  const kwHit = kwList.filter(k => hasTerm(text, k)), kwMiss = kwList.filter(k => !hasTerm(text, k));
  const secs = {summary:!!M.summary, skills:M.skills.length>0, experience:M.exp.length>0, education:M.education.length>0, projects:M.projects.length>0, certifications:M.certs.length>0};
  const parse = Math.round((Object.values(secs).filter(Boolean).length/6*60) + (email?14:0) + (phone?13:0) + (li?13:0) - Math.min(30, fancy*4 + tabs*2));
  const keywords = kwList.length ? Math.round(kwHit.length/kwList.length*100) : 0;
  const impact = bullets.length ? Math.round((quant.length/bullets.length)*60 + (verbStart.length/bullets.length)*40) : 0;
  const clarity = Math.max(0, 100 - weak.length*12 - pron*5 - (dateStyles.size>1?15:0) - (words>900?20:words<250?20:0) - placeholders*4);
  const parts = {parse:Math.max(0,Math.min(100,parse)), keywords, impact, clarity};
  const score = Math.round(parts.parse*0.3 + keywords*0.35 + impact*0.2 + clarity*0.15);
  const flags = [];
  if (!email || !phone) flags.push(["hi","Add both email and phone in the body text (not in a page header)."]);
  if (!li) flags.push(["md","Add your LinkedIn URL (linkedin.com/in/…)."]);
  ["summary","skills","experience","education"].forEach(k => { if (!secs[k]) flags.push(["hi",`Missing a "${k}" section with a standard heading.`]); });
  if (!secs.projects) flags.push(["md","Add a Projects section — for freshers it's often the strongest proof."]);
  if (fancy) flags.push(["hi",`${fancy} icon or symbol characters found. Parsers can garble these; use plain text.`]);
  if (tabs > 3) flags.push(["md","Tab characters suggest columns or tables. Use a single column."]);
  if (bullets.length && quant.length/bullets.length < 0.4) flags.push(["md",`Only ${quant.length} of ${bullets.length} bullets have a number. Add counts, volumes, time saved or percentages.`]);
  if (bullets.length && verbStart.length/bullets.length < 0.7) flags.push(["md",`${bullets.length-verbStart.length} bullets don't start with an action verb.`]);
  weak.forEach(b => flags.push(["md",`Weak phrasing: "${b.slice(0,80)}${b.length>80?"…":""}"`]));
  if (pron) flags.push(["md",`Remove first-person words (I, me, my): ${pron} found.`]);
  if (dateStyles.size > 1) flags.push(["md","Dates use more than one format. Pick one, e.g. 'Sep 2025 – May 2026'."]);
  if (placeholders) flags.push(["hi",`${placeholders} placeholder(s) like [X] still to fill.`]);
  if (words > 900) flags.push(["md",`${words} words. Trim to two pages (about 450–800 words at your level).`]);
  if (words < 250) flags.push(["md",`${words} words. Too thin; add bullets and projects.`]);
  if (kwMiss.length) flags.push(["hi",`Missing ${jdKw.length?"job-description":"role"} keywords: ${kwMiss.slice(0,10).join(", ")}. Add only those you genuinely have.`]);
  if (!flags.length) flags.push(["ok","No structural problems found."]);
  return {M, score, parts, metrics:{words, bullets:bullets.length, quant:quant.length, verbs:verbStart.length, weak:weak.length, sections:Object.values(secs).filter(Boolean).length}, kwHit, kwMiss, flags, usedJD: !!jdKw.length};
}
let RA = null;
function viewResume(){
  const r = S.resume, M = r.model;
  if (!RA && r.raw) RA = analyse(r.raw, r.jd||"", r.role||"privacy");
  return `<div><span class="eyebrow">Resume builder</span><h2>Paste, check, fix, export</h2></div>
  <p class="lede">Paste your current resume and, ideally, the job description. The checker reads it the way Workday, SuccessFactors, Taleo and Naukri do: plain text, top to bottom, matching keywords. Then edit it section by section and copy the clean ATS version.</p>
  <div class="card"><div class="grid2">
    <label class="f">Your resume (paste plain text)<textarea id="rsRaw" style="min-height:220px" placeholder="Paste the full text of your resume">${esc(r.raw)}</textarea></label>
    <label class="f">Job description (optional, gives the most accurate keyword match)<textarea id="rsJd" style="min-height:220px" placeholder="Paste the job posting">${esc(r.jd)}</textarea></label></div>
    <div class="row"><label class="f" style="min-width:240px">Target role<select id="rsRole">${ROLES.map(x=>`<option value="${x.id}" ${x.id===r.role?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
      <button class="btn" id="rsRun">Check my resume</button><button class="btn ghost" id="rsSample">Load my current draft</button><button class="btn ghost" id="rsBuild">Send to builder</button></div></div>
  ${RA?resumeReport(RA):""}
  ${M?resumeEditor(M):`<div class="card"><p class="muted">Run a check, then "Send to builder" to edit each section here.</p></div>`}
  <div class="card"><h3>ATS rules this checker applies</h3><div class="grid2"><ul class="clean"><li>One column, reverse-chronological; standard headings.</li><li>Contact details in the body, not the page header.</li><li><b>.docx for Naukri</b>; text-based PDF elsewhere.</li><li>Use the job's exact words ("ISO/IEC 27001", not "ISO27k").</li></ul>
    <ul class="clean"><li>Spot the system from the apply link: myworkdayjobs.com = Workday, successfactors.com = SAP SuccessFactors, taleo.net = Oracle Taleo, boards.greenhouse.io = Greenhouse, jobs.lever.co = Lever.</li><li>No Canva/two-column templates, tables, icons or photos.</li><li>Bullet formula: action verb + what + law/tool + result.</li></ul></div></div>`;
}
function resumeReport(A){
  const P = A.parts, m = A.metrics;
  return `<div class="card"><div class="score">${ring(A.score, A.score>=75?"":"acc")}<div style="display:grid;gap:4px"><h3>ATS score ${A.score}/100</h3><span class="muted" style="font-size:.9rem">${A.score>=80?"Strong. Tailor keywords per job.":A.score>=60?"Decent. Fix the red items below.":"Needs work before you apply."} Keywords checked against ${A.usedJD?"the job description":"your target role"}.</span></div></div>
    <div class="grid4">${[["Parsing & structure",P.parse,"30%"],["Keyword match",P.keywords,"35%"],["Impact (numbers, verbs)",P.impact,"20%"],["Clarity",P.clarity,"15%"]].map(([l,v,w])=>`<div class="inset tile"><span class="lbl">${l} <span class="num">· ${w}</span></span><span class="big">${v}</span>${bar(v,v>=70?"":"acc")}</div>`).join("")}</div>
    <div class="grid4">${[["Words",m.words],["Sections found",m.sections+"/6"],["Bullets",m.bullets],["With numbers",m.quant],["Start with a verb",m.verbs],["Weak phrases",m.weak]].map(([l,v])=>`<div class="inset tile"><span class="lbl">${l}</span><span class="big" style="font-size:1.3rem">${v}</span></div>`).join("")}</div>
    <div class="grid2"><div><b style="font-size:.9rem">Keywords found</b><div class="kw" style="margin-top:6px">${A.kwHit.map(k=>`<span class="pill ok">${esc(k)}</span>`).join("")||'<span class="muted">None</span>'}</div></div>
      <div><b style="font-size:.9rem">Keywords missing</b><div class="kw" style="margin-top:6px">${A.kwMiss.map(k=>`<span class="pill bad">${esc(k)}</span>`).join("")||'<span class="muted">None</span>'}</div></div></div>
    <div style="display:grid;gap:6px"><b style="font-size:.9rem">Fix list</b>${A.flags.map(([s,t])=>`<div class="flag"><b class="sev ${s}">${s==="hi"?"Fix":s==="md"?"Improve":"Good"}</b><span>${esc(t)}</span></div>`).join("")}</div></div>`;
}
function resumeEditor(M){
  const entry = (sec, e, i) => `<div class="entry"><label class="f">Heading (Title | Company | Dates)<input type="text" id="re-${sec}-${i}-h" data-rmh="${sec}|${i}" value="${esc(e.head)}"></label>
    <label class="f">Bullets (one per line)<textarea id="re-${sec}-${i}-b" data-rmb="${sec}|${i}" style="min-height:${60+e.bullets.length*22}px">${esc(e.bullets.join("\n"))}</textarea></label>
    <div class="row"><button class="btn sm ghost" data-rmai="${sec}|${i}">Improve these bullets with Claude</button><button class="link" data-rmdel="${sec}|${i}">Remove entry</button></div><div class="ai" id="rai-${sec}-${i}" hidden></div></div>`;
  return `<div class="card"><div class="row between"><h3>Builder</h3><span class="saved num">${saveLabel}</span></div>
    <div class="form"><label class="f">Name<input type="text" id="rm-name" data-rm="name" value="${esc(M.name)}"></label><label class="f">Target title line<input type="text" id="rm-title" data-rm="title" value="${esc(M.title)}"></label></div>
    <label class="f">Contact line (city | phone | email | LinkedIn | GitHub)<input type="text" id="rm-contact" data-rm="contact" value="${esc(M.contact)}"></label>
    <label class="f">Professional summary<textarea id="rm-summary" data-rm="summary">${esc(M.summary)}</textarea></label>
    <label class="f">Skills (one group per line)<textarea id="rm-skills" data-rml="skills" style="min-height:120px">${esc(M.skills.join("\n"))}</textarea></label>
    <div class="row"><button class="btn sm ghost" id="rmTailor">Tailor summary & skills to the job description with Claude</button></div><div class="ai" id="rmTailorOut" hidden></div>
    <b>Experience</b>${M.exp.map((e,i)=>entry("exp",e,i)).join("")}<div><button class="btn sm ghost" data-rmadd="exp">+ Add experience</button></div>
    <b>Projects</b>${M.projects.map((e,i)=>entry("projects",e,i)).join("")}<div><button class="btn sm ghost" data-rmadd="projects">+ Add project</button></div>
    <div class="grid2"><label class="f">Education (one per line)<textarea id="rm-education" data-rml="education">${esc(M.education.join("\n"))}</textarea></label>
    <label class="f">Certifications (one per line)<textarea id="rm-certs" data-rml="certs">${esc(M.certs.join("\n"))}</textarea></label></div>
    <label class="f">Additional (one per line)<textarea id="rm-other" data-rml="other">${esc(M.other.join("\n"))}</textarea></label></div>
  <div class="card"><div class="row between"><h3>ATS-ready output</h3><div class="row"><button class="btn sm ghost" id="rmRecheck">Re-check this version</button><button class="btn sm" data-copyid="rmOut">Copy text</button></div></div>
    <p class="muted" style="font-size:.9rem">Paste into a blank Word document, set one font (Calibri or Arial, 10.5–11pt), save as .docx for Naukri and as PDF for other portals.</p>
    <pre class="doc" id="rmOut">${esc(modelToText(M))}</pre></div>`;
}
const LI_HEAD = ["Privacy & GRC Analyst | Advocate | DPDP Act • GDPR • ISO 27001 | US Financial Compliance (FCRA, GLBA) | Turning law into controls","Data Privacy & Compliance | Law Graduate & Advocate | DPDP • GDPR • CCPA • ISO 27001 | Risk & Audit","Aspiring Privacy Counsel & GRC Analyst | DPDP Act 2023 | ISO 27001 | Regulatory Compliance | Bar Council of Delhi"];
const LI_ABOUT = `I'm a law graduate and enrolled Advocate moving into data privacy and GRC, where reading the law carefully meets making sure a company actually follows it.

At Provana I worked on US consumer credit files under FCRA and client requirements: SOP compliance checks, file quality reviews, attorney case packets and redaction of personal data. That work taught me that compliance is evidence, not intention: every requirement needs a control, and every control needs proof.

Now I'm building that into a privacy and GRC skill set:
• India's DPDP Act 2023 and DPDP Rules 2025, GDPR, CCPA, HIPAA, GLBA and SEC/FINRA privacy rules
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
  <div class="card"><h3>4 · Pin these top 5 skills</h3><div class="row">${["Data Privacy","DPDP Act 2023","GDPR","ISO/IEC 27001","Regulatory Compliance"].map(s=>`<span class="pill hot">${s}</span>`).join("")}</div><p class="muted" style="font-size:.9rem">Then add: Risk Assessment, GRC, Data Protection, CCPA, FCRA, GLBA, Policy Review, Third-Party Risk Management, Microsoft Excel, ServiceNow, Incident Response, Data Mapping.</p></div></div>
  <div class="card"><h3>5 · Experience, Featured, Licenses</h3><ul class="clean"><li>Use the Resume builder's Provana bullets; add skills to each role.</li><li>Featured: DPDP vs GDPR table, risk register, one post.</li><li>Licenses & certifications: list what you hold and "in progress" ones from the Certifications page.</li></ul></div>
  <div class="card"><h3>6 · Grow your network</h3><p>Use the <button class="link" data-go="network">Network page</button> to find people, prepare notes and track follow-ups.</p></div>`;
}

/* ================= ROUTER ================= */
const VIEWS = {home:viewHome, insights:viewInsights, lab:viewLabOS, "lab-map":viewLab, projects:viewProjects, learn:viewLearn2, path:viewPath, matrix:viewMatrix, roles:viewRoles, jd:viewJD, cover:viewCover, certs:viewCerts, network:viewNetwork, updates:viewUpdates, news:viewNews, applications:viewApplications, profile:viewProfile, videos:viewVideos, resume:viewResume2, linkedin:viewLinkedIn, jobs:viewJobs, support:viewSupport, mentors:viewMentors, ideas:viewIdeas, automation:viewAutomation, pricing:viewPricing, admin:viewAdmin};
function resolve(k){ if (VIEWS[k] || TOPIC[k]) return k; if (/^cert-/.test(k) && CERT[k.slice(5)]) return k; if (/^proj-/.test(k) && PROJ[k.slice(5)]) return k; if (/^lab-/.test(k) && MISSION[k.slice(4)]) return k; if (/^role-/.test(k) && ROLE[k.slice(5)] && pathOf(k.slice(5))) return k; return null; }
try { const h = resolve(location.hash.replace("#","")); if (h) current = h; } catch(e) {}
function whereLabel(){ if (current === "lab-map") return TITLES["lab-map"]; if (TOPIC[current]) return "Learning path · " + TOPIC[current].title; if (/^cert-/.test(current)) return "Certifications · " + CERT[current.slice(5)].name; if (/^proj-/.test(current)) return "Projects · " + PROJ[current.slice(5)].title; if (/^lab-/.test(current) && MISSION[current.slice(4)]) return "Cyber Lab · " + MISSION[current.slice(4)].title; if (/^role-/.test(current)) return "Role · " + roleShort(current.slice(5)); return TITLES[current] || "Dashboard"; }
function navKeyOf(c){ return TOPIC[c] ? "learn" : /^cert-/.test(c) ? "certs" : /^proj-/.test(c) ? "projects" : /^lab-/.test(c) ? "lab" : /^role-/.test(c) ? "roles" : c; }
function navItems(navKey){ const paid = hasAccess(); return navSearchHTML() + MENU.map(([g,items])=>`<div class="grp"><span>${g}</span>${items.filter(([k])=>k!=="admin"||ACCESS.owner).map(([k,l,c,ic])=>{ const lock = !paid && ACCESS.ready && !isFreeRoute(k) && k!=="admin"; return `<button class="item ${lock?"locked":""}" data-go="${k}" ${k===navKey?'aria-current="page"':''}><i style="background:${c}">${ic}</i>${l}${lock?'<span class="lk" aria-label="locked">🔒</span>':''}</button>`; }).join("")}</div>`).join(""); }
function renderHeader(){
  const navKey = navKeyOf(current), xp = totalXP(), lvl = levelOf(xp);
  document.getElementById("hdr").innerHTML = `<div class="wrap"><div class="bar-top glass">
    <div class="row" style="gap:12px;min-width:0;flex-wrap:nowrap"><h1 data-go="home">Career Count</h1><span class="where">${esc(whereLabel())}</span></div>
    <div class="row" style="flex-wrap:nowrap">${focusButton("hdr")}${hasAccess()?`<button class="xpchip" data-go="insights" title="Level ${lvl.lvl} · ${xp} XP">Lv ${lvl.lvl} · ${xp} XP</button>`:(ACCESS.ready?`<button class="unlockchip" data-paynow="1">Unlock · ${inr(priceNow())}</button>`:"")}<button class="menubtn" id="menuBtn" aria-haspopup="dialog" aria-expanded="${menuOpen}">${avatarHTML()}<span class="burger" aria-hidden="true"><b></b><b></b><b></b></span><span>Menu</span></button><button class="avbtn" data-go="profile" aria-label="Profile">${avatarHTML()}</button></div></div></div>
    ${menuOpen?`<div class="scrim" id="scrim"></div><nav class="sheet glass" role="dialog" aria-label="Menu">
      <button class="sheetme" data-go="profile" aria-label="Open your profile">${avatarHTML()}<div><b>${esc(S.profile.name||"Jyotirmaya Negi")}</b><div class="num">Level ${lvl.lvl} · ${groupStats(TOPICS).p}% of the learning path</div></div><span class="sheetme-go">Profile ›</span></button>
      ${focusButton("side")}${navItems(navKey)}</nav>`:""}`;
  const side = document.getElementById("side");
  if (side) side.innerHTML = `<div class="side glass"><button class="brand" data-go="home"><span class="logo">CC</span><span><b>Career Count</b><span class="num">Privacy · GRC · Cyber</span></span></button>
    <div class="me">${avatarHTML()}<div style="min-width:0"><b>${esc((S.profile.name||"Jyotirmaya Negi").split(" ")[0])}</b><div class="num">Level ${lvl.lvl} · ${xp} XP</div>${bar(lvl.pct,"acc")}</div></div>${focusButton("side")}${navItems(navKey)}</div>`;
  const tabs = document.getElementById("tabs");
  if (tabs) tabs.innerHTML = TABS.map(([k,l,ic])=>`<button data-go="${k}" ${k===navKey?'aria-current="page"':''}><i>${ic}</i><span>${l}</span></button>`).join("") + `<button id="moreBtn" aria-haspopup="dialog" ${!TABS.some(x=>x[0]===navKey)?'aria-current="page"':''}><i>☰</i><span>More</span></button>`;
}
function render(){
  renderHeader();
  const gate = gateView(current);
  let v;
  try { v = gate != null ? gate : TOPIC[current] ? viewTopic(TOPIC[current]) : /^cert-/.test(current) ? viewCert(CERT[current.slice(5)]) : /^proj-/.test(current) ? viewProject(PROJ[current.slice(5)]) : (/^lab-/.test(current) && MISSION[current.slice(4)]) ? viewMission(MISSION[current.slice(4)]) : /^role-/.test(current) ? viewRole(current.slice(5)) : (VIEWS[current]||viewHome)(); }
  catch(e) { console.error('Page failed to render:', current, e); v = `<div class="card"><span class="eyebrow">Could not open this page</span><h3>${esc(String(e && e.message || e))}</h3><p class="muted">Page: ${esc(String(current))}. Send this message to Claude so it can be fixed.</p><div class="row"><button class="btn" data-go="learn">Back to Learn</button><button class="btn ghost" data-go="projects">Projects</button></div></div>`; }
  document.getElementById("main").innerHTML = `<div class="view">${ACCESS.owner && ACCESS.previewFree ? `<div class="previewbar"><span>👁 Previewing as a free visitor</span><button class="btn sm" data-adexit="1">Exit preview</button></div>` : ""}${v}</div>`;
  if (gate == null && /^lab-/.test(current) && MISSION[current.slice(4)]) labAfterRender();
  if (gate == null && current === "lab") losMount();
}
function go(k, anchor){
  menuOpen = false; current = resolve(k) || "home";
  try { history.replaceState(null, "", "#" + current); } catch(e) {}
  try { if (TOPIC[current] && hasAccess()) { const v = (S.progress.viewed ||= {}); if (v.d !== today()) { v.d = today(); v.ids = []; } if (!v.ids.includes(current)) { v.ids.push(current); logActivity(1); save("progress"); } } } catch(e) {}
  render();
  if (anchor) { const el = document.getElementById(anchor); if (el) { el.scrollIntoView({behavior:"smooth", block:"start"}); return; } }
  window.scrollTo(0,0);
}

/* ================= CLAUDE (sample) ================= */
let aiCtl = null;
function topicContext(t){ return `Topic: ${t.title}\nObjective: ${t.obj}\nSub-topics:\n${t.subs.map(s=>"- "+s.t+": "+s.b).join("\n")}`.slice(0,6000); }
const ASK = {
  simple:"Explain this topic again in very plain English for a law graduate with no tech background. Use one legal analogy. Under 220 words.",
  india:"Give one realistic Indian workplace example (company type, what happens, which rule applies, what the compliance team does). Under 220 words.",
  interview:"Ask me 3 interview questions an Indian employer might ask on this topic for an entry-level role, each followed by a model answer in 2–3 sentences.",
  exam:"Write 4 exam-style multiple-choice questions on this topic in the style of the certifications it maps to, each with the answer and a one-line explanation.",
  deeper:"Go one level deeper than the sub-topics listed: what would a working analyst need to know next? Short headed sections, plain words, under 300 words."
};
function aiErr(e){ return ["not_granted","sampling_disabled","capability_disabled","not_declared"].includes(e.code) ? "Claude isn't allowed for this page right now. You can allow it from the artifact's permissions menu." : e.code==="rate_limited" ? "Too many questions at once. Try again in a minute." : e.code==="cancelled" ? "" : "The answer was interrupted. Try again."; }
async function stream(prompt, out, opts={}){
  out.hidden = false;
  if (!hasAccess() && current !== "support") { out.innerHTML = `<div class="note">🔒 The AI tutor is part of full access. <button class="link" data-paynow="1">Unlock it</button></div>`; openPaywall("ai"); return null; }
  if (!cap.sample) { out.textContent = "Asking Claude isn't available in this view. Open Career Count on claude.ai to use it."; return null; }
  out.textContent = "Thinking…";
  try { const r = await cap.sample(prompt, Object.assign({onText:({text})=>{ out.textContent = text; }}, opts)); return r.text; }
  catch(e) { out.textContent = (e.text ? e.text + "\n\n" : "") + aiErr(e); return null; }
}
async function ask(tid, kind){
  const out = document.getElementById("aiOut"), t = TOPIC[tid];
  let instr = ASK[kind];
  if (kind === "free") { const q = (document.getElementById("askQ")||{}).value||""; if (!q.trim()) { out.textContent = "Type a question first."; return; } instr = "Answer this learner's question in plain English (under 250 words): " + q; }
  if (kind === "exam") instr += " Certifications: " + certsForTopic(tid).map(c=>c.name).join(", ");
  aiCtl?.abort(); aiCtl = new AbortController();
  const stop = document.getElementById("askStop"); if (stop) { stop.hidden = false; stop.onclick = () => aiCtl.abort(); }
  await stream(`You are tutoring Jyotirmaya, a law graduate moving into privacy and GRC in India. Plain text only, no markdown symbols.\n\n${topicContext(t)}\n\nTask: ${instr}`, out, Object.assign({signal:aiCtl.signal}, kind==="free"?{cache:false}:{}));
  if (stop) stop.hidden = true;
}
function roleAsk(rid){
  const r = ROLE[rid], out = document.getElementById("ra-"+rid);
  const have = Object.keys(SKILLS).filter(k=>skillLevel(k)>=50).map(k=>SKILLS[k]).join(", ") || "none yet";
  stream(`A law graduate in India targets the role "${r.name}". Skills already at a working level: ${have}. List up to 5 additional skills, tools or certifications this role commonly asks for in India that are NOT in that list, each with one line on why and one free way to start. Plain text, no markdown. Say this is general knowledge, not live job data.`, out);
}
function certAsk(cid){
  const c = CERT[cid], out = document.getElementById("ca-"+cid);
  const status = c.domains.map(([d,ids])=>`${d}: ${domainReady(ids)}% covered`).join("; ");
  stream(`Make a 4-week study plan for ${c.name} for a law graduate in India with no tech background. Current coverage by exam area: ${status}. Spend more time on weaker areas. Week by week, 5–6 short lines each, with free resources by name (no links). End with 3 exam-day tips. Plain text, no markdown. Tell the learner to confirm the current exam outline on the official page.`, out);
}
async function findTimestamps(tid){
  const t = TOPIC[tid], url = document.getElementById("tfUrl").value.trim(), text = document.getElementById("tfText").value.trim(), msg = document.getElementById("tfMsg"), out = document.getElementById("tfOut");
  if (!/youtube\.com|youtu\.be/.test(url)) { msg.textContent = "Paste a YouTube link first."; return; }
  if (text.length < 20) { msg.textContent = "Paste the video's chapter list or transcript with times."; return; }
  if (!cap.sample) { msg.textContent = "Claude isn't available in this view. Add timestamps by hand under each sub-topic."; return; }
  msg.textContent = "Matching sub-topics to the video…"; out.innerHTML = "";
  try {
    const res = await cap.sample.json(`Below is a YouTube video's chapter list or transcript with timestamps, and a numbered list of sub-topics. For each sub-topic the video clearly covers, return the timestamp where that coverage starts, using ONLY times that appear in the text. Skip sub-topics the video doesn't cover. Reply with only a JSON array of {"i": sub-topic number, "time": "m:ss" or "h:mm:ss", "label": short description}.\n\nSUB-TOPICS:\n${t.subs.map((s,i)=>i+". "+s.t).join("\n")}\n\nVIDEO TEXT:\n${text.slice(0,60000)}`, {modelTier:"quick"});
    const rows = (Array.isArray(res)?res:[]).map(r=>({i:+r.i, sec:tsParse(r.time), label:String(r.label||"")})).filter(r=>t.subs[r.i] && r.sec!==null);
    if (!rows.length) { msg.textContent = "The video doesn't seem to cover these sub-topics."; return; }
    msg.textContent = `Found ${rows.length} match${rows.length>1?"es":""}. Check them, then save.`;
    out.innerHTML = rows.map(r=>`<div class="bm"><span class="ts">${tsFmt(r.sec)}</span><a href="${esc(ytAt(url,r.sec))}" target="_blank" rel="noopener">${esc(t.subs[r.i].t)}</a><span class="num">${esc(r.label)}</span></div>`).join("") + `<div><button class="btn sm" id="tfSave">Save all as bookmarks</button></div>`;
    document.getElementById("tfSave").onclick = () => { rows.forEach(r => { const k=key(t.id,r.i); (S.videos.map[k] ||= []).push({url, sec:r.sec, label:r.label}); }); save("videos"); go(t.id,"p-ideas"); };
  } catch(e) { msg.textContent = e.code==="invalid_json" ? "Couldn't read the result. Try a cleaner chapter list." : aiErr(e) || "Stopped."; }
}
async function improveBullets(sec, i){
  const e = S.resume.model[sec][i], out = document.getElementById(`rai-${sec}-${i}`);
  out.hidden = false;
  if (!cap.sample) { out.textContent = "Claude isn't available in this view."; return; }
  out.textContent = "Rewriting…";
  try {
    const res = await cap.sample.json(`Rewrite these resume bullets for an ATS-friendly resume targeting "${ROLE[S.resume.role].name}" roles in India. Rules: start each with a strong past-tense action verb; formula = verb + what + law/framework/tool + result; keep every fact true to the original; never invent numbers — where a number would help, insert a placeholder like [X files/week]; under 30 words each; no first person. Reply with only a JSON array of strings.\n\nEntry: ${e.head}\nBullets:\n${e.bullets.map(b=>"- "+b).join("\n")}`);
    const arr = (Array.isArray(res)?res:[]).map(String).filter(Boolean);
    if (!arr.length) { out.textContent = "No suggestions came back. Try again."; return; }
    out.innerHTML = `<b>Suggested bullets</b>\n${arr.map(b=>"- "+esc(b)).join("\n")}\n\n<button class="btn sm" id="use-${sec}-${i}">Use these</button>`;
    document.getElementById(`use-${sec}-${i}`).onclick = () => { S.resume.model[sec][i].bullets = arr; save("resume"); rerender(); };
  } catch(err) { out.textContent = err.code==="invalid_json" ? "Couldn't read the suggestions. Try again." : aiErr(err); }
}
async function tailor(){
  const out = document.getElementById("rmTailorOut"), M = S.resume.model, jd = S.resume.jd || "";
  out.hidden = false;
  if (!jd.trim()) { out.textContent = "Paste a job description in the box at the top first."; return; }
  if (!cap.sample) { out.textContent = "Claude isn't available in this view."; return; }
  out.textContent = "Tailoring…";
  try {
    const res = await cap.sample.json(`Tailor this resume's summary and skills to the job description. Rules: use the job's exact keyword spellings where the candidate genuinely has the skill (judge only from the resume text); never add skills, tools or certifications the resume doesn't support; summary 3–4 sentences, no first person; skills as 4–6 grouped lines like "Privacy & Regulation: A, B, C". Reply with only JSON {"summary": string, "skills": [string], "missing": [string]} where missing = important job keywords the resume can't honestly claim.\n\nRESUME:\n${modelToText(M).slice(0,8000)}\n\nJOB DESCRIPTION:\n${jd.slice(0,8000)}`);
    if (!res || !res.summary) { out.textContent = "No suggestion came back. Try again."; return; }
    out.innerHTML = `<b>Suggested summary</b>\n${esc(res.summary)}\n\n<b>Suggested skills</b>\n${(res.skills||[]).map(esc).join("\n")}${(res.missing||[]).length?`\n\n<b>Job keywords you can't claim yet</b> (learn these): ${(res.missing).map(esc).join(", ")}`:""}\n\n<button class="btn sm" id="useTailor">Use these</button>`;
    document.getElementById("useTailor").onclick = () => { M.summary = String(res.summary); M.skills = (res.skills||[]).map(String); save("resume"); rerender(); };
  } catch(e) { out.textContent = e.code==="invalid_json" ? "Couldn't read the suggestion. Try again." : aiErr(e); }
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
    const m = {needs_reauth:"Reconnect Gmail in claude.ai Settings → Connectors.", server_not_connected:"Add the Gmail connector in claude.ai Settings → Connectors.", not_in_manifest:"Gmail is turned off for this page.", approval_required:"Creating a draft needs your approval. Click again and allow it.", blocked_by_policy:"Your organisation blocks this Gmail action.", tool_error:"Gmail refused the draft. Check the email address."};
    msg.textContent = m[e.code] || "The draft may not have been created. Check your Gmail Drafts before trying again.";
  }
}

/* ================= EVENTS ================= */
let pop = null;
function closePop(){ if (pop) { pop.remove(); pop = null; } }
function rerender(){ const y = scrollY; render(); scrollTo(0,y); }
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-go],[data-depth],[data-track],[data-reveal],[data-quiz],[data-quizreset],[data-ask],[data-bmform],[data-bmdel],[data-heat],[data-color],[data-copyid],[data-copyhead],[data-copystr],[data-copynote],[data-gmail],[data-netdel],[data-netf],[data-roleask],[data-certask],[data-extradel],[data-anchor],[data-apdel],[data-rmai],[data-rmdel],[data-rmadd],.term,#menuBtn,#moreBtn,#scrim,[data-lgroup],#tfGo,#ncAdd,#prefill,#avClear,#extraAdd,#updRefresh,#apAdd,#rsRun,#rsSample,#rsBuild,#rmTailor,#rmRecheck");
  if (!e.target.closest(".term")) closePop();
  if (!el) return;
  const d = el.dataset;
  if (d.lgroup) { learnGroup = d.lgroup; render(); return; }
  if (el.id === "menuBtn" || el.id === "moreBtn") { menuOpen = !menuOpen; renderHeader(); if (menuOpen) document.querySelector(".sheet button.item")?.focus(); return; }
  if (el.id === "scrim") { menuOpen = false; renderHeader(); return; }
  if (el.classList.contains("term")) { closePop(); pop = document.createElement("div"); pop.className = "pop"; pop.textContent = d.def; document.body.appendChild(pop); const r = el.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 316)) + "px"; pop.style.top = (window.scrollY + r.bottom + 6) + "px"; return; }
  if (d.go) { e.preventDefault(); go(d.go, d.anchor); return; }
  if (d.anchor) { e.preventDefault(); const t = document.getElementById(d.anchor); if (t) t.scrollIntoView({behavior:"smooth", block:"start"}); return; }
  if (d.depth) { depth = +d.depth; try { localStorage.setItem(LS("depth"), depth); } catch(_) {} rerender(); return; }
  if (d.track) { track = d.track; render(); return; }
  if (d.reveal) { const t = TOPIC[current], i = +d.reveal; const tmp = depth; depth = 3; const html = subHTML(t, t.subs[i], i); depth = tmp; document.getElementById("s-"+i).outerHTML = html; return; }
  if (d.quiz) { const [tid,qi,oi] = d.quiz.split("|"); const firstTry = (S.progress.quiz[tid]||{})[qi] === undefined; (S.progress.quiz[tid] ||= {})[qi] = +oi; if (firstTry) logActivity(1); if (S.progress.doneAt[tid] && Object.keys(S.progress.quiz[tid]).length===TOPIC[tid].quiz.length) S.progress.reviewed[tid] = today(); save("progress"); rerender(); return; }
  if (d.quizreset) { delete S.progress.quiz[d.quizreset]; save("progress"); rerender(); return; }
  if (d.ask) { const [tid,k] = d.ask.split("|"); ask(tid,k); return; }
  if (d.roleask) { roleAsk(d.roleask); return; }
  if (d.certask) { certAsk(d.certask); return; }
  if (d.bmform) { const k = d.bmform, s = k.replace(".","_"), box = document.getElementById("bmf-"+s); box.hidden = !box.hidden;
    box.innerHTML = `<div class="form"><label class="f">YouTube link<input type="url" id="bu-${s}" placeholder="https://www.youtube.com/watch?v=..."></label><label class="f">Starts at (m:ss)<input type="text" id="bt-${s}" placeholder="4:35"></label><label class="f">Label (optional)<input type="text" id="bl-${s}"></label></div><div class="row"><button class="btn sm" id="bs-${s}">Save</button><span class="num" id="bm-msg-${s}"></span></div>`;
    document.getElementById("bs-"+s).onclick = () => { const url = document.getElementById("bu-"+s).value.trim(), sec = tsParse(document.getElementById("bt-"+s).value), label = document.getElementById("bl-"+s).value.trim();
      if (!/^https?:\/\//.test(url) || sec===null) { document.getElementById("bm-msg-"+s).textContent = "Add a link and a time like 4:35."; return; }
      (S.videos.map[k] ||= []).push({url, sec, label}); save("videos"); rerender(); };
    return; }
  if (d.bmdel) { const [k,j] = d.bmdel.split("|"); S.videos.map[k].splice(+j,1); if (!S.videos.map[k].length) delete S.videos.map[k]; save("videos"); rerender(); return; }
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
  if (d.apdel) { S.network.apps.splice(+d.apdel,1); save("network"); render(); return; }
  if (d.rmai) { const [sec,i] = d.rmai.split("|"); improveBullets(sec,+i); return; }
  if (d.rmdel) { const [sec,i] = d.rmdel.split("|"); S.resume.model[sec].splice(+i,1); save("resume"); rerender(); return; }
  if (d.rmadd) { S.resume.model[d.rmadd].push({head:"", bullets:[]}); save("resume"); rerender(); return; }
  if (el.id === "tfGo") { findTimestamps(d.tid); return; }
  if (el.id === "ncAdd") { const v = id => document.getElementById(id).value.trim(); if (!v("ncName")) { document.getElementById("ncName").focus(); return; }
    S.network.contacts.unshift({name:v("ncName"), role:v("ncRole"), company:v("ncCo"), li:/^https?:\/\//.test(v("ncLi"))?v("ncLi"):"", email:v("ncEmail"), phone:v("ncPhone"), stage:"To connect", tpl:"pro", follow:"", notes:"", added:today()}); save("network"); logActivity(1); save("progress"); netFilter = "All"; render(); return; }
  if (el.id === "apAdd") { const v = id => document.getElementById(id).value.trim(); if (!v("apCo")) { document.getElementById("apCo").focus(); return; }
    (S.network.apps ||= []).unshift({company:v("apCo"), role:v("apRole"), url:/^https?:\/\//.test(v("apUrl"))?v("apUrl"):"", date:v("apDate")||today(), status:"Applied"}); save("network"); render(); return; }
  if (el.id === "prefill") { Object.assign(S.profile, {name:S.profile.name||"Jyotirmaya Negi", headline:S.profile.headline||"Privacy & GRC Analyst | Advocate | DPDP • GDPR • ISO 27001", location:S.profile.location||"Ghaziabad, Uttar Pradesh", email:S.profile.email||"jyotirmayanegi1311@gmail.com", github:S.profile.github||"https://github.com/jyotirmayanegi", education:S.profile.education||"B.A. LL.B. (2025); Advocate, Bar Council of Delhi",
      experience:S.profile.experience||"Legal Associate Specialist, Provana Pvt Ltd (Sep 2025 – May 2026)\nImmigration Executive (Legal Assistant), Sprint Legal (Jun 2026 – present)",
      certs:S.profile.certs||"Regulatory Compliance — University of Pennsylvania\nCyber security / cyber compliance certification\nICSI (Company Secretary) — level taken"});
    S.profile.claims = Array.from(new Set([...(S.profile.claims||[]), "usconsumer","drafting"])); save("profile"); render(); return; }
  if (el.id === "avClear") { S.profile.avatarId = ""; S.profile.avatarUrl = ""; S.profile.avatarData = ""; save("profile"); render(); return; }
  if (el.id === "extraAdd") { const v = document.getElementById("extraIn").value.trim(); if (v) { (S.profile.extra ||= []).push(v); save("profile"); render(); } return; }
  if (el.id === "updRefresh") { el.textContent = "Refreshing…"; loadUpdates().then(()=>{ if (current==="updates") render(); }); return; }
  if (el.id === "rsSample") { S.resume.raw = RESUME_TEXT; S.resume.fileMeta = null; S.resume.review = null; RA = null; save("resume"); render(); return; }
  if (el.id === "rsRun") { if (!S.resume.raw.trim()) { document.getElementById("rsRaw").focus(); return; } S.resume.fileMeta = null; S.resume.role = (S.resume.role && ROLE[S.resume.role]) ? S.resume.role : (focusRole() || "privacy"); RA = analyse(S.resume.raw, S.resume.jd||"", S.resume.role); S.resume.last = {score:RA.score, date:today()}; save("resume"); rerender(); return; }
  if (el.id === "rsBuild") { if (!S.resume.raw.trim()) { document.getElementById("rsRaw").focus(); return; } S.resume.model = parseResume(S.resume.raw); save("resume"); render(); document.querySelector(".entry")?.scrollIntoView({block:"center"}); return; }
  if (el.id === "rmTailor") { tailor(); return; }
  if (el.id === "rmRecheck") { RA = analyse(modelToText(S.resume.model), S.resume.jd||"", S.resume.role); S.resume.last = {score:RA.score, date:today()}; save("resume"); render(); scrollTo(0,0); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("tcard")) go(e.target.dataset.go); if (e.key === "Escape") { closePop(); if (menuOpen) { menuOpen=false; renderHeader(); document.getElementById("menuBtn")?.focus(); } } });
document.addEventListener("input", e => {
  const d = e.target.dataset, id = e.target.id;
  if (id === "q") { query = e.target.value; clearTimeout(timers.q); timers.q = setTimeout(() => { render(); const q = document.getElementById("q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); return; }
  if (["fpRole","fpCo","fpLoc"].includes(id)) { const kw = ["fpRole","fpCo","fpLoc"].map(i=>document.getElementById(i).value.trim()).filter(Boolean).join(" "); document.getElementById("fpLink").href = "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(kw); return; }
  if (id === "rsRaw") { S.resume.raw = e.target.value; save("resume"); return; }
  if (id === "rsJd") { S.resume.jd = e.target.value; save("resume"); return; }
  if (d.pf) { S.profile[d.pf] = e.target.value; save("profile"); return; }
  if (d.cnotes) { S.network.contacts[+d.cnotes].notes = e.target.value; save("network"); return; }
  const M = S.resume.model; let touched = false;
  if (M && d.rm) { M[d.rm] = e.target.value; touched = true; }
  if (M && d.rml) { M[d.rml] = e.target.value.split("\n").map(s=>s.trim()).filter(Boolean); touched = true; }
  if (M && d.rmh) { const [s,i] = d.rmh.split("|"); M[s][+i].head = e.target.value; touched = true; }
  if (M && d.rmb) { const [s,i] = d.rmb.split("|"); M[s][+i].bullets = e.target.value.split("\n").map(x=>x.replace(BULLET,"").trim()).filter(Boolean); touched = true; }
  if (touched) { save("resume"); const o = document.getElementById("rmOut"); if (o) o.textContent = modelToText(M); }
});
document.addEventListener("change", async e => {
  const d = e.target.dataset, id = e.target.id;
  if (d.k) { const was = !!S.progress.done[d.k]; if (e.target.checked) S.progress.done[d.k] = true; else delete S.progress.done[d.k]; if (was !== e.target.checked) logActivity(e.target.checked?1:-1);
    const t = TOPIC[current]; e.target.closest(".sub").classList.toggle("done", e.target.checked);
    if (t) { const s = topicStats(t); if (s.p===100 && !S.progress.doneAt[t.id]) S.progress.doneAt[t.id] = today(); if (s.p<100) delete S.progress.doneAt[t.id];
      const b = document.querySelector(".thead .bar i"); if (b) b.style.width = s.p + "%"; const n = document.getElementById("topicNum"); if (n) n.textContent = `${s.d}/${s.n} learned`; }
    save("progress"); return; }
  if (d.claim) { const set = new Set(S.profile.claims||[]); e.target.checked ? set.add(d.claim) : set.delete(d.claim); S.profile.claims = [...set]; save("profile"); return; }
  if (d.target) { const set = new Set(S.profile.targets||[]); e.target.checked ? set.add(d.target) : set.delete(d.target); S.profile.targets = [...set]; save("profile"); return; }
  if (d.certhave) { const set = new Set(S.profile.certsHave||[]); e.target.checked ? set.add(d.certhave) : set.delete(d.certhave); S.profile.certsHave = [...set]; save("profile"); if (/^cert-/.test(current)) rerender(); return; }
  if (d.certplan) { const set = new Set(S.profile.certsPlan||[]); e.target.checked ? set.add(d.certplan) : set.delete(d.certplan); S.profile.certsPlan = [...set]; save("profile"); return; }
  if (id === "pfCo") { S.profile.company = e.target.value; save("profile"); return; }
  if (id === "certRole") { certRole = e.target.value; rerender(); return; }
  if (id === "certCo") { certCo = e.target.value; rerender(); return; }
  if (id === "rsRole") { S.resume.role = e.target.value; save("resume"); if (RA) { RA = analyse(S.resume.raw, S.resume.jd||"", S.resume.role); rerender(); } return; }
  if (d.stage) { S.network.contacts[+d.stage].stage = e.target.value; save("network"); render(); return; }
  if (d.tpl) { const c = S.network.contacts[+d.tpl]; c.tpl = e.target.value; save("network"); document.getElementById("nt-"+d.tpl).textContent = NOTES[c.tpl](c); return; }
  if (d.follow) { S.network.contacts[+d.follow].follow = e.target.value; save("network"); return; }
  if (d.apst) { S.network.apps[+d.apst].status = e.target.value; save("network"); return; }
  if (id === "avFile") { const f = e.target.files[0]; if (f) avatarUpload(f); return; }
});
/* first render happens in boot.js after every file has loaded */
