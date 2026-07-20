// omai-quiz-culturageneral-bancos-default.js
// Agrega todos los bancos de OMAI-Quiz Cultura General en un solo arreglo BANCOS_DEFECTO.

import { BANCOS_HISTORIA_UNIVERSAL } from "./omai-quiz-culturageneral-bancos-historia-universal.js";
import { BANCOS_GEOGRAFIA } from "./omai-quiz-culturageneral-bancos-geografia.js";
import { BANCOS_CIENCIA_NATURALEZA } from "./omai-quiz-culturageneral-bancos-ciencia-naturaleza.js";

const BANCOS_DEFECTO = [
  ...BANCOS_HISTORIA_UNIVERSAL,
  ...BANCOS_GEOGRAFIA,
  ...BANCOS_CIENCIA_NATURALEZA,
];

export { BANCOS_DEFECTO };
