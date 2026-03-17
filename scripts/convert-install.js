#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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

async function main() {
  const args = parseArgs();
  const src = args.src || args.infile;
  if (!src) {
    console.error('Usage: node scripts/convert-install.js --src=C:\\path\\to\\photo.jpg');
    process.exit(1);
  }

  if (!fs.existsSync(src)) {
    console.error('Source file not found:', src);
    process.exit(2);
  }

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'img');
  fs.mkdirSync(outDir, { recursive: true });

  const jpgOut = path.join(outDir, 'profile.jpg');
  const webpOut = path.join(outDir, 'profile.webp');

  try {
    await sharp(src)
      .resize(800, 800, { fit: 'cover', position: 'centre' })
      .rotate()
      .jpeg({ quality: 85, chromaSubsampling: '4:2:0' })
      .toFile(jpgOut);

    await sharp(src)
      .resize(800, 800, { fit: 'cover', position: 'centre' })
      .rotate()
      .webp({ quality: 80 })
      .toFile(webpOut);

    console.log('Wrote:', jpgOut);
    console.log('Wrote:', webpOut);
  } catch (err) {
    console.error('Conversion failed:', err.message);
    process.exit(3);
  }
}

main();
