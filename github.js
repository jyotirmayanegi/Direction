/* ================= GITHUB PORTFOLIO: package, push and pull projects ================= */
/* Method (what hiring managers look for in GRC portfolios):
   - ONE portfolio repository (e.g. grc-portfolio), one folder per project: projects/<subject>/<project-id>/
   - each folder: README.md as a case study (scenario, problem, approach, deliverables, result, what I'd do next),
     deliverable.md (your work), review.md (latest review + rubric), CHANGELOG.md (versions)
   - root README.md is an index table of all projects, regenerated on each push
   - Conventional Commit messages ("docs(dpdp-2): v2 after Intermediate review") and versions in the CHANGELOG
   - synthetic data only, never real personal data; licence CC BY 4.0 for documents
   Direct push/pull uses GitHub's REST contents API with a fine-grained token limited to that one repository,
   kept only in this browser. If this view blocks direct calls, the ZIP + GitHub web upload route always works. */
const GH_API = "https://api.github.com";
function ghCfg(){ return Object.assign({repo:"", branch:"main", root:"projects"}, S.progress.gh || {}); }
function ghToken(){ try { return localStorage.getItem(LS("ghtoken")) || ""; } catch(e) { return ""; } }
function ghSetToken(t){ try { t ? localStorage.setItem(LS("ghtoken"), t) : localStorage.removeItem(LS("ghtoken")); } catch(e) {} }
function ghState(id){ const st = projState(id); return (st.gh ||= {version:0, sha:{}, pushedAt:"", pulledAt:""}); }
const slug = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,50);
function ghFolder(p){ const c = ghCfg(); return `${c.root.replace(/^\/|\/$/g,"")}/${p.topic}/${p.id}-${slug(p.title)}`; }
function ghFiles(p){
  const st = projGet(p.id), t = TOPIC[p.topic], last = st.history[st.history.length-1], gs = ghState(p.id), ver = (gs.version||0) + 1, date = today();
  const readme = `# ${p.title}

**Subject:** ${t.title} · **Level:** ${INTENSITY_NAME[p.lvl]} · **Time:** ${p.hours||""}
${st.passed ? "**Status:** Passed review ✅" : "**Status:** In progress"} · **Version:** v${ver} (${date})

> Portfolio project by ${S.profile.name || "Jyotirmaya Negi"}. All company names and data are fictional or synthetic.

## Scenario
${p.company}

## Problem
${p.problem}

## Objective
${p.objective}

## What I delivered
${p.deliverables.map(d=>"- "+d).join("\n")}

## Approach
${p.steps.map(([a,b],i)=>`${i+1}. **${a}** — ${b}`).join("\n")}

## Skills shown
${projRoles(p).map(r=>"- "+(ROLE[r]?ROLE[r].name:r)).join("\n")}
${(projCerts(p)||[]).length ? "\nRelevant certifications: " + projCerts(p).map(c=>CERT[c]?CERT[c].name:c).join(", ") : ""}

## Result
${last ? `Latest review: ${last.pass ? "passed" : "not yet passed"}, ${last.score}% of the marking list met (${last.date}).${last.strengths ? " Strength noted: " + last.strengths : ""}` : "Not reviewed yet."}

## What I'd do next
${last && last.fix ? "- " + last.fix : "- Extend the analysis with real-world templates and peer feedback."}

## Files
- [deliverable.md](deliverable.md) — my work
- [review.md](review.md) — review against the marking list
- [CHANGELOG.md](CHANGELOG.md) — versions
`;
  const deliverable = `# ${p.title} — deliverable\n\n${(st.draft||"").trim() || "_Work in progress._"}\n`;
  const review = `# Review: ${p.title}\n\n${last ? `Date: ${last.date} · Result: ${last.pass?"Passed":"Not yet"} · Score: ${last.score}%\n\n| # | Marking item | Met | Note |\n|---|---|---|---|\n${p.rubric.map(([r,c],i)=>`| ${i+1} | ${r}${c?" (required)":""} | ${last.items[i]&&last.items[i].met?"Yes":"No"} | ${String((last.items[i]||{}).note||"").replace(/\|/g,"/").replace(/\n/g," ")} |`).join("\n")}\n${last.approach?"\n**Approach assessed:** "+last.approach+"\n":""}` : "Not reviewed yet."}\n`;
  const log = (gs.changelog || []).concat([`## v${ver} — ${date}\n- ${st.passed ? "Passed review" : "Work in progress"}${last ? ` (${last.score}%)` : ""}`]);
  return {files: {"README.md":readme, "deliverable.md":deliverable, "review.md":review, "CHANGELOG.md":"# Changelog\n\n" + log.slice().reverse().join("\n\n") + "\n"}, ver, logEntry: log[log.length-1]};
}
function ghIndex(){
  const rows = ALLPROJ.filter(p => projGet(p.id).gh && projGet(p.id).gh.pushedAt).map(p => { const st = projGet(p.id); return `| [${p.title}](${ghFolder(p)}/) | ${TOPIC[p.topic].title} | ${INTENSITY_NAME[p.lvl]} | ${st.passed?"Passed ✅":"In progress"} | v${st.gh.version} |`; });
  return `# GRC, Privacy & AI Governance Portfolio\n\n${S.profile.name || "Jyotirmaya Negi"} — ${S.profile.headline || "Law graduate (Advocate) moving into Privacy, GRC and AI governance"}\n\nEach folder is a case study built on a realistic scenario with synthetic data: the problem, my approach, the deliverable, and a review against a professional marking list.\n\n| Project | Subject | Level | Status | Version |\n|---|---|---|---|---|\n${rows.join("\n") || "| _First project coming soon_ | | | | |"}\n\n## Skills\nDPDP Act & Rules · GDPR · ISO/IEC 27001 · ISO/IEC 42001 · EU AI Act · Risk assessment · Vendor risk · Audit evidence · Privacy operations\n\n_All data is fictional. Licence: CC BY 4.0._\n`;
}

/* ---------- tiny ZIP writer (stored, no compression) ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n=0;n<256;n++){ let c=n; for (let k=0;k<8;k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n]=c>>>0; } return t; })();
function crc32(b){ let c = 0xFFFFFFFF; for (let i=0;i<b.length;i++) c = CRC_T[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zipFiles(files){
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  const d = new Date(), dt = ((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1)) & 0xFFFF, dd = (((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()) & 0xFFFF;
  for (const [name, text] of Object.entries(files)) {
    const nb = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30)); h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(8,0,true); h.setUint16(10,dt,true); h.setUint16(12,dd,true); h.setUint32(14,crc,true); h.setUint32(18,data.length,true); h.setUint32(22,data.length,true); h.setUint16(26,nb.length,true); h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer), nb, data);
    const c = new DataView(new ArrayBuffer(46)); c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint16(10,0,true); c.setUint16(12,dt,true); c.setUint16(14,dd,true); c.setUint32(16,crc,true); c.setUint32(20,data.length,true); c.setUint32(24,data.length,true); c.setUint16(28,nb.length,true); c.setUint32(42,off,true);
    central.push(new Uint8Array(c.buffer), nb); off += 30 + nb.length + data.length;
  }
  const cs = central.reduce((a,b)=>a+b.length,0), e = new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,Object.keys(files).length,true); e.setUint16(10,Object.keys(files).length,true); e.setUint32(12,cs,true); e.setUint32(16,off,true);
  const all = [...parts, ...central, new Uint8Array(e.buffer)], out = new Uint8Array(all.reduce((a,b)=>a+b.length,0)); let p = 0; all.forEach(b => { out.set(b, p); p += b.length; }); return out;
}

/* ---------- GitHub REST calls ---------- */
const b64u = s => { const b = new TextEncoder().encode(s); let bin = ""; for (let i=0;i<b.length;i+=0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i+0x8000)); return btoa(bin); };
const u64b = s => new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/\s/g,"")), c => c.charCodeAt(0)));
async function gh(method, path, body){
  const tok = ghToken(); if (!tok) throw {code:"no_token", message:"Add a GitHub token first."};
  let r; try { r = await fetch(GH_API + path, {method, headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer " + tok,"X-GitHub-Api-Version":"2022-11-28", ...(body?{"Content-Type":"application/json"}:{})}, body: body ? JSON.stringify(body) : undefined}); }
  catch(e) { throw {code:"blocked", message:"This view can't reach GitHub directly. Use 'Download repo ZIP' and upload on github.com instead."}; }
  if (r.status === 404 && method === "GET") return null;
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw {code:"http_" + r.status, message: r.status === 401 ? "GitHub rejected the token (expired or wrong)." : r.status === 403 ? "The token lacks permission for this repository (needs Contents: read and write)." : r.status === 409 ? "The branch changed on GitHub. Pull first, then push again." : r.status === 422 ? "GitHub couldn't accept the file (check the branch name)." : (j.message || "GitHub error " + r.status)};
  return j;
}
const ghPathEnc = p => p.split("/").map(encodeURIComponent).join("/");
async function ghPutFile(path, text, message){
  const c = ghCfg(), cur = await gh("GET", `/repos/${c.repo}/contents/${ghPathEnc(path)}?ref=${encodeURIComponent(c.branch)}`);
  if (cur && cur.content && u64b(cur.content) === text) return {skipped:true, sha:cur.sha};
  const res = await gh("PUT", `/repos/${c.repo}/contents/${ghPathEnc(path)}`, {message, content:b64u(text), branch:c.branch, ...(cur && cur.sha ? {sha:cur.sha} : {})});
  return {sha: res && res.content && res.content.sha};
}
async function ghPush(id){
  const p = PROJ[id], c = ghCfg(), msg = document.getElementById("ghMsg"), gs = ghState(id);
  if (!/^[\w.-]+\/[\w.-]+$/.test(c.repo)) { msg.textContent = "Set your repository as owner/name first (for example jyotirmayanegi/grc-portfolio)."; return; }
  const {files, ver, logEntry} = ghFiles(p), folder = ghFolder(p), st = projGet(id), last = st.history[st.history.length-1];
  const commit = `docs(${p.id}): v${ver} ${st.passed ? "passed " + INTENSITY_NAME[p.lvl] + " review" : "work in progress"}${last ? " (" + last.score + "%)" : ""}`;
  msg.textContent = "Pushing to GitHub…"; let n = 0;
  try {
    for (const [name, text] of Object.entries(files)) { const r = await ghPutFile(`${folder}/${name}`, text, commit); if (!r.skipped) n++; gs.sha[name] = r.sha; msg.textContent = `Pushing… ${name}`; }
    gs.version = ver; gs.pushedAt = new Date().toISOString(); gs.changelog = (gs.changelog||[]).concat([logEntry]).slice(-20); gs.url = `https://github.com/${c.repo}/tree/${encodeURIComponent(c.branch)}/${folder}`;
    save("progress");
    await ghPutFile("README.md", ghIndex(), "docs: update portfolio index");
    logActivity(1); save("progress");
    msg.innerHTML = `Pushed v${ver} (${n} file${n===1?"":"s"} changed). <a href="${esc(gs.url)}" target="_blank" rel="noopener">Open on GitHub</a>`;
  } catch(e) { msg.textContent = e.message || "Push failed."; }
}
async function ghPull(id){
  const p = PROJ[id], c = ghCfg(), msg = document.getElementById("ghMsg");
  if (!/^[\w.-]+\/[\w.-]+$/.test(c.repo)) { msg.textContent = "Set your repository first."; return; }
  msg.textContent = "Pulling from GitHub…";
  try {
    const f = await gh("GET", `/repos/${c.repo}/contents/${ghPathEnc(ghFolder(p) + "/deliverable.md")}?ref=${encodeURIComponent(c.branch)}`);
    if (!f) { msg.textContent = "No deliverable.md for this project on GitHub yet. Push first."; return; }
    const remote = u64b(f.content).replace(/^# .*?— deliverable\s*/, "").trim(), st = projState(id), local = (st.draft||"").trim();
    if (remote === local) { msg.textContent = "Already up to date."; return; }
    ghPending = {id, remote};
    msg.innerHTML = `GitHub has a different version (${remote.length} characters vs ${local.length} here). <button class="btn sm" data-ghapply="${esc(id)}">Replace my draft with GitHub's</button> <button class="link" data-ghkeep="1">Keep mine</button>`;
  } catch(e) { msg.textContent = e.message || "Pull failed."; }
}
let ghPending = null, ghSetupOpen = false;
async function ghZip(id){
  const p = PROJ[id], {files} = ghFiles(p), folder = ghFolder(p), msg = document.getElementById("ghMsg");
  const all = {}; Object.entries(files).forEach(([n,t]) => all[`${folder}/${n}`] = t); all["README.md"] = ghIndex();
  const dl = await claude.use("downloads").catch(() => null);
  if (!dl) { msg.textContent = "Downloads aren't available in this view."; return; }
  try { await dl.save({filename:`${p.id}-portfolio.zip`, data: new Blob([zipFiles(all)], {type:"application/zip"})}); msg.textContent = "ZIP handed over. Unzip, then drag the folders into your repo on github.com (Add file → Upload files)."; }
  catch(e) { msg.textContent = e && e.code === "declined" ? "Download cancelled." : "Couldn't create the ZIP."; }
}
async function ghTest(){
  const c = ghCfg(), msg = document.getElementById("ghMsg");
  try { const r = await gh("GET", `/repos/${c.repo}`); msg.textContent = r ? `Connected to ${r.full_name} (${r.private?"private":"public"}, default branch ${r.default_branch}).` : "Repository not found. Create it first, or check the name."; if (r && r.default_branch && r.default_branch !== c.branch) { S.progress.gh = Object.assign(ghCfg(), {branch:r.default_branch}); save("progress"); } }
  catch(e) { msg.textContent = e.message; }
}
function githubCard(p){
  const c = ghCfg(), gs = (projGet(p.id).gh) || {}, tok = !!ghToken(), st = projGet(p.id);
  return `<section class="card ghcard" id="pp-github"><div class="row between"><div><span class="eyebrow">Portfolio</span><h3>Publish to GitHub</h3></div>${gs.pushedAt?`<a class="pill ok" href="${esc(gs.url||"#")}" target="_blank" rel="noopener">v${gs.version} on GitHub</a>`:`<span class="pill">Not published yet</span>`}</div>
    <p class="muted" style="font-size:.9rem">Turn this project into a case study recruiters can open: a README (scenario → approach → result), your deliverable, the review and a changelog. Push again after each improvement to show progress.</p>
    <div class="form"><label class="f">Repository (owner/name)<input type="text" id="ghRepo" value="${esc(c.repo)}" placeholder="jyotirmayanegi/grc-portfolio"></label><label class="f">Branch<input type="text" id="ghBranch" value="${esc(c.branch)}"></label></div>
    <div class="row"><button class="btn" data-ghpush="${p.id}" ${tok?"":"disabled"}>Push to GitHub</button><button class="btn ghost" data-ghpull="${p.id}" ${tok?"":"disabled"}>Pull my latest</button><button class="btn ghost" data-ghzip="${p.id}">Download repo ZIP</button><button class="link" data-ghprev="${p.id}">Preview README</button></div>
    <div class="num" id="ghMsg">${tok?"Token saved on this device.":"Add a token below for one-click push and pull, or use the ZIP."}</div>
    <div id="ghPrev" hidden></div>
    <details class="ghsetup" ${ghSetupOpen?"open":""}><summary class="link">${tok?"GitHub connection":"Connect GitHub (5 minutes)"}</summary>
      <ol class="clean numbered"><li>Create the repository: <a href="https://github.com/new" target="_blank" rel="noopener">github.com/new</a> → name <code>grc-portfolio</code>, Public, add a README.</li>
      <li>Create a fine-grained token: <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → Settings → Developer settings → Fine-grained tokens</a>. Repository access: <b>only</b> grc-portfolio. Permissions: <b>Contents: Read and write</b>. Expiry: 90 days.</li>
      <li>Paste it here. It stays in this browser only (never synced or sent anywhere except GitHub).</li></ol>
      <div class="row"><input type="password" id="ghTok" placeholder="github_pat_…" autocomplete="off" style="flex:1;min-width:200px"><button class="btn sm" data-ghsave="1">Save token</button><button class="btn sm ghost" data-ghtest="1">Test</button>${tok?`<button class="link" data-ghforget="1">Forget token</button>`:""}</div>
      <p class="num">Working with git on a computer instead? Clone once: <code>git clone https://github.com/${esc(c.repo||"you/grc-portfolio")}.git</code>, then after each Download repo ZIP: unzip into the folder, <code>git add .</code>, <code>git commit -m "docs(${esc(p.id)}): v${(gs.version||0)+1}"</code>, <code>git push</code>. To get changes you made on github.com: <code>git pull</code>. GitHub Desktop does the same with buttons.</p></details>
    ${st.passed?"":`<p class="num">Tip: publish after you pass, then push again whenever you improve it.</p>`}</section>`;
}
function ghPortfolioCard(){
  const pushed = ALLPROJ.filter(p => projGet(p.id).gh && projGet(p.id).gh.pushedAt), passed = ALLPROJ.filter(p => projGet(p.id).passed), c = ghCfg();
  return `<div class="card"><div class="row between"><div><span class="eyebrow">GitHub portfolio</span><h3>${pushed.length} project${pushed.length===1?"":"s"} published${c.repo?` to ${esc(c.repo)}`:""}</h3></div>${c.repo?`<a class="btn sm ghost" href="https://github.com/${esc(c.repo)}" target="_blank" rel="noopener">Open repository</a>`:""}</div>
    <p class="muted" style="font-size:.9rem">${passed.length - passed.filter(p=>projGet(p.id).gh&&projGet(p.id).gh.pushedAt).length} passed project(s) not yet published. Pin the repository on your GitHub profile and add it to LinkedIn Featured.</p>
    ${pushed.length?`<div style="display:grid;gap:4px">${pushed.map(p=>`<div class="row between"><button class="link" data-go="proj-${p.id}">${esc(p.title)}</button><span class="num">v${projGet(p.id).gh.version} · ${esc(String(projGet(p.id).gh.pushedAt).slice(0,10))}</span></div>`).join("")}</div>`:""}</div>`;
}
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-ghpush],[data-ghpull],[data-ghzip],[data-ghprev],[data-ghsave],[data-ghtest],[data-ghforget],[data-ghapply],[data-ghkeep]"); if (!el) return;
  const d = el.dataset, cfgFromForm = () => { const r = document.getElementById("ghRepo"), b = document.getElementById("ghBranch"); if (r) S.progress.gh = Object.assign(ghCfg(), {repo:r.value.trim().replace(/^https:\/\/github\.com\//,"").replace(/\.git$/,"").replace(/\/$/,""), branch:(b && b.value.trim()) || "main"}); save("progress"); };
  if (d.ghsave) { const t = (document.getElementById("ghTok").value||"").trim(); if (!/^(github_pat_|ghp_)/.test(t)) { document.getElementById("ghMsg").textContent = "That doesn't look like a GitHub token (it starts with github_pat_)."; return; } ghSetToken(t); cfgFromForm(); ghSetupOpen = true; rerender(); const m = document.getElementById("ghMsg"); if (m) m.textContent = "Token saved on this device. Press Test to check the connection."; return; }
  if (d.ghforget) { ghSetToken(""); rerender(); return; }
  if (d.ghtest) { cfgFromForm(); ghTest(); return; }
  if (d.ghpush) { cfgFromForm(); ghPush(d.ghpush); return; }
  if (d.ghpull) { cfgFromForm(); ghPull(d.ghpull); return; }
  if (d.ghzip) { cfgFromForm(); ghZip(d.ghzip); return; }
  if (d.ghprev) { const b = document.getElementById("ghPrev"); b.hidden = !b.hidden; if (!b.hidden) b.innerHTML = `<pre class="doc">${esc(ghFiles(PROJ[d.ghprev]).files["README.md"])}</pre>`; return; }
  if (d.ghapply && ghPending && ghPending.id === d.ghapply) { projState(d.ghapply).draft = ghPending.remote; const gs = ghState(d.ghapply); gs.pulledAt = new Date().toISOString(); save("progress"); ghPending = null; rerender(); toast("Draft updated from GitHub."); return; }
  if (d.ghkeep) { ghPending = null; document.getElementById("ghMsg").textContent = "Kept your version. Push to overwrite GitHub's copy."; }
});
