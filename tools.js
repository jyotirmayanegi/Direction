const TOOLS = [
{id:"t-servicenow",track:"tool",title:"ServiceNow IRM (GRC)",short:"The enterprise GRC platform most large employers and Big 4 use",weeks:"Tool 1",prio:true,sk:["servicenow","grc","audit"],
 obj:"Navigate ServiceNow, explain the IRM data model (policy → control → risk → issue), and complete a small practice build in a free developer instance.",
 why:"ServiceNow IRM appears frequently in Indian GRC postings at large companies and Big 4 firms (for example Deloitte India's ServiceNow GRC roles), and Indian postings list ServiceNow certifications as requirements.",
 subs:[
  {t:"What ServiceNow is",l:1,b:"A cloud platform companies use for IT tickets, HR requests and more. IRM (Integrated Risk Management, formerly GRC) is the module for policies, controls, risks, audits and issues.",v:"what is ServiceNow explained beginners"},
  {t:"The IRM data model",l:1,b:"Authority documents (laws/standards) → citations → policies → control objectives → controls (one per entity, like a business unit) → risk statements → risks → issues. Learn this chain and the screens make sense.",v:"ServiceNow IRM policy and compliance data model authority document citation control"},
  {t:"Get a free practice instance",l:1,b:"Sign up at developer.servicenow.com and request a Personal Developer Instance (PDI). Note that inactive PDIs are reclaimed, so log in regularly.",v:"ServiceNow personal developer instance how to get"},
  {t:"Lists, forms, filters and dashboards",l:1,b:"Most analyst work is reading lists of records, filtering them ('controls failing this quarter'), opening forms, and viewing dashboards. No coding needed.",v:"ServiceNow lists forms filters basics"},
  {t:"Practice build",l:1,b:"In your PDI: create one policy (Access Control), five controls, three risks, one attestation and one issue. Screenshot the flow for your portfolio.",v:"ServiceNow GRC demo create policy control risk issue"},
  {t:"Certifications",l:3,b:"ServiceNow Certified System Administrator (CSA) first, then Certified Implementation Specialist – Risk & Compliance. Paid; many partner employers sponsor them.",v:"ServiceNow CSA CIS risk and compliance certification path"}
 ],
 ill:{type:"flow",steps:[["Authority doc","ISO 27001"],["Citation","A.5.15 Access control"],["Policy","Access Control Policy"],["Control","Quarterly access review (Finance)"],["Risk","Unauthorised access"],["Issue","Review missed Q2 → remediate"]]},
 illCap:"How ServiceNow IRM links a standard down to a single issue.",
 case:{t:"Analyst's Monday in ServiceNow",b:"You open the 'Controls with failed attestations' list, filter for your business unit, find two owners who didn't attest. You create issues, assign owners, set due dates, and update the dashboard the compliance manager presents on Friday."},
 ben:["Strongest tool keyword for large-enterprise GRC roles.","Free practice instance means real hands-on screenshots."],
 trap:["Listing 'ServiceNow' on a resume without having used a PDI.","Trying to learn scripting first — not needed for analysts."],
 quiz:[
  {q:"IRM in ServiceNow stands for:",o:["Internal Risk Monitor","Integrated Risk Management","IT Request Module","Incident Response Manager"],a:1,w:"Integrated Risk Management."},
  {q:"A law or standard loaded into IRM is called an:",o:["Issue","Authority document","Indicator","Incident"],a:1,w:"Authority document."},
  {q:"Free practice access comes from a:",o:["Trial licence","Personal Developer Instance","Paid course only","Mobile app"],a:1,w:"PDI via developer.servicenow.com."}],
 refs:[["ServiceNow GRC/IRM playlist (recommended on ServiceNow Community)","https://www.youtube.com/watch?v=61Ty8YIq6qc&list=PL1k_gTsSGTwXOHTLaiL80-7KSxIn51Mh4","video"],["ServiceNow Developer site (free PDI)","https://developer.servicenow.com/","course"],["ServiceNow University","https://learning.servicenow.com/","course"],["Learn N Grow Together with Atul G","https://www.youtube.com/@LearnNGrowTogetherwithAtulG","video"]],
 terms:{"PDI":"Personal Developer Instance — free practice ServiceNow.","attestation":"A control owner's formal confirmation that a control ran.","entity":"A business unit, system or location a control applies to."}},

{id:"t-onetrust",track:"tool",title:"OneTrust",short:"The leading privacy platform: data maps, DPIAs, consent, DSARs, vendor risk",weeks:"Tool 2",prio:true,sk:["onetrust","privops","tprm"],
 obj:"Name OneTrust's main privacy modules, describe the workflow each automates, and recreate those workflows on paper so you can discuss them confidently.",
 why:"OneTrust is privacy-first and shows up in GRC and privacy analyst postings for vendor risk, consent, data mapping and DSARs. Some postings ask for OneTrust certifications. It fits your DPDP/GDPR focus.",
 subs:[
  {t:"What OneTrust does",l:1,b:"A platform that runs privacy program tasks at scale: inventories of data, assessments, consent banners, rights requests and vendor reviews, with dashboards and audit trails.",v:"OneTrust platform overview demo"},
  {t:"Data Mapping / inventory",l:1,b:"Records systems (assets) and processing activities, links them to data types and vendors, and generates RoPA reports.",v:"OneTrust data mapping tutorial"},
  {t:"Assessments (PIA/DPIA)",l:1,b:"Questionnaire templates sent to business owners; answers trigger risk flags for the privacy team to review and approve.",v:"OneTrust privacy impact assessment DPIA tutorial"},
  {t:"Consent & Preferences / Cookies",l:1,b:"Builds cookie banners and preference centres, stores consent records, and blocks tracking until consent where required.",v:"OneTrust cookie consent tutorial"},
  {t:"DSAR / Privacy Rights",l:1,b:"A web form for requests, identity verification, task routing to system owners, deadline tracking and response templates.",v:"OneTrust DSAR privacy rights automation demo"},
  {t:"Third-Party Risk",l:2,b:"Vendor inventory, tiering, questionnaires, risk scoring and reassessment scheduling.",v:"OneTrust third party risk management demo"},
  {t:"Practise without a licence",l:1,b:"Watch OneTrust's free on-demand demos, then build the same artifacts in Excel or Docs: a data map, one DPIA, a DSAR log and a vendor questionnaire. Check OneTrust's site for current free training or certification options.",v:"OneTrust tutorial walkthrough beginners"}
 ],
 ill:{type:"hub",center:"OneTrust",spokes:["Data Mapping","DPIA","Consent","DSAR","Vendor Risk","Policies"]},
 illCap:"Each spoke is a privacy job you learned in the Law modules, automated.",
 case:{t:"New marketing app launch",b:"Marketing plans an app using location data. Privacy sends a DPIA from OneTrust; answers flag 'precise location' as high risk. The team adds opt-in consent and 90-day deletion. The app's data flows are added to the data map, the cookie banner is updated, and the DPIA is approved with an audit trail."},
 ben:["Most relevant tool for privacy analyst roles.","Pairs directly with DPDP readiness work."],
 trap:["Claiming hands-on OneTrust use from watching demos; say 'product training'.","Thinking OneTrust 'does compliance' by itself — people still make the decisions."],
 quiz:[
  {q:"Which OneTrust area handles 'what data do you hold on me' requests?",o:["Cookies","DSAR / Privacy Rights","Data Mapping","Policy"],a:1,w:"Privacy Rights automation handles DSARs."},
  {q:"A RoPA report comes from:",o:["Data Mapping","Consent","Vendor risk","Incident"],a:0,w:"Data Mapping produces RoPA."},
  {q:"Honest resume wording after watching demos:",o:["OneTrust expert","OneTrust (product training)","OneTrust admin 3 yrs","Built OneTrust"],a:1,w:"Be accurate; interviews test it."}],
 refs:[["OneTrust resources and on-demand demos","https://www.onetrust.com/resources/","course"],["OneTrust Using OneTrust: platform overview","https://www.onetrust.com/resources/onetrust-using-onetrust-a-platform-overview-webinar/","video"]],
 terms:{"PIA":"Privacy Impact Assessment.","preference centre":"A page where users manage their consents.","asset":"In data mapping, a system or app that stores data."}},

{id:"t-excel",track:"tool",title:"Excel for GRC (+ Power BI basics)",short:"Risk registers, control matrices and findings trackers",weeks:"Tool 3",sk:["excel","risk"],
 obj:"Build a risk register, a control matrix and a findings tracker with drop-downs, lookups, conditional formatting and a pivot summary.",
 why:"Excel is nearly universal in GRC postings for risk registers, reporting and reconciliation, even where a GRC platform exists. It's also the fastest way to make portfolio proof.",
 subs:[
  {t:"Tables, sort, filter, freeze panes",l:1,b:"Convert data to a Table (Ctrl+T) so filters and formulas extend automatically. Freeze the header row.",v:"Excel tables sort filter freeze panes beginners"},
  {t:"Data validation drop-downs",l:1,b:"Restrict cells to set values (Likelihood 1–5, Status Open/Closed) so data stays clean.",v:"Excel data validation drop down list"},
  {t:"IF, COUNTIFS, SUMIFS",l:1,b:"IF assigns ratings (=IF(score>=15,\"High\",...)). COUNTIFS counts e.g. open high risks per owner.",v:"Excel IF COUNTIFS SUMIFS tutorial"},
  {t:"XLOOKUP",l:1,b:"Pulls matching data from another sheet, e.g. a control owner's email by control ID.",v:"Excel XLOOKUP tutorial beginners"},
  {t:"Conditional formatting heat map",l:1,b:"Colour scores automatically: red ≥15, amber 8–14, green ≤7.",v:"Excel conditional formatting risk heat map"},
  {t:"Pivot tables",l:2,b:"Summarise findings by status, owner and severity in seconds for a management report.",v:"Excel pivot table tutorial beginners"},
  {t:"Power BI basics",l:3,b:"Load your register into Power BI to make an interactive dashboard. Optional, but impressive in a portfolio.",v:"Power BI beginners full course"}
 ],
 ill:{type:"table",head:["ID","Risk","Owner","L","I","Score","Status"],rows:[["R-01","Personal data emailed externally","IT","4","4","16","Open"],["R-02","Leaver access not removed","HR/IT","3","4","12","In progress"],["R-03","Vendor breach of customer data","Procurement","2","5","10","Open"],["R-04","Phishing leads to account takeover","Security","3","3","9","Mitigated"]]},
 illCap:"The shape of a risk register. Build yours with 10 rows for a sample company.",
 case:{t:"Your portfolio workbook",b:"Sheet 1: Risk register (10 risks, scored, colour-coded). Sheet 2: Control matrix (control ID, description, ISO 27001 mapping, owner, frequency, last test result). Sheet 3: Findings tracker with drop-downs and due dates. Sheet 4: Pivot summary. Upload to GitHub and link it on LinkedIn Featured."},
 ben:["Universal; fastest proof of skill.","Directly feeds ServiceNow/OneTrust concepts."],
 trap:["Merged cells and hard-coded numbers that break filters.","No legend explaining scores."],
 quiz:[
  {q:"Which function finds a value in another table by key?",o:["SUM","XLOOKUP","LEN","NOW"],a:1,w:"XLOOKUP."},
  {q:"Restricting a cell to 'Open/Closed' uses:",o:["Pivot table","Data validation","Freeze panes","Macro"],a:1,w:"Data validation."},
  {q:"Summarising findings by owner quickly uses a:",o:["Pivot table","Chart title","Hyperlink","Comment"],a:0,w:"Pivot tables summarise."}],
 refs:[["Microsoft — Excel training","https://support.microsoft.com/en-us/excel","course"],["Microsoft Learn — Power BI","https://learn.microsoft.com/en-us/training/powerplatform/power-bi","course"]],
 terms:{"risk register":"A table of risks with scores, owners and actions.","control matrix":"A table of controls with owners, frequency and mappings.","pivot table":"An Excel tool that summarises data by categories."}}
];
