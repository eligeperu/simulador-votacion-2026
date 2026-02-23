#!/usr/bin/env node
/**
 * Downloads all political party logos from JNE and saves them locally.
 * This avoids the JNE server's no-cache headers that force fresh downloads every time.
 *
 * Usage: node scripts/downloadLogos.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const JNE_LOGO_BASE = 'https://sroppublico.jne.gob.pe/Consulta/Simbolo/GetSimbolo/';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'logos');

// All unique idOrg values from partidosParlamentarios
const PARTY_IDS = [
  3025, 2869, 2941, 2901, 2895, 2961, 2932, 2921, 2967, 2935,
  2956, 2857, 2218, 2968, 2931, 1264, 2731, 2986, 2898, 2985,
  1366, 1257, 2995, 2980, 2933, 2998, 2173, 2924, 2925, 2927,
  14, 2930, 22, 4, 2867, 3024, 2939, 3023, 2840
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (err) => { fs.unlinkSync(dest); reject(err); });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Downloading ${PARTY_IDS.length} party logos to ${OUTPUT_DIR}...`);
  let ok = 0, fail = 0;

  for (const id of PARTY_IDS) {
    const url = `${JNE_LOGO_BASE}${id}`;
    const dest = path.join(OUTPUT_DIR, `${id}.jpg`);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`  ✓ ${id}.jpg (${(size / 1024).toFixed(1)} KB)`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${id}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

main();
