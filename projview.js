/* ================= PORTFOLIO PROJECTS ================= */
const PROJ = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
const MAX_TRIES = 5;
function projState(id){ const all = (S.progress.projects ||= {}); return (all[id] ||= {steps:{}, attempts:0, passed:false, history:[], draft:"", self:{}}); }
function projFails(st){ return st.history.filter(h => !h.pass).length; }
function keyUnlocked(st){ return st.passed || projFails(st) >= MAX_TRIES; }
function projPct(p){ const st = projState(p.id); return Math.round(Object.keys(st.steps).filter(k=>st.steps[k]).length / p.steps.length * 100); }
function projStatus(p){ const st = projState(p.id); return st.passed ? ["Passed","ok"] : (st.attempts || projPct(p)) ? ["In progress","warn"] : ["Not started",""]; }
let projFilter = "all";

function viewProjects(){
  const targets = S.profile.targets || [];
  const list = PROJECTS.filter(p => projFilter==="all" || p.level===projFilter || (projFilter==="mine" && p.roles.some(r=>targets.includes(r))));
  const passed = PROJECTS.filter(p=>projState(p.id).passed).length;
  return `<div><span class="eyebrow">Portfolio projects</span><h2>Build proof employers can see</h2></div>
  <p class="lede">Each project copies a real task GRC and privacy teams do, set at a fictional Indian company. Follow the steps, submit your work for review, and add the finished piece to GitHub and LinkedIn.</p>
  <div class="grid4">
    <div class="card tile"><span class="lbl">Passed</span><span class="big">${passed}<span class="num"> / ${PROJECTS.length}</span></span>${bar(Math.round(passed/PROJECTS.length*100))}</div>
    <div class="card tile"><span class="lbl">In progress</span><span class="big">${PROJECTS.filter(p=>projStatus(p)[0]==="In progress").length}</span></div>
    <div class="card tile"><span class="lbl">Reviews submitted</span><span class="big">${PROJECTS.reduce((a,p)=>a+projState(p.id).attempts,0)}</span></div>
  </div>
  <div class="card"><h3>How it works</h3>
    <ol class="clean"><li>Read the brief and the objective. Open the "Before you start" topics if they aren't done.</li><li>Work through the steps; tick each one as you finish it.</li><li>Paste your work (or a summary plus a link) and submit it. Claude checks it against the project's marking list and tells you what's missing.</li><li>The answer key stays locked until you pass, or after ${MAX_TRIES} reviewed attempts that didn't pass. Trying first is how the skill sticks.</li></ol>
    <div class="seg" role="group" aria-label="Filter">${[["all","All"],["mine","For my target roles"],["Starter","Starter"],["Intermediate","Intermediate"],["Advanced","Advanced"]].map(([v,l])=>`<button aria-pressed="${projFilter===v}" data-pfilter="${v}">${l}</button>`).join("")}</div></div>
  <div class="grid3">${list.map(p=>{const [s,cls]=projStatus(p), st=projState(p.id);return `<article class="card tcard" data-go="proj-${p.id}" tabindex="0" role="link">
    <div class="row between"><span class="step-n">PROJECT ${p.n} · ${esc(p.level)} · ${esc(p.hours)}</span><span class="pill ${cls}">${s}</span></div>
    <h3>${esc(p.title)}</h3><p class="muted" style="font-size:.88rem">${esc(p.objective)}</p>
    ${bar(projPct(p))}<div class="row between"><span class="num">${Object.values(st.steps).filter(Boolean).length}/${p.steps.length} steps</span><span class="num">${st.attempts} review${st.attempts===1?"":"s"}</span></div>
    <div class="row">${p.roles.slice(0,3).map(r=>`<span class="pill">${esc(ROLE[r].name.split(" (")[0].split(" /")[0])}</span>`).join("")}</div></article>`;}).join("")}</div>
  <div class="card"><h3>See how others built theirs</h3><p class="muted" style="font-size:.9rem">Public GRC portfolios on GitHub, for format ideas only. Do your own work.</p>
    <div style="display:grid;gap:6px">${[["Namaa Finance: asset inventory, risk register, gap assessment, evidence tracker","https://github.com/Hala-saud/grc-risk-management-portfolio"],["Eight-project GRC portfolio: risk, NIST CSF, TPRM, control testing, SOC 2","https://github.com/moski001/grc-portfolio"],["Practical GRC artefacts: control assessments, vendor risk, cloud audits","https://github.com/Niicay/grc-portfolio"],["Beginner GRC workflow workbook","https://github.com/Justseconds/grc-workflow-101"],["ISO/IEC 27001:2022 self-built portfolio","https://github.com/RoshFps/GRC_Portfolio"]].map(([l,u])=>`<div class="vrow"><span class="src guide">GitHub</span><a href="${u}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div></div>`;
}

function viewProject(p){
  const st = projState(p.id), fails = projFails(st), unlocked = keyUnlocked(st), [s,cls] = projStatus(p);
  const idx = PROJECTS.indexOf(p), prev = PROJECTS[idx-1], next = PROJECTS[idx+1];
  let n = 0; const sec = (id,t,inner) => `<section class="card part" id="pp-${id}"><div class="ph"><span class="pn">${String(++n).padStart(2,"0")}</span><h3>${t}</h3></div>${inner}</section>`;
  const dataBlock = p.data ? Object.entries(p.data).map(([title,rows])=>`<b style="font-size:.9rem">${esc(title)}</b><div class="tbl"><table><thead><tr>${rows[0].map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`).join("") : "";
  return `<div class="thead"><button class="link" data-go="projects">← Portfolio projects</button>
    <span class="eyebrow">Project ${p.n} · ${esc(p.level)} · ${esc(p.hours)}</span><h2>${esc(p.title)}</h2>
    <div class="row"><span class="pill ${cls}">${s}</span><div style="flex:1;min-width:140px">${bar(projPct(p))}</div><span class="num" id="projNum">${Object.values(st.steps).filter(Boolean).length}/${p.steps.length} steps</span></div>
    <div class="row"><span class="num">Proves you can do:</span>${p.roles.map(r=>`<span class="pill">${esc(ROLE[r].name.split(" (")[0])}</span>`).join("")}</div>
    <div class="row"><span class="num">Supports:</span>${p.certs.map(c=>`<button class="pill acc" data-go="cert-${c}">${esc(shortCert(CERT[c]))}</button>`).join("")}</div>
    <nav class="parts" aria-label="Parts">${["Brief","Objective","Why companies want it","Before you start","Deliverables","Step-by-step","Tools & templates","Watch","Submit for review","Answer key"].map((l,i)=>`<a href="#proj-${p.id}" data-anchor="pp-${["brief","obj","why","pre","del","steps","tools","watch","submit","key"][i]}">${i+1}. ${l}</a>`).join("")}</nav></div>
  ${sec("brief","The brief",`<p><b>Company:</b> ${esc(p.company)}</p><p><b>The problem:</b> ${esc(p.problem)}</p>${dataBlock}`)}
  ${sec("obj","Objective",`<div class="info"><b>Your goal:</b> ${esc(p.objective)}</div>`)}
  ${sec("why","Why companies want this",`<p>${esc(p.why)}</p>`)}
  ${sec("pre","Before you start",`<p class="muted" style="font-size:.9rem">These topics give you what this project needs. Finish their "Must know" parts first.</p><div class="row">${p.topics.map(id=>`<button class="pill ${topicStats(TOPIC[id]).p===100?"ok":""}" data-go="${id}">${esc(TOPIC[id].title)} · ${topicStats(TOPIC[id]).p}%</button>`).join("")}</div>`)}
  ${sec("del","What you'll hand in",`<ul class="clean">${p.deliverables.map(d=>`<li>${esc(d)}</li>`).join("")}</ul>`)}
  ${sec("steps","Step-by-step guide",`<div style="display:grid;gap:10px">${p.steps.map(([t,d],i)=>`<div class="sub ${st.steps[i]?"done":""}" style="border-left-color:var(--accent)"><div class="top"><h4>${i+1}. ${esc(t)}</h4></div><p>${esc(d)}</p><label class="learned"><input type="checkbox" id="ps-${p.id}-${i}" data-pstep="${p.id}|${i}" ${st.steps[i]?"checked":""}> Done</label></div>`).join("")}</div>`)}
  ${sec("tools","Tools & templates",`<p><b>Tools:</b> ${esc(p.tools.join("; "))}</p><div style="display:grid;gap:8px">${p.refs.map(([l,u,k])=>`<div class="vrow"><span class="src ${k==="primary"?"":k}">${k==="primary"?"Primary":k}</span><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div>`)}
  ${sec("watch","Watch: the why and the how",`<div style="display:grid;gap:8px">${p.videos.map(([l,q])=>`<div class="vrow"><span class="src video">Video</span><a href="${yt(q)}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div>
    <p class="muted" style="font-size:.88rem">These open YouTube searches for the exact skill. When you find a good video, paste its chapter list into the matching topic page's "Watch & read" box and Claude will mark the minute each part starts.</p>`)}
  ${sec("submit","Submit for review",`
    <p style="font-size:.92rem">Paste your work, or a summary of it plus a link (Google Drive, GitHub). Claude checks it against the marking list below. To pass, every item marked <b>required</b> must be met and at least 70% of all items.</p>
    <div class="inset"><b style="font-size:.88rem">Marking list</b><ul class="clean" style="margin-top:6px">${p.rubric.map(([r,c])=>`<li>${esc(r)}${c?' <span class="pill hot">required</span>':''}</li>`).join("")}</ul></div>
    <label class="f">Your work<textarea id="pjDraft" data-pjdraft="${p.id}" style="min-height:200px" placeholder="Paste your deliverable text, tables (copied from Sheets) or a summary with links">${esc(st.draft||"")}</textarea></label>
    <div class="row"><button class="btn" data-pjreview="${p.id}" ${st.passed?"disabled":""}>${st.passed?"Passed":"Submit for review"}</button><span class="num">${st.passed?"You passed this project.":`Attempt ${st.attempts+1} · ${Math.max(0,MAX_TRIES-fails)} unsuccessful attempt${MAX_TRIES-fails===1?"":"s"} left before the answer key opens`}</span></div>
    <div id="pjOut" class="ai" ${st.history.length?"":"hidden"}>${st.history.length?renderReview(p, st.history[st.history.length-1]):""}</div>
    ${st.history.length>1?`<details><summary class="link" style="cursor:pointer">Earlier attempts (${st.history.length-1})</summary><div style="display:grid;gap:6px;margin-top:8px">${st.history.slice(0,-1).reverse().map(h=>`<div class="row between"><span class="num">${esc(h.date)}</span><span class="pill ${h.pass?"ok":"bad"}">${h.pass?"Passed":"Not yet"} · ${h.score}%</span></div>`).join("")}</div></details>`:""}
    <div id="pjSelf" hidden></div>`)}
  ${sec("key","Answer key",unlocked?`
    <div class="note"><b>Unlocked</b> ${st.passed?"because you passed. Compare your approach.":"after "+MAX_TRIES+" attempts. Read it, then fix your work and submit again."}</div>
    <p><b>How to approach it:</b> ${esc(p.key.approach)}</p>
    <b style="font-size:.9rem">Model answer (excerpt)</b><pre class="doc">${esc(p.key.sample)}</pre>
    <b style="font-size:.9rem">Tips</b><ul class="clean">${p.key.tips.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`
    :`<div class="inset" style="display:grid;gap:8px"><b>Locked</b><p style="font-size:.92rem">Opens after you pass, or after ${MAX_TRIES} reviewed attempts that don't pass. Each review tells you what's missing, which is usually enough.</p>
      <div class="row" aria-label="${fails} of ${MAX_TRIES} attempts used">${Array.from({length:MAX_TRIES},(_,i)=>`<span class="dot" style="background:${i<fails?"var(--seal)":"var(--track)"}"></span>`).join("")}<span class="num">${fails}/${MAX_TRIES}</span></div></div>`)}
  ${st.passed?`<div class="card"><span class="eyebrow">Put it to work</span><h3>Add it to your resume and LinkedIn</h3><div class="inset">${esc(p.bullet)}</div>
    <div class="row"><button class="btn sm" data-copystr="${esc(p.bullet)}">Copy resume bullet</button><button class="btn sm ghost" data-go="resume">Open resume builder</button></div>
    <p class="muted" style="font-size:.9rem">Upload the files to a GitHub repository (one folder per project, with a short README: scenario, what you did, what you'd do next), then pin it in LinkedIn Featured.</p></div>`:""}
  <div class="pager">${prev?`<button class="btn ghost" data-go="proj-${prev.id}">← ${esc(prev.title)}</button>`:"<span></span>"}${next?`<button class="btn ghost" data-go="proj-${next.id}">Next: ${esc(next.title)} →</button>`:""}</div>`;
}

function renderReview(p, h){
  return `<div style="display:grid;gap:8px;white-space:normal"><div class="row between"><b>${h.pass?"Passed":"Not passed yet"} · ${h.score}% of the marking list</b><span class="num">${esc(h.date)}${h.mode==="self"?" · self-check":""}</span></div>
    ${h.items.map((it,i)=>`<div class="flag"><b class="sev ${it.met?"ok":(p.rubric[i]&&p.rubric[i][1]?"hi":"md")}">${it.met?"Met":"Missing"}</b><span>${esc(p.rubric[i]?p.rubric[i][0]:"")}${it.note?`<br><span class="muted">${esc(it.note)}</span>`:""}</span></div>`).join("")}
    ${h.feedback?`<p style="font-size:.92rem"><b>Feedback:</b> ${esc(h.feedback)}</p>`:""}</div>`;
}
function grade(p, items){
  const metCount = items.filter(x=>x.met).length, score = Math.round(metCount/p.rubric.length*100);
  const reqOk = p.rubric.every(([,c],i) => !c || (items[i] && items[i].met));
  return {score, pass: reqOk && score >= 70};
}
function recordAttempt(p, items, feedback, mode){
  const st = projState(p.id), g = grade(p, items);
  st.attempts++; st.history.push({date: today(), pass: g.pass, score: g.score, items, feedback, mode});
  if (st.history.length > 12) st.history = st.history.slice(-12);
  if (g.pass) st.passed = true;
  logActivity(1); save("progress"); rerender();
  const o = document.getElementById("pjOut"); if (o) o.scrollIntoView({block:"center"});
}
async function reviewProject(id){
  const p = PROJ[id], st = projState(id), out = document.getElementById("pjOut"), work = (st.draft||"").trim();
  out.hidden = false;
  if (work.length < 150) { out.textContent = "Paste more of your work first (at least a few paragraphs or table rows). Short submissions don't count as an attempt."; return; }
  if (!cap.sample) { selfCheck(p); return; }
  out.textContent = "Reviewing against the marking list…";
  try {
    const res = await cap.sample.json(`You are a strict but encouraging GRC reviewer marking a learner's portfolio project. Judge ONLY what the submission actually contains; if something is only promised or vague, mark it not met. Do not reveal a model answer or write the work for them.

PROJECT: ${p.title}
SCENARIO: ${p.company} ${p.problem}
OBJECTIVE: ${p.objective}
${p.data?"DATA PROVIDED:\n"+JSON.stringify(p.data)+"\n":""}
MARKING LIST (numbered):
${p.rubric.map(([r],i)=>i+". "+r).join("\n")}

SUBMISSION:
${work.slice(0,30000)}

Reply with only JSON: {"items":[{"i":number,"met":boolean,"note":"one short sentence: what is missing or what was done well"}],"feedback":"2-3 sentences on the most important fix, without giving the answer"} with exactly one item per marking-list entry.`, {cache:false});
    const arr = Array.isArray(res && res.items) ? res.items : [];
    const items = p.rubric.map((_,i) => { const f = arr.find(x => +x.i === i); return {met: !!(f && f.met === true), note: f ? String(f.note||"") : "Not assessed"}; });
    recordAttempt(p, items, String(res && res.feedback || ""), "claude");
  } catch(e) {
    if (["not_granted","sampling_disabled","capability_disabled","not_declared"].includes(e.code)) { selfCheck(p); return; }
    out.textContent = (e.code==="invalid_json" ? "The review didn't come back in a readable form. " : aiErr(e) + " ") + "This didn't count as an attempt; try again.";
  }
}
function selfCheck(p){
  const box = document.getElementById("pjSelf"), out = document.getElementById("pjOut");
  out.textContent = "Claude review isn't available in this view, so check your own work honestly against each item, then submit the self-check.";
  box.hidden = false;
  box.innerHTML = `<div class="inset" style="display:grid;gap:6px">${p.rubric.map(([r,c],i)=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="sc-${i}" data-sc="${i}"> ${esc(r)}${c?' <span class="pill hot">required</span>':''}</label>`).join("")}<div><button class="btn sm" id="scGo">Submit self-check</button></div></div>`;
  document.getElementById("scGo").onclick = () => recordAttempt(p, p.rubric.map((_,i)=>({met: document.getElementById("sc-"+i).checked, note:""})), "", "self");
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-pfilter],[data-pjreview]"); if (!el) return;
  if (el.dataset.pfilter) { projFilter = el.dataset.pfilter; render(); return; }
  if (el.dataset.pjreview) { reviewProject(el.dataset.pjreview); return; }
});
document.addEventListener("input", e => {
  const id = e.target.dataset && e.target.dataset.pjdraft; if (!id) return;
  projState(id).draft = e.target.value; save("progress");
});
document.addEventListener("change", e => {
  const v = e.target.dataset && e.target.dataset.pstep; if (!v) return;
  const [id, i] = v.split("|"), st = projState(id), was = !!st.steps[i];
  if (e.target.checked) st.steps[i] = true; else delete st.steps[i];
  if (was !== e.target.checked) logActivity(e.target.checked?1:-1);
  e.target.closest(".sub").classList.toggle("done", e.target.checked);
  const p = PROJ[id], b = document.querySelector(".thead .bar i"); if (b) b.style.width = projPct(p) + "%";
  const n = document.getElementById("projNum"); if (n) n.textContent = `${Object.values(st.steps).filter(Boolean).length}/${p.steps.length} steps`;
  save("progress");
});
