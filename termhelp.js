/* ================= TERMINAL: plain-English command guide ================= */
/* [command, what the letters stand for, what it does in plain words, an example to try] */
const CMD_GROUPS = [
 ["Find your way around", [
  ["pwd","print working directory","Shows which folder you are in right now.","pwd"],
  ["ls","list","Lists the files and folders here. Add -l for details, -a to include hidden files.","ls -la"],
  ["cd","change directory","Moves you into another folder. cd .. goes up one level, cd ~ goes home.","cd .."],
  ["tree","tree view","Draws the folders and files below you as a tree.","tree"],
  ["find","find","Searches for files by name, size, owner or type.","find . -name \"*.txt\""],
  ["file","file type","Tells you what kind of file something is (text, data, program).","file ./*"],
  ["stat","status","Shows a file's size, owner, permissions and dates.","stat welcome.txt"]]],
 ["Read files", [
  ["cat","concatenate","Prints a whole file on the screen.","cat welcome.txt"],
  ["head","head (top)","Shows the first 10 lines of a file. -n 5 shows 5.","head -n 5 notes.txt"],
  ["tail","tail (bottom)","Shows the last 10 lines of a file, handy for logs.","tail notes.txt"],
  ["less","less (pager)","Shows a long file one screen at a time.","less notes.txt"],
  ["strings","printable strings","Pulls readable text out of a binary or data file.","strings data.bin"]]],
 ["Make and change files", [
  ["touch","touch","Creates an empty file (or updates its date).","touch report.txt"],
  ["mkdir","make directory","Creates a new folder.","mkdir evidence"],
  ["cp","copy","Copies a file. cp from to.","cp notes.txt notes-backup.txt"],
  ["mv","move","Moves or renames a file.","mv report.txt final.txt"],
  ["rm","remove","Deletes a file. Careful: there's no recycle bin.","rm report.txt"],
  ["rmdir","remove directory","Deletes an empty folder.","rmdir evidence"],
  ["nano","nano editor","Opens a simple text editor. Save with ^O, exit with ^X.","nano notes.txt"],
  ["chmod","change mode","Changes who may read, write or run a file (permissions).","chmod 640 notes.txt"],
  ["chown","change owner","Changes which user owns a file.","sudo chown root notes.txt"]]],
 ["Search and sort text", [
  ["grep","global regular expression print","Finds lines that contain a word. -i ignores case, -n shows line numbers.","grep -i password notes.txt"],
  ["sort","sort","Puts lines in order.","sort names.txt"],
  ["uniq","unique","Removes repeated lines that sit next to each other (sort first). -u shows lines that appear once.","sort data.txt | uniq -u"],
  ["wc","word count","Counts lines, words and characters. -l counts lines only.","wc -l notes.txt"],
  ["cut","cut","Takes out one column from each line.","cut -d: -f1 /etc/passwd"],
  ["tr","translate","Swaps or deletes characters, e.g. lower case to upper case.","echo hi | tr a-z A-Z"],
  ["echo","echo","Prints the text you give it.","echo hello"],
  ["base64","base 64","Encodes text as base64; -d decodes it back.","base64 -d data.txt"],
  ["sha256sum","SHA-256 checksum","Prints a fingerprint of a file to prove it hasn't changed.","sha256sum notes.txt"],
  ["diff","difference","Shows the lines that differ between two files.","diff a.txt b.txt"],
  ["sed","stream editor","Finds and replaces text in a file.","sed 's/old/new/' notes.txt"]]],
 ["Users and permissions", [
  ["whoami","who am I","Prints the user you are logged in as.","whoami"],
  ["id","identity","Shows your user number and the groups you belong to.","id"],
  ["groups","groups","Lists the groups you belong to.","groups"],
  ["sudo","superuser do","Runs one command as the administrator (root). -l lists what you may run.","sudo -l"],
  ["su","switch user","Becomes another user.","su admin"],
  ["passwd","password","Changes a password.","passwd"],
  ["useradd","user add","Creates a new user account.","sudo useradd analyst2"],
  ["userdel","user delete","Deletes a user account.","sudo userdel backup2"],
  ["last","last logins","Shows recent logins, useful in investigations.","last"],
  ["w","who is on","Shows who is logged in and what they are doing.","w"]]],
 ["System and processes", [
  ["ps","process status","Lists running programs. ps aux shows all of them.","ps aux"],
  ["top","table of processes","Shows running programs ranked by how busy they are.","top"],
  ["kill","kill","Stops a running program by its number (PID).","kill 1234"],
  ["uname","Unix name","Shows the operating system. -a for full details.","uname -a"],
  ["hostname","host name","Prints this computer's name.","hostname"],
  ["date","date","Shows the date and time.","date"],
  ["uptime","up time","Shows how long the computer has been running.","uptime"],
  ["df","disk free","Shows how full the disks are.","df -h"],
  ["free","free memory","Shows how much memory is in use.","free -h"],
  ["history","history","Lists the commands you typed before.","history"],
  ["env","environment","Lists the settings (variables) of your session.","env"],
  ["export","export","Sets a variable for this session.","export NAME=value"],
  ["which","which","Shows where a program lives.","which ssh"],
  ["clear","clear","Wipes the screen.","clear"],
  ["man","manual","Explains one command in detail.","man grep"]]],
 ["Services and logs", [
  ["systemctl","system control","Starts, stops, restarts or disables a service.","sudo systemctl status ssh"],
  ["service","service","Older way to start or stop a service.","sudo service ssh status"],
  ["journalctl","journal control","Reads the system logs.","journalctl -u ssh"],
  ["crontab","cron table","Lists jobs scheduled to run automatically. -l to list.","crontab -l"],
  ["apt","advanced package tool","Installs or updates software.","sudo apt update"]]],
 ["Network", [
  ["ip","internet protocol","Shows network addresses. ip a lists them all.","ip a"],
  ["ifconfig","interface configuration","Older way to show network addresses.","ifconfig"],
  ["ping","ping","Checks if another computer answers.","ping web01"],
  ["ss","socket statistics","Lists open network ports and connections. -tulpn is the usual mix.","ss -tulpn"],
  ["netstat","network statistics","Older way to list ports and connections.","netstat -tulpn"],
  ["nmap","network mapper","Scans a computer for open ports (only scan systems you're allowed to).","nmap web01"],
  ["curl","client URL","Fetches a web page or API response.","curl http://web01"],
  ["dig","domain information groper","Looks up a domain name's address (DNS).","dig example.com"],
  ["nslookup","name server lookup","Another way to look up a domain's address.","nslookup example.com"],
  ["ssh","secure shell","Logs in to another computer securely: ssh user@host.","ssh quest0@quest"],
  ["nc","netcat","Sends or receives raw text over a network port.","nc localhost 30000"],
  ["ufw","uncomplicated firewall","Turns the firewall on and sets which ports are allowed.","sudo ufw status"],
  ["exit","exit","Logs out of the computer you connected to.","exit"]]],
 ["Lab helpers", [
  ["quest","quest","Shows the goal of your current Shell Quest level.","quest"],
  ["hint","hint","Explains how to solve the current level, with every command spelled out.","hint"],
  ["passwords","passwords","Lists every Shell Quest password you have earned so far.","passwords"],
  ["submit","submit","Sends the final flag at the end of Shell Quest.","submit FLAG{...}"]]]
];
const CMD_INFO = Object.fromEntries(CMD_GROUPS.flatMap(([, rows]) => rows.map(r => [r[0], {full:r[1], what:r[2], ex:r[3]}])));
const SYM_INFO = [["|","pipe","sends the output of one command into the next"],[">","redirect","saves output into a file (replaces it)"],[">>","append","adds output to the end of a file"],["2>/dev/null","hide errors","throws away error messages like 'Permission denied'"],["&&","and then","runs the next command only if the first worked"],["~","home","your home folder"],[".","here","the current folder"],["..","up","the folder above"],["*","wildcard","matches any name"]];

function cmdHelpText(){
  const w = 13;
  return "Commands you can use. Tap '📖 Commands' (top right of this screen) to pick one and put it at the cursor.\n\n" +
    CMD_GROUPS.map(([g, rows]) => g.toUpperCase() + "\n" + rows.map(([c, full, what]) => "  " + c.padEnd(w) + full + " — " + what).join("\n")).join("\n\n") +
    "\n\nSYMBOLS\n" + SYM_INFO.map(([s, n, d]) => "  " + s.padEnd(w) + n + " — " + d).join("\n") +
    "\n\nKeys: Up arrow = previous command, Tab = finish a name. 'man <command>' explains one command in detail.";
}
/* For a hint: name every command it mentions, in plain words. */
function explainCmds(text){
  const words = [...new Set((String(text).match(/[a-z][a-z0-9]*/g) || []).filter(w => CMD_INFO[w]))];
  const syms = SYM_INFO.filter(([s]) => s.length > 1 ? text.includes(s) : (s === "|" && / \| /.test(text)) || (s === ">" && / > /.test(text)));
  if (!words.length && !syms.length) return "";
  return "\n\nWhat these mean:\n" + words.map(w => "  " + w.padEnd(13) + CMD_INFO[w].full + " — " + CMD_INFO[w].what).join("\n") + (syms.length ? "\n" + syms.map(([s, n, d]) => "  " + s.padEnd(13) + n + " — " + d).join("\n") : "");
}
function cmdGuideHTML(){
  return `<div class="cmdguide"><div class="cghead"><div class="row between"><b>Commands, in plain words</b><button class="cgclose" data-cgtoggle="1" aria-label="Close command guide">✕ Close</button></div><span class="num">Tap one to put it at the cursor, then press Enter. Esc also closes.</span>
    <input type="search" class="cgq" placeholder="Search: list, password, port…" aria-label="Search commands"></div>
    <div class="cglist">${CMD_GROUPS.map(([g, rows]) => `<div class="cgg"><span class="num">${esc(g)}</span>${rows.map(([c, full, what, ex]) => `<button class="cgi" data-cgins="${esc(ex)}" data-cgs="${esc((c + " " + full + " " + what).toLowerCase())}" title="${esc(what)}"><code>${esc(c)}</code><span><b>${esc(full)}</b> ${esc(what)}</span></button>`).join("")}</div>`).join("")}
      <div class="cgg"><span class="num">Symbols</span>${SYM_INFO.map(([s, n, d]) => `<div class="cgi sym"><code>${esc(s)}</code><span><b>${esc(n)}</b> ${esc(d)}</span></div>`).join("")}</div></div></div>`;
}
/* insert text at the terminal cursor */
function termInsert(input, text){
  if (!input) return; const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a, before = input.value.slice(0, a), sep = before && !/\s$/.test(before) ? " " : "";
  input.value = before + sep + text + input.value.slice(b); const pos = (before + sep + text).length; input.focus(); try { input.setSelectionRange(pos, pos); } catch(e) {}
}
function cgOpen(root, open){ const d = root && root.querySelector(".cgdrawer"), btn = root && root.querySelector(".cgbtn"); if (!d) return; d.hidden = !open; if (btn) btn.setAttribute("aria-expanded", String(!!open)); if (open) { const q = d.querySelector(".cgq"); if (q && window.innerWidth > 760) q.focus(); } }
document.addEventListener("click", e => {
  const t = e.target.closest("[data-cgtoggle]"); if (t) { const app = t.closest(".termapp"); const d = app && app.querySelector(".cgdrawer"); cgOpen(app, d && d.hidden); return; }
  const b = e.target.closest("[data-cgins]"); if (!b) return; const app = b.closest(".termapp"); termInsert(app && app.querySelector(".tcmd"), b.dataset.cgins); if (window.innerWidth <= 760) cgOpen(app, false);
});
document.addEventListener("input", e => {
  if (!e.target.classList.contains("cgq")) return; const q = e.target.value.trim().toLowerCase(), root = e.target.closest(".cmdguide");
  root.querySelectorAll(".cgi[data-cgs]").forEach(x => { x.hidden = !!q && !x.dataset.cgs.includes(q); });
  root.querySelectorAll(".cgg").forEach(g => { g.hidden = !!q && ![...g.querySelectorAll(".cgi[data-cgs]")].some(x => !x.hidden); });
});

/* Esc closes the guide from anywhere inside the terminal */
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return; const app = e.target.closest && e.target.closest(".termapp"); const d = app && app.querySelector(".cgdrawer");
  if (d && !d.hidden) { e.preventDefault(); cgOpen(app, false); const i = app.querySelector(".tcmd"); if (i) i.focus(); }
});
