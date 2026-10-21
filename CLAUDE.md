# BVTGramaConnect

The BVT Grama Connect public website (`src/`, served at `/`) and Super Admin console (`console/`, served at `/console/`), both ported as is from the approved prototypes. Owned by one web developer.

@.claude/project.md
@.claude/architecture.md
@.claude/conventions.md
@.claude/api.md

Read when needed: `.claude/operations.md` (build, run, visual checks, deploy) and `.claude/backlog.md` (open work).

## Always

- Zero visual change in both apps. Only the changes listed in `.claude/conventions.md` are allowed; anything else needs the owner's sign-off.
- Never edit `shared/support.js`, `shared/vendor/` or `shared/_ds/`. `shared/` holds only files that are identical for both apps.
- Never define `window.__resources`, and never minify or rewrite an `index.html`.
- Console: edit `console/tools/logic.js` or `console/tools/port.py`, never `console/src/index.html`.
- Website: data enters only through the logic class (`state`, `renderVals()`) and `{{ }}` bindings; every string has a Telugu and an English entry.
- Branch from `dev`; never commit `dist/` or `.env`.

## Commands

```
npm ci
npm run build                                   # dist/ (website) and dist/console/ (console)
npm run port:console                            # regenerate console/src/index.html from the prototype + logic.js
# view: run the BackEnd repo's runserver, open http://127.0.0.1:8000/ and /console/
```
