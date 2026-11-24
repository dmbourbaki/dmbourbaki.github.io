// omai-quiz-POC.js
// Banco POC (Ecuaciones Diferenciales), para OMAI-Quiz.
// Las imágenes se referencian con ruta completa a la carpeta images_POC/
// (separada de imagenes/ de Cultura General y de imgs_saberpro/) para que no se mezclen.
//
// LaTeX: las ecuaciones van entre \( ... \) (en línea). Se escriben con String.raw
// (alias "tex") para NO tener que duplicar las barras invertidas: \frac se escribe \frac.
// Ojo: el signo "$" no activa modo matemático en estas páginas (se reserva para pesos).
const tex = String.raw;

const BANCOS_POC = [
  {
    id: "poc-ecuaciones-diferenciales",
    area: "POC",
    nombre: "Ecuaciones Diferenciales",
    preguntas: [
      // 1 · Modelado (ley de enfriamiento de Newton)
      {
        texto: tex`Una taza de café a 90 °C se deja en una habitación cuya temperatura ambiente es constante e igual a 20 °C. Después de 5 minutos el café está a 70 °C. Si \(T(t)\) es la temperatura en °C y \(t\) el tiempo en minutos, el modelo según la ley de enfriamiento de Newton es:`,
        opciones: [
          tex`\(\dfrac{dT}{dt} = kT; \; T(0) = 90 \text{ y } T(5) = 70\)`,
          tex`\(\dfrac{dT}{dt} = k\,(T - 20); \; T(0) = 90 \text{ y } T(5) = 70\)`,
          tex`\(\dfrac{dT}{dt} = k\,(T - 90); \; T(0) = 20 \text{ y } T(5) = 70\)`,
          tex`\(\dfrac{dT}{dt} = k\,(T - 20); \; T(0) = 70 \text{ y } T(5) = 90\)`,
        ],
        correcta: 1,
        nivel: "intermedio",
        contenido: "Modelado",
        imagen: null,
      },
      // 2 · Clasificación (orden) con código de Google Colab / SymPy
      {
        texto: tex`Estudiantes de Ecuaciones Diferenciales usan Google Colab para modelar la deformación \(y(x)\) de una pasarela peatonal de una vereda, como la de la figura. Un grupo escribió con SymPy el lado izquierdo de la ecuación, que se iguala a cero: 'ec = y(x).diff(x, 3) - 5*(y(x).diff(x))**4 + x*y(x) - sp.exp(x)'. A partir de la expresión escrita, ¿cuál es el orden de la ecuación diferencial que describe 'ec'?`,
        opciones: [
          "El orden es 5.",
          "Su orden es 1.",
          "Es de orden 4.",
          "El orden es 3.",
        ],
        correcta: 3,
        nivel: "basico",
        contenido: "Clasificación",
        imagen: "images_POC/puente_colab.jpg",
      },
      // 3 · Campo de direcciones: pendiente en un punto
      {
        texto: tex`Una asociación piscícola de una vereda modela la población \(y\) (en cientos de tilapias) de un estanque en función del tiempo \(x\) (en meses) con una ecuación \(y' = f(x, y)\). La figura presenta el campo de pendientes. En la ubicación del punto \(A(3, 4)\), la pendiente es:`,
        opciones: [
          "positiva (mayor que cero).",
          "negativa (menor que cero).",
          "inexistente (tangente vertical).",
          "nula (igual a cero).",
        ],
        correcta: 3,
        nivel: "basico",
        contenido: "Campo de direcciones",
        imagen: "images_POC/campo_pendientes_A.png",
      },
      // 4 · Campo de direcciones: identificar la ecuación
      {
        texto: tex`El comité ambiental de una vereda recibe de un asesor la figura, que muestra el campo de pendientes de una ecuación diferencial de primer orden \(\dfrac{dy}{dx} = f(x, y)\) para la acumulación de sedimentos \(y\) en el reservorio del acueducto veredal. ¿Cuál de las siguientes ecuaciones genera ese campo?`,
        opciones: [
          tex`Corresponde a \(\dfrac{dy}{dx} = y - x^{2}\).`,
          tex`La ecuación es \(\dfrac{dy}{dx} = x^{2} - y\).`,
          tex`Corresponde a \(\dfrac{dy}{dx} = x - y\).`,
          tex`Se trata de \(\dfrac{dy}{dx} = x^{2} + y\).`,
        ],
        correcta: 0,
        nivel: "intermedio",
        contenido: "Campo de direcciones",
        imagen: "images_POC/campo_pendientes_ecuacion.png",
      },
      // 5 · Variables separables con valor inicial
      {
        texto: tex`La solución del problema de valor inicial \(\dfrac{dy}{dx} = 2xy\), con \(y(0) = 3\), es:`,
        opciones: [
          tex`\(y = 3e^{2x}\)`,
          tex`\(y = 3e^{x^{2}}\)`,
          tex`\(y = e^{x^{2}} + 2\)`,
          tex`\(y = 3e^{\frac{x^{2}}{2}}\)`,
        ],
        correcta: 1,
        nivel: "intermedio",
        contenido: "Variables separables",
        imagen: null,
      },
      // 6 · Segundo orden homogénea, raíces reales distintas
      {
        texto: tex`La solución general de \(y'' - 5y' + 6y = 0\) es:`,
        opciones: [
          tex`\(y = C_{1}e^{-2x} + C_{2}e^{-3x}\)`,
          tex`\(y = C_{1}e^{5x} + C_{2}e^{6x}\)`,
          tex`\(y = C_{1}e^{2x} + C_{2}e^{3x}\)`,
          tex`\(y = C_{1}e^{2x} + C_{2}e^{-3x}\)`,
        ],
        correcta: 2,
        nivel: "basico",
        contenido: "EDO lineal de segundo orden",
        imagen: null,
      },
      // 7 · Segundo orden homogénea, raíces complejas
      {
        texto: tex`La solución general de \(y'' + 4y = 0\) es:`,
        opciones: [
          tex`\(y = C_{1}\cos(2x) + C_{2}\sin(2x)\)`,
          tex`\(y = C_{1}e^{2x} + C_{2}e^{-2x}\)`,
          tex`\(y = C_{1}\cos(4x) + C_{2}\sin(4x)\)`,
          tex`\(y = e^{2x}\left[C_{1}\cos(2x) + C_{2}\sin(2x)\right]\)`,
        ],
        correcta: 0,
        nivel: "basico",
        contenido: "EDO lineal de segundo orden",
        imagen: null,
      },
      // 8 · Coeficientes indeterminados
      {
        texto: tex`Una solución particular de \(y'' - 3y' + 2y = 4e^{3x}\) es:`,
        opciones: [
          tex`\(y_{p} = 4e^{3x}\)`,
          tex`\(y_{p} = 2x\,e^{3x}\)`,
          tex`\(y_{p} = 2e^{3x}\)`,
          tex`\(y_{p} = \dfrac{1}{2}\,e^{3x}\)`,
        ],
        correcta: 2,
        nivel: "intermedio",
        contenido: "Coeficientes indeterminados",
        imagen: null,
      },
      // 9 · Transformada inversa de Laplace
      {
        texto: tex`La transformada inversa \(\mathcal{L}^{-1}\left\{\dfrac{6}{s^{2} + 9}\right\}\) es:`,
        opciones: [
          tex`\(6\sin(3t)\)`,
          tex`\(2\sin(3t)\)`,
          tex`\(2\cos(3t)\)`,
          tex`\(2\sinh(3t)\)`,
        ],
        correcta: 1,
        nivel: "basico",
        contenido: "Transformada de Laplace",
        imagen: null,
      },
      // 10 · Transformada inversa de Laplace (completar cuadrados)
      {
        texto: tex`Al calcular \(\mathcal{L}^{-1}\left\{\dfrac{3s + 1}{s^{2} + 2s + 10}\right\}\) se obtiene:`,
        opciones: [
          tex`\(e^{-t}\left[3\cos(3t) - 2\sin(3t)\right]\)`,
          tex`\(e^{-t}\left[3\cos(3t) - \dfrac{2}{3}\sin(3t)\right]\)`,
          tex`\(e^{t}\left[3\cos(3t) - \dfrac{2}{3}\sin(3t)\right]\)`,
          tex`\(e^{-t}\left[3\cos(3t) + \dfrac{2}{3}\sin(3t)\right]\)`,
        ],
        correcta: 1,
        nivel: "intermedio",
        contenido: "Transformada de Laplace",
        imagen: null,
      },
    ],
  },
];
export { BANCOS_POC };
