/* ================= PROJECT LADDERS (3 per topic) ================= */
const ALLPROJ = [...TP1, ...TP2, ...TP3, ...TP4, ...TP5, ...TP6, ...TP7, ...PROJECTS.map(p => Object.assign({}, p, PROJ_PATCH[p.id] || {}))].filter(p => p.topic);
const PROJ = Object.fromEntries(ALLPROJ.map(p => [p.id, p]));
const LADDER = {}; ALLPROJ.forEach(p => (LADDER[p.topic] ||= []).push(p)); Object.values(LADDER).forEach(l => l.sort((a,b) => a.lvl - b.lvl));
const HINT_AT = 5, KEY_AT = 10;
const LVL_CLS = {1:"lvB",2:"lvI",3:"lvA"};
const lvBadge = l => `<span class="ib ${LVL_CLS[l]}">${INTENSITY_NAME[l]}</span>`;

const PDEF = () => ({steps:{}, attempts:0, passed:false, history:[], draft:"", chat:[]});
function projGet(id){ return (S.progress.projects || {})[id] || PDEF(); }
function projState(id){ const all = (S.progress.projects ||= {}); const st = (all[id] ||= PDEF()); st.chat ||= []; return st; }
function projFails(st){ return st.history.filter(h => !h.pass && h.mode !== "self-skip").length; }
function coachMode(st){ return st.passed || projFails(st) >= KEY_AT ? "cheat" : projFails(st) >= HINT_AT ? "hints" : "guide"; }
function keyUnlocked(st){ return coachMode(st) === "cheat"; }
function projUnlocked(p){ if (p.lvl === 1) return true; const prev = (LADDER[p.topic]||[]).find(x => x.lvl === p.lvl - 1); return !prev || projGet(prev.id).passed; }
function projPct(p){ const st = projGet(p.id); return Math.round(Object.keys(st.steps).filter(k=>st.steps[k]).length / p.steps.length * 100); }
function projStatus(p){ const st = projGet(p.id); if (st.passed) return ["Passed","ok"]; if (!projUnlocked(p)) return ["Locked",""]; return (st.attempts || projPct(p)) ? ["In progress","warn"] : ["Ready","acc"]; }
function ladderCurrent(tid){ const l = LADDER[tid] || []; return l.find(p => !projGet(p.id).passed) || null; }
function ladderPassed(tid){ return (LADDER[tid]||[]).filter(p => projGet(p.id).passed).length; }
function projRoles(p){ if (p.roles) return p.roles; const sk = TOPIC[p.topic].sk || []; return ROLES.map(r => ({r, w: sk.reduce((a,k)=>a+(r.need[k]||0),0)})).filter(x=>x.w>0).sort((a,b)=>b.w-a.w).slice(0,3).map(x=>x.r.id); }
function projCerts(p){ return p.certs || certsForTopic(p.topic).slice(0,3).map(c => c.id); }
function projTopics(p){ return p.topics || [...new Set([...(PRE[p.topic]||[]), p.topic])]; }
function projBullet(p){ return p.bullet || `Completed a ${INTENSITY_NAME[p.lvl].toLowerCase()}-level ${TOPIC[p.topic].title} project: ${p.objective.replace(/\.$/,"")}.`; }
function passedCount(lvl){ return ALLPROJ.filter(p => (!lvl || p.lvl === lvl) && projGet(p.id).passed).length; }
function continueProject(){
  const started = ALLPROJ.filter(p => projUnlocked(p) && !projGet(p.id).passed && (projGet(p.id).attempts || projPct(p) || projGet(p.id).draft));
  if (started.length) return started[0];
  for (const t of TOPICS) { const c = ladderCurrent(t.id); if (c && topicStats(t).p >= 30) return c; }
  return ladderCurrent(TOPICS[0].id);
}

/* ---------- hub ---------- */
let projFilter = "all", projGroup = "intensity";
function viewProjectsBase(){
  const targets = S.profile.targets || [];
  const fr = focusRole(), frIds = fr ? roleTopicIds(fr) : [];
  if (projFilter === "focus" && !fr) projFilter = "all";
  const keep = t => projFilter === "all" || t.track === projFilter || (projFilter === "focus" && frIds.includes(t.id)) || (projFilter === "mine" && LADDER[t.id] && LADDER[t.id].some(p => projRoles(p).some(r => targets.includes(r))));
  const topics = TOPICS.filter(t => LADDER[t.id] && keep(t));
  const cont = continueProject();
  const row = t => { const l = LADDER[t.id], cur = ladderCurrent(t.id), np = ladderPassed(t.id);
    return `<div class="lrow"><div class="lname"><button class="link strong" data-go="${t.id}">${esc(t.title)}</button><span class="num">${np}/3 passed · topic ${topicStats(t).p}% learned</span></div>
      <div class="ladder">${l.map((p,i) => { const st = projGet(p.id), open = projUnlocked(p), isCur = cur && cur.id === p.id;
        return `${i?'<span class="lconn '+(st.passed||open?"on":"")+'" aria-hidden="true"></span>':""}<button class="lstep ${st.passed?"done":""} ${isCur?"cur":""} ${open?"":"locked"}" data-go="proj-${p.id}" aria-label="${INTENSITY_NAME[p.lvl]}: ${esc(p.title)}${open?"":" (locked)"}"><span class="ln">${st.passed?"✓":open?p.lvl:"🔒"}</span><span class="lt">${INTENSITY_NAME[p.lvl]}</span><span class="lp">${esc(p.title)}</span></button>`; }).join("")}</div></div>`; };
  let body;
  if (projGroup === "intensity") body = [1,2,3].map(lv => { const ts = topics.filter(t => INTENSITY[t.id] === lv); if (!ts.length) return "";
      return `<section class="card"><div class="row between"><div class="row">${lvBadge(lv)}<h3>${lv===1?"Foundation topics":lv===2?"Working-knowledge topics":"Specialist topics"}</h3></div><span class="num">${ts.reduce((a,t)=>a+ladderPassed(t.id),0)}/${ts.length*3} projects passed</span></div>
        <p class="muted" style="font-size:.88rem">${lv===1?"Start here. These topics need no background.":lv===2?"Needs the foundation topics. Most entry-level job tasks live here.":"Specialist rules and tools. Do these once the middle tier feels comfortable."}</p>${ts.map(row).join("")}</section>`; }).join("");
  else body = PHASES.map((ph,i) => { const ts = ph.ids.map(id=>TOPIC[id]).filter(t => topics.includes(t)); if (!ts.length) return ""; return `<section class="card"><h3>${i+1}. ${esc(ph.name)}</h3>${ts.map(row).join("")}</section>`; }).join("");
  return `<div><span class="eyebrow">Projects</span><h2>Three projects per topic, each one harder</h2></div>
  <p class="lede">Every topic has a Beginner, an Intermediate and an Advanced project based on real GRC and privacy work. Pass one and the next level unlocks. Claude reviews each attempt, explains its reasoning and shows you how professionals judge the same work.</p>
  <div class="grid4">
    <div class="card tile"><span class="lbl">Projects passed</span><div class="row">${ring(Math.round(passedCount()/ALLPROJ.length*100))}<span class="num">${passedCount()} / ${ALLPROJ.length}</span></div></div>
    ${[1,2,3].map(l=>`<div class="card tile"><span class="lbl">${INTENSITY_NAME[l]}</span><span class="big">${passedCount(l)}<span class="num"> / ${ALLPROJ.filter(p=>p.lvl===l).length}</span></span>${bar(Math.round(passedCount(l)/ALLPROJ.filter(p=>p.lvl===l).length*100), l===1?"":l===2?"acc":"l3")}</div>`).join("")}
  </div>
  ${cont?`<div class="card hero-next"><div class="row between"><div style="min-width:0"><span class="eyebrow">Continue</span><h3>${esc(cont.title)}</h3><div class="row">${lvBadge(cont.lvl)}<span class="num">${esc(TOPIC[cont.topic].title)} · ${esc(cont.hours||"")}</span></div></div><button class="btn" data-go="proj-${cont.id}">${projGet(cont.id).attempts||projPct(cont)?"Resume":"Start"} →</button></div>${bar(projPct(cont),"acc")}</div>`:""}
  <div class="card"><h3>How it works</h3>
    <div class="howgrid"><div><b>1 · Learn</b><span>Read the topic's "Must know" parts. Each project lists what you need first.</span></div><div><b>2 · Build</b><span>Follow the step-by-step guide and tick off each step.</span></div><div><b>3 · Submit</b><span>Paste your work. Claude marks each item, explains why and suggests what to study.</span></div><div><b>4 · Coach</b><span>Ask the project coach anything. After ${HINT_AT} failed reviews it gives hints; after ${KEY_AT} it opens the cheatsheet.</span></div></div>
    <div class="row"><div class="seg" role="group" aria-label="Filter">${[["all","All"],...(fr?[["focus","For "+roleShort(fr)]]:[]),["mine","Starred roles"],["law","Law"],["cyber","Cyber"],["tool","Tools"],["biz","Business"],["legal","Specialist legal"]].map(([v,l])=>`<button aria-pressed="${projFilter===v}" data-pfilter="${v}">${esc(l)}</button>`).join("")}</div>
    <div class="seg" role="group" aria-label="Group by">${[["intensity","By intensity"],["path","By learning path"]].map(([v,l])=>`<button aria-pressed="${projGroup===v}" data-pgroup="${v}">${l}</button>`).join("")}</div></div></div>
  ${body || `<p class="muted">No topics match this filter. Pick target roles in your profile to use "My target roles".</p>`}
  <div class="card"><h3>See how others built theirs</h3><p class="muted" style="font-size:.9rem">Public GRC portfolios on GitHub, for format ideas only. Do your own work.</p>
    <div style="display:grid;gap:6px">${[["Namaa Finance: asset inventory, risk register, gap assessment, evidence tracker","https://github.com/Hala-saud/grc-risk-management-portfolio"],["Eight-project GRC portfolio: risk, NIST CSF, TPRM, control testing, SOC 2","https://github.com/moski001/grc-portfolio"],["Practical GRC artefacts: control assessments, vendor risk, cloud audits","https://github.com/Niicay/grc-portfolio"],["ISO/IEC 27001:2022 self-built portfolio","https://github.com/RoshFps/GRC_Portfolio"]].map(([l,u])=>`<div class="vrow"><span class="src guide">GitHub</span><a href="${u}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div></div>`;
}

/* ---------- project page ---------- */
function ladderBar(p){ return `<div class="ladder sm">${LADDER[p.topic].map((x,i)=>{ const st = projGet(x.id), open = projUnlocked(x); return `${i?'<span class="lconn '+(open?"on":"")+'"></span>':""}<button class="lstep ${st.passed?"done":""} ${x.id===p.id?"cur":""} ${open?"":"locked"}" data-go="proj-${x.id}"><span class="ln">${st.passed?"✓":open?x.lvl:"🔒"}</span><span class="lt">${INTENSITY_NAME[x.lvl]}</span></button>`; }).join("")}</div>`; }
function modeInfo(st){ const f = projFails(st), m = coachMode(st);
  return {m, f, label: m==="cheat"?"Cheatsheet open":m==="hints"?"Hints unlocked":"Guide mode",
    text: m==="cheat" ? (st.passed?"You passed, so the coach can show and explain the model answer.":`After ${KEY_AT} unsuccessful reviews the cheatsheet is open. Study it, then rework your submission.`)
      : m==="hints" ? `Hints are open. ${KEY_AT-f} more unsuccessful review${KEY_AT-f===1?"":"s"} until the cheatsheet opens.`
      : `The coach explains and asks guiding questions, but won't give answers. Hints open after ${HINT_AT-f} more unsuccessful review${HINT_AT-f===1?"":"s"}.`}; }
function viewProjectBase(p){
  const t = TOPIC[p.topic], st = projGet(p.id), open = projUnlocked(p), [s,cls] = projStatus(p), mi = modeInfo(st);
  const head = `<div class="thead"><button class="link" data-go="projects">← Projects</button>
    <span class="eyebrow">${esc(t.title)} · ${esc(p.hours||"")}</span><h2>${esc(p.title)}</h2>
    <div class="row">${lvBadge(p.lvl)}<span class="pill ${cls}">${s}</span><div style="flex:1;min-width:140px">${bar(projPct(p))}</div><span class="num" id="projNum">${Object.values(st.steps).filter(Boolean).length}/${p.steps.length} steps</span></div>
    ${ladderBar(p)}</div>`;
  if (!open) { const prev = LADDER[p.topic].find(x=>x.lvl===p.lvl-1);
    return head + `<div class="card"><div class="note"><b>Locked.</b> Pass the ${INTENSITY_NAME[prev.lvl]} project first. Levels unlock in order so each one builds on the last.</div><p><b>Preview:</b> ${esc(p.objective)}</p><button class="btn" data-go="proj-${prev.id}">Go to ${esc(prev.title)} →</button></div>`; }
  let n = 0; const sec = (id,ttl,inner) => `<section class="card part" id="pp-${id}"><div class="ph"><span class="pn">${String(++n).padStart(2,"0")}</span><h3>${ttl}</h3></div>${inner}</section>`;
  const dataBlock = p.data ? Object.entries(p.data).map(([title,rows])=>`<b style="font-size:.9rem">${esc(title)}</b><div class="tbl"><table><thead><tr>${rows[0].map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`).join("") : "";
  const roles = projRoles(p), certs = projCerts(p), z = ZONES.find(x=>x.topic===p.topic);
  const parts = [["brief","Brief"],["obj","Objective"],["pre","Before you start"],["del","Deliverables"],["steps","Step-by-step"],["mark","How it's judged"],["watch","Watch"],["submit","Submit"],["coach","Coach"],["key","Cheatsheet"]];
  return head + `<nav class="parts" aria-label="Parts">${parts.map(([a,l],i)=>`<a href="#proj-${p.id}" data-anchor="pp-${a}">${i+1}. ${l}</a>`).join("")}</nav>
  ${st.passed?passBanner(p):""}
  ${sec("brief","The brief",`<p><b>Company:</b> ${esc(p.company)}</p><p><b>The problem:</b> ${esc(p.problem)}</p>${dataBlock}${p.why?`<p><b>Why companies want this:</b> ${esc(p.why)}</p>`:""}`)}
  ${sec("obj","Objective",`<div class="info"><b>Your goal:</b> ${esc(p.objective)}</div>
    <div class="row"><span class="num">Shows you can work as:</span>${roles.map(r=>`<span class="pill">${esc(ROLE[r].name.split(" (")[0])}</span>`).join("")}</div>
    ${certs.length?`<div class="row"><span class="num">Supports:</span>${certs.map(c=>`<button class="pill acc" data-go="cert-${c}">${esc(shortCert(CERT[c]))}</button>`).join("")}</div>`:""}`)}
  ${sec("pre","Before you start",`<p class="muted" style="font-size:.9rem">Finish the "Must know" parts of these topics first.</p><div class="row">${projTopics(p).filter(id=>TOPIC[id]).map(id=>`<button class="pill ${topicStats(TOPIC[id]).p===100?"ok":""}" data-go="${id}">${esc(TOPIC[id].title)} · ${topicStats(TOPIC[id]).p}%</button>`).join("")}${z?`<button class="pill acc" data-go="lab">Practise in Cyber Lab: ${esc(z.name)}</button>`:""}</div>`)}
  ${sec("del","What you'll hand in",`<ul class="clean">${p.deliverables.map(d=>`<li>${esc(d)}</li>`).join("")}</ul>${p.tools?`<p class="num">Tools: ${esc(p.tools.join("; "))}</p>`:""}
    ${p.refs?`<div style="display:grid;gap:6px">${p.refs.map(([l,u,k])=>`<div class="vrow"><span class="src ${k==="primary"?"":k}">${k==="primary"?"Primary":k}</span><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div>`:""}`)}
  ${sec("steps","Step-by-step guide",`<p class="muted" style="font-size:.9rem">Work through these in order. If a step doesn't make sense, press <b>Explain this step</b>.</p><div style="display:grid;gap:10px">${p.steps.map(([tt,d],i)=>`<div class="sub ${st.steps[i]?"done":""}" style="border-left-color:var(--accent)"><div class="top"><h4>${i+1}. ${esc(tt)}</h4></div><p>${esc(d)}</p><div class="row"><label class="learned"><input type="checkbox" id="ps-${p.id}-${i}" data-pstep="${p.id}|${i}" ${st.steps[i]?"checked":""}> Done</label><button class="btn sm ghost" data-pexplain="${p.id}|${i}">Explain this step</button></div></div>`).join("")}</div>`)}
  ${sec("mark","How it's judged",`<p style="font-size:.92rem">To pass, every <b>required</b> item must be met and at least 70% of all items. Claude checks only what your work actually shows; promises and vague lines don't count.</p>
    <div class="inset"><ul class="clean">${p.rubric.map(([r,c])=>`<li>${esc(r)}${c?' <span class="pill hot">required</span>':''}</li>`).join("")}</ul></div>`)}
  ${sec("watch","Watch: the why and the how",`<div style="display:grid;gap:8px">${(p.videos||[]).map(([l,q])=>`<div class="vrow"><span class="src video">Video</span><a href="${yt(q)}" target="_blank" rel="noopener">${esc(l)}</a></div>`).join("")}</div>
    <p class="muted" style="font-size:.88rem">These open YouTube searches for the exact skill. When you find a good video, paste its chapter list into the topic page's "Watch & read" box and Claude will mark the minute each part starts.</p>`)}
  ${sec("submit","Submit for review",`
    <label class="f">Your work<textarea id="pjDraft" data-pjdraft="${p.id}" style="min-height:200px" placeholder="Paste your deliverable text, tables copied from Sheets, or a summary with links">${esc(st.draft||"")}</textarea></label>
    <div class="row"><button class="btn" data-pjreview="${p.id}">${st.passed?"Submit again for feedback":"Submit for review"}</button><span class="num">${st.passed?"Passed. You can still resubmit to improve.":`Review ${st.attempts+1} · ${projFails(st)} unsuccessful so far`}</span></div>
    <div id="pjOut" class="review" ${st.history.length?"":"hidden"}>${st.history.length?renderReview(p, st.history[st.history.length-1]):""}</div>
    ${st.history.length>1?`<details><summary class="link" style="cursor:pointer">Earlier attempts (${st.history.length-1})</summary><div style="display:grid;gap:6px;margin-top:8px">${st.history.slice(0,-1).reverse().map(h=>`<div class="row between"><span class="num">${esc(h.date)}</span><span class="pill ${h.pass?"ok":"bad"}">${h.pass?"Passed":"Not yet"} · ${h.score}%</span></div>`).join("")}</div></details>`:""}
    <div id="pjSelf" hidden></div>`)}
  ${sec("coach","Project coach",coachHTML(p, st, mi))}
  ${sec("key","Cheatsheet & model answer",keyUnlocked(st)?`
    <div class="note"><b>Open</b> ${st.passed?"because you passed. Compare your approach.":`after ${KEY_AT} unsuccessful reviews. Read it, then rework your submission.`}</div>
    <p><b>How to approach it:</b> ${esc(p.key.approach)}</p>
    <b style="font-size:.9rem">Model answer (excerpt)</b><pre class="doc">${esc(p.key.sample)}</pre>
    <b style="font-size:.9rem">Tips</b><ul class="clean">${p.key.tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`
    :`<div class="inset" style="display:grid;gap:8px"><b>Locked</b><p style="font-size:.92rem">Opens when you pass, or after ${KEY_AT} unsuccessful reviews. Hints open after ${HINT_AT}.</p>${failDots(mi.f)}</div>`)}
  ${st.passed?`<div class="card"><span class="eyebrow">Put it to work</span><h3>Add it to your resume and LinkedIn</h3><div class="inset">${esc(projBullet(p))}</div>
    <div class="row"><button class="btn sm" data-copystr="${esc(projBullet(p))}">Copy resume bullet</button><button class="btn sm ghost" data-go="resume">Open resume builder</button></div>
    <p class="muted" style="font-size:.9rem">Upload the files to a GitHub repository (one folder per project, with a short README covering the scenario, what you did and what you'd do next), then pin it in LinkedIn Featured.</p></div>`:""}`;
}
function failDots(f){ return `<div class="row" aria-label="${f} unsuccessful reviews">${Array.from({length:KEY_AT},(_,i)=>`<span class="dot ${i===HINT_AT-1?"gate":""}" style="background:${i<f?"var(--seal)":"var(--track)"}"></span>`).join("")}<span class="num">${Math.min(f,KEY_AT)}/${KEY_AT} · hints at ${HINT_AT}, cheatsheet at ${KEY_AT}</span></div>`; }
function passBanner(p){ const nx = LADDER[p.topic].find(x=>x.lvl===p.lvl+1), t = TOPIC[p.topic];
  return `<div class="card levelup"><div class="row between"><div><span class="eyebrow">${nx?"Level complete":"Topic mastered"}</span><h3>${nx?`${INTENSITY_NAME[nx.lvl]} level unlocked`:`All three ${esc(t.title)} projects passed`}</h3><p class="muted" style="font-size:.9rem">${nx?esc(nx.objective):"Add the three pieces to your portfolio, then pick your next topic on the Projects page."}</p></div>${nx?`<button class="btn" data-go="proj-${nx.id}">Start ${INTENSITY_NAME[nx.lvl]} →</button>`:`<button class="btn" data-go="projects">Back to Projects</button>`}</div></div>`; }

function coachHTML(p, st, mi){
  const hintsOpen = mi.m !== "guide";
  return `<div class="row between"><span class="pill ${mi.m==="cheat"?"ok":mi.m==="hints"?"warn":"acc"}">${mi.label}</span>${failDots(mi.f)}</div>
    <p class="muted" style="font-size:.9rem">${esc(mi.text)}</p>
    ${hintsOpen?`<div class="inset"><b style="font-size:.9rem">Hints</b><ol class="clean">${(p.hints||[]).map(h=>`<li>${esc(h)}</li>`).join("")}</ol></div>`:""}
    <div class="chat" id="chatLog" aria-live="polite">${st.chat.length?st.chat.map(m=>`<div class="msg ${m.r==="u"?"me":"ai"}">${esc(m.t)}</div>`).join(""):`<div class="msg ai">Hi! I'm the coach for this project. Ask me what any word means, where to start, or whether your thinking is on track. ${mi.m==="guide"?"I'll guide you without giving answers.":mi.m==="hints"?"I can give you hints now.":"I can walk you through the model answer now."}</div>`}</div>
    <div class="row">${[["start","Where do I start?"],["simple","Explain the task in plain words"],["good","What does good work look like?"],...(hintsOpen?[["hint","Give me a hint on what's missing"]]:[]),...(mi.m==="cheat"?[["key","Walk me through the model answer"]]:[])].map(([k,l])=>`<button class="chip" data-pquick="${p.id}|${k}">${l}</button>`).join("")}</div>
    <div class="chatin"><textarea id="chatIn" rows="2" placeholder="Ask the coach…" aria-label="Message to coach"></textarea><button class="btn" data-psend="${p.id}">Send</button></div>
    ${st.chat.length?`<button class="link" data-pclear="${p.id}">Clear chat</button>`:""}`;
}
const QUICK = {start:"Where do I start with this project? Give me the first two concrete things to do.", simple:"Explain this task to me in plain words, as if I'm a law graduate with no tech background.", good:"What does good work on this project look like? Describe the qualities a reviewer looks for, without writing it for me.", hint:"Give me a hint about what my latest submission is missing.", key:"Walk me through the model answer and explain why each part is there."};
let coachCtl = null;
async function coachSend(id, text){
  const p = PROJ[id], st = projState(id), mi = modeInfo(st), log = document.getElementById("chatLog");
  text = String(text||"").trim(); if (!text) return;
  st.chat.push({r:"u", t:text.slice(0,1500)});
  const bubble = document.createElement("div"); bubble.className = "msg me"; bubble.textContent = text; log.appendChild(bubble);
  const ai = document.createElement("div"); ai.className = "msg ai"; ai.textContent = "Thinking…"; log.appendChild(ai); ai.scrollIntoView({block:"nearest"});
  if (!cap.sample) { ai.textContent = "The coach needs Claude, which isn't available in this view. Open Career Count on claude.ai to use it."; st.chat.pop(); return; }
  const rules = mi.m === "guide" ? `MODE: GUIDE. The learner has had ${mi.f} unsuccessful reviews. Do NOT give answers, model content, specific values or a filled-in deliverable. Explain concepts, define terms in plain words, ask one guiding question, and point to the step or topic they should reread. If they ask for the answer, kindly say hints open after ${HINT_AT} unsuccessful reviews and the cheatsheet after ${KEY_AT}.`
    : mi.m === "hints" ? `MODE: HINTS. The learner has had ${mi.f} unsuccessful reviews. You may give specific hints that point at what is missing or wrong (e.g. "check how you counted the days for E146"), and you may use the hints listed below, but do NOT write the full answer or the model content.`
    : `MODE: CHEATSHEET. The learner ${st.passed?"passed":"has had "+mi.f+" unsuccessful reviews"}. You may share and explain the model answer below in full, and explain why each element is there and how professionals would judge it.`;
  const last = st.history[st.history.length-1];
  const prompt = `You are a patient, expert GRC and privacy mentor coaching a law graduate (no tech background) through a portfolio project. Use plain English and short paragraphs, no jargon without a one-line explanation. Keep replies under 180 words unless walking through the model answer.

${rules}

PROJECT (${INTENSITY_NAME[p.lvl]}): ${p.title}
TOPIC: ${TOPIC[p.topic].title}
SCENARIO: ${p.company} ${p.problem}
OBJECTIVE: ${p.objective}
DELIVERABLES: ${p.deliverables.join("; ")}
STEPS: ${p.steps.map(([a,b],i)=>`${i+1}. ${a}: ${b}`).join(" | ")}
MARKING LIST: ${p.rubric.map(([r,c],i)=>`${i}. ${r}${c?" (required)":""}`).join(" | ")}
${p.data?"DATA: "+JSON.stringify(p.data).slice(0,3000):""}
${mi.m!=="guide"?"HINTS: "+(p.hints||[]).join(" | "):""}
${mi.m==="cheat"?"MODEL ANSWER APPROACH: "+p.key.approach+"\nMODEL ANSWER: "+p.key.sample+"\nTIPS: "+p.key.tips.join(" | "):""}
${last?`LATEST REVIEW (${last.pass?"passed":"not passed"}, ${last.score}%): unmet items: ${last.items.map((x,i)=>x.met?null:i).filter(x=>x!==null).join(", ")||"none"}. Main fix: ${last.fix||last.feedback||""}`:"No review submitted yet."}
LEARNER'S CURRENT DRAFT (excerpt): ${(st.draft||"(empty)").slice(0,4000)}

CONVERSATION SO FAR:
${st.chat.slice(-10).map(m=>(m.r==="u"?"Learner: ":"Coach: ")+m.t).join("\n")}

Reply as the Coach to the learner's last message.`;
  try { coachCtl?.abort(); } catch(e) {}
  coachCtl = new AbortController();
  try { const r = await cap.sample(prompt, {onText:({text})=>{ ai.textContent = text; }, signal: coachCtl.signal});
    st.chat.push({r:"a", t:String(r.text||"").slice(0,2500)}); if (st.chat.length > 24) st.chat = st.chat.slice(-24); save("progress"); }
  catch(e) { ai.textContent = (e.text ? e.text + "\n\n" : "") + aiErr(e); st.chat.pop(); }
}

/* ---------- review ---------- */
function renderReview(p, h){
  const t = TOPIC[p.topic];
  return `<div class="row between"><div class="row">${ring(h.score, h.pass?"ok":"")}<div><b>${h.pass?"Passed":"Not passed yet"}</b><div class="num">${esc(h.date)}${h.mode==="self"?" · self-check":" · reviewed by Claude"}</div></div></div></div>
    ${h.strengths?`<div class="info"><b>What you did well:</b> ${esc(h.strengths)}</div>`:""}
    <div style="display:grid;gap:8px">${h.items.map((it,i)=>`<div class="flag"><b class="sev ${it.met?"ok":(p.rubric[i]&&p.rubric[i][1]?"hi":"md")}">${it.met?"Met":"Missing"}</b><span>${esc(p.rubric[i]?p.rubric[i][0]:"")}${it.note?`<br><span class="muted">${esc(it.note)}</span>`:""}${it.why?`<br><span class="num">Why it matters: ${esc(it.why)}</span>`:""}</span></div>`).join("")}</div>
    ${h.approach?`<div class="inset"><b>Your approach, assessed</b><p style="font-size:.92rem">${esc(h.approach)}</p></div>`:""}
    ${h.metrics&&h.metrics.length?`<div class="inset"><b>How professionals judge this work</b><ul class="clean">${h.metrics.map(m=>`<li>${esc(m)}</li>`).join("")}</ul></div>`:""}
    ${(h.fix||h.feedback)?`<div class="note"><b>Most important fix:</b> ${esc(h.fix||h.feedback)}</div>`:""}
    ${h.weak&&h.weak.length?`<div><b style="font-size:.9rem">Study these again</b><div class="row">${h.weak.filter(i=>t.subs[i]).map(i=>`<button class="pill warn" data-go="${t.id}" data-anchor="s-${i}">${esc(t.subs[i].t)}</button>`).join("")}</div></div>`:""}
    ${h.pass?"":`<div class="row"><button class="btn sm ghost" data-anchor="pp-coach">Ask the coach about this review</button></div>`}`;
}
function grade(p, items){
  const metCount = items.filter(x=>x.met).length, score = Math.round(metCount/p.rubric.length*100);
  const reqOk = p.rubric.every(([,c],i) => !c || (items[i] && items[i].met));
  return {score, pass: reqOk && score >= 70};
}
function recordAttempt(p, items, extra, mode){
  const st = projState(p.id), g = grade(p, items), wasPassed = st.passed, before = coachMode(st);
  st.attempts++; st.history.push(Object.assign({date: today(), pass: g.pass, score: g.score, items, mode}, extra));
  if (st.history.length > 10) st.history = st.history.slice(-10);
  if (g.pass) st.passed = true;
  logActivity(g.pass && !wasPassed ? 3 : 1); save("progress"); rerender();
  const after = coachMode(st);
  if (g.pass && !wasPassed) { const b = document.querySelector(".levelup"); if (b) b.scrollIntoView({block:"center"}); }
  else { const o = document.getElementById("pjOut"); if (o) o.scrollIntoView({block:"start"}); }
  if (before !== after && !g.pass) toast(after === "hints" ? "Hints unlocked: see the Coach section." : "Cheatsheet unlocked: see the end of the page.");
}
function toast(msg){ const t = document.createElement("div"); t.className = "toast glass"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 4500); }
async function reviewProject(id){
  const p = PROJ[id], st = projState(id), out = document.getElementById("pjOut"), work = (st.draft||"").trim(), t = TOPIC[p.topic];
  out.hidden = false;
  if (work.length < 150) { out.innerHTML = `<p class="muted">Paste more of your work first (at least a few paragraphs or table rows). Short submissions don't count as an attempt.</p>`; return; }
  if (!cap.sample) { selfCheck(p); return; }
  out.innerHTML = `<p class="muted">Claude is reviewing your work against the marking list…</p>`;
  try {
    const res = await cap.sample.json(`You are a senior GRC / privacy reviewer marking a learner's portfolio project. The learner is a law graduate moving into compliance. Judge ONLY what the submission actually contains; promised or vague content is not met. Reason like a working professional: would an auditor, DPO or hiring manager accept this? Do not write the answer for them${coachMode(st)==="cheat"?"":" and do not reveal the model answer"}.

PROJECT (${INTENSITY_NAME[p.lvl]}): ${p.title}
SCENARIO: ${p.company} ${p.problem}
OBJECTIVE: ${p.objective}
DELIVERABLES: ${p.deliverables.join("; ")}
${p.data?"DATA PROVIDED:\n"+JSON.stringify(p.data).slice(0,5000)+"\n":""}
REFERENCE (for your judgement only, never quote it): ${p.key.approach} ${p.key.sample.slice(0,2500)}

MARKING LIST (numbered):
${p.rubric.map(([r,c],i)=>i+". "+r+(c?" [required]":"")).join("\n")}

TOPIC SUB-TOPICS (numbered, for spotting weak areas):
${t.subs.map((s,i)=>i+". "+s.t).join("\n")}

SUBMISSION:
${work.slice(0,30000)}

Reply with only JSON:
{"items":[{"i":number,"met":boolean,"note":"one plain sentence: what is missing or done well, quoting their work where useful","why":"one sentence: why this item matters in real work"}],
"strengths":"one sentence on what they did well",
"approach":"2-3 sentences assessing their overall method and reasoning, as a professional would",
"metrics":["2-4 short yardsticks professionals use to judge this kind of deliverable"],
"fix":"the single most important thing to change next, without giving the answer",
"weak":[indices of up to 3 sub-topics the learner seems not to understand yet, or [] if none]}
with exactly one item per marking-list entry.`, {cache:false});
    const arr = Array.isArray(res && res.items) ? res.items : [];
    const items = p.rubric.map((_,i) => { const f = arr.find(x => +x.i === i); return {met: !!(f && f.met === true), note: f ? String(f.note||"").slice(0,400) : "Not assessed", why: f ? String(f.why||"").slice(0,300) : ""}; });
    const s = v => String(v||"").slice(0,700);
    recordAttempt(p, items, {strengths:s(res.strengths), approach:s(res.approach), metrics:(Array.isArray(res.metrics)?res.metrics:[]).slice(0,4).map(x=>String(x).slice(0,200)), fix:s(res.fix), weak:(Array.isArray(res.weak)?res.weak:[]).map(Number).filter(i=>Number.isInteger(i)&&t.subs[i]).slice(0,3)}, "claude");
  } catch(e) {
    if (["not_granted","sampling_disabled","capability_disabled","not_declared"].includes(e.code)) { selfCheck(p); return; }
    out.innerHTML = `<p class="muted">${esc((e.code==="invalid_json" ? "The review didn't come back in a readable form. " : aiErr(e) + " ") + "This didn't count as an attempt; try again.")}</p>`;
  }
}
function selfCheck(p){
  const box = document.getElementById("pjSelf"), out = document.getElementById("pjOut");
  out.innerHTML = `<p class="muted">Claude review isn't available in this view, so check your own work honestly against each item, then submit the self-check.</p>`;
  box.hidden = false;
  box.innerHTML = `<div class="inset" style="display:grid;gap:6px">${p.rubric.map(([r,c],i)=>`<label class="learned" style="color:var(--ink)"><input type="checkbox" id="sc-${i}"> ${esc(r)}${c?' <span class="pill hot">required</span>':''}</label>`).join("")}<div><button class="btn sm" id="scGo">Submit self-check</button></div></div>`;
  document.getElementById("scGo").onclick = () => recordAttempt(p, p.rubric.map((_,i)=>({met: document.getElementById("sc-"+i).checked, note:""})), {}, "self");
}

/* ---------- insights (what went wrong, what to study) ---------- */
function practiceScore(id){
  const l = LADDER[id] || [], pj = l.length ? l.filter(p => projGet(p.id).passed).length / l.length : 0, parts = [];
  const z = ZONES.find(x => x.topic === id); if (z) { const ms = zoneMissions(z.id); if (ms.length) parts.push(ms.filter(m => labGet(m.id).done).length / ms.length); }
  const ops = (typeof OPS !== "undefined" ? OPS : []).filter(o => o.topic === id); if (ops.length) parts.push(ops.filter(o => opGet(o.id).done).length / ops.length);
  if (!parts.length) return pj;
  return pj * 0.5 + parts.reduce((a, b) => a + b, 0) / parts.length * 0.5;
}
function collectInsights(){
  const out = [];
  TOPICS.forEach(t => { const a = S.progress.quiz[t.id]; if (!a) return; const wrong = t.quiz.map((q,i)=>a[i]!==undefined && a[i]!==q.a ? i : null).filter(x=>x!==null);
    if (wrong.length) out.push({kind:"Quiz", sev: wrong.length >= 2 ? "hi" : "md", topic:t.id, title:`${wrong.length} quiz answer${wrong.length>1?"s":""} wrong in ${t.title}`, detail: wrong.map(i=>t.quiz[i].q).slice(0,2).join(" · "), go:t.id, anchor:"p-quiz", label:"Retake quiz"}); });
  ALLPROJ.forEach(p => { const st = projGet(p.id), h = st.history[st.history.length-1]; if (!h) return; const t = TOPIC[p.topic];
    if (!h.pass) { const miss = h.items.map((x,i)=>!x.met?p.rubric[i][0]:null).filter(Boolean);
      out.push({kind:"Project", sev: projFails(st) >= HINT_AT ? "hi" : "md", topic:p.topic, title:`${p.title}: ${miss.length} item${miss.length>1?"s":""} still missing`, detail: (h.fix ? "Main fix: " + h.fix + " " : "") + "Missing: " + miss.slice(0,3).join("; "), go:"proj-"+p.id, anchor:"pp-submit", label:"Rework"}); }
    (h.weak||[]).forEach(i => { if (t.subs[i] && !out.some(o=>o.kind==="Concept" && o.key===t.id+i)) out.push({kind:"Concept", key:t.id+i, sev:"md", topic:t.id, title:`Revisit "${t.subs[i].t}"`, detail:`Your ${p.title} review suggests this idea isn't clear yet.`, go:t.id, anchor:"s-"+i, label:"Study"}); }); });
  MISSIONS.forEach(m => { const st = labGet(m.id); if ((st.done && st.stars === 1) || (!st.done && (st.worst||st.tries) >= 3)) { const z = ZONES.find(x=>x.id===m.zone);
    out.push({kind:"Lab", sev: st.done ? "lo" : "md", topic:z.topic, title:`${st.done?"Replay":"Stuck on"} "${m.title}" (${z.name})`, detail: st.done ? "Finished with 1 star. A clean run without hints shows you've got it." : `${st.worst||st.tries} wrong checks so far. Read the concept box, then try again.`, go:"lab-"+m.id, label: st.done?"Replay":"Try again"}); } });
  TOPICS.forEach(t => { if (topicStats(t).p > 0 && topicStats(t).p < 100) (PRE[t.id]||[]).forEach(pid => { if (TOPIC[pid] && topicStats(TOPIC[pid]).p < 50) out.push({kind:"Order", sev:"md", topic:t.id, title:`Finish ${TOPIC[pid].title} before ${t.title}`, detail:`${t.title} builds on ${TOPIC[pid].title}, which is only ${topicStats(TOPIC[pid]).p}% done.`, go:pid, label:"Open"}); }); });
  reviewsDue().forEach(r => out.push({kind:"Review", sev:"lo", topic:r.id, title:`Time to review ${TOPIC[r.id].title}`, detail:"Spaced review: retaking the quiz now fixes it in long-term memory.", go:r.id, anchor:"p-quiz", label:"Review"}));
  ALLPROJ.forEach(p => { const st = projGet(p.id); if (p.lvl > 1 && projUnlocked(p) && !st.passed && !st.attempts && !projPct(p)) out.push({kind:"Level up", sev:"ok", topic:p.topic, title:`${INTENSITY_NAME[p.lvl]} project ready: ${p.title}`, detail:`You passed the previous ${TOPIC[p.topic].title} level.`, go:"proj-"+p.id, label:"Start"}); });
  const order = {hi:0, md:1, ok:2, lo:3}; return out.sort((a,b) => order[a.sev] - order[b.sev]);
}
function topicHealth(){ return TOPICS.map(t => { const ins = collectInsights().filter(i => i.topic === t.id && ["hi","md"].includes(i.sev)).length; return {t, m: Math.round(topicMastery(t)*100), issues: ins}; }); }
function strengths(){ const s = []; ALLPROJ.filter(p=>projGet(p.id).passed).forEach(p => s.push(`Passed ${INTENSITY_NAME[p.lvl]} project: ${p.title}`)); MISSIONS.filter(m=>labGet(m.id).stars===3).forEach(m=>s.push(`3-star Lab run: ${m.title}`)); TOPICS.filter(t=>quizStats(t).pass).forEach(t=>s.push(`Quiz passed: ${t.title}`)); return s; }
let insFilter = "all";
function viewInsights(){
  const all = collectInsights(), kinds = [...new Set(all.map(i=>i.kind))], list = all.filter(i => insFilter==="all" || i.kind===insFilter), str = strengths();
  const weakT = TOPICS.map(t=>({t, n: all.filter(i=>i.topic===t.id && ["hi","md"].includes(i.sev)).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,5);
  return `<div><span class="eyebrow">Insights</span><h2>What to fix, what to study next</h2></div>
  <p class="lede">Built from your quiz answers, project reviews, Cyber Lab runs and learning order. It updates every time you practise.</p>
  <div class="grid4">
    <div class="card tile"><span class="lbl">Needs attention</span><span class="big">${all.filter(i=>i.sev==="hi").length}</span><span class="num">high-priority items</span></div>
    <div class="card tile"><span class="lbl">To improve</span><span class="big">${all.filter(i=>i.sev==="md").length}</span><span class="num">gaps and concepts</span></div>
    <div class="card tile"><span class="lbl">Ready for you</span><span class="big">${all.filter(i=>i.sev==="ok").length}</span><span class="num">new levels unlocked</span></div>
    <div class="card tile"><span class="lbl">Strengths</span><span class="big">${str.length}</span><span class="num">proven skills</span></div>
  </div>
  <div class="grid2">
    <div class="card"><span class="eyebrow">Weakest topics right now</span>${weakT.length?weakT.map(x=>`<div class="rrow"><div style="min-width:0"><button class="link strong" data-go="${x.t.id}">${esc(x.t.title)}</button>${bar(Math.round(topicMastery(x.t)*100),"acc")}</div><span class="pill warn">${x.n} issue${x.n>1?"s":""}</span></div>`).join(""):`<p class="muted">No weak spots detected yet. Take quizzes and submit projects so this can find them.</p>`}</div>
    <div class="card"><span class="eyebrow">Your study plan</span><p class="muted" style="font-size:.9rem">Claude reads these insights and writes a plan for the next 7 days.</p><button class="btn" id="insPlan">Ask the coach for a plan</button><div id="insOut" class="ai" hidden></div></div>
  </div>
  <div class="card"><div class="row between"><h3>All insights</h3><div class="seg" role="group" aria-label="Filter">${["all",...kinds].map(k=>`<button aria-pressed="${insFilter===k}" data-insf="${k}">${k==="all"?"All":k}</button>`).join("")}</div></div>
    ${list.length?`<div style="display:grid;gap:8px">${list.map(i=>`<div class="insight ${i.sev}"><div style="min-width:0"><div class="row"><span class="pill">${esc(i.kind)}</span><b>${esc(i.title)}</b></div><p class="muted" style="font-size:.88rem;margin:4px 0 0">${esc(i.detail)}</p></div><button class="btn sm ghost" data-go="${esc(i.go)}" ${i.anchor?`data-anchor="${esc(i.anchor)}"`:""}>${esc(i.label)}</button></div>`).join("")}</div>`:`<p class="muted">Nothing here yet. Start learning, quiz yourself, and submit a project to get personal feedback.</p>`}</div>
  ${str.length?`<div class="card"><span class="eyebrow">Strengths you can talk about in interviews</span><ul class="clean">${str.slice(0,12).map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`:""}`;
}
function insightsPlan(){
  const all = collectInsights().slice(0,25), out = document.getElementById("insOut");
  const prompt = `You are a study coach for a law graduate moving into Privacy & GRC jobs in India. Using ONLY the signals below, write a 7-day plan (one short line per day: what to study or redo, and why) and end with the single habit that would help most. Plain English, under 260 words.
Target roles: ${(S.profile.targets||[]).map(r=>ROLE[r]&&ROLE[r].name).filter(Boolean).join(", ")||"not set"}
Overall learning path: ${groupStats(TOPICS).p}% · projects passed: ${passedCount()}/${ALLPROJ.length} · Lab missions done: ${MISSIONS.filter(m=>labGet(m.id).done).length}/${MISSIONS.length}
Signals:
${all.map(i=>`- [${i.kind}/${i.sev}] ${i.title}: ${i.detail}`).join("\n") || "- No issues yet; learner is early. Suggest starting with the first topics."}
Weakest mastery: ${TOPICS.map(t=>[t.title, Math.round(topicMastery(t)*100)]).sort((a,b)=>a[1]-b[1]).slice(0,5).map(x=>x.join(" ")+"%").join(", ")}`;
  stream(prompt, out);
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-pfilter],[data-pgroup],[data-pjreview],[data-pquick],[data-psend],[data-pclear],[data-pexplain],[data-insf],#insPlan"); if (!el) return;
  const d = el.dataset;
  if (d.pfilter) { projFilter = d.pfilter; render(); return; }
  if (d.pgroup) { projGroup = d.pgroup; render(); return; }
  if (d.pjreview) { reviewProject(d.pjreview); return; }
  if (d.pquick) { const [id,k] = d.pquick.split("|"); coachSend(id, QUICK[k]); return; }
  if (d.psend) { const i = document.getElementById("chatIn"); const v = i.value; i.value = ""; coachSend(d.psend, v); return; }
  if (d.pclear) { projState(d.pclear).chat = []; save("progress"); rerender(); return; }
  if (d.pexplain) { const [id,i] = d.pexplain.split("|"), p = PROJ[id]; document.getElementById("pp-coach").scrollIntoView({block:"start"}); coachSend(id, `Explain step ${+i+1} ("${p.steps[+i][0]}") in more depth: what exactly do I do, and what does it look like when done well?`); return; }
  if (d.insf) { insFilter = d.insf; render(); return; }
  if (el.id === "insPlan") { insightsPlan(); return; }
});
document.addEventListener("keydown", e => { if (e.target.id === "chatIn" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const b = document.querySelector("[data-psend]"); if (b) b.click(); } });
document.addEventListener("input", e => { const id = e.target.dataset && e.target.dataset.pjdraft; if (!id) return; projState(id).draft = e.target.value; save("progress"); });
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

function viewProject(p){ const h = viewProjectBase(p); return projUnlocked(p) ? h + githubCard(p) : h; }
function viewProjects(){ return viewProjectsBase() + ghPortfolioCard(); }
