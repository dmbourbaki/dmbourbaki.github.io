/* =========================================================
   OMAI — PEMDAS en Acción
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
    if(c === '+'){ tokens.push({t:'PLUS'}); i++; continue; }
    if(c === '-' || c === '−'){ tokens.push({t:'MINUS'}); i++; continue; }
    if(c === '*' || c === '×'){ tokens.push({t:'MUL'}); i++; continue; }
    if(c === '/' || c === '÷'){ tokens.push({t:'DIV'}); i++; continue; }
    if(c === '^'){ tokens.push({t:'POW'}); i++; continue; }
    if(/[0-9.]/.test(c)){
      let j = i;
      while(j < input.length && /[0-9.]/.test(input[j])) j++;
      tokens.push({t:'NUM', value: parseFloat(input.slice(i,j))});
      i = j; continue;
    }
    if(/[a-zA-Z]/.test(c)){ tokens.push({t:'VAR', name: c}); i++; continue; }
    i++;
  }
  tokens.push({t:'EOF'});
  return tokens;
}

/* ---------- 2. PARSER ----------
   Precedencia (menor a mayor): + −  >  × ÷ (y mult. implícita, misma precedencia)  >  unario −  >  ^  >  átomo
   "6÷2(1+2)" = 9 (convención moderna: implícita al mismo nivel que × ÷, izq-derecha).
   "-3^2" = -9 (el exponente aplica antes que el negativo unario). */
function parse(tokens){
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (t) => { if(tokens[pos].t !== t) throw new Error(`Se esperaba ${t} pero se encontró ${tokens[pos].t}`); return tokens[pos++]; };
  function startsImplicitFactor(tk){ return tk.t==='NUM' || tk.t==='VAR' || tk.t==='LP'; }

  function parseAddSub(){
    let left = parseMulDiv();
    while(peek().t === 'PLUS' || peek().t === 'MINUS'){
      const op = eat(peek().t).t;
      const right = parseMulDiv();
      left = { type: op==='PLUS' ? 'add' : 'sub', l:left, r:right };
    }
    return left;
  }
  function parseMulDiv(){
    let left = parseUnary();
    while(true){
      if(peek().t === 'MUL' || peek().t === 'DIV'){
        const op = eat(peek().t).t;
        const right = parseUnary();
        left = { type: op==='MUL' ? 'mul' : 'div', l:left, r:right };
      } else if(startsImplicitFactor(peek())){
        const right = parseUnary();
        left = { type:'mul', l:left, r:right, implicit:true };
      } else break;
    }
    return left;
  }
  function parseUnary(){
    if(peek().t === 'MINUS'){ eat('MINUS'); return { type:'neg', a: parseUnary() }; }
    return parsePow();
  }
  function parsePow(){
    const base = parseAtom();
    if(peek().t === 'POW'){ eat('POW'); const exp = parseUnary(); return { type:'pow', l:base, r:exp }; }
    return base;
  }
  function parseAtom(){
    const tk = peek();
    if(tk.t === 'LP'){ eat('LP'); const e = parseAddSub(); eat('RP'); e.paren = true; return e; }
    if(tk.t === 'NUM'){ eat('NUM'); return { type:'num', value: tk.value }; }
    if(tk.t === 'VAR'){ eat('VAR'); return { type:'var', name: tk.name }; }
    throw new Error('Símbolo inesperado o expresión incompleta cerca de "' + (tk.t||'') + '"');
  }
  const result = parseAddSub();
  eat('EOF');
  return result;
}
function parseExpr(str){
  if(!str || !str.trim()) throw new Error('Escribe una expresión.');
  return parse(tokenize(str));
}

/* ---------- 3. UTILIDADES ---------- */
function getVars(node, set = new Set()){
  if(node.type === 'var') set.add(node.name);
  else if(node.type === 'num'){ /* nada */ }
  else if(node.type === 'neg') getVars(node.a, set);
  else { getVars(node.l, set); getVars(node.r, set); }
  return set;
}
function isNumeric(node){ return node.type === 'num'; }
function fmtNum(x){
  if(Object.is(x,-0)) x = 0;
  return (Math.round(x*1e9)/1e9).toString();
}
const OP_SYMBOL = { add:'+', sub:'−', mul:'×', div:'÷', pow:'^' };
function toStr(node, highlightNode){
  function wrap(n, s){ return (n === highlightNode) ? `\u0001${s}\u0002` : s; }
  function needsParens(child, parentType, side){
    const prec = { add:1, sub:1, mul:2, div:2, pow:4, neg:3, num:5, var:5 };
    const cp = prec[child.type], pp = prec[parentType];
    if(cp < pp) return true;
    if(cp === pp && side==='r' && (parentType==='sub' || parentType==='div')) return true;
    if(parentType==='pow' && side==='l' && child.type==='pow') return true;
    return false;
  }
  function rec(n){
    if(n.type === 'num') return wrap(n, fmtNum(n.value));
    if(n.type === 'var') return wrap(n, n.name);
    if(n.type === 'neg'){
      const inner = rec(n.a);
      const wrapInner = ['add','sub'].includes(n.a.type);
      return wrap(n, '−' + (wrapInner ? `(${inner})` : inner));
    }
    const l = rec(n.l), r = rec(n.r);
    const lw = needsParens(n.l, n.type, 'l'), rw = needsParens(n.r, n.type, 'r');
    const sep = n.implicit ? '' : ` ${OP_SYMBOL[n.type]} `;
    return wrap(n, `${lw?'('+l+')':l}${sep}${rw?'('+r+')':r}`);
  }
  return rec(node);
}
// Igual que toStr, pero acepta VARIOS marcadores simultáneos en la misma línea
// (la operación que se está por resolver Y el número que acaba de llegar del paso
// anterior), cada uno con su propia clase y su propio "step" para enlazar el hover.
function toStrHtml(node, marks){
  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function maybeWrap(n, html){
    const m = marks.get(n);
    if(!m) return html;
    return `<span class="${m.cls}" data-step="${m.step}">${html}</span>`;
  }
  function needsParens(child, parentType, side){
    const prec = { add:1, sub:1, mul:2, div:2, pow:4, neg:3, num:5, var:5 };
    const cp = prec[child.type], pp = prec[parentType];
    if(cp < pp) return true;
    if(cp === pp && side==='r' && (parentType==='sub' || parentType==='div')) return true;
    if(parentType==='pow' && side==='l' && child.type==='pow') return true;
    return false;
  }
  function rec(n){
    if(n.type === 'num') return maybeWrap(n, esc(fmtNum(n.value)));
    if(n.type === 'var') return maybeWrap(n, esc(n.name));
    if(n.type === 'neg'){
      const inner = rec(n.a);
      const wrapInner = ['add','sub'].includes(n.a.type);
      return maybeWrap(n, '−' + (wrapInner ? `(${inner})` : inner));
    }
    const l = rec(n.l), r = rec(n.r);
    const lw = needsParens(n.l, n.type, 'l'), rw = needsParens(n.r, n.type, 'r');
    const sep = n.implicit ? '' : ` ${esc(OP_SYMBOL[n.type])} `;
    return maybeWrap(n, `${lw?'('+l+')':l}${sep}${rw?'('+r+')':r}`);
  }
  return rec(node);
}
function toHtmlHighlight(str){
  return str.split('\u0001').map((chunk,i) => {
    if(i===0) return escapeHtml(chunk);
    const [hl, rest] = chunk.split('\u0002');
    return `<span class="step-hl">${escapeHtml(hl)}</span>${escapeHtml(rest)}`;
  }).join('');
}
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function toLatex(node){
  function rec(n){
    if(n.type === 'num') return fmtNum(n.value);
    if(n.type === 'var') return n.name;
    if(n.type === 'neg') return '-' + (['add','sub'].includes(n.a.type) ? `(${rec(n.a)})` : rec(n.a));
    if(n.type === 'pow') return `{${needsLatexParens(n.l)?'('+rec(n.l)+')':rec(n.l)}}^{${rec(n.r)}}`;
    if(n.type === 'div') return `\\frac{${rec(n.l)}}{${rec(n.r)}}`;
    const prec = { add:1, sub:1, mul:2, pow:4, neg:3, num:5, var:5 };
    const lw = prec[n.l.type] < prec[n.type], rw = prec[n.r.type] < prec[n.type] || (n.type==='sub' && n.r.type==='sub');
    const sym = n.type==='add' ? '+' : (n.type==='sub' ? '-' : (n.implicit ? '' : '\\times '));
    return `${lw?'('+rec(n.l)+')':rec(n.l)} ${sym} ${rw?'('+rec(n.r)+')':rec(n.r)}`;
  }
  function needsLatexParens(n){ return ['add','sub','mul','div','neg'].includes(n.type); }
  return rec(node);
}

/* ---------- 4. SUSTITUCIÓN DE VARIABLES ---------- */
function substituteVars(node, values){
  if(node.type === 'num') return node;
  if(node.type === 'var') return { type:'num', value: values[node.name] !== undefined ? values[node.name] : 0 };
  if(node.type === 'neg') return { type:'neg', a: substituteVars(node.a, values) };
  return { type:node.type, l: substituteVars(node.l, values), r: substituteVars(node.r, values), implicit:node.implicit };
}

/* ---------- 5. EVALUADOR DE UN NODO ---------- */
function evalOp(type, a, b){
  switch(type){ case 'add': return a+b; case 'sub': return a-b; case 'mul': return a*b; case 'div': return a/b; case 'pow': return Math.pow(a,b); }
}
const OP_NAME = { add:'Suma', sub:'Resta', mul:'Multiplicación', div:'División', pow:'Potencia' };

/* ---------- 6. SIGUIENTE NODO REDUCIBLE (post-order) ---------- */
// Recolecta TODOS los nodos listos para reducirse (ambos operandos ya numéricos),
// en orden de lectura izquierda-derecha, marcando si vienen de un paréntesis
// explícito sin resolver y su nivel PEMDAS (1=potencia, 2=negativo, 3=mult/div, 4=suma/resta).
// Esto reproduce la convención estándar: TODOS los paréntesis primero, luego TODOS
// los exponentes, luego TODA la mult/div, luego TODA la suma/resta — no solo "lo
// primero que esté listo en cualquier parte".
function collectReadyNodes(node, insideParen, path, acc){
  if(node.type === 'num' || node.type === 'var') return;
  const nowIn = insideParen || !!node.paren;
  if(node.type === 'neg'){
    if(isNumeric(node.a)) acc.push({ node, path, kind:'neg', inParen: nowIn, tier: 2 });
    else collectReadyNodes(node.a, nowIn, [...path,'a'], acc);
    return;
  }
  if(isNumeric(node.l) && isNumeric(node.r)){
    const tier = node.type === 'pow' ? 1 : (['mul','div'].includes(node.type) ? 3 : 4);
    acc.push({ node, path, kind:'binary', inParen: nowIn, tier });
    return;
  }
  if(!isNumeric(node.l)) collectReadyNodes(node.l, nowIn, [...path,'l'], acc);
  if(!isNumeric(node.r)) collectReadyNodes(node.r, nowIn, [...path,'r'], acc);
}
function findNextReducible(node){
  const acc = [];
  collectReadyNodes(node, false, [], acc);
  if(acc.length === 0) return null;
  acc.sort((a,b) => (a.inParen===b.inParen ? 0 : (a.inParen ? -1 : 1)) || (a.tier - b.tier));
  return acc[0];
}
function replaceAtPath(root, path, replacement){
  if(path.length === 0) return replacement;
  const clone = { ...root };
  const key = path[0];
  clone[key] = replaceAtPath(root[key], path.slice(1), replacement);
  return clone;
}

/* ---------- 7. GENERADOR DE PASOS ---------- */
function generateSteps(ast, varValues){
  const steps = [];
  let current = ast;
  const vars = Array.from(getVars(ast));
  if(vars.length > 0){
    const before = toStr(current, null);
    current = substituteVars(current, varValues || {});
    const after = toStr(current, null);
    steps.push({ kind:'substitute', before, after, rule: `Sustituir ${vars.map(v=>`${v} = ${fmtNum(varValues[v]!==undefined?varValues[v]:0)}`).join(', ')}` });
  }
  const initialState = current; // estado justo antes del primer paso aritmético (ya con variables sustituidas)
  let guard = 0;
  while(!isNumeric(current) && guard < 300){
    guard++;
    const found = findNextReducible(current);
    if(!found) break;
    const { node, path, kind } = found;
    const beforeState = current;
    const beforeStr = toStr(current, node);
    let value, ruleName;
    if(kind === 'neg'){ value = -node.a.value; ruleName = 'Negativo (unario)'; }
    else { value = evalOp(node.type, node.l.value, node.r.value); ruleName = OP_NAME[node.type]; }
    const replacement = { type:'num', value };
    current = replaceAtPath(current, path, replacement);
    const afterStr = toStr(current, replacement);
    steps.push({ kind:'reduce', before: beforeStr, after: afterStr, rule: ruleName, value, beforeState, opNode: node, afterState: current, resultNode: replacement });
  }
  steps.finalValue = isNumeric(current) ? current.value : null;
  steps.initialState = initialState;
  return steps;
}

// Extrae pares (num OP num) ADYACENTES tal como se VEN en la expresión actual —
// esto es exactamente lo que un estudiante confundido podría operar por error,
// ignorando la jerarquía (ej. sumar antes de multiplicar, o juntar los últimos
// dos términos visibles). Un grupo entre paréntesis que no sea un solo número
// no cuenta como término plano (no se puede "operar directo" con él).
function extractFlatPairs(str){
  const toks = tokenize(str).filter(t=>t.t!=='EOF');
  const flat = [];
  let i=0;
  while(i<toks.length){
    const t = toks[i];
    if(t.t==='LP'){
      let depth=1, j=i+1;
      while(j<toks.length && depth>0){ if(toks[j].t==='LP') depth++; if(toks[j].t==='RP') depth--; j++; }
      const inner = toks.slice(i+1, j-1);
      if(inner.length===1 && inner[0].t==='NUM') flat.push({t:'NUM', value: inner[0].value});
      else flat.push({t:'GROUP'});
      i = j; continue;
    }
    flat.push(t); i++;
  }
  const OP_TYPES = { PLUS:'add', MINUS:'sub', MUL:'mul', DIV:'div', POW:'pow' };
  const pairs = [];
  for(let k=0;k<flat.length-2;k++){
    if(flat[k].t==='NUM' && OP_TYPES[flat[k+1].t] && flat[k+2].t==='NUM'){
      const type = OP_TYPES[flat[k+1].t];
      pairs.push({ a: flat[k].value, b: flat[k+2].value, type, value: evalOp(type, flat[k].value, flat[k+2].value) });
    }
  }
  return pairs;
}

/* ---------- 8. GENERADOR DE OPCIONES TRAMPA (juego) ---------- */
function generateChoices(currentAst){
  const found = findNextReducible(currentAst);
  if(!found) return null;
  const { node, kind } = found;
  const correctValue = kind==='neg' ? -node.a.value : evalOp(node.type, node.l.value, node.r.value);
  const correctExprStr = kind==='neg' ? `−${fmtNum(node.a.value)}` : `${fmtNum(node.l.value)} ${OP_SYMBOL[node.type]} ${fmtNum(node.r.value)}`;
  const correctLabel = kind==='neg' ? 'Negativo (unario)' : OP_NAME[node.type];

  const options = [{ text: `${correctExprStr} = ${fmtNum(correctValue)}`, rule: correctLabel, value: correctValue, correct:true }];
  const seen = new Set([correctValue]);

  // Trampas reales: pares adyacentes visibles en la expresión que NO son el paso
  // correcto (ej. sumar antes de multiplicar, o juntar los dos últimos términos).
  const flatPairs = extractFlatPairs(toStr(currentAst, null));
  const candidates = [flatPairs[0], flatPairs[flatPairs.length-1]].filter(Boolean);
  candidates.forEach(p => {
    if(seen.has(p.value)) return;
    seen.add(p.value);
    options.push({ text: `${fmtNum(p.a)} ${OP_SYMBOL[p.type]} ${fmtNum(p.b)} = ${fmtNum(p.value)}`, rule:'Ignora la jerarquía', value: p.value, correct:false });
  });

  // Si aún faltan opciones, un desliz de cálculo en la operación CORRECTA (mismos
  // números, mismo operador, resultado ligeramente distinto) para probar precisión.
  if(options.length < 4){
    let slipVal;
    if(kind === 'neg') slipVal = node.a.value;
    else if(node.type === 'mul') slipVal = node.l.value + node.r.value;
    else if(node.type === 'pow') slipVal = node.l.value * node.r.value;
    else slipVal = correctValue + 1;
    if(seen.has(slipVal)) slipVal = correctValue - 1;
    if(!seen.has(slipVal)){
      seen.add(slipVal);
      const exprStr = kind==='neg' ? `−${fmtNum(node.a.value)}` : `${fmtNum(node.l.value)} ${OP_SYMBOL[node.type]} ${fmtNum(node.r.value)}`;
      options.push({ text: `${exprStr} = ${fmtNum(slipVal)}`, rule:'Error de cálculo', value: slipVal, correct:false });
    }
  }
  // Último recurso si todavía falta (expresiones muy cortas): invertir operandos en resta/división
  if(options.length < 4 && (node.type === 'sub' || node.type === 'div')){
    const flipped = evalOp(node.type, node.r.value, node.l.value);
    if(!seen.has(flipped)){
      seen.add(flipped);
      options.push({ text:`${fmtNum(node.r.value)} ${OP_SYMBOL[node.type]} ${fmtNum(node.l.value)} = ${fmtNum(flipped)}`, rule:'Orden de operandos invertido', value: flipped, correct:false });
    }
  }

  for(let i=options.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [options[i],options[j]]=[options[j],options[i]]; }
  return { options: options.slice(0,4), correctExprStr, correctValue, correctLabel, node, kind };
}

/* =========================================================
   SONIDO (Web Audio API)
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
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    const t0 = ctx.currentTime + delay;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+duration);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0+duration+0.02);
  }catch(e){}
}
function playSuccessSound(){ playTone(523.25,0.14,'sine',0); playTone(659.25,0.14,'sine',0.1); playTone(783.99,0.22,'sine',0.2); }
function playErrorSound(){ playTone(220,0.18,'sawtooth',0,0.08); playTone(174.6,0.28,'sawtooth',0.12,0.08); }
function playClickSound(){ playTone(440,0.08,'triangle'); }

/* ---------- Música de fondo (arpegio suave en loop, Web Audio) ---------- */
let musicEnabled = true;
let musicTimeoutId = null;
const MUSIC_NOTES = [261.63, 329.63, 392.00, 329.63, 392.00, 493.88, 392.00, 329.63]; // C E G E G B G E
function scheduleMusicLoop(){
  clearTimeout(musicTimeoutId); // por si ya había un loop corriendo, evita duplicarlo
  let i = 0;
  function playNext(){
    if(!musicEnabled) return;
    playTone(MUSIC_NOTES[i % MUSIC_NOTES.length], 1.1, 'sine', 0, 0.028);
    playTone(MUSIC_NOTES[i % MUSIC_NOTES.length]/2, 1.3, 'sine', 0, 0.014); // octava grave suave de fondo
    i++;
    musicTimeoutId = setTimeout(playNext, 620);
  }
  playNext();
}
function toggleMusic(){
  musicEnabled = !musicEnabled;
  if(musicEnabled){ getAudioCtx(); scheduleMusicLoop(); }
  else clearTimeout(musicTimeoutId);
  const btn = $('#musicToggle');
  if(btn) btn.textContent = musicEnabled ? '🔊 Música' : '🔇 Música';
}

/* =========================================================
   ESTADO GLOBAL DE LA UI
   ========================================================= */
let currentAST = null;
let currentVars = [];
let varValues = {};

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
    currentAST = parseExpr(input);
    currentVars = Array.from(getVars(currentAST)).sort();
    renderKatexInto($('#katexRender'), toLatex(currentAST));
    $('#eqStatus').textContent = '✓';
    $('#eqStatus').className = 'eq-status ok';
    renderVarBar();
    renderEvaluator();
  }catch(e){
    errorBox.textContent = '⚠ ' + e.message;
    $('#eqStatus').textContent = '✕';
    $('#eqStatus').className = 'eq-status err';
    currentAST = null;
  }
}

function renderVarBar(){
  const bar = $('#varBar');
  if(currentVars.length === 0){ bar.style.display = 'none'; bar.innerHTML=''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = currentVars.map(v => {
    if(varValues[v] === undefined) varValues[v] = 1;
    return `<div class="var-input">${v} = <input type="number" data-var="${v}" value="${varValues[v]}"></div>`;
  }).join('');
  $$('#varBar input').forEach(inp => {
    inp.addEventListener('input', () => {
      varValues[inp.dataset.var] = parseFloat(inp.value) || 0;
      renderEvaluator();
    });
  });
}

/* ---------- Vista Evaluador ---------- */
function wireChainHover(){
  const container = $('#stepsList');
  const spans = Array.from(container.querySelectorAll('[data-step]'));
  const byStep = {};
  spans.forEach(el => { (byStep[el.dataset.step] = byStep[el.dataset.step] || []).push(el); });
  spans.forEach(el => {
    el.addEventListener('mouseenter', () => {
      (byStep[el.dataset.step] || []).forEach(e => e.classList.add('linked-active'));
    });
    el.addEventListener('mouseleave', () => {
      (byStep[el.dataset.step] || []).forEach(e => e.classList.remove('linked-active'));
    });
  });
}

// Construye el HTML de la cadena de igualdades completa (con etiquetas de regla),
// reutilizable tanto en el Evaluador como en la pantalla de "ejercicio completo" del juego.
function buildChainHtml(ast, varValuesObj){
  const steps = generateSteps(ast, varValuesObj);
  const reduceSteps = steps.filter(s => s.kind === 'reduce');
  const substituteStep = steps.find(s => s.kind === 'substitute');

  let html = '';
  if(substituteStep){
    html += `<div class="chain-line"><span class="chain-eq"></span><span class="chain-expr">${escapeHtml(substituteStep.before)}</span><span class="chain-note">dado</span></div>`;
  }

  if(reduceSteps.length === 0){
    const only = escapeHtml(toStr(steps.initialState, null));
    html += `<div class="chain-line"><span class="chain-eq">${substituteStep?'=':''}</span><span class="chain-expr">${only}</span></div>`;
  } else {
    const marks0 = new Map();
    marks0.set(reduceSteps[0].opNode, {cls:'op-current', step:0});
    html += `<div class="chain-line"><span class="chain-eq">${substituteStep?'=':''}</span><span class="chain-expr">${toStrHtml(steps.initialState, marks0)}</span></div>`;

    reduceSteps.forEach((s,i) => {
      const marks = new Map();
      marks.set(s.resultNode, {cls:'result-from', step:i});
      if(i+1 < reduceSteps.length) marks.set(reduceSteps[i+1].opNode, {cls:'op-current', step:i+1});
      html += `<div class="chain-line"><span class="chain-eq">=</span><span class="chain-expr">${toStrHtml(s.afterState, marks)}</span><span class="chain-note">${s.rule}</span></div>`;
    });
  }
  return { html, steps, reduceSteps };
}

function renderEvaluator(){
  if(!currentAST) return;
  const { html, steps, reduceSteps } = buildChainHtml(currentAST, varValues);
  $('#stepsList').innerHTML = html;
  wireChainHover();

  const finalBadge = $('#finalBadge');
  if(steps.finalValue !== null){
    finalBadge.style.display = 'block';
    finalBadge.textContent = `Resultado final = ${fmtNum(steps.finalValue)}`;
    $('#chipResult').textContent = 'Resultado: ' + fmtNum(steps.finalValue);
  } else {
    finalBadge.style.display = 'none';
    $('#chipResult').textContent = 'Resultado: —';
  }
  $('#chipSteps').textContent = (reduceSteps.length) + (reduceSteps.length===1?' paso':' pasos');

  $('#resultCard').innerHTML = `<div class="readout-grid">
    <div class="row"><span class="rk">Variables</span><span class="rv">${currentVars.length ? currentVars.join(', ') : 'ninguna'}</span></div>
    <div class="row"><span class="rk">Total de pasos</span><span class="rv">${steps.length}</span></div>
    <div class="row"><span class="rk">Resultado final</span><span class="rv">${steps.finalValue !== null ? fmtNum(steps.finalValue) : '—'}</span></div>
  </div>`;
}

/* ---------- Vista Juego: sesión con puntaje, nombre, historial y 25 ejercicios seguidos ---------- */
const HISTORY_KEY = 'pemdas_en_accion_historial';
const SESSION_SIZE = { 1:5, 2:5, 3:5, 4:5, 5:5 }; // 25 ejercicios en total

function loadHistory(){
  try{ return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }catch(e){ return []; }
}
function saveHistoryEntry(entry){
  const hist = loadHistory();
  hist.push(entry);
  hist.sort((a,b) => b.score - a.score);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0,50)));
}
function renderHistoryInto(elId){
  const hist = loadHistory().slice(0,8);
  const el = $('#'+elId);
  if(!el) return;
  if(hist.length === 0){ el.innerHTML = ''; return; }
  el.innerHTML = `<div class="history-title">🏅 Mejores puntajes</div>` + hist.map(h =>
    `<div class="history-row"><span class="h-name">${escapeHtml(h.name)}</span><span>${h.date}</span><span class="h-score">${h.score} pts</span></div>`
  ).join('');
}

function buildExerciseQueue(){
  const queue = [];
  Object.entries(SESSION_SIZE).forEach(([level, count]) => {
    const list = EXERCISES[level].slice();
    for(let i=list.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [list[i],list[j]]=[list[j],list[i]]; }
    list.slice(0,count).forEach(f => queue.push({formula:f, level:parseInt(level,10)}));
  });
  return queue;
}

let session = null; // {name, score, queue, idx, ast, wrongOnThisExercise, chainHtml}

function startGameSession(){
  const name = $('#playerNameInput').value.trim() || 'Jugador';
  session = { name, score:0, queue: buildExerciseQueue(), idx:0, ast:null, wrongOnThisExercise:0, chainHtml:[] };
  $('#gameStartScreen').style.display = 'none';
  $('#gameEndScreen').style.display = 'none';
  $('#gamePlayScreen').style.display = 'block';
  $('#gamePlayerName').textContent = '👤 ' + session.name;
  loadExerciseIntoSession();
}
function loadExerciseIntoSession(){
  if(session.idx >= session.queue.length){ endGameSession(); return; }
  const ex = session.queue[session.idx];
  const ast = parseExpr(ex.formula);
  const vars = Array.from(getVars(ast));
  const vals = {}; vars.forEach(v => vals[v] = DEFAULT_EXERCISE_VARS[v] !== undefined ? DEFAULT_EXERCISE_VARS[v] : 1);
  session.originalAst = ast;
  session.varVals = vals;
  session.ast = vars.length ? substituteVars(ast, vals) : ast;
  session.wrongOnThisExercise = 0;
  session.chainHtml = [];
  clearInterval(countdownInterval);
  $('#nextExerciseBar').style.display = 'none';
  $('#gameExerciseCounter').textContent = `Ejercicio ${session.idx+1}/${session.queue.length} · Nivel ${ex.level}`;
  $('#gameFeedback').innerHTML = '';
  const face = $('#gameFace'); face.textContent='🙂'; face.className='game-face';
  renderGameChainAndStep();
}
function updateScore(delta){
  session.score = Math.max(0, session.score + delta);
  $('#gameScore').textContent = `⭐ ${session.score} puntos`;
}
let countdownInterval = null;
function startNextExerciseCountdown(){
  let remaining = 10;
  const bar = $('#nextExerciseBar'), text = $('#nextExerciseText');
  bar.style.display = 'block';
  text.textContent = `⏱ Próximo ejercicio en ${remaining} seg...`;
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remaining--;
    if(remaining <= 0){
      clearInterval(countdownInterval);
      bar.style.display = 'none';
      loadExerciseIntoSession();
    } else {
      text.textContent = `⏱ Próximo ejercicio en ${remaining} seg...`;
    }
  }, 1000);
}
function skipCountdown(){
  clearInterval(countdownInterval);
  $('#nextExerciseBar').style.display = 'none';
  loadExerciseIntoSession();
}
function renderGameChainAndStep(){
  const { ast } = session;

  if(isNumeric(ast)){
    // Mostramos la cadena COMPLETA y prolija, igual que en el Evaluador paso a paso
    // (con las etiquetas de regla), no la versión parcial que se fue construyendo.
    const { html } = buildChainHtml(session.originalAst, session.varVals);
    $('#gameChain').innerHTML = html;
    wireChainHover();
    playSuccessSound();
    const face = $('#gameFace'); face.textContent = session.wrongOnThisExercise===0 ? '🤩' : '😄'; face.className='game-face win';
    const bonus = session.wrongOnThisExercise === 0 ? 15 : 0;
    if(bonus) updateScore(bonus);
    $('#gameExpr').innerHTML = `¡Ejercicio completo! Resultado = <b>${fmtNum(ast.value)}</b>${bonus?' · +15 bono sin errores 🎉':''}`;
    $('#choiceGrid').innerHTML = '';
    $('#gameProgress').innerHTML = '';
    session.idx++;
    startNextExerciseCountdown();
    return;
  }

  $('#gameChain').innerHTML = session.chainHtml.join('');
  wireChainHover();
  const choices = generateChoices(ast);
  if(!choices) return;
  $('#gameExpr').innerHTML = toHtmlHighlight(toStr(ast, null));
  $('#choiceGrid').innerHTML = choices.options.map((o,i) => `<button class="choice-btn" data-idx="${i}"><span>${o.text}</span></button>`).join('');
  $$('#choiceGrid .choice-btn').forEach((btn,i) => btn.addEventListener('click', () => onGameChoiceClick(choices, i)));

  const total = generateSteps(session.ast, {}).filter(s=>s.kind==='reduce').length + session.chainHtml.length;
  let dots = '';
  for(let i=0;i<Math.max(total,1);i++) dots += `<div class="progress-dot ${i<session.chainHtml.length?'done':(i===session.chainHtml.length?'current':'')}"></div>`;
  $('#gameProgress').innerHTML = dots;
}
const WHY_CORRECT = {
  'Suma':'la suma y la resta se resuelven al final, cuando ya no queda nada de mayor jerarquía.',
  'Resta':'la suma y la resta se resuelven al final, cuando ya no queda nada de mayor jerarquía.',
  'Multiplicación':'la multiplicación y la división van antes que la suma y la resta.',
  'División':'la multiplicación y la división van antes que la suma y la resta.',
  'Potencia':'los exponentes se resuelven antes que la multiplicación, división, suma y resta.',
  'Negativo (unario)':'ya no queda ninguna operación de mayor jerarquía pendiente en esa parte.'
};
const WHY_WRONG = {
  'Ignora la jerarquía': (chosenText, correctText) => `Esa combinación ignora la jerarquía de operaciones — juntaste números que no se resuelven todavía. Lo correcto era: ${correctText}.`,
  'Error de cálculo': (chosenText, correctText) => `¡Esa SÍ era la operación correcta! Pero el resultado del cálculo está mal — vuelve a hacer la cuenta con calma.`,
  'Orden de operandos invertido': (chosenText, correctText) => `En la resta y la división el orden de los números sí importa: no es lo mismo a − b que b − a. Lo correcto era: ${correctText}.`
};
function onGameChoiceClick(choices, idx){
  const chosen = choices.options[idx];
  const buttons = $$('#choiceGrid .choice-btn');
  buttons.forEach((b,i) => {
    if(choices.options[i].correct) b.classList.add('correct');
    else if(i===idx) b.classList.add('wrong');
    b.style.pointerEvents = 'none';
  });
  const face = $('#gameFace');
  if(chosen.correct){
    playSuccessSound();
    face.textContent='🤩'; face.className='game-face win';
    updateScore(10);
    const why = WHY_CORRECT[choices.correctLabel] || 'seguiste bien la jerarquía de operaciones.';
    $('#gameFeedback').innerHTML = `<span style="color:var(--good)">✓ ¡Correcto! +10 puntos — ${why}</span>`;
    const found = findNextReducible(session.ast);
    const opNode = found.node;
    const replacement = { type:'num', value: choices.correctValue };
    const marks = new Map();
    marks.set(opNode, {cls:'op-current', step: session.chainHtml.length});
    const lineIndex = session.chainHtml.length;
    const beforeHtml = toStrHtml(session.ast, marks);
    session.ast = replaceAtPath(session.ast, found.path, replacement);
    const marksAfter = new Map();
    marksAfter.set(replacement, {cls:'result-from', step: lineIndex});
    const afterHtml = toStrHtml(session.ast, marksAfter);
    const prefix = session.chainHtml.length === 0 ? '' : '=';
    session.chainHtml.push(`<div class="chain-line"><span class="chain-eq">${prefix}</span><span class="chain-expr">${afterHtml}</span></div>`);
    setTimeout(() => { $('#gameFeedback').innerHTML=''; renderGameChainAndStep(); }, 950);
  } else {
    playErrorSound();
    face.textContent='😕'; face.className='game-face oops';
    session.wrongOnThisExercise++;
    updateScore(-5);
    const msgFn = WHY_WRONG[chosen.rule] || (() => `Esa no era la operación correcta. Lo correcto era: ${choices.correctExprStr} = ${fmtNum(choices.correctValue)}.`);
    const msg = msgFn(chosen.text, `${choices.correctExprStr} = ${fmtNum(choices.correctValue)}`);
    $('#gameFeedback').innerHTML = `<span style="color:var(--bad)">✕ −5 puntos. ${msg}</span>`;
    setTimeout(() => {
      buttons.forEach(b => { b.style.pointerEvents=''; b.classList.remove('wrong'); });
    }, 2400);
  }
}
function endGameSession(){
  clearInterval(countdownInterval);
  $('#gamePlayScreen').style.display = 'none';
  $('#gameEndScreen').style.display = 'block';
  const emoji = session.score >= 250 ? '🏆' : (session.score >= 150 ? '🥈' : '🎯');
  $('#endEmoji').textContent = emoji;
  $('#finalScoreText').innerHTML = `<b style="color:var(--good);font-size:20px;">${session.score} puntos</b><br>${session.name}, completaste ${session.queue.length} ejercicios. ¡Bien hecho! 🎉`;
  saveHistoryEntry({ name: session.name, score: session.score, date: new Date().toLocaleDateString('es-CO'), total: session.queue.length });
  renderHistoryInto('historyPanelEnd');
}
function resetGameToStart(){
  $('#gamePlayScreen').style.display = 'none';
  $('#gameEndScreen').style.display = 'none';
  $('#gameStartScreen').style.display = 'block';
  renderHistoryInto('historyPanel');
}

/* =========================================================
   GALERÍA Y SELECTOR DE VISTAS
   ========================================================= */
const EXERCISES = {
  1: [
    '3 + 4 × 2', '10 - 2 × 3', '8 ÷ 2 + 1', '6 + 8 ÷ 4', '2 × 5 - 3',
    '9 - 4 + 2', '12 ÷ 3 × 2', '5 × 2 + 6', '7 + 3 × 3', '20 - 5 × 2'
  ],
  2: [
    '(3 + 4) × 2', '2 × (5 - 1) + 3', '(8 - 2) ÷ 3', '4 × (2 + 3) - 5', '(6 + 2) ÷ 2 + 1',
    '10 - (3 + 2)', '(7 - 3) × (2 + 1)', '3 + (4 × 2) - 1', '(5 + 5) ÷ (2 + 3)', '2 × (3 + 1) × 2'
  ],
  3: [
    '2 × 3^2 + 1', '(2 + 1)^2 × 3', '3^2 - 2 × 4', '2^3 + 4 × 2', '(4 - 1)^2 + 5',
    '5 + 2^2 × 3', '3 × 2^2 - 4', '(3 + 2)^2 - 10', '2^2 + 3^2', '4 × (1 + 1)^3'
  ],
  4: [
    '((2 + 3) × (4 - 1))^2', '-3^2 + 4 × 2', '(2 - 5)^2 × 2', '3 × (2 + (4 - 1))^2', '-2^2 - 3',
    '((1 + 2)^2 - 4) × 3', '2 × ((3 - 1)^2 + 2)', '(-2)^2 × (3 + 1)', '5 - (2 + 3)^2', '((4 - 2) × 3)^2 - 1'
  ],
  5: [
    '2x + 3(x - 1)', 'x^2 - 2(y + 1)', '3(x + 2)^2 - 4', '2(x + y) - x^2', '(x - 1)^2 + y',
    'x^2 + y^2 - 2x', '3x - (x + 2)^2', '2(x^2 - y) + 3', '(2x + 1)^2 - y', 'x^2(y + 1) - 3'
  ]
};
const DEFAULT_EXERCISE_VARS = {x:3, y:2};
let currentLevel = 1;

function renderExerciseBank(){
  const list = EXERCISES[currentLevel];
  $('#exerciseList').innerHTML = list.map((f,i) => `<div class="preset" data-formula="${encodeURIComponent(f)}">
    <div><div class="pname">Ejercicio ${i+1}</div><div class="pmath">${f}</div></div>
  </div>`).join('');
  $$('#exerciseList .preset').forEach(el => {
    el.addEventListener('click', () => {
      $('#formulaInput').value = decodeURIComponent(el.dataset.formula);
      varValues = {...DEFAULT_EXERCISE_VARS};
      parseAndRender();
    });
  });
}

const PRESETS = [
  {name:'Básico', formula:'3 + 4 × 2'},
  {name:'Con paréntesis', formula:'(3 + 4) × 2'},
  {name:'Exponentes', formula:'2 × 3^2 + 1'},
  {name:'Paréntesis anidados', formula:'((2 + 3) × (4 - 1))^2'},
  {name:'Negativo vs. exponente', formula:'-3^2'},
  {name:'El caso viral', formula:'6 ÷ 2(1 + 2)'},
  {name:'Con variable', formula:'2x + 3(x - 1)'},
  {name:'Con dos variables', formula:'x^2 - y + 3'},
];
function renderPresets(){
  $('#presets').innerHTML = PRESETS.map(p => `<div class="preset" data-formula="${encodeURIComponent(p.formula)}">
    <div><div class="pname">${p.name}</div><div class="pmath">${p.formula}</div></div>
  </div>`).join('');
  $$('#presets .preset').forEach(el => {
    el.addEventListener('click', () => {
      $('#formulaInput').value = decodeURIComponent(el.dataset.formula);
      varValues = {};
      parseAndRender();
    });
  });
}
const VIEW_HINTS = {
  evaluador: 'Cada paso resalta exactamente qué se está resolviendo.',
  juego: 'Elige cuál operación corresponde a continuación, siguiendo la jerarquía PEMDAS.'
};
function switchView(view){
  $$('#viewSelector .preset').forEach(p => p.classList.toggle('active', p.dataset.view===view));
  $$('.stage-view').forEach(v => v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $('#stageHint').textContent = VIEW_HINTS[view];
  if(view === 'juego' && !session) renderHistoryInto('historyPanel');
}

/* =========================================================
   WIRING DE EVENTOS
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  $('#formulaInput').addEventListener('input', parseAndRender);
  $$('.symbols button').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = $('#formulaInput');
      const pos = input.selectionStart || input.value.length;
      const ins = btn.dataset.ins;
      input.value = input.value.slice(0,pos) + ins + input.value.slice(pos);
      input.focus();
      input.selectionStart = input.selectionEnd = pos + ins.length;
      parseAndRender();
    });
  });
  $$('#viewSelector .preset').forEach(p => p.addEventListener('click', () => switchView(p.dataset.view)));
  $('#btnStartGame').addEventListener('click', startGameSession);
  $('#playerNameInput').addEventListener('keydown', (e) => { if(e.key==='Enter') startGameSession(); });
  $('#btnQuitGame').addEventListener('click', () => { if(session){ endGameSession(); } });
  $('#btnPlayAgain').addEventListener('click', resetGameToStart);
  $('#btnSkipCountdown').addEventListener('click', skipCountdown);
  $('#musicToggle').addEventListener('click', toggleMusic);
  // Los navegadores bloquean el audio hasta el primer gesto del usuario — como la
  // música queda activada por defecto, la arrancamos en cuanto haya cualquier clic.
  let musicStarted = false;
  document.addEventListener('click', function startMusicOnce(){
    if(!musicStarted && musicEnabled){ musicStarted = true; getAudioCtx(); scheduleMusicLoop(); }
  });
  $('#levelSelect').addEventListener('change', (e) => { currentLevel = parseInt(e.target.value,10); renderExerciseBank(); });

  renderPresets();
  renderExerciseBank();
  parseAndRender();
});
