head='''<title>Career Count</title>
<meta name="claude:viewport-fit-sides" content="cover">
'''
css=open('style.css').read()+'\n'+open('style2.css').read()+'\n'+open('style3.css').read()
FILES=['law1.js','law2.js','law3.js','cyber.js','linux.js','tools.js','certs.js','tools2.js','topics3.js','roles2.js','projects.js','tp1.js','tp2.js','tp3.js','tp4.js','tp5.js','tp6.js','aigov2.js','lab.js','lab2.js','os.js','sh.js','termhelp.js','apps1.js','apps2.js','ops.js','projview2.js','rolesui.js','news.js','tracker.js','resume2.js','app.js','impact.js','rolepage.js','cmd.js','github.js','ideas.js','paywall.js','linkedin.js','pathways.js','materials.js','boot.js']
js='\n'.join(open(f).read() for f in FILES)
out=head+'<style>\n'+css+'\n</style>\n<div class="field" aria-hidden="true"><i></i><i></i><i></i></div>\n<nav class="sidewrap" id="side" aria-label="Sections"></nav>\n<header class="top" id="hdr"></header>\n<main class="wrap" id="main"></main>\n<nav class="tabbar" id="tabs" aria-label="Quick navigation"></nav>\n<script>\n'+js+'\n</script>\n'
open('/home/claude/grc-hub.html','w').write(out)
open('bundle.js','w').write(js)
print(len(out))
# Every build runs the tap guard: a control that can't be tapped fails the build.
import subprocess, sys, os
if os.environ.get('SKIP_GUARD') != '1':
    for script in ('guard.js', 'interact.js'):
        r = subprocess.run(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), script)], capture_output=True, text=True, timeout=900)
        print(r.stdout[-3000:])
        if r.returncode != 0:
            print('BUILD BLOCKED by ' + script + ': fix the problems above before publishing.'); sys.exit(1)
