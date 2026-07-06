/* ============================================================
   math-background.js — OMAI
   Fondo animado del hero: red de nodos + curvas paramétricas
   dibujadas en <canvas>, sin dependencias externas (nada de
   Three.js/CDNs que puedan fallar en un sitio estático).
   ============================================================ */
(function () {
  const canvas = document.getElementById('omai-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let nodes = [];
  let t = 0;
  const NODE_COUNT_BASE = 55; // se ajusta según el ancho de pantalla
  const LINK_DIST = 150;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(24, Math.min(80, Math.floor((w * h) / 18000)));
    nodes = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function drawCurves() {
    // Un par de curvas paramétricas suaves, como líneas de nivel
    ctx.save();
    ctx.lineWidth = 1;
    const palettes = [
      'rgba(200,164,99,0.16)',
      'rgba(168,81,95,0.16)',
      'rgba(200,164,99,0.10)',
    ];
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const amp = h * (0.08 + i * 0.05);
      const freq = 0.0022 + i * 0.0006;
      const phase = t * 0.0003 + i * 1.7;
      const baseY = h * (0.25 + i * 0.28);
      for (let x = 0; x <= w; x += 8) {
        const y = baseY + Math.sin(x * freq + phase) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palettes[i];
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNodes() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    ctx.save();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.25;
          ctx.strokeStyle = 'rgba(200,164,99,0.9)';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(200,164,99,0.9)';
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    drawCurves();
    drawNodes();
    t += 16;
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  if (reduceMotion) {
    // Una sola pasada estática, sin animación continua
    drawCurves();
    drawNodes();
  } else {
    requestAnimationFrame(frame);
  }
})();
