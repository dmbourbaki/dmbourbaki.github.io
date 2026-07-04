/* ============================================================
   Simulador de Grupos de Simetría — D_n y el grupo de Klein V4
   Elementos de D_n: n rotaciones R_0..R_{n-1}, n reflexiones F_0..F_{n-1}
   Reglas de composición (validadas contra matrices 2x2 para n=3..8):
     R_a ∘ R_b = R_{(a+b) mod n}
     R_a ∘ F_b = F_{(a+b) mod n}
     F_a ∘ R_b = F_{(a-b) mod n}
     F_a ∘ F_b = R_{(a-b) mod n}
   donde (X ∘ Y) significa "aplicar Y primero, luego X" (composición de funciones).

   © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
   Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)
   https://dmbourbaki.github.io/

   Queda prohibida la reproducción, distribución o modificación total
   o parcial de este código sin autorización previa y por escrito del
   autor. Contacto: dmbourbaki@gmail.com
   ============================================================ */

(() => {
'use strict';

const $ = id => document.getElementById(id);

/* ============================================================
   1.  MOTOR ALGEBRAICO DE D_n
   Elemento = { type: 'R'|'F', k: entero en [0,n) }
   ============================================================ */
function mod(a, n){ return ((a % n) + n) % n; }

function compose(x, y, n){
  // x ∘ y : aplicar y primero, luego x
  if (x.type==='R' && y.type==='R') return { type:'R', k: mod(x.k+y.k, n) };
  if (x.type==='R' && y.type==='F') return { type:'F', k: mod(x.k+y.k, n) };
  if (x.type==='F' && y.type==='R') return { type:'F', k: mod(x.k-y.k, n) };
  /* F,F */                          return { type:'R', k: mod(x.k-y.k, n) };
}

function inverse(x, n){
  if (x.type==='R') return { type:'R', k: mod(-x.k, n) };
  return x; // toda reflexión es su propio inverso
}

function isIdentity(x){ return x.type==='R' && x.k===0; }

function elementsOf(n){
  const els = [];
  for (let k=0;k<n;k++) els.push({ type:'R', k });
  for (let k=0;k<n;k++) els.push({ type:'F', k });
  return els;
}

function elementKey(x){ return `${x.type}${x.k}`; }
function elementsEqual(x,y){ return x.type===y.type && x.k===y.k; }

function subscriptNum(num){
  return String(num).replace(/\d/g, d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
}

/* Nombre legible: e, r90, r180, F0 (refl-h si k=0 cuando n par), etc. */
/* Notación de Fraleigh: rho_k para rotaciones, mu_i para reflexiones SIN puntos
   fijos (eje entre lados, k impar), delta_i para reflexiones CON puntos fijos
   (eje por vértices/diagonal, k par). Para n impar, todo eje de reflexión pasa
   por exactamente un vértice — no hay distinción real entre mu/delta, así que
   se usa mu uniformemente (convención adoptada para evitar una distinción que
   Fraleigh reserva específicamente al caso n par). */
function elementLabel(x, n){
  if (x.type==='R') return `ρ${subscriptNum(x.k)}`;
  if (n % 2 === 0){
    if (x.k % 2 === 0) return `δ${subscriptNum(x.k/2 + 1)}`;
    return `μ${subscriptNum((x.k-1)/2 + 1)}`;
  }
  return `μ${subscriptNum(x.k + 1)}`;
}

function elementFullName(x, n){
  if (isIdentity(x)) return 'Identidad (ρ₀)';
  if (x.type==='R'){
    const deg = Math.round(360*x.k/n);
    return `Rotación ${deg}° (${elementLabel(x,n)})`;
  }
  const axisDeg = Math.round(180*x.k/n);
  const kind = (n%2===0 && x.k%2===0) ? 'eje por dos vértices opuestos (diagonal)' : (n%2===0 ? 'eje por puntos medios de lados opuestos' : 'eje por un vértice y el punto medio del lado opuesto');
  return `Reflexión ${elementLabel(x,n)} — ${kind}, a ${axisDeg}°`;
}

/* ============================================================
   2.  KLEIN V4 — subgrupo especial de D4
   {e, R2 (rotación 180°), F0 (eje horizontal), F2 (eje vertical)}
   ============================================================ */
function kleinSubgroupD4(){
  return [
    { type:'R', k:0 },
    { type:'R', k:2 },
    { type:'F', k:0 },
    { type:'F', k:2 }
  ];
}
function isInKlein(x){
  const klein = kleinSubgroupD4();
  return klein.some(k => elementsEqual(k,x));
}

/* ============================================================
   2b.  PERMUTACIÓN DE VÉRTICES
   R_k: vértice i -> (i+k) mod n   |   F_k: vértice i -> (k-i) mod n
   (fórmulas validadas contra la acción geométrica real de las matrices,
   para n=3..8, con coincidencia exacta).
   ============================================================ */
function elementPermutation(x, n){
  const perm = [];
  for (let i=0;i<n;i++){
    perm.push(x.type==='R' ? mod(i+x.k, n) : mod(x.k-i, n));
  }
  return perm; // perm[i] = índice (0-based) al que va el vértice i
}

/* Compone dos permutaciones: aplicar `inner` primero, luego `outer`.
   resultado[i] = outer[inner[i]] */
function composePerms(outer, inner){
  return inner.map(j => outer[j]);
}

/* Devuelve el arreglo de permutaciones ACUMULADAS para cada paso activo de la
   cadena: cols[0] es la identidad, cols[k] es el efecto neto de aplicar los
   primeros k elementos de state.chain (hasta state.position). */
function accumulatedPermutationColumns(){
  const n = state.n;
  const cols = [Array.from({length:n}, (_,i)=>i)]; // identidad
  let acc = cols[0];
  for (let i=0;i<state.position;i++){
    const stepPerm = elementPermutation(state.chain[i], n);
    acc = composePerms(stepPerm, acc);
    cols.push(acc);
  }
  return cols;
}

function cycleNotation(perm, n){
  const visited = new Array(n).fill(false);
  const cycles = [];
  for (let start=0; start<n; start++){
    if (visited[start]) continue;
    const cycle = [start];
    visited[start] = true;
    let nxt = perm[start];
    while (nxt !== start){
      cycle.push(nxt);
      visited[nxt] = true;
      nxt = perm[nxt];
    }
    if (cycle.length > 1) cycles.push(cycle);
  }
  if (cycles.length === 0) return 'e (identidad)';
  return cycles.map(c => '(' + c.map(i=>i+1).join(' ') + ')').join(' ');
}

/* Subgrupo cíclico generado por x: potencias sucesivas x, x², x³, ... hasta e */
function generatedSubgroup(x, n){
  const seq = [{ type:'R', k:0 }];
  let cur = { type:'R', k:0 };
  for (let i=0;i<2*n;i++){
    cur = compose(x, cur, n);
    seq.push(cur);
    if (isIdentity(cur)) break;
  }
  return seq; // incluye e al inicio y al final
}

/* ============================================================
   2d.  TODOS LOS SUBGRUPOS DE D_n Y EL RETICULADO DE CONTENCIÓN
   Validado: para D_n con n=3..8, basta generar con subconjuntos de 1 y 2
   elementos para obtener TODOS los subgrupos (confirmado contra fuerza bruta
   total para D4: ambos métodos dan exactamente los mismos 10 subgrupos).
   ============================================================ */
function subgroupKeySet(elems){
  // representa un subgrupo como un Set de claves "Rk"/"Fk", para comparar por igualdad de contenido
  return new Set(elems.map(elementKey));
}
function setsEqual(a,b){
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}
function setIsSubsetOf(a,b){
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function closureOf(generatorEls, n){
  const e = { type:'R', k:0 };
  let cur = new Map([[elementKey(e), e]]);
  let frontier = new Map(cur);
  generatorEls.forEach(g=> frontier.set(elementKey(g), g));
  generatorEls.forEach(g=> cur.set(elementKey(g), g));
  let changed = true;
  while (changed){
    changed = false;
    const fresh = new Map();
    for (const a of cur.values()){
      for (const b of frontier.values()){
        const p = compose(a,b,n);
        const key = elementKey(p);
        if (!cur.has(key) && !fresh.has(key)) fresh.set(key, p);
      }
    }
    if (fresh.size){
      fresh.forEach((v,k)=> cur.set(k,v));
      frontier = fresh;
      changed = true;
    }
  }
  return [...cur.values()];
}

/* Calcula TODOS los subgrupos de D_n, devolviendo un arreglo de objetos
   { elems, key } sin duplicados, donde key es el Set de claves para comparar. */
function allSubgroupsOf(n){
  const all = elementsOf(n);
  const found = []; // [{elems, keySet}]
  function addIfNew(elems){
    const ks = subgroupKeySet(elems);
    if (found.some(f => setsEqual(f.keySet, ks))) return;
    found.push({ elems, keySet: ks });
  }
  // generadores de 1 elemento
  all.forEach(g => addIfNew(closureOf([g], n)));
  // generadores de 2 elementos
  for (let i=0;i<all.length;i++){
    for (let j=i+1;j<all.length;j++){
      addIfNew(closureOf([all[i], all[j]], n));
    }
  }
  // casos límite explícitos (por seguridad, aunque ya deberían aparecer arriba)
  addIfNew([{ type:'R', k:0 }]);       // {e}
  addIfNew(all.slice());               // grupo completo
  found.sort((a,b)=> a.elems.length - b.elems.length);
  return found;
}

/* Construye las aristas del reticulado: A -> B si A es un subgrupo MAXIMAL
   propiamente contenido en B (no existe C con A ⊊ C ⊊ B). */
function subgroupLatticeEdges(subgroups){
  const edges = [];
  for (let bi=0; bi<subgroups.length; bi++){
    const B = subgroups[bi];
    const containedIdx = [];
    for (let ai=0; ai<subgroups.length; ai++){
      if (ai===bi) continue;
      const A = subgroups[ai];
      if (A.elems.length < B.elems.length && setIsSubsetOf(A.keySet, B.keySet)) containedIdx.push(ai);
    }
    containedIdx.forEach(ai=>{
      const A = subgroups[ai];
      const isMaximal = !containedIdx.some(cj => cj!==ai && subgroups[cj].elems.length > A.elems.length && setIsSubsetOf(A.keySet, subgroups[cj].keySet));
      if (isMaximal) edges.push([ai, bi]);
    });
  }
  return edges;
}

/* ============================================================
   3.  GEOMETRÍA — matriz 2x2 de cada elemento (para dibujar)
   Rotación: ángulo 2*pi*k/n. Reflexión: eje geométrico a pi*k/n.
   ============================================================ */
function elementMatrix(x, n){
  if (x.type==='R'){
    const th = 2*Math.PI*x.k/n;
    return [[Math.cos(th), -Math.sin(th)], [Math.sin(th), Math.cos(th)]];
  } else {
    const th = 2*Math.PI*x.k/n; // mismo parámetro que en la regla algebraica
    return [[Math.cos(th), Math.sin(th)], [Math.sin(th), -Math.cos(th)]];
  }
}
function applyMatrix(M, p){
  return { x: M[0][0]*p.x + M[0][1]*p.y, y: M[1][0]*p.x + M[1][1]*p.y };
}
function matMul(A, B){
  return [
    [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]]
  ];
}
const IDENTITY_MATRIX = [[1,0],[0,1]];

/* Encuentra, entre los elementos de D_n del tipo indicado (R o F, o ambos si
   mode es null), cuál — compuesto DESPUÉS de netMatrixSoFar — coloca el
   vértice arrastrado más cerca de mousePos. Esto resuelve el snapping sin
   necesitar clasificar el gesto explícitamente: la geometría decide sola.
   Cuando mode se restringe (según si el arrastre cruzó cerca del centro o
   no), se resuelve la ambigüedad de que un mismo punto final puede a veces
   alcanzarse tanto por una rotación como por una reflexión distintas. */
function findNearestElement(mousePos, vertexIdx, n, netMatrixSoFar, mode){
  const angle = 2*Math.PI*vertexIdx/n;
  const vertexLocal = { x: Math.cos(angle), y: Math.sin(angle) };
  let best = null, bestDist = Infinity;
  const candidates = elementsOf(n).filter(e => !mode || e.type===mode);
  candidates.forEach(e=>{
    const M = matMul(elementMatrix(e, n), netMatrixSoFar);
    const candidatePos = applyMatrix(M, vertexLocal);
    const d = Math.hypot(candidatePos.x-mousePos.x, candidatePos.y-mousePos.y);
    if (d < bestDist){ bestDist = d; best = e; }
  });
  return { element: best, distance: bestDist };
}

/* Polígono regular de n vértices, vértice 0 en ángulo 0 (eje x positivo) */
function polygonVertices(n){
  const verts = [];
  for (let j=0;j<n;j++){
    const th = 2*Math.PI*j/n;
    verts.push({ x: Math.cos(th), y: Math.sin(th) });
  }
  return verts;
}

/* ============================================================
   4.  ESTADO GLOBAL
   ============================================================ */
const N_NAMES = { 3:'Triángulo (D₃)', 4:'Cuadrado (D₄)', 5:'Pentágono (D₅)', 6:'Hexágono (D₆)', 7:'Heptágono (D₇)', 8:'Octágono (D₈)' };

const state = {
  n: 4,
  chain: [],            // arreglo de elementos {type,k} aplicados en orden temporal (historial completo)
  position: 0,          // cuántos elementos de la cadena están "activos" (0 = identidad, chain.length = todos)
  kleinMode: false,
  show: { axes:true, labels:true, klein:false },
  hoverCell: null
};

/* Elemento neto acumulado = composición de los elementos activos (0..position),
   en orden: si chain=[A,B,C] y position=2, neto = B∘A (C todavía no se aplica) */
function netElement(){
  let acc = { type:'R', k:0 };
  for (let i=0;i<state.position;i++){
    acc = compose(state.chain[i], acc, state.n);
  }
  return acc;
}

function netMatrix(){
  let M = IDENTITY_MATRIX;
  for (let i=0;i<state.position;i++){
    M = matMul(elementMatrix(state.chain[i], state.n), M);
  }
  return M;
}

/* ============================================================
   5.  NOTACIÓN MATEMÁTICA DE LA CADENA
   ============================================================ */
function chainLatex(){
  if (state.chain.length === 0) return 'e';
  // notación estándar: la función aplicada AL FINAL se escribe a la izquierda
  const labels = state.chain.map(e => elementLabel(e, state.n)).reverse();
  return labels.join(' \\circ ');
}

/* ============================================================
   6.  CANVAS DEL POLÍGONO — con animación de transformación
   ============================================================ */
function makePolyCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;

  let displayMatrix = IDENTITY_MATRIX; // matriz mostrada cuando NO hay una transición de reflexión 3D activa
  let flip3D = null; // { baseMatrix, vertexIdxRef, axisAngle, phiDeg } o null si no hay transición de reflexión en curso
  let animFrom = IDENTITY_MATRIX, animTo = IDENTITY_MATRIX, animDuration = 480;
  let animStart = 0, animating = false;
  let animKind = 'rotation'; // 'rotation' | 'reflection' — qué tipo de animación está en curso
  let animAxisAngle = 0; // eje fijo a usar si animKind==='reflection'
  let animFromMatrix = IDENTITY_MATRIX; // matriz base "antes" de la reflexión animada (para animaciones de botón)

  /* Historial corto de posiciones por vértice durante una transición de
     reflexión, usado para dibujar una estela luminosa ("cola de cometa") que
     sigue a cada vértice mientras vuela de un lado al otro — el efecto
     etéreo de partículas de luz, en vez de una silueta rígida que se aplana.
     Se llena en cada draw() mientras flip3D esté activo, y se vacía cuando
     la transición termina (figura estática) para no acumular memoria. */
  let vertexTrails = null; // arreglo de arreglos: vertexTrails[i] = [{x,y,age}, ...] más reciente al final
  const TRAIL_MAX_LEN = 14;

  function resize(){
    DPR = Math.min(window.devicePixelRatio||1, 2);
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W*DPR);
    canvas.height = Math.round(H*DPR);
    canvas.style.width = W+'px';
    canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    draw();
  }

  /* ============================================================
     ROTACIÓN 3D SOBRE EL EJE DE REFLEXIÓN (fórmula de Rodrigues)
     Una reflexión F_k tiene su eje geométrico SIEMPRE fijo en el plano, en el
     ángulo pi*k/n — sin importar qué transformación se haya aplicado antes
     (esa transformación ya está "horneada" en la posición actual de cada
     vértice). Animar la reflexión como "voltear una hoja sobre su bisagra"
     significa: tomar la posición ACTUAL de cada vértice (ya con la matriz
     base aplicada), y rotarla en 3D (saliendo del plano de la pantalla) hasta
     180° alrededor de ese eje fijo, proyectando de vuelta a 2D para dibujar.
     Esto da un giro progresivo desde el instante inicial (en vez de un
     colapso brusco a la mitad), con un efecto de profundidad real: cada
     vértice se aleja o se acerca de la pantalla según su lado del eje. */
  function rotate3DAroundAxis(p2d, axisAngle, phiRad){
    const ax = Math.cos(axisAngle), ay = Math.sin(axisAngle); // eje unitario en el plano
    const cosPhi = Math.cos(phiRad), sinPhi = Math.sin(phiRad);
    const px=p2d.x, py=p2d.y; // pz siempre 0 al inicio (vértice vive en el plano de pantalla)
    const dot = ax*px + ay*py; // componente paralela al eje
    const crossZ = ax*py - ay*px; // cross(axis,p) con axis,p en el plano XY da solo componente Z
    const rx = px*cosPhi + ax*dot*(1-cosPhi);
    const ry = py*cosPhi + ay*dot*(1-cosPhi);
    const rz = crossZ*sinPhi;
    return { x:rx, y:ry, z:rz };
  }

  /* Para una matriz base (ya acumulada) y un elemento de reflexión F_k de D_n,
     calcula las posiciones 3D de los n vértices al avanzar el giro un ángulo
     phiRad (de 0 a pi) alrededor del eje fijo de esa reflexión, y las proyecta
     con PERSPECTIVA (no proyección paralela): el lado que se acerca a la
     "cámara" se ve más grande, el que se aleja más chico — dando la sensación
     real de una tarjeta rígida girando en el aire, no solo una compresión
     plana. CAMERA_DIST controla qué tan dramático es el efecto (más chico =
     más exagerado); 1.8 da un cambio de tamaño notorio (~2.3x en el peor
     caso) sin volverse inestable visualmente.

     Cuando n es grande (o el polígono está cerca del eje), todos los vértices
     caen casi sobre la misma recta exactamente en el punto medio del giro
     (90°), volviéndose indistinguibles. Para evitarlo, se separan levemente
     en abanico en la dirección perpendicular al eje — como las páginas de un
     libro abriéndose un poco — proporcional a sin(phi)^4 (así el efecto es
     casi imperceptible salvo muy cerca del punto medio) y al índice de cada
     vértice (de modo que el orden alrededor del polígono se preserva siempre,
     sin que ningún par de vértices intercambie su posición relativa). */
  const CAMERA_DIST = 1.8;
  function reflectionVertexPositions3D(baseMatrix, axisAngle, n, phiRad){
    const baseVerts = polygonVertices(n);
    const sharpness = Math.pow(Math.sin(phiRad), 4); // casi 0 salvo cerca de phiRad=pi/2
    const perpX = -Math.sin(axisAngle), perpY = Math.cos(axisAngle); // perpendicular al eje, fija en pantalla
    const FAN_SPREAD = 0.045; // sutil: apenas perceptible salvo en el instante más angosto
    return baseVerts.map((v,i)=>{
      const p2 = applyMatrix(baseMatrix, v);
      const rotated = rotate3DAroundAxis(p2, axisAngle, phiRad);
      const laneOffset = (i - (n-1)/2) * FAN_SPREAD * sharpness;
      const x3 = rotated.x + perpX*laneOffset, y3 = rotated.y + perpY*laneOffset, z3 = rotated.z;
      const scale = CAMERA_DIST / (CAMERA_DIST - z3); // >1 si se acerca (z>0), <1 si se aleja (z<0)
      return { x: x3*scale, y: y3*scale, z: z3, scale };
    });
  }

  function decompose(M){
    const det = M[0][0]*M[1][1] - M[0][1]*M[1][0];
    const isRefl = det < 0;
    if (!isRefl) return { angle: Math.atan2(M[1][0], M[0][0]), flip: 1 };
    const Rpart = [[M[0][0], -M[0][1]], [M[1][0], -M[1][1]]];
    return { angle: Math.atan2(Rpart[1][0], Rpart[0][0]), flip: -1 };
  }
  function recompose(angle, flipFactor){
    const c=Math.cos(angle), s=Math.sin(angle);
    return [[c, -s*flipFactor], [s, c*flipFactor]];
  }
  function slerpTransform(A, B, t){
    const a = decompose(A);
    const b = decompose(B);
    let da = b.angle - a.angle;
    while (da > Math.PI) da -= 2*Math.PI;
    while (da < -Math.PI) da += 2*Math.PI;
    const angle = a.angle + da*t;
    const flipFactor = a.flip + (b.flip - a.flip)*t;
    return recompose(angle, flipFactor);
  }

  /* Inicia la animación de transición al soltar un botón o un arrastre.
     Si toElement es una reflexión (F), anima con el giro 3D sobre su eje
     real; si es una rotación (R) o no se especifica, usa el slerp 2D normal. */
  function startAnimation(fromM, toM, toElement){
    animFromMatrix = fromM;
    animTo = toM;
    animStart = performance.now();
    animating = true;
    if (toElement && toElement.type === 'F'){
      animKind = 'reflection';
      animAxisAngle = 2*Math.PI*toElement.k/(2*state.n); // pi*k/n
    } else {
      animKind = 'rotation';
    }
    requestAnimationFrame(step);
  }
  function step(now){
    const t = Math.min(1, (now-animStart)/animDuration);
    const eased = t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
    if (animKind === 'reflection'){
      flip3D = { baseMatrix: animFromMatrix, axisAngle: animAxisAngle, phiRad: Math.PI*eased };
      displayMatrix = animTo; // queda listo para cuando termine la animación
    } else {
      flip3D = null;
      displayMatrix = slerpTransform(animFromMatrix, animTo, eased);
    }
    draw();
    if (t < 1){ requestAnimationFrame(step); }
    else { animating=false; flip3D=null; displayMatrix=animTo; draw(); }
  }

  function setMatrix(M, animate, toElement){
    if (animate){ startAnimation(displayMatrix, M, toElement); }
    else { flip3D = null; displayMatrix = M; draw(); }
  }

  /* ============================================================
     ARRASTRE INTERACTIVO DE VÉRTICES — seguimiento continuo + snap animado
     Mientras el botón está presionado, el vértice agarrado sigue literalmente
     al cursor (la figura gira o se refleja de forma fluida, no a saltos).
     Solo al SOLTAR se anima un "snap" corto hacia el elemento discreto de
     D_n más cercano — igual que la animación que ya existe para los botones.

     Modo ROTACIÓN: el ángulo libre = ángulo del mouse respecto al centro
     menos el ángulo que tenía el vértice arrastrado al iniciar el arrastre;
     se aplica esa rotación libre directamente sobre dragBaseMatrix.

     Modo REFLEXIÓN: se proyecta la posición del mouse sobre el segmento que
     une la posición inicial del vértice con su posición bajo la reflexión
     candidata, dando un progreso t en [0,1]; ese t alimenta el mismo sistema
     decompose/recompose ya usado para animar botones (colapso y reaparición
     espejada), de modo que el vértice arrastrado sigue al mouse con la
     proyección, mientras el resto de la figura se mueve de forma honesta.
     ============================================================ */
  let dragging = false, dragVertexIdx = -1, dragBaseMatrix = IDENTITY_MATRIX;
  let dragMinDistToCenter = Infinity, dragPreviewElement = null;
  let dragMode = 'R', dragStartVertexAngle = 0;
  const CROSS_CENTER_THRESHOLD = 0.32; // fracción del radio: por debajo de esto se considera "atravesó el centro"

  function screenToPolygon(sx, sy){
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H)*0.34;
    return { x: (sx-cx)/R, y: -(sy-cy)/R };
  }

  function hitTestVertex(sx, sy){
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H)*0.34;
    const n = state.n;
    const baseVerts = polygonVertices(n);
    const toScreen = p => ({ x: cx + p.x*R, y: cy - p.y*R });
    let best = -1, bestDist = Infinity;
    baseVerts.forEach((v,i)=>{
      const vt = applyMatrix(displayMatrix, v);
      const s = toScreen(vt);
      const d = Math.hypot(s.x-sx, s.y-sy);
      if (d < 16 && d < bestDist){ bestDist = d; best = i; }
    });
    return best;
  }

  function setupDragInteraction(onPreviewUpdate, onDragConfirm){
    host.addEventListener('mousedown', e=>{
      const r = host.getBoundingClientRect();
      const sx = e.clientX-r.left, sy = e.clientY-r.top;
      const idx = hitTestVertex(sx, sy);
      if (idx < 0) return;
      dragging = true;
      dragVertexIdx = idx;
      dragBaseMatrix = displayMatrix; // lo ya acumulado ANTES de este arrastre
      dragMinDistToCenter = Infinity;
      dragPreviewElement = null;
      dragMode = 'R';
      const angle0 = 2*Math.PI*idx/state.n;
      const localVertex = { x: Math.cos(angle0), y: Math.sin(angle0) };
      const transformedStart = applyMatrix(dragBaseMatrix, localVertex);
      dragStartVertexAngle = Math.atan2(transformedStart.y, transformedStart.x);
      animating = false; // cancela cualquier animación de botón en curso
      host.classList.add('grabbing');
    });

    window.addEventListener('mousemove', e=>{
      if (!dragging) return;
      const r = host.getBoundingClientRect();
      const sx = e.clientX-r.left, sy = e.clientY-r.top;
      const mouseLocal = screenToPolygon(sx, sy);
      const distToCenter = Math.hypot(mouseLocal.x, mouseLocal.y);
      if (distToCenter < dragMinDistToCenter) dragMinDistToCenter = distToCenter;
      dragMode = dragMinDistToCenter < CROSS_CENTER_THRESHOLD ? 'F' : 'R';

      // elemento candidato de snap (para saber hacia dónde animar al soltar,
      // y para previsualizar la etiqueta), pero el DIBUJO sigue al mouse libremente
      const { element } = findNearestElement(mouseLocal, dragVertexIdx, state.n, dragBaseMatrix, dragMode);
      if (element) dragPreviewElement = element;

      const n = state.n;
      const angle0 = 2*Math.PI*dragVertexIdx/n;
      const localVertex = { x: Math.cos(angle0), y: Math.sin(angle0) };

      if (dragMode === 'R'){
        flip3D = null;
        const mouseAngle = Math.atan2(mouseLocal.y, mouseLocal.x);
        let freeDelta = mouseAngle - dragStartVertexAngle;
        // normalizar a (-pi,pi] no es necesario aquí: una rotación libre puede
        // acumular más de una vuelta si el usuario gira varias veces, lo cual
        // es geométricamente correcto y se siente natural al arrastrar.
        const c = Math.cos(freeDelta), s = Math.sin(freeDelta);
        const freeRotation = [[c,-s],[s,c]];
        displayMatrix = matMul(freeRotation, dragBaseMatrix);
      } else {
        // modo reflexión: medir el progreso proyectando el mouse sobre el
        // desplazamiento del vértice de MÁXIMO desplazamiento entre
        // dragBaseMatrix y el destino candidato (no necesariamente el vértice
        // que el usuario agarró: si ese está cerca del eje de la reflexión
        // candidata, apenas se mueve, y proyectar sobre un segmento casi nulo
        // es numéricamente inestable). Ese progreso t alimenta el GIRO 3D real
        // sobre el eje fijo de la reflexión (0 a 180°), dando la sensación de
        // "voltear una hoja sobre su bisagra" desde el primer instante, en vez
        // de un colapso 2D brusco a la mitad del recorrido.
        const targetM = element ? matMul(elementMatrix(element, n), dragBaseMatrix) : dragBaseMatrix;
        let bestSegLen2 = -1, bestStart=null, bestEnd=null;
        for (let vi=0; vi<n; vi++){
          const a0 = 2*Math.PI*vi/n;
          const lv = { x: Math.cos(a0), y: Math.sin(a0) };
          const p0 = applyMatrix(dragBaseMatrix, lv);
          const p1 = applyMatrix(targetM, lv);
          const dx = p1.x-p0.x, dy = p1.y-p0.y;
          const len2 = dx*dx+dy*dy;
          if (len2 > bestSegLen2){ bestSegLen2 = len2; bestStart=p0; bestEnd=p1; }
        }
        let t = 0;
        if (bestSegLen2 > 1e-6){
          const segX = bestEnd.x-bestStart.x, segY = bestEnd.y-bestStart.y;
          t = ((mouseLocal.x-bestStart.x)*segX + (mouseLocal.y-bestStart.y)*segY) / bestSegLen2;
        }
        t = Math.max(0, Math.min(1, t));
        if (element){
          const axisAngle = Math.PI*element.k/n;
          flip3D = { baseMatrix: dragBaseMatrix, axisAngle, phiRad: Math.PI*t };
          displayMatrix = targetM;
        }
      }
      draw();
      if (element) onPreviewUpdate(element, dragMode);
    });

    window.addEventListener('mouseup', ()=>{
      if (!dragging) return;
      dragging = false;
      host.classList.remove('grabbing');
      if (dragPreviewElement){
        const finalM = matMul(elementMatrix(dragPreviewElement, state.n), dragBaseMatrix);
        if (flip3D && dragPreviewElement.type === 'F'){
          // continuar el giro 3D ya en curso desde su ángulo actual hasta 180°,
          // en vez de reiniciar la animación desde el principio
          const startPhi = flip3D.phiRad;
          const baseMatrix = flip3D.baseMatrix;
          const axisAngle = flip3D.axisAngle;
          animFromMatrix = baseMatrix;
          animTo = finalM;
          animKind = 'reflection';
          animAxisAngle = axisAngle;
          animStart = performance.now() - (startPhi/Math.PI)*animDuration;
          animating = true;
          requestAnimationFrame(step);
        } else {
          startAnimation(displayMatrix, finalM, dragPreviewElement); // snap corto y animado a la posición exacta de D_n
        }
        onDragConfirm(dragPreviewElement);
      }
      dragPreviewElement = null;
    });
  }

  function draw(){
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H)*0.34;
    const n = state.n;
    const toScreen = p => ({ x: cx + p.x*R, y: cy - p.y*R });

    // ejes de reflexión (líneas punteadas que pasan por el origen)
    if (state.show.axes){
      ctx.save();
      ctx.strokeStyle = 'rgba(255,93,143,0.28)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5,6]);
      for (let k=0;k<n;k++){
        const axisAngle = Math.PI*k/n;
        const dx = Math.cos(axisAngle), dy = Math.sin(axisAngle);
        const L = R*1.5;
        const p1 = toScreen({x:dx*L, y:dy*L});
        const p2 = toScreen({x:-dx*L, y:-dy*L});
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // polígono de referencia (posición original, tenue)
    const baseVerts = polygonVertices(n);
    ctx.save();
    ctx.strokeStyle = 'rgba(159,176,208,0.18)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    baseVerts.forEach((v,i)=>{ const s=toScreen(v); i===0?ctx.moveTo(s.x,s.y):ctx.lineTo(s.x,s.y); });
    ctx.closePath(); ctx.stroke();
    ctx.restore();

    // polígono transformado (actual): posiciones 2D + profundidad z + scale de
    // perspectiva (scale=1 si no hay transición de reflexión en curso)
    let transVerts3D;
    if (flip3D){
      transVerts3D = reflectionVertexPositions3D(flip3D.baseMatrix, flip3D.axisAngle, n, flip3D.phiRad);
    } else {
      transVerts3D = baseVerts.map(v => { const p = applyMatrix(displayMatrix, v); return { x:p.x, y:p.y, z:0, scale:1 }; });
    }

    /* Actualizar el historial de estelas: solo se acumula durante una
       transición de reflexión activa (flip3D !== null); en cualquier otro
       momento se vacía, para que la estela no "se quede pegada" cuando el
       polígono está quieto. */
    if (flip3D){
      if (!vertexTrails || vertexTrails.length !== n) vertexTrails = Array.from({length:n}, ()=>[]);
      transVerts3D.forEach((v,i)=>{
        vertexTrails[i].push({ x:v.x, y:v.y });
        if (vertexTrails[i].length > TRAIL_MAX_LEN) vertexTrails[i].shift();
      });
    } else {
      vertexTrails = null;
    }

    /* El contorno rígido se desvanece hacia el punto medio del giro (donde
       la silueta sería una línea delgada y poco interesante de ver), dejando
       que sean los vértices luminosos y sus estelas los protagonistas en ese
       instante — la sensación etérea de partículas volando, no una figura
       geométrica que se aplana. sinPhi=0 en los extremos (0°,180°, contorno
       a opacidad plena) y =1 en el punto medio (90°, contorno casi invisible). */
    const sinPhi = flip3D ? Math.abs(Math.sin(flip3D.phiRad)) : 0;
    const contourAlpha = 1 - sinPhi*0.88;
    const glowBoost = 1 + sinPhi*1.4; // más glow cuanto más "etérea" está la figura

    // estelas (cola de cometa) por vértice — se dibujan ANTES del contorno y
    // los puntos, para que queden "debajo" visualmente
    if (vertexTrails){
      vertexTrails.forEach((trail,i)=>{
        if (trail.length < 2) return;
        for (let j=1;j<trail.length;j++){
          const t = j/trail.length; // 0=más viejo/tenue, 1=más reciente/brillante
          const p0 = toScreen(trail[j-1]), p1 = toScreen(trail[j]);
          ctx.save();
          ctx.globalAlpha = t*t*0.85;
          ctx.strokeStyle = '#ffd24a';
          ctx.lineWidth = 1 + t*2.2;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#ffd24a'; ctx.shadowBlur = 6 + t*8;
          ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
          ctx.restore();
        }
      });
    }

    // contorno del polígono — opacidad y glow dependientes del punto del giro
    ctx.save();
    ctx.globalAlpha = contourAlpha;
    ctx.strokeStyle = '#34d6e8';
    ctx.fillStyle = `rgba(52,214,232,${0.10*contourAlpha})`;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#34d6e8'; ctx.shadowBlur = 10*glowBoost;
    ctx.beginPath();
    transVerts3D.forEach((v,i)=>{ const s=toScreen(v); i===0?ctx.moveTo(s.x,s.y):ctx.lineTo(s.x,s.y); });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    // vértices numerados: el TAMAÑO real cambia con la perspectiva (más
    // grande si ese vértice está "más cerca" de la cámara, más chico si está
    // "más lejos"); además se vuelven más luminosos ("etéreos") justo en el
    // punto medio del giro, donde son las verdaderas protagonistas visuales.
    if (state.show.labels){
      transVerts3D.forEach((v,i)=>{
        const s = toScreen(v);
        const sc = v.scale || 1;
        const radius = Math.max(2, 5*Math.sqrt(sc));
        const baseAlpha = Math.max(0.55, Math.min(1, 0.7 + 0.3*sc));
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.shadowColor = '#ffd24a'; ctx.shadowBlur = 4*glowBoost;
        ctx.fillStyle = '#ffd24a';
        ctx.beginPath(); ctx.arc(s.x, s.y, radius, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(7,11,22,.85)'; ctx.lineWidth=1.3; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(234,240,255,0.9)';
        ctx.font = `600 ${Math.round(12*Math.sqrt(sc))}px "Spline Sans Mono", monospace`;
        const labelOffset = { x: s.x>cx?10:-22, y: s.y>cy?16:-10 };
        ctx.fillText(String(i+1), s.x+labelOffset.x, s.y+labelOffset.y);
        ctx.restore();
      });
    }

    // marca de origen
    ctx.save();
    ctx.fillStyle = 'rgba(159,176,208,0.5)';
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  host.addEventListener('mousemove', e=>{
    if (dragging) return; // mientras se arrastra, el cursor ya está fijado por .grabbing
    const r = host.getBoundingClientRect();
    const sx = e.clientX-r.left, sy = e.clientY-r.top;
    const idx = hitTestVertex(sx, sy);
    host.classList.toggle('hovering-vertex', idx>=0);
  });

  return { resize, draw, setMatrix, setupDragInteraction };
}

/* ============================================================
   7.  TABLA DE CAYLEY
   ============================================================ */
function buildCayleyTable(){
  const n = state.n;
  const allEls = elementsOf(n);
  const visibleEls = state.show.klein && n===4 ? kleinSubgroupD4() : allEls;

  const scroll = $('cayleyScroll');
  let html = '<table class="cayley"><thead><tr><th>∘</th>';
  visibleEls.forEach(e=> html += `<th>${elementLabel(e,n)}</th>`);
  html += '</tr></thead><tbody>';
  visibleEls.forEach(row=>{
    html += `<tr><th>${elementLabel(row,n)}</th>`;
    visibleEls.forEach(col=>{
      const prod = compose(row, col, n);
      const cls = isIdentity(prod) ? 'cell-identity' : (prod.type==='R' ? 'cell-rotation' : 'cell-reflection');
      const kleinCls = (n===4 && isInKlein(row) && isInKlein(col) && isInKlein(prod)) ? ' cell-klein' : '';
      html += `<td class="${cls}${kleinCls}" data-row="${elementKey(row)}" data-col="${elementKey(col)}">${elementLabel(prod,n)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  scroll.innerHTML = html;
}

function highlightCayleyCell(rowEl, colEl){
  document.querySelectorAll('table.cayley td.cell-highlight').forEach(td=>td.classList.remove('cell-highlight'));
  if (!rowEl || !colEl) return;
  const td = document.querySelector(`table.cayley td[data-row="${elementKey(rowEl)}"][data-col="${elementKey(colEl)}"]`);
  if (td) td.classList.add('cell-highlight');
}

/* ============================================================
   8.  PANEL DE ANÁLISIS — axiomas de grupo
   ============================================================ */
function renderAxioms(){
  const el = $('axiomsPanel');
  const n = state.n;
  const groupName = state.show.klein && n===4 ? 'Klein V₄' : `D${n}`.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  const size = state.show.klein && n===4 ? 4 : 2*n;
  el.innerHTML = `
    <div class="axiom-row">
      <div class="axiom-check">✓</div>
      <div class="axiom-text"><b>Clausura:</b> toda composición de dos elementos de ${groupName} es otro elemento de ${groupName}.</div>
    </div>
    <div class="axiom-row">
      <div class="axiom-check">✓</div>
      <div class="axiom-text"><b>Asociatividad:</b> (A∘B)∘C = A∘(B∘C) para cualquier elección de A,B,C.</div>
    </div>
    <div class="axiom-row">
      <div class="axiom-check">✓</div>
      <div class="axiom-text"><b>Identidad:</b> e∘A = A∘e = A para todo elemento A.</div>
    </div>
    <div class="axiom-row">
      <div class="axiom-check">✓</div>
      <div class="axiom-text"><b>Inversos:</b> todo elemento A tiene un A⁻¹ tal que A∘A⁻¹ = e.</div>
    </div>
    <div class="readout-grid" style="margin-top:12px">
      <div class="row"><span class="rk">Grupo actual</span><span class="rv">${groupName}</span></div>
      <div class="row"><span class="rk">Número de elementos</span><span class="rv">${size}</span></div>
    </div>
  `;
}

function renderElementPanel(){
  const el = $('elementPanel');
  const n = state.n;
  const net = netElement();
  const inv = inverse(net, n);
  const order = elementOrder(net, n);
  el.innerHTML = `
    <div class="readout-grid">
      <div class="row"><span class="rk">Elemento neto</span><span class="rv">${elementLabel(net,n)}</span></div>
      <div class="row"><span class="rk">Descripción</span><span class="rv" style="font-size:11px">${elementFullName(net,n)}</span></div>
      <div class="row"><span class="rk">Inverso</span><span class="rv">${elementLabel(inv,n)}</span></div>
      <div class="row"><span class="rk">Orden (mínimo k: Aᵏ=e)</span><span class="rv">${order}</span></div>
      <div class="row"><span class="rk">¿Pertenece a Klein V₄?</span><span class="rv">${n===4 && isInKlein(net) ? 'Sí' : 'No'}</span></div>
    </div>
  `;
}

function elementOrder(x, n){
  let cur = x, k = 1;
  while (!isIdentity(cur) && k <= 2*n){
    cur = compose(x, cur, n);
    k++;
  }
  return k;
}

/* ============================================================
   9.  UI: selector de n, botones de operación, toggles
   ============================================================ */
function buildNSelect(){
  const box = $('nSelect');
  box.innerHTML = [3,4,5,6,7,8].map(n=>`<button class="n-btn${state.n===n?' active':''}" data-n="${n}">${n}</button>`).join('');
  box.querySelectorAll('.n-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const n = +btn.dataset.n;
      if (n === state.n) return;
      state.n = n;
      state.chain = [];
      state.position = 0;
      if (n !== 4){ state.show.klein = false; $('kleinCheck').checked = false; $('kleinToggle').classList.remove('active'); }
      buildNSelect();
      buildOpButtons();
      canvasPoly.setMatrix(IDENTITY_MATRIX, false);
      recompute();
    });
  });
  $('nName').textContent = N_NAMES[state.n];
}

function buildOpButtons(){
  const n = state.n;
  const rotBox = $('rotGrid');
  rotBox.innerHTML = '';
  for (let k=1;k<n;k++){
    const deg = Math.round(360*k/n);
    const el = { type:'R', k };
    const btn = document.createElement('button');
    btn.className = 'op-btn rotation';
    btn.innerHTML = `${elementLabel(el,n)} <span class="op-deg">${deg}°</span>`;
    btn.addEventListener('click', ()=> applyOperation(el));
    rotBox.appendChild(btn);
  }
  const reflBox = $('reflGrid');
  reflBox.innerHTML = '';
  for (let k=0;k<n;k++){
    const axisDeg = Math.round(180*k/n);
    const el = { type:'F', k };
    const btn = document.createElement('button');
    btn.className = 'op-btn reflection';
    btn.innerHTML = `${elementLabel(el,n)} <span class="op-deg">${axisDeg}°</span>`;
    btn.addEventListener('click', ()=> applyOperation(el));
    reflBox.appendChild(btn);
  }
}

function applyOperation(el, opts){
  const skipAnim = opts && opts.skipAnim;
  // si estábamos navegando hacia atrás, una nueva operación descarta el "futuro"
  // (igual que rehacer se pierde al escribir algo nuevo en un editor)
  if (state.position < state.chain.length){
    state.chain = state.chain.slice(0, state.position);
  }
  state.chain.push(el);
  state.position = state.chain.length;
  const M = netMatrix();
  canvasPoly.setMatrix(M, !skipAnim, el);
  recompute();
}

/* Navega a un punto específico de la cadena (0 = identidad, chain.length = el final).
   No borra nada: solo mueve el puntero `position`. */
function jumpToPosition(pos){
  const newPos = Math.max(0, Math.min(pos, state.chain.length));
  const singleStepEl = Math.abs(newPos - state.position) === 1
    ? state.chain[Math.max(newPos, state.position) - 1]
    : null;
  state.position = newPos;
  const M = netMatrix();
  canvasPoly.setMatrix(M, true, singleStepEl);
  recompute();
}

function buildToggles(){
  const items = [
    { key:'axes', label:'Ejes de reflexión' },
    { key:'labels', label:'Etiquetas de vértices' }
  ];
  const box = $('toggles');
  box.innerHTML = items.map(it=>`
    <label class="toggle">
      <input type="checkbox" data-k="${it.key}" ${state.show[it.key]?'checked':''}>
      <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
      <span class="tlab">${it.label}</span>
    </label>`).join('');
  box.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      state.show[inp.dataset.k] = inp.checked;
      canvasPoly.draw();
    });
  });
}

/* ============================================================
   10.  HISTORIAL DE COMPOSICIÓN (chips navegables)
   ============================================================ */
function renderChain(){
  const box = $('compChain');
  const posBox = $('compPosition');
  if (state.chain.length === 0){
    box.innerHTML = '<span class="comp-empty">Sin operaciones aplicadas todavía — el polígono está en la identidad (e). Haz clic en un botón de la izquierda para empezar.</span>';
    posBox.style.display = 'none';
    return;
  }
  const n = state.n;
  let html = '';
  state.chain.forEach((el,i)=>{
    const cls = isIdentity(el) ? 'identity' : (el.type==='R' ? 'rotation' : 'reflection');
    const isFuture = i >= state.position;
    const isLastActive = i === state.position-1;
    html += `<span class="comp-chip ${cls}${isFuture?' dimmed':''}${isLastActive?' active-step':''}" data-pos="${i+1}">${elementLabel(el,n)}</span>`;
    if (i < state.chain.length-1) html += '<span class="comp-arrow">→</span>';
  });
  const net = netElement();
  html += `<span class="comp-result">= ${elementLabel(net,n)}</span>`;
  box.innerHTML = html;

  box.querySelectorAll('.comp-chip').forEach(chip=>{
    chip.addEventListener('click', ()=> jumpToPosition(+chip.dataset.pos));
  });

  posBox.style.display = 'flex';
  posBox.innerHTML = `
    <button class="pos-btn" id="posStart" ${state.position===0?'disabled':''}>⏮ inicio</button>
    <span>paso ${state.position} de ${state.chain.length}</span>
    <button class="pos-btn" id="posEnd" ${state.position===state.chain.length?'disabled':''}>final ⏭</button>
  `;
  const startBtn = $('posStart'), endBtn = $('posEnd');
  if (startBtn) startBtn.addEventListener('click', ()=> jumpToPosition(0));
  if (endBtn) endBtn.addEventListener('click', ()=> jumpToPosition(state.chain.length));
}

/* ============================================================
   11.  MOTOR PRINCIPAL
   ============================================================ */
let canvasPoly;
let latticeCacheN = null, latticeCacheData = null; // el reticulado solo depende de n, no de la cadena activa

/* ============================================================
   11b.  PERMUTACIÓN: matriz simple, ciclos, y diagrama bipartito
   ============================================================ */
function renderPermutationMatrix(){
  const box = $('permMatrix');
  const n = state.n;
  const net = netElement();
  const perm = elementPermutation(net, n);

  const cellW = 36, gap = 4, stride = cellW+gap;
  const totalW = n*stride - gap;

  let topCells = '', botCells = '';
  for (let i=0;i<n;i++){
    topCells += `<div class="perm-cell">${i+1}</div>`;
    botCells += `<div class="perm-cell">${perm[i]+1}</div>`;
  }

  box.innerHTML = `
    <div class="perm-table">
      <div class="perm-row top" style="width:${totalW}px">${topCells}</div>
      <div class="perm-row bottom" style="width:${totalW}px">${botCells}</div>
    </div>
  `;
}

function renderCyclesNotation(){
  const box = $('permCycles');
  const n = state.n;
  const net = netElement();
  const perm = elementPermutation(net, n);
  box.textContent = cycleNotation(perm, n);
}

/* Diagrama de múltiples columnas con FILAS FIJAS: en toda columna, la fila i
   siempre muestra la etiqueta i+1 (nunca se reordena). Cada tramo entre la
   columna c y c+1 usa la permutación INDIVIDUAL del paso c (no la acumulada):
   la flecha sale de la fila i y llega a la fila stepPerm[i]. El camino
   completo de un vértice se traza siguiendo flecha tras flecha — por eso el
   hover resalta la cadena de segmentos que parte de la fila bajo el cursor
   en la primera columna y sigue hasta la última. */
function renderPermutationDiagram(){
  const host = $('permDiagramHost');
  const n = state.n;
  const numCols = state.position + 1; // columna 0 (inicio) + una por cada paso activo

  const rowH = 30, colGap = 78, padTop = 26, padBottom = 8;
  const leftPad = 15;
  const W = leftPad*2 + (numCols-1)*colGap;
  const H = padTop + n*rowH + padBottom;
  const colX = idx => leftPad + idx*colGap;
  const rowY = row => padTop + row*rowH + rowH/2;

  // permutación INDIVIDUAL de cada paso activo (no acumulada)
  const stepPerms = [];
  for (let c=0;c<state.position;c++) stepPerms.push(elementPermutation(state.chain[c], n));

  // para cada vértice de partida (fila inicial), calcular la secuencia completa
  // de filas que recorre a través de todas las columnas (su "ruta")
  const routes = [];
  for (let startRow=0; startRow<n; startRow++){
    const route = [startRow];
    let cur = startRow;
    for (const sp of stepPerms){ cur = sp[cur]; route.push(cur); }
    routes.push(route);
  }

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" id="permSvgRoot">`;
  svg += `<defs><marker id="permDiagArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--amber)"/></marker></defs>`;

  // segmentos (uno por vértice de partida y por tramo), agrupados con data-start
  for (let startRow=0; startRow<n; startRow++){
    const route = routes[startRow];
    for (let c=0;c<numCols-1;c++){
      const r1 = route[c], r2 = route[c+1];
      const isFixed = r1 === r2;
      const x1 = colX(c)+9, x2 = colX(c+1)-11;
      const y1 = rowY(r1), y2 = rowY(r2);
      svg += `<line class="perm-seg" data-start="${startRow}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--amber)" stroke-width="1.3" opacity="${isFixed?0.28:0.65}" marker-end="url(#permDiagArrow)"/>`;
    }
  }

  // columnas de círculos: SIEMPRE en orden fijo 1..n, sin reordenar
  for (let c=0;c<numCols;c++){
    const isLast = c === numCols-1 && numCols > 1;
    const isFirst = c === 0;
    const x = colX(c);
    const label = isFirst ? 'inicio' : elementLabel(state.chain[c-1], n);
    svg += `<text x="${x}" y="14" text-anchor="middle" font-family="Spline Sans Mono, monospace" font-size="9.5" font-weight="600" fill="${isLast?'var(--amber)':'var(--ink-faint)'}">${label}${isLast?' = neto':''}</text>`;

    for (let row=0; row<n; row++){
      const y = rowY(row);
      const fill = isLast ? 'rgba(255,154,60,.14)' : 'rgba(17,28,51,.8)';
      const stroke = isLast ? 'var(--amber)' : 'var(--ink-soft)';
      const textColor = isLast ? 'var(--amber)' : 'var(--ink)';
      svg += `<circle class="perm-node" data-row="${row}" data-col="${c}" cx="${x}" cy="${y}" r="9" fill="${fill}" stroke="${stroke}" stroke-width="${isLast?1.6:1.3}"/>`;
      svg += `<text class="perm-node-label" data-row="${row}" data-col="${c}" x="${x}" y="${y+4}" text-anchor="middle" font-family="Spline Sans Mono, monospace" font-size="11" font-weight="600" fill="${textColor}" style="pointer-events:none">${row+1}</text>`;
    }
  }

  svg += `</svg>`;
  host.innerHTML = svg;

  attachPermutationHover(host, n);
}

/* Hover: al pasar el mouse sobre CUALQUIER círculo del diagrama (en cualquier
   columna), se identifica a qué ruta de vértice pertenece esa celda exacta
   (col, row) y se resalta la ruta completa de inicio a fin — porque cada
   permutación es una biyección, cada celda pertenece a exactamente una ruta,
   sin importar en qué columna esté. */
/* Estado del fijado: el HOVER siempre funciona, sin importar si hay algo
   fijado. Lo que cambia es qué se muestra cuando el mouse SALE de un nodo:
   si hay una ruta fijada, se vuelve a mostrar esa (en vez de limpiar todo a
   cero); si no hay nada fijado, se limpia normalmente. Un clic fija/libera
   la ruta bajo el cursor en ese momento. */
let pinnedRoute = null; // la ruta (arreglo de filas) actualmente fijada, o null

function attachPermutationHover(host, n){
  pinnedRoute = null; // cada vez que se reconstruye el diagrama, se libera cualquier fijado previo
  const numCols = state.position + 1;
  const stepPerms = [];
  for (let c=0;c<state.position;c++) stepPerms.push(elementPermutation(state.chain[c], n));

  // todas las rutas completas, una por cada fila de inicio
  const routes = [];
  for (let startRow=0; startRow<n; startRow++){
    const route = [startRow];
    let cur = startRow;
    for (const sp of stepPerms){ cur = sp[cur]; route.push(cur); }
    routes.push(route);
  }

  const nodes = host.querySelectorAll('.perm-node');
  nodes.forEach(node=>{
    const col = +node.dataset.col, row = +node.dataset.row;
    // encontrar la única ruta que pasa por (col, row)
    const routeIdx = routes.findIndex(r => r[col] === row);
    if (routeIdx < 0) return;
    const route = routes[routeIdx];
    node.style.cursor = 'pointer';
    node.addEventListener('mouseenter', ()=> highlightRoute(host, route));
    node.addEventListener('mouseleave', ()=>{
      if (pinnedRoute) highlightRoute(host, pinnedRoute);
      else clearRouteHighlight(host);
    });
    node.addEventListener('click', ()=>{
      const isSamePinned = pinnedRoute && pinnedRoute[0] === route[0];
      if (isSamePinned){
        // clic de nuevo sobre la misma ruta fijada: la libera
        pinnedRoute = null;
        clearRouteHighlight(host);
      } else {
        // fija esta ruta (reemplazando cualquier fijado anterior)
        pinnedRoute = route;
        highlightRoute(host, route);
      }
    });
  });
}

/* Resalta una ruta completa ya calculada (arreglo de filas, una por columna).
   Cada segmento conserva en data-start la fila de inicio (columna 0) del
   vértice al que pertenece — como las rutas no se cruzan entre sí en ningún
   punto sin fusionarse (son una permutación, es decir, una biyección en cada
   paso), comparar contra route[0] basta para seleccionar exactamente los
   segmentos de esta ruta y ninguno de las demás. */
function highlightRoute(host, route){
  const allSegs = host.querySelectorAll('.perm-seg');
  const allNodes = host.querySelectorAll('.perm-node');

  allNodes.forEach(node=> node.classList.add('node-dimmed'));
  allSegs.forEach(seg=> seg.classList.add('seg-dimmed'));

  // activar solo los nodos que la ruta efectivamente toca
  route.forEach((row, col)=>{
    const node = host.querySelector(`.perm-node[data-col="${col}"][data-row="${row}"]`);
    if (node) node.classList.remove('node-dimmed');
  });

  // activar solo los segmentos de esta ruta (mismo vértice de inicio en columna 0)
  const startRow = route[0];
  allSegs.forEach(seg=>{
    if (+seg.dataset.start === startRow){
      seg.classList.remove('seg-dimmed');
      seg.classList.add('seg-active');
    }
  });
}

function clearRouteHighlight(host){
  host.querySelectorAll('.perm-seg').forEach(s=> s.classList.remove('seg-active','seg-dimmed'));
  host.querySelectorAll('.perm-node').forEach(n=> n.classList.remove('node-dimmed'));
}

/* ============================================================
   11c.  PANEL DE GENERADORES Y ÓRDENES
   ============================================================ */
function renderGeneratorsPanel(){
  const el = $('generatorsPanel');
  const n = state.n;
  const isKleinMode = state.show.klein && n===4;
  const allEls = isKleinMode ? kleinSubgroupD4() : elementsOf(n);
  const groupSize = allEls.length;

  let rows = '';
  allEls.forEach(e=>{
    const order = elementOrder(e, n);
    // D_n nunca es cíclico (n>=3): ningún elemento genera TODO el grupo.
    // Lo que sí ocurre: una rotación R_k genera TODAS las rotaciones cuando
    // su orden coincide con n (equivalente a gcd(k,n)=1). En modo Klein,
    // como V4 SÍ es generado por pares de sus elementos, marcamos en cambio
    // los elementos de orden máximo (2) como "generadores junto con otro".
    const isFullRotationGenerator = !isKleinMode && e.type==='R' && order===n && n>1;
    const subgroup = generatedSubgroup(e, n);
    const generatesStr = subgroup.length-1 === 1 ? '{e}' : `${subgroup.length-1} elementos`;
    rows += `<tr class="${isFullRotationGenerator?'is-generator':''}" data-key="${elementKey(e)}"><td>${elementLabel(e,n)}</td><td>${order}</td><td>${generatesStr}</td></tr>`;
  });

  el.innerHTML = `
    <div class="orders-scroll"><table class="orders-table">
      <thead><tr><th>elem.</th><th>orden</th><th>genera</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="gen-note">${isKleinMode
      ? 'Klein V₄ no es cíclico: ningún elemento por sí solo genera los 4. Se necesitan dos elementos distintos de orden 2 para generar todo el subgrupo.'
      : `D${n} tampoco es cíclico: ningún elemento genera los ${groupSize}. Resaltado en dorado: las rotaciones que sí generan <b>todo el subgrupo de rotaciones</b> (orden = n) — ocurre cuando k y n son primos entre sí.`}</div>
  `;

  el.querySelectorAll('tbody tr').forEach(tr=>{
    tr.addEventListener('click', ()=>{
      const key = tr.dataset.key;
      const type = key[0], k = +key.slice(1);
      applyOperation({ type, k });
    });
  });
}

/* ============================================================
   11d.  DIAGRAMA RETICULAR DE SUBGRUPOS
   Organizado por niveles horizontales según el ORDEN del subgrupo (mayor
   arriba, {e} abajo, como en la figura clásica de Fraleigh). Las aristas
   conectan cada subgrupo con sus subgrupos maximales (contención directa,
   sin saltarse niveles intermedios).
   ============================================================ */
function describeSubgroup(sg, n){
  if (sg.elems.length === 1) return '{ρ₀}';
  if (sg.elems.length === 2*n) return `D${subscriptNum(n)} (completo)`;
  const labels = sg.elems.map(e=>elementLabel(e,n));
  return '{' + labels.join(', ') + '}';
}

function renderSubgroupLattice(){
  const host = $('latticeHost');
  const sublabel = $('latticeSublabel');
  const n = state.n;

  let subgroups, edges;
  if (latticeCacheN === n && latticeCacheData){
    ({ subgroups, edges } = latticeCacheData);
  } else {
    subgroups = allSubgroupsOf(n);
    edges = subgroupLatticeEdges(subgroups);
    latticeCacheN = n;
    latticeCacheData = { subgroups, edges };
  }
  sublabel.textContent = `D${subscriptNum(n)} tiene ${subgroups.length} subgrupos en total (incluyendo el trivial {ρ₀} y el grupo completo). Pasa el mouse sobre un subgrupo para ver con qué otros se conecta por contención directa.`;

  // agrupar por orden (tamaño) para definir niveles verticales
  const byOrder = new Map();
  subgroups.forEach((sg,idx)=>{
    const ord = sg.elems.length;
    if (!byOrder.has(ord)) byOrder.set(ord, []);
    byOrder.get(ord).push(idx);
  });
  const orders = [...byOrder.keys()].sort((a,b)=>b-a); // mayor orden arriba

  const levelGap = 90, nodeGap = 150, padTop = 30, padBottom = 20, padSide = 90;
  const maxPerLevel = Math.max(...orders.map(o=>byOrder.get(o).length));
  const W = padSide*2 + (maxPerLevel-1)*nodeGap + 40;
  const H = padTop + padBottom + (orders.length-1)*levelGap + 20;

  // posición (x,y) de cada subgrupo, indexado por su índice en `subgroups`
  const pos = new Array(subgroups.length);
  orders.forEach((ord, levelIdx)=>{
    const idxs = byOrder.get(ord);
    const count = idxs.length;
    const totalWidth = (count-1)*nodeGap;
    const startX = (W - totalWidth)/2;
    idxs.forEach((idx, i)=>{
      pos[idx] = { x: startX + i*nodeGap, y: padTop + levelIdx*levelGap };
    });
  });

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

  // aristas primero (para que los nodos queden encima)
  edges.forEach(([ai,bi])=>{
    const A = pos[ai], B = pos[bi];
    svg += `<line class="lattice-edge" data-a="${ai}" data-b="${bi}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="var(--grass)" stroke-width="1.3" opacity="0.45"/>`;
  });

  // nodos
  subgroups.forEach((sg, idx)=>{
    const { x, y } = pos[idx];
    const isTrivial = sg.elems.length === 1;
    const isFull = sg.elems.length === 2*n;
    const fill = isFull ? 'rgba(79,217,138,.16)' : (isTrivial ? 'rgba(242,180,23,.12)' : 'rgba(17,28,51,.8)');
    const stroke = isFull ? 'var(--grass)' : (isTrivial ? 'var(--gold)' : 'var(--ink-soft)');
    const label = describeSubgroup(sg, n);
    const orderLabel = `orden ${sg.elems.length}`;
    // caja con texto envuelto en dos líneas (etiqueta + orden)
    const boxW = Math.min(132, 22 + label.length*6.2);
    svg += `<g class="lattice-node" data-idx="${idx}">`;
    svg += `<rect x="${x-boxW/2}" y="${y-18}" width="${boxW}" height="36" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
    svg += `<text x="${x}" y="${y-3}" text-anchor="middle" font-family="Spline Sans Mono, monospace" font-size="10.5" font-weight="600" fill="var(--ink)">${label}</text>`;
    svg += `<text x="${x}" y="${y+12}" text-anchor="middle" font-family="Spline Sans Mono, monospace" font-size="8.5" fill="var(--ink-faint)">${orderLabel}</text>`;
    svg += `</g>`;
  });

  svg += `</svg>`;
  host.innerHTML = svg;

  attachLatticeHover(host, edges);
}

function attachLatticeHover(host, edges){
  const nodes = host.querySelectorAll('.lattice-node');
  nodes.forEach(node=>{
    const idx = node.dataset.idx;
    node.addEventListener('mouseenter', ()=>{
      const relatedEdges = [...host.querySelectorAll('.lattice-edge')].filter(e => e.dataset.a===idx || e.dataset.b===idx);
      const relatedNodeIdx = new Set([idx]);
      relatedEdges.forEach(e=>{ relatedNodeIdx.add(e.dataset.a); relatedNodeIdx.add(e.dataset.b); });
      host.querySelectorAll('.lattice-node').forEach(nd=>{
        nd.classList.toggle('lattice-dimmed', !relatedNodeIdx.has(nd.dataset.idx));
      });
      host.querySelectorAll('.lattice-edge').forEach(e=>{
        const isRelated = e.dataset.a===idx || e.dataset.b===idx;
        e.classList.toggle('lattice-active', isRelated);
        e.classList.toggle('lattice-dimmed', !isRelated);
      });
    });
    node.addEventListener('mouseleave', ()=>{
      host.querySelectorAll('.lattice-node').forEach(nd=> nd.classList.remove('lattice-dimmed'));
      host.querySelectorAll('.lattice-edge').forEach(e=> e.classList.remove('lattice-active','lattice-dimmed'));
    });
  });
}

function recompute(){
  const n = state.n;
  $('chipGroup').textContent = (state.show.klein && n===4) ? 'Klein V₄ — 4 elementos' : `D${n}`.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]) + ` — ${2*n} elementos`;
  const net = netElement();
  $('currentElTag').textContent = elementLabel(net, n);

  buildCayleyTable();
  renderChain();
  renderAxioms();
  renderElementPanel();
  renderPermutationMatrix();
  renderCyclesNotation();
  renderPermutationDiagram();
  renderGeneratorsPanel();
  renderSubgroupLattice();

  // resaltar en la tabla la última composición ACTIVA (hasta state.position)
  if (state.position >= 1){
    const last = state.chain[state.position-1];
    let prevNet = { type:'R', k:0 };
    for (let i=0;i<state.position-1;i++) prevNet = compose(state.chain[i], prevNet, n);
    highlightCayleyCell(last, prevNet);
  } else {
    highlightCayleyCell(null, null);
  }
}

function bindEvents(){
  $('btnIdentity').addEventListener('click', ()=> applyOperation({ type:'R', k:0 }));

  $('btnClearChain').addEventListener('click', ()=>{
    state.chain = [];
    state.position = 0;
    canvasPoly.setMatrix(IDENTITY_MATRIX, true);
    recompute();
  });

  $('kleinToggle').addEventListener('click', (e)=>{
    if (state.n !== 4){
      e.preventDefault();
      return;
    }
  });
  $('kleinCheck').addEventListener('change', ()=>{
    if (state.n !== 4){ $('kleinCheck').checked = false; return; }
    state.show.klein = $('kleinCheck').checked;
    $('kleinToggle').classList.toggle('active', state.show.klein);
    recompute();
  });

  $('btnReset').addEventListener('click', ()=>{
    state.n = 4;
    state.chain = [];
    state.position = 0;
    state.show.klein = false;
    $('kleinCheck').checked = false;
    $('kleinToggle').classList.remove('active');
    buildNSelect();
    buildOpButtons();
    canvasPoly.setMatrix(IDENTITY_MATRIX, false);
    recompute();
  });

  buildToggles();
  window.addEventListener('resize', ()=>{ canvasPoly.resize(); });

  canvasPoly.setupDragInteraction(
    (previewElement, mode)=>{
      // previsualización ligera durante el arrastre: solo actualiza la etiqueta
      // del elemento activo y el indicador de modo, sin recalcular Cayley/reticulado
      // (esos paneles son costosos y no necesitan refrescarse en cada frame de mousemove)
      $('currentElTag').textContent = elementLabel(previewElement, state.n);
      $('currentElTag').style.color = mode==='F' ? 'var(--reflection)' : 'var(--rotation)';
    },
    (confirmedElement)=>{
      $('currentElTag').style.color = 'var(--gold-bright)';
      applyOperation(confirmedElement, { skipAnim:true });
    }
  );
}

/* ============================================================
   12.  INIT
   ============================================================ */
function init(){
  canvasPoly = makePolyCanvas('canvasPoly','hostPoly');
  buildNSelect();
  buildOpButtons();
  bindEvents();
  canvasPoly.resize();
  recompute();
}

function whenReady(){
  if (window.katex){ init(); }
  else setTimeout(whenReady, 60);
}
whenReady();

})();
