#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const out = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      out[k.replace(/^--/, '')] = v === undefined ? true : v;
    }
  }
  return out;
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const args = parseArgs();
  const outPath = args.out || 'src/assets/img/profile.jpg';

  let base64;
  if (args.infile) {
    base64 = fs.readFileSync(args.infile, 'utf8');
  } else if (!process.stdin.isTTY) {
    base64 = await readStdin();
  } else {
    console.error('Usage: provide Base64 via --infile or stdin. Example:');
    console.error('  node scripts/install-image.js --infile photo.b64 --out src/assets/img/profile-new.jpg');
    process.exit(1);
  }

  base64 = base64.trim();
  base64 = base64.replace(/^data:\w+\/(\w+);base64,/, '');

  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });

  try {
    const buf = Buffer.from(base64, 'base64');
    fs.writeFileSync(outPath, buf);
    console.log('Wrote image to', outPath);
  } catch (err) {
    console.error('Failed to write image:', err.message);
    process.exit(2);
  }
}

main();
