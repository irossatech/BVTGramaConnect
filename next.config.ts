// Static export into dist/: dist/index.html (website, served at /), dist/console/index.html
// (console, served at /console/), dist/_next/ and the files in public/. The BackEnd repo's
// runserver and deploy/deploy.sh serve these folders unchanged.
//
// The Pages Router is used on purpose: its pages run no inline scripts, so the production
// Content-Security-Policy (script-src 'self') keeps working. The App Router needs 'unsafe-inline'.
//
// Settings come from the environment or .env (see .env.example):
//   GC_API_BASE     API base URL both apps call (default "/api/v1")
//   GC_SITE_URL     the website's public address (default "https://www.gramaconnect.com", production)
//   GC_ANDROID_APK_URL  the "Direct download" link (default "/downloads/bvt-grama-connect.apk", production)
//   GC_DEV_API      server `npm run dev` forwards /api/ and /media/ to (.env.example: the live server; a red
//                   "LIVE DATA" warning is printed when `npm run dev` starts against it, audit WEB-SEC-004)
// The defaults are production's: the committed dist/ is what the server deploys (`npm run check-dist`).
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// `npm run dev` against the live site: everything saved in the local console changes production. Say so loudly when
// the dev server starts (owner's choice of 14 Nov 2026, audit WEB-SEC-004, option C: keep production possible, warn).
// Printed once: the env flag is inherited by the dev server's worker processes, which load this file again.
function warnIfLiveData() {
  if (process.env.GC_LIVE_WARNED) return;
  process.env.GC_LIVE_WARNED = "1";
  const host = (url: string | undefined) => {
    try {
      return url ? new URL(url).hostname.replace(/^www\./, "") : "";
    } catch {
      return "";
    }
  };
  const target = process.env.GC_DEV_API;
  if (!target || host(target) !== host(process.env.GC_SITE_URL || "https://www.gramaconnect.com")) return;
  const line = "=".repeat(68);
  const red = (s: string) => `\x1b[41m\x1b[97m\x1b[1m${s.padEnd(68)}\x1b[0m`;
  console.warn(
    ["", red(line), red("  LIVE DATA: npm run dev is using " + target), red("  The console here changes production: blocks and deletes are real."),
      red("  For safe work set GC_DEV_API in .env to a test server or a local"), red("  backend (http://127.0.0.1:8000), then restart npm run dev."), red(line), ""].join("\n"),
  );
}

export default function nextConfig(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  if (dev) warnIfLiveData();
  return {
    // `npm run dev` forwards the API through src/proxy.dev.ts. A proxy file cannot be used with the
    // static export, so only the dev server gets the "dev.ts" extension (and no export).
    ...(dev ? { pageExtensions: ["tsx", "ts", "dev.ts"] } : { output: "export" }),
    distDir: dev ? ".next" : "dist", // keep `npm run dev` files out of dist/
    trailingSlash: true,
    devIndicators: false, // no Next.js "N" badge over the page in `npm run dev` (it never ships in the build)
    reactStrictMode: false, // the ported logic classes run componentDidMount once, as in the prototypes
    images: { unoptimized: true },
    env: {
      GC_API_BASE: process.env.GC_API_BASE || "/api/v1",
      GC_SITE_URL: (process.env.GC_SITE_URL || "https://www.gramaconnect.com").replace(/\/+$/, ""),
      // Production's APK unless set; GC_ANDROID_APK_URL= (empty) hides the link. Same rule in scripts/build-info.mjs.
      GC_ANDROID_APK_URL: process.env.GC_ANDROID_APK_URL ?? "/downloads/bvt-grama-connect.apk",
      GC_PLAY_STORE_URL: process.env.GC_PLAY_STORE_URL || "",
      GC_APP_STORE_URL: process.env.GC_APP_STORE_URL || "",
    },
  };
}
