/* ============================================================
   Simulador Derivada Viva — OMAI
   Construcción de f(x) por figuras elementales (recta, parábola,
   arco de circunferencia) con derivadas analíticas exactas, o por
   trazo libre (numérico, suavizado). f'(x) y f''(x) se reconstruyen
   en vivo; también se puede dibujar directamente en f' o f'' y
   reconstruir f(x) por integración (con constante ajustable).

   © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
   Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)
   https://dmbourbaki.github.io/
   ============================================================ */

(() => {
'use strict';

const $ = id => document.getElementById(id);
function fmt(x, d=4){
  if (!isFinite(x)) return '—';
  const r = Math.round(x*Math.pow(10,d))/Math.pow(10,d);
  return Object.is(r,-0) ? '0' : String(r);
}
function fmtNum(x, d=3){
  const r = Math.round(x*Math.pow(10,d))/Math.pow(10,d);
  return Object.is(r,-0) ? '0' : String(r);
}

/* ============================================================
   DOMINIO MUESTREADO
   ============================================================ */
const N = 481;
const X_MIN = -10, X_MAX = 10;
const DX = (X_MAX - X_MIN) / (N - 1);
function clampIdx(i){ return Math.max(0, Math.min(N-1, i)); }
function xToIndex(x){ return Math.round((x - X_MIN) / DX); }

const y = [
  new Float64Array(N).fill(NaN),
  new Float64Array(N).fill(NaN),
  new Float64Array(N).fill(NaN),
];
const freehand0 = new Float64Array(N).fill(NaN);
const yRanges = [ {min:-6,max:6}, {min:-6,max:6}, {min:-6,max:6} ];

let masterIndex = null;
const constants = { C0:0, C1:0, C2:0 };
let showGrid = true;

const state = { tool:'freehand' };
const pieces = [];
let pieceIdCounter = 0;
let pendingPoints = [];
let previewPoint = null;

/* ============================================================
   DOM
   ============================================================ */
const canvases = [0,1,2].map(k=>$('canvas-'+k));
const ctxs = canvases.map(c=>c.getContext('2d'));
const hosts = [0,1,2].map(k=>$('host-'+k));
const hints = [0,1,2].map(k=>$('hint-'+k));
const statusEls = [0,1,2].map(k=>$('status-'+k));

/* ============================================================
   MATEMÁTICA NUMÉRICA (trazo libre)
   ============================================================ */
function smooth(arr, radius){
  const out = new Float64Array(arr.length);
  const sigma = Math.max(radius/2, 0.6);
  for (let i=0;i<arr.length;i++){
    if (Number.isNaN(arr[i])){ out[i]=NaN; continue; }
    let sum=0, wsum=0;
    for (let j=-radius;j<=radius;j++){
      const idx=i+j;
      if (idx<0||idx>=arr.length) continue;
      if (Number.isNaN(arr[idx])) continue;
      const w = Math.exp(-(j*j)/(2*sigma*sigma));
      sum += arr[idx]*w; wsum += w;
    }
    out[i] = wsum>0 ? sum/wsum : NaN;
  }
  return out;
}
function derivative(arr, dx){
  const out = new Float64Array(arr.length).fill(NaN);
  for (let i=0;i<arr.length;i++){
    if (Number.isNaN(arr[i])) continue;
    const hasPrev = i>0 && !Number.isNaN(arr[i-1]);
    const hasNext = i<arr.length-1 && !Number.isNaN(arr[i+1]);
    if (hasPrev && hasNext) out[i]=(arr[i+1]-arr[i-1])/(2*dx);
    else if (hasNext) out[i]=(arr[i+1]-arr[i])/dx;
    else if (hasPrev) out[i]=(arr[i]-arr[i-1])/dx;
  }
  return out;
}
function integrate(arr, dx, C){
  const out = new Float64Array(arr.length).fill(NaN);
  let start=-1;
  for (let i=0;i<arr.length;i++){ if (!Number.isNaN(arr[i])){ start=i; break; } }
  if (start===-1) return out;
  out[start]=C;
  for (let i=start+1;i<arr.length;i++){
    if (Number.isNaN(arr[i])||Number.isNaN(arr[i-1])){ out[i]=NaN; continue; }
    out[i] = out[i-1] + ((arr[i]+arr[i-1])/2)*dx;
  }
  return out;
}
function computeAutoRange(arr){
  let mn=Infinity, mx=-Infinity;
  for (let i=0;i<arr.length;i++){ const v=arr[i]; if (Number.isNaN(v)) continue; if (v<mn) mn=v; if (v>mx) mx=v; }
  if (mn===Infinity) return {min:-6,max:6};
  let span = mx-mn;
  if (span<3){ const c=(mx+mn)/2; mn=c-2; mx=c+2; span=4; }
  const pad = span*0.2;
  return { min:mn-pad, max:mx+pad };
}

/* ============================================================
   FORMATEO DE EXPRESIONES (LaTeX de cada pieza)
   ============================================================ */
function insideXMinus(h){
  if (Math.abs(h) < 1e-4) return 'x';
  return `x ${h>=0?'-':'+'} ${fmtNum(Math.abs(h))}`;
}
function signedTerm(x){
  if (Math.abs(x) < 1e-4) return '';
  return (x>=0?' + ':' - ') + fmtNum(Math.abs(x));
}

/* ============================================================
   FÁBRICAS DE PIEZAS (rectas, parábolas, arcos)
   ============================================================ */
function makeLine(p1, p2){
  if (Math.abs(p2.x-p1.x) < DX*1.5) return null;
  const x1=p1.x, y1=p1.y, x2=p2.x, y2=p2.y;
  const m = (y2-y1)/(x2-x1);
  const b = y1 - m*x1;
  const a = Math.min(x1,x2), bnd = Math.max(x1,x2);
  return {
    id: 'p'+(pieceIdCounter++), type:'line', domain:[a,bnd],
    f: x=>m*x+b, d1: ()=>m, d2: ()=>0,
    exprF: `${fmtNum(m)}x${signedTerm(b)}`,
    exprD1: `${fmtNum(m)}`,
    exprD2: `0`
  };
}
function makeParabola(vertex, p2){
  if (Math.abs(p2.x-vertex.x) < DX*1.5) return null;
  const h=vertex.x, k=vertex.y;
  const a = (p2.y-k)/((p2.x-h)*(p2.x-h));
  if (!Number.isFinite(a)) return null;
  const dom = [Math.min(h,p2.x), Math.max(h,p2.x)];
  return {
    id:'p'+(pieceIdCounter++), type:'parabola', domain:dom,
    f: x=>k+a*(x-h)*(x-h), d1: x=>2*a*(x-h), d2: ()=>2*a,
    exprF: `${fmtNum(a)}(${insideXMinus(h)})^2${signedTerm(k)}`,
    exprD1: `${fmtNum(2*a)}(${insideXMinus(h)})`,
    exprD2: `${fmtNum(2*a)}`
  };
}
function makeArc(center, p2){
  const r = Math.hypot(p2.x-center.x, p2.y-center.y);
  if (r < DX*1.5) return null;
  const cx=center.x, cy=center.y;
  const s = p2.y >= cy ? 1 : -1;
  const dom = [cx-r, cx+r];
  const r2 = r*r;
  const sign1 = (-s) < 0 ? '-' : '';
  return {
    id:'p'+(pieceIdCounter++), type:'arc', domain:dom,
    f: x=>{ const v=r2-(x-cx)*(x-cx); if (v<0) return NaN; return cy+s*Math.sqrt(v); },
    d1: x=>{ const v=r2-(x-cx)*(x-cx); if (v<=1e-9) return NaN; return -s*(x-cx)/Math.sqrt(v); },
    d2: x=>{ const v=r2-(x-cx)*(x-cx); if (v<=1e-9) return NaN; return -s*r2/Math.pow(v,1.5); },
    exprF: `${fmtNum(cy)} ${s>0?'+':'-'} \\sqrt{${fmtNum(r2)}-(${insideXMinus(cx)})^2}`,
    exprD1: `${sign1}\\dfrac{${insideXMinus(cx)}}{\\sqrt{${fmtNum(r2)}-(${insideXMinus(cx)})^2}}`,
    exprD2: `${sign1}\\dfrac{${fmtNum(r2)}}{\\left(${fmtNum(r2)}-(${insideXMinus(cx)})^2\\right)^{3/2}}`
  };
}

function clipPieces(newA, newB){
  const result = [];
  for (const p of pieces){
    const [pa,pb] = p.domain;
    if (pb<=newA || pa>=newB){ result.push(p); continue; }
    if (pa < newA && (newA-pa) > DX*2) result.push({ ...p, domain:[pa,newA] });
    if (pb > newB && (pb-newB) > DX*2) result.push({ ...p, domain:[newB,pb] });
  }
  pieces.length = 0;
  pieces.push(...result);
  const i0 = clampIdx(xToIndex(newA)), i1 = clampIdx(xToIndex(newB));
  for (let i=i0;i<=i1;i++) freehand0[i]=NaN;
}

function freehandRuns(){
  const runs = []; let start=null;
  for (let i=0;i<N;i++){
    const has = !Number.isNaN(freehand0[i]);
    if (has && start===null) start=i;
    if (!has && start!==null){ runs.push([X_MIN+start*DX, X_MIN+(i-1)*DX]); start=null; }
  }
  if (start!==null) runs.push([X_MIN+start*DX, X_MIN+(N-1)*DX]);
  return runs;
}

/* ============================================================
   RECONSTRUCCIÓN
   ============================================================ */
function rebuildF0(){
  const coverage = new Array(N).fill(null);
  for (const p of pieces){
    const i0 = clampIdx(xToIndex(p.domain[0])), i1 = clampIdx(xToIndex(p.domain[1]));
    for (let i=i0;i<=i1;i++) coverage[i]=p;
  }
  const y0 = new Float64Array(N);
  for (let i=0;i<N;i++){
    const p = coverage[i];
    if (p){ const x=X_MIN+i*DX; const v=p.f(x); y0[i]=Number.isFinite(v)?v:NaN; }
    else y0[i]=freehand0[i];
  }
  const y1 = new Float64Array(N).fill(NaN);
  const y2 = new Float64Array(N).fill(NaN);
  for (let i=0;i<N;i++){
    const p = coverage[i];
    if (p){
      const x=X_MIN+i*DX;
      const v1=p.d1(x), v2=p.d2(x);
      y1[i]=Number.isFinite(v1)?v1:NaN;
      y2[i]=Number.isFinite(v2)?v2:NaN;
    }
  }
  const s0 = smooth(y0,4);
  const numD1 = derivative(s0,DX);
  const s1 = smooth(numD1,4);
  const numD2 = derivative(s1,DX);
  for (let i=0;i<N;i++){
    if (!coverage[i] && !Number.isNaN(y0[i])){ y1[i]=numD1[i]; y2[i]=numD2[i]; }
  }
  y[0]=y0; y[1]=y1; y[2]=y2;
}

function recomputeMaster(){
  if (masterIndex===0) rebuildF0();
  else if (masterIndex===1){
    const s1 = smooth(y[1],4);
    y[2] = derivative(s1,DX);
    y[0] = integrate(s1,DX,constants.C0);
  } else if (masterIndex===2){
    const s2 = smooth(y[2],4);
    y[1] = integrate(s2,DX,constants.C1);
    const s1b = smooth(y[1],2);
    y[0] = integrate(s1b,DX,constants.C2);
  }
  updateStatusLabels();
  updateConstUI();
  updateEquations();
  updateAnalysis();
}

function switchMaster(newIndex){
  if (masterIndex===newIndex) return;
  masterIndex = newIndex;
  pieces.length = 0;
  freehand0.fill(NaN);
  y[0].fill(NaN); y[1].fill(NaN); y[2].fill(NaN);
  constants.C0=0; constants.C1=0; constants.C2=0;
  pendingPoints = []; previewPoint = null;
  for (let k=0;k<3;k++) hints[k].classList.remove('hidden');
  renderPieceList();
}

/* ============================================================
   ECUACIONES (LaTeX)
   ============================================================ */
function renderKatex(el, tex, note){
  if (tex){
    el.innerHTML = '';
    try { katex.render(tex, el, { throwOnError:false, displayMode:true }); }
    catch(e){ el.textContent = tex; }
  } else {
    el.innerHTML = `<div class="mb-note">${note||''}</div>`;
  }
}
function buildCases(prefix, entries){
  if (entries.length===0) return null;
  if (entries.length===1) return `${prefix} = ${entries[0].expr}`;
  let s = `${prefix} = \\begin{cases}`;
  entries.forEach(e=>{ s += `${e.expr} & x\\in[${fmtNum(e.domain[0])},\\ ${fmtNum(e.domain[1])}] \\\\`; });
  s += `\\end{cases}`;
  return s;
}
function updateEquations(){
  const elF=$('eqF'), elF1=$('eqF1'), elF2=$('eqF2');
  if (masterIndex===0){
    const runs = freehandRuns();
    const entriesF = pieces.map(p=>({expr:p.exprF, domain:p.domain}))
      .concat(runs.map(r=>({expr:'\\text{trazo libre}', domain:r})))
      .sort((a,b)=>a.domain[0]-b.domain[0]);
    renderKatex(elF, buildCases('f(x)', entriesF), 'Dibuja o coloca figuras para definir f(x).');

    if (runs.length===0 && pieces.length>0){
      const e1 = pieces.map(p=>({expr:p.exprD1, domain:p.domain})).sort((a,b)=>a.domain[0]-b.domain[0]);
      const e2 = pieces.map(p=>({expr:p.exprD2, domain:p.domain})).sort((a,b)=>a.domain[0]-b.domain[0]);
      renderKatex(elF1, buildCases("f'(x)", e1));
      renderKatex(elF2, buildCases("f''(x)", e2));
    } else {
      renderKatex(elF1, null, 'Sin fórmula cerrada donde hay trazo libre — se calcula numéricamente.');
      renderKatex(elF2, null, 'Sin fórmula cerrada donde hay trazo libre — se calcula numéricamente.');
    }
  } else if (masterIndex===1){
    renderKatex(elF, null, 'f(x) reconstruida por integración numérica de f\u2032(x).');
    renderKatex(elF1, null, 'f\u2032(x) es un trazo libre dibujado directamente — sin fórmula cerrada.');
    renderKatex(elF2, null, 'f\u2033(x) calculada numéricamente a partir del trazo.');
  } else if (masterIndex===2){
    renderKatex(elF, null, 'f(x) reconstruida por doble integración de f\u2033(x).');
    renderKatex(elF1, null, 'f\u2032(x) reconstruida por integración de f\u2033(x).');
    renderKatex(elF2, null, 'f\u2033(x) es un trazo libre dibujado directamente — sin fórmula cerrada.');
  } else {
    renderKatex(elF, null, 'Elige una herramienta y dibuja en cualquiera de los tres paneles para empezar.');
    renderKatex(elF1, null, '—');
    renderKatex(elF2, null, '—');
  }
}

/* ============================================================
   ANÁLISIS
   ============================================================ */
function updateAnalysis(){
  const el = $('analysisMain');
  let contInfo = '—';
  if (masterIndex===0 && pieces.length>1){
    let jumps=0, kinks=0;
    for (let i=0;i<pieces.length-1;i++){
      const A=pieces[i], B=pieces[i+1];
      if (Math.abs(A.domain[1]-B.domain[0]) < DX*2){
        const yA=A.f(A.domain[1]), yB=B.f(B.domain[0]);
        if (Math.abs(yA-yB) > 0.05) jumps++;
        else { const dA=A.d1(A.domain[1]), dB=B.d1(B.domain[0]); if (Math.abs(dA-dB) > 0.05) kinks++; }
      }
    }
    contInfo = jumps>0 ? `${jumps} salto(s)` : (kinks>0 ? `continua, ${kinks} pico(s)` : 'suave (C¹)');
  } else if (masterIndex!==null){
    contInfo = 'numérica';
  }
  const panelName = masterIndex===null ? '—' : ['f(x)',"f'(x)","f''(x)"][masterIndex];
  const freeCount = masterIndex===0 ? freehandRuns().length : (masterIndex===null ? 0 : 1);
  el.innerHTML = `
    <div class="readout-grid">
      <div class="row"><span class="rk">Panel activo</span><span class="rv">${panelName}</span></div>
      <div class="row"><span class="rk">Piezas analíticas</span><span class="rv">${pieces.length}</span></div>
      <div class="row"><span class="rk">Tramos de trazo libre</span><span class="rv">${freeCount}</span></div>
      <div class="row"><span class="rk">Continuidad de f</span><span class="rv">${contInfo}</span></div>
    </div>`;
}

/* ============================================================
   UI: lista de piezas, constantes, toggles
   ============================================================ */
function renderPieceList(){
  const el = $('pieceList');
  if (pieces.length===0){
    el.innerHTML = '<div class="piece-empty">Aún no hay piezas. Elige una herramienta y haz clic en el panel f(x).</div>';
    return;
  }
  el.innerHTML = '';
  const typeNames = { line:'Recta', parabola:'Parábola', arc:'Arco' };
  pieces.forEach(p=>{
    const row = document.createElement('div'); row.className='piece-item';
    const info = document.createElement('div'); info.className='pinfo';
    const typeEl = document.createElement('div'); typeEl.className='ptype';
    typeEl.textContent = `${typeNames[p.type]} · [${fmtNum(p.domain[0])}, ${fmtNum(p.domain[1])}]`;
    const formEl = document.createElement('div'); formEl.className='pformula';
    info.appendChild(typeEl); info.appendChild(formEl);
    const del = document.createElement('button'); del.className='piece-del'; del.textContent='×';
    del.addEventListener('click', ()=>{
      const idx = pieces.findIndex(q=>q.id===p.id);
      if (idx>=0) pieces.splice(idx,1);
      recomputeMaster(); renderPieceList();
    });
    row.appendChild(info); row.appendChild(del);
    el.appendChild(row);
    try { katex.render(`f(x)=${p.exprF}`, formEl, { throwOnError:false, displayMode:false }); }
    catch(e){ formEl.textContent = 'f(x)=' + p.exprF; }
  });
}

function makeSlider(label, value, min, max, onInput){
  const wrap = document.createElement('div'); wrap.className='cfield';
  const lab = document.createElement('span'); lab.textContent = label+': '+value.toFixed(1);
  const input = document.createElement('input');
  input.type='range'; input.min=String(min); input.max=String(max); input.step='0.1'; input.value=String(value);
  input.addEventListener('input', ()=>{
    const v = parseFloat(input.value);
    lab.textContent = label+': '+v.toFixed(1);
    onInput(v);
  });
  wrap.appendChild(lab); wrap.appendChild(input);
  return wrap;
}
function updateConstUI(){
  const el = $('constControls');
  el.innerHTML = '';
  if (masterIndex===1){
    el.appendChild(makeSlider('C · desplaza f(x)', constants.C0, -6, 6, v=>{ constants.C0=v; recomputeMaster(); }));
  } else if (masterIndex===2){
    el.appendChild(makeSlider('C₁ · pendiente de f(x)', constants.C1, -3, 3, v=>{ constants.C1=v; recomputeMaster(); }));
    el.appendChild(makeSlider('C₂ · desplaza f(x)', constants.C2, -6, 6, v=>{ constants.C2=v; recomputeMaster(); }));
  } else {
    el.innerHTML = '<div class="const-empty">Solo aparece al dibujar directamente en f\u2032(x) o f\u2033(x).</div>';
  }
}
function updateStatusLabels(){
  for (let k=0;k<3;k++){
    if (masterIndex===null) statusEls[k].textContent = 'esperando';
    else if (masterIndex===k) statusEls[k].textContent = (k===0 ? 'autoría' : 'trazo original');
    else statusEls[k].textContent = 'reconstruida';
  }
}
function buildToggles(){
  const box = $('toggles');
  box.innerHTML = `
    <label class="toggle">
      <input type="checkbox" id="chkGrid" checked>
      <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
      <span class="tlab">Cuadrícula</span>
    </label>`;
  $('chkGrid').addEventListener('change', e=>{ showGrid = e.target.checked; });
}

/* ============================================================
   INTERACCIÓN: puntero (trazo libre + colocación de figuras)
   ============================================================ */
let drawing = false, activePanel = null, lastIdx = null;

function pixelToMath(k, clientX, clientY){
  const canvas = canvases[k];
  const rect = canvas.getBoundingClientRect();
  const px = clientX-rect.left, py = clientY-rect.top;
  const xMath = X_MIN + (px/rect.width)*(X_MAX-X_MIN);
  const range = yRanges[k];
  const yMath = range.min + (1-py/rect.height)*(range.max-range.min);
  return { x:xMath, y:yMath };
}
function targetArray(k){ return k===0 ? freehand0 : y[k]; }
function paint(k, pt){
  const arr = targetArray(k);
  const idx = clampIdx(xToIndex(pt.x));
  if (lastIdx===null){ arr[idx]=pt.y; }
  else {
    const i0=lastIdx.idx, y0v=lastIdx.y;
    if (idx===i0) arr[idx]=pt.y;
    else {
      const dir = idx>i0?1:-1;
      for (let i=i0;;i+=dir){ const t=(i-i0)/(idx-i0); arr[i]=y0v+(pt.y-y0v)*t; if (i===idx) break; }
    }
  }
  lastIdx = { idx, y:pt.y };
  hints[k].classList.add('hidden');
  recomputeMaster();
}
function handleShapeClick(pt){
  if (pendingPoints.length===0){
    pendingPoints.push(pt);
    previewPoint = { x:pt.x, y:pt.y };
  } else {
    const p1 = pendingPoints[0];
    let piece = null;
    if (state.tool==='line') piece = makeLine(p1, pt);
    else if (state.tool==='parabola') piece = makeParabola(p1, pt);
    else if (state.tool==='arc') piece = makeArc(p1, pt);
    if (piece){
      clipPieces(piece.domain[0], piece.domain[1]);
      pieces.push(piece);
      pieces.sort((a,b)=>a.domain[0]-b.domain[0]);
      recomputeMaster();
      renderPieceList();
      hints[0].classList.add('hidden');
    }
    pendingPoints = []; previewPoint = null;
  }
}

canvases.forEach((canvas, k)=>{
  canvas.addEventListener('pointerdown', e=>{
    e.preventDefault();
    const pt = pixelToMath(k, e.clientX, e.clientY);
    if (k===0 && state.tool!=='freehand'){
      if (masterIndex!==0) switchMaster(0);
      handleShapeClick(pt);
      return;
    }
    if (masterIndex!==k) switchMaster(k);
    drawing = true; activePanel = k; lastIdx = null;
    canvas.setPointerCapture(e.pointerId);
    paint(k, pt);
  });
  canvas.addEventListener('pointermove', e=>{
    const pt = pixelToMath(k, e.clientX, e.clientY);
    if (k===0 && state.tool!=='freehand'){
      if (pendingPoints.length===1) previewPoint = pt;
      return;
    }
    if (drawing && activePanel===k) paint(k, pt);
  });
  canvas.addEventListener('contextmenu', e=>{
    if (k===0 && state.tool!=='freehand'){ e.preventDefault(); pendingPoints=[]; previewPoint=null; }
  });
});
window.addEventListener('pointerup', ()=>{ drawing=false; lastIdx=null; });
window.addEventListener('keydown', e=>{ if (e.key==='Escape'){ pendingPoints=[]; previewPoint=null; } });

/* ============================================================
   RENDER
   ============================================================ */
function niceStep(range){
  const raw = range/5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw/mag;
  let step;
  if (norm<1.5) step=1; else if (norm<3.5) step=2; else if (norm<7.5) step=5; else step=10;
  return step*mag;
}
function resizeCanvas(canvas){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width*dpr));
  canvas.height = Math.max(1, Math.round(rect.height*dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function resizeAll(){ canvases.forEach(resizeCanvas); }

function drawPanel(k){
  const canvas = canvases[k], ctx = ctxs[k];
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  const range = yRanges[k];
  ctx.clearRect(0,0,w,h);

  const xToPx = x => ((x-X_MIN)/(X_MAX-X_MIN))*w;
  const yToPx = v => h - ((v-range.min)/(range.max-range.min))*h;

  if (showGrid){
    ctx.save();
    ctx.strokeStyle = 'rgba(120,150,200,0.07)';
    ctx.lineWidth = 1;
    const stepX = niceStep(X_MAX-X_MIN);
    for (let gx=Math.ceil(X_MIN/stepX)*stepX; gx<=X_MAX; gx+=stepX){
      const px=xToPx(gx); ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,h); ctx.stroke();
    }
    const stepY = niceStep(range.max-range.min);
    for (let gy=Math.ceil(range.min/stepY)*stepY; gy<=range.max; gy+=stepY){
      const py=yToPx(gy); ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(w,py); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(159,176,208,0.4)'; ctx.lineWidth=1.3;
    ctx.beginPath();
    if (range.min<0 && range.max>0){ const py0=yToPx(0); ctx.moveTo(0,py0); ctx.lineTo(w,py0); }
    const px0 = xToPx(0); ctx.moveTo(px0,0); ctx.lineTo(px0,h);
    ctx.stroke();
    ctx.restore();
  }

  const arr = y[k];
  const isMaster = masterIndex===k;
  ctx.save();
  ctx.strokeStyle = isMaster ? '#ffd24a' : '#34d6e8';
  ctx.lineWidth = isMaster ? 2.6 : 2.2;
  ctx.lineJoin='round'; ctx.lineCap='round';
  if (isMaster){ ctx.shadowColor='#ffd24a'; ctx.shadowBlur=5; }
  ctx.beginPath();
  let penDown=false;
  for (let i=0;i<N;i++){
    const v = arr[i];
    if (Number.isNaN(v)){ penDown=false; continue; }
    const x = X_MIN+i*DX;
    const px=xToPx(x), py=yToPx(v);
    if (!penDown){ ctx.moveTo(px,py); penDown=true; } else ctx.lineTo(px,py);
  }
  ctx.stroke();
  ctx.restore();

  if (k===0 && state.tool!=='freehand' && pendingPoints.length===1 && previewPoint){
    let tempPiece = null;
    if (state.tool==='line') tempPiece = makeLine(pendingPoints[0], previewPoint);
    else if (state.tool==='parabola') tempPiece = makeParabola(pendingPoints[0], previewPoint);
    else if (state.tool==='arc') tempPiece = makeArc(pendingPoints[0], previewPoint);
    ctx.save();
    ctx.setLineDash([5,5]);
    ctx.strokeStyle = '#34d6e8';
    ctx.lineWidth = 2;
    if (tempPiece){
      ctx.beginPath();
      let started=false;
      for (let i=0;i<=60;i++){
        const x = tempPiece.domain[0] + (tempPiece.domain[1]-tempPiece.domain[0])*i/60;
        const yv = tempPiece.f(x);
        if (!Number.isFinite(yv)){ started=false; continue; }
        const sx=xToPx(x), sy=yToPx(yv);
        if (!started){ ctx.moveTo(sx,sy); started=true; } else ctx.lineTo(sx,sy);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffd24a';
    [pendingPoints[0], previewPoint].forEach(pnt=>{
      ctx.beginPath(); ctx.arc(xToPx(pnt.x), yToPx(pnt.y), 4, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }
}

function tick(){
  for (let k=0;k<3;k++){
    const target = computeAutoRange(y[k]);
    const r = yRanges[k];
    r.min += (target.min-r.min)*0.12;
    r.max += (target.max-r.max)*0.12;
    drawPanel(k);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   BOTONES DE HERRAMIENTA Y REINICIO
   ============================================================ */
function bindToolButtons(){
  document.querySelectorAll('#toolSelect .tool-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.tool = btn.dataset.tool;
      document.querySelectorAll('#toolSelect .tool-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      pendingPoints = []; previewPoint = null;
    });
  });
}
function bindReset(){
  $('btnReset').addEventListener('click', ()=>{
    masterIndex = null;
    pieces.length = 0;
    freehand0.fill(NaN);
    y[0].fill(NaN); y[1].fill(NaN); y[2].fill(NaN);
    constants.C0=0; constants.C1=0; constants.C2=0;
    pendingPoints=[]; previewPoint=null;
    state.tool='freehand';
    document.querySelectorAll('#toolSelect .tool-btn').forEach(b=>b.classList.remove('active'));
    document.querySelector('#toolSelect .tool-btn[data-tool="freehand"]').classList.add('active');
    for (let k=0;k<3;k++){ hints[k].classList.remove('hidden'); yRanges[k]={min:-6,max:6}; }
    renderPieceList();
    updateStatusLabels();
    updateConstUI();
    updateEquations();
    updateAnalysis();
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init(){
  resizeAll();
  bindToolButtons();
  bindReset();
  buildToggles();
  renderPieceList();
  updateStatusLabels();
  updateConstUI();
  updateEquations();
  updateAnalysis();
  window.addEventListener('resize', resizeAll);
  requestAnimationFrame(tick);
}
function whenReady(){
  if (window.katex) init();
  else setTimeout(whenReady, 60);
}
whenReady();

})();
