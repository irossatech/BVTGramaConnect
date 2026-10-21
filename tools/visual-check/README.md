# Visual check tools

Screenshots every page of the prototype and of the port at 375 px and 1280 px, then compares them pixel by pixel. Results go to `docs/visual-check/`.

Needs Node 18+, Python with Pillow, and Playwright with Chromium (`npm install playwright` in this folder, then `npx playwright install chromium`).

1. Serve the prototype folder on port 8199: `python -m http.server 8199` inside "BVT Grama Connect mobile prototype".
2. Build this repo (`npm run build`) and run the backend on port 8101: `python manage.py runserver 127.0.0.1:8101` in BVTGramaConnect_BackEnd.
3. Capture: `node tools/visual-check/capture.mjs <shots-folder>`. The two URLs are at the top of `capture.mjs`.
4. Compare: `python tools/visual-check/compare.py <shots-folder> docs/visual-check`.

A pixel counts as different when any colour channel differs by more than 24. The page picks its layout with a ResizeObserver, so a single run can catch it mid-switch; repeat a run that shows a whole-page difference before treating it as real.
