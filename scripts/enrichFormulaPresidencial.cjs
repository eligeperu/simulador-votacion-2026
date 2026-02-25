#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const JNE_FOTO = "https://mpesije.jne.gob.pe/apidocs/";
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const INPUT_FILE = path.join(DATA_DIR, 'formulaPresidencial.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'formulaPresidencial.json'); // Enrich in place
const DELAY_MS = 2000;
const DELAY_JITTER = 1000;

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
  return curlGet(`https://apiplataformaelectoral8.jne.gob.pe/api/v1/candidato/hoja-vida?IdHojaVida=${idHojaVida}`);
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

async function enrichCandidate(candidate) {
  if (!candidate.idHojaVida) return candidate;

  const hoja = fetchHojaVida(candidate.idHojaVida);
  if (!hoja?.datoGeneral) {
    console.log(`    [SKIP] No hoja de vida for ${candidate.nombre}`);
    return candidate;
  }

  const general = hoja.datoGeneral;
  return {
    ...candidate,
    sexo: general.sexo || null,
    fechaNacimiento: general.feNacimiento || null,
    domicilio: {
      departamento: general.domiDepartamento || null,
      provincia: general.domiProvincia || null,
      distrito: general.domiDistrito || null,
    },
    flags: extractFlags(hoja),
    resumen: extractResumen(hoja),
    formacionAcademica: hoja.formacionAcademica || null,
    enrichedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log('=== Enriching Formula Presidencial with Hoja de Vida data ===\n');

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const parties = data.data || [];

  let totalEnriched = 0;
  let totalSkipped = 0;

  for (let i = 0; i < parties.length; i++) {
    const party = parties[i];
    if (!party.candidatos || party.candidatos.length === 0) continue;

    console.log(`[${i + 1}/${parties.length}] ${party.siglas} (${party.organizacionPolitica || 'no candidates'})`);

    for (let j = 0; j < party.candidatos.length; j++) {
      const candidate = party.candidatos[j];

      // Skip if already enriched
      if (candidate.enrichedAt) {
        console.log(`  ${candidate.numeroCandidato}. ${candidate.nombre} - already enriched`);
        totalSkipped++;
        continue;
      }

      process.stdout.write(`  ${candidate.numeroCandidato}. ${candidate.nombre}...`);
      const enriched = await enrichCandidate(candidate);
      party.candidatos[j] = enriched;

      if (enriched.enrichedAt) {
        const flags = [];
        if (enriched.flags?.sentenciaPenal) flags.push('SENT.PENAL');
        if (enriched.flags?.exCongresista) flags.push('ex-congresista');
        if (enriched.flags?.congresistaActual) flags.push('CONGRESISTA');
        console.log(` OK ${flags.length > 0 ? `[${flags.join(', ')}]` : ''}`);
        totalEnriched++;
      } else {
        console.log(' skipped');
        totalSkipped++;
      }

      await sleep(randomDelay());
    }

    // Save checkpoint after each party
    data.data = parties;
    data.enrichedAt = new Date().toISOString();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  }

  console.log(`\n=== Done: ${totalEnriched} enriched, ${totalSkipped} skipped ===`);
}

main().catch(console.error);
