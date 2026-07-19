// omai-quiz-bancos-default.js
// Agregador: combina los bancos de cada area en un solo arreglo BANCOS_DEFECTO.
// Cada area vive en su propio archivo para que sea mas facil mantenerlos y ampliarlos.

import { BANCOS_DIFERENCIAL } from "./omai-quiz-bancos-diferencial.js";
import { BANCOS_INTEGRAL } from "./omai-quiz-bancos-integral.js";
import { BANCOS_MULTIVARIABLE } from "./omai-quiz-bancos-multivariable.js";
import { BANCOS_EDO } from "./omai-quiz-bancos-edo.js";
import { BANCOS_LAPLACE } from "./omai-quiz-bancos-laplace.js";

const BANCOS_DEFECTO = [
  ...BANCOS_DIFERENCIAL,
  ...BANCOS_INTEGRAL,
  ...BANCOS_MULTIVARIABLE,
  ...BANCOS_EDO,
  ...BANCOS_LAPLACE,
];

export { BANCOS_DEFECTO };
