import { fusionarDatos } from './constants';
import raw from './senadoresNacional.json';
import enriched from './senadoresNacional-enriched.json';

export const senadoresNacional = fusionarDatos(raw, enriched);
export default senadoresNacional;
