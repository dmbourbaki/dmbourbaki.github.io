const { generarPNG } = require("./fen-render.js");
const path = require("path");

const OUT = path.join(__dirname, "imagenes");

const diagramas = [
  // ---- MOVIMIENTOS BÁSICOS ----
  {
    archivo: "aj-mov-01-torre.png",
    fen: "8/8/8/3R4/8/8/8/8 w - - 0 1",
    resaltar: ["a5","b5","c5","e5","f5","g5","h5","d1","d2","d3","d4","d6","d7","d8"].map(c=>({casilla:c,tipo:"punto"})),
  },
  {
    archivo: "aj-mov-02-alfil.png",
    fen: "8/8/8/3B4/8/8/8/8 w - - 0 1",
    resaltar: ["a2","b3","c4","e6","f7","g8","a8","b7","c6","e4","f3","g2","h1"].map(c=>({casilla:c,tipo:"punto"})),
  },
  {
    archivo: "aj-mov-03-caballo.png",
    fen: "8/8/8/3N4/8/8/8/8 w - - 0 1",
    resaltar: ["b4","b6","c3","c7","e3","e7","f4","f6"].map(c=>({casilla:c,tipo:"punto"})),
  },
  {
    archivo: "aj-mov-04-dama.png",
    fen: "8/8/8/3Q4/8/8/8/8 w - - 0 1",
    resaltar: ["a5","h5","d1","d8","a2","g8","a8","h1"].map(c=>({casilla:c,tipo:"punto"})),
  },
  {
    archivo: "aj-mov-05-rey.png",
    fen: "8/8/8/3K4/8/8/8/8 w - - 0 1",
    resaltar: ["c4","c5","c6","d4","d6","e4","e5","e6"].map(c=>({casilla:c,tipo:"punto"})),
  },
  {
    archivo: "aj-mov-06-peon-blanco.png",
    fen: "8/8/8/8/8/8/3P4/8 w - - 0 1",
    resaltar: [{casilla:"d3",tipo:"punto"},{casilla:"d4",tipo:"punto"}],
  },
  {
    archivo: "aj-mov-07-captura-peon.png",
    fen: "8/8/8/8/3p1p2/4P3/8/8 w - - 0 1",
    resaltar: [{casilla:"d4",tipo:"destino"},{casilla:"f4",tipo:"destino"},{casilla:"e3",tipo:"origen"}],
  },
  {
    archivo: "aj-mov-08-enroque-corto.png",
    fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
    resaltar: [{casilla:"e1",tipo:"origen"},{casilla:"g1",tipo:"destino"},{casilla:"h1",tipo:"origen"},{casilla:"f1",tipo:"destino"}],
  },
  {
    archivo: "aj-mov-09-jaque.png",
    fen: "8/8/8/8/8/5k2/8/4R2K w - - 0 1",
    flechas: [{de:"e1",a:"f1"}],
  },
  {
    archivo: "aj-mov-10-posicion-inicial.png",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },

  // ---- TÁCTICA ----
  {
    archivo: "aj-tac-01-clavada.png",
    fen: "8/8/8/8/2k5/3n4/8/2R1K3 w - - 0 1",
    flechas: [{de:"c1",a:"d3"}],
  },
  {
    archivo: "aj-tac-02-horquilla-caballo.png",
    fen: "4k3/8/8/8/3N4/8/8/4K3 b - - 0 1",
    resaltar: [{casilla:"d4",tipo:"origen"}],
    flechas: [{de:"d4",a:"e6"},{de:"d4",a:"c6"}],
  },
  {
    archivo: "aj-tac-03-descubierta.png",
    fen: "4k3/8/4b3/8/8/4R3/8/4K3 w - - 0 1",
    flechas: [{de:"e3",a:"e6"}],
  },
  {
    archivo: "aj-tac-04-ataque-doble-dama.png",
    fen: "4k3/8/8/2r5/8/8/8/Q3K3 w - - 0 1",
    flechas: [{de:"a1",a:"c5"},{de:"a1",a:"e8"}],
  },
  {
    archivo: "aj-tac-05-mate-pasillo.png",
    fen: "6k1/6pp/8/8/8/8/8/R5K1 w - - 0 1",
    flechas: [{de:"a1",a:"a8"}],
  },
  {
    archivo: "aj-tac-06-clavada-absoluta.png",
    fen: "4k3/8/8/8/4b3/8/8/4K2R w - - 0 1",
    flechas: [{de:"e4",a:"e1"}],
  },
  {
    archivo: "aj-tac-07-rayos-x.png",
    fen: "3rk3/8/8/8/8/8/3R4/3K4 w - - 0 1",
    flechas: [{de:"d2",a:"d8"}],
  },
  {
    archivo: "aj-tac-08-sacrificio-desviacion.png",
    fen: "3qk3/8/8/8/8/8/3Q4/3RK3 w - - 0 1",
    flechas: [{de:"d2",a:"d8"},{de:"d1",a:"d8"}],
  },

  // ---- FINALES ----
  {
    archivo: "aj-fin-01-oposicion.png",
    fen: "8/8/4k3/8/4K3/8/4P3/8 w - - 0 1",
    resaltar: [{casilla:"e4",tipo:"origen"},{casilla:"e6",tipo:"destino"}],
  },
  {
    archivo: "aj-fin-02-peon-pasado.png",
    fen: "8/8/8/3P4/8/8/8/4K1k1 w - - 0 1",
    resaltar: [{casilla:"d5",tipo:"origen"}],
  },
  {
    archivo: "aj-fin-03-rey-torre-vs-rey.png",
    fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
  },
  {
    archivo: "aj-fin-04-cuadrado-del-peon.png",
    fen: "8/8/8/8/4k3/8/4P3/4K3 b - - 0 1",
    resaltar: ["e2","e3","e4","a5","b5","c5","d5","e5"].map(c=>({casilla:c,tipo:"punto"})),
  },
  {
    archivo: "aj-fin-05-mate-dos-torres.png",
    fen: "8/8/8/8/8/8/R7/R3K2k w - - 0 1",
    flechas: [{de:"a2",a:"h2"}],
  },
  {
    archivo: "aj-fin-06-triangulacion.png",
    fen: "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1",
  },

  // ---- ESTRATEGIA ----
  {
    archivo: "aj-est-01-centro-peones.png",
    fen: "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
  },
  {
    archivo: "aj-est-02-columna-abierta.png",
    fen: "4k3/1ppp1ppp/8/8/8/8/1PPP1PPP/3RK3 w - - 0 1",
  },
  {
    archivo: "aj-est-03-peon-doblado.png",
    fen: "4k3/8/8/8/4P3/4P3/8/4K3 w - - 0 1",
  },
  {
    archivo: "aj-est-04-alfil-bueno-malo.png",
    fen: "4k3/8/8/8/8/2p1p3/3B4/4K3 w - - 0 1",
  },
  {
    archivo: "aj-est-05-avanzada-caballo.png",
    fen: "4k3/pp3ppp/8/3N4/8/8/PPP2PPP/4K3 w - - 0 1",
    resaltar: [{casilla:"d5",tipo:"origen"}],
  },
];

for (const d of diagramas) {
  generarPNG(
    { fen: d.fen, resaltar: d.resaltar || [], flechas: d.flechas || [] },
    path.join(OUT, d.archivo)
  );
  console.log("OK", d.archivo);
}
