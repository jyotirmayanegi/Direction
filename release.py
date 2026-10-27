"""Save one app update to GitHub, named after the next element of the periodic table.
Usage: python3 release.py "What changed, in plain words" [artifact version]
Builds (with the automatic checks), copies the build to dist/, commits, tags (e.g. 02-He-Helium) and pushes.
Go back to any update:  python3 release.py --restore He   (puts that update's files back as a NEW update)"""
import json, os, subprocess, sys, datetime, shutil
D = os.path.dirname(os.path.abspath(__file__)); os.chdir(D)
EL = json.load(open('elements.json'))
def sh(*a, check=True): return subprocess.run(a, check=check, capture_output=True, text=True).stdout.strip()
def tags(): return sorted([t for t in sh('git', 'tag', '-l').split('\n') if t[:2].isdigit()])
def tag_for(sym):
    for t in tags():
        if t.split('-')[1].lower() == sym.lower() or t.split('-')[2].lower() == sym.lower(): return t
    sys.exit(f'No update named {sym}. Updates: ' + ', '.join(tags()))
def release(summary, art=''):
    n = len(tags()); sym, name = EL[n % len(EL)].split(' '); cycle = n // len(EL)
    tag = f'{n+1:03d}-{sym}-{name}' + (f'-r{cycle+1}' if cycle else '')
    if subprocess.run([sys.executable, 'build.py']).returncode != 0: sys.exit('Build or checks failed: nothing saved.')
    os.makedirs('dist', exist_ok=True); shutil.copy('/home/claude/grc-hub.html', 'dist/career-count.html')
    day = datetime.date.today().isoformat()
    log = 'CHANGELOG.md'
    if not os.path.exists(log): open(log, 'w').write('# Updates\n\nEach update is named after the next element of the periodic table. To go back to one, ask Claude: "restore Helium" (or run `python3 release.py --restore He`).\n\n| No. | Symbol | Element | Date | What changed | App version |\n|---|---|---|---|---|---|\n')
    rows = open(log).read(); row = f'| {n+1} | **{sym}** | {name} | {day} | {summary.replace("|", "/")} | {art} |\n'
    open(log, 'w').write(rows + row)
    sh('git', 'add', '-A')
    msg = f'{sym} ({name}) · {summary}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01M56tP6x8We1gSGS3Pogdoo'
    sh('git', 'commit', '-q', '-m', msg)
    sh('git', 'tag', '-a', tag, '-m', f'{sym} ({name}) · {summary}')
    sh('git', 'push', '-q', 'origin', 'main'); sh('git', 'push', '-q', 'origin', tag)
    print('SAVED', tag)
def restore(sym):
    t = tag_for(sym)
    keep = ['CHANGELOG.md', 'release.py', 'elements.json']
    saved = {k: open(k).read() for k in keep if os.path.exists(k)}
    old = set(sh('git', 'ls-tree', '-r', '--name-only', t).split('\n')); now = set(sh('git', 'ls-files').split('\n'))
    for f in now - old - set(keep):
        if f: os.remove(f)
    sh('git', 'checkout', t, '--', '.')
    for k, v in saved.items(): open(k, 'w').write(v)
    print('Files restored from', t, '- now run release.py "Restored', t + '"')
if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--restore': restore(sys.argv[2])
    elif len(sys.argv) > 1: release(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '')
    else: print(__doc__); print('Updates:', ', '.join(tags()) or 'none yet')
