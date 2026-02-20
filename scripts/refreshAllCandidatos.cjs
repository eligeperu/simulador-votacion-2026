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

async function curlPost(url, body, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      fs.writeFileSync('/tmp/jne-body.json', JSON.stringify(body));
      const result = execSync(`curl -sk -X POST "${url}" ${BROWSER_HEADERS} -H "Content-Type: application/json" -H "Accept: application/json" -d @/tmp/jne-body.json --max-time 30 --retry 2`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      if (!result.trim()) {
        console.error(`  POST error: Empty response (attempt ${i + 1}/${retries})`);
        if (i < retries - 1) {
          await sleep(5000); // Wait 5s before retry
          continue;
        }
        return null;
      }
      return JSON.parse(result);
    } catch (e) {
      console.error(`  POST error: ${e.message} (attempt ${i + 1}/${retries})`);
      if (i < retries - 1) {
        await sleep(5000); // Wait 5s before retry
        continue;
      }
      return null;
    }
  }
  return null;
}

async function buscarCandidato(dni) {
  return await curlPost(`https://apiplataformaelectoral8.jne.gob.pe/api/v1/candidato/buscar-candidato`, { numeroDocumento: dni });
}

function fetchHojaVida(idHojaVida) {
  return curlGet(`https://apiplataformaelectoral8.jne.gob.pe/api/v1/candidato/hoja-vida?IdHojaVida=${idHojaVida}`);
}

function fetchResoluciones(idHojaVida) {
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
    const hoja = fetchHojaVida(existingData.idHojaVida);
    if (!hoja?.datoGeneral) {
      console.error(` [SKIP] No hoja de vida found for idHojaVida ${existingData.idHojaVida}`);
      return null;
    }
    const resoluciones = fetchResoluciones(existingData.idHojaVida);
    const general = hoja.datoGeneral;
    
    // Return existing data with updated estado and fresh flags
    return {
      ...existingData, // Preserve all existing data
      estado: general.estado, // Update only the status
      flags: extractFlags(hoja), // Update flags in case they changed
      resoluciones: resoluciones?.data || [], // Update resolutions
      fetchedAt: new Date().toISOString() // Track when this was refreshed
    };
  } catch (err) {
    console.error(`Error refreshing ${existingData.dni}:`, err.message);
    return null;
  }
}

async function refreshFile(inputFile, outputFile, dniField = 'strDocumentoIdentidad') {
  console.log(`\nRefreshing: ${inputFile}`);
  
  // Load existing enriched data
  let existing = [];
  if (fs.existsSync(outputFile)) {
    const existingData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    existing = existingData.data || [];
  }
  
  console.log(`Found ${existing.length} candidates to refresh`);
  
  if (existing.length === 0) {
    console.log('  No existing enriched data found, skipping.');
    return;
  }
  
  // Sort candidates by idHojaVida for better distribution
  const sortedCandidates = existing.sort((a, b) => a.idHojaVida - b.idHojaVida);
  
  // Process candidates in batches for speed
  const refreshed = [];
  for (let i = 0; i < sortedCandidates.length; i += BATCH_SIZE) {
    const batch = sortedCandidates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(sortedCandidates.length / BATCH_SIZE);
    
    console.log(`\n  Batch ${batchNum}/${totalBatches}: Processing ${batch.length} candidates`);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (candidate, idx) => {
      const data = await refreshCandidato(candidate);
      if (data) {
        console.log(`    ✓ ${candidate.dni} - ${candidate.estado}`);
        return data;
      } else {
        console.log(`    ✗ ${candidate.dni} - failed`);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    refreshed.push(...batchResults.filter(r => r !== null));
    
    // Small delay between batches
    if (i + BATCH_SIZE < sortedCandidates.length) {
      await sleep(randomDelay());
    }
  }
  
  const output = { 
    fetchedAt: new Date().toISOString(), 
    idProcesoElectoral: ID_PROCESO_ELECTORAL, 
    count: refreshed.length, 
    data: refreshed 
  };
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n  Refreshed ${refreshed.length} candidates to ${outputFile}`);
}

async function refreshDirectory(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    await refreshFile(
      path.join(inputDir, file),
      path.join(outputDir, file.replace('.json', '-enriched.json'))
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'all';
  const region = args.find(arg => arg.startsWith('--region='))?.split('=')[1];

  console.log(`=== Refresh Candidate Statuses ===`);
  console.log(`Type: ${type}, Region: ${region || 'all'}\n`);
  
  if (type === 'parlamenAndino' || type === 'all') {
    await refreshFile(
      path.join(DATA_DIR, 'parlamenAndino.json'),
      path.join(DATA_DIR, 'parlamenAndino-enriched.json')
    );
  }
  
  if (type === 'senadoresNacional' || type === 'all') {
    await refreshFile(
      path.join(DATA_DIR, 'senadoresNacional.json'),
      path.join(DATA_DIR, 'senadoresNacional-enriched.json')
    );
  }
  
  if (type === 'senadoresRegional' || type === 'all') {
    if (region) {
      const inputFile = path.join(DATA_DIR, 'senadoresRegional', `${region}.json`);
      const outputDir = path.join(DATA_DIR, 'senadoresRegional-enriched');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      await refreshFile(inputFile, path.join(outputDir, `${region}-enriched.json`));
    } else {
      await refreshDirectory(path.join(DATA_DIR, 'senadoresRegional'), path.join(DATA_DIR, 'senadoresRegional-enriched'));
    }
  }
  
  if (type === 'diputados' || type === 'all') {
    if (region) {
      const inputFile = path.join(DATA_DIR, 'diputados', `${region}.json`);
      const outputDir = path.join(DATA_DIR, 'diputados-enriched');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      await refreshFile(inputFile, path.join(outputDir, `${region}-enriched.json`));
    } else {
      await refreshDirectory(path.join(DATA_DIR, 'diputados'), path.join(DATA_DIR, 'diputados-enriched'));
    }
  }
  
  console.log('\n=== Done ===');
}

main().catch(console.error);
