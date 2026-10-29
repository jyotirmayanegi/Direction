/* ================= STUDY MATERIALS: where to read each subject, from the original source =================
   Each entry: [type, title, author or publisher, link, how to read it].
   Types: Official text (the law or standard itself), Regulator guidance, Free book, Book, Vendor docs, Reference.
   Links go to the publisher's own site. Where a deep link is not certain, the link is the publisher's main page
   and the title is what to search for. Read the summary or plain-language part first, then the original text. */
const MAT_TYPES = {
  "Official text": "the law or standard itself",
  "Regulator guidance": "the regulator's explanation of the law",
  "Free book": "free to read online or as a PDF",
  "Book": "paid book, check your library",
  "Vendor docs": "the tool company's own documentation",
  "Reference": "a free reference or course"
};
const MAT = {
  grc: [
    ["Reference", "ISO 31000 Risk management guidelines (summary)", "ISO", "https://www.iso.org", "Read the principles section first; it explains why risk drives GRC."],
    ["Book", "IT Governance: An International Guide to Data Security and ISO 27001/ISO 27002", "Alan Calder and Steve Watkins", "https://www.itgovernance.co.uk", "Read the governance chapters; skip the technical controls at first."],
    ["Regulator guidance", "COSO Enterprise Risk Management framework", "COSO", "https://www.coso.org", "Read the executive summary and the five components."],
    ["Free book", "The Three Lines Model (IIA, 2020)", "The Institute of Internal Auditors", "https://www.theiia.org", "Two pages. Explains who owns risk, who oversees it, and who checks it."]
  ],
  privacy: [
    ["Official text", "GDPR, Articles 5 and 6 (principles and lawful bases)", "EU", "https://eur-lex.europa.eu/eli/reg/2016/679/oj", "Read Article 5 first. It is short and lists the six principles."],
    ["Regulator guidance", "UK ICO: Guide to UK GDPR", "Information Commissioner's Office", "https://ico.org.uk", "Plain English. Read the 'principles' and 'lawful basis' pages."],
    ["Book", "Information Privacy Law", "Daniel Solove and Paul Schwartz", "https://www.wolterskluwer.com", "Read chapter 1 for the big picture of privacy law."],
    ["Free book", "Privacy and Data Protection Principles (IAPP overview)", "IAPP", "https://iapp.org/resources", "Search the title; the resource center has free summaries."]
  ],
  "c-basics": [
    ["Free book", "How the Internet Works (Tanenbaum overview chapter)", "Andrew Tanenbaum and David Wetherall, Computer Networks", "https://www.pearson.com", "Read the introduction; skip the protocol details."],
    ["Reference", "Cybersecurity for Beginners (CISA resources)", "CISA", "https://www.cisa.gov/resources-tools", "Free plain-language guides on basic security habits."],
    ["Reference", "Khan Academy: How the internet works", "Khan Academy", "https://www.khanacademy.org", "Free short lessons on computers and the internet."]
  ],
  "c-network": [
    ["Book", "Computer Networking: A Top-Down Approach", "James Kurose and Keith Ross", "https://www.pearson.com", "Read chapter 1 and the 'layers' section of chapter 1 only."],
    ["Reference", "Cloudflare Learning Center: What is a network", "Cloudflare", "https://www.cloudflare.com/learning", "Short explainers for IP, DNS, firewalls and VPNs."],
    ["Reference", "NIST SP 800-41 Firewalls and firewall policy", "NIST", "https://csrc.nist.gov", "Read the overview; you need only the idea of a firewall rule."]
  ],
  "c-linux": [
    ["Free book", "The Linux Command Line (free PDF)", "William Shotts", "https://linuxcommand.org", "Read chapters 1 to 9 in order. Practise each command in the Lab first."],
    ["Free book", "OverTheWire Bandit and Linux tutorials", "OverTheWire", "https://overthewire.org", "Hands-on Linux practice, free."],
    ["Reference", "GNU Coreutils manual", "GNU Project", "https://www.gnu.org/software/coreutils/manual", "Use it to look up any command you do not recognise."]
  ],
  dpdp: [
    ["Official text", "Digital Personal Data Protection Act, 2023", "Government of India (MeitY)", "https://www.meity.gov.in", "Search the title for the PDF. Read section 2 (definitions) and section 4 (lawful processing) first."],
    ["Official text", "Digital Personal Data Protection Rules", "MeitY", "https://www.meity.gov.in", "Check MeitY for the final notified version, then read the rules next to the Act."],
    ["Regulator guidance", "Data Protection Board of India", "Government of India", "https://www.meity.gov.in", "Watch for guidance and notices from the Board."],
    ["Reference", "Pre-DPDP comparison: IT Act section 43A and the SPDI Rules", "MeitY", "https://www.meity.gov.in", "Short comparison; helpful to see what changed."]
  ],
  gdpr: [
    ["Official text", "Regulation (EU) 2016/679 (GDPR)", "European Union", "https://eur-lex.europa.eu/eli/reg/2016/679/oj", "Read Article 4 (definitions), Article 5 (principles) and Article 6 (lawful bases). Then Articles 15 to 22 (rights)."],
    ["Regulator guidance", "EDPB guidelines", "European Data Protection Board", "https://www.edpb.europa.eu", "Read the guidelines on consent and on the right of access."],
    ["Book", "The EU General Data Protection Regulation: A Practical Guide", "Paul Voigt and Axel von dem Bussche", "https://link.springer.com", "Practical commentary. Read the chapter on principles."],
    ["Book", "The EU General Data Protection Regulation (GDPR): A Commentary", "Kuner, Bygrave and Docksey", "https://global.oup.com", "Reference book. Use it to look up one article at a time."]
  ],
  ccpa: [
    ["Official text", "California Consumer Privacy Act (as amended by CPRA)", "State of California", "https://oag.ca.gov/privacy/ccpa", "Read the consumer rights section and the business obligations."],
    ["Regulator guidance", "California Privacy Protection Agency", "CPPA", "https://cppa.ca.gov", "Official guidance and regulations."],
    ["Reference", "IAPP US state privacy law tracker", "IAPP", "https://iapp.org", "Search 'US state privacy legislation tracker' to compare states."]
  ],
  privops: [
    ["Reference", "IAPP Privacy Operations resources", "IAPP", "https://iapp.org/resources", "Search 'privacy operations' for free templates and guides."],
    ["Free book", "Privacy Impact Assessment guidance", "ICO (UK)", "https://ico.org.uk", "Read the DPIA guidance; it is the clearest free example."],
    ["Vendor docs", "OneTrust Privacy documentation", "OneTrust", "https://www.onetrust.com", "Read the product overview to see how DSARs and records are managed."]
  ],
  "c-iam": [
    ["Reference", "NIST SP 800-63 Digital Identity Guidelines", "NIST", "https://pages.nist.gov/800-63-3", "Read the overview and the authentication levels."],
    ["Free book", "Identity and access management overview", "Microsoft Learn", "https://learn.microsoft.com/entra", "Free; read the 'what is Entra ID' page."],
    ["Reference", "OWASP Authentication Cheat Sheet", "OWASP", "https://cheatsheetseries.owasp.org", "Plain-language good and bad practice for logins and passwords."]
  ],
  "c-threats": [
    ["Reference", "MITRE ATT&CK framework (overview)", "MITRE", "https://attack.mitre.org", "Start with the 'Tactics' page. Learn the names, not every technique."],
    ["Reference", "OWASP Top 10", "OWASP", "https://owasp.org/www-project-top-10", "Read the list and one plain example for each item."],
    ["Free book", "Security Engineering (free PDF)", "Ross Anderson", "https://www.cl.cam.ac.uk/~rja14/book.html", "Read chapter 1 for the basic attacker and defender model."]
  ],
  "c-crypto": [
    ["Reference", "NIST SP 800-175B Guideline for cryptographic algorithms", "NIST", "https://csrc.nist.gov", "Read the summary to see which algorithms are approved."],
    ["Free book", "Cryptography Engineering (overview chapter)", "Ferguson, Schneier and Kohno", "https://www.wiley.com", "Read the first chapter for the ideas behind encryption."],
    ["Reference", "Cloudflare: What is encryption", "Cloudflare", "https://www.cloudflare.com/learning", "Short plain-language explanations of encryption at rest and in transit."]
  ],
  "c-controls": [
    ["Reference", "CIS Critical Security Controls", "Center for Internet Security", "https://www.cisecurity.org/controls", "Read the list of 18 controls; you only need the names and what each covers."],
    ["Official text", "NIST SP 800-53 Rev 5 Security and Privacy Controls", "NIST", "https://csrc.nist.gov", "Use it as a reference. Read the 'control families' page."],
    ["Free book", "The Three Lines Model (IIA, 2020)", "The Institute of Internal Auditors", "https://www.theiia.org", "Two pages on control ownership."]
  ],
  iso: [
    ["Official text", "ISO/IEC 27001:2022 Information security management systems", "ISO/IEC", "https://www.iso.org/standard/27001", "Paid text. Read Clause 4 to 10 (the management system) and Annex A (controls)."],
    ["Official text", "ISO/IEC 27002:2022 Controls guidance", "ISO/IEC", "https://www.iso.org", "Paid. Read the control descriptions next to Annex A."],
    ["Official text", "ISO/IEC 27701:2019 Privacy information management", "ISO/IEC", "https://www.iso.org", "Paid. Read the extension to 27001 for privacy."],
    ["Book", "IT Governance: ISO 27001 guide", "Alan Calder", "https://www.itgovernance.co.uk", "Plain explanation of the standard for beginners."]
  ],
  frameworks: [
    ["Reference", "NIST Cybersecurity Framework 2.0", "NIST", "https://www.nist.gov/cyberframework", "Read the core functions (Govern, Identify, Protect, Detect, Respond, Recover)."],
    ["Reference", "AICPA Trust Services Criteria (SOC 2)", "AICPA", "https://www.aicpa-cima.com", "Read the five categories and what an auditor checks."],
    ["Reference", "PCI DSS v4.0 overview", "PCI Security Standards Council", "https://www.pcisecuritystandards.org", "Read the 12 requirements list only."]
  ],
  risk: [
    ["Official text", "ISO 31000:2018 Risk management", "ISO", "https://www.iso.org", "Paid. Read the principles and the process steps."],
    ["Reference", "NIST SP 800-30 Guide for conducting risk assessments", "NIST", "https://csrc.nist.gov", "Read the overview and the risk matrix example."],
    ["Book", "How to Measure Anything in Cybersecurity Risk", "Douglas Hubbard and Richard Seiersen", "https://www.wiley.com", "Read chapter 1 on why risk should be measured."]
  ],
  "t-excel": [
    ["Vendor docs", "Microsoft Excel training (free)", "Microsoft", "https://support.microsoft.com/excel", "Start with formulas, then lookups, then pivot tables."],
    ["Vendor docs", "Power BI learning path (free)", "Microsoft Learn", "https://learn.microsoft.com/power-bi", "Start with the 'get started' module."],
    ["Reference", "Excel for GRC: risk register and control matrix templates", "Your own build", "https://support.microsoft.com", "Build one from scratch using the topic's projects."]
  ],
  audit: [
    ["Reference", "IIA Global Internal Audit Standards", "The Institute of Internal Auditors", "https://www.theiia.org", "Read the 'purpose' and 'principles' sections."],
    ["Reference", "ISACA COBIT 2019 framework (overview)", "ISACA", "https://www.isaca.org", "Read the governance and management objectives summary."],
    ["Free book", "Sampling guidance (AICPA audit sampling)", "AICPA", "https://www.aicpa-cima.com", "Read the sampling basics for control testing."]
  ],
  tprm: [
    ["Reference", "NIST SP 800-161 Cyber supply chain risk management", "NIST", "https://csrc.nist.gov", "Read the overview of vendor risk."],
    ["Reference", "Shared Assessments SIG questionnaire (overview)", "Shared Assessments", "https://sharedassessments.org", "See how vendors are assessed."],
    ["Official text", "GDPR Article 28 (processor contracts)", "EU", "https://eur-lex.europa.eu/eli/reg/2016/679/oj", "Read Article 28. It sets what a vendor contract must say."]
  ],
  hipaa: [
    ["Official text", "HIPAA Privacy Rule (45 CFR Part 164)", "US HHS", "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html", "Read the HHS summary first, then the rule."],
    ["Regulator guidance", "HHS Security Rule guidance", "US HHS", "https://www.hhs.gov/hipaa/for-professionals/security/index.html", "Read the plain-language summary."],
    ["Reference", "HHS: Guidance on de-identification of PHI", "US HHS", "https://www.hhs.gov", "Read this to understand the two de-identification methods."]
  ],
  glba: [
    ["Official text", "Gramm-Leach-Bliley Act, Title V (privacy)", "US Congress", "https://www.ftc.gov", "Search 'Gramm-Leach-Bliley Act' on the FTC site."],
    ["Regulator guidance", "FTC: Safeguards Rule", "Federal Trade Commission", "https://www.ftc.gov", "Read the plain-language business guidance."],
    ["Official text", "Fair Credit Reporting Act (FCRA)", "US Congress", "https://www.ftc.gov", "Read the sections on consumer report use. You already know this from Provana."]
  ],
  secfinra: [
    ["Regulator guidance", "SEC: Regulation S-P (privacy of consumer information)", "US SEC", "https://www.sec.gov", "Search 'Regulation S-P' for the rule and the summary."],
    ["Regulator guidance", "FINRA Rules and guidance (cybersecurity)", "FINRA", "https://www.finra.org", "Read the cybersecurity and recordkeeping pages."],
    ["Regulator guidance", "NYDFS Cybersecurity Regulation 23 NYCRR 500", "New York DFS", "https://www.dfs.ny.gov", "Read the summary and the requirements list."]
  ],
  indiafin: [
    ["Regulator guidance", "RBI Master Direction on IT governance and outsourcing", "Reserve Bank of India", "https://www.rbi.org.in", "Search the title on the RBI site; read the summary."],
    ["Regulator guidance", "SEBI Cybersecurity and Cyber Resilience Framework (CSCRF)", "SEBI", "https://www.sebi.gov.in", "Read the overview of the framework."],
    ["Official text", "CERT-In Directions, 28 April 2022", "CERT-In", "https://www.cert-in.org.in", "Read the directions on reporting incidents within six hours."]
  ],
  "c-ir": [
    ["Reference", "NIST SP 800-61 Computer Security Incident Handling Guide", "NIST", "https://csrc.nist.gov", "Read the four-phase lifecycle."],
    ["Regulator guidance", "CERT-In incident reporting guidance", "CERT-In", "https://www.cert-in.org.in", "Read what must be reported and when."],
    ["Reference", "SANS Incident Handler's Handbook (free)", "SANS Institute", "https://www.sans.org", "Free reading on incident response steps."]
  ],
  "c-cloud": [
    ["Reference", "AWS Shared Responsibility Model", "Amazon Web Services", "https://aws.amazon.com/compliance/shared-responsibility-model", "Read the page; it is the core idea of cloud compliance."],
    ["Reference", "Microsoft Azure: cloud compliance overview", "Microsoft Learn", "https://learn.microsoft.com/azure/compliance", "Free; read the overview of compliance offerings."],
    ["Reference", "Cloud logging basics (AWS CloudTrail)", "Amazon Web Services", "https://docs.aws.amazon.com/cloudtrail", "Read the 'what is CloudTrail' page."]
  ],
  aigov: [
    ["Official text", "Regulation (EU) 2024/1689 (EU AI Act)", "European Union", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "Read the definitions (Article 3) and the risk categories (Articles 5 and 6)."],
    ["Reference", "NIST AI Risk Management Framework 1.0", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Read the four functions: Govern, Map, Measure, Manage."],
    ["Reference", "OECD AI Principles", "OECD", "https://oecd.ai", "Short; read the five principles."]
  ],
  "t-onetrust": [
    ["Vendor docs", "OneTrust documentation", "OneTrust", "https://www.onetrust.com", "Read the product overview: data mapping, DSARs and assessments."],
    ["Reference", "OneTrust privacy resources", "OneTrust", "https://www.onetrust.com/resources", "Free guides and templates."],
    ["Reference", "IAPP OneTrust-style privacy program guidance", "IAPP", "https://iapp.org", "Search 'privacy program management' for free background."]
  ],
  "t-servicenow": [
    ["Vendor docs", "ServiceNow Integrated Risk Management documentation", "ServiceNow", "https://www.servicenow.com", "Read the 'IRM' overview and the data model description."],
    ["Reference", "ServiceNow Developer site (free personal instance)", "ServiceNow", "https://developer.servicenow.com", "Free instance for practice."],
    ["Reference", "ISO 27001 controls mapping (overview)", "ISO", "https://www.iso.org", "Use this to map controls inside the tool."]
  ],
  "t-azure": [
    ["Vendor docs", "Microsoft Entra ID documentation", "Microsoft Learn", "https://learn.microsoft.com/entra", "Free. Read 'what is Entra ID' and 'Conditional Access'."],
    ["Vendor docs", "Microsoft Defender for Cloud documentation", "Microsoft Learn", "https://learn.microsoft.com/azure/defender-for-cloud", "Read the regulatory compliance dashboard page."],
    ["Reference", "Microsoft Learn: Azure fundamentals (free)", "Microsoft Learn", "https://learn.microsoft.com/training", "Free learning paths. Start with fundamentals."]
  ],
  "t-aws": [
    ["Reference", "AWS Shared Responsibility Model", "Amazon Web Services", "https://aws.amazon.com/compliance/shared-responsibility-model", "The core reading for cloud compliance."],
    ["Vendor docs", "AWS IAM User Guide", "Amazon Web Services", "https://docs.aws.amazon.com/IAM", "Read 'IAM concepts' and 'least privilege'."],
    ["Vendor docs", "AWS Artifact (compliance reports)", "Amazon Web Services", "https://aws.amazon.com/artifact", "Read the page; it is where SOC reports are downloaded."]
  ],
  "t-purview": [
    ["Vendor docs", "Microsoft Purview documentation", "Microsoft Learn", "https://learn.microsoft.com/purview", "Read 'what is Purview' and 'sensitivity labels'."],
    ["Vendor docs", "Data loss prevention in Microsoft Purview", "Microsoft Learn", "https://learn.microsoft.com/purview/dlp-learn-about-dlp", "Read the overview."],
    ["Reference", "Microsoft Learn: Purview compliance fundamentals", "Microsoft Learn", "https://learn.microsoft.com/training", "Free modules."]
  ],
  "t-grcauto": [
    ["Vendor docs", "Vanta help center", "Vanta", "https://www.vanta.com", "Read the product overview and 'how automated tests work'."],
    ["Vendor docs", "Drata knowledge base", "Drata", "https://drata.com", "Read the overview of control monitoring."],
    ["Reference", "AuditBoard and Archer product overviews", "AuditBoard, Archer", "https://www.auditboard.com", "Compare the platforms by what they automate."]
  ],
  "t-vuln": [
    ["Reference", "NIST SP 800-40 Patch management", "NIST", "https://csrc.nist.gov", "Read the overview of vulnerability handling."],
    ["Vendor docs", "Microsoft Defender Vulnerability Management documentation", "Microsoft Learn", "https://learn.microsoft.com/defender-vulnerability-management", "Read the overview and the exposure score page."],
    ["Vendor docs", "Tenable and Qualys documentation", "Tenable, Qualys", "https://www.tenable.com", "Read 'what is a vulnerability scan'."]
  ],
  "t-sentinel": [
    ["Vendor docs", "Microsoft Sentinel documentation", "Microsoft Learn", "https://learn.microsoft.com/azure/sentinel", "Read 'what is Sentinel' and 'analytics rules'."],
    ["Vendor docs", "Kusto Query Language (KQL) tutorial", "Microsoft Learn", "https://learn.microsoft.com/kusto", "Start with the 'query basics' page."],
    ["Vendor docs", "Splunk documentation", "Splunk", "https://docs.splunk.com", "Read 'what is Splunk' for the other SIEM."]
  ],
  "bd-assoc": [
    ["Book", "The Challenger Sale", "Matthew Dixon and Brent Adamson", "https://www.portfolio.com", "Read the first part on how sales conversations work."],
    ["Book", "SPIN Selling", "Neil Rackham", "https://www.mhprofessional.com", "Read chapters 1 to 3 on questions that uncover need."],
    ["Reference", "HubSpot Sales Academy (free)", "HubSpot", "https://academy.hubspot.com", "Free courses on prospecting and pipeline."]
  ],
  "bd-consult": [
    ["Book", "The Challenger Sale", "Matthew Dixon and Brent Adamson", "https://www.portfolio.com", "Read the sections on tailored solutions."],
    ["Book", "Solution Selling", "Michael Bosworth", "https://www.mhprofessional.com", "Read the approach to matching solutions to problems."],
    ["Reference", "HubSpot Sales Academy (free)", "HubSpot", "https://academy.hubspot.com", "Free courses on consultative selling."]
  ],
  consulting: [
    ["Book", "Flawless Consulting", "Peter Block", "https://www.wiley.com", "Read the first chapters on how consultants work with clients."],
    ["Book", "The McKinsey Way", "Ethan Rasiel", "https://www.mcgraw-hill.com", "Read the problem-solving structure."],
    ["Reference", "Harvard Business Review: consulting articles (free summaries)", "HBR", "https://hbr.org", "Search 'consulting' for free articles."]
  ],
  aml: [
    ["Reference", "FATF Recommendations (the global AML standard)", "FATF", "https://www.fatf-gafi.org", "Read the recommendations on customer due diligence (1 to 10)."],
    ["Regulator guidance", "RBI KYC Master Direction", "Reserve Bank of India", "https://www.rbi.org.in", "Search 'KYC Master Direction' for the rules."],
    ["Regulator guidance", "FinCEN: AML program guidance", "US FinCEN", "https://www.fincen.gov", "Read the overview of AML programs."]
  ],
  clm: [
    ["Book", "A Manual of Style for Contract Drafting", "Ken Adams", "https://www.americanbar.org", "Read the chapters on clear drafting."],
    ["Reference", "Association of Corporate Counsel: contract resources", "ACC", "https://www.acc.com", "Free articles on legal operations and contracts."],
    ["Reference", "Indian Contract Act, 1872 (summary)", "Government of India", "https://www.indiacode.nic.in", "Search the Act; read the sections on offer and acceptance."]
  ],
  ediscovery: [
    ["Reference", "EDRM (Electronic Discovery Reference Model)", "EDRM", "https://edrm.net", "Read the model; it is the standard map of eDiscovery steps."],
    ["Reference", "The Sedona Conference publications (free summaries)", "The Sedona Conference", "https://thesedonaconference.org", "Read the principles on proportionality and privilege."],
    ["Vendor docs", "Microsoft Purview eDiscovery documentation", "Microsoft Learn", "https://learn.microsoft.com/purview/ediscovery", "Read 'what is eDiscovery'."]
  ],
  tns: [
    ["Official text", "India IT Rules, 2021 (intermediary guidelines)", "MeitY", "https://www.meity.gov.in", "Read the sections on takedown and grievance officers."],
    ["Reference", "Santa Clara Principles on content moderation", "Santa Clara Principles", "https://santaclaraprinciples.org", "Short; read the principles."],
    ["Reference", "EU Digital Services Act (summary)", "European Union", "https://digital-strategy.ec.europa.eu", "Read the summary of platform duties."]
  ],
  "ai-found": [
    ["Free book", "Artificial Intelligence: A Modern Approach (free online chapters)", "Stuart Russell and Peter Norvig", "https://aima.cs.berkeley.edu", "Read chapter 1 only, for what AI means."],
    ["Book", "Human Compatible", "Stuart Russell", "https://www.penguinrandomhouse.com", "Plain-language book on AI risk; read the first chapters."],
    ["Reference", "Google Machine Learning Crash Course (free)", "Google", "https://developers.google.com/machine-learning/crash-course", "Free; read the 'framing' and 'data' units."]
  ],
  "ai-euact": [
    ["Official text", "Regulation (EU) 2024/1689 (EU AI Act)", "European Union", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "Read Article 3 (definitions), Article 5 (banned uses), Article 6 and Annex III (high risk)."],
    ["Regulator guidance", "European Commission AI Act overview", "European Commission", "https://digital-strategy.ec.europa.eu", "Read the timeline and the summary pages."],
    ["Reference", "The EU AI Act: a plain-English summary", "Future of Life Institute", "https://artificialintelligenceact.eu", "Search 'EU AI Act explorer' on this site for a clear summary."]
  ],
  "ai-std": [
    ["Official text", "ISO/IEC 42001:2023 AI management systems", "ISO/IEC", "https://www.iso.org", "Paid. Read Clauses 4 to 10."],
    ["Reference", "NIST AI RMF 1.0 (NIST AI 100-1)", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Free; read the Govern, Map, Measure and Manage functions."],
    ["Reference", "India AI governance guidelines (MeitY)", "MeitY", "https://www.meity.gov.in", "Search 'AI governance guidelines' for the India framework."]
  ],
  "ai-risk": [
    ["Reference", "NIST AI RMF Playbook", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Free; read the suggested actions for each function."],
    ["Official text", "EU AI Act Article 27 (fundamental rights impact assessment)", "European Union", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "Read Article 27 for what an impact assessment must cover."],
    ["Free book", "Weapons of Math Destruction", "Cathy O'Neil", "https://www.penguinrandomhouse.com", "Read chapters 1 and 2 for why models need assessment."]
  ],
  "ai-sec": [
    ["Reference", "OWASP Top 10 for LLM Applications", "OWASP", "https://owasp.org/www-project-top-10-for-large-language-model-applications", "Read the list; learn prompt injection and data leakage first."],
    ["Reference", "NIST AI 600-1 Generative AI Profile", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Read the risk list for generative AI."],
    ["Free book", "The Alignment Problem", "Brian Christian", "https://www.wwnorton.com", "Read the introduction; a readable account of AI behaviour and risk."]
  ],
  "t-automate": [
    ["Vendor docs", "Power Automate documentation", "Microsoft Learn", "https://learn.microsoft.com/power-automate", "Start with 'create a flow' and 'approvals'."],
    ["Free book", "Automate the Boring Stuff with Python (free online)", "Al Sweigart", "https://automatetheboringstuff.com", "Read chapters 1 to 4, then the spreadsheet and file chapters."],
    ["Reference", "Zapier learning center", "Zapier", "https://zapier.com/learn", "Free short guides on no-code automation."]
  ]
};
/* Materials card on each topic page, with the reading order and the type of source. */
function materialsCard(t){
  const list = MAT[t.id] || [];
  if (!list.length) return "";
  return `<section class="card matcard"><span class="eyebrow">Read the original sources</span><h3>Where to read ${esc(t.title)}</h3>
    <p class="num">Read the official text or the regulator's explanation first. Use the book or vendor page to understand it in plain words. Links open the publisher's site.</p>
    <div class="matlist">${list.map(([type, title, by, url, how]) => `<div class="matrow">
      <span class="pill ${type === "Official text" ? "acc" : type === "Regulator guidance" ? "ok" : ""}">${esc(type)}</span>
      <div style="min-width:0"><b>${esc(title)}</b><div class="num">${esc(by)}</div><p class="muted" style="font-size:.9rem;margin:2px 0 0">${esc(how)}</p></div>
      ${url ? `<a class="btn sm ghost" href="${esc(url)}" target="_blank" rel="noopener">Open ↗</a>` : ""}</div>`).join("")}</div></section>`;
}
