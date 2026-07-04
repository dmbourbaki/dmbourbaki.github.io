/* ============================================================
   Simulador de Raíces de Polinomios — plano complejo
   p(x) = a_n x^n + ... + a_1 x + a_0,  coeficientes reales
   Todo polinomio de grado n tiene exactamente n raíces complejas
   (contando multiplicidad) — Teorema Fundamental del Álgebra.

   Dos modos de interacción:
   - Coeficientes -> raíces: deslizadores de a_i, recalcula raíces (Durand–Kerner)
   - Raíces -> coeficientes: arrastra una raíz, reconstruye coeficientes
     (producto de factores (x-r_i)); si la raíz es compleja, su conjugada
     se mueve en espejo para que los coeficientes sigan siendo reales.

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
   1.  ARITMÉTICA COMPLEJA MANUAL
   ============================================================ */
function cAdd(a,b){ return { re:a.re+b.re, im:a.im+b.im }; }
function cSub(a,b){ return { re:a.re-b.re, im:a.im-b.im }; }
function cMul(a,b){ return { re:a.re*b.re-a.im*b.im, im:a.re*b.im+a.im*b.re }; }
function cDiv(a,b){
  const d = b.re*b.re+b.im*b.im;
  return { re:(a.re*b.re+a.im*b.im)/d, im:(a.im*b.re-a.re*b.im)/d };
}
function cAbs(a){ return Math.sqrt(a.re*a.re+a.im*a.im); }
function cNeg(a){ return { re:-a.re, im:-a.im }; }

/* ============================================================
   2.  DURAND–KERNER: todas las raíces simultáneamente
   ============================================================ */
function polyEvalComplex(coeffsMonic, x){
  // coeffsMonic: [1, c1, ..., cn], mayor grado primero
  let result = { re:0, im:0 };
  for (const c of coeffsMonic){
    result = cAdd(cMul(result, x), { re:c, im:0 });
  }
  return result;
}

function durandKerner(coeffsRaw, maxIter=500, tol=1e-12){
  const n = coeffsRaw.length - 1;
  if (n <= 0) return [];
  const lead = coeffsRaw[0];
  const a = coeffsRaw.map(c => c/lead);
  let maxOther = 0;
  for (let i=1;i<a.length;i++) maxOther = Math.max(maxOther, Math.abs(a[i]));
  const radius = 1 + maxOther;
  let roots = [];
  for (let k=0;k<n;k++){
    const theta = 2*Math.PI*k/n + 0.4; // offset para evitar simetrías degeneradas
    roots.push({ re: radius*Math.cos(theta), im: radius*Math.sin(theta) });
  }
  for (let iter=0; iter<maxIter; iter++){
    const newRoots = roots.slice();
    let maxDelta = 0;
    for (let i=0;i<n;i++){
      let denom = { re:1, im:0 };
      for (let j=0;j<n;j++){
        if (i!==j) denom = cMul(denom, cSub(roots[i], roots[j]));
      }
      if (cAbs(denom) < 1e-300) continue;
      const pVal = polyEvalComplex(a, roots[i]);
      const delta = cDiv(pVal, denom);
      newRoots[i] = cSub(roots[i], delta);
      maxDelta = Math.max(maxDelta, cAbs(delta));
    }
    roots = newRoots;
    if (maxDelta < tol) break;
  }
  // limpiar ruido numérico: partes imaginarias/reales casi-cero se redondean a 0
  return roots.map(r => ({
    re: Math.abs(r.re) < 1e-9 ? 0 : r.re,
    im: Math.abs(r.im) < 1e-9 ? 0 : r.im
  }));
}

/* ============================================================
   3.  RECONSTRUCCIÓN: coeficientes a partir de las raíces
   producto (x-r1)(x-r2)...(x-rn) expandido, vía convolución
   ============================================================ */
function coeffsFromRoots(roots){
  let poly = [{ re:1, im:0 }];
  for (const r of roots){
    const newPoly = new Array(poly.length+1).fill(null).map(()=>({re:0,im:0}));
    for (let k=0;k<poly.length;k++){
      newPoly[k]   = cAdd(newPoly[k],   poly[k]);
      newPoly[k+1] = cAdd(newPoly[k+1], cMul(cNeg(r), poly[k]));
    }
    poly = newPoly;
  }
  // devuelve solo la parte real (si las raíces vinieron en conjugados, la parte
  // imaginaria debe ser ~0; se descarta el residuo numérico)
  return poly.map(c => c.re);
}

/* Evalúa p(x) real para x real (eje horizontal del panel izquierdo) */
function evalPolyReal(coeffs, x){
  let result = 0;
  for (const c of coeffs) result = result*x + c;
  return result;
}

/* ============================================================
   4.  GENERACIÓN DE LATEX
   ============================================================ */
function termStr(coef, power){
  if (Math.abs(coef) < 1e-9) return null;
  const mag = fmt(Math.abs(coef), 3);
  const sign = coef >= 0 ? '+' : '-';
  const isUnit = Math.abs(Math.abs(coef)-1) < 1e-9;
  let varPart;
  if (power === 0) varPart = '';
  else if (power === 1) varPart = 'x';
  else varPart = `x^{${power}}`;
  let coefShown;
  if (power === 0) coefShown = mag; // término constante: solo el número, sin \, ni variable
  else coefShown = isUnit ? '' : `${mag}\\,`;
  return `${sign} ${coefShown}${varPart}`.trim();
}

function polyLatex(coeffs){
  const n = coeffs.length - 1;
  const parts = [];
  for (let i=0;i<=n;i++){
    const power = n-i;
    const t = termStr(coeffs[i], power);
    if (t) parts.push(t);
  }
  if (parts.length===0) return 'p(x) = 0';
  // primer término sin signo + forzado
  let first = parts[0];
  if (first.startsWith('+ ')) first = first.slice(2);
  return `p(x) = ${first} ${parts.slice(1).join(' ')}`.trim();
}

function factoredLatex(roots){
  if (roots.length === 0) return 'p(x) = 1';
  const factors = roots.map(r=>{
    if (Math.abs(r.im) < 1e-9){
      const v = fmt(r.re,3);
      if (Math.abs(r.re) < 1e-9) return `x`;
      return r.re >= 0 ? `(x - ${v})` : `(x + ${fmt(Math.abs(r.re),3)})`;
    } else {
      const imMag = Math.abs(r.im);
      const imS = Math.abs(imMag-1)<1e-9 ? '' : fmt(imMag,3);
      const imSign = r.im >= 0 ? '-' : '+';
      const imTerm = `${imSign} ${imS}i`.replace('  ',' ');
      if (Math.abs(r.re) < 1e-9){
        return `(x ${imTerm})`;
      }
      const reTerm = r.re >= 0 ? `- ${fmt(r.re,3)}` : `+ ${fmt(Math.abs(r.re),3)}`;
      return `(x ${reTerm} ${imTerm})`;
    }
  });
  return `p(x) = ${factors.join('\\,')}`;
}

/* ============================================================
   5.  ESTADO GLOBAL
   ============================================================ */
const DEFAULT_COEFFS = {
  2: [1, -1, -2],
  3: [1, -6, 11, -6],
  4: [1, 0, -5, 0, 4],
  5: [1, 0, -5, 0, 4, 0],
  6: [1, 0, -7, 0, 14, 0, -8]
};

const state = {
  degree: 3,
  coeffs: DEFAULT_COEFFS[3].slice(),
  roots: [],            // [{re,im}, ...] — fuente de verdad cuando se arrastra
  mode: 'coeffs',        // 'coeffs' (sliders mandan) | 'roots' (arrastre manda)
  show: { grid:true, factored:true },
  dragIndex: -1
};

function recomputeRootsFromCoeffs(){
  state.roots = durandKerner(state.coeffs);
}

function recomputeCoeffsFromRoots(){
  const newCoeffs = coeffsFromRoots(state.roots);
  // normalizar para que el coeficiente líder coincida con el original (preserva escala)
  state.coeffs = newCoeffs;
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
   7.  CANVAS: RECTA REAL  y = p(x)
   ============================================================ */
function makeRealCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;
  let lastCoeffs=null, lastRoots=null;

  const defaultView = ()=>({ xmin:-5, xmax:5, ymin:-5, ymax:5 });
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
    if (lastCoeffs) draw(lastCoeffs, lastRoots);
  }

  function autoFit(coeffs, roots){
    const realRoots = roots.filter(r=>Math.abs(r.im)<1e-9).map(r=>r.re);
    let xmin=-3, xmax=3;
    if (realRoots.length){
      xmin = Math.min(...realRoots, -1) - 1;
      xmax = Math.max(...realRoots, 1) + 1;
    }
    const N=200; let ymin=Infinity, ymax=-Infinity;
    for (let i=0;i<=N;i++){
      const x = xmin + (xmax-xmin)*i/N;
      const y = evalPolyReal(coeffs, x);
      if (isFinite(y)){ if(y<ymin)ymin=y; if(y>ymax)ymax=y; }
    }
    if (!isFinite(ymin)||!isFinite(ymax)||ymin===ymax){ ymin=-5; ymax=5; }
    const pad = (ymax-ymin)*0.18 || 1;
    viewport.reset();
    const v = viewport.get();
    v.xmin=xmin; v.xmax=xmax; v.ymin=ymin-pad; v.ymax=ymax+pad;
  }

  function draw(coeffs, roots){
    lastCoeffs=coeffs; lastRoots=roots;
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    const v = viewport.get();
    const x2sx = x => ((x-v.xmin)/(v.xmax-v.xmin))*W;
    const y2sy = y => H - ((y-v.ymin)/(v.ymax-v.ymin))*H;

    if (state.show.grid){
      ctx.save();
      ctx.strokeStyle='rgba(120,150,200,0.07)'; ctx.lineWidth=1;
      const stepX = niceStep(v.xmax-v.xmin), stepY = niceStep(v.ymax-v.ymin);
      ctx.beginPath();
      for (let x=Math.ceil(v.xmin/stepX)*stepX; x<=v.xmax; x+=stepX){ const sx=x2sx(x); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){ const sy=y2sy(y); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(159,176,208,0.4)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      if (v.ymin<0 && v.ymax>0){ const sy=y2sy(0); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      if (v.xmin<0 && v.xmax>0){ const sx=x2sx(0); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      ctx.stroke();
      ctx.fillStyle='rgba(159,176,208,0.65)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      for (let x=Math.ceil(v.xmin/stepX)*stepX; x<=v.xmax; x+=stepX){ if(Math.abs(x)>1e-9) ctx.fillText(fmt(x,1), x2sx(x)+3, H-6); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){ if(Math.abs(y)>1e-9) ctx.fillText(fmt(y,1), 5, y2sy(y)-4); }
      ctx.restore();
    }

    // curva y=p(x)
    const N=600;
    ctx.save();
    ctx.strokeStyle = '#34d6e8'; ctx.lineWidth=2.6;
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.shadowColor='#34d6e8'; ctx.shadowBlur=7;
    ctx.beginPath();
    for (let i=0;i<=N;i++){
      const x = v.xmin + (v.xmax-v.xmin)*i/N;
      const y = evalPolyReal(coeffs, x);
      const sx=x2sx(x), sy=y2sy(y);
      if (sy < -H*3 || sy > H*4) continue; // evita disparar la línea fuera de rango
      i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
    }
    ctx.stroke();
    ctx.restore();

    // marcar raíces reales sobre el eje x
    roots.forEach(r=>{
      if (Math.abs(r.im) > 1e-9) return;
      if (r.re < v.xmin || r.re > v.xmax) return;
      const sx = x2sx(r.re), sy = y2sy(0);
      ctx.save();
      ctx.fillStyle = '#34d6e8';
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(7,11,22,.8)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.restore();
    });
  }

  return { resize, draw, autoFit, viewport };
}

/* ============================================================
   8.  CANVAS: PLANO COMPLEJO — con arrastre de raíces
   ============================================================ */
function makeComplexCanvas(canvasId, hostId){
  const canvas = $(canvasId);
  const ctx = canvas.getContext('2d');
  const host = $(hostId);
  let DPR=1, W=0, H=0;
  let lastRoots=null;
  let hoverIndex = -1, dragging = false, dragIndex = -1;
  let panDragging = false, lastPanX=0, lastPanY=0;

  const defaultView = ()=>({ xmin:-5, xmax:5, ymin:-5, ymax:5 });
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
    if (lastRoots) draw(lastRoots);
  }

  function autoFit(roots){
    let maxAbs = 1;
    roots.forEach(r=>{ maxAbs = Math.max(maxAbs, Math.abs(r.re), Math.abs(r.im)); });
    const half = maxAbs*1.4 + 0.5;
    viewport.reset();
    const v = viewport.get();
    v.xmin=-half; v.xmax=half; v.ymin=-half; v.ymax=half;
  }

  function worldToScreen(v, re, im){
    return [ ((re-v.xmin)/(v.xmax-v.xmin))*W, H - ((im-v.ymin)/(v.ymax-v.ymin))*H ];
  }
  function screenToWorld(v, sx, sy){
    return { re: v.xmin + (sx/W)*(v.xmax-v.xmin), im: v.ymin + ((H-sy)/H)*(v.ymax-v.ymin) };
  }

  function findRootNear(sx, sy){
    if (!lastRoots) return -1;
    const v = viewport.get();
    let best=-1, bestD=Infinity;
    lastRoots.forEach((r,i)=>{
      const [px,py] = worldToScreen(v, r.re, r.im);
      const d = Math.hypot(px-sx, py-sy);
      if (d < 14 && d < bestD){ bestD=d; best=i; }
    });
    return best;
  }

  function draw(roots){
    lastRoots = roots;
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    const v = viewport.get();

    if (state.show.grid){
      ctx.save();
      ctx.strokeStyle='rgba(120,150,200,0.07)'; ctx.lineWidth=1;
      const stepX = niceStep(v.xmax-v.xmin), stepY = niceStep(v.ymax-v.ymin);
      ctx.beginPath();
      for (let x=Math.ceil(v.xmin/stepX)*stepX; x<=v.xmax; x+=stepX){ const [sx]=worldToScreen(v,x,0); ctx.moveTo(sx,0); ctx.lineTo(sx,H); }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){ const [,sy]=worldToScreen(v,0,y); ctx.moveTo(0,sy); ctx.lineTo(W,sy); }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(159,176,208,0.45)'; ctx.lineWidth=1.6;
      ctx.beginPath();
      const [,syAxis] = worldToScreen(v,0,0); ctx.moveTo(0,syAxis); ctx.lineTo(W,syAxis); // eje real
      const [sxAxis] = worldToScreen(v,0,0); ctx.moveTo(sxAxis,0); ctx.lineTo(sxAxis,H); // eje imaginario
      ctx.stroke();
      ctx.fillStyle='rgba(159,176,208,0.7)'; ctx.font='10.5px "Spline Sans Mono", monospace';
      for (let x=Math.ceil(v.xmin/stepX)*stepX; x<=v.xmax; x+=stepX){ if(Math.abs(x)>1e-9){ const [sx]=worldToScreen(v,x,0); ctx.fillText(fmt(x,1), sx+3, H-6); } }
      for (let y=Math.ceil(v.ymin/stepY)*stepY; y<=v.ymax; y+=stepY){ if(Math.abs(y)>1e-9){ const [,sy]=worldToScreen(v,0,y); ctx.fillText(fmt(y,1)+'i', 5, sy-4); } }
      ctx.restore();
    }

    // raíces
    roots.forEach((r,i)=>{
      const [sx,sy] = worldToScreen(v, r.re, r.im);
      const isReal = Math.abs(r.im) < 1e-9;
      const baseColor = isReal ? '#34d6e8' : '#ff5d8f';
      const isActive = (i===hoverIndex || i===dragIndex);
      ctx.save();
      if (isActive){
        ctx.shadowColor = '#ffd24a'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffd24a';
      } else {
        ctx.shadowColor = baseColor; ctx.shadowBlur = 8;
        ctx.fillStyle = baseColor;
      }
      ctx.beginPath(); ctx.arc(sx, sy, isActive?9:7, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(7,11,22,.85)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.restore();

      // etiqueta x_i
      ctx.save();
      ctx.fillStyle='rgba(234,240,255,0.85)'; ctx.font='600 10.5px "Spline Sans Mono", monospace';
      ctx.fillText(`x${i+1}`, sx+10, sy-8);
      ctx.restore();
    });
  }

  function setupInteraction(onDragUpdate, onDragEnd){
    host.addEventListener('wheel', e=>{
      e.preventDefault();
      const r = host.getBoundingClientRect();
      const px = e.clientX-r.left, py = e.clientY-r.top;
      const factor = e.deltaY > 0 ? 1.12 : 0.89;
      viewport.zoomAt(factor, px, py, r.width, r.height);
      draw(lastRoots);
    }, { passive:false });

    host.addEventListener('mousemove', e=>{
      const r = host.getBoundingClientRect();
      const sx = e.clientX-r.left, sy = e.clientY-r.top;
      if (dragging){
        const v = viewport.get();
        const world = screenToWorld(v, sx, sy);
        onDragUpdate(dragIndex, world);
        return;
      }
      if (panDragging){
        viewport.pan(e.clientX-lastPanX, e.clientY-lastPanY, r.width, r.height);
        lastPanX=e.clientX; lastPanY=e.clientY;
        draw(lastRoots);
        return;
      }
      const idx = findRootNear(sx, sy);
      if (idx !== hoverIndex){ hoverIndex = idx; host.classList.toggle('hovering-root', idx>=0); draw(lastRoots); }
    });

    host.addEventListener('mousedown', e=>{
      const r = host.getBoundingClientRect();
      const sx = e.clientX-r.left, sy = e.clientY-r.top;
      const idx = findRootNear(sx, sy);
      if (idx >= 0){
        dragging = true; dragIndex = idx;
      } else {
        panDragging = true; lastPanX=e.clientX; lastPanY=e.clientY;
        host.classList.add('grabbing');
      }
    });
    window.addEventListener('mouseup', ()=>{
      if (dragging){ dragging=false; onDragEnd(); }
      dragIndex = -1;
      panDragging = false;
      host.classList.remove('grabbing');
    });

    // soporte táctil básico
    let touchLast=null;
    host.addEventListener('touchstart', e=>{
      if (e.touches.length===1){
        const r = host.getBoundingClientRect();
        const t = e.touches[0];
        const sx=t.clientX-r.left, sy=t.clientY-r.top;
        const idx = findRootNear(sx,sy);
        if (idx>=0){ dragging=true; dragIndex=idx; }
        else { touchLast={x:t.clientX,y:t.clientY}; }
      }
    }, { passive:true });
    host.addEventListener('touchmove', e=>{
      if (e.touches.length===1){
        const t = e.touches[0];
        if (dragging){
          const r = host.getBoundingClientRect();
          const v = viewport.get();
          const world = screenToWorld(v, t.clientX-r.left, t.clientY-r.top);
          onDragUpdate(dragIndex, world);
        } else if (touchLast){
          const r = host.getBoundingClientRect();
          viewport.pan(t.clientX-touchLast.x, t.clientY-touchLast.y, r.width, r.height);
          touchLast={x:t.clientX,y:t.clientY};
          draw(lastRoots);
        }
      }
    }, { passive:true });
    host.addEventListener('touchend', ()=>{
      if (dragging){ dragging=false; onDragEnd(); }
      dragIndex=-1; touchLast=null;
    });
  }

  return { resize, draw, autoFit, viewport, setupInteraction };
}

/* ============================================================
   9.  PANEL DE ANÁLISIS Y TABLA DE RAÍCES
   ============================================================ */
function renderAnalysis(){
  const el = $('analysisMain');
  const n = state.degree;
  const realCount = state.roots.filter(r=>Math.abs(r.im)<1e-9).length;
  const complexCount = n - realCount;
  el.innerHTML = `
    <div class="tfa-badge">
      <div class="ricon">∑</div>
      <div>
        <div class="rname">${n} raíces en total</div>
        <div class="rdesc">Un polinomio de grado ${n} tiene exactamente ${n} raíces complejas, contando multiplicidad — sin excepción.</div>
      </div>
    </div>
    <div class="readout-grid">
      <div class="row"><span class="rk">Grado del polinomio</span><span class="rv">${n}</span></div>
      <div class="row"><span class="rk">Raíces reales</span><span class="rv">${realCount}</span></div>
      <div class="row"><span class="rk">Raíces complejas (no reales)</span><span class="rv">${complexCount}</span></div>
      <div class="row"><span class="rk">Modo activo</span><span class="rv">${state.mode==='coeffs'?'Coeficientes → raíces':'Raíces → coeficientes'}</span></div>
    </div>
  `;
}

function renderRootsTable(){
  const el = $('rootsPanel');
  let rows = `<tr><th>raíz</th><th>valor</th><th>tipo</th></tr>`;
  state.roots.forEach((r,i)=>{
    const isReal = Math.abs(r.im) < 1e-9;
    const color = isReal ? 'var(--real-root)' : 'var(--complex-root)';
    const valStr = isReal ? fmt(r.re,4) : `${fmt(r.re,4)} ${r.im>=0?'+':'-'} ${fmt(Math.abs(r.im),4)}i`;
    rows += `<tr><td><span class="rdot" style="background:${color}"></span>x${i+1}</td><td>${valStr}</td><td>${isReal?'real':'compleja'}</td></tr>`;
  });
  el.innerHTML = `<table class="roots-table">${rows}</table>`;
}

/* ============================================================
   10.  SELECTOR DE GRADO Y SLIDERS DE COEFICIENTES
   ============================================================ */
function buildDegreeSelect(){
  const box = $('degreeSelect');
  box.innerHTML = [2,3,4,5,6].map(d=>`<button class="degree-btn${state.degree===d?' active':''}" data-d="${d}">${d}</button>`).join('');
  box.querySelectorAll('.degree-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const d = +btn.dataset.d;
      if (d === state.degree) return;
      state.degree = d;
      state.coeffs = DEFAULT_COEFFS[d].slice();
      state.mode = 'coeffs';
      buildDegreeSelect();
      buildCoeffSliders();
      recompute(true);
    });
  });
}

function buildCoeffSliders(){
  const box = $('coeffList');
  const n = state.degree;
  box.innerHTML = state.coeffs.map((c,i)=>{
    const power = n - i;
    const label = power===0 ? 'a₀' : (power===1 ? 'a₁' : `a${power}`.replace(/\d/g, d=>'₀₁₂₃₄₅₆₇₈₉'[d]));
    return `
      <div class="coeff-row">
        <label>${label}</label>
        <input type="range" min="-10" max="10" step="0.1" value="${c}" data-i="${i}">
        <span class="coeff-val" id="coeffVal${i}">${fmt(c,1)}</span>
      </div>`;
  }).join('');
  box.querySelectorAll('input[type=range]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const i = +inp.dataset.i;
      let v = +inp.value;
      if (i===0 && Math.abs(v) < 0.1) v = v>=0?0.1:-0.1; // evita coeficiente líder nulo (cambiaría el grado real)
      state.coeffs[i] = v;
      $('coeffVal'+i).textContent = fmt(v,1);
      state.mode = 'coeffs';
      recompute(false);
    });
  });
}

function syncCoeffSliders(){
  state.coeffs.forEach((c,i)=>{
    const inp = document.querySelector(`#coeffList input[data-i="${i}"]`);
    if (inp) inp.value = c;
    const val = $('coeffVal'+i);
    if (val) val.textContent = fmt(c,1);
  });
}

/* ============================================================
   11.  TOGGLES
   ============================================================ */
function buildToggles(){
  const items = [
    { key:'grid', label:'Cuadrícula y ejes' },
    { key:'factored', label:'Forma factorizada' }
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
      const wrap = $('eqFactored').closest('.eq-render-main');
      if (wrap) wrap.style.display = state.show.factored ? '' : 'none';
      recompute(false);
    });
  });
}

/* ============================================================
   12.  MOTOR PRINCIPAL
   ============================================================ */
let canvasReal, canvasComplex;
let hasAutoFit = false;

function recompute(forceAutoFit){
  if (state.mode === 'coeffs'){
    recomputeRootsFromCoeffs();
  }
  // si mode==='roots', state.roots ya fue actualizado por el handler de arrastre,
  // y state.coeffs ya se recalculó desde las raíces (ver onDragUpdate/onDragEnd).

  try { katex.render(polyLatex(state.coeffs), $('eqPoly'), { throwOnError:false, displayMode:false }); } catch(e){}
  try { katex.render(factoredLatex(state.roots), $('eqFactored'), { throwOnError:false, displayMode:false }); } catch(e){}

  $('chipDegree').textContent = `grado ${state.degree}`;
  const realCount = state.roots.filter(r=>Math.abs(r.im)<1e-9).length;
  $('realRootsTag').textContent = `${realCount} ${realCount!==1?'raíces':'raíz'} real${realCount!==1?'es':''}`;
  $('complexRootsTag').textContent = `${state.degree} raíces totales`;

  if (forceAutoFit || !hasAutoFit){
    canvasReal.autoFit(state.coeffs, state.roots);
    canvasComplex.autoFit(state.roots);
    hasAutoFit = true;
  }
  canvasReal.draw(state.coeffs, state.roots);
  canvasComplex.draw(state.roots);

  renderAnalysis();
  renderRootsTable();
}

/* Maneja el arrastre de una raíz: actualiza su valor y, si es compleja,
   mueve su conjugada en espejo para preservar coeficientes reales. */
function onRootDragUpdate(idx, newVal){
  state.mode = 'roots';
  const orig = state.roots[idx];
  state.roots[idx] = newVal;

  if (Math.abs(newVal.im) > 1e-9){
    // buscar la conjugada ORIGINAL de la raíz arrastrada y actualizarla en espejo
    const conjTarget = { re: orig.re, im: -orig.im };
    let bestJ = -1, bestD = Infinity;
    state.roots.forEach((r,j)=>{
      if (j===idx) return;
      const d = Math.hypot(r.re-conjTarget.re, r.im-conjTarget.im);
      if (d < bestD){ bestD = d; bestJ = j; }
    });
    if (bestJ >= 0 && bestD < 1.5){
      state.roots[bestJ] = { re: newVal.re, im: -newVal.im };
    }
  } else {
    // si la raíz arrastrada se vuelve real, y antes tenía conjugada compleja,
    // movemos esa conjugada también a real en el mismo punto (colisión visual)
    const conjTarget = { re: orig.re, im: -orig.im };
    if (Math.abs(orig.im) > 1e-9){
      let bestJ=-1, bestD=Infinity;
      state.roots.forEach((r,j)=>{
        if (j===idx) return;
        const d = Math.hypot(r.re-conjTarget.re, r.im-conjTarget.im);
        if (d < bestD){ bestD=d; bestJ=j; }
      });
      if (bestJ>=0 && bestD<1.5) state.roots[bestJ] = { re:newVal.re, im:0 };
    }
  }

  state.coeffs = coeffsFromRoots(state.roots);
  // re-normalizar para que el coeficiente líder permanezca en 1 (evita explosión de escala)
  const lead = state.coeffs[0];
  if (Math.abs(lead) > 1e-9 && Math.abs(lead-1) > 1e-6){
    state.coeffs = state.coeffs.map(c=>c/lead);
  }
  syncCoeffSliders();

  try { katex.render(polyLatex(state.coeffs), $('eqPoly'), { throwOnError:false, displayMode:false }); } catch(e){}
  try { katex.render(factoredLatex(state.roots), $('eqFactored'), { throwOnError:false, displayMode:false }); } catch(e){}
  canvasReal.draw(state.coeffs, state.roots);
  canvasComplex.draw(state.roots);
  renderAnalysis();
  renderRootsTable();
}

function onRootDragEnd(){
  // al soltar, re-fijamos modo a 'coeffs' para que los sliders vuelvan a mandar
  // en la siguiente interacción manual de coeficientes (el polinomio ya quedó
  // sincronizado con las raíces finales)
  state.mode = 'coeffs';
}

function bindEvents(){
  document.querySelectorAll('.icon-btn[data-zoom]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.zoom; // "r-in"|"r-out"|"r-reset"|"c-in"|"c-out"|"c-reset"
      const [target, action] = key.split('-');
      const cv = target==='r' ? canvasReal : canvasComplex;
      const host = $(target==='r' ? 'hostReal' : 'hostComplex');
      const r = host.getBoundingClientRect();
      if (action==='in') cv.viewport.zoomAt(0.8, r.width/2, r.height/2, r.width, r.height);
      else if (action==='out') cv.viewport.zoomAt(1.25, r.width/2, r.height/2, r.width, r.height);
      else if (action==='reset'){
        if (target==='r') cv.autoFit(state.coeffs, state.roots);
        else cv.autoFit(state.roots);
      }
      if (target==='r') cv.draw(state.coeffs, state.roots);
      else cv.draw(state.roots);
    });
  });

  // pan/zoom genérico en el canvas real (sin arrastre de raíces ahí, solo pan)
  let realPanDragging=false, realLastX=0, realLastY=0;
  const hostReal = $('hostReal');
  hostReal.addEventListener('wheel', e=>{
    e.preventDefault();
    const r = hostReal.getBoundingClientRect();
    const px = e.clientX-r.left, py = e.clientY-r.top;
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    canvasReal.viewport.zoomAt(factor, px, py, r.width, r.height);
    canvasReal.draw(state.coeffs, state.roots);
  }, { passive:false });
  hostReal.addEventListener('mousedown', e=>{
    realPanDragging=true; realLastX=e.clientX; realLastY=e.clientY;
    hostReal.classList.add('grabbing');
  });
  window.addEventListener('mousemove', e=>{
    if (!realPanDragging) return;
    const r = hostReal.getBoundingClientRect();
    canvasReal.viewport.pan(e.clientX-realLastX, e.clientY-realLastY, r.width, r.height);
    realLastX=e.clientX; realLastY=e.clientY;
    canvasReal.draw(state.coeffs, state.roots);
  });
  window.addEventListener('mouseup', ()=>{ realPanDragging=false; hostReal.classList.remove('grabbing'); });

  canvasComplex.setupInteraction(onRootDragUpdate, onRootDragEnd);

  $('btnReset').addEventListener('click', ()=>{
    state.degree = 3;
    state.coeffs = DEFAULT_COEFFS[3].slice();
    state.mode = 'coeffs';
    buildDegreeSelect();
    buildCoeffSliders();
    hasAutoFit = false;
    recompute(true);
  });

  buildToggles();
  window.addEventListener('resize', ()=>{ canvasReal.resize(); canvasComplex.resize(); recompute(false); });
}

/* ============================================================
   13.  INIT
   ============================================================ */
function init(){
  canvasReal = makeRealCanvas('canvasReal','hostReal');
  canvasComplex = makeComplexCanvas('canvasComplex','hostComplex');
  buildDegreeSelect();
  buildCoeffSliders();
  bindEvents();
  canvasReal.resize();
  canvasComplex.resize();
  recompute(true);
}

function whenReady(){
  if (window.katex){ init(); }
  else setTimeout(whenReady, 60);
}
whenReady();

})();
