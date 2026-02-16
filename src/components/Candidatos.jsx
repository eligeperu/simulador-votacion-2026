import { useState, useMemo } from 'react';
import { candidatosPresidenciales, partidosParlamentarios, JNE_LOGO } from '../data/candidatos';
import senadoresNacionalRaw from '../data/senadoresNacional.json';
import senadoresNacionalEnrich from '../data/senadoresNacional-enriched.json';
import senadoresRegionalRawData from '../data/senadoresRegional/rawIndex';
import senadoresRegionalEnrichData from '../data/senadoresRegional-enriched';
import diputadosRawData from '../data/diputados/rawIndex';
import diputadosEnrichData from '../data/diputados-enriched';
import parlamenAndinoRaw from '../data/parlamenAndino.json';
import parlamenAndinoEnrich from '../data/parlamenAndino-enriched.json';
import JudicialAlert from './JudicialAlert';
import ProCrimeAlert from './ProCrimeAlert';

const JNE_FOTO = "https://mpesije.jne.gob.pe/apidocs/";

const REGIONES = [
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

const CATEGORIAS = [
  { id: 'presidente', nombre: 'Presidente' },
  { id: 'senadoresNacional', nombre: 'Senadores Nacionales' },
  { id: 'senadoresRegional', nombre: 'Senadores Regionales' },
  { id: 'diputados', nombre: 'Diputados' },
  { id: 'parlamenAndino', nombre: 'Parlamento Andino' },
];

const ESTADOS_VALIDOS = ['INSCRITO', 'PUBLICADO PARA TACHAS', 'PUBLICADO'];
const ESTADOS_EN_PROCESO = ['ADMITIDO', 'EN PROCESO DE TACHAS', 'PUBLICADO PARA TACHAS', 'PUBLICADO'];

const fusionarDatos = (raw, enrich) => {
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
      votosProCrimen: e?.votosCongresoProCrimen || null,
      porestosnoSlug: e?.porestosnoSlug || null,
      flags: e?.flags || { sentenciaPenal: false, sentenciaPenalDetalle: [], sentenciaObliga: false, sentenciaObligaDetalle: [] }
    };
  });
};

const normalizeName = (str) => {
  if (!str) return '';
  if (str.length <= 4 && str === str.toUpperCase()) return str;
  if (str !== str.toUpperCase()) return str;
  return str.toLowerCase().replace(/(?:^|\s)\S/g, s => s.toUpperCase());
};

// Pre-process all data
const senadoresNacional = fusionarDatos(senadoresNacionalRaw, senadoresNacionalEnrich);
const parlamenAndino = fusionarDatos(parlamenAndinoRaw, parlamenAndinoEnrich);
const senadoresRegional = Object.fromEntries(
  Object.keys(senadoresRegionalRawData).map(r => [r, fusionarDatos(senadoresRegionalRawData[r], senadoresRegionalEnrichData[r] || [])])
);
const diputados = Object.fromEntries(
  Object.keys(diputadosRawData).map(r => [r, fusionarDatos(diputadosRawData[r], diputadosEnrichData[r] || [])])
);

const getCandidatos = (categoria, region) => {
  if (categoria === 'presidente') return candidatosPresidenciales.map(c => ({ ...c, pos: null, idOrg: c.idOrg }));
  if (categoria === 'senadoresNacional') return senadoresNacional;
  if (categoria === 'senadoresRegional') return senadoresRegional[region] || [];
  if (categoria === 'diputados') return diputados[region] || [];
  if (categoria === 'parlamenAndino') return parlamenAndino;
  return [];
};

const EstadoBadge = ({ estado }) => {
  if (!estado || estado === 'INSCRITO') return null;
  const enProceso = ESTADOS_EN_PROCESO.includes(estado);
  const esRechazado = !ESTADOS_VALIDOS.includes(estado) && !enProceso;
  if (esRechazado) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">{estado}</span>;
  if (enProceso) return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">{estado}</span>;
  return null;
};

export default function Candidatos({ onBack }) {
  const [categoria, setCategoria] = useState('presidente');
  const [region, setRegion] = useState('lima');
  const [partidoId, setPartidoId] = useState(null);

  const needsRegion = categoria === 'senadoresRegional' || categoria === 'diputados';

  const candidatos = useMemo(() => getCandidatos(categoria, region), [categoria, region]);

  const candidatosPorPartido = useMemo(() => {
    const map = new Map();
    partidosParlamentarios.forEach(p => map.set(p.idOrg, []));
    candidatos.forEach(c => {
      const list = map.get(c.idOrg);
      if (list) list.push(c);
    });
    return map;
  }, [candidatos]);

  const partidoSeleccionado = partidoId !== null ? partidosParlamentarios.find(p => p.id === partidoId) : null;
  const listaCandidatos = partidoSeleccionado ? (candidatosPorPartido.get(partidoSeleccionado.idOrg) || []).sort((a, b) => (a.pos || 0) - (b.pos || 0)) : [];

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-2">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Candidatos por Partido</h1>
        <p className="text-sm text-slate-500">Elecciones Generales 2026 • 12 de abril</p>
        <button onClick={onBack} className="mt-2 text-sm text-blue-600 hover:underline">← Volver al simulador</button>
      </header>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Selectors */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(c => (
              <button
                key={c.id}
                onClick={() => { setCategoria(c.id); setPartidoId(null); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${categoria === c.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          {needsRegion && (
            <select
              value={region}
              onChange={e => { setRegion(e.target.value); setPartidoId(null); }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {REGIONES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          )}
        </div>

        {/* Party grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {partidosParlamentarios.map(p => {
            const count = candidatosPorPartido.get(p.idOrg)?.length || 0;
            const isSelected = partidoId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPartidoId(isSelected ? null : p.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${isSelected ? 'border-slate-700 bg-slate-50 ring-2 ring-slate-700' : 'border-slate-200 bg-white hover:border-slate-400'} ${p.retirado ? 'opacity-50' : ''}`}
              >
                <img
                  src={`${JNE_LOGO}${p.idOrg}`}
                  alt={p.siglas}
                  className="w-8 h-8 rounded-full object-contain shrink-0 bg-white border border-slate-200"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{p.siglas}</p>
                  <p className="text-[10px] text-slate-500">{count} candidatos</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Candidate list */}
        {partidoSeleccionado && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3" style={{ borderLeft: `4px solid ${partidoSeleccionado.color}` }}>
              <img
                src={`${JNE_LOGO}${partidoSeleccionado.idOrg}`}
                alt={partidoSeleccionado.siglas}
                className="w-10 h-10 rounded-full object-contain bg-white border border-slate-200"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div>
                <h2 className="font-semibold text-base">{partidoSeleccionado.nombre}</h2>
                <p className="text-xs text-slate-500">{listaCandidatos.length} candidatos • {CATEGORIAS.find(c => c.id === categoria)?.nombre}{needsRegion ? ` — ${REGIONES.find(r => r.id === region)?.nombre}` : ''}</p>
              </div>
              {partidoSeleccionado.retirado && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold ml-auto">RETIRADO</span>}
            </div>

            {listaCandidatos.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                {categoria === 'presidente' && partidoSeleccionado.skipPresidente
                  ? 'Este partido no presenta candidato presidencial.'
                  : 'No se encontraron candidatos para esta categoría.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {listaCandidatos.map((c, i) => (
                  <div key={c.dni || i} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 text-center">
                        {c.pos && <span className="text-[10px] text-slate-400 font-mono">#{c.pos}</span>}
                        <img
                          src={c.foto?.startsWith('http') ? c.foto : `${JNE_FOTO}${c.foto}`}
                          alt={c.nombre}
                          className="w-10 h-10 rounded-full object-cover mt-0.5"
                          onError={e => { e.target.src = `${JNE_LOGO}${c.idOrg}`; e.target.onerror = null; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{normalizeName(c.nombre)}</p>
                          <EstadoBadge estado={c.estado} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                          {c.dni && <span>DNI: {c.dni}</span>}
                          {c.sexo && <span>{c.sexo === 'FEMENINO' ? '♀' : '♂'}</span>}
                          {c.flags?.congresistaActual && <span className="text-blue-600 font-medium">Congresista actual</span>}
                        </div>
                        <a
                          href={`https://votoinformado.jne.gob.pe/hoja-vida/${c.idOrg || partidoSeleccionado.idOrg}/${c.dni}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Ver hoja de vida
                        </a>
                        <JudicialAlert
                          sentenciaPenal={c.flags?.sentenciaPenal}
                          sentenciaPenalDetalle={c.flags?.sentenciaPenalDetalle}
                          sentenciaObliga={c.flags?.sentenciaObliga}
                          sentenciaObligaDetalle={c.flags?.sentenciaObligaDetalle}
                          congresistaActual={c.flags?.congresistaActual}
                          exCongresista={c.flags?.exCongresista}
                          cargosAnteriores={c.flags?.cargosAnteriores}
                          sexo={c.sexo}
                        />
                        <ProCrimeAlert votos={c.votosProCrimen || []} slug={c.porestosnoSlug} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
