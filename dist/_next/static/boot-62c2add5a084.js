// Website pages: start the app's scripts only after the browser has painted the page, which the build already holds
// in full. Next.js's own <script defer> tags run straight after the HTML is read, and React's start-up then holds
// the first paint for about a second on budget phones. scripts/defer-hydration.mjs publishes this file as
// /_next/static/boot-<hash>.js (where every server already serves scripts, cached for good), replaces those tags with
// it and lists them in data-load (in order); <link rel=preload> already downloads them while the page paints.
//
// Until React has started (Site.tsx adds "gc-ready" to <html>), the page's buttons have no handlers yet: on 2G that is
// several seconds (audit WEB-PERF-001). So a button tapped before then is remembered and tapped again once React is
// ready, and a script that fails to download is fetched again. Nothing on screen changes.
(function () {
  var me = document.currentScript;
  var list = me.getAttribute("data-load").split(" ");
  var legacy = me.getAttribute("data-nomodule");
  if (legacy && !("noModule" in HTMLScriptElement.prototype)) list.unshift(legacy);
  var root = document.documentElement;

  // ---- a button tapped before React is ready ----
  var READY = "gc-ready";
  var KEEP_MS = 15000; // a tap older than this when React gets ready is dropped: the visitor has moved on
  var GIVE_UP_MS = 10000; // all scripts here but still not ready (a page without the site, or an error): stop waiting
  var waiting = true;
  var tapped = null;
  var tappedAt = 0;
  function ready() {
    return root.classList.contains(READY);
  }
  function stopWaiting() {
    waiting = false;
    tapped = null;
    window.removeEventListener("click", onEarlyClick, true);
    if (watch) watch.disconnect();
  }
  // Capture phase on window, before React's own listener on the page: React never sees this tap, so the replay below
  // is the only time it runs (no double toggle). Links are left alone: they work without scripts.
  function onEarlyClick(e) {
    if (!waiting || ready()) return;
    var el = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!el || el.disabled) return;
    e.stopPropagation();
    tapped = el; // only the last tap: tapping the menu twice still means "open the menu"
    tappedAt = Date.now();
  }
  window.addEventListener("click", onEarlyClick, true);
  function replay() {
    var el = tapped;
    var fresh = el && Date.now() - tappedAt <= KEEP_MS;
    stopWaiting();
    // The same button, still on the page (React reuses the page's own elements when it starts).
    if (fresh && el.isConnected && !el.disabled) el.click();
  }
  var watch = window.MutationObserver
    ? new MutationObserver(function () {
        // A task later, so React has finished the updates it makes as it starts (the page from the address, the width).
        if (ready() && waiting) setTimeout(replay, 0);
      })
    : null;
  if (watch) watch.observe(root, { attributes: true, attributeFilter: ["class"] });
  else stopWaiting(); // very old browsers: no replay, as before

  // ---- the scripts, in order; one that fails is fetched again ----
  var RETRY_MS = [2000, 6000]; // two more tries, a little apart: on a weak signal the next one often gets through
  var pending = list.length;
  function settled() {
    pending -= 1;
    if (pending === 0)
      setTimeout(function () {
        if (waiting && !ready()) stopWaiting();
      }, GIVE_UP_MS);
  }
  function add(src, attempt) {
    var s = document.createElement("script");
    s.src = src;
    s.async = false; // run in the listed order, like the defer tags did
    s.onload = settled;
    s.onerror = function () {
      if (s.parentNode) s.parentNode.removeChild(s);
      // Next.js's chunks wait for the ones they need, so a chunk that arrives late still starts the page.
      if (attempt < RETRY_MS.length)
        setTimeout(function () {
          add(src, attempt + 1);
        }, RETRY_MS[attempt]);
      else settled();
    };
    document.head.appendChild(s);
  }
  function load() {
    list.forEach(function (src) {
      add(src, 0);
    });
  }
  // Right after the browser reports its first contentful paint; after 3 s anyway (a background tab never paints,
  // and very old browsers have no paint timing).
  var started = false;
  function start() {
    if (started) return;
    started = true;
    load();
  }
  try {
    new PerformanceObserver(function (l) {
      if (l.getEntries().some(function (e) { return e.name === "first-contentful-paint"; })) setTimeout(start, 0);
    }).observe({ type: "paint", buffered: true });
  } catch (e) {
    requestAnimationFrame(function () { setTimeout(start, 0); });
  }
  setTimeout(start, 3000);
})();
