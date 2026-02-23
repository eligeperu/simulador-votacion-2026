import { REGION_DEPARTAMENTOS } from '../data/constants';

const MapPinIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const normalizeDept = (d) => (d || '').trim().toUpperCase();

const NoViveAquiAlert = ({ domicilio, region }) => {
  if (!domicilio?.departamento || !region) return null;
  if (region === 'peruanos-extranjero') return null;

  const deptos = REGION_DEPARTAMENTOS[region];
  if (!deptos) return null;

  const domiDepto = normalizeDept(domicilio.departamento);
  if (!domiDepto) return null;

  const viveEnRegion = deptos.some(d => normalizeDept(d) === domiDepto);
  if (viveEnRegion) return null;

  const domiDisplay = [domicilio.distrito, domicilio.provincia, domicilio.departamento]
    .filter(Boolean)
    .filter(s => s.trim())
    .join(', ');

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded-r-md shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-3 flex justify-center shrink-0">
            <MapPinIcon className="text-blue-600" />
          </div>
          <span className="text-[8.5px] font-bold text-blue-800 uppercase leading-none">
            NO RESIDE EN ESTA REGIÓN
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-3 flex justify-center shrink-0 mt-[1px]">
            <span className="text-[10px] text-blue-500 font-bold leading-none">•</span>
          </div>
          <span className="text-[10px] font-medium text-gray-700 leading-tight">
            Declara vivir en {domiDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoViveAquiAlert;
