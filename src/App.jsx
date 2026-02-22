import { useState } from 'react';
import CedulaSufragio from './components/CedulaSufragio';
import ResumenVoto from './components/ResumenVoto';
import GuiaBicameralidad from './components/GuiaBicameralidad';
import Candidatos from './components/Candidatos';
import LeyendaCongreso from './components/LeyendaCongreso';
import { createInitialVotos } from './data/constants';

function App() {
  const [votos, setVotos] = useState(createInitialVotos);
  const [resetKey, setResetKey] = useState(0);
  const [regionSeleccionada, setRegionSeleccionada] = useState('lima');
  const [mostrarResumenMobile, setMostrarResumenMobile] = useState(false);
  const [page, setPage] = useState('simulador');
  const [showCongressionalHighlights, setShowCongressionalHighlights] = useState(false);
  const handleVotoCompleto = (nuevosVotos) => setVotos(nuevosVotos);

  const handleReset = () => {
    setVotos(createInitialVotos());
    setResetKey(k => k + 1);
  };

  const diasRestantes = Math.ceil((new Date('2026-04-12') - new Date()) / (1000 * 60 * 60 * 24));

  if (page === 'candidatos') return <Candidatos onBack={() => setPage('simulador')} />;

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-2">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Simulador de Votación</h1>
        <p className="text-sm text-slate-500">Elecciones Generales 2026 • 12 de abril</p>
        <div className="inline-flex items-center gap-2 mt-2 bg-slate-700 text-white px-4 py-1 rounded text-sm">
          Faltan {diasRestantes} días para las elecciones
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto">
        <LeyendaCongreso active={showCongressionalHighlights} onToggle={setShowCongressionalHighlights} />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full lg:min-w-0">
            <div className="overflow-x-auto rounded-lg">
              <CedulaSufragio
                key={resetKey}
                onVotoCompleto={handleVotoCompleto}
                regionSeleccionada={regionSeleccionada}
                showCongressionalHighlights={showCongressionalHighlights}
              />
            </div>
          </div>

          <div className="hidden lg:block w-80 shrink-0 sticky top-4 z-20 auto-rows-min">
            <ResumenVoto votos={votos} onReset={handleReset} regionSeleccionada={regionSeleccionada} />
          </div>
        </div>
      </div>

      <GuiaBicameralidad onRegionSeleccionada={setRegionSeleccionada} regionActual={regionSeleccionada} />

      <footer className="text-center mt-6 mb-16 xl:mb-6 text-xs text-gray-500 space-y-1">
        <p><button onClick={() => setPage('candidatos')} className="text-blue-600 hover:underline font-medium">📋 Ver todos los candidatos por partido</button></p>
        <p>Simulador educativo • Datos: <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener" className="text-blue-600 hover:underline">JNE Voto Informado</a></p>
      </footer>

      {/* Mobile: Botón fijo para votar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-lg">
        <button
          onClick={() => setMostrarResumenMobile(true)}
          className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
        >
          Ver Resumen y Votar
        </button>
      </div>

      {/* Mobile: Modal de resumen */}
      {mostrarResumenMobile && (
        <div className="xl:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Resumen de tu Voto</h2>
              <button onClick={() => setMostrarResumenMobile(false)} className="text-slate-500 hover:text-slate-700 text-2xl">&times;</button>
            </div>
            <div className="p-3">
              <ResumenVoto votos={votos} onReset={() => { handleReset(); setMostrarResumenMobile(false); }} regionSeleccionada={regionSeleccionada} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
