/* ============================================================
   Simulador de Respuesta de Segundo Orden
   Ecuaciones diferenciales de orden superior, coeficientes constantes
   y'' + b·y' + k·y = F ,  y(0)=y0 ,  y'(0)=v0
   Motor: solución analítica cerrada (sin dependencias numéricas) + KaTeX

   © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
   Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)
   https://dmbourbaki.github.io/

   Queda prohibida la reproducción, distribución o modificación total
   o parcial de este código sin autorización previa y por escrito del
   autor. Contacto: dmbourbaki@gmail.com
   ============================================================ */

(() => {
'use strict';

/* ---------- Definición de los parámetros elegibles como variable ---------- */
/* F se excluye deliberadamente: no aparece en b²-4k, así que mover F nunca
   cambia el régimen, solo desplaza y_eq = F/k. No aporta valor pedagógico
   como "parámetro deslizable" para contrastar comportamientos. */
const PARAM_DEF = {
  b: { sym:'b', name:'Amortiguamiento', short:'Coeficiente', defaultMin:0, defaultMax:14, step:0.1,
       hint:'b es el coeficiente de amortiguamiento. Con k y F fijos, mover b recorre los cuatro regímenes: sin amortiguamiento (b=0) → subamortiguado → crítico → sobreamortiguado.' },
  k:  { sym:'k', name:'Rigidez', short:'Rigidez', defaultMin:0.5, defaultMax:20, step:0.1,
        hint:'k es la rigidez del sistema. Con b y F fijos, mover k cambia tanto el régimen (vía b²−4k) como el valor de equilibrio y_eq = F/k.' }
};
const OTHER_PARAM = { b:'k', k:'b' }; // el otro parámetro elegible que NO es la variable activa

/* ---------- Estado global ----------
   El Panel A es el sistema de REFERENCIA: totalmente fijo, sin slider.
   El Panel B comparte los dos parámetros no-variables con A, pero su
   parámetro "variable" se controla con un único deslizador.            */
const state = {
  variable: 'b',                  // cuál parámetro (b o k) tiene slider en el Panel B
  fixed: { F:12 },                // parámetros siempre fijos (no elegibles): solo F
  refValue: 5,                    // valor de referencia del parámetro variable (Panel A)
  otherFixed: 6,                  // valor del OTRO parámetro elegible (compartido por A y B)
  varB: 2,                        // valor del parámetro variable en el Panel B
  varRange: { min:0, max:14 },
  y0: 0, v0: 0, tmax: 8,
  show: { equilibrium:true, envelope:true, grid:true }
};

const REGIME_COLOR = {
  over:'#34d6e8', crit:'#f2b417', under:'#ff5d8f', undamped:'#9b7dff'
};
const REGIME_NAME = {
  over:'Sobreamortiguado', crit:'Crítico', under:'Subamortiguado', undamped:'Sin amortiguamiento'
};
const REGIME_DESC = {
  over:'Raíces reales distintas. Retorno lento y monótono al equilibrio, sin oscilar.',
  crit:'Raíz real doble. El retorno más rápido posible sin oscilación.',
  under:'Raíces complejas conjugadas. Oscila mientras decae hacia el equilibrio.',
  undamped:'Raíces imaginarias puras (b=0). Oscilación sostenida, nunca decae.'
};

const $ = id => document.getElementById(id);

/* Construye {b,k,F} efectivos para el Panel A (referencia, siempre fijo) */
function paramsRef(){
  const p = { F: state.fixed.F };
  p[state.variable] = state.refValue;
  p[OTHER_PARAM[state.variable]] = state.otherFixed;
  return p;
}
/* Construye {b,k,F} efectivos para el Panel B (mismo otherFixed y F, variable propio) */
function paramsVar(){
  const p = { F: state.fixed.F };
  p[state.variable] = state.varB;
  p[OTHER_PARAM[state.variable]] = state.otherFixed;
  return p;
}

/* ============================================================
   1.  CLASIFICACIÓN Y SOLUCIÓN ANALÍTICA
   y'' + b y' + k y = F ,  y(0)=y0, y'(0)=v0
   y_eq = F/k  (si k≠0)
   ============================================================ */
function solveSystem(b, k, F, y0, v0){
  const disc = b*b - 4*k;           // discriminante de la ecuación característica
  const yeq = k !== 0 ? F/k : NaN;  // valor de equilibrio (asíntota)
  let regime, roots, yFunc, period=null, omega=null, alpha=null;

  if (b === 0 && k > 0){
    // Sin amortiguamiento: raíces ±i*sqrt(k)
    omega = Math.sqrt(k);
    regime = 'undamped';
    roots = [`${fmt(omega)}i`, `−${fmt(omega)}i`];
    const C1 = y0 - yeq;
    const C2 = v0 / omega;
    yFunc = t => yeq + C1*Math.cos(omega*t) + C2*Math.sin(omega*t);
    period = 2*Math.PI/omega;
  } else if (disc > 1e-9){
    // Sobreamortiguado: raíces reales distintas r1, r2
    const sq = Math.sqrt(disc);
    const r1 = (-b + sq)/2, r2 = (-b - sq)/2;
    regime = 'over';
    roots = [r1, r2];
    // C1*r1 + C2*r2 = v0 ; C1+C2 = y0-yeq
    const A = y0 - yeq;
    const C1 = (v0 - r2*A)/(r1 - r2);
    const C2 = A - C1;
    yFunc = t => yeq + C1*Math.exp(r1*t) + C2*Math.exp(r2*t);
  } else if (Math.abs(disc) <= 1e-9){
    // Crítico: raíz real doble r = -b/2
    const r = -b/2;
    regime = 'crit';
    roots = [r, r];
    const C1 = y0 - yeq;
    const C2 = v0 - r*C1;
    yFunc = t => yeq + (C1 + C2*t)*Math.exp(r*t);
  } else {
    // Subamortiguado: raíces complejas alpha ± i*omega
    alpha = -b/2;
    omega = Math.sqrt(-disc)/2;
    regime = 'under';
    roots = [`${fmt(alpha)} + ${fmt(omega)}i`, `${fmt(alpha)} − ${fmt(omega)}i`];
    const C1 = y0 - yeq;
    const C2 = (v0 - alpha*C1)/omega;
    yFunc = t => yeq + Math.exp(alpha*t)*(C1*Math.cos(omega*t) + C2*Math.sin(omega*t));
    period = 2*Math.PI/omega;
  }

  return { regime, roots, yFunc, yeq, disc, period, omega, alpha, b, k, F, y0, v0 };
}

/* Tiempo de asentamiento aproximado (criterio 2% sobre la envolvente exponencial) */
function settlingTime(sys){
  const { regime, b, alpha } = sys;
  if (regime === 'undamped') return null; // nunca se asienta
  const rate = regime === 'crit' ? b/2 : Math.abs(alpha !== null ? alpha : b/2);
  if (rate <= 1e-9) return null;
  return 3.912 / rate; // ln(50)/rate  ≈ criterio 2%
}

function fmt(x, d=2){
  if (!isFinite(x)) return '—';
  const r = Math.round(x*Math.pow(10,d))/Math.pow(10,d);
  return Object.is(r,-0) ? '0' : String(r);
}

/* ============================================================
   2.  LATEX — ecuación con valores numéricos sustituidos
   ============================================================ */
/* Formatea un término "coef·variable" omitiendo el coeficiente cuando es 1,
   y omitiendo el término completo cuando el coeficiente es 0 (salvo F). */
function termStr(coef, varName){
  const c = fmt(coef, 2);
  if (Math.abs(coef) < 1e-9) return null; // término nulo: se omite (p.ej. b=0)
  if (Math.abs(coef - 1) < 1e-9) return varName;
  if (Math.abs(coef + 1) < 1e-9) return `-${varName}`;
  return `${c}\\,${varName}`;
}

function eqLatexNumeric(b, k, F){
  const parts = [];
  parts.push("y''");
  const bT = termStr(b, "y'");
  if (bT !== null) parts.push(bT.startsWith('-') ? bT : `+ ${bT}`);
  const kT = termStr(k, "y");
  if (kT !== null) parts.push(kT.startsWith('-') ? kT : `+ ${kT}`);
  return `${parts.join(' \\, ')} = ${fmt(F,2)}`;
}

function renderEqLatex(elId, b, k, F){
  const tex = eqLatexNumeric(b,k,F) + ` \\qquad y(0)=${fmt(state.y0)},\\;\\; y'(0)=${fmt(state.v0)}`;
  try { katex.render(tex, $(elId), { throwOnError:false, displayMode:false }); }
  catch(e){ $(elId).textContent = `y'' + ${fmt(b)}y' + ${fmt(k)}y = ${fmt(F)}`; }
}

function solutionLatex(sys){
  const { regime, b, k, F, yeq } = sys;
  const yeqStr = isFinite(yeq) ? fmt(yeq) : 'F/k';
  if (regime === 'over'){
    const [r1,r2] = sys.roots;
    return `y(t) = ${yeqStr} + C_1 e^{${fmt(r1)}t} + C_2 e^{${fmt(r2)}t}`;
  } else if (regime === 'crit'){
    const r = sys.roots[0];
    return `y(t) = ${yeqStr} + (C_1 + C_2 t)\\,e^{${fmt(r)}t}`;
  } else if (regime === 'under'){
    return `y(t) = ${yeqStr} + e^{${fmt(sys.alpha)}t}\\left(C_1\\cos(${fmt(sys.omega)}t) + C_2\\sin(${fmt(sys.omega)}t)\\right)`;
  } else {
    return `y(t) = ${yeqStr} + C_1\\cos(${fmt(sys.omega)}t) + C_2\\sin(${fmt(sys.omega)}t)`;
  }
}

/* ============================================================
   3.  DIBUJO — cada panel tiene su propio canvas independiente
   ============================================================ */
function makePanel(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;

  function resize(){
    DPR = Math.min(window.devicePixelRatio||1, 2);
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W*DPR);
    canvas.height = Math.round(H*DPR);
    canvas.style.width = W+'px';
    canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function draw(sys, color){
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);

    const tmax = state.tmax;
    const N = 600;
    const pts = [];
    let ymin=Infinity, ymax=-Infinity;
    for (let i=0;i<=N;i++){
      const t = tmax*i/N;
      const y = sys.yFunc(t);
      pts.push([t,y]);
      if (isFinite(y)){ if(y<ymin)ymin=y; if(y>ymax)ymax=y; }
    }
    if (isFinite(sys.yeq)){ if(sys.yeq<ymin)ymin=sys.yeq; if(sys.yeq>ymax)ymax=sys.yeq; }
    if (!isFinite(ymin)||!isFinite(ymax)||ymin===ymax){ ymin=-1; ymax=1; }
    const pad = (ymax-ymin)*0.16 || 1;
    ymin -= pad; ymax += pad;

    const t2sx = t => (t/tmax)*W;
    const y2sy = y => H - ( (y-ymin)/(ymax-ymin) )*H;

    // grid
    if (state.show.grid){
      ctx.save();
      ctx.strokeStyle = 'rgba(120,150,200,0.07)';
      ctx.lineWidth = 1;
      const stepT = niceStep(tmax);
      const stepY = niceStep(ymax-ymin);
      ctx.beginPath();
      for (let t=0; t<=tmax; t+=stepT){ const sx=t2sx(t); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      for (let y=Math.ceil(ymin/stepY)*stepY; y<=ymax; y+=stepY){ const sy=y2sy(y); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.stroke();
      ctx.restore();

      // ejes
      ctx.save();
      ctx.strokeStyle='rgba(159,176,208,0.4)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      if (ymin<0 && ymax>0){ const sy=y2sy(0); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.moveTo(t2sx(0),0); ctx.lineTo(t2sx(0),H);
      ctx.stroke();
      ctx.fillStyle='rgba(159,176,208,0.65)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      for (let t=stepT; t<=tmax; t+=stepT){ ctx.fillText(fmt(t,1), t2sx(t)+3, H-6); }
      for (let y=Math.ceil(ymin/stepY)*stepY; y<=ymax; y+=stepY){
        if (Math.abs(y)<1e-9) continue;
        ctx.fillText(fmt(y,1), 5, y2sy(y)-4);
      }
      ctx.restore();
    }

    // envolvente exponencial (solo si oscila o decae con tasa definida)
    if (state.show.envelope && (sys.regime==='under')){
      ctx.save();
      ctx.setLineDash([5,5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1.3;
      const A = sys.y0 - sys.yeq;
      const Camp = Math.sqrt(A*A + ((sys.v0-sys.alpha*A)/sys.omega)*((sys.v0-sys.alpha*A)/sys.omega));
      ctx.beginPath();
      for (let i=0;i<=N;i++){
        const t=tmax*i/N; const env = sys.yeq + Camp*Math.exp(sys.alpha*t);
        const sx=t2sx(t), sy=y2sy(env);
        i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
      }
      ctx.beginPath();
      for (let i=0;i<=N;i++){
        const t=tmax*i/N; const env = sys.yeq - Camp*Math.exp(sys.alpha*t);
        const sx=t2sx(t), sy=y2sy(env);
        i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // línea de equilibrio
    if (state.show.equilibrium && isFinite(sys.yeq) && sys.yeq>=ymin && sys.yeq<=ymax){
      ctx.save();
      ctx.setLineDash([8,6]);
      ctx.strokeStyle = 'rgba(255,210,74,0.55)';
      ctx.lineWidth = 1.6;
      const sy = y2sy(sys.yeq);
      ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,210,74,0.85)'; ctx.font='600 10.5px "Spline Sans Mono", monospace';
      ctx.fillText(`y_eq = ${fmt(sys.yeq)}`, W-110, sy-7);
      ctx.restore();
    }

    // curva principal
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath();
    pts.forEach(([t,y],i)=>{
      const sx=t2sx(t), sy=y2sy(y);
      i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
    });
    ctx.stroke();
    ctx.restore();

    // punto inicial
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(t2sx(0), y2sy(sys.y0), 4.2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  return { resize, draw };
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
   4.  PANELES DE ANÁLISIS (rail derecho)
   ============================================================ */
function renderAnalysis(elId, sys){
  const el = $(elId);
  const color = REGIME_COLOR[sys.regime];
  const rootsStr = sys.roots.map(r => typeof r==='number' ? fmt(r) : r).join(',  ');
  const st = settlingTime(sys);

  let extra = '';
  if (sys.regime==='under' || sys.regime==='undamped'){
    extra = `<div class="row"><span class="rk">Periodo T</span><span class="rv">${fmt(sys.period)} s</span></div>
             <div class="row"><span class="rk">Frecuencia ω</span><span class="rv">${fmt(sys.omega)} rad/s</span></div>`;
  }
  if (st !== null){
    extra += `<div class="row"><span class="rk">Asentamiento (2%)</span><span class="rv">≈ ${fmt(st)} s</span></div>`;
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
      <div class="row"><span class="rk">Discriminante b²−4k</span><span class="rv">${fmt(sys.disc)}</span></div>
      <div class="row"><span class="rk">Raíces características</span><span class="rv">${rootsStr}</span></div>
      <div class="row"><span class="rk">Equilibrio y_eq = F/k</span><span class="rv">${isFinite(sys.yeq)?fmt(sys.yeq):'—'}</span></div>
      ${extra}
    </div>
    <div class="sol-latex" id="${elId}Latex" style="margin-top:12px;padding-top:11px;border-top:1px dashed var(--line-soft);overflow-x:auto"></div>
  `;
  const latexEl = document.getElementById(`${elId}Latex`);
  if (latexEl){
    try { katex.render(solutionLatex(sys), latexEl, { throwOnError:false, displayMode:false }); }
    catch(e){ latexEl.textContent = ''; }
  }
}

/* ============================================================
   5.  SELECTOR DE VARIABLE  (b / k / F)
   El profesor elige cuál de los tres parámetros se controla con
   los deslizadores; los otros dos quedan como entradas fijas.
   ============================================================ */
function buildVarSelect(){
  const box = $('varSelect');
  box.innerHTML = Object.keys(PARAM_DEF).map(key=>{
    const d = PARAM_DEF[key];
    return `<button class="var-btn${state.variable===key?' active':''}" data-key="${key}">
      <span class="vsym">${d.sym}</span>
      <span class="vname">${d.name}</span>
    </button>`;
  }).join('');
  box.querySelectorAll('.var-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.key;
      if (key === state.variable) return;
      // Al cambiar la variable activa, el parámetro que dejaba de ser variable
      // se vuelve el "otro fijo", tomando el valor de referencia anterior.
      const prevOther = state.otherFixed;
      state.otherFixed = state.refValue;
      state.variable = key;
      state.refValue = prevOther;
      state.varB = Math.max(PARAM_DEF[key].defaultMin, prevOther - (PARAM_DEF[key].defaultMax-PARAM_DEF[key].defaultMin)/4);
      state.varRange = { min: PARAM_DEF[key].defaultMin, max: PARAM_DEF[key].defaultMax };
      buildVarSelect();
      syncFixedAndSliderUI();
      recompute();
    });
  });
  $('varHint').textContent = PARAM_DEF[state.variable].hint;
}

/* Sincroniza: input "Valor de referencia" (Panel A), input del "otro" parámetro
   fijo compartido, y el deslizador del Panel B — todo según state.variable */
function syncFixedAndSliderUI(){
  const d = PARAM_DEF[state.variable];
  const otherKey = OTHER_PARAM[state.variable];
  const otherDef = PARAM_DEF[otherKey];

  $('refLabel').textContent = d.short;
  $('refSym').textContent = d.sym;
  $('refVal').value = state.refValue;
  $('refVal').step = d.step;
  $('refVal').min = state.variable==='k' ? 0.1 : '';

  $('varLabelB').textContent = d.short + ' ' + d.sym;
  $('sliderSectionTitleB').textContent = `Variable — Panel B (${d.name})`;
  const varB = $('varB');
  varB.min = state.varRange.min; varB.max = state.varRange.max; varB.step = d.step;
  varB.value = state.varB;
  $('varMin').value = state.varRange.min; $('varMax').value = state.varRange.max;

  $('tagA').innerHTML = `${d.sym} = <b id="bAtag"></b>`;
  $('tagB').innerHTML = `${d.sym} = <b id="bBtag"></b>`;

  // input del otro parámetro elegible (compartido por A y B) + F
  const box = $('fixedParams');
  box.innerHTML = `
    <div class="field"><label>${otherDef.name} <span class="lk">${otherDef.sym}</span></label>
      <input id="otherFixedVal" type="number" value="${state.otherFixed}" step="${otherDef.step}" ${otherKey==='k'?'min="0.1"':''}></div>
    <div class="field"><label>Forzante <span class="lk">F</span></label>
      <input id="fFixedVal" type="number" value="${state.fixed.F}" step="0.5"></div>`;
  $('otherFixedVal').addEventListener('input', ()=>{
    let v = +$('otherFixedVal').value;
    if (otherKey === 'k' && v <= 0) v = 0.1;
    state.otherFixed = v;
    recompute();
  });
  $('fFixedVal').addEventListener('input', ()=>{
    state.fixed.F = +$('fFixedVal').value;
    recompute();
  });
}

/* ============================================================
   6.  TOGGLES
   ============================================================ */
function buildToggles(){
  const items = [
    { key:'equilibrium', label:'Línea de equilibrio (y_eq)' },
    { key:'envelope',    label:'Envolvente exponencial' },
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
let panelA, panelB;

function recompute(){
  const pA = paramsRef();   // Panel A: referencia, siempre fija
  const pB = paramsVar();   // Panel B: mismo otherFixed/F, parámetro variable propio
  const sysA = solveSystem(pA.b, pA.k, pA.F, state.y0, state.v0);
  const sysB = solveSystem(pB.b, pB.k, pB.F, state.y0, state.v0);

  const d = PARAM_DEF[state.variable];
  const dec = d.step<1 ? 2 : 0;
  $('bAtag').textContent = fmt(state.refValue, dec);
  $('bBtag').textContent = fmt(state.varB, dec);
  $('varBReadout').textContent = '  ' + fmt(state.varB, dec);

  // dos ecuaciones grandes dinámicas (referencia y variable)
  renderEqLatex('eqLatexA', pA.b, pA.k, pA.F);
  renderEqLatex('eqLatexB', pB.b, pB.k, pB.F);

  // hint de la barra de paneles
  const otherKey = OTHER_PARAM[state.variable];
  $('hintFixed').innerHTML = `Mismo ${PARAM_DEF[otherKey].sym} = ${fmt(state.otherFixed)}, F = ${fmt(state.fixed.F)} — referencia vs. <b style="color:var(--gold-bright)">${state.variable}</b> variable`;

  // etiquetas de régimen
  const tagA = $('regimeTagA'), tagB = $('regimeTagB');
  tagA.textContent = REGIME_NAME[sysA.regime]; tagA.style.color = REGIME_COLOR[sysA.regime]; tagA.style.borderColor = REGIME_COLOR[sysA.regime]+'88';
  tagB.textContent = REGIME_NAME[sysB.regime]; tagB.style.color = REGIME_COLOR[sysB.regime]; tagB.style.borderColor = REGIME_COLOR[sysB.regime]+'88';
  $('dotA').style.background = REGIME_COLOR[sysA.regime];
  $('dotB').style.background = REGIME_COLOR[sysB.regime];
  $('eqDotA').style.background = REGIME_COLOR[sysA.regime];
  $('eqDotB').style.background = REGIME_COLOR[sysB.regime];

  panelA.draw(sysA, REGIME_COLOR[sysA.regime]);
  panelB.draw(sysB, REGIME_COLOR[sysB.regime]);

  renderAnalysis('analysisA', sysA);
  renderAnalysis('analysisB', sysB);
}

function bindEvents(){
  ['y0Val','v0Val','tmaxVal'].forEach(id=>{
    $(id).addEventListener('input', ()=>{
      state.y0 = +$('y0Val').value; state.v0 = +$('v0Val').value;
      state.tmax = Math.max(0.5, +$('tmaxVal').value);
      recompute();
    });
  });
  $('refVal').addEventListener('input', ()=>{
    let v = +$('refVal').value;
    if (state.variable === 'k' && v <= 0) v = 0.1;
    state.refValue = v;
    recompute();
  });
  $('varB').addEventListener('input', ()=>{ state.varB = +$('varB').value; recompute(); });

  $('varMin').addEventListener('input', ()=>{
    const v = +$('varMin').value;
    if (v < state.varRange.max){ state.varRange.min = v; syncFixedAndSliderUI(); recompute(); }
  });
  $('varMax').addEventListener('input', ()=>{
    const v = +$('varMax').value;
    if (v > state.varRange.min){ state.varRange.max = v; syncFixedAndSliderUI(); recompute(); }
  });

  $('btnSync').addEventListener('click', ()=>{
    state.varB = state.refValue; $('varB').value = state.refValue; recompute();
  });

  $('btnReset').addEventListener('click', ()=>{
    state.variable = 'b';
    state.fixed = { F:12 };
    state.refValue = 5; state.otherFixed = 6; state.varB = 2;
    state.varRange = { min:0, max:14 };
    state.y0 = 0; state.v0 = 0; state.tmax = 8;
    $('y0Val').value = 0; $('v0Val').value = 0; $('tmaxVal').value = 8;
    buildVarSelect(); syncFixedAndSliderUI();
    recompute();
  });

  buildToggles();
  window.addEventListener('resize', ()=>{ panelA.resize(); panelB.resize(); recompute(); });
}

/* ============================================================
   8.  INIT
   ============================================================ */
function init(){
  panelA = makePanel('canvasA','hostA');
  panelB = makePanel('canvasB','hostB');
  buildVarSelect();
  syncFixedAndSliderUI();
  bindEvents();
  panelA.resize(); panelB.resize();
  recompute();
}

function whenReady(){
  if (window.katex){ init(); }
  else setTimeout(whenReady, 60);
}
whenReady();

})();
