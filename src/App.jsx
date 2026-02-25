import { useState, useEffect } from 'react';
import CedulaSufragio from './components/CedulaSufragio';
import ResumenVoto from './components/ResumenVoto';
import GuiaBicameralidad from './components/GuiaBicameralidad';
import Candidatos from './components/Candidatos';
import LeyendaCongreso from './components/LeyendaCongreso';
import FiltroSentencias from './components/FiltroSentencias';
import { createInitialVotos } from './data/constants';

function App() {
  const [votos, setVotos] = useState(createInitialVotos);
  const [resetKey, setResetKey] = useState(0);
  const [regionSeleccionada, setRegionSeleccionada] = useState('lima');
  const [mostrarResumenMobile, setMostrarResumenMobile] = useState(false);
  const [page, setPage] = useState('simulador');
  const [showCongressionalHighlights, setShowCongressionalHighlights] = useState(false);
  const [showSentenciasHighlights, setShowSentenciasHighlights] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ months: 0, days: 0, hours: 0, minutes: 0 });

  const handleVotoCompleto = (nuevosVotos) => setVotos(nuevosVotos);

  const handleReset = () => {
    setVotos(createInitialVotos());
    setResetKey(k => k + 1);
  };

  useEffect(() => {
    const targetDate = new Date('2026-04-12T00:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        // Calculate total days
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        setTimeLeft({ days: totalDays });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000 * 60); // Update every hour is enough for just days

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  const votosCompletados = [
    votos.presidente !== null,
    votos.senadoresNacional?.partido !== null,
    votos.senadoresRegional?.partido !== null,
    votos.diputados?.partido !== null,
    votos.parlamenAndino?.partido !== null,
  ].filter(Boolean).length;

  if (page === 'candidatos') return <Candidatos onBack={() => setPage('simulador')} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-4">
      <header className="w-full bg-black px-4 py-4 md:px-8 border-b border-slate-800 mb-6">
        <div className="max-w-[1600px] mx-auto flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start">
              <div className="font-bold text-[23px] text-white tracking-tighter flex items-center gap-2">
                <span className="flex h-[18px] w-[28px] rounded-[2px] overflow-hidden shadow-sm shrink-0">
                  <span className="w-1/3 h-full bg-[#D91023]"></span>
                  <span className="w-1/3 h-full bg-white"></span>
                  <span className="w-1/3 h-full bg-[#D91023]"></span>
                </span>
                EligePeru
              </div>
              <span className="text-[9px] text-white font-bold tracking-[0.14em] mt-0.5">SIMULADOR DE VOTACIÓN</span>
            </div>

            <div className="hidden md:flex border-l-[1px] border-white pl-4 py-1 flex-col justify-center translate-y-[3px]">
              <h1 className="text-xl font-bold text-white leading-none">Elecciones Generales</h1>
              <div className="inline-block px-2 py-0.5 border border-white text-white text-[10px] font-bold rounded bg-slate-800/40 w-fit mt-[6px]">
                12 de abril de 2026
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-white capitalize tracking-wide drop-shadow-sm">Faltan:</span>
            <div className="flex flex-col items-center bg-white rounded-[8px] w-12 h-12 justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              <span className="text-[22px] font-black text-slate-900 leading-none tracking-tighter">{timeLeft.days || 0}</span>
              <span className="text-[9px] text-slate-500 capitalize font-semibold tracking-wide">Días</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-2">
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <LeyendaCongreso active={showCongressionalHighlights} onToggle={setShowCongressionalHighlights} />
          <FiltroSentencias active={showSentenciasHighlights} onToggle={setShowSentenciasHighlights} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full lg:min-w-0">
            <div className="overflow-x-auto rounded-lg">
              <CedulaSufragio
                key={resetKey}
                onVotoCompleto={handleVotoCompleto}
                regionSeleccionada={regionSeleccionada}
                showCongressionalHighlights={showCongressionalHighlights}
                showSentenciasHighlights={showSentenciasHighlights}
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
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-lg z-30">
        <button
          onClick={() => setMostrarResumenMobile(true)}
          className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          Ver Resumen y Votar
          {votosCompletados > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{votosCompletados}/5</span>
          )}
        </button>
      </div>

      {/* Mobile: Bottom sheet de resumen */}
      <div
        className={`xl:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mostrarResumenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMostrarResumenMobile(false)}
        />
        {/* Bottom sheet */}
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300 ease-out ${
          mostrarResumenMobile ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
          {/* Header */}
          <div className="px-4 pb-3 flex justify-between items-center border-b border-slate-200">
            <h2 className="font-semibold text-lg text-slate-800">Resumen de tu Voto</h2>
            <button
              onClick={() => setMostrarResumenMobile(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            <ResumenVoto votos={votos} onReset={() => { handleReset(); setMostrarResumenMobile(false); }} regionSeleccionada={regionSeleccionada} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
