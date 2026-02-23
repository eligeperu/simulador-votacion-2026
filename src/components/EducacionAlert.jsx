/**
 * EducacionAlert
 * Muestra el nivel educativo más alto alcanzado por un candidato,
 * siguiendo el mismo formato visual que JudicialAlert.
 */

// Mapeo de nivel educativo (detectado por palabras clave en educacionMax) → etiqueta corta
const detectarNivel = (educacionMax) => {
    if (!educacionMax) return null;
    const upper = educacionMax.toUpperCase();

    if (upper.includes('DOCTOR')) return 'DOCTORADO';
    if (upper.includes('MAGIST') || upper.includes('MÁSTER') || upper.includes('MASTER') || upper.includes('MAESTR')) return 'MAESTRÍA';
    if (
        upper.includes('LICENCI') ||
        upper.includes('BACHILLER') ||
        upper.includes('INGENIER') ||
        upper.includes('ABOGAD') ||
        upper.includes('MÉDIC') ||
        upper.includes('MEDIC') ||
        upper.includes('CONTADOR') ||
        upper.includes('ARQUITECT') ||
        upper.includes('ECONOMIS') ||
        upper.includes('ADMINISTRADOR') ||
        upper.includes('UNIVERSITARI')
    ) return 'UNIVERSITARIO';
    if (upper.includes('TÉCNICO') || upper.includes('TECNICO') || upper.includes('NO UNIVERSITARI')) return 'TÉCNICO';
    if (upper.includes('SECUNDARI')) return 'SECUNDARIA';
    if (upper.includes('PRIMARI')) return 'PRIMARIA';
    return 'UNIVERSITARIO';
};

// Extrae el año más reciente de la formación académica
const extraerAnio = (formacion, nivel) => {
    if (!formacion) return null;

    if (nivel === 'DOCTORADO' || nivel === 'MAESTRÍA') {
        const items = [
            ...(formacion.educacionPosgrado || []),
            ...(formacion.educacionPosgradoOtro || [])
        ];
        const anios = items
            .map(p => p.txAnioPosgrado || p.txAnioPosgradoOtro)
            .filter(a => a && /^\d{4}$/.test(a))
            .map(Number)
            .sort((a, b) => b - a);
        if (anios.length) return String(anios[0]);
    }

    if (nivel === 'UNIVERSITARIO') {
        const items = formacion.educacionUniversitaria || [];
        const anios = items
            .map(u => u.anioBachiller || u.anioTitulo)
            .filter(a => a && /^\d{4}$/.test(a))
            .map(Number)
            .sort((a, b) => b - a);
        if (anios.length) return String(anios[0]);
    }

    return null;
};

// Capitaliza estilo Title Case (con artículos en minúscula)
const toTitleCase = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\bDe\b/g, 'de')
        .replace(/\bDel\b/g, 'del')
        .replace(/\bLa\b/g, 'la')
        .replace(/\bLas\b/g, 'las')
        .replace(/\bLos\b/g, 'los')
        .replace(/\bEl\b/g, 'el')
        .replace(/\bEn\b/g, 'en')
        .replace(/\bY\b/g, 'y')
        .replace(/\bS\.A\.C\./gi, 'S.A.C.')
        .replace(/\bS\.A\./gi, 'S.A.');
};

// Prefijos de grado a eliminar (el badge ya lo indica)
const PREFIJOS_GRADO = [
    // Doctorado
    /^GRADO\s+DE\s+DOCTOR\s+(EN\s+)?/i,
    /^GRADO\s+DE\s+DOCTORADO\s+(EN\s+)?/i,
    /^DOCTORADO\s+(EN|DE)\s+/i,
    /^DOCTOR\s+(EN|DE)\s+/i,
    /^PHD\s+(EN|DE|IN)\s+/i,
    // Maestría — variantes compuestas primero (más específicas)
    /^GRADO\s+DE\s+MAESTR[OA]\s+(EN\s+)?/i,
    /^GRADO\s+DE\s+MAGÍSTER\s+(EN\s+)?/i,
    /^GRADO\s+DE\s+MAGISTER\s+(EN\s+)?/i,
    /^TÍTULO\s+DE\s+MÁSTER\s+EN\s+/i,
    /^TÍTULO\s+DE\s+MASTER\s+EN\s+/i,
    /^MÁSTER\s+UNIVERSITARIO\s+(EN\s+)?/i,
    /^MASTER\s+UNIVERSITARIO\s+(EN\s+)?/i,
    /^MAESTRÍA\s+EN\s+CIENCIAS\s+(DE\s+)?/i,
    /^MAGISTER\s+EN\s+CIENCIAS\s+(DE\s+)?/i,
    /^MAGÍSTER\s+EN\s+CIENCIAS\s+(DE\s+)?/i,
    /^MAGÍSTER\s+EN\s+/i,
    /^MAGISTER\s+EN\s+/i,
    /^MÁSTER\s+EN\s+/i,
    /^MASTER\s+EN\s+/i,
    /^MAESTRÍA\s+EN\s+/i,
    /^MAESTRO\s+EN\s+/i,
    /^MBA\s+EN\s+/i,
    // Universitario — variantes compuestas primero
    /^TÍTULO\s+DE\s+LICENCIAD[OA]\s+(EN\s+)?/i,
    /^TÍTULO\s+DE\s+INGENIERO\s+/i,
    /^TÍTULO\s+DE\s+BACHILLER\s+(EN\s+)?/i,
    /^LICENCIADO\s+(EN|DE)\s+/i,
    /^LICENCIADA\s+(EN|DE)\s+/i,
    /^LICENCIAT[OA]\s+EN\s+(CIENCIAS\s+(DE\s+)?|ARTES\s+(DE\s+)?)?/i,
    /^BACHILLER\s+EN\s+(CIENCIAS\s+(DE\s+)?|ARTES\s+(DE\s+)?)?/i,
    /^BACHIYER\s+EN\s+(CIENCIAS\s+(DE\s+)?|ARTES\s+(DE\s+)?)?/i,
    /^BACHILLERA?\s+EN\s+/i,
    /^INGENIERO\s+(DE\s+)?/i,
    /^ABOGADO\s+(DE\s+)?/i,
    /^MÉDICO\s+(DE\s+)?/i,
    /^CONTADOR\s+(PÚBLICO\s+)?/i,
    // Técnico
    /^TÉCNICO\s+(EN\s+)?/i,
    /^TÉCNICA\s+(EN\s+)?/i,
];

// Sufijos redundantes a eliminar, ej: "(GRADO DE MAESTRO)"
const SUFIJO_GRADO = /\s*\(GRADO\s+DE\s+[^)]+\)\s*$/i;

const limpiarEspecialidad = (educacionMax) => {
    if (!educacionMax) return '';
    let texto = educacionMax.trim();

    // Quitar sufijo tipo "(GRADO DE MAESTRO)"
    texto = texto.replace(SUFIJO_GRADO, '').trim();

    // Quitar prefijo de grado
    for (const re of PREFIJOS_GRADO) {
        const resultado = texto.replace(re, '');
        if (resultado !== texto) {
            texto = resultado.trim();
            break;
        }
    }

    return texto || educacionMax.trim();
};

// Paleta por nivel
const NIVEL_BADGE = {
    'DOCTORADO': { bg: 'bg-purple-700', text: 'text-white' },
    'MAESTRÍA': { bg: 'bg-indigo-600', text: 'text-white' },
    'UNIVERSITARIO': { bg: 'bg-blue-600', text: 'text-white' },
    'TÉCNICO': { bg: 'bg-teal-600', text: 'text-white' },
    'SECUNDARIA': { bg: 'bg-slate-500', text: 'text-white' },
    'PRIMARIA': { bg: 'bg-slate-400', text: 'text-white' },
};

const EducacionAlert = ({ educacionMax, institucion, formacion }) => {
    if (!educacionMax) return null;

    const nivel = detectarNivel(educacionMax);
    if (!nivel) return null;

    const anio = extraerAnio(formacion, nivel);
    const badge = NIVEL_BADGE[nivel] || NIVEL_BADGE['UNIVERSITARIO'];

    // Solo el área de especialización, sin prefijo de grado
    const especialidad = toTitleCase(limpiarEspecialidad(educacionMax));
    const centroEducativo = institucion ? institucion.toUpperCase() : '';

    return (
        <div className="bg-sky-50 border-l-4 border-sky-500 py-2 pr-2 pl-2 rounded-r-md shadow-sm mt-1">
            <div className="flex flex-col gap-1">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <span className="text-sky-500 text-[11px] leading-none shrink-0">🎓</span>
                    <span className="text-[8.5px] font-bold text-sky-800 uppercase">
                        Nivel educativo más alto:
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white border border-sky-100 p-2.5 rounded-md shadow-sm flex flex-col gap-1.5">
                    {/* Año + Nivel (badges) */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {anio && (
                            <div className="bg-[#1e293b] text-white text-[7.5px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                                {anio}
                            </div>
                        )}
                        <div className={`${badge.bg} ${badge.text} text-[7.5px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap shrink-0`}>
                            {nivel}
                        </div>
                    </div>

                    {/* Especialización (sin prefijo) */}
                    <div className="text-[8.5px] font-bold text-[#111827] uppercase leading-tight">
                        {especialidad}
                    </div>

                    {/* Centro educativo */}
                    {centroEducativo && (
                        <div className="text-[8px] text-gray-500 leading-tight">
                            {centroEducativo}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducacionAlert;
