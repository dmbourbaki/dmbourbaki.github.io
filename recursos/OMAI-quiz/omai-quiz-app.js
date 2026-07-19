// omai-quiz-app.js
// Motor de OMAI-Quiz: parser de bancos TXT + sincronización con Firebase.

import {
  ref, set, update, onValue, get, remove, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const TIEMPO_LIMITE_BASE = 20; // segundos por pregunta, antes de tiempo extra
const PUNTOS_MAX = 1000;
const PUNTOS_MIN_ACIERTO = 300;

const ESTADOS = {
  ESPERANDO: "esperando",
  PREGUNTA_ACTIVA: "pregunta_activa",
  RESULTADOS: "resultados",
  TERMINADO: "terminado",
};

// ---------- Parser de bancos en formato TXT ----------

function parseBancoTxt(contenido) {
  const bloques = contenido
    .split(/\r?\n/)
    .reduce((acc, linea) => {
      const l = linea.trim();
      if (l === "---") {
        acc.push([]);
      } else if (l === "" || l.startsWith("#")) {
        // ignorar comentarios y líneas vacías
      } else {
        if (acc.length === 0) acc.push([]);
        acc[acc.length - 1].push(l);
      }
      return acc;
    }, []);

  const preguntas = [];
  const errores = [];

  bloques.forEach((bloque, i) => {
    if (bloque.length === 0) return;
    const campos = {};
    for (const linea of bloque) {
      const m = linea.match(/^([A-Za-z]+):\s*(.*)$/);
      if (!m) continue;
      const clave = m[1].toUpperCase();
      campos[clave] = m[2].trim();
    }

    const requeridos = ["TEXTO", "A", "B", "C", "D", "CORRECTA"];
    const faltantes = requeridos.filter((r) => !campos[r]);
    if (faltantes.length > 0) {
      errores.push(`Bloque ${i + 1}: faltan campos ${faltantes.join(", ")}`);
      return;
    }

    const letraCorrecta = campos.CORRECTA.toUpperCase();
    const mapaIdx = { A: 0, B: 1, C: 2, D: 3 };
    if (!(letraCorrecta in mapaIdx)) {
      errores.push(`Bloque ${i + 1}: CORRECTA debe ser A, B, C o D (llegó "${campos.CORRECTA}")`);
      return;
    }

    preguntas.push({
      texto: campos.TEXTO,
      opciones: [campos.A, campos.B, campos.C, campos.D],
      correcta: mapaIdx[letraCorrecta],
      nivel: campos.NIVEL || "basico",
      imagen: campos.IMAGEN && campos.IMAGEN.length > 0 ? campos.IMAGEN : null,
    });
  });

  return { preguntas, errores };
}

async function cargarManifiestoBancos(urlManifiesto) {
  const resp = await fetch(urlManifiesto);
  if (!resp.ok) throw new Error("No se pudo cargar el manifiesto de bancos.");
  return resp.json();
}

async function cargarBanco(urlArchivoTxt) {
  const resp = await fetch(urlArchivoTxt);
  if (!resp.ok) throw new Error(`No se pudo cargar el banco: ${urlArchivoTxt}`);
  const contenido = await resp.text();
  return parseBancoTxt(contenido);
}

// ---------- Puntuación con tiempo extra ----------

function calcularPuntos(tiempoSegundos, esCorrecta, tiempoLimiteEfectivo) {
  if (!esCorrecta) return 0;
  const limite = tiempoLimiteEfectivo || TIEMPO_LIMITE_BASE;
  const t = Math.min(tiempoSegundos, limite);
  const factor = 1 - t / limite;
  return Math.round(PUNTOS_MIN_ACIERTO + (PUNTOS_MAX - PUNTOS_MIN_ACIERTO) * factor);
}

function generarCodigoSala() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let codigo = "";
  for (let i = 0; i < 4; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  return codigo;
}

function generarIdJugador() {
  return "j" + Math.random().toString(36).slice(2, 10);
}

function mezclarYTomar(arreglo, n) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, Math.min(n, copia.length));
}

// ---------- Funciones DOCENTE ----------

async function crearSala(db, bancoPreguntas, numPreguntas) {
  const codigo = generarCodigoSala();
  const preguntasElegidas = mezclarYTomar(bancoPreguntas, numPreguntas);
  const salaRef = ref(db, `salas/${codigo}`);
  await set(salaRef, {
    estado: ESTADOS.ESPERANDO,
    preguntaActual: -1,
    preguntas: preguntasElegidas,
    jugadores: {},
    respuestas: {},
    tiempoLimiteBase: TIEMPO_LIMITE_BASE,
    tiempoExtra: 0,
    creada: Date.now(),
  });
  return codigo;
}

async function existeSala(db, codigo) {
  const snap = await get(ref(db, `salas/${codigo}`));
  return snap.exists();
}

async function iniciarSiguientePregunta(db, codigo) {
  const salaRef = ref(db, `salas/${codigo}`);
  const snap = await get(salaRef);
  const sala = snap.val();
  const siguienteIdx = sala.preguntaActual + 1;

  if (siguienteIdx >= sala.preguntas.length) {
    await update(salaRef, { estado: ESTADOS.TERMINADO });
    return null;
  }
  await update(salaRef, {
    estado: ESTADOS.PREGUNTA_ACTIVA,
    preguntaActual: siguienteIdx,
    [`respuestas/${siguienteIdx}`]: {},
    inicioPregunta: Date.now(),
    tiempoExtra: 0,
  });
  return siguienteIdx;
}

async function agregarTiempoExtra(db, codigo, segundos) {
  const salaRef = ref(db, `salas/${codigo}/tiempoExtra`);
  await runTransaction(salaRef, (actual) => (actual || 0) + segundos);
}

async function cerrarPreguntaYCalcular(db, codigo) {
  const salaRef = ref(db, `salas/${codigo}`);
  const snap = await get(salaRef);
  const sala = snap.val();
  if (sala.estado !== ESTADOS.PREGUNTA_ACTIVA) return []; // ya cerrada (evita doble cálculo)

  const idx = sala.preguntaActual;
  const pregunta = sala.preguntas[idx];
  const respuestasPregunta = sala.respuestas[idx] || {};
  const limiteEfectivo = (sala.tiempoLimiteBase || TIEMPO_LIMITE_BASE) + (sala.tiempoExtra || 0);

  const actualizaciones = {};
  const resumen = [];
  for (const [jugadorId, resp] of Object.entries(respuestasPregunta)) {
    const esCorrecta = resp.opcion === pregunta.correcta;
    const puntos = calcularPuntos(resp.tiempoSegundos, esCorrecta, limiteEfectivo);
    const puntosPrevios = sala.jugadores[jugadorId]?.puntos || 0;
    actualizaciones[`jugadores/${jugadorId}/puntos`] = puntosPrevios + puntos;
    resumen.push({ jugadorId, nombre: sala.jugadores[jugadorId]?.nombre, esCorrecta, puntos });
  }
  actualizaciones.estado = ESTADOS.RESULTADOS;
  await update(salaRef, actualizaciones);
  return resumen;
}

function escucharSala(db, codigo, callback) {
  const salaRef = ref(db, `salas/${codigo}`);
  return onValue(salaRef, (snap) => callback(snap.val()));
}

async function eliminarSala(db, codigo) {
  await remove(ref(db, `salas/${codigo}`));
}

// ---------- Funciones ESTUDIANTE ----------

async function unirseASala(db, codigo, nombre) {
  const salaRef = ref(db, `salas/${codigo}`);
  const snap = await get(salaRef);
  if (!snap.exists()) throw new Error("Esa sala no existe. Verifica el código.");

  const id = generarIdJugador();
  await set(ref(db, `salas/${codigo}/jugadores/${id}`), { nombre, puntos: 0 });
  return id;
}

async function enviarRespuesta(db, codigo, preguntaIdx, jugadorId, opcion, tiempoSegundos) {
  const respRef = ref(db, `salas/${codigo}/respuestas/${preguntaIdx}/${jugadorId}`);
  const resultado = await runTransaction(respRef, (actual) => {
    if (actual !== null) return; // ya existe, no sobrescribir
    return { opcion, tiempoSegundos };
  });
  if (!resultado.committed) {
    throw new Error("Ya respondiste esta pregunta.");
  }
}

function ranking(sala) {
  return Object.entries(sala.jugadores || {})
    .map(([id, j]) => ({ id, ...j }))
    .sort((a, b) => b.puntos - a.puntos);
}

export {
  ESTADOS, TIEMPO_LIMITE_BASE,
  parseBancoTxt, cargarManifiestoBancos, cargarBanco,
  crearSala, existeSala, iniciarSiguientePregunta, agregarTiempoExtra,
  cerrarPreguntaYCalcular, escucharSala, eliminarSala,
  unirseASala, enviarRespuesta, ranking, calcularPuntos,
};
