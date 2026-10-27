# Career Count build rules
- Build with `python3 build.py`. It runs `guard.js` (tap guard) and `interact.js` (actions on saved, read-only account data must change and save) automatically and exits non-zero if any button, option or LabOS control is covered or can't be answered. Never publish a build that failed the guard.
- Before publishing also run `node sweep.js`, `node paytest.js`, `node litest.js`, `node acttest.js`, `node drilltest.js`.
- LabOS: windows must never sit under the Ops board (board z-index 100000; desktop windows use the space beside it; on phones the board steps aside when a window opens). Phone taskbar wraps so every open window stays switchable.
- Data read from the platform database is frozen. All reads go through dbWrap()/thaw() in app.js (cap.db is wrapped). Never call claude.use("db") elsewhere or keep the raw db.
