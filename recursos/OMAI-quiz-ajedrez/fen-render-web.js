// fen-render-web.js
// Renderizador de tableros de ajedrez en vivo (SVG), a partir de un FEN.
// Puerto navegador de fen-render.js — estilo ChessBase (casillas crema/verde,
// coordenadas visibles, piezas con contorno para distinguir blancas de negras).
// No depende de Node: esto corre directo en el cliente, así el diagrama nunca
// puede desincronizarse del enunciado de la pregunta.

const PALETA_TABLERO = {
  claro: "#EBE1C8", oscuro: "#7C9473",
  margen: "#171a22", coord: "#a7acb9",
  piezaBlancaFill: "#f7f3e8", piezaBlancaBorde: "#2b2b28",
  piezaNegraFill: "#20211d", piezaNegraBorde: "#050505",
  resaltadoDestino: "#e8c273", resaltadoOrigen: "#4dc9c9", puntoCasilla: "#7ac97a",
  flecha: "#c96b7a",
};

const GLIFOS = {
  K: "\u265A", Q: "\u265B", R: "\u265C", B: "\u265D", N: "\u265E", P: "\u265F",
  k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F",
};

function parseFEN(fen) {
  const tablero = Array.from({ length: 8 }, () => Array(8).fill(null));
  const filas = fen.trim().split(/\s+/)[0].split("/");
  for (let f = 0; f < 8; f++) {
    let col = 0;
    for (const ch of filas[f]) {
      if (/\d/.test(ch)) col += parseInt(ch, 10);
      else tablero[f][col++] = ch;
    }
  }
  return tablero;
}

function casillaAxy(casilla) {
  const col = casilla.charCodeAt(0) - 97;
  const fila = 8 - parseInt(casilla[1], 10);
  return { col, fila };
}

// resaltar: array de strings "e4:origen" | "e4:destino" | "e4:punto"
// flechas: array de strings "e2-e4"
function renderTableroSVG(fen, resaltar = [], flechas = [], tamano = 360) {
  const tablero = parseFEN(fen);
  const margen = 24, lado = tamano / 8, w = tamano + margen * 2, h = w;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Diagrama de ajedrez">`;
  svg += `<rect width="${w}" height="${h}" fill="${PALETA_TABLERO.margen}"/>`;

  for (let f = 0; f < 8; f++) {
    for (let c = 0; c < 8; c++) {
      const x = margen + c * lado, y = margen + f * lado;
      const esClaro = (f + c) % 2 === 0;
      svg += `<rect x="${x}" y="${y}" width="${lado}" height="${lado}" fill="${esClaro ? PALETA_TABLERO.claro : PALETA_TABLERO.oscuro}"/>`;
    }
  }

  resaltar.forEach((r) => {
    const [casilla, tipo] = r.split(":");
    const { col, fila } = casillaAxy(casilla);
    const x = margen + col * lado, y = margen + fila * lado;
    if (tipo === "punto") {
      svg += `<circle cx="${x + lado / 2}" cy="${y + lado / 2}" r="${lado * 0.13}" fill="${PALETA_TABLERO.puntoCasilla}" opacity="0.85"/>`;
    } else {
      const color = tipo === "origen" ? PALETA_TABLERO.resaltadoOrigen : PALETA_TABLERO.resaltadoDestino;
      svg += `<rect x="${x + 2}" y="${y + 2}" width="${lado - 4}" height="${lado - 4}" fill="none" stroke="${color}" stroke-width="3"/>`;
    }
  });

  for (let c = 0; c < 8; c++) {
    const letra = String.fromCharCode(97 + c);
    svg += `<text x="${margen + c * lado + lado / 2}" y="${h - 7}" font-size="11" fill="${PALETA_TABLERO.coord}" text-anchor="middle" font-family="Spline Sans Mono, monospace">${letra}</text>`;
  }
  for (let f = 0; f < 8; f++) {
    svg += `<text x="12" y="${margen + f * lado + lado / 2 + 4}" font-size="11" fill="${PALETA_TABLERO.coord}" text-anchor="middle" font-family="Spline Sans Mono, monospace">${8 - f}</text>`;
  }

  for (let f = 0; f < 8; f++) {
    for (let c = 0; c < 8; c++) {
      const pieza = tablero[f][c];
      if (!pieza) continue;
      const x = margen + c * lado + lado / 2, y = margen + f * lado + lado / 2 + lado * 0.33;
      const esBlanca = pieza === pieza.toUpperCase();
      const fill = esBlanca ? PALETA_TABLERO.piezaBlancaFill : PALETA_TABLERO.piezaNegraFill;
      const borde = esBlanca ? PALETA_TABLERO.piezaBlancaBorde : PALETA_TABLERO.piezaNegraBorde;
      svg += `<text x="${x}" y="${y}" font-size="${lado * 0.74}" fill="${fill}" stroke="${borde}" stroke-width="${esBlanca ? 1.5 : 0.7}" paint-order="stroke fill" text-anchor="middle">${GLIFOS[pieza]}</text>`;
    }
  }

  if (flechas.length) {
    svg += `<defs><marker id="flechapunta" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${PALETA_TABLERO.flecha}"/></marker></defs>`;
    flechas.forEach((fl) => {
      const [de, a] = fl.split("-");
      const p1 = casillaAxy(de), p2 = casillaAxy(a);
      const x1 = margen + p1.col * lado + lado / 2, y1 = margen + p1.fila * lado + lado / 2;
      const x2 = margen + p2.col * lado + lado / 2, y2 = margen + p2.fila * lado + lado / 2;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PALETA_TABLERO.flecha}" stroke-width="4" opacity="0.85" marker-end="url(#flechapunta)"/>`;
    });
  }

  svg += `</svg>`;
  return svg;
}

export { renderTableroSVG };
