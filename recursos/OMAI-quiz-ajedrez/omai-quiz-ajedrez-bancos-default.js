// omai-quiz-ajedrez-bancos-default.js
// Agregador: combina los bancos de cada area de Ajedrez en un solo arreglo BANCOS_DEFECTO.
// Cada area vive en su propio archivo para que sea mas facil mantenerlos y ampliarlos.

import { BANCOS_NOTACION } from "./omai-quiz-ajedrez-bancos-notacion.js";
import { BANCOS_TACTICA } from "./omai-quiz-ajedrez-bancos-tactica.js";
import { BANCOS_ESTRATEGIA } from "./omai-quiz-ajedrez-bancos-estrategia.js";
import { BANCOS_FINALES } from "./omai-quiz-ajedrez-bancos-finales.js";
import { BANCOS_HISTORIA } from "./omai-quiz-ajedrez-bancos-historia.js";

const BANCOS_DEFECTO = [
  ...BANCOS_NOTACION,
  ...BANCOS_TACTICA,
  ...BANCOS_ESTRATEGIA,
  ...BANCOS_FINALES,
  ...BANCOS_HISTORIA,
];

export { BANCOS_DEFECTO };
