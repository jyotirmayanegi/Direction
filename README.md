# Direction
it is career direction role centric ai learning app

## Career Count

A learning and career app for Privacy, GRC (governance, risk and compliance) and AI-governance roles: learning paths, role roadmaps, Cyber Lab (LabOS terminal, Shell Quest, daily drill), projects, certifications, job and Gmail application tracker, LinkedIn networking tracker, resume builder, news, and a paid subscription.

It is published as a private claude.ai artifact. This repository is the source.

## Build
```
python3 build.py
```
Joins the `.js` files (order in `build.py`) and `style*.css` into one page at `/home/claude/grc-hub.html` and runs the automatic checks (`guard.js`, `interact.js`). The build stops if any button can't be tapped or saved data can't be changed. `dist/career-count.html` is the latest published build.

## Tests (Playwright)
`guard.js`, `interact.js`, `sweep.js`, `paytest.js`, `litest.js`, `acttest.js`, `drilltest.js`, `questtest.js`. `shot4.js` holds the mock of the claude.ai runtime (database returns frozen data, like the real one).

See `CLAUDE.md` for the build rules.
>>>>>>> cf20bd8 (Career Count source: app, styles, build script and automatic tests)
