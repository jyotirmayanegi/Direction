/* ================= ROLE PATHWAYS, LEARN HUB, HOME, ROLE PAGE, ACTIVITY =================
   Every role has its own pathway, in this order:
   1. the basics, 2. the laws and frameworks, 3. cyber basics that help you talk to IT, 4. tools.
   A tool is opened only after the basics and its prerequisite subjects reach PATH_DONE percent.
   Hands-on Lab practice for a tool opens only after you have learned the tool. Loaded after the
   older role files, so these functions replace the old home, learn hub and role page. */
const PATH_DONE = 70;
const isToolTopic = id => !!TOPIC[id] && (TOPIC[id].track === "tool" || id === "c-linux");

function pathwayFor(rid){
  const P = pathOf(rid); if (!P) return null;
  const seen = new Set();
  const learn = P.stages.map((s, i) => {
    const ids = [];
    s[2].forEach(id => { if (TOPIC[id] && !isToolTopic(id) && !seen.has(id)) { seen.add(id); ids.push(id); } });
    return {n: i + 1, name: s[0], weeks: s[1], goal: s[3], ids};
  }).filter(st => st.ids.length);
  const rest = [...new Set([...P.core, ...P.support])].filter(id => TOPIC[id] && !isToolTopic(id) && !seen.has(id));
  if (rest.length) learn.push({n: learn.length + 1, name: "More for this role", weeks: "", goal: "Learn enough to talk about these in interviews.", ids: rest});
  learn.forEach((st, i) => st.n = i + 1);
  const tools = [...new Set([...P.stages.flatMap(s => s[2]), ...P.core, ...P.support])].filter(id => TOPIC[id] && isToolTopic(id));
  const all = [...learn.flatMap(st => st.ids), ...tools];
  return {rid, P, learn, tools, all};
}
function stepPct(st){ const ids = st.ids.filter(id => TOPIC[id]); return ids.length ? Math.round(ids.reduce((a, id) => a + topicStats(TOPIC[id]).p, 0) / ids.length) : 0; }
function pathwayPct(pw){ const ids = pw.all.filter(id => TOPIC[id]); return ids.length ? Math.round(ids.reduce((a, id) => a + topicStats(TOPIC[id]).p, 0) / ids.length) : 0; }
function toolLocks(pw, id){
  const why = [], first = pw.learn[0];
  if (first && stepPct(first) < PATH_DONE) why.push('finish "' + first.name + '" first');
  (PRE[id] || []).forEach(x => { if (TOPIC[x] && topicStats(TOPIC[x]).p < PATH_DONE) why.push('learn "' + TOPIC[x].title + '"'); });
  return why;
}
function nextFor(pw){
  for (const st of pw.learn) {
    if (stepPct(st) >= PATH_DONE) continue;
    const id = st.ids.find(i => topicStats(TOPIC[i]).p < PATH_DONE);
    if (id) return {step: st, topic: TOPIC[id]};
  }
  const tid = pw.tools.find(i => topicStats(TOPIC[i]).p < PATH_DONE && !toolLocks(pw, i).length);
  return tid ? {step: {name: "Tools"}, topic: TOPIC[tid]} : null;
}
function fieldOf(rid){ const g = ROLE_GROUPS.find(([name, ids]) => ids.includes(rid)); return g ? g[0] : "Other roles"; }
function siblingsOf(rid){ const g = ROLE_GROUPS.find(([name, ids]) => ids.includes(rid)); return g ? g[1].filter(id => id !== rid && ROLE[id] && pathOf(id)) : []; }
const ytFor = t => yt(((t.subs || [])[0] || {}).v || t.title);

/* ---------- Learn hub: pick a role ---------- */
function viewLearn2(){
  return `<div class="pwhub">
  <div><span class="eyebrow">Learn</span><h2>Pick a role, then follow its path</h2></div>
  <p class="lede">Each role has its own path, in this order: the basics, the laws and frameworks, cyber basics that help you talk to IT, and then the tools. A tool opens only after the basics for it are done.</p>
  ${ROLE_GROUPS.map(([g, ids]) => `<section class="card"><span class="eyebrow">${esc(g)}</span><div class="pw-grid">${ids.filter(id => ROLE[id] && pathOf(id)).map(id => {
    const pw = pathwayFor(id), pct = pathwayPct(pw), studying = id === focusRole();
    return `<article class="pw-role ${studying ? "on" : ""}"><div class="row between"><b>${esc(ROLE[id].name)}</b>${studying ? '<span class="pill ok">Studying</span>' : ""}</div>
      <span class="num">${esc(ROLE[id].fit)} · ${pw.learn.length} steps${pw.tools.length ? " + " + pw.tools.length + " tools" : ""}</span>
      ${bar(pct, "acc")}<div class="row between"><span class="num">${pct}% learned</span><button class="btn sm" data-go="role-${id}">Open path</button></div></article>`; }).join("")}</div></section>`).join("")}
  </div>`;
}

/* ---------- Home: one next step, other roles in the same field, quick links ---------- */
function viewHome(){
  const p = S.profile, fr = focusRole(), pw = pathwayFor(fr), R = ROLE[fr];
  const first = (p.name || "Jyotirmaya Negi").split(" ")[0], pct = pathwayPct(pw), nx = nextFor(pw), sib = siblingsOf(fr);
  return `<div class="card hero"><span class="eyebrow">${new Date().toLocaleDateString("en-IN", {weekday: "long", day: "numeric", month: "long"})}</span>
    <h2>${greeting()}, ${esc(first)}</h2><p class="muted">Studying for <b>${esc(R.name)}</b> · 🔥 ${streak()}-day streak</p></div>
  <section class="card pw-next"><div class="row between" style="flex-wrap:nowrap;align-items:center">
      <div style="min-width:0"><span class="eyebrow">Your next step</span>${nx
        ? `<h3>${esc(nx.topic.title)}</h3><p class="muted">${esc(nx.step.name)}</p>`
        : `<h3>Learning complete for this role</h3><p class="muted">Practise in the Lab and Projects next.</p>`}</div>
      ${ring(pct, "acc")}</div>
    <div class="row">${nx ? `<button class="btn" data-go="${nx.topic.id}">Continue</button>` : ""}<button class="btn ghost" data-go="role-${fr}">Full pathway</button></div></section>
  <section class="card"><span class="eyebrow">Other roles in ${esc(fieldOf(fr))}</span>
    <div class="row">${sib.map(id => `<button class="pill" data-go="role-${id}">${esc(roleShort(id))} · ${pathwayPct(pathwayFor(id))}%</button>`).join("") || '<span class="muted">No other roles in this field.</span>'}</div></section>
  <div class="row pw-quick">${[["learn", "Learn"], ["lab", "Cyber Lab"], ["projects", "Projects"], ["jobs", "Jobs"], ["resume", "Resume"]].map(([g, l]) => `<button class="btn ghost" data-go="${g}">${l}</button>`).join("")}</div>`;
}

/* ---------- Role page: one pathway per role ---------- */
function viewRole(rid){
  const R = ROLE[rid], pw = R && pathwayFor(rid), I = ROLE_INFO[rid] || {};
  if (!pw) return `<div class="card"><p>Role not found.</p><button class="btn" data-go="learn">Back to Learn</button></div>`;
  const f = focusRole(), pct = pathwayPct(pw), nx = nextFor(pw), ops = typeof OPS !== "undefined" ? OPS : [];
  const topicRow = id => { const t = TOPIC[id], s = topicStats(t);
    return `<div class="pwtopic"><div style="min-width:0;flex:1"><button class="link strong" data-go="${id}">${esc(t.title)}</button>
      <div class="num">${esc(t.short || "")}</div>${bar(s.p, s.p >= PATH_DONE ? "ok" : "")}</div>
      <div class="row"><span class="num">${s.p >= PATH_DONE ? "Learned" : s.p + "%"}</span><a class="link" href="${ytFor(t)}" target="_blank" rel="noopener">Watch ▶</a></div></div>`; };
  const learnSteps = pw.learn.map(st => { const sp = stepPct(st), done = sp >= PATH_DONE, cur = !done && nx && nx.step === st;
    return `<section class="pwstep ${done ? "done" : cur ? "cur" : ""}"><div class="pwhead"><span class="pwnum">${done ? "✓" : st.n}</span>
      <div style="min-width:0;flex:1"><b>${esc(st.name)}</b> <span class="num">${st.weeks ? "· " + esc(st.weeks) + " " : ""}· ${sp}%</span>
      <p class="muted" style="margin:2px 0 0;font-size:.92rem">${esc(st.goal)}</p></div></div>
      <div>${st.ids.map(topicRow).join("")}</div></section>`; }).join("");
  const toolN = pw.learn.length + 1;
  const toolsHTML = pw.tools.length ? `<section class="pwstep"><div class="pwhead"><span class="pwnum">${toolN}</span>
      <div style="min-width:0;flex:1"><b>Tools for this role</b> <span class="num">· learn each tool before you use it</span>
      <p class="muted" style="margin:2px 0 0;font-size:.92rem">A tool is taught here first. Hands-on Lab practice opens after you have learned that tool.</p></div></div>
      ${pw.tools.map(id => { const t = TOPIC[id], s = topicStats(t), why = toolLocks(pw, id);
        if (why.length) return `<div class="pwtopic locked"><div style="flex:1"><b>🔒 ${esc(t.title)}</b><div class="num">Opens after: ${esc(why.join("; "))}</div></div></div>`;
        const lab = ops.filter(o => o.topic === id);
        return `<div class="pwtopic"><div style="min-width:0;flex:1"><button class="link strong" data-go="${id}">${esc(t.title)}</button><div class="num">${esc(t.short || "")}</div>${bar(s.p, s.p >= PATH_DONE ? "ok" : "")}</div>
          <div class="row"><span class="num">${s.p}% learned</span><a class="link" href="${ytFor(t)}" target="_blank" rel="noopener">Watch ▶</a>
          ${s.p >= PATH_DONE ? lab.map(o => `<button class="link" data-labop="${o.id}" data-go="lab">Practise in Lab</button>`).join("") || `<span class="num">Practice in the Lab, Projects page</span>` : `<span class="num">Lab practice opens at ${PATH_DONE}%</span>`}</div></div>`; }).join("")}</section>` : "";
  const must = (ROLE_REQ[rid] || []).filter(x => x[3]);
  const rtext = (S.resume.raw || "").toLowerCase();
  return `<div class="thead"><button class="link" data-go="learn">← All roles</button><span class="eyebrow">${esc(fieldOf(rid))}</span><h2>${esc(R.name)}</h2></div>
  <section class="card pw-next"><div class="row between" style="flex-wrap:nowrap;align-items:center"><div style="min-width:0"><span class="eyebrow">${esc(R.fit)}</span>
      <p class="muted" style="margin:4px 0 0">${esc(pw.P.why)}</p></div>${ring(pct, "acc")}</div>
    <div class="row">${rid === f ? '<span class="pill ok">You are studying for this role</span>' : `<button class="btn" data-focus="${rid}">Study for this role</button>`}
      ${nx ? `<button class="btn ghost" data-go="${nx.topic.id}">Continue: ${esc(nx.topic.title)}</button>` : ""}</div></section>
  <section class="card"><span class="eyebrow">The job in plain words</span><p class="lede" style="margin:4px 0 8px">${esc(I.what || "")}</p>
    ${(I.day || []).length ? `<b>A typical day</b><ul class="clean">${I.day.slice(0, 4).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    <div class="row" style="margin-top:8px"><span class="num">Job titles to search:</span>${pw.P.titles.map(t => `<span class="pill">${esc(t)}</span>`).join("")}</div></section>
  <section class="card"><span class="eyebrow">Your path</span><h3>Work through it top to bottom</h3>
    ${learnSteps}${toolsHTML}</section>
  ${must.length ? `<section class="card"><span class="eyebrow">Employers ask for</span><h3>Must-have skills in job posts</h3>
    ${must.map(([label, kws, how]) => { const found = rtext ? kws.some(k => hasTerm(rtext, k.toLowerCase())) : null;
      return `<div class="reqrow"><span style="flex:1;min-width:160px">${esc(label)}</span><span class="pill ${found === true ? "ok" : found === false ? "bad" : ""}">${found === true ? "On your resume" : found === false ? "Not on resume yet" : "Must have"}</span></div>`; }).join("")}</section>` : ""}
  <section class="card"><span class="eyebrow">Other roles in ${esc(fieldOf(rid))}</span><div class="row">${siblingsOf(rid).map(id => `<button class="pill" data-go="role-${id}">${esc(roleShort(id))}</button>`).join("") || '<span class="muted">No other roles in this field.</span>'}</div></section>`;
}

/* ---------- 18-week activity, shown on the Profile page ---------- */
function activityCard(){
  const WEEKS = 18, start = new Date(); start.setDate(start.getDate() - (WEEKS * 7 - 1));
  let cal = `<div class="heatcal wide" style="--wk:${WEEKS}" aria-label="Activity over the last ${WEEKS} weeks">`;
  for (let w = 0; w < WEEKS; w++) { cal += `<div class="wk">`; for (let d = 0; d < 7; d++) { const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d); const n = S.progress.log[dayStr(dt)] || 0; cal += `<div class="d ${n >= 6 ? "a3" : n >= 3 ? "a2" : n > 0 ? "a1" : ""}" title="${dayStr(dt)}: ${n}"></div>`; } cal += `</div>`; }
  cal += `</div>`;
  return `<div class="card actcard"><div class="row between"><span class="eyebrow">Activity, last 18 weeks</span><span class="num">🔥 ${streak()}-day streak · ${weekCount()} this week</span></div>${cal}
    <span class="num">One square per day, today is the last square. Counts ticked subtopics, quiz answers, subjects opened, lab and project steps, applications and contacts added.</span></div>`;
}
