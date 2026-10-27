/* ================= ROLE FOCUS, TRACKS, ROADMAPS, ROLE × SUBJECT MAP ================= */
const roleShort = id => ROLE[id] ? ROLE[id].name.replace(/\s*\(.*\)/,"").split(" / ")[0].replace(/ — .*$/,"") : "All roles";
function focusRole(){ const f = S.profile.focus; if (f && ROLE[f] && pathOf(f)) return f; const t = (S.profile.targets||[]).find(id => ROLE[id] && pathOf(id)); return t || "privacy"; }
function setFocus(id){ if (!(id && ROLE[id] && pathOf(id))) return; vennRole = ""; vennSel = ""; S.profile.focus = id; save("profile"); }
function pathOf(rid){ return ROLE_PATH[rid] || null; }
function topicNeed(rid, tid){ const p = pathOf(rid); if (!p) return ""; return p.core.includes(tid) ? "core" : p.support.includes(tid) ? "support" : ""; }
function roleTopicIds(rid){ const p = pathOf(rid); return p ? [...p.core, ...p.support].filter(id => TOPIC[id]) : TOPICS.map(t => t.id); }
function rolesNeeding(tid){ return ROLES.filter(r => pathOf(r.id)).map(r => ({r, need: topicNeed(r.id, tid)})).filter(x => x.need); }
function stagePct(stage){ const ids = stage[2].filter(id => TOPIC[id]); return ids.length ? Math.round(ids.reduce((a,id) => a + topicMastery(TOPIC[id]), 0) / ids.length * 100) : 0; }
function currentStageIdx(rid){ const p = pathOf(rid); if (!p) return 0; const i = p.stages.findIndex(s => stagePct(s) < 70); return i < 0 ? p.stages.length - 1 : i; }
function nextTopicFor(rid){ const p = pathOf(rid); if (!p) return null; for (const id of p.core) { const t = TOPIC[id]; if (t && topicStats(t).p < 100) return t; } for (const id of p.support) { const t = TOPIC[id]; if (t && topicStats(t).p < 100) return t; } return null; }
function quickRoles(){ const ids = [...new Set([focusRole(), ...(S.profile.targets||[])].filter(id => ROLE[id]))]; return ids; }
function focusButton(cls=""){ const f = focusRole(); return `<button class="focusbtn ${cls}" data-rolepick="1" title="Choose the role you're studying for"><span aria-hidden="true">◎</span><span class="fb-l">Studying for</span><b>${esc(roleShort(f))}</b><span aria-hidden="true">▾</span></button>`; }
function roleChipRow(){ const f = focusRole(), ids = quickRoles();
  return `<div class="rolechips" role="group" aria-label="Study for">${(ids.includes(f)?ids:[f,...ids]).map(id => `<button class="rchip ${id===f?"on":""}" data-focus="${id}">${esc(roleShort(id))}<span class="num">${roleReady(ROLE[id])}%</span></button>`).join("")}<button class="rchip add" data-rolepick="1">+ Choose role</button></div>`; }

/* ---------- role picker sheet ---------- */
function openRolePicker(){
  closeRolePicker();
  const f = focusRole(), targets = S.profile.targets || [];
  const wrap = document.createElement("div"); wrap.id = "rolePicker";
  wrap.innerHTML = `<div class="scrim" data-rpclose="1"></div><div class="sheet glass rpsheet" role="dialog" aria-label="Choose the role you're studying for">
    <div class="row between"><div><span class="eyebrow">Study for a role</span><h3>Pick what you're preparing for</h3></div><button class="btn ghost sm" data-rpclose="1">Close</button></div>
    <p class="muted" style="font-size:.9rem">The learning path, projects and Lab then show only the subjects that role needs, so cybersecurity and compliance aren't mixed when a role doesn't need both. Star roles to keep them as quick-switch chips.</p>
    ${ROLE_GROUPS.map(([g, ids]) => `<div class="grp"><span>${g}</span>${ids.filter(id => ROLE[id]).map(id => { const r = ROLE[id], p = pathOf(id), rd = roleReady(r);
      return `<div class="rprow"><button class="rpitem ${id===f?"on":""}" data-focus="${id}" data-rpclose="1"><b>${esc(r.name)}</b><span class="num">${esc(r.fit)} · ${p?p.core.length+" core subjects":""} · ${rd}% ready</span>${bar(rd,"acc")}</button><button class="star ${targets.includes(id)?"on":""}" data-rptarget="${id}" aria-pressed="${targets.includes(id)}" aria-label="Keep ${esc(r.name)} as a quick-switch role">★</button></div>`; }).join("")}</div>`).join("")}
    <button class="link" data-go="matrix" data-rpclose="1">Compare all roles and subjects →</button></div>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".rpitem.on, .rpitem")?.focus();
}
function closeRolePicker(){ document.getElementById("rolePicker")?.remove(); }

/* ---------- overview Venn: covered / required / should cover ---------- */
let vennSel = "", vennRole = "";
const COVERED_AT = 70;
function vennData(rid){
  const P = pathOf(rid), path = P ? [...P.core, ...P.support].filter(id => TOPIC[id]) : [];
  const core = new Set((P ? P.core : []).filter(id => TOPIC[id])), sup = new Set((P ? P.support : []).filter(id => TOPIC[id]));
  const isPre = id => path.some(x => (PRE[x] || []).includes(id));             // something on this path builds on it
  const A = new Set(TOPICS.filter(t => topicStats(t).p >= COVERED_AT).map(t => t.id));   // covered
  const B = core;                                                               // required for the role
  const C = new Set([...sup, ...path.filter(isPre)]);                           // should cover: supporting + foundations others build on
  const R = {abc:[], ab:[], ac:[], bc:[], a:[], b:[], c:[]};
  const all = new Set([...A, ...B, ...C]);
  TOPICS.forEach(t => { if (!all.has(t.id)) return; const k = (A.has(t.id)?"a":"") + (B.has(t.id)?"b":"") + (C.has(t.id)?"c":""); R[k].push(t); });
  const order = (list) => list.slice().sort((x,y) => (isPre(y.id) - isPre(x.id)) || (TOPICS.indexOf(x) - TOPICS.indexOf(y)));
  const todo = [...order(R.bc), ...order(R.b)], should = order(R.c);
  const inProg = [...todo, ...should].filter(t => topicStats(t).p > 0);
  return {P, A, B, C, R, todo, should, inProg, need: B.size, done: R.ab.length + R.abc.length};
}
const VENN_REG = {
  bc:{name:"Foundations to learn first", tone:"hi", tip:"Required for the role, and other subjects build on them. Start here."},
  b:{name:"Required, not covered yet", tone:"hi", tip:"The core gap between you and this role."},
  c:{name:"Should cover next", tone:"md", tip:"Supporting subjects: learn enough to discuss them in interviews."},
  abc:{name:"Foundations covered", tone:"ok", tip:"Required foundations you've already learned."},
  ab:{name:"Required & covered", tone:"ok", tip:"Core subjects you've already learned."},
  ac:{name:"Supporting, covered", tone:"ok", tip:"Supporting subjects you've already learned."},
  a:{name:"Extra knowledge", tone:"lo", tip:"Covered, but this role doesn't need it. It still counts for other roles."}
};
function vennSVG(D){
  const n = k => D.R[k].length, sel = k => vennSel === k ? ' class="vsel"' : "";
  const lab = (k, x, y) => `<g data-vsel="${k}" tabindex="0" role="button" aria-label="${esc(VENN_REG[k].name)}: ${n(k)} subjects"${sel(k)}><circle cx="${x}" cy="${y}" r="19" class="vdot v-${VENN_REG[k].tone}"/><text x="${x}" y="${y+6}" text-anchor="middle" class="vnum">${n(k)}</text></g>`;
  return `<svg class="vennsvg" viewBox="0 0 360 330" role="img" aria-label="Venn diagram of covered, required and should-cover subjects">
    <circle cx="128" cy="122" r="98" class="vc vcA"/><circle cx="232" cy="122" r="98" class="vc vcB"/><circle cx="180" cy="208" r="98" class="vc vcC"/>
    <text x="58" y="34" class="vt vtA">Covered</text><text x="302" y="34" text-anchor="end" class="vt vtB">Required</text><text x="180" y="324" text-anchor="middle" class="vt vtC">Should cover</text>
    ${lab("a",82,98)}${lab("b",278,98)}${lab("c",180,262)}${lab("ab",180,80)}${lab("ac",118,190)}${lab("bc",242,190)}${lab("abc",180,150)}
  </svg>`;
}
function vennCard(){
  const rid = (vennRole && ROLE[vennRole] && pathOf(vennRole)) ? vennRole : (focusRole() && pathOf(focusRole()) ? focusRole() : ((S.profile.targets||[]).find(id => pathOf(id)) || "privacy"));
  const D = vennData(rid), R = ROLE[rid];
  const pct = D.need ? Math.round(D.done / D.need * 100) : 0;
  const chip = t => `<button class="pill vchip" data-go="${t.id}" title="${topicStats(t).p}% learned">${esc(t.title.replace(/ \(.*\)/,""))}<span class="num"> ${topicStats(t).p}%</span></button>`;
  const keys = ["bc","b","c","abc","ab","ac","a"].filter(k => D.R[k].length);
  const regList = (vennSel ? [vennSel] : keys).map(k => `<div class="vreg v-${VENN_REG[k].tone}"><div class="row between"><b>${esc(VENN_REG[k].name)}</b><span class="num">${D.R[k].length}</span></div><p class="muted">${esc(VENN_REG[k].tip)}</p><div class="row">${D.R[k].slice(0, vennSel ? 40 : 6).map(chip).join("")}${!vennSel && D.R[k].length > 6 ? `<button class="link" data-vsel="${k}">+${D.R[k].length-6} more</button>` : ""}</div></div>`).join("");
  const path = D.todo.slice(0,5);
  return `<div class="card venncard"><div class="row between"><div style="min-width:0"><span class="eyebrow">Overview</span><h3>What you've covered, what's required, what to cover next</h3></div>
      <label class="f" style="min-width:200px">For the role<select id="vennRole">${ROLES.filter(r => pathOf(r.id)).map(r => `<option value="${r.id}" ${r.id===rid?"selected":""}>${esc(roleShort(r.id))}</option>`).join("")}</select></label></div>
    <div class="venngrid"><div class="vleft">${vennSVG(D)}
        <div class="vstats"><div><span class="big">${D.done}<span class="num"> / ${D.need}</span></span><span class="num">required subjects covered</span></div>${ring(pct,"acc")}</div>
        <p class="num" style="margin:0">"Covered" = at least ${COVERED_AT}% of a subject's parts ticked. Tap a number to list its subjects.</p></div>
      <div class="vright">
        <div class="vorder"><span class="eyebrow">To become a ${esc(roleShort(rid))}, learn in this order</span>
          ${path.length ? `<ol class="vsteps">${path.map(t => `<li><button class="link strong" data-go="${t.id}">${esc(t.title)}</button><span class="num"> ${topicStats(t).p}% · ${D.R.bc.includes(t) ? "foundation" : "core"}</span></li>`).join("")}</ol>${D.todo.length > 5 ? `<span class="num">…then ${D.todo.length-5} more required subject${D.todo.length-5>1?"s":""}.</span>` : ""}`
            : `<p style="margin:4px 0">All required subjects are covered. ${D.should.length ? `Next, cover ${D.should.slice(0,2).map(t=>esc(t.title)).join(" and ")}.` : "Move on to projects and the Lab."}</p>`}
          ${D.should.length && path.length ? `<p class="num" style="margin:6px 0 0">Alongside: ${D.should.slice(0,3).map(t => `<button class="link" data-go="${t.id}">${esc(t.title)}</button>`).join(", ")}</p>` : ""}</div>
        ${vennSel ? `<div class="row between"><span class="num">Showing one area</span><button class="link" data-vsel="">Show all areas</button></div>` : ""}
        <div class="vregs">${regList || `<p class="muted">Nothing here yet.</p>`}</div></div></div>
    ${R ? `<span class="num">Skip for this role: ${esc((D.P && D.P.skip) || "—")}</span>` : ""}</div>`;
}
document.addEventListener("click", e => { const el = e.target.closest("[data-vsel]"); if (!el) return; const k = el.dataset.vsel; vennSel = vennSel === k ? "" : k; rerender(); });
document.addEventListener("keydown", e => { const el = e.target.closest && e.target.closest("g[data-vsel]"); if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); el.dispatchEvent(new MouseEvent("click", {bubbles:true})); } });
document.addEventListener("change", e => { if (e.target.id === "vennRole") { vennRole = e.target.value; vennSel = ""; rerender(); } });

/* ---------- learning path (separated by track) ---------- */
let learnGroup2 = "role", trackF = "all", showNotNeeded = false, learnMode = "must";

/* ---------- roadmap page ---------- */
let pathRole = null;
function viewPath(){
  const rid = (pathRole && ROLE[pathRole]) ? pathRole : (focusRole() || (S.profile.targets||[])[0] || "privacy"), R = ROLE[rid], P = pathOf(rid), f = focusRole();
  const rd = roleReady(R), cur = currentStageIdx(rid), certs = (ROLE_CERTS[rid]||[]).slice().sort((a,b)=>a[1]-b[1]).map(([id,pr]) => [CERT[id], pr]).filter(x => x[0]);
  const req = ROLE_REQ[rid] || [], rtext = (S.resume.raw || "").toLowerCase();
  const reqRows = req.map(([label, kws, how, must]) => { const found = rtext ? kws.some(k => hasTerm(rtext, k.toLowerCase())) : null; return {label, how, must, found}; });
  const howLink = h => h.startsWith("cert:") ? (CERT[h.slice(5)] ? `<button class="link" data-go="cert-${h.slice(5)}">${esc(shortCert(CERT[h.slice(5)]))}</button>` : "") : (TOPIC[h] ? `<button class="link" data-go="${h}">${esc(TOPIC[h].title)}</button>` : "");
  const opsFor = ids => (typeof OPS !== "undefined" ? OPS.filter(o => ids.includes(o.topic)) : []);
  const zonesFor = ids => ZONES.filter(z => ids.includes(z.topic));
  const skipList = TOPICS.filter(t => !topicNeed(rid, t.id));
  return `<div><span class="eyebrow">Roadmap</span><h2>${esc(R.name)}</h2></div>
  <div class="card"><span class="eyebrow">Choose a role</span>
    ${ROLE_GROUPS.map(([g, ids]) => `<div class="rolegrp"><span class="num">${g}</span><div class="row">${ids.filter(id=>ROLE[id]).map(id => `<button class="rchip ${id===rid?"on":""}" data-pathrole="${id}">${(S.profile.targets||[]).includes(id)?"★ ":""}${esc(roleShort(id))}</button>`).join("")}</div></div>`).join("")}</div>
  <div class="card hero"><div class="row between"><div style="min-width:0;display:grid;gap:4px"><span class="eyebrow">${esc(R.fit)}</span><h3>${esc(R.name)}</h3><p class="muted" style="margin:0">${esc(P?P.why:"")}</p>
      <div class="row">${(P?P.titles:[]).map(t => `<a class="pill" href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(t)}&location=India" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join("")}</div></div>
    <div style="display:grid;gap:8px;justify-items:center">${ring(rd,"acc")}<span class="num">role readiness</span>${f===rid?`<span class="pill ok">Your focus role</span>`:`<button class="btn sm" data-focus="${rid}">Study for this role</button>`}</div></div></div>
  ${P?`<div class="card"><h3>Roadmap</h3><ol class="roadmap">${P.stages.map((s,i) => { const pct = stagePct(s), st = pct>=70?"done":i===cur?"cur":"next"; const ids = s[2].filter(id=>TOPIC[id]); const ops = opsFor(ids), zones = zonesFor(ids);
      return `<li class="rstage ${st}"><div class="rdot">${st==="done"?"✓":i+1}</div><div class="rbody"><div class="row between"><div><b>${esc(s[0])}</b> <span class="num">· ${esc(s[1])}</span></div><span class="num">${pct}%</span></div>${bar(pct, st==="cur"?"acc":"")}
        <p style="font-size:.9rem;margin:0">${esc(s[3])}</p>
        <div class="row">${ids.map(id => { const t = TOPIC[id], m = Math.round(topicMastery(t)*100); return `<button class="pill ${m>=70?"ok":""}" data-go="${id}">${esc(t.title.replace(/ \(.*\)/,""))} · ${m}%</button>`; }).join("")}</div>
        <div class="rlinks">${ids.map(id => { const c = typeof ladderCurrent==="function" ? ladderCurrent(id) : null; return c ? `<button class="link" data-go="proj-${c.id}">⚒ ${esc(c.title)} <span class="num">(${INTENSITY_NAME[c.lvl]})</span></button>` : ""; }).join("")}
          ${zones.map(z => { const ms = zoneMissions(z.id), nx = ms.find(m => missionUnlocked(m) && !labGet(m.id).done) || ms[0]; return `<button class="link" data-go="${nx ? "lab-" + nx.id : "lab-map"}">$_ Lab: ${esc(z.name)}</button>`; }).join("")}${ops.map(o => `<button class="link" data-go="lab" data-labop="${o.id}">▣ ${esc(o.title)}</button>`).join("")}</div></div></li>`; }).join("")}</ol></div>`:""}
  <div class="grid2">
    <div class="card"><h3>What employers ask for</h3><p class="muted" style="font-size:.88rem">From current job posts for this role. ${rtext?"Checked against the resume in your Resume builder.":"Upload your resume in the Resume builder to see which you already show."}</p>
      ${reqRows.map(x => `<div class="reqrow"><span class="pill ${x.must?"hot":""}">${x.must?"Must":"Plus"}</span><span style="flex:1;min-width:0">${esc(x.label)}${x.found===null?"":x.found?' <span class="pill ok">on resume</span>':' <span class="pill bad">missing</span>'}</span><span class="num">${howLink(x.how)}</span></div>`).join("")}</div>
    <div class="card"><h3>Certifications in order</h3>${certs.length?certs.map(([c,pr]) => `<div class="rrow"><div style="min-width:0"><button class="link" data-go="cert-${c.id}" style="font-weight:600;text-decoration:none;color:var(--ink)">${esc(c.name)}</button>${bar(certReady(c),"l3")}</div><span class="pill ${pr===1?"acc":""}">${pr===1?"Now":pr===2?"Next":"Later"}</span></div>`).join(""):`<p class="muted">No certificate is required; projects matter more.</p>`}</div></div>
  ${P?`<div class="card"><h3>What you can skip</h3><p>${esc(P.skip)}</p><details><summary class="link" style="cursor:pointer">${skipList.length} subjects not needed for this role</summary><div class="row" style="margin-top:8px">${skipList.map(t => `<button class="pill" data-go="${t.id}">${esc(t.title.replace(/ \(.*\)/,""))}</button>`).join("")}</div></details>
    <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-go="matrix">Compare all roles</button><button class="btn ghost sm" data-go="resume">Check my resume for this role</button><button class="btn ghost sm" data-go="applications">Track applications</button></div></div>`:""}`;
}

/* ---------- roles × subjects matrix ---------- */
function viewMatrix(){
  const f = focusRole(), roleIds = ROLE_GROUPS.flatMap(g => g[1]).filter(id => ROLE[id]);
  return `<div><span class="eyebrow">Roles × subjects</span><h2>Which roles need which subjects</h2></div>
  <p class="lede">● core: study fully. ○ supporting: learn enough to talk about it. Blank: not needed. Tap a role name to study for it, or a subject to open it.</p>
  <div class="card"><div class="tbl mxwrap"><table class="rmx"><thead><tr><th class="sticky">Subject</th>${roleIds.map(id => `<th class="${id===f?"focus":""}"><button class="vlabel" data-focus="${id}" title="${esc(ROLE[id].name)}">${esc(roleShort(id))}</button></th>`).join("")}</tr></thead>
    <tbody>${TRACK_ORDER.map(tr => `<tr class="trrow"><th class="sticky" colspan="${roleIds.length+1}" style="--tc:${TRACK_INFO[tr].color}">${TRACK_INFO[tr].icon} ${esc(TRACK_INFO[tr].name)}</th></tr>${TOPICS.filter(t=>t.track===tr).map(t => `<tr><th class="sticky"><button class="link" data-go="${t.id}">${esc(t.title.replace(/ \(.*\)/,""))}</button></th>${roleIds.map(id => { const n = topicNeed(id, t.id); return `<td class="${id===f?"focus":""}" title="${esc(roleShort(id))}: ${n||"not needed"}">${n==="core"?'<span class="dotc">●</span>':n==="support"?'<span class="dots2">○</span>':""}</td>`; }).join("")}</tr>`).join("")}`).join("")}</tbody></table></div></div>`;
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-rolepick],[data-focus],[data-rpclose],[data-rptarget],[data-lgroup2],[data-trackf],[data-shownot],[data-pathrole]"); if (!el) return;
  const d = el.dataset;
  if (d.rptarget) { const set = new Set(S.profile.targets||[]); set.has(d.rptarget) ? set.delete(d.rptarget) : set.add(d.rptarget); S.profile.targets = [...set]; save("profile"); el.classList.toggle("on"); el.setAttribute("aria-pressed", set.has(d.rptarget)); return; }
  if (d.focus !== undefined && !d.focus) return;
  if (d.focus !== undefined) { setFocus(d.focus); closeRolePicker(); if (d.go) return; if (current === "path") pathRole = d.focus || pathRole; rerender(); renderHeader(); return; }
  if (d.rolepick) { e.preventDefault(); openRolePicker(); return; }
  if (d.rpclose) { closeRolePicker(); return; }
  if (d.lgroup2) { learnGroup2 = d.lgroup2; render(); return; }
  if (d.trackf) { trackF = d.trackf; render(); return; }
  if (d.shownot) { showNotNeeded = !showNotNeeded; rerender(); return; }
  if (d.pathrole) { pathRole = d.pathrole; rerender(); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("rolePicker")) closeRolePicker(); });

document.addEventListener("click", e => { const el = e.target.closest("[data-lmode]"); if (!el) return; learnMode = el.dataset.lmode; rerender(); });
