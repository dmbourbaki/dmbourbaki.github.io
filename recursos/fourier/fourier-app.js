/* ============================================================
   Simulador de Series de Fourier
   f(t) = f(t+T), Sn(t) = a0/2 + sum_{k=1}^{n} [ak*cos(k*w0*t) + bk*sin(k*w0*t)]
   Motor: coeficientes cerrados para funciones clásicas + integración
   numérica (Simpson) para funciones personalizadas definidas por el usuario.
   Parser de expresiones propio (sin eval/Function) por seguridad.

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
function fmt(x, d=4){
  if (!isFinite(x)) return '—';
  const r = Math.round(x*Math.pow(10,d))/Math.pow(10,d);
  return Object.is(r,-0) ? '0' : String(r);
}

/* ============================================================
   1.  PARSER SEGURO DE EXPRESIONES (sin eval/Function)
   Soporta: + - * / ^, paréntesis, número, variable t, funciones
   sin cos tan abs sqrt exp log, constantes pi/e, unario -.
   ============================================================ */
function tokenize(src){
  const toks = [];
  let i = 0;
  const isDigit = c => c>='0' && c<='9';
  const isAlpha = c => /[a-zA-Z_]/.test(c);
  while (i < src.length){
    const c = src[i];
    if (c===' '||c==='\t'||c==='\n'){ i++; continue; }
    if (isDigit(c) || (c==='.' && isDigit(src[i+1]))){
      let j=i; while (j<src.length && (isDigit(src[j])||src[j]==='.')) j++;
      toks.push({ t:'num', v:parseFloat(src.slice(i,j)) }); i=j; continue;
    }
    if (isAlpha(c)){
      let j=i; while (j<src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      toks.push({ t:'id', v:src.slice(i,j) }); i=j; continue;
    }
    if ('+-*/^(),'.includes(c)){ toks.push({ t:c }); i++; continue; }
    throw new Error(`Carácter no reconocido: "${c}"`);
  }
  return toks;
}

const FUNCS1 = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp,
  log: Math.log, sign: Math.sign,
  asin: Math.asin, acos: Math.acos, atan: Math.atan
};
const CONSTS = { pi: Math.PI, e: Math.E };

/* Parser recursivo-descendente con precedencia: suma/resta, luego multiplicación/división,
   luego unario, luego potencia (asociativa a la derecha), luego átomos (número, variable,
   función, paréntesis). */
function parseExpr(tokens){
  let pos = 0;
  function peek(){ return tokens[pos]; }
  function eat(type){
    const tk = tokens[pos];
    if (!tk || (type && tk.t!==type)) throw new Error(`Se esperaba "${type}"`);
    pos++; return tk;
  }
  function parseAddSub(){
    let node = parseMulDiv();
    while (peek() && (peek().t==='+'||peek().t==='-')){
      const op = eat().t;
      const rhs = parseMulDiv();
      node = { op, l:node, r:rhs };
    }
    return node;
  }
  function parseMulDiv(){
    let node = parseUnary();
    while (peek() && (peek().t==='*'||peek().t==='/')){
      const op = eat().t;
      const rhs = parseUnary();
      node = { op, l:node, r:rhs };
    }
    return node;
  }
  function parseUnary(){
    if (peek() && peek().t==='-'){ eat(); return { op:'neg', l:parseUnary() }; }
    if (peek() && peek().t==='+'){ eat(); return parseUnary(); }
    return parsePow();
  }
  function parsePow(){
    let node = parseAtom();
    if (peek() && peek().t==='^'){
      eat();
      const rhs = parseUnary(); // permite 2^-1 y exponentes anidados a la derecha
      node = { op:'^', l:node, r:rhs };
    }
    return node;
  }
  function parseAtom(){
    const tk = peek();
    if (!tk) throw new Error('Expresión incompleta');
    if (tk.t==='num'){ eat(); return { op:'num', v:tk.v }; }
    if (tk.t==='('){ eat(); const n = parseAddSub(); eat(')'); return n; }
    if (tk.t==='id'){
      eat();
      const name = tk.v.toLowerCase();
      if (peek() && peek().t==='('){
        eat();
        const arg = parseAddSub();
        eat(')');
        if (!(name in FUNCS1)) throw new Error(`Función desconocida: ${name}`);
        return { op:'func', name, arg };
      }
      if (name==='t') return { op:'var' };
      if (name in CONSTS) return { op:'num', v:CONSTS[name] };
      throw new Error(`Identificador desconocido: ${name}`);
    }
    throw new Error('Token inesperado en la expresión');
  }
  const tree = parseAddSub();
  if (pos !== tokens.length) throw new Error('Caracteres sobrantes en la expresión');
  return tree;
}

function evalNode(node, tVal){
  switch(node.op){
    case 'num': return node.v;
    case 'var': return tVal;
    case 'neg': return -evalNode(node.l, tVal);
    case '+': return evalNode(node.l,tVal) + evalNode(node.r,tVal);
    case '-': return evalNode(node.l,tVal) - evalNode(node.r,tVal);
    case '*': return evalNode(node.l,tVal) * evalNode(node.r,tVal);
    case '/': return evalNode(node.l,tVal) / evalNode(node.r,tVal);
    case '^': return Math.pow(evalNode(node.l,tVal), evalNode(node.r,tVal));
    case 'func': return FUNCS1[node.name](evalNode(node.arg,tVal));
    default: throw new Error('Nodo desconocido');
  }
}

/* Compila una cadena a una función JS (t)=>number. Lanza Error si la sintaxis es inválida. */
function compileExpr(src){
  const tokens = tokenize(src);
  const tree = parseExpr(tokens);
  // valida con un par de evaluaciones de prueba
  evalNode(tree, 0.37);
  evalNode(tree, 1.0);
  return t => {
    const v = evalNode(tree, t);
    return isFinite(v) ? v : 0;
  };
}

/* ============================================================
   2.  GALERÍA DE FUNCIONES CLÁSICAS (coeficientes cerrados)
   Cada entrada define f(t) en [0,T) y, cuando se conoce la fórmula
   cerrada, una función closedCoeffs(n,T)->{an,bn}. Si no se provee,
   el motor usa integración numérica automáticamente.
   ============================================================ */
const GALLERY = {
  square: {
    name: 'Onda cuadrada', icon:'square',
    fEval: (t,T) => { const tm=((t%T)+T)%T; return tm < T/2 ? 1 : -1; },
    closedA0: () => 0,
    exactA0HalfLatex: '0',
    closedCoeffs: (n) => ({ an:0, bn: 2*(1-Math.pow(-1,n))/(n*Math.PI) }),
    exactLatex: (n) => ({
      anTex: '0',
      bnTex: n%2===0 ? '0' : `\\dfrac{4}{${n>1?n+'\\,':''}\\pi}`
    }),
    generalFormula: {
      an: '0',
      bn: `\\begin{cases} \\dfrac{4}{n\\pi} & n \\text{ impar} \\\\[4pt] 0 & n \\text{ par} \\end{cases}`
    },
    discontinuous: true
  },
  sawtooth: {
    name: 'Diente de sierra', icon:'sawtooth',
    fEval: (t,T) => { const tm=((t%T)+T)%T; return 2*(tm/T) - 1; }, // rampa de -1 (t=0) a +1 (t=T)
    closedA0: () => 0,
    exactA0HalfLatex: '0',
    closedCoeffs: (n) => ({ an:0, bn: -2/(n*Math.PI) }),
    exactLatex: (n) => ({
      anTex: '0',
      bnTex: `-\\dfrac{2}{${n>1?n+'\\,':''}\\pi}`
    }),
    generalFormula: {
      an: '0',
      bn: `-\\dfrac{2}{n\\pi}`
    },
    discontinuous: true
  },
  triangle: {
    name: 'Triangular', icon:'triangle',
    fEval: (t,T) => { const tm=((t%T)+T)%T; const x = tm/T; return x<0.5 ? (4*x-1) : (3-4*x); }, // -1..1..-1
    closedA0: () => 0,
    exactA0HalfLatex: '0',
    closedCoeffs: (n) => ({ an: 4*(Math.pow(-1,n)-1)/(Math.PI*Math.PI*n*n), bn: 0 }),
    exactLatex: (n) => ({
      anTex: n%2===0 ? '0' : `-\\dfrac{8}{${n>1?n+'^2\\,':''}\\pi^2}`,
      bnTex: '0'
    }),
    generalFormula: {
      an: `\\begin{cases} -\\dfrac{8}{n^2\\pi^2} & n \\text{ impar} \\\\[4pt] 0 & n \\text{ par} \\end{cases}`,
      bn: '0'
    },
    discontinuous: false
  },
  pulse: {
    name: 'Pulso rectangular', icon:'pulse',
    // centrado en t=0 dentro de (-T/2,T/2] para que la fórmula cerrada clásica (par, solo an) aplique directo
    fEval: (t,T) => { let tm=((t%T)+T)%T; if (tm > T/2) tm -= T; return Math.abs(tm) < T/4 ? 1 : 0; },
    closedA0: () => 1,
    exactA0HalfLatex: '\\dfrac{1}{2}',
    closedCoeffs: (n) => ({ an: 2*Math.sin(n*Math.PI/2)/(n*Math.PI), bn: 0 }),
    exactLatex: (n) => ({
      anTex: `\\dfrac{2\\sin\\!\\left(${n>1?n+'\\,':''}\\pi/2\\right)}{${n>1?n+'\\,':''}\\pi}`,
      bnTex: '0'
    }),
    generalFormula: {
      an: `\\dfrac{2\\sin(n\\pi/2)}{n\\pi}`,
      bn: '0'
    },
    discontinuous: true
  },
  halfsine: {
    name: 'Semi-rectificada', icon:'halfsine',
    fEval: (t,T) => { const tm=((t%T)+T)%T; const w0=2*Math.PI/T; return tm < T/2 ? Math.sin(w0*tm) : 0; },
    closedA0: () => 2/Math.PI,
    exactA0HalfLatex: '\\dfrac{1}{\\pi}',
    closedCoeffs: (n) => {
      if (n===1) return { an:0, bn:0.5 };
      return { an: (Math.pow(-1,n+1)-1)/(Math.PI*(n*n-1)), bn:0 };
    },
    exactLatex: (n) => {
      if (n===1) return { anTex:'0', bnTex:'\\dfrac{1}{2}' };
      return {
        anTex: n%2!==0 ? '0' : `-\\dfrac{2}{\\pi\\left(${n}^2-1\\right)}`,
        bnTex: '0'
      };
    },
    generalFormula: {
      an: `\\begin{cases} 0 & n=1 \\\\[4pt] -\\dfrac{2}{\\pi(n^2-1)} & n \\text{ par} \\\\[4pt] 0 & n \\text{ impar},\\ n>1 \\end{cases}`,
      bn: `\\begin{cases} \\dfrac{1}{2} & n=1 \\\\[4pt] 0 & n>1 \\end{cases}`
    },
    discontinuous: false
  }
};

/* ============================================================
   3.  CÁLCULO DE COEFICIENTES — cerrado si existe, si no Simpson
   ============================================================ */
function simpsonIntegral(f, a, b, N){
  if (N % 2 === 1) N++; // Simpson requiere N par
  const h = (b-a)/N;
  let sum = f(a) + f(b);
  for (let i=1;i<N;i++){
    const x = a + i*h;
    sum += f(x) * (i%2===0 ? 2 : 4);
  }
  return sum*h/3;
}

function computeCoeffs(fEval, T, Nmax){
  const w0 = 2*Math.PI/T;
  const NPTS = 1200;
  const a0 = (2/T)*simpsonIntegral(t=>fEval(t), 0, T, NPTS);
  const ans = [], bns = [];
  for (let n=1;n<=Nmax;n++){
    const an = (2/T)*simpsonIntegral(t=>fEval(t)*Math.cos(n*w0*t), 0, T, NPTS);
    const bn = (2/T)*simpsonIntegral(t=>fEval(t)*Math.sin(n*w0*t), 0, T, NPTS);
    ans.push(an); bns.push(bn);
  }
  return { a0, ans, bns };
}

function getCoeffsForSource(source, T, Nmax){
  if (source.closedCoeffs){
    const a0 = source.closedA0 ? source.closedA0(T) : 0;
    const ans=[], bns=[];
    for (let n=1;n<=Nmax;n++){
      const c = source.closedCoeffs(n,T);
      ans.push(c.an); bns.push(c.bn);
    }
    return { a0, ans, bns };
  }
  return computeCoeffs(t=>source.fEval(t,T), T, Nmax);
}

function partialSum(a0, ans, bns, N, w0, t){
  let s = a0/2;
  for (let n=1;n<=N;n++){
    s += ans[n-1]*Math.cos(n*w0*t) + bns[n-1]*Math.sin(n*w0*t);
  }
  return s;
}

/* ============================================================
   4.  GENERACIÓN DE LATEX (expandida, trigonométrica compacta, compleja compacta)
   ============================================================ */
const ZERO_EPS = 1e-4;

function fmtCoef(x){
  return fmt(Math.abs(x), 4);
}

/* Construye un único término DECIMAL con signo explícito; null si el coeficiente es ~0 */
function buildTermDecimal(coef, trigName, n){
  if (Math.abs(coef) < ZERO_EPS) return null;
  const sign = coef >= 0 ? '+' : '-';
  const mag = fmtCoef(coef);
  const arg = n > 1 ? `${n}\\omega_0 t` : `\\omega_0 t`;
  return `${sign}\\ ${mag}\\,${trigName}(${arg})`;
}

/* Construye un único término EXACTO (fracción con pi/raíces) a partir del LaTeX
   crudo de exactLatex (sin signo: ya viene como "0", "4/pi", etc.) */
function buildTermExact(rawTex, coefForSign, trigName, n){
  if (rawTex === '0' || Math.abs(coefForSign) < ZERO_EPS) return null;
  // rawTex puede ya incluir un signo negativo al frente (p.ej. "-\dfrac{2}{\pi}")
  let body = rawTex, sign = '+';
  if (body.startsWith('-')){ sign = '-'; body = body.slice(1); }
  const arg = n > 1 ? `${n}\\omega_0 t` : `\\omega_0 t`;
  return `${sign}\\ ${body}\\,${trigName}(${arg})`;
}

/* Devuelve un ARREGLO de piezas LaTeX independientes (no una sola cadena con
   saltos de línea manuales). El primer elemento es "S_N(t) = <a0/2>"; el resto
   son los términos con su signo. El salto de línea lo decide el navegador al
   renderizar cada pieza como un span independiente en flujo (ver renderTermFlow). */
function expandedTermsDecimal(a0, ans, bns, N){
  const pieces = [`S_{${N}}(t) =\\ \\dfrac{${fmtCoef(a0)}}{2}`];
  for (let n=1; n<=N; n++){
    const ta = buildTermDecimal(ans[n-1], '\\cos', n);
    const tb = buildTermDecimal(bns[n-1], '\\sin', n);
    if (ta) pieces.push(ta);
    if (tb) pieces.push(tb);
  }
  return pieces;
}

/* Igual que la anterior pero en forma exacta (fracciones con pi); requiere que
   la fuente sea de la galería y provea exactLatex(n). */
function expandedTermsExact(a0HalfTex, ans, bns, N, exactLatexFn){
  const pieces = [`S_{${N}}(t) =\\ ${a0HalfTex}`];
  for (let n=1; n<=N; n++){
    const e = exactLatexFn(n);
    const ta = buildTermExact(e.anTex, ans[n-1], '\\cos', n);
    const tb = buildTermExact(e.bnTex, bns[n-1], '\\sin', n);
    if (ta) pieces.push(ta);
    if (tb) pieces.push(tb);
  }
  return pieces;
}

/* Renderiza un arreglo de piezas LaTeX como spans independientes en flujo
   horizontal dentro de `container`; el navegador decide el salto de línea
   según el ancho real disponible (no se precalcula). */
function renderTermFlow(container, pieces){
  container.innerHTML = '';
  container.classList.add('term-flow');
  pieces.forEach(tex=>{
    const span = document.createElement('span');
    span.className = 'term-piece';
    try { katex.render(tex, span, { throwOnError:false, displayMode:false }); }
    catch(e){ span.textContent = tex; }
    container.appendChild(span);
  });
}

function trigLatex(N){
  if (N === 0) return `S_0(t) = \\dfrac{a_0}{2}`;
  return `S_{${N}}(t) = \\dfrac{a_0}{2} + \\sum_{n=1}^{${N}} \\left[ a_n\\cos(n\\omega_0 t) + b_n\\sin(n\\omega_0 t) \\right]`;
}
function complexLatex(N){
  if (N === 0) return `S_0(t) = c_0`;
  return `S_{${N}}(t) = \\sum_{n=-${N}}^{${N}} c_n\\, e^{i n \\omega_0 t} \\qquad c_n = \\dfrac{a_n - i b_n}{2}`;
}

/* Muestra, debajo de la forma compacta trigonométrica, la fórmula general de
   a_n y b_n en función de n — solo cuando la fuente (galería) la define.
   Para una función personalizada no hay fórmula cerrada que mostrar. */
function renderTrigWhere(source){
  const el = $('eqTrigWhere');
  const hasGeneral = state.sourceKey !== 'custom' && source.generalFormula;
  if (!hasGeneral){
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `
    <div class="where-item"><span id="whereAn"></span></div>
    <div class="where-item"><span id="whereBn"></span></div>
  `;
  try { katex.render(`a_n = ${source.generalFormula.an}`, $('whereAn'), { throwOnError:false, displayMode:false }); } catch(e){}
  try { katex.render(`b_n = ${source.generalFormula.bn}`, $('whereBn'), { throwOnError:false, displayMode:false }); } catch(e){}
}


/* ============================================================
   5.  ESTADO GLOBAL
   ============================================================ */
const state = {
  sourceKey: 'square',   // clave en GALLERY, o 'custom'
  customFn: null,        // función compilada (t)=>number, válida solo en [0,T)
  customRaw: 't',
  T: 2*Math.PI,
  N: 5,
  Nmax: 40,
  show: { target:true, harmonics:true, gibbs:true, grid:true },
  playing: false,
  speed: 'normal'
};

const SPEED_MS = { slow: 420, normal: 220, fast: 90 };

function currentSource(){
  if (state.sourceKey === 'custom'){
    return {
      name: 'Personalizada',
      fEval: (t,T) => { const tm=((t%T)+T)%T; try{ return state.customFn(tm); } catch(e){ return 0; } },
      closedCoeffs: null
    };
  }
  return GALLERY[state.sourceKey];
}

/* ============================================================
   6.  VIEWPORT GENÉRICO (zoom + pan) — mismo patrón validado
   ============================================================ */
function makeViewport(defaultView){
  let view = { ...defaultView };
  function reset(){ view = { ...defaultView }; }
  function zoomAt(factor, px, py, W, H){
    const wx = view.xmin + (px/W)*(view.xmax-view.xmin);
    const wy = view.ymax - (py/H)*(view.ymax-view.ymin);
    const newW = (view.xmax-view.xmin)*factor;
    const newH = (view.ymax-view.ymin)*factor;
    view.xmin = wx - (px/W)*newW;
    view.xmax = view.xmin + newW;
    view.ymax = wy + (py/H)*newH;
    view.ymin = view.ymax - newH;
  }
  function pan(dxPix, dyPix, W, H){
    const wPerPix = (view.xmax-view.xmin)/W;
    const hPerPix = (view.ymax-view.ymin)/H;
    view.xmin -= dxPix*wPerPix; view.xmax -= dxPix*wPerPix;
    view.ymin += dyPix*hPerPix; view.ymax += dyPix*hPerPix;
  }
  return { get:()=>view, reset, zoomAt, pan };
}

function attachPanZoom(host, viewport, onChange){
  let dragging = false, lastX=0, lastY=0;
  host.addEventListener('wheel', e=>{
    e.preventDefault();
    const r = host.getBoundingClientRect();
    const px = e.clientX-r.left, py = e.clientY-r.top;
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    viewport.zoomAt(factor, px, py, r.width, r.height);
    onChange();
  }, { passive:false });

  host.addEventListener('mousedown', e=>{
    dragging = true; lastX=e.clientX; lastY=e.clientY;
    host.classList.add('grabbing');
  });
  window.addEventListener('mousemove', e=>{
    if (!dragging) return;
    const r = host.getBoundingClientRect();
    viewport.pan(e.clientX-lastX, e.clientY-lastY, r.width, r.height);
    lastX=e.clientX; lastY=e.clientY;
    onChange();
  });
  window.addEventListener('mouseup', ()=>{ dragging=false; host.classList.remove('grabbing'); });

  let touchLast = null;
  host.addEventListener('touchstart', e=>{
    if (e.touches.length===1){ touchLast = { x:e.touches[0].clientX, y:e.touches[0].clientY }; }
  }, { passive:true });
  host.addEventListener('touchmove', e=>{
    if (e.touches.length===1 && touchLast){
      const r = host.getBoundingClientRect();
      const t = e.touches[0];
      viewport.pan(t.clientX-touchLast.x, t.clientY-touchLast.y, r.width, r.height);
      touchLast = { x:t.clientX, y:t.clientY };
      onChange();
    }
  }, { passive:true });
  host.addEventListener('touchend', ()=>{ touchLast=null; });
}

function niceStep(range){
  if (!isFinite(range) || range<=0) return 1;
  const raw = range/8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw/mag;
  let step;
  if (norm<1.5) step=1; else if (norm<3.5) step=2; else if (norm<7.5) step=5; else step=10;
  return step*mag;
}

/* ============================================================
   7.  CANVAS PRINCIPAL — f(t) objetivo vs S_N(t)
   ============================================================ */
function makeMainCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;
  let lastData=null;

  const defaultView = ()=>({ xmin:-state.T, xmax:state.T*2, ymin:-1.4, ymax:1.4 });
  const viewport = makeViewport(defaultView());

  function resize(){
    DPR = Math.min(window.devicePixelRatio||1, 2);
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W*DPR);
    canvas.height = Math.round(H*DPR);
    canvas.style.width = W+'px';
    canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    if (lastData) draw(lastData);
  }

  function autoFit(fEval, T){
    const N = 500;
    let ymin=Infinity, ymax=-Infinity;
    for (let i=0;i<=N;i++){
      const t = -T + (3*T)*i/N;
      const y = fEval(t);
      if (isFinite(y)){ if(y<ymin)ymin=y; if(y>ymax)ymax=y; }
    }
    if (!isFinite(ymin)||!isFinite(ymax)||ymin===ymax){ ymin=-1; ymax=1; }
    const pad = (ymax-ymin)*0.22 || 1;
    viewport.reset();
    const v = viewport.get();
    v.xmin=-T; v.xmax=2*T; v.ymin=ymin-pad; v.ymax=ymax+pad;
  }

  function draw(data){
    lastData = data;
    if (!W || !H) return;
    const { fEval, a0, ans, bns, N, T, gibbsInfo } = data;
    const w0 = 2*Math.PI/T;
    ctx.clearRect(0,0,W,H);
    const v = viewport.get();
    const x2sx = x => ((x-v.xmin)/(v.xmax-v.xmin))*W;
    const y2sy = y => H - ((y-v.ymin)/(v.ymax-v.ymin))*H;

    if (state.show.grid){
      ctx.save();
      ctx.strokeStyle = 'rgba(120,150,200,0.07)';
      ctx.lineWidth = 1;
      const stepX = niceStep(v.xmax-v.xmin);
      const stepY = niceStep(v.ymax-v.ymin);
      ctx.beginPath();
      for (let x=Math.ceil(v.xmin/stepX)*stepX; x<=v.xmax; x+=stepX){ const sx=x2sx(x); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){ const sy=y2sy(y); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.stroke();
      ctx.restore();

      // marcas de periodo (líneas verticales en múltiplos de T)
      ctx.save();
      ctx.strokeStyle = 'rgba(242,180,23,0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4,5]);
      const kStart = Math.ceil(v.xmin/T), kEnd = Math.floor(v.xmax/T);
      for (let k=kStart;k<=kEnd;k++){ const sx=x2sx(k*T); ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(159,176,208,0.4)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      if (v.ymin<0 && v.ymax>0){ const sy=y2sy(0); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      if (v.xmin<0 && v.xmax>0){ const sx=x2sx(0); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      ctx.stroke();
      ctx.fillStyle='rgba(159,176,208,0.65)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      for (let x=Math.ceil(v.xmin/stepX)*stepX; x<=v.xmax; x+=stepX){ ctx.fillText(fmt(x,1), x2sx(x)+3, H-6); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){
        if (Math.abs(y)<1e-9) continue;
        ctx.fillText(fmt(y,1), 5, y2sy(y)-4);
      }
      ctx.restore();
    }

    const NSAMPLES = 900;
    // f(t) objetivo
    if (state.show.target){
      ctx.save();
      ctx.strokeStyle = '#7d8cab';
      ctx.lineWidth = 2;
      ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.beginPath();
      let started=false, prevY=null;
      for (let i=0;i<=NSAMPLES;i++){
        const x = v.xmin + (v.xmax-v.xmin)*i/NSAMPLES;
        const y = fEval(x);
        if (!isFinite(y)){ started=false; continue; }
        // detectar salto grande (discontinuidad) para no dibujar línea diagonal falsa
        if (prevY!==null && Math.abs(y-prevY) > (v.ymax-v.ymin)*0.6){ started=false; }
        const sx=x2sx(x), sy=y2sy(y);
        if (!started){ ctx.moveTo(sx,sy); started=true; } else ctx.lineTo(sx,sy);
        prevY = y;
      }
      ctx.stroke();
      ctx.restore();
    }

    // S_N(t) suma parcial
    ctx.save();
    ctx.strokeStyle = '#34d6e8';
    ctx.lineWidth = 2.6;
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.shadowColor = '#34d6e8'; ctx.shadowBlur = 7;
    ctx.beginPath();
    for (let i=0;i<=NSAMPLES;i++){
      const x = v.xmin + (v.xmax-v.xmin)*i/NSAMPLES;
      const y = partialSum(a0, ans, bns, N, w0, x);
      const sx=x2sx(x), sy=y2sy(y);
      i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
    }
    ctx.stroke();
    ctx.restore();

    // marcar overshoot de Gibbs si aplica y está en vista
    if (state.show.gibbs && gibbsInfo && gibbsInfo.active){
      gibbsInfo.points.forEach(p=>{
        if (p.x < v.xmin || p.x > v.xmax) return;
        ctx.save();
        ctx.fillStyle = '#ff5d8f';
        ctx.beginPath();
        ctx.arc(x2sx(p.x), y2sy(p.y), 4, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
    }
  }

  attachPanZoom(host, viewport, ()=>{ if (lastData) draw(lastData); });
  return { resize, draw, autoFit, viewport };
}

/* ============================================================
   8.  CANVAS DE ARMÓNICOS INDIVIDUALES
   ============================================================ */
const HARMONIC_COLORS = ['#34d6e8','#ff9a3c','#9b7dff','#4fd98a','#ff5d8f','#ffd24a','#5fa8ff','#e879f9'];

function makeHarmCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;
  let lastData=null;

  function resize(){
    DPR = Math.min(window.devicePixelRatio||1, 2);
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W*DPR);
    canvas.height = Math.round(H*DPR);
    canvas.style.width = W+'px';
    canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    if (lastData) draw(lastData);
  }

  function draw(data){
    lastData = data;
    if (!W || !H) return;
    const { a0, ans, bns, N, T } = data;
    const w0 = 2*Math.PI/T;
    ctx.clearRect(0,0,W,H);

    const xmin=0, xmax=T;
    // amplitud máxima posible para escalar verticalmente
    let amax = Math.abs(a0/2);
    for (let n=1;n<=Math.min(N,state.Nmax);n++){
      amax = Math.max(amax, Math.hypot(ans[n-1],bns[n-1]));
    }
    if (amax < 1e-6) amax = 1;
    const x2sx = x => ((x-xmin)/(xmax-xmin))*W;
    const y2sy = y => H/2 - (y/(amax*1.25))*(H/2);

    // eje cero
    ctx.save();
    ctx.strokeStyle='rgba(159,176,208,0.3)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
    ctx.restore();

    if (!state.show.harmonics || N===0){
      ctx.save();
      ctx.fillStyle='rgba(159,176,208,0.5)'; ctx.font='12px "Inter Tight"';
      ctx.fillText(N===0 ? 'N = 0: solo el término constante a₀/2' : 'Activa "Armónicos" para verlos', 14, H/2-8);
      ctx.restore();
      return;
    }

    const NSAMPLES = 400;
    const visibleN = Math.min(N, 8); // limitar densidad visual a 8 armónicos coloreados distintos
    for (let n=1; n<=visibleN; n++){
      const color = HARMONIC_COLORS[(n-1)%HARMONIC_COLORS.length];
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let i=0;i<=NSAMPLES;i++){
        const x = xmin + (xmax-xmin)*i/NSAMPLES;
        const y = ans[n-1]*Math.cos(n*w0*x) + bns[n-1]*Math.sin(n*w0*x);
        const sx=x2sx(x), sy=y2sy(y);
        i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
      }
      ctx.stroke();
      ctx.restore();
    }
    if (N > visibleN){
      ctx.save();
      ctx.fillStyle='rgba(159,176,208,0.6)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      ctx.fillText(`+ ${N-visibleN} armónicos más (no se colorean individualmente)`, 12, 16);
      ctx.restore();
    }
  }

  return { resize, draw };
}

/* ============================================================
   9.  DETECCIÓN DEL FENÓMENO DE GIBBS
   Si la fuente es discontinua, marca los puntos donde la suma
   parcial sobrepasa (~9%) el valor de la función cerca del salto.
   ============================================================ */
function detectGibbs(fEval, a0, ans, bns, N, T, isDiscontinuous){
  if (!isDiscontinuous || N < 3) return { active:false, points:[] };
  const w0 = 2*Math.PI/T;
  // localizar saltos por diferencia grande entre muestras consecutivas
  const NS = 800;
  const ts = []; for (let i=0;i<NS;i++) ts.push(T*i/NS);
  const vals = ts.map(fEval);
  const range = Math.max(...vals) - Math.min(...vals) || 1;
  const jumps = [];
  for (let i=0;i<NS;i++){
    const j = (i+1)%NS;
    if (Math.abs(vals[j]-vals[i]) > range*0.5) jumps.push(ts[i]);
  }
  if (jumps.length===0) return { active:false, points:[] };

  const points = [];
  jumps.forEach(t0=>{
    // buscar el extremo (máx o mín) de Sn cerca del salto, en una ventana pequeña
    const window = T/Math.max(N,1)*0.9;
    let bestT=t0, bestVal=partialSum(a0,ans,bns,N,w0,t0), bestAbs=Math.abs(bestVal);
    for (let k=-30;k<=30;k++){
      const tt = t0 + window*k/30;
      const v = partialSum(a0,ans,bns,N,w0,tt);
      if (Math.abs(v) > bestAbs){ bestAbs=Math.abs(v); bestVal=v; bestT=tt; }
    }
    points.push({ x:bestT, y:bestVal });
    points.push({ x:bestT - T, y:bestVal }); points.push({ x:bestT + T, y:bestVal });
  });
  return { active:true, points };
}

/* ============================================================
   10.  GALERÍA UI
   ============================================================ */
const GALLERY_ICONS = {
  square: `<svg viewBox="0 0 28 20"><path d="M1 14 L1 4 L9 4 L9 16 L17 16 L17 4 L25 4 L25 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  sawtooth: `<svg viewBox="0 0 28 20"><path d="M1 16 L9 4 L9 16 L17 4 L17 16 L25 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  triangle: `<svg viewBox="0 0 28 20"><path d="M1 16 L5 4 L13 16 L17 4 L25 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  pulse: `<svg viewBox="0 0 28 20"><path d="M1 14 L5 14 L5 4 L13 4 L13 14 L21 14 L21 4 L25 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  halfsine: `<svg viewBox="0 0 28 20"><path d="M1 14 Q5 4 9 14 L13 14 Q17 4 21 14 L25 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  custom: `<svg viewBox="0 0 28 20"><path d="M2 14 Q7 2 12 12 T22 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="14" cy="10" r="1.4" fill="currentColor"/></svg>`
};

function buildGallery(){
  const box = $('funcGallery');
  const keys = Object.keys(GALLERY);
  box.innerHTML = keys.map(k=>`
    <button class="func-card${state.sourceKey===k?' active':''}" data-key="${k}">
      ${GALLERY_ICONS[k]}
      <span class="fname">${GALLERY[k].name}</span>
    </button>`).join('') + `
    <button class="func-card${state.sourceKey==='custom'?' active':''}" data-key="custom">
      ${GALLERY_ICONS.custom}
      <span class="fname">Personalizada</span>
    </button>`;
  box.querySelectorAll('.func-card').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.sourceKey = btn.dataset.key;
      box.querySelectorAll('.func-card').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      $('customSection').style.display = state.sourceKey==='custom' ? 'block' : 'none';
      if (state.sourceKey==='custom') applyCustomExpr();
      hasAutoFit = false;
      recompute();
    });
  });
}

function applyCustomExpr(){
  const raw = $('customExpr').value.trim();
  state.customRaw = raw;
  try {
    state.customFn = compileExpr(raw);
    $('customError').textContent = '';
    return true;
  } catch(e){
    $('customError').textContent = 'Error: ' + e.message;
    return false;
  }
}

/* ============================================================
   11.  PANEL DE ANÁLISIS Y TABLA DE COEFICIENTES
   ============================================================ */
function renderAnalysis(data){
  const { fEval, a0, ans, bns, N, T, gibbsInfo, isDiscontinuous } = data;
  const w0 = 2*Math.PI/T;
  const el = $('analysisMain');

  // error RMS entre f(t) y S_N(t) sobre un periodo (medida de convergencia)
  const NS = 400;
  let sumSq = 0, count = 0;
  for (let i=0;i<NS;i++){
    const t = T*i/NS;
    const fv = fEval(t);
    if (!isFinite(fv)) continue;
    const sv = partialSum(a0,ans,bns,N,w0,t);
    sumSq += (fv-sv)*(fv-sv); count++;
  }
  const rmse = count>0 ? Math.sqrt(sumSq/count) : NaN;

  let gibbsHtml = '';
  if (gibbsInfo && gibbsInfo.active){
    gibbsHtml = `
      <div class="gibbs-badge">
        <div class="ricon">⚡</div>
        <div>
          <div class="rname">Fenómeno de Gibbs</div>
          <div class="rdesc">f(t) tiene un salto. La suma parcial siempre "sobrepasa" (~9% del salto) cerca de la discontinuidad, sin importar cuántos términos agregues.</div>
        </div>
      </div>`;
  }

  el.innerHTML = `
    ${gibbsHtml}
    <div class="readout-grid">
      <div class="row"><span class="rk">Términos N</span><span class="rv">${N}</span></div>
      <div class="row"><span class="rk">a₀/2 (promedio)</span><span class="rv">${fmt(a0/2)}</span></div>
      <div class="row"><span class="rk">Periodo T</span><span class="rv">${fmt(T)}</span></div>
      <div class="row"><span class="rk">Frecuencia ω₀=2π/T</span><span class="rv">${fmt(w0)}</span></div>
      <div class="row"><span class="rk">Error RMS (1 periodo)</span><span class="rv">${fmt(rmse,4)}</span></div>
      <div class="row"><span class="rk">¿Discontinua?</span><span class="rv">${isDiscontinuous?'Sí':'No'}</span></div>
    </div>
  `;
}

function renderCoeffTable(a0, ans, bns, N){
  const el = $('coeffPanel');
  let rows = `<tr><th>n</th><th>a<sub>n</sub></th><th>b<sub>n</sub></th></tr>`;
  rows += `<tr><td>0</td><td>${fmt(a0,4)}</td><td>—</td></tr>`;
  for (let n=1;n<=Math.min(N,state.Nmax);n++){
    rows += `<tr><td>${n}</td><td>${fmt(ans[n-1],4)}</td><td>${fmt(bns[n-1],4)}</td></tr>`;
  }
  el.innerHTML = `<div class="coeff-scroll"><table class="coeff-table">${rows}</table></div>`;
}

/* ============================================================
   12.  TOGGLES
   ============================================================ */
function buildToggles(){
  const items = [
    { key:'target', label:'Mostrar f(t) objetivo' },
    { key:'harmonics', label:'Armónicos individuales' },
    { key:'gibbs', label:'Marcar fenómeno de Gibbs' },
    { key:'grid', label:'Cuadrícula y ejes' }
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
      recompute();
    });
  });
}

/* ============================================================
   13.  MOTOR PRINCIPAL
   ============================================================ */
let canvasMain, canvasHarm;
let hasAutoFit = false;
let playTimer = null;
let cachedCoeffs = null, cachedKey = null;

function getCoeffsCached(source, T, Nmax){
  const key = state.sourceKey + '|' + T + '|' + (state.sourceKey==='custom'?state.customRaw:'');
  if (cachedKey === key && cachedCoeffs) return cachedCoeffs;
  cachedCoeffs = getCoeffsForSource(source, T, Nmax);
  cachedKey = key;
  return cachedCoeffs;
}

function recompute(){
  const source = currentSource();
  const T = state.T;
  const N = state.N;

  const { a0, ans, bns } = getCoeffsCached(source, T, state.Nmax);
  const fEval = t => source.fEval(t, T);
  const isDiscontinuous = state.sourceKey==='custom' ? false : !!source.discontinuous;
  const gibbsInfo = detectGibbs(fEval, a0, ans, bns, N, T, isDiscontinuous);

  const data = { fEval, a0, ans, bns, N, T, gibbsInfo, isDiscontinuous };

  renderExpandedBlock(source, a0, ans, bns, N);
  try { katex.render(trigLatex(N), $('eqTrig'), { throwOnError:false, displayMode:false }); } catch(e){}
  renderTrigWhere(source);
  try { katex.render(complexLatex(N), $('eqComplex'), { throwOnError:false, displayMode:false }); } catch(e){}

  $('chipN').textContent = `N = ${N}`;
  $('nReadout').textContent = N;
  $('convergeTag').textContent = isDiscontinuous ? 'Función discontinua' : 'Función continua';
  $('convergeTag').style.color = isDiscontinuous ? 'var(--gibbs)' : 'var(--good)';
  $('harmonicCountTag').textContent = `${Math.min(N,8)} de ${N} coloreados`;

  if (!hasAutoFit){ canvasMain.autoFit(fEval, T); hasAutoFit = true; }
  canvasMain.draw(data);
  canvasHarm.draw(data);

  renderAnalysis(data);
  renderCoeffTable(a0, ans, bns, N);
}

/* Renderiza el bloque "todos los términos": exacta + decimal si la fuente es de
   galería (tiene exactLatex), o solo decimal con una nota si es personalizada. */
function renderExpandedBlock(source, a0, ans, bns, N){
  const hasExact = state.sourceKey !== 'custom' && typeof source.exactLatex === 'function';
  const container = $('eqExpanded');

  if (hasExact){
    container.innerHTML = `
      <div class="expanded-sub">
        <div class="expanded-sublabel">Forma exacta</div>
        <div id="eqExpandedExact"></div>
      </div>
      <div class="expanded-sub">
        <div class="expanded-sublabel">Forma decimal</div>
        <div id="eqExpandedDecimal"></div>
      </div>`;
    try {
      renderTermFlow($('eqExpandedExact'), expandedTermsExact(source.exactA0HalfLatex, ans, bns, N, source.exactLatex));
    } catch(e){ $('eqExpandedExact').textContent = 'No se pudo renderizar la forma exacta.'; }
    try {
      renderTermFlow($('eqExpandedDecimal'), expandedTermsDecimal(a0, ans, bns, N));
    } catch(e){ $('eqExpandedDecimal').textContent = 'No se pudo renderizar la forma decimal.'; }
  } else {
    container.innerHTML = `
      <div class="expanded-sub">
        <div id="eqExpandedDecimal"></div>
        <div class="expanded-note">Coeficientes calculados por integración numérica: solo se muestra la forma decimal (no existe una expresión exacta general para una función arbitraria).</div>
      </div>`;
    try {
      renderTermFlow($('eqExpandedDecimal'), expandedTermsDecimal(a0, ans, bns, N));
    } catch(e){ $('eqExpandedDecimal').textContent = 'No se pudo renderizar la expansión.'; }
  }
}

function stopPlayback(){
  if (playTimer){ clearInterval(playTimer); playTimer=null; }
  state.playing = false;
  const btn = $('btnPlay');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg> Reproducir convergencia`;
}

function startPlayback(){
  // si ya estamos en el máximo, reinicia desde 0 para poder ver la convergencia de nuevo
  if (state.N >= state.Nmax){ state.N = 0; $('nSlider').value = 0; recompute(); }
  state.playing = true;
  const btn = $('btnPlay');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg> Detener`;
  playTimer = setInterval(()=>{
    state.N++;
    $('nSlider').value = state.N;
    recompute();
    if (state.N >= state.Nmax){ stopPlayback(); } // se detiene exactamente en Nmax, sin reiniciar
  }, SPEED_MS[state.speed]);
}

function bindEvents(){
  $('periodVal').addEventListener('input', ()=>{
    const v = +$('periodVal').value;
    state.T = v > 0.05 ? v : 0.05;
    hasAutoFit = false;
    recompute();
  });

  $('nSlider').addEventListener('input', ()=>{
    state.N = +$('nSlider').value;
    recompute();
  });

  $('btnPlay').addEventListener('click', ()=>{
    if (state.playing) stopPlayback(); else startPlayback();
  });

  document.querySelectorAll('.speed-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.speed = btn.dataset.speed;
      document.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      if (state.playing){ stopPlayback(); startPlayback(); }
    });
  });

  $('customExpr').addEventListener('input', ()=>{
    if (applyCustomExpr() && state.sourceKey==='custom'){ hasAutoFit=false; recompute(); }
  });

  $('btnReset').addEventListener('click', ()=>{
    stopPlayback();
    state.sourceKey='square'; state.T=2*Math.PI; state.N=5;
    state.customRaw='t'; $('customExpr').value='t';
    $('customSection').style.display='none';
    $('periodVal').value = state.T.toFixed(4);
    $('nSlider').value = state.N;
    buildGallery();
    hasAutoFit = false;
    recompute();
  });

  document.querySelectorAll('.icon-btn[data-zoom]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.zoom; // "m-in"|"m-out"|"m-reset"
      const [, action] = key.split('-');
      const host = $('hostMain');
      const r = host.getBoundingClientRect();
      if (action==='in') canvasMain.viewport.zoomAt(0.8, r.width/2, r.height/2, r.width, r.height);
      else if (action==='out') canvasMain.viewport.zoomAt(1.25, r.width/2, r.height/2, r.width, r.height);
      else if (action==='reset'){ const source=currentSource(); canvasMain.autoFit(t=>source.fEval(t,state.T), state.T); }
      if (cachedCoeffs){
        const source = currentSource();
        const fEval = t => source.fEval(t, state.T);
        const isDisc = state.sourceKey==='custom' ? false : !!source.discontinuous;
        const gibbsInfo = detectGibbs(fEval, cachedCoeffs.a0, cachedCoeffs.ans, cachedCoeffs.bns, state.N, state.T, isDisc);
        canvasMain.draw({ fEval, a0:cachedCoeffs.a0, ans:cachedCoeffs.ans, bns:cachedCoeffs.bns, N:state.N, T:state.T, gibbsInfo, isDiscontinuous:isDisc });
      }
    });
  });

  buildToggles();
  window.addEventListener('resize', ()=>{ canvasMain.resize(); canvasHarm.resize(); recompute(); });
}

/* ============================================================
   14.  INIT
   ============================================================ */
function init(){
  canvasMain = makeMainCanvas('canvasMain','hostMain');
  canvasHarm = makeHarmCanvas('canvasHarm','hostHarm');
  buildGallery();
  applyCustomExpr();
  bindEvents();
  canvasMain.resize();
  canvasHarm.resize();
  recompute();
}

function whenReady(){
  if (window.katex){ init(); }
  else setTimeout(whenReady, 60);
}
whenReady();

})();
