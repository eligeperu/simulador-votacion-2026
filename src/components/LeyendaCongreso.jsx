import { useState, useEffect, useMemo } from 'react';

const JNE_LOGO = "https://sroppublico.jne.gob.pe/Consulta/Simbolo/GetSimbolo/";

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
    const [selectedParty, setSelectedParty] = useState(null);

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
        <div className="flex flex-col items-center justify-center pt-4 pb-20 bg-white rounded-xl mb-6 relative overflow-hidden border border-gray-100 min-h-[500px]">
            <div className="text-[10px] text-gray-400 absolute top-2 right-4 font-mono uppercase tracking-widest leading-none">Composición del Legislativo</div>

            {/* Selection Header (User's "linea amarilla") */}
            <div className={`w-[90%] max-w-[400px] h-[60px] flex items-center justify-between px-6 rounded-lg transition-all duration-300 border-b-4 ${selectedPartyData ? 'bg-yellow-50 border-yellow-400 opacity-100 shadow-sm' : 'bg-transparent border-transparent opacity-0'}`}>
                {selectedPartyData && (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded border border-gray-100 p-1 shadow-sm flex items-center justify-center">
                                {selectedPartyData.idOrg ? (
                                    <img
                                        src={`${JNE_LOGO}${selectedPartyData.idOrg}`}
                                        alt={selectedPartyData.nombre}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-gray-400">?</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 font-bold uppercase leading-none mb-1">Grupo Parlamentario</span>
                                <span className="text-sm font-black text-gray-800 uppercase leading-none truncate max-w-[180px]">
                                    {selectedPartyData.nombre}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-yellow-600 leading-none">
                                {selectedPartyData.count}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <div
                className="w-full h-[320px] relative mt-2 flex items-center justify-center cursor-default"
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

                        return (
                            <div
                                key={idx}
                                className="absolute flex flex-col items-center group pointer-events-none transition-all duration-300"
                                style={{
                                    left: `calc(50% + ${lx}px)`,
                                    top: `calc(100% + ${ly}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '60px',
                                    zIndex: isSelected ? 50 : 30,
                                    opacity: isNoLogoGroup && !isSelected ? 0.6 : 1
                                }}
                            >
                                <div className={`text-xs font-bold mb-0.5 transition-all duration-300 ${isSelected ? 'text-blue-600 scale-110' : (isNoLogoGroup ? 'text-transparent' : 'text-gray-800')}`}>
                                    {label.count}
                                </div>
                                {showLogo ? (
                                    <div className={`w-8 h-8 rounded bg-white shadow-sm border flex items-center justify-center overflow-hidden transition-all ${isSelected ? 'border-blue-400 scale-110 shadow-md' : 'border-gray-100'}`}>
                                        <img
                                            src={`${JNE_LOGO}${partyId}`}
                                            alt={label.nombre}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className={`text-[10px] font-bold uppercase transition-all duration-300 ${isSelected ? 'text-blue-700 bg-white/90 rounded-sm shadow-md px-2 py-1' : 'opacity-0 scale-50'}`}>
                                        {label.nombre === "NO AGRUPADO" ? "NO AGRUPADOS" : label.nombre}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function LeyendaCongreso({ active, onToggle }) {
    const [showModal, setShowModal] = useState(false);

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
                className="border-2 border-[#991B1B] bg-[#FEE2E2] rounded-[6px] p-3 flex items-center justify-between cursor-pointer select-none shadow-sm hover:shadow-md transition-shadow"
                onClick={() => onToggle(!active)}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={() => { }} // Controlled by parent
                            className="w-[18px] h-[18px] appearance-none border-2 border-[#991B1B] rounded sm:w-[20px] sm:h-[20px] checked:bg-[#991B1B] cursor-pointer"
                        />
                        {active && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold pointer-events-none">✓</span>
                        )}
                    </div>
                    <span className="text-sm sm:text-[14px] font-semibold text-[#991B1B]">
                        Partidos que conforman el Congreso actual (2021-2026)
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                    className="text-blue-600 font-medium text-[13px] underline hover:text-blue-800 transition-colors"
                >
                    Ver detalle
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                    role="dialog"
                    aria-modal="true">
                    <div className="bg-white rounded-xl w-full max-w-[620px] max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 relative">
                            <h2 className="text-[18px] font-bold text-gray-800 pr-8">Composición del Congreso 2021-2026</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-[#6B7280] hover:text-[#1F2937] text-2xl leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* List and Diagram */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                            <HemicycleDiagram parties={CONGRESO_PARTIES} />

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 text-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 px-8 rounded-[6px] transition-colors shadow-md active:scale-95"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
