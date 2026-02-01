import { useState } from 'react';
import { candidatosPresidenciales, partidosParlamentarios, configVotoPreferencial } from '../data/candidatos';

export default function CedulaSufragio({ onVotoCompleto }) {
  const [votos, setVotos] = useState({
    presidente: null,
    senadoresNacional: { partido: null, preferencial: ['', ''] },
    senadoresRegional: { partido: null, preferencial: [''] },
    diputados: { partido: null, preferencial: ['', ''] },
    parlamenAndino: { partido: null, preferencial: ['', ''] },
  });

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

  const handleVotoEspecial = (categoria, tipo) => {
    if (categoria === 'presidente') {
      handleVotoPresidente(tipo);
    } else {
      const actual = votos[categoria];
      const nuevoPartido = actual.partido === tipo ? null : tipo;
      const nuevosVotos = { ...votos, [categoria]: { partido: nuevoPartido, preferencial: actual.preferencial.map(() => '') } };
      setVotos(nuevosVotos);
      onVotoCompleto?.(nuevosVotos);
    }
  };

  const CandidatoCard = ({ candidato, selected, onClick }) => (
    <div
      onClick={onClick}
      className={`p-2 border rounded cursor-pointer transition-all ${
        selected ? 'border-slate-700 bg-slate-50 ring-1 ring-slate-400' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2">
        {candidato.foto ? (
          <img src={candidato.foto} alt={candidato.nombre} className="w-10 h-10 rounded-full object-cover shrink-0" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div 
          className={`w-10 h-10 rounded-full items-center justify-center text-white font-bold text-xs shrink-0 ${candidato.foto ? 'hidden' : 'flex'}`}
          style={{ backgroundColor: candidato.color }}
        >
          {candidato.siglas}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs truncate">{candidato.nombre}</p>
          <p className="text-[10px] text-gray-600 truncate">{candidato.partido}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
          selected ? 'border-slate-700 bg-slate-700' : 'border-slate-300'
        }`}>
          {selected && <span className="text-white text-xs">✓</span>}
        </div>
      </div>
    </div>
  );

  const PartidoCardConPreferencial = ({ partido, categoria, numPreferencial }) => {
    const voto = votos[categoria];
    const selected = voto.partido === partido.id;
    
    return (
      <div className={`p-2 border rounded transition-all ${
        selected ? 'border-slate-700 bg-slate-50 ring-1 ring-slate-400' : 'border-slate-200 bg-white'
      }`}>
        <div 
          onClick={() => handleVotoPartido(categoria, partido.id)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
        >
          <div 
            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-[10px] shrink-0"
            style={{ backgroundColor: partido.color }}
          >
            {partido.siglas}
          </div>
          <p className="text-xs font-medium truncate flex-1">{partido.nombre}</p>
          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
            selected ? 'border-slate-700 bg-slate-700' : 'border-slate-300'
          }`}>
            {selected && <span className="text-white text-[10px]">✓</span>}
          </div>
        </div>
        {selected && (
          <div className="mt-2 flex gap-1 justify-end">
            <span className="text-[10px] text-gray-500 self-center">Nº Pref:</span>
            {voto.preferencial.slice(0, numPreferencial).map((val, i) => (
              <input
                key={i}
                type="text"
                value={val}
                onChange={(e) => handleVotoPreferencial(categoria, i, e.target.value)}
                placeholder={`${i + 1}`}
                className="w-10 h-6 text-center text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 focus:outline-none"
                maxLength={3}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const VotoBlanco = ({ categoria }) => {
    const esPresidente = categoria === 'presidente';
    const valorActual = esPresidente ? votos.presidente : votos[categoria]?.partido;
    
    return (
      <button
        onClick={() => handleVotoEspecial(categoria, 'blanco')}
        className={`w-full py-2 px-2 text-xs rounded border transition-all mb-2 ${
          valorActual === 'blanco' ? 'border-slate-600 bg-slate-100 font-bold' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        VOTO EN BLANCO
      </button>
    );
  };

  const ColumnaHeader = ({ titulo, subtitulo, numPref }) => (
    <div className="bg-slate-700 text-white p-2 text-center">
      <h3 className="font-bold text-sm">{titulo}</h3>
      {subtitulo && <p className="text-[10px] opacity-90">{subtitulo}</p>}
      {numPref && <p className="text-[9px] opacity-75 mt-1">Voto preferencial: {numPref}</p>}
    </div>
  );

  return (
    <div className="bg-white shadow-2xl rounded-lg overflow-hidden max-w-7xl mx-auto">
      <div className="bg-slate-800 text-white p-3 text-center">
        <h1 className="text-xl font-semibold">CÉDULA DE SUFRAGIO</h1>
        <p className="text-sm text-slate-300">Elecciones Generales 2026 • 12 de abril</p>
      </div>

      <div className="grid grid-cols-5 divide-x divide-gray-300">
        <div className="flex flex-col">
          <ColumnaHeader titulo="PRESIDENTE" subtitulo="y Vicepresidentes" />
          <div className="p-2 flex-1 overflow-y-auto max-h-[600px] space-y-1">
            <VotoBlanco categoria="presidente" />
            {candidatosPresidenciales.map((c) => (
              <CandidatoCard
                key={c.id}
                candidato={c}
                selected={votos.presidente === c.id}
                onClick={() => handleVotoPresidente(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <ColumnaHeader titulo="SENADORES" subtitulo="Distrito Nacional" numPref="2 opcionales" />
          <div className="p-2 flex-1 overflow-y-auto max-h-[600px] space-y-1">
            <VotoBlanco categoria="senadoresNacional" />
            {partidosParlamentarios.map((p) => (
              <PartidoCardConPreferencial key={p.id} partido={p} categoria="senadoresNacional" numPreferencial={2} />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <ColumnaHeader titulo="SENADORES" subtitulo="Distrito Regional" numPref="1 opcional" />
          <div className="p-2 flex-1 overflow-y-auto max-h-[600px] space-y-1">
            <VotoBlanco categoria="senadoresRegional" />
            {partidosParlamentarios.map((p) => (
              <PartidoCardConPreferencial key={p.id} partido={p} categoria="senadoresRegional" numPreferencial={1} />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <ColumnaHeader titulo="DIPUTADOS" subtitulo="Distrito Regional" numPref="2 opcionales" />
          <div className="p-2 flex-1 overflow-y-auto max-h-[600px] space-y-1">
            <VotoBlanco categoria="diputados" />
            {partidosParlamentarios.map((p) => (
              <PartidoCardConPreferencial key={p.id} partido={p} categoria="diputados" numPreferencial={2} />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <ColumnaHeader titulo="PARLAMENTO" subtitulo="Andino" numPref="2 opcionales" />
          <div className="p-2 flex-1 overflow-y-auto max-h-[600px] space-y-1">
            <VotoBlanco categoria="parlamenAndino" />
            {partidosParlamentarios.map((p) => (
              <PartidoCardConPreferencial key={p.id} partido={p} categoria="parlamenAndino" numPreferencial={2} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-3 text-center border-t">
        <p className="text-xs text-gray-600">
          Marque con una X o ✓ el partido de su preferencia. El voto preferencial es <strong>opcional</strong>: escriba el número del candidato.
        </p>
      </div>
    </div>
  );
}
