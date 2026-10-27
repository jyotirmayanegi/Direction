/* ================= ROLE PAGES: one page per role ================= */
/* what = the job in plain words; day = a typical day; industry = who hires in India and what is changing;
   ladder = career steps; tools = software you'll meet; jargon = terms you'll hear in week one. */
const ROLE_INFO = {
 privacy:{what:"You help a company use personal data lawfully. You keep the record of what data is collected and why, check new projects for privacy risk, answer people's requests to see or delete their data, review vendor contracts, and help when data leaks.",
  day:["Triage new data-subject requests and chase system owners for data","Review a product team's new feature for privacy risk (a DPIA)","Update the data map after a new vendor is onboarded","Answer questions from HR or marketing about consent","Prepare a monthly privacy metrics report"],
  industry:"Hiring in India comes from IT services and GCCs serving EU/US clients, banks and fintechs, e-commerce, health-tech, and consulting firms. The DPDP Act's main duties from May 2027 (consent managers from November 2026) are creating new in-house roles; AI use-case reviews are becoming part of the job.",
  ladder:["Privacy Analyst / Associate (0–2 yrs)","Senior Privacy Analyst (2–4 yrs)","Privacy Manager / Privacy Counsel (4–8 yrs)","DPO / Head of Privacy (8+ yrs)"],
  tools:["OneTrust or Securiti","Microsoft Purview","Excel / Sheets","Jira or ServiceNow for tickets","Consent management platforms"],
  jargon:{"Data Fiduciary":"DPDP term for the organisation deciding why and how personal data is processed (GDPR: controller).","Data Processor":"An organisation processing data on the fiduciary's instructions.","DPIA":"Data protection impact assessment: a documented risk review of new processing.","RoPA":"Record of processing activities: the official data map.","DSAR":"Data subject access request: a person asking for their data.","Lawful basis":"The legal ground for processing (consent, contract, legitimate uses…).","Consent Manager":"A DPDP-registered platform that lets people give and withdraw consent.","DPA":"Data processing agreement: the contract governing a processor.","SCCs":"Standard contractual clauses for transferring EU data abroad.","Privacy by design":"Building privacy into products from the start."}},
 grcan:{what:"You make sure the company's security and compliance rules exist, are followed, and can be proven. You maintain policies, map controls to standards like ISO 27001 and SOC 2, collect evidence, track risks and issues, and support audits.",
  day:["Chase control owners for quarterly evidence","Update the risk register after a new vulnerability report","Answer a client's security questionnaire","Prepare for an ISO 27001 surveillance audit","Track overdue remediation tickets in the GRC tool"],
  industry:"Indian IT services, SaaS start-ups selling abroad, GCCs of global banks, Big 4 advisory and fintechs hire GRC analysts. Client demands for ISO 27001/SOC 2, RBI and SEBI cyber directions and CERT-In rules drive demand; compliance automation is changing the work from collecting to checking.",
  ladder:["GRC Analyst (0–2 yrs)","Senior GRC Analyst / GRC Specialist (2–5 yrs)","GRC Manager / Lead (5–8 yrs)","Head of GRC / CISO office leadership (8+ yrs)"],
  tools:["ServiceNow IRM, Archer or MetricStream","Vanta / Drata (start-ups)","Excel and Power BI","Jira","Microsoft 365 / SharePoint"],
  jargon:{"Control":"A safeguard that reduces a risk (e.g. MFA).","Evidence":"Proof a control operated (screenshot, log, signed record).","SoA":"Statement of Applicability: which ISO 27001 controls apply and why.","ISMS":"Information security management system (ISO 27001).","Risk register":"The list of risks with owners, scores and treatments.","Residual risk":"Risk left after controls.","Attestation":"An owner's formal confirmation that a control works.","Exception":"An approved, time-limited deviation from a policy.","Finding":"An issue identified by audit or testing.","Continuous control monitoring":"Automated, ongoing checks that controls work."}},
 bfsi:{what:"You help a bank, NBFC or wealth firm follow financial regulations: you test whether teams follow the rules, review communications and processes, track regulatory changes, and report issues to compliance leaders.",
  day:["Test a sample of account openings against KYC rules","Review new RBI/SEBI circulars and summarise impact","Check trade communications for policy breaches","Update a compliance monitoring plan","Prepare evidence for an internal audit"],
  industry:"Global bank GCCs in Bengaluru, Pune, Gurugram and Hyderabad, Indian banks and NBFCs, wealth managers and US-focused KPOs hire compliance analysts. Your Provana FCRA work is directly relevant. RBI's 2026 technology directions and AI in finance are expanding the field.",
  ladder:["Compliance Analyst (0–2 yrs)","Senior Analyst / Compliance Officer (2–5 yrs)","Compliance Manager (5–8 yrs)","Head of Compliance / CCO (10+ yrs)"],
  tools:["Excel","Actimize / surveillance tools","GRC platforms","Regulatory change trackers","Case management systems"],
  jargon:{"Compliance testing":"Checking a sample of activity against rules.","Regulatory change management":"Tracking and implementing new rules.","Surveillance":"Monitoring communications or trades for misconduct.","FCRA":"US Fair Credit Reporting Act.","GLBA":"US Gramm-Leach-Bliley Act (financial privacy).","Reg S-P":"SEC privacy and incident-response rule.","Master Direction":"RBI's consolidated rules on a topic.","Circular":"A regulator's formal instruction.","Issue management":"Tracking problems to closure.","Three lines of defence":"Business, compliance/risk, internal audit."}},
 tprm:{what:"You check whether suppliers and vendors are safe to work with: you classify vendors by risk, send and review security questionnaires, read SOC 2 and ISO reports, review contract terms, and track fixes.",
  day:["Tier three new vendors by the data they'll handle","Review a cloud vendor's SOC 2 Type II report","Chase a vendor for an overdue remediation","Check a DPA's breach-notice clause","Report vendor risk metrics to the risk committee"],
  industry:"Banks, insurers, GCCs and large IT firms run TPRM teams; consultancies offer TPRM as a managed service from India. AI suppliers and concentration risk (few cloud providers) are growing focus areas.",
  ladder:["TPRM Analyst (0–2 yrs)","Senior TPRM Analyst (2–5 yrs)","TPRM Lead / Manager (5–8 yrs)","Head of Third-Party Risk (8+ yrs)"],
  tools:["OneTrust TPRM, Archer, ProcessUnity or Prevalent","SecurityScorecard / BitSight ratings","Excel","Contract repositories"],
  jargon:{"Tiering":"Ranking vendors by how much risk they bring.","SIG / CAIQ":"Standard security questionnaires.","SOC 2 Type II":"An auditor's report on a vendor's controls over a period.","Bridge letter":"A vendor's statement covering the gap after a SOC report period.","Fourth party":"Your vendor's vendor (sub-processor).","Concentration risk":"Too much reliance on one provider.","Residual risk":"Risk left after the vendor's controls.","Remediation":"Fixing an identified issue."}},
 legal:{what:"You give legal support on data protection and technology: drafting and reviewing contracts and policies, researching laws, writing advice notes, and helping clients or the business comply with privacy and tech regulation.",
  day:["Redline a data processing agreement","Research how DPDP applies to a client's loyalty programme","Draft a privacy policy update","Prepare a note on the EU AI Act timeline for a client","Attend a call with the client's product team"],
  industry:"Law firms with TMT/privacy desks, in-house legal teams at tech companies, fintechs and GCCs hire junior privacy and tech lawyers. Your Bar enrolment counts. AI regulation and DPDP make this a growth area.",
  ladder:["Associate (0–3 yrs)","Senior Associate (3–6 yrs)","Principal Associate / Counsel (6–10 yrs)","Partner / General Counsel"],
  tools:["SCC Online / Manupatra","Microsoft Word with comparison tools","CLM tools (SpotDraft, Ironclad)","Legal AI assistants (with verification)"],
  jargon:{"Redline":"A marked-up contract showing changes.","Indemnity":"A promise to cover another party's losses.","Limitation of liability":"A cap on damages.","SCCs":"EU standard contractual clauses for data transfers.","Advisory note":"A written legal opinion for a client.","Data Fiduciary":"DPDP's controller.","Significant Data Fiduciary":"A fiduciary with extra DPDP duties.","Safe harbour":"Legal protection if conditions are met (e.g. intermediaries under the IT Act)."}},
 itaudit:{what:"You test whether IT controls work: access management, change management, backups, security settings. You pick samples, examine evidence, document workpapers and write findings, often for financial-statement or SOC 2 audits.",
  day:["Test a sample of 25 user access removals","Walk through a change-management process with IT","Document workpapers for ITGC testing","Discuss a finding with the control owner","Review a SOC 1 report for a client's service provider"],
  industry:"Big 4 and mid-size audit firms (in India often serving US clients), internal audit teams at banks and large companies, and GCCs hire IT audit associates. Audit analytics and auditing AI are the growth areas.",
  ladder:["IT Audit Associate (0–2 yrs)","Senior Associate (2–4 yrs)","Assistant Manager / Manager (4–8 yrs)","Director / Partner"],
  tools:["Excel and audit analytics (IDEA, ACL)","Audit management tools (AuditBoard, TeamMate)","Power BI","Cloud consoles for evidence"],
  jargon:{"ITGC":"IT general controls: access, change, operations.","Walkthrough":"Following one transaction through a process.","Sample":"A selection of items tested.","Workpaper":"The audit's documented evidence.","Deficiency":"A control that doesn't work as designed.","SOC 1 / SOC 2":"Auditor reports on a service organisation's controls.","Design vs operating effectiveness":"Is the control well designed, and did it actually run?","PBC list":"'Provided by client' evidence request list."}},
 cyberrisk:{what:"You identify and assess cyber risks to the business: you write risk scenarios, assess controls, track vulnerabilities and incidents, and explain cyber risk to managers in business terms.",
  day:["Write a ransomware risk scenario for the risk register","Review this month's critical vulnerabilities and overdue patches","Assess a new cloud project's security risks","Present cyber risk metrics to the risk committee","Follow up on an incident's corrective actions"],
  industry:"Banks, insurers, large IT firms, GCCs and consultancies hire cyber risk analysts. It's the most technical role here; demand is driven by RBI/SEBI cyber rules, ransomware and AI-enabled attacks.",
  ladder:["Cyber Risk Analyst (0–2 yrs)","Senior Analyst (2–5 yrs)","Cyber Risk Manager (5–8 yrs)","Head of Cyber Risk / Deputy CISO"],
  tools:["Vulnerability scanners (Qualys, Tenable)","SIEM (Sentinel, Splunk)","GRC platforms","Risk quantification tools"],
  jargon:{"Threat":"Something that could cause harm (e.g. ransomware gang).","Vulnerability":"A weakness that can be exploited.","CVSS":"A 0–10 severity score for vulnerabilities.","KEV":"CISA's list of vulnerabilities known to be exploited.","Risk scenario":"A described way a threat could harm the business.","Inherent vs residual risk":"Before vs after controls.","MTTR":"Mean time to remediate.","Attack surface":"All the ways an attacker could get in."}},
 aigov:{what:"You help a company use AI responsibly and lawfully. You keep an inventory of AI systems, classify each by risk (for example under the EU AI Act), run impact assessments, check testing for bias and security, write AI policies, and review AI vendors.",
  day:["Screen a new AI use case submitted by marketing","Complete an impact assessment for an HR screening tool","Review a vendor's AI model documentation","Update the AI policy after new guidance","Report AI risk metrics to the AI governance council"],
  industry:"Large Indian IT services firms, GCCs of global banks and tech companies, Big 4 advisory, and AI start-ups selling to the EU are building AI governance teams. India's November 2025 AI Governance Guidelines and the EU AI Act's 2027 high-risk deadline drive demand. Many hires come from privacy and GRC backgrounds.",
  ladder:["AI Governance / Responsible AI Analyst (0–2 yrs)","AI Governance Specialist (2–5 yrs)","AI Governance Lead / Manager (5–8 yrs)","Head of Responsible AI / Chief AI Ethics Officer"],
  tools:["AI governance modules (OneTrust, ServiceNow, Credo AI)","Microsoft Purview for AI","Fairness toolkits (Fairlearn)","Excel and Jira"],
  jargon:{"Provider / deployer":"EU AI Act roles: who builds vs who uses an AI system.","High-risk AI":"AI in sensitive uses (hiring, credit) with strict duties.","AI inventory":"The register of all AI systems.","Impact assessment":"A documented review of how an AI system affects people.","FRIA":"Fundamental rights impact assessment (EU AI Act Art. 27).","Model card":"A document describing a model's purpose, testing and limits.","Red-teaming":"Deliberately trying to make an AI misbehave.","Hallucination":"A confident but false AI output.","AIMS":"AI management system (ISO/IEC 42001).","Human oversight":"People able to understand, override or stop an AI."}},
 dpo:{what:"The Data Protection Officer leads a company's privacy programme: setting policy, advising leadership, overseeing assessments and breaches, training staff and being the contact for regulators and individuals. It's a senior goal, reached after several years in privacy roles.",
  day:["Advise the board on a new data-sharing partnership","Review a breach and decide on notifications","Approve high-risk DPIAs","Meet the CISO on security priorities","Plan DPDP readiness milestones"],
  industry:"Significant Data Fiduciaries under DPDP must appoint an India-based DPO; GDPR requires DPOs for many EU-facing firms. Banks, telecoms, large platforms, health and e-commerce companies hire DPOs. AI oversight is joining the role.",
  ladder:["Privacy Analyst","Privacy Manager","Deputy DPO / Head of Privacy","DPO / Chief Privacy Officer"],
  tools:["Privacy management platforms","GRC tools","Board reporting dashboards"],
  jargon:{"Significant Data Fiduciary":"A DPDP fiduciary designated for extra duties, including appointing a DPO.","Data Protection Board":"India's regulator under DPDP.","Supervisory authority":"An EU data protection regulator.","Accountability":"Being able to demonstrate compliance.","Privacy programme":"The organised set of privacy policies, processes and people.","Breach notification":"Telling regulators and people about a data breach."}},
 bda:{what:"You find and qualify new clients for a cyber, GRC or privacy services firm: researching target companies, starting conversations by email, LinkedIn and phone, booking meetings for consultants, and keeping the CRM up to date.",
  day:["Research 10 target accounts with a fresh regulatory trigger","Send personalised outreach and follow-ups","Run two discovery calls","Update deals and next steps in the CRM","Prepare a weekly pipeline report"],
  industry:"Indian cybersecurity and GRC service firms, CERT-In empanelled auditors, SaaS security vendors and Big 4 business development teams hire BDAs and SDRs, often freshers. DPDP and RBI/CERT-In rules give strong selling triggers.",
  ladder:["BDA / SDR (0–2 yrs)","Business Development Executive / Account Executive (2–4 yrs)","BD Manager / Key Account Manager (4–8 yrs)","Head of Sales / Business Head"],
  tools:["CRM (Zoho, HubSpot, Salesforce)","LinkedIn Sales Navigator","Email sequencing tools","Excel"],
  jargon:{"ICP":"Ideal customer profile.","SDR":"Sales development representative (prospecting role).","Pipeline":"All open deals by stage.","Qualified lead":"A prospect that fits and has a real need.","BANT":"Budget, Authority, Need, Timeline.","Discovery call":"First conversation to understand the client's need.","Conversion rate":"Share of leads moving to the next stage.","Quota":"Sales target."}},
 bdc:{what:"You win and shape larger deals: understanding client problems, scoping services with delivery teams, writing proposals and RFP responses, pricing, and negotiating contracts for GRC, privacy and cyber solutions.",
  day:["Scope a DPDP readiness project with a delivery lead","Write a proposal and pricing for an ISO 27001 project","Answer an RFP's compliance matrix","Negotiate MSA terms with a client's legal team","Review account growth plans"],
  industry:"Consulting firms, cybersecurity companies, GRC software vendors and IT services firms hire presales and BD consultants. Your legal training helps with scoping, contracts and explaining regulation. AI governance services are a new product line.",
  ladder:["BD / Presales Consultant (2–4 yrs)","Senior Consultant / Solutions Lead (4–7 yrs)","Practice Sales Lead (7–10 yrs)","Director / Partner – Sales"],
  tools:["CRM","Proposal tools and templates","Excel pricing models","PowerPoint"],
  jargon:{"RFP":"Request for proposal.","SOW":"Statement of work: scope, deliverables, timeline.","MSA":"Master services agreement: the overarching contract.","Presales":"Technical/solution support before a deal closes.","Win rate":"Share of proposals won.","Upsell":"Selling more to an existing client.","Fixed fee vs T&M":"Set price vs time-and-materials billing."}},
 consult:{what:"You help client companies meet GRC and privacy requirements: running gap assessments, interviewing stakeholders, writing findings and roadmaps, drafting policies, and supporting implementations and audits.",
  day:["Interview a client's IT head for a DPDP gap assessment","Review the client's policies against ISO 27001","Draft findings and a remediation roadmap","Prepare a steering-committee deck","Update the project tracker"],
  industry:"Big 4 (Deloitte, PwC, EY, KPMG), Indian consultancies and boutique cyber firms hire analysts and associate consultants. DPDP readiness, ISO 27001/42001 and AI governance are the busiest service lines.",
  ladder:["Analyst / Associate Consultant (0–2 yrs)","Consultant (2–4 yrs)","Senior Consultant / Manager (4–8 yrs)","Director / Partner"],
  tools:["Excel","PowerPoint","GRC/privacy platforms","Project tracking (Jira, MS Planner)"],
  jargon:{"Gap assessment":"Comparing current state with requirements.","Current state / target state":"Where the client is vs where it needs to be.","Roadmap":"The prioritised plan to close gaps.","Steering committee":"Senior client group overseeing the project.","Deliverable":"The output promised in the SOW.","Stakeholder":"Anyone affected by or influencing the work.","Engagement":"A consulting project."}},
 platcons:{what:"You implement GRC and privacy software such as OneTrust, ServiceNow IRM or Microsoft Purview: gathering requirements, configuring workflows and assessments, testing, training users and supporting go-live.",
  day:["Run a requirements workshop for a DSAR workflow","Configure an assessment template","Write user acceptance test (UAT) scripts","Train the client's privacy team","Fix issues found in testing"],
  industry:"Implementation partners of OneTrust, ServiceNow and Microsoft, Big 4 technology consulting and GCCs hire platform consultants. Certifications in the platforms matter. AI governance modules are new demand.",
  ladder:["Associate Consultant / Analyst (0–2 yrs)","Consultant (2–4 yrs)","Senior Consultant / Architect (4–8 yrs)","Practice Lead"],
  tools:["OneTrust","ServiceNow IRM","Microsoft Purview","Power Automate","Excel configuration workbooks"],
  jargon:{"Configuration":"Setting up the platform without code.","Workflow":"Automated steps a record moves through.","UAT":"User acceptance testing by the client.","PDI":"ServiceNow personal developer instance (free practice).","Go-live":"Launch into real use.","Hypercare":"Intensive support right after go-live.","Integration":"Connecting the platform to other systems."}},
 aml:{what:"You help prevent money laundering and financial crime: verifying customers (KYC), screening against sanctions and PEP lists, reviewing transaction alerts, writing investigation narratives and escalating suspicious activity.",
  day:["Complete periodic KYC reviews for high-risk customers","Clear name-screening alerts","Investigate a transaction-monitoring alert","Write an investigation narrative","Escalate a case for a suspicious transaction report"],
  industry:"Bank GCCs, Indian banks, fintechs, payment companies and KPOs hire large KYC/AML teams, many for freshers with legal or commerce backgrounds. AI is reducing false positives; investigation skills and model governance remain human.",
  ladder:["KYC / AML Analyst (0–2 yrs)","Senior Analyst / Investigator (2–4 yrs)","Team Lead / AML Manager (4–8 yrs)","MLRO / Head of Financial Crime"],
  tools:["Screening tools (World-Check, Dow Jones)","Transaction monitoring (Actimize)","Case management","Excel"],
  jargon:{"KYC":"Know your customer: verifying identity and risk.","CDD / EDD":"Customer due diligence / enhanced due diligence.","PEP":"Politically exposed person.","Sanctions screening":"Checking names against sanctions lists.","STR":"Suspicious transaction report (to FIU-IND in India).","FIU-IND":"India's Financial Intelligence Unit.","PMLA":"Prevention of Money-laundering Act, 2002.","False positive":"An alert that turns out to be harmless."}},
 clm:{what:"You manage contracts through their life: reviewing and redlining against playbooks, maintaining templates, tracking obligations and renewals, and keeping the contract repository organised.",
  day:["Review an NDA and a vendor MSA against the playbook","Escalate non-standard clauses to counsel","Update a template clause","Extract renewal dates into the CLM tool","Report on contract cycle times"],
  industry:"Legal process outsourcing firms, in-house legal ops teams, CLM software companies (Icertis, SpotDraft) and GCCs hire contract analysts. Law degrees are preferred. AI contract review is changing routine work.",
  ladder:["Contract Analyst (0–2 yrs)","Senior Contract Analyst (2–4 yrs)","Contract Manager / Legal Ops Lead (4–8 yrs)","Head of Legal Operations"],
  tools:["CLM tools (Icertis, DocuSign CLM, Ironclad, SpotDraft)","Word compare","Excel"],
  jargon:{"Playbook":"Approved positions and fallbacks for each clause.","Redline":"Marked-up changes.","Obligation":"Something a party must do under the contract.","Renewal / auto-renewal":"Contract extension terms.","Clause library":"Approved standard clauses.","Cycle time":"How long a contract takes to finalise."}},
 edisc:{what:"You help find, review and produce documents for litigation and investigations: applying legal holds, processing data, running searches, reviewing for relevance and privilege, redacting, and quality-checking.",
  day:["Review documents for responsiveness and privilege","Run search-term reports","Redact personal data before production","QC another reviewer's batch","Prepare a production log"],
  industry:"Legal process outsourcing firms in India, Big 4 forensic teams and law firms serving US/UK litigation hire review associates and eDiscovery analysts. Generative AI review is cutting first-level review; validation and defensibility skills matter more.",
  ladder:["Document Review Associate (0–2 yrs)","eDiscovery Analyst (2–4 yrs)","eDiscovery Manager / Project Manager (4–8 yrs)","Director, Litigation Support"],
  tools:["Relativity","Everlaw","Nuix","Microsoft Purview eDiscovery"],
  jargon:{"EDRM":"Electronic discovery reference model (the stages).","Legal hold":"An instruction to preserve relevant data.","Privilege":"Protected lawyer–client communications.","Responsive":"Relevant to the request.","TAR":"Technology-assisted review (AI ranking documents).","Production":"Delivering documents to the other side.","Custodian":"A person whose data is collected."}},
 tns:{what:"You help platforms keep users safe and comply with rules: interpreting content policies, reviewing escalated content, handling government and user requests, and tracking laws like India's IT Rules and the EU Digital Services Act.",
  day:["Decide escalated content cases against policy","Draft a policy clarification for moderators","Handle a government takedown request","Review AI-generated content labelling rules","Prepare a transparency report section"],
  industry:"Social platforms, app companies, gaming and dating apps, and T&S outsourcing vendors hire policy and T&S analysts in India. Deepfakes, AI-generated content labelling and child safety are major themes.",
  ladder:["T&S / Policy Analyst (0–2 yrs)","Senior Policy Specialist (2–5 yrs)","Policy Manager (5–8 yrs)","Head of Trust & Safety / Public Policy"],
  tools:["Moderation tooling","Case management","Excel/SQL basics","Transparency reporting tools"],
  jargon:{"Content policy":"The rules on what's allowed.","Escalation":"Sending a hard case to experts.","Takedown":"Removing content after a request.","Intermediary":"A platform hosting others' content (IT Act).","Grievance Officer":"The person handling user complaints under the IT Rules.","DSA":"EU Digital Services Act.","Synthetic content":"AI-generated or altered media."}}
};
const PERSON_ROLES = () => ROLES.filter(r => pathOf(r.id));

/* ---------- per-role activity: built from the per-topic activity log ---------- */
function activityTopic(){
  if (TOPIC[current]) return current;
  if (/^proj-/.test(current) && PROJ[current.slice(5)]) return PROJ[current.slice(5)].topic;
  if (/^lab-/.test(current) && MISSION[current.slice(4)]) { const z = ZONES.find(x => x.id === MISSION[current.slice(4)].zone); return z ? z.topic : ""; }
  return "";
}
function roleDayCount(rid, d){ const L = (S.progress.tlog || {})[d]; if (!L) return 0; const ids = new Set(roleTopicIds(rid)); return Object.entries(L).reduce((a,[k,v]) => a + (ids.has(k) ? v : 0), 0); }
function heatCal(countFor, weeks=18, label="Activity"){
  const start = new Date(); start.setDate(start.getDate() - (weeks*7 - 1));
  let cal = `<div class="heatcal wide" style="--wk:${weeks}" aria-label="${esc(label)} over the last ${weeks} weeks">`;
  for (let w=0; w<weeks; w++){ cal += `<div class="wk">`; for (let d=0; d<7; d++){ const dt=new Date(start); dt.setDate(start.getDate()+w*7+d); const k = dayStr(dt), n = countFor(k); cal += `<div class="d ${n>=6?"a3":n>=3?"a2":n>0?"a1":""}" title="${k}: ${n}"></div>`; } cal += `</div>`; }
  return cal + `</div>`;
}
function roleStreak(rid){ let s=0; const d=new Date(); if (!roleDayCount(rid, dayStr(d))) d.setDate(d.getDate()-1); while (roleDayCount(rid, dayStr(d))) { s++; d.setDate(d.getDate()-1); } return s; }

/* ---------- the "Studying for" cube (home and role pages) ---------- */
function studyCube(rid, opts={}){
  const R = ROLE[rid], P = pathOf(rid); if (!R || !P) return "";
  const ci = currentStageIdx(rid), stg = P.stages[ci], nt = nextTopicFor(rid), rd = roleReady(R), core = P.core.map(id=>TOPIC[id]).filter(Boolean), cs = groupStats(core);
  const chosen = !!S.profile.focus;
  return `<div class="card cube studycube"><div class="row between"><span class="eyebrow">${opts.title || "Studying for"}</span>${opts.home?`<select id="cubeRole" aria-label="Role you're studying for" class="cubesel">${PERSON_ROLES().map(r=>`<option value="${r.id}" ${r.id===rid?"selected":""}>${esc(roleShort(r.id))}</option>`).join("")}</select>`:""}</div>
    <div class="cubehead">${ring(rd,"acc")}<div style="min-width:0"><h3>${esc(roleShort(rid))}</h3><span class="num">${rd}% ready · ${readyWord(rd)}</span></div></div>
    ${!chosen && opts.home ? `<div class="note" style="margin:0">Choose the role you're preparing for: everything (subjects, projects, Lab) then follows it.</div>` : ""}
    <div class="cubestats"><div><b>${cs.p}%</b><span class="num">core subjects learned</span></div><div><b>${ci+1}/${P.stages.length}</b><span class="num">roadmap stage</span></div><div><b>${roleStreak(rid)}</b><span class="num">day streak</span></div></div>
    <div class="stagebar mini">${P.stages.map((x,i)=>`<div class="sg ${stagePct(x)>=70?"done":i===ci?"cur":""}" title="${esc(x[0])}: ${stagePct(x)}%"><span>${i+1}</span>${bar(stagePct(x), i===ci?"acc":"")}</div>`).join("")}</div>
    <span class="num">Now: ${esc(stg[0])}</span>
    <div class="row">${nt?`<button class="btn sm" data-go="${nt.id}">Next: ${esc(nt.title.replace(/ \(.*\)/,"").slice(0,34))}</button>`:""}${opts.home?`<button class="btn sm ghost" data-go="role-${rid}">Open role page</button>`:`<button class="btn sm ghost" data-go="path">Roadmap</button>`}</div></div>`;
}
function readyWord(p){ return p>=70?"apply now":p>=40?"apply and keep learning":"building up"; }

/* ---------- Must know: only what to read and which tools to use ---------- */
function mustKnow(rid, compact=false){
  const P = pathOf(rid); if (!P) return "";
  const subjects = P.core.map(id => TOPIC[id]).filter(t => t && t.track !== "tool");
  const toolTopics = [...P.core, ...P.support].map(id => TOPIC[id]).filter(t => t && t.track === "tool");
  const named = (ROLE_INFO[rid] && ROLE_INFO[rid].tools) || [];
  return `<div class="mustknow"><div class="mk-col"><span class="eyebrow">Subjects to read, in order</span>
      <ol class="mk-list">${subjects.map(t => { const must = t.subs.map((s,i)=>({s,i})).filter(x => x.s.l === 1); const st = topicStats(t);
        return `<li class="${st.p>=70?"done":""}"><div class="row between"><button class="link strong" data-go="${t.id}">${esc(t.title)}</button><span class="num">${st.p}%</span></div>
          ${compact?"":`<div class="mk-subs">${must.map(x=>`<button class="mk-sub ${S.progress.done[key(t.id,x.i)]?"done":""}" data-go="${t.id}" data-anchor="s-${x.i}">${S.progress.done[key(t.id,x.i)]?"✓ ":""}${esc(x.s.t)}</button>`).join("")}</div>`}</li>`; }).join("")}</ol></div>
    <div class="mk-col"><span class="eyebrow">Tools to use</span>
      ${toolTopics.length?`<div class="mk-tools">${toolTopics.map(t=>`<button class="mk-tool" data-go="${t.id}"><b>${esc(t.title.replace(/ \(.*\)/,""))}</b><span class="num">${topicStats(t).p}% learned</span></button>`).join("")}</div>`:""}
      ${named.length?`<p class="num" style="margin:8px 0 4px">Software you'll meet on the job</p><div class="row">${named.map(n=>`<span class="pill">${esc(n)}</span>`).join("")}</div>`:""}
      <p class="num" style="margin-top:10px">Supporting subjects (learn enough to discuss): ${P.support.map(id=>TOPIC[id]).filter(t=>t&&t.track!=="tool").map(t=>`<button class="link" data-go="${t.id}">${esc(t.title.replace(/ \(.*\)/,""))}</button>`).join(", ")}</p></div></div>`;
}

/* ---------- the role page ---------- */
function viewRole(rid){
  const R = ROLE[rid], P = pathOf(rid), I = ROLE_INFO[rid] || {}, f = focusRole();
  if (!R || !P) return `<div class="card"><p>Role not found.</p><button class="btn" data-go="roles">All roles</button></div>`;
  const rd = roleReady(R), req = ROLE_REQ[rid] || [], rtext = (S.resume.raw || "").toLowerCase();
  const certs = (ROLE_CERTS[rid]||[]).slice().sort((a,b)=>a[1]-b[1]).map(([id,pr]) => [CERT[id], pr]).filter(x => x[0]);
  const projs = ALLPROJ.filter(p => projRoles(p).includes(rid) || P.core.includes(p.topic)).filter(p => p.lvl === 1 || projUnlocked(p)).slice(0, 8);
  const ops = (typeof OPS !== "undefined" ? OPS.filter(o => [...P.core, ...P.support].includes(o.topic)) : []);
  const st = roleStreak(rid), wk = (() => { let n=0; const d=new Date(); for (let i=0;i<7;i++){ n+=roleDayCount(rid, dayStr(d)); d.setDate(d.getDate()-1);} return n; })();
  const parts = [["r-dash","Dashboard"],["r-what","The job"],["r-must","Must know"],["r-jargon","Jargon"],["r-ai","AI & 10 years"],["r-req","Employers want"],["r-road","Roadmap"],["r-proof","Prove it"],["r-ask","Ask"]];
  return `<div class="thead"><button class="link" data-go="roles">← All roles</button><span class="eyebrow">${esc(R.fit)}</span><h2>${esc(R.name)}</h2>
    <div class="row">${rid===f?`<span class="pill ok">You're studying for this role</span>`:`<button class="btn sm" data-focus="${rid}">Study for this role</button>`}<a class="btn sm ghost" href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(R.q)}&location=India" target="_blank" rel="noopener">LinkedIn jobs</a><a class="btn sm ghost" href="https://www.naukri.com/${R.q.toLowerCase().replace(/\s+/g,"-")}-jobs" target="_blank" rel="noopener">Naukri jobs</a></div>
    <nav class="parts" aria-label="Sections">${parts.map(([a,l],i)=>`<a href="#role-${rid}" data-anchor="${a}">${i+1}. ${l}</a>`).join("")}</nav></div>
  <div class="duo" id="r-dash">
    <div class="card cube actcard"><div class="row between"><span class="eyebrow">${esc(roleShort(rid))} activity</span><span class="num">🔥 ${st}-day streak · ${wk} this week</span></div>${heatCal(k => roleDayCount(rid, k), 18, roleShort(rid)+" activity")}<div class="row between"><span class="num">Days you studied this role's subjects, projects or Lab.</span><span class="heatkey" aria-hidden="true"><i></i><i class="a1"></i><i class="a2"></i><i class="a3"></i></span></div></div>
    ${studyCube(rid, {title: rid===f ? "Studying for" : "Your progress"})}
  </div>
  <div class="grid4 rtiles">
    <div class="card tile"><span class="lbl">Readiness</span><span class="big">${rd}%</span>${readyPill(rd)}</div>
    <div class="card tile"><span class="lbl">Core subjects</span><span class="big">${P.core.filter(id=>TOPIC[id]&&topicStats(TOPIC[id]).p>=70).length}<span class="num"> / ${P.core.length}</span></span><span class="num">covered (70%+)</span></div>
    <div class="card tile"><span class="lbl">Projects passed</span><span class="big">${ALLPROJ.filter(p=>P.core.includes(p.topic)&&projGet(p.id).passed).length}</span><span class="num">in this role's subjects</span></div>
    <div class="card tile"><span class="lbl">AI exposure</span><span class="big">${AI_ROLE[rid]?aiBand(AI_ROLE[rid].x)[0]:"–"}</span><span class="num">${AI_ROLE[rid]?esc(AI_ROLE[rid].shift):""}</span></div>
  </div>
  <section class="card" id="r-what"><span class="eyebrow">The job in plain words</span><p class="lede" style="margin:4px 0 8px">${esc(I.what||"")}</p>
    <div class="grid2"><div><b>A typical day</b><ul class="clean">${(I.day||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><b>Who hires in India, and what's changing</b><p style="font-size:.92rem">${esc(I.industry||"")}</p><b>Why it fits you</b><p style="font-size:.92rem">${esc(P.why)}</p></div></div>
    <b>Career ladder</b><div class="ladder2">${(I.ladder||[]).map((x,i)=>`<div class="lstep2 ${i===0?"cur":""}"><span class="num">${i+1}</span><b>${esc(x)}</b></div>`).join('<span class="arr" aria-hidden="true">→</span>')}</div>
    <div class="row"><span class="num">Job titles to search:</span>${P.titles.map(t=>`<span class="pill">${esc(t)}</span>`).join("")}</div></section>
  <section class="card" id="r-must"><div class="row between"><div><span class="eyebrow">Must know</span><h3>Only what to read and which tools to use</h3></div><span class="num">You can skip: ${esc(P.skip)}</span></div>${mustKnow(rid)}</section>
  <section class="card" id="r-jargon"><span class="eyebrow">Jargon decoder</span><h3>Words you'll hear in week one</h3>
    <div class="jargon">${Object.entries(I.jargon||{}).map(([k,v])=>`<div class="jg"><b>${esc(k)}</b><span>${esc(v)}</span><button class="link" data-cmdrun="role|${rid}|/what ${esc(k)}">Explain more</button></div>`).join("")}</div></section>
  <div id="r-ai">${roleImpactCard(rid)}</div>
  <section class="card" id="r-req"><span class="eyebrow">What employers ask for</span><h3>Requirements in job posts${rtext?" (checked against your resume)":""}</h3>
    ${req.map(([label, kws, how, must]) => { const found = rtext ? kws.some(k => hasTerm(rtext, k.toLowerCase())) : null; const link = how.startsWith("cert:") ? (CERT[how.slice(5)] ? `<button class="link" data-go="cert-${how.slice(5)}">${esc(shortCert(CERT[how.slice(5)]))}</button>` : "") : (TOPIC[how] ? `<button class="link" data-go="${how}">${esc(TOPIC[how].title.replace(/ \(.*\)/,""))}</button>` : "");
      return `<div class="reqrow"><span class="pill ${found===true?"ok":found===false?(must?"bad":"warn"):""}">${found===true?"On resume":found===false?"Missing":"–"}</span><span style="flex:1;min-width:160px">${esc(label)}${must?' <span class="pill hot">must-have</span>':""}</span><span class="num">Learn: ${link}</span></div>`; }).join("")}
    ${rtext?"":`<p class="num">Upload your resume in the <button class="link" data-go="resume">Resume builder</button> to see which of these you already show.</p>`}</section>
  <section class="card" id="r-road"><span class="eyebrow">Roadmap</span><h3>${P.stages.length} stages</h3>
    <div class="rmlist">${P.stages.map((s,i)=>`<div class="rmstage ${stagePct(s)>=70?"done":i===currentStageIdx(rid)?"cur":""}"><div class="row between"><b>${i+1}. ${esc(s[0])}</b><span class="num">${esc(s[1])} · ${stagePct(s)}%</span></div>${bar(stagePct(s), i===currentStageIdx(rid)?"acc":"")}<p class="num" style="margin:4px 0">${esc(s[3])}</p><div class="row">${s[2].filter(id=>TOPIC[id]).map(id=>`<button class="pill ${topicStats(TOPIC[id]).p>=70?"ok":""}" data-go="${id}">${esc(TOPIC[id].title.replace(/ \(.*\)/,""))}</button>`).join("")}</div></div>`).join("")}</div>
    ${certs.length?`<b>Certifications</b><div class="row">${certs.map(([c,pr])=>`<button class="pill ${pr===1?"acc":""}" data-go="cert-${c.id}">${pr===1?"Do now: ":pr===2?"Next: ":"Later: "}${esc(shortCert(c))} · ${certReady(c)}%</button>`).join("")}</div>`:""}</section>
  <section class="card" id="r-proof"><span class="eyebrow">Prove it</span><h3>Projects and Lab work for this role</h3>
    <div class="grid2"><div><b>Projects</b>${projs.map(p=>`<div class="row between"><button class="link" data-go="proj-${p.id}">${esc(p.title)}</button><span class="row">${lvBadge(p.lvl)}${projGet(p.id).passed?'<span class="pill ok">Passed</span>':""}</span></div>`).join("")||'<p class="muted">No projects mapped yet.</p>'}</div>
      <div><b>Lab tool projects</b>${ops.length?ops.map(o=>`<div class="row between"><button class="link" data-labop="${o.id}" data-go="lab">${esc(o.title)}</button><span class="pill ${opGet(o.id).done?"ok":""}">${esc(o.kind)}</span></div>`).join(""):'<p class="muted">This role needs no hands-on Lab tools.</p>'}
        <p class="num" style="margin-top:8px"><button class="link" data-go="ideas">Portfolio project ideas for this role →</button></p></div></div></section>
  <section class="card" id="r-ask"><span class="eyebrow">Ask about this role</span><h3>Command bar</h3>${cmdBar("role", rid)}</section>`;
}
document.addEventListener("change", e => { if (e.target.id === "cubeRole") { setFocus(e.target.value); rerender(); } });
