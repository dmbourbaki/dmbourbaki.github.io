/* ============================================================
   Simulador de Campo de Direcciones
   Ecuaciones Diferenciales de primer orden  y' = f(x, y)
   Motor: math.js (evaluación) + KaTeX (LaTeX) + RK4 (curvas)

   © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
   Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)
   https://dmbourbaki.github.io/

   Queda prohibida la reproducción, distribución o modificación total
   o parcial de este código sin autorización previa y por escrito del
   autor. Contacto: dmbourbaki@gmail.com
   ============================================================ */

(() => {
'use strict';

/* ---------- Estado global ---------- */
const state = {
  expr: 'sin(y)',
  compiled: null,
  view: { xmin:-5, xmax:5, ymin:-4, ymax:4 },
  density: 18,
  arrowSize: 14,
  show: {
    nullclines: true,   // fondo por signo
    slopeColor: true,    // color por pendiente
    axes: true,          // ejes y cuadrícula
    highlightNull: true, // resaltar nullclines (y'=0)
    equilibria: true     // detectar equilibrios
  },
  curves: [],            // [{x0,y0,color,points:[[x,y]...]}]
  hover: null
};

const CURVE_COLORS = ['#4fd98a','#34d6e8','#9b7dff','#ffd24a','#ff9a3c','#ff5d8f','#f2b417','#5ad1ff'];

/* ---------- Elementos ---------- */
const $ = id => document.getElementById(id);
const canvas = $('field');
const ctx = canvas.getContext('2d', { willReadFrequently:true });
const host = $('canvasHost');
const readout = $('readout');

/* ============================================================
   1.  PARSER + LATEX
   ============================================================ */
function compileExpr(str){
  if (!str || !str.trim()) throw new Error('vacía');
  // math.js compila; validamos evaluando en un punto.
  const node = math.parse(str);
  const code = node.compile();
  code.evaluate({ x:0.37, y:0.41, t:0.37, e:Math.E, pi:Math.PI });
  return { code, node };
}

// Conversión a LaTeX. math.js trae node.toTex(); afinamos algunos detalles.
function toLatex(str){
  try {
    const node = math.parse(str);
    let tex = node.toTex({ parenthesis:'auto', implicit:'hide' });
    return tex;
  } catch(e){
    return null;
  }
}

function evalF(x,y){
  if (!state.compiled) return NaN;
  try {
    const v = state.compiled.code.evaluate({ x, y, t:x, e:Math.E, pi:Math.PI });
    return (typeof v === 'number' && isFinite(v)) ? v : NaN;
  } catch(e){ return NaN; }
}

function renderLatex(){
  const latexEl = $('eqLatex');
  const statusEl = $('eqStatus');
  const tex = toLatex(state.expr);
  let ok = false;
  try { compileExpr(state.expr); ok = true; } catch(e){ ok = false; }

  if (tex && ok){
    try {
      katex.render('\\frac{dy}{dx} = ' + tex, latexEl, { throwOnError:false, displayMode:false });
      latexEl.classList.remove('error');
    } catch(e){
      latexEl.textContent = 'y\' = ' + state.expr;
    }
    statusEl.textContent = '✓'; statusEl.className = 'eq-status ok';
  } else {
    latexEl.textContent = 'Expresión no válida';
    latexEl.classList.add('error');
    statusEl.textContent = '✕'; statusEl.className = 'eq-status err';
  }

  // brand mini-render
  ['brandEq','footEq'].forEach(id=>{
    const el = $(id); if(!el) return;
    if (tex){ try{ katex.render("y' = "+tex, el, {throwOnError:false}); }catch(_){ el.textContent="y' = "+state.expr; } }
    else el.textContent = "y' = "+state.expr;
  });

  return ok;
}

/* ============================================================
   2.  COORDENADAS  (mundo  <->  pantalla)
   ============================================================ */
let DPR = 1, W = 0, H = 0;
function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const r = host.getBoundingClientRect();
  W = r.width; H = r.height;
  canvas.width = Math.round(W*DPR);
  canvas.height = Math.round(H*DPR);
  canvas.style.width = W+'px';
  canvas.style.height = H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  draw();
}
const wx2sx = wx => ( (wx - state.view.xmin)/(state.view.xmax-state.view.xmin) )*W;
const wy2sy = wy => ( 1 - (wy - state.view.ymin)/(state.view.ymax-state.view.ymin) )*H;
const sx2wx = sx => state.view.xmin + (sx/W)*(state.view.xmax-state.view.xmin);
const sy2wy = sy => state.view.ymin + (1 - sy/H)*(state.view.ymax-state.view.ymin);

/* ============================================================
   3.  COLOR POR PENDIENTE
   ============================================================ */
// Mapea |slope| -> color (cian/verde suave  ->  ámbar/rosa fuerte)
function slopeColor(slope, alpha=1){
  if (!isFinite(slope)) return `rgba(120,140,170,${alpha})`;
  const ang = Math.atan(Math.abs(slope)) / (Math.PI/2); // 0..1
  // gradiente: cian(190) -> verde(150) -> dorado(45) -> rosa(335)
  let r,g,b;
  if (ang < 0.5){
    const t = ang/0.5;            // cian -> verde
    r = lerp(52,79,t); g = lerp(214,217,t); b = lerp(232,138,t);
  } else {
    const t = (ang-0.5)/0.5;      // dorado -> rosa
    r = lerp(242,255,t); g = lerp(180,93,t); b = lerp(23,143,t);
  }
  return `rgba(${r|0},${g|0},${b|0},${alpha})`;
}
const lerp = (a,b,t)=>a+(b-a)*t;

/* ============================================================
   4.  DIBUJO PRINCIPAL
   ============================================================ */
function draw(){
  if (!W || !H) return;
  ctx.clearRect(0,0,W,H);

  if (state.show.nullclines) drawSignBackground();
  if (state.show.axes) drawGrid();
  drawArrows();
  if (state.show.highlightNull || state.show.equilibria) drawEquilibriaLines();
  drawCurves();
  if (state.show.axes) drawAxes();
  if (state.hover) drawHoverArrow();
}

/* --- Fondo por signo de y' (regiones crecientes / decrecientes) --- */
function drawSignBackground(){
  const cell = 6; // resolución del muestreo en px
  // Dibujamos rectángulos coloreados según el signo de y' (no requiere getImageData)
  ctx.save();
  for (let sy=0; sy<H; sy+=cell){
    for (let sx=0; sx<W; sx+=cell){
      const wx = sx2wx(sx+cell/2), wy = sy2wy(sy+cell/2);
      const f = evalF(wx,wy);
      if (isNaN(f)) continue;
      const mag = Math.min(1, Math.abs(f)/3);
      if (f > 0) ctx.fillStyle = `rgba(79,217,138,${0.018+0.05*mag})`;   // creciente: verde
      else if (f < 0) ctx.fillStyle = `rgba(255,93,143,${0.018+0.05*mag})`; // decreciente: rosa
      else continue;
      ctx.fillRect(sx,sy,cell+0.6,cell+0.6);
    }
  }
  ctx.restore();
}

/* --- Cuadrícula --- */
function drawGrid(){
  ctx.save();
  ctx.lineWidth = 1;
  const stepX = niceStep(state.view.xmax-state.view.xmin);
  const stepY = niceStep(state.view.ymax-state.view.ymin);
  ctx.strokeStyle = 'rgba(120,150,200,0.06)';
  ctx.beginPath();
  for (let x=Math.ceil(state.view.xmin/stepX)*stepX; x<=state.view.xmax; x+=stepX){
    const sx = wx2sx(x); ctx.moveTo(sx,0); ctx.lineTo(sx,H);
  }
  for (let y=Math.ceil(state.view.ymin/stepY)*stepY; y<=state.view.ymax; y+=stepY){
    const sy = wy2sy(y); ctx.moveTo(0,sy); ctx.lineTo(W,sy);
  }
  ctx.stroke();
  ctx.restore();
}

/* --- Flechas del campo --- */
function drawArrows(){
  const n = state.density;
  const halfLen = state.arrowSize;
  const padX = (state.view.xmax-state.view.xmin)/n/2;
  const padY = (state.view.ymax-state.view.ymin)/n/2;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i=0;i<n;i++){
    for (let j=0;j<n;j++){
      const wx = state.view.xmin + padX + i*(state.view.xmax-state.view.xmin)/n;
      const wy = state.view.ymin + padY + j*(state.view.ymax-state.view.ymin)/n;
      const slope = evalF(wx,wy);
      if (isNaN(slope)) continue;

      const sx = wx2sx(wx), sy = wy2sy(wy);
      // vector unitario (dx, dy) en pantalla. dy negativo porque y pantalla invertido.
      let ang = Math.atan(slope);
      let dx = Math.cos(ang), dy = -Math.sin(ang);
      // pendiente casi vertical
      if (!isFinite(slope) || Math.abs(slope) > 1e6){ dx = 0; dy = -1; }

      const col = state.show.slopeColor ? slopeColor(slope, 0.92) : 'rgba(242,180,23,0.85)';
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = 1.7;

      const x1 = sx - dx*halfLen, y1 = sy - dy*halfLen;
      const x2 = sx + dx*halfLen, y2 = sy + dy*halfLen;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      // cabeza de flecha
      const ah = halfLen*0.5;
      const aAng = Math.atan2(dy,dx);
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2 - ah*Math.cos(aAng-0.42), y2 - ah*Math.sin(aAng-0.42));
      ctx.lineTo(x2 - ah*Math.cos(aAng+0.42), y2 - ah*Math.sin(aAng+0.42));
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}

/* --- Ejes con etiquetas --- */
function drawAxes(){
  ctx.save();
  ctx.strokeStyle = 'rgba(159,176,208,0.4)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (state.view.ymin < 0 && state.view.ymax > 0){
    const sy = wy2sy(0); ctx.moveTo(0,sy); ctx.lineTo(W,sy);
  }
  if (state.view.xmin < 0 && state.view.xmax > 0){
    const sx = wx2sx(0); ctx.moveTo(sx,0); ctx.lineTo(sx,H);
  }
  ctx.stroke();

  // etiquetas numéricas
  ctx.fillStyle = 'rgba(159,176,208,0.65)';
  ctx.font = '11px "Spline Sans Mono", monospace';
  const stepX = niceStep(state.view.xmax-state.view.xmin);
  const stepY = niceStep(state.view.ymax-state.view.ymin);
  const sy0 = (state.view.ymin<0&&state.view.ymax>0) ? wy2sy(0) : H-16;
  for (let x=Math.ceil(state.view.xmin/stepX)*stepX; x<=state.view.xmax; x+=stepX){
    if (Math.abs(x)<1e-9) continue;
    ctx.fillText(fmt(x), wx2sx(x)+3, sy0-5);
  }
  const sx0 = (state.view.xmin<0&&state.view.xmax>0) ? wx2sx(0) : 8;
  for (let y=Math.ceil(state.view.ymin/stepY)*stepY; y<=state.view.ymax; y+=stepY){
    if (Math.abs(y)<1e-9) continue;
    ctx.fillText(fmt(y), sx0+5, wy2sy(y)-4);
  }
  ctx.restore();
}

/* ============================================================
   5.  EQUILIBRIOS  (ceros de y' que NO dependen de x => y constante)
   Buscamos valores y* tal que f(x,y*)=0 para todo x  (rectas y=cte).
   Estrategia: muestreamos y, exigimos f≈0 en varias x, refinamos por bisección.
   ============================================================ */
let equilibriaCache = [];
function findEquilibria(){
  equilibriaCache = [];
  if (!state.compiled || !state.show.equilibria) { renderEquilibriaPanel(); return; }

  const xs = [state.view.xmin*0.6, 0.13, state.view.xmax*0.6, -1.7, 2.3];
  const ymin = state.view.ymin, ymax = state.view.ymax;
  const N = 600;
  const g = y => {
    // media de f sobre varias x; si es equilibrio horizontal será ~0 en todas
    let s=0,c=0;
    for (const xv of xs){ const v=evalF(xv,y); if(isFinite(v)){s+=v;c++;} }
    return c? s/c : NaN;
  };
  // verifica que sea independiente de x (varianza pequeña)
  const indep = y => {
    let vals=[]; for(const xv of xs){const v=evalF(xv,y); if(isFinite(v))vals.push(v);}
    if(vals.length<2) return false;
    const m=vals.reduce((a,b)=>a+b,0)/vals.length;
    const varc=vals.reduce((a,b)=>a+(b-m)*(b-m),0)/vals.length;
    return varc < 1e-4;
  };

  let prevY = ymin, prevG = g(ymin);
  const found = [];
  for (let k=1;k<=N;k++){
    const y = ymin + (ymax-ymin)*k/N;
    const gv = g(y);
    if (isFinite(prevG) && isFinite(gv) && prevG*gv < 0){
      // bisección
      let a=prevY,b=y,fa=prevG;
      for (let it=0; it<40; it++){
        const m=(a+b)/2, fm=g(m);
        if (fa*fm<=0){ b=m; } else { a=m; fa=fm; }
      }
      const root=(a+b)/2;
      if (indep(root) && !found.some(r=>Math.abs(r-root)<1e-3)) found.push(root);
    } else if (isFinite(gv) && Math.abs(gv)<1e-7 && indep(y)){
      if(!found.some(r=>Math.abs(r-y)<1e-3)) found.push(y);
    }
    prevY=y; prevG=gv;
  }

  // clasificar estabilidad: signo de f justo debajo y encima
  for (const y0 of found){
    const eps = (ymax-ymin)*0.012;
    const below = g(y0-eps), above = g(y0+eps);
    let type='semi', label='Semiestable';
    if (below>0 && above<0){ type='stable'; label='Estable (sumidero)'; }
    else if (below<0 && above>0){ type='unstable'; label='Inestable (fuente)'; }
    else { type='semi'; label='Semiestable'; }
    equilibriaCache.push({ y:y0, type, label });
  }
  equilibriaCache.sort((a,b)=>b.y-a.y);
  renderEquilibriaPanel();
}

function drawEquilibriaLines(){
  if (!equilibriaCache.length) return;
  ctx.save();
  for (const eq of equilibriaCache){
    if (eq.y < state.view.ymin || eq.y > state.view.ymax) continue;
    const sy = wy2sy(eq.y);
    ctx.setLineDash([8,6]);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = eq.type==='stable' ? 'rgba(79,217,138,0.85)'
                    : eq.type==='unstable' ? 'rgba(255,93,143,0.85)'
                    : 'rgba(242,180,23,0.85)';
    ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke();
    ctx.setLineDash([]);
    // etiqueta
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = '600 11px "Spline Sans Mono", monospace';
    const lbl = `y* = ${fmt(eq.y)} · ${eq.type==='stable'?'estable':eq.type==='unstable'?'inestable':'semiestable'}`;
    const tw = ctx.measureText(lbl).width;
    ctx.fillText(lbl, W - tw - 14, sy - 7);
  }
  ctx.restore();
}

/* ============================================================
   6.  CURVAS SOLUCIÓN  (RK4 bidireccional)
   ============================================================ */
function integrate(x0,y0){
  const span = (state.view.xmax-state.view.xmin);
  const h = span/900;
  const maxSteps = 2600;
  const pad = (state.view.ymax-state.view.ymin)*3; // permite salir un poco
  const yLo = state.view.ymin - pad, yHi = state.view.ymax + pad;

  const rk4 = (x,y,step) => {
    const k1 = evalF(x,y);
    const k2 = evalF(x+step/2, y+step/2*k1);
    const k3 = evalF(x+step/2, y+step/2*k2);
    const k4 = evalF(x+step,   y+step*k3);
    if ([k1,k2,k3,k4].some(k=>!isFinite(k))) return null;
    return y + step/6*(k1+2*k2+2*k3+k4);
  };

  const fwd=[], bwd=[];
  // hacia adelante
  let x=x0,y=y0;
  fwd.push([x,y]);
  for (let i=0;i<maxSteps && x<=state.view.xmax+h;i++){
    const ny = rk4(x,y,h); if(ny===null) break;
    x+=h; y=ny; fwd.push([x,y]);
    if (y<yLo||y>yHi) break;
  }
  // hacia atrás
  x=x0;y=y0;
  for (let i=0;i<maxSteps && x>=state.view.xmin-h;i++){
    const ny = rk4(x,y,-h); if(ny===null) break;
    x-=h; y=ny; bwd.push([x,y]);
    if (y<yLo||y>yHi) break;
  }
  return bwd.reverse().concat(fwd);
}

function addCurve(x0,y0){
  const color = CURVE_COLORS[state.curves.length % CURVE_COLORS.length];
  const points = integrate(x0,y0);
  state.curves.push({ x0,y0,color,points });
  renderPalette();
  draw();
}

function drawCurves(){
  ctx.save();
  ctx.lineCap='round'; ctx.lineJoin='round';
  for (const c of state.curves){
    // glow
    ctx.shadowBlur = 14; ctx.shadowColor = c.color;
    ctx.strokeStyle = c.color; ctx.lineWidth = 2.6;
    ctx.beginPath();
    let started=false;
    for (const [wx,wy] of c.points){
      const sx=wx2sx(wx), sy=wy2sy(wy);
      // corta si salta demasiado (asíntotas)
      if (started){
        ctx.lineTo(sx,sy);
      } else { ctx.moveTo(sx,sy); started=true; }
    }
    ctx.stroke();
    ctx.shadowBlur=0;
    // punto inicial
    const psx=wx2sx(c.x0), psy=wy2sy(c.y0);
    ctx.fillStyle=c.color;
    ctx.beginPath(); ctx.arc(psx,psy,4,0,7); ctx.fill();
    ctx.strokeStyle='rgba(7,11,22,.9)'; ctx.lineWidth=1.5; ctx.stroke();
  }
  ctx.restore();
}

/* ============================================================
   7.  HOVER / ANÁLISIS DE PUNTO
   ============================================================ */
function drawHoverArrow(){
  const {wx,wy} = state.hover;
  const slope = evalF(wx,wy);
  if (isNaN(slope)) return;
  const sx=wx2sx(wx), sy=wy2sy(wy);
  const L = Math.max(state.arrowSize*1.8, 26);
  let ang=Math.atan(slope), dx=Math.cos(ang), dy=-Math.sin(ang);
  ctx.save();
  ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.4; ctx.lineCap='round';
  ctx.shadowBlur=10; ctx.shadowColor='rgba(255,255,255,.6)';
  ctx.beginPath();
  ctx.moveTo(sx-dx*L,sy-dy*L); ctx.lineTo(sx+dx*L,sy+dy*L); ctx.stroke();
  ctx.beginPath(); ctx.arc(sx,sy,4,0,7); ctx.fillStyle='#fff'; ctx.fill();
  ctx.restore();
}

function updatePointPanel(){
  const card = $('pointCard');
  if (!state.hover){ return; }
  const {wx,wy} = state.hover;
  const slope = evalF(wx,wy);
  const angDeg = isFinite(slope) ? (Math.atan(slope)*180/Math.PI) : NaN;
  const trend = !isFinite(slope) ? '—' : slope>0.001?'creciente ↗':slope<-0.001?'decreciente ↘':'estacionario →';

  card.innerHTML = `
    <div class="readout-grid">
      <div class="row"><span class="rk">Coordenada x</span><span class="rv">${fmt(wx,3)}</span></div>
      <div class="row"><span class="rk">Coordenada y</span><span class="rv">${fmt(wy,3)}</span></div>
      <div class="row"><span class="rk">Pendiente y′ = f(x,y)</span><span class="rv" style="color:${slopeColor(slope)}">${isFinite(slope)?fmt(slope,3):'∞'}</span></div>
      <div class="row"><span class="rk">Ángulo de la recta</span><span class="rv">${isFinite(angDeg)?fmt(angDeg,1)+'°':'90°'}</span></div>
      <div class="row"><span class="rk">Comportamiento local</span><span class="rv" style="font-size:12px">${trend}</span></div>
    </div>
    <div class="slope-viz" id="slopeViz"></div>`;
  drawSlopeViz(slope);
}

function drawSlopeViz(slope){
  const box=$('slopeViz'); if(!box) return;
  const w=box.clientWidth||220, h=64;
  const c=document.createElement('canvas');
  c.width=w*DPR; c.height=h*DPR; c.style.width=w+'px'; c.style.height=h+'px';
  const g=c.getContext('2d'); g.setTransform(DPR,0,0,DPR,0,0);
  g.clearRect(0,0,w,h);
  // mini grid
  g.strokeStyle='rgba(120,150,200,.12)'; g.lineWidth=1;
  g.beginPath(); g.moveTo(0,h/2); g.lineTo(w,h/2); g.moveTo(w/2,0); g.lineTo(w/2,h); g.stroke();
  // segmento de pendiente
  const ang=Math.atan(slope), L=Math.min(w,h)*0.42;
  const dx=Math.cos(ang), dy=-Math.sin(ang);
  g.strokeStyle=slopeColor(slope); g.lineWidth=3; g.lineCap='round';
  g.shadowBlur=8; g.shadowColor=slopeColor(slope);
  g.beginPath(); g.moveTo(w/2-dx*L,h/2-dy*L); g.lineTo(w/2+dx*L,h/2+dy*L); g.stroke();
  box.innerHTML=''; box.appendChild(c);
}

/* ============================================================
   8.  PANELES (equilibrios / paleta)
   ============================================================ */
function renderEquilibriaPanel(){
  const box=$('equilibria');
  if (!state.show.equilibria){
    box.innerHTML = `<div class="analysis-empty" style="padding:14px">Detección de equilibrios desactivada.</div>`; return;
  }
  if (!equilibriaCache.length){
    box.innerHTML = `<div class="analysis-empty" style="padding:14px;line-height:1.5">No se hallaron equilibrios horizontales (y = cte) en esta ventana.</div>`;
    return;
  }
  box.innerHTML = equilibriaCache.map(eq=>{
    const sym = eq.type==='stable'?'●':eq.type==='unstable'?'○':'◐';
    return `<div class="eq-item ${eq.type}">
      <div class="badge">${sym}</div>
      <div class="meta"><div class="val">y* = ${fmt(eq.y,4)}</div><div class="type">${eq.label}</div></div>
    </div>`;
  }).join('');
}

function renderPalette(){
  const box=$('curvePalette');
  if (!state.curves.length){ box.innerHTML = `<span style="font-size:12px;color:var(--ink-faint)">Sin curvas trazadas todavía.</span>`; return; }
  box.innerHTML = state.curves.map((c,i)=>`<span class="cs" title="Curva ${i+1}: (${fmt(c.x0,2)}, ${fmt(c.y0,2)})" style="background:${c.color}"></span>`).join('');
}

/* ============================================================
   9.  UTILIDADES
   ============================================================ */
function niceStep(range){
  const raw = range/8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw/mag;
  let step;
  if (norm<1.5) step=1; else if(norm<3) step=2; else if(norm<7) step=5; else step=10;
  return step*mag;
}
function fmt(n, d=2){
  if (!isFinite(n)) return '∞';
  if (Math.abs(n)<1e-9) return '0';
  const r = +n.toFixed(d);
  return (Number.isInteger(r)? r.toString() : r.toString());
}

/* ============================================================
   10.  RECOMPUTE / PLOT
   ============================================================ */
function recompute(plotCurves){
  state.expr = $('eqInput').value.trim();
  try { state.compiled = compileExpr(state.expr); }
  catch(e){ state.compiled = null; }
  renderLatex();
  readWindow();
  findEquilibria();
  if (plotCurves===false){ /* keep curves */ }
  draw();
  $('chipPoints').textContent = (state.density*state.density) + ' flechas';
}

function readWindow(){
  const xm=+$('xmin').value, xM=+$('xmax').value, ym=+$('ymin').value, yM=+$('ymax').value;
  if (xM>xm) { state.view.xmin=xm; state.view.xmax=xM; }
  if (yM>ym) { state.view.ymin=ym; state.view.ymax=yM; }
}

function fullPlot(){
  // recalcula y limpia curvas que ya no aplican (mantiene puntos iniciales válidos)
  state.expr = $('eqInput').value.trim();
  try { state.compiled = compileExpr(state.expr); }
  catch(e){ state.compiled=null; renderLatex(); return; }
  renderLatex(); readWindow(); findEquilibria();
  // recomputar curvas existentes con la nueva ecuación
  state.curves = state.curves.map(c=>({ ...c, points: integrate(c.x0,c.y0) }));
  draw();
  $('chipPoints').textContent = (state.density*state.density)+' flechas';
}

/* ============================================================
   11.  PRESETS  (galería de ecuaciones notables)
   ============================================================ */
const PRESETS = [
  { name:'Logística',      expr:'y*(1 - y)',        win:[-3,3,-0.5,1.8] },
  { name:'Sinusoidal',     expr:'sin(y)',           win:[-5,5,-7,7] },
  { name:'Lineal y − x',   expr:'y - x',            win:[-5,5,-5,5] },
  { name:'Crecimiento',    expr:'0.5*y',            win:[-4,4,-4,4] },
  { name:'Newton (enfr.)', expr:'-0.7*(y - 2)',     win:[0,8,-1,5] },
  { name:'Bistable',       expr:'y - y^3',          win:[-4,4,-2,2] },
  { name:'Separable',      expr:'x*y',              win:[-4,4,-4,4] },
  { name:'No autónoma',    expr:'y - x^2 + 1',      win:[-3,5,-4,8] },
  { name:'Oscilante',      expr:'cos(x) - y',       win:[-6,6,-3,3] }
];

function buildPresets(){
  const box=$('presets');
  box.innerHTML = PRESETS.map((p,i)=>`
    <button class="preset" data-i="${i}">
      <span class="pname">${p.name}</span>
      <span class="pmath" data-tex="${i}"></span>
    </button>`).join('');
  // render mini latex
  PRESETS.forEach((p,i)=>{
    const el = box.querySelector(`[data-tex="${i}"]`);
    const tex = toLatex(p.expr) || p.expr;
    try { katex.render(tex, el, {throwOnError:false}); } catch(_){ el.textContent=p.expr; }
  });
  box.querySelectorAll('.preset').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = PRESETS[+btn.dataset.i];
      box.querySelectorAll('.preset').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      $('eqInput').value = p.expr;
      $('xmin').value=p.win[0]; $('xmax').value=p.win[1]; $('ymin').value=p.win[2]; $('ymax').value=p.win[3];
      state.curves=[]; renderPalette();
      fullPlot();
    });
  });
}

/* ============================================================
   12.  EVENTOS
   ============================================================ */
function bindEvents(){
  $('eqInput').addEventListener('input', ()=>{ state.expr=$('eqInput').value; renderLatex(); });
  $('eqInput').addEventListener('keydown', e=>{ if(e.key==='Enter') fullPlot(); });
  $('btnPlot').addEventListener('click', fullPlot);
  $('btnReset').addEventListener('click', ()=>{
    $('xmin').value=-5;$('xmax').value=5;$('ymin').value=-4;$('ymax').value=4; fullPlot();
  });
  ['xmin','xmax','ymin','ymax'].forEach(id=>$(id).addEventListener('change', fullPlot));

  $('density').addEventListener('input', e=>{ state.density=+e.target.value; $('densVal').textContent=e.target.value; $('chipPoints').textContent=(state.density*state.density)+' flechas'; draw(); });
  $('arrowSize').addEventListener('input', e=>{ state.arrowSize=+e.target.value; $('sizeVal').textContent=e.target.value; draw(); });

  // toggles
  buildToggles();

  // zoom
  $('zoomIn').addEventListener('click', ()=>zoom(0.8));
  $('zoomOut').addEventListener('click', ()=>zoom(1.25));
  $('clearCurves').addEventListener('click', clearCurves);
  $('clearCurves2').addEventListener('click', clearCurves);

  // canvas hover + click
  host.addEventListener('mousemove', e=>{
    const r=host.getBoundingClientRect();
    const sx=e.clientX-r.left, sy=e.clientY-r.top;
    state.hover={ wx:sx2wx(sx), wy:sy2wy(sy) };
    // tooltip
    const slope=evalF(state.hover.wx,state.hover.wy);
    readout.innerHTML=`<span class="k">f(</span><span class="v">${fmt(state.hover.wx,2)}, ${fmt(state.hover.wy,2)}</span><span class="k">) = </span><span class="v">${isFinite(slope)?fmt(slope,3):'∞'}</span>`;
    readout.classList.add('show');
    let lx=sx+16, ly=sy+16;
    if (lx+readout.offsetWidth>r.width) lx=sx-readout.offsetWidth-12;
    if (ly+readout.offsetHeight>r.height) ly=sy-readout.offsetHeight-12;
    readout.style.left=lx+'px'; readout.style.top=ly+'px';
    updatePointPanel();
    draw();
  });
  host.addEventListener('mouseleave', ()=>{
    state.hover=null; readout.classList.remove('show'); draw();
    $('pointCard').innerHTML=`<div class="analysis-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      Mueve el cursor sobre el campo para inspeccionar la pendiente en cada punto.</div>`;
  });
  // arrastre para trazar múltiples curvas: clic simple = 1 curva,
  // clic + arrastre = una curva por cada tramo del arrastre
  const DRAG_MIN_DIST = 14; // px en pantalla entre curvas sucesivas al arrastrar
  let dragging = false;
  let lastDragPos = null;

  function pointFromEvent(e){
    const r = host.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { sx: cx-r.left, sy: cy-r.top };
  }

  function startDrag(e){
    if (!state.compiled) return;
    if (e.type==='mousedown' && e.button!==0) return;      // solo botón izquierdo traza curvas
    if (e.touches && e.touches.length!==1) return;          // un solo dedo traza curvas
    dragging = true;
    const {sx,sy} = pointFromEvent(e);
    lastDragPos = {sx,sy};
    addCurve(sx2wx(sx), sy2wy(sy));
    if (e.touches) e.preventDefault();
  }
  function moveDrag(e){
    if (!dragging || !state.compiled) return;
    if (e.touches && e.touches.length!==1) return;
    const {sx,sy} = pointFromEvent(e);
    const dx = sx-lastDragPos.sx, dy = sy-lastDragPos.sy;
    if (Math.hypot(dx,dy) >= DRAG_MIN_DIST){
      lastDragPos = {sx,sy};
      addCurve(sx2wx(sx), sy2wy(sy));
    }
    if (e.touches) e.preventDefault();
  }
  function endDrag(){
    dragging = false;
    lastDragPos = null;
  }

  host.addEventListener('mousedown', startDrag);
  host.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);

  host.addEventListener('touchstart', startDrag, { passive:false });
  host.addEventListener('touchmove', moveDrag, { passive:false });
  window.addEventListener('touchend', endDrag);
  window.addEventListener('touchcancel', endDrag);

  // ---- Zoom con rueda del mouse, centrado en el cursor ----
  host.addEventListener('wheel', e=>{
    e.preventDefault();
    const r = host.getBoundingClientRect();
    const sx = e.clientX-r.left, sy = e.clientY-r.top;
    const wx = sx2wx(sx), wy = sy2wy(sy);
    const factor = e.deltaY > 0 ? 1.1 : 0.9;   // rueda abajo = alejar, arriba = acercar
    zoomAt(factor, wx, wy);
  }, { passive:false });

  // ---- Paneo con clic derecho + arrastre ----
  host.addEventListener('contextmenu', e=> e.preventDefault());
  let panning = false;
  let lastPanPos = null;
  host.addEventListener('mousedown', e=>{
    if (e.button!==2) return; // botón derecho
    panning = true;
    const r = host.getBoundingClientRect();
    lastPanPos = { sx:e.clientX-r.left, sy:e.clientY-r.top };
    host.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e=>{
    if (!panning) return;
    const r = host.getBoundingClientRect();
    const sx = e.clientX-r.left, sy = e.clientY-r.top;
    const dwx = sx2wx(lastPanPos.sx) - sx2wx(sx);
    const dwy = sy2wy(lastPanPos.sy) - sy2wy(sy);
    lastPanPos = {sx,sy};
    panBy(dwx, dwy);
  });
  window.addEventListener('mouseup', e=>{
    if (e.button===2){ panning=false; lastPanPos=null; host.style.cursor=''; }
  });

  // ---- Paneo con dos dedos (táctil) + pellizco para zoom ----
  let pinchState = null; // { dist, midWx, midWy }
  function touchMid(e){
    const r = host.getBoundingClientRect();
    const t0=e.touches[0], t1=e.touches[1];
    return {
      sx: ((t0.clientX+t1.clientX)/2) - r.left,
      sy: ((t0.clientY+t1.clientY)/2) - r.top,
      dist: Math.hypot(t0.clientX-t1.clientX, t0.clientY-t1.clientY)
    };
  }
  host.addEventListener('touchstart', e=>{
    if (e.touches.length===2){
      dragging=false; lastDragPos=null; // cancela trazo de curva en curso
      const m = touchMid(e);
      pinchState = { dist:m.dist, sx:m.sx, sy:m.sy };
      e.preventDefault();
    }
  }, { passive:false });
  host.addEventListener('touchmove', e=>{
    if (e.touches.length===2 && pinchState){
      const m = touchMid(e);
      // paneo: diferencia del punto medio
      const dwx = sx2wx(pinchState.sx) - sx2wx(m.sx);
      const dwy = sy2wy(pinchState.sy) - sy2wy(m.sy);
      if (dwx!==0 || dwy!==0) panBy(dwx, dwy);
      // pellizco: cambio de distancia entre dedos = zoom centrado en el punto medio
      if (pinchState.dist>0){
        const factor = pinchState.dist / m.dist;
        const wx = sx2wx(m.sx), wy = sy2wy(m.sy);
        zoomAt(factor, wx, wy);
      }
      pinchState = { dist:m.dist, sx:m.sx, sy:m.sy };
      e.preventDefault();
    }
  }, { passive:false });
  host.addEventListener('touchend', e=>{
    if (e.touches.length<2) pinchState = null;
  });
  host.addEventListener('touchcancel', ()=>{ pinchState = null; });

  window.addEventListener('resize', resize);
}

function buildToggles(){
  const items=[
    { key:'nullclines',    label:'Fondo por signo de y′' },
    { key:'slopeColor',    label:'Color por pendiente' },
    { key:'axes',          label:'Ejes y cuadrícula' },
    { key:'highlightNull', label:'Resaltar nullclines' },
    { key:'equilibria',    label:'Detectar equilibrios' }
  ];
  const box=$('toggles');
  box.innerHTML = items.map(it=>`
    <label class="toggle">
      <input type="checkbox" data-k="${it.key}" ${state.show[it.key]?'checked':''}>
      <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
      <span class="tlab">${it.label}</span>
    </label>`).join('');
  box.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      state.show[inp.dataset.k]=inp.checked;
      if (inp.dataset.k==='equilibria') findEquilibria();
      draw();
    });
  });
}

function zoom(factor){
  const cx=(state.view.xmin+state.view.xmax)/2, cy=(state.view.ymin+state.view.ymax)/2;
  zoomAt(factor, cx, cy);
}

// zoom centrado en un punto del mundo (wx,wy) — usado por rueda del mouse / pinch
function zoomAt(factor, wx, wy){
  const v = state.view;
  state.view = {
    xmin: wx + (v.xmin-wx)*factor,
    xmax: wx + (v.xmax-wx)*factor,
    ymin: wy + (v.ymin-wy)*factor,
    ymax: wy + (v.ymax-wy)*factor
  };
  $('xmin').value=fmt(state.view.xmin); $('xmax').value=fmt(state.view.xmax);
  $('ymin').value=fmt(state.view.ymin); $('ymax').value=fmt(state.view.ymax);
  state.curves=state.curves.map(c=>({...c,points:integrate(c.x0,c.y0)}));
  findEquilibria(); draw();
}

// desplaza la vista (paneo) en unidades del mundo
function panBy(dwx, dwy){
  const v = state.view;
  state.view = { xmin:v.xmin+dwx, xmax:v.xmax+dwx, ymin:v.ymin+dwy, ymax:v.ymax+dwy };
  $('xmin').value=fmt(state.view.xmin); $('xmax').value=fmt(state.view.xmax);
  $('ymin').value=fmt(state.view.ymin); $('ymax').value=fmt(state.view.ymax);
  state.curves=state.curves.map(c=>({...c,points:integrate(c.x0,c.y0)}));
  findEquilibria(); draw();
}

function clearCurves(){ state.curves=[]; renderPalette(); draw(); }

/* ============================================================
   13.  INIT
   ============================================================ */
function init(){
  buildPresets();
  bindEvents();
  // marca preset sinusoidal por defecto
  const def=document.querySelector('.preset[data-i="1"]'); if(def) def.classList.add('active');
  recompute();
  renderPalette();
  resize();
}

// esperar a que carguen math.js y katex
function whenReady(){
  if (window.math && window.katex){ init(); }
  else setTimeout(whenReady, 60);
}
whenReady();

})();
