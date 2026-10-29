# BVTGramaConnect

The BVT Grama Connect public website (served at `/`) and Super Admin console (served at `/console/`): one Next.js app, exported as static files, ported as is from the approved prototypes. Owned by one web developer.

@.claude/project.md
@.claude/architecture.md
@.claude/conventions.md
@.claude/api.md

Read when needed: `.claude/operations.md` (build, run, checking the look, deploy) and `.claude/backlog.md` (open work).

## Always

- Zero visual change in both apps. Only the changes listed in `.claude/conventions.md` are allowed; anything else needs the owner's sign-off.
- Keep the Pages Router and `next build --webpack`: the App Router and Turbopack add inline scripts that the production CSP blocks.
- Never edit `public/_ds/`.
- Data enters only through each component's logic class (`state`, `renderVals()`); `render()` reads `v.<key>`. Every website string has a Telugu and an English entry.
- Commit straight to `dev`; no feature branches in this repo. Never commit `dist/` or `.env`.

## Commands

```
npm ci
npm run build          # dist/ (website) and dist/console/ (console); type-checks first
npm run typecheck      # TypeScript only (strict); must print nothing
npm run dev            # hot reload at http://localhost:3000/ and /console/, on the live server's API and data
                       # (src/proxy.dev.ts forwards /api/ and /media/; GC_DEV_API points it elsewhere)
```
