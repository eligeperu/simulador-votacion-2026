import { useState, useEffect, useMemo } from 'react';
import { JNE_LOGO, JNE_LOGO_REMOTE } from '../data/constants';

const PARTY_COLORS = {
    "FUERZA POPULAR": "#e9511b",
    "ALIANZA PARA EL PROGRESO": "#01339e",
    "PODEMOS PERU": "#fda922",
    "PERU LIBRE": "#e90000",
    "RENOVACION POPULAR": "#0399df",
    "JUNTOS POR EL PERU": "#5abd11",
    "SOMOS PERU": "#ff0d26",
    "ACCION POPULAR": "#87222a",
    "AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL": "#e0087a",
    "BANCADA SOCIALISTA": "#181c1d",
    "BLOQUE DEMOCRATICO POPULAR": "#e35656",
    "HONOR Y DEMOCRACIA": "#708090",
    "NO AGRUPADO": "#c5cac6"
};

const CONGRESO_PARTIES = [
    { nombre: "FUERZA POPULAR", idOrg: 1366, congresistas: 20 },
    { nombre: "ALIANZA PARA EL PROGRESO", idOrg: 1257, congresistas: 17 },
    { nombre: "PODEMOS PERU", idOrg: 2731, congresistas: 12 },
    { nombre: "PERU LIBRE", idOrg: 2218, congresistas: 11 },
    { nombre: "RENOVACION POPULAR", idOrg: 22, congresistas: 11 },
    { nombre: "JUNTOS POR EL PERU", idOrg: 1264, congresistas: 11 },
    { nombre: "SOMOS PERU", idOrg: 14, congresistas: 10 },
    { nombre: "ACCION POPULAR", idOrg: 4, congresistas: 10 },
    { nombre: "AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL", idOrg: 2173, congresistas: 6 },
    { nombre: "BLOQUE DEMOCRATICO POPULAR", idOrg: null, congresistas: 5 },
    { nombre: "BANCADA SOCIALISTA", idOrg: null, congresistas: 5 },
    { nombre: "HONOR Y DEMOCRACIA", idOrg: null, congresistas: 5 }
].sort((a, b) => b.congresistas - a.congresistas);

const HemicycleDiagram = ({ parties }) => {
    const [selectedParty, setSelectedParty] = useState("FUERZA POPULAR");

    const { positionedSeats, partyLabels } = useMemo(() => {
        const rowData = [
            { count: 12, radius: 76, startIdx: 0 },
            { count: 16, radius: 100, startIdx: 12 },
            { count: 20, radius: 124, startIdx: 28 },
            { count: 24, radius: 148, startIdx: 48 },
            { count: 28, radius: 172, startIdx: 72 },
            { count: 30, radius: 196, startIdx: 100 }
        ];

        let allPositions = [];
        rowData.forEach((row) => {
            const separationAngular = 180 / (row.count - 1);
            for (let i = 0; i < row.count; i++) {
                const angle = 180 - (separationAngular * i);
                const radian = angle * (Math.PI / 180);
                const x = Math.cos(radian) * row.radius;
                const y = -Math.sin(radian) * row.radius;
                allPositions.push({ x, y, angle, radius: row.radius });
            }
        });

        // Ordenar por ángulo para agrupar bancadas como cuñas
        allPositions.sort((a, b) => b.angle - a.angle);

        const partySeats = [];
        const labelsData = [];
        let currentIdx = 0;

        parties.forEach(p => {
            const color = PARTY_COLORS[p.nombre] || "#9ca3af";
            const startAngle = allPositions[currentIdx]?.angle;

            for (let i = 0; i < p.congresistas; i++) {
                partySeats.push({ color, name: p.nombre });
                currentIdx++;
            }

            const endAngle = allPositions[currentIdx - 1]?.angle;
            const avgAngle = (startAngle + endAngle) / 2;

            if (p.congresistas > 0) {
                labelsData.push({
                    nombre: p.nombre,
                    idOrg: p.idOrg,
                    count: p.congresistas,
                    angle: avgAngle
                });
            }
        });

        // Completar hasta 130 y añadir etiqueta de No Agrupados
        const noAgrupadoStartIdx = currentIdx;
        const noAgrupadoColor = PARTY_COLORS["NO AGRUPADO"];
        while (partySeats.length < 130) {
            partySeats.push({ color: noAgrupadoColor, name: "NO AGRUPADO" });
            currentIdx++;
        }

        if (currentIdx > noAgrupadoStartIdx) {
            const startAngle = allPositions[noAgrupadoStartIdx]?.angle;
            const endAngle = allPositions[currentIdx - 1]?.angle;
            const avgAngle = (startAngle + endAngle) / 2;

            labelsData.push({
                nombre: "NO AGRUPADO",
                idOrg: null,
                count: currentIdx - noAgrupadoStartIdx,
                angle: avgAngle
            });
        }

        const seats = allPositions.map((pos, idx) => ({
            ...pos,
            color: partySeats[idx].color,
            partyName: partySeats[idx].name
        }));

        return { positionedSeats: seats, partyLabels: labelsData };
    }, [parties]);

    const selectedPartyData = useMemo(() =>
        partyLabels.find(p => p.nombre === selectedParty),
        [selectedParty, partyLabels]);

    return (
        <div className="flex flex-col items-center justify-start pt-10 pb-2 bg-transparent mb-6 relative overflow-visible w-full">
            <div
                className="w-full h-[220px] relative mt-4 flex items-center justify-center cursor-default"
                onClick={() => setSelectedParty(null)}
            >
                {/* Seats Container */}
                <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                    {positionedSeats.map((seat, idx) => {
                        const isSelected = selectedParty === seat.partyName;
                        return (
                            <div
                                key={idx}
                                className={`absolute w-[12px] h-[12px] sm:w-[15px] sm:h-[15px] rounded-full transition-all duration-200 z-10 border-0 shadow-sm cursor-pointer ${isSelected ? 'scale-125 z-30 ring-2 ring-yellow-300 ring-offset-1 ring-offset-slate-50' : 'hover:scale-110'}`}
                                style={{
                                    left: `calc(50% + ${seat.x}px)`,
                                    top: `calc(100% + ${seat.y}px)`,
                                    backgroundColor: seat.color,
                                    transform: 'translate(-50%, -50%)',
                                    opacity: selectedParty && !isSelected ? 0.4 : 1
                                }}
                                onClick={() => setSelectedParty(isSelected ? null : seat.partyName)}
                            />
                        );
                    })}

                    {/* Party Labels around the arc */}
                    {partyLabels.map((label, idx) => {
                        const labelRadius = 245;
                        const radian = label.angle * (Math.PI / 180);
                        const lx = Math.cos(radian) * labelRadius;
                        const ly = -Math.sin(radian) * labelRadius;
                        const partyId = label.idOrg;

                        const NO_LOGO_PARTIES = [
                            "BLOQUE DEMOCRATICO POPULAR",
                            "BANCADA SOCIALISTA",
                            "HONOR Y DEMOCRACIA",
                            "NO AGRUPADO"
                        ];
                        const isNoLogoGroup = NO_LOGO_PARTIES.includes(label.nombre);
                        const showLogo = partyId && !isNoLogoGroup;
                        const isSelected = selectedParty === label.nombre;

                        if (isNoLogoGroup) return null;

                        return (
                            <div
                                key={idx}
                                className="absolute flex flex-col items-center group pointer-events-auto cursor-pointer transition-all duration-300"
                                onClick={(e) => { e.stopPropagation(); setSelectedParty(isSelected ? null : label.nombre); }}
                                style={{
                                    left: `calc(50% + ${lx}px)`,
                                    top: `calc(100% + ${ly}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '60px',
                                    zIndex: isSelected ? 50 : 30
                                }}
                            >
                                <div className={`text-xs font-bold mb-0.5 transition-all duration-300 ${isSelected ? 'text-yellow-500 scale-110' : 'text-gray-800'}`}>
                                    {label.count}
                                </div>
                                <div className={`w-8 h-8 bg-white rounded-[6px] shadow-sm p-[2px] flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? 'scale-110 shadow-md' : ''}`}>
                                    <img
                                        src={`${JNE_LOGO}${partyId}.jpg`}
                                        alt={label.nombre}
                                        className="w-full h-full object-contain"
                                        onError={e => { e.target.src = `${JNE_LOGO_REMOTE}${partyId}`; e.target.onerror = null; }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selection Header (User's "linea amarilla") */}
            <div className={`w-[90%] max-w-[420px] h-[64px] flex items-center justify-between px-4 mt-6 z-50 transition-opacity duration-300 ${selectedPartyData ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {selectedPartyData && (
                    <>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {selectedPartyData.idOrg && (
                                <div className="w-[52px] h-[52px] bg-white rounded-[6px] p-[3px] shadow-sm flex items-center justify-center shrink-0">
                                    <img
                                        src={`${JNE_LOGO}${selectedPartyData.idOrg}.jpg`}
                                        alt={selectedPartyData.nombre}
                                        className="w-full h-full object-contain"
                                        onError={e => { e.target.src = `${JNE_LOGO_REMOTE}${selectedPartyData.idOrg}`; e.target.onerror = null; }}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col items-start pt-[2px] flex-1 min-w-0 pr-2">
                                <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest leading-none mb-1.5">Grupo Parlamentario</span>
                                <span className="text-[14px] sm:text-[15px] font-black text-[#1e293b] uppercase leading-none truncate w-full">
                                    {selectedPartyData.nombre}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 pl-2">
                            <span className="text-[32px] font-[900] text-[#1e293b] leading-none">
                                {selectedPartyData.count}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default function LeyendaCongreso({ active, onToggle }) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Preload logos (local files, fast)
        CONGRESO_PARTIES.forEach(party => {
            if (party.idOrg) {
                const img = new Image();
                img.src = `${JNE_LOGO}${party.idOrg}.jpg`;
            }
        });
    }, []);

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
                        PARTIDOS QUE CONFORMAN EL CONGRESO ACTUAL (2021-2026)
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
                                Composición del Congreso 2021-2026
                            </h2>
                            <p className="text-[13px] sm:text-[14px] text-white/90 font-medium pr-10 leading-none">
                                Información recolectada el 22 de Febrero del 2026.
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-white/80 hover:text-white text-2xl leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* List and Diagram */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-8">

                            <HemicycleDiagram parties={CONGRESO_PARTIES} />

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
