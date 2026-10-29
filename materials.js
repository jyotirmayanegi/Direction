/* ================= FREE STUDY MATERIALS: where to read each subject from the original source =================
   Every entry is free to read online or to download: laws, regulator guidance, government and NIST publications,
   free books, and free vendor or training documentation. No paid books or paid standards are listed.
   Each entry: [type, title, author or publisher, link, how to read it].
   Read the summary or plain-language part first, then the original text. Links go to the publisher's own site. */
const MAT = {
  grc: [
    ["Whole-subject free book", "Managing Risk and Information Security: Protect to Enable (free, open access)", "OAPEN open access library", "https://library.oapen.org/handle/20.500.12657/112455", "Search OAPEN for this title if the link opens a different book. Read it alongside the NIST CSF."],
    ["Reference", "NIST Cybersecurity Framework 2.0 (free PDF)", "NIST", "https://www.nist.gov/cyberframework", "Read the Govern function first. It is the plainest picture of GRC."],
    ["Regulator guidance", "COSO Enterprise Risk Management (free executive summary)", "COSO", "https://www.coso.org", "Read the summary and the five components."],
    ["Free book", "The Three Lines Model (IIA, 2020, free PDF)", "The Institute of Internal Auditors", "https://www.theiia.org", "Two pages. Who owns risk, who oversees it, who checks it."],
    ["Reference", "CIS Critical Security Controls (free)", "Center for Internet Security", "https://www.cisecurity.org/controls", "Read the list of controls; you only need the names and what each covers."]
  ],
  privacy: [
    ["Whole-subject free book", "The GDPR made simple(r) for SMEs (free, open access)", "OAPEN open access library", "https://library.oapen.org/handle/20.500.12657/46614", "Read the principles chapters first, then check each one against the GDPR text."],
    ["Official text", "GDPR, Articles 4, 5 and 6 (free)", "European Union", "https://eur-lex.europa.eu/eli/reg/2016/679/oj", "Read Article 5 first. It is short and lists the six principles."],
    ["Regulator guidance", "UK ICO: Guide to UK GDPR (free)", "Information Commissioner's Office", "https://ico.org.uk", "Plain English. Read the principles and lawful-basis pages."],
    ["Regulator guidance", "EDPB guidelines (free)", "European Data Protection Board", "https://www.edpb.europa.eu", "Read the guidelines on consent and on the right of access."],
    ["Reference", "IAPP resource center (free articles and glossary)", "IAPP", "https://iapp.org/resources", "Use the free glossary to look up privacy terms."]
  ],
  "c-basics": [
    ["Reference", "MDN: How the web works (free)", "Mozilla", "https://developer.mozilla.org", "Read 'How the web works' and 'How does the internet work'."],
    ["Reference", "CISA free guides on basic security habits", "CISA", "https://www.cisa.gov/resources-tools", "Free plain-language guides for everyday security."],
    ["Reference", "Khan Academy: computing and the internet (free lessons)", "Khan Academy", "https://www.khanacademy.org", "Free short lessons on computers and the internet."]
  ],
  "c-network": [
    ["Whole-subject free book", "An Introduction to Computer Networks (free open textbook)", "Peter Dordal, Loyola University Chicago", "https://intronetworks.cs.luc.edu/", "Read the chapters in order; it covers the whole subject for free."],
    ["Reference", "Cloudflare Learning Center (free explainers)", "Cloudflare", "https://www.cloudflare.com/learning", "Short explainers on IP, DNS, firewalls and VPNs."],
    ["Reference", "NIST SP 800-41 Firewalls and firewall policy (free PDF)", "NIST", "https://csrc.nist.gov", "Read the overview. You need the idea of a firewall rule only."],
    ["Reference", "MDN: How the web works (free)", "Mozilla", "https://developer.mozilla.org", "Read the networking basics on how requests travel."]
  ],
  "c-linux": [
    ["Free book", "The Linux Command Line (free PDF)", "William Shotts", "https://linuxcommand.org", "Read chapters 1 to 9 in order. Practise each command in the Lab first."],
    ["Free book", "OverTheWire: Bandit and other wargames (free)", "OverTheWire", "https://overthewire.org", "Hands-on Linux practice, free."],
    ["Reference", "GNU Coreutils manual (free)", "GNU Project", "https://www.gnu.org/software/coreutils/manual", "Look up any command you do not recognise."]
  ],
  dpdp: [
    ["Official text", "Digital Personal Data Protection Act, 2023 (free PDF)", "Government of India (MeitY)", "https://www.meity.gov.in", "Search the title for the PDF. Read section 2 (definitions) and section 4 (lawful processing) first."],
    ["Official text", "Digital Personal Data Protection Rules (free)", "MeitY", "https://www.meity.gov.in", "Check MeitY for the latest notified version, then read the rules alongside the Act."],
    ["Regulator guidance", "Data Protection Board of India: notices and guidance (free)", "Government of India", "https://www.meity.gov.in", "Watch for guidance and notices from the Board."],
    ["Official text", "Information Technology Act, 2000, section 43A and SPDI Rules (free)", "MeitY", "https://www.meity.gov.in", "Read this to see what the DPDP Act replaced."]
  ],
  gdpr: [
    ["Whole-subject free book", "The GDPR made simple(r) for SMEs (free, open access)", "OAPEN open access library", "https://library.oapen.org/handle/20.500.12657/46614", "Read it as the whole-subject book, then the GDPR text for each article it mentions."],
    ["Official text", "Regulation (EU) 2016/679 (GDPR, free)", "European Union", "https://eur-lex.europa.eu/eli/reg/2016/679/oj", "Read Article 4 (definitions), Article 5 (principles) and Article 6 (lawful bases). Then Articles 15 to 22 (rights)."],
    ["Regulator guidance", "EDPB guidelines (free)", "European Data Protection Board", "https://www.edpb.europa.eu", "Read the guidelines on consent and on the right of access."],
    ["Regulator guidance", "UK ICO: Guide to UK GDPR (free)", "Information Commissioner's Office", "https://ico.org.uk", "Plain-English explanations of each principle."]
  ],
  ccpa: [
    ["Whole-subject free book", "Open Internet Law Casebook: Privacy (free, Open Casebook)", "Open Casebook project", "https://opencasebook.org/casebooks/409-an-open-internet-law-casebook/sections/5-oil-casebook-topic-v-privacy/", "Read the cases for how US privacy law works in practice."],
    ["Official text", "California Consumer Privacy Act, as amended by CPRA (free)", "State of California", "https://oag.ca.gov/privacy/ccpa", "Read the consumer rights and business obligations sections."],
    ["Regulator guidance", "California Privacy Protection Agency (free)", "CPPA", "https://cppa.ca.gov", "Official guidance and regulations."],
    ["Reference", "IAPP US state privacy tracker (free summary)", "IAPP", "https://iapp.org", "Search 'US state privacy legislation tracker' to compare states."]
  ],
  privops: [
    ["Regulator guidance", "UK ICO: Data protection impact assessments (free)", "Information Commissioner's Office", "https://ico.org.uk", "Read the DPIA guidance; it is the clearest free example."],
    ["Reference", "IAPP resource center (free templates and guides)", "IAPP", "https://iapp.org/resources", "Search 'privacy operations' for free templates."],
    ["Vendor docs", "OneTrust free resources", "OneTrust", "https://www.onetrust.com/resources", "Free guides on DSARs, records and assessments."]
  ],
  "c-iam": [
    ["Reference", "NIST SP 800-63 Digital Identity Guidelines (free)", "NIST", "https://pages.nist.gov/800-63-3", "Read the overview and the authentication levels."],
    ["Vendor docs", "Microsoft Learn: Entra ID (free)", "Microsoft", "https://learn.microsoft.com/entra", "Read 'what is Entra ID' and 'Conditional Access'."],
    ["Reference", "OWASP Authentication Cheat Sheet (free)", "OWASP", "https://cheatsheetseries.owasp.org", "Plain-language good and bad practice for logins and passwords."]
  ],
  "c-threats": [
    ["Reference", "MITRE ATT&CK (free)", "MITRE", "https://attack.mitre.org", "Start with the Tactics page. Learn the names, not every technique."],
    ["Reference", "OWASP Top 10 (free)", "OWASP", "https://owasp.org/www-project-top-10", "Read the list and one plain example for each item."],
    ["Free book", "Security Engineering, 3rd edition (free PDF)", "Ross Anderson", "https://www.cl.cam.ac.uk/~rja14/book.html", "Read chapter 1 for the basic attacker and defender model."]
  ],
  "c-crypto": [
    ["Whole-subject free book", "A Graduate Course in Applied Cryptography (free from the authors)", "Dan Boneh and Victor Shoup", "https://crypto.stanford.edu/~dabo/cryptobook", "Read chapters 1 to 4 for the core ideas, then the parts your projects need."],
    ["Reference", "NIST SP 800-175B Cryptographic algorithms guideline (free)", "NIST", "https://csrc.nist.gov", "Read the summary to see which algorithms are approved."],
    ["Reference", "Cloudflare: encryption explainers (free)", "Cloudflare", "https://www.cloudflare.com/learning", "Short plain-language explanations of encryption at rest and in transit."],
    ["Free book", "Security Engineering, chapter on cryptography (free PDF)", "Ross Anderson", "https://www.cl.cam.ac.uk/~rja14/book.html", "Read the cryptography overview for the ideas."]
  ],
  "c-controls": [
    ["Reference", "CIS Critical Security Controls (free)", "Center for Internet Security", "https://www.cisecurity.org/controls", "Read the list of controls; learn the names and what each covers."],
    ["Official text", "NIST SP 800-53 Rev 5 Security and Privacy Controls (free)", "NIST", "https://csrc.nist.gov", "Use it as a reference. Read the control families page."],
    ["Free book", "The Three Lines Model (IIA, 2020, free PDF)", "The Institute of Internal Auditors", "https://www.theiia.org", "Two pages on control ownership."]
  ],
  iso: [
    ["Reference", "NIST CSF 2.0 informative references (free mapping to ISO 27001)", "NIST", "https://www.nist.gov/cyberframework", "Read how each NIST outcome maps to ISO controls. This gives you the ISO content for free."],
    ["Reference", "CIS Controls mapping to ISO 27001 (free)", "Center for Internet Security", "https://www.cisecurity.org/controls", "Read the mapping table to see which controls satisfy which ISO clauses."],
    ["Regulator guidance", "ISO/IEC 27001 overview page (free summary)", "ISO", "https://www.iso.org/isoiec-27001-information-security.html", "Read the free overview only. The full standard is paid, so skip it for now."]
  ],
  frameworks: [
    ["Reference", "NIST Cybersecurity Framework 2.0 (free)", "NIST", "https://www.nist.gov/cyberframework", "Read the core functions: Govern, Identify, Protect, Detect, Respond, Recover."],
    ["Reference", "PCI DSS v4.0 (free download)", "PCI Security Standards Council", "https://www.pcisecuritystandards.org", "Read the 12 requirements list. The document is free to download."],
    ["Reference", "AICPA Trust Services Criteria overview (free summary)", "AICPA", "https://www.aicpa-cima.com", "Read the five categories and what an auditor checks."]
  ],
  risk: [
    ["Whole-subject free book", "Managing Risk and Information Security: Protect to Enable (free, open access)", "OAPEN open access library", "https://library.oapen.org/handle/20.500.12657/112455", "Search OAPEN for this title if the link opens a different book. Read the risk chapters first."],
    ["Reference", "NIST SP 800-30 Guide for conducting risk assessments (free)", "NIST", "https://csrc.nist.gov", "Read the overview and the risk matrix example."],
    ["Reference", "FAIR Institute free resources", "FAIR Institute", "https://www.fairinstitute.org", "Free guides on measuring cyber risk in money terms."],
    ["Reference", "NIST Cybersecurity Framework 2.0 (free)", "NIST", "https://www.nist.gov/cyberframework", "Read the Identify function for the risk-assessment steps."]
  ],
  "t-excel": [
    ["Vendor docs", "Microsoft Excel help and training (free)", "Microsoft", "https://support.microsoft.com/excel", "Start with formulas, then lookups, then pivot tables."],
    ["Vendor docs", "Microsoft Learn: Power BI (free)", "Microsoft Learn", "https://learn.microsoft.com/power-bi", "Start with the 'get started' module."],
    ["Reference", "Build a risk register and control matrix in Excel (your own practice)", "Your own build", "https://support.microsoft.com", "Build one from scratch using the topic's projects."]
  ],
  audit: [
    ["Reference", "IIA Global Internal Audit Standards (free summary)", "The Institute of Internal Auditors", "https://www.theiia.org", "Read the purpose and principles sections."],
    ["Free book", "The Three Lines Model (IIA, 2020, free PDF)", "The Institute of Internal Auditors", "https://www.theiia.org", "Two pages on how audit relates to management."],
    ["Reference", "NIST SP 800-53A Assessing security controls (free)", "NIST", "https://csrc.nist.gov", "Read the assessment methods: examine, interview, test."]
  ],
  tprm: [
    ["Reference", "NIST SP 800-161 Cyber supply chain risk management (free)", "NIST", "https://csrc.nist.gov", "Read the overview of vendor risk."],
    ["Official text", "GDPR Article 28 (processor contracts, free)", "European Union", "https://eur-lex.europa.eu/eli/reg/2016/679/oj", "Read Article 28. It sets what a vendor contract must say."],
    ["Reference", "Shared Assessments: free resources", "Shared Assessments", "https://sharedassessments.org", "Look at how vendors are assessed; read the free overview."]
  ],
  hipaa: [
    ["Official text", "HIPAA Privacy Rule (free, HHS)", "US HHS", "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html", "Read the HHS summary first, then the rule."],
    ["Regulator guidance", "HHS Security Rule guidance (free)", "US HHS", "https://www.hhs.gov/hipaa/for-professionals/security/index.html", "Read the plain-language summary."],
    ["Regulator guidance", "HHS guidance on de-identification of PHI (free)", "US HHS", "https://www.hhs.gov", "Understand the two de-identification methods."]
  ],
  glba: [
    ["Official text", "Gramm-Leach-Bliley Act, Title V (free)", "US Congress", "https://www.ftc.gov", "Search 'Gramm-Leach-Bliley Act' on the FTC site."],
    ["Regulator guidance", "FTC Safeguards Rule business guidance (free)", "Federal Trade Commission", "https://www.ftc.gov", "Read the plain-language business guidance."],
    ["Official text", "Fair Credit Reporting Act (free, FTC)", "US Congress", "https://www.ftc.gov", "Read the sections on consumer report use. You know this from Provana."]
  ],
  secfinra: [
    ["Regulator guidance", "SEC Regulation S-P (free)", "US SEC", "https://www.sec.gov", "Search 'Regulation S-P' for the rule and summary."],
    ["Regulator guidance", "FINRA cybersecurity guidance (free)", "FINRA", "https://www.finra.org", "Read the cybersecurity and recordkeeping pages."],
    ["Regulator guidance", "NYDFS Cybersecurity Regulation 23 NYCRR 500 (free)", "New York DFS", "https://www.dfs.ny.gov", "Read the summary and the requirements list."]
  ],
  indiafin: [
    ["Regulator guidance", "RBI Master Directions on IT and outsourcing (free)", "Reserve Bank of India", "https://www.rbi.org.in", "Search the title on the RBI site; read the summary."],
    ["Regulator guidance", "SEBI Cybersecurity and Cyber Resilience Framework (free)", "SEBI", "https://www.sebi.gov.in", "Read the overview of the framework."],
    ["Official text", "CERT-In Directions, 28 April 2022 (free)", "CERT-In", "https://www.cert-in.org.in", "Read the directions on reporting incidents within six hours."]
  ],
  "c-ir": [
    ["Reference", "NIST SP 800-61 Computer Security Incident Handling Guide (free)", "NIST", "https://csrc.nist.gov", "Read the four-phase lifecycle."],
    ["Regulator guidance", "CERT-In incident reporting guidance (free)", "CERT-In", "https://www.cert-in.org.in", "Read what must be reported and when."],
    ["Reference", "SANS Reading Room (free papers)", "SANS Institute", "https://www.sans.org/reading-room", "Free papers on incident response steps."]
  ],
  "c-cloud": [
    ["Reference", "AWS Shared Responsibility Model (free)", "Amazon Web Services", "https://aws.amazon.com/compliance/shared-responsibility-model", "The core reading for cloud compliance."],
    ["Vendor docs", "Microsoft Azure compliance overview (free)", "Microsoft Learn", "https://learn.microsoft.com/azure/compliance", "Read the overview of compliance offerings."],
    ["Vendor docs", "AWS CloudTrail documentation (free)", "Amazon Web Services", "https://docs.aws.amazon.com/cloudtrail", "Read the 'what is CloudTrail' page."]
  ],
  aigov: [
    ["Official text", "Regulation (EU) 2024/1689, the EU AI Act (free)", "European Union", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "Read the definitions (Article 3) and the risk categories (Articles 5 and 6)."],
    ["Reference", "NIST AI Risk Management Framework 1.0 (free)", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Read the four functions: Govern, Map, Measure, Manage."],
    ["Reference", "OECD AI Principles (free)", "OECD", "https://oecd.ai", "Short. Read the five principles."]
  ],
  "t-onetrust": [
    ["Vendor docs", "OneTrust free resources and guides", "OneTrust", "https://www.onetrust.com/resources", "Read the product overview: data mapping, DSARs and assessments."],
    ["Reference", "IAPP resource center (free)", "IAPP", "https://iapp.org/resources", "Free background on privacy program management."],
    ["Reference", "ICO: Accountability framework (free)", "Information Commissioner's Office", "https://ico.org.uk", "Read the accountability and records guidance the tool automates."]
  ],
  "t-servicenow": [
    ["Vendor docs", "ServiceNow Integrated Risk Management documentation (free)", "ServiceNow", "https://www.servicenow.com", "Read the IRM overview and the data model description."],
    ["Vendor docs", "ServiceNow Developer site (free personal instance)", "ServiceNow", "https://developer.servicenow.com", "Free instance for practice."],
    ["Reference", "NIST CSF 2.0 (free)", "NIST", "https://www.nist.gov/cyberframework", "Use it to see which controls you map inside the tool."]
  ],
  "t-azure": [
    ["Vendor docs", "Microsoft Entra ID documentation (free)", "Microsoft Learn", "https://learn.microsoft.com/entra", "Read 'what is Entra ID' and 'Conditional Access'."],
    ["Vendor docs", "Microsoft Defender for Cloud documentation (free)", "Microsoft Learn", "https://learn.microsoft.com/azure/defender-for-cloud", "Read the regulatory compliance dashboard page."],
    ["Vendor docs", "Microsoft Learn: Azure fundamentals (free)", "Microsoft Learn", "https://learn.microsoft.com/training", "Free learning paths. Start with fundamentals."]
  ],
  "t-aws": [
    ["Reference", "AWS Shared Responsibility Model (free)", "Amazon Web Services", "https://aws.amazon.com/compliance/shared-responsibility-model", "The core reading for cloud compliance."],
    ["Vendor docs", "AWS IAM User Guide (free)", "Amazon Web Services", "https://docs.aws.amazon.com/IAM", "Read 'IAM concepts' and 'least privilege'."],
    ["Vendor docs", "AWS Artifact: compliance reports (free)", "Amazon Web Services", "https://aws.amazon.com/artifact", "Where compliance reports are downloaded."]
  ],
  "t-purview": [
    ["Vendor docs", "Microsoft Purview documentation (free)", "Microsoft Learn", "https://learn.microsoft.com/purview", "Read 'what is Purview' and 'sensitivity labels'."],
    ["Vendor docs", "Data loss prevention in Microsoft Purview (free)", "Microsoft Learn", "https://learn.microsoft.com/purview/dlp-learn-about-dlp", "Read the overview."],
    ["Vendor docs", "Microsoft Learn: Purview compliance fundamentals (free)", "Microsoft Learn", "https://learn.microsoft.com/training", "Free modules."]
  ],
  "t-grcauto": [
    ["Vendor docs", "Vanta help center (free)", "Vanta", "https://www.vanta.com", "Read the product overview and how automated tests work."],
    ["Vendor docs", "Drata knowledge base (free)", "Drata", "https://drata.com", "Read the overview of control monitoring."],
    ["Vendor docs", "AuditBoard and Archer product overviews (free)", "AuditBoard, Archer", "https://www.auditboard.com", "Compare the platforms by what they automate."]
  ],
  "t-vuln": [
    ["Reference", "NIST SP 800-40 Patch management (free)", "NIST", "https://csrc.nist.gov", "Read the overview of vulnerability handling."],
    ["Vendor docs", "Microsoft Defender Vulnerability Management (free)", "Microsoft Learn", "https://learn.microsoft.com/defender-vulnerability-management", "Read the overview and the exposure score page."],
    ["Vendor docs", "Tenable and Qualys free documentation", "Tenable, Qualys", "https://www.tenable.com", "Read 'what is a vulnerability scan'."]
  ],
  "t-sentinel": [
    ["Vendor docs", "Microsoft Sentinel documentation (free)", "Microsoft Learn", "https://learn.microsoft.com/azure/sentinel", "Read 'what is Sentinel' and 'analytics rules'."],
    ["Vendor docs", "Kusto Query Language (KQL) tutorial (free)", "Microsoft Learn", "https://learn.microsoft.com/kusto", "Start with the query basics page."],
    ["Vendor docs", "Splunk documentation (free)", "Splunk", "https://docs.splunk.com", "Read 'what is Splunk' for the other SIEM."]
  ],
  "bd-assoc": [
    ["Reference", "HubSpot Sales Academy (free courses)", "HubSpot", "https://academy.hubspot.com", "Free courses on prospecting and pipeline."],
    ["Reference", "Salesforce Trailhead (free)", "Salesforce", "https://trailhead.salesforce.com", "Free modules on sales basics and CRM."],
    ["Reference", "Harvard Business Review free articles", "HBR", "https://hbr.org", "Search 'business development' and read the free articles."]
  ],
  "bd-consult": [
    ["Reference", "HubSpot Sales Academy (free courses)", "HubSpot", "https://academy.hubspot.com", "Free courses on consultative selling."],
    ["Reference", "Salesforce Trailhead (free)", "Salesforce", "https://trailhead.salesforce.com", "Free modules on sales and customer needs."],
    ["Reference", "Harvard Business Review free articles", "HBR", "https://hbr.org", "Search 'consultative selling' for free articles."]
  ],
  consulting: [
    ["Reference", "MIT OpenCourseWare: management and business (free)", "MIT", "https://ocw.mit.edu", "Free course notes on problem solving and management."],
    ["Reference", "Khan Academy: business basics (free)", "Khan Academy", "https://www.khanacademy.org", "Free lessons on how businesses work."],
    ["Reference", "Harvard Business Review free articles", "HBR", "https://hbr.org", "Search 'consulting' and read the free articles."]
  ],
  aml: [
    ["Reference", "FATF Recommendations (free)", "FATF", "https://www.fatf-gafi.org", "Read the recommendations on customer due diligence (1 to 10)."],
    ["Regulator guidance", "RBI KYC Master Direction (free)", "Reserve Bank of India", "https://www.rbi.org.in", "Search 'KYC Master Direction' for the rules."],
    ["Regulator guidance", "FinCEN AML program guidance (free)", "US FinCEN", "https://www.fincen.gov", "Read the overview of AML programs."]
  ],
  clm: [
    ["Whole-subject free book", "Business Law I Essentials (free, OpenStax)", "OpenStax, Rice University", "https://openstax.org/books/business-law-i-essentials-2e/pages/preface", "Read the contract law chapters; they cover offer, acceptance, consideration and breach."],
    ["Official text", "Indian Contract Act, 1872 (free, India Code)", "Government of India", "https://www.indiacode.nic.in", "Search the Act; read the sections on offer and acceptance."],
    ["Reference", "Association of Corporate Counsel: free articles", "ACC", "https://www.acc.com", "Free articles on legal operations and contracts."],
    ["Reference", "Khan Academy: business basics (free)", "Khan Academy", "https://www.khanacademy.org", "Free lessons on how contracts and businesses work."]
  ],
  ediscovery: [
    ["Reference", "EDRM Electronic Discovery Reference Model (free)", "EDRM", "https://edrm.net", "Read the model; it is the standard map of eDiscovery steps."],
    ["Reference", "The Sedona Conference publications (free)", "The Sedona Conference", "https://thesedonaconference.org", "Read the principles on proportionality and privilege."],
    ["Vendor docs", "Microsoft Purview eDiscovery documentation (free)", "Microsoft Learn", "https://learn.microsoft.com/purview/ediscovery", "Read 'what is eDiscovery'."]
  ],
  tns: [
    ["Official text", "India IT Rules, 2021, intermediary guidelines (free)", "MeitY", "https://www.meity.gov.in", "Read the sections on takedown and grievance officers."],
    ["Reference", "Santa Clara Principles on content moderation (free)", "Santa Clara Principles", "https://santaclaraprinciples.org", "Short. Read the principles."],
    ["Official text", "EU Digital Services Act (free, EUR-Lex)", "European Union", "https://eur-lex.europa.eu", "Read the summary of platform duties."]
  ],
  "ai-found": [
    ["Whole-subject free book", "Ethics of Artificial Intelligence: Case Studies and Options for Addressing Ethical Challenges (free, open access)", "OAPEN open access library", "https://library.oapen.org/handle/20.500.12657/59315", "Read the case studies to see how AI risks appear in real life."],
    ["Free book", "Elements of AI (free course, University of Helsinki)", "University of Helsinki and MinnaLearn", "https://www.elementsofai.com", "Free. Start with chapters 1 and 2 on what AI is."],
    ["Reference", "Google Machine Learning Crash Course (free)", "Google", "https://developers.google.com/machine-learning/crash-course", "Read the framing and data units."],
    ["Reference", "NIST AI RMF 1.0 glossary (free)", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Use it to look up AI terms."]
  ],
  "ai-euact": [
    ["Official text", "Regulation (EU) 2024/1689, the EU AI Act (free)", "European Union", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "Read Article 3 (definitions), Article 5 (banned uses), Article 6 and Annex III (high risk)."],
    ["Regulator guidance", "European Commission AI Act overview (free)", "European Commission", "https://digital-strategy.ec.europa.eu", "Read the timeline and the summary pages."],
    ["Reference", "EU AI Act explorer (free)", "Future of Life Institute", "https://artificialintelligenceact.eu", "A clear, free summary of each article."]
  ],
  "ai-std": [
    ["Reference", "NIST AI RMF 1.0 (free)", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Read the Govern, Map, Measure and Manage functions."],
    ["Reference", "OECD AI Principles (free)", "OECD", "https://oecd.ai", "Read the principles and the policy summaries."],
    ["Reference", "India AI governance guidelines (free, MeitY)", "MeitY", "https://www.meity.gov.in", "Search 'AI governance guidelines' for the India framework."]
  ],
  "ai-risk": [
    ["Whole-subject free book", "Ethics of Artificial Intelligence: Case Studies and Options for Addressing Ethical Challenges (free, open access)", "OAPEN open access library", "https://library.oapen.org/handle/20.500.12657/59315", "Use the case studies to practise identifying and assessing risks."],
    ["Reference", "NIST AI RMF Playbook (free)", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Read the suggested actions for each function."],
    ["Official text", "EU AI Act Article 27, fundamental rights impact assessment (free)", "European Union", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "Read Article 27 for what an impact assessment must cover."],
    ["Reference", "AI Incident Database (free)", "Responsible AI Collaborative", "https://incidentdatabase.ai", "Read real AI failures to see why assessments matter."]
  ],
  "ai-sec": [
    ["Reference", "OWASP Top 10 for LLM Applications (free)", "OWASP", "https://owasp.org/www-project-top-10-for-large-language-model-applications", "Read the list. Learn prompt injection and data leakage first."],
    ["Reference", "NIST AI 600-1 Generative AI Profile (free)", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Read the risk list for generative AI."],
    ["Reference", "Microsoft Responsible AI resources (free)", "Microsoft", "https://www.microsoft.com/ai/responsible-ai-resources", "Free guides on privacy and security for AI systems."]
  ],
  "t-automate": [
    ["Vendor docs", "Microsoft Learn: Power Automate (free)", "Microsoft Learn", "https://learn.microsoft.com/power-automate", "Start with 'create a flow' and 'approvals'."],
    ["Free book", "Automate the Boring Stuff with Python (free online)", "Al Sweigart", "https://automatetheboringstuff.com", "Read chapters 1 to 4, then the spreadsheet and file chapters."],
    ["Reference", "Zapier learning center (free)", "Zapier", "https://zapier.com/learn", "Free short guides on no-code automation."]
  ]
};
/* Materials card on each subject page. Every entry is free to read. */
function materialsCard(t){
  const list = MAT[t.id] || [];
  if (!list.length) return "";
  const hasBook = list.some(x => x[0] === "Whole-subject free book");
  return `<section class="card matcard"><span class="eyebrow">Read the original sources, free</span><h3>Where to read ${esc(t.title)}</h3>
    ${hasBook ? "" : '<p class="note">No free whole-subject book has been verified for this subject yet. Read the official sources below in order, and check for a free book again later.</p>'}
    <p class="num">Read the official text or the regulator's explanation first. Use the free guide or vendor page to understand it in plain words. Every link here is free to read.</p>
    <div class="matlist">${list.map(([type, title, by, url, how]) => `<div class="matrow">
      <span class="pill ${type === "Whole-subject free book" ? "hot" : type === "Official text" ? "acc" : type === "Regulator guidance" ? "ok" : ""}">${esc(type)}</span>
      <div style="min-width:0"><b>${esc(title)}</b><div class="num">${esc(by)}</div><p class="muted" style="font-size:.9rem;margin:2px 0 0">${esc(how)}</p></div>
      ${url ? `<a class="btn sm ghost" href="${esc(url)}" target="_blank" rel="noopener">Open ↗</a>` : ""}</div>`).join("")}</div></section>`;
}
