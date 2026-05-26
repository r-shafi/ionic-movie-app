// Reads android/app/build.gradle, increments versionCode, and syncs versionName
// with package.json. Called by the release workflow before building the APK.
const fs = require("fs");
const isSyncOnly = process.argv.includes("--sync-only");
const gradlePath = "android/app/build.gradle";
const packageJsonPath = "package.json";

let content = fs.readFileSync(gradlePath, "utf8");

const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
if (!versionCodeMatch) {
  console.error("versionCode not found in " + gradlePath);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
if (!packageJson.version || !/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
  console.error("Valid semver version not found in " + packageJsonPath);
  process.exit(1);
}

const currentVersionCode = parseInt(versionCodeMatch[1], 10);
const nextVersionCode = isSyncOnly
  ? currentVersionCode
  : currentVersionCode + 1;
if (!isSyncOnly) {
  content = content.replace(
    /versionCode\s+\d+/,
    `versionCode ${nextVersionCode}`,
  );
}

if (!/versionName\s+"[^"]+"/.test(content)) {
  console.error("versionName not found in " + gradlePath);
  process.exit(1);
}
content = content.replace(
  /versionName\s+"[^"]+"/,
  `versionName "${packageJson.version}"`,
);

fs.writeFileSync(gradlePath, content);
console.log(
  `Android version synced: versionCode ${nextVersionCode}${
    isSyncOnly ? " (unchanged)" : ""
  }, versionName ${packageJson.version}`,
);
