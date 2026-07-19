// kahoot-derivadas-app.js
// Requiere que el HTML haya cargado el SDK modular de Firebase y expuesto
// window.firebaseDb (instancia de Realtime Database) antes de este script.

import {
  ref, set, update, onValue, get, remove, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const TIEMPO_LIMITE = 20;
const PUNTOS_MAX = 1000;
const PUNTOS_MIN_ACIERTO = 300;

const ESTADOS = {
  ESPERANDO: "esperando",
  PREGUNTA_ACTIVA: "pregunta_activa",
  RESULTADOS: "resultados",
  TERMINADO: "terminado",
};

function calcularPuntos(tiempoSegundos, esCorrecta) {
  if (!esCorrecta) return 0;
  const t = Math.min(tiempoSegundos, TIEMPO_LIMITE);
  const factor = 1 - t / TIEMPO_LIMITE;
  return Math.round(PUNTOS_MIN_ACIERTO + (PUNTOS_MAX - PUNTOS_MIN_ACIERTO) * factor);
}

function generarCodigoSala() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sin I/O para evitar confusión visual
  let codigo = "";
  for (let i = 0; i < 4; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  return codigo;
}

function generarIdJugador() {
  return "j" + Math.random().toString(36).slice(2, 10);
}

// ---------- Funciones DOCENTE ----------

async function crearSala(db, preguntas) {
  const codigo = generarCodigoSala();
  const salaRef = ref(db, `salas/${codigo}`);
  await set(salaRef, {
    estado: ESTADOS.ESPERANDO,
    preguntaActual: -1,
    preguntas,
    jugadores: {},
    respuestas: {},
    creada: Date.now(),
  });
  return codigo;
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
  });
  return siguienteIdx;
}

async function cerrarPreguntaYCalcular(db, codigo) {
  const salaRef = ref(db, `salas/${codigo}`);
  const snap = await get(salaRef);
  const sala = snap.val();
  const idx = sala.preguntaActual;
  const pregunta = sala.preguntas[idx];
  const respuestasPregunta = sala.respuestas[idx] || {};

  const actualizaciones = {};
  const resumen = [];
  for (const [jugadorId, resp] of Object.entries(respuestasPregunta)) {
    const esCorrecta = resp.opcion === pregunta.correcta;
    const puntos = calcularPuntos(resp.tiempoSegundos, esCorrecta);
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
  // Transacción: evita que una doble pulsación registre dos respuestas.
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
  ESTADOS, TIEMPO_LIMITE,
  crearSala, iniciarSiguientePregunta, cerrarPreguntaYCalcular, escucharSala, eliminarSala,
  unirseASala, enviarRespuesta, ranking, calcularPuntos,
};
