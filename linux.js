const CYBER_LINUX = [
{id:"c-linux",track:"cyber",title:"Linux and the command line",short:"Reading files, logs and permissions the way security teams do",weeks:"Phase 1",sk:["itbasics","iam"],
 obj:"Move around a Linux system with commands, read files and logs, search them with grep, read and change file permissions, and spot running processes — enough to follow and check what security engineers tell you.",
 why:"Most servers that hold company data run Linux. Auditors and GRC analysts are regularly shown command output (permission listings, log extracts, config files) as evidence, and need to read it without guessing.",
 subs:[
  {t:"What Linux and a terminal are",l:1,b:"Linux is an operating system used on most servers and cloud machines. A terminal is a text window where you type commands instead of clicking. Each command is a short verb, sometimes with options (flags) and a target.",ex:"`ls -l /var/log` = list (ls), in long format (-l), the folder /var/log.",v:"Linux command line for absolute beginners"},
  {t:"Finding your way: pwd, ls, cd",l:1,b:"pwd shows where you are. ls lists what's in a folder. cd moves into a folder; cd .. goes up one level. Paths starting with / begin at the top of the system (the root); others start from where you are.",v:"Linux pwd ls cd explained beginners"},
  {t:"Reading files: cat, head, tail",l:1,b:"cat prints a whole file. head shows the first lines and tail the last lines, which is handy for long logs. tail -n 20 shows the last 20 lines.",v:"Linux cat head tail commands explained"},
  {t:"Searching with grep and pipes",l:1,b:"grep finds lines containing a word: grep \"Failed password\" auth.log. -c counts matches, -i ignores case. The pipe | sends one command's output into the next, e.g. grep \"Failed\" auth.log | wc -l counts the lines.",ex:"Auditor use: grep a login log for an ex-employee's username to prove whether they logged in after leaving.",v:"Linux grep and pipes explained beginners"},
  {t:"Users, root and /etc/passwd",l:2,b:"Every user has an account; root is the all-powerful administrator (user ID 0). /etc/passwd lists accounts. Any account other than root with user ID 0 is effectively a hidden admin — a classic audit finding.",v:"Linux users root etc passwd explained"},
  {t:"Permissions: reading rwx and chmod",l:1,b:"ls -l shows permissions like -rw-r--r--: three groups (owner, group, everyone) of read (r), write (w), execute (x). chmod changes them; chmod 600 file means only the owner can read and write.",ex:"-rw-rw-rw- on salaries.csv means everyone on the server can read and change salaries — a finding.",v:"Linux file permissions chmod explained"},
  {t:"Processes: ps and kill",l:2,b:"ps lists running programs with an ID (PID) and how much CPU they use. kill PID stops one. Unknown processes using 90%+ CPU can mean crypto-mining malware.",v:"Linux ps kill processes explained"},
  {t:"Logs that matter to auditors",l:2,b:"/var/log/auth.log (or secure) records logins and sudo use; system logs record service events. CERT-In expects logs kept for 180 days in India, so auditors check retention and who can delete logs.",v:"Linux log files auth.log explained"},
  {t:"Hardening basics (CIS benchmarks)",l:3,b:"Security baselines such as the CIS Benchmarks list settings to check: no direct root login over SSH, password logins replaced by keys, no world-writable files, unused services off. GRC teams use them as testable standards.",v:"CIS benchmark Linux hardening explained"}
 ],
 ill:{type:"stack",layers:[["Your command","grep \"Failed\" /var/log/auth.log | wc -l"],["Shell","Reads the line, runs grep, pipes the output into wc"],["Linux kernel","Opens the file if your permissions allow it"],["Disk","The log file itself"]],title:"What happens when you press Enter"},
 illCap:"Every command passes through the shell to the system, which checks your permissions first. Try it live in the Cyber Lab's Terminal Town.",
 case:{t:"An auditor checks a leaver",b:"An employee left on 31 January. The auditor asks IT to run grep for the username in /var/log/auth.log. The output shows a successful login on 3 February from an outside IP address. That one line is evidence that the leaver control failed and that a possible breach needs investigating."},
 ben:["Lets you read technical evidence instead of trusting summaries.","Makes conversations with engineers and auditors much easier.","Basic Linux appears in Security+ and many GRC interviews."],
 trap:["Assuming chmod 777 'fixes' access problems (it gives everyone full control).","Thinking only 'root' can be an admin — any user ID 0 is admin.","Reading only the first page of a log; attackers are often in the middle."],
 quiz:[
  {q:"Which command counts lines containing 'Failed' in auth.log?",o:["cat Failed auth.log","grep -c \"Failed\" auth.log","ls -c auth.log","chmod Failed auth.log"],a:1,w:"grep -c counts matching lines."},
  {q:"A file shows -rw-------. Who can read it?",o:["Everyone","The owner only","The group only","Nobody"],a:1,w:"Only the owner has r and w."},
  {q:"An account other than root has user ID 0. This means:",o:["It's a guest","It has full admin rights","It's disabled","It's a service account with no rights"],a:1,w:"UID 0 means root-level power."}],
 refs:[["Linux Journey (free beginner course)","https://linuxjourney.com/","course"],["CIS Benchmarks","https://www.cisecurity.org/cis-benchmarks","primary"],["OverTheWire Bandit (free command-line game)","https://overthewire.org/wargames/bandit/","course"]],
 terms:{"terminal":"A text window where you type commands.","root":"Linux's all-powerful administrator account (user ID 0).","grep":"A command that finds lines containing a word or pattern.","pipe":"The | symbol that passes one command's output into another.","PID":"Process ID — the number identifying a running program."}}
];
/* Topic intensity: how demanding each topic is, independent of the path order. */
const INTENSITY = {grc:1,privacy:1,"c-basics":1,"c-network":1,"c-linux":1,"c-iam":1,"c-threats":1,"t-excel":1,
 dpdp:2,gdpr:2,ccpa:2,privops:2,"c-crypto":2,"c-controls":2,iso:2,frameworks:2,risk:2,audit:2,tprm:2,hipaa:2,glba:2,"c-cloud":2,
 secfinra:3,indiafin:3,"c-ir":3,aigov:3,"t-onetrust":3,"t-servicenow":3};
const INTENSITY_NAME = {1:"Beginner",2:"Intermediate",3:"Advanced"};
