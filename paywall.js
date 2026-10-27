/* ================= CAREER COUNT SUBSCRIPTION: pricing, popups, paywall, checkout, admin ================= */
/* How payment works (no card data ever touches this page):
   - UPI: a QR code / UPI link to the owner's UPI ID with the exact amount. The customer pays in any UPI app and submits the UTR.
   - Cards & net banking (and UPI too): a hosted payment page from a licensed gateway (e.g. Razorpay Payment Page / Payment Link).
     The customer pays there and submits the payment ID.
   - The owner verifies the payment in her gateway or bank app and approves it on the Admin page; access unlocks instantly.
   Prices are GST-inclusive; the breakdown is computed from the GST rate set by the owner. */
const PAY_DEFAULT = {std:1500, intro:1200, introOn:true, introEnds:"2026-12-31", months:12, gst:18, gstin:"", biz:"Career Count", payee:"", vpa:"", link:"", email:"", phone:"", refund:"Full refund within 7 days of purchase if you have completed less than 10% of the course. Email us with your payment reference.", terms:"Access is personal and for one learner. Do not share your account."};
const ACCESS = {ready:false, owner:false, paid:false, uid:"", sub:null, claim:null, cfg:Object.assign({}, PAY_DEFAULT), previewFree:false, claims:null, subs:null};
const FREE_ROUTES = ["home","learn","roles","matrix","path","pricing","support","profile"];
function introActive(){ const c = ACCESS.cfg; return !!c.introOn && (!c.introEnds || today() <= c.introEnds); }
function priceNow(){ return introActive() ? +ACCESS.cfg.intro : +ACCESS.cfg.std; }
const inr = n => "₹" + Number(n).toLocaleString("en-IN", {minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2});
function gstParts(p){ const r = +ACCESS.cfg.gst || 0, base = Math.round(p / (1 + r/100) * 100) / 100; return {base, gst: Math.round((p - base) * 100) / 100, rate: r}; }
function hasAccess(){ if (ACCESS.owner && !ACCESS.previewFree) return true; const s = ACCESS.sub; return !!(s && s.active && (!s.until || s.until >= today())); }
function isFreeRoute(r){ return FREE_ROUTES.includes(r) || !!TOPIC[r] || /^role-/.test(r); }
function daysLeft(d){ return Math.max(0, Math.ceil((new Date(d + "T23:59:59") - Date.now()) / 864e5)); }

/* ---------- access check (runs once the account connection is ready) ---------- */
async function accessInit(){
  if (!cap.db || !cap.user) { ACCESS.ready = true; rerender(); return; }
  try { ACCESS.owner = await cap.user.isOwner(); } catch(e) { ACCESS.owner = false; }
  try { ACCESS.uid = await cap.user.id() || ""; } catch(e) { ACCESS.uid = ""; }
  try { const c = await cap.db.collection("meta").doc("pay").get(); if (c.exists) ACCESS.cfg = Object.assign({}, PAY_DEFAULT, c.data()); } catch(e) {}
  if (!ACCESS.owner && ACCESS.uid) {
    try { cap.db.collection("subs").doc(ACCESS.uid).onSnapshot(s => { const was = hasAccess(); ACCESS.sub = s.exists ? s.data() : null; if (!was && hasAccess()) { closePaywall(); toast("Welcome to Career Count! Everything is unlocked."); } rerender(); renderHeader(); }, () => {}); } catch(e) {}
    try { cap.db.collection("claims").doc(ACCESS.uid).onSnapshot(s => { ACCESS.claim = s.exists ? s.data() : null; if (["pricing"].includes(current) || document.getElementById("payModal")) { rerender(); refreshCheckout(); } }, () => {}); } catch(e) {}
  }
  ACCESS.ready = true; rerender(); renderHeader();
  if (!hasAccess()) { let seen = false; try { seen = sessionStorage.getItem(LS("adseen")) === "1"; } catch(e) {} if (!seen) setTimeout(() => { if (!hasAccess()) { openPaywall("welcome"); try { sessionStorage.setItem(LS("adseen"), "1"); } catch(e) {} } }, 1200); }
}

/* ---------- gate: returns HTML when the current route is locked or previewed, else null ---------- */
function gateView(r){
  if (r === "pricing") return viewPricing();
  if (r === "admin") return ACCESS.owner ? viewAdmin() : viewPricing();
  if (hasAccess()) return null;
  if (r === "home") return viewFreeHome();
  if (TOPIC[r]) return viewTopicPreview(TOPIC[r]);
  if (/^role-/.test(r)) return ROLE[r.slice(5)] && pathOf(r.slice(5)) ? viewRolePreview(r.slice(5)) : null;
  if (isFreeRoute(r)) return null;
  if (!ACCESS.ready) return `<div class="card"><span class="eyebrow">One moment</span><h3>Checking your access…</h3><p class="muted">This takes a second the first time.</p></div>`;
  return viewLocked(r);
}
const LOCK_INFO = {
 lab:["Cyber Lab (LabOS)","A computer inside the browser: Linux terminal, phishing inbox, network builder, vulnerability scanner, SIEM hunt, GRC and Privacy consoles, AI Governance Desk."],
 projects:["Projects with AI review","Graded projects across three levels for every subject, reviewed by Claude, with hints, a coach and one-click GitHub publishing."],
 insights:["Insights & coach","Your weak spots from quizzes, projects and Lab, with a 7-day plan."],
 resume:["Resume builder","Upload your resume; see how hiring systems read it, the gaps per role, and download an ATS-friendly version."],
 applications:["Applications & Gmail","Your job applications tracked from Gmail every 6 hours, with AI reply drafts in your best interest."],
 certs:["Certifications","Which certificates to do, in what order, and how much of each exam you've covered."],
 news:["News & regulations","Government and regulator updates twice a week, with what they mean for your job hunt."],
 ideas:["Project ideas","Weighted portfolio ideas per role plus monthly AI picks."],
 automation:["Automation tools","Power Automate, Python and Zapier with study plans and a flow builder."],
 mentors:["Student support","Mentors, three rooms per mentor, ring and message."],
 network:["Network","Find people, prepare notes, track follow-ups."],
 linkedin:["LinkedIn rebuild","Headlines, About text and skills that match your resume."],
 jobs:["Jobs to target","Search strings and companies to target."],
 videos:["Video bookmarks","Jump to the exact minute of a video for each sub-topic."],
 updates:["Updates","Weekly checks on law changes and skills in demand."]
};
function lockKey(r){ return /^proj-/.test(r) ? "projects" : /^cert-/.test(r) ? "certs" : /^lab/.test(r) ? "lab" : r; }
function viewLocked(r){
  const [name, what] = LOCK_INFO[lockKey(r)] || [TITLES[r] || "This feature", "Part of full access."];
  return `<div class="card lockhero"><span class="lockbig" aria-hidden="true">🔒</span><span class="eyebrow">Full access</span><h2>${esc(name)}</h2><p class="lede">${esc(what)}</p>
    ${priceBlock()}
    <div class="row"><button class="btn" data-paynow="1">Unlock everything</button><button class="btn ghost" data-go="pricing">See what's included</button><button class="btn ghost" data-go="learn">Explore the free curriculum</button></div></div>
  ${whatsInside(true)}`;
}
function priceBlock(compact){
  const p = priceNow(), g = gstParts(p), intro = introActive(), c = ACCESS.cfg;
  return `<div class="pricebox ${compact?"sm":""}"><div class="row" style="align-items:baseline;gap:10px">${intro?`<s class="num">${inr(c.std)}</s>`:""}<b class="priceamt">${inr(p)}</b><span class="num">incl. ${g.rate}% GST · ${c.months} months' access</span></div>
    ${intro?`<span class="pill hot">Introductory price${c.introEnds?` · ends in ${daysLeft(c.introEnds)} day${daysLeft(c.introEnds)===1?"":"s"}`:""}</span>`:""}
    ${compact?"":`<span class="num">${inr(g.base)} + ${inr(g.gst)} GST${c.gstin?` · GSTIN ${esc(c.gstin)}`:""}</span>`}</div>`;
}
function whatsInside(short){
  const nT = TOPICS.length, nP = ALLPROJ.length, nR = ROLES.filter(r=>pathOf(r.id)).length, nApps = LOS.order.length;
  const items = [["▤", `${nT} subjects`, "Privacy law, GRC, AI governance, cybersecurity, tools, business and legal careers, in plain English for law graduates."],["◆", `${nR} role paths`, "A page for every role: the job, a typical day, jargon, what to study, AI impact over 10 years and a roadmap."],["⚒", `${nP} graded projects`, "Real-world scenarios reviewed by Claude, publishable to GitHub as your portfolio."],["$_", `Cyber Lab with ${nApps} apps`, "Practise in a simulated computer: Linux terminal, SIEM, GRC console, AI Governance Desk and more."],["¶", "Resume & job tools", "ATS resume check, Gmail application tracker with AI replies, LinkedIn rebuild."],["✦", "Certificates & news", "Certificate plans and twice-weekly regulatory news."],["›", "AI tutor everywhere", "Command bar on every subject and role: /what, /how, /quiz, /interview, /ai."],["☏", "Mentors & help", "Mentor rooms, AI help desk and support."]];
  return `<div class="card"><span class="eyebrow">What's inside Career Count</span><div class="inside">${items.slice(0, short ? 4 : 8).map(([i,t,d])=>`<div class="ins"><span class="insi">${esc(i)}</span><div><b>${esc(t)}</b><p>${esc(d)}</p></div></div>`).join("")}</div></div>`;
}

/* ---------- free dashboard ---------- */
function viewFreeHome(){
  const tracks = TRACK_ORDER.map(k => [k, TOPICS.filter(t => t.track === k)]).filter(x => x[1].length);
  return `<div class="card hero freehero"><span class="eyebrow">Welcome to Career Count</span><h2>Your path into Privacy, GRC, AI governance and compliance careers</h2>
    <p class="lede">Built for law and commerce graduates in India: learn the laws and tools employers ask for, practise on realistic projects and a cyber lab, and prepare your resume, LinkedIn and job hunt in one place.</p>
    <div class="row">${priceBlock(true)}<button class="btn" data-paynow="1">Unlock full access</button><button class="btn ghost" data-go="learn">Explore the curriculum free</button></div></div>
  ${whatsInside(false)}
  <div class="card"><span class="eyebrow">The curriculum</span><h3>${TOPICS.length} subjects in ${tracks.length} tracks</h3>
    <div class="curric">${tracks.map(([k,ts]) => `<div class="ctrack" style="--tc:${TRACK_INFO[k].color}"><b>${esc(TRACK_INFO[k].icon)} ${esc(TRACK_INFO[k].name)}</b><span class="num">${ts.length} subjects</span><div class="row">${ts.slice(0,8).map(t=>`<button class="pill" data-go="${t.id}">${esc(t.title.replace(/ \(.*\)/,""))}</button>`).join("")}${ts.length>8?`<span class="num">+${ts.length-8} more</span>`:""}</div></div>`).join("")}</div></div>
  <div class="card"><span class="eyebrow">Choose your role</span><h3>Every role has its own page and roadmap</h3>
    <div class="rolegrid">${ROLES.filter(r=>pathOf(r.id)).map(r=>`<button class="rolecard" data-go="role-${r.id}"><b>${esc(roleShort(r.id))}</b><span class="num">${esc(r.fit)}</span>${AI_ROLE[r.id]?`<span class="pill ai-${aiBand(AI_ROLE[r.id].x)[1]}">AI ${aiBand(AI_ROLE[r.id].x)[0].toLowerCase()}</span>`:""}</button>`).join("")}</div></div>
  <div class="card adcard"><div class="row between"><div><span class="eyebrow">Limited-time offer</span><h3>${introActive()?`Introductory price ${inr(ACCESS.cfg.intro)} instead of ${inr(ACCESS.cfg.std)}`:`Full access for ${inr(ACCESS.cfg.std)}`}</h3><p class="muted" style="margin:0">One payment, ${ACCESS.cfg.months} months, everything unlocked. Pay by UPI, card or net banking.</p></div><button class="btn" data-paynow="1">Get full access</button></div></div>`;
}

/* ---------- previews ---------- */
function viewTopicPreview(t){
  const first = t.subs.findIndex(s => s.l === 1);
  return `<div class="thead"><button class="link" data-go="learn">← Learning path</button><span class="eyebrow">Free preview</span><h2>${esc(t.title)}</h2><p class="lede">${esc(t.short)}</p></div>
  <div class="card"><span class="eyebrow">Objective</span><p>${esc(t.obj)}</p><span class="eyebrow">Why it exists</span><p>${esc(t.why)}</p></div>
  ${first >= 0 ? `<div class="card"><span class="eyebrow">Sample lesson</span><h3>${esc(t.subs[first].t)}</h3><p>${esc(t.subs[first].b)}</p>${t.subs[first].ex?`<div class="ex"><b>Example:</b> ${esc(t.subs[first].ex)}</div>`:""}</div>` : ""}
  <div class="card"><span class="eyebrow">What you'll learn (${t.subs.length} parts)</span><ol class="clean numbered">${t.subs.map((s,i)=>`<li class="${i===first?"":"lockli"}">${esc(s.t)} ${lv(s.l)}${i===first?"":' <span aria-label="locked">🔒</span>'}</li>`).join("")}</ol></div>
  ${AI_IMPACT[t.id] ? `<div class="card">${aiMeter(AI_IMPACT[t.id][0])}<p class="num" style="margin:6px 0 0">Full access shows what AI will change in this subject next year and over 10 years.</p></div>` : ""}
  <div class="card lockhero sm"><span class="eyebrow">Unlock this subject</span><h3>Every lesson, the quiz, jargon decoder, videos, 3 graded projects and the AI tutor</h3>${priceBlock(true)}<div class="row"><button class="btn" data-paynow="1">Unlock everything</button><button class="btn ghost" data-go="pricing">See plans</button></div></div>`;
}
function viewRolePreview(rid){
  const R = ROLE[rid], P = pathOf(rid), I = ROLE_INFO[rid] || {};
  return `<div class="thead"><button class="link" data-go="roles">← All roles</button><span class="eyebrow">Free preview · ${esc(R.fit)}</span><h2>${esc(R.name)}</h2></div>
  <section class="card"><span class="eyebrow">The job in plain words</span><p class="lede" style="margin:4px 0 8px">${esc(I.what||"")}</p>
    <div class="grid2"><div><b>A typical day</b><ul class="clean">${(I.day||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><b>Who hires in India</b><p style="font-size:.92rem">${esc(I.industry||"")}</p></div></div>
    <b>Career ladder</b><div class="ladder2">${(I.ladder||[]).map((x,i)=>`<div class="lstep2 ${i===0?"cur":""}"><span class="num">${i+1}</span><b>${esc(x)}</b></div>`).join('<span class="arr" aria-hidden="true">→</span>')}</div></section>
  <section class="card"><span class="eyebrow">Subjects you'll study</span><div class="row">${P.core.map(id=>TOPIC[id]).filter(Boolean).map(t=>`<button class="pill acc" data-go="${t.id}">${esc(t.title.replace(/ \(.*\)/,""))}</button>`).join("")}</div>
    <p class="num">Plus ${P.support.length} supporting subjects. ${esc(P.skip)}</p></section>
  <section class="card"><span class="eyebrow">Jargon preview</span><div class="jargon">${Object.entries(I.jargon||{}).slice(0,3).map(([k,v])=>`<div class="jg"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div><p class="num">${Math.max(0,Object.keys(I.jargon||{}).length-3)} more terms with full access.</p></section>
  ${AI_ROLE[rid] ? `<section class="card">${aiMeter(AI_ROLE[rid].x, "Role AI exposure")}<p style="margin:6px 0 0"><b>Where the role is heading:</b> ${esc(AI_ROLE[rid].shift)}</p></section>` : ""}
  <div class="card lockhero sm"><span class="eyebrow">Unlock this role</span><h3>Must-know reading list, employer requirements checked against your resume, the 10-year AI outlook, roadmap, projects and the AI command bar</h3>${priceBlock(true)}<div class="row"><button class="btn" data-paynow="1">Unlock everything</button><button class="btn ghost" data-go="pricing">See plans</button></div></div>`;
}

/* ---------- pricing page ---------- */
function viewPricing(){
  const c = ACCESS.cfg, p = priceNow(), g = gstParts(p), paid = hasAccess() && !ACCESS.owner, cl = ACCESS.claim;
  const rows = [["Curriculum overview, subject and role previews",1,1],["All lessons, quizzes, jargon and videos",0,1],["Role pages: must-know, requirements, roadmap, 10-year AI outlook",0,1],[`${ALLPROJ.length} projects with AI review and GitHub publishing`,0,1],["Cyber Lab (LabOS) with tool projects",0,1],["AI tutor command bar on every subject and role",0,1],["Resume builder, Gmail tracker with AI replies, LinkedIn",0,1],["News & regulations, project ideas, automation tools",0,1],["Mentors and student support",0,1]];
  return `<div><span class="eyebrow">Pricing</span><h2>One simple plan</h2></div>
  ${paid?`<div class="info"><b>You have full access</b>${ACCESS.sub.until?` until ${esc(ACCESS.sub.until)}`:""}. Thank you!</div>`:""}
  ${cl && cl.status === "pending" && !paid ? `<div class="note"><b>Payment received for checking.</b> Reference ${esc(cl.ref)} · we usually verify within 24 hours and your access unlocks automatically.</div>` : ""}
  ${cl && cl.status === "rejected" && !paid ? `<div class="note"><b>We couldn't verify your payment.</b> ${esc(cl.reason||"Please check the reference and submit again, or contact support.")}</div>` : ""}
  <div class="grid2 plans">
    <div class="card plan"><span class="eyebrow">Free</span><h3>Explore</h3><b class="priceamt">₹0</b><p class="muted">See the whole curriculum, every role and a sample lesson in each subject.</p><button class="btn ghost" data-go="learn">Explore the curriculum</button></div>
    <div class="card plan best"><span class="eyebrow">Full access · ${c.months} months</span><h3>Career Count Complete</h3>${priceBlock()}<ul class="clean">${rows.filter(r=>r[2]).slice(1).map(r=>`<li>✓ ${esc(r[0])}</li>`).join("")}</ul>
      ${paid?"":`<button class="btn big" data-paynow="1">Pay ${inr(p)} and unlock</button>`}
      <div class="paymethods"><span class="pm">UPI (QR)</span><span class="pm">Debit / credit card</span><span class="pm">Net banking</span></div></div>
  </div>
  <div class="card"><span class="eyebrow">Compare</span><div class="tbl"><table><thead><tr><th>Feature</th><th>Free</th><th>Full access</th></tr></thead><tbody>${rows.map(([f,a,b])=>`<tr><td>${esc(f)}</td><td>${a?"✓":"—"}</td><td>${b?"✓":"—"}</td></tr>`).join("")}</tbody></table></div></div>
  <div class="grid2">
    <div class="card"><span class="eyebrow">Price details</span><div class="tbl"><table><tbody><tr><td>Standard price</td><td>${inr(c.std)} incl. GST</td></tr>${introActive()?`<tr><td>Introductory price${c.introEnds?` (until ${esc(c.introEnds)})`:""}</td><td><b>${inr(c.intro)}</b> incl. GST</td></tr>`:""}<tr><td>Price before GST</td><td>${inr(g.base)}</td></tr><tr><td>GST @ ${g.rate}%</td><td>${inr(g.gst)}</td></tr><tr><td><b>You pay</b></td><td><b>${inr(p)}</b></td></tr><tr><td>Access</td><td>${c.months} months from approval</td></tr></tbody></table></div>
      <p class="num">${esc(c.biz)}${c.gstin?` · GSTIN ${esc(c.gstin)}`:""}${c.email?` · ${esc(c.email)}`:""}</p></div>
    <div class="card"><span class="eyebrow">Questions</span>
      ${[["How do I pay?","Choose UPI to scan a QR code with any UPI app (GPay, PhonePe, Paytm, BHIM), or choose card / net banking to pay on our secure payment page. Then enter your payment reference so we can verify it."],["How fast is access?","As soon as your payment is verified, usually within 24 hours. The page unlocks automatically."],["Is my card information safe?","Card and bank details are entered only on the payment provider's secure page, never on Career Count."],["Refunds",c.refund],["Terms",c.terms]].map(([q,a])=>`<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </div>`;
}

/* ---------- popups: advert + checkout ---------- */
function closePaywall(){ document.getElementById("payModal")?.remove(); document.body.classList.remove("modal-open"); }
function openPaywall(reason){
  if (hasAccess()) return; closePaywall();
  const c = ACCESS.cfg, intro = introActive(), wrap = document.createElement("div"); wrap.id = "payModal";
  const head = reason === "ai" ? "The AI tutor is part of full access" : reason === "locked" ? "This is part of full access" : "Start your Privacy, GRC & AI governance career";
  wrap.innerHTML = `<div class="scrim" data-payclose="1"></div><div class="paymodal glass" role="dialog" aria-modal="true" aria-label="Career Count full access">
    <button class="pmx" data-payclose="1" aria-label="Close">✕</button>
    <div class="adtop"><span class="eyebrow">${intro?"Introductory offer":"Career Count"}</span><h2>${esc(head)}</h2>
      <p class="muted">${TOPICS.length} subjects · ${ROLES.filter(r=>pathOf(r.id)).length} role paths · ${ALLPROJ.length} graded projects · a cyber lab · resume, LinkedIn and Gmail job tools · an AI tutor on every page.</p></div>
    ${priceBlock()}
    <ul class="clean adlist"><li>✓ Learn in plain English, built for law and commerce graduates</li><li>✓ Projects reviewed by AI and published to GitHub as your portfolio</li><li>✓ Know where each role is heading as AI spreads</li><li>✓ ${c.months} months of updates: news twice a week, new project ideas monthly</li></ul>
    <div class="row"><button class="btn big" data-paynow="1">Unlock for ${inr(priceNow())}</button><button class="btn ghost" data-payclose="1">Keep exploring free</button></div>
    <span class="num">UPI · cards · net banking. Prices include GST.</span></div>`;
  document.body.appendChild(wrap); document.body.classList.add("modal-open"); wrap.querySelector("[data-paynow]")?.focus();
}
let PAY = {step:"method", method:"", qr:false};
function openCheckout(){
  if (hasAccess()) { toast("You already have full access."); return; }
  closePaywall(); PAY = {step: ACCESS.claim && ACCESS.claim.status === "pending" ? "done" : "method", method:"", qr:false};
  const wrap = document.createElement("div"); wrap.id = "payModal"; wrap.innerHTML = `<div class="scrim" data-payclose="1"></div><div class="paymodal glass" role="dialog" aria-modal="true" aria-label="Checkout" id="payBox"></div>`;
  document.body.appendChild(wrap); document.body.classList.add("modal-open"); refreshCheckout();
}
function upiLink(){ const c = ACCESS.cfg; return `upi://pay?pa=${encodeURIComponent(c.vpa)}&pn=${encodeURIComponent(c.payee || c.biz)}&am=${priceNow().toFixed(2)}&cu=INR&tn=${encodeURIComponent("Career Count access " + (ACCESS.uid||"").slice(-6))}`; }
function refreshCheckout(){
  const box = document.getElementById("payBox"); if (!box) return;
  const c = ACCESS.cfg, p = priceNow(), g = gstParts(p), cl = ACCESS.claim, mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const steps = `<div class="paysteps">${[["method","1 · Pay"],["confirm","2 · Confirm"],["done","3 · Access"]].map(([k,l])=>`<span class="${PAY.step===k?"on":""}">${l}</span>`).join("")}</div>`;
  let body = "";
  if (!cap.db || !ACCESS.uid) body = `<div class="note">Payments need you to be signed in to claude.ai with access to this page. Open Career Count from the link you were given and sign in.</div>`;
  else if (PAY.step === "method") body = `<h3>Choose how to pay ${inr(p)}</h3><span class="num">${inr(g.base)} + ${inr(g.gst)} GST (${g.rate}%)</span>
    <div class="paygrid">
      <button class="paymeth ${PAY.method==="upi"?"on":""}" data-paymeth="upi" ${c.vpa?"":"disabled"}><b>UPI</b><span class="num">${c.vpa?"Scan a QR with GPay, PhonePe, Paytm or BHIM":"Not set up yet"}</span></button>
      <button class="paymeth ${PAY.method==="card"?"on":""}" data-paymeth="card" ${c.link?"":"disabled"}><b>Debit / credit card</b><span class="num">${c.link?"Visa, Mastercard, RuPay on a secure page":"Not set up yet"}</span></button>
      <button class="paymeth ${PAY.method==="nb"?"on":""}" data-paymeth="nb" ${c.link?"":"disabled"}><b>Net banking</b><span class="num">${c.link?"All major Indian banks on a secure page":"Not set up yet"}</span></button>
    </div>
    ${PAY.method === "upi" ? `<div class="upibox"><div id="upiQr" class="upiqr" aria-label="UPI QR code"><span class="num">Loading QR…</span></div><div style="display:grid;gap:6px;min-width:0"><b>Scan to pay ${inr(p)}</b><span class="num">UPI ID: <code>${esc(c.vpa)}</code> · ${esc(c.payee||c.biz)}</span>${mobile?`<a class="btn" href="${esc(upiLink())}">Open my UPI app</a>`:""}<span class="num">Pay exactly ${inr(p)}. After paying, note the 12-digit UTR / UPI reference number from your app.</span><button class="btn" data-paystep="confirm">I've paid →</button></div></div>` : ""}
    ${PAY.method === "card" || PAY.method === "nb" ? `<div class="inset" style="display:grid;gap:8px"><b>Pay on our secure payment page</b><span class="num">You'll enter your ${PAY.method==="card"?"card":"bank"} details on the payment provider's page, never here. Pay ${inr(p)}, then come back and enter the payment ID (it looks like pay_XXXXXXXX) from your receipt.</span><a class="btn" href="${esc(c.link)}" target="_blank" rel="noopener">Open secure payment page ↗</a><button class="btn ghost" data-paystep="confirm">I've paid →</button></div>` : ""}
    ${!c.vpa && !c.link ? `<div class="note">Payments aren't set up yet. Please check back soon${c.email?` or email ${esc(c.email)}`:""}.</div>` : ""}`;
  else if (PAY.step === "confirm") body = `<h3>Confirm your payment</h3><span class="num">We'll verify it and unlock your access, usually within 24 hours.</span>
    <div class="form"><label class="f">Your name<input type="text" id="pcName" value="${esc(S.profile.name||"")}" autocomplete="name"></label><label class="f">Email or phone<input type="text" id="pcContact" value="${esc(S.profile.email||"")}" autocomplete="email"></label>
      <label class="f">Paid by<select id="pcMethod"><option value="upi" ${PAY.method==="upi"?"selected":""}>UPI</option><option value="card" ${PAY.method==="card"?"selected":""}>Card</option><option value="nb" ${PAY.method==="nb"?"selected":""}>Net banking</option></select></label>
      <label class="f">${PAY.method==="upi"?"UTR / UPI reference (12 digits)":"Payment ID (pay_…)"}<input type="text" id="pcRef" autocomplete="off" placeholder="${PAY.method==="upi"?"e.g. 412345678901":"e.g. pay_Abc123XYZ"}"></label></div>
    <label class="learned" style="color:var(--ink)"><input type="checkbox" id="pcAgree"> I agree to the terms and refund policy</label>
    <div class="row"><button class="btn" data-paysubmit="1">Submit for verification</button><button class="link" data-paystep="method">← Back</button><span class="num" id="pcMsg"></span></div>`;
  else body = cl && cl.status === "approved" || hasAccess() ? `<h3>You're in! 🎉</h3><p>Everything in Career Count is unlocked${ACCESS.sub&&ACCESS.sub.until?` until ${esc(ACCESS.sub.until)}`:""}.</p><button class="btn" data-payclose="1" data-go="home">Start learning</button>`
    : `<h3>Thank you! We're checking your payment</h3><p>Reference <code>${esc(cl ? cl.ref : "")}</code> · ${cl ? inr(cl.amount) : ""}. Your access unlocks automatically once verified, usually within 24 hours. You can keep exploring the free preview meanwhile.</p>${c.email?`<p class="num">Questions? ${esc(c.email)}${c.phone?" · "+esc(c.phone):""}</p>`:""}<button class="btn ghost" data-payclose="1">Close</button>`;
  box.innerHTML = `<button class="pmx" data-payclose="1" aria-label="Close">✕</button><span class="eyebrow">Career Count · Full access</span>${steps}${body}`;
  if (PAY.step === "method" && PAY.method === "upi") drawUpiQr();
}
let QR_LIB = null;
function loadQrLib(){ if (QR_LIB) return QR_LIB; QR_LIB = new Promise((res, rej) => { if (window.qrcode) return res(window.qrcode); const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"; s.onload = () => window.qrcode ? res(window.qrcode) : rej(new Error("qr")); s.onerror = () => { QR_LIB = null; rej(new Error("qr")); }; document.head.appendChild(s); }); return QR_LIB; }
async function drawUpiQr(){
  const el = document.getElementById("upiQr"); if (!el) return;
  try { const Q = await loadQrLib(), qr = Q(0, "M"); qr.addData(upiLink()); qr.make(); el.innerHTML = qr.createSvgTag(5, 2); const svg = el.querySelector("svg"); if (svg) { svg.setAttribute("width", "200"); svg.setAttribute("height", "200"); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "UPI QR code to pay " + inr(priceNow())); } }
  catch(e) { el.innerHTML = `<span class="num">QR couldn't load here. Pay to the UPI ID shown, or open your UPI app with the button.</span>`; }
}
async function submitClaim(){
  const v = id => (document.getElementById(id).value || "").trim(), msg = document.getElementById("pcMsg"), method = v("pcMethod"), ref = v("pcRef").replace(/\s+/g,"");
  if (!v("pcName")) { document.getElementById("pcName").focus(); return; }
  if (method === "upi" ? !/^\d{12}$/.test(ref) : !/^(pay_[A-Za-z0-9]{6,}|[A-Za-z0-9_-]{8,40})$/.test(ref)) { msg.textContent = method === "upi" ? "The UTR is the 12-digit number in your UPI app's payment details." : "Enter the payment ID from your receipt (usually starts with pay_)."; return; }
  if (!document.getElementById("pcAgree").checked) { msg.textContent = "Please accept the terms."; return; }
  const rec = {uid: ACCESS.uid, name: v("pcName").slice(0,80), contact: v("pcContact").slice(0,120), method, ref: ref.slice(0,60), amount: priceNow(), intro: introActive(), at: new Date().toISOString(), status: "pending"};
  msg.textContent = "Submitting…";
  try { await cap.db.collection("claims").doc(ACCESS.uid).set(rec); ACCESS.claim = rec; PAY.step = "done"; refreshCheckout(); }
  catch(e) { msg.textContent = "Couldn't submit. Your access level may not allow it: ask the owner for 'can use' access, or email support with your reference."; }
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-paynow],[data-payclose],[data-paymeth],[data-paystep],[data-paysubmit],[data-locked]"); if (!el) return;
  const d = el.dataset;
  if (d.locked) { e.preventDefault(); e.stopPropagation(); openPaywall("locked"); return; }
  if (d.paynow) { openCheckout(); return; }
  if (d.payclose) { closePaywall(); if (!d.go) return; }
  if (d.paymeth) { PAY.method = d.paymeth; refreshCheckout(); return; }
  if (d.paystep) { PAY.step = d.paystep; refreshCheckout(); return; }
  if (d.paysubmit) { submitClaim(); return; }
}, true);
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("payModal")) closePaywall(); });

/* ---------- admin (owner only) ---------- */
async function adminLoad(){
  if (!ACCESS.owner || !cap.db) return;
  try { const s = await cap.db.collection("claims").get(); ACCESS.claims = s.docs.map(d => Object.assign({id:d.id}, d.data())).sort((a,b) => String(b.at).localeCompare(String(a.at))); } catch(e) { ACCESS.claims = []; }
  try { const s = await cap.db.collection("subs").get(); ACCESS.subs = s.docs.map(d => Object.assign({id:d.id}, d.data())); } catch(e) { ACCESS.subs = []; }
  if (current === "admin") rerender();
}
const noId = o => { const x = Object.assign({}, o); delete x.id; return x; };
function addMonths(d, m){ const x = new Date(d + "T12:00:00"); x.setMonth(x.getMonth() + (+m||12)); return dayStr(x); }
function viewAdmin(){
  if (ACCESS.claims === null) adminLoad();
  const c = ACCESS.cfg, C = ACCESS.claims || [], pend = C.filter(x => x.status === "pending"), subs = ACCESS.subs || [], f = (k, l, type="text", ph="") => `<label class="f">${l}<input type="${type}" id="ad-${k}" value="${esc(c[k]??"")}" placeholder="${esc(ph)}"></label>`;
  const revenue = C.filter(x => x.status === "approved").reduce((a,x) => a + (+x.amount||0), 0);
  return `<div><span class="eyebrow">Owner only</span><h2>Admin: subscriptions and payments</h2></div>
  <div class="grid4"><div class="card tile"><span class="lbl">Pending</span><span class="big">${pend.length}</span></div><div class="card tile"><span class="lbl">Active subscribers</span><span class="big">${subs.filter(s=>s.active && (!s.until || s.until>=today())).length}</span></div><div class="card tile"><span class="lbl">Approved revenue</span><span class="big">${inr(revenue)}</span><span class="num">incl. GST ${inr(revenue - revenue/(1+(+c.gst||0)/100))}</span></div><div class="card tile"><span class="lbl">Price now</span><span class="big">${inr(priceNow())}</span><span class="num">${introActive()?"introductory":"standard"}</span></div></div>
  <div class="card"><div class="row between"><h3>Payments to verify</h3><button class="btn sm ghost" data-adrefresh="1">Refresh</button></div>
    <p class="num">Check each reference in your UPI app / bank statement (UTR) or your payment gateway dashboard (payment ID) before approving.</p>
    ${C.length ? `<div class="tbl"><table><thead><tr><th>When</th><th>Name / contact</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${C.map(x=>`<tr><td class="num">${esc(String(x.at||"").slice(0,16).replace("T"," "))}</td><td>${esc(x.name||"")}<div class="num">${esc(x.contact||"")}</div></td><td>${esc(({upi:"UPI",card:"Card",nb:"Net banking"})[x.method]||x.method||"")}</td><td><code>${esc(x.ref||"")}</code></td><td>${inr(x.amount||0)}</td><td><span class="pill ${x.status==="approved"?"ok":x.status==="rejected"?"bad":"warn"}">${esc(x.status||"")}</span></td><td>${x.status==="pending"?`<button class="btn sm" data-adapprove="${esc(x.id)}">Approve</button> <button class="link" data-adreject="${esc(x.id)}">Reject</button>`:""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">No payments yet.</p>`}</div>
  <div class="card"><h3>Pricing and payment settings</h3>
    <div class="form">${f("std","Standard price incl. GST (₹)","number")}${f("intro","Introductory price incl. GST (₹)","number")}${f("introEnds","Introductory offer ends","date")}${f("months","Access length (months)","number")}${f("gst","GST rate (%)","number")}${f("gstin","Your GSTIN (shown on pricing)","text","22AAAAA0000A1Z5")}
      ${f("biz","Business / brand name")}${f("payee","Name shown in UPI apps")}${f("vpa","Your UPI ID","text","yourname@okhdfcbank")}${f("link","Secure payment page link (cards, net banking, UPI)","url","https://rzp.io/l/…")}${f("email","Support email","email")}${f("phone","Support phone")}</div>
    <label class="learned" style="color:var(--ink)"><input type="checkbox" id="ad-introOn" ${c.introOn?"checked":""}> Introductory price is on</label>
    <label class="f">Refund policy<textarea id="ad-refund">${esc(c.refund||"")}</textarea></label><label class="f">Terms<textarea id="ad-terms">${esc(c.terms||"")}</textarea></label>
    <div class="row"><button class="btn" data-adsave="1">Save settings</button><span class="num" id="adMsg"></span></div>
    <details class="faq"><summary>How to set up card and net-banking payments</summary><p>Create a free account with a licensed Indian payment gateway (for example Razorpay, Cashfree or PayU), complete KYC, then create a Payment Page or Payment Link for ${inr(priceNow())} that collects name, email and phone. Paste its link above. Your customers pay there with UPI, cards or net banking; you see each payment ID in the gateway dashboard and approve it here. Card details never pass through Career Count.</p></details></div>
  <div class="card"><h3>Grant or extend access manually</h3><div class="row"><input type="text" id="adUid" placeholder="User id (from a payment row)" style="flex:1;min-width:200px"><button class="btn sm" data-adgrant="1">Grant ${ACCESS.cfg.months} months</button></div>
    ${subs.length?`<div class="tbl" style="margin-top:8px"><table><thead><tr><th>User</th><th>Until</th><th>Ref</th><th></th></tr></thead><tbody>${subs.map(s=>`<tr><td><code>${esc(s.id.slice(0,10))}…</code> ${esc(s.name||"")}</td><td>${esc(s.until||"")}</td><td class="num">${esc(s.ref||"")}</td><td>${s.active?`<button class="link" data-adrevoke="${esc(s.id)}">Revoke</button>`:"revoked"}</td></tr>`).join("")}</tbody></table></div>`:""}</div>
  <div class="card"><h3>Test the customer view</h3><p class="muted" style="font-size:.9rem">See exactly what a visitor who hasn't paid sees: the free dashboard, previews, locks and popups.</p><button class="btn ghost" data-adpreview="1">${ACCESS.previewFree?"Stop previewing":"Preview as a free visitor"}</button>
    <p class="num">To let customers in, share this page from the Share menu with their claude.ai accounts at a level that lets them use it (so they can submit their payment reference). Each person's progress is private to them.</p></div>`;
}
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-adsave],[data-adapprove],[data-adreject],[data-adgrant],[data-adrevoke],[data-adrefresh],[data-adpreview],[data-adexit]"); if (!el || !ACCESS.owner) return;
  const d = el.dataset;
  if (d.adpreview || d.adexit) { ACCESS.previewFree = !ACCESS.previewFree; if (ACCESS.previewFree) { go("home"); setTimeout(() => openPaywall("welcome"), 300); } else { closePaywall(); go("admin"); } renderHeader(); return; }
  if (d.adrefresh) { ACCESS.claims = null; adminLoad(); return; }
  if (d.adsave) { const v = id => (document.getElementById("ad-" + id).value || "").trim(), n = id => Math.max(0, +v(id) || 0);
    const cfg = {std:n("std")||1500, intro:n("intro")||1200, introEnds:v("introEnds"), months:n("months")||12, gst:+v("gst") >= 0 ? +v("gst") : 18, gstin:v("gstin").toUpperCase(), biz:v("biz")||"Career Count", payee:v("payee"), vpa:v("vpa"), link:/^https:\/\//.test(v("link")) ? v("link") : "", email:v("email"), phone:v("phone"), refund:v("refund"), terms:v("terms"), introOn:document.getElementById("ad-introOn").checked};
    if (cfg.vpa && !/^[\w.\-]{2,256}@[a-zA-Z][a-zA-Z0-9.]{1,64}$/.test(cfg.vpa)) { document.getElementById("adMsg").textContent = "That UPI ID doesn't look right (format: name@bank)."; return; }
    try { await cap.db.collection("meta").doc("pay").set(cfg); ACCESS.cfg = Object.assign({}, PAY_DEFAULT, cfg); document.getElementById("adMsg").textContent = "Saved."; rerender(); } catch(err) { document.getElementById("adMsg").textContent = "Couldn't save."; } return; }
  const grant = async (uid, claim) => { const start = today(), rec = {active:true, plan:"full", start, until:addMonths(start, ACCESS.cfg.months), amount:claim ? claim.amount : priceNow(), ref:claim ? claim.ref : "manual", name:claim ? claim.name : "", approvedAt:new Date().toISOString()}; await cap.db.collection("subs").doc(uid).set(rec); };
  try {
    if (d.adapprove) { const cl = (ACCESS.claims||[]).find(x => x.id === d.adapprove); await grant(d.adapprove, cl); await cap.db.collection("claims").doc(d.adapprove).set(Object.assign(noId(cl), {status:"approved", decidedAt:new Date().toISOString()})); toast("Approved. Their access is unlocked."); }
    if (d.adreject) { const cl = (ACCESS.claims||[]).find(x => x.id === d.adreject); const reason = "We couldn't find this payment. Please check the reference or contact support."; await cap.db.collection("claims").doc(d.adreject).set(Object.assign(noId(cl), {status:"rejected", reason, decidedAt:new Date().toISOString()})); toast("Marked as not verified."); }
    if (d.adgrant) { const uid = (document.getElementById("adUid").value||"").trim(); if (!uid) return; await grant(uid, null); toast("Access granted."); }
    if (d.adrevoke) { const s = (ACCESS.subs||[]).find(x => x.id === d.adrevoke); await cap.db.collection("subs").doc(d.adrevoke).set(Object.assign(noId(s), {active:false, revokedAt:new Date().toISOString()})); toast("Access revoked."); }
  } catch(err) { toast("Couldn't update: " + (err.message || "error")); }
  ACCESS.claims = null; adminLoad();
});
