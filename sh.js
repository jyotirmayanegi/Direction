/* ================= LabOS Terminal: a simulated Linux shell (multi-host, Shell Quest, hardening) ================= */
const shRor = (x,n) => (x>>>n) | (x<<(32-n));
const SHA_K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function sha256hex(str){
  const msg = new TextEncoder().encode(str), l = msg.length, k = (64 - ((l + 9) % 64)) % 64, buf = new Uint8Array(l + 9 + k);
  buf.set(msg); buf[l] = 0x80; const dv = new DataView(buf.buffer), bits = l * 8; dv.setUint32(buf.length - 4, bits >>> 0); dv.setUint32(buf.length - 8, Math.floor(bits / 4294967296));
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]; const W = new Uint32Array(64);
  for (let i = 0; i < buf.length; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + t*4);
    for (let t = 16; t < 64; t++) { const s0 = shRor(W[t-15],7) ^ shRor(W[t-15],18) ^ (W[t-15]>>>3), s1 = shRor(W[t-2],17) ^ shRor(W[t-2],19) ^ (W[t-2]>>>10); W[t] = (W[t-16] + s0 + W[t-7] + s1) >>> 0; }
    let [a,b,c,d,e,f,g,h] = H;
    for (let t = 0; t < 64; t++) { const S1 = shRor(e,6) ^ shRor(e,11) ^ shRor(e,25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + SHA_K[t] + W[t]) >>> 0, S0 = shRor(a,2) ^ shRor(a,13) ^ shRor(a,22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) >>> 0; h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0; }
    H = [H[0]+a, H[1]+b, H[2]+c, H[3]+d, H[4]+e, H[5]+f, H[6]+g, H[7]+h].map(x => x >>> 0);
  }
  return H.map(x => x.toString(16).padStart(8, "0")).join("");
}
const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(String(s).replace(/\s+/g,""))));
const shD = (c, m="755", o="root", g) => ({t:"d", c:c||{}, m, o, g:g||o});
const shF = (d, m="644", o="root", g, ft) => ({t:"f", d:String(d), m, o, g:g||o, ft});
function shRand(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const QP = ["quest0","N4rTg8Lw2Q","pZ7vK1mX9d","Hs3Lq0Wc6Y","tB8nR2yE5u","Mk1Zp7Fv4s","Wq9Dc3Xh0a","Lr5Gt8Nb2e","Yc2Hm6Vk9p","Ef7Uw1Js4t","Qa4Ox8Bn3m","Rd6Ky0Sp5c","Vg3Tj9Zw1h"];
const QFLAG = "FLAG{least-privilege-beats-root}";
const QUEST = [
 ["Log in to the quest server and read the file called readme.","ssh quest0@quest (password: quest0), then: cat readme"],
 ["The next password is in a file called - (a single dash) in the home folder.","Names starting with '-' look like options. Use: cat ./-"],
 ["The next password is in a file called 'spaces in this filename'.","Put the name in quotes: cat \"spaces in this filename\""],
 ["The next password is in a hidden file inside the inhere folder.","ls -a inhere shows names that start with a dot."],
 ["Only one file in inhere is human-readable. The password is in it.","file ./inhere/* prints each file's type; look for ASCII text."],
 ["Under inhere is a file that is human-readable, exactly 1033 bytes, and not executable.","find inhere -type f -size 1033c ! -executable"],
 ["Somewhere on the server is a file owned by user quest7 and group quest6, 33 bytes in size.","find / -user quest7 -group quest6 -size 33c 2>/dev/null  (2>/dev/null hides 'Permission denied' noise)"],
 ["The password is in data.txt, on the line with the word millionth.","grep millionth data.txt"],
 ["The password is the only line in data.txt that appears exactly once.","sort data.txt | uniq -u"],
 ["data.txt contains base64-encoded text.","base64 -d data.txt"],
 ["A service on port 30000 of localhost gives the next password if you send it this level's password.","nc localhost 30000, then type this level's password. Or: echo PASSWORD | nc localhost 30000"],
 ["A program runs automatically from cron. Find out what it does to find the next password.","ls /etc/cron.d/ ; cat the cron file, then cat the script it runs."],
 ["Find out what you may run as root, then read the flag.","sudo -l lists what this account may run with sudo."]
];
function padTo(s, n){ return s.length >= n ? s.slice(0, n) : s.slice(0, -1) + " ".repeat(n - s.length) + s.slice(-1); }
function shQuestHost(){
  const r = shRand(4242), word = () => { const W = ["ledger","audit","policy","vendor","consent","breach","cipher","token","router","kernel","access","backup","report","notice","control","risk","asset","evidence","sample","scope"]; return W[Math.floor(r()*W.length)] + Math.floor(r()*900+100); };
  const garb = n => Array.from({length:n}, () => String.fromCharCode(0x80 + Math.floor(r()*120))).join("");
  const homes = {};
  for (let i = 0; i <= 12; i++) homes["quest"+i] = shD({}, "750", "quest"+i, "quest"+i);
  homes.quest0.c.readme = shF(`Welcome to Shell Quest.\nEach level hides the password for the next account.\nLog in to the next level with: ssh quest1@quest\n\nThe password for quest1 is: ${QP[1]}\n`, "640", "quest0");
  homes.quest1.c["-"] = shF(QP[2] + "\n", "640", "quest1");
  homes.quest2.c["spaces in this filename"] = shF(QP[3] + "\n", "640", "quest2");
  homes.quest3.c.inhere = shD({".hidden_password": shF(QP[4] + "\n", "640", "quest3"), "nothing-here.txt": shF("Look harder.\n", "640", "quest3")}, "750", "quest3");
  const l4 = {}; for (let i = 0; i < 10; i++) l4["-file0"+i] = i === 7 ? shF(QP[5] + "\n", "640", "quest4", "quest4", "ascii") : shF(garb(33), "640", "quest4", "quest4", "data");
  homes.quest4.c.inhere = shD(l4, "750", "quest4");
  const l5 = {}; for (let i = 0; i < 8; i++) { const d = {}; ["-file1",".file1","-file2","spaces file3"].forEach((n, j) => { d[n] = shF("x".repeat(400 + Math.floor(r()*1800)) + "\n", j===1?"750":"640", "quest5"); }); l5["maybehere0"+i] = shD(d, "750", "quest5"); }
  l5.maybehere03.c[".file2"] = shF(padTo(QP[6] + "\n", 1033), "640", "quest5", "quest5", "ascii");
  l5.maybehere05.c["-file3"] = shF(padTo("not this one, it is executable\n", 1033), "750", "quest5", "quest5", "ascii");
  l5.maybehere06.c["spaces file2"] = shF(garb(1033), "640", "quest5", "quest5", "data");
  homes.quest5.c.inhere = shD(l5, "750", "quest5");
  const l7 = []; for (let i = 0; i < 320; i++) l7.push(word() + "\t" + Math.random().toString(36).slice(2, 12)); l7.splice(211, 0, "millionth\t" + QP[8]);
  homes.quest7.c["data.txt"] = shF(l7.join("\n") + "\n", "640", "quest7");
  const l8 = []; for (let i = 0; i < 40; i++) { const v = Math.random().toString(36).slice(2, 12); for (let k = 0; k < 10; k++) l8.push(v); } l8.push(QP[9]); for (let i = l8.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l8[i], l8[j]] = [l8[j], l8[i]]; }
  homes.quest8.c["data.txt"] = shF(l8.join("\n") + "\n", "640", "quest8");
  homes.quest9.c["data.txt"] = shF(b64e("The password is " + QP[10] + "\n") + "\n", "640", "quest9");
  homes.quest10.c["note.txt"] = shF("The service on port 30000 checks your current password.\n", "640", "quest10");
  homes.quest12.c["README"] = shF("Least privilege: this account can run exactly one command as root.\n", "640", "quest12");
  const fs = shD({
    home: shD(homes),
    etc: shD({passwd: shF(["root:x:0:0:root:/root:/bin/bash", ...Array.from({length:13}, (_, i) => `quest${i}:x:${11000+i}:${11000+i}::/home/quest${i}:/bin/bash`)].join("\n") + "\n"),
      "cron.d": shD({cronjob_quest12: shF("@reboot quest12 /usr/bin/cronjob_quest12.sh &> /dev/null\n* * * * * quest12 /usr/bin/cronjob_quest12.sh &> /dev/null\n"), "popularity-contest": shF("17 * * * * root test -x /etc/cron.daily/popularity-contest\n")}),
      quest_pass: shD(Object.fromEntries(QP.map((p, i) => ["quest"+i, shF(p + "\n", "400", "quest"+i)])), "755"), hostname: shF("quest\n")}),
    usr: shD({bin: shD({"cronjob_quest12.sh": shF("#!/bin/bash\nchmod 644 /tmp/t7O6lds9S0RqQh9a\ncat /etc/quest_pass/quest12 > /tmp/t7O6lds9S0RqQh9a\n", "755", "quest12", "quest12", "ascii")})}),
    var: shD({lib: shD({dpkg: shD({info: shD({"quest7.password": shF(padTo("The quest7 password: " + QP[7] + "\n", 33), "640", "quest7", "quest6", "ascii"), "quest7.list": shF("decoy\n".repeat(5), "644", "quest7", "quest7"), "base-files.md5sums": shF("x".repeat(33), "644", "root")})})}), log: shD({}), tmp: shD({"quest7.bak": shF(padTo("not it\n", 33), "640", "quest7", "quest7")}, "755")}),
    tmp: shD({"t7O6lds9S0RqQh9a": shF(QP[12] + "\n", "644", "quest12")}, "1777"),
    root: shD({"flag.txt": shF(`Congratulations!\n${QFLAG}\nYou finished Shell Quest. Type: submit ${QFLAG}\n`, "600", "root")}, "700")
  });
  const users = {root:{uid:0, home:"/root", groups:["root"]}}; for (let i = 0; i <= 12; i++) users["quest"+i] = {uid:11000+i, home:"/home/quest"+i, pass:QP[i], groups:["quest"+i]};
  return {name:"quest", ip:"10.0.4.30", users, fs, procs:[{pid:1,user:"root",cpu:"0.0",cmd:"/sbin/init"},{pid:410,user:"root",cpu:"0.1",cmd:"/usr/sbin/cron -f"},{pid:612,user:"root",cpu:"0.2",cmd:"sshd: /usr/sbin/sshd -D"},{pid:777,user:"root",cpu:"0.0",cmd:"/usr/local/bin/quest-service --port 30000"}],
    services:{ssh:{active:true,enabled:true,port:22}, cron:{active:true,enabled:true}}, listen:[22,30000], sudoers:{quest12:{nopass:true, allow:["/usr/bin/cat /root/flag.txt","cat /root/flag.txt"]}},
    motd:"Shell Quest server. Type 'quest' for this level's goal, 'hint' if you're stuck."};
}
function shWebHost(){
  const fs = shD({
    home: shD({admin: shD({"TICKET-SEC-118.txt": shF("Ticket SEC-118: harden web01 before the ISO 27001 audit\n\n1. Stop root logging in over SSH (PermitRootLogin no)\n2. Turn off password logins for SSH (PasswordAuthentication no), keys only\n3. Restart SSH so the change applies\n4. Stop and disable the telnet service\n5. config.php holds the database password: nobody but the owner and group may read it\n6. Remove the unknown UID 0 account 'backup2'\n7. Firewall: deny incoming by default; allow only 22/tcp and 443/tcp; enable it\n\nUse sudo. Your password: Adm1n!2026\n", "644", "admin")}, "755", "admin")}),
    etc: shD({passwd: shF("root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:112:117:MySQL Server:/nonexistent:/bin/false\nadmin:x:1000:1000:Web Admin:/home/admin:/bin/bash\nbackup2:x:0:0::/home/backup2:/bin/bash\n"),
      ssh: shD({sshd_config: shF("# web01 SSH server configuration\nPort 22\nPermitRootLogin yes\nPasswordAuthentication yes\nPubkeyAuthentication yes\nX11Forwarding yes\nMaxAuthTries 6\n", "644")}), hostname: shF("web01\n")}),
    var: shD({www: shD({app: shD({"config.php": shF("<?php\n$DB_HOST = '10.0.4.50';\n$DB_USER = 'ledger_app';\n$DB_PASSWORD = 'S3cr3t-Db-Pass';\n", "666", "www-data", "www-data"), "index.php": shF("<?php echo 'LedgerLeaf client portal';\n", "644", "www-data")}, "755", "www-data")}),
      log: shD({"auth.log": shF("Oct 24 23:10:02 web01 sshd[901]: Accepted password for backup2 from 185.220.101.4 port 51122\nOct 25 01:02:44 web01 sshd[930]: Failed password for root from 45.83.10.9 port 40100\nOct 25 01:02:47 web01 sshd[930]: Failed password for root from 45.83.10.9 port 40102\nOct 25 08:00:11 web01 sshd[990]: Accepted publickey for admin from 10.8.0.14 port 50211\n", "640", "root", "adm")})}),
    tmp: shD({}, "1777"), root: shD({}, "700")
  });
  return {name:"web01", ip:"10.0.4.20", users:{root:{uid:0, home:"/root", groups:["root"]}, admin:{uid:1000, home:"/home/admin", pass:"Adm1n!2026", sudo:true, groups:["admin","sudo","adm"]}, "www-data":{uid:33, home:"/var/www", groups:["www-data"]}, backup2:{uid:0, home:"/home/backup2", groups:["root"]}},
    fs, procs:[{pid:1,user:"root",cpu:"0.0",cmd:"/sbin/init"},{pid:640,user:"root",cpu:"0.1",cmd:"sshd: /usr/sbin/sshd -D"},{pid:702,user:"root",cpu:"0.0",cmd:"/usr/sbin/inetutils-telnetd"},{pid:880,user:"www-data",cpu:"1.2",cmd:"/usr/sbin/apache2 -k start"},{pid:910,user:"mysql",cpu:"2.4",cmd:"/usr/sbin/mysqld --bind-address=127.0.0.1"}],
    services:{ssh:{active:true,enabled:true,port:22}, telnet:{active:true,enabled:true,port:23}, apache2:{active:true,enabled:true,port:80,extra:[443]}, mysql:{active:true,enabled:true,port:3306,local:true}},
    ufw:{enabled:false, defIn:"allow", rules:[]}, sudoers:{admin:{all:true}}, cfgChangedAt:0, sshRestartAt:0,
    motd:"web01 · LedgerLeaf client portal · Ubuntu 24.04 LTS\nRead ~/TICKET-SEC-118.txt"};
}
function shLabHost(){
  const st = losState(), saved = st.fs ? (() => { try { return JSON.parse(st.fs); } catch(e) { return null; } })() : null;
  const home = saved || shD({"welcome.txt": shF("This is your own practice machine. Try:\n  ls -la\n  cat notes.txt\n  ping web01\n  nmap web01\n  ssh quest0@quest   (Shell Quest, password quest0)\n  ssh admin@web01    (hardening ticket, password Adm1n!2026)\nType 'help' for every command.\n", "644", "analyst"), "notes.txt": shF("Hosts on this network:\n  web01  10.0.4.20  client web server\n  quest  10.0.4.30  Shell Quest training server\n  db01   10.0.4.50  database (firewalled)\n  intranet.lab  10.0.4.40  intranet website\n", "644", "analyst"), projects: shD({}, "755", "analyst")}, "755", "analyst");
  const fs = shD({home: shD({analyst: home}), etc: shD({passwd: shF("root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Analyst:/home/analyst:/bin/bash\n"), hostname: shF("lab\n"), hosts: shF("127.0.0.1 localhost\n10.0.4.12 lab\n10.0.4.20 web01\n10.0.4.30 quest\n10.0.4.40 intranet.lab\n10.0.4.50 db01\n")}),
    var: shD({log: shD({"auth.log": shF(typeof AUTHLOG !== "undefined" ? AUTHLOG + "\n" : "", "644", "root")})}), tmp: shD({}, "1777"), root: shD({}, "700")});
  return {name:"lab", ip:"10.0.4.12", users:{root:{uid:0, home:"/root", groups:["root"]}, analyst:{uid:1000, home:"/home/analyst", pass:"analyst", sudo:false, groups:["analyst"]}}, fs,
    procs:[{pid:1,user:"root",cpu:"0.0",cmd:"/sbin/init"},{pid:880,user:"analyst",cpu:"0.3",cmd:"-bash"}], services:{ssh:{active:true,enabled:true,port:22}}, listen:[22], motd:"LabOS practice machine. Type 'help' to see commands."};
}
const SH_NET = {lab:"10.0.4.12", web01:"10.0.4.20", quest:"10.0.4.30", "intranet.lab":"10.0.4.40", db01:"10.0.4.50", localhost:"127.0.0.1"};
const MAN = {ls:"ls [-l] [-a] [path] — list files. -l long format (permissions, owner, size); -a include hidden files (names starting with .)",cd:"cd <dir> — change directory. cd .. goes up, cd ~ goes home.",cat:"cat <file> — print a file. Use ./- for a file named '-'.",grep:"grep [-i -v -c -n] <pattern> [file] — print matching lines. -i ignore case, -v invert, -c count, -n line numbers.",find:"find <path> [-name X] [-type f|d] [-size Nc] [-user U] [-group G] [-perm NNN] [-executable] [! test] — search files.",chmod:"chmod <mode> <file> — change permissions. Numbers: 6=rw-, 4=r--, 0=---, so 640 = owner rw, group r, others nothing. Or u+x, go-w, o-rwx.",sudo:"sudo <command> — run a command as root if allowed. sudo -l lists what you may run.",ssh:"ssh user@host — log in to another machine. exit to come back.",systemctl:"systemctl status|start|stop|restart|enable|disable [--now] <service>",ufw:"ufw status | enable | disable | default deny incoming | allow 22/tcp | deny 23 | delete allow 80",nano:"nano <file> — edit a file. Ctrl+O saves, Ctrl+X exits.",sed:"sed [-i] 's/old/new/[g]' <file> — replace text; -i edits the file in place.",nc:"nc <host> <port> — connect to a network service and send text.",base64:"base64 [-d] [file] — encode, or -d decode, base64 text.",sort:"sort [-r] [-n] [-u] [file]",uniq:"uniq [-c] [-u] [-d] — collapse repeated adjacent lines; sort first. -u only unique lines.",file:"file <path> — guess a file's type (ASCII text, data, script…).",nmap:"nmap <host> — scan for open ports (only scan machines you're allowed to!).",ps:"ps aux — list running processes.",kill:"kill <pid> — stop a process.",userdel:"userdel <name> — delete a user account (root only).",journalctl:"journalctl -u <service> — show a service's logs."};

function shNew(){
  const hosts = {lab:shLabHost(), quest:shQuestHost(), web01:shWebHost()};
  return {hosts, stack:[], sess:{host:"lab", user:"analyst", cwd:"/home/analyst", env:{}}, hist:[], hi:0, pending:null, sudoOk:{}};
}
function shHost(T){ return T.hosts[T.sess.host]; }
function shUserInfo(T, u){ return shHost(T).users[u || T.sess.user] || {uid:65534, groups:[]}; }
function shResolve(T, p){
  const s = T.sess, home = shUserInfo(T).home || "/";
  if (!p || p === "~") return home; if (p.startsWith("~/")) p = home + p.slice(1);
  const parts = (p.startsWith("/") ? p : s.cwd + "/" + p).split("/"), out = [];
  parts.forEach(x => { if (!x || x === ".") return; if (x === "..") out.pop(); else out.push(x); });
  return "/" + out.join("/");
}
function shNode(H, abs){ let n = H.fs; for (const p of abs.split("/").filter(Boolean)) { if (!n || n.t !== "d" || !n.c[p]) return null; n = n.c[p]; } return n; }
function shParent(H, abs){ const parts = abs.split("/").filter(Boolean), name = parts.pop(); return {dir: shNode(H, "/" + parts.join("/")), name}; }
function shCan(T, n, what){
  const u = shUserInfo(T), uid = T.sess.user === "root" || u.uid === 0 ? 0 : u.uid; if (uid === 0) return true;
  const m = n.m.slice(-3), idx = {r:4, w:2, x:1}[what], ownerUid = (shHost(T).users[n.o] || {}).uid;
  const cls = ownerUid === u.uid ? +m[0] : (u.groups || []).includes(n.g) ? +m[1] : +m[2];
  return (cls & idx) === idx;
}
function shWalkOk(T, abs){ const parts = abs.split("/").filter(Boolean); let n = shHost(T).fs, path = ""; for (let i = 0; i < parts.length - 1; i++) { n = n.c[parts[i]]; path += "/" + parts[i]; if (!n) return true; if (n.t === "d" && !shCan(T, n, "x")) return false; } return true; }
function shPerm(n){ const map = ["---","--x","-w-","-wx","r--","r-x","rw-","rwx"], m = n.m.slice(-3); return (n.t === "d" ? "d" : "-") + [...m].map(d => map[+d]).join("") + (n.m.length === 4 && n.m[0] === "1" ? "" : ""); }
function shSize(n){ return n.t === "d" ? 4096 : new TextEncoder().encode(n.d).length; }
function shType(n){ if (n.t === "d") return "directory"; if (n.ft === "data") return "data"; if (/^#!\/bin\/(ba)?sh/.test(n.d)) return "Bourne-Again shell script, ASCII text executable"; if (/^<\?php/.test(n.d)) return "PHP script, ASCII text"; if (!n.d.length) return "empty"; return /[\x80-\xff]/.test(n.d.slice(0, 200)) ? "data" : "ASCII text"; }
function shGlob(T, word){
  if (!/[*?]/.test(word)) return [word];
  const abs = shResolve(T, word), slash = abs.lastIndexOf("/"), dirAbs = abs.slice(0, slash) || "/", pat = abs.slice(slash + 1), dir = shNode(shHost(T), dirAbs);
  if (!dir || dir.t !== "d") return [word];
  const re = new RegExp("^" + pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
  const prefix = word.slice(0, word.lastIndexOf("/") + 1);
  const hits = Object.keys(dir.c).filter(n => re.test(n) && (pat.startsWith(".") || !n.startsWith("."))).sort().map(n => prefix + n);
  return hits.length ? hits : [word];
}
function shTokenize(line){
  const toks = []; let cur = "", q = null, quoted = false, i = 0;
  const push = () => { if (cur.length || quoted) toks.push({w:cur, q:quoted}); cur = ""; quoted = false; };
  while (i < line.length) { const ch = line[i];
    if (q) { if (ch === q) q = null; else if (ch === "\\" && q === '"' && i + 1 < line.length) { cur += line[++i]; } else cur += ch; i++; continue; }
    if (ch === "'" || ch === '"') { q = ch; quoted = true; i++; continue; }
    if (ch === "\\" && i + 1 < line.length) { cur += line[i+1]; i += 2; continue; }
    if (/\s/.test(ch)) { push(); i++; continue; }
    if (line.startsWith("2>/dev/null", i)) { push(); toks.push({op:"2null"}); i += 11; continue; }
    if (line.startsWith("2>&1", i)) { push(); i += 4; continue; }
    if (line.startsWith("&>", i)) { push(); toks.push({op:"&>"}); i += 2; continue; }
    if (line.startsWith("&&", i)) { push(); toks.push({op:"&&"}); i += 2; continue; }
    if (line.startsWith(">>", i)) { push(); toks.push({op:">>"}); i += 2; continue; }
    if (ch === ">" || ch === "|" || ch === ";" || ch === "<") { push(); toks.push({op:ch}); i++; continue; }
    cur += ch; i++;
  }
  if (q) return {err:"unexpected end of line: missing closing quote"};
  push(); return {toks};
}
function shPrompt(T){ const s = T.sess, home = shUserInfo(T).home || "", cwd = home && (s.cwd === home || s.cwd.startsWith(home + "/")) ? "~" + s.cwd.slice(home.length) : s.cwd; return `${s.user}@${s.host}:${cwd}${s.user === "root" ? "#" : "$"} `; }

/* run a full line: returns text output (may set T.pending for prompts) */
function shRun(T, line){
  const tk = shTokenize(line); if (tk.err) return "bash: " + tk.err;
  const groups = []; let cur = [];
  tk.toks.forEach(t => { if (t.op === ";" || t.op === "&&") { groups.push({cmds:cur, then:t.op}); cur = []; } else cur.push(t); });
  groups.push({cmds:cur, then:null});
  let out = "", lastCode = 0;
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi]; if (gi > 0 && groups[gi-1].then === "&&" && lastCode !== 0) break;
    if (!g.cmds.length) continue;
    const segs = []; let c = {argv:[], out:null, append:false, errNull:false, inFile:null};
    for (let i = 0; i < g.cmds.length; i++) { const t = g.cmds[i];
      if (t.op === "|") { segs.push(c); c = {argv:[], out:null, append:false, errNull:false, inFile:null}; }
      else if (t.op === ">" || t.op === ">>" || t.op === "&>") { const f = g.cmds[++i]; if (!f || f.op) return "bash: syntax error near unexpected token"; c.out = f.w; c.append = t.op === ">>"; if (t.op === "&>") c.errNull = true; }
      else if (t.op === "<") { const f = g.cmds[++i]; if (f && !f.op) c.inFile = f.w; }
      else if (t.op === "2null") c.errNull = true;
      else { let w = t.w; if (!t.q) { w = w.replace(/\$(\w+)/g, (m, v) => v === "HOME" ? (shUserInfo(T).home||"") : v === "USER" ? T.sess.user : v === "PWD" ? T.sess.cwd : (T.sess.env[v] ?? "")); if (w === "~" || w.startsWith("~/")) w = (shUserInfo(T).home||"") + w.slice(1); }
        (t.q ? [w] : shGlob(T, w)).forEach(x => c.argv.push(x)); }
    }
    segs.push(c);
    let stdin = null, res = {out:"", err:"", code:0};
    for (const sg of segs) {
      if (!sg.argv.length) continue;
      if (sg.inFile) { const n = shNode(shHost(T), shResolve(T, sg.inFile)); stdin = n && n.t === "f" ? n.d : ""; }
      res = shExec(T, sg.argv, stdin);
      if (res.prompt) { T.pending = res.prompt; return (out + (res.out || "")).replace(/\n$/, ""); }
      if (sg.out) { const abs = shResolve(T, sg.out); if (abs === "/dev/null") res.out = ""; else { const e = shWrite(T, abs, res.out || "", sg.append); if (e) res.err = (res.err ? res.err + "\n" : "") + e; res.out = ""; } }
      if (sg.errNull) res.err = "";
      stdin = res.out || "";
    }
    lastCode = res.code || (res.err ? 1 : 0);
    const piece = [res.err, res.out].filter(x => x !== undefined && x !== null && x !== "").join("\n");
    if (piece) out += (out ? "\n" : "") + piece.replace(/\n$/, "");
  }
  return out;
}
function shWrite(T, abs, data, append){
  const H = shHost(T), n = shNode(H, abs);
  if (n) { if (n.t === "d") return `bash: ${abs}: Is a directory`; if (!shCan(T, n, "w")) return `bash: ${abs}: Permission denied`; n.d = append ? n.d + data : data; shTouched(T, abs); return ""; }
  const {dir, name} = shParent(H, abs); if (!dir || dir.t !== "d") return `bash: ${abs}: No such file or directory`; if (!shCan(T, dir, "w")) return `bash: ${abs}: Permission denied`;
  dir.c[name] = shF(data, "644", T.sess.user === "root" ? "root" : T.sess.user); shTouched(T, abs); return "";
}
function shTouched(T, abs){ if (T.sess.host === "lab" && abs.startsWith("/home/analyst")) T.dirtyHome = true; if (T.sess.host === "web01" && abs === "/etc/ssh/sshd_config") shHost(T).cfgChangedAt = Date.now(); }
function shReadFile(T, path, cmd){
  const abs = shResolve(T, path);
  if (!shWalkOk(T, abs)) return {err:`${cmd}: ${path}: Permission denied`};
  const n = shNode(shHost(T), abs);
  if (!n) return {err:`${cmd}: ${path}: No such file or directory`};
  if (n.t === "d") return {err:`${cmd}: ${path}: Is a directory`};
  if (!shCan(T, n, "r")) return {err:`${cmd}: ${path}: Permission denied`};
  if (T.sess.host === "quest" && abs === "/root/flag.txt") T.flagSeen = true;
  return {d:n.d, n, abs};
}

function shExec(T, argv, stdin){
  const cmd = argv[0], args = argv.slice(1), flags = args.filter(a => /^-/.test(a) && a !== "-"), pos = args.filter(a => !/^-/.test(a) || a === "-");
  const H = shHost(T), s = T.sess, ok = o => ({out:o, code:0}), er = e => ({err:e, code:1});
  const has = f => flags.some(x => x === "-" + f || (x.length > 2 && !x.startsWith("--") && x.includes(f)));
  const input = () => { if (pos.length) { const outs = [], errs = []; pos.forEach(p => { if (p === "-") { outs.push(stdin || ""); return; } const r = shReadFile(T, p, cmd); r.err ? errs.push(r.err) : outs.push(r.d); }); return {text:outs.join(""), err:errs.join("\n")}; } return {text:stdin || "", err:""}; };
  switch (cmd) {
    case "help": return ok(cmdHelpText());
    case "man": { if (!pos[0]) return er("What manual page do you want? e.g. man ls"); const ci = CMD_INFO[pos[0]]; if (!MAN[pos[0]] && !ci) return ok(`No manual entry for ${pos[0]}. Try 'help'.`); return ok((ci ? `${pos[0]} = ${ci.full}\n${ci.what}\nTry: ${ci.ex}\n\n` : "") + (MAN[pos[0]] || "")); }
    case "clear": return {out:"", code:0, clear:true};
    case "echo": return ok(pos.join(" ") + (has("n") ? "" : "\n"));
    case "pwd": return ok(s.cwd);
    case "whoami": return ok(s.user);
    case "id": { const u = shUserInfo(T); return ok(`uid=${u.uid}(${s.user}) gid=${u.uid}(${s.user}) groups=${(u.groups||[]).map((g,i)=>`${u.uid+i}(${g})`).join(",")}`); }
    case "groups": return ok((shUserInfo(T).groups || []).join(" "));
    case "hostname": return ok(H.name);
    case "uname": return ok(has("a") ? `Linux ${H.name} 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux` : "Linux");
    case "date": return ok(new Date().toString());
    case "uptime": return ok(" 10:42:17 up 12 days,  3:04,  1 user,  load average: 0.08, 0.05, 0.01");
    case "df": return ok("Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        40G   11G   27G  29% /\ntmpfs           2.0G     0  2.0G   0% /dev/shm");
    case "free": return ok("               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       1.1Gi       1.6Gi        12Mi       1.1Gi       2.5Gi");
    case "history": return ok(T.hist.map((h, i) => `${String(i+1).padStart(5)}  ${h}`).join("\n"));
    case "env": return ok(`USER=${s.user}\nHOME=${shUserInfo(T).home}\nPWD=${s.cwd}\nSHELL=/bin/bash\nPATH=/usr/local/bin:/usr/bin:/bin\n` + Object.entries(s.env).map(([k,v]) => `${k}=${v}`).join("\n"));
    case "export": pos.forEach(a => { const m = a.match(/^(\w+)=(.*)$/); if (m) s.env[m[1]] = m[2]; }); return ok("");
    case "which": return pos.length ? ok(pos.map(p => (SH_CMDS.includes(p) ? "/usr/bin/" + p : "")).filter(Boolean).join("\n")) : ok("");
    case "cd": { const abs = shResolve(T, pos[0] || "~"), n = shNode(H, abs); if (!shWalkOk(T, abs)) return er(`bash: cd: ${pos[0]}: Permission denied`); if (!n) return er(`bash: cd: ${pos[0]}: No such file or directory`); if (n.t !== "d") return er(`bash: cd: ${pos[0]}: Not a directory`); if (!shCan(T, n, "x")) return er(`bash: cd: ${pos[0]}: Permission denied`); s.cwd = abs; return ok(""); }
    case "ls": case "dir": {
      const targets = pos.length ? pos : ["."], long = has("l"), all = has("a"), outs = [], errs = [];
      targets.forEach(p => { const abs = shResolve(T, p), n = shNode(H, abs);
        if (!shWalkOk(T, abs)) { errs.push(`ls: cannot access '${p}': Permission denied`); return; }
        if (!n) { errs.push(`ls: cannot access '${p}': No such file or directory`); return; }
        if (n.t === "f") { outs.push(long ? `${shPerm(n)} 1 ${n.o.padEnd(8)} ${n.g.padEnd(8)} ${String(shSize(n)).padStart(6)} Oct 25 08:29 ${p}` : p); return; }
        if (!shCan(T, n, "r")) { errs.push(`ls: cannot open directory '${p}': Permission denied`); return; }
        let names = Object.keys(n.c).sort((a,b) => a.replace(/^[.-]+/,"").localeCompare(b.replace(/^[.-]+/,""))); if (!all) names = names.filter(x => !x.startsWith(".")); else names = [".","..",...names];
        const show = x => { const c = x === "." || x === ".." ? n : n.c[x]; return c.t === "d" ? `\u0001${x}\u0002` : (/x/.test(shPerm(c).slice(1)) ? `\u0003${x}\u0002` : x); };
        const head = targets.length > 1 ? p + ":\n" : "";
        outs.push(head + (long ? `total ${names.length * 4}\n` + names.map(x => { const c = x === "." || x === ".." ? n : n.c[x]; return `${shPerm(c)} ${c.t==="d"?2:1} ${c.o.padEnd(8)} ${c.g.padEnd(8)} ${String(shSize(c)).padStart(6)} Oct 25 08:29 ${show(x)}`; }).join("\n") : names.map(show).join("  "))); });
      return {out:outs.join("\n\n"), err:errs.join("\n"), code:errs.length?2:0}; }
    case "tree": { const abs = shResolve(T, pos[0] || "."), n = shNode(H, abs); if (!n || n.t !== "d") return er("tree: not a directory"); const lines = [pos[0] || "."]; let files = 0, dirs = 0;
      (function walk(d, pre, depth){ if (depth > 4) return; const ks = Object.keys(d.c).filter(k => !k.startsWith(".")).sort(); ks.forEach((k, i) => { const c = d.c[k], last = i === ks.length - 1; lines.push(pre + (last ? "└── " : "├── ") + (c.t === "d" ? `\u0001${k}\u0002` : k)); c.t === "d" ? (dirs++, shCan(T, c, "r") && walk(c, pre + (last ? "    " : "│   "), depth + 1)) : files++; }); })(n, "", 0);
      return ok(lines.join("\n") + `\n\n${dirs} directories, ${files} files`); }
    case "cat": case "less": case "more": {
      if (!pos.length) return stdin !== null ? ok(stdin) : er(`${cmd}: missing file name (to read a file called '-', use ./-)`);
      const outs = [], errs = []; pos.forEach(p => { if (p === "-") { if (stdin !== null) outs.push(stdin); else errs.push("cat: reading standard input… (to read a file called '-', type: cat ./-)"); return; } const r = shReadFile(T, p, cmd); r.err ? errs.push(r.err) : outs.push(r.d); });
      return {out:outs.join(""), err:errs.join("\n"), code:errs.length?1:0}; }
    case "head": case "tail": { const ni = args.findIndex(a => a === "-n"); let n = ni >= 0 ? +args[ni+1] : 10; const nf = args.find(a => /^-\d+$/.test(a)); if (nf) n = +nf.slice(1);
      const files = pos.filter((p, i) => !(ni >= 0 && args[ni+1] === p)); const r = files.length ? shReadFile(T, files[0], cmd) : {d:stdin||""}; if (r.err) return er(r.err);
      const L = r.d.replace(/\n$/,"").split("\n"); return ok((cmd === "head" ? L.slice(0, n) : L.slice(-n)).join("\n")); }
    case "wc": { const r = input(); if (r.err && !r.text) return er(r.err); const t = r.text, l = (t.match(/\n/g)||[]).length, w = t.split(/\s+/).filter(Boolean).length, c = new TextEncoder().encode(t).length;
      return ok(has("l") ? String(l) : has("w") ? String(w) : has("c") ? String(c) : `${String(l).padStart(4)} ${String(w).padStart(5)} ${String(c).padStart(6)}`); }
    case "grep": case "egrep": {
      if (!pos.length) return er("usage: grep [-i -v -c -n] PATTERN [FILE]");
      const pat = pos[0], files = pos.slice(1), ci = has("i"), inv = has("v"), cnt = has("c"), num = has("n");
      let re; try { re = new RegExp(pat, ci ? "i" : ""); } catch(e) { re = null; }
      const test = l => re ? re.test(l) : (ci ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat));
      const run = (text, label) => { const L = text.replace(/\n$/,"").split("\n").map((l, i) => [l, i+1]).filter(([l]) => text.length && (test(l) !== inv)); return cnt ? (label ? label + ":" : "") + L.length : L.map(([l, i]) => (label ? label + ":" : "") + (num ? i + ":" : "") + l).join("\n"); };
      if (!files.length) return ok(run(stdin || ""));
      const outs = [], errs = []; files.forEach(f => { const r = shReadFile(T, f, "grep"); r.err ? errs.push(r.err) : outs.push(run(r.d, files.length > 1 ? f : "")); });
      const o = outs.filter(Boolean).join("\n"); return {out:o, err:errs.join("\n"), code: o ? 0 : 1}; }
    case "sort": { const r = input(); if (r.err && !r.text) return er(r.err); let L = r.text.replace(/\n$/,"").split("\n"); L = has("n") ? L.sort((a,b) => parseFloat(a) - parseFloat(b)) : L.sort(); if (has("r")) L.reverse(); if (has("u")) L = [...new Set(L)]; return ok(L.join("\n")); }
    case "uniq": { const r = input(); const L = r.text.replace(/\n$/,"").split("\n"), out = []; L.forEach(l => { const last = out[out.length-1]; last && last.l === l ? last.c++ : out.push({l, c:1}); });
      let res = out; if (has("u")) res = out.filter(x => x.c === 1); if (has("d")) res = out.filter(x => x.c > 1); return ok(res.map(x => has("c") ? `${String(x.c).padStart(7)} ${x.l}` : x.l).join("\n")); }
    case "cut": { const di = args.indexOf("-d"), fi = args.findIndex(a => a.startsWith("-f")); const delim = di >= 0 ? args[di+1] : "\t", f = fi >= 0 ? (args[fi].length > 2 ? args[fi].slice(2) : args[fi+1]) : "1";
      const files = pos.filter(p => p !== delim && p !== f); const r = files.length ? shReadFile(T, files[0], "cut") : {d:stdin||""}; if (r.err) return er(r.err); const idx = f.split(",").map(x => +x - 1);
      return ok(r.d.replace(/\n$/,"").split("\n").map(l => idx.map(i => l.split(delim)[i] ?? "").join(delim)).join("\n")); }
    case "tr": { if (pos.length < 2) return er("usage: tr SET1 SET2"); const ex = x => x.replace(/(\w)-(\w)/g, (m, a, b) => { let o = ""; for (let c = a.charCodeAt(0); c <= b.charCodeAt(0); c++) o += String.fromCharCode(c); return o; }); const A = ex(pos[0]), B = ex(pos[1]); return ok((stdin||"").split("").map(ch => { const i = A.indexOf(ch); return i >= 0 ? (B[i] ?? B[B.length-1]) : ch; }).join("")); }
    case "base64": { const r = input(); if (r.err && !r.text) return er(r.err); try { return ok(has("d") ? b64d(r.text) : b64e(r.text).replace(/(.{76})/g, "$1\n") + "\n"); } catch(e) { return er("base64: invalid input"); } }
    case "strings": { const r = input(); return ok((r.text.match(/[\x20-\x7e]{4,}/g) || []).join("\n")); }
    case "sha256sum": { const outs = []; if (!pos.length) return ok(sha256hex(stdin||"") + "  -"); for (const p of pos) { const r = shReadFile(T, p, cmd); if (r.err) return er(r.err); outs.push(sha256hex(r.d) + "  " + p); } return ok(outs.join("\n")); }
    case "md5sum": return er("md5sum: MD5 is broken for security use. Try sha256sum.");
    case "file": { if (!pos.length) return er("Usage: file <path>"); return ok(pos.map(p => { const abs = shResolve(T, p), n = shNode(H, abs); if (!n) return `${p}: cannot open (No such file or directory)`; if (!shCan(T, n, "r") && n.t === "f") return `${p}: regular file, no read permission`; return `${p}: ${shType(n)}`; }).join("\n")); }
    case "stat": { if (!pos.length) return er("stat: missing operand"); const n = shNode(H, shResolve(T, pos[0])); if (!n) return er(`stat: cannot stat '${pos[0]}': No such file or directory`); return ok(`  File: ${pos[0]}\n  Size: ${shSize(n)}\t${n.t==="d"?"directory":"regular file"}\nAccess: (0${n.m.slice(-3)}/${shPerm(n)})  Uid: ${n.o}  Gid: ${n.g}`); }
    case "find": {
      const start = pos[0] && !["!","-not"].includes(pos[0]) ? pos[0] : "."; const tests = []; let neg = false;
      for (let i = (pos[0] === start && args[0] === start ? 1 : 0); i < args.length; i++) { const a = args[i];
        if (a === "!" || a === "-not") { neg = true; continue; }
        if (a === "-name" || a === "-iname") { const v = args[++i] || "", re = new RegExp("^" + v.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", a === "-iname" ? "i" : ""); tests.push([neg, (n, name) => re.test(name)]); }
        else if (a === "-type") { const v = args[++i]; tests.push([neg, n => (v === "d") === (n.t === "d")]); }
        else if (a === "-size") { const v = args[++i] || "", m = v.match(/^([+-]?)(\d+)([ck]?)$/); if (m) { const k = m[3] === "k" ? 1024 : m[3] === "c" ? 1 : 512, nn = +m[2]; tests.push([neg, n => { if (n.t !== "f") return false; const sz = m[3] ? shSize(n) : Math.ceil(shSize(n) / 512); const val = m[3] === "k" ? Math.ceil(shSize(n)/1024) : sz; return m[1] === "+" ? val > nn : m[1] === "-" ? val < nn : (m[3] === "c" ? shSize(n) === nn : val === nn); }]); } }
        else if (a === "-user") { const v = args[++i]; tests.push([neg, n => n.o === v]); }
        else if (a === "-group") { const v = args[++i]; tests.push([neg, n => n.g === v]); }
        else if (a === "-perm") { const v = (args[++i] || "").replace(/^[-/]/, ""); tests.push([neg, n => n.m.slice(-3) === v.slice(-3)]); }
        else if (a === "-executable") tests.push([neg, n => n.t === "f" && /x/.test(shPerm(n).slice(1))]);
        else if (a === "-readable") tests.push([neg, n => shCan(T, n, "r")]);
        else if (a === "-maxdepth" || a === "-mindepth") i++;
        neg = false; }
      const md = args.indexOf("-maxdepth"), maxd = md >= 0 ? +args[md+1] : 99, absStart = shResolve(T, start), root = shNode(H, absStart);
      if (!root) return er(`find: '${start}': No such file or directory`);
      const out = [], errs = [];
      (function walk(n, path, name, depth){ if (tests.every(([ng, f]) => !!f(n, name) !== ng)) out.push(path); if (n.t !== "d" || depth >= maxd) return; if (!shCan(T, n, "r") || !shCan(T, n, "x")) { if (path !== start) errs.push(`find: '${path}': Permission denied`); return; } Object.keys(n.c).sort().forEach(k => walk(n.c[k], (path === "/" ? "" : path) + "/" + k, k, depth + 1)); })(root, start, start.split("/").pop(), 0);
      return {out:out.join("\n"), err:errs.join("\n"), code:0}; }
    case "touch": { pos.forEach(p => { const abs = shResolve(T, p); if (!shNode(H, abs)) shWrite(T, abs, "", false); }); return ok(""); }
    case "mkdir": { const errs = []; pos.forEach(p => { const abs = shResolve(T, p); if (shNode(H, abs)) { if (!has("p")) errs.push(`mkdir: cannot create directory '${p}': File exists`); return; } const {dir, name} = shParent(H, abs); if (!dir) { errs.push(`mkdir: cannot create directory '${p}': No such file or directory`); return; } if (!shCan(T, dir, "w")) { errs.push(`mkdir: cannot create directory '${p}': Permission denied`); return; } dir.c[name] = shD({}, "755", s.user === "root" ? "root" : s.user); shTouched(T, abs); }); return {out:"", err:errs.join("\n")}; }
    case "rm": case "rmdir": { const errs = []; pos.forEach(p => { const abs = shResolve(T, p), n = shNode(H, abs), {dir, name} = shParent(H, abs); if (!n) { if (!has("f")) errs.push(`${cmd}: cannot remove '${p}': No such file or directory`); return; } if (n.t === "d" && cmd === "rm" && !has("r") && !has("R")) { errs.push(`rm: cannot remove '${p}': Is a directory`); return; } if (cmd === "rmdir" && Object.keys(n.c||{}).length) { errs.push(`rmdir: failed to remove '${p}': Directory not empty`); return; } if (!shCan(T, dir, "w")) { errs.push(`${cmd}: cannot remove '${p}': Permission denied`); return; } delete dir.c[name]; shTouched(T, abs); }); return {out:"", err:errs.join("\n")}; }
    case "cp": case "mv": { if (pos.length < 2) return er(`${cmd}: missing destination file operand`); const src = shResolve(T, pos[0]), n = shNode(H, src); if (!n) return er(`${cmd}: cannot stat '${pos[0]}': No such file or directory`); if (n.t === "d" && cmd === "cp" && !has("r")) return er(`cp: -r not specified; omitting directory '${pos[0]}'`);
      let dst = shResolve(T, pos[1]); const dn = shNode(H, dst); if (dn && dn.t === "d") dst += "/" + src.split("/").pop(); const {dir, name} = shParent(H, dst); if (!dir || !shCan(T, dir, "w")) return er(`${cmd}: cannot create '${pos[1]}': Permission denied`);
      dir.c[name] = JSON.parse(JSON.stringify(n)); if (cmd === "mv") { const p = shParent(H, src); delete p.dir.c[p.name]; } shTouched(T, dst); return ok(""); }
    case "chmod": { if (pos.length < 2) return er("chmod: missing operand"); const mode = pos[0], errs = [];
      pos.slice(1).forEach(p => { const abs = shResolve(T, p), n = shNode(H, abs); if (!n) { errs.push(`chmod: cannot access '${p}': No such file or directory`); return; } if (s.user !== "root" && shUserInfo(T).uid !== 0 && n.o !== s.user) { errs.push(`chmod: changing permissions of '${p}': Operation not permitted`); return; }
        if (/^[0-7]{3,4}$/.test(mode)) n.m = mode.slice(-3);
        else { const m = mode.match(/^([ugoa]*)([+-=])([rwx]*)$/); if (!m) { errs.push(`chmod: invalid mode: '${mode}'`); return; } const who = (m[1] || "a").replace("a", "ugo"), bits = [...m[3]].reduce((a, c) => a | {r:4,w:2,x:1}[c], 0); const d = [...n.m.slice(-3)].map(Number);
          [..."ugo"].forEach((w, i) => { if (!who.includes(w)) return; d[i] = m[2] === "+" ? d[i] | bits : m[2] === "-" ? d[i] & ~bits : bits; }); n.m = d.join(""); }
        shTouched(T, abs); }); return {out:"", err:errs.join("\n")}; }
    case "chown": { if (s.user !== "root") return er("chown: changing ownership: Operation not permitted (try sudo)"); const [own, grp] = (pos[0]||"").split(":"); pos.slice(1).forEach(p => { const n = shNode(H, shResolve(T, p)); if (n) { if (own) n.o = own; if (grp) n.g = grp; } }); return ok(""); }
    case "ps": return ok("USER        PID %CPU COMMAND\n" + H.procs.map(p => `${p.user.padEnd(10)} ${String(p.pid).padStart(5)} ${String(p.cpu).padStart(4)} ${p.cmd}`).join("\n"));
    case "top": return ok("top - 10:42:17 up 12 days, 1 user, load average: 0.08\nPID   USER      %CPU  COMMAND\n" + H.procs.slice().sort((a,b) => b.cpu - a.cpu).map(p => `${String(p.pid).padEnd(5)} ${p.user.padEnd(9)} ${String(p.cpu).padStart(4)}  ${p.cmd}`).join("\n") + "\n(snapshot; press q in a real terminal to quit)");
    case "kill": { const pid = +pos[0], p = H.procs.find(x => x.pid === pid); if (!p) return er(`kill: (${pos[0]}) - No such process`); if (p.user !== s.user && s.user !== "root") return er(`kill: (${pid}) - Operation not permitted`); H.procs = H.procs.filter(x => x !== p); return ok(""); }
    case "w": case "who": return ok(`${s.user}  pts/0  10.0.4.12  10:31`);
    case "last": return ok(H.name === "web01" ? "admin    pts/0  10.8.0.14     Sat Oct 25 08:00   still logged in\nbackup2  pts/1  185.220.101.4 Fri Oct 24 23:10 - 23:58 (00:48)\nroot     pts/0  10.8.0.14     Mon Oct 20 09:12 - 09:40 (00:28)" : `${s.user}  pts/0  10.0.4.12  ${new Date().toDateString()}   still logged in`);
    case "passwd": return ok("Changing password for " + s.user + ".\n(Practice machine: passwords are fixed in this lab.)");
    case "useradd": case "adduser": { if (s.user !== "root") return er(`${cmd}: Permission denied. (try sudo)`); if (!pos[0]) return er(`usage: ${cmd} NAME`); const pw = shNode(H, "/etc/passwd"); pw.d += `${pos[0]}:x:${1001 + Object.keys(H.users).length}:${1001 + Object.keys(H.users).length}::/home/${pos[0]}:/bin/bash\n`; H.users[pos[0]] = {uid:1001 + Object.keys(H.users).length, home:"/home/" + pos[0], groups:[pos[0]]}; return ok(""); }
    case "userdel": case "deluser": { if (s.user !== "root") return er(`${cmd}: Permission denied. (try sudo)`); const name = pos[0]; if (!name) return er(`usage: ${cmd} NAME`); const pw = shNode(H, "/etc/passwd"); const before = pw.d; pw.d = pw.d.split("\n").filter(l => !l.startsWith(name + ":")).join("\n"); if (before === pw.d) return er(`${cmd}: user '${name}' does not exist`); delete H.users[name]; return ok(""); }
    case "sudo": {
      if (!pos.length && !has("l")) return er("usage: sudo <command>   (sudo -l lists what you may run)");
      const rule = (H.sudoers || {})[s.user];
      if (args[0] === "-l") { if (!rule) return er(`Sorry, user ${s.user} may not run sudo on ${H.name}.`); return ok(`User ${s.user} may run the following commands on ${H.name}:\n` + (rule.all ? "    (ALL : ALL) ALL" : rule.allow.filter(x => x.startsWith("/")).map(a => `    (root) ${rule.nopass ? "NOPASSWD: " : ""}${a}`).join("\n"))); }
      if (s.user === "root") return shExec(T, args, stdin);
      if (!rule) return er(`${s.user} is not in the sudoers file. This incident will be reported.`);
      const want = args.join(" ");
      if (!rule.all && !rule.allow.some(a => a === want || a === "/usr/bin/" + want)) return er(`Sorry, user ${s.user} is not allowed to execute '${want}' as root on ${H.name}.`);
      const runAsRoot = () => { const prevUser = s.user; s.user = "root"; let r; try { r = shExec(T, args, stdin); } finally { s.user = prevUser; } return r; };
      if (rule.nopass || (T.sudoOk[H.name + ":" + s.user] || 0) > Date.now()) return runAsRoot();
      const u = shUserInfo(T);
      return {out:"", prompt:{text:`[sudo] password for ${s.user}: `, mask:true, done:(v) => { if (v !== u.pass) return "Sorry, try again.\nsudo: 1 incorrect password attempt"; T.sudoOk[H.name + ":" + s.user] = Date.now() + 5 * 60000; const r = runAsRoot(); if (r.prompt) { T.pending = r.prompt; } return [r.err, r.out].filter(Boolean).join("\n"); }}};
    }
    case "su": return er("su: Authentication failure. (In this lab, use sudo instead.)");
    case "ssh": {
      const target = pos[0] || ""; const m = target.match(/^([\w.-]+)@([\w.-]+)$/); if (!m) return er("usage: ssh user@host   e.g. ssh quest0@quest");
      const [, user, hostName] = m, hid = hostName === "localhost" ? s.host : Object.keys(T.hosts).find(h => h === hostName || T.hosts[h].ip === hostName || (hostName === "10.0.4.20" && h === "web01"));
      if (!hid) return er(SH_NET[hostName] ? `ssh: connect to host ${hostName} port 22: Connection refused` : `ssh: Could not resolve hostname ${hostName}: Name or service not known`);
      const DH = T.hosts[hid], u = DH.users[user];
      if (hid === "web01" && DH.sshd && DH.sshd.noRoot && user === "root") return er("root@web01: Permission denied (publickey).");
      const login = () => {
        T.stack.push(Object.assign({}, s, {env:Object.assign({}, s.env)})); T.sess = {host:hid, user, cwd:u.home, env:{}};
        if (hid === "quest") { const lvl = +user.replace("quest",""); const L = losState(); if (!isNaN(lvl) && lvl > L.quest.level) { L.quest.level = lvl; losXP(25, "Shell Quest level " + lvl); losAchieve(); } T.questLvl = lvl; }
        return `Welcome to ${DH.name} (${DH.ip})\n${DH.motd || ""}`; };
      if (hid === "web01" && DH.sshd && DH.sshd.noPass) { if (user === "admin") return ok("Authenticated with your SSH key (password logins are now off, so keys are the only way in).\n" + login()); return er(`${user}@web01: Permission denied (publickey).`); }
      return {out:"", prompt:{text:`${user}@${hostName}'s password: `, mask:true, done:(v) => {
        if (!u || !u.pass || v !== u.pass) return `Permission denied, please try again.`;
        return login(); }}};
    }
    case "exit": case "logout": { if (!T.stack.length) return ok("This is your own practice machine. Close the window to leave."); const prev = T.stack.pop(); T.sess = prev; return ok(`Connection to ${H.name} closed.`); }
    case "ping": { const h = pos[pos.length-1]; if (!h) return er("usage: ping <host>"); const ip = SH_NET[h] || (/^\d+\.\d+\.\d+\.\d+$/.test(h) ? h : null); if (!ip) return er(`ping: ${h}: Name or service not known`); if (/^10\.0\.9\./.test(ip)) return ok(`PING ${h} (${ip}) 56(84) bytes of data.\n\n--- ${h} ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss`); const ms = () => (Math.random()*0.8 + 0.3).toFixed(3);
      return ok(`PING ${h} (${ip}) 56(84) bytes of data.\n` + [1,2,3,4].map(i => `64 bytes from ${ip}: icmp_seq=${i} ttl=64 time=${ms()} ms`).join("\n") + `\n\n--- ${h} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`); }
    case "ip": case "ifconfig": return ok(`1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    link/ether 52:54:00:12:34:56\n    inet ${H.ip}/24 brd 10.0.4.255 scope global eth0`);
    case "ss": case "netstat": { const lines = Object.entries(H.services || {}).filter(([, v]) => v.active && v.port).flatMap(([k, v]) => [v.port, ...(v.extra||[])].map(p => `tcp   LISTEN 0  128  ${v.local ? "127.0.0.1" : "0.0.0.0"}:${p}   0.0.0.0:*   users:(("${k}"))`)); if (H.name === "quest") lines.push(`tcp   LISTEN 0  128  127.0.0.1:30000   0.0.0.0:*   users:(("quest-service"))`); return ok("Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port\n" + lines.join("\n")); }
    case "nmap": { const h = pos[pos.length-1]; if (!h) return er("usage: nmap <host>"); const hid = Object.keys(T.hosts).find(x => x === h || T.hosts[x].ip === h); const ip = SH_NET[h] || (hid && T.hosts[hid].ip); if (!ip) return er(`Failed to resolve "${h}".`);
      let ports = []; if (hid) { const DH = T.hosts[hid]; ports = Object.entries(DH.services||{}).filter(([, v]) => v.active && v.port && !v.local).flatMap(([k, v]) => [[v.port, k], ...(v.extra||[]).map(p => [p, k === "apache2" ? (p === 443 ? "https" : "http") : k])]); if (DH.ufw && DH.ufw.enabled) ports = ports.filter(([p]) => DH.ufw.defIn === "allow" ? !DH.ufw.rules.some(r => r.act === "deny" && r.port === p) : DH.ufw.rules.some(r => r.act === "allow" && r.port === p)); }
      else if (h === "intranet.lab") ports = [[80,"http"],[443,"https"]]; else if (h === "db01") ports = [];
      const names = {22:"ssh",23:"telnet",80:"http",443:"https",3306:"mysql",30000:"unknown"};
      return ok(`Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for ${h} (${ip})\nHost is up (0.00041s latency).\n` + (ports.length ? `PORT      STATE SERVICE\n` + ports.sort((a,b) => a[0]-b[0]).map(([p]) => `${(p+"/tcp").padEnd(9)} open  ${names[p] || "unknown"}`).join("\n") : "All 1000 scanned ports are filtered") + `\n\nNmap done: 1 IP address (1 host up). Only scan systems you are authorised to test.`); }
    case "curl": case "wget": { const url = pos[pos.length-1] || ""; if (!url) return er(`${cmd}: no URL specified`);
      if (/intranet\.lab/.test(url)) return ok("<html><head><title>LedgerLeaf Intranet</title></head><body><h1>Welcome</h1><p>Security week: report phishing to security@ledgerleaf.example</p></body></html>");
      if (/web01|10\.0\.4\.20/.test(url)) { const W = T.hosts.web01; if (W.ufw.enabled && !W.ufw.rules.some(r => r.act === "allow" && (r.port === 443 || r.port === 80)) && W.ufw.defIn === "deny") return er(`curl: (28) Failed to connect to web01 port ${/https/.test(url)?443:80}: Connection timed out`); return ok("LedgerLeaf client portal"); }
      if (/localhost:30000/.test(url) && H.name === "quest") return ok("This service speaks plain text. Use: nc localhost 30000");
      return er(`curl: (6) Could not resolve host: ${url.replace(/^https?:\/\//,"").split("/")[0]}`); }
    case "dig": case "nslookup": case "host": { const h = pos[pos.length-1]; const ip = SH_NET[h]; if (!ip) return er(`** server can't find ${h}: NXDOMAIN`); return ok(cmd === "dig" ? `;; ANSWER SECTION:\n${h}.\t300\tIN\tA\t${ip}` : `Name:\t${h}\nAddress: ${ip}`); }
    case "nc": case "netcat": { const [h, p] = pos; if (!h || !p) return er("usage: nc <host> <port>");
      if (!(H.name === "quest" && (h === "localhost" || h === "127.0.0.1") && p === "30000")) return er(`nc: connect to ${h} port ${p} (tcp) failed: Connection refused`);
      const answer = v => String(v||"").trim() === QP[10] ? `Correct!\nPassword for quest11: ${QP[11]}` : "Wrong! Please enter the correct current password.";
      if (stdin !== null && stdin !== "") return ok(answer(stdin));
      return {out:"Enter the current password:", prompt:{text:"", mask:false, done:v => answer(v)}}; }
    case "systemctl": case "service": {
      let verb = cmd === "service" ? pos[1] : pos[0], svc = cmd === "service" ? pos[0] : pos.filter(x => x !== verb)[0], now = args.includes("--now");
      if (!verb) return er("usage: systemctl status|start|stop|restart|enable|disable <service>");
      if (!svc && verb !== "status") return er(`systemctl ${verb}: missing service name`);
      svc = svc === "sshd" ? "ssh" : svc;
      const v = (H.services || {})[svc]; if (svc && !v) return er(`Failed to ${verb} ${svc}.service: Unit ${svc}.service not found.`);
      if (verb === "status") { if (!svc) return ok(Object.entries(H.services).map(([k, x]) => `${x.active ? "●" : "○"} ${k}.service — ${x.active ? "active (running)" : "inactive (dead)"}; ${x.enabled ? "enabled" : "disabled"}`).join("\n")); return ok(`${v.active ? "●" : "○"} ${svc}.service\n     Loaded: loaded (/lib/systemd/system/${svc}.service; ${v.enabled ? "enabled" : "disabled"})\n     Active: ${v.active ? "active (running)" : "inactive (dead)"}`); }
      if (s.user !== "root") return er(`Failed to ${verb} ${svc}.service: Interactive authentication required. (try sudo)`);
      if (verb === "start") v.active = true; else if (verb === "stop") v.active = false; else if (verb === "restart" || verb === "reload") { v.active = true; if (svc === "ssh") shSshReload(T); } else if (verb === "enable") { v.enabled = true; if (now) v.active = true; } else if (verb === "disable") { v.enabled = false; if (now) v.active = false; } else if (verb === "mask") { v.enabled = false; v.active = false; } else return er(`Unknown command verb ${verb}.`);
      if (!v.active) H.procs = H.procs.filter(p => !p.cmd.includes(svc === "telnet" ? "telnetd" : svc));
      return ok(verb === "disable" ? `Removed "/etc/systemd/system/multi-user.target.wants/${svc}.service".` : ""); }
    case "journalctl": { const ui = args.indexOf("-u"), svc = ui >= 0 ? args[ui+1] : ""; const al = shNode(H, "/var/log/auth.log"); if (svc === "ssh" || svc === "sshd") { if (!al || !shCan(T, al, "r")) return er("Hint: You are currently not seeing messages from other users and the system. (try sudo)"); return ok(al.d); } return ok("-- No entries --"); }
    case "crontab": { if (args.includes("-l")) return ok(H.name === "quest" ? "no crontab for " + s.user + " (system jobs live in /etc/cron.d/)" : "no crontab for " + s.user); return er("crontab: only -l is supported here"); }
    case "apt": case "apt-get": { if (pos[0] === "list") return ok("openssh-server/noble,now 1:9.6p1 amd64 [installed]\napache2/noble,now 2.4.58 amd64 [installed]\ninetutils-telnetd/noble,now 2:2.5 amd64 [installed]\nufw/noble,now 0.36.2 all [installed]"); if (s.user !== "root") return er("E: Could not open lock file - are you root? (try sudo)"); return ok(pos[0] === "update" ? "Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nReading package lists... Done" : `Reading package lists... Done\n${pos.slice(1).join(" ")} is already the newest version.`); }
    case "ufw": {
      const U = H.ufw; if (!U) return er("ufw: command not found on this machine");
      const sub = pos[0];
      if (sub === "status") return ok(`Status: ${U.enabled ? "active" : "inactive"}` + (U.enabled ? `\nDefault: ${U.defIn} (incoming), allow (outgoing)\n\nTo                         Action      From\n--                         ------      ----\n` + U.rules.map(r => `${(r.port + "/tcp").padEnd(27)}${r.act.toUpperCase().padEnd(12)}Anywhere`).join("\n") : ""));
      if (s.user !== "root") return er("ERROR: You need to be root to run this script (try sudo)");
      if (sub === "enable") { U.enabled = true; return ok("Command may disrupt existing ssh connections. Proceed with operation (y|n)? y\nFirewall is active and enabled on system startup"); }
      if (sub === "disable") { U.enabled = false; return ok("Firewall stopped and disabled on system startup"); }
      if (sub === "default") { const pol = pos[1], dir = pos[2] || "incoming"; if (!["allow","deny","reject"].includes(pol)) return er("ERROR: Invalid policy"); if (dir === "incoming") U.defIn = pol === "reject" ? "deny" : pol; return ok(`Default ${dir} policy changed to '${pol}'`); }
      if (sub === "allow" || sub === "deny") { const port = parseInt(pos[1]); if (!port) return er("ERROR: Could not find a profile matching '" + (pos[1]||"") + "'"); U.rules = U.rules.filter(r => r.port !== port); U.rules.push({act:sub, port}); return ok("Rule added"); }
      if (sub === "delete") { const act = pos[1], port = parseInt(pos[2]); const n = U.rules.length; U.rules = U.rules.filter(r => !(r.act === act && r.port === port)); return ok(n === U.rules.length ? "Could not delete non-existent rule" : "Rule deleted"); }
      return er("ERROR: Invalid syntax"); }
    case "nano": case "vi": case "vim": case "edit": { const p = pos[0]; if (!p) return er(`${cmd}: missing file name`); const abs = shResolve(T, p), n = shNode(H, abs); if (n && n.t === "d") return er(`${cmd}: ${p} is a directory`); if (n && !shCan(T, n, "r")) return er(`${cmd}: ${p}: Permission denied`); return {out:"", code:0, editor:{abs, text:n ? n.d : "", user:s.user}}; }
    case "sed": {
      const iFlag = has("i"), expr = pos[0] || "", file = pos[1]; const m = expr.match(/^s(.)(.*?)\1(.*?)\1([gi]*)$/); if (!m) return er("sed: only s/old/new/[g] is supported here");
      let re; try { re = new RegExp(m[2], m[4].includes("i") ? (m[4].includes("g") ? "gi" : "i") : (m[4].includes("g") ? "g" : "")); } catch(e) { return er("sed: bad regex"); }
      const apply = t => t.split("\n").map(l => l.replace(re, m[3])).join("\n");
      if (!file) return ok(apply(stdin || ""));
      const r = shReadFile(T, file, "sed"); if (r.err) return er(r.err);
      if (iFlag) { if (!shCan(T, r.n, "w")) return er(`sed: couldn't open temporary file ${file}: Permission denied`); r.n.d = apply(r.n.d); shTouched(T, r.abs); return ok(""); }
      return ok(apply(r.d)); }
    case "diff": { if (pos.length < 2) return er("diff: missing operand"); const a = shReadFile(T, pos[0], "diff"), b = shReadFile(T, pos[1], "diff"); if (a.err || b.err) return er(a.err || b.err); const A = a.d.split("\n"), B = b.d.split("\n"), out = []; const mx = Math.max(A.length, B.length); for (let i = 0; i < mx; i++) { if (A[i] !== B[i]) { if (A[i] !== undefined) out.push(`< ${A[i]}`); if (B[i] !== undefined) out.push(`> ${B[i]}`); } } return {out:out.join("\n"), code: out.length ? 1 : 0}; }
    case "quest": { const lvl = T.sess.host === "quest" ? (T.questLvl ?? 0) : losState().quest.level; const q = QUEST[Math.min(lvl, 12)]; return ok(`Shell Quest — level ${lvl}\nGoal: ${q[0]}\nWhen you find the password, log in to the next level: ssh quest${lvl+1}@quest${lvl===12?" (level 12 has no next level: read the flag and submit it)":""}\nType 'hint' if you're stuck.`); }
    case "passwords": { const L = losState(); const top = questTop(L); return ok("Passwords you have earned (they stay saved):\n" + Array.from({length:top+1},(_,i)=>`  quest${i}`.padEnd(12) + QP[i]).join("\n") + `\nLog in to your latest level: ssh quest${top}@quest`); }
    case "hint": { if (T.sess.host === "web01") { const h = "Read ~/TICKET-SEC-118.txt. Useful: sudo nano /etc/ssh/sshd_config, sudo systemctl restart ssh, sudo systemctl disable --now telnet, sudo chmod 640 /var/www/app/config.php, sudo userdel backup2, sudo ufw default deny incoming, sudo ufw allow 22/tcp, sudo ufw allow 443/tcp, sudo ufw enable"; return ok(h + explainCmds(h)); } const lvl = T.sess.host === "quest" ? (T.questLvl ?? 0) : losState().quest.level; const h = QUEST[Math.min(lvl, 12)][1]; return ok("Hint: " + h + explainCmds(h)); }
    case "submit": { const a = pos.join(" ").trim(); if (a === QFLAG) { const L = losState(); if (!L.quest.flag) { L.quest.flag = true; L.quest.level = 12; losXP(100, "Shell Quest flag"); losAchieve(); } return ok("✔ Flag accepted. Shell Quest complete!"); } return er("✖ That's not the flag. Keep going."); }
    default: return er(`${cmd}: command not found. Type 'help' for the list of commands.`);
  }
}
const SH_CMDS = ["help","man","clear","echo","pwd","whoami","id","groups","hostname","uname","date","uptime","df","free","history","env","export","which","cd","ls","dir","tree","cat","less","more","head","tail","wc","grep","egrep","sort","uniq","cut","tr","base64","strings","sha256sum","md5sum","file","stat","find","touch","mkdir","rm","rmdir","cp","mv","chmod","chown","ps","top","kill","w","who","last","passwd","useradd","adduser","userdel","deluser","sudo","su","ssh","exit","logout","ping","ip","ifconfig","ss","netstat","nmap","curl","wget","dig","nslookup","host","nc","netcat","systemctl","service","journalctl","crontab","apt","apt-get","ufw","nano","vi","vim","edit","sed","diff","quest","hint","submit"];
function shSshReload(T){ const H = shHost(T), cfg = (shNode(H, "/etc/ssh/sshd_config") || {d:""}).d; H.sshd = {noRoot: /^\s*PermitRootLogin\s+no\b/m.test(cfg), noPass: /^\s*PasswordAuthentication\s+no\b/m.test(cfg)}; H.sshRestartAt = Date.now(); }
function shHardenState(T){
  const W = T.hosts.web01, cfg = (shNode(W, "/etc/ssh/sshd_config") || {d:""}).d, conf = shNode(W, "/var/www/app/config.php"), pw = (shNode(W, "/etc/passwd") || {d:""}).d, U = W.ufw;
  return {rootLogin: /^\s*PermitRootLogin\s+no\b/m.test(cfg), passAuth: /^\s*PasswordAuthentication\s+no\b/m.test(cfg), restarted: W.sshRestartAt > 0 && W.sshRestartAt >= W.cfgChangedAt && !!W.sshd && W.sshd.noRoot && W.sshd.noPass,
    telnet: !W.services.telnet.active && !W.services.telnet.enabled, config: !!conf && conf.m.slice(-1) === "0" && !/[2367]/.test(conf.m.slice(-2,-1)), backup2: !/^backup2:/m.test(pw),
    ufw: U.enabled && U.defIn === "deny" && U.rules.some(r => r.act === "allow" && r.port === 22) && U.rules.some(r => r.act === "allow" && r.port === 443) && !U.rules.some(r => r.act === "allow" && [23,3306].includes(r.port))};
}

/* ---------- Terminal app ---------- */
losRegister({id:"term", title:"Terminal", icon:"$_", color:"#0B1220", size:[880,560], mount(body, ctx, args){
  const T = shNew(); let tab = args.mode === "quest" ? "quest" : args.op === "op-harden" ? "harden" : "free";
  const L = losState();
  body.innerHTML = `<div class="termapp"><aside class="tside"><div class="seg" role="group" aria-label="Mode">${[["free","Free play"],["quest","Shell Quest"],["harden","Harden web01"]].map(([k,l])=>`<button aria-pressed="${tab===k}" data-ttab="${k}">${l}</button>`).join("")}</div><div class="tinfo"></div></aside>
    <div class="tscreen"><button class="cgbtn" data-cgtoggle="1" aria-expanded="false">📖 Commands</button><div class="cgdrawer" hidden>${cmdGuideHTML()}</div><div class="tout2" aria-live="polite"></div><div class="tin2"><span class="tps"></span><input type="text" class="tcmd" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></div></div>
    <div class="nano" hidden><div class="nbar">GNU nano 7.2 <span class="nfile"></span></div><textarea class="ntext" spellcheck="false" aria-label="File editor"></textarea><div class="nfoot"><button class="btn sm" data-nsave="1">^O Save</button><button class="btn sm ghost" data-nexit="1">^X Exit</button><span class="nmsg num"></span></div></div></div>`;
  const out = body.querySelector(".tout2"), inp = body.querySelector(".tcmd"), ps = body.querySelector(".tps"), info = body.querySelector(".tinfo"), nano = body.querySelector(".nano"), ntext = body.querySelector(".ntext");
  let editor = null;
  const fmt = t => esc(t).replace(/\u0001(.*?)\u0002/g, '<span class="tdir">$1</span>').replace(/\u0003(.*?)\u0002/g, '<span class="texe">$1</span>');
  const print = (t, cls) => { if (t === undefined || t === null) return; const div = document.createElement("div"); if (cls) div.className = cls; div.innerHTML = fmt(t); out.appendChild(div); out.scrollTop = out.scrollHeight; };
  const setPrompt = () => { ps.textContent = T.pending ? T.pending.text : shPrompt(T); inp.type = T.pending && T.pending.mask ? "password" : "text"; };
  const hardenRefresh = () => { const h = shHardenState(T), st = ctx.st; st.harden ||= {}; Object.keys(h).forEach(k => { if (h[k]) st.harden[k] = true; }); ctx.save(); ctx.check(); };
  const drawInfo = () => { const Lq = losState().quest;
    if (tab === "free") info.innerHTML = `<b>Your practice machine</b><p>A simulated Linux computer for learning. Nothing here can harm a real system.</p><ul class="clean"><li><code>ls -la</code>, <code>cat welcome.txt</code></li><li><code>ping web01</code>, <code>nmap web01</code></li><li><code>grep Failed /var/log/auth.log | wc -l</code></li><li><code>ssh quest0@quest</code> (password <code>quest0</code>)</li></ul><p class="num">Files you create in your home folder are saved.</p>`;
    else if (tab === "quest") { const lvl = Math.min(Lq.level, 12); info.innerHTML = `<b>Shell Quest</b><div class="qbar">${Array.from({length:13},(_,i)=>`<span class="${i<=Lq.level?"on":""} ${Lq.flag&&i===12?"flag":""}">${i}</span>`).join("")}</div><p><b>Level ${lvl}:</b> ${esc(QUEST[lvl][0])}</p><details><summary class="link">Hint</summary><p class="num">${esc(QUEST[lvl][1])}</p></details><p class="num">Continue: <code>ssh quest${questTop()}@quest</code>, password <code>${esc(QP[questTop()])}</code>. Each new level: +25 XP. The flag: +100 XP.</p>${questPassHTML()}${Lq.flag?`<div class="info">Flag captured. Shell Quest complete!</div>`:""}`; }
    else { const h = (ctx.st.harden || {}), items = [["rootLogin","Root can't log in over SSH"],["passAuth","SSH password logins off"],["restarted","SSH restarted after the change"],["telnet","Telnet stopped and disabled"],["config","config.php not readable by others"],["backup2","Rogue UID 0 account removed"],["ufw","Firewall: deny by default, allow 22 and 443"]];
      info.innerHTML = `<b>Ticket SEC-118: harden web01</b><p class="num">Connect: <code>ssh admin@web01</code>, password <code>Adm1n!2026</code>. Then <code>cat TICKET-SEC-118.txt</code>.</p><ul class="goals">${items.map(([k,l])=>`<li class="${h[k]?"met":""}">${l}</li>`).join("")}</ul><details><summary class="link">Stuck?</summary><p class="num">Type <code>hint</code> while logged in to web01.</p></details>`; }
  };
  print(`LabOS terminal · ${T.hosts.lab.motd}`); setPrompt(); drawInfo();
  if (tab === "quest") print(`Shell Quest: type  ssh quest${questTop()}@quest  (password ${QP[questTop()]}), or tap Log in under Your passwords.`, "tdim"); if (tab === "harden") print("Hardening ticket: type  ssh admin@web01  (password Adm1n!2026).", "tdim");
  const submit = () => {
    const raw = inp.value; inp.value = "";
    if (T.pending) { const p = T.pending; T.pending = null; print(p.text + (p.mask ? "" : raw)); const res = p.done(raw); if (res) print(res); setPrompt(); drawInfo(); hardenRefresh(); return; }
    const line = raw.trim(); print(shPrompt(T) + raw, "tline"); if (!line) { setPrompt(); return; }
    T.hist.push(line); T.hi = T.hist.length; const Ls = losState(); Ls.stats.cmds = (Ls.stats.cmds||0) + 1;
    if (/^clear$/.test(line)) { out.innerHTML = ""; setPrompt(); return; }
    let res;
    const ed = (() => { const tk = shTokenize(line); if (tk.err) return null; const w = tk.toks.filter(t => !t.op).map(t => t.w); const i = w[0] === "sudo" ? 1 : 0; return ["nano","vi","vim","edit"].includes(w[i]) ? {sudo:i === 1, file:w[i+1]} : null; })();
    if (ed) {
      const doOpen = () => { const r = shExec(T, ["nano", ed.file || ""], null); if (r.err) { print(r.err); setPrompt(); return; } editor = r.editor; editor.asRoot = T.sess.user === "root"; nano.hidden = false; body.querySelector(".nfile").textContent = editor.abs; ntext.value = editor.text; editor.orig = editor.text; body.querySelector(".nmsg").textContent = ""; ntext.focus(); };
      if (ed.sudo) { const H = shHost(T), rule = (H.sudoers || {})[T.sess.user]; if (T.sess.user !== "root" && (!rule || !rule.all)) { print(`Sorry, user ${T.sess.user} may not run sudo for this.`); setPrompt(); return; }
        const go = () => { const prev = T.sess.user; T.sess.user = "root"; doOpen(); editor && (editor.restoreUser = prev); if (!editor) T.sess.user = prev; };
        if (T.sess.user === "root" || (T.sudoOk[H.name + ":" + T.sess.user] || 0) > Date.now()) go();
        else { T.pending = {text:`[sudo] password for ${T.sess.user}: `, mask:true, done:v => { if (v !== shUserInfo(T).pass) return "Sorry, try again."; T.sudoOk[H.name + ":" + T.sess.user] = Date.now() + 300000; go(); return ""; }}; setPrompt(); }
        return; }
      doOpen(); return;
    }
    res = shRun(T, line);
    if (res) print(res);
    if (res) questRecordFound(String(res));
    if (/^(help|man)\b/.test(line)) cgOpen(body, line === "help");
    if (T.flagSeen && !losState().quest.flag) { print("You found the flag! Type: submit " + QFLAG, "tdim"); }
    if (T.dirtyHome) { T.dirtyHome = false; try { const j = JSON.stringify(T.hosts.lab.fs.c.home.c.analyst); if (j.length < 40000) { losState().fs = j; } } catch(e) {} }
    ctx.save(); setPrompt(); drawInfo(); hardenRefresh(); losAchieve();
  };
  const closeEditor = () => { nano.hidden = true; if (editor && editor.restoreUser) T.sess.user = editor.restoreUser; editor = null; setPrompt(); inp.focus(); };
  const saveEditor = () => { if (!editor) return; const err = shWrite(T, editor.abs, ntext.value, false); body.querySelector(".nmsg").textContent = err ? err.replace("bash: ","") : `[ Wrote ${ntext.value.split("\n").length} lines ]`; if (!err) editor.orig = ntext.value; hardenRefresh(); };
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (T.hi > 0) { T.hi--; inp.value = T.hist[T.hi]; } }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (T.hi < T.hist.length - 1) { T.hi++; inp.value = T.hist[T.hi]; } else { T.hi = T.hist.length; inp.value = ""; } }
    else if (e.key === "Tab") { e.preventDefault(); const v = inp.value, parts = v.split(/\s+/), last = parts[parts.length-1] || "";
      if (parts.length === 1) { const c = SH_CMDS.filter(x => x.startsWith(last)); if (c.length === 1) inp.value = c[0] + " "; else if (c.length) print(c.join("  ")); }
      else { const slash = last.lastIndexOf("/"), dirPart = slash >= 0 ? last.slice(0, slash + 1) : "", stem = last.slice(slash + 1), dir = shNode(shHost(T), shResolve(T, dirPart || ".")); if (dir && dir.t === "d") { const c = Object.keys(dir.c).filter(n => n.startsWith(stem) && (stem.startsWith(".") || !n.startsWith("."))); if (c.length === 1) { parts[parts.length-1] = dirPart + c[0] + (dir.c[c[0]].t === "d" ? "/" : ""); inp.value = parts.join(" "); } else if (c.length) print(c.join("  ")); } } }
    else if (e.key === "c" && e.ctrlKey) { e.preventDefault(); if (T.pending) { T.pending = null; print("^C"); } else print(shPrompt(T) + inp.value + "^C"); inp.value = ""; setPrompt(); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
  });
  ntext.addEventListener("keydown", e => { if (e.ctrlKey && (e.key === "o" || e.key === "s")) { e.preventDefault(); saveEditor(); } else if (e.ctrlKey && e.key === "x") { e.preventDefault(); closeEditor(); } });
  body.addEventListener("click", e => {
    const tt = e.target.closest("[data-ttab]"); if (tt) { tab = tt.dataset.ttab; body.querySelectorAll("[data-ttab]").forEach(b => b.setAttribute("aria-pressed", b === tt)); drawInfo(); return; }
    const ql = e.target.closest("[data-qlogin]"); if (ql) { const n = +ql.dataset.qlogin; if (T.pending) { T.pending = null; } if (T.sess.host !== "lab") { inp.value = "exit"; submit(); } inp.value = `ssh quest${n}@quest`; submit(); if (T.pending) { inp.value = QP[n]; submit(); } inp.focus(); return; }
    const qc = e.target.closest("[data-qcopy]"); if (qc) { const v = qc.dataset.qcopy; (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast("Password copied."), () => { inp.value = v; inp.focus(); toast("Password placed at the cursor."); }); return; }
    if (e.target.closest("[data-nsave]")) { saveEditor(); return; }
    if (e.target.closest("[data-nexit]")) { closeEditor(); return; }
    if (e.target.closest(".tscreen") && !e.target.closest(".cgdrawer,.cgbtn") && !window.getSelection().toString()) inp.focus();
  });
  setTimeout(() => inp.focus(), 50);
  return {onArgs: a => { if (a.op === "op-harden") tab = "harden"; if (a.mode === "quest") tab = "quest"; body.querySelectorAll("[data-ttab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ttab === tab)); drawInfo(); }};
}});

/* ---------- Shell Quest: remember every password you earn ---------- */
function questTop(L){ L = L || losState(); return Math.min(12, Math.max(L.quest.level || 0, L.quest.found || 0)); }
function questRecordFound(text){ const L = losState(); let hit = 0; for (let k = 1; k < QP.length; k++) if (text.includes(QP[k])) hit = Math.max(hit, k); if (hit > (L.quest.found || 0)) { L.quest.found = hit; losSave(); toast(`Password for quest${hit} saved. Find it under Shell Quest anytime.`); } }
function questPassHTML(){ const L = losState(), top = questTop(L);
  return `<div class="qpass"><b>Your passwords</b><span class="num">Saved as you find them. Tap Log in to jump straight back in.</span>${Array.from({length:top+1},(_,i)=>`<div class="qprow ${i===top?"cur":""}"><span><code>quest${i}</code> <code class="pw">${esc(QP[i])}</code></span><span class="row"><button class="link" data-qcopy="${esc(QP[i])}" aria-label="Copy password for quest${i}">Copy</button><button class="btn sm" data-qlogin="${i}">Log in</button></span></div>`).join("")}</div>`; }
