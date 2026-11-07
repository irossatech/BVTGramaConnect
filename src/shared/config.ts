// Build settings, inlined by next.config.ts from the environment or .env (see .env.example).
const config = {
  apiBase: process.env.GC_API_BASE || "/api/v1",
  // The website's public address (no trailing slash): canonical links, the share image and structured data.
  // next.config.ts defaults it to https://www.gramaconnect.com (production); scripts/seo-files.mjs builds robots.txt, sitemap.xml and llms.txt for it.
  siteUrl: process.env.GC_SITE_URL || "",
  // The Android APK the website's "Direct download" link fetches; empty hides the link.
  androidApkUrl: process.env.GC_ANDROID_APK_URL || "",
  // The website's store buttons; empty shows "Coming soon". Set them when the app is published, then rebuild.
  playStoreUrl: process.env.GC_PLAY_STORE_URL || "",
  appStoreUrl: process.env.GC_APP_STORE_URL || "",
};

export default config;
