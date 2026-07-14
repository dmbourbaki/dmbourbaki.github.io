/* =========================================================
   OMAI — Explorador de Lógica Proposicional
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
    if(c === '¬' || c === '!' || c === '~'){ tokens.push({t:'NOT'}); i++; continue; }
    if(c === '∧' || c === '&' || c === '*'){ tokens.push({t:'AND'}); i++; continue; }
    if(c === '∨' || c === '|' || c === '+'){ tokens.push({t:'OR'}); i++; continue; }
    if(input.substr(i,3) === '<->'){ tokens.push({t:'IFF'}); i+=3; continue; }
    if(c === '↔'){ tokens.push({t:'IFF'}); i++; continue; }
    if(input.substr(i,2) === '->'){ tokens.push({t:'IMP'}); i+=2; continue; }
    if(c === '→'){ tokens.push({t:'IMP'}); i++; continue; }
    if(c === 'V'){ tokens.push({t:'TRUE'}); i++; continue; }
    if(c === 'F'){ tokens.push({t:'FALSE'}); i++; continue; }
    if(/[a-z]/.test(c)){
      let j = i+1;
      while(j < input.length && /[0-9]/.test(input[j])) j++;
      tokens.push({t:'VAR', name: input.slice(i,j)});
      i = j; continue;
    }
    i++; // caracter desconocido: se ignora
  }
  tokens.push({t:'EOF'});
  return tokens;
}

/* ---------- 2. PARSER ---------- */
function parse(tokens){
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (t) => { if(tokens[pos].t !== t) throw new Error(`Se esperaba ${t} pero se encontró ${tokens[pos].t}`); return tokens[pos++]; };
  function parseIff(){ let left = parseImp(); while(peek().t === 'IFF'){ eat('IFF'); left = {type:'iff', l:left, r:parseImp()}; } return left; }
  function parseImp(){ let left = parseOr(); if(peek().t === 'IMP'){ eat('IMP'); left = {type:'imp', l:left, r:parseImp()}; } return left; }
  function parseOr(){ let left = parseAnd(); while(peek().t === 'OR'){ eat('OR'); left = {type:'or', l:left, r:parseAnd()}; } return left; }
  function parseAnd(){ let left = parseNot(); while(peek().t === 'AND'){ eat('AND'); left = {type:'and', l:left, r:parseNot()}; } return left; }
  function parseNot(){ if(peek().t === 'NOT'){ eat('NOT'); return {type:'not', a: parseNot()}; } return parseAtom(); }
  function parseAtom(){
    const tk = peek();
    if(tk.t === 'LP'){ eat('LP'); const e = parseIff(); eat('RP'); return e; }
    if(tk.t === 'VAR'){ eat('VAR'); return {type:'var', name: tk.name}; }
    if(tk.t === 'TRUE'){ eat('TRUE'); return {type:'const', v:true}; }
    if(tk.t === 'FALSE'){ eat('FALSE'); return {type:'const', v:false}; }
    throw new Error('Fórmula incompleta o símbolo inesperado cerca de "' + (tk.t||'') + '"');
  };
  const result = parseIff();
  eat('EOF');
  return result;
}
function parseFormula(str){
  if(!str || !str.trim()) throw new Error('Escribe una fórmula.');
  return parse(tokenize(str));
}

/* ---------- 3. EVALUADOR Y UTILIDADES ---------- */
function evaluate(node, assign){
  switch(node.type){
    case 'var': return !!assign[node.name];
    case 'const': return node.v;
    case 'not': return !evaluate(node.a, assign);
    case 'and': return evaluate(node.l, assign) && evaluate(node.r, assign);
    case 'or': return evaluate(node.l, assign) || evaluate(node.r, assign);
    case 'imp': return (!evaluate(node.l, assign)) || evaluate(node.r, assign);
    case 'iff': return evaluate(node.l, assign) === evaluate(node.r, assign);
  }
}
function getVars(node, set = new Set()){
  if(node.type === 'var') set.add(node.name);
  else if(node.type === 'not') getVars(node.a, set);
  else if(node.type !== 'const') { getVars(node.l, set); getVars(node.r, set); }
  return set;
}
const SYM = {and:'∧', or:'∨', imp:'→', iff:'↔'};
function toString(node){
  function rec(n){
    if(n.type === 'var') return n.name;
    if(n.type === 'const') return n.v ? 'V' : 'F';
    if(n.type === 'not'){
      const inner = rec(n.a);
      const wrap = ['and','or','imp','iff'].includes(n.a.type);
      return '¬' + (wrap ? `(${inner})` : inner);
    }
    const l = rec(n.l), r = rec(n.r);
    const lw = ['and','or','imp','iff'].includes(n.l.type);
    const rw = ['and','or','imp','iff'].includes(n.r.type);
    return `${lw ? '('+l+')' : l} ${SYM[n.type]} ${rw ? '('+r+')' : r}`;
  }
  return rec(node);
}
function toLatex(node){
  const SYML = {and:'\\land', or:'\\lor', imp:'\\rightarrow', iff:'\\leftrightarrow'};
  function rec(n){
    if(n.type === 'var') return n.name;
    if(n.type === 'const') return n.v ? '\\text{V}' : '\\text{F}';
    if(n.type === 'not'){
      const inner = rec(n.a);
      const wrap = ['and','or','imp','iff'].includes(n.a.type);
      return '\\lnot ' + (wrap ? `(${inner})` : inner);
    }
    const l = rec(n.l), r = rec(n.r);
    const lw = ['and','or','imp','iff'].includes(n.l.type);
    const rw = ['and','or','imp','iff'].includes(n.r.type);
    return `${lw?'('+l+')':l} ${SYML[n.type]} ${rw?'('+r+')':r}`;
  }
  return rec(node);
}
function astEq(a,b){
  if(a.type !== b.type) return false;
  if(a.type === 'var') return a.name === b.name;
  if(a.type === 'const') return a.v === b.v;
  if(a.type === 'not') return astEq(a.a, b.a);
  if(a.type === 'and' || a.type === 'or') return (astEq(a.l,b.l) && astEq(a.r,b.r)) || (astEq(a.l,b.r) && astEq(a.r,b.l));
  return astEq(a.l,b.l) && astEq(a.r,b.r);
}

/* ---------- 4. TABLA DE VERDAD (con columnas progresivas de subfórmulas) ---------- */
function getSubformulas(node){
  // recorrido post-order; devuelve fórmulas compuestas (no variables ni constantes sueltas),
  // deduplicadas por su representación en texto, en el orden natural de evaluación.
  const seen = new Set();
  const list = [];
  function walk(n){
    if(n.type === 'var' || n.type === 'const') return;
    if(n.type === 'not') walk(n.a);
    else { walk(n.l); walk(n.r); }
    const str = toString(n);
    if(!seen.has(str)){ seen.add(str); list.push(n); }
  }
  walk(node);
  return list;
}
function truthTable(node){
  const vars = Array.from(getVars(node)).sort();
  const n = vars.length;
  const subforms = getSubformulas(node);
  const rows = [];
  for(let m=(1<<n)-1; m >= 0; m--){
    const assign = {};
    for(let k=0;k<n;k++) assign[vars[k]] = !!(m & (1<<(n-1-k)));
    const subvals = subforms.map(sf => evaluate(sf, assign));
    rows.push({assign, subvals, value: subvals.length ? subvals[subvals.length-1] : evaluate(node, assign)});
  }
  const anyTrue = rows.some(r=>r.value), anyFalse = rows.some(r=>!r.value);
  let classification = 'contingencia';
  if(anyTrue && !anyFalse) classification = 'tautologia';
  if(!anyTrue && anyFalse) classification = 'contradiccion';
  return {vars, subforms, rows, classification};
}

/* ---------- 5. SIMPLIFICADOR ---------- */
function applyRuleAtNode(n){
  if(n.type === 'not' && n.a.type === 'not') return {node: n.a.a, rule: 'Doble negación: ¬¬p ≡ p'};
  if(n.type === 'imp') return {node: {type:'or', l:{type:'not', a:n.l}, r:n.r}, rule: 'Eliminación de →: p → q ≡ ¬p ∨ q'};
  if(n.type === 'iff') return {node: {type:'and', l:{type:'or', l:{type:'not', a:n.l}, r:n.r}, r:{type:'or', l:{type:'not', a:n.r}, r:n.l}}, rule: 'Eliminación de ↔: p ↔ q ≡ (¬p ∨ q) ∧ (¬q ∨ p)'};
  if(n.type === 'not' && n.a.type === 'and') return {node:{type:'or', l:{type:'not',a:n.a.l}, r:{type:'not',a:n.a.r}}, rule:'Ley de De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q'};
  if(n.type === 'not' && n.a.type === 'or') return {node:{type:'and', l:{type:'not',a:n.a.l}, r:{type:'not',a:n.a.r}}, rule:'Ley de De Morgan: ¬(p ∨ q) ≡ ¬p ∧ ¬q'};
  if(n.type === 'and' && astEq(n.l,n.r)) return {node:n.l, rule:'Idempotencia: p ∧ p ≡ p'};
  if(n.type === 'or' && astEq(n.l,n.r)) return {node:n.l, rule:'Idempotencia: p ∨ p ≡ p'};
  if(n.type === 'and' && n.l.type==='const' && n.l.v===true) return {node:n.r, rule:'Identidad: V ∧ p ≡ p'};
  if(n.type === 'and' && n.r.type==='const' && n.r.v===true) return {node:n.l, rule:'Identidad: p ∧ V ≡ p'};
  if(n.type === 'or' && n.l.type==='const' && n.l.v===false) return {node:n.r, rule:'Identidad: F ∨ p ≡ p'};
  if(n.type === 'or' && n.r.type==='const' && n.r.v===false) return {node:n.l, rule:'Identidad: p ∨ F ≡ p'};
  if(n.type === 'and' && ((n.l.type==='const'&&n.l.v===false)||(n.r.type==='const'&&n.r.v===false))) return {node:{type:'const',v:false}, rule:'Dominación: p ∧ F ≡ F'};
  if(n.type === 'or' && ((n.l.type==='const'&&n.l.v===true)||(n.r.type==='const'&&n.r.v===true))) return {node:{type:'const',v:true}, rule:'Dominación: p ∨ V ≡ V'};
  if(n.type === 'and' && n.l.type==='not' && astEq(n.l.a,n.r)) return {node:{type:'const',v:false}, rule:'Negación: p ∧ ¬p ≡ F'};
  if(n.type === 'and' && n.r.type==='not' && astEq(n.r.a,n.l)) return {node:{type:'const',v:false}, rule:'Negación: ¬p ∧ p ≡ F'};
  if(n.type === 'or' && n.l.type==='not' && astEq(n.l.a,n.r)) return {node:{type:'const',v:true}, rule:'Negación: p ∨ ¬p ≡ V'};
  if(n.type === 'or' && n.r.type==='not' && astEq(n.r.a,n.l)) return {node:{type:'const',v:true}, rule:'Negación: ¬p ∨ p ≡ V'};
  if(n.type === 'and' && n.r.type==='or' && (astEq(n.l,n.r.l)||astEq(n.l,n.r.r))) return {node:n.l, rule:'Absorción: p ∧ (p ∨ q) ≡ p'};
  if(n.type === 'and' && n.l.type==='or' && (astEq(n.r,n.l.l)||astEq(n.r,n.l.r))) return {node:n.r, rule:'Absorción: (p ∨ q) ∧ p ≡ p'};
  if(n.type === 'or' && n.r.type==='and' && (astEq(n.l,n.r.l)||astEq(n.l,n.r.r))) return {node:n.l, rule:'Absorción: p ∨ (p ∧ q) ≡ p'};
  if(n.type === 'or' && n.l.type==='and' && (astEq(n.r,n.l.l)||astEq(n.r,n.l.r))) return {node:n.r, rule:'Absorción: (p ∧ q) ∨ p ≡ p'};
  return null;
}
function simplifyOnce(node){
  if(node.type === 'not'){ const c = simplifyOnce(node.a); if(c) return {node:{type:'not', a:c.node}, rule:c.rule}; }
  else if(node.l && node.r){
    const lr = simplifyOnce(node.l); if(lr) return {node:{...node, l:lr.node}, rule:lr.rule};
    const rr = simplifyOnce(node.r); if(rr) return {node:{...node, r:rr.node}, rule:rr.rule};
  }
  return applyRuleAtNode(node);
}
function simplifySteps(node, maxSteps=40){
  const steps = [{formula: toString(node), latex: toLatex(node), rule: null}];
  let current = node;
  for(let i=0;i<maxSteps;i++){
    const res = simplifyOnce(current);
    if(!res) break;
    current = res.node;
    steps.push({formula: toString(current), latex: toLatex(current), rule: res.rule});
  }
  return steps;
}
function equivalent(nodeA, nodeB){
  const vars = Array.from(new Set([...getVars(nodeA), ...getVars(nodeB)])).sort();
  const n = vars.length;
  for(let m=0; m<(1<<n); m++){
    const assign = {};
    for(let k=0;k<n;k++) assign[vars[k]] = !!(m & (1<<(n-1-k)));
    if(evaluate(nodeA,assign) !== evaluate(nodeB,assign)) return false;
  }
  return true;
}

/* =========================================================
   ESTADO GLOBAL DE LA UI
   ========================================================= */
let currentAST = null;
let currentVars = [];
let varAssignment = {}; // para el árbol interactivo

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function renderKatexInto(el, latex){
  try{ window.katex.render(latex, el, {throwOnError:false, displayMode:false}); }
  catch(e){ el.textContent = latex; }
}

/* ---------- Parseo principal + orquestación ---------- */
function parseAndRender(){
  const input = $('#formulaInput').value;
  const errorBox = $('#errorBox');
  errorBox.textContent = '';
  try{
    currentAST = parseFormula(input);
    currentVars = Array.from(getVars(currentAST)).sort();
    if(currentVars.length === 0) throw new Error('La fórmula debe contener al menos una variable proposicional (letras minúsculas).');
    if(currentVars.length > 8) throw new Error('Máximo 8 variables para mantener la tabla manejable (2^n filas).');
    varAssignment = {};
    currentVars.forEach(v => varAssignment[v] = true);

    renderKatexInto($('#katexRender'), toLatex(currentAST));
    $('#eqStatus').textContent = '✓';
    $('#eqStatus').className = 'eq-status ok';
    renderClassBadge();
    renderTruthTable();
    renderVarToggles();
    renderTree();
    renderCircuit();
    $('#stepsContainer').innerHTML = '';
    $('#compareResult').innerHTML = '';
    $('#footEq').textContent = toString(currentAST);
  }catch(e){
    errorBox.textContent = '⚠ ' + e.message;
    $('#eqStatus').textContent = '✕';
    $('#eqStatus').className = 'eq-status err';
    currentAST = null;
  }
}

function renderClassBadge(){
  const tt = truthTable(currentAST);
  const map = {
    tautologia:{label:'Tautología', desc:'La fórmula es verdadera para toda asignación de sus variables.', color:'var(--good)'},
    contradiccion:{label:'Contradicción', desc:'La fórmula es falsa para toda asignación de sus variables.', color:'var(--bad)'},
    contingencia:{label:'Contingencia', desc:'El valor de verdad depende de la asignación elegida.', color:'var(--gold-bright)'}
  };
  const info = map[tt.classification];
  $('#classCard').innerHTML = `<div class="readout-grid">
    <div class="row"><span class="rk">Tipo</span><span class="rv" style="color:${info.color}">${info.label}</span></div>
    <div class="row"><span class="rk">Variables</span><span class="rv">${currentVars.join(', ')}</span></div>
    <div class="row"><span class="rk">Filas</span><span class="rv">${tt.rows.length}</span></div>
  </div><div class="hint-block" style="margin-top:12px">${info.desc}</div>`;
  $('#chipClass').innerHTML = `<span class="dot" style="background:${info.color};box-shadow:0 0 10px ${info.color}"></span> ${info.label}`;
  $('#chipVars').textContent = currentVars.length + (currentVars.length===1 ? ' variable' : ' variables');
}

/* ---------- Tabla de verdad ---------- */
function renderTruthTable(){
  const tt = truthTable(currentAST);
  // columnas: primero variables, luego cada subfórmula compuesta (deduplicada)
  const columns = tt.vars.map(v => ({label: v, node: {type:'var', name:v}}))
    .concat(tt.subforms.map(sf => ({label: toString(sf), node: sf})));
  const indexByLabel = {};
  columns.forEach((c,i) => { if(!(c.label in indexByLabel)) indexByLabel[c.label] = i; });
  columns.forEach(c => {
    const n = c.node;
    if(n.type === 'not') c.children = [indexByLabel[toString(n.a)]];
    else if(n.type === 'and' || n.type === 'or' || n.type === 'imp' || n.type === 'iff') c.children = [indexByLabel[toString(n.l)], indexByLabel[toString(n.r)]];
    else c.children = [];
  });
  const lastIdx = columns.length - 1;

  let html = '<table class="tt"><thead><tr>';
  columns.forEach((c,i) => {
    html += `<th data-col="${i}" data-children="${c.children.join(',')}"${i===lastIdx?' style="color:var(--gold-bright)"':''}>${c.label}</th>`;
  });
  html += '</tr></thead><tbody>';
  tt.rows.forEach((row, ri) => {
    const values = tt.vars.map(v => row.assign[v]).concat(row.subvals);
    html += `<tr class="${row.value ? 'row-true':'row-false'}">`;
    values.forEach((val,i) => {
      html += `<td data-col="${i}" data-row="${ri}" data-children="${columns[i].children.join(',')}" class="${i===lastIdx?'result':''}">${val ? 'V':'F'}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  $('#ttContainer').innerHTML = html;
  wireTruthTableHover();
}

function wireTruthTableHover(){
  const container = $('#ttContainer');
  const allCells = Array.from(container.querySelectorAll('[data-col]'));
  const byCol = {};
  allCells.forEach(el => { (byCol[el.dataset.col] = byCol[el.dataset.col] || []).push(el); });
  function clear(){ allCells.forEach(el => el.classList.remove('tt-hl-self','tt-hl-child')); }

  // Encabezados: resaltan la columna completa (todas las filas) y las columnas hijas completas
  container.querySelectorAll('thead [data-col]').forEach(th => {
    th.addEventListener('mouseenter', () => {
      clear();
      const i = th.dataset.col;
      (byCol[i]||[]).forEach(c => c.classList.add('tt-hl-self'));
      (th.dataset.children||'').split(',').filter(x=>x!=='').forEach(ci => (byCol[ci]||[]).forEach(c => c.classList.add('tt-hl-child')));
    });
    th.addEventListener('mouseleave', clear);
  });

  // Valores: solo resaltan esa celda y las celdas de la MISMA fila en las columnas hijas
  container.querySelectorAll('tbody [data-col]').forEach(td => {
    td.addEventListener('mouseenter', () => {
      clear();
      td.classList.add('tt-hl-self');
      const row = td.dataset.row;
      (td.dataset.children||'').split(',').filter(x=>x!=='').forEach(ci => {
        const match = allCells.find(el => el.dataset.col === ci && el.dataset.row === row);
        if(match) match.classList.add('tt-hl-child');
      });
    });
    td.addEventListener('mouseleave', clear);
  });
}

/* ---------- Toggles de variables (para el árbol) ---------- */
function renderVarToggles(){
  let html = '';
  currentVars.forEach(v => {
    html += `<div class="toggle" data-var="${v}"><span class="tlab">${v}</span><span class="box ${varAssignment[v]?'on':''}">${varAssignment[v]?'V':'F'}</span></div>`;
  });
  $('#varToggles').innerHTML = html;
  $$('#varToggles .toggle').forEach(row => {
    row.addEventListener('click', () => {
      const v = row.dataset.var;
      varAssignment[v] = !varAssignment[v];
      renderVarToggles();
      renderTree();
    });
  });
}

/* ---------- Árbol sintáctico (SVG) ---------- */
function layoutTree(node){
  let leafX = 0;
  const nodes = [];
  function walk(n, depth){
    if(n.type === 'var' || n.type === 'const'){
      const x = leafX++; 
      const obj = {n, x, depth, label: n.type==='var' ? n.name : (n.v?'V':'F')};
      nodes.push(obj);
      return obj;
    }
    if(n.type === 'not'){
      const child = walk(n.a, depth+1);
      const obj = {n, x: child.x, depth, label:'¬', children:[child]};
      nodes.push(obj);
      return obj;
    }
    const l = walk(n.l, depth+1);
    const r = walk(n.r, depth+1);
    const obj = {n, x:(l.x+r.x)/2, depth, label:SYM[n.type], children:[l,r]};
    nodes.push(obj);
    return obj;
  }
  const root = walk(node, 0);
  return {root, nodes, width: leafX};
}
function evalSubtree(n, assign){ return evaluate(n, assign); }

function renderTree(){
  $('#treeInstructions').innerHTML = `Cada nodo es una subfórmula. El color indica su valor con las variables actuales del riel derecho: <span style="color:var(--good)">verde = V</span>, <span style="color:var(--bad)">rojo = F</span>. Las hojas son las variables; subiendo hacia la raíz se van combinando con cada operador hasta llegar al valor final de <b>${toString(currentAST)}</b>. Haz clic en un nodo para ver su subfórmula exacta.`;

  const {root, nodes, width} = layoutTree(currentAST);
  const spacingX = 78, spacingY = 82, marginX = 50, marginY = 30;
  const svgW = Math.max(320, width*spacingX + marginX*2);
  const maxDepth = Math.max(...nodes.map(n=>n.depth));
  const svgH = (maxDepth+1)*spacingY + marginY*2 + 20;

  function px(o){ return marginX + o.x*spacingX; }
  function py(o){ return marginY + o.depth*spacingY; }

  let edges = '';
  let circles = '';
  nodes.forEach(o => {
    if(o.children){
      o.children.forEach(c => {
        edges += `<line x1="${px(o)}" y1="${py(o)}" x2="${px(c)}" y2="${py(c)}" stroke="var(--line)" stroke-width="2"/>`;
      });
    }
    const val = evalSubtree(o.n, varAssignment);
    const fill = val ? 'rgba(79,217,138,0.20)' : 'rgba(255,93,143,0.20)';
    const stroke = val ? 'var(--good)' : 'var(--bad)';
    const isLeaf = o.n.type === 'var' || o.n.type === 'const';
    const sub = toString(o.n);
    const showSub = !isLeaf && sub.length <= 16;
    circles += `<g class="tnode" data-formula="${encodeURIComponent(sub)}" style="cursor:pointer;">
      <circle cx="${px(o)}" cy="${py(o)}" r="${isLeaf?16:18}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
      <text x="${px(o)}" y="${py(o)+5}" text-anchor="middle" font-size="14" fill="${stroke}">${o.label}</text>
      <text x="${px(o)}" y="${py(o)+34}" text-anchor="middle" font-size="10.5" fill="var(--ink-faint)">${val?'V':'F'}${showSub ? '  ·  '+sub : ''}</text>
    </g>`;
  });

  const svg = `<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">${edges}${circles}</svg>`;
  $('#treeContainer').innerHTML = svg;

  $$('.tnode').forEach(g => {
    g.addEventListener('click', () => {
      const formula = decodeURIComponent(g.dataset.formula);
      const container = $('#view-arbol');
      const existing = container.querySelector('.subformula-note');
      if(existing) existing.remove();
      const box = document.createElement('div');
      box.className = 'hint-block subformula-note';
      box.style.marginTop = '12px';
      box.innerHTML = `Subfórmula seleccionada: <b style="color:var(--gold-bright)">${formula}</b> &nbsp;→&nbsp; valor actual: <b>${evaluate(parseFormula(formula), varAssignment) ? 'V' : 'F'}</b>`;
      container.appendChild(box);
    });
  });
}

/* ---------- Equivalencias ---------- */
function renderSteps(){
  if(!currentAST) return;
  const steps = simplifySteps(currentAST);
  let html = '';
  steps.forEach((s, i) => {
    html += `<div class="step"><span class="formula">${s.formula}</span><span class="rule">${i===0 ? 'Fórmula original' : s.rule}</span></div>`;
  });
  if(steps.length === 1) html += `<div class="hint">No se encontraron simplificaciones adicionales con las reglas disponibles (De Morgan, absorción, idempotencia, identidad, dominación, negación, doble negación, eliminación de → / ↔).</div>`;
  $('#stepsContainer').innerHTML = html;
}
function renderCompare(){
  const other = $('#compareInput').value;
  const box = $('#compareResult');
  try{
    const otherAST = parseFormula(other);
    const eq = equivalent(currentAST, otherAST);
    box.innerHTML = eq
      ? `<span class="badge taut">Equivalentes: ambas fórmulas coinciden en todas las filas</span>`
      : `<span class="badge contra">No equivalentes: difieren en al menos una fila</span>`;
  }catch(e){
    box.innerHTML = `<span class="error-box">⚠ ${e.message}</span>`;
  }
}

/* ---------- Circuito lógico (SVG) ---------- */
function eliminateImpIff(n){
  if(n.type==='var'||n.type==='const') return n;
  if(n.type==='not') return {type:'not', a: eliminateImpIff(n.a)};
  if(n.type==='imp') return {type:'or', l:{type:'not', a:eliminateImpIff(n.l)}, r:eliminateImpIff(n.r)};
  if(n.type==='iff'){
    const l = eliminateImpIff(n.l), r = eliminateImpIff(n.r);
    return {type:'and', l:{type:'or', l:{type:'not',a:l}, r:r}, r:{type:'or', l:{type:'not',a:r}, r:l}};
  }
  return {type:n.type, l:eliminateImpIff(n.l), r:eliminateImpIff(n.r)};
}
function circuitLayout(node){
  function depth(n){
    if(n.type==='var'||n.type==='const') return 0;
    if(n.type==='not') return depth(n.a)+1;
    return Math.max(depth(n.l), depth(n.r))+1;
  }
  const maxDepth = depth(node);
  let leafY = 0;
  const positions = [];
  function walk(n, col){
    if(n.type==='var'||n.type==='const'){
      const y = leafY++;
      const obj = {n, x:0, y, label: n.type==='var'?n.name:(n.v?'V':'F'), leaf:true};
      positions.push(obj); return obj;
    }
    if(n.type==='not'){
      const child = walk(n.a, col-1);
      const obj = {n, x:col, y:child.y, gate:'NOT', inputs:[child]};
      positions.push(obj); return obj;
    }
    const l = walk(n.l, col-1), r = walk(n.r, col-1);
    const gate = n.type==='and' ? 'AND' : 'OR';
    const obj = {n, x:col, y:(l.y+r.y)/2, gate, inputs:[l,r]};
    positions.push(obj); return obj;
  }
  const root = walk(node, maxDepth);
  return {root, positions, maxDepth, rows: Math.max(1,leafY)};
}
function gateShape(cx, cy, gate){
  const w=54, h=38;
  if(gate==='NOT'){
    return `<polygon points="${cx-w/2},${cy-h/2} ${cx-w/2},${cy+h/2} ${cx+w/2-8},${cy}" fill="rgba(155,125,255,0.14)" stroke="var(--violet)" stroke-width="1.7"/>
      <circle cx="${cx+w/2}" cy="${cy}" r="7" fill="rgba(155,125,255,0.14)" stroke="var(--violet)" stroke-width="1.7"/>`;
  }
  if(gate==='AND'){
    return `<path d="M ${cx-w/2} ${cy-h/2} L ${cx} ${cy-h/2} A ${h/2} ${h/2} 0 0 1 ${cx} ${cy+h/2} L ${cx-w/2} ${cy+h/2} Z" fill="rgba(242,180,23,0.12)" stroke="var(--gold-bright)" stroke-width="1.7"/>`;
  }
  // OR
  return `<path d="M ${cx-w/2} ${cy-h/2} Q ${cx-w/2+18} ${cy-h/2} ${cx+w/2} ${cy} Q ${cx-w/2+18} ${cy+h/2} ${cx-w/2} ${cy+h/2} Q ${cx-w/2+10} ${cy} ${cx-w/2} ${cy-h/2} Z" fill="rgba(52,214,232,0.12)" stroke="var(--cyan)" stroke-width="1.7"/>`;
}
function renderCircuit(){
  const gateAST = eliminateImpIff(currentAST);
  const {positions, maxDepth, rows} = circuitLayout(gateAST);

  const colSpacing = 110, rowSpacing = 58, marginX = 70, marginY = 30, portOffset = 34;
  const svgW = marginX*2 + (maxDepth+1)*colSpacing + 60;
  const svgH = marginY*2 + rows*rowSpacing;

  const px = o => marginX + o.x*colSpacing;
  const py = o => marginY + o.y*rowSpacing + rowSpacing/2;

  let wires = '', shapes = '';
  positions.forEach(o => {
    if(o.leaf){
      shapes += `<text x="${marginX-18}" y="${py(o)+5}" text-anchor="end" font-size="14" fill="var(--ink)">${o.label}</text>`;
      wires += `<line x1="${marginX-10}" y1="${py(o)}" x2="${px(o)}" y2="${py(o)}" stroke="var(--line)" stroke-width="1.6"/>`;
    } else {
      shapes += gateShape(px(o), py(o), o.gate);
      const gateInX = px(o) - 27;
      o.inputs.forEach(inp => {
        // cable ortogonal: horizontal desde la salida del hijo, luego vertical hasta la altura de la compuerta, luego horizontal hasta el puerto
        const midX = gateInX - portOffset;
        wires += `<polyline points="${px(inp)},${py(inp)} ${midX},${py(inp)} ${midX},${py(o)} ${gateInX},${py(o)}" fill="none" stroke="var(--line)" stroke-width="1.6"/>`;
      });
    }
  });
  const root = positions[positions.length-1];
  wires += `<line x1="${px(root)+27}" y1="${py(root)}" x2="${svgW-marginX}" y2="${py(root)}" stroke="var(--gold)" stroke-width="2.2"/>`;
  shapes += `<text x="${svgW-marginX+8}" y="${py(root)+5}" font-size="13" fill="var(--gold-bright)">salida</text>`;

  $('#circuitContainer').innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">${wires}${shapes}</svg>`;
}

/* =========================================================
   GALERÍA DE FÓRMULAS Y SELECTOR DE VISTAS
   ========================================================= */
const FORMULA_CATEGORIES = [
  {
    title: 'Leyes de inferencia',
    items: [
      {name:'Modus ponens', formula:'(p ∧ (p → q)) → q'},
      {name:'Modus tollens', formula:'((p → q) ∧ ¬q) → ¬p'},
      {name:'Silogismo hipotético', formula:'((p → q) ∧ (q → r)) → (p → r)'},
      {name:'Silogismo disyuntivo', formula:'((p ∨ q) ∧ ¬p) → q'},
      {name:'Dilema constructivo', formula:'(((p → q) ∧ (r → s)) ∧ (p ∨ r)) → (q ∨ s)'},
      {name:'Dilema destructivo', formula:'(((p → q) ∧ (r → s)) ∧ (¬q ∨ ¬s)) → (¬p ∨ ¬r)'},
      {name:'Simplificación', formula:'(p ∧ q) → p'},
      {name:'Adición', formula:'p → (p ∨ q)'},
      {name:'Transitividad (5 letras)', formula:'((p → q) ∧ (q → r) ∧ (r → s) ∧ (s → t)) → (p → t)'},
    ]
  },
  {
    title: 'Leyes de De Morgan',
    items: [
      {name:'De Morgan (∧)', formula:'¬(p ∧ q) ↔ (¬p ∨ ¬q)'},
      {name:'De Morgan (∨)', formula:'¬(p ∨ q) ↔ (¬p ∧ ¬q)'},
      {name:'De Morgan de →', formula:'¬(p → q) ↔ (p ∧ ¬q)'},
      {name:'De Morgan de ↔', formula:'¬(p ↔ q) ↔ (p ↔ ¬q)'},
      {name:'De Morgan generalizada (∧, 3 letras)', formula:'¬(p ∧ q ∧ r) ↔ (¬p ∨ ¬q ∨ ¬r)'},
      {name:'De Morgan generalizada (∨, 3 letras)', formula:'¬(p ∨ q ∨ r) ↔ (¬p ∧ ¬q ∧ ¬r)'},
      {name:'De Morgan anidada (4 letras)', formula:'¬((p ∧ q) ∨ (r ∧ s)) ↔ ((¬p ∨ ¬q) ∧ (¬r ∨ ¬s))'},
    ]
  },
  {
    title: 'Otras equivalencias',
    items: [
      {name:'Contrapositiva', formula:'(p → q) ↔ (¬q → ¬p)'},
      {name:'Exportación', formula:'((p ∧ q) → r) ↔ (p → (q → r))'},
      {name:'Distributividad', formula:'(p ∧ (q ∨ r)) ↔ ((p ∧ q) ∨ (p ∧ r))'},
      {name:'Tautología simple', formula:'p ∨ ¬p'},
      {name:'Contradicción simple', formula:'p ∧ ¬p'},
    ]
  }
];
const VIEW_HINTS = {
  tabla: 'Tabla generada automáticamente a partir de las variables detectadas.',
  arbol: 'Activa/desactiva variables en el riel derecho para ver la propagación del valor de verdad.',
  equiv: 'Aplica el simplificador simbólico paso a paso o compara con otra fórmula por tabla de verdad.',
  circuito: 'Compuertas: dorado = AND, cian = OR, violeta = NOT. → y ↔ se reescriben primero en términos de ¬, ∧, ∨.'
};

function renderPresets(){
  const html = FORMULA_CATEGORIES.map(cat => `
    <div class="section-h" style="margin-top:6px;">${cat.title}</div>
    <div class="presets">
      ${cat.items.map(p => `<div class="preset" data-formula="${encodeURIComponent(p.formula)}">
        <div><div class="pname">${p.name}</div><div class="pmath">${p.formula}</div></div>
      </div>`).join('')}
    </div>
  `).join('');
  $('#presets').innerHTML = html;
  $$('#presets .preset').forEach(el => {
    el.addEventListener('click', () => {
      $('#formulaInput').value = decodeURIComponent(el.dataset.formula);
      parseAndRender();
    });
  });
}

function switchView(view){
  $$('#viewSelector .preset').forEach(p => p.classList.toggle('active', p.dataset.view === view));
  $$('.stage-view').forEach(v => v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $('#stageHint').textContent = VIEW_HINTS[view];
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
  $$('#viewSelector .preset').forEach(p => {
    p.addEventListener('click', () => switchView(p.dataset.view));
  });
  $('#btnSimplify').addEventListener('click', renderSteps);
  $('#btnCompare').addEventListener('click', renderCompare);

  renderPresets();
  parseAndRender();
});
