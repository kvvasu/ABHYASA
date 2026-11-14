// Fail if the static build contains private lesson data or server secrets.
// Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
const patterns = [
  ['YouTube reference', /youtube\.com|youtu\.be|youtubeVideoId/i],
  ['video ID field', /\bvideoId\b/],
  ['R2 host', /r2\.dev|\.r2\.cloudflarestorage\.com/i],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Firebase secret', /FIREBASE_(PRIVATE_KEY|CLIENT_EMAIL)/],
  ['Razorpay secret', /RAZORPAY_(KEY_SECRET|WEBHOOK_SECRET)/],
  ['OAuth secret', /GITHUB_OAUTH_CLIENT_SECRET|OAUTH_STATE_SECRET/],
  ['GitHub token', /\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

let files;
try {
  files = walk(root);
} catch {
  console.error(`${root}/ is missing. Run npm run build first.`);
  process.exit(1);
}

const findings = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const [label, pattern] of patterns) {
    if (pattern.test(source)) findings.push(`${file}: ${label}`);
  }
}

if (findings.length > 0) {
  console.error('Private data found in the static build:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Scanned ${files.length} files in ${root}/. No private lesson data or secrets found.`);
