import { fusionarDatos } from './constants';
import raw from './parlamenAndino.json';
import enriched from './parlamenAndino-enriched.json';

export const parlamenAndino = fusionarDatos(raw, enriched);
export default parlamenAndino;
