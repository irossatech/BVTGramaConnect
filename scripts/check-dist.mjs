// `npm run check-dist`: run before committing, and in CI. The server deploys the committed dist/ as it is, so
// this fails when dist/ was not rebuilt after a source change, was built with other than the production settings,
// or misses a page or the Android APK. It does not build; it reads dist/BUILD-STAMP.md (scripts/build-info.mjs).
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { PRODUCTION, readStamp, sourceHash } from "./build-info.mjs";

const problems = [];
const stamp = readStamp();

if (!stamp) {
  problems.push("dist/BUILD-STAMP.md is missing: run npm run build");
} else {
  if (stamp.source !== sourceHash().hash) problems.push("dist/ is out of date: the source changed since the last build. Run npm run build");
  for (const [key, want] of Object.entries(PRODUCTION)) {
    if (stamp[key] !== want) problems.push(`dist/ was built with ${key}=${stamp[key] || "(empty)"}; production needs ${want}. Set it and run npm run build`);
  }
}

for (const page of ["index.html", "console/index.html", "howitworks/index.html", "404.html", "sitemap.xml", "robots.txt"]) {
  if (!existsSync("dist/" + page)) problems.push(`dist/${page} is missing: run npm run build`);
}
const apk = "dist" + PRODUCTION.GC_ANDROID_APK_URL;
if (!existsSync(apk) || statSync(apk).size < 1_000_000) problems.push(`${apk} is missing or too small`);

if (problems.length) {
  console.error("dist/ is not ready to deploy:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}

// The build renames its chunks every time, so old files are deleted and new ones appear: commit them all.
let pending = "";
try {
  pending = execFileSync("git", ["status", "--porcelain", "--", "dist"], { encoding: "utf8" }).trim();
} catch {}
console.log("dist/ matches the source and has the production settings.");
if (pending) console.log(`${pending.split("\n").length} files in dist/ are not committed yet: commit them with git add -A dist`);
