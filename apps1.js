/* ================= LabOS apps (1): Inbox Defender, NetBuilder, VulnScan, Crypto Bench ================= */
const shuffle = (a, r = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function appTabs(tabs, cur, key){ return `<div class="seg apptabs" role="group" aria-label="Sections">${tabs.map(([k,l]) => `<button aria-pressed="${cur===k}" data-${key}="${k}">${esc(l)}</button>`).join("")}</div>`; }
function opTabFor(appId, opId){ const o = (typeof OPS !== "undefined" ? OPS : []).find(x => x.id === opId && x.app === appId); return o ? o.tab : null; }

/* ---------- Inbox Defender (phishing triage) ---------- */
const MAILS = [
 {id:"p1", phish:true, from:["HDFC Bank KYC Team","kyc@hdfcbank-secure-kyc.com"], time:"09:12", subj:"URGENT: your account will be blocked today", body:"Dear Customer,\n\nYour KYC has expired. To stop your account being blocked within 24 hours, update your details now:\n\n{L0}\n\nRegards,\nHDFC Bank", links:[["Update KYC now","https://hdfc-kyc-update.top/verify"]], auth:["fail","none","fail"], ip:"185.234.72.19",
  why:["The sender's domain is hdfcbank-secure-kyc.com, which is not the bank's own domain.","The link goes to hdfc-kyc-update.top, a third, unrelated site.","'Blocked within 24 hours' is pressure meant to stop you from thinking.","SPF and DMARC failed: the sending server wasn't authorised."]},
 {id:"p2", phish:true, from:["Microsoft 365","no-reply@micros0ft-support.com"], time:"09:40", subj:"Your password expires in 2 hours", body:"Your Microsoft 365 password expires today at 11:59.\n\nTo keep using your current password, confirm it here:\n{L0}\n\nMicrosoft 365 Team", links:[["Keep my current password","https://login.micros0ft-support.com/keep"]], auth:["fail","fail","fail"], ip:"45.95.147.12",
  why:["'micros0ft' uses a zero in place of the letter o.","'Keep your current password' is a classic lure; real expiry notices send you to the normal sign-in page.","All three authentication checks failed."]},
 {id:"p3", phish:true, from:["Anil Mehta (CEO)","anil.mehta.ceo2026@gmail.com"], time:"10:02", subj:"Quick favour — are you at your desk?", body:"I'm in a board meeting and can't take calls. I need you to buy 10 Amazon gift cards of ₹5,000 each for a client today. Keep this between us, I'll explain later. Reply with the codes as soon as you have them.\n\nSent from my iPhone", links:[], auth:["pass","pass","pass"], ip:"209.85.220.41",
  why:["This passed SPF, DKIM and DMARC, but only because it really was sent from Gmail. Anyone can open a Gmail account using the CEO's name.","Gift cards, secrecy and urgency together are the signature of business email compromise (BEC).","Check by calling the CEO's office on a number you already know."]},
 {id:"p4", phish:true, from:["Tata Logistics Accounts","accounts@tatalogistics-billing.in"], reply:"tl.payments.desk@proton.me", time:"10:21", subj:"Updated bank details for invoice INV-4471", body:"Dear Sir/Madam,\n\nOur bank account has changed after an internal audit. Please release the payment of ₹8,40,000 for INV-4471 to the new account in the attached letter today to avoid late fees.\n\nThanks,\nAccounts Team", att:"New_Bank_Details.pdf", links:[], auth:["pass","pass","none"], ip:"103.157.24.8",
  why:["Changing bank details by email is the most common invoice fraud.","Replies go to a proton.me address, not to the vendor's domain.","The lookalike domain passed SPF because the fraudster registered it. Passing checks only proves who owns the domain.","Call the vendor on the number in your vendor master file, never one from the email."]},
 {id:"p5", phish:true, from:["DocuSign","dse@docusign-notify.net"], time:"11:05", subj:"Please review and sign: Salary_Revision_2026.pdf", body:"HR has sent you a document to review and sign.\n\n{L0}\n\nThis link expires in 48 hours.", links:[["REVIEW DOCUMENT","https://docusign-notify.net.secure-login.ru/s/8871"]], auth:["softfail","none","fail"], ip:"91.215.85.33",
  why:["Read a web address from the right: the real site is secure-login.ru. 'docusign-notify.net' is only a prefix.","A salary document you weren't expecting is bait.","DMARC failed."]},
 {id:"p6", phish:true, from:["Income Tax Department","refunds@incometax-gov-in.com"], time:"11:30", subj:"Refund of ₹15,490 approved — submit bank details", body:"Dear Taxpayer,\n\nAfter the last evaluation of your fiscal activity, you are eligible to receive a tax refund of ₹15,490. Please submit your bank and card details to process it:\n{L0}", links:[["Claim refund","https://incometax-gov-in.com/refund/claim"]], auth:["fail","none","fail"], ip:"5.188.62.140",
  why:["The real e-filing portal is incometax.gov.in. Indian government sites end in .gov.in.","Refunds go to the bank account already validated on the portal, so nobody needs your card details.","Authentication failed."]},
 {id:"p7", phish:true, from:["IT Helpdesk","helpdesk@kavach.in"], time:"12:10", subj:"Mailbox 98% full — action required", body:"Your mailbox is almost full and new emails will be rejected.\n\nIncrease your quota for free:\n{L0}\n\nIT Helpdesk", links:[["Increase my quota","http://kavach-mailquota.weebly.com/login"]], auth:["fail","none","fail"], ip:"194.26.29.111",
  why:["It claims to come from our own domain, but SPF and DMARC failed: someone outside spoofed the address.","The link goes to a free website builder (weebly.com), not to our systems.","The link uses plain http, with no encryption."]},
 {id:"p8", phish:true, from:["LinkedIn Jobs","jobs@linkedln-careers.com"], time:"12:44", subj:"Offer letter: Compliance Analyst (₹14 LPA)", body:"Congratulations! After reviewing your profile we are pleased to make you an offer.\n\nOpen the attached offer letter and sign in with your email password to accept before 6 pm today.", att:"Offer_Letter.html", links:[], auth:["pass","none","none"], ip:"172.245.13.90",
  why:["'linkedln': the i is an l.","An .html attachment that asks you to sign in is a fake login page.","No real employer asks for your email password. Job seekers are a favourite target."]},
 {id:"p9", phish:true, from:["Blue Dart Express","support@bluedart-redelivery.com"], time:"13:15", subj:"Your parcel is on hold: pay ₹49 redelivery fee", body:"We tried to deliver your parcel but the address was incomplete. Pay a ₹49 redelivery fee to reschedule:\n{L0}", links:[["Pay ₹49 now","https://bluedart-redelivery.com/pay"]], auth:["pass","none","none"], ip:"104.168.44.7",
  why:["Small-fee scams exist to steal your card details.","The domain isn't the courier's own.","You weren't expecting a parcel, and couriers don't collect fees through email links."]},
 {id:"p10", phish:true, from:["HR Benefits","benefits@kavach-hr.co"], time:"14:02", subj:"Enrol in the new health cover by Friday", body:"We're moving to a new health insurance plan.\n\nScan the QR code in the attachment with your phone to enrol. Enrolment closes Friday.", att:"enrol_qr.png", links:[], auth:["pass","pass","none"], ip:"198.23.143.66",
  why:["kavach-hr.co is not our domain (kavach.in).","A QR code moves you to your phone, where company link-checks don't reach. This trick is called 'quishing'.","A deadline adds pressure."]},
 {id:"p11", phish:true, from:["Amazon.in","order-update@amaz0n-in.com"], time:"14:50", subj:"Order #402-1187 cancelled — confirm card for refund", body:"Your order #402-1187 was cancelled. To receive your refund, confirm your card details:\n{L0}", links:[["Confirm card","https://amaz0n-in.com/refund"]], auth:["fail","none","fail"], ip:"45.141.84.20",
  why:["'amaz0n' uses a zero.","Refunds go back to the original payment method, so nobody needs your card again.","Authentication failed."]},
 {id:"p12", phish:true, from:["Priya (Ledger Advisors)","priya@ledgeradvisors.example"], time:"15:20", subj:"Shared with you: Q3 audit findings", body:"Hi,\n\nI've shared the Q3 audit findings with you. Click below to view. You'll need to sign in with your Microsoft account.\n\n{L0}\n\nPriya", links:[["Open in SharePoint","https://ledgeradvisors-my.sharepoint-docs.app/q3"]], auth:["pass","pass","pass"], ip:"40.107.22.51",
  why:["The sender may be real (her mailbox may have been hacked), but the link goes to sharepoint-docs.app, not Microsoft's sharepoint.com.","An unexpected 'shared file' that asks you to sign in is the most common way passwords get stolen.","Check with Priya on a known number before opening."]},
 {id:"l1", phish:false, from:["Neha Sharma","neha.sharma@kavach.in"], time:"09:05", subj:"Re: audit calendar for November", body:"Hi!\n\nAs you asked yesterday, here's the updated audit calendar. The vendor review moved to 18 Nov.\n\nNeha", att:"Audit_Calendar_Nov.xlsx", links:[], auth:["pass","pass","pass"], ip:"10.0.4.25",
  why:["Internal sender, all checks pass, it replies to a thread you started, and the attachment is the file you asked for."]},
 {id:"l2", phish:false, from:["IT Service Desk","servicedesk@kavach.in"], time:"09:30", subj:"Planned maintenance: Saturday 10 pm – 2 am", body:"Email and VPN will be unavailable during the maintenance window.\n\nNo action is needed from you.", links:[], auth:["pass","pass","pass"], ip:"10.0.4.8",
  why:["Information only: no link, no request, internal and authenticated."]},
 {id:"l3", phish:false, from:["Microsoft account team","account-security-noreply@accountprotection.microsoft.com"], time:"10:15", subj:"New sign-in to your Microsoft account", body:"We noticed a new sign-in to your account from Windows in New Delhi, India.\n\nIf this was you, you can ignore this message. If not, go to account.microsoft.com yourself and review your recent activity.", links:[], auth:["pass","pass","pass"], ip:"40.92.18.7",
  why:["This is Microsoft's real security-alert sender and it passes all checks.","It asks you to go to the site yourself rather than pushing a link. That's what genuine alerts do."]},
 {id:"l4", phish:false, from:["Kavach Payroll","payroll@kavach.in"], time:"10:40", subj:"Your October payslip is ready", body:"Your payslip for October 2026 is now available.\n\n{L0}", links:[["View payslip","https://hr.kavach.in/payslips/2026-10"]], auth:["pass","pass","pass"], ip:"10.0.4.31",
  why:["The link goes to our own HR portal (hr.kavach.in) and the sender is authenticated.","Payslip emails arrive every month, so this is expected."]},
 {id:"l5", phish:false, from:["Arjun K. (DPO)","arjun.k@kavach.in"], time:"11:12", subj:"Reminder: DPDP awareness module due 15 Nov", body:"Hi all,\n\nA reminder that the DPDP awareness module is due on 15 November. It takes about 20 minutes.\n\n{L0}\n\nArjun", links:[["Open the module","https://learn.kavach.in/dpdp-2026"]], auth:["pass","pass","pass"], ip:"10.0.4.44",
  why:["Internal and authenticated, the link stays on our learning site, and the deadline is a normal training deadline."]},
 {id:"l6", phish:false, from:["LinkedIn","messages-noreply@linkedin.com"], time:"11:48", subj:"You appeared in 12 searches this week", body:"See who's been looking at your profile.\n\n{L0}", links:[["See who's looking","https://www.linkedin.com/me/search-appearances/"]], auth:["pass","pass","pass"], ip:"108.174.0.215",
  why:["linkedin.com is spelled correctly, the link goes to linkedin.com, and it's a routine notification."]},
 {id:"l7", phish:false, from:["Ravi Menon","ravi.menon@kavach.in"], time:"12:30", subj:"Lunch on Friday?", body:"The new café near the office? 1 pm?\n\nRavi", links:[], auth:["pass","pass","pass"], ip:"10.0.4.52",
  why:["A normal internal message with nothing requested."]},
 {id:"l8", phish:false, from:["Google","no-reply@accounts.google.com"], time:"13:05", subj:"Security alert: new sign-in on Pixel 8", body:"Your Google Account was just signed in to from a new Pixel 8 device.\n\nIf this was you, you don't need to do anything. If not, we'll help you secure your account.\n\n{L0}", links:[["Check activity","https://myaccount.google.com/notifications"]], auth:["pass","pass","pass"], ip:"209.85.220.69",
  why:["These are Google's real domains (accounts.google.com sends, myaccount.google.com receives), every check passes, and nothing asks for your password."]},
 {id:"l9", phish:false, from:["Zoom","no-reply@zoom.us"], time:"13:40", subj:"Invitation: Vendor risk review — Thu 3 pm", body:"Neha Sharma is inviting you to a scheduled Zoom meeting.\n\nTopic: Vendor risk review\nTime: Thursday 3:00 pm IST\n\n{L0}", links:[["Join meeting","https://zoom.us/j/84512093321"]], auth:["pass","pass","pass"], ip:"170.114.10.83",
  why:["zoom.us is Zoom's real domain and the meeting matches a colleague's planned review."]},
 {id:"l10", phish:false, from:["Internal Audit","internal.audit@kavach.in"], time:"14:20", subj:"Evidence request EV-2231: Q3 access review (due 7 Nov)", body:"Please upload the Q3 user access review sign-off for evidence request EV-2231 by 7 November.\n\n{L0}", links:[["Upload evidence","https://grc.kavach.in/requests/EV-2231"]], auth:["pass","pass","pass"], ip:"10.0.4.61",
  why:["It asks for work you'd expect, through our own GRC portal, with a normal deadline."]},
 {id:"l11", phish:false, from:["GitHub","noreply@github.com"], time:"15:02", subj:"[kavach/policies] Pull request #42 merged", body:"Your pull request 'Update access control policy v2.1' was merged into main.\n\n{L0}", links:[["View pull request","https://github.com/kavach/policies/pull/42"]], auth:["pass","pass","pass"], ip:"192.30.252.201",
  why:["github.com sender and link, all checks pass, and it reports on work you did."]},
 {id:"l12", phish:false, from:["Simran Kaur (TalentBridge)","simran@talentbridge.example"], time:"15:40", subj:"Interview slot: Privacy Analyst — Tue 11 am", body:"Hi,\n\nThanks for applying for the Privacy Analyst role. Could you confirm Tuesday 11 am for a 30-minute video interview? The invite will come from our calendar once you confirm.\n\nBest,\nSimran", links:[], auth:["pass","pass","pass"], ip:"52.100.11.4",
  why:["Specific, matches a job you applied for, and asks only for a time. Nothing about passwords, fees or documents."]}
];
const MAILBY = Object.fromEntries(MAILS.map(m => [m.id, m]));
function mailNewShift(st){ const ph = shuffle(MAILS.filter(m => m.phish)).slice(0, 5), ok = shuffle(MAILS.filter(m => !m.phish)).slice(0, 5); st.shift = {ids: shuffle([...ph, ...ok]).map(m => m.id), ans:{}, cur:null, done:false}; }
losRegister({id:"mail", title:"Inbox Defender", icon:"✉", color:"#B42318", size:[940,600], mount(body, ctx){
  const st = ctx.st; let det = false, preview = "";
  const linkHtml = (m) => esc(m.body).replace(/\{L(\d)\}/g, (_, i) => { const l = m.links[+i]; return l ? `<a href="#" class="mlink" data-href="${esc(l[1])}">${esc(l[0])}</a>` : ""; }).replace(/\n/g, "<br>");
  const dom = m => m.from[1].split("@")[1];
  const read = m => { const a = st.shift.ans[m.id];
    return `<div class="mhead"><h3>${esc(m.subj)}</h3><div class="mfrom"><span class="mav">${esc(m.from[0][0])}</span><div><b>${esc(m.from[0])}</b> <span class="num">&lt;${esc(m.from[1])}&gt;</span><div class="num">To: you@kavach.in · Today ${esc(m.time)}</div>${m.reply?`<div class="num">Reply-To: ${esc(m.reply)}</div>`:""}</div></div>
      <button class="link" data-mdet="1">${det?"Hide details":"Show details (message headers)"}</button>
      ${det?`<pre class="mhdr">Return-Path: &lt;bounce@${esc(dom(m))}&gt;
Received: from mail.${esc(dom(m))} (${esc(m.ip)}) by mx.kavach.in
Authentication-Results: mx.kavach.in;
  spf=<b class="a-${esc(m.auth[0])}">${esc(m.auth[0])}</b> smtp.mailfrom=${esc(dom(m))}
  dkim=<b class="a-${esc(m.auth[1])}">${esc(m.auth[1])}</b> header.d=${esc(dom(m))}
  dmarc=<b class="a-${esc(m.auth[2])}">${esc(m.auth[2])}</b> header.from=${esc(dom(m))}${m.reply?`\nReply-To: ${esc(m.reply)}`:""}</pre><p class="num">SPF: was the sending server allowed to send for this domain? DKIM: is the message signed by the domain? DMARC: do those checks line up with the From address? A pass proves who owns the domain, not that the sender is honest.</p>`:""}</div>
      <div class="mbody">${linkHtml(m)}</div>${m.att?`<div class="matt">📎 ${esc(m.att)}</div>`:""}
      ${preview?`<div class="note">That link goes to <b>${esc(preview)}</b>. In a real inbox, don't click to find out: hover (or long-press on a phone) to preview it first.</div>`:""}
      <div class="mact">${a ? `<div class="info ${a.ok?"":"bad"}"><b>${a.ok?"Correct":"Not quite"}: this was ${m.phish?"phishing":"a genuine email"}.</b><ul class="clean">${m.why.map(w=>`<li>${esc(w)}</li>`).join("")}</ul></div><button class="btn sm" data-mnext="1">Next email →</button>` : `<button class="btn" data-mjudge="phish">🚩 Report phishing</button><button class="btn ghost" data-mjudge="safe">✓ It's safe</button>`}</div>`; };
  const draw = () => {
    const sh = st.shift, L = losState();
    if (!sh) { body.innerHTML = `<div class="apppad">${opStrip("mail")}<div class="mintro"><h3>Inbox Defender</h3><p>You're on the security desk for one shift. Ten emails arrive: some genuine, some phishing. Open each one, check the sender, the links and the headers, then report it or mark it safe.</p><p class="num">Best score: ${L.mail.best}/10 · shifts played: ${L.mail.rounds}</p><button class="btn" data-mstart="1">Start a shift</button></div></div>`; return; }
    const done = Object.keys(sh.ans).length, right = Object.values(sh.ans).filter(a => a.ok).length;
    if (sh.done) { body.innerHTML = `<div class="apppad">${opStrip("mail")}<div class="mintro"><h3>Shift over: ${right}/10</h3><div class="scorebar">${sh.ids.map(id => `<span class="${sh.ans[id].ok?"ok":"bad"}" title="${esc(MAILBY[id].subj)}">${MAILBY[id].phish?"🚩":"✓"}</span>`).join("")}</div><p>${right>=9?"Excellent. You'd make a strong first line of defence.":right>=7?"Good shift. Review the ones you missed: the lesson is in the details.":"Phishing is designed to fool smart people. Review the explanations and play again."}</p><p class="num">Best: ${L.mail.best}/10</p><button class="btn" data-mstart="1">Start another shift</button></div></div>`; return; }
    const cur = sh.cur && MAILBY[sh.cur];
    body.innerHTML = `<div class="mailapp"><div class="mtop"><b>Inbox</b><span class="num">${done}/10 decided · ${right} correct</span></div><div class="mcols"><aside class="mlist" aria-label="Messages">${sh.ids.map(id => { const m = MAILBY[id], a = sh.ans[id]; return `<button class="mitem ${sh.cur===id?"on":""} ${a?(a.ok?"good":"bad"):"unread"}" data-mopen="${id}"><b>${esc(m.from[0])}</b><span>${esc(m.subj)}</span><span class="num">${a?(a.ok?"✓ correct":"✗ missed"):esc(m.time)}</span></button>`; }).join("")}</aside>
      <section class="mread">${cur ? read(cur) : `<div class="mempty">Open an email from the list.</div>`}</section></div><footer class="mstatus" aria-live="polite">${cur?"Hover over a link to see where it really goes.":"Tip: real addresses hide behind display names."}</footer></div>`;
  };
  const hoverLink = a => { const s = body.querySelector(".mstatus"); if (s) s.textContent = "→ " + a.dataset.href; if (!st.hovered) { st.hovered = true; ctx.save(); ctx.check(); } };
  body.addEventListener("mouseover", e => { const a = e.target.closest(".mlink"); if (a) hoverLink(a); });
  body.addEventListener("focusin", e => { const a = e.target.closest(".mlink"); if (a) hoverLink(a); });
  body.addEventListener("click", e => {
    const t = e.target.closest("[data-mstart],[data-mopen],[data-mdet],[data-mjudge],[data-mnext],.mlink"); if (!t) return; const d = t.dataset;
    if (t.classList.contains("mlink")) { e.preventDefault(); preview = d.href; hoverLink(t); draw(); return; }
    if (d.mstart) { mailNewShift(st); st.shift.cur = st.shift.ids[0]; det = false; preview = ""; ctx.save(); draw(); return; }
    if (d.mopen) { st.shift.cur = d.mopen; det = false; preview = ""; ctx.save(); draw(); return; }
    if (d.mdet) { det = !det; if (det && !st.headers) { st.headers = true; ctx.save(); ctx.check(); } draw(); return; }
    if (d.mjudge) { const sh = st.shift, m = MAILBY[sh.cur]; if (!m || sh.ans[m.id]) return; const ok = (d.mjudge === "phish") === m.phish; sh.ans[m.id] = {ok};
      if (Object.keys(sh.ans).length === sh.ids.length) { sh.done = true; const right = Object.values(sh.ans).filter(a => a.ok).length, L = losState(); L.mail.rounds++; if (right > L.mail.best) L.mail.best = right; logActivity(1); ctx.xp(right * 5 + (right >= 8 ? 25 : 0), `Inbox Defender shift (${right}/10)`); losAchieve(); }
      ctx.save(); ctx.check(); draw(); return; }
    if (d.mnext) { const sh = st.shift, nx = sh.ids.find(id => !sh.ans[id]); if (nx) sh.cur = nx; det = false; preview = ""; ctx.save(); draw(); return; }
  });
  draw();
  return {onArgs: () => draw()};
}});

/* ---------- NetBuilder (zones, DMZ, firewall rules, packet test) ---------- */
const NET_DEV = [["web01","Web server (web01)","🌐"],["db01","Database (db01)","🗄"],["lap","Employee laptops","💻"]];
const NET_RIGHT = {web01:"dmz", db01:"internal", lap:"internal"};
const NET_ZN = {internet:"Internet", dmz:"DMZ", internal:"Internal LAN"};
const NET_EPN = {customer:"Customer", attacker:"Attacker", internet:"Internet", web01:"web01", db01:"db01", lap:"Laptops"};
const NET_TESTS = [
 ["Customer → web01 on 443 (HTTPS)","customer","web01",443,true],
 ["web01 → db01 on 3306 (database)","web01","db01",3306,true],
 ["Laptops → Internet on 443 (browsing)","lap","internet",443,true],
 ["Attacker → db01 on 3306","attacker","db01",3306,false],
 ["Attacker → web01 on 22 (SSH admin)","attacker","web01",22,false],
 ["web01 → Laptops on 445 (file sharing)","web01","lap",445,false],
 ["db01 → Internet on 443","db01","internet",443,false]
];
const NET_PORTS = ["any","22","80","443","445","3306"], NET_EPS = ["any","internet","dmz","internal","web01","db01","lap"];
function netInit(st){ st.place ||= {}; st.rules ||= [{src:"any", dst:"any", port:"any", act:"allow"}]; st.def ||= "allow"; }
function netZoneOf(st, ep){ return ["customer","attacker","internet"].includes(ep) ? "internet" : (st.place || {})[ep] || null; }
function netMatch(v, ep, zone){ return v === "any" || v === ep || v === zone; }
function netEval(st, t){
  const [, src, dst, port] = t, zs = netZoneOf(st, src), zd = netZoneOf(st, dst);
  if (!zs || !zd) return {allowed:null, why:"Place every device in a zone first."};
  if (zs === zd) return {allowed:true, rule:"same", why:"Same zone, so the traffic never passes the firewall."};
  const rules = st.rules || [];
  for (let i = 0; i < rules.length; i++) { const r = rules[i]; if (netMatch(r.src, src, zs) && netMatch(r.dst, dst, zd) && (r.port === "any" || +r.port === port)) return {allowed:r.act === "allow", rule:i, why:`Rule ${i+1} (${r.act})`}; }
  return {allowed:(st.def || "allow") === "allow", rule:-1, why:`No rule matched: default ${st.def || "allow"}`};
}
const netPlaced = st => NET_DEV.every(([d]) => (st.place || {})[d] === NET_RIGHT[d]);
const netNeedOk = st => netPlaced(st) && NET_TESTS.filter(t => t[4]).every(t => netEval(st, t).allowed === true);
const netBlockOk = st => netPlaced(st) && NET_TESTS.filter(t => !t[4]).every(t => netEval(st, t).allowed === false);
function netPos(st, ep){
  const X = {internet:150, dmz:380, internal:635};
  if (ep === "customer") return [76, 95]; if (ep === "attacker") return [76, 215]; if (ep === "internet") return [168, 270];
  const z = netZoneOf(st, ep); if (!z) return null;
  const same = NET_DEV.filter(([d]) => netZoneOf(st, d) === z).map(([d]) => d), i = same.indexOf(ep);
  return [X[z] + (z === "internet" ? 32 : 0), 85 + i * 68];
}
function netSvg(st){
  const zone = (k, x) => `<g><rect x="${x}" y="28" width="230" height="270" rx="16" class="nz nz-${k}"/><text x="${x+14}" y="50" class="nzl">${NET_ZN[k]}</text></g>`;
  const node = (ep, label, ic) => { const p = netPos(st, ep); if (!p) return ""; return `<g class="nnode ${ep}"><rect x="${p[0]-52}" y="${p[1]-20}" width="104" height="40" rx="10"/><text x="${p[0]}" y="${p[1]+5}" text-anchor="middle">${ic} ${esc(label)}</text></g>`; };
  return `<svg class="netsvg" viewBox="0 0 760 310" role="img" aria-label="Network map">${zone("internet",10)}${zone("dmz",265)}${zone("internal",520)}
    <g class="fw"><rect x="246" y="28" width="12" height="270" rx="4"/><rect x="501" y="28" width="12" height="270" rx="4"/><text x="252" y="20" text-anchor="middle">firewall</text><text x="507" y="20" text-anchor="middle">firewall</text></g>
    ${node("customer","Customer","🧑")}${node("attacker","Attacker","🕶")}${node("internet","Internet","☁")}${NET_DEV.map(([d, l, ic]) => node(d, d === "lap" ? "Laptops" : d, ic)).join("")}
    <circle class="pkt" r="8" cx="-20" cy="-20"/><text class="pktx" x="-20" y="-20" text-anchor="middle">✕</text></svg>`;
}
losRegister({id:"net", title:"NetBuilder", icon:"⇄", color:"#0F766E", size:[980,640], mount(body, ctx){
  const st = ctx.st; netInit(st); let results = st.lastRun || null, running = false;
  const sel = (i, f, v, opts) => `<select data-nrule="${i}|${f}" aria-label="${f}">${opts.map(o => `<option value="${o}" ${o===v?"selected":""}>${o === "any" ? "Any" : NET_ZN[o] || NET_EPN[o] || o}</option>`).join("")}</select>`;
  const draw = () => {
    body.innerHTML = `<div class="apppad netapp">${opStrip("net")}
      <div class="netgrid"><div><div class="netmap">${netSvg(st)}</div>
        <div class="card inset"><b>1 · Place the devices</b><p class="num">A DMZ is a buffer zone for servers the internet must reach. Anything holding sensitive data stays inside.</p><div class="row">${NET_DEV.map(([d, l]) => `<label class="f">${esc(l)}<select data-nplace="${d}"><option value="">Choose a zone…</option>${Object.entries(NET_ZN).map(([k, z]) => `<option value="${k}" ${st.place[d]===k?"selected":""}>${z}</option>`).join("")}</select></label>`).join("")}</div></div></div>
      <div><div class="card inset"><b>2 · Firewall rules</b><p class="num">Read top to bottom: the first rule that matches decides. Then the default applies.</p>
        <div class="tblwrap"><table class="tbl nrules"><thead><tr><th>#</th><th>From</th><th>To</th><th>Port</th><th>Action</th><th></th></tr></thead><tbody>${st.rules.map((r, i) => `<tr><td>${i+1}</td><td>${sel(i,"src",r.src,NET_EPS)}</td><td>${sel(i,"dst",r.dst,NET_EPS)}</td><td>${sel(i,"port",r.port,NET_PORTS)}</td><td>${sel(i,"act",r.act,["allow","deny"])}</td><td class="nowrap"><button class="ibtn" data-nup="${i}" aria-label="Move up">↑</button><button class="ibtn" data-ndel="${i}" aria-label="Delete rule">✕</button></td></tr>`).join("")}</tbody></table></div>
        <div class="row between"><button class="btn sm ghost" data-nadd="1">+ Add rule</button><div class="row"><span class="num">If nothing matches:</span><div class="seg" role="group" aria-label="Default policy"><button aria-pressed="${st.def==="allow"}" data-ndef="allow">Allow</button><button aria-pressed="${st.def==="deny"}" data-ndef="deny">Deny</button></div></div></div></div>
        <div class="card inset"><div class="row between"><b>3 · Traffic test</b><button class="btn sm" data-nrun="1" ${running?"disabled":""}>${running?"Testing…":"▶ Run traffic test"}</button></div>
          <ul class="ntests">${NET_TESTS.map((t, i) => { const r = results && results[i]; return `<li class="${r ? (r.pass ? "pass" : "fail") : ""}"><span>${esc(t[0])}</span><span class="num">should be ${t[4] ? "allowed" : "blocked"}${r ? ` · ${r.allowed===null?"can't run":r.allowed?"allowed":"blocked"} ${r.pass?"✓":"✗"}` : ""}</span></li>`; }).join("")}</ul>
          ${results ? `<p class="num">${results.every(r => r.pass) ? "Every packet behaved. That's least privilege: only what the business needs gets through." : "Some packets didn't behave. Check placement, rule order and the default."}</p>` : ""}</div></div></div></div>`;
  };
  const anim = (from, to, allowed) => new Promise(res => {
    const dot = body.querySelector(".pkt"), x = body.querySelector(".pktx"); if (!dot || !from || !to) return res();
    const walls = [252, 507], dir = Math.sign(to[0] - from[0]) || 1, crossing = walls.filter(w => (w - from[0]) * (w - to[0]) < 0).sort((a, b) => dir * (a - b));
    let end = to; if (!allowed && crossing.length) { const w = crossing[0], f = (w - from[0]) / (to[0] - from[0]); end = [w - dir * 10, from[1] + (to[1] - from[1]) * f]; }
    dot.classList.toggle("bad", !allowed); x.setAttribute("x", -20); x.setAttribute("y", -20);
    const t0 = Date.now(), dur = 650, step = () => { const k = Math.min(1, (Date.now() - t0) / dur), cx = from[0] + (end[0] - from[0]) * k, cy = from[1] + (end[1] - from[1]) * k; dot.setAttribute("cx", cx); dot.setAttribute("cy", cy);
      if (k < 1) setTimeout(step, 16); else { if (!allowed) { x.setAttribute("x", cx); x.setAttribute("y", cy + 5); } setTimeout(res, 260); } };
    step();
  });
  const run = async () => {
    running = true; results = null; draw();
    const out = [];
    for (const t of NET_TESTS) { const r = netEval(st, t); const pass = r.allowed === t[4]; out.push({allowed:r.allowed, pass});
      const ul = body.querySelectorAll(".ntests li")[out.length - 1]; if (ul) { ul.className = pass ? "pass" : "fail"; const n = ul.querySelector(".num"); if (n) n.textContent = `should be ${t[4]?"allowed":"blocked"} · ${r.allowed===null?"can't run":r.allowed?"allowed":"blocked"} ${pass?"✓":"✗"}`; }
      if (r.allowed !== null) await anim(netPos(st, t[1]), netPos(st, t[2]), r.allowed); }
    running = false; results = out; st.lastRun = out; if (out.every(r => r.pass) && netPlaced(st)) st.tested = true; ctx.save(); ctx.check(); draw();
  };
  body.addEventListener("change", e => { const t = e.target; if (running) return;
    if (t.dataset.nplace) { st.place[t.dataset.nplace] = t.value || undefined; if (!t.value) delete st.place[t.dataset.nplace]; results = null; ctx.save(); ctx.check(); draw(); return; }
    if (t.dataset.nrule) { const [i, f] = t.dataset.nrule.split("|"); st.rules[+i][f] = t.value; results = null; ctx.save(); ctx.check(); draw(); } });
  body.addEventListener("click", e => { const t = e.target.closest("[data-nadd],[data-nup],[data-ndel],[data-ndef],[data-nrun]"); if (!t || running) return; const d = t.dataset;
    if (d.nadd) st.rules.push({src:"internet", dst:"web01", port:"443", act:"allow"});
    else if (d.nup) { const i = +d.nup; if (i > 0) [st.rules[i-1], st.rules[i]] = [st.rules[i], st.rules[i-1]]; }
    else if (d.ndel) st.rules.splice(+d.ndel, 1);
    else if (d.ndef) st.def = d.ndef;
    else if (d.nrun) { run(); return; }
    results = null; ctx.save(); ctx.check(); draw(); });
  draw();
  return {onArgs: () => draw()};
}});

/* ---------- VulnScan (scope, scan, triage by CVSS + KEV, false positives) ---------- */
const SCAN_ASSETS = [
 {id:"pay-api", d:"Payments API (Java)", exp:"Internet"}, {id:"fw-edge", d:"Edge firewall (Palo Alto, GlobalProtect on)", exp:"Internet"},
 {id:"vpn-gw", d:"Remote-access gateway (Citrix NetScaler)", exp:"Internet"}, {id:"hr-portal", d:"Careers site (static pages on nginx)", exp:"Internet"},
 {id:"fileserver-old", d:"Old Windows file server", exp:"Internal"}, {id:"intranet", d:"Intranet web app", exp:"Internal"},
 {id:"build-01", d:"Build server", exp:"Internal"}, {id:"payroll-db", d:"Payroll database (MySQL)", exp:"Internal"}
];
const SCAN_FIND = [
 {id:"f1", asset:"pay-api", cve:"CVE-2021-44228", name:"Apache Log4j remote code execution (Log4Shell)", cvss:"10.0", sev:"Critical", kev:true, pr:"P1", ev:"Log4j 2.14.1 found in /opt/pay-api/lib. A safe JNDI lookup test called back to the scanner."},
 {id:"f2", asset:"fw-edge", cve:"CVE-2024-3400", name:"PAN-OS GlobalProtect command injection", cvss:"10.0", sev:"Critical", kev:true, pr:"P1", ev:"PAN-OS 11.1.0 with a GlobalProtect gateway configured, which the vendor advisory lists as affected."},
 {id:"f3", asset:"vpn-gw", cve:"CVE-2023-4966", name:"NetScaler session-token leak (Citrix Bleed)", cvss:"9.4 (vendor)", sev:"Critical", kev:true, pr:"P1", ev:"NetScaler build 13.1-48.47 configured as a Gateway (VPN virtual server), which is affected."},
 {id:"f4", asset:"fileserver-old", cve:"CVE-2017-0144", name:"Windows SMBv1 remote code execution (EternalBlue)", cvss:"8.8", sev:"High", kev:true, pr:"P2", ev:"SMBv1 enabled; the MS17-010 update is missing on Windows Server 2012 R2."},
 {id:"f5", asset:"intranet", cve:"", name:"TLS 1.0 and 1.1 still enabled", cvss:"—", sev:"Medium", kev:false, pr:"P3", ev:"The server accepts TLS 1.0/1.1 handshakes. Modern browsers use TLS 1.2 or 1.3."},
 {id:"f6", asset:"build-01", cve:"", name:"Self-signed certificate on the admin page", cvss:"—", sev:"Low", kev:false, pr:"P4", ev:"An internal-only page uses a self-signed certificate, so users see browser warnings."},
 {id:"f7", asset:"hr-portal", cve:"CVE-2017-5638", name:"Apache Struts remote code execution", cvss:"9.8", sev:"Critical", kev:true, pr:"FP", ev:"Matched on a URL pattern only. Server header: nginx/1.24.0. The site is static HTML with no Java or Struts installed (confirmed with the web team)."},
 {id:"f8", asset:"payroll-db", cve:"", name:"MySQL 5.7 is end-of-life (no more security fixes)", cvss:"—", sev:"High", kev:false, pr:"P2", ev:"MySQL 5.7.44 detected. Oracle ended support for MySQL 5.7 in October 2023."}
];
const SCAN_POLICY = [["P1","7 days","Internet-facing AND (on CISA's Known Exploited Vulnerabilities list OR CVSS 9.0+)"],["P2","30 days","High (CVSS 7.0–8.9), or on the Known Exploited list but internal only"],["P3","90 days","Medium (CVSS 4.0–6.9)"],["P4","Next cycle","Low or informational"],["FP","Close with a note","False positive: evidence shows the affected product isn't there"]];
function scanInit(st){ st.scope ||= SCAN_ASSETS.filter(a => a.id !== "payroll-db").map(a => a.id); st.pri ||= {}; st.scans ||= 0; st.scanned ||= []; }
const scanVisible = st => SCAN_FIND.filter(f => (st.scanned || []).includes(f.asset));
losRegister({id:"scan", title:"VulnScan", icon:"⌖", color:"#7C3AED", size:[980,620], mount(body, ctx, args){
  const st = ctx.st; scanInit(st); let tab = opTabFor("scan", args.op) || (st.scans ? "find" : "scope"), prog = null, open = {};
  const sevCls = s => s === "Critical" ? "hot" : s === "High" ? "warn" : s === "Medium" ? "acc" : "";
  const draw = () => {
    const vis = scanVisible(st), aset = Object.fromEntries(SCAN_ASSETS.map(a => [a.id, a]));
    body.innerHTML = `<div class="apppad">${opStrip("scan")}${appTabs([["scope","Scope & scan"],["find",`Findings (${vis.length})`],["policy","Fix-time policy"]], tab, "vtab")}
    ${tab === "scope" ? `<p class="num">Asset inventory (from the CMDB). A scanner only finds what it's pointed at, so compare the inventory with the scan scope.</p>
      <div class="tblwrap"><table class="tbl"><thead><tr><th>In scope</th><th>Asset</th><th>What it is</th><th>Exposure</th><th>Last scanned</th></tr></thead><tbody>${SCAN_ASSETS.map(a => `<tr><td><input type="checkbox" data-vscope="${a.id}" ${st.scope.includes(a.id)?"checked":""} aria-label="Scan ${a.id}"></td><td><b>${a.id}</b></td><td>${esc(a.d)}</td><td><span class="pill ${a.exp==="Internet"?"warn":""}">${a.exp}</span></td><td class="num">${st.scanned.includes(a.id)?"✓ scanned":"never"}</td></tr>`).join("")}</tbody></table></div>
      <div class="row"><button class="btn" data-vrun="1" ${prog?"disabled":""}>${prog?"Scanning…":"▶ Run scan"}</button><span class="num">${st.scope.length} of ${SCAN_ASSETS.length} assets in scope · scans run: ${st.scans}</span></div>
      ${prog ? `<div class="scanlog"><div class="bar acc"><i style="width:${prog.pct}%"></i></div><pre class="doc">${esc(prog.log.join("\n"))}</pre></div>` : ""}`
    : tab === "find" ? (vis.length ? `<div class="vpol num">Policy: ${SCAN_POLICY.slice(0,4).map(p => `<b>${p[0]}</b> ${esc(p[2])} (${p[1]})`).join(" · ")} · <b>FP</b> false positive</div>
      <div class="vlist">${vis.map(f => { const a = aset[f.asset], p = st.pri[f.id] || "", ok = p && p === f.pr; return `<div class="vfrow ${p ? (ok ? "ok" : "no") : ""}"><div class="vmain"><span class="pill ${sevCls(f.sev)}">${f.sev}</span>${f.kev?`<span class="pill hot" title="On CISA's Known Exploited Vulnerabilities catalog">KEV</span>`:""}<b>${esc(f.name)}</b><span class="num">${f.cve?esc(f.cve)+" · ":""}CVSS ${esc(f.cvss)} · ${esc(f.asset)} (${a.exp})</span></div>
        <div class="row"><select data-vpri="${f.id}" aria-label="Priority for ${esc(f.name)}"><option value="">Priority…</option>${["P1","P2","P3","P4","FP"].map(x => `<option value="${x}" ${p===x?"selected":""}>${x === "FP" ? "False positive" : x}</option>`).join("")}</select><button class="link" data-vev="${f.id}">${open[f.id]?"Hide evidence":"Evidence"}</button>${p?`<span class="num">${ok?"✓ matches the policy":"✗ check the policy"}</span>`:""}</div>
        ${open[f.id]?`<div class="inset num">${esc(f.ev)}</div>`:""}</div>`; }).join("")}</div>` : `<div class="note">No findings yet. Run a scan from "Scope & scan".</div>`)
    : `<div class="tblwrap"><table class="tbl"><thead><tr><th>Priority</th><th>Fix within</th><th>When</th></tr></thead><tbody>${SCAN_POLICY.map(p => `<tr><td><b>${p[0]}</b></td><td>${p[1]}</td><td>${esc(p[2])}</td></tr>`).join("")}</tbody></table></div>
      <p class="num">CVSS (0–10) measures how bad a flaw could be. CISA's Known Exploited Vulnerabilities (KEV) list shows which ones attackers are using right now. Exposure (internet or internal) decides how reachable it is. Good programmes combine all three, and always check the evidence before raising tickets.</p>`}</div>`;
  };
  const run = () => {
    if (prog) return; const list = st.scope.slice(); if (!list.length) return; prog = {pct:0, log:["Starting authenticated scan of " + list.length + " assets…"]}; draw(); let i = 0;
    const tick = () => { if (i >= list.length) { st.scans++; st.scanned = Array.from(new Set([...st.scanned, ...list])); prog.log.push("Scan complete."); ctx.save(); ctx.check(); setTimeout(() => { prog = null; tab = "find"; draw(); }, 500); draw(); return; }
      const id = list[i++], n = SCAN_FIND.filter(f => f.asset === id).length; prog.pct = Math.round(i / list.length * 100); prog.log.push(`${id.padEnd(15)} ${n ? n + " finding" + (n > 1 ? "s" : "") : "clean"}`); draw(); setTimeout(tick, 280); };
    setTimeout(tick, 250);
  };
  body.addEventListener("change", e => { const t = e.target;
    if (t.dataset.vscope) { const id = t.dataset.vscope; st.scope = t.checked ? Array.from(new Set([...st.scope, id])) : st.scope.filter(x => x !== id); ctx.save(); draw(); return; }
    if (t.dataset.vpri) { st.pri[t.dataset.vpri] = t.value; ctx.save(); ctx.check(); draw(); } });
  body.addEventListener("click", e => { const t = e.target.closest("[data-vtab],[data-vrun],[data-vev]"); if (!t) return; const d = t.dataset;
    if (d.vtab) { tab = d.vtab; draw(); } else if (d.vrun) run(); else if (d.vev) { open[d.vev] = !open[d.vev]; draw(); } });
  draw();
  return {onArgs: a => { const t = opTabFor("scan", a.op); if (t) { tab = t; draw(); } }};
}});

/* ---------- Crypto Bench (hashing, AES-GCM with PBKDF2, password entropy) ---------- */
const CB_COMMON = ["123456","password","123456789","12345678","qwerty","111111","abc123","password1","iloveyou","admin","welcome","india@123","password@123","p@ssw0rd","admin@123","qwerty123","india123","sachin","000000"];
function hexBits(h){ return h.split("").map(c => parseInt(c, 16).toString(2).padStart(4, "0")).join(""); }
function fmtDur(s){ if (!isFinite(s)) return "longer than the universe has existed"; if (s < 1) return "instantly"; const u = [["year",31557600],["day",86400],["hour",3600],["minute",60],["second",1]]; for (const [n, v] of u) if (s >= v) { const x = s / v; if (n === "year" && x > 1e6) return x > 1e12 ? "trillions of years" : `${Math.round(x/1e6).toLocaleString("en-IN")} million years`; return `${Math.round(x).toLocaleString("en-IN")} ${n}${Math.round(x) === 1 ? "" : "s"}`; } return "instantly"; }
function pwEntropy(p){
  const warn = []; if (!p) return {bits:0, warn, how:""};
  if (CB_COMMON.includes(p.toLowerCase())) return {bits:0, warn:["This exact password is on breach lists. Attackers try those first."], how:"breach list"};
  const words = p.trim().split(/[\s\-_.]+/).filter(Boolean);
  if (words.length >= 3 && words.every(w => /^[a-zA-Z]+$/.test(w) || /^\d{1,3}$/.test(w))) { const bits = words.length * Math.log2(7776); return {bits, warn: words.length < 6 ? ["Add words: each truly random word adds about 12.9 bits."] : [], how:`${words.length} words, as if picked at random from a 7,776-word list (diceware)`}; }
  let pool = 0; if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^A-Za-z0-9]/.test(p)) pool += 33;
  let bits = p.length * Math.log2(pool || 1);
  if (/^[A-Z]?[a-z]+[@#!$&*]?\d{1,4}[@#!$]?$/.test(p)) { bits = Math.min(bits, 28); warn.push("Word + symbol + number (like Name@123) is the first pattern cracking tools try."); }
  if (/(19|20)\d\d/.test(p)) { bits -= 10; warn.push("A year is easy to guess (birth years, the current year)."); }
  if (/(.)\1\1/.test(p)) { bits -= 6; warn.push("Repeated characters add little."); }
  if (/(abc|123|qwe|asd)/i.test(p)) { bits -= 8; warn.push("Keyboard and alphabet runs are guessed early."); }
  return {bits:Math.max(0, bits), warn, how:`${p.length} characters from a pool of ${pool}`};
}
const u8b64 = u => { let s = ""; u.forEach(b => s += String.fromCharCode(b)); return btoa(s); }, b64u8 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function cbKey(pass, salt){ const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]); return crypto.subtle.deriveKey({name:"PBKDF2", salt, iterations:600000, hash:"SHA-256"}, base, {name:"AES-GCM", length:256}, false, ["encrypt","decrypt"]); }
async function cbEncrypt(pass, msg){ const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await cbKey(pass, salt); const ct = new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, new TextEncoder().encode(msg))); return {salt:u8b64(salt), iv:u8b64(iv), ct:u8b64(ct)}; }
async function cbDecrypt(pass, box){ const key = await cbKey(pass, b64u8(box.salt)); const pt = await crypto.subtle.decrypt({name:"AES-GCM", iv:b64u8(box.iv)}, key, b64u8(box.ct)); return new TextDecoder().decode(pt); }
losRegister({id:"crypto", title:"Crypto Bench", icon:"🔐", color:"#334155", size:[900,600], mount(body, ctx, args){
  const st = ctx.st; let tab = opTabFor("crypto", args.op) || "hash", A = st.hA || "Transfer ₹10,000 to vendor 4471", B = st.hB || "Transfer ₹90,000 to vendor 4471", cmp = null, pw = "", box = null, pass = "", msg = "Board minutes: Q3 results to be announced on 14 Nov.", dec = null, busy = false;
  const hasSubtle = !!(window.crypto && crypto.subtle);
  const diff1 = (a, b) => { if (a === b) return false; if (Math.abs(a.length - b.length) > 1) return false; if (a.length === b.length) { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n === 1; } const [s, l] = a.length < b.length ? [a, b] : [b, a]; for (let i = 0; i < l.length; i++) if (l.slice(0, i) + l.slice(i + 1) === s) return true; return false; };
  const draw = () => {
    let inner = "";
    if (tab === "hash") {
      const hA = sha256hex(A), hB = sha256hex(B), bA = hexBits(hA), bB = hexBits(hB), n = [...bA].filter((c, i) => c !== bB[i]).length;
      inner = `<p class="num">A hash is a fingerprint: the same input always gives the same 64-character SHA-256 value, and the smallest change scrambles it completely (the "avalanche effect"). That's how integrity checks, digital signatures and evidence hashing work.</p>
        <label class="f">Message A<input type="text" id="cbA" value="${esc(A)}"></label><code class="hash">${hA}</code>
        <label class="f">Message B (change one character)<input type="text" id="cbB" value="${esc(B)}"></label><code class="hash">${hB}</code>
        <div class="row"><button class="btn sm" data-cbcmp="1">Compare the bits</button>${diff1(A, B) ? `<span class="num">A and B differ by exactly one character.</span>` : `<span class="num">Tip: make B differ from A by exactly one character.</span>`}</div>
        ${cmp ? `<div class="bitgrid" aria-label="${n} of 256 bits differ">${[...bA].map((c, i) => `<i class="${c !== bB[i] ? "d" : ""}"></i>`).join("")}</div><p class="num"><b>${n} of 256 bits</b> changed (${Math.round(n / 2.56)}%). About half is what a good hash gives. You can't work backwards from a hash, and you can't predict how it will change.</p>` : ""}`;
    } else if (tab === "enc") {
      inner = `<p class="num">Encryption scrambles data so only someone with the key can read it. Here a passphrase is stretched into a 256-bit key (PBKDF2, 600,000 rounds, the OWASP recommendation for SHA-256), then the message is sealed with AES-GCM, which also detects tampering.</p>
        ${hasSubtle ? `<label class="f">Passphrase<input type="text" id="cbPass" value="${esc(pass)}" placeholder="e.g. lantern river copper 27"></label><label class="f">Message<textarea id="cbMsg" rows="2">${esc(msg)}</textarea></label>
        <div class="row"><button class="btn sm" data-cbenc="1" ${busy?"disabled":""}>${busy?"Working…":"Encrypt"}</button>${box?`<button class="btn sm ghost" data-cbdec="1" ${busy?"disabled":""}>Decrypt</button><button class="btn sm ghost" data-cbtamper="1" ${busy?"disabled":""}>Tamper with 1 bit</button>`:""}</div>
        ${box ? `<div class="inset"><span class="num">Salt</span><code class="hash">${esc(box.salt)}</code><span class="num">IV (nonce)</span><code class="hash">${esc(box.iv)}</code><span class="num">Ciphertext + authentication tag${box.tampered?" (tampered)":""}</span><code class="hash">${esc(box.ct)}</code></div>` : ""}
        ${dec ? `<div class="${dec.ok?"info":"note"}">${dec.ok?`Decrypted: <b>${esc(dec.text)}</b>`:`Decryption failed: ${esc(dec.text)}`}</div>` : ""}` : `<div class="note">This browser view doesn't offer the Web Crypto API, so encryption can't run here. Open Career Count on claude.ai in a current browser.</div>`}`;
    } else {
      const r = pwEntropy(pw), bits = Math.round(r.bits), off = Math.pow(2, r.bits) / 2 / 1e10, on = Math.pow(2, r.bits) / 2 / (10 / 60);
      const lvl = bits >= 80 ? ["Very strong","ok"] : bits >= 60 ? ["Strong","ok"] : bits >= 40 ? ["Fair","warn"] : ["Weak","bad"];
      inner = `<p class="num">Strength is about how many guesses an attacker needs. Each bit of entropy doubles that. Type a password to test it. Nothing is stored or sent anywhere.</p>
        <label class="f">Password or passphrase<input type="text" id="cbPw" value="${esc(pw)}" autocomplete="off" spellcheck="false"></label>
        <div class="entbar"><i style="width:${Math.min(100, bits)}%" class="${lvl[1]}"></i><span style="left:40%"></span><span style="left:60%"></span><span style="left:70%" class="goal"></span><span style="left:80%"></span></div>
        <div class="grid3"><div class="inset tile"><span class="lbl">Estimated entropy</span><span class="big">${bits} bits</span><span class="num">${esc(lvl[0])}${r.how?" · "+esc(r.how):""}</span></div><div class="inset tile"><span class="lbl">Offline attack (10 billion guesses/s)</span><span class="big" style="font-size:1.05rem">${pw?fmtDur(off):"—"}</span><span class="num">on average</span></div><div class="inset tile"><span class="lbl">Online attack (10 guesses/min, lockouts)</span><span class="big" style="font-size:1.05rem">${pw?fmtDur(on):"—"}</span><span class="num">why lockouts and MFA help</span></div></div>
        ${r.warn.length?`<ul class="clean">${r.warn.map(w=>`<li class="num">⚠ ${esc(w)}</li>`).join("")}</ul>`:""}<p class="num">Goal: reach 70 bits without a common pattern. Six random words, or 12+ random characters, will do it. Then store it in a password manager.</p>`;
    }
    body.innerHTML = `<div class="apppad">${opStrip("crypto")}${appTabs([["hash","Hashing"],["enc","Encryption"],["pw","Password strength"]], tab, "cbtab")}${inner}</div>`;
  };
  body.addEventListener("input", e => { const t = e.target;
    if (t.id === "cbA" || t.id === "cbB") { if (t.id === "cbA") A = t.value; else B = t.value; st.hA = A; st.hB = B; cmp = null; const codes = body.querySelectorAll("code.hash"); if (codes[0]) codes[0].textContent = sha256hex(A); if (codes[1]) codes[1].textContent = sha256hex(B); const g = body.querySelector(".bitgrid"); if (g) { g.nextElementSibling && g.nextElementSibling.remove(); g.remove(); } return; }
    if (t.id === "cbPass") { pass = t.value; return; } if (t.id === "cbMsg") { msg = t.value; return; }
    if (t.id === "cbPw") { pw = t.value; const r = pwEntropy(pw); if (r.bits >= 70 && !r.warn.length && !st.strong) { st.strong = true; ctx.save(); ctx.check(); } const pos = t.selectionStart; draw(); const n = body.querySelector("#cbPw"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch(_) {} } } });
  body.addEventListener("click", async e => { const t = e.target.closest("[data-cbtab],[data-cbcmp],[data-cbenc],[data-cbdec],[data-cbtamper]"); if (!t) return; const d = t.dataset;
    if (d.cbtab) { tab = d.cbtab; draw(); return; }
    if (d.cbcmp) { cmp = true; if (diff1(A, B) && !st.aval) { st.aval = true; ctx.save(); ctx.check(); } draw(); return; }
    if (d.cbenc) { if (!pass) { dec = {ok:false, text:"Type a passphrase first."}; draw(); return; } busy = true; dec = null; draw(); try { box = await cbEncrypt(pass, msg); box.pass = pass; if (!st.enc) { st.enc = true; ctx.save(); ctx.check(); } } catch(err) { dec = {ok:false, text:String(err && err.message || err)}; } busy = false; draw(); return; }
    if (d.cbdec) { busy = true; draw(); try { dec = {ok:true, text: await cbDecrypt(pass, box)}; } catch(err) { dec = {ok:false, text: box.tampered ? "the authentication tag didn't match. AES-GCM noticed the ciphertext was changed and refused to decrypt it." : "wrong passphrase, or the data was changed."}; if (box.tampered && !st.tamper) { st.tamper = true; ctx.save(); ctx.check(); } } busy = false; draw(); return; }
    if (d.cbtamper) { const u = b64u8(box.ct); u[Math.floor(u.length / 2)] ^= 1; box = Object.assign({}, box, {ct:u8b64(u), tampered:true}); dec = null; draw(); return; }
  });
  draw();
  return {onArgs: a => { const t = opTabFor("crypto", a.op); if (t) { tab = t; draw(); } }};
}});
