import { useState } from 'react';
import { candidatosPresidenciales, partidosParlamentarios, JNE_LOGO } from '../data/candidatos';
import { JNE_FOTO, ESTADOS_VALIDOS, ESTADOS_EN_PROCESO, normalizeName, buscarCandidato } from '../data/constants';
import senadoresNacional from '../data/senadoresNacional';
import senadoresRegional from '../data/senadoresRegional';
import diputadosData from '../data/diputados';
import parlamenAndino from '../data/parlamenAndino';
import JudicialAlert from './JudicialAlert';
import ProCrimeAlert from './ProCrimeAlert';

// Lookup de votos pro-crimen por DNI (para cruzar con presidenciales)
const proCrimenByDni = new Map();
senadoresNacional.forEach(c => {
  if (c.votosProCrimen) proCrimenByDni.set(c.dni, { votos: c.votosProCrimen, slug: c.porestosnoSlug });
});

export default function ResumenVoto({ votos, onReset, onVotar, regionSeleccionada = 'lima' }) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [votoRegistrado, setVotoRegistrado] = useState(false);

  const getSeleccionPresidente = () => {
    const valor = votos.presidente;
    if (valor === 'blanco') return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—' };
    if (valor === 'nulo') return { nombre: 'VOTO NULO', color: '#EF4444', siglas: '✕' };
    if (valor === null) return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—' };

    const base = candidatosPresidenciales.find(i => i.id === valor);
    // Detección simple de género para presidenciales basándose en nombres comunes o Keiko
    const esFemenino = base?.nombre?.includes('KEIKO') || base?.nombre?.includes('BEATRIZ') || base?.nombre?.includes('VERONIKA') || base?.nombre?.includes('MARIA');

    const proCrimen = base?.dni ? proCrimenByDni.get(base.dni) : null;
    return {
      ...(base || { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—' }),
      sexo: esFemenino ? 'FEMENINO' : 'MASCULINO',
      flags: base?.flags || { sentenciaPenal: false, sentenciaObliga: false },
      votosProCrimen: proCrimen?.votos || null,
      porestosnoSlug: proCrimen?.slug || null,
      hojaVida: base?.idOrg && base?.dni ? `https://votoinformado.jne.gob.pe/hoja-vida/${base.idOrg}/${base.dni}` : null
    };
  };

  const getSeleccionPartido = (categoria) => {
    const voto = votos[categoria];
    if (!voto) return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—', preferencial: [], candidatos: [] };
    const valor = voto.partido;
    if (valor === 'blanco') return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—', preferencial: [], candidatos: [] };
    if (valor === 'nulo') return { nombre: 'VOTO NULO', color: '#EF4444', siglas: '✕', preferencial: [], candidatos: [] };
    if (valor === null) return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—', preferencial: [], candidatos: [] };

    const item = partidosParlamentarios.find(i => i.id === valor);
    const prefFiltrados = voto.preferencial.filter(p => p);

    // Buscar candidatos por número preferencial
    let datos = [];
    if (categoria === 'senadoresNacional') datos = senadoresNacional;
    else if (categoria === 'senadoresRegional') {
      datos = senadoresRegional[regionSeleccionada] || [];
    }
    else if (categoria === 'diputados') {
      datos = diputadosData[regionSeleccionada] || [];
    }
    else if (categoria === 'parlamenAndino') datos = parlamenAndino;

    const candidatos = prefFiltrados.map(num => {
      const c = buscarCandidato(item?.idOrg, num, datos);
      return c ? { ...c, hojaVida: `https://votoinformado.jne.gob.pe/hoja-vida/${item.idOrg}/${c.dni}`, numPref: num } : { noExiste: true, numPref: num };
    });

    return { ...(item || { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—' }), preferencial: prefFiltrados, candidatos };
  };

  const presidente = getSeleccionPresidente();
  const senadoresNac = getSeleccionPartido('senadoresNacional');
  const senadoresReg = getSeleccionPartido('senadoresRegional');
  const diputados = getSeleccionPartido('diputados');
  const parlamento = getSeleccionPartido('parlamenAndino');

  const votosCompletos = votos.presidente !== null &&
    votos.senadoresNacional?.partido !== null &&
    votos.senadoresRegional?.partido !== null &&
    votos.diputados?.partido !== null &&
    votos.parlamenAndino?.partido !== null;

  const handleVotar = () => {
    setMostrarConfirmacion(true);
  };

  const confirmarVoto = () => {
    setMostrarConfirmacion(false);
    setVotoRegistrado(true);
    onVotar?.();
  };

  if (votoRegistrado) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow text-center">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">✓</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Voto Registrado</h3>
        <p className="text-gray-500 text-sm mb-4">Tu voto simulado ha sido registrado.</p>
        <div className="space-y-3 text-left mb-4 overflow-y-auto max-h-[400px] pr-1">
          <ResumenItem titulo="Presidente" seleccion={presidente} compact />
          <ResumenItem titulo="Senadores Nac." seleccion={senadoresNac} compact />
          <ResumenItem titulo="Senadores Reg." seleccion={senadoresReg} compact />
          <ResumenItem titulo="Diputados" seleccion={diputados} compact />
          <ResumenItem titulo="Parl. Andino" seleccion={parlamento} compact />
        </div>
        <button onClick={() => { setVotoRegistrado(false); onReset(); }} className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium text-sm">
          Votar de nuevo
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow">
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
          Resumen de tu Voto
          {votosCompletos && <span className="text-green-600 text-xs font-normal">✓ Completo</span>}
        </h3>

        <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
          <ResumenItem titulo="Presidente" seleccion={presidente} compact />
          <ResumenItem titulo="Senadores Nacional" seleccion={senadoresNac} compact />
          <ResumenItem titulo="Senadores Regional" seleccion={senadoresReg} compact />
          <ResumenItem titulo="Diputados" seleccion={diputados} compact />
          <ResumenItem titulo="Parlamento Andino" seleccion={parlamento} compact />
        </div>

        {!votosCompletos && (
          <p className="text-xs text-amber-600 mt-3 text-center">⚠️ Las categorías sin selección se contarán como voto en blanco</p>
        )}

        <div className="flex gap-2 mt-3">
          <button onClick={onReset} className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-medium text-sm transition-colors text-slate-700">
            Reiniciar
          </button>
          <button
            onClick={handleVotar}
            className="flex-1 py-2 px-3 rounded font-medium text-sm transition-colors bg-slate-700 hover:bg-slate-800 text-white"
          >
            VOTAR
          </button>
        </div>
      </div>

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center border-b border-slate-100 pb-3">Confirmar tu voto</h3>
            <div className="space-y-3 mb-5 max-h-[400px] overflow-y-auto pr-1">
              <ResumenItem titulo="Presidente" seleccion={presidente} compact />
              <ResumenItem titulo="Senadores Nac." seleccion={senadoresNac} compact />
              <ResumenItem titulo="Senadores Reg." seleccion={senadoresReg} compact />
              <ResumenItem titulo="Diputados" seleccion={diputados} compact />
              <ResumenItem titulo="Parl. Andino" seleccion={parlamento} compact />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMostrarConfirmacion(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-medium text-slate-700">
                Cancelar
              </button>
              <button onClick={confirmarVoto} className="flex-1 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ResumenItem = ({ titulo, seleccion, compact = false }) => (
    <div className={`${compact ? 'p-2.5' : 'p-3'} bg-white rounded-lg shadow-sm border border-slate-100`}>
      <div className="flex items-center gap-3">
        {seleccion.idOrg ? (
          <img
            src={`${JNE_LOGO}${seleccion.idOrg}`}
            alt={seleccion.siglas}
            className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} rounded-full object-contain shrink-0 bg-white border border-slate-200`}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className={`${compact ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-xs'} rounded-full items-center justify-center text-white font-bold shrink-0 ${seleccion.idOrg ? 'hidden' : 'flex'}`}
          style={{ backgroundColor: seleccion.color }}
        >
          {seleccion.siglas || '—'}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>{titulo}</p>
          <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'} truncate`}>
            {normalizeName(seleccion.partido || seleccion.nombre)}
          </p>
        </div>
      </div>

      {/* Las alertas se muestran ahora a nivel de candidato individual para mayor coherencia */}

      {/* Mostrar Candidato Presidencial */}
      {seleccion.foto && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-200 ml-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img
                src={seleccion.foto}
                alt={seleccion.nombre}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{normalizeName(seleccion.nombre)}</p>
                <a
                  href={seleccion.hojaVida}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Ver hoja de vida
                </a>
              </div>
            </div>
            <JudicialAlert
              sentenciaPenal={seleccion.flags?.sentenciaPenal}
              sentenciaPenalDetalle={seleccion.flags?.sentenciaPenalDetalle}
              sentenciaObliga={seleccion.flags?.sentenciaObliga}
              sentenciaObligaDetalle={seleccion.flags?.sentenciaObligaDetalle}
              congresistaActual={seleccion.flags?.congresistaActual}
              exCongresista={seleccion.flags?.exCongresista}
              cargosAnteriores={seleccion.flags?.cargosAnteriores}
              sexo={seleccion.sexo}
            />
            <ProCrimeAlert votos={seleccion.votosProCrimen || []} slug={seleccion.porestosnoSlug} />
          </div>
        </div>
      )}

      {seleccion.candidatos?.length > 0 && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-200 ml-4">
          {seleccion.candidatos.map((c, i) => (
            <div key={i} className="flex flex-col gap-1">
              {c.noExiste ? (
                <div className="bg-red-50 border-l-4 border-red-600 p-2 rounded-r-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-sm">⚠</span>
                    <span className="text-xs font-semibold text-red-800 uppercase">NÚMERO NO EXISTE</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 ml-5">El número {c.numPref} no corresponde a ningún candidato. Tu voto preferencial no será contado.</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src={c.foto?.startsWith('http') ? c.foto : `${JNE_FOTO}${c.foto}`}
                    alt={c.nombre}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{normalizeName(c.nombre)}</p>
                    <a
                      href={c.hojaVida}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Ver hoja de vida
                    </a>
                  </div>
                </div>
              )}
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
                if (enProceso && c.estado !== 'INSCRITO') return (
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
              <ProCrimeAlert votos={c.votosProCrimen || []} slug={c.porestosnoSlug} />
            </div>
          ))}
        </div>
      )}
      {seleccion.preferencial?.length > 0 && !seleccion.candidatos?.length && (
        <p className="text-xs text-slate-500 mt-1 ml-12">Pref: {seleccion.preferencial.join(', ')}</p>
      )}
    </div>
  );
