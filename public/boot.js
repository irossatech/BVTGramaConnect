// Website pages: start the app's scripts only after the browser has painted the page, which the build already holds
// in full. Next.js's own <script defer> tags run straight after the HTML is read, and React's start-up then holds
// the first paint for about a second on budget phones. scripts/defer-hydration.mjs replaces those tags with this
// file and lists them in data-load (in order); <link rel=preload> already downloads them while the page paints.
(function () {
  var me = document.currentScript;
  var list = me.getAttribute("data-load").split(" ");
  var legacy = me.getAttribute("data-nomodule");
  if (legacy && !("noModule" in HTMLScriptElement.prototype)) list.unshift(legacy);
  function load() {
    list.forEach(function (src) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false; // run in the listed order, like the defer tags did
      document.head.appendChild(s);
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
