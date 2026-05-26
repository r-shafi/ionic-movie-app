// Reads android/app/build.gradle, increments versionCode by 1, writes back.
// Called by the release workflow before building the APK.
const fs = require("fs");
const path = "android/app/build.gradle";
let content = fs.readFileSync(path, "utf8");
const match = content.match(/versionCode\s+(\d+)/);
if (!match) {
  console.error("versionCode not found in " + path);
  process.exit(1);
}
const next = parseInt(match[1]) + 1;
content = content.replace(/versionCode\s+\d+/, `versionCode ${next}`);
fs.writeFileSync(path, content);
console.log(`versionCode bumped to ${next}`);
