import { useState, useEffect, useMemo } from 'react';
import { JNE_LOGO, JNE_LOGO_REMOTE } from '../data/constants';
import candidatosPresidenciales from '../data/candidatosPresidenciales-enriched.json';
import senadoresNacional from '../data/senadoresNacional-enriched.json';
import parlamenAndino from '../data/parlamenAndino-enriched.json';

// Utility para importar todos los archivos enriched de carpetas
const importAllEnriched = () => {
    const contextDiputados = import.meta.glob('../data/diputados-enriched/*-enriched.json', { eager: true });
    const contextSenadoresRegionales = import.meta.glob('../data/senadoresRegional-enriched/*-enriched.json', { eager: true });

    const allData = [];

    // Agregar nacionales
    if (candidatosPresidenciales?.data) allData.push(...candidatosPresidenciales.data);
    if (senadoresNacional?.data) allData.push(...senadoresNacional.data);
    if (parlamenAndino?.data) allData.push(...parlamenAndino.data);

    // Agregar regionales
    Object.values(contextDiputados).forEach(mod => {
        if (mod?.data) allData.push(...mod.data);
    });
    Object.values(contextSenadoresRegionales).forEach(mod => {
        if (mod?.data) allData.push(...mod.data);
    });

    return allData;
};

const ALL_CANDIDATES = importAllEnriched();

export const getPartidosConSentenciasPenales = () => {
    const dnisVistos = new Set();
    const conteoPorPartido = {}; // { idOrg: { idOrg, nombrePartido, count } }

    ALL_CANDIDATES.forEach(cand => {
        // Verificar si el candidato ya fue contado usando su DNI
        if (!cand.dni || dnisVistos.has(cand.dni)) return;

        // Verificar si el candidato tiene sentencias penales
        if (!cand.sentenciaPenal || cand.sentenciaPenal.length === 0) return;

        let tieneSentenciaValida = false;

        for (const sentencia of cand.sentenciaPenal) {
            // Si la sentencia tiene txFalloPenal, revisarlo.
            const txt = [
                sentencia.txFalloPenal || "",
                sentencia.txOtraModalidad || "",
                sentencia.txComentario || "",
                sentencia.txModalidad || "",
                sentencia.txExpedientePenal || "",
                sentencia.txOrganoJudiPenal || "",
                sentencia.txDelitoPenal || ""
            ].join(" ").toLowerCase();

            // Reglas de exclusión
            const esAbsuelto = txt.includes("absuelt");
            const esArchivado = txt.includes("archivad");
            const esAnuladoTC = txt.includes("anulad") && txt.includes("tribunal constituc");

            // Si no entra en las exclusiones, es sentencia válida para contar
            if (!esAbsuelto && !esArchivado && !esAnuladoTC) {
                tieneSentenciaValida = true;
                break;
            }
        }

        if (tieneSentenciaValida && cand.idOrg && cand.partido) {
            // Registrar que ya contamos a este DNI
            dnisVistos.add(cand.dni);

            if (!conteoPorPartido[cand.idOrg]) {
                conteoPorPartido[cand.idOrg] = {
                    idOrg: cand.idOrg,
                    nombre: cand.partido,
                    count: 0,
                    candidatos: []
                };
            }
            conteoPorPartido[cand.idOrg].count += 1;
            conteoPorPartido[cand.idOrg].candidatos.push(cand);
        }
    });

    // Convertir a array y ordenar de mayor a menor count, excluyendo los que tienen 0 (que no deberían existir)
    return Object.values(conteoPorPartido).sort((a, b) => b.count - a.count);
};

const FiltroSentencias = ({ active, onToggle }) => {
    const [showModal, setShowModal] = useState(false);
    const [expandedParty, setExpandedParty] = useState(null);

    const dataPartidos = useMemo(() => getPartidosConSentenciasPenales(), []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className="mb-4">
            <div
                className={`bg-transparent rounded-[6px] py-2 px-2 flex items-center gap-3 cursor-pointer select-none group transition-colors`}
                onClick={() => onToggle(!active)}
            >
                <div className="relative shrink-0 flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={() => { }} // Controlled by parent
                        className={`w-[18px] h-[18px] appearance-none border-2 rounded-[4px] cursor-pointer transition-colors ${active ? "border-[#991b1b] bg-[#991b1b]" : "border-[#1E293B]"}`}
                    />
                    {active && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[12px] font-bold pointer-events-none">✓</span>
                    )}
                </div>
                <div className="flex flex-col items-start pt-[1px]">
                    <span className={`text-[11px] sm:text-[12px] font-[900] uppercase leading-none tracking-tight mb-[2px] transition-colors ${active ? "text-[#991b1b]" : "text-[#0f172a]"}`}>
                        PARTIDOS CON CANDIDATOS CON SENTENCIAS PENALES
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                        className="text-black hover:text-gray-800 underline font-semibold text-[10.5px] sm:text-[11px] transition-colors leading-none"
                    >
                        Ver detalle
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                    role="dialog"
                    aria-modal="true">
                    <div className="bg-white rounded-xl w-full max-w-[620px] max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 relative flex flex-col justify-center min-h-[85px] bg-[#be1823] rounded-t-xl">
                            <h2 className="text-[15px] sm:text-[17px] font-[900] text-white pr-10 leading-[1.1] uppercase mb-0.5">
                                PARTIDOS CON CANDIDATOS CON SENTENCIAS PENALES
                            </h2>
                            <div className="flex flex-col gap-2 pr-10 mt-1">
                                <p className="text-[10px] sm:text-[11px] text-white/80 font-medium leading-tight italic">
                                    * Se han excluido a los candidatos cuyas sentencias penales fueron absueltas, archivadas o anuladas por el tribunal constitucional.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-white/80 hover:text-white text-2xl leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-8">
                            <div className="flex flex-col gap-1">
                                {dataPartidos.map((partido, idx) => (
                                    <div key={idx} className="flex flex-col transition-all duration-200">
                                        <div
                                            className="flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
                                            onClick={() => setExpandedParty(expandedParty === partido.idOrg ? null : partido.idOrg)}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-[42px] h-[42px] bg-white rounded-[6px] p-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.12)] flex items-center justify-center shrink-0 border border-gray-100">
                                                    <img
                                                        src={`${JNE_LOGO}${partido.idOrg}.jpg`}
                                                        alt={partido.nombre}
                                                        className="w-full h-full object-contain rounded-[4px]"
                                                        onError={e => { e.target.src = `${JNE_LOGO_REMOTE}${partido.idOrg}`; e.target.onerror = null; }}
                                                    />
                                                </div>
                                                <div className="flex items-center min-w-0 pr-2">
                                                    <span className="text-[13px] sm:text-[14px] font-[900] text-[#1e293b] uppercase leading-tight truncate w-[180px] sm:w-[320px] group-hover:text-black transition-colors">
                                                        {partido.nombre}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center shrink-0 pl-2">
                                                <span className="text-[15px] sm:text-[16px] font-black text-[#a1161f] bg-[#fce8ea] w-[36px] h-[36px] flex items-center justify-center rounded-[8px] leading-none">
                                                    {partido.count}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dropdown list of candidates */}
                                        {expandedParty === partido.idOrg && (
                                            <div className="bg-white border-t border-gray-200 p-3 sm:px-5 flex flex-col gap-2 max-h-[250px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                                                <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-2">Lista de Candidatos:</h4>
                                                {partido.candidatos.map((c, i) => {
                                                    const nom = c.datoGeneral ? `${c.datoGeneral.nombres} ${c.datoGeneral.apellidoPaterno} ${c.datoGeneral.apellidoMaterno}` : c.nombres ? `${c.nombres} ${c.apellidoPaterno} ${c.apellidoMaterno}` : 'Desconocido';
                                                    let cargoStr = c.cargo || (c.datoGeneral && c.datoGeneral.cargo) || 'CANDIDATO';
                                                    let dist = (c.datoGeneral && c.datoGeneral.postulaDistrito && c.datoGeneral.postulaDistrito.trim()) || '';

                                                    // Handle NACIONAL abbreviation & Parlamento Andino
                                                    if (cargoStr.includes('PARLAMENTO ANDINO') || cargoStr.includes('PARLAMENTARIO ANDINO')) {
                                                        cargoStr = 'PARLAMENTO ANDINO';
                                                        dist = ''; // Don't show district for Parlamento Andino
                                                    } else if (dist === 'DISTRITO MULTIPLE' || dist === 'NACIÓN' || dist === '') {
                                                        dist = '';
                                                    } else if (dist === 'UNICO NACIONAL' || dist === 'ÚNICO NACIONAL') {
                                                        dist = 'NACIONAL';
                                                    }

                                                    const distStr = dist ? ` - ${dist}` : '';
                                                    const cargoInfo = `${cargoStr}${distStr}`;
                                                    const fotoUrl = c.foto || (c.datoGeneral && c.datoGeneral.rutaArchivoPicture) || '';

                                                    return (
                                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-2 transition-colors">
                                                            <div className="w-10 h-10 shrink-0 bg-gray-100 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                                                                {fotoUrl ? (
                                                                    <img src={fotoUrl} alt={nom} className="w-full h-full object-cover grayscale-[30%]" onError={(e) => { e.target.style.display = 'none'; }} />
                                                                ) : (
                                                                    <div className="text-[9px] text-gray-400 font-medium text-center leading-tight">Sin<br />Foto</div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0 justify-center">
                                                                <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 uppercase leading-tight truncate">{nom}</span>
                                                                <span className="text-[10px] sm:text-[11px] text-[#991b1b] font-medium uppercase mt-[1px] truncate">{cargoInfo}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {dataPartidos.length === 0 && (
                                    <div className="text-center text-gray-500 py-10 font-medium">
                                        No se encontraron candidatos con sentencias penales válidas.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiltroSentencias;
