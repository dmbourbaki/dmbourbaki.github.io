(function () {
  'use strict';

  // ---------- Dominio matemático ----------
  const N = 481;
  const X_MIN = -10, X_MAX = 10;
  const DX = (X_MAX - X_MIN) / (N - 1);

  const y = [
    new Float64Array(N).fill(NaN), // f(x)
    new Float64Array(N).fill(NaN), // f'(x)
    new Float64Array(N).fill(NaN), // f''(x)
  ];

  const yRanges = [
    { min: -6, max: 6 },
    { min: -6, max: 6 },
    { min: -6, max: 6 },
  ];

  let masterIndex = null;
  const constants = { C0: 0, C1: 0, C2: 0 };
  let showGrid = true;

  // ---------- DOM ----------
  const canvases = [0, 1, 2].map((k) => document.getElementById('canvas-' + k));
  const ctxs = canvases.map((c) => c.getContext('2d'));
  const hints = [0, 1, 2].map((k) => document.getElementById('hint-' + k));
  const panels = [0, 1, 2].map((k) => document.getElementById('panel-' + k));
  const statusEls = [0, 1, 2].map((k) => document.getElementById('status-' + k));
  const constControls = document.getElementById('const-controls');
  const ambiguityNote = document.getElementById('ambiguity-note');
  const btnReset = document.getElementById('btn-reset');
  const chkGrid = document.getElementById('chk-grid');

  const STATUS_LABELS = {
    0: ['función', 'trazo original', 'reconstruida'],
    1: ['primera derivada', 'trazo original', 'reconstruida'],
    2: ['segunda derivada', 'trazo original', 'reconstruida'],
  };

  // ---------- Utilidades matemáticas ----------
  function clampIdx(i) { return Math.max(0, Math.min(N - 1, i)); }
  function xToIndex(x) { return Math.round((x - X_MIN) / DX); }

  function smooth(arr, radius) {
    const out = new Float64Array(arr.length);
    const sigma = Math.max(radius / 2, 0.6);
    for (let i = 0; i < arr.length; i++) {
      if (Number.isNaN(arr[i])) { out[i] = NaN; continue; }
      let sum = 0, wsum = 0;
      for (let j = -radius; j <= radius; j++) {
        const idx = i + j;
        if (idx < 0 || idx >= arr.length) continue;
        if (Number.isNaN(arr[idx])) continue;
        const w = Math.exp(-(j * j) / (2 * sigma * sigma));
        sum += arr[idx] * w;
        wsum += w;
      }
      out[i] = wsum > 0 ? sum / wsum : NaN;
    }
    return out;
  }

  function derivative(arr, dx) {
    const out = new Float64Array(arr.length).fill(NaN);
    for (let i = 0; i < arr.length; i++) {
      if (Number.isNaN(arr[i])) continue;
      const hasPrev = i > 0 && !Number.isNaN(arr[i - 1]);
      const hasNext = i < arr.length - 1 && !Number.isNaN(arr[i + 1]);
      if (hasPrev && hasNext) out[i] = (arr[i + 1] - arr[i - 1]) / (2 * dx);
      else if (hasNext) out[i] = (arr[i + 1] - arr[i]) / dx;
      else if (hasPrev) out[i] = (arr[i] - arr[i - 1]) / dx;
    }
    return out;
  }

  function integrate(arr, dx, C) {
    const out = new Float64Array(arr.length).fill(NaN);
    let start = -1;
    for (let i = 0; i < arr.length; i++) { if (!Number.isNaN(arr[i])) { start = i; break; } }
    if (start === -1) return out;
    out[start] = C;
    for (let i = start + 1; i < arr.length; i++) {
      if (Number.isNaN(arr[i]) || Number.isNaN(arr[i - 1])) { out[i] = NaN; continue; }
      out[i] = out[i - 1] + ((arr[i] + arr[i - 1]) / 2) * dx;
    }
    return out;
  }

  function computeAutoRange(arr) {
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (Number.isNaN(v)) continue;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (mn === Infinity) return { min: -6, max: 6 };
    let span = mx - mn;
    if (span < 3) { const c = (mx + mn) / 2; mn = c - 2; mx = c + 2; span = 4; }
    const pad = span * 0.2;
    return { min: mn - pad, max: mx + pad };
  }

  // ---------- Recalcular las tres curvas a partir del panel maestro ----------
  function recompute() {
    if (masterIndex === null) return;
    if (masterIndex === 0) {
      const s0 = smooth(y[0], 4);
      y[1] = derivative(s0, DX);
      const s1 = smooth(y[1], 4);
      y[2] = derivative(s1, DX);
    } else if (masterIndex === 1) {
      const s1 = smooth(y[1], 4);
      y[2] = derivative(s1, DX);
      y[0] = integrate(s1, DX, constants.C0);
    } else if (masterIndex === 2) {
      const s2 = smooth(y[2], 4);
      y[1] = integrate(s2, DX, constants.C1);
      const s1b = smooth(y[1], 2);
      y[0] = integrate(s1b, DX, constants.C2);
    }
    updateConstUI();
    updateAmbiguityNote();
  }

  // ---------- UI dinámica: constantes de integración ----------
  function makeSlider(label, value, min, max, onInput) {
    const wrap = document.createElement('div');
    const lab = document.createElement('span');
    lab.textContent = label + ': ' + value.toFixed(1);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min); input.max = String(max); input.step = '0.1'; input.value = String(value);
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      lab.textContent = label + ': ' + v.toFixed(1);
      onInput(v);
    });
    wrap.appendChild(lab);
    wrap.appendChild(input);
    return wrap;
  }

  function updateConstUI() {
    constControls.innerHTML = '';
    if (masterIndex === 1) {
      constControls.hidden = false;
      constControls.appendChild(makeSlider('C · desplaza f(x)', constants.C0, -6, 6, (v) => { constants.C0 = v; recompute(); }));
    } else if (masterIndex === 2) {
      constControls.hidden = false;
      constControls.appendChild(makeSlider('C₁ · pendiente de f(x)', constants.C1, -3, 3, (v) => { constants.C1 = v; recompute(); }));
      constControls.appendChild(makeSlider('C₂ · desplaza f(x)', constants.C2, -6, 6, (v) => { constants.C2 = v; recompute(); }));
    } else {
      constControls.hidden = true;
    }
  }

  function updateAmbiguityNote() {
    if (masterIndex === 1) {
      ambiguityNote.hidden = false;
      ambiguityNote.textContent = 'Estás dibujando f\u2032(x). Por el Teorema Fundamental del Cálculo, f(x) queda determinada salvo una constante C: mueve el control para recorrer toda la familia de antiderivadas.';
    } else if (masterIndex === 2) {
      ambiguityNote.hidden = false;
      ambiguityNote.textContent = 'Estás dibujando f\u2033(x). Aquí aparecen dos constantes: C₁ agrega una pendiente lineal a f(x) (porque desplaza verticalmente a f\u2032), y C₂ sólo traslada f(x) verticalmente.';
    } else {
      ambiguityNote.hidden = true;
    }
  }

  function updatePanelClasses() {
    for (let k = 0; k < 3; k++) {
      panels[k].classList.toggle('is-master', masterIndex === k);
      const [defaultLabel, masterLabel, derivedLabel] = STATUS_LABELS[k];
      statusEls[k].textContent = masterIndex === null ? defaultLabel : (masterIndex === k ? masterLabel : derivedLabel);
    }
  }

  // ---------- Dibujo por puntero ----------
  let drawing = false;
  let activePanel = null;
  let lastPoint = null; // {idx, y}

  function handlePointer(k, clientX, clientY) {
    const canvas = canvases[k];
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const xMath = X_MIN + (px / rect.width) * (X_MAX - X_MIN);
    const range = yRanges[k];
    const yMath = range.min + (1 - py / rect.height) * (range.max - range.min);
    const idx = clampIdx(xToIndex(xMath));

    if (lastPoint === null) {
      y[k][idx] = yMath;
    } else {
      const i0 = lastPoint.idx, y0 = lastPoint.y;
      if (idx === i0) {
        y[k][idx] = yMath;
      } else {
        const dir = idx > i0 ? 1 : -1;
        for (let i = i0; ; i += dir) {
          const t = (i - i0) / (idx - i0);
          y[k][i] = y0 + (yMath - y0) * t;
          if (i === idx) break;
        }
      }
    }
    lastPoint = { idx, y: yMath };
    hints[k].classList.add('hidden');
    recompute();
  }

  canvases.forEach((canvas, k) => {
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      drawing = true;
      activePanel = k;
      masterIndex = k;
      lastPoint = null;
      updatePanelClasses();
      handlePointer(k, e.clientX, e.clientY);
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (drawing && activePanel === k) {
        handlePointer(k, e.clientX, e.clientY);
        e.preventDefault();
      }
    });
  });

  window.addEventListener('pointerup', () => { drawing = false; lastPoint = null; });
  window.addEventListener('pointercancel', () => { drawing = false; lastPoint = null; });

  // ---------- Render ----------
  function niceStep(range) {
    const raw = range / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let step;
    if (norm < 1.5) step = 1; else if (norm < 3.5) step = 2; else if (norm < 7.5) step = 5; else step = 10;
    return step * mag;
  }

  function drawPanel(k) {
    const canvas = canvases[k];
    const ctx = ctxs[k];
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const range = yRanges[k];

    ctx.clearRect(0, 0, w, h);

    const xToPx = (x) => ((x - X_MIN) / (X_MAX - X_MIN)) * w;
    const yToPx = (val) => h - ((val - range.min) / (range.max - range.min)) * h;

    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      const stepX = niceStep(X_MAX - X_MIN);
      for (let gx = Math.ceil(X_MIN / stepX) * stepX; gx <= X_MAX; gx += stepX) {
        const px = xToPx(gx);
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      }
      const stepY = niceStep(range.max - range.min);
      for (let gy = Math.ceil(range.min / stepY) * stepY; gy <= range.max; gy += stepY) {
        const py = yToPx(gy);
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
      }
    }

    // Ejes
    ctx.strokeStyle = 'rgba(184,134,47,0.55)';
    ctx.lineWidth = 1.3;
    if (range.min <= 0 && range.max >= 0) {
      const py0 = yToPx(0);
      ctx.beginPath(); ctx.moveTo(0, py0); ctx.lineTo(w, py0); ctx.stroke();
    }
    const px0 = xToPx(0);
    ctx.beginPath(); ctx.moveTo(px0, 0); ctx.lineTo(px0, h); ctx.stroke();

    // Curva
    const arr = y[k];
    const isMaster = masterIndex === k;
    ctx.strokeStyle = isMaster ? '#f3d896' : '#7fb0e6';
    ctx.lineWidth = isMaster ? 2.6 : 2.1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i < N; i++) {
      const v = arr[i];
      if (Number.isNaN(v)) { penDown = false; continue; }
      const x = X_MIN + i * DX;
      const px = xToPx(x), py = yToPx(v);
      if (!penDown) { ctx.moveTo(px, py); penDown = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function tick() {
    for (let k = 0; k < 3; k++) {
      const target = computeAutoRange(y[k]);
      const r = yRanges[k];
      r.min += (target.min - r.min) * 0.12;
      r.max += (target.max - r.max) * 0.12;
      drawPanel(k);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Controles globales ----------
  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resizeAll() { canvases.forEach(resizeCanvas); }
  window.addEventListener('resize', resizeAll);

  btnReset.addEventListener('click', () => {
    for (let k = 0; k < 3; k++) {
      y[k].fill(NaN);
      hints[k].classList.remove('hidden');
      yRanges[k] = { min: -6, max: 6 };
    }
    masterIndex = null;
    constants.C0 = 0; constants.C1 = 0; constants.C2 = 0;
    updatePanelClasses();
    updateConstUI();
    updateAmbiguityNote();
  });

  chkGrid.addEventListener('change', () => { showGrid = chkGrid.checked; });

  // ---------- Arranque ----------
  resizeAll();
  updatePanelClasses();
  updateConstUI();
  updateAmbiguityNote();
  requestAnimationFrame(tick);
})();
