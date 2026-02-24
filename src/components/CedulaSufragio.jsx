import { useState } from 'react';
import { candidatosPresidenciales, partidosParlamentarios } from '../data/candidatos';
import { JNE_LOGO, JNE_LOGO_REMOTE, JNE_FOTO, ESTADOS_VALIDOS, ESTADOS_EN_PROCESO, buscarCandidato, createInitialVotos, normalizeName } from '../data/constants';
import JudicialAlert from './JudicialAlert';
import ProCrimeAlert from './ProCrimeAlert';
import NoViveAquiAlert from './NoViveAquiAlert';
import senadoresNacional from '../data/senadoresNacional';
import senadoresRegional from '../data/senadoresRegional';
import diputadosData from '../data/diputados';
import parlamenAndino from '../data/parlamenAndino';

const TABS = [
  { id: 'presidente', label: 'Presidente', short: 'PRES' },
  { id: 'senadoresNacional', label: 'Sen. Nacional', short: 'SEN-N' },
  { id: 'senadoresRegional', label: 'Sen. Regional', short: 'SEN-R' },
  { id: 'diputados', label: 'Diputados', short: 'DIP' },
  { id: 'parlamenAndino', label: 'Parl. Andino', short: 'P.AND' },
];

const PARTIDOS_CONGRESO_IDS = [1257, 2173, 1366, 1264, 2218, 2731, 22, 14, 4]; // idOrg de partidos en el Congreso actual

const CandidatoCard = ({ partido, selected, onClick, showCongressHighlight = false }) => {
  const candidato = candidatosPresidenciales.find(c => c.idOrg === partido.idOrg);
  const esRetirado = partido.retirado;
  const skipPresidente = partido.skipPresidente;

  return (
    <div
      onClick={!esRetirado && !skipPresidente ? onClick : undefined}
      className={`flex items-center gap-[10px] p-[10px] min-h-[56px] lg:min-h-[50px] transition-opacity ${esRetirado ? 'cursor-default opacity-40' : skipPresidente ? 'cursor-default' : 'cursor-pointer hover:opacity-90'} border-l-4 ${showCongressHighlight ? 'border-red-600' : 'border-transparent'}`}
    >
      <div className="w-[76px] text-left shrink-0">
        <h3 className={`font-bold text-[9px] sm:text-[10px] uppercase leading-tight break-words ${skipPresidente || esRetirado ? 'text-white' : 'text-black'}`}>
          {partido.nombre}
        </h3>
      </div>
      {!esRetirado && !skipPresidente && (
        <>
          <div className="shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 border border-black flex items-center justify-center p-0.5 bg-white">
              {!partido.hideLogoPresidente && partido.idOrg ? (
                <img
                  src={`${JNE_LOGO}${partido.idOrg}.jpg`}
                  alt={partido.siglas}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = `${JNE_LOGO_REMOTE}${partido.idOrg}`; e.target.onerror = () => { e.target.style.display = 'none'; }; }}
                />
              ) : !partido.hideLogoPresidente ? (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-[8px]"
                  style={{ backgroundColor: partido.color }}
                >
                  {partido.siglas}
                </div>
              ) : null}
              {selected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/20">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900 leading-none" style={{ textShadow: '0 0 2px rgba(255,255,255,0.8)' }}>✕</span>
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 border border-black overflow-hidden flex items-center justify-center bg-gray-50">
              {candidato?.foto ? (
                <img
                  src={candidato.foto}
                  alt={candidato.nombre}
                  className="w-full h-full object-cover grayscale-[30%]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              {selected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/20">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900 leading-none" style={{ textShadow: '0 0 2px rgba(255,255,255,0.8)' }}>✕</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PartidoCardConPreferencial = ({ partido, categoria, numPreferencial, voto, regionSeleccionada, onVotoPartido, onVotoPreferencial }) => {
  const selected = voto.partido === partido.id;
  const esRetirado = partido.retirado;

  const getDatosCandidatos = () => {
    if (categoria === 'senadoresNacional') return senadoresNacional;
    if (categoria === 'senadoresRegional') return senadoresRegional[regionSeleccionada] || [];
    if (categoria === 'diputados') return diputadosData[regionSeleccionada] || [];
    if (categoria === 'parlamenAndino') return parlamenAndino;
    return [];
  };

  return (
    <div className={`flex items-center gap-[10px] p-[10px] min-h-[56px] lg:min-h-[50px] transition-opacity ${esRetirado ? '' : 'hover:opacity-90'}`}>
      <div
        className={`w-[76px] text-left shrink-0 ${esRetirado ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={!esRetirado ? () => onVotoPartido(categoria, partido.id) : undefined}
      >
        {!esRetirado && (
          <h3 className="font-bold text-[9px] sm:text-[10px] uppercase leading-tight text-black break-words">
            {partido.nombre}
          </h3>
        )}
      </div>
      {!esRetirado && (
        <>
          <div className="shrink-0 cursor-pointer" onClick={() => onVotoPartido(categoria, partido.id)}>
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 border border-black flex items-center justify-center p-0.5 bg-white">
              {partido.idOrg ? (
                <img
                  src={`${JNE_LOGO}${partido.idOrg}.jpg`}
                  alt={partido.siglas}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = `${JNE_LOGO_REMOTE}${partido.idOrg}`; e.target.onerror = () => { e.target.style.display = 'none'; }; }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-[8px]"
                  style={{ backgroundColor: partido.color }}
                >
                  {partido.siglas}
                </div>
              )}
              {selected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/20">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900 leading-none" style={{ textShadow: '0 0 2px rgba(255,255,255,0.8)' }}>✕</span>
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 flex gap-[10px] items-start">
            {voto.preferencial.slice(0, numPreferencial).map((val, i) => {
              const candidato = selected && val ? buscarCandidato(partido.idOrg, val, getDatosCandidatos()) : null;
              const noExiste = selected && val && !candidato;
              const esValido = candidato && ESTADOS_VALIDOS.includes(candidato.estado);
              const enProceso = candidato && ESTADOS_EN_PROCESO.includes(candidato.estado);
              const esRechazado = candidato && !esValido && !enProceso;
              const tieneVotosProCrimen = candidato?.votosProCrimen?.some(v => v.sigla_voto === 'SI +++' || v.voto === 'A favor');
              const getBorderClass = () => {
                if (!selected) return 'border-black';
                if (noExiste) return 'border-red-500 border-2';
                if (enProceso) return 'border-amber-500 border-2';
                if (esRechazado) return 'border-red-500 border-2';
                if (tieneVotosProCrimen) return 'border-red-500 border-2';
                return 'border-black';
              };
              return (
                <div key={i}>
                  <div className={`w-11 h-11 sm:w-10 sm:h-10 border bg-white flex items-center justify-center ${getBorderClass()}`}>
                    {selected ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={val}
                        onChange={(e) => onVotoPreferencial(categoria, i, e.target.value)}
                        className="w-full h-full text-center text-sm font-bold border-none focus:ring-0 p-0"
                        maxLength={3}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100/50 cursor-not-allowed" />
                    )}
                  </div>
                  {selected && val && (
                    <p className={`lg:hidden text-[9px] leading-tight mt-0.5 text-center truncate w-11 sm:w-10 ${candidato ? 'text-green-700' : 'text-red-600'}`}>
                      {candidato ? normalizeName(candidato.nombre).split(' ').slice(-1)[0] : 'No existe'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Lookup de votos pro-crimen por DNI (para cruzar con presidenciales)
const proCrimenByDni = new Map();
senadoresNacional.forEach(c => {
  if (c.votosProCrimen) proCrimenByDni.set(c.dni, { votos: c.votosProCrimen, slug: c.porestosnoSlug });
});

// Inline candidate details for mobile — shows photo, flags, links below the selected card
const MobileCandidateDetails = ({ candidatos, region }) => {
  if (!candidatos || candidatos.length === 0) return null;
  return (
    <div className="px-3 pb-3 space-y-2">
      {candidatos.map((c, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-2.5 flex flex-col gap-1.5">
          {c.noExiste ? (
            <div className="bg-red-50 border-l-4 border-red-600 p-2 rounded-r-md shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-sm">⚠</span>
                <span className="text-xs font-semibold text-red-800 uppercase">NÚMERO NO EXISTE</span>
              </div>
              <p className="text-xs text-gray-700 mt-1 ml-5">El número {c.numPref} no corresponde a ningún candidato. Tu voto preferencial no será contado.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <img
                  src={c.foto?.startsWith('http') ? c.foto : `${JNE_FOTO}${c.foto}`}
                  alt={c.nombre}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{normalizeName(c.nombre)}</p>
                  <a
                    href={c.hojaVida}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Ver hoja de vida →
                  </a>
                </div>
              </div>
              {c.estado && c.estado !== 'INSCRITO' && (() => {
                const enProceso = ESTADOS_EN_PROCESO.includes(c.estado);
                const esRechazado = !ESTADOS_VALIDOS.includes(c.estado) && !enProceso;
                if (esRechazado) return (
                  <div className="bg-red-50 border-l-4 border-red-600 p-2 rounded-r-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 text-sm">⚠</span>
                      <span className="text-xs font-semibold text-red-800 uppercase">CANDIDATURA NO VÁLIDA</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 ml-5">Estado: {c.estado}. Tu voto preferencial no será contado.</p>
                  </div>
                );
                if (enProceso) return (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded-r-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 text-sm">⚠</span>
                      <span className="text-xs font-semibold text-amber-800 uppercase">CANDIDATURA EN PROCESO</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 ml-5">{c.estado === 'PUBLICADO PARA TACHAS' ? 'Abierto a tachas ciudadanas' : 'Pendiente de inscripción'}. Tu voto podría no contar.</p>
                  </div>
                );
                return null;
              })()}
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
              {region && <NoViveAquiAlert domicilio={c.domicilio} region={region} />}
              <ProCrimeAlert votos={c.votosProCrimen || []} slug={c.porestosnoSlug} />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const ColumnaHeader = ({ titulo, subtitulo, className = "", tituloClassName = "text-[10px] sm:text-xs", subtituloClassName = "text-[9px]" }) => (
  <div className={`bg-slate-700 text-white py-1 px-2 text-center flex flex-col justify-center ${className}`}>
    <h3 className={`font-bold uppercase ${tituloClassName}`}>{titulo}</h3>
    {subtitulo && <p className={`opacity-90 ${subtituloClassName}`}>{subtitulo}</p>}
  </div>
);

export default function CedulaSufragio({ onVotoCompleto, regionSeleccionada = 'lima', showCongressionalHighlights = false }) {
  const [votos, setVotos] = useState(createInitialVotos);
  const [activeTab, setActiveTab] = useState('presidente');
  const [searchQuery, setSearchQuery] = useState('');

  const handleVotoPresidente = (valor) => {
    const nuevo = votos.presidente === valor ? null : valor;
    const nuevosVotos = { ...votos, presidente: nuevo };
    setVotos(nuevosVotos);
    onVotoCompleto?.(nuevosVotos);
  };

  const handleVotoPartido = (categoria, partidoId) => {
    const actual = votos[categoria];
    const nuevoPartido = actual.partido === partidoId ? null : partidoId;
    const nuevosVotos = {
      ...votos,
      [categoria]: { ...actual, partido: nuevoPartido, preferencial: nuevoPartido ? actual.preferencial : actual.preferencial.map(() => '') }
    };
    setVotos(nuevosVotos);
    onVotoCompleto?.(nuevosVotos);
  };

  const handleVotoPreferencial = (categoria, index, valor) => {
    const actual = votos[categoria];
    const nuevoPref = [...actual.preferencial];
    nuevoPref[index] = valor.replace(/\D/g, '').slice(0, 3);
    const nuevosVotos = { ...votos, [categoria]: { ...actual, preferencial: nuevoPref } };
    setVotos(nuevosVotos);
    onVotoCompleto?.(nuevosVotos);
  };

  const getVotoIndicator = (tabId) => {
    if (tabId === 'presidente') return votos.presidente ? '✓' : '';
    return votos[tabId]?.partido ? '✓' : '';
  };

  const activeTabIndex = TABS.findIndex(t => t.id === activeTab);
  const goToTab = (index) => {
    if (index >= 0 && index < TABS.length) {
      setActiveTab(TABS[index].id);
      setSearchQuery('');
    }
  };

  const filteredPartidos = searchQuery.trim()
    ? partidosParlamentarios.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (p.siglas && p.siglas.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      )
    : partidosParlamentarios;

  const NUM_PREFERENCIAL = {
    senadoresNacional: 2,
    senadoresRegional: 1,
    diputados: 2,
    parlamenAndino: 2,
  };

  return (
    <div className="mx-auto rounded-lg shadow-2xl">
      <div className="bg-white">
        <div className="bg-slate-800 text-white p-3 text-center rounded-t-lg">
          <h1 className="text-xl font-semibold">CÉDULA DE SUFRAGIO</h1>
          <p className="text-sm text-slate-300">Marque con una cruz + o un aspa x el partido de su preferencia. El voto preferencial es <strong>opcional</strong>: escriba el número del candidato.</p>
        </div>
        <div className="bg-amber-50 border-b border-amber-200 p-2 text-center">
          <p className="text-[11px] text-amber-700">
            ⚠️ Los espacios vacíos corresponden a partidos sin candidatos, tal como aparecerá en la cédula oficial.
          </p>
        </div>

        {/* Mobile: Tab-based navigation */}
        <div className="lg:hidden">
          {/* Category tabs */}
          <div className="flex border-b border-slate-200 bg-white">
            {TABS.map((tab, i) => {
              const isActive = i === activeTabIndex;
              const isCompleted = !!getVotoIndicator(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => goToTab(i)}
                  className={`flex-1 py-2.5 text-center text-[10px] sm:text-[11px] font-medium transition-colors relative ${
                    isActive
                      ? 'text-slate-800 font-bold'
                      : isCompleted
                        ? 'text-green-700'
                        : 'text-slate-400'
                  }`}
                >
                  <span className="leading-tight">{tab.label}</span>
                  {isCompleted && !isActive && <span className="ml-0.5">✓</span>}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-slate-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Category header */}
          {activeTab === 'presidente' && <ColumnaHeader titulo="PRESIDENTE Y" subtitulo="VICEPRESIDENTES" className="bg-slate-700" />}
          {activeTab === 'senadoresNacional' && <ColumnaHeader titulo="SENADORES" subtitulo="A NIVEL NACIONAL" className="bg-slate-600" />}
          {activeTab === 'senadoresRegional' && <ColumnaHeader titulo="SENADORES" subtitulo={regionSeleccionada.toUpperCase()} className="bg-slate-600" />}
          {activeTab === 'diputados' && <ColumnaHeader titulo="DIPUTADOS" subtitulo={regionSeleccionada.toUpperCase()} className="bg-slate-600" />}
          {activeTab === 'parlamenAndino' && <ColumnaHeader titulo="PARLAMENTO ANDINO" className="bg-slate-600" />}

          {/* Search filter */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 py-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar partido..."
                className="w-full pl-8 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-slate-50"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Party list */}
          <div className="overflow-y-auto max-h-[50vh]">
            {filteredPartidos.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No se encontraron partidos
              </div>
            ) : (
              filteredPartidos.map((p) => {
                const esCongreso = PARTIDOS_CONGRESO_IDS.includes(p.idOrg);
                const highlight = showCongressionalHighlights && esCongreso;
                const isSelected = activeTab === 'presidente'
                  ? votos.presidente === p.idOrg
                  : votos[activeTab]?.partido === p.id;

                // Build candidate details for selected party
                let mobileCandidatos = null;
                if (isSelected) {
                  if (activeTab === 'presidente') {
                    const pres = candidatosPresidenciales.find(c => c.idOrg === p.idOrg);
                    if (pres) {
                      const proCrimen = pres.dni ? proCrimenByDni.get(pres.dni) : null;
                      const esFemenino = pres.nombre?.includes('KEIKO') || pres.nombre?.includes('BEATRIZ') || pres.nombre?.includes('VERONIKA') || pres.nombre?.includes('MARIA');
                      mobileCandidatos = [{
                        nombre: pres.nombre,
                        foto: pres.foto,
                        sexo: esFemenino ? 'FEMENINO' : 'MASCULINO',
                        flags: pres.flags || { sentenciaPenal: false, sentenciaObliga: false },
                        votosProCrimen: proCrimen?.votos || null,
                        porestosnoSlug: proCrimen?.slug || null,
                        hojaVida: pres.idOrg && pres.dni ? `https://votoinformado.jne.gob.pe/hoja-vida/${pres.idOrg}/${pres.dni}` : null,
                      }];
                    }
                  } else {
                    const voto = votos[activeTab];
                    const prefFiltrados = voto.preferencial.filter(v => v);
                    if (prefFiltrados.length > 0) {
                      let datos = [];
                      if (activeTab === 'senadoresNacional') datos = senadoresNacional;
                      else if (activeTab === 'senadoresRegional') datos = senadoresRegional[regionSeleccionada] || [];
                      else if (activeTab === 'diputados') datos = diputadosData[regionSeleccionada] || [];
                      else if (activeTab === 'parlamenAndino') datos = parlamenAndino;
                      mobileCandidatos = prefFiltrados.map(num => {
                        const c = buscarCandidato(p.idOrg, num, datos);
                        return c ? { ...c, hojaVida: `https://votoinformado.jne.gob.pe/hoja-vida/${p.idOrg}/${c.dni}`, numPref: num } : { noExiste: true, numPref: num };
                      });
                    }
                  }
                }

                return (
                  <div
                    key={p.id}
                    className={`transition-colors ${
                      highlight ? 'bg-[#fee2e2]' :
                      isSelected ? 'bg-blue-50' :
                      'bg-white'
                    } border-b border-gray-300`}
                  >
                    {activeTab === 'presidente' ? (
                        <CandidatoCard
                          partido={p}
                          selected={votos.presidente === p.idOrg}
                          onClick={() => handleVotoPresidente(p.idOrg)}
                          showCongressHighlight={highlight}
                        />
                      ) : (
                        <PartidoCardConPreferencial
                          partido={p}
                          categoria={activeTab}
                          numPreferencial={NUM_PREFERENCIAL[activeTab] || 2}
                          voto={votos[activeTab]}
                          regionSeleccionada={regionSeleccionada}
                          onVotoPartido={handleVotoPartido}
                          onVotoPreferencial={handleVotoPreferencial}
                        />
                      )}
                    {isSelected && mobileCandidatos && (
                      <MobileCandidateDetails
                        candidatos={mobileCandidatos}
                        region={activeTab !== 'presidente' && activeTab !== 'senadoresNacional' && activeTab !== 'parlamenAndino' ? regionSeleccionada : null}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Desktop: single scroll container with sticky headers */}
        <div className="hidden lg:block w-full overflow-x-auto overflow-y-auto max-h-[700px]">
          {/* Sticky headers */}
          <div className="flex divide-x divide-gray-300 sticky top-0 z-10 w-fit min-w-full">
            <div className="min-w-[196px] flex-1">
              <div className="bg-slate-700 text-white py-1 px-2 text-center"><h3 className="font-bold text-xs uppercase tracking-wider">PRESIDENTE Y</h3></div>
              <ColumnaHeader titulo="VICEPRESIDENTES" className="bg-slate-600" tituloClassName="text-[10px]" />
            </div>
            <div className="flex-[2] flex flex-col">
              <div className="bg-slate-700 text-white py-1 px-2 text-center"><h3 className="font-bold text-xs uppercase tracking-wider">SENADORES</h3></div>
              <div className="flex divide-x divide-gray-300">
                <div className="min-w-[246px] flex-1"><ColumnaHeader titulo="A NIVEL NACIONAL" className="bg-slate-600" tituloClassName="text-[10px]" /></div>
                <div className="min-w-[246px] flex-1"><ColumnaHeader titulo={regionSeleccionada.toUpperCase()} className="bg-slate-600" tituloClassName="text-[10px]" /></div>
              </div>
            </div>
            <div className="min-w-[246px] flex-1">
              <div className="bg-slate-700 text-white py-1 px-2 text-center"><h3 className="font-bold text-xs uppercase tracking-wider">DIPUTADOS</h3></div>
              <ColumnaHeader titulo={regionSeleccionada.toUpperCase()} className="bg-slate-600" tituloClassName="text-[10px]" />
            </div>
            <div className="min-w-[246px] flex-1">
              <div className="bg-slate-700 text-white py-1 px-2 text-center"><h3 className="font-bold text-xs uppercase tracking-wider">PARLAMENTO</h3></div>
              <ColumnaHeader titulo="ANDINO" className="bg-slate-600" tituloClassName="text-[10px]" />
            </div>
          </div>
          {/* Body: Row-based for horizontal shading continuity */}
          <div className="flex flex-col w-fit min-w-full">
            {partidosParlamentarios.map((p) => {
              const esCongreso = PARTIDOS_CONGRESO_IDS.includes(p.idOrg);
              const highlight = showCongressionalHighlights && esCongreso;
              return (
                <div
                  key={p.id}
                  className={`flex border-b ${highlight ? 'bg-[#fee2e2] divide-x divide-red-200 border-red-200' : 'bg-white divide-x divide-gray-300 border-gray-300'}`}
                >
                  <div className="min-w-[196px] flex-1">
                    <CandidatoCard
                      partido={p}
                      selected={votos.presidente === p.idOrg}
                      onClick={() => handleVotoPresidente(p.idOrg)}
                      showCongressHighlight={highlight}
                    />
                  </div>
                  <div className="min-w-[246px] flex-1">
                    <PartidoCardConPreferencial partido={p} categoria="senadoresNacional" numPreferencial={2} voto={votos.senadoresNacional} regionSeleccionada={regionSeleccionada} onVotoPartido={handleVotoPartido} onVotoPreferencial={handleVotoPreferencial} />
                  </div>
                  <div className="min-w-[246px] flex-1">
                    <PartidoCardConPreferencial partido={p} categoria="senadoresRegional" numPreferencial={1} voto={votos.senadoresRegional} regionSeleccionada={regionSeleccionada} onVotoPartido={handleVotoPartido} onVotoPreferencial={handleVotoPreferencial} />
                  </div>
                  <div className="min-w-[246px] flex-1">
                    <PartidoCardConPreferencial partido={p} categoria="diputados" numPreferencial={2} voto={votos.diputados} regionSeleccionada={regionSeleccionada} onVotoPartido={handleVotoPartido} onVotoPreferencial={handleVotoPreferencial} />
                  </div>
                  <div className="min-w-[246px] flex-1">
                    <PartidoCardConPreferencial partido={p} categoria="parlamenAndino" numPreferencial={2} voto={votos.parlamenAndino} regionSeleccionada={regionSeleccionada} onVotoPartido={handleVotoPartido} onVotoPreferencial={handleVotoPreferencial} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
