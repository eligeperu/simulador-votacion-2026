// Shared constants and utilities used across components and data modules

// Logos de partidos: servidos localmente (descargados con scripts/downloadLogos.cjs)
// Fallback remoto: https://sroppublico.jne.gob.pe/Consulta/Simbolo/GetSimbolo/{idOrg}
const BASE = import.meta.env.BASE_URL || '/';
export const JNE_LOGO = `${BASE}logos/`;
export const JNE_LOGO_REMOTE = "https://sroppublico.jne.gob.pe/Consulta/Simbolo/GetSimbolo/";
export const JNE_FOTO = "https://mpesije.jne.gob.pe/apidocs/";

export const REGIONES = [
  { id: 'amazonas', nombre: 'Amazonas' },
  { id: 'ancash', nombre: 'Áncash' },
  { id: 'apurimac', nombre: 'Apurímac' },
  { id: 'arequipa', nombre: 'Arequipa' },
  { id: 'ayacucho', nombre: 'Ayacucho' },
  { id: 'cajamarca', nombre: 'Cajamarca' },
  { id: 'callao', nombre: 'Callao' },
  { id: 'cusco', nombre: 'Cusco' },
  { id: 'huancavelica', nombre: 'Huancavelica' },
  { id: 'huanuco', nombre: 'Huánuco' },
  { id: 'ica', nombre: 'Ica' },
  { id: 'junin', nombre: 'Junín' },
  { id: 'la-libertad', nombre: 'La Libertad' },
  { id: 'lambayeque', nombre: 'Lambayeque' },
  { id: 'lima', nombre: 'Lima Metropolitana' },
  { id: 'lima-provincias', nombre: 'Lima Provincias' },
  { id: 'loreto', nombre: 'Loreto' },
  { id: 'madre-de-dios', nombre: 'Madre de Dios' },
  { id: 'moquegua', nombre: 'Moquegua' },
  { id: 'pasco', nombre: 'Pasco' },
  { id: 'piura', nombre: 'Piura' },
  { id: 'puno', nombre: 'Puno' },
  { id: 'san-martin', nombre: 'San Martín' },
  { id: 'tacna', nombre: 'Tacna' },
  { id: 'tumbes', nombre: 'Tumbes' },
  { id: 'ucayali', nombre: 'Ucayali' },
  { id: 'peruanos-extranjero', nombre: 'Peruanos en el Extranjero' },
];

// Maps region slug to JNE department name(s) for domicile comparison
// Some regions share a department (lima / lima-provincias both map to LIMA)
export const REGION_DEPARTAMENTOS = {
  'amazonas': ['AMAZONAS'],
  'ancash': ['ANCASH'],
  'apurimac': ['APURIMAC'],
  'arequipa': ['AREQUIPA'],
  'ayacucho': ['AYACUCHO'],
  'cajamarca': ['CAJAMARCA'],
  'callao': ['CALLAO', 'PROV. CONST. DEL CALLAO'],
  'cusco': ['CUSCO'],
  'huancavelica': ['HUANCAVELICA'],
  'huanuco': ['HUANUCO'],
  'ica': ['ICA'],
  'junin': ['JUNIN'],
  'la-libertad': ['LA LIBERTAD'],
  'lambayeque': ['LAMBAYEQUE'],
  'lima': ['LIMA'],
  'lima-provincias': ['LIMA'],
  'loreto': ['LORETO'],
  'madre-de-dios': ['MADRE DE DIOS'],
  'moquegua': ['MOQUEGUA'],
  'pasco': ['PASCO'],
  'piura': ['PIURA'],
  'puno': ['PUNO'],
  'san-martin': ['SAN MARTIN'],
  'tacna': ['TACNA'],
  'tumbes': ['TUMBES'],
  'ucayali': ['UCAYALI'],
};

export const ESTADOS_VALIDOS = ['INSCRITO', 'PUBLICADO PARA TACHAS', 'PUBLICADO'];
export const ESTADOS_EN_PROCESO = ['ADMITIDO', 'EN PROCESO DE TACHAS', 'PUBLICADO PARA TACHAS', 'PUBLICADO'];

// Normalize JNE uppercase names to title case
export const normalizeName = (str) => {
  if (!str) return '';
  if (str.length <= 4 && str === str.toUpperCase()) return str;
  if (str !== str.toUpperCase()) return str;
  return str.toLowerCase().replace(/(?:^|\s)\S/g, s => s.toUpperCase());
};

// Find candidate by party org ID and position number
export const buscarCandidato = (idOrg, posicion, datos) => {
  if (!posicion || !idOrg) return null;
  const pos = parseInt(posicion);
  if (isNaN(pos) || pos < 1) return null;
  return datos.find(c => c.idOrg === idOrg && c.pos === pos);
};

// Factory for initial vote state (used by App and CedulaSufragio)
export const createInitialVotos = () => ({
  presidente: null,
  senadoresNacional: { partido: null, preferencial: ['', ''] },
  senadoresRegional: { partido: null, preferencial: [''] },
  diputados: { partido: null, preferencial: ['', ''] },
  parlamenAndino: { partido: null, preferencial: ['', ''] },
});

// Merge raw JNE data with enriched candidate data by DNI
export const fusionarDatos = (raw, enrich) => {
  const data = raw.data || raw;
  const enrichList = enrich.data || enrich;
  const enrichedMap = new Map((Array.isArray(enrichList) ? enrichList : []).map(e => [e.dni, e]));
  return (Array.isArray(data) ? data : []).map(c => {
    const e = enrichedMap.get(c.strDocumentoIdentidad);
    return {
      idOrg: c.idOrganizacionPolitica,
      pos: c.intPosicion,
      nombre: e?.nombre || `${c.strNombres} ${c.strApellidoPaterno} ${c.strApellidoMaterno}`.trim(),
      dni: c.strDocumentoIdentidad,
      foto: e?.foto || c.strNombre || c.strGuidFoto,
      sexo: c.strSexo,
      estado: e?.estado ?? c.strEstadoCandidato,
      domicilio: e?.domicilio || null,
      votosProCrimen: e?.votosCongresoProCrimen || null,
      porestosnoSlug: e?.porestosnoSlug || null,
      flags: e?.flags || {
        sentenciaPenal: false,
        sentenciaPenalDetalle: [],
        sentenciaObliga: false,
        sentenciaObligaDetalle: []
      }
    };
  });
};
