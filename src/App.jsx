import { useState } from 'react';
import CedulaSufragio from './components/CedulaSufragio';
import ResumenVoto from './components/ResumenVoto';
import GuiaBicameralidad from './components/GuiaBicameralidad';

function App() {
  const [votos, setVotos] = useState({
    presidente: null,
    senadoresNacional: { partido: null, preferencial: ['', ''] },
    senadoresRegional: { partido: null, preferencial: [''] },
    diputados: { partido: null, preferencial: ['', ''] },
    parlamenAndino: { partido: null, preferencial: ['', ''] },
  });
  const [mostrarResumen, setMostrarResumen] = useState(true);

  const handleVotoCompleto = (nuevosVotos) => setVotos(nuevosVotos);

  const handleReset = () => setVotos({
    presidente: null,
    senadoresNacional: { partido: null, preferencial: ['', ''] },
    senadoresRegional: { partido: null, preferencial: [''] },
    diputados: { partido: null, preferencial: ['', ''] },
    parlamenAndino: { partido: null, preferencial: ['', ''] },
  });

  const diasRestantes = Math.ceil((new Date('2026-04-12') - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-2">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Simulador de Votación</h1>
        <p className="text-sm text-slate-500">Elecciones Generales Perú 2026</p>
        <div className="inline-flex items-center gap-2 mt-2 bg-slate-700 text-white px-4 py-1 rounded text-sm">
          Faltan {diasRestantes} días para las elecciones
        </div>
      </header>

      <div className="flex gap-4 max-w-[1600px] mx-auto">
        <div className="flex-1">
          <CedulaSufragio onVotoCompleto={handleVotoCompleto} />
        </div>

        {mostrarResumen && (
          <div className="w-80 shrink-0">
            <ResumenVoto votos={votos} onReset={handleReset} />
          </div>
        )}
      </div>

      <button
        onClick={() => setMostrarResumen(!mostrarResumen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors lg:hidden"
      >
        {mostrarResumen ? '✕' : '📋'}
      </button>

      <GuiaBicameralidad />

      <footer className="text-center mt-6 text-xs text-gray-500">
        <p>Simulador educativo • Datos: <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener" className="text-blue-600 hover:underline">JNE Voto Informado</a></p>
      </footer>
    </div>
  );
}

export default App;
