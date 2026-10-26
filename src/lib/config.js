// Build settings, inlined by next.config.mjs from the environment or .env (see .env.example).
const config = {
  apiBase: process.env.GC_API_BASE || "/api/v1",
  consoleUrl: process.env.GC_CONSOLE_URL || "/console/",
};

export default config;
