/* ================= TOOL ZONES + KQL CONSOLE ================= */
const SL = (t,u,ip,loc,rt,app) => ({TimeGenerated:t, UserPrincipalName:u+"@kavach.in", IPAddress:ip, Location:loc, ResultType:rt, ResultDescription: rt==="0"?"Success":rt==="50126"?"Invalid username or password":"Other", AppDisplayName:app});
const OA = (t,u,ip,op,item) => ({TimeGenerated:t, UserId:u+"@kavach.in", ClientIP:ip, Operation:op, Item:item});
const KQLDB = {
  SigninLogs: {cols:["TimeGenerated","UserPrincipalName","IPAddress","Location","ResultType","ResultDescription","AppDisplayName"], rows:[
    SL("01:10","a.das","203.0.113.77","RU","50126","Office 365"), SL("01:10","k.nair","203.0.113.77","RU","50126","Office 365"), SL("01:11","s.iyer","203.0.113.77","RU","50126","Office 365"),
    SL("01:11","m.rao","203.0.113.77","RU","50126","Office 365"), SL("01:12","p.shah","203.0.113.77","RU","50126","Office 365"), SL("01:12","r.verma","203.0.113.77","RU","50126","Office 365"),
    SL("01:13","j.negi","203.0.113.77","RU","50126","Office 365"), SL("01:20","r.verma","203.0.113.77","RU","50126","Office 365"), SL("01:21","r.verma","203.0.113.77","RU","50126","Office 365"),
    SL("01:22","r.verma","203.0.113.77","RU","50126","Office 365"),
    SL("08:30","a.das","10.0.4.40","IN","0","Outlook"), SL("08:45","s.iyer","10.0.4.21","IN","0","Teams"), SL("08:59","r.verma","10.0.4.51","IN","50126","SharePoint"),
    SL("09:01","k.nair","10.0.4.33","IN","50126","Outlook"), SL("09:01","k.nair","10.0.4.33","IN","50126","Outlook"), SL("09:02","k.nair","10.0.4.33","IN","0","Outlook"),
    SL("09:05","m.rao","49.36.22.18","IN","0","Outlook"), SL("09:10","r.verma","10.0.4.51","IN","0","SharePoint"), SL("09:40","p.shah","10.0.4.60","IN","0","Teams"),
    SL("09:52","p.shah","45.83.10.9","BR","0","SharePoint"), SL("10:15","j.negi","10.0.4.70","IN","0","Outlook"), SL("11:30","a.das","10.0.4.40","IN","0","SharePoint")]},
  OfficeActivity: {cols:["TimeGenerated","UserId","ClientIP","Operation","Item"], rows:[
    OA("08:50","s.iyer","10.0.4.21","FileAccessed","weekly_report.xlsx"), OA("09:15","r.verma","10.0.4.51","FileModified","vendor_list.xlsx"),
    OA("09:45","p.shah","10.0.4.60","FileAccessed","team_rota.docx"), OA("09:54","p.shah","45.83.10.9","FileDownloaded","vendor_bank_details.xlsx"),
    OA("09:58","p.shah","45.83.10.9","FileDownloaded","kyc_batch_oct.zip"), OA("10:01","p.shah","45.83.10.9","New-InboxRule","Forward to backup.ps@proton.me"),
    OA("10:20","j.negi","10.0.4.70","FileAccessed","policy_draft.docx"), OA("11:35","a.das","10.0.4.40","FileDownloaded","q3_audit_plan.pdf")]}
};
const KQL_CHEAT = `Table
| where Column == "value"          (also !=, contains, startswith, >, <, in ("a","b"))
| where A == "x" and B != "y"
| summarize count() by Column       (also dcount(Col), make_set(Col), min(Col), max(Col))
| sort by count_ desc              (or order by; asc for smallest first)
| project Col1, Col2               (choose columns)
| distinct Col
| take 10                          (or limit)
| count`;

function kqlSplit(s, sep){ const out = []; let cur = "", q = null, d = 0;
  for (let i = 0; i < s.length; i++) { const ch = s[i];
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === "(") d++; if (ch === ")") d--;
    if (d === 0 && s.slice(i, i + sep.length).toLowerCase() === sep) { out.push(cur); cur = ""; i += sep.length - 1; continue; }
    cur += ch; }
  out.push(cur); return out.map(x => x.trim()); }
function kqlVal(v){ v = v.trim(); if (/^(".*"|'.*')$/.test(v)) return v.slice(1,-1); if (/^-?\d+(\.\d+)?$/.test(v)) return +v; if (/^\(.*\)$/.test(v)) return kqlSplit(v.slice(1,-1), ",").map(kqlVal); throw new Error(`I couldn't read the value ${v}. Put text in "double quotes".`); }
function kqlCond(cond, cols){
  const ors = kqlSplit(cond, " or ").map(o => kqlSplit(o, " and ").map(c => {
    const m = c.match(/^([A-Za-z_]\w*)\s*(==|!=|=~|!~|>=|<=|>|<|!contains|contains|!has|has|!startswith|startswith|!in|in)\s*(.+)$/i);
    if (!m) throw new Error(`I couldn't read the condition "${c}". Try Column == "value".`);
    const col = m[1], op = m[2].toLowerCase(), val = kqlVal(m[3]);
    if (!cols.includes(col)) throw new Error(`There's no column called ${col}. Columns here: ${cols.join(", ")} (names are case-sensitive).`);
    return {col, op, val}; }));
  return row => ors.some(ands => ands.every(({col,op,val}) => { const x = row[col], xs = String(x).toLowerCase(), vs = String(val).toLowerCase(); const num = typeof val === "number" && !isNaN(+x);
    switch (op) { case "==": return String(x) === String(val); case "!=": return String(x) !== String(val); case "=~": return xs === vs; case "!~": return xs !== vs;
      case ">": return num ? +x > val : String(x) > String(val); case "<": return num ? +x < val : String(x) < String(val); case ">=": return num ? +x >= val : String(x) >= String(val); case "<=": return num ? +x <= val : String(x) <= String(val);
      case "contains": case "has": return xs.includes(vs); case "!contains": case "!has": return !xs.includes(vs); case "startswith": return xs.startsWith(vs); case "!startswith": return !xs.startsWith(vs);
      case "in": return [].concat(val).map(String).includes(String(x)); case "!in": return ![].concat(val).map(String).includes(String(x)); } return false; }));
}
function kqlRun(q){
  const segs = kqlSplit(q.replace(/\/\/.*$/gm, "").replace(/\s+/g, " ").trim(), "|");
  const tname = segs[0]; const tbl = KQLDB[tname] || KQLDB[Object.keys(KQLDB).find(k => k.toLowerCase() === (tname||"").toLowerCase())];
  if (!tbl) throw new Error(`Start with a table name: ${Object.keys(KQLDB).join(" or ")}.`);
  let cols = tbl.cols.slice(), rows = tbl.rows.map(r => Object.assign({}, r));
  for (const seg of segs.slice(1)) {
    const m = seg.match(/^(\w+)\s*(.*)$/); if (!m) throw new Error("Empty step after a | . Remove the extra pipe.");
    const op = m[1].toLowerCase(), rest = m[2].trim();
    if (op === "where") { const f = kqlCond(rest, cols); rows = rows.filter(f); }
    else if (op === "take" || op === "limit") { const n = parseInt(rest); if (isNaN(n)) throw new Error("take needs a number, e.g. take 10"); rows = rows.slice(0, n); }
    else if (op === "count") { rows = [{Count: rows.length}]; cols = ["Count"]; }
    else if (op === "project") { const ps = kqlSplit(rest, ",").filter(Boolean); ps.forEach(c => { if (!cols.includes(c)) throw new Error(`There's no column called ${c}. Columns: ${cols.join(", ")}`); }); rows = rows.map(r => Object.fromEntries(ps.map(c => [c, r[c]]))); cols = ps; }
    else if (op === "distinct") { const ps = kqlSplit(rest, ",").filter(Boolean); ps.forEach(c => { if (!cols.includes(c)) throw new Error(`There's no column called ${c}.`); }); const seen = new Set(); rows = rows.filter(r => { const k = ps.map(c => r[c]).join("\u0001"); if (seen.has(k)) return false; seen.add(k); return true; }).map(r => Object.fromEntries(ps.map(c => [c, r[c]]))); cols = ps; }
    else if (op === "sort" || op === "order") { const mm = rest.match(/^by\s+(\w+)(\s+(asc|desc))?$/i); if (!mm) throw new Error("Use: sort by Column desc"); const c = mm[1], dir = (mm[3]||"desc").toLowerCase() === "asc" ? 1 : -1; if (!cols.includes(c)) throw new Error(`There's no column called ${c}. Columns: ${cols.join(", ")}`);
      rows = rows.slice().sort((a,b) => { const x = a[c], y = b[c]; const n = typeof x === "number" && typeof y === "number"; return (n ? x - y : String(x).localeCompare(String(y))) * dir; }); }
    else if (op === "summarize") {
      const parts = kqlSplit(rest, " by "); const aggStr = parts[0], by = parts[1] ? kqlSplit(parts[1], ",").filter(Boolean) : [];
      by.forEach(c => { if (/bin\(/i.test(c)) throw new Error("bin() isn't supported in this practice console; group by a column instead."); if (!cols.includes(c)) throw new Error(`There's no column called ${c}. Columns: ${cols.join(", ")}`); });
      const aggs = kqlSplit(aggStr, ",").filter(Boolean).map(a => { const mm = a.match(/^(?:(\w+)\s*=\s*)?(count|dcount|make_set|min|max|sum)\(\s*(\w*)\s*\)$/i); if (!mm) throw new Error(`I couldn't read "${a}". Try count(), dcount(Column) or make_set(Column).`);
        const fn = mm[2].toLowerCase(), arg = mm[3]; if (fn !== "count" && !cols.includes(arg)) throw new Error(`There's no column called ${arg}.`);
        return {name: mm[1] || (fn === "count" ? "count_" : fn === "make_set" ? "set_" + arg : fn + "_" + arg), fn, arg}; });
      const groups = new Map(); rows.forEach(r => { const k = by.map(c => r[c]).join("\u0001"); if (!groups.has(k)) groups.set(k, {key: Object.fromEntries(by.map(c => [c, r[c]])), rows: []}); groups.get(k).rows.push(r); });
      if (!by.length && !groups.size) groups.set("", {key:{}, rows:[]});
      rows = [...groups.values()].map(g => { const o = Object.assign({}, g.key); aggs.forEach(a => { const vals = g.rows.map(r => r[a.arg]);
        o[a.name] = a.fn === "count" ? g.rows.length : a.fn === "dcount" ? new Set(vals).size : a.fn === "make_set" ? [...new Set(vals)] : a.fn === "sum" ? vals.reduce((s,v)=>s+(+v||0),0) : a.fn === "min" ? vals.slice().sort()[0] : vals.slice().sort().slice(-1)[0]; }); return o; });
      cols = [...by, ...aggs.map(a => a.name)]; }
    else if (op === "extend" || op === "join" || op === "union" || op === "parse") throw new Error(`${op} is real KQL, but this practice console only supports where, summarize, project, sort, distinct, take and count.`);
    else throw new Error(`"${m[1]}" isn't a KQL step I know. Supported: where, summarize, project, sort by, distinct, take, count.`);
  }
  return {cols, rows};
}
function kqlRender(){
  const out = document.getElementById("kqlOut"), q = (document.getElementById("kqlIn")||{}).value || ""; if (!out) return;
  try { const r = kqlRun(q); const shown = r.rows.slice(0, 50);
    out.innerHTML = `<table><thead><tr>${r.cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${shown.map(row=>`<tr>${r.cols.map(c=>`<td>${esc(Array.isArray(row[c])?"["+row[c].join(", ")+"]":row[c])}</td>`).join("")}</tr>`).join("")}</tbody></table><span class="num">${r.rows.length} row${r.rows.length===1?"":"s"}${r.rows.length>50?" (first 50 shown)":""}</span>`;
    const st = labGet(LRT.id); LRT.queries = (LRT.queries||0) + 1;
  } catch(e) { out.innerHTML = `<div class="note"><b>Query error:</b> ${esc(e.message)}</div>`; }
}

ZONES.forEach(z => z.group = "cyber");
ZONES.push(
 {id:"soc",group:"tools",name:"SOC Desk",topic:"t-sentinel",color:"#0F6CBD",icon:"⌕",blurb:"Write real KQL queries against sign-in and Office logs, like a Microsoft Sentinel analyst."},
 {id:"azure",group:"tools",name:"Azure Tower",topic:"t-azure",color:"#0078D4",icon:"◭",blurb:"Give people the right Azure role, then lock down sign-ins with Conditional Access."},
 {id:"aws",group:"tools",name:"AWS Harbor",topic:"t-aws",color:"#E07B00",icon:"▦",blurb:"Find which AWS service holds each piece of audit evidence, then read an IAM policy like a reviewer."},
 {id:"purview",group:"tools",name:"Purview Vault",topic:"t-purview",color:"#7A4BC4",icon:"◈",blurb:"Make the DLP engine's decisions and decide what to keep, delete or hold."},
 {id:"grc",group:"tools",name:"Compliance Studio",topic:"t-grcauto",color:"#1E8A4C",icon:"✓",blurb:"Route failing automated tests to the right owner and run a SOC 2 programme in order."},
 {id:"vuln",group:"tools",name:"Patch Yard",topic:"t-vuln",color:"#C2410C",icon:"⚑",blurb:"Prioritise scan findings like a risk analyst and spot broken exceptions."}
);
const NEWM = [
 {id:"so1",zone:"soc",title:"Your first KQL queries",type:"kql",story:"Overnight, Sentinel shows lots of failed sign-ins. Use KQL to find out how many, who was targeted most, and where they came from.",
  learn:"KQL reads top to bottom. Start with a table, then each | step filters or reshapes. ResultType \"0\" means success; anything else is a failure. summarize count() by Column counts rows per value, and sort by count_ desc puts the biggest first.",
  starter:"SigninLogs\n| where ResultType != \"0\"\n| take 20",
  examples:[["count failures","SigninLogs\n| where ResultType != \"0\"\n| count"],["failures per user","SigninLogs\n| where ResultType != \"0\"\n| summarize count() by UserPrincipalName\n| sort by count_ desc"]],
  questions:[["How many failed sign-ins are in SigninLogs?","13"],["Which user (full sign-in name) had the most failed sign-ins?",["r.verma@kavach.in","r.verma"]],["Which IP address caused most of the failures?","203.0.113.77"]],
  win:"Nice hunting: one foreign IP sprayed every user once, then focused on r.verma. That's password spraying followed by a targeted attempt.",
  hints:["Run the 'count failures' example, then change the summarize to group by IPAddress.","sort by count_ desc puts the top user first."]},
 {id:"so2",zone:"soc",title:"Impossible travel",type:"kql",story:"A user signed in from India and, minutes later, from another continent. Find them, then check what that second session did in Office 365.",
  learn:"Impossible travel means successful sign-ins from places too far apart for the time between them. Count distinct countries per user with dcount(Location), list them with make_set(Location), then switch to OfficeActivity and filter by the suspicious IP (ClientIP).",
  starter:"SigninLogs\n| where ResultType == \"0\"\n| summarize dcount(Location), make_set(Location) by UserPrincipalName",
  examples:[["users with 2+ countries","SigninLogs\n| where ResultType == \"0\"\n| summarize dcount(Location), make_set(Location) by UserPrincipalName\n| where dcount_Location > 1"],["activity from one IP","OfficeActivity\n| where ClientIP == \"PASTE-IP-HERE\""]],
  questions:[["Which user signed in successfully from two countries?",["p.shah@kavach.in","p.shah"]],["Which country code was the suspicious sign-in from?","BR"],["Which app did the suspicious session open?","SharePoint"],["Name one file the suspicious session downloaded",["vendor_bank_details.xlsx","kyc_batch_oct.zip"]]],
  win:"Account takeover confirmed: a Brazil sign-in 12 minutes after an Indian one, followed by downloads of bank details and KYC data and a forwarding rule. Time to start the CERT-In and DPDP clocks.",
  hints:["Run the first example; look for a user with more than one country.","Copy the suspicious IP from SigninLogs into the OfficeActivity example."]},

 {id:"az1",zone:"azure",title:"Right role, right person",type:"classify",story:"Kavach's Production subscription has too many Owners. Assign each person the least Azure role that lets them do their job.",
  learn:"Azure RBAC roles: Reader can look, Contributor can change resources, Owner can change and grant access to others. 'No access' is right when the job doesn't need Production at all. Least privilege means the smallest role that works.",
  options:["No access","Reader","Contributor","Owner"],
  items:[["Internal auditor who reviews settings","Reader","Auditors look; they never change."],["Cloud engineer who deploys and fixes resources","Contributor","Needs to change resources but not grant access."],["Head of cloud who approves who gets access","Owner","Granting access needs Owner (ideally time-limited through PIM)."],["Marketing intern","No access","No business need for Production."],["Finance analyst checking cost reports","Reader","Reading is enough for cost review."],["External consultant fixing one database for a week","Contributor","Scoped to that resource group and time-limited, not Owner."]],
  hints:["Who actually needs to grant access to others? Usually one or two people.","Auditors never need to change anything."]},
 {id:"az2",zone:"azure",title:"Switch on Conditional Access",type:"toggles",story:"After a phishing attack, set Kavach's sign-in protections. Fix the risky settings, but don't lock out the emergency accounts or break the scanner that has compensating controls.",
  learn:"Conditional Access rules run at every sign-in. Require MFA for everyone and stronger rules for admins, block legacy sign-in (it can't do MFA), and keep two monitored break-glass accounts excluded so you can't lock yourself out.",
  toggles:[["ca-admin","Require MFA for all admin roles",false,true,"Admins are the top target."],["ca-all","Require MFA for all users, all cloud apps",false,true,"Most account takeovers stop at MFA."],["ca-legacy","Allow legacy authentication (old email protocols)",true,false,"Legacy sign-in bypasses MFA; block it."],["ca-breakglass","Exclude 2 break-glass emergency accounts (alerting on use)",true,true,"Keeps a way in if CA misfires; it's safe because sign-ins are alerted."],["ca-sms","Allow SMS as the only MFA method for admins",true,false,"SMS can be SIM-swapped; use the authenticator app or passkeys for admins."],["ca-report","Keep every policy in report-only forever",true,false,"Report-only is for testing; enforce after review."]],
  hints:["The break-glass exclusion is correct practice: leave it on.","Anything that lets someone skip MFA should be off."]},

 {id:"aw1",zone:"aws",title:"Where's the evidence?",type:"classify",story:"The SOC 2 auditor asks for eight things. Pick the AWS service or place you'd pull each one from.",
  learn:"CloudTrail = who did what. Config = how resources were set up over time. IAM = users, roles and the credential report. Security Hub = findings and best-practice scores. GuardDuty = threat detections. Artifact = AWS's own compliance reports.",
  options:["CloudTrail","Config","IAM","Security Hub","GuardDuty","Artifact"],
  items:[["Who deleted the orders database on 3 March?","CloudTrail","API activity log."],["Were all S3 buckets encrypted every day this quarter?","Config","Config rule history covers a period."],["List of users and whether each has MFA","IAM","The IAM credential report shows MFA status."],["AWS's own SOC 2 report for your vendor file","Artifact","Download AWS's reports from Artifact."],["Your score against AWS Foundational Security Best Practices","Security Hub","Security Hub standards give scores."],["Alerts of crypto-mining or unusual API calls","GuardDuty","Threat detection service."],["When was root last used to sign in?","IAM","The credential report shows password last used (CloudTrail also logs it)."],["AWS's ISO 27001 certificate","Artifact","Also in Artifact."]],
  hints:["'Who did' questions go to CloudTrail; 'how was it set up over time' goes to Config.","AWS's own reports live in one place."]},
 {id:"aw2",zone:"aws",title:"Read the IAM policy",type:"classify",story:"This policy is attached to the analyst role. For each request, decide whether AWS would allow or deny it.",
  pre:`{
  "Statement": [
    {"Effect": "Allow", "Action": ["s3:GetObject", "s3:ListBucket"],
     "Resource": ["arn:aws:s3:::ledgerleaf-reports", "arn:aws:s3:::ledgerleaf-reports/*"]},
    {"Effect": "Allow", "Action": "cloudtrail:LookupEvents", "Resource": "*"},
    {"Effect": "Deny", "Action": "s3:*", "Resource": "arn:aws:s3:::ledgerleaf-reports/payroll/*"}
  ]
}`,
  learn:"Read Effect, Action and Resource. Anything not allowed is denied by default, and an explicit Deny beats any Allow.",
  options:["Allowed","Denied"],
  items:[["Download reports/q3-summary.pdf from ledgerleaf-reports","Allowed","GetObject on that bucket is allowed."],["Download payroll/oct.csv from ledgerleaf-reports","Denied","The explicit Deny on payroll/* wins over the Allow."],["Delete reports/q3-summary.pdf","Denied","DeleteObject was never allowed."],["Look up CloudTrail events","Allowed","Explicitly allowed on all resources."],["Read a file in ledgerleaf-customer-data","Denied","That bucket isn't in any Allow."],["List the contents of ledgerleaf-reports","Allowed","ListBucket on the bucket is allowed."]],
  hints:["Default is deny: if no statement allows it, it's denied.","Check the payroll Deny before anything else."]},

 {id:"pv1",zone:"purview",title:"Be the DLP engine",type:"classify",story:"PaySetu's DLP policy: external email with 10+ PAN numbers or any card number → Block (unless the recipient is an approved partner). External email with 1–9 PAN numbers → Warn (policy tip, user can justify). Internal email → Allow. Decide each outcome.",
  learn:"DLP checks content (sensitive information types and counts), where it's going (inside or outside), and who the recipient is. Approved-partner exceptions must be specific domains with contracts.",
  options:["Allow","Warn","Block"],
  items:[["Email to a customer with their own PAN (1 PAN)","Warn","External with 1–9 PAN numbers → policy tip, user justifies."],["Spreadsheet of 250 PAN numbers to a staff member's personal Gmail","Block","10+ PAN external, not a partner."],["Card number sent to the approved payment processor's domain","Allow","Approved partner exception."],["File with 40 PAN numbers emailed to a colleague inside PaySetu","Allow","Internal email is allowed by this policy."],["One card number pasted into an email to an unknown domain","Block","Any card number external (not a partner) → block."],["3 PAN numbers sent to a law firm (not on the partner list)","Warn","1–9 PAN external → warn."]],
  hints:["First ask: internal or external? Then count PANs. Then check the partner list.","Card numbers have no 'warn' band in this policy."]},
 {id:"pv2",zone:"purview",title:"Keep, delete or hold?",type:"classify",story:"A former employee, Meera, asked for her data to be erased. She also has a pending labour dispute with the company. Decide what happens to each data set.",
  learn:"Erasure is required unless the law or a legitimate reason requires keeping data. Payroll and tax records have statutory retention periods. Anything relevant to a dispute is under legal hold and must not be deleted.",
  options:["Delete now","Keep (legal duty)","Keep (legal hold)"],
  items:[["Her 2021 recruitment test answers in an old folder","Delete now","No reason to keep after hiring and the retention period."],["Payroll and tax records","Keep (legal duty)","Statutory retention applies."],["Emails between her manager and HR about the dispute","Keep (legal hold)","Relevant to the pending dispute."],["Her name on the internal newsletter mailing list","Delete now","No longer needed."],["Her appraisal records relied on in the dispute","Keep (legal hold)","Evidence in the dispute."],["Duplicate scans of her ID on a shared drive","Delete now","Unneeded copies; a separate HR file holds what's required."]],
  hints:["Is it connected to the dispute? Then it's on hold.","Does a law say how long to keep it? Payroll and tax do."]},

 {id:"gr1",zone:"grc",title:"Route the failing tests",type:"classify",story:"The compliance-automation dashboard shows failing tests. Send each to the team that should fix it.",
  learn:"IT owns accounts and laptops, Engineering owns code and cloud settings, the People team owns HR tasks like policy acceptance and training, and GRC owns policies, vendor reviews and evidence.",
  options:["IT","Engineering","People team","GRC"],
  items:[["3 users without MFA","IT","Identity settings are IT's."],["5 laptops without disk encryption","IT","Device management is IT's."],["Production database backups disabled","Engineering","Cloud/database settings."],["Branch protection off on 2 code repositories","Engineering","Code workflow."],["11 employees haven't accepted the security policy","People team","HR-driven employee tasks."],["Vendor security review overdue for the payroll provider","GRC","Third-party risk is GRC's."],["Information security policy not reviewed in 12 months","GRC","Policy ownership."]],
  hints:["Who has admin access to the system that's failing?","People-tasks go to HR/People, policies to GRC."]},
 {id:"gr2",zone:"grc",title:"SOC 2 in the right order",type:"order",story:"Put a start-up's SOC 2 Type II journey with a compliance-automation tool in order.",
  learn:"You can't test controls before connecting systems, and the observation window only counts once controls are actually working.",
  items:["Decide scope: systems, Trust Services Criteria, report type","Connect cloud, identity, HR and code systems to the tool","Fix failing automated tests and adopt policies","Start the observation window with controls operating","Collect recurring evidence (access reviews, training) during the window","Auditor examines evidence and samples","SOC 2 Type II report issued"],
  hints:["Scope comes first; the report comes last.","Fix things before the window starts, not during."]},

 {id:"vu1",zone:"vuln",title:"Triage the scan",type:"classify",story:"Assign each finding a priority. P1 = exploited and exposed or on a critical system; P2 = serious but not actively exploited or less exposed; P3 = isolated or low value; P4 = low severity.",
  learn:"Priority = severity (CVSS) + is it being exploited (CISA KEV) + is it reachable (internet-facing?) + how important is the asset.",
  options:["P1","P2","P3","P4"],
  items:[["VPN gateway, CVSS 9.8, in KEV, internet-facing","P1","Exploited front door."],["Payment API TLS library, CVSS 7.5, not in KEV, internet-facing","P2","Serious and exposed, but not known exploited."],["Lab machine, CVSS 9.8, not in KEV, isolated","P3","High score but unreachable and low value."],["Marketing website plugin, CVSS 8.1, in KEV, internet-facing","P1","Exploited and public."],["Intranet missing a security header, CVSS 4.3","P4","Low severity, internal."],["Payments database patch, CVSS 7.2, internal only","P2","Critical asset, limited exposure."]],
  hints:["KEV + internet = P1.","A big CVSS on an isolated, low-value box drops down."]},
 {id:"vu2",zone:"vuln",title:"Spot the broken exception",type:"classify",story:"Review the exception register. For each risk-accepted vulnerability, decide whether the exception is valid or what's wrong with it.",
  learn:"A valid exception has a business reason, compensating controls, approval at the right level (CISO for P1/P2) and an expiry date.",
  options:["Valid","Missing expiry","Wrong approver","No compensating control"],
  items:[["P1 on legacy billing server; firewall-restricted and monitored; approved by CISO + VP; expires 31 Mar","Valid","All elements present."],["P2 on HR portal; WAF in front; approved by CISO; no end date","Missing expiry","Exceptions must expire and be re-reviewed."],["P1 on old CRM; isolated network; approved by the IT engineer; expires 30 Jun","Wrong approver","P1 needs CISO-level approval."],["P2 on file server; 'vendor will patch eventually'; approved by CISO; expires 31 Dec","No compensating control","Nothing reduces the risk meanwhile."],["P3 on test box; no internet access; approved by system owner; expires in 90 days","Valid","P3 can be approved by the owner."]],
  hints:["Check four things in each: reason, compensating control, approver level, expiry.","For P1/P2, who must approve?"]}
];
MISSIONS.push(...NEWM); NEWM.forEach(m => MISSION[m.id] = m);

document.addEventListener("click", e => {
  const el = e.target.closest("[data-lkqlrun],[data-lkqlex],[data-lkqlins]"); if (!el) return;
  const ta = document.getElementById("kqlIn"), m = MISSION[LRT.id];
  if (el.dataset.lkqlrun) { kqlRender(); return; }
  if (el.dataset.lkqlex) { ta.value = m.examples[+el.dataset.lkqlex][1]; kqlRender(); return; }
  if (el.dataset.lkqlins) { ta.value = el.dataset.lkqlins + "\n| take 10"; kqlRender(); return; }
});
document.addEventListener("keydown", e => { if (e.target.id === "kqlIn" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); kqlRender(); } });
