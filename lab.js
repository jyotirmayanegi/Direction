/* ================= CYBER LAB (game) ================= */
const ZONES = [
 {id:"term",name:"Terminal Town",topic:"c-linux",color:"#1E8A4C",icon:"$_",blurb:"Type real commands: move around, read logs, fix permissions, stop malware."},
 {id:"net",name:"Network City",topic:"c-network",color:"#0A6CDF",icon:"⇄",blurb:"Wire an office, learn ports, run a firewall, catch fake domains."},
 {id:"id",name:"Identity Gate",topic:"c-iam",color:"#7A4BC4",icon:"⚿",blurb:"Give the right people the right access — and nothing more."},
 {id:"threat",name:"Threat Arcade",topic:"c-threats",color:"#C2410C",icon:"⚠",blurb:"Spot phishing and rebuild how an attack unfolds."},
 {id:"crypto",name:"Crypto Vault",topic:"c-crypto",color:"#0E7490",icon:"⚷",blurb:"Hashes, ciphers and labelling data by sensitivity."},
 {id:"ir",name:"Incident HQ",topic:"c-ir",color:"#A2620A",icon:"⏱",blurb:"Beat the 6-hour clock and hunt an attacker through logs."},
 {id:"cloud",name:"Cloud Port",topic:"c-cloud",color:"#2563EB",icon:"☁",blurb:"Who secures what in the cloud — then fix a risky console."}
];

/* ---------- Terminal file system ---------- */
const AUTHLOG = [
 "Oct 25 01:58:12 rpt sshd[701]: Accepted publickey for analyst from 10.0.4.12 port 40110",
 "Oct 25 02:03:44 rpt sshd[733]: Failed password for root from 198.51.100.23 port 51002",
 "Oct 25 02:03:47 rpt sshd[733]: Failed password for root from 198.51.100.23 port 51004",
 "Oct 25 02:03:50 rpt sshd[733]: Failed password for admin from 198.51.100.23 port 51006",
 "Oct 25 02:04:02 rpt sshd[740]: Failed password for analyst from 192.0.2.10 port 33100",
 "Oct 25 02:04:05 rpt sshd[733]: Failed password for oracle from 198.51.100.23 port 51010",
 "Oct 25 02:04:09 rpt sshd[733]: Failed password for test from 198.51.100.23 port 51012",
 "Oct 25 02:04:13 rpt sshd[733]: Failed password for deploy from 198.51.100.23 port 51015",
 "Oct 25 02:05:30 rpt sshd[741]: Failed password for analyst from 192.0.2.10 port 33102",
 "Oct 25 02:05:41 rpt sshd[742]: Accepted password for analyst from 192.0.2.10 port 33104",
 "Oct 25 08:31:02 rpt sudo: analyst : COMMAND=/usr/bin/apt update"
].join("\n");
function labFS(){
  const f = (content, perm="-rw-r--r--", owner="analyst") => ({type:"file", content, perm, owner});
  const d = (children, perm="drwxr-xr-x", owner="analyst") => ({type:"dir", children, perm, owner});
  return d({
    home: d({ analyst: d({
      "brief.txt": f("Welcome to Terminal Town, analyst.\nType 'mission' to see your goals and 'help' to see the commands you can use.\nTip: commands are lowercase. Press the up arrow to repeat the last command."),
      "notes.txt": f("Reporting server: rpt\nLogs live in /var/log\nAccounts live in /etc/passwd"),
      cases: d({ "case-101.txt": f("CASE 101 — Unusual logins on the reporting server overnight.\nCheck /var/log/auth.log.\nFind the IP address with the most failed passwords, then run:\n  submit <ip-address>"),
                 "case-102.txt": f("CASE 102 — Finance says salaries.csv may be readable by everyone.\nCheck /home/analyst/finance and fix the permissions so only the owner can read and write it.") }),
      finance: d({ "salaries.csv": f("name,salary\nA. Kumar,1450000\nB. Rao,1720000\nC. Shah,980000", "-rw-rw-rw-") })
    }, "drwxr-xr-x") }, "drwxr-xr-x", "root"),
    var: d({ log: d({ "auth.log": f(AUTHLOG, "-rw-r-----", "syslog") }, "drwxr-xr-x", "root") }, "drwxr-xr-x", "root"),
    etc: d({
      passwd: f("root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\nanalyst:x:1000:1000:Analyst:/home/analyst:/bin/bash\nbackup2:x:0:0::/home/backup2:/bin/bash\npriya:x:1001:1001:Priya:/home/priya:/bin/bash", "-rw-r--r--", "root"),
      ssh: d({ sshd_config: f("Port 22\nPermitRootLogin yes\nPasswordAuthentication yes\nX11Forwarding yes", "-rw-r--r--", "root") }, "drwxr-xr-x", "root")
    }, "drwxr-xr-x", "root")
  }, "drwxr-xr-x", "root");
}
const BASE_PROCS = [{pid:1,user:"root",cpu:"0.1",cmd:"/sbin/init"},{pid:612,user:"root",cpu:"0.3",cmd:"/usr/sbin/sshd -D"},{pid:880,user:"analyst",cpu:"0.4",cmd:"-bash"},{pid:1203,user:"syslog",cpu:"0.2",cmd:"/usr/sbin/rsyslogd"},{pid:4242,user:"www-data",cpu:"97.8",cmd:"./xmrig --pool stratum+tcp://mine.example:3333"}];

const MISSIONS = [
 {id:"t1",zone:"term",title:"First login",type:"terminal",story:"It's your first day on the security team. You've just logged into a Linux server. Find out who you are, where you are and what's here.",
  learn:"A terminal is a text window for giving the computer commands. whoami prints your username. pwd ('print working directory') shows the folder you're in. ls lists what's in it.",
  goals:[["Find out which user you are (whoami)",(s,c)=>c[0]==="whoami"],["Show which folder you're in (pwd)",(s,c)=>c[0]==="pwd"],["List what's in this folder (ls)",(s,c)=>c[0]==="ls"]],
  hints:["Type whoami and press Enter.","Then type pwd, then ls."]},
 {id:"t2",zone:"term",title:"Open the case file",type:"terminal",story:"Your manager left a case for you in the 'cases' folder.",
  learn:"cd moves you into a folder (cd cases). cd .. goes up one level. cat prints a file's contents. Paths starting with / start from the very top of the system.",
  goals:[["Move into the cases folder",(s)=>s.cwd==="/home/analyst/cases"],["Read case-101.txt",(s,c)=>c[0]==="cat"&&c.join(" ").includes("case-101.txt")]],
  hints:["Type cd cases","Then cat case-101.txt"]},
 {id:"t3",zone:"term",title:"Brute-force hunt",type:"terminal",story:"Case 101: someone tried lots of passwords overnight. Find the attacker's IP address in the login log.",
  learn:"grep finds lines containing a word: grep \"Failed password\" /var/log/auth.log. Add -c to count matches. A pipe (|) passes output to another command: grep \"Failed\" /var/log/auth.log | grep 198.51 | wc -l.",
  goals:[["Search auth.log for failed passwords with grep",(s,c,line)=>/grep/.test(line)&&/auth\.log/.test(line)&&/fail/i.test(line)],["Submit the IP with the most failures (submit <ip>)",(s)=>s.submitted.includes("198.51.100.23")]],
  hints:["Run: grep \"Failed password\" /var/log/auth.log","Count lines per IP. Which IP appears most? Then: submit 198.51.100.23 (if that's what you found)."]},
 {id:"t4",zone:"term",title:"Lock the salaries file",type:"terminal",story:"Case 102: finance's salary file may be readable by everyone on the server.",
  learn:"ls -l shows permissions like -rw-rw-rw-: three groups (owner, group, everyone) of read (r), write (w), execute (x). chmod 600 file sets owner read+write only (6 = r+w, 0 = nothing).",
  goals:[["Check the permissions with ls -l",(s,c)=>c[0]==="ls"&&c.includes("-l")],["Make salaries.csv readable and writable by its owner only",(s)=>labNode(s,"/home/analyst/finance/salaries.csv").perm==="-rw-------"]],
  hints:["Run: ls -l /home/analyst/finance","Run: chmod 600 /home/analyst/finance/salaries.csv"]},
 {id:"t5",zone:"term",title:"Stop the crypto-miner",type:"terminal",story:"The server is running slowly. Something is eating the CPU.",
  learn:"ps lists running programs with their process ID (PID) and CPU use. kill <PID> stops one. Unknown programs at ~100% CPU, especially ones talking to a 'pool', are often crypto-mining malware.",
  goals:[["List running processes (ps)",(s,c)=>c[0]==="ps"],["Stop the suspicious process (kill <PID>)",(s)=>!s.procs.some(p=>p.pid===4242)]],
  hints:["Run: ps aux","Find the process using ~98% CPU and run kill with its PID."]},
 {id:"t6",zone:"term",title:"Find the hidden admin",type:"terminal",story:"After an incident, someone may have created a secret administrator account.",
  learn:"/etc/passwd lists accounts as name:x:UID:GID:… The third field is the user ID. UID 0 means root-level power, whatever the account is called.",
  goals:[["Read the accounts file",(s,c)=>c[0]==="cat"&&c.join(" ").includes("passwd")],["Submit the name of the non-root account with UID 0",(s)=>s.submitted.includes("backup2")]],
  hints:["Run: cat /etc/passwd","Look for a line with :0:0: that isn't root, then submit its name."]},

 {id:"n1",zone:"net",title:"Wire the office",type:"wire",story:"Connect a small office so both laptops and the file server can reach the internet — but only through the firewall.",
  learn:"A switch connects devices inside the office. A firewall checks traffic between inside and outside against rules. A router connects the office to the internet provider. Click one device, then another, to add or remove a cable.",
  hints:["Laptops and the server plug into the switch.","Switch → firewall → router → internet."]},
 {id:"n2",zone:"net",title:"Ports are doors",type:"classify",story:"Every network service listens on a numbered port. Match each service to its usual port.",
  learn:"If an IP address is a building's street address, a port is the door number. Firewalls open or close specific doors. Admin doors (22, 3389) should never face the whole internet.",
  options:["22","23","25","53","80","443","3389","5432"],
  items:[["HTTPS (secure websites)","443","Encrypted web traffic."],["SSH (secure admin login to Linux)","22","Admin access — restrict to VPN."],["DNS (name lookups)","53","Turns names into IP addresses."],["SMTP (sending email)","25","Mail servers talk to each other here."],["RDP (Windows remote desktop)","3389","A favourite ransomware entry point if exposed."],["HTTP (unencrypted web)","80","Should redirect to HTTPS."],["Telnet (old, unencrypted login)","23","Sends passwords in clear text — disable it."],["PostgreSQL database","5432","Should only be reachable from app servers."]],
  hints:["Secure web is 443; plain web is 80.","Admin logins: SSH 22 (Linux), RDP 3389 (Windows)."]},
 {id:"n3",zone:"net",title:"Be the firewall",type:"classify",story:"Policy: allow HTTPS (443) from anyone to the web server; allow SSH (22) only from the office VPN 10.8.0.0/24; allow the app server (10.0.2.5) to reach the database on 5432; block everything else.",
  learn:"Firewalls check each connection against rules, top to bottom. 'Least access' means allowing only what the business needs, from only where it's needed.",
  options:["Allow","Block"],
  items:[["45.33.12.9 → web server : 443","Allow","HTTPS from anyone to the web server is allowed."],["45.33.12.9 → web server : 22","Block","SSH only from the VPN range."],["10.8.0.14 (VPN) → web server : 22","Allow","SSH from the VPN is allowed."],["203.0.113.5 → database : 5432","Block","The database must never accept internet traffic."],["10.0.2.5 (app server) → database : 5432","Allow","The app server may reach the database."],["91.200.3.3 → web server : 3389","Block","RDP isn't in the policy."],["10.8.0.14 (VPN) → database : 5432","Block","Only the app server may reach the database."],["185.10.1.1 → web server : 23","Block","Telnet isn't allowed."]],
  hints:["Read the policy line by line; anything not listed is blocked.","Even VPN users can't reach the database directly."]},
 {id:"n4",zone:"net",title:"DNS detective",type:"classify",story:"Attackers register look-alike domains so DNS sends you to their server. Which are the real ones?",
  learn:"DNS turns names into addresses. Read domains right to left: the part just before .com/.in decides who owns it. 'google.com.verify-account.info' belongs to verify-account.info, not Google.",
  options:["Legit","Look-alike"],
  items:[["hdfcbank.com","Legit","The bank's real domain."],["hdfcbank-secure-login.com","Look-alike","Extra words make a different domain."],["accounts.google.com","Legit","A subdomain of google.com."],["google.com.verify-account.info","Look-alike","The real owner is verify-account.info."],["paypa1.com","Look-alike","The number 1 replaces the letter l."],["onlinesbi.sbi","Legit","SBI's official net-banking domain."],["icici-bank.co","Look-alike","Different domain and ending from the real one."],["microsoft.com","Legit","The real domain."]],
  hints:["Find the last two parts before any '/' — that's the owner.","Look for swapped letters and numbers."]},

 {id:"i1",zone:"id",title:"Least privilege",type:"matrix",story:"Give each person only the access their job needs. Everyone already has email.",
  learn:"Least privilege means access is granted for job needs only. Too much access turns one phished account into a company-wide breach.",
  roles:[["Support Agent","Answers client tickets and needs to see the client's account details"],["Accountant","Runs monthly payroll"],["Developer","Writes code and tests with fake data"],["HR Manager","Manages employee records"],["Marketing Intern","Sends the newsletter"]],
  systems:["Ticketing","Customer DB","Payroll","HR system","Source code","Marketing tool"],
  target:{"Support Agent":["Ticketing","Customer DB"],"Accountant":["Payroll"],"Developer":["Source code"],"HR Manager":["HR system"],"Marketing Intern":["Marketing tool"]},
  hints:["Developers test with fake data — do they need the Customer DB?","Read each job description and tick only what it mentions."]},
 {id:"i2",zone:"id",title:"Password lab",type:"classify",story:"Which of these passwords would survive a real attack?",
  learn:"Attackers try leaked password lists and common patterns first (names, years, 'Password@123'). Length beats complexity: a long passphrase of random words is strong. MFA protects you even when a password leaks.",
  options:["Weak","Strong"],
  items:[["Password@123","Weak","Top of every leaked-password list."],["Jyoti1999","Weak","Name + year is guessed quickly."],["Qw3rty!","Weak","Short keyboard pattern."],["mango-river-ledger-cloud-82","Strong","Long random passphrase."],["admin","Weak","Default and trivial."],["Kite!Ferry*Basil#Orbit","Strong","Long, random, unrelated words."]],
  hints:["Count the characters: under 12 is usually weak.","Anything with a name, a year or a keyboard pattern is weak."]},

 {id:"th1",zone:"threat",title:"Phish or legit?",type:"classify",story:"These landed in the finance team's inbox. Decide what each one is.",
  learn:"Red flags: look-alike sender domains, urgency, secrecy, requests for passwords, gift cards or bank changes, links that don't match the company. When unsure, verify through a channel you already trust.",
  options:["Phishing","Legit","Verify first"],
  items:[["From hr@kavach-it-hr.com: 'Accept your revised salary by 5pm — log in here'","Phishing","Look-alike domain + credential request + urgency."],["From ceo.kavach@gmail.com: 'Buy 10 gift cards, keep it confidential'","Phishing","Executive on Gmail, gift cards, secrecy: CEO fraud."],["From noreply@github.com: 'New sign-in to your account from Chrome on Windows' (you just logged in)","Legit","Expected notification matching your action."],["From accounts@yourvendor.com (real domain): 'We've changed our bank account, please update'","Verify first","Real-looking, but bank changes must be confirmed by phone on a known number."],["From it-support@kavach-it.com (real domain): 'Mandatory MFA enrolment this week' with link to your company's usual SSO page","Legit","Expected internal campaign using the real SSO domain."],["From DHL-Delivery <dhl@track-parcel-in.info>: 'Pay ₹49 customs fee'","Phishing","Fake domain and payment request."]],
  hints:["Check the part after @ carefully.","Bank detail changes always need an independent callback."]},
 {id:"th2",zone:"threat",title:"Rebuild the attack",type:"order",story:"Put the steps of a typical ransomware attack in the order they happen.",
  learn:"Attacks follow a chain. Each link is a place to stop them: training stops the click, MFA stops the login, least privilege slows escalation, segmentation stops spreading, monitoring spots the data theft, and backups beat the ransom.",
  items:["Phishing email arrives","Employee enters password on a fake page","Attacker logs in (no MFA)","Attacker gains admin rights","Attacker spreads to other systems","Data is copied out","Files are encrypted and a ransom is demanded"],
  hints:["It starts with the email and ends with the ransom.","Attackers steal data BEFORE encrypting, so they can threaten to leak it."]},

 {id:"cr1",zone:"crypto",title:"Which file was tampered with?",type:"hash",story:"Three contracts were stored with their SHA-256 fingerprints last month. One file has since been changed. Find it.",
  learn:"A hash is a fingerprint of data. Change one character and the hash changes completely. Comparing hashes proves whether a file is unchanged (integrity). It is one-way: you can't get the file back from the hash.",
  files:[["vendor-dpa.txt","Breach notice: within 24 hours.","Breach notice: within 24 hours."],["payroll-sla.txt","Fee: Rs 1,20,000 per month.","Fee: Rs 1,90,000 per month."],["nda.txt","Term: 3 years from signing.","Term: 3 years from signing."]],
  answer:"payroll-sla.txt",
  hints:["Click 'Hash it' on each file and compare with the stored fingerprint.","Look at the first few characters — a mismatch shows immediately."]},
 {id:"cr2",zone:"crypto",title:"Crack the Caesar cipher",type:"cipher",story:"An old internal tool 'encrypts' messages by shifting letters. Recover the message.",
  learn:"A Caesar cipher shifts every letter by the same number. There are only 25 possible keys, so anyone can try them all in seconds. Modern encryption (AES) has so many possible keys that trying them all is impossible.",
  plain:"PATCH THE SERVERS ON FRIDAY", shift:7,
  hints:["Move the slider until the text becomes readable English.","The key is between 5 and 10."]},
 {id:"cr3",zone:"crypto",title:"Label the data",type:"classify",story:"Label each item so staff know how to handle it.",
  learn:"Classification labels tell people how carefully to handle data. Restricted = severe harm if leaked; Public = no harm.",
  options:["Public","Internal","Confidential","Restricted"],
  items:[["Press release on the website","Public","Already public."],["Internal org chart","Internal","Staff only, low harm."],["Customer PAN numbers","Restricted","Government ID; severe harm."],["Encryption keys for the customer database","Restricted","Unlock everything else."],["Employee salaries","Confidential","Harmful if leaked; not catastrophic."],["Source code","Confidential","Valuable and sensitive."],["Office cafeteria menu","Public","No harm."]],
  hints:["Keys and government IDs are always the top label.","Ask: how bad would it be if this leaked?"]},

 {id:"ir1",zone:"ir",title:"Beat the 6-hour clock",type:"sim",story:"Monday 09:00. PaySetu staff screens show a ransom note. You lead the response.",
  learn:"Incident response runs: prepare → detect → contain → eradicate → recover → lessons. Legal clocks start when you notice the incident: CERT-In 6 hours; DPDP Board intimation without delay with a detailed report in 72 hours.",
  steps:[["09:10","What do you do first?",[["Pay the ransom to restore systems quickly",0,"Paying doesn't guarantee recovery, may be illegal in some cases and funds criminals."],["Isolate affected servers from the network and preserve evidence",1,"Containment stops the spread; evidence is needed for investigation and reporting."],["Reboot every server to clear the infection",0,"Rebooting destroys evidence in memory and rarely removes ransomware."]]],
   ["09:40","Who do you bring in?",[["Post an update on social media",0,"Too early; facts aren't known."],["Activate the incident team: CISO, DPO, Legal, CEO",1,"Decisions on reporting and communication need these roles from the start."],["Wait until IT finishes investigating",0,"Regulatory clocks are already running."]]],
   ["11:00","Logs show 6 GB uploaded to an unknown IP before encryption. Now what?",[["It's ransomware, not a data breach — ignore it",0,"Data left the network: treat it as a personal data breach."],["Treat it as a personal data breach and start the DPDP assessment",1,"Exfiltration means personal data was likely compromised."],["Delete the logs to limit liability",0,"Destroying evidence is unlawful and makes everything worse."]]],
   ["13:30","When must CERT-In be told?",[["By 15:00 today — within 6 hours of noticing",1,"CERT-In's 2022 directions require reporting within 6 hours."],["After the investigation finishes next week",0,"Far too late."],["Ransomware doesn't need reporting",0,"Ransomware is a reportable incident type."]]],
   ["Tue 09:00","What do you tell customers?",[["A plain notice: what happened, what data, what to watch out for, who to contact",1,"Clear, factual and useful notices reduce harm."],["Nothing until the media asks",0,"Delays harm customers and break DPDP duties."],["'No data was taken'",0,"Never claim this before forensics confirm it — here it's false."]]],
   ["Wed","The detailed report to the Data Protection Board is due by…",[["Thursday 09:00 (72 hours after noticing)",1,"The DPDP Rules require a detailed report within 72 hours."],["Next Monday",0,"Too late."],["It isn't needed if CERT-In was told",0,"They're separate duties."]]]],
  hints:["Contain first, then involve decision-makers.","Every clock starts at 09:00 Monday."]},
 {id:"ir2",zone:"ir",title:"Log hunt",type:"logs",story:"An alert fired overnight. Use the filters to find out what happened.",
  learn:"Investigators filter logs by user, event and IP to build a timeline. Look for logins from new places, unusual hours, privilege changes and large downloads.",
  rows:[["01:02","s.iyer","login_success","10.0.4.21","office"],["01:40","m.rao","login_failed","185.199.110.42","bad password"],["01:40","m.rao","login_failed","185.199.110.42","bad password"],["01:41","m.rao","login_failed","185.199.110.42","bad password"],["02:14","m.rao","login_success","185.199.110.42","new device"],["02:16","m.rao","mfa_disabled","185.199.110.42",""],["02:20","m.rao","role_change","185.199.110.42","added to Finance-Admins"],["02:31","m.rao","file_download","185.199.110.42","clients_2026.zip (2.1 GB)"],["02:45","m.rao","logout","185.199.110.42",""],["03:10","k.nair","login_success","10.0.4.33","office"],["08:55","m.rao","login_failed","49.36.22.18","account locked?"],["09:02","s.iyer","file_download","10.0.4.21","weekly_report.xlsx"],["09:10","a.das","login_success","10.0.4.40","office"],["09:12","a.das","file_download","10.0.4.40","policy.pdf"],["09:30","m.rao","password_reset","49.36.22.18","via helpdesk"]],
  questions:[["Which account was compromised?","m.rao"],["What is the attacker's IP address?","185.199.110.42"],["What time was the first malicious successful login? (hh:mm)","02:14"],["Which file was stolen?","clients_2026.zip"]],
  hints:["Filter by event 'login_failed' — who has many from one IP?","Follow that IP: what did it do after logging in?"]},

 {id:"cl1",zone:"cloud",title:"Who secures what?",type:"classify",story:"LedgerLeaf runs servers on AWS (IaaS). Decide who is responsible for each item.",
  learn:"Shared responsibility: the provider secures the cloud (buildings, hardware, hypervisor); the customer secures what's in the cloud (data, accounts, settings, operating systems on IaaS).",
  options:["Provider","Customer"],
  items:[["Data centre guards and CCTV","Provider","Physical security is the provider's."],["Patching the server's operating system (EC2)","Customer","On IaaS you manage the OS."],["Who can log in to the AWS console","Customer","Identities and access are always yours."],["The hypervisor that runs virtual machines","Provider","Underlying virtualisation is the provider's."],["Whether a storage bucket is public","Customer","Settings you control are yours."],["Replacing failed hard drives","Provider","Hardware is the provider's."],["Encrypting customer files","Customer","You decide how your data is protected."]],
  hints:["Could you change it from the console? Then it's yours.","Physical things belong to the provider."]},
 {id:"cl2",zone:"cloud",title:"Fix the risky console",type:"toggles",story:"A client audit is tomorrow. Fix the settings that put data at risk — but don't break the company website.",
  learn:"Most cloud breaches come from customer misconfigurations: public storage, no MFA on the root account, logging off, databases open to the internet, too much access.",
  toggles:[["root-mfa","Root account MFA",false,true,"Root has unlimited power; MFA is essential."],["kyc-public","Bucket 'kyc-scans' — public access",true,false,"Customer ID scans must never be public."],["kyc-enc","Bucket 'kyc-scans' — encryption at rest",false,true,"Encrypt sensitive data at rest."],["web-public","Bucket 'website-assets' — public access",true,true,"This bucket serves the public website — it should stay public."],["trail","CloudTrail logging (all regions)",false,true,"Without logs you can't investigate."],["db-open","Security group 'prod-db' — port 5432 open to internet",true,false,"Databases must only accept app-server traffic."],["intern-admin","IAM user 'intern1' — AdministratorAccess",true,false,"An intern doesn't need admin rights."]],
  hints:["Public isn't always wrong — what is website-assets for?","Turn on protections, turn off exposure."]}
];
const MISSION = Object.fromEntries(MISSIONS.map(m => [m.id, m]));

/* ---------- state & scoring ---------- */
function labState(id){ const all = (S.progress.lab ||= {}); return (all[id] ||= {done:false, stars:0, tries:0, hints:0}); }
function labGet(id){ return (S.progress.lab||{})[id] || {done:false, stars:0, tries:0, hints:0}; }
function zoneMissions(z){ return MISSIONS.filter(m => m.zone === z); }
function missionUnlocked(m){ const list = zoneMissions(m.zone), i = list.indexOf(m); return i === 0 || labGet(list[i-1].id).done; }
function labXP(){ return MISSIONS.reduce((a,m) => a + labGet(m.id).stars * 20, 0); }
function finishMission(m){
  const st = labState(m.id), stars = (st.tries === 0 && st.hints === 0) ? 3 : (st.tries <= 2 && st.hints <= 1) ? 2 : 1;
  st.worst = Math.max(st.worst||0, st.tries);
  const first = !st.done;
  st.done = true; st.stars = Math.max(st.stars, stars); if (first) logActivity(1); save("progress");
  const box = document.getElementById("labResult");
  const list = zoneMissions(m.zone), next = list[list.indexOf(m)+1];
  if (box) { box.hidden = false; box.innerHTML = `<div class="labwin"><div class="stars" aria-label="${stars} stars">${[1,2,3].map(i=>`<span class="${i<=stars?"on":""}">★</span>`).join("")}</div><b>Mission complete</b><span class="num">+${stars*20} XP · ${stars===3?"Perfect run":stars===2?"Nicely done":"Done — replay for 3 stars"}</span>
    <div class="row">${next?`<button class="btn" data-go="lab-${next.id}">Next: ${esc(next.title)} →</button>`:`<button class="btn" data-go="lab">Zone complete — back to the map</button>`}<button class="btn ghost" data-lreplay="${m.id}">Replay</button><button class="btn ghost" data-go="${ZONES.find(z=>z.id===m.zone).topic}">Read the topic</button></div></div>`; box.scrollIntoView({block:"center"}); }
}
function labFail(m, msg){ const st = labState(m.id); st.tries++; save("progress"); const f = document.getElementById("labFeedback"); if (f) { f.hidden = false; f.className = "note"; f.innerHTML = msg; } }
function labOk(msg){ const f = document.getElementById("labFeedback"); if (f) { f.hidden = false; f.className = "info"; f.innerHTML = msg; } }

/* ---------- hub ---------- */
const RANKS = [[0,"Recruit"],[300,"Analyst"],[700,"Defender"],[1200,"Guardian"],[1700,"Cyber Lead"]];
function rankFor(xp){ let r = RANKS[0]; RANKS.forEach(x => { if (xp >= x[0]) r = x; }); const i = RANKS.indexOf(r), nx = RANKS[i+1]; return {name:r[1], next:nx, pct: nx ? Math.round((xp-r[0])/(nx[0]-r[0])*100) : 100}; }
function zoneCard(z){ const ms = zoneMissions(z.id), zd = ms.filter(m=>labGet(m.id).done).length;
    return `<section class="card zone" style="--zc:${z.color}"><div class="row between"><div class="row"><span class="zicon">${esc(z.icon)}</span><div><h3>${esc(z.name)}</h3><span class="num">${zd}/${ms.length} · topic: ${esc(TOPIC[z.topic].title)}</span></div></div>${zd===ms.length?'<span class="pill ok">Badge earned</span>':''}</div>
      <p class="muted" style="font-size:.9rem">${esc(z.blurb)}</p>
      <div class="trail">${ms.map((m,i)=>{ const st = labGet(m.id), open = missionUnlocked(m);
        return `${i?'<span class="link-line" aria-hidden="true"></span>':''}<button class="mnode ${st.done?"done":""} ${open?"":"locked"}" ${open?`data-go="lab-${m.id}"`:"disabled"} aria-label="${esc(m.title)}${open?"":" (locked)"}"><span class="mn">${i+1}</span><span class="mt">${esc(m.title)}</span><span class="ms">${st.done?"★".repeat(st.stars)+"☆".repeat(3-st.stars):open?"Play":"🔒"}</span></button>`; }).join("")}</div></section>`; }
function viewLab(){
  const xp = labXP(), rk = rankFor(xp), done = MISSIONS.filter(m=>labGet(m.id).done).length;
  return `<div class="labhero card"><div class="row between"><div><span class="eyebrow">Cyber Lab</span><h2>Learn security by doing it</h2><p class="muted">${ZONES.length} zones, ${MISSIONS.length} missions. Type real commands, wire networks, write KQL queries, make the firewall's and the DPO's decisions, and beat the incident clock.</p></div>
    <div class="rankbox"><span class="num">Rank</span><b>${rk.name}</b>${bar(rk.pct,"acc")}<span class="num">${xp} XP${rk.next?` · ${rk.next[0]-xp} to ${rk.next[1]}`:""}</span></div></div>
    <div class="row"><span class="pill acc">${done}/${MISSIONS.length} missions</span><span class="pill">${MISSIONS.reduce((a,m)=>a+labGet(m.id).stars,0)}/${MISSIONS.length*3} stars</span>${ZONES.filter(z=>zoneMissions(z.id).every(m=>labGet(m.id).done)).map(z=>`<span class="pill ok">${esc(z.icon)} ${esc(z.name)} badge</span>`).join("")}</div></div>
  ${[["cyber","Security zones","Core cyber skills, from the command line to incident response."],["tools","Tool zones","Practise the platforms job posts name: Azure, AWS, Purview, Sentinel, compliance automation and vulnerability scanners."]].map(([g,h,sub])=>{ const zs = ZONES.filter(z=>(z.group||"cyber")===g); return `<div class="zgroup"><div><h3>${h}</h3><p class="muted" style="font-size:.9rem;margin:2px 0 0">${sub}</p></div><div class="zones">${zs.map(z=>zoneCard(z)).join("")}</div></div>`; }).join("")}`;
}

/* ---------- mission page ---------- */
let LRT = {}; // runtime state per mission view
function viewMission(m){
  const z = ZONES.find(x=>x.id===m.zone), st = labGet(m.id), list = zoneMissions(m.zone);
  if (!missionUnlocked(m)) return `<div class="card"><h3>Locked</h3><p>Finish the previous mission in ${esc(z.name)} first.</p><button class="btn" data-go="lab">Back to the map</button></div>`;
  LRT = {id:m.id};
  const run = labState(m.id); run.tries = 0; run.hints = 0;
  return `<div class="thead"><button class="link" data-go="lab">← Cyber Lab</button><span class="eyebrow" style="color:${z.color}">${esc(z.name)} · Mission ${list.indexOf(m)+1} of ${list.length}</span><h2>${esc(m.title)}</h2></div>
  <div class="mission">
    <aside class="card mbrief"><b>The situation</b><p>${esc(m.story)}</p><div class="concept"><b>Concept</b><p>${esc(m.learn)}</p></div>
      ${m.type==="terminal"?`<div><b>Goals</b><ul class="goals" id="goalList">${m.goals.map((g,i)=>`<li id="goal-${i}">${esc(g[0])}</li>`).join("")}</ul></div>`:""}
      <div class="row"><button class="btn ghost sm" data-lhint="${m.id}">Hint (costs a star)</button><span class="num">Best: ${st.done?"★".repeat(st.stars):"not completed"}</span></div><div id="labHint" class="inset" hidden></div></aside>
    <div class="card mplay">${m.pre?`<pre class="doc">${esc(m.pre)}</pre>`:""}${labPlay(m)}<div id="labFeedback" hidden></div><div id="labResult" hidden></div></div>
  </div>`;
}
function labPlay(m){
  switch (m.type) {
    case "terminal": LRT.term = {fs:labFS(), cwd:"/home/analyst", procs:JSON.parse(JSON.stringify(BASE_PROCS)), hist:[], hi:0, submitted:[], goals:m.goals.map(()=>false)};
      return `<div class="tty" id="tty" aria-label="Terminal"><div id="termOut" class="tout" aria-live="polite">Last login: Sun Oct 25 08:29 from 10.0.4.12\nType 'help' for commands, 'mission' for your goals.\n</div><div class="tin"><span id="termPrompt">${labPrompt()}</span><input id="termIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></div></div><p class="num">Click inside the terminal and type. Up arrow repeats commands.</p>`;
    case "wire": LRT.links = new Set(); LRT.sel = null; return `<div id="wireBox">${wireSVG()}</div><div class="row"><button class="btn" data-lcheck="${m.id}">Check my network</button><button class="btn ghost" data-lreset="${m.id}">Clear cables</button></div>`;
    case "classify": LRT.ans = {}; return `<div class="cls">${m.items.map((it,i)=>`<div class="clsrow" id="cls-${i}"><div class="clsq">${esc(it[0])}</div><div class="seg" role="group" aria-label="${esc(it[0])}">${m.options.map(o=>`<button aria-pressed="false" data-lpick="${i}|${esc(o)}">${esc(o)}</button>`).join("")}</div><div class="clsw num" id="clsw-${i}"></div></div>`).join("")}</div><div class="row"><button class="btn" data-lcheck="${m.id}">Check answers</button></div>`;
    case "order": LRT.order = labShuffle(m.items.slice()); return `<div id="orderBox">${orderHTML()}</div><div class="row"><button class="btn" data-lcheck="${m.id}">Check order</button></div>`;
    case "matrix": LRT.mx = {}; return `<div class="tbl"><table class="mx"><thead><tr><th>Role</th>${m.systems.map(s=>`<th>${esc(s)}</th>`).join("")}</tr></thead><tbody>${m.roles.map(([r,d],ri)=>`<tr><th style="text-transform:none;font-size:.88rem;color:var(--ink)">${esc(r)}<div class="num" style="text-transform:none;letter-spacing:0">${esc(d)}</div></th>${m.systems.map((s,si)=>`<td><input type="checkbox" id="mx-${ri}-${si}" data-lmx="${ri}|${si}" aria-label="${esc(r)} access to ${esc(s)}"></td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="row"><button class="btn" data-lcheck="${m.id}">Check access</button></div>`;
    case "hash": LRT.hashed = {}; return `<div class="files">${m.files.map(([n,orig,cur],i)=>`<div class="inset fileh"><div class="row between"><b>${esc(n)}</b><button class="btn sm ghost" data-lhash="${i}">Hash it</button></div><code class="mono">${esc(cur)}</code><div class="num">Stored fingerprint: <span class="hx" id="hs-${i}">…</span></div><div class="num">Current fingerprint: <span class="hx" id="hc-${i}">— click Hash it —</span></div><label class="learned" style="color:var(--ink)"><input type="radio" name="tamper" id="tp-${i}" value="${esc(n)}"> This one was changed</label></div>`).join("")}</div>
      <div class="inset"><b>Try it yourself</b><input type="text" id="hashFree" placeholder="Type anything…" value="GRC"><div class="num hx" id="hashFreeOut"></div></div><div class="row"><button class="btn" data-lcheck="${m.id}">Submit answer</button></div>`;
    case "cipher": return `<div class="inset"><span class="num">Intercepted message</span><div class="cipher">${esc(caesar(m.plain, m.shift))}</div><label class="f">Shift back by <span id="shv">0</span><input type="range" id="shift" min="0" max="25" value="0"></label><span class="num">Decoded</span><div class="cipher" id="decoded">${esc(caesar(m.plain, m.shift))}</div></div><label class="f">Type the decoded message<input type="text" id="cipherAns" autocomplete="off"></label><div class="row"><button class="btn" data-lcheck="${m.id}">Check</button></div>`;
    case "sim": LRT.step = 0; LRT.wrong = 0; return `<div id="simBox">${simHTML(m)}</div>`;
    case "kql": return `<div class="kql"><div class="row"><span class="num">Tables:</span>${Object.entries(KQLDB).map(([n,t])=>`<button class="chip" data-lkqlins="${esc(n)}" title="${esc(t.cols.join(", "))}">${esc(n)}</button>`).join("")}</div>
      <details class="inset"><summary class="link" style="cursor:pointer">Columns and cheat sheet</summary>${Object.entries(KQLDB).map(([n,t])=>`<p class="num" style="margin:6px 0"><b>${esc(n)}</b>: ${esc(t.cols.join(", "))}</p>`).join("")}<pre class="doc" style="margin-top:6px">${esc(KQL_CHEAT)}</pre></details>
      <textarea id="kqlIn" class="kqlin" spellcheck="false" autocapitalize="off" aria-label="KQL query">${esc(m.starter||"SigninLogs\n| take 10")}</textarea>
      <div class="row"><button class="btn" data-lkqlrun="1">Run query ▶</button><span class="num">Ctrl/⌘ + Enter also runs</span>${(m.examples||[]).map((x,i)=>`<button class="chip" data-lkqlex="${i}">Try: ${esc(x[0])}</button>`).join("")}</div>
      <div id="kqlOut" class="tbl kqlout"><p class="muted" style="padding:8px">Results appear here.</p></div></div>
      <div class="form">${m.questions.map(([q],i)=>`<label class="f">${esc(q)}<input type="text" id="lq-${i}" autocomplete="off"></label>`).join("")}</div><div class="row"><button class="btn" data-lcheck="${m.id}">Submit findings</button></div>`;
    case "logs": return `<div class="row"><select id="lgUser" aria-label="User"><option value="">All users</option>${[...new Set(m.rows.map(r=>r[1]))].map(u=>`<option>${esc(u)}</option>`).join("")}</select><select id="lgEvt" aria-label="Event"><option value="">All events</option>${[...new Set(m.rows.map(r=>r[2]))].map(u=>`<option>${esc(u)}</option>`).join("")}</select><input type="search" id="lgQ" placeholder="Search IP or detail" style="max-width:220px"></div><div class="tbl" id="lgTable">${logsTable(m)}</div>
      <div class="form">${m.questions.map(([q],i)=>`<label class="f">${esc(q)}<input type="text" id="lq-${i}" autocomplete="off"></label>`).join("")}</div><div class="row"><button class="btn" data-lcheck="${m.id}">Submit findings</button></div>`;
    case "toggles": LRT.tg = Object.fromEntries(m.toggles.map(t=>[t[0], t[2]])); return `<div class="console"><div class="ctop">☁ Cloud console · account ledgerleaf-prod</div>${m.toggles.map(t=>`<div class="crow"><span>${esc(t[1])}</span><button class="switch ${t[2]?"on":""}" role="switch" aria-checked="${t[2]}" id="tg-${t[0]}" data-ltg="${t[0]}"><span></span></button></div>`).join("")}</div><div class="row"><button class="btn" data-lcheck="${m.id}">Run compliance scan</button></div>`;
  }
  return "";
}

/* ---------- terminal engine ---------- */
function labPrompt(){ const t = LRT.term; return `analyst@rpt:${t ? t.cwd.replace("/home/analyst","~") : "~"}$`; }
function labResolve(path){ const t = LRT.term; if (!path || path === "~") return "/home/analyst"; if (path.startsWith("~/")) path = "/home/analyst/" + path.slice(2); const parts = (path.startsWith("/") ? path : t.cwd + "/" + path).split("/"); const out = []; parts.forEach(p => { if (!p || p === ".") return; if (p === "..") out.pop(); else out.push(p); }); return "/" + out.join("/"); }
function labNode(st, abs){ let n = st.fs; for (const p of abs.split("/").filter(Boolean)) { if (!n || n.type !== "dir" || !n.children[p]) return null; n = n.children[p]; } return n; }
function permFrom(num, isDir){ const map = ["---","--x","-w-","-wx","r--","r-x","rw-","rwx"]; return (isDir?"d":"-") + String(num).split("").map(d=>map[+d]).join(""); }
function tokenize(s){ const out = []; let cur = "", q = null; for (const ch of s) { if (q) { if (ch === q) q = null; else cur += ch; } else if (ch === '"' || ch === "'") q = ch; else if (/\s/.test(ch)) { if (cur) { out.push(cur); cur = ""; } } else cur += ch; } if (cur) out.push(cur); return out; }
function labRun(line){
  const t = LRT.term, m = MISSION[LRT.id];
  const segs = line.split("|").map(s => s.trim()).filter(Boolean);
  let input = null, out = "";
  for (const seg of segs) { const r = labCmd(tokenize(seg), input); out = r; input = r; if (r && r.__err) { out = r.__err; break; } }
  // goal checks use the first command
  const first = tokenize(segs[0]||"");
  m.goals.forEach((g,i) => { if (!t.goals[i] && g[1](t, first, line)) { t.goals[i] = true; const li = document.getElementById("goal-"+i); if (li) li.classList.add("met"); } });
  if (t.goals.every(Boolean) && !t.complete) { t.complete = true; setTimeout(() => finishMission(m), 300); }
  return typeof out === "string" ? out : "";
}
function labCmd(a, stdin){
  const t = LRT.term, cmd = a[0], args = a.slice(1), flags = args.filter(x=>/^-/.test(x)), pos = args.filter(x=>!/^-/.test(x));
  const readFile = (p) => { const abs = labResolve(p), n = labNode(t, abs); if (!n) return {__err:`${cmd}: ${p}: No such file or directory`}; if (n.type === "dir") return {__err:`${cmd}: ${p}: Is a directory`}; if (n.perm[7] !== "r" && n.owner !== "analyst" && !(abs === "/var/log/auth.log")) return {__err:`${cmd}: ${p}: Permission denied`}; return n.content; };
  const text = (p) => p ? readFile(p) : (stdin ?? "");
  switch (cmd) {
    case "help": return "Commands: whoami, pwd, ls [-l] [path], cd <dir>, cat <file>, head/tail [-n N] <file>, grep [-c] [-i] [-v] \"text\" [file], wc -l, sort, uniq -c, chmod <NNN> <file>, ps [aux], kill <pid>, find <path> -name <text>, echo, history, clear, mission, hint, submit <answer>\nPipes work: grep \"Failed\" /var/log/auth.log | wc -l";
    case "mission": return MISSION[LRT.id].goals.map((g,i)=>`${t.goals[i]?"[x]":"[ ]"} ${g[0]}`).join("\n");
    case "hint": labHint(LRT.id); return "Hint shown on the left (costs a star).";
    case "whoami": return "analyst";
    case "pwd": return t.cwd;
    case "echo": return pos.join(" ");
    case "history": return t.hist.map((h,i)=>`${i+1}  ${h}`).join("\n");
    case "clear": document.getElementById("termOut").textContent = ""; return "";
    case "sudo": return "analyst is not in the sudoers file. This incident will be reported. (Good instinct to check, though.)";
    case "cd": { const abs = labResolve(pos[0]||"~"), n = labNode(t, abs); if (!n) return {__err:`cd: ${pos[0]}: No such file or directory`}; if (n.type !== "dir") return {__err:`cd: ${pos[0]}: Not a directory`}; t.cwd = abs; document.getElementById("termPrompt").textContent = labPrompt(); return ""; }
    case "ls": { const abs = labResolve(pos[0]||"."), n = labNode(t, abs); if (!n) return {__err:`ls: cannot access '${pos[0]}': No such file or directory`}; const long = flags.some(f=>f.includes("l"));
      if (n.type === "file") return long ? `${n.perm} 1 ${n.owner} ${n.owner} ${String(n.content.length).padStart(5)} ${pos[0]}` : pos[0];
      const names = Object.keys(n.children).sort(); return long ? names.map(k=>{ const c=n.children[k]; return `${c.perm} 1 ${c.owner.padEnd(7)} ${c.owner.padEnd(7)} ${String(c.type==="dir"?4096:c.content.length).padStart(5)} ${k}${c.type==="dir"?"/":""}`; }).join("\n") : names.map(k=>n.children[k].type==="dir"?k+"/":k).join("  "); }
    case "cat": { if (!pos.length) return stdin ?? ""; return pos.map(p=>{ const r = readFile(p); return typeof r === "string" ? r : r.__err; }).join("\n"); }
    case "head": case "tail": { const ni = args.indexOf("-n"), n = ni>=0 ? +args[ni+1] : 10, file = pos.filter(x=>x!==String(n))[0]; const r = text(file); if (typeof r !== "string") return r; const L = r.split("\n"); return (cmd==="head"?L.slice(0,n):L.slice(-n)).join("\n"); }
    case "grep": { if (!pos.length) return {__err:"usage: grep [-c] [-i] [-v] \"text\" [file]"}; const pat = pos[0], r = text(pos[1]); if (typeof r !== "string") return r; const ci = flags.some(f=>f.includes("i")), inv = flags.some(f=>f.includes("v")); const hit = r.split("\n").filter(l => { const has = ci ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat); return inv ? !has : has; }); return flags.some(f=>f.includes("c")) ? String(hit.length) : hit.join("\n"); }
    case "wc": { const r = text(pos[0]); if (typeof r !== "string") return r; return String(r ? r.split("\n").filter(x=>x.length).length : 0); }
    case "sort": { const r = text(pos[0]); return typeof r === "string" ? r.split("\n").sort().join("\n") : r; }
    case "uniq": { const r = text(pos[0]); if (typeof r !== "string") return r; const L = r.split("\n"), out = []; L.forEach(l => { const last = out[out.length-1]; if (last && last.l === l) last.c++; else out.push({l, c:1}); }); return flags.some(f=>f.includes("c")) ? out.map(o=>`${String(o.c).padStart(7)} ${o.l}`).join("\n") : out.map(o=>o.l).join("\n"); }
    case "chmod": { if (pos.length < 2 || !/^[0-7]{3}$/.test(pos[0])) return {__err:"chmod: use a 3-digit number, e.g. chmod 600 file"}; const abs = labResolve(pos[1]), n = labNode(t, abs); if (!n) return {__err:`chmod: cannot access '${pos[1]}': No such file or directory`}; if (n.owner !== "analyst") return {__err:`chmod: changing permissions of '${pos[1]}': Operation not permitted`}; n.perm = permFrom(pos[0], n.type==="dir"); return ""; }
    case "ps": return "USER       PID  %CPU COMMAND\n" + t.procs.map(p=>`${p.user.padEnd(9)} ${String(p.pid).padStart(5)} ${p.cpu.padStart(5)} ${p.cmd}`).join("\n");
    case "kill": { const pid = +pos[0]; const p = t.procs.find(x=>x.pid===pid); if (!p) return {__err:`kill: (${pos[0]}) - No such process`}; if (pid === 1 || pid === 612) return {__err:`kill: (${pid}) - Operation not permitted (that's a system process you need!)`}; t.procs = t.procs.filter(x=>x.pid!==pid); return `Process ${pid} stopped.`; }
    case "find": { const start = labResolve(pos[0]||"."), ni = args.indexOf("-name"), pat = ni>=0 ? (args[ni+1]||"").replace(/\*/g,"") : ""; const out = []; (function walk(n, p){ if (n.type === "dir") Object.entries(n.children).forEach(([k,c]) => { const cp = (p==="/"?"":p)+"/"+k; if (!pat || k.includes(pat)) out.push(cp); walk(c, cp); }); })(labNode(t,start)||{type:"file"}, start); return out.join("\n"); }
    case "submit": { const ans = pos.join(" ").trim(); if (!ans) return {__err:"usage: submit <answer>"}; t.submitted.push(ans); const ok = MISSION[LRT.id].goals.some(g=>g[1]({...t, submitted:[ans]}, ["submit"], "submit")); if (!ok) { labState(LRT.id).tries++; save("progress"); return `Submitted '${ans}'. That's not it — look again.`; } return `Submitted '${ans}'. Correct!`; }
    default: return cmd ? {__err:`${cmd}: command not found (type 'help')`} : "";
  }
}

/* ---------- wire engine ---------- */
const WNODES = {lap1:["Laptop A",70,60],lap2:["Laptop B",70,200],srv:["File server",70,330],sw:["Switch",250,200],fw:["Firewall",420,200],rt:["Router",580,200],net:["Internet",720,200]};
function wireSVG(){
  const links = LRT.links || new Set();
  let s = `<svg class="wire" viewBox="0 0 800 400" role="img" aria-label="Network diagram">`;
  links.forEach(k => { const [a,b] = k.split("~"), A = WNODES[a], B = WNODES[b]; s += `<line x1="${A[1]}" y1="${A[2]}" x2="${B[1]}" y2="${B[2]}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>`; });
  if (LRT.wireOk) { s += `<circle r="9" fill="var(--seal)"><animateMotion dur="2.4s" repeatCount="indefinite" path="M70,60 L250,200 L420,200 L580,200 L720,200"/></circle>`; }
  Object.entries(WNODES).forEach(([id,[label,x,y]]) => { const sel = LRT.sel === id;
    s += `<g class="wn" data-lnode="${id}" tabindex="0" role="button" aria-label="${label}${sel?" (selected)":""}"><rect x="${x-58}" y="${y-26}" width="116" height="52" rx="14" fill="${sel?"var(--accent-soft)":"var(--glass-strong)"}" stroke="${sel?"var(--accent)":"var(--line)"}" stroke-width="${sel?3:1.5}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="14" font-weight="600" fill="var(--ink)" font-family="-apple-system,system-ui,sans-serif">${label}</text></g>`; });
  return s + `</svg><p class="num">${LRT.sel?`Selected ${WNODES[LRT.sel][0]} — now click the device to connect it to (click a connected pair again to remove the cable).`:"Click a device, then another, to connect them."}</p>`;
}
function wireCheck(m){
  const L = LRT.links, adj = {}; Object.keys(WNODES).forEach(k=>adj[k]=[]); L.forEach(k=>{ const [a,b]=k.split("~"); adj[a].push(b); adj[b].push(a); });
  const reach = (from, to, skip) => { const seen = new Set([from]), q = [from]; while (q.length) { const n = q.shift(); if (n === to) return true; adj[n].forEach(x => { if (x !== skip && !seen.has(x)) { seen.add(x); q.push(x); } }); } return false; };
  const ends = ["lap1","lap2","srv"];
  if (ends.some(e => !reach(e, "net"))) return labFail(m, "Not every device can reach the internet yet. Follow the path from each laptop and the server.");
  if (ends.some(e => reach(e, "net", "fw"))) return labFail(m, "Traffic can reach the internet <b>without passing the firewall</b>. Remove the shortcut cable.");
  if (adj.net.length !== 1 || adj.net[0] !== "rt") return labFail(m, "Only the router should connect directly to the internet.");
  if (ends.some(e => !adj[e].includes("sw"))) return labFail(m, "Office devices should plug into the switch.");
  LRT.wireOk = true; document.getElementById("wireBox").innerHTML = wireSVG(); labOk("Every packet now passes the firewall. Watch the packet travel: laptop → switch → firewall → router → internet."); finishMission(m);
}

/* ---------- order / sim / logs / misc ---------- */
function labShuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function orderHTML(){ return `<ol class="order">${LRT.order.map((x,i)=>`<li class="inset"><span>${esc(x)}</span><span class="row"><button class="btn sm ghost" data-lup="${i}" aria-label="Move up" ${i===0?"disabled":""}>↑</button><button class="btn sm ghost" data-ldown="${i}" aria-label="Move down" ${i===LRT.order.length-1?"disabled":""}>↓</button></span></li>`).join("")}</ol>`; }
function caesar(s, k){ return s.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0)-65+k+26)%26+65)); }
function simHTML(m){
  if (LRT.step >= m.steps.length) return `<div class="info"><b>Response complete.</b> ${LRT.wrong===0?"Flawless — every decision was right.":`${LRT.wrong} wrong decision${LRT.wrong>1?"s":""} along the way. Replay for a clean run.`}</div>`;
  const [time, q, opts] = m.steps[LRT.step];
  return `<div class="clock"><span>⏱</span><b>${esc(time)}</b><span class="num">Step ${LRT.step+1} of ${m.steps.length}</span>${bar(Math.round(LRT.step/m.steps.length*100),"acc")}</div><h3>${esc(q)}</h3><div class="opts">${opts.map((o,i)=>`<button data-lsim="${i}">${esc(o[0])}</button>`).join("")}</div>`;
}
function logsTable(m){
  const u = (document.getElementById("lgUser")||{}).value||"", e = (document.getElementById("lgEvt")||{}).value||"", q = ((document.getElementById("lgQ")||{}).value||"").toLowerCase();
  const rows = m.rows.filter(r => (!u||r[1]===u) && (!e||r[2]===e) && (!q||r.join(" ").toLowerCase().includes(q)));
  return `<table><thead><tr><th>Time</th><th>User</th><th>Event</th><th>IP</th><th>Detail</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table><span class="num">${rows.length} of ${m.rows.length} rows</span>`;
}
async function sha256(t){ try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); } catch(e) { let h = 0; for (const c of t) h = (h*31 + c.charCodeAt(0))|0; return "fallback-" + (h>>>0).toString(16); } }
function labHint(id){ const m = MISSION[id], st = labState(id), box = document.getElementById("labHint"); const i = Math.min(st.hints, m.hints.length-1); st.hints++; save("progress"); if (box) { box.hidden = false; box.innerHTML = m.hints.slice(0, i+1).map((h,j)=>`<p><b>Hint ${j+1}:</b> ${esc(h)}</p>`).join(""); } }
function labAfterRender(){
  const m = MISSION[LRT.id]; if (!m) return;
  if (m.type === "hash") { m.files.forEach(([n,orig],i) => sha256(orig).then(h => { const el = document.getElementById("hs-"+i); if (el) el.textContent = h.slice(0,24)+"…"; })); const f = document.getElementById("hashFree"); if (f) sha256(f.value).then(h=>{ const o = document.getElementById("hashFreeOut"); if (o) o.textContent = h; }); }
  if (m.type === "terminal") { const i = document.getElementById("termIn"); if (i) i.focus({preventScroll:true}); }
}

/* ---------- checks ---------- */
function labCheck(id){
  const m = MISSION[id];
  if (m.type === "wire") return wireCheck(m);
  if (m.type === "classify") {
    let wrong = 0, missing = 0;
    m.items.forEach((it,i) => { const a = LRT.ans[i], row = document.getElementById("cls-"+i), w = document.getElementById("clsw-"+i);
      row.classList.remove("good","bad"); if (a === undefined) { missing++; w.textContent = "Choose an answer"; return; }
      if (a === it[1]) { row.classList.add("good"); w.textContent = "✓ " + it[2]; } else { wrong++; row.classList.add("bad"); w.textContent = "Not quite — think again."; } });
    if (missing) return labFail(m, `Answer all items first (${missing} left).`);
    if (wrong) return labFail(m, `${m.items.length-wrong} of ${m.items.length} right. Fix the red ones.`);
    labOk("All correct. Read the explanations — they're what interviews ask."); return finishMission(m);
  }
  if (m.type === "order") { const ok = LRT.order.every((x,i)=>x===m.items[i]); if (!ok) { const right = LRT.order.filter((x,i)=>x===m.items[i]).length; return labFail(m, `${right} of ${m.items.length} in the right place. Think about what an attacker needs before each step.`); } labOk("That's the chain. Each arrow is a place a control can break it."); return finishMission(m); }
  if (m.type === "matrix") {
    const extra = [], miss = [];
    m.roles.forEach(([r],ri) => m.systems.forEach((s,si) => { const on = document.getElementById(`mx-${ri}-${si}`).checked, need = (m.target[r]||[]).includes(s); if (on && !need) extra.push(`${r} → ${s}`); if (!on && need) miss.push(`${r} → ${s}`); }));
    if (extra.length || miss.length) return labFail(m, `${extra.length?`<b>Too much access:</b> ${esc(extra.join("; "))}. `:""}${miss.length?`<b>Missing:</b> ${esc(miss.join("; "))}.`:""}`);
    labOk("Least privilege achieved. One phished account now exposes one system, not six."); return finishMission(m);
  }
  if (m.type === "hash") { const pick = [...document.querySelectorAll('input[name="tamper"]')].find(x=>x.checked); if (!pick) return labFail(m, "Choose the file you think was changed."); if (pick.value !== m.answer) return labFail(m, "That file's fingerprint matches its stored one. Hash all three and compare."); labOk("Right — one changed number produced a completely different fingerprint. That's how integrity checks catch tampering."); return finishMission(m); }
  if (m.type === "cipher") { const v = (document.getElementById("cipherAns").value||"").toUpperCase().replace(/\s+/g," ").trim(); if (v !== m.plain) return labFail(m, "Not yet. Move the slider until the decoded line is plain English, then type it."); labOk(`Decoded with shift ${m.shift}. With only 25 keys, Caesar falls in seconds — that's why we use AES.`); return finishMission(m); }
  if (m.type === "logs" || m.type === "kql") { const bad = m.questions.filter(([,a],i) => { const v = (document.getElementById("lq-"+i).value||"").trim().toLowerCase(); return ![].concat(a).some(x => String(x).toLowerCase() === v); });
    if (m.type === "kql" && !bad.length) { labOk(esc(m.win||"All findings correct.")); return finishMission(m); } if (bad.length) return labFail(m, `${m.questions.length-bad.length} of ${m.questions.length} correct. Recheck: ${esc(bad.map(b=>b[0]).join(" · "))}`); labOk("Timeline reconstructed: brute force → login → MFA disabled → admin role → bulk download. Classic account takeover."); return finishMission(m); }
  if (m.type === "toggles") {
    const probs = m.toggles.filter(t => LRT.tg[t[0]] !== t[3]);
    if (probs.length) return labFail(m, `Scan found ${probs.length} issue${probs.length>1?"s":""}:<br>${probs.map(t=>`• ${esc(t[1])}: ${esc(t[4])}`).join("<br>")}`);
    labOk("Clean scan — and the website still works."); return finishMission(m);
  }
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-lcheck],[data-lpick],[data-lhint],[data-lreset],[data-lreplay],[data-lnode],[data-lup],[data-ldown],[data-lhash],[data-lsim],[data-ltg],.tty");
  if (!el) return; const d = el.dataset, m = MISSION[LRT.id];
  if (el.classList.contains("tty") && !d.lnode) { const i = document.getElementById("termIn"); if (i) i.focus(); return; }
  if (d.lcheck) { labCheck(d.lcheck); return; }
  if (d.lhint) { labHint(d.lhint); return; }
  if (d.lreplay || d.lreset) { const y = scrollY; render(); scrollTo(0,y); labAfterRender(); return; }
  if (d.lpick) { const [i,o] = d.lpick.split("|"); LRT.ans[i] = o; el.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === el)); return; }
  if (d.lnode) { const n = d.lnode; if (!LRT.sel) LRT.sel = n; else if (LRT.sel === n) LRT.sel = null; else { const k = [LRT.sel, n].sort().join("~"); LRT.links.has(k) ? LRT.links.delete(k) : LRT.links.add(k); LRT.sel = null; LRT.wireOk = false; } document.getElementById("wireBox").innerHTML = wireSVG(); return; }
  if (d.lup || d.ldown) { const i = +(d.lup ?? d.ldown), j = d.lup !== undefined ? i-1 : i+1; [LRT.order[i], LRT.order[j]] = [LRT.order[j], LRT.order[i]]; document.getElementById("orderBox").innerHTML = orderHTML(); return; }
  if (d.lhash) { const i = +d.lhash, f = m.files[i]; Promise.all([sha256(f[1]), sha256(f[2])]).then(([a,b]) => { const el2 = document.getElementById("hc-"+i); if (!el2) return; el2.textContent = b.slice(0,24)+"…"; el2.style.color = a===b ? "var(--ok)" : "var(--seal)"; el2.title = a===b ? "Matches" : "Does not match"; }); return; }
  if (d.lsim) { const step = m.steps[LRT.step], o = step[2][+d.lsim]; if (o[1]) { labOk(`✓ ${esc(o[2])}`); LRT.step++; document.getElementById("simBox").innerHTML = simHTML(m); if (LRT.step >= m.steps.length) { const st = labState(m.id); st.tries = LRT.wrong; finishMission(m); } } else { LRT.wrong++; el.classList.add("wrong"); el.disabled = true; const f = document.getElementById("labFeedback"); f.hidden = false; f.className = "note"; f.innerHTML = `✗ ${esc(o[2])}`; } return; }
  if (d.ltg) { LRT.tg[d.ltg] = !LRT.tg[d.ltg]; el.classList.toggle("on", LRT.tg[d.ltg]); el.setAttribute("aria-checked", LRT.tg[d.ltg]); return; }
});
document.addEventListener("keydown", e => {
  if (e.target.id === "termIn") {
    const t = LRT.term; if (!t) return;
    if (e.key === "Enter") { const line = e.target.value.trim(); e.target.value = ""; if (!line) return; t.hist.push(line); t.hi = t.hist.length; const out = document.getElementById("termOut"), prompt = labPrompt(); const res = labRun(line); out.textContent += `${prompt} ${line}\n${res ? res + "\n" : ""}`; out.scrollTop = out.scrollHeight; }
    if (e.key === "ArrowUp") { e.preventDefault(); if (t.hi > 0) { t.hi--; e.target.value = t.hist[t.hi]; } }
    if (e.key === "ArrowDown") { e.preventDefault(); if (t.hi < t.hist.length - 1) { t.hi++; e.target.value = t.hist[t.hi]; } else { t.hi = t.hist.length; e.target.value = ""; } }
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-lnode]")) { e.preventDefault(); e.target.closest("[data-lnode]").dispatchEvent(new MouseEvent("click", {bubbles:true})); }
});
document.addEventListener("input", e => {
  const m = MISSION[LRT.id]; if (!m) return;
  if (e.target.id === "shift") { const k = +e.target.value; document.getElementById("shv").textContent = k; document.getElementById("decoded").textContent = caesar(caesar(m.plain, m.shift), 26 - k); }
  if (e.target.id === "hashFree") sha256(e.target.value).then(h => { const o = document.getElementById("hashFreeOut"); if (o) o.textContent = h; });
  if (["lgUser","lgEvt","lgQ"].includes(e.target.id)) document.getElementById("lgTable").innerHTML = logsTable(m);
});
document.addEventListener("change", e => { if (["lgUser","lgEvt"].includes(e.target.id)) { const m = MISSION[LRT.id]; document.getElementById("lgTable").innerHTML = logsTable(m); } });
