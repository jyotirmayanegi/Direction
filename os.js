/* ================= LabOS: a desktop inside the Cyber Lab ================= */
const LOS = {apps:{}, order:[], wins:[], z:30, root:null, mobile:false, pendingOp:null, startOpen:false, panel:true};
function losState(){ const p = S.progress; p.labos ||= {}; const L = p.labos; L.xp ||= 0; L.ops ||= {}; L.quest ||= {level:0, flag:false}; L.drill ||= {}; L.mail ||= {best:0, rounds:0}; L.apps ||= {}; L.stats ||= {cmds:0}; return L; }
function losApp(id){ const a = losState().apps; return (a[id] ||= {}); }
function losSave(){ save("progress"); }
function losXP(n, why){ const L = losState(); L.xp += n; losSave(); toast(`+${n} XP · ${why}`); losTray(); }
function losRegister(app){ LOS.apps[app.id] = app; LOS.order.push(app.id); }
function totalLabXPAll(){ return labXP() + (S.progress.labos ? S.progress.labos.xp || 0 : 0); }

/* ---------- ops (tool projects inside LabOS) ---------- */
function opState(id){ const o = losState().ops; return (o[id] ||= {steps:{}, done:false}); }
function opGet(id){ return (S.progress.labos && S.progress.labos.ops && S.progress.labos.ops[id]) || {steps:{}, done:false}; }
function losCheckOps(appId){
  if (typeof OPS === "undefined") return;
  const st = losApp(appId); let changed = false;
  OPS.filter(o => o.app === appId).forEach(o => {
    const os = opState(o.id); if (os.done) return;
    o.steps.forEach(([label, fn], i) => { let ok = false; try { ok = !!fn(st); } catch(e) {} if (ok && !os.steps[i]) { os.steps[i] = true; changed = true; toast(`✓ ${label}`); } });
    if (o.steps.every((_, i) => os.steps[i])) { os.done = true; os.at = today(); changed = true; losXP(o.xp || 120, "Project complete: " + o.title); logActivity(3); losAchieve(); }
  });
  if (changed) { losSave(); losRenderPanel(); }
}

/* ---------- achievements ---------- */
const ACH = [
 ["first-cmd","First command","Run any command in the Terminal",L=>L.stats.cmds>=1],
 ["cmd-100","Command-line regular","Run 100 commands",L=>L.stats.cmds>=100],
 ["quest-3","Shell Quest: apprentice","Reach Shell Quest level 3",L=>L.quest.level>=3],
 ["quest-8","Shell Quest: operator","Reach Shell Quest level 8",L=>L.quest.level>=8],
 ["quest-flag","Root of the matter","Capture the Shell Quest flag",L=>L.quest.flag],
 ["phish-8","Sharp eyes","Score 8+ in an Inbox Defender shift",L=>L.mail.best>=8],
 ["op-1","Project shipped","Complete a LabOS tool project",L=>Object.values(L.ops).some(o=>o.done)],
 ["op-grc","GRC operator","Complete all GRC tool projects",L=>typeof OPS!=="undefined"&&OPS.filter(o=>o.kind==="GRC tool").every(o=>(L.ops[o.id]||{}).done)],
 ["op-cyber","Cyber operator","Complete all cyber tool projects",L=>typeof OPS!=="undefined"&&OPS.filter(o=>o.kind==="Cyber tool").every(o=>(L.ops[o.id]||{}).done)],
 ["drill-3","Daily habit","Finish the daily drill 3 days in a row",L=>(L.drill.streak||0)>=3],
 ["xp-1000","Four digits","Earn 1,000 Lab XP",L=>totalLabXPAll()>=1000]
];
function losAchieve(){ const L = losState(); L.ach ||= {}; ACH.forEach(([id, name, , fn]) => { let ok = false; try { ok = fn(L); } catch(e) {} if (ok && !L.ach[id]) { L.ach[id] = today(); toast("🏅 Achievement: " + name); } }); losSave(); }

/* ---------- daily drill ---------- */
function drillToday(){
  const L = losState(), d = today();
  if (L.drill.date !== d) {
    const fr = (typeof focusRole === "function") ? focusRole() : "", ids = fr && typeof roleTopicIds === "function" ? roleTopicIds(fr) : TOPICS.map(t => t.id);
    const pool = TOPICS.filter(t => ids.includes(t.id) && t.quiz && t.quiz.length).flatMap(t => t.quiz.map((q, i) => [t.id, i]));
    let seed = [...d].reduce((a,c) => a*31 + c.charCodeAt(0), 7) >>> 0; const pick = [];
    while (pick.length < 3 && pool.length) { seed = (seed * 1103515245 + 12345) >>> 0; const k = pool.splice(seed % pool.length, 1)[0]; pick.push(k); }
    const yest = new Date(); yest.setDate(yest.getDate()-1);
    const streak = (L.drill.done && L.drill.date === dayStr(yest)) ? (L.drill.streak||0) : 0;
    L.drill = {date:d, qs:pick, ans:{}, done:false, streak};
    losSave();
  }
  return L.drill;
}

/* ---------- desktop view ---------- */
function viewLabOS(){ return `<div id="losMount" class="losmount"></div>`; }
function losMount(){
  const mount = document.getElementById("losMount"); if (!mount) return;
  LOS.mobile = window.innerWidth < 760;
  if (!LOS.root) LOS.root = losBuild();
  mount.appendChild(LOS.root);
  losTray(); losRenderPanel(); losTaskbar();
  if (LOS.pendingOp) { const op = OPS.find(o => o.id === LOS.pendingOp); LOS.pendingOp = null; if (op) setTimeout(() => losStartOp(op.id), 30); }
  else if (LOS.pendingApp) { const a = LOS.pendingApp; LOS.pendingApp = null; setTimeout(() => losOpen(a), 30); }
}
function losBuild(){
  const root = document.createElement("div"); root.className = "labos"; root.setAttribute("aria-label","LabOS desktop");
  root.innerHTML = `<div class="desk" id="losDesk"><div class="dicons" role="list">${LOS.order.filter(id => LOS.apps[id].desk !== false).map(id => { const a = LOS.apps[id]; return `<button class="dicon" role="listitem" data-losopen="${id}"><span class="dic" style="background:${a.color}">${a.icon}</span><span class="dl">${esc(a.title)}</span></button>`; }).join("")}</div>
    <aside class="lospanel glass" id="losPanel" aria-label="Ops board"></aside>
    <div class="startmenu glass" id="losStart" hidden></div></div>
    <div class="taskbar"><button class="startbtn" data-losstart="1" aria-label="Start menu">◉ <b>LabOS</b></button><div class="tasks" id="losTasks"></div><div class="tray" id="losTray"></div></div>`;
  return root;
}
function losTray(){ const el = LOS.root && LOS.root.querySelector("#losTray"); if (!el) return; const xp = totalLabXPAll(), rk = rankFor(xp); el.innerHTML = `<span class="pill acc">${esc(rk.name)}</span><span class="num">${xp} XP</span><span class="num" id="losClock">${new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span><button class="link" data-lospanel="1">${LOS.panel?"Hide board":"Ops board"}</button>`; }
setInterval(() => { const c = document.getElementById("losClock"); if (c) c.textContent = new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}); }, 15000);
function losTaskbar(){ const el = LOS.root && LOS.root.querySelector("#losTasks"); if (!el) return; el.innerHTML = LOS.wins.map(w => { const a = LOS.apps[w.app]; return `<button class="task ${w.min?"min":""} ${w.el.classList.contains("focus")?"on":""}" data-lostask="${w.id}"><span class="tic" style="background:${a.color}">${a.icon}</span><span>${esc(a.title)}</span></button>`; }).join(""); }
function losRenderPanel(){
  const el = LOS.root && LOS.root.querySelector("#losPanel"); if (!el) return;
  el.hidden = !LOS.panel; if (LOS.root) LOS.root.classList.toggle("panelon", !!LOS.panel);
  if (!LOS.panel) return;
  const L = losState(), dr = drillToday(), fr = (typeof focusRole === "function") ? focusRole() : "", ids = fr ? roleTopicIds(fr) : null;
  const ops = (typeof OPS !== "undefined" ? OPS : []).slice().sort((a,b) => (ids ? (ids.includes(b.topic) - ids.includes(a.topic)) : 0));
  const opRow = o => { const s = opGet(o.id), n = o.steps.filter((_, i) => s.steps[i]).length; return `<button class="oprow ${s.done?"done":""}" data-losop="${o.id}"><span class="oic" style="background:${(LOS.apps[o.app]||{}).color||"#555"}">${(LOS.apps[o.app]||{}).icon||"▣"}</span><span class="opt"><b>${esc(o.title)}</b><span class="num">${esc(o.kind)} · ${esc((LOS.apps[o.app]||{}).title||"")}${ids&&ids.includes(o.topic)?" · for your role":""}</span>${bar(Math.round(n/o.steps.length*100), s.done?"":"acc")}</span><span class="num">${s.done?"✓":n+"/"+o.steps.length}</span></button>`; };
  const grcOps = ops.filter(o => o.kind === "GRC tool"), cyOps = ops.filter(o => o.kind === "Cyber tool");
  el.innerHTML = `<div class="row between"><b>Ops board</b><button class="link" data-lospanel="1" aria-label="Hide ops board">✕</button></div>
    <div class="drill"><div class="row between"><b>Daily drill</b><span class="num">🔥 ${dr.streak||0} day streak</span></div>${dr.done?`<span class="num">Done for today. Come back tomorrow.</span>`:`<span class="num">${Object.keys(dr.ans).length}/${dr.qs.length} answered · +60 XP</span><button class="btn sm" data-losopen="drill">Start drill</button>`}</div>
    <div class="qrow"><b>Shell Quest</b><span class="num">Level ${L.quest.level}/12${L.quest.flag?" · flag captured":""}</span><button class="link" data-losopen="term" data-losargs="quest">Play</button></div>
    <div class="opgrp"><span class="num">GRC TOOL PROJECTS</span>${grcOps.map(opRow).join("")}</div>
    <div class="opgrp"><span class="num">CYBER TOOL PROJECTS</span>${cyOps.map(opRow).join("")}</div>
    <button class="link" data-go="lab-map">Mission map (${MISSIONS.filter(m=>labGet(m.id).done).length}/${MISSIONS.length} missions)</button>`;
}
function losStartMenu(){
  const el = LOS.root && LOS.root.querySelector("#losStart"); if (!el) return; LOS.startOpen = !LOS.startOpen; el.hidden = !LOS.startOpen;
  if (!LOS.startOpen) return;
  el.innerHTML = `<b>Apps</b><div class="sgrid">${LOS.order.map(id => { const a = LOS.apps[id]; return `<button data-losopen="${id}"><span class="dic" style="background:${a.color}">${a.icon}</span><span>${esc(a.title)}</span></button>`; }).join("")}</div>
    <div class="row"><button class="btn sm ghost" data-go="lab-map">Mission map</button><button class="btn sm ghost" data-losopen="ach">Achievements</button></div>`;
}

/* ---------- windows ---------- */
function losOpen(appId, args){
  const app = LOS.apps[appId]; if (!app) return null;
  if (!LOS.root || !document.getElementById("losDesk")) { LOS.pendingApp = appId; return null; }
  if (LOS.startOpen) losStartMenu();
  let w = LOS.wins.find(x => x.app === appId);
  if (w) { if (w.min) { w.min = false; w.el.hidden = false; } losFocus(w); if (args && w.onArgs) w.onArgs(args); losTaskbar(); return w; }
  const desk = LOS.root.querySelector(".desk"), dw = desk.clientWidth || 900, dh = desk.clientHeight || 560;
  /* windows never sit under the Ops board: on phones the board steps aside, on wider screens windows use the space beside it */
  if (LOS.mobile && LOS.panel) { LOS.panel = false; losRenderPanel(); losTray(); }
  const room = (!LOS.mobile && LOS.panel) ? dw - 334 : dw;
  const [W0, H0] = app.size || [720, 480], W = Math.max(280, Math.min(W0, room - 16)), H = Math.min(H0, dh - 16), n = LOS.wins.length;
  const left = Math.max(8, Math.min(room - W - 8, 96 + n * 26)), top = Math.max(8, Math.min(dh - H - 8, 14 + n * 22));
  const id = "w" + Math.random().toString(36).slice(2,8), el = document.createElement("section");
  el.className = "win"; el.id = id; el.setAttribute("role","dialog"); el.setAttribute("aria-label", app.title);
  el.style.cssText = `left:${left}px;top:${top}px;width:${W}px;height:${H}px;z-index:${++LOS.z}`;
  el.innerHTML = `<header class="wbar" data-wdrag="${id}"><span class="wic" style="background:${app.color}">${app.icon}</span><b class="wt">${esc(app.title)}</b><span class="wbtns"><button data-wmin="${id}" aria-label="Minimise">–</button><button data-wmax="${id}" aria-label="Maximise">▢</button><button data-wclose="${id}" aria-label="Close">✕</button></span></header><div class="wbody"></div>`;
  desk.appendChild(el);
  w = {id, app:appId, el, min:false};
  if (LOS.mobile || app.max) el.classList.add("max");
  LOS.wins.push(w);
  const body = el.querySelector(".wbody");
  const ctx = {win:w, body, st:losApp(appId), save:losSave, xp:losXP, check:() => losCheckOps(appId), close:() => losClose(w.id), setTitle:t => { el.querySelector(".wt").textContent = t; }};
  try { const r = app.mount(body, ctx, args || {}) || {}; w.onClose = r.onClose; w.onArgs = r.onArgs; }
  catch(e) { body.innerHTML = `<div class="note">This app hit an error: ${esc(e && e.message)}</div>`; }
  losFocus(w); losTaskbar();
  return w;
}
function losFocus(w){ LOS.wins.forEach(x => x.el.classList.remove("focus")); w.el.classList.add("focus"); w.el.style.zIndex = ++LOS.z; losTaskbar(); }
function losClose(id){ const i = LOS.wins.findIndex(x => x.id === id); if (i < 0) return; const w = LOS.wins[i]; try { w.onClose && w.onClose(); } catch(e) {} w.el.remove(); LOS.wins.splice(i, 1); losTaskbar(); }
function losStartOp(opId){
  const op = OPS.find(o => o.id === opId); if (!op) return;
  const os = opState(op.id); os.started ||= today(); losSave(); losRenderPanel();
  losOpen(op.app, {op:op.id});
}

/* ---------- events ---------- */
let losDrag = null;
document.addEventListener("pointerdown", e => {
  const bar = e.target.closest(".wbar"); if (!bar || e.target.closest("button")) { const win = e.target.closest(".win"); if (win) { const w = LOS.wins.find(x => x.id === win.id); if (w) losFocus(w); } return; }
  const w = LOS.wins.find(x => x.id === bar.dataset.wdrag); if (!w) return; losFocus(w);
  if (w.el.classList.contains("max")) return;
  const r = w.el.getBoundingClientRect(); losDrag = {w, dx:e.clientX - r.left, dy:e.clientY - r.top}; try { bar.setPointerCapture(e.pointerId); } catch(_) {}
});
document.addEventListener("pointermove", e => {
  if (!losDrag) return; const desk = LOS.root.querySelector(".desk").getBoundingClientRect(), el = losDrag.w.el;
  const x = Math.max(0, Math.min(desk.width - 80, e.clientX - desk.left - losDrag.dx)), y = Math.max(0, Math.min(desk.height - 36, e.clientY - desk.top - losDrag.dy));
  el.style.left = x + "px"; el.style.top = y + "px";
});
document.addEventListener("pointerup", () => { losDrag = null; });
document.addEventListener("click", e => {
  const el = e.target.closest("[data-losopen],[data-losstart],[data-lostask],[data-wmin],[data-wmax],[data-wclose],[data-losop],[data-lospanel],[data-labop]"); if (!el) { if (LOS.startOpen && !e.target.closest("#losStart")) losStartMenu(); return; }
  const d = el.dataset;
  if (d.labop) { LOS.pendingOp = d.labop; return; }
  if (d.losopen) { if (d.losopen === "drill") { losOpen("drill"); return; } losOpen(d.losopen, d.losargs ? {mode:d.losargs} : undefined); return; }
  if (d.losstart) { losStartMenu(); return; }
  if (d.lostask) { const w = LOS.wins.find(x => x.id === d.lostask); if (!w) return; if (w.min) { w.min = false; w.el.hidden = false; losFocus(w); } else if (w.el.classList.contains("focus")) { w.min = true; w.el.hidden = true; } else losFocus(w); losTaskbar(); return; }
  if (d.wmin) { const w = LOS.wins.find(x => x.id === d.wmin); if (w) { w.min = true; w.el.hidden = true; losTaskbar(); } return; }
  if (d.wmax) { const w = LOS.wins.find(x => x.id === d.wmax); if (w) w.el.classList.toggle("max"); return; }
  if (d.wclose) { losClose(d.wclose); return; }
  if (d.losop) { losStartOp(d.losop); return; }
  if (d.lospanel) { LOS.panel = !LOS.panel; losRenderPanel(); losTray(); return; }
});
window.addEventListener("resize", () => { const m = window.innerWidth < 760; if (m !== LOS.mobile) { LOS.mobile = m; LOS.wins.forEach(w => w.el.classList.toggle("max", m || !!LOS.apps[w.app].max)); } });

/* ---------- built-in small apps: drill, achievements, missions ---------- */
losRegister({id:"drill", title:"Daily drill", icon:"✎", color:"#C2410C", size:[520,460], desk:true, mount(body, ctx){
  const draw = () => { const dr = drillToday();
    body.innerHTML = `<div class="apppad"><div class="row between"><h3>Daily drill</h3><span class="num">🔥 ${dr.streak||0}-day streak</span></div><p class="muted" style="font-size:.88rem">Three questions from ${typeof focusRole==="function"&&focusRole()?"your role's subjects":"the course"}. Finish all three for +60 XP.</p>
      ${dr.qs.map(([tid, qi], k) => { const t = TOPIC[tid], q = t && t.quiz[qi]; if (!q) return ""; const a = dr.ans[k]; return `<div class="quizq"><span class="num">${esc(t.title)}</span><b>${esc(q.q)}</b><div class="opts">${q.o.map((o,j)=>`<button data-drill="${k}|${j}" ${a!==undefined?"disabled":""} class="${a!==undefined?(j===q.a?"right":(j===a?"wrong":"")):""}">${esc(o)}</button>`).join("")}</div>${a!==undefined?`<p class="num">${a===q.a?"Correct. ":"Not quite. "}${esc(q.w)}</p>`:""}</div>`; }).join("")}
      ${dr.done?`<div class="info">Drill complete. See you tomorrow.</div>`:""}</div>`; };
  draw();
  body.addEventListener("click", e => { const b = e.target.closest("[data-drill]"); if (!b) return; const [k, j] = b.dataset.drill.split("|").map(Number), dr = drillToday(); if (dr.ans[k] !== undefined) return; dr.ans[k] = j;
    if (Object.keys(dr.ans).length === dr.qs.length && !dr.done) { dr.done = true; dr.streak = (dr.streak||0) + 1; losXP(60, "Daily drill"); logActivity(1); losAchieve(); }
    losSave(); draw(); losRenderPanel(); });
}});
losRegister({id:"ach", title:"Achievements", icon:"🏅", color:"#A2620A", size:[560,480], mount(body){
  const L = losState(); losAchieve();
  body.innerHTML = `<div class="apppad"><div class="row between"><h3>Achievements</h3><span class="num">${Object.keys(L.ach||{}).length}/${ACH.length} unlocked</span></div>
    <div class="achgrid">${ACH.map(([id, name, desc]) => `<div class="ach ${L.ach&&L.ach[id]?"on":""}"><span class="aic">${L.ach&&L.ach[id]?"🏅":"🔒"}</span><b>${esc(name)}</b><span class="num">${esc(desc)}</span>${L.ach&&L.ach[id]?`<span class="num">${esc(L.ach[id])}</span>`:""}</div>`).join("")}</div>
    <div class="grid3" style="margin-top:12px"><div class="inset tile"><span class="lbl">Lab XP</span><span class="big">${totalLabXPAll()}</span></div><div class="inset tile"><span class="lbl">Commands run</span><span class="big">${L.stats.cmds||0}</span></div><div class="inset tile"><span class="lbl">Projects done</span><span class="big">${Object.values(L.ops).filter(o=>o.done).length}/${typeof OPS!=="undefined"?OPS.length:0}</span></div></div></div>`;
}});
losRegister({id:"missions", title:"Missions", icon:"⚑", color:"#0E7490", size:[760,520], mount(body){
  body.innerHTML = `<div class="apppad"><p class="muted" style="font-size:.9rem">The original Lab missions, grouped by zone. Each opens as a full page.</p><div class="zones">${ZONES.map(z => zoneCard(z)).join("")}</div></div>`;
}});
