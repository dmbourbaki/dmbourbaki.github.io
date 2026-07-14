/* =========================================================
   OMAI — Diagramas de Venn
   Autor: Daniel Steven Moran Pizarro
   ========================================================= */

/* ---------- 1. TOKENIZER ---------- */
function tokenize(input){
  const tokens = [];
  let i = 0;
  while(i < input.length){
    const c = input[i];
    if(/\s/.test(c)){ i++; continue; }
    if(c === '('){ tokens.push({t:'LP'}); i++; continue; }
    if(c === ')'){ tokens.push({t:'RP'}); i++; continue; }
    if(c === '∪' || c === '+'){ tokens.push({t:'UNION'}); i++; continue; }
    if(c === '∩' || c === '*'){ tokens.push({t:'INTER'}); i++; continue; }
    if(c === '△' || c === 'Δ'){ tokens.push({t:'SYMDIFF'}); i++; continue; }
    if(c === '−' || c === '-' || c === '\\'){ tokens.push({t:'DIFF'}); i++; continue; }
    if(c === "'" || c === 'ᶜ'){ tokens.push({t:'COMP'}); i++; continue; }
    if(c === '∅'){ tokens.push({t:'EMPTY'}); i++; continue; }
    if(/[A-Z]/.test(c)){ tokens.push({t:'VAR', name:c}); i++; continue; }
    i++; // caracter desconocido: se ignora
  }
  tokens.push({t:'EOF'});
  return tokens;
}

/* ---------- 2. PARSER ---------- */
function parse(tokens){
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (t) => { if(tokens[pos].t !== t) throw new Error(`Se esperaba ${t} pero se encontró ${tokens[pos].t}`); return tokens[pos++]; };
  function parseUnion(){
    let left = parseInter();
    while(['UNION','DIFF','SYMDIFF'].includes(peek().t)){
      const op = eat(peek().t).t;
      const right = parseInter();
      const type = op==='UNION' ? 'union' : (op==='DIFF' ? 'diff' : 'symdiff');
      left = {type, l:left, r:right};
    }
    return left;
  }
  function parseInter(){
    let left = parseComplement();
    while(peek().t === 'INTER'){ eat('INTER'); left = {type:'inter', l:left, r:parseComplement()}; }
    return left;
  }
  function parseComplement(){
    let node = parseAtom();
    while(peek().t === 'COMP'){ eat('COMP'); node = {type:'comp', a:node}; }
    return node;
  }
  function parseAtom(){
    const tk = peek();
    if(tk.t === 'LP'){ eat('LP'); const e = parseUnion(); eat('RP'); return e; }
    if(tk.t === 'VAR'){ eat('VAR'); return {type:'var', name: tk.name}; }
    if(tk.t === 'EMPTY'){ eat('EMPTY'); return {type:'empty'}; }
    throw new Error('Símbolo inesperado o expresión incompleta cerca de "' + (tk.t||'') + '"');
  }
  const result = parseUnion();
  eat('EOF');
  return result;
}
function parseFormula(str){
  if(!str || !str.trim()) throw new Error('Escribe una expresión de conjuntos.');
  return parse(tokenize(str));
}

/* ---------- 3. EVALUADOR Y UTILIDADES ---------- */
function evaluate(node, assign){
  switch(node.type){
    case 'var': return !!assign[node.name];
    case 'empty': return false;
    case 'comp': return !evaluate(node.a, assign);
    case 'union': return evaluate(node.l, assign) || evaluate(node.r, assign);
    case 'inter': return evaluate(node.l, assign) && evaluate(node.r, assign);
    case 'diff': return evaluate(node.l, assign) && !evaluate(node.r, assign);
    case 'symdiff': return evaluate(node.l, assign) !== evaluate(node.r, assign);
  }
}
function getVars(node, set = new Set()){
  if(node.type === 'var') set.add(node.name);
  else if(node.type === 'comp') getVars(node.a, set);
  else if(node.type !== 'empty'){ getVars(node.l, set); getVars(node.r, set); }
  return set;
}
const SYM = {union:'∪', inter:'∩', diff:'−', symdiff:'△'};
function toString(node){
  function rec(n){
    if(n.type === 'var') return n.name;
    if(n.type === 'empty') return '∅';
    if(n.type === 'comp'){
      const inner = rec(n.a);
      const wrap = ['union','inter','diff','symdiff'].includes(n.a.type);
      return (wrap ? `(${inner})` : inner) + "'";
    }
    const l = rec(n.l), r = rec(n.r);
    const lw = ['union','inter','diff','symdiff'].includes(n.l.type);
    const rw = ['union','inter','diff','symdiff'].includes(n.r.type);
    return `${lw?'('+l+')':l} ${SYM[n.type]} ${rw?'('+r+')':r}`;
  }
  return rec(node);
}
function toLatex(node){
  const SYML = {union:'\\cup', inter:'\\cap', diff:'-', symdiff:'\\triangle'};
  function rec(n){
    if(n.type === 'var') return n.name;
    if(n.type === 'empty') return '\\emptyset';
    if(n.type === 'comp'){
      const inner = rec(n.a);
      const wrap = ['union','inter','diff','symdiff'].includes(n.a.type);
      return (wrap ? `(${inner})` : inner) + '^{c}';
    }
    const l = rec(n.l), r = rec(n.r);
    const lw = ['union','inter','diff','symdiff'].includes(n.l.type);
    const rw = ['union','inter','diff','symdiff'].includes(n.r.type);
    return `${lw?'('+l+')':l} ${SYML[n.type]} ${rw?'('+r+')':r}`;
  }
  return rec(node);
}
function equivalent(nodeA, nodeB){
  const vars = Array.from(new Set([...getVars(nodeA), ...getVars(nodeB)])).sort();
  const n = vars.length;
  for(let m=0;m<(1<<n);m++){
    const assign = {};
    for(let k=0;k<n;k++) assign[vars[k]] = !!(m & (1<<(n-1-k)));
    if(evaluate(nodeA,assign) !== evaluate(nodeB,assign)) return false;
  }
  return true;
}

/* =========================================================
   4. GEOMETRÍA DE VENN (composición con <mask>, no clipPath)
   Cada "circle" es en realidad una elipse general: rx, ry y rotación (rot, grados).
   Un círculo es el caso particular rx=ry=r, rot=0.
   ========================================================= */
const VENN_LAYOUTS = {
  1: { W:300, H:260, circles:[ {label:'A', cx:150, cy:130, rx:100, ry:100, rot:0} ] },
  2: { W:420, H:280, circles:[ {label:'A', cx:155, cy:140, rx:105, ry:105, rot:0}, {label:'B', cx:265, cy:140, rx:105, ry:105, rot:0} ] },
  3: { W:460, H:380, circles:[ {label:'A', cx:190, cy:155, rx:115, ry:115, rot:0}, {label:'B', cx:270, cy:155, rx:115, ry:115, rot:0}, {label:'C', cx:230, cy:245, rx:115, ry:115, rot:0} ] },
  // Diagrama de 4 círculos en cruz (A izquierda, B arriba, C derecha, D abajo) —
  // visualmente es el diagrama clásico y reconocible, pero con círculos iguales
  // es matemáticamente imposible distinguir TODAS las 16 combinaciones: las
  // combinaciones "A∩C sin B ni D" y "B∩D sin A ni C" no tienen región propia
  // (verificado por muestreo: 14 de 16 regiones existen geométricamente).
  4: { W:740, H:740, circles:[
    {label:'A', cx:240, cy:370, rx:200, ry:200, rot:0},
    {label:'B', cx:370, cy:240, rx:200, ry:200, rot:0},
    {label:'C', cx:500, cy:370, rx:200, ry:200, rot:0},
    {label:'D', cx:370, cy:500, rx:200, ry:200, rot:0}
  ]}
};
// Cada máscara es una simple composición blanco/negro (visible/oculto) — no depende de
// combinar fill-rule evenodd dentro de un clipPath, que resultó no ser fiable.
let vennInstanceCounter = 0;
function nextVennPrefix(){ return 'v' + (vennInstanceCounter++) + '_'; }

function ellipseTag(c, fill){
  const rot = c.rot ? ` transform="rotate(${c.rot} ${c.cx} ${c.cy})"` : '';
  return `<ellipse cx="${c.cx}" cy="${c.cy}" rx="${c.rx}" ry="${c.ry}" fill="${fill}"${rot}/>`;
}
function vennDefs(layout, prefix){
  const {W,H,circles} = layout;
  let defs = '';
  circles.forEach(c => {
    defs += `<mask id="${prefix}in_${c.label}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      ${ellipseTag(c, 'white')}
    </mask>`;
    defs += `<mask id="${prefix}out_${c.label}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect x="0" y="0" width="${W}" height="${H}" fill="white"/>
      ${ellipseTag(c, 'black')}
    </mask>`;
  });
  return defs;
}
// Genera todas las combinaciones booleanas (regiones) para nSets, en el mismo orden que una tabla de verdad
function allRegions(nSets){
  const labels = ['A','B','C','D'].slice(0, nSets);
  const regions = [];
  for(let m=(1<<nSets)-1; m>=0; m--){
    const assign = {};
    labels.forEach((l,k) => assign[l] = !!(m & (1<<(nSets-1-k))));
    regions.push(assign);
  }
  // Con 4 círculos iguales, "A∩C sin B ni D" y "B∩D sin A ni C" no existen como
  // región geométrica (ver nota en VENN_LAYOUTS[4]) — las excluimos aquí para que
  // ninguna vista (clasificación, tabla, juego) las trate como una región real.
  if(nSets === 4){
    return regions.filter(a => !((a.A && a.C && !a.B && !a.D) || (a.B && a.D && !a.A && !a.C)));
  }
  return regions;
}
function regionKey(assign, labels){ return labels.map(l => assign[l] ? '1':'0').join(''); }
function nestedMaskGroup(assign, labels, innerSVG, prefix){
  let out = innerSVG;
  labels.forEach(l => {
    const maskId = assign[l] ? `${prefix}in_${l}` : `${prefix}out_${l}`;
    out = `<g mask="url(#${maskId})">${out}</g>`;
  });
  return out;
}
function universeRectAndLabel(layout){
  const {W,H} = layout;
  const m = 8;
  return `<rect x="${m}" y="${m}" width="${W-2*m}" height="${H-2*m}" fill="none" stroke="var(--ink-soft)" stroke-width="1.8" stroke-dasharray="5 4"/>
    <text x="${m+10}" y="${m+22}" font-size="15" font-weight="700" fill="var(--ink-soft)" font-family="Fraunces, serif">U</text>`;
}
function circleOutlinesAndLabels(layout){
  let svg = universeRectAndLabel(layout);
  layout.circles.forEach(c => {
    const rot = c.rot ? ` transform="rotate(${c.rot} ${c.cx} ${c.cy})"` : '';
    svg += `<ellipse cx="${c.cx}" cy="${c.cy}" rx="${c.rx}" ry="${c.ry}" fill="none" stroke="var(--ink-soft)" stroke-width="2.2"${rot}/>`;
  });
  const positions = {
    1: {A:[150,20]},
    2: {A:[95,40], B:[325,40]},
    3: {A:[130,25], B:[330,25], C:[230,368]},
    4: {A:[25,375], B:[370,30], C:[715,375], D:[370,720]}
  };
  const pos = positions[layout.circles.length];
  layout.circles.forEach(c => {
    const [x,y] = pos[c.label];
    svg += `<text x="${x}" y="${y}" font-size="20" font-weight="700" fill="var(--gold-bright)" font-family="Fraunces, serif" text-anchor="middle">${c.label}</text>`;
  });
  return svg;
}
// Determina la región (asignación booleana) bajo un punto del mouse, en coordenadas del viewBox
// (funciona igual para círculos que para elipses rotadas: un círculo es solo rx=ry, rot=0)
function regionAtPoint(svgEl, layout, evt){
  const pt = svgEl.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  const loc = pt.matrixTransform(svgEl.getScreenCTM().inverse());
  const assign = {};
  layout.circles.forEach(c => {
    const theta = (c.rot||0) * Math.PI/180;
    const dx = loc.x - c.cx, dy = loc.y - c.cy;
    const localX = dx*Math.cos(theta) + dy*Math.sin(theta);
    const localY = -dx*Math.sin(theta) + dy*Math.cos(theta);
    assign[c.label] = (localX*localX)/(c.rx*c.rx) + (localY*localY)/(c.ry*c.ry) <= 1;
  });
  return assign;
}
// Adjunta el resaltado de "fragmento bajo el cursor" a un <svg> ya insertado en el DOM
function attachHoverFragment(svgEl, layout, labels, color, prefix){
  const hoverLayer = svgEl.querySelector('.hoverLayer');
  if(!hoverLayer) return;
  svgEl.addEventListener('mousemove', (evt) => {
    const assign = regionAtPoint(svgEl, layout, evt);
    const rect = `<rect x="0" y="0" width="${layout.W}" height="${layout.H}" fill="${color}" fill-opacity="0.16"/>`;
    hoverLayer.innerHTML = nestedMaskGroup(assign, labels, rect, prefix);
  });
  svgEl.addEventListener('mouseleave', () => { hoverLayer.innerHTML = ''; });
}

/* ---------- Vista Diagrama: sombreado automático según la expresión ---------- */
function renderStaticVenn(containerEl, nSets, node){
  const layout = VENN_LAYOUTS[nSets];
  const labels = ['A','B','C','D'].slice(0, nSets);
  const regions = allRegions(nSets);
  const prefix = nextVennPrefix();
  let shaded = '';
  regions.forEach(assign => {
    const included = evaluate(node, assign);
    if(!included) return;
    const rect = `<rect x="0" y="0" width="${layout.W}" height="${layout.H}" fill="var(--gold)" fill-opacity="0.22"/>`;
    shaded += nestedMaskGroup(assign, labels, rect, prefix);
  });
  const svg = `<svg class="venn" viewBox="0 0 ${layout.W} ${layout.H}" width="${layout.W}" height="${layout.H}" xmlns="http://www.w3.org/2000/svg" style="cursor:crosshair;">
    <defs>${vennDefs(layout, prefix)}</defs>
    <g>${shaded}</g>
    <g class="hoverLayer"></g>
    ${circleOutlinesAndLabels(layout)}
  </svg>`;
  containerEl.innerHTML = svg;
  attachHoverFragment(containerEl.querySelector('svg.venn'), layout, labels, 'var(--cyan)', prefix);
}

/* ---------- Vista Juego: diagrama interactivo con regiones fragmentadas al pasar el mouse ---------- */
function renderInteractiveVenn(containerEl, nSets, onToggle){
  const layout = VENN_LAYOUTS[nSets];
  const labels = ['A','B','C','D'].slice(0, nSets);
  const regions = allRegions(nSets);
  const state = {};
  regions.forEach(assign => state[regionKey(assign,labels)] = false);

  function shadedLayerSVG(prefix){
    let shaded = '';
    regions.forEach(assign => {
      const key = regionKey(assign, labels);
      if(!state[key]) return;
      const rect = `<rect x="0" y="0" width="${layout.W}" height="${layout.H}" fill="var(--gold)" fill-opacity="0.22"/>`;
      shaded += nestedMaskGroup(assign, labels, rect, prefix);
    });
    return shaded;
  }

  function draw(){
    const prefix = nextVennPrefix();
    const svg = `<svg class="venn" viewBox="0 0 ${layout.W} ${layout.H}" width="${layout.W}" height="${layout.H}" xmlns="http://www.w3.org/2000/svg" style="cursor:pointer;">
      <defs>${vennDefs(layout, prefix)}</defs>
      <g id="shadedLayer">${shadedLayerSVG(prefix)}</g>
      <g class="hoverLayer"></g>
      ${circleOutlinesAndLabels(layout)}
    </svg>`;
    containerEl.innerHTML = svg;
    const svgEl = containerEl.querySelector('svg.venn');
    attachHoverFragment(svgEl, layout, labels, 'var(--cyan)', prefix);
    svgEl.addEventListener('click', (evt) => {
      const assign = regionAtPoint(svgEl, layout, evt);
      const key = regionKey(assign, labels);
      state[key] = !state[key];
      playClickSound(state[key]);
      draw();
      if(onToggle) onToggle(key, state[key]);
    });
  }
  draw();
  return { state, labels, regions, layout };
}

/* =========================================================
   ESTADO GLOBAL DE LA UI
   ========================================================= */
/* =========================================================
   SONIDO (Web Audio API, sin archivos externos)
   ========================================================= */
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freq, duration, type='sine', delay=0, gain=0.12){
  try{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + delay;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + duration + 0.02);
  }catch(e){ /* audio no disponible: se ignora silenciosamente */ }
}
function playClickSound(shaded){
  playTone(shaded ? 520 : 340, 0.09, 'triangle');
}
function playSuccessSound(){
  playTone(523.25, 0.14, 'sine', 0);     // C5
  playTone(659.25, 0.14, 'sine', 0.1);   // E5
  playTone(783.99, 0.22, 'sine', 0.2);   // G5
}
function playErrorSound(){
  playTone(220, 0.18, 'sawtooth', 0, 0.08);
  playTone(174.6, 0.28, 'sawtooth', 0.12, 0.08);
}

let currentAST = null;
let currentVars = [];
let gameController = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function renderKatexInto(el, latex){
  try{ window.katex.render(latex, el, {throwOnError:false, displayMode:false}); }
  catch(e){ el.textContent = latex; }
}

function parseAndRender(){
  const input = $('#formulaInput').value;
  const errorBox = $('#errorBox');
  errorBox.textContent = '';
  try{
    currentAST = parseFormula(input);
    currentVars = Array.from(getVars(currentAST)).sort();
    if(currentVars.length === 0) throw new Error('La expresión debe usar al menos un conjunto (letra mayúscula A, B o C).');
    if(currentVars.some(v => !['A','B','C','D'].includes(v))) throw new Error('Solo se admiten los conjuntos A, B, C y D en el diagrama de Venn.');
    if(currentVars.length > 4) throw new Error('El diagrama de Venn admite máximo 4 conjuntos.');

    renderKatexInto($('#katexRender'), toLatex(currentAST));
    $('#eqStatus').textContent = '✓';
    $('#eqStatus').className = 'eq-status ok';
    renderClassBadge();
    renderDiagramView();
    $('#footEq').textContent = toString(currentAST);
  }catch(e){
    errorBox.textContent = '⚠ ' + e.message;
    $('#eqStatus').textContent = '✕';
    $('#eqStatus').className = 'eq-status err';
    currentAST = null;
  }
}

function nSetsForVars(vars){
  // usamos el máximo entre variables detectadas y 2 (para siempre mostrar un diagrama útil de al menos 2 conjuntos)
  const maxLetterIndex = vars.reduce((acc,v) => Math.max(acc, 'ABCD'.indexOf(v)), -1);
  return Math.max(vars.length ? maxLetterIndex+1 : 2, 2, vars.length);
}

function renderClassBadge(){
  const nSets = nSetsForVars(currentVars);
  const labels = ['A','B','C','D'].slice(0,nSets);
  const regions = allRegions(nSets);
  const included = regions.filter(a => evaluate(currentAST, a));
  let tipo, color;
  if(included.length === 0){ tipo = 'Conjunto vacío (∅)'; color = 'var(--bad)'; }
  else if(included.length === regions.length){ tipo = 'Conjunto universal (U)'; color = 'var(--good)'; }
  else { tipo = 'Conjunto propio'; color = 'var(--gold-bright)'; }

  $('#classCard').innerHTML = `<div class="readout-grid">
    <div class="row"><span class="rk">Resultado</span><span class="rv" style="color:${color}">${tipo}</span></div>
    <div class="row"><span class="rk">Conjuntos usados</span><span class="rv">${currentVars.join(', ')}</span></div>
    <div class="row"><span class="rk">Regiones sombreadas</span><span class="rv">${included.length} / ${regions.length}</span></div>
  </div>`;
  $('#chipClass').innerHTML = `<span class="dot" style="background:${color};box-shadow:0 0 10px ${color}"></span> ${tipo}`;
  $('#chipVars').textContent = currentVars.length + (currentVars.length===1 ? ' conjunto' : ' conjuntos');
}

/* ---------- Vista Diagrama ---------- */
function renderDiagramView(){
  const nSets = nSetsForVars(currentVars);
  renderStaticVenn($('#diagramaContainer'), nSets, currentAST);
}

/* ---------- Vista Juego ---------- */
let gameTargetAST = null;
function renderGameView(){
  const input = $('#gameTargetInput').value;
  const errorBox = $('#gameErrorBox');
  errorBox.textContent = '';
  try{
    gameTargetAST = parseFormula(input);
    const vars = Array.from(getVars(gameTargetAST)).sort();
    if(vars.length === 0) throw new Error('Escribe al menos un conjunto (A, B, C o D).');
    if(vars.some(v => !['A','B','C','D'].includes(v))) throw new Error('Solo se admiten los conjuntos A, B, C y D.');
    if(vars.length > 4) throw new Error('Máximo 4 conjuntos.');
    $('#gameEqStatus').textContent = '✓';
    $('#gameEqStatus').className = 'eq-status ok';

    const nSets = nSetsForVars(vars);
    $('#gameTargetLabel').textContent = toString(gameTargetAST);
    $('#gameFeedback').innerHTML = '';
    const face = $('#gameFace');
    face.textContent = '🙂';
    face.className = 'game-face';
    gameController = renderInteractiveVenn($('#gameContainer'), nSets, () => {
      $('#gameFeedback').innerHTML = '';
    });
  }catch(e){
    errorBox.textContent = '⚠ ' + e.message;
    $('#gameEqStatus').textContent = '✕';
    $('#gameEqStatus').className = 'eq-status err';
    gameTargetAST = null;
  }
}
function checkGame(){
  if(!gameController || !gameTargetAST) return;
  const {state, labels, regions, layout} = gameController;
  const prefix = nextVennPrefix();
  let correct = 0;
  let overlay = '';
  regions.forEach(assign => {
    const key = regionKey(assign, labels);
    const shouldBeShaded = evaluate(gameTargetAST, assign);
    const userShaded = !!state[key];
    const match = shouldBeShaded === userShaded;
    if(match) correct++;
    // Solo remarcamos los errores en rojo. Los aciertos conservan el sombreado
    // dorado normal (si estaban sombreados) o quedan sin color (si correctamente
    // se dejaron sin sombrear) — así no se pinta todo el diagrama de un solo color.
    let rect = '';
    if(!match){
      rect = `<rect x="0" y="0" width="${layout.W}" height="${layout.H}" fill="var(--bad)" fill-opacity="0.26"/>`;
    } else if(userShaded){
      rect = `<rect x="0" y="0" width="${layout.W}" height="${layout.H}" fill="var(--gold)" fill-opacity="0.22"/>`;
    }
    if(rect) overlay += nestedMaskGroup(assign, labels, rect, prefix);
  });
  const svg = `<svg class="venn" viewBox="0 0 ${layout.W} ${layout.H}" width="${layout.W}" height="${layout.H}" xmlns="http://www.w3.org/2000/svg">
    <defs>${vennDefs(layout, prefix)}</defs>
    <g>${overlay}</g>
    ${circleOutlinesAndLabels(layout)}
  </svg>`;
  $('#gameContainer').innerHTML = svg;

  const total = regions.length;
  const allCorrect = correct === total;
  const face = $('#gameFace');
  if(allCorrect){
    face.textContent = '🤩';
    face.className = 'game-face win';
    playSuccessSound();
  } else {
    face.textContent = '😕';
    face.className = 'game-face oops';
    playErrorSound();
  }
  $('#gameFeedback').innerHTML = `<div class="feedback-row" style="color:${allCorrect?'var(--good)':'var(--bad)'}">
    ${allCorrect ? '✓ ¡Correcto! Todas las regiones coinciden.' : `✕ ${correct}/${total} regiones correctas — lo marcado en rojo está mal.`}
  </div>`;
}
function resetGame(){ renderGameView(); }

/* ---------- Vista Comparar equivalencias ---------- */
function renderCompareView(){
  const errA = document.getElementById('compareErrA');
  try{
    const astA = parseFormula($('#compareA').value);
    const varsA = Array.from(getVars(astA)).sort();
    const nA = nSetsForVars(varsA);
    renderStaticVenn($('#compareContainerA'), nA, astA);

    const astB = parseFormula($('#compareB').value);
    const varsB = Array.from(getVars(astB)).sort();
    const nB = nSetsForVars(varsB);
    renderStaticVenn($('#compareContainerB'), nB, astB);

    const eq = equivalent(astA, astB);
    $('#compareVerdict').innerHTML = `<div class="verdict ${eq?'eq':'neq'}">${eq
      ? '✓ Las dos expresiones son equivalentes: sombrean exactamente las mismas regiones para toda combinación de pertenencia.'
      : '✕ No son equivalentes: existe al menos una combinación de pertenencia donde difieren.'}</div>`;
  }catch(e){
    $('#compareVerdict').innerHTML = `<div class="verdict neq">⚠ ${e.message}</div>`;
  }
}

/* =========================================================
   GALERÍA DE IDENTIDADES Y SELECTOR DE VISTAS
   ========================================================= */
const SET_IDENTITY_CATEGORIES = [
  {
    title: 'Operaciones básicas',
    items: [
      {name:'Unión', formula:'A ∪ B'},
      {name:'Intersección', formula:'A ∩ B'},
      {name:'Complemento', formula:"A'"},
      {name:'Diferencia', formula:'A − B'},
      {name:'Diferencia simétrica', formula:'A △ B'},
    ]
  },
  {
    title: 'Identidades (De Morgan y más)',
    items: [
      {name:'De Morgan (∪)', formula:"(A ∪ B)'"},
      {name:'De Morgan (∩)', formula:"(A ∩ B)'"},
      {name:'Diferencia = intersección con complemento', formula:"A ∩ B'"},
      {name:'Distributividad', formula:'A ∩ (B ∪ C)'},
      {name:'Intersección triple', formula:'A ∩ B ∩ C'},
      {name:'Unión triple', formula:'A ∪ B ∪ C'},
      {name:'Solo en A (ni B ni C)', formula:"A ∩ B' ∩ C'"},
      {name:'Exactamente uno de tres', formula:"(A ∩ B' ∩ C') ∪ (A' ∩ B ∩ C') ∪ (A' ∩ B' ∩ C)"},
    ]
  },
  {
    title: '4 conjuntos',
    items: [
      {name:'Intersección de los cuatro', formula:'A ∩ B ∩ C ∩ D'},
      {name:'Unión de los cuatro', formula:'A ∪ B ∪ C ∪ D'},
      {name:'De Morgan generalizada (4)', formula:"(A ∪ B ∪ C ∪ D)' "},
      {name:'Solo en A (ningún otro)', formula:"A ∩ B' ∩ C' ∩ D'"},
      {name:'Distributividad (4)', formula:'A ∩ (B ∪ C ∪ D)'},
    ]
  }
];

function renderPresets(){
  const html = SET_IDENTITY_CATEGORIES.map(cat => `
    <div class="section-h" style="margin-top:6px;">${cat.title}</div>
    <div class="presets">
      ${cat.items.map(p => `<div class="preset" data-formula="${encodeURIComponent(p.formula)}">
        <div><div class="pname">${p.name}</div><div class="pmath">${p.formula}</div></div>
      </div>`).join('')}
    </div>
  `).join('');
  $('#presets').innerHTML = html;
  $$('#presets .preset').forEach(el => {
    el.addEventListener('click', () => {
      $('#formulaInput').value = decodeURIComponent(el.dataset.formula);
      parseAndRender();
    });
  });
}

const VIEW_HINTS = {
  diagrama: 'El diagrama se sombrea automáticamente según la expresión. La tabla de abajo muestra la pertenencia región por región.',
  juego: 'Haz clic en las regiones para sombrear la expresión indicada, luego pulsa Comprobar.',
  comparar: 'Escribe dos expresiones y compara si sombrean exactamente las mismas regiones.'
};
function switchView(view){
  $$('#viewSelector .preset').forEach(p => p.classList.toggle('active', p.dataset.view === view));
  $$('.stage-view').forEach(v => v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $('#stageHint').textContent = VIEW_HINTS[view];
  if(view === 'comparar') renderCompareView();
}

/* =========================================================
   WIRING DE EVENTOS
   ========================================================= */
const TARGET_HANDLERS = {
  formulaInput: parseAndRender,
  gameTargetInput: renderGameView,
  compareA: renderCompareView,
  compareB: renderCompareView
};
document.addEventListener('DOMContentLoaded', () => {
  $('#formulaInput').addEventListener('input', parseAndRender);
  $('#gameTargetInput').addEventListener('input', renderGameView);
  $$('.symbols button').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.closest('.symbols').dataset.target || 'formulaInput';
      const input = document.getElementById(targetId);
      const pos = input.selectionStart || input.value.length;
      const ins = btn.dataset.ins;
      input.value = input.value.slice(0,pos) + ins + input.value.slice(pos);
      input.focus();
      input.selectionStart = input.selectionEnd = pos + ins.length;
      (TARGET_HANDLERS[targetId] || parseAndRender)();
    });
  });
  $$('#viewSelector .preset').forEach(p => p.addEventListener('click', () => switchView(p.dataset.view)));
  $('#btnCheck').addEventListener('click', checkGame);
  $('#btnReset').addEventListener('click', resetGame);
  $('#compareA').addEventListener('input', renderCompareView);
  $('#compareB').addEventListener('input', renderCompareView);

  renderPresets();
  parseAndRender();
  renderGameView();
});
