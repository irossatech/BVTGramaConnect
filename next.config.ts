// Static export into dist/: dist/index.html (website, served at /), dist/console/index.html
// (console, served at /console/), dist/_next/ and the files in public/. The BackEnd repo's
// runserver and deploy/deploy.sh serve these folders unchanged.
//
// The Pages Router is used on purpose: its pages run no inline scripts, so the production
// Content-Security-Policy (script-src 'self') keeps working. The App Router needs 'unsafe-inline'.
//
// Settings come from the environment or .env (see .env.example):
//   GC_API_BASE     API base URL both apps call (default "/api/v1")
//   GC_SITE_URL     the website's public address (default "https://bvtgramaconnect.com")
//   GC_DEV_API      server `npm run dev` forwards /api/ and /media/ to (default: the live server)
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    // `npm run dev` forwards the API through src/proxy.dev.ts. A proxy file cannot be used with the
    // static export, so only the dev server gets the "dev.ts" extension (and no export).
    ...(dev ? { pageExtensions: ["tsx", "ts", "dev.ts"] } : { output: "export" }),
    distDir: dev ? ".next" : "dist", // keep `npm run dev` files out of dist/
    trailingSlash: true,
    reactStrictMode: false, // the ported logic classes run componentDidMount once, as in the prototypes
    images: { unoptimized: true },
    env: {
      GC_API_BASE: process.env.GC_API_BASE || "/api/v1",
      GC_SITE_URL: (process.env.GC_SITE_URL || "https://bvtgramaconnect.com").replace(/\/+$/, ""),
    },
  };
}
