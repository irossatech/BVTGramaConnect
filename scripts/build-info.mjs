// Shared by scripts/build-stamp.mjs (end of `npm run build`) and scripts/check-dist.mjs (`npm run check-dist`).
// The server deploys the committed dist/ as it is (BackEnd deploy/deploy.sh), so dist/ must be built from the
// committed source with the production settings. dist/BUILD-STAMP.md records both; deploy.sh skips *.md files,
// so the stamp is committed but never served.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

export const STAMP = "dist/BUILD-STAMP.md";

// Everything that changes what the build writes. dist/ itself is not in the list.
const SOURCES = ["src", "public", "scripts", "next.config.ts", "package.json", "package-lock.json", "tsconfig.json"];

/** The build settings as next.config.ts reads them: the environment first, then .env, then the defaults. */
export function settings() {
  try {
    process.loadEnvFile(".env"); // never overrides real environment variables
  } catch {}
  const env = process.env;
  return {
    GC_API_BASE: env.GC_API_BASE || "/api/v1",
    GC_SITE_URL: (env.GC_SITE_URL || "https://www.gramaconnect.com").replace(/\/+$/, ""),
    GC_ANDROID_APK_URL: env.GC_ANDROID_APK_URL ?? "/downloads/bvt-grama-connect.apk",
    GC_PLAY_STORE_URL: env.GC_PLAY_STORE_URL || "",
    GC_APP_STORE_URL: env.GC_APP_STORE_URL || "",
  };
}

/** The values a production build must have (the rest may differ, such as store links before the app is published). */
export const PRODUCTION = {
  GC_API_BASE: "/api/v1",
  GC_SITE_URL: "https://www.gramaconnect.com",
  GC_ANDROID_APK_URL: "/downloads/bvt-grama-connect.apk",
};

/**
 * One fingerprint of the source: every tracked or new (not ignored) file under SOURCES, with Windows line
 * endings counted as Unix ones, so a Windows checkout and the Linux CI agree.
 */
export function sourceHash() {
  const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...SOURCES], { encoding: "utf8" })
    .split("\0")
    .filter((f) => f && existsSync(f))
    .sort();
  const hash = createHash("sha256");
  for (const f of [...new Set(files)]) {
    const text = readFileSync(f).toString("latin1").replace(/\r\n/g, "\n");
    hash.update(f + "\0" + text.length + "\0").update(text, "latin1");
  }
  return { hash: hash.digest("hex"), files: files.length };
}

/** The stamp's text. Nothing time-based, so building the same source twice writes the same stamp. */
export function stampText(source, values) {
  return [
    "# Build stamp",
    "",
    "Written by `npm run build`; checked by `npm run check-dist`. Not deployed (deploy.sh skips *.md).",
    "",
    `source: ${source.hash} (${source.files} files)`,
    ...Object.entries(values).map(([k, v]) => `${k}: ${v}`),
    "",
  ].join("\n");
}

/** Reads the stamp back into {source, GC_*}. */
export function readStamp() {
  if (!existsSync(STAMP)) return null;
  const out = {};
  for (const line of readFileSync(STAMP, "utf8").split(/\r?\n/)) {
    const m = line.match(/^(source|GC_[A-Z_]+): ?(\S*)/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}
