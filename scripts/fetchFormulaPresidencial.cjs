#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const JNE_FOTO = "https://mpesije.jne.gob.pe/apidocs/";
const ID_PROCESO_ELECTORAL = 124;
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'formulaPresidencial.json');
const DELAY_MS = 1500;
const DELAY_JITTER = 500;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => DELAY_MS + Math.floor(Math.random() * DELAY_JITTER);

const BROWSER_HEADERS = '-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -H "Accept-Language: es-PE,es;q=0.9" -H "Referer: https://votoinformado.jne.gob.pe/"';

// All parties from candidatos.js
const PARTIDOS = [
  { id: 1, siglas: "AV", idOrg: 3025 },
  { id: 2, siglas: "PPP", idOrg: 2869 },
  { id: 3, siglas: "PCO", idOrg: 2941 },
  { id: 4, siglas: "FREPAP", idOrg: 2901 },
  { id: 5, siglas: "PDV", idOrg: 2895 },
  { id: 6, siglas: "PBG", idOrg: 2961 },
  { id: 7, siglas: "PA", idOrg: 2932 },
  { id: 8, siglas: "PRIN", idOrg: 2921 },
  { id: 9, siglas: "PRO", idOrg: 2967 },
  { id: 10, siglas: "SC", idOrg: 2935 },
  { id: 11, siglas: "PPT", idOrg: 2956 },
  { id: 12, siglas: "FE", idOrg: 2857 },
  { id: 13, siglas: "PL", idOrg: 2218 },
  { id: 14, siglas: "CPP", idOrg: 2968 },
  { id: 15, siglas: "PLG", idOrg: 2931 },
  { id: 16, siglas: "JPP", idOrg: 1264 },
  { id: 17, siglas: "PP", idOrg: 2731 },
  { id: 18, siglas: "PDF", idOrg: 2986 },
  { id: 19, siglas: "FEP", idOrg: 2898 },
  { id: 20, siglas: "ID", idOrg: 2985 },
  { id: 21, siglas: "FP", idOrg: 1366 },
  { id: 22, siglas: "APP", idOrg: 1257 },
  { id: 23, siglas: "CP", idOrg: 2995 },
  { id: 24, siglas: "AN", idOrg: 2980 },
  { id: 25, siglas: "LP", idOrg: 2933 },
  { id: 26, siglas: "UCD", idOrg: 2998 },
  { id: 27, siglas: "AP", idOrg: 2173 },
  { id: 28, siglas: "PMOD", idOrg: 2924 },
  { id: 29, siglas: "PPR", idOrg: 2925 },
  { id: 30, siglas: "SAP", idOrg: 2927 },
  { id: 31, siglas: "SP", idOrg: 14 },
  { id: 32, siglas: "APRA", idOrg: 2930 },
  { id: 33, siglas: "RP", idOrg: 22 },
  { id: 34, siglas: "DUP", idOrg: 2867 },
  { id: 35, siglas: "AFL", idOrg: 3024 },
  { id: 36, siglas: "PTE", idOrg: 2939 },
  { id: 37, siglas: "UN", idOrg: 3023 },
  { id: 38, siglas: "PM", idOrg: 2840 },
];

function curlPost(url, body) {
  try {
    fs.writeFileSync('/tmp/jne-formula-body.json', JSON.stringify(body));
    const result = execSync(
      `curl -sk -X POST "${url}" ${BROWSER_HEADERS} -H "Content-Type: application/json" -H "Accept: application/json" -d @/tmp/jne-formula-body.json`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    return JSON.parse(result);
  } catch (e) {
    console.error(`  [CURL ERROR] ${e.message}`);
    return null;
  }
}

function fetchFormula(idOrg) {
  const body = {
    pageSize: 10,
    skip: 1,
    filter: {
      IdTipoEleccion: "1",
      IdOrganizacionPolitica: idOrg,
      ubigeo: "0",
      IdAnioExperiencia: 0,
      cargoOcupado: [0],
      IdSentenciaDeclarada: 0,
      IdGradoAcademico: 0,
      IdExpedienteDadiva: 0,
      IdProcesoElectoral: ID_PROCESO_ELECTORAL,
      IdEstado: 0
    }
  };
  return curlPost('https://web.jne.gob.pe/serviciovotoinformado/api/votoinf/avanzada-voto', body);
}

async function main() {
  console.log('=== Fetching Formula Presidencial (President + Vice Presidents) ===\n');

  // Load existing data for resumability
  let existingData = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    for (const entry of (existing.data || [])) {
      existingData[entry.idOrg] = entry;
    }
    console.log(`Loaded ${Object.keys(existingData).length} existing entries\n`);
  }

  const results = [];

  for (let i = 0; i < PARTIDOS.length; i++) {
    const partido = PARTIDOS[i];

    // Skip if already fetched
    if (existingData[partido.idOrg]) {
      console.log(`[${i + 1}/${PARTIDOS.length}] ${partido.siglas} (${partido.idOrg}) - already fetched, skipping`);
      results.push(existingData[partido.idOrg]);
      continue;
    }

    process.stdout.write(`[${i + 1}/${PARTIDOS.length}] ${partido.siglas} (${partido.idOrg})...`);

    const res = fetchFormula(partido.idOrg);

    if (!res || !res.data || res.data.length === 0) {
      console.log(` no candidates found`);
      results.push({
        idOrg: partido.idOrg,
        siglas: partido.siglas,
        organizacionPolitica: null,
        candidatos: []
      });
    } else {
      const candidatos = res.data
        .sort((a, b) => a.numeroCandidato - b.numeroCandidato)
        .map(c => ({
          numeroCandidato: c.numeroCandidato,
          cargo: c.cargo,
          dni: c.numeroDocumento,
          nombre: c.nombreCompleto,
          foto: c.txNombre ? JNE_FOTO + c.txNombre : null,
          estado: c.estado,
          idHojaVida: c.idHojaVida,
        }));

      const partido_nombre = res.data[0].organizacionPolitica;
      console.log(` ${partido_nombre} - ${candidatos.length} candidates`);
      for (const c of candidatos) {
        console.log(`    ${c.numeroCandidato}. ${c.cargo} - ${c.nombre} [${c.estado}]`);
      }

      results.push({
        idOrg: partido.idOrg,
        siglas: partido.siglas,
        organizacionPolitica: partido_nombre,
        candidatos
      });
    }

    // Save checkpoint after each party
    const output = {
      fetchedAt: new Date().toISOString(),
      idProcesoElectoral: ID_PROCESO_ELECTORAL,
      count: results.length,
      data: results
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    if (i < PARTIDOS.length - 1) {
      await sleep(randomDelay());
    }
  }

  console.log(`\n=== Done: ${results.length} parties fetched ===`);
}

main().catch(console.error);
