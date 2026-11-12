// `npm run build` runs this last: writes dist/BUILD-STAMP.md (scripts/build-info.mjs) and makes sure the
// Android APK the website links to is in dist/.
//
// The APK's source copy (public/downloads/) is git-ignored and exists only on the machine that added a new APK;
// `next build` empties dist/ first, so on any other machine the committed APK would vanish from the build.
// It is put back from git here, so a rebuild never drops it.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { STAMP, settings, sourceHash, stampText } from "./build-info.mjs";

const values = settings();
const apk = values.GC_ANDROID_APK_URL;
if (apk.startsWith("/") && !existsSync("dist" + apk)) {
  try {
    execFileSync("git", ["checkout", "HEAD", "--", "dist" + apk], { stdio: "ignore" });
    console.log(`Android APK restored from git: dist${apk}`);
  } catch {
    throw new Error(`dist${apk} is missing: put the APK in public${apk} (README, "Android APK download") and build again`);
  }
}

const source = sourceHash();
writeFileSync(STAMP, stampText(source, values));
console.log(`Build stamp: ${STAMP} (source ${source.hash.slice(0, 12)}, ${values.GC_SITE_URL})`);
