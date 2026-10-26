// Static export into dist/: dist/index.html (website, served at /), dist/console/index.html
// (console, served at /console/), dist/_next/ and the files in public/. The BackEnd repo's
// runserver and deploy/deploy.sh serve these folders unchanged.
//
// The Pages Router is used on purpose: its pages run no inline scripts, so the production
// Content-Security-Policy (script-src 'self') keeps working. The App Router needs 'unsafe-inline'.
//
// Settings come from the environment or .env (see .env.example):
//   GC_API_BASE     API base URL both apps call (default "/api/v1")
//   GC_CONSOLE_URL  where the website's "Admin Login" leads (default "/console/")
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const nextConfig = (phase) => ({
  output: "export",
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : "dist", // keep `npm run dev` files out of dist/
  trailingSlash: true,
  reactStrictMode: false, // the ported logic classes run componentDidMount once, as in the prototypes
  images: { unoptimized: true },
  env: {
    GC_API_BASE: process.env.GC_API_BASE || "/api/v1",
    GC_CONSOLE_URL: process.env.GC_CONSOLE_URL || "/console/",
  },
});

export default nextConfig;
