// omai-quiz-saberpro-bancos-razonamiento-cuantitativo.js
// Banco de Razonamiento Cuantitativo (Saber Pro), para OMAI-Quiz.
// Las imágenes se referencian con ruta completa a la carpeta imgs_saberpro/
// (separada de imagenes/, que es la carpeta de Cultura General) para que no se mezclen.
const BANCOS_SABERPRO = [
  {
    id: "sp-razonamiento-cuantitativo",
    area: "Saber Pro",
    nombre: "Razonamiento Cuantitativo",
    preguntas: [
      {
        texto: "Un futuro es un contrato en el que una de las partes se compromete a comprar a la otra un producto a un precio y en una fecha pactados. En un futuro de divisas se especificó que el precio de intercambio del dólar sería $1.795. La transacción se ejecutó el día que más beneficio dio a quien entregó los dólares, entre el 8 y el 22 de abril de 2012. ¿Qué día se realizó la transacción?",
        opciones: ["El 9 de abril de 2012.", "El 11 de abril de 2012.", "El 16 de abril de 2012.", "El 22 de abril de 2012."],
        correcta: 2,
        nivel: "basico",
        imagen: "imgs_saberpro/img05.png",
      },
      {
        texto: "Un buzo desciende a 30 metros y permanece en el fondo durante 90 minutos. Las tablas de buceo indican paradas de descompresión obligatorias durante el ascenso (velocidad de ascenso constante: 9 m/min). ¿Cuál gráfica representa mejor la profundidad del buzo en función del tiempo, durante todo el recorrido (descenso, fondo y ascenso)?",
        opciones: [
          "Descenso y ascenso en línea recta, sin ninguna parada.",
          "Descenso rápido, permanencia constante en el fondo y ascenso con un tramo plano (parada de descompresión) antes de llegar a superficie.",
          "Ascenso más rápido que el descenso.",
          "Profundidad constante durante todo el tiempo.",
        ],
        correcta: 1,
        nivel: "intermedio",
        imagen: "imgs_saberpro/img26b.png",
      },
      {
        texto: "En 2013 el presupuesto de inversión en salud fue de 3,65 billones de pesos, de los cuales a mayo se habían ejecutado 1,66 billones (45,5%). La gráfica muestra el % de ejecución acumulada mes a mes en 2013. ¿Cuál gráfica representa correctamente el % promedio de ejecución (2002-2012) mes a mes?",
        opciones: [
          "Barras con eje de 0 a 100, creciendo de enero a diciembre.",
          "Barras con eje de 0 a 26, decreciendo de enero a diciembre.",
          "Barras con eje de 0 a 90, constante todo el año.",
          "Barras con eje de 0 a 24, creciendo solo hasta junio.",
        ],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imgs_saberpro/img08b.png",
      },
      {
        texto: "Un colegio registra los inscritos por actividad extraescolar según el número de sesiones semanales, y limita cada grupo de \"Deportes\" a máximo 20 estudiantes por profesor. El total de inscritos en Deportes es 60 + 40 + 20 = 120. ¿Cuál gráfica representa la cantidad de profesores necesarios en función del número de inscritos en Deportes?",
        opciones: [
          "Función escalonada: sube 1 profesor cada 20 inscritos adicionales.",
          "Línea recta continua (proporción exacta, sin redondeo).",
          "Curva decreciente.",
          "Un solo salto: de 0 a 6 profesores en el inscrito 120.",
        ],
        correcta: 0,
        nivel: "aplicado",
        imagen: "imgs_saberpro/img10.png",
      },
      {
        texto: "Una empresa de mensajería cobra el envío de un paquete con un cargo fijo de recolección/gestión más un cargo variable según el peso (kg): 1 kg = $7.500, 2 kg = $10.000, 4 kg = $15.000, 6 kg = $20.000. Si un cliente envía un paquete de 8 kg (mismo esquema de cobro), ¿cuál es el costo total?",
        opciones: ["$20.000.", "$22.500.", "$25.000.", "$27.500."],
        correcta: 2,
        nivel: "basico",
        imagen: "imgs_saberpro/img24b.png",
      },
      {
        texto: "En una red de mercadeo, las comisiones se determinan de acuerdo con el nivel que ocupa cada integrante dentro de la red. Cada vendedor recibe el 5% de sus propias ventas (nivel 1), el 4% de las ventas de las personas que inscribió directamente (nivel 2), y el 3%, 2% y 1% de las ventas correspondientes a los niveles 3, 4 y 5, respectivamente. Pedro tiene a David como su único inscrito directo. Durante este mes, Pedro realizó ventas por $6.000.000 y David realizó ventas por $5.000.000. No se registraron ventas de otros integrantes en la red de Pedro. ¿A qué corresponde la comisión total que Pedro recibe este mes por las ventas realizadas por él y por los integrantes de su red?",
        opciones: [
          "4% de sus ventas y 3% de las de David.",
          "9% de la suma de sus ventas con las de David.",
          "5% de sus ventas y 4% de las de David.",
          "7% de la suma de sus ventas con las de David.",
        ],
        correcta: 2,
        nivel: "intermedio",
        imagen: "imgs_saberpro/img14.png",
      },
      {
        texto: "Para cuatro empresas de servicios públicos (ESP) se midió la eficiencia en la atención de reclamos: la proporción de reclamos atendidos antes de 24 horas sobre el total recibidos. Energía = 2/3, Acueducto = 5/6, Telefonía = 9/10, Gas = 3/5. ¿Cuál es la eficiencia promedio de las 4 ESP?",
        opciones: ["72%.", "75%.", "79%.", "80%."],
        correcta: 1,
        nivel: "intermedio",
        imagen: "imgs_saberpro/img15.png",
      },
      {
        texto: "Una ciudad de 893.944 habitantes cuenta con diferentes estrategias para la gestión y aprovechamiento de los residuos sólidos que se generan diariamente. Por cada 100 habitantes, la ciudad genera entre 55 y 75 kg de basura al día. Un 60% de esa basura es de tipo orgánico y se quiere reducir. ¿Entre qué valores está la cantidad de basura orgánica que se produce al día en la ciudad?",
        opciones: [
          "Entre 7.000 y 10.000 kg.",
          "Entre 295.000 y 403.000 kg.",
          "Entre 820.000 y 1.120.000 kg.",
          "Entre 29.000.000 y 40.000.000 kg.",
        ],
        correcta: 1,
        nivel: "aplicado",
        imagen: "imgs_saberpro/img16.png",
      },
      {
        texto: "Recordando la eficiencia de las 4 ESP en la atención de reclamos antes de 24 horas (Energía 2/3, Acueducto 5/6, Telefonía 9/10, Gas 3/5), los usuarios pueden identificar cuál empresa es más eficiente. ¿Qué NO se puede determinar con la información suministrada?",
        opciones: [
          "El número de reclamaciones sin atender antes de 24 horas.",
          "El porcentaje de reclamaciones atendidas antes de 24 horas.",
          "La ESP más eficiente, según lo atendido sobre el total.",
          "La ESP menos eficiente, según lo no atendido sobre el total.",
        ],
        correcta: 0,
        nivel: "basico",
        imagen: "imgs_saberpro/img15.png",
      },
      {
        texto: "Un futuro se firmó el 10 de abril de 2012 (valor del dólar ese día: $1.782) para intercambiar 500 libras de café a 1,5 USD cada una. El comprador calculó: $1.782 ÷ 1,5 = $1.188 (valor libra de café); $1.188 × 500 = $594.000 (valor de compra). El valor de compra en pesos NO es correcto porque:",
        opciones: [
          "$1.782 ÷ 1,5 no es igual a $1.188.",
          "$1.188 × 500 no es igual a $594.000.",
          "El valor de la libra de café es $1.764 ÷ 1,5 = $2.646.",
          "El valor de la libra de café es $1.782 × 1,5 = $2.673.",
        ],
        correcta: 3,
        nivel: "intermedio",
        imagen: "imgs_saberpro/img19.png",
      },
      {
        texto: "El consumo eléctrico promedio mensual de la nevera es de 100 kWh y el del horno microondas es de 25 kWh. Un estudiante afirma: \"el consumo del microondas corresponde al 25% del consumo de la nevera\". Esta afirmación es:",
        opciones: [
          "Falsa, porque dividir entre 4 el consumo del horno no da el de la nevera.",
          "Verdadera, porque restar 25 al consumo de la nevera da el del horno.",
          "Falsa, porque sumar 75 al consumo del horno no da el de la nevera.",
          "Verdadera, porque multiplicar por 4 el consumo del horno da el de la nevera.",
        ],
        correcta: 3,
        nivel: "intermedio",
        imagen: "imgs_saberpro/img21.png",
      },
      {
        texto: "Una universidad ofrece descuentos sucesivos sobre la matrícula: 18% por pertenecer a un semillero de investigación; luego, sobre el valor restante, 12% adicional por promedio ≥ 4,5; y finalmente, sobre ese nuevo valor, 5% por pronto pago. La matrícula es de $8.400.000 y un estudiante cumple las tres condiciones. Un funcionario afirma: \"como los descuentos son 18%, 12% y 5%, el descuento total es del 35% sobre el valor inicial\". ¿Cuál afirmación es correcta?",
        opciones: [
          "La afirmación es correcta: los porcentajes siempre se suman.",
          "El descuento total es superior al 35%.",
          "La afirmación es incorrecta: los descuentos sucesivos se aplican sobre valores distintos y el descuento efectivo es menor al 35%.",
          "El descuento total es exactamente del 30%.",
        ],
        correcta: 2,
        nivel: "aplicado",
        imagen: null,
      },
    ],
  },
];
export { BANCOS_SABERPRO };
