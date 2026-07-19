// kahoot-derivadas-preguntas.js
// Banco de 10 preguntas de cálculo diferencial básico-intermedio.
// Formato: { texto, opciones: [4], correcta: índice (0-based) }

const PREGUNTAS_DERIVADAS = [
  {
    texto: "¿Cuál es la derivada de f(x) = x⁴?",
    opciones: ["4x³", "x³", "4x⁴", "x⁴/4"],
    correcta: 0,
  },
  {
    texto: "¿Cuál es la derivada de f(x) = sin(x)?",
    opciones: ["-cos(x)", "cos(x)", "-sin(x)", "tan(x)"],
    correcta: 1,
  },
  {
    texto: "¿Cuál es la derivada de f(x) = eˣ?",
    opciones: ["x·eˣ⁻¹", "eˣ", "ln(x)", "eˣ/x"],
    correcta: 1,
  },
  {
    texto: "Usando la regla del producto, ¿cuál es d/dx[x²·sin(x)]?",
    opciones: [
      "2x·sin(x) + x²·cos(x)",
      "2x·cos(x)",
      "x²·cos(x)",
      "2x·sin(x) − x²·cos(x)",
    ],
    correcta: 0,
  },
  {
    texto: "¿Cuál es la derivada de f(x) = ln(x)?",
    opciones: ["x", "1/x", "eˣ", "ln(x)/x"],
    correcta: 1,
  },
  {
    texto: "Usando la regla de la cadena, ¿cuál es d/dx[sin(3x)]?",
    opciones: ["cos(3x)", "3cos(3x)", "3sin(3x)", "cos(x)"],
    correcta: 1,
  },
  {
    texto: "¿Cuál es la derivada de f(x) = 1/x (para x ≠ 0)?",
    opciones: ["1/x²", "-1/x²", "-1/x", "ln(x)"],
    correcta: 1,
  },
  {
    texto: "Si f(x) = x³ − 3x, ¿en qué valores f'(x) = 0?",
    opciones: ["x = 0 y x = 3", "x = ±1", "x = ±3", "x = 1 y x = −3"],
    correcta: 1,
  },
  {
    texto: "Usando la regla del cociente, ¿cuál es d/dx[x/(x+1)]?",
    opciones: ["1/(x+1)²", "1/(x+1)", "x/(x+1)²", "−1/(x+1)²"],
    correcta: 0,
  },
  {
    texto: "¿Cuál es la segunda derivada de f(x) = x⁵?",
    opciones: ["5x⁴", "20x³", "5x³", "20x⁴"],
    correcta: 1,
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PREGUNTAS_DERIVADAS };
}
