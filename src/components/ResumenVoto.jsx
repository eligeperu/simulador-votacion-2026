import { useState } from 'react';
import { candidatosPresidenciales, partidosParlamentarios } from '../data/candidatos';

export default function ResumenVoto({ votos, onReset, onVotar }) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [votoRegistrado, setVotoRegistrado] = useState(false);

  const getSeleccionPresidente = () => {
    const valor = votos.presidente;
    if (valor === 'blanco') return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—' };
    if (valor === 'nulo') return { nombre: 'VOTO NULO', color: '#EF4444', siglas: '✕' };
    if (valor === null) return { nombre: 'Sin selección', color: '#D1D5DB', siglas: '—' };
    return candidatosPresidenciales.find(i => i.id === valor) || { nombre: 'Sin selección', color: '#D1D5DB', siglas: '—' };
  };

  const getSeleccionPartido = (categoria) => {
    const voto = votos[categoria];
    if (!voto) return { nombre: 'Sin selección', color: '#D1D5DB', siglas: '—', preferencial: [] };
    const valor = voto.partido;
    if (valor === 'blanco') return { nombre: 'VOTO EN BLANCO', color: '#9CA3AF', siglas: '—', preferencial: [] };
    if (valor === 'nulo') return { nombre: 'VOTO NULO', color: '#EF4444', siglas: '✕', preferencial: [] };
    if (valor === null) return { nombre: 'Sin selección', color: '#D1D5DB', siglas: '—', preferencial: [] };
    const item = partidosParlamentarios.find(i => i.id === valor);
    return { ...(item || { nombre: 'Sin selección', color: '#D1D5DB', siglas: '—' }), preferencial: voto.preferencial.filter(p => p) };
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

  const ResumenItem = ({ titulo, seleccion, compact = false }) => (
    <div className={`flex items-center gap-2 ${compact ? 'p-2' : 'p-3'} bg-white rounded-lg shadow-sm`}>
      <div 
        className={`${compact ? 'w-8 h-8 text-[10px]' : 'w-10 h-10 text-xs'} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
        style={{ backgroundColor: seleccion.color }}
      >
        {seleccion.siglas || '—'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500`}>{titulo}</p>
        <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} truncate`}>{seleccion.nombre || seleccion.partido}</p>
        {seleccion.preferencial?.length > 0 && (
          <p className="text-[10px] text-slate-500">Pref: {seleccion.preferencial.join(', ')}</p>
        )}
      </div>
    </div>
  );

  if (votoRegistrado) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow text-center">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">✓</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Voto Registrado</h3>
        <p className="text-gray-500 text-sm mb-4">Tu voto simulado ha sido registrado.</p>
        <div className="space-y-2 text-left mb-4">
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
        
        <div className="space-y-2">
          <ResumenItem titulo="Presidente" seleccion={presidente} />
          <ResumenItem titulo="Senadores Nacional" seleccion={senadoresNac} />
          <ResumenItem titulo="Senadores Regional" seleccion={senadoresReg} />
          <ResumenItem titulo="Diputados" seleccion={diputados} />
          <ResumenItem titulo="Parlamento Andino" seleccion={parlamento} />
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onReset} className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-medium text-sm transition-colors text-slate-700">
            Reiniciar
          </button>
          <button
            onClick={handleVotar}
            disabled={!votosCompletos}
            className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
              votosCompletos ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            VOTAR
          </button>
        </div>
      </div>

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center border-b border-slate-100 pb-3">Confirmar tu voto</h3>
            <div className="space-y-2 mb-5">
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
