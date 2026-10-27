/* Learning sequence: prerequisite-first scaffolding. Foundations → core privacy law (and applying it) → security concepts → frameworks, risk & audit (with Excel to practise) → sector rules → emerging areas → enterprise tools. */
const PHASES = [
 {id:"p1",name:"Foundations",why:"Vocabulary and mental models everything else builds on.",ids:["grc","privacy","c-basics","c-network","c-linux"]},
 {id:"p2",name:"Core privacy law",why:"The laws employers ask about most, then the day-to-day work that applies them.",ids:["dpdp","gdpr","ccpa","privops"]},
 {id:"p3",name:"Security concepts",why:"What controls protect, so frameworks make sense next.",ids:["c-iam","c-threats","c-crypto","c-controls"]},
 {id:"p4",name:"Frameworks, risk & audit",why:"How companies organise and prove their controls; Excel practice sits here.",ids:["iso","frameworks","risk","t-excel","audit","tprm"]},
 {id:"p5",name:"Sector rules",why:"Health, US finance and Indian finance layers on top of the core laws.",ids:["hipaa","glba","secfinra","indiafin","c-ir","c-cloud"]},
 {id:"p6",name:"Emerging: AI governance",why:"Newest skill, built on privacy and ISO thinking.",ids:["aigov"]},
 {id:"p7",name:"Enterprise tools",why:"Learn the platforms once you know the work they automate.",ids:["t-onetrust","t-servicenow"]}
];
const PRE = {"c-linux":["c-basics"],dpdp:["privacy"],gdpr:["privacy"],ccpa:["privacy"],privops:["dpdp","gdpr"],"c-iam":["c-basics"],"c-crypto":["c-network"],"c-controls":["c-iam","grc"],iso:["grc","c-controls"],frameworks:["iso"],risk:["grc"],"t-excel":["risk"],audit:["c-controls"],tprm:["risk"],hipaa:["privacy"],glba:["privacy"],secfinra:["glba"],indiafin:["dpdp"],"c-ir":["c-threats"],"c-cloud":["c-network"],aigov:["privops","iso"],"t-onetrust":["privops","tprm"],"t-servicenow":["iso","audit"]};

/* Certifications: domains map to docket topics so reading progress = exam readiness. */
const CERTS = [
 {id:"cc",name:"ISC2 Certified in Cybersecurity (CC)",body:"ISC2",level:"Entry",stage:"now",eligible:"No experience needed.",cost:"Low; ISC2 has run free-exam offers. Check the official page.",url:"https://www.isc2.org/certifications/cc",
  why:"The gentlest recognised cyber certificate. Proves you understand security basics, which GRC interviewers test.",
  domains:[["Security principles",["c-basics","c-controls","grc"]],["Business continuity, DR & incident response",["c-ir"]],["Access control",["c-iam"]],["Network security",["c-network","c-threats"]],["Security operations",["c-crypto","c-cloud","c-linux"]]]},
 {id:"secplus",name:"CompTIA Security+ (SY0-701)",body:"CompTIA",level:"Entry–Associate",stage:"next",eligible:"No formal requirement; CompTIA suggests some IT experience.",cost:"Moderate. Check CompTIA for the India price.",url:"https://www.comptia.org/certifications/security",
  why:"The best-known entry security certificate with recruiters. Its biggest domain covers governance and program management.",
  domains:[["General security concepts (12%)",["c-basics","c-controls","c-crypto"]],["Threats, vulnerabilities & mitigations (22%)",["c-threats"]],["Security architecture (18%)",["c-network","c-cloud"]],["Security operations (28%)",["c-iam","c-ir","c-linux"]],["Security program management & oversight (20%)",["grc","risk","tprm","audit","frameworks"]]]},
 {id:"cippe",name:"IAPP CIPP/E (European privacy)",body:"IAPP",level:"Professional",stage:"now",eligible:"No experience needed.",cost:"Higher. Check IAPP for current exam and membership fees.",url:"https://iapp.org/certify/cippe/",
  why:"The global standard privacy credential; GDPR knowledge is asked in most Indian privacy roles.",
  domains:[["Introduction to European data protection",["privacy"]],["European data protection law and regulation (GDPR)",["gdpr"]],["Compliance with European data protection law",["privops","tprm"]]]},
 {id:"cippa",name:"IAPP CIPP/A (Asia, includes India)",body:"IAPP",level:"Professional",stage:"next",eligible:"No experience needed.",cost:"Higher. Check IAPP.",url:"https://iapp.org/certify/cippa/",
  why:"Covers Asian privacy laws including India's; pairs naturally with DPDP-focused roles.",
  domains:[["Privacy concepts",["privacy"]],["India's data protection law",["dpdp","indiafin"]],["Applying privacy in practice",["privops"]]]},
 {id:"cippus",name:"IAPP CIPP/US (US privacy)",body:"IAPP",level:"Professional",stage:"later",eligible:"No experience needed.",cost:"Higher. Check IAPP.",url:"https://iapp.org/certify/cippus/",
  why:"For roles at US banks, wealth firms and tech companies' Indian centres.",
  domains:[["US privacy environment and regulators",["privacy","ccpa"]],["Private-sector data collection and use",["ccpa"]],["Financial privacy (GLBA, FCRA, SEC/FINRA)",["glba","secfinra"]],["Health privacy (HIPAA)",["hipaa"]],["Breach and incident rules",["c-ir"]]]},
 {id:"cipm",name:"IAPP CIPM (privacy program management)",body:"IAPP",level:"Professional",stage:"next",eligible:"No experience needed.",cost:"Higher. Check IAPP.",url:"https://iapp.org/certify/cipm/",
  why:"Shows you can run a privacy program: assessments, vendors, rights requests, metrics. Often paired with a CIPP.",
  domains:[["Privacy program governance",["grc","privacy"]],["Privacy program operational lifecycle",["privops"]],["Assessments and vendor management",["tprm","risk"]],["Incident handling and metrics",["c-ir","audit"]]]},
 {id:"dcpp",name:"DSCI Certified Privacy Professional (DCPP)",body:"DSCI (NASSCOM)",level:"Professional",stage:"next",eligible:"Check DSCI.",cost:"Check DSCI.",url:"https://www.google.com/search?q=DSCI+Certified+Privacy+Professional+DCPP",
  why:"Indian privacy credential from the industry body behind many Indian privacy frameworks; recognised by Indian employers.",
  domains:[["Privacy concepts and global laws",["privacy","gdpr"]],["Indian privacy law (DPDP)",["dpdp","indiafin"]],["Privacy program and operations",["privops","tprm"]]]},
 {id:"isola",name:"ISO/IEC 27001 Lead Auditor",body:"PECB, BSI, TÜV and others",level:"Professional",stage:"next",eligible:"Course + exam; full auditor status may need audit experience.",cost:"Moderate–high (training course included).",url:"https://www.google.com/search?q=ISO+27001+Lead+Auditor+certification+India",
  why:"Highly valued in Indian IT services, Big 4 and certification bodies. Builds on reading requirements and testing evidence.",
  domains:[["ISO 27001 requirements and Annex A",["iso","c-controls"]],["Risk assessment and treatment",["risk"]],["Audit principles and conducting audits",["audit"]],["Related frameworks",["frameworks"]]]},
 {id:"aigp",name:"IAPP AIGP (AI governance)",body:"IAPP",level:"Professional",stage:"later",eligible:"No experience needed.",cost:"Higher. Check IAPP.",url:"https://iapp.org/certify/aigp/",
  why:"A new credential for AI governance roles; differentiates you early.",
  domains:[["Foundations of AI governance",["aigov"]],["AI laws and standards",["aigov","gdpr"]],["Governing AI development and deployment",["aigov","privops","risk"]]]},
 {id:"csa",name:"ServiceNow Certified System Administrator",body:"ServiceNow",level:"Associate",stage:"later",eligible:"ServiceNow training; often employer-sponsored.",cost:"Check ServiceNow; partners often sponsor.",url:"https://learning.servicenow.com/",
  why:"The first ServiceNow certificate, asked for in IRM/GRC analyst and BA roles.",
  domains:[["Platform basics, lists, forms, reports",["t-servicenow"]],["IRM data model and workflows",["t-servicenow","grc","audit"]]]},
 {id:"cisa",name:"ISACA CISA",body:"ISACA",level:"Advanced",stage:"later",eligible:"Exam any time; certification needs 5 years' relevant experience (some substitutions).",cost:"High. Check ISACA.",url:"https://www.isaca.org/credentialing/cisa",
  why:"The gold standard for IT audit. Plan it after 2–3 years in GRC.",
  domains:[["Information system auditing process (18%)",["audit"]],["Governance and management of IT (18%)",["grc","iso"]],["IS acquisition, development and implementation (12%)",["tprm","frameworks"]],["IS operations and business resilience (26%)",["c-ir","c-cloud"]],["Protection of information assets (26%)",["c-iam","c-crypto","c-controls"]]]},
 {id:"crisc",name:"ISACA CRISC",body:"ISACA",level:"Advanced",stage:"later",eligible:"Certification needs 3 years' IT risk experience.",cost:"High. Check ISACA.",url:"https://www.isaca.org/credentialing/crisc",
  why:"For IT risk careers; a long-term goal after your first risk role.",
  domains:[["Governance (26%)",["grc"]],["IT risk assessment (20%)",["risk"]],["Risk response and reporting (32%)",["risk","audit","tprm"]],["Information technology and security (22%)",["c-controls","c-cloud"]]]}
];
/* Which certificates each role values: [cert id, priority] priority 1 = now, 2 = next, 3 = later */
const ROLE_CERTS = {
 privacy:[["cippe",1],["dcpp",2],["cippa",2],["cipm",2],["cc",3]],
 grcan:[["cc",1],["isola",2],["secplus",2],["csa",3],["cisa",3]],
 bfsi:[["cc",1],["cippus",2],["isola",2],["crisc",3]],
 tprm:[["cc",1],["isola",2],["cipm",2],["crisc",3]],
 legal:[["cippe",1],["cippa",2],["dcpp",2],["aigp",3]],
 itaudit:[["isola",1],["secplus",2],["cisa",3]],
 cyberrisk:[["secplus",1],["isola",2],["crisc",3]],
 dpo:[["cippe",1],["cipm",2],["dcpp",2],["cippa",2],["isola",3]],
 aigov:[["aigp",1],["cippe",2],["isola",3]]
};
/* Company types: what they hire for and what they look for */
const COMPANIES = [
 {id:"big4",name:"Big 4 & consulting",eg:"Deloitte, EY, KPMG, PwC, Protiviti, Grant Thornton Bharat",roles:["grcan","privacy","itaudit","tprm"],skills:["iso","audit","risk","dpdp","excel","servicenow"],certs:["isola","cippe","cc","csa"],tools:"ServiceNow IRM, Excel, Archer, OneTrust",note:"Hire many analysts/associates; value ISO 27001 and audit discipline; ServiceNow skills open the tech-risk practices."},
 {id:"bank",name:"Global banks & wealth (India centres)",eg:"Ameriprise, JPMorgan, Goldman Sachs, Morgan Stanley, American Express, Wells Fargo, Barclays, HSBC",roles:["bfsi","privacy","tprm","cyberrisk"],skills:["finreg","secfinra","usconsumer","risk","audit","excel"],certs:["cippus","cc","crisc"],tools:"Archer, ServiceNow, Excel, in-house surveillance tools",note:"US rules dominate: GLBA, Reg S-P, FINRA, NYDFS. Your Provana FCRA work is directly relevant."},
 {id:"itsvc",name:"IT services",eg:"TCS, Infosys, Wipro, HCLTech, Accenture, Capgemini, Tech Mahindra",roles:["grcan","privacy","tprm"],skills:["iso","gdpr","dpdp","audit","controls","excel"],certs:["isola","cc","cippe"],tools:"ServiceNow, Excel, client portals",note:"ISO 27001 and client contracts (GDPR/HIPAA clauses) drive the work; large intake at analyst level."},
 {id:"fintech",name:"Indian banks, fintech & payments",eg:"HDFC Bank, ICICI Bank, Paytm, PhonePe, Razorpay, Zerodha",roles:["bfsi","privacy","cyberrisk"],skills:["dpdp","indiafin","risk","incident","privops"],certs:["dcpp","isola","cc"],tools:"Excel, in-house GRC, OneTrust/consent tools",note:"RBI/SEBI rules plus DPDP; strong demand for DPDP readiness and consent management."},
 {id:"tech",name:"Product & SaaS companies",eg:"Microsoft, Google, Amazon, Salesforce, Zoho, Freshworks",roles:["privacy","grcan","aigov"],skills:["gdpr","ccpa","privops","soc2","aigov","onetrust"],certs:["cippe","cipm","aigp"],tools:"OneTrust, Vanta/Drata, Jira",note:"Privacy-by-design, DPIAs, CCPA/GDPR rights requests, SOC 2 and growing AI governance work."},
 {id:"law",name:"Law firms (privacy/tech desks)",eg:"Cyril Amarchand Mangaldas, AZB, Khaitan & Co, Trilegal, Ikigai Law",roles:["legal","privacy"],skills:["drafting","contracts","dpdp","gdpr","privacy"],certs:["cippe","cippa","dcpp"],tools:"Word, research databases",note:"Your Bar enrolment counts; privacy certificates set you apart from other junior associates."}
];
