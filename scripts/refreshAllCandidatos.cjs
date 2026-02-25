#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const JNE_FOTO = "https://mpesije.jne.gob.pe/apidocs/";
const ID_PROCESO_ELECTORAL = 124;
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const DELAY_MS = 1000; // Delay between batches to avoid rate limiting
const DELAY_JITTER = 500; // Random extra delay (0-0.5s)
const BATCH_SIZE = 10; // Process 10 candidates concurrently
const DEFAULT_REFRESH_INTERVAL_DAYS = 2; // Only refresh if data is older than 1 day

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => DELAY_MS + Math.floor(Math.random() * DELAY_JITTER);

// Browser-like headers to avoid CAPTCHA
const BROWSER_HEADERS = '-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -H "Accept-Language: es-PE,es;q=0.9" -H "Referer: https://votoinformado.jne.gob.pe/"';

function curlGet(url) {
  try {
    const result = execSync(`curl -sk "${url}" ${BROWSER_HEADERS} -H "Accept: application/json"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(result);
  } catch (e) { return null; }
}

async function fetchHojaVida(idHojaVida) {
  return curlGet(`https://apiplataformaelectoral8.jne.gob.pe/api/v1/candidato/hoja-vida?IdHojaVida=${idHojaVida}`);
}

async function fetchResoluciones(idHojaVida) {
  return curlGet(`https://apiplataformaelectoral8.jne.gob.pe/api/v1/candidato/resoluciones?IdHojaVida=${idHojaVida}`);
}

function extractFlags(hoja) {
  const cargosEleccion = hoja.trayectoria?.cargoEleccion || [];
  const isCurrent = (c) => ['2025', '2026', 2025, 2026].includes(c.anioCargoElecHasta);
  return {
    congresistaActual: cargosEleccion.some(c => c.cargoEleccion?.includes('CONGRESISTA') && isCurrent(c)),
    exCongresista: cargosEleccion.some(c => c.cargoEleccion?.includes('CONGRESISTA') && !isCurrent(c)),
    exAlcalde: cargosEleccion.some(c => c.cargoEleccion?.includes('ALCALDE')),
    exGobernador: cargosEleccion.some(c => c.cargoEleccion?.includes('GOBERNADOR')),
    exMinistro: cargosEleccion.some(c => c.cargoEleccion?.includes('MINISTRO')),
    cargosAnteriores: cargosEleccion.map(c => `${c.cargoEleccion} (${c.anioCargoElecDesde}-${c.anioCargoElecHasta})`),
    sentenciaPenal: (hoja.sentenciaPenal?.length || 0) > 0,
    sentenciaPenalDetalle: hoja.sentenciaPenal || [],
    sentenciaObliga: (hoja.sentenciaObliga?.length || 0) > 0,
    sentenciaObligaDetalle: hoja.sentenciaObliga || []
  };
}

function extractResumen(hoja) {
  const edu = hoja.formacionAcademica;
  const posgrado = edu?.educacionPosgrado?.[0];
  const uni = edu?.educacionUniversitaria?.[0];
  const ingresos = hoja.declaracionJurada?.ingreso?.[0];
  return {
    educacionMax: posgrado?.txEspecialidadPosgrado || uni?.carreraUni || null,
    institucion: posgrado?.txCenEstudioPosgrado || uni?.universidad || null,
    ingresos2024: ingresos?.totalIngresos || 0,
    experienciaActual: hoja.experienciaLaboral?.[0]?.ocupacionProfesion || null
  };
}

async function refreshCandidato(existingData) {
  try {
    // Use existing idHojaVida to fetch fresh data
    const hoja = await fetchHojaVida(existingData.idHojaVida);
    if (!hoja?.datoGeneral) {
      console.error(` [SKIP] No hoja de vida found for idHojaVida ${existingData.idHojaVida}`);
      return null;
    }
    const resoluciones = await fetchResoluciones(existingData.idHojaVida);
    const general = hoja.datoGeneral;

    // Return existing data with updated fields
    return {
      ...existingData, // Preserve all existing data
      estado: general.estado,
      domicilio: {
        departamento: general.domiDepartamento || null,
        provincia: general.domiProvincia || null,
        distrito: general.domiDistrito || null,
      },
      datoGeneral: general,
      flags: extractFlags(hoja),
      renunciaEfectuada: hoja.renunciaEfectuada,
      informacionAdicional: hoja.informacionAdicional,
      resoluciones: resoluciones?.data || [],
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error(`Error refreshing ${existingData.dni}:`, err.message);
    return null;
  }
}

function saveCheckpoint(outputFile, dataByDni) {
  const checkpointData = Array.from(dataByDni.values());
  const output = {
    fetchedAt: new Date().toISOString(),
    idProcesoElectoral: ID_PROCESO_ELECTORAL,
    count: checkpointData.length,
    data: checkpointData
  };
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
}

async function refreshFile(inputFile, outputFile, dniField = 'strDocumentoIdentidad', refreshIntervalDays = DEFAULT_REFRESH_INTERVAL_DAYS) {
  console.log(`\nRefreshing: ${path.basename(outputFile)}`);

  // Load existing enriched data
  let existing = [];
  if (fs.existsSync(outputFile)) {
    const existingData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    existing = existingData.data || [];
  }

  if (existing.length === 0) {
    console.log('  No existing enriched data found, skipping.');
    return;
  }

  // Build a map for fast lookup by DNI
  const dataByDni = new Map();
  for (const c of existing) {
    dataByDni.set(c.dni, c);
  }

  // Filter candidates that need refreshing
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - refreshIntervalDays * 24 * 60 * 60 * 1000);

  const candidatesToRefresh = existing.filter(candidate => {
    const lastFetched = new Date(candidate.fetchedAt || '1970-01-01');
    return lastFetched < cutoffDate;
  });

  const freshCount = existing.length - candidatesToRefresh.length;
  console.log(`  Total: ${existing.length} | Fresh: ${freshCount} | Stale: ${candidatesToRefresh.length}`);

  if (candidatesToRefresh.length === 0) {
    console.log(`  All candidates are recent (within ${refreshIntervalDays} day(s)), skipping.`);
    return;
  }

  // Sort candidates by idHojaVida for better distribution
  const sortedCandidates = candidatesToRefresh.sort((a, b) => a.idHojaVida - b.idHojaVida);
  const totalBatches = Math.ceil(sortedCandidates.length / BATCH_SIZE);
  let refreshedCount = 0;
  let failedCount = 0;

  // Process candidates in batches, saving after each batch
  for (let i = 0; i < sortedCandidates.length; i += BATCH_SIZE) {
    const batch = sortedCandidates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`\n  Batch ${batchNum}/${totalBatches}: Processing ${batch.length} candidates`);

    // Process batch concurrently
    const batchPromises = batch.map(async (candidate) => {
      const data = await refreshCandidato(candidate);
      if (data) {
        console.log(`    ✓ ${candidate.dni} - ${data.estado}`);
        return data;
      } else {
        console.log(`    ✗ ${candidate.dni} - failed`);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);

    // Merge results into the map immediately
    for (const result of batchResults) {
      if (result) {
        dataByDni.set(result.dni, result);
        refreshedCount++;
      } else {
        failedCount++;
      }
    }

    // Save checkpoint after each batch
    saveCheckpoint(outputFile, dataByDni);
    console.log(`    [checkpoint] saved ${refreshedCount}/${candidatesToRefresh.length} refreshed`);

    // Small delay between batches
    if (i + BATCH_SIZE < sortedCandidates.length) {
      await sleep(randomDelay());
    }
  }

  console.log(`\n  Done: ${refreshedCount} refreshed, ${failedCount} failed, ${freshCount} already fresh`);
}

async function refreshDirectory(inputDir, outputDir, refreshIntervalDays = DEFAULT_REFRESH_INTERVAL_DAYS) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    await refreshFile(
      path.join(inputDir, file),
      path.join(outputDir, file.replace('.json', '-enriched.json')),
      'strDocumentoIdentidad',
      refreshIntervalDays
    );
  }
}

// Graceful shutdown handler
let interrupted = false;
process.on('SIGINT', () => {
  if (interrupted) process.exit(1); // Second Ctrl+C forces exit
  interrupted = true;
  console.log('\n\n  ⚠ Interrupted! Progress has been saved. Re-run the same command to resume.\n');
  process.exit(0);
});

async function main() {
  const args = process.argv.slice(2);
  const type = args.find(a => !a.startsWith('--')) || 'all';
  const region = args.find(arg => arg.startsWith('--region='))?.split('=')[1];
  const force = args.includes('--force');
  const refreshIntervalDays = force ? 0 : DEFAULT_REFRESH_INTERVAL_DAYS;

  console.log(`=== Smart Candidate Status Refresh ===`);
  console.log(`Type: ${type}, Region: ${region || 'all'}, Refresh Interval: ${refreshIntervalDays} day(s)${force ? ' (FORCE)' : ''}`);
  console.log(`Checkpoint: saves after each batch — safe to interrupt with Ctrl+C\n`);

  if (type === 'parlamenAndino' || type === 'all') {
    await refreshFile(
      path.join(DATA_DIR, 'parlamenAndino.json'),
      path.join(DATA_DIR, 'parlamenAndino-enriched.json'),
      'strDocumentoIdentidad',
      refreshIntervalDays
    );
  }

  if (type === 'senadoresNacional' || type === 'all') {
    await refreshFile(
      path.join(DATA_DIR, 'senadoresNacional.json'),
      path.join(DATA_DIR, 'senadoresNacional-enriched.json'),
      'strDocumentoIdentidad',
      refreshIntervalDays
    );
  }

  if (type === 'senadoresRegional' || type === 'all') {
    if (region) {
      const inputFile = path.join(DATA_DIR, 'senadoresRegional', `${region}.json`);
      const outputDir = path.join(DATA_DIR, 'senadoresRegional-enriched');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      await refreshFile(inputFile, path.join(outputDir, `${region}-enriched.json`), 'strDocumentoIdentidad', refreshIntervalDays);
    } else {
      await refreshDirectory(path.join(DATA_DIR, 'senadoresRegional'), path.join(DATA_DIR, 'senadoresRegional-enriched'), refreshIntervalDays);
    }
  }

  if (type === 'diputados' || type === 'all') {
    if (region) {
      const inputFile = path.join(DATA_DIR, 'diputados', `${region}.json`);
      const outputDir = path.join(DATA_DIR, 'diputados-enriched');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      await refreshFile(inputFile, path.join(outputDir, `${region}-enriched.json`), 'strDocumentoIdentidad', refreshIntervalDays);
    } else {
      await refreshDirectory(path.join(DATA_DIR, 'diputados'), path.join(DATA_DIR, 'diputados-enriched'), refreshIntervalDays);
    }
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
