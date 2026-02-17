import { fusionarDatos } from '../constants';

import amazonasOrig from './amazonas.json';
import ancashOrig from './ancash.json';
import apurimacOrig from './apurimac.json';
import arequipaOrig from './arequipa.json';
import ayacuchoOrig from './ayacucho.json';
import cajamarcaOrig from './cajamarca.json';
import callaoOrig from './callao.json';
import cuscoOrig from './cusco.json';
import huancavelicaOrig from './huancavelica.json';
import huanucoOrig from './huanuco.json';
import icaOrig from './ica.json';
import juninOrig from './junin.json';
import laLibertadOrig from './la-libertad.json';
import lambayequeOrig from './lambayeque.json';
import limaOrig from './lima.json';
import limaProvinciasOrig from './lima-provincias.json';
import loretoOrig from './loreto.json';
import madreDeDiosOrig from './madre-de-dios.json';
import moqueguaOrig from './moquegua.json';
import pascoOrig from './pasco.json';
import piuraOrig from './piura.json';
import punoOrig from './puno.json';
import sanMartinOrig from './san-martin.json';
import tacnaOrig from './tacna.json';
import tumbesOrig from './tumbes.json';
import ucayaliOrig from './ucayali.json';
import peruanosExtranjeroOrig from './peruanos-extranjero.json';

import amazonasEnr from '../senadoresRegional-enriched/amazonas-enriched.json';
import ancashEnr from '../senadoresRegional-enriched/ancash-enriched.json';
import apurimacEnr from '../senadoresRegional-enriched/apurimac-enriched.json';
import arequipaEnr from '../senadoresRegional-enriched/arequipa-enriched.json';
import ayacuchoEnr from '../senadoresRegional-enriched/ayacucho-enriched.json';
import cajamarcaEnr from '../senadoresRegional-enriched/cajamarca-enriched.json';
import callaoEnr from '../senadoresRegional-enriched/callao-enriched.json';
import cuscoEnr from '../senadoresRegional-enriched/cusco-enriched.json';
import huancavelicaEnr from '../senadoresRegional-enriched/huancavelica-enriched.json';
import huanucoEnr from '../senadoresRegional-enriched/huanuco-enriched.json';
import icaEnr from '../senadoresRegional-enriched/ica-enriched.json';
import juninEnr from '../senadoresRegional-enriched/junin-enriched.json';
import laLibertadEnr from '../senadoresRegional-enriched/la-libertad-enriched.json';
import lambayequeEnr from '../senadoresRegional-enriched/lambayeque-enriched.json';
import limaEnr from '../senadoresRegional-enriched/lima-enriched.json';
import limaProvinciasEnr from '../senadoresRegional-enriched/lima-provincias-enriched.json';
import loretoEnr from '../senadoresRegional-enriched/loreto-enriched.json';
import madreDeDiosEnr from '../senadoresRegional-enriched/madre-de-dios-enriched.json';
import moqueguaEnr from '../senadoresRegional-enriched/moquegua-enriched.json';
import pascoEnr from '../senadoresRegional-enriched/pasco-enriched.json';
import piuraEnr from '../senadoresRegional-enriched/piura-enriched.json';
import punoEnr from '../senadoresRegional-enriched/puno-enriched.json';
import sanMartinEnr from '../senadoresRegional-enriched/san-martin-enriched.json';
import tacnaEnr from '../senadoresRegional-enriched/tacna-enriched.json';
import tumbesEnr from '../senadoresRegional-enriched/tumbes-enriched.json';
import ucayaliEnr from '../senadoresRegional-enriched/ucayali-enriched.json';
import peruanosExtranjeroEnr from '../senadoresRegional-enriched/peruanos-extranjero-enriched.json';

export const senadoresRegional = {
  amazonas: fusionarDatos(amazonasOrig, amazonasEnr),
  ancash: fusionarDatos(ancashOrig, ancashEnr),
  apurimac: fusionarDatos(apurimacOrig, apurimacEnr),
  arequipa: fusionarDatos(arequipaOrig, arequipaEnr),
  ayacucho: fusionarDatos(ayacuchoOrig, ayacuchoEnr),
  cajamarca: fusionarDatos(cajamarcaOrig, cajamarcaEnr),
  callao: fusionarDatos(callaoOrig, callaoEnr),
  cusco: fusionarDatos(cuscoOrig, cuscoEnr),
  huancavelica: fusionarDatos(huancavelicaOrig, huancavelicaEnr),
  huanuco: fusionarDatos(huanucoOrig, huanucoEnr),
  ica: fusionarDatos(icaOrig, icaEnr),
  junin: fusionarDatos(juninOrig, juninEnr),
  'la-libertad': fusionarDatos(laLibertadOrig, laLibertadEnr),
  lambayeque: fusionarDatos(lambayequeOrig, lambayequeEnr),
  lima: fusionarDatos(limaOrig, limaEnr),
  'lima-provincias': fusionarDatos(limaProvinciasOrig, limaProvinciasEnr),
  loreto: fusionarDatos(loretoOrig, loretoEnr),
  'madre-de-dios': fusionarDatos(madreDeDiosOrig, madreDeDiosEnr),
  moquegua: fusionarDatos(moqueguaOrig, moqueguaEnr),
  pasco: fusionarDatos(pascoOrig, pascoEnr),
  piura: fusionarDatos(piuraOrig, piuraEnr),
  puno: fusionarDatos(punoOrig, punoEnr),
  'san-martin': fusionarDatos(sanMartinOrig, sanMartinEnr),
  tacna: fusionarDatos(tacnaOrig, tacnaEnr),
  tumbes: fusionarDatos(tumbesOrig, tumbesEnr),
  ucayali: fusionarDatos(ucayaliOrig, ucayaliEnr),
  'peruanos-extranjero': fusionarDatos(peruanosExtranjeroOrig, peruanosExtranjeroEnr),
};

export default senadoresRegional;
