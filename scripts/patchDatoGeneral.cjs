#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const DELAY_MS = 1000;
const DELAY_JITTER = 500;
const BATCH_SIZE = 10;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => DELAY_MS + Math.floor(Math.random() * DELAY_JITTER);

const BROWSER_HEADERS = '-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -H "Accept-Language: es-PE,es;q=0.9" -H "Referer: https://votoinformado.jne.gob.pe/"';

function curlGet(url) {
  try {
    const result = execSync(`curl -sk "${url}" ${BROWSER_HEADERS} -H "Accept: application/json"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(result);
  } catch (e) { return null; }
}

function fetchHojaVida(idHojaVida) {
  const url = `https://apiplataformaelectoral8.jne.gob.pe/api/v1/candidato/hoja-vida?IdHojaVida=${idHojaVida}`;
  return curlGet(url);
}

async function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const candidates = fileData.data || [];

  // Find candidates missing datoGeneral
  const toPatch = candidates.filter(c => !c.datoGeneral && c.idHojaVida);

  if (toPatch.length === 0) {
    console.log(`  ${path.basename(filePath)}: all ${candidates.length} candidates already have datoGeneral, skipping.`);
    return;
  }

  console.log(`  ${path.basename(filePath)}: patching ${toPatch.length}/${candidates.length} candidates...`);

  let patched = 0;
  let failed = 0;

  for (let i = 0; i < toPatch.length; i += BATCH_SIZE) {
    const batch = toPatch.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toPatch.length / BATCH_SIZE);

    process.stdout.write(`\r    Batch ${batchNum}/${totalBatches}...`);

    const results = await Promise.all(batch.map(async (candidate) => {
      const hoja = fetchHojaVida(candidate.idHojaVida);
      if (!hoja?.datoGeneral) return false;

      const g = hoja.datoGeneral;
      candidate.datoGeneral = g;
      candidate.domicilio = {
        departamento: g.domiDepartamento || null,
        provincia: g.domiProvincia || null,
        distrito: g.domiDistrito || null,
      };
      candidate.renunciaEfectuada = hoja.renunciaEfectuada;
      candidate.informacionAdicional = hoja.informacionAdicional;
      return true;
    }));

    patched += results.filter(r => r).length;
    failed += results.filter(r => !r).length;

    if (i + BATCH_SIZE < toPatch.length) {
      await sleep(randomDelay());
    }
  }

  // Save updated file
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
  console.log(`\r    Done: ${patched} patched, ${failed} failed.`);
}

async function patchDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    await patchFile(path.join(dir, file));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'all';
  const region = args[1] || null;

  console.log('=== Patch datoGeneral + domicilio ===');
  console.log(`Type: ${type}${region ? `, Region: ${region}` : ''}\n`);

  if (type === 'presidenciales' || type === 'all') {
    console.log('\n--- Candidatos Presidenciales ---');
    await patchFile(path.join(DATA_DIR, 'candidatosPresidenciales-enriched.json'));
  }

  if (type === 'parlamenAndino' || type === 'all') {
    console.log('\n--- Parlamento Andino ---');
    await patchFile(path.join(DATA_DIR, 'parlamenAndino-enriched.json'));
  }

  if (type === 'senadoresNacional' || type === 'all') {
    console.log('\n--- Senadores Nacional ---');
    await patchFile(path.join(DATA_DIR, 'senadoresNacional-enriched.json'));
  }

  if (type === 'senadoresRegional' || type === 'all') {
    console.log('\n--- Senadores Regional ---');
    if (region) {
      await patchFile(path.join(DATA_DIR, 'senadoresRegional-enriched', `${region}-enriched.json`));
    } else {
      await patchDirectory(path.join(DATA_DIR, 'senadoresRegional-enriched'));
    }
  }

  if (type === 'diputados' || type === 'all') {
    console.log('\n--- Diputados ---');
    if (region) {
      await patchFile(path.join(DATA_DIR, 'diputados-enriched', `${region}-enriched.json`));
    } else {
      await patchDirectory(path.join(DATA_DIR, 'diputados-enriched'));
    }
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
