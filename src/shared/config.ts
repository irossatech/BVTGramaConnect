// Build settings, inlined by next.config.ts from the environment or .env (see .env.example).
const config = {
  apiBase: process.env.GC_API_BASE || "/api/v1",
  // The website's public address (no trailing slash): canonical links, the share image and structured data.
  // next.config.ts defaults it to https://bvtgramaconnect.com; public/robots.txt and sitemap.xml name it too.
  siteUrl: process.env.GC_SITE_URL || "",
};

export default config;
