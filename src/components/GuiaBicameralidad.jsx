import { useState } from 'react';
import { REGIONES } from '../data/constants';

export default function GuiaBicameralidad({ onRegionSeleccionada, regionActual }) {
  const [abierto, setAbierto] = useState(true);
  const [mostrarSelectorRegion, setMostrarSelectorRegion] = useState(false);
  const [regionTemp, setRegionTemp] = useState(regionActual || 'lima');

  const handleCerrarGuia = () => {
    setAbierto(false);
    setMostrarSelectorRegion(true);
  };

  const handleConfirmarRegion = () => {
    onRegionSeleccionada?.(regionTemp);
    setMostrarSelectorRegion(false);
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="fixed bottom-20 xl:bottom-4 left-4 bg-slate-700 text-white px-4 py-2 rounded shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium z-40"
      >
        ¿Cómo votar?
      </button>

      {/* Selector de región */}
      {mostrarSelectorRegion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="bg-slate-700 text-white p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">¿Dónde votarás?</h2>
              <p className="text-sm text-slate-300">Selecciona tu región electoral</p>
            </div>
            <div className="p-4">
              <select
                value={regionTemp}
                onChange={(e) => setRegionTemp(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                {REGIONES.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Esto determina los candidatos a Senadores y Diputados regionales que verás.
              </p>
              <button
                onClick={handleConfirmarRegion}
                className="w-full mt-4 bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors"
              >
                Confirmar y empezar
              </button>
            </div>
          </div>
        </div>
      )}

      {abierto && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header con gradiente */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-6 py-5 flex justify-between items-center shadow-lg">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Cómo usar el Simulador</h2>
                <p className="text-slate-300 text-sm mt-0.5">Practica tu voto antes del 12 de abril</p>
              </div>
              <button
                onClick={handleCerrarGuia}
                className="text-2xl hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 hover:rotate-90"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* ¿Qué es este simulador? */}
              <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span>¿Qué es este simulador?</span>
                </h3>
                <p className="text-sm text-blue-900 leading-relaxed">
                  Una herramienta <strong>educativa y gratuita</strong> para practicar tu voto antes del 12 de abril.
                  <br />
                  <span className="inline-block mt-2 bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                    ⚠️ Tu voto aquí NO es oficial
                  </span>
                </p>
              </section>

              {/* Cómo usar el simulador */}
              <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>¿Cómo funciona?</span>
                </h3>
                <div className="space-y-4">
                  {/* Paso 1 */}
                  <div className="flex gap-4 items-start p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">1</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">Selecciona tu región electoral</p>
                      <p className="text-xs text-slate-600 mt-1">Esto mostrará los candidatos regionales de tu zona</p>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex gap-4 items-start p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">2</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">Marca con ✗ tus partidos preferidos</p>
                      <p className="text-xs text-slate-600 mt-1">5 cargos: Presidente, Senadores (Nacional y Regional), Diputados y Parlamento Andino</p>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="flex gap-4 items-start p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">3</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">Voto preferencial <span className="text-xs text-slate-500 font-normal">(opcional)</span></p>
                      <p className="text-xs text-slate-600 mt-1">Escribe el número del candidato que prefieres en la lista</p>
                    </div>
                  </div>

                  {/* Paso 4 - Alertas Judiciales (destacado) */}
                  <div className="flex gap-4 items-start p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300 shadow-sm">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-full flex items-center justify-center font-bold shadow-md text-lg">⚠️</div>
                    <div className="flex-1">
                      <p className="font-bold text-amber-900 text-sm">Revisa las alertas judiciales</p>
                      <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">Verás advertencias sobre candidatos con sentencias penales, juicios civiles o votos a favor de la delincuencia</p>
                    </div>
                  </div>

                  {/* Paso 5 */}
                  <div className="flex gap-4 items-start p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">4</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">Revisa tu resumen</p>
                      <p className="text-xs text-slate-600 mt-1">Panel lateral (escritorio) o botón inferior (móvil)</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Congreso Bicameral */}
              <section className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-gray-50">
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span>Congreso Bicameral (nuevo)</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  Por primera vez votarás por <strong className="text-slate-900">60 senadores</strong> (30 nacionales + 30 regionales)
                  y <strong className="text-slate-900">130 diputados</strong> regionales.
                </p>
                <details className="text-xs text-slate-600">
                  <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 transition-colors select-none">
                    Ver funciones de cada cámara →
                  </summary>
                  <div className="mt-3 pl-3 space-y-2.5 border-l-2 border-slate-300">
                    <div>
                      <p className="font-semibold text-slate-800">🏛️ Senadores:</p>
                      <p className="text-slate-600 mt-0.5">• Revisan proyectos de ley<br />• Eligen altas autoridades (TC, BCR, Defensoría)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">🏛️ Diputados:</p>
                      <p className="text-slate-600 mt-0.5">• Aprueban proyectos de ley<br />• Interpelan y censuran ministros</p>
                    </div>
                  </div>
                </details>
              </section>

              {/* Voto Preferencial */}
              <section className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span>Votos preferenciales permitidos</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-3 text-center border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
                    <p className="font-medium text-slate-700 text-xs mb-1">Senadores Nacional</p>
                    <p className="text-slate-900 font-black text-2xl">2</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-3 text-center border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
                    <p className="font-medium text-slate-700 text-xs mb-1">Senadores Regional</p>
                    <p className="text-slate-900 font-black text-2xl">1</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-3 text-center border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
                    <p className="font-medium text-slate-700 text-xs mb-1">Diputados</p>
                    <p className="text-slate-900 font-black text-2xl">2</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-3 text-center border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
                    <p className="font-medium text-slate-700 text-xs mb-1">Parlamento Andino</p>
                    <p className="text-slate-900 font-black text-2xl">2</p>
                  </div>
                </div>
              </section>

              {/* Fechas */}
              <section className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>Fechas importantes</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-4 shadow-sm">
                    <p className="text-3xl font-black text-red-700">12</p>
                    <p className="text-red-900 font-bold mt-1">Abril 2026</p>
                    <p className="text-xs text-red-700 mt-1 font-medium">Primera vuelta</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
                    <p className="text-3xl font-black text-blue-700">7</p>
                    <p className="text-blue-900 font-bold mt-1">Junio 2026</p>
                    <p className="text-xs text-blue-700 mt-1 font-medium">Segunda vuelta</p>
                  </div>
                </div>
              </section>

              {/* Footer con fuentes */}
              <div className="text-xs text-center text-slate-500 pt-2 border-t border-slate-200">
                <p>
                  Datos oficiales: <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener" className="text-slate-700 hover:text-slate-900 font-medium underline decoration-dotted">JNE</a>
                  {' • '}
                  <a href="https://eg2026.onpe.gob.pe/bicameralidad/" target="_blank" rel="noopener" className="text-slate-700 hover:text-slate-900 font-medium underline decoration-dotted">ONPE</a>
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  onClick={handleCerrarGuia}
                  className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:from-slate-900 hover:via-slate-800 hover:to-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  ✓ ¡Entendido, practicar mi voto!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
