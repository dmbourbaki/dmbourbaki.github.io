// fen-render.js
// Genera diagramas de tablero de ajedrez (SVG -> PNG) a partir de FEN,
// usando la paleta de color de OMAI. Piezas: glifos unicode (DejaVu Sans).

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PALETA = {
  claro: "#2a2f3b",   // casilla clara (adaptada a tema oscuro OMAI)
  oscuro: "#15181f",  // casilla oscura == --panel
  borde: "#262b36",   // --line
  fondo: "#08090c",   // --void
  coord: "#6b7080",   // --ink-faint
  piezaBlanca: "#eceef2", // --ink
  piezaNegra: "#c9a04d",  // --gold (para distinguir negras sin usar negro puro)
  resaltadoOrigen: "#4dc9c9",  // --cyan
  resaltadoDestino: "#e8c273", // --gold-bright
  flecha: "#c96b7a", // --rose
  puntoCasilla: "#7ac97a", // --grass
};

const GLIFOS = {
  K: "\u2654", Q: "\u2655", R: "\u2656", B: "\u2657", N: "\u2658", P: "\u2659",
  k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F",
};

function parseFEN(fen) {
  const tablero = Array.from({ length: 8 }, () => Array(8).fill(null));
  const campos = fen.trim().split(/\s+/);
  const filasFEN = campos[0].split("/");
  for (let f = 0; f < 8; f++) {
    let col = 0;
    for (const ch of filasFEN[f]) {
      if (/\d/.test(ch)) {
        col += parseInt(ch, 10);
      } else {
        tablero[f][col] = ch;
        col++;
      }
    }
  }
  return tablero;
}

function casillaAxy(casilla, orientacionNegras) {
  // casilla tipo "e4" -> {col, fila} indices 0-7 (fila 0 = fila 8 del tablero)
  const col0 = casilla.charCodeAt(0) - 97; // a=0
  const fila0 = 8 - parseInt(casilla[1], 10); // fila FEN (0=arriba, fila8)
  if (orientacionNegras) return { col: 7 - col0, fila: 7 - fila0 };
  return { col: col0, fila: fila0 };
}

/**
 * opciones:
 *  fen: string FEN (obligatorio, solo se usa el primer campo de posición + resto opcional)
 *  resaltar: [{casilla:"e4", tipo:"origen"|"destino"|"punto"}]
 *  flechas: [{de:"e2", a:"e4"}]
 *  orientacionNegras: bool (si true, tablero se dibuja desde el punto de vista de negras)
 *  tamano: tamaño en px del tablero (default 480)
 *  mostrarCoordenadas: bool (default true)
 */
function generarSVG(opciones) {
  const {
    fen,
    resaltar = [],
    flechas = [],
    orientacionNegras = false,
    tamano = 480,
    mostrarCoordenadas = true,
  } = opciones;

  const tablero = parseFEN(fen);
  const margen = mostrarCoordenadas ? 28 : 0;
  const ladoCasilla = tamano / 8;
  const w = tamano + margen * 2;
  const h = tamano + margen * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="DejaVu Sans, sans-serif">`;
  svg += `<rect width="${w}" height="${h}" fill="${PALETA.fondo}"/>`;
  svg += `<rect x="${margen - 2}" y="${margen - 2}" width="${tamano + 4}" height="${tamano + 4}" fill="none" stroke="${PALETA.borde}" stroke-width="2" rx="6"/>`;

  const resaltarMap = {};
  for (const r of resaltar) resaltarMap[r.casilla] = r.tipo;

  // casillas
  for (let fila = 0; fila < 8; fila++) {
    for (let col = 0; col < 8; col++) {
      const x = margen + col * ladoCasilla;
      const y = margen + fila * ladoCasilla;
      const esClaro = (fila + col) % 2 === 0;
      svg += `<rect x="${x}" y="${y}" width="${ladoCasilla}" height="${ladoCasilla}" fill="${esClaro ? PALETA.claro : PALETA.oscuro}"/>`;
    }
  }

  // resaltados (debajo de piezas)
  for (const casilla in resaltarMap) {
    const { col, fila } = casillaAxy(casilla, orientacionNegras);
    const x = margen + col * ladoCasilla;
    const y = margen + fila * ladoCasilla;
    const tipo = resaltarMap[casilla];
    if (tipo === "punto") {
      svg += `<circle cx="${x + ladoCasilla / 2}" cy="${y + ladoCasilla / 2}" r="${ladoCasilla * 0.14}" fill="${PALETA.puntoCasilla}" opacity="0.85"/>`;
    } else {
      const color = tipo === "origen" ? PALETA.resaltadoOrigen : PALETA.resaltadoDestino;
      svg += `<rect x="${x + 2}" y="${y + 2}" width="${ladoCasilla - 4}" height="${ladoCasilla - 4}" fill="none" stroke="${color}" stroke-width="4" rx="4"/>`;
    }
  }

  // coordenadas
  if (mostrarCoordenadas) {
    for (let col = 0; col < 8; col++) {
      const letra = orientacionNegras ? String.fromCharCode(104 - col) : String.fromCharCode(97 + col);
      const x = margen + col * ladoCasilla + ladoCasilla / 2;
      svg += `<text x="${x}" y="${h - 8}" font-size="13" fill="${PALETA.coord}" text-anchor="middle">${letra}</text>`;
    }
    for (let fila = 0; fila < 8; fila++) {
      const numero = orientacionNegras ? fila + 1 : 8 - fila;
      const y = margen + fila * ladoCasilla + ladoCasilla / 2 + 4;
      svg += `<text x="14" y="${y}" font-size="13" fill="${PALETA.coord}" text-anchor="middle">${numero}</text>`;
    }
  }

  // piezas
  for (let fila = 0; fila < 8; fila++) {
    for (let col = 0; col < 8; col++) {
      const pieza = tablero[fila][col];
      if (!pieza) continue;
      const fDraw = orientacionNegras ? 7 - fila : fila;
      const cDraw = orientacionNegras ? 7 - col : col;
      const x = margen + cDraw * ladoCasilla + ladoCasilla / 2;
      const y = margen + fDraw * ladoCasilla + ladoCasilla / 2 + ladoCasilla * 0.34;
      const esBlanca = pieza === pieza.toUpperCase();
      const color = esBlanca ? PALETA.piezaBlanca : PALETA.piezaNegra;
      const glifo = GLIFOS[pieza];
      svg += `<text x="${x}" y="${y}" font-size="${ladoCasilla * 0.78}" fill="${color}" text-anchor="middle">${glifo}</text>`;
    }
  }

  // flechas
  if (flechas.length) {
    svg += `<defs><marker id="flechapunta" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${PALETA.flecha}"/></marker></defs>`;
    for (const fl of flechas) {
      const p1 = casillaAxy(fl.de, orientacionNegras);
      const p2 = casillaAxy(fl.a, orientacionNegras);
      const x1 = margen + p1.col * ladoCasilla + ladoCasilla / 2;
      const y1 = margen + p1.fila * ladoCasilla + ladoCasilla / 2;
      const x2 = margen + p2.col * ladoCasilla + ladoCasilla / 2;
      const y2 = margen + p2.fila * ladoCasilla + ladoCasilla / 2;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PALETA.flecha}" stroke-width="5" opacity="0.85" marker-end="url(#flechapunta)"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

function generarPNG(opciones, salida, densidadPx) {
  const svg = generarSVG(opciones);
  const tmpSvg = salida.replace(/\.png$/, ".svg");
  fs.writeFileSync(tmpSvg, svg);
  const w = densidadPx || 640;
  execSync(`rsvg-convert -w ${w} -h ${w} "${tmpSvg}" -o "${salida}"`);
  fs.unlinkSync(tmpSvg);
}

module.exports = { generarSVG, generarPNG, parseFEN };
