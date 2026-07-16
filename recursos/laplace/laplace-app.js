/* ============================================================
   Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)
   Simulador de Transformada de Laplace — r(t) arbitraria, coef. constantes
   ay'' + by' + cy = r(t) ,  y(0)=y0 ,  y'(0)=v0
   Proceso completo: y(t) -> Y(s) -> fracciones parciales -> H(s) -> y(t)
   Motor: residuos exactos (deflación algebraica) + convolución numérica
          como respaldo para partes de r(t) sin forma cerrada.
   © Daniel Steven Moran Pizarro
   ============================================================ */

(() => {
'use strict';

/* ---------- Estado global ---------- */
const state = {
  a:1, b:7, c:10, rExpr:'30', y0:0, v0:0, tmax:6,
  show: { equilibrium:true, grid:true }
};

const REGIME_COLOR = { over:'#2ee8c8', crit:'#ff6b4a', under:'#ff4d94', undamped:'#a78bfa' };
const REGIME_NAME  = { over:'Raíces reales distintas', crit:'Raíz real doble', under:'Raíces complejas conjugadas', undamped:'Raíces imaginarias puras' };
const REGIME_DESC  = {
  over:'La fracción parcial produce dos exponenciales simples: e^(r₁t) y e^(r₂t). El sistema vuelve al equilibrio sin oscilar.',
  crit:'La fracción parcial produce un exponencial y un término t·e^(rt). Es el retorno más rápido posible sin oscilar.',
  under:'La fracción parcial produce senos y cosenos multiplicados por una envolvente e^(αt) que decae. El sistema oscila mientras se estabiliza.',
  undamped:'La fracción parcial produce senos y cosenos puros, sin envolvente exponencial. La oscilación nunca se atenúa.'
};

const $ = id => document.getElementById(id);
function fmt(x, d=3){
  if (!isFinite(x)) return '—';
  const r = Math.round(x*Math.pow(10,d))/Math.pow(10,d);
  return Object.is(r,-0) ? '0' : String(r);
}
/* Formatea un número con signo explícito para concatenar en sumas LaTeX: "+ 3" o "- 2.5" */
function signedTerm(x, d=3){
  const v = fmt(Math.abs(x), d);
  return (x < 0 ? '- ' : '+ ') + v;
}

/* ============================================================
   1.  CLASIFICACIÓN DEL SISTEMA (independiente del forzante)
   Las raíces características a*s^2+b*s+c dependen solo de a,b,c —
   el régimen (tipo de raíces) es el mismo sea cual sea r(t).
   ============================================================ */
function classifySystem(a,b,c){
  const disc = b*b - 4*a*c;
  let regime, roots, period=null, omega=null, alpha=null;
  if (b === 0 && c > 0){
    omega = Math.sqrt(c/a);
    regime = 'undamped';
    roots = [`${fmt(omega)}i`, `−${fmt(omega)}i`];
    period = 2*Math.PI/omega;
  } else if (disc > 1e-9){
    regime = 'over';
    const sq = Math.sqrt(disc);
    roots = [(-b+sq)/(2*a), (-b-sq)/(2*a)];
  } else if (Math.abs(disc) <= 1e-9){
    regime = 'crit';
    const r = -b/(2*a);
    roots = [r, r];
  } else {
    regime = 'under';
    alpha = -b/(2*a);
    omega = Math.sqrt(-disc)/(2*a);
    roots = [`${fmt(alpha)} + ${fmt(omega)}i`, `${fmt(alpha)} − ${fmt(omega)}i`];
    period = 2*Math.PI/omega;
  }
  return { regime, roots, disc, period, omega, alpha };
}

/* Convierte los terminos complejos {root,k,A} del motor general en terminos REALES
   (fusionando pares conjugados) listos para mostrar y evaluar: 
   {kind:'real', k, root, coef}  o  {kind:'osc', k, alpha, omega, B, C} */
function mergeConjugateTerms(terms){
  const used = new Array(terms.length).fill(false);
  const out = [];
  for (let i=0;i<terms.length;i++){
    if (used[i]) continue;
    const t1 = terms[i];
    if (Math.abs(t1.root.im) < 1e-6){
      out.push({ kind:'real', k:t1.k, root:t1.root.re, coef:t1.A.re });
      used[i] = true;
      continue;
    }
    // buscar su conjugado con el mismo k
    let j = -1;
    for (let jj=i+1; jj<terms.length; jj++){
      if (used[jj]) continue;
      const t2 = terms[jj];
      if (t2.k === t1.k && Math.abs(t2.root.re - t1.root.im*0 - t1.root.re) < 1e-4 && Math.abs(t2.root.im + t1.root.im) < 1e-4){
        j = jj; break;
      }
    }
    const alpha = t1.root.re;
    const omega = Math.abs(t1.root.im);
    // orientar A hacia el polo de parte imaginaria POSITIVA para que B,C sean consistentes
    const Aref = t1.root.im > 0 ? t1.A : (j>=0 ? terms[j].A : t1.A);
    out.push({ kind:'osc', k:t1.k, alpha, omega, B: 2*Aref.re, C: -2*Aref.im });
    used[i] = true; if (j>=0) used[j] = true;
  }
  return out;
}

/* Construye la solucion completa: parte exacta (terminos reconocidos por el parser) +
   parte numerica (convolucion, solo si hay terminos sin forma cerrada) */
function buildSolution(a,b,c,y0,v0,rExpr){
  const parsed = Eng.parseForcing(rExpr);
  const recognized = parsed.recognized.map(t=>({type:t.type, params:t.params}));
  const unrecognizedFunc = Eng.makeUnrecognizedFunc(parsed.unrecognized);
  const sol = Eng.solveWithFallback(a,b,c,y0,v0, recognized, unrecognizedFunc);
  const displayTerms = mergeConjugateTerms(sol.exact.terms);

  // equilibrio y_eq solo tiene sentido pedagogico como "valor final" cuando r(t) es una
  // constante pura (un unico termino poly n=0) y no hay parte numerica sin reconocer
  let yeq = NaN;
  if (recognized.length===1 && recognized[0].type==='poly' && recognized[0].params.n===0 && !parsed.unrecognized.length){
    yeq = c!==0 ? recognized[0].params.coef/c : NaN;
  }

  const cls = classifySystem(a,b,c);
  return {
    yFunc: sol.yFunc, a,b,c,y0,v0,rExpr,
    parsed, recognizedTerms: parsed.recognized, unrecognized: parsed.unrecognized,
    displayTerms, yeq, fullNum: sol.exact.fullNum, fullDen: sol.exact.fullDen,
    regime: cls.regime, roots: cls.roots, disc: cls.disc, period: cls.period, omega: cls.omega, alpha: cls.alpha
  };
}

/* ============================================================
   2.  GENERACIÓN DE LATEX — cada paso del proceso, con números reales
   ============================================================ */
function termStr(coef, varName){
  if (Math.abs(coef) < 1e-9) return null;
  if (Math.abs(coef - 1) < 1e-9) return varName;
  if (Math.abs(coef + 1) < 1e-9) return `-${varName}`;
  return `${fmt(coef,3)}\\,${varName}`;
}
function factorialSmall(n){ let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
function coefPrefix(coef){
  if (Math.abs(coef-1) < 1e-9) return '';
  if (Math.abs(coef+1) < 1e-9) return '-';
  return fmt(coef,3);
}

/* Convierte el texto libre de r(t) a KaTeX de forma razonable (no es un parser completo,
   solo mejora la lectura: exp(...)->e^{...}, sin/cos con backslash, * -> \cdot) */
function rExprToKatex(expr){
  let s = (expr||'0').replace(/\s+/g,'');
  s = s.replace(/\bexp\(([^()]*)\)/g, 'e^{$1}');
  s = s.replace(/\bsin\(/g, '\\sin(');
  s = s.replace(/\bcos\(/g, '\\cos(');
  s = s.replace(/\bsqrt\(([^()]*)\)/g, '\\sqrt{$1}');
  s = s.replace(/\*/g, '\\cdot ');
  s = s.replace(/\^\(([^()]+)\)/g, '^{$1}');
  s = s.replace(/\^(-?\d+(?:\.\d+)?)/g, '^{$1}');
  return s || '0';
}

function renderMainEq(sys){
  const { a,b,c,y0,v0,rExpr } = sys;
  const parts = [];
  const aT = termStr(a, "y''"); parts.push(aT === null ? "0" : aT);
  const bT = termStr(b, "y'"); if (bT !== null) parts.push(bT.startsWith('-') ? bT : `+ ${bT}`);
  const cT = termStr(c, "y");  if (cT !== null) parts.push(cT.startsWith('-') ? cT : `+ ${cT}`);
  const tex = `${parts.join(' \\, ')} = ${rExprToKatex(rExpr)} \\qquad y(0)=${fmt(y0)},\\;\\; y'(0)=${fmt(v0)}`;
  try { katex.render(tex, $('eqLatexMain'), { throwOnError:false, displayMode:false }); }
  catch(e){ $('eqLatexMain').textContent = `${a}y'' + ${b}y' + ${c}y = ${rExpr}`; }
}

/* L{r(t)} termino a termino, usando los pares exactos de la libreria de forzantes */
function termLaplaceParts(term){
  const { type, params } = term;
  if (type === 'poly'){
    const { coef, n } = params;
    const value = coef*factorialSmall(n);
    return { value, numLatex: fmt(Math.abs(value)), denLatex: n===0 ? 's' : `s^{${n+1}}` };
  }
  if (type === 'sin'){
    const { F0, w0 } = params;
    return { value: F0*w0, numLatex: fmt(Math.abs(F0*w0)), denLatex: `s^2 + ${fmt(w0*w0)}` };
  }
  if (type === 'cos'){
    const { F0, w0 } = params;
    const mag = Math.abs(F0);
    const numLatex = Math.abs(mag-1)<1e-9 ? 's' : `${fmt(mag)}\\,s`;
    return { value: F0, numLatex, denLatex: `s^2 + ${fmt(w0*w0)}` };
  }
  if (type === 'exp'){
    const { F0, k0 } = params;
    return { value: F0, numLatex: fmt(Math.abs(F0)), denLatex: `s ${k0>=0?'-':'+'} ${fmt(Math.abs(k0))}` };
  }
  return { value:0, numLatex:'0', denLatex:'1' };
}
function forcingRsLatex(recognizedTerms){
  if (!recognizedTerms.length) return '0';
  let tex = '';
  recognizedTerms.forEach((term,i)=>{
    const { value, numLatex, denLatex } = termLaplaceParts(term);
    if (Math.abs(value) < 1e-9 && recognizedTerms.length>1) return;
    const sign = value>=0 ? (tex===''?'':' + ') : (tex===''?'-':' - ');
    tex += `${sign}\\dfrac{${numLatex}}{${denLatex}}`;
  });
  return tex || '0';
}

/* Paso 1: aplicar L{} a ambos lados, sustituyendo L{y'} y L{y''} con condiciones iniciales */
function step1Latex(sys){
  const { a,b,c,y0,v0,recognizedTerms,unrecognized } = sys;
  const aP = coefPrefix(a), cP = coefPrefix(c);
  let lhs = `${aP}\\left[s^2Y(s)`;
  if (Math.abs(y0) > 1e-9) lhs += ` ${-y0>=0?'+':'-'} ${fmt(Math.abs(y0))}s`;
  if (Math.abs(v0) > 1e-9) lhs += ` ${-v0>=0?'+':'-'} ${fmt(Math.abs(v0))}`;
  lhs += `\\right]`;
  if (Math.abs(b) > 1e-9){
    const bP = coefPrefix(b);
    lhs += ` + ${bP}\\left[sY(s)`;
    if (Math.abs(y0) > 1e-9) lhs += ` ${-y0>=0?'+':'-'} ${fmt(Math.abs(y0))}`;
    lhs += `\\right]`;
  }
  lhs += ` + ${cP}Y(s) = ${forcingRsLatex(recognizedTerms)}`;
  if (unrecognized.length) lhs += ` \\;+\\; \\mathcal{L}\\{${rExprToKatex(unrecognized.join('+'))}\\}`;
  return lhs;
}

/* Paso 2: Y(s) despejada, como una sola fraccion racional (parte exacta) */
function polyToLatexS(poly){
  const deg = poly.length-1;
  const parts = [];
  poly.forEach((cc,i)=>{
    const power = deg-i, val = cc.re;
    if (Math.abs(val) < 1e-7*Math.max(1,Math.abs(poly[0].re))) return;
    const magOne = Math.abs(val-1)<1e-6, magNegOne = Math.abs(val+1)<1e-6;
    let core;
    if (power===0) core = fmt(Math.abs(val));
    else if (power===1) core = (magOne||magNegOne?'':fmt(Math.abs(val))) + 's';
    else core = (magOne||magNegOne?'':fmt(Math.abs(val))) + `s^{${power}}`;
    const sign = val>=0 ? (parts.length?' + ':'') : (parts.length?' - ':'-');
    parts.push(sign+core);
  });
  return parts.length ? parts.join('') : '0';
}
function step2Latex(sys){
  let tex = `Y(s) = \\dfrac{${polyToLatexS(sys.fullNum)}}{${polyToLatexS(sys.fullDen)}}`;
  if (sys.unrecognized.length) tex += ` \\;+\\; \\dfrac{\\mathcal{L}\\{${rExprToKatex(sys.unrecognized.join('+'))}\\}}{${coefPrefix(sys.a)||''}s^2 ${sys.b>=0?'+':'-'} ${fmt(Math.abs(sys.b))}s ${sys.c>=0?'+':'-'} ${fmt(Math.abs(sys.c))}}`;
  return tex;
}

/* Paso 3: fracciones parciales — un termino por cada polo real o par complejo conjugado fusionado */
function fracFragment(signVal, numLatex, denLatex){
  const s = signVal>=0 ? ' + ' : ' - ';
  return `${s}\\dfrac{${numLatex}}{${denLatex}}`;
}
/* Formatea "s - r" evitando "s - 0" cuando la raiz es (numericamente) cero */
function sMinusRoot(root){
  if (Math.abs(root) < 1e-7) return 's';
  return root>=0 ? `s - ${fmt(Math.abs(root))}` : `s + ${fmt(Math.abs(root))}`;
}
function step3Latex(sys){
  let tex = 'Y(s) = ';
  let body = '';
  for (const dt of sys.displayTerms){
    if (dt.kind==='real'){
      if (Math.abs(dt.coef) < 1e-9) continue;
      const rStr = sMinusRoot(dt.root);
      const den = dt.k===1 ? rStr : `\\left(${rStr}\\right)^{${dt.k}}`;
      body += fracFragment(dt.coef, fmt(Math.abs(dt.coef)), den);
    } else if (dt.kind==='osc'){
      const aStr = sMinusRoot(dt.alpha);
      const D = `\\left(${aStr}\\right)^2 + ${fmt(dt.omega*dt.omega)}`;
      if (dt.k===1){
        let num = '';
        if (Math.abs(dt.B) > 1e-6) num += `${fmt(dt.B)}\\left(${aStr}\\right)`;
        if (Math.abs(dt.C) > 1e-6) num += `${(num && dt.C>=0)?' + ':(dt.C<0?' - ':'')}${fmt(Math.abs(dt.C*dt.omega))}`;
        body += fracFragment(1, num||'0', D);
      } else if (dt.k===2){
        let num = `${fmt(dt.B)}\\left[\\left(${aStr}\\right)^2 - ${fmt(dt.omega*dt.omega)}\\right]`;
        if (Math.abs(dt.C) > 1e-6) num += ` ${dt.C>=0?'+':'-'} ${fmt(2*Math.abs(dt.C)*dt.omega)}\\left(${aStr}\\right)`;
        body += fracFragment(1, num, `\\left[${D}\\right]^2`);
      } else {
        body += fracFragment(1, '\\text{(residuo por derivadas)}', `\\left[${D}\\right]^{${dt.k}}`);
      }
    }
  }
  if (!body) body = ' 0';
  return tex + body.replace(/^ \+ /,'').replace(/^ - /,'-');
}

/* H(s) = 1/(as^2+bs+c) — depende solo del sistema, no del forzante */
function hLatex(sys){
  const { a,b,c } = sys;
  const aP = coefPrefix(a) || '';
  return `H(s) = \\dfrac{1}{${aP}s^2 ${b>=0?'+':'-'} ${fmt(Math.abs(b))}s ${c>=0?'+':'-'} ${fmt(Math.abs(c))}} \\qquad \\text{(mismo denominador que la ecuación característica)}`;
}

/* Paso 4: transformar de regreso — y(t) con numeros reales, un termino por polo (o par fusionado) */
function expTermStr(coef, varName='t'){
  if (Math.abs(coef) < 1e-7) return null; // e^0 = 1, se omite el factor
  if (Math.abs(coef-1) < 1e-9) return varName;
  if (Math.abs(coef+1) < 1e-9) return `-${varName}`;
  return `${fmt(coef)}${varName}`;
}
function coefTrigStr(coef){
  if (Math.abs(coef-1) < 1e-9) return '';
  if (Math.abs(coef+1) < 1e-9) return '-';
  return fmt(coef);
}
function step4Latex(sys){
  let tex = 'y(t) = ';
  let body = '';
  for (const dt of sys.displayTerms){
    const tPow = dt.k===1 ? '' : (dt.k===2 ? 't\\,' : `t^{${dt.k-1}}\\,`);
    if (dt.kind==='real'){
      const dispVal = dt.coef/factorialSmall(dt.k-1);
      if (Math.abs(dispVal) < 1e-9) continue;
      const mag = (Math.abs(dispVal-1)<1e-9) ? '' : (Math.abs(dispVal+1)<1e-9 ? '' : fmt(Math.abs(dispVal)));
      const sign = dispVal>=0 ? ' + ' : ' - ';
      const expStr = expTermStr(dt.root);
      const expPart = expStr===null ? (mag||tPow ? '' : '1') : `e^{${expStr}}`;
      body += `${sign}${mag}${tPow}${expPart}`;
    } else if (dt.kind==='osc'){
      const dispB = dt.B/factorialSmall(dt.k-1), dispC = dt.C/factorialSmall(dt.k-1);
      const inner = [];
      if (Math.abs(dispB) > 1e-6) inner.push(`${coefTrigStr(dispB)}\\cos(${fmt(dt.omega)}t)`);
      if (Math.abs(dispC) > 1e-6) inner.push(`${(inner.length&&dispC>=0)?'+ ':(dispC<0?'- ':'')}${coefTrigStr(Math.abs(dispC))}\\sin(${fmt(dt.omega)}t)`);
      const innerStr = inner.length ? inner.join(' ') : '0';
      const expStr = expTermStr(dt.alpha);
      const expPart = expStr===null ? '' : `e^{${expStr}}`;
      body += ` + ${tPow}${expPart}\\left(${innerStr}\\right)`;
    }
  }
  if (!body) body = ' 0';
  if (sys.unrecognized.length) body += ` \\;+\\; y_{\\text{num}}(t)`;
  return tex + body.replace(/^ \+ /,'').replace(/^ - /,'-');
}


/* ============================================================
   3.  DIBUJO DEL CANVAS (dominio t)
   ============================================================ */
/* ============================================================
   3.  VIEWPORT GENÉRICO (zoom + pan) — compartido por ambos canvases
   ============================================================ */
function makeViewport(defaultView){
  let view = { ...defaultView };
  function reset(){ view = { ...defaultView }; }
  function zoomAt(factor, px, py, W, H){
    // px,py: posición del cursor en pantalla (0..W, 0..H); factor<1 acerca, >1 aleja
    const wx = view.xmin + (px/W)*(view.xmax-view.xmin);
    const wy = view.ymax - (py/H)*(view.ymax-view.ymin); // y invertido en pantalla
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
    view.ymin += dyPix*hPerPix; view.ymax += dyPix*hPerPix; // y pantalla invertido
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

  // soporte táctil básico (un dedo = pan)
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
   3a. CANVAS — DOMINIO DEL TIEMPO
   ============================================================ */
function makeCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;
  let lastSys=null, lastColor=null;

  const defaultView = ()=>({ xmin:0, xmax:state.tmax, ymin:-1, ymax:1 });
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
    if (lastSys) draw(lastSys, lastColor);
  }

  function autoFit(sys){
    const tmax = state.tmax;
    const N = 400;
    let ymin=Infinity, ymax=-Infinity;
    for (let i=0;i<=N;i++){
      const y = sys.yFunc(tmax*i/N);
      if (isFinite(y)){ if(y<ymin)ymin=y; if(y>ymax)ymax=y; }
    }
    if (isFinite(sys.yeq)){ if(sys.yeq<ymin)ymin=sys.yeq; if(sys.yeq>ymax)ymax=sys.yeq; }
    if (!isFinite(ymin)||!isFinite(ymax)||ymin===ymax){ ymin=-1; ymax=1; }
    const pad = (ymax-ymin)*0.16 || 1;
    viewport.reset();
    const v = viewport.get();
    v.xmin=0; v.xmax=tmax; v.ymin=ymin-pad; v.ymax=ymax+pad;
  }

  function draw(sys, color){
    lastSys=sys; lastColor=color;
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    const v = viewport.get();
    const t2sx = t => ((t-v.xmin)/(v.xmax-v.xmin))*W;
    const y2sy = y => H - ((y-v.ymin)/(v.ymax-v.ymin))*H;

    if (state.show.grid){
      ctx.save();
      ctx.strokeStyle = 'rgba(120,150,200,0.07)';
      ctx.lineWidth = 1;
      const stepT = niceStep(v.xmax-v.xmin);
      const stepY = niceStep(v.ymax-v.ymin);
      ctx.beginPath();
      for (let t=Math.ceil(v.xmin/stepT)*stepT; t<=v.xmax; t+=stepT){ const sx=t2sx(t); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){ const sy=y2sy(y); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(159,176,208,0.4)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      if (v.ymin<0 && v.ymax>0){ const sy=y2sy(0); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      if (v.xmin<0 && v.xmax>0){ const sx=t2sx(0); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      else if (v.xmin<=0) { ctx.moveTo(t2sx(0),0); ctx.lineTo(t2sx(0),H); }
      ctx.stroke();
      ctx.fillStyle='rgba(159,176,208,0.65)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      for (let t=Math.ceil(v.xmin/stepT)*stepT; t<=v.xmax; t+=stepT){ ctx.fillText(fmt(t,1), t2sx(t)+3, H-6); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){
        if (Math.abs(y)<1e-9) continue;
        ctx.fillText(fmt(y,1), 5, y2sy(y)-4);
      }
      ctx.restore();
    }

    if (state.show.equilibrium && isFinite(sys.yeq) && sys.yeq>=v.ymin && sys.yeq<=v.ymax){
      ctx.save();
      ctx.setLineDash([8,6]);
      ctx.strokeStyle = 'rgba(255,148,102,0.55)';
      ctx.lineWidth = 1.6;
      const sy = y2sy(sys.yeq);
      ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,148,102,0.85)'; ctx.font='600 10.5px "Spline Sans Mono", monospace';
      ctx.fillText(`y_eq = ${fmt(sys.yeq)}`, W-110, sy-7);
      ctx.restore();
    }

    // curva: muestreada sobre el rango VISIBLE (no fijo a tmax) para que el zoom revele detalle
    const tA = Math.max(v.xmin, -1), tB = v.xmax;
    const N = 700;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i=0;i<=N;i++){
      const t = tA + (tB-tA)*i/N;
      const y = sys.yFunc(t);
      if (!isFinite(y)) continue;
      const sx=t2sx(t), sy=y2sy(y);
      i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
    }
    ctx.stroke();
    ctx.restore();

    if (v.xmin<=0 && v.xmax>=0){
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(t2sx(0), y2sy(sys.y0), 4.2, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  attachPanZoom(host, viewport, ()=>{ if (lastSys) draw(lastSys, lastColor); });

  return { resize, draw, autoFit, viewport };
}

/* ============================================================
   3b. RESPUESTA EN FRECUENCIA  |H(jω)| = 1/|a(jω)²+b(jω)+c|
   No se expone variable compleja al estudiante: solo se presenta
   como "qué tan fuerte responde el sistema a cada frecuencia".
   ============================================================ */
function magnitudeH(a,b,c,w){
  const reDen = c - a*w*w;
  const imDen = b*w;
  const mag = Math.sqrt(reDen*reDen + imDen*imDen);
  return mag > 1e-12 ? 1/mag : Infinity;
}
/* Frecuencia de resonancia (pico de |H|), si existe */
function resonanceInfo(a,b,c){
  const inner = c/a - (b*b)/(2*a*a);
  if (inner <= 1e-9) return null;
  const wr = Math.sqrt(inner);
  return { wr, peak: magnitudeH(a,b,c,wr) };
}

function makeFreqCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;
  let lastSys=null, lastColor=null;

  const defaultView = ()=>({ xmin:0, xmax:10, ymin:0, ymax:1 });
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
    if (lastSys) draw(lastSys, lastColor);
  }

  function autoFit(sys){
    const { a, b, c } = sys;
    const res = resonanceInfo(a,b,c);
    // ventana de frecuencia: cubre holgadamente la resonancia, o un rango por defecto
    const wMaxGuess = res ? Math.max(res.wr*2.6, 6) : Math.sqrt(c/a)*4 + 4;
    const N = 400;
    let hmax = 0;
    for (let i=0;i<=N;i++){
      const w = wMaxGuess*i/N;
      const m = magnitudeH(a,b,c,w);
      if (isFinite(m) && m>hmax) hmax = m;
    }
    if (res && !isFinite(res.peak)) hmax = Math.max(hmax, magnitudeH(a,b,c,res.wr*0.999)); // b=0: usar valor cercano, no Infinity
    if (hmax<=0 || !isFinite(hmax)) hmax = 1;
    viewport.reset();
    const v = viewport.get();
    v.xmin=0; v.xmax=wMaxGuess; v.ymin=0; v.ymax=hmax*1.18;
  }

  function draw(sys, color){
    lastSys=sys; lastColor=color;
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    const v = viewport.get();
    const { a, b, c } = sys;
    const w2sx = w => ((w-v.xmin)/(v.xmax-v.xmin))*W;
    const m2sy = m => H - ((m-v.ymin)/(v.ymax-v.ymin))*H;

    if (state.show.grid){
      ctx.save();
      ctx.strokeStyle = 'rgba(120,150,200,0.07)';
      ctx.lineWidth = 1;
      const stepW = niceStep(v.xmax-v.xmin);
      const stepM = niceStep(v.ymax-v.ymin);
      ctx.beginPath();
      for (let w=Math.ceil(v.xmin/stepW)*stepW; w<=v.xmax; w+=stepW){ const sx=w2sx(w); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      for (let m=Math.ceil(v.ymin/stepM)*stepM; m<=v.ymax; m+=stepM){ const sy=m2sy(m); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(159,176,208,0.4)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      if (v.ymin<=0){ const sy=m2sy(0); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      if (v.xmin<=0){ const sx=w2sx(0); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      ctx.stroke();
      ctx.fillStyle='rgba(159,176,208,0.65)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      for (let w=Math.ceil(v.xmin/stepW)*stepW; w<=v.xmax; w+=stepW){
        if (Math.abs(w)<1e-9) continue;
        ctx.fillText(fmt(w,1), w2sx(w)+3, H-6);
      }
      for (let m=Math.ceil(v.ymin/stepM)*stepM; m<=v.ymax; m+=stepM){
        if (Math.abs(m)<1e-9) continue;
        ctx.fillText(fmt(m,2), 5, m2sy(m)-4);
      }
      ctx.restore();
    }

    // curva |H(jw)|
    const N = 700;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath();
    let started = false;
    for (let i=0;i<=N;i++){
      const w = Math.max(0, v.xmin) + (v.xmax-Math.max(0,v.xmin))*i/N;
      const m = magnitudeH(a,b,c,w);
      if (!isFinite(m) || m > v.ymax*1.4) { started=false; continue; } // evita disparar la línea al infinito
      const sx=w2sx(w), sy=m2sy(m);
      if (!started){ ctx.moveTo(sx,sy); started=true; } else ctx.lineTo(sx,sy);
    }
    ctx.stroke();
    ctx.restore();

    // marcar pico de resonancia si está en vista
    const res = resonanceInfo(a,b,c);
    if (res && res.wr>=v.xmin && res.wr<=v.xmax){
      ctx.save();
      ctx.setLineDash([6,5]);
      ctx.strokeStyle = 'rgba(255,180,60,0.55)';
      ctx.lineWidth = 1.4;
      const sx = w2sx(res.wr);
      ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,180,60,0.9)'; ctx.font='600 10.5px "Spline Sans Mono", monospace';
      const label = isFinite(res.peak) ? `ω_r ≈ ${fmt(res.wr,2)}` : `ω_r = ${fmt(res.wr,2)} (resonancia)`;
      ctx.fillText(label, Math.min(sx+6, W-120), 16);
      ctx.restore();
    }
  }

  attachPanZoom(host, viewport, ()=>{ if (lastSys) draw(lastSys, lastColor); });

  return { resize, draw, autoFit, viewport };
}

/* ============================================================
   4.  PANEL DE ANÁLISIS Y VERIFICACIÓN
   ============================================================ */
function renderAnalysis(sys){
  const el = $('analysisMain');
  const color = REGIME_COLOR[sys.regime];
  const rootsStr = sys.roots.map(r => typeof r==='number' ? fmt(r) : r).join(',  ');

  let extra = '';
  if (sys.regime==='under' || sys.regime==='undamped'){
    extra = `<div class="row"><span class="rk">Periodo T</span><span class="rv">${fmt(sys.period)} s</span></div>
             <div class="row"><span class="rk">Frecuencia ω</span><span class="rv">${fmt(sys.omega)} rad/s</span></div>`;
  }

  el.innerHTML = `
    <div class="regime-badge" style="border-color:${color}66">
      <div class="ricon" style="background:${color}22;color:${color};border:1px solid ${color}66">●</div>
      <div class="rtext">
        <div class="rname" style="color:${color}">${REGIME_NAME[sys.regime]}</div>
        <div class="rdesc">${REGIME_DESC[sys.regime]}</div>
      </div>
    </div>
    <div class="readout-grid">
      <div class="row"><span class="rk">Discriminante b²−4ac</span><span class="rv">${fmt(sys.disc)}</span></div>
      <div class="row"><span class="rk">Raíces características</span><span class="rv">${rootsStr}</span></div>
      <div class="row"><span class="rk">Equilibrio y_eq (si r(t) es constante)</span><span class="rv">${isFinite(sys.yeq)?fmt(sys.yeq):'—'}</span></div>
      ${extra}
    </div>
  `;
}

/* Verificación: sustituir t=0 en y(t) reconstruido y comparar con y0; idem para y'(0) numérico */
function renderVerify(sys){
  const el = $('analysisVerify');
  const h = 1e-5;
  const yAt0 = sys.yFunc(0);
  const slopeAt0 = (sys.yFunc(h) - sys.yFunc(0))/h;
  const okY0 = Math.abs(yAt0 - sys.y0) < 1e-3;
  const okV0 = Math.abs(slopeAt0 - sys.v0) < 1e-2;
  el.innerHTML = `
    <div class="readout-grid">
      <div class="row"><span class="rk">y(0) calculado</span><span class="rv" style="color:${okY0?'var(--good)':'var(--bad)'}">${fmt(yAt0)}</span></div>
      <div class="row"><span class="rk">y′(0) calculado (≈)</span><span class="rv" style="color:${okV0?'var(--good)':'var(--bad)'}">${fmt(slopeAt0,2)}</span></div>
      <div class="row"><span class="rk">Coincide con condiciones iniciales</span><span class="rv" style="color:${(okY0&&okV0)?'var(--good)':'var(--bad)'}">${(okY0&&okV0)?'Sí ✓':'Revisar'}</span></div>
    </div>
  `;
}

/* ============================================================
   6.  TOGGLES
   ============================================================ */
function buildToggles(){
  const items = [
    { key:'equilibrium', label:'Línea de equilibrio (y_eq)' },
    { key:'grid',        label:'Cuadrícula y ejes' }
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
   7.  MOTOR PRINCIPAL
   ============================================================ */
let canvasT, canvasF;
let hasAutoFitT = false, hasAutoFitF = false;
let prevAutoKey = null; // detecta cambios de régimen para decidir si re-encuadrar

function recompute(){
  const sys = buildSolution(state.a, state.b, state.c, state.y0, state.v0, state.rExpr);

  renderMainEq(sys);
  try { katex.render(step1Latex(sys), $('stepTransform'), { throwOnError:false, displayMode:true }); } catch(e){}
  try { katex.render(step2Latex(sys), $('stepYs'), { throwOnError:false, displayMode:true }); } catch(e){}
  try { katex.render(step3Latex(sys), $('stepPartial'), { throwOnError:false, displayMode:true }); } catch(e){}
  try { katex.render(hLatex(sys), $('stepHs'), { throwOnError:false, displayMode:true }); } catch(e){}
  try { katex.render(step4Latex(sys), $('stepInverse'), { throwOnError:false, displayMode:true }); } catch(e){}

  renderRStatus(sys);

  const color = REGIME_COLOR[sys.regime];
  $('rootsTypeTag').textContent = REGIME_NAME[sys.regime];
  $('rootsTypeTag').style.color = color;
  $('regimeTagT').textContent = REGIME_NAME[sys.regime];
  $('regimeTagT').style.color = color;
  $('dotT').style.background = color;
  $('chipRegime').textContent = REGIME_NAME[sys.regime];
  $('eqTag').innerHTML = isFinite(sys.yeq) ? `y_eq = <b>${fmt(sys.yeq)}</b>` : 'y_eq = —';

  const res = resonanceInfo(sys.a, sys.b, sys.c);
  $('resonanceTag').textContent = res ? 'Con resonancia' : 'Sin resonancia';
  $('resonanceTag').style.color = res ? 'var(--domain-f)' : 'var(--ink-faint)';
  $('dotF').style.background = res ? 'var(--domain-f)' : 'var(--ink-faint)';
  $('resTag').innerHTML = res ? `ω_r ≈ <b>${fmt(res.wr,2)}</b>` : 'sin resonancia';

  // Auto-encuadrar solo la primera vez, o cuando cambia el régimen (cambia drásticamente la forma)
  const autoKey = sys.regime + '|' + fmt(state.tmax);
  const shouldAutoFit = !hasAutoFitT || autoKey !== prevAutoKey;
  if (shouldAutoFit){ canvasT.autoFit(sys); canvasF.autoFit(sys); hasAutoFitT = true; hasAutoFitF = true; }
  prevAutoKey = autoKey;

  canvasT.draw(sys, color);
  canvasF.draw(sys, REGIME_COLOR[sys.regime]);
  renderAnalysis(sys);
  renderVerify(sys);
}

/* Panel de estado del parser: que se reconocio exactamente y que se resolvio numericamente */
function renderRStatus(sys){
  const row = $('rStatusRow'), box = $('rStatusBox');
  if (!sys.unrecognized.length){
    row.style.display = 'none';
    return;
  }
  row.style.display = '';
  box.innerHTML = `<span class="warn">⚠ No se reconoce forma cerrada para:</span> <b>${sys.unrecognized.join(' + ')}</b><br>` +
                   `Esa parte se resolvió por <b>convolución numérica</b>; el resto del proceso (pasos 1–4) muestra solo la parte con forma cerrada.`;
}


function bindEvents(){
  ['aVal','bVal','cVal','y0Val','v0Val','tmaxVal'].forEach(id=>{
    $(id).addEventListener('input', ()=>{
      let a = +$('aVal').value;
      let c = +$('cVal').value;
      if (a <= 0){ a = 0.1; $('aVal').value = a; }
      if (c <= 0){ c = 0.1; $('cVal').value = c; }
      state.a=a; state.b=+$('bVal').value; state.c=c;
      state.y0=+$('y0Val').value; state.v0=+$('v0Val').value;
      state.tmax=Math.max(0.5, +$('tmaxVal').value);
      recompute();
    });
  });
  $('rExprVal').addEventListener('input', ()=>{
    state.rExpr = $('rExprVal').value;
    recompute();
  });

  $('btnReset').addEventListener('click', ()=>{
    state.a=1; state.b=7; state.c=10; state.rExpr='30'; state.y0=0; state.v0=0; state.tmax=6;
    $('aVal').value=1; $('bVal').value=7; $('cVal').value=10; $('rExprVal').value='30';
    $('y0Val').value=0; $('v0Val').value=0; $('tmaxVal').value=6;
    hasAutoFitT = false; hasAutoFitF = false; // fuerza reencuadre limpio
    recompute();
  });

  // botones de zoom/pan de cada visor
  document.querySelectorAll('.icon-btn[data-zoom]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.zoom; // "t-in" | "t-out" | "t-reset" | "f-in" | "f-out" | "f-reset"
      const [target, action] = key.split('-');
      const cv = target==='t' ? canvasT : canvasF;
      const host = $(target==='t' ? 'hostT' : 'hostF');
      const r = host.getBoundingClientRect();
      if (action==='in') cv.viewport.zoomAt(0.8, r.width/2, r.height/2, r.width, r.height);
      else if (action==='out') cv.viewport.zoomAt(1.25, r.width/2, r.height/2, r.width, r.height);
      else if (action==='reset'){
        const sys = buildSolution(state.a, state.b, state.c, state.y0, state.v0, state.rExpr);
        cv.autoFit(sys);
      }
      const sys2 = buildSolution(state.a, state.b, state.c, state.y0, state.v0, state.rExpr);
      cv.draw(sys2, REGIME_COLOR[sys2.regime]);
    });
  });

  buildToggles();
  window.addEventListener('resize', ()=>{ canvasT.resize(); canvasF.resize(); recompute(); });
}

/* ============================================================
   8.  INIT
   ============================================================ */
function init(){
  canvasT = makeCanvas('canvasT','hostT');
  canvasF = makeFreqCanvas('canvasF','hostF');
  bindEvents();
  canvasT.resize();
  canvasF.resize();
  recompute();
}

function whenReady(){
  if (window.katex){ init(); }
  else setTimeout(whenReady, 60);
}
whenReady();

})();
