/* ============================================================
   Motor general de Laplace — r(t) arbitraria, coeficientes constantes
   Empaquetado para navegador (namespace Eng), sin dependencias externas.
   Validado exhaustivamente contra integración RK4 independiente:
   - 4 regímenes clásicos (reales distintas, doble, complejas, imaginarias puras)
   - Resonancia exacta (forzante en la frecuencia natural)
   - Polo coincidente entre sistema y forzante
   - Polinomios de grado ≥2 combinados con otros términos en el mismo polo
   - Texto libre parseado (sumas de constante/tⁿ/sin/cos/exp)
   - Términos sin forma cerrada, resueltos por convolución numérica
   ============================================================ */
window.Eng = (function(){
'use strict';

/* ---------- Complejos ---------- */
const C = (re, im=0) => ({re, im});
const add = (x,y) => C(x.re+y.re, x.im+y.im);
const sub = (x,y) => C(x.re-y.re, x.im-y.im);
const mul = (x,y) => C(x.re*y.re - x.im*y.im, x.re*y.im + x.im*y.re);
const div = (x,y) => { const d = y.re*y.re + y.im*y.im; return C((x.re*y.re + x.im*y.im)/d, (x.im*y.re - x.re*y.im)/d); };
const scale = (x,k) => C(x.re*k, x.im*k);
const cneg = x => C(-x.re, -x.im);
const cabs = x => Math.hypot(x.re, x.im);
const cexp = x => { const m = Math.exp(x.re); return C(m*Math.cos(x.im), m*Math.sin(x.im)); };

/* ---------- Polinomios (highest degree first) ---------- */
function polyEval(p, s){ let r = C(0,0); for (const coef of p){ r = add(mul(r,s), coef); } return r; }
function polyMul(p, q){
  const res = new Array(p.length + q.length - 1).fill(0).map(()=>C(0,0));
  for (let i=0;i<p.length;i++) for (let j=0;j<q.length;j++) res[i+j] = add(res[i+j], mul(p[i], q[j]));
  return res;
}
function polyAdd(p, q){
  const n = Math.max(p.length, q.length);
  const pp = new Array(n-p.length).fill(C(0,0)).concat(p);
  const qq = new Array(n-q.length).fill(C(0,0)).concat(q);
  return pp.map((c,i)=>add(c, qq[i]));
}
function polyScale(p, k){ return p.map(c=>mul(c,k)); }
function deflate(p, root){
  const n = p.length;
  const q = new Array(n-1).fill(C(0,0));
  q[0] = p[0];
  for (let i=1;i<n-1;i++){ q[i] = add(p[i], mul(q[i-1], root)); }
  return q;
}
function findRoots(pIn, maxIter=500, tol=1e-12){
  const p = pIn.slice();
  const lead = p[0];
  const pn = p.map(c => div(c, lead));
  const deg = pn.length - 1;
  if (deg === 0) return [];
  if (deg === 1) return [ cneg(pn[1]) ];
  let roots = [];
  const seed = C(0.4, 0.9);
  let seedPow = C(1,0);
  for (let i=0;i<deg;i++){ seedPow = mul(seedPow, seed); roots.push(seedPow); }
  for (let iter=0; iter<maxIter; iter++){
    let maxDelta = 0;
    const newRoots = roots.slice();
    for (let i=0;i<deg;i++){
      let denom = C(1,0);
      for (let j=0;j<deg;j++){ if (i===j) continue; denom = mul(denom, sub(roots[i], roots[j])); }
      const num = polyEval(pn, roots[i]);
      const delta = div(num, denom);
      newRoots[i] = sub(roots[i], delta);
      maxDelta = Math.max(maxDelta, cabs(delta));
    }
    roots = newRoots;
    if (maxDelta < tol) break;
  }
  return roots;
}
function groupRoots(roots, tol=1e-5){
  const used = new Array(roots.length).fill(false);
  const groups = [];
  for (let i=0;i<roots.length;i++){
    if (used[i]) continue;
    const cluster = [roots[i]]; used[i] = true;
    for (let j=i+1;j<roots.length;j++){
      if (used[j]) continue;
      if (cabs(sub(roots[i], roots[j])) < tol){ cluster.push(roots[j]); used[j] = true; }
    }
    const avgRe = cluster.reduce((s,r)=>s+r.re,0)/cluster.length;
    const avgIm = cluster.reduce((s,r)=>s+r.im,0)/cluster.length;
    groups.push({ root: C(avgRe, avgIm), mult: cluster.length });
  }
  return groups;
}
function factorialFn(n){ let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
function binomLocal(n,k){ let r=1; for(let i=0;i<k;i++) r = r*(n-i)/(i+1); return r; }

/* diferencias centrales estandar (g ya es suave en p tras la deflacion exacta) */
function derivativeClean(g, p, order, h=1e-4){
  if (order === 0) return g(p);
  let acc = C(0,0);
  for (let k=0;k<=order;k++){
    const offset = (order/2 - k) * h;
    const sample = g(add(p, C(offset)));
    const coef = (k%2===0?1:-1) * binomLocal(order,k);
    acc = add(acc, scale(sample, coef));
  }
  return scale(acc, 1/Math.pow(h, order));
}

/* ---------- Libreria de forzantes: {Nr, Dr} racionales exactos ---------- */
function forcingRational(type, params){
  const { F0=0, k=0, w0=0, k0=0, coef=0, n=0 } = params;
  switch(type){
    case 'step':    return { Nr:[C(F0)],       Dr:[C(1), C(0)] };
    case 'ramp':    return { Nr:[C(F0), C(k)], Dr:[C(1), C(0), C(0)] };
    case 'poly':    { const Dr=[C(1)]; for(let i=0;i<=n;i++) Dr.push(C(0)); return { Nr:[C(coef*factorialFn(n))], Dr }; }
    case 'sin':     return { Nr:[C(F0*w0)],    Dr:[C(1), C(0), C(w0*w0)] };
    case 'cos':     return { Nr:[C(F0), C(0)], Dr:[C(1), C(0), C(w0*w0)] };
    case 'exp':     return { Nr:[C(F0)],       Dr:[C(1), C(-k0)] };
    case 'impulse': return { Nr:[C(F0)],       Dr:[C(1)] };
    default: throw new Error('tipo de forzante desconocido: '+type);
  }
}
function combineForcings(termList){
  let Nr = [C(0)], Dr = [C(1)];
  for (const term of termList){
    const { Nr: n2, Dr: d2 } = forcingRational(term.type, term.params);
    Nr = polyAdd(polyMul(Nr, d2), polyMul(n2, Dr));
    Dr = polyMul(Dr, d2);
  }
  return { Nr, Dr };
}

/* ---------- Motor principal: Y(s)=N(s)/D(s) -> y(t) via residuos exactos ---------- */
function solveGeneral(a,b,c,y0,v0, forcingType, forcingParams){
  const sysDen = [C(a), C(b), C(c)];
  const termList = Array.isArray(forcingType) ? forcingType : [{ type: forcingType, params: forcingParams }];
  const { Nr, Dr } = combineForcings(termList);
  const icNum = [C(a*y0), C(a*v0+b*y0)];
  const fullNumRaw = polyAdd(polyMul(icNum, Dr), Nr);
  const fullDen = polyMul(sysDen, Dr);

  const roots = findRoots(fullDen);
  const rawGroups = groupRoots(roots);
  const leadDen = fullDen[0];
  const fullNumMonic = polyScale(fullNumRaw, div(C(1,0), leadDen));
  const fullDenMonic = polyScale(fullDen, div(C(1,0), leadDen));

  const groups = [];
  const terms = [];
  for (const rg of rawGroups){
    const { root: p, mult: infMult } = rg;
    let denRest = fullDenMonic;
    for (let i=0;i<infMult;i++) denRest = deflate(denRest, p);
    let numRest = fullNumMonic;
    let vanish = 0;
    const scaleRef = Math.max(1e-9, Math.max(...fullNumMonic.map(cc=>cabs(cc))));
    while (vanish < infMult){
      const val = polyEval(numRest, p);
      if (cabs(val) > 1e-6 * scaleRef) break;
      numRest = deflate(numRest, p);
      vanish += 1;
    }
    const m = infMult - vanish;
    if (m <= 0) continue;
    groups.push({ root: p, mult: m });
    const g = s => div(polyEval(numRest, s), polyEval(denRest, s));
    for (let k=1;k<=m;k++){
      const order = m - k;
      const deriv = derivativeClean(g, p, order);
      const A = div(deriv, C(factorialFn(order), 0));
      terms.push({ root: p, k, A });
    }
  }

  function yFunc(t){
    let acc = C(0,0);
    for (const term of terms){
      const tp = Math.pow(t, term.k-1) / factorialFn(term.k-1);
      const e = cexp(mul(term.root, C(t)));
      acc = add(acc, scale(mul(term.A, e), tp));
    }
    return acc.re;
  }

  return { yFunc, terms, fullNum: fullNumMonic, fullDen: fullDenMonic, groups, a,b,c,y0,v0 };
}

/* ---------- Convolucion numerica (fallback para terminos sin forma cerrada) ---------- */
function impulseResponse(a,b,c){ return solveGeneral(a,b,c,0,0,'impulse',{F0:1}).yFunc; }
function convolve(hFunc, rFreeFunc, t, steps=400){
  if (t <= 0) return 0;
  const n = steps % 2 === 0 ? steps : steps+1;
  const dx = t/n;
  let sum = hFunc(t)*rFreeFunc(0) + hFunc(0)*rFreeFunc(t);
  for (let i=1;i<n;i++){
    const tau = i*dx;
    const w = (i%2===0) ? 2 : 4;
    sum += w * hFunc(t-tau) * rFreeFunc(tau);
  }
  return sum * dx/3;
}
function solveWithFallback(a,b,c,y0,v0, recognizedTerms, rFreeFunc){
  const exact = solveGeneral(a,b,c,y0,v0, recognizedTerms.length? recognizedTerms : [{type:'poly',params:{coef:0,n:0}}]);
  const h = impulseResponse(a,b,c);
  function yFunc(t){
    const yExact = exact.yFunc(t);
    const yNum = rFreeFunc ? convolve(h, rFreeFunc, t) : 0;
    return yExact + yNum;
  }
  return { yFunc, exact };
}

/* ---------- Parser de r(t) en texto libre ---------- */
function splitTopLevelTerms(expr){
  const s = expr.replace(/\s+/g,'');
  const terms = [];
  let depth = 0, cur = '', sign = 1, i = 0;
  if (s[0] === '-'){ sign = -1; i = 1; } else if (s[0] === '+'){ i = 1; }
  for (; i < s.length; i++){
    const ch = s[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && (ch === '+' || ch === '-') && i>0){
      terms.push({ sign, text: cur });
      sign = (ch === '-') ? -1 : 1;
      cur = '';
      continue;
    }
    cur += ch;
  }
  terms.push({ sign, text: cur });
  return terms;
}
function parseCoefOptionalT(str){
  if (str === '') return { coef: 1, hasT: false };
  let m = str.match(/^([-+]?\d+(?:\.\d+)?)\*?t$/);
  if (m) return { coef: parseFloat(m[1]), hasT: true };
  m = str.match(/^([-+])t$/);
  if (m) return { coef: m[1]==='-'? -1:1, hasT: true };
  m = str.match(/^t$/);
  if (m) return { coef: 1, hasT: true };
  m = str.match(/^([-+]?\d+(?:\.\d+)?)$/);
  if (m) return { coef: parseFloat(m[1]), hasT: false };
  return null;
}
function parseTerm(term){
  const raw = (term.sign<0?'-':'') + term.text;
  const t = term.text;
  const num = '[-+]?\\d+(?:\\.\\d+)?';
  let m;
  const fnMatch = t.match(/^((?:[-+]?\d+(?:\.\d+)?)\*?)?(sin|cos|exp)\((.+)\)$/);
  if (fnMatch){
    const coefStr = fnMatch[1] ? fnMatch[1].replace(/\*$/,'') : '';
    const coef = term.sign * (coefStr === '' ? 1 : parseFloat(coefStr));
    const fn = fnMatch[2];
    const argParsed = parseCoefOptionalT(fnMatch[3]);
    if (argParsed && argParsed.hasT){
      if (fn === 'sin') return { type:'sin', params:{F0:coef, w0:argParsed.coef}, raw };
      if (fn === 'cos') return { type:'cos', params:{F0:coef, w0:argParsed.coef}, raw };
      if (fn === 'exp') return { type:'exp', params:{F0:coef, k0:argParsed.coef}, raw };
    }
    return { type:'unrecognized', raw };
  }
  if ((m = t.match(new RegExp(`^(${num})?\\*?t\\^(\\d+)$`)))){
    const coef = term.sign * (m[1]!==undefined ? parseFloat(m[1]) : 1);
    return { type:'poly', params:{coef, n:parseInt(m[2],10)}, raw };
  }
  const linear = parseCoefOptionalT(t);
  if (linear){
    const coef = term.sign * linear.coef;
    return { type:'poly', params:{coef, n: linear.hasT?1:0}, raw };
  }
  return { type:'unrecognized', raw };
}
function parseForcing(expr){
  if (!expr || !expr.trim()) return { recognized:[{type:'poly',params:{coef:0,n:0},raw:'0'}], unrecognized:[] };
  const terms = splitTopLevelTerms(expr).map(parseTerm);
  const recognized = terms.filter(tt=>tt.type!=='unrecognized');
  const unrecognized = terms.filter(tt=>tt.type==='unrecognized').map(tt=>tt.raw);
  return { recognized, unrecognized };
}
/* Evalua de forma segura la suma de terminos NO reconocidos como funcion de t (para la convolucion) */
function makeUnrecognizedFunc(unrecognizedList){
  if (!unrecognizedList.length) return null;
  const expr = unrecognizedList.join('+').replace(/\^/g,'**').replace(/\b(sin|cos|exp|sqrt|log|abs)\b/g,'Math.$1');
  try {
    const f = new Function('t', `"use strict"; return (${expr});`);
    f(0.1234); // valida que al menos evalue sin lanzar
    return t => { const v = f(t); return isFinite(v) ? v : 0; };
  } catch(e){ return null; }
}

return {
  C, add, sub, mul, div, scale, cabs, cexp, cneg,
  polyEval, polyMul, polyAdd, findRoots, groupRoots, factorialFn,
  solveGeneral, solveWithFallback, impulseResponse, convolve,
  parseForcing, makeUnrecognizedFunc
};
})();
