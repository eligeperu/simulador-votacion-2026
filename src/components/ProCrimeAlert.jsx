import { useState } from 'react';
import rawVotesData from '../data/porestosno.json';

const LEYES_PRO_CRIMEN_IDS = ["31751", "31989", "31990", "32054", "32104", "32108", "32130", "32181", "32326"];

const LEYES_TITULOS = {
    "31751": "La 'Ley Soto' que fortalece la impunidad",
    "31989": "Ley que debilita la lucha contra la minería ilegal",
    "31990": "Ley que debilita la colaboración eficaz",
    "32054": "Ley que blinda de responsabilidad penal a los partidos políticos",
    "32104": "Ley que obliga a aplicar la 'Ley Soto' que fortalece la impunidad",
    "32108": "Ley que debilita la lucha contra el crimen organizado",
    "32130": "Ley que amenaza la autonomía de la investigación preliminar",
    "32181": "Ley que elimina la detención preliminar sin flagrancia",
    "32326": "Ley que protege el patrimonio de los criminales"
};

const LEYES_RESUMENES = {
    "31751": "El Congreso aprobó una reforma que reduce drásticamente a solo un año el plazo máximo de suspensión de la prescripción, el tiempo máximo que tiene el Estado para sancionar a un procesado por un delito. Con este cambio, casos complejos de corrupción y crimen organizado que requieren años de peritajes y análisis financieros se archivan antes de ser resueltos, beneficiando a funcionarios y exautoridades con procesos en curso.",
    "31989": "El Congreso aprobó una reforma que elimina la capacidad de la Policía Nacional para actuar contra mineros ilegales que usan explosivos sin autorización y operan con inscripciones suspendidas en el REINFO. Con estos cambios, se permite a los operadores informales actuar con impunidad, beneficiando a la minería ilegal y el crimen organizado.",
    "31990": "El Congreso aprobó una reforma que reduce el tiempo para corroborar la información brindada por colaboradores eficaces y prohíbe usar testimonios de múltiples colaboradores para verificar los mismos hechos. Con estos cambios, se beneficia redes criminales complejas de corrupción y crimen organizado.",
    "32054": "El Congreso aprobó una reforma que excluye a los partidos políticos de toda responsabilidad penal por delitos cometidos a través de su estructura organizativa. Con este cambio, la organización política solo podrá recibir sanciones administrativas y no puede ser disuelta, garantizando la supervivencia de partidos investigados por casos de financiamiento ilegal y vínculos con corrupción.",
    "32104": "El Congreso aprobó una norma que obliga a los jueces a aplicar la ley que reduce drásticamente a solo un año el plazo máximo de suspensión de la prescripción, el tiempo máximo que tiene el Estado para sancionar a un procesado por un delito. Con este cambio, casos complejos de corrupción y crimen organizado que requieren años de peritajes y análisis financieros se archivan antes de ser resueltos, beneficiando a funcionarios y exautoridades con procesos en curso.",
    "32108": "El Congreso aprobó una reforma que redefine los requisitos para considerar a un grupo como organización criminal, exigiendo una estructura compleja, permanencia y el control de un mercado ilegal. Con estos cambios, delitos de corrupción, lavado de activos y extorsión quedan excluidos al no cumplir con el nuevo umbral. Además, la norma obliga a que durante los allanamientos esté presente el abogado del intervenido. Con este cambio, se elimina el 'factor sorpresa' en los operativos, dándole tiempo a los involucrados para destruir o esconder pruebas incriminatorias.",
    "32130": "El Congreso aprobó una reforma que transfiere la conducción operativa de la investigación preliminar de los delitos del Ministerio Público a la Policía Nacional. Con este cambio, se resta autonomía a las investigaciones penales, ya que la Policía depende jerárquicamente del Gobierno de turno (Ministerio del Interior), abriendo la puerta a la manipulación política de casos de corrupción y debilitando el control jurídico que garantizaba la Fiscalía.",
    "32181": "El Congreso aprobó una reforma que eliminó la detención preliminar de sospechosos si no son capturados en el acto. Con este cambio, casos de crimen organizado, corrupción y delitos graves quedaron sin posibilidad de detener a los sospechosos mientras se investiga, facilitando su fuga. Asimismo, prohíbe a los jueces dictar detención preliminar contra efectivos policiales que, usando su arma de reglamento, maten o hieran a personas. Con estos cambios, se limita la capacidad del sistema de justicia y aumenta el riesgo de impunidad en casos de abuso de autoridad.",
    "32326": "El Congreso aprobó una reforma que exige una sentencia penal firme para iniciar el proceso de extinción de dominio, mecanismo que permite al Estado recuperar bienes obtenidos ilícitamente. Con este cambio, los acusados continúan disfrutando de sus bienes durante los largos años del juicio y asegurando que, si el caso penal prescribe, el Estado pierda definitivamente la posibilidad de recuperar dicho patrimonio."
};

const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

const ChevronUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
);

const FileText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
);

const ProCrimeAlert = ({ votos = [], slug = null }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedLaw, setExpandedLaw] = useState(null);

    // Si tenemos un slug, usamos la data cruda de porestosno.json que es más completa
    const candidateData = slug ? rawVotesData[slug] : null;
    const allVotos = candidateData ? candidateData.votos : votos;

    // Procesar votos por ley
    const leyesData = LEYES_PRO_CRIMEN_IDS.map(id => {
        const votosDeLey = allVotos.filter(v => v.votacion.includes(id));

        // Contar tipos de votos
        const countAFavor = votosDeLey.filter(v => v.voto === "A favor" || v.sigla_voto === "SI +++").length;
        const countEnContra = votosDeLey.filter(v => v.voto === "En contra" || v.sigla_voto === "NO ---").length;
        const countAusente = votosDeLey.filter(v => !["A favor", "En contra"].includes(v.voto) && v.sigla_voto !== "SI +++" && v.sigla_voto !== "NO ---").length;
        const totalVotos = votosDeLey.length;

        // Determinar estado principal para ordenamiento o color de borde si se necesitara (opcional)
        // Por ahora mantenemos la logica de 'status' para saber si mostrar el alert general, pero el detalle mostrará los counts
        const aFavor = countAFavor > 0;
        const enContra = countEnContra > 0;

        return {
            id,
            titulo: LEYES_TITULOS[id],
            resumen: LEYES_RESUMENES[id],
            status: aFavor ? 'favor' : (enContra ? 'contra' : (totalVotos > 0 ? 'ausente' : 'ninguno')),
            counts: { favor: countAFavor, contra: countEnContra, otro: countAusente },
            votos: votosDeLey
        };
    });

    const totalAFavor = leyesData.filter(l => l.status === 'favor').length;

    if (totalAFavor === 0) return null;

    return (
        <div className="mt-1 flex flex-col gap-1">
            {/* Cabecera Compacta */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-red-50 border-l-4 border-red-700 p-2 rounded-r-md shadow-sm cursor-pointer hover:bg-red-100 transition-colors"
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] shrink-0 leading-none flex items-center h-[9px]">🚨</span>
                            <span className="text-[8px] font-bold text-red-800 uppercase leading-none">
                                VOTÓ A FAVOR DE {totalAFavor} LEYES PRO-CRIMEN
                            </span>
                        </div>
                        <span className="text-[9px] text-red-700/90 font-medium leading-tight ml-[1px]">
                            Denominadas "Pro-crimen" ya que debilitan las herramientas del Estado para combatir la corrupción y el crimen organizado.
                        </span>
                    </div>
                    <div className="text-red-700">
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </div>
            </div>

            {/* Lista Expandida */}
            {isExpanded && (
                <div className="bg-white border border-red-200 rounded-md p-2 mt-0.5 shadow-md flex flex-col gap-2">
                    {leyesData.map((ley) => (
                        <div key={ley.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                            {/* Law Header - Toggle */}
                            <div
                                onClick={() => setExpandedLaw(expandedLaw === ley.id ? null : ley.id)}
                                className={`flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors ${expandedLaw === ley.id ? 'bg-slate-50' : ''
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-[9px] leading-tight font-medium ${ley.status === 'favor' ? 'text-black' : 'text-gray-600'
                                            }`}>
                                            Ley {ley.id} - {ley.titulo}
                                        </p>
                                        {/* Summary counts when collapsed */}
                                        {expandedLaw !== ley.id && ley.counts.favor > 0 && (
                                            <div className="shrink-0">
                                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-emerald-200">
                                                    A favor: {ley.counts.favor}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-0.5">
                                    {expandedLaw === ley.id ? <ChevronUp /> : <ChevronDown />}
                                </div>
                            </div>

                            {/* Detalle de Ley Expandido */}
                            {expandedLaw === ley.id && (
                                <div className="mt-1 bg-white p-2 rounded border border-slate-200 shadow-inner">
                                    <p className="text-[10px] text-gray-700 leading-snug mb-3">
                                        {ley.resumen}
                                    </p>

                                    <div className="border-t border-slate-100 pt-2">
                                        <p className="text-[10px] font-bold text-gray-700 mb-2 leading-snug">¿Cómo votó este congresista?</p>
                                        <div className="flex flex-col gap-1.5">
                                            {ley.votos.length > 0 ? (
                                                ley.votos
                                                    .sort((a, b) => {
                                                        const dateA = new Date(a.fecha);
                                                        const dateB = new Date(b.fecha);
                                                        if (dateA.getTime() !== dateB.getTime()) {
                                                            return dateA - dateB;
                                                        }
                                                        // Secondary sort for same day: Primera < Exoneración < Segunda
                                                        const getOrder = (v) => {
                                                            const s = v.toLowerCase();
                                                            if (s.includes('primera')) return 1;
                                                            if (s.includes('justicia')) return 2;
                                                            if (s.includes('exoneracion') || s.includes('exoneración')) return 3;
                                                            if (s.includes('segunda') || s.includes('permanente')) return 4;
                                                            return 5;
                                                        };
                                                        return getOrder(a.votacion) - getOrder(b.votacion);
                                                    })
                                                    .map((v, i) => {
                                                        const rawVoteName = v.votacion.split('-')[1]?.trim() || 'Votación';
                                                        let voteName = rawVoteName;

                                                        // Custom mapping for requested formats
                                                        const lowerName = rawVoteName.toLowerCase();
                                                        if (lowerName.includes('primera')) {
                                                            voteName = '1ra Votación';
                                                        } else if (lowerName.includes('exoneracion') || lowerName.includes('exoneración')) {
                                                            voteName = 'Exoneración 2da Votación';
                                                        } else if (lowerName.includes('segunda')) {
                                                            voteName = '2da Votación';
                                                        } else if (lowerName.includes('permanente') && v.votacion.includes('32108')) {
                                                            voteName = '2da Votación';
                                                        } else if (lowerName.includes('justicia')) {
                                                            voteName = 'Votación en Comisión';
                                                        } else {
                                                            // Fallback to Title Case for others
                                                            voteName = lowerName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                                        }

                                                        return (
                                                            <div key={i} className="flex flex-col gap-1.5 border-b border-slate-100 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                                                                {/* Line 1: Header */}
                                                                {/* Line 1: Header */}
                                                                <div className="flex items-center justify-between text-[10px] leading-tight">
                                                                    <span className="font-bold text-black">{voteName}</span>
                                                                    <span className="text-gray-500 font-medium">{v.fecha.split('-').reverse().join('/')}</span>
                                                                </div>

                                                                {/* Line 2: Voto + Badge */}
                                                                {/* Line 2: Voto + Badge */}
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] text-gray-600 font-medium">Voto:</span>
                                                                    {(v.voto === 'A favor' || v.sigla_voto === 'SI +++') ? (
                                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border border-green-200 inline-block">
                                                                            A FAVOR
                                                                        </span>
                                                                    ) : (v.voto === 'En contra' || v.sigla_voto === 'NO ---') ? (
                                                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border border-red-200 inline-block">
                                                                            EN CONTRA
                                                                        </span>
                                                                    ) : (v.voto === 'Abstención' || v.sigla_voto === 'ABS ,,,') ? (
                                                                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border border-orange-200 inline-block">
                                                                            ABSTENCIÓN
                                                                        </span>
                                                                    ) : (v.voto && v.voto.toLowerCase().includes('licencia')) ? (
                                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border border-blue-200 inline-block">
                                                                            {v.voto.toUpperCase()}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border border-gray-200 inline-block">
                                                                            {(v.voto || 'AUSENTE').toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Line 3: Link */}
                                                                <a
                                                                    href={v.fuente_oficial}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline w-fit"
                                                                >
                                                                    <span>🔗</span> Ver Fuente Oficial
                                                                </a>
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                <p className="text-[9px] text-gray-400 italic">No se registraron votaciones específicas en el pleno.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProCrimeAlert;
