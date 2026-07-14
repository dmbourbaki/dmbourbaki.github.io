/* =========================================================
   OMAI — Teoría de Grafos
   Autor: Daniel Steven Moran Pizarro
   ========================================================= */

/* ---------- 1. MOTOR DE GRAFOS (probado con Node contra K4, C5, C6, K3,3, Petersen) ---------- */
function hasEdge(g, i, j){
  if(i===j) return false;
  const a = Math.min(i,j), b = Math.max(i,j);
  return g.edges.has(a+'-'+b);
}
function edgeListOf(g){ return Array.from(g.edges).map(s => s.split('-').map(Number)); }
function degree(g, v){ let d=0; for(let u=0;u<g.n;u++) if(hasEdge(g,v,u)) d++; return d; }
function neighbors(g, v){ const out=[]; for(let u=0;u<g.n;u++) if(hasEdge(g,v,u)) out.push(u); return out; }

function adjacencyMatrix(g){
  const M = Array.from({length:g.n}, () => Array(g.n).fill(0));
  for(let i=0;i<g.n;i++) for(let j=0;j<g.n;j++) if(hasEdge(g,i,j)) M[i][j]=1;
  return M;
}
function degreeMatrix(g){
  const M = Array.from({length:g.n}, () => Array(g.n).fill(0));
  for(let i=0;i<g.n;i++) M[i][i] = degree(g,i);
  return M;
}
function laplacianMatrix(g){
  const A = adjacencyMatrix(g), D = degreeMatrix(g);
  return D.map((row,i) => row.map((d,j) => d - A[i][j]));
}
function incidenceMatrix(g){
  const edges = edgeListOf(g);
  const M = Array.from({length:g.n}, () => Array(edges.length).fill(0));
  edges.forEach(([a,b], k) => { M[a][k]=1; M[b][k]=1; });
  return {matrix:M, edges};
}

function cliqueNumber(g){
  let best=0, bestSet=[];
  const adj = Array.from({length:g.n}, (_,v) => new Set(neighbors(g,v)));
  function bronKerbosch(R,P,X){
    if(P.size===0 && X.size===0){ if(R.length>best){best=R.length; bestSet=R.slice();} return; }
    if(R.length + P.size <= best) return;
    const PX = new Set([...P, ...X]);
    let pivot=-1, pivotDeg=-1;
    for(const u of PX){ let d=0; for(const w of P) if(adj[u].has(w)) d++; if(d>pivotDeg){pivotDeg=d; pivot=u;} }
    const candidates = [...P].filter(v => !adj[pivot] || !adj[pivot].has(v));
    for(const v of candidates){
      const Pv = new Set([...P].filter(u => adj[v].has(u)));
      const Xv = new Set([...X].filter(u => adj[v].has(u)));
      bronKerbosch([...R,v], Pv, Xv);
      P.delete(v); X.add(v);
    }
  }
  bronKerbosch([], new Set(Array.from({length:g.n},(_,i)=>i)), new Set());
  return {number:best, set:bestSet};
}
function greedyColoring(g, order){
  const color = Array(g.n).fill(-1);
  let maxColor = 0;
  order.forEach(v => {
    const used = new Set(neighbors(g,v).map(u=>color[u]).filter(c=>c>=0));
    let c=0; while(used.has(c)) c++;
    color[v]=c; maxColor=Math.max(maxColor,c+1);
  });
  return {color, k:maxColor};
}
function chromaticNumber(g){
  if(g.n===0) return {number:0, coloring:[]};
  const cliq = cliqueNumber(g).number;
  const order = Array.from({length:g.n},(_,i)=>i).sort((a,b)=>degree(g,b)-degree(g,a));
  const greedy = greedyColoring(g, order);
  let lower = Math.max(1,cliq), upper = greedy.k;
  if(lower===upper) return {number:lower, coloring:greedy.color};
  const adj = Array.from({length:g.n}, (_,v) => neighbors(g,v));
  for(let k=lower;k<=upper;k++){
    const color = Array(g.n).fill(-1);
    function tryColor(idx,k){
      if(idx===order.length) return true;
      const v = order[idx];
      const forbidden = new Set(adj[v].map(u=>color[u]).filter(c=>c>=0));
      for(let c=0;c<k;c++){
        if(forbidden.has(c)) continue;
        color[v]=c;
        if(tryColor(idx+1,k)) return true;
        color[v]=-1;
      }
      return false;
    }
    if(tryColor(0,k)) return {number:k, coloring:color};
  }
  return {number:upper, coloring:greedy.color};
}
function isConnected(g){
  if(g.n===0) return true;
  const seen=new Set([0]), stack=[0];
  while(stack.length){ const v=stack.pop(); neighbors(g,v).forEach(u=>{if(!seen.has(u)){seen.add(u);stack.push(u);}}); }
  return seen.size===g.n;
}
function connectedComponents(g){
  const seen=new Array(g.n).fill(false); let count=0;
  for(let s=0;s<g.n;s++){
    if(seen[s]) continue;
    count++;
    const stack=[s]; seen[s]=true;
    while(stack.length){ const v=stack.pop(); neighbors(g,v).forEach(u=>{if(!seen[u]){seen[u]=true;stack.push(u);}}); }
  }
  return count;
}
function isBipartite(g){
  if(g.n===0) return true;
  const color=new Array(g.n).fill(-1);
  for(let s=0;s<g.n;s++){
    if(color[s]!==-1) continue;
    color[s]=0; const queue=[s];
    while(queue.length){
      const v=queue.shift();
      for(const u of neighbors(g,v)){
        if(color[u]===-1){ color[u]=1-color[v]; queue.push(u); }
        else if(color[u]===color[v]) return false;
      }
    }
  }
  return true;
}

/* ---------- Planaridad: componentes biconexas + algoritmo DMP ----------
   Probado contra K4, C6, árboles, ruedas, K2,n, cubo Q3, octaedro (planares)
   y K5, K6, K3,3, K3,4, y el grafo de Petersen (no planares) — Petersen es el
   caso difícil: no contiene K5 ni K3,3 como subgrafo literal, solo como minor,
   así que pasar esa prueba confirma razonamiento topológico real. */
function makeAdjSets(n, edges){
  const adj = Array.from({length:n}, () => new Set());
  edges.forEach(([a,b]) => { adj[a].add(b); adj[b].add(a); });
  return adj;
}
function biconnectedComponents(n, edges){
  const adj = makeAdjSets(n, edges);
  const disc = Array(n).fill(-1), low = Array(n).fill(-1);
  const parent = Array(n).fill(-1);
  let timer = 0;
  const stack = [];
  const components = [];
  function dfs(u){
    disc[u] = low[u] = timer++;
    let children = 0;
    for(const v of adj[u]){
      if(v === parent[u]) continue;
      if(disc[v] === -1){
        stack.push([u,v]); parent[v] = u; children++;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
        if((parent[u] === -1 && children > 1) || (parent[u] !== -1 && low[v] >= disc[u])){
          const comp = [];
          while(stack.length){ const e = stack.pop(); comp.push(e); if(e[0]===u && e[1]===v) break; }
          components.push(comp);
        }
      } else if(disc[v] < disc[u]){
        stack.push([u,v]); low[u] = Math.min(low[u], disc[v]);
      }
    }
  }
  for(let i=0;i<n;i++){
    if(disc[i] === -1){ dfs(i); if(stack.length){ components.push(stack.slice()); stack.length=0; } }
  }
  return components.map(comp => {
    const vs = new Set(); comp.forEach(([a,b]) => { vs.add(a); vs.add(b); });
    return { vertices: vs, edges: comp };
  });
}
function findInitialCycle(vertsArr, edges){
  const adj = new Map(); vertsArr.forEach(v=>adj.set(v, []));
  edges.forEach(([a,b]) => { adj.get(a).push(b); adj.get(b).push(a); });
  const visited = new Set(); const parent = new Map();
  let cycle = null;
  function dfs(u, par){
    visited.add(u); parent.set(u, par);
    for(const v of adj.get(u)){
      if(cycle) return;
      if(v === par) continue;
      if(!visited.has(v)){ dfs(v,u); if(cycle) return; }
      else {
        const path=[u]; let cur=u;
        while(cur!==v && parent.get(cur)!==undefined){ cur=parent.get(cur); path.push(cur); if(cur===undefined) break; }
        if(cur===v) cycle = path;
      }
    }
  }
  dfs(vertsArr[0], null);
  return cycle;
}
function planarityTestBiconnected(vertsSet, edgeList){
  const vertsArr = Array.from(vertsSet);
  const cycle = findInitialCycle(vertsArr, edgeList);
  if(!cycle) return {planar:true, faces:[vertsArr]};
  let H = new Set(cycle);
  const HEdges = new Set();
  for(let i=0;i<cycle.length;i++){ const a=cycle[i], b=cycle[(i+1)%cycle.length]; HEdges.add(Math.min(a,b)+'-'+Math.max(a,b)); }
  let faces = [cycle.slice(), cycle.slice().reverse()];
  const remaining = edgeList.filter(([a,b]) => !HEdges.has(Math.min(a,b)+'-'+Math.max(a,b)));
  function faceContainsAll(face, verts){ const set=new Set(face); return verts.every(v=>set.has(v)); }
  let guard = 0;
  while(true){
    guard++; if(guard>500) break;
    const stillRemaining = remaining.filter(([a,b]) => !HEdges.has(Math.min(a,b)+'-'+Math.max(a,b)));
    if(stillRemaining.length === 0) return {planar:true, faces};
    const nonH = vertsArr.filter(v => !H.has(v));
    const nonHAdj = new Map(); nonH.forEach(v=>nonHAdj.set(v,[]));
    const nonHSet = new Set(nonH);
    stillRemaining.forEach(([a,b]) => { if(nonHSet.has(a) && nonHSet.has(b)){ nonHAdj.get(a).push(b); nonHAdj.get(b).push(a); } });
    const visited = new Set(); const comps = [];
    nonH.forEach(v => {
      if(visited.has(v)) return;
      const comp=[]; const stack=[v]; visited.add(v);
      while(stack.length){ const u=stack.pop(); comp.push(u); nonHAdj.get(u).forEach(w=>{ if(!visited.has(w)){visited.add(w); stack.push(w);} }); }
      comps.push(comp);
    });
    const bridgesFromComps = comps.map(comp => {
      const compSet = new Set(comp); const attach=new Set(); const bridgeEdges=[];
      stillRemaining.forEach(([a,b]) => {
        const aIn=compSet.has(a), bIn=compSet.has(b);
        if(aIn&&bIn) bridgeEdges.push([a,b]);
        else if(aIn && H.has(b)){ attach.add(b); bridgeEdges.push([a,b]); }
        else if(bIn && H.has(a)){ attach.add(a); bridgeEdges.push([a,b]); }
      });
      return { type:'comp', vertices:comp, edges:bridgeEdges, attach:Array.from(attach) };
    });
    const chordBridges = stillRemaining.filter(([a,b]) => H.has(a) && H.has(b)).map(([a,b]) => ({type:'chord', vertices:[a,b], edges:[[a,b]], attach:[a,b]}));
    const bridges = [...bridgesFromComps.filter(b=>b.attach.length>0), ...chordBridges];
    if(bridges.length === 0) return {planar: stillRemaining.length === 0, faces};
    let chosen=null, chosenFaces=null;
    for(const br of bridges){
      const admissible = faces.filter(f => faceContainsAll(f, br.attach));
      if(admissible.length === 0) return {planar:false, faces:null};
      if(!chosen || admissible.length < chosenFaces.length){ chosen=br; chosenFaces=admissible; }
    }
    const br = chosen;
    const a1 = br.attach[0];
    let a2, pathInterior;
    if(br.type === 'chord'){ a2 = br.attach[1]; pathInterior = []; }
    else {
      const localAdj = new Map();
      const allowed = new Set([...br.vertices, ...br.attach]);
      allowed.forEach(v => localAdj.set(v, []));
      br.edges.forEach(([a,b]) => { if(localAdj.has(a) && localAdj.has(b)){ localAdj.get(a).push(b); localAdj.get(b).push(a); } });
      const target = new Set(br.attach.filter(v => v !== a1));
      const prev = new Map(); const seen = new Set([a1]); const queue=[a1];
      let reached = null;
      while(queue.length){
        const u = queue.shift();
        if(target.has(u) && u !== a1){ reached = u; break; }
        for(const w of localAdj.get(u)) if(!seen.has(w)){ seen.add(w); prev.set(w,u); queue.push(w); }
      }
      if(reached === null) return {planar:false, faces:null};
      a2 = reached;
      const path=[a2]; let cur=a2;
      while(cur!==a1){ cur=prev.get(cur); path.push(cur); }
      path.reverse();
      pathInterior = path.slice(1,-1);
    }
    const face = chosenFaces[0];
    const i1 = face.indexOf(a1), i2 = face.indexOf(a2);
    let sideA, sideB;
    if(i1 < i2){ sideA = face.slice(i1,i2+1); sideB = face.slice(i2).concat(face.slice(0,i1+1)); }
    else { sideB = face.slice(i2,i1+1); sideA = face.slice(i1).concat(face.slice(0,i2+1)); }
    const faceIdx = faces.indexOf(face);
    const newFace1 = sideA.concat(pathInterior.slice().reverse());
    const newFace2 = sideB.concat(pathInterior);
    faces.splice(faceIdx, 1, newFace1, newFace2);
    H.add(a1); H.add(a2); pathInterior.forEach(v => H.add(v));
    let prevV = a1; const chain=[...pathInterior, a2];
    chain.forEach(v => { HEdges.add(Math.min(prevV,v)+'-'+Math.max(prevV,v)); prevV=v; });
  }
  return {planar:false, faces:null};
}
function isPlanar(n, edgeList){
  if(n <= 4) return true;
  const comps = biconnectedComponents(n, edgeList);
  for(const comp of comps){
    if(comp.vertices.size <= 4) continue;
    if(!planarityTestBiconnected(comp.vertices, comp.edges).planar) return false;
  }
  return true;
}

/* ---------- Subgrafo K5 / K3,3 literal (probado: Petersen no tiene ninguno como subgrafo) ---------- */
function combosOf(arr, k){
  const res = [];
  function rec(start, chosen){
    if(chosen.length === k){ res.push(chosen.slice()); return; }
    for(let i=start;i<arr.length;i++){ chosen.push(arr[i]); rec(i+1, chosen); chosen.pop(); }
  }
  rec(0, []);
  return res;
}
function findK5Subgraph(n, adjMatrix){
  if(n < 5 || n > 20) return null; // límite de tiempo razonable
  const verts = Array.from({length:n}, (_,i)=>i);
  for(const combo of combosOf(verts, 5)){
    let ok = true;
    for(let i=0;i<5 && ok;i++) for(let j=i+1;j<5 && ok;j++) if(!adjMatrix[combo[i]][combo[j]]) ok=false;
    if(ok) return combo;
  }
  return null;
}
function findK33Subgraph(n, adjMatrix){
  if(n < 6 || n > 20) return null;
  const verts = Array.from({length:n}, (_,i)=>i);
  for(const six of combosOf(verts, 6)){
    const idx=[0,1,2,3,4,5];
    for(const s of combosOf(idx, 3)){
      if(!s.includes(0)) continue; // cada partición se cuenta una sola vez
      const groupA = s.map(i=>six[i]);
      const groupB = idx.filter(i=>!s.includes(i)).map(i=>six[i]);
      let ok = true;
      for(const a of groupA) for(const b of groupB) if(!adjMatrix[a][b]) ok=false;
      if(ok) return {groupA, groupB};
    }
  }
  return null;
}

/* ---------- Cordalidad: Maximum Cardinality Search + verificación de PEO ---------- */
function mcsOrder(n, adj){
  const weight = Array(n).fill(0), visited = Array(n).fill(false), order = [];
  for(let k=0;k<n;k++){
    let best=-1, bestW=-1;
    for(let v=0;v<n;v++) if(!visited[v] && weight[v]>bestW){ bestW=weight[v]; best=v; }
    visited[best]=true; order.push(best);
    for(const u of adj[best]) if(!visited[u]) weight[u]++;
  }
  return order.reverse();
}
function findHole(adj, v, u, w){
  const forbidden = new Set(adj[v]); forbidden.add(v); forbidden.delete(u); forbidden.delete(w);
  const prev = new Map(); const seen = new Set([u]); const queue=[u];
  let reached = false;
  while(queue.length){
    const x = queue.shift();
    if(x===w){ reached=true; break; }
    for(const y of adj[x]){ if(forbidden.has(y)) continue; if(!seen.has(y)){ seen.add(y); prev.set(y,x); queue.push(y); } }
  }
  if(!reached) return null;
  const path=[w]; let cur=w;
  while(cur!==u){ cur=prev.get(cur); path.push(cur); }
  path.reverse();
  return [v, ...path];
}
function checkChordal(n, edgeList){
  if(n === 0) return {chordal:true, order:[]};
  const adj = makeAdjSets(n, edgeList);
  const order = mcsOrder(n, adj);
  const pos = Array(n).fill(0);
  order.forEach((v,i)=>pos[v]=i);
  for(let i=0;i<order.length;i++){
    const v = order[i];
    const later = [...adj[v]].filter(u => pos[u] > i);
    for(let a=0;a<later.length;a++){
      for(let b=a+1;b<later.length;b++){
        if(!adj[later[a]].has(later[b])){
          const hole = findHole(adj, v, later[a], later[b]);
          return { chordal:false, order, hole };
        }
      }
    }
  }
  return { chordal:true, order };
}

/* ---------- Embebido de Tutte (probado: 0 cruces en K4, cubo, rueda, octaedro) ---------- */
function planarLayoutFaces(vertsSet, edgeList){
  return planarityTestBiconnected(vertsSet, edgeList);
}
function tutteEmbedding(n, edgeList){
  if(n === 0) return null;
  const comps = biconnectedComponents(n, edgeList);
  let mainComp = comps.reduce((best,c)=> c.vertices.size>best.vertices.size?c:best, {vertices:new Set(),edges:[]});
  if(mainComp.vertices.size < 3) return null;
  const {planar, faces} = planarLayoutFaces(mainComp.vertices, mainComp.edges);
  if(!planar) return null;
  const outer = faces.reduce((best,f)=> f.length>best.length?f:best, faces[0]);
  const pos = {};
  const R = 220, cx = 380, cy = 270;
  outer.forEach((v,i) => { const ang = -Math.PI/2 + i*2*Math.PI/outer.length; pos[v] = { x: cx+R*Math.cos(ang), y: cy+R*Math.sin(ang) }; });
  const adj = makeAdjSets(n, edgeList);
  const outerSet = new Set(outer);
  const interior = Array.from(mainComp.vertices).filter(v => !outerSet.has(v));
  interior.forEach(v => pos[v] = {x:cx, y:cy});
  for(let iter=0; iter<600; iter++){
    interior.forEach(v => {
      let sx=0, sy=0, cnt=0;
      adj[v].forEach(u => { if(pos[u]){ sx+=pos[u].x; sy+=pos[u].y; cnt++; } });
      if(cnt>0) pos[v] = { x: sx/cnt, y: sy/cnt };
    });
  }
  // vértices fuera del componente biconexo principal (otros bloques/aislados): colocarlos
  // cerca de algún vecino ya posicionado, o en un anillo exterior si no tienen vecinos posicionados
  const remaining = Array.from({length:n}, (_,i)=>i).filter(v => !pos[v]);
  let ring = 0;
  remaining.forEach(v => {
    const posNeighbor = [...adj[v]].find(u => pos[u]);
    if(posNeighbor){ pos[v] = { x: pos[posNeighbor].x + 60, y: pos[posNeighbor].y + 60 }; }
    else { pos[v] = { x: 80 + (ring%6)*90, y: 60 + Math.floor(ring/6)*80 }; ring++; }
  });
  return pos;
}
function forceDirectedLayout(n, edgeList, W=760, H=540, iterations=400){
  const pos = {};
  for(let i=0;i<n;i++){
    const ang = 2*Math.PI*i/Math.max(n,1);
    pos[i] = { x: W/2 + (W*0.35)*Math.cos(ang), y: H/2 + (H*0.35)*Math.sin(ang) };
  }
  const k = Math.sqrt((W*H)/Math.max(n,1));
  let temp = W/10;
  for(let iter=0; iter<iterations; iter++){
    const disp = {}; for(let i=0;i<n;i++) disp[i]={x:0,y:0};
    for(let i=0;i<n;i++) for(let j=0;j<n;j++){
      if(i===j) continue;
      const dx=pos[i].x-pos[j].x, dy=pos[i].y-pos[j].y;
      const dist=Math.sqrt(dx*dx+dy*dy)||0.01;
      const force = k*k/dist;
      disp[i].x += (dx/dist)*force; disp[i].y += (dy/dist)*force;
    }
    edgeList.forEach(([a,b]) => {
      const dx=pos[a].x-pos[b].x, dy=pos[a].y-pos[b].y;
      const dist=Math.sqrt(dx*dx+dy*dy)||0.01;
      const force = dist*dist/k;
      disp[a].x -= (dx/dist)*force; disp[a].y -= (dy/dist)*force;
      disp[b].x += (dx/dist)*force; disp[b].y += (dy/dist)*force;
    });
    for(let i=0;i<n;i++){
      const dlen = Math.sqrt(disp[i].x**2+disp[i].y**2)||0.01;
      pos[i].x += (disp[i].x/dlen)*Math.min(dlen,temp);
      pos[i].y += (disp[i].y/dlen)*Math.min(dlen,temp);
      pos[i].x = Math.min(W-30, Math.max(30, pos[i].x));
      pos[i].y = Math.min(H-30, Math.max(30, pos[i].y));
    }
    temp *= 0.99;
  }
  return pos;
}
function segmentsIntersect(p1,p2,p3,p4){
  function cross(o,a,b){ return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x); }
  const d1=cross(p3,p4,p1), d2=cross(p3,p4,p2), d3=cross(p1,p2,p3), d4=cross(p1,p2,p4);
  return ((d1>0&&d2<0)||(d1<0&&d2>0)) && ((d3>0&&d4<0)||(d3<0&&d4>0));
}
function countCrossings(pos, edgeList){
  let count=0;
  for(let i=0;i<edgeList.length;i++){
    for(let j=i+1;j<edgeList.length;j++){
      const [a,b]=edgeList[i], [c,d]=edgeList[j];
      if(a===c||a===d||b===c||b===d) continue;
      if(segmentsIntersect(pos[a],pos[b],pos[c],pos[d])) count++;
    }
  }
  return count;
}

/* ---------- Álgebra espectral: eigenvalores del laplaciano (método de Jacobi) ---------- */
function jacobiEigenvalues(M, maxIter=100){
  const n = M.length;
  if(n === 0) return [];
  let A = M.map(row => row.slice());
  let V = Array.from({length:n}, (_,i) => Array.from({length:n}, (_,j) => i===j?1:0));
  function offDiagNorm(A){ let s=0; for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(i!==j) s+=A[i][j]*A[i][j]; return Math.sqrt(s); }
  for(let iter=0; iter<maxIter; iter++){
    if(offDiagNorm(A) < 1e-10) break;
    let p=0,q=1,max=0;
    for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){ if(Math.abs(A[i][j])>max){max=Math.abs(A[i][j]); p=i; q=j;} }
    if(max < 1e-12) break;
    const app=A[p][p], aqq=A[q][q], apq=A[p][q];
    const phi = 0.5*Math.atan2(2*apq, aqq-app);
    const c=Math.cos(phi), s=Math.sin(phi);
    for(let k=0;k<n;k++){ const akp=A[k][p], akq=A[k][q]; A[k][p]=c*akp-s*akq; A[k][q]=s*akp+c*akq; }
    for(let k=0;k<n;k++){ const apk=A[p][k], aqk=A[q][k]; A[p][k]=c*apk-s*aqk; A[q][k]=s*apk+c*aqk; }
    for(let k=0;k<n;k++){ const vkp=V[k][p], vkq=V[k][q]; V[k][p]=c*vkp-s*vkq; V[k][q]=s*vkp+c*vkq; }
  }
  const eigenvalues = A.map((row,i)=>row[i]);
  const pairs = eigenvalues.map((val,i) => ({val, vec: V.map(row=>row[i])}));
  pairs.sort((a,b)=>a.val-b.val);
  return pairs;
}
function spanningTreeCount(n, edgeList){
  if(n === 0) return 0;
  if(n === 1) return 1;
  const A = Array.from({length:n},()=>Array(n).fill(0));
  const deg = Array(n).fill(0);
  edgeList.forEach(([a,b])=>{ A[a][b]=1; A[b][a]=1; deg[a]++; deg[b]++; });
  const L = A.map((row,i)=>row.map((v,j)=> i===j?deg[i]:-v));
  const M = L.slice(1).map(row=>row.slice(1));
  const k = M.length;
  let det = 1;
  for(let i=0;i<k;i++){
    let piv=i;
    for(let r=i;r<k;r++) if(Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv=r;
    if(Math.abs(M[piv][i]) < 1e-9) return 0;
    if(piv!==i){ [M[i],M[piv]]=[M[piv],M[i]]; det*=-1; }
    det *= M[i][i];
    for(let r=i+1;r<k;r++){ const factor=M[r][i]/M[i][i]; for(let c=i;c<k;c++) M[r][c] -= factor*M[i][c]; }
  }
  return Math.round(det);
}

/* =========================================================
   2. ESTADO DEL GRAFO (editor interactivo)
   ========================================================= */
let vertices = []; // {id, label, x, y}
let edgeSet = new Set(); // "i-j" con i<j, usando índices de `vertices`
let nextVertexId = 0;
let mode = 'vertex';
let selectedForEdge = null;
let showColoring = false;
let showK5K33 = false;
let showChordalHighlight = false;
let draggingVertex = null;
let dragOffset = {x:0,y:0};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const SVG_NS = 'http://www.w3.org/2000/svg';

const COLOR_PALETTE = ['#f2b417','#34d6e8','#ff5d8f','#4fd98a','#9b7dff','#ff9a3c','#63e6be','#f783ac','#74c0fc','#e599f7','#ffd43b','#69db7c'];

function nextLabel(){
  const n = vertices.length;
  const letter = String.fromCharCode(65 + (n % 26));
  const suffix = Math.floor(n/26);
  return suffix === 0 ? letter : letter + suffix;
}
function currentGraph(){
  const n = vertices.length;
  const edges = Array.from(edgeSet).map(s => s.split('-').map(Number));
  return { n, labels: vertices.map(v=>v.label), edges: new Set(edgeSet) };
}
function edgeKey(i,j){ return Math.min(i,j)+'-'+Math.max(i,j); }

/* ---------- Construcción de grafos de ejemplo ---------- */
function loadGraph(n, edgeList, layoutFn){
  vertices = [];
  edgeSet = new Set();
  const W = 760, H = 540, cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 60;
  for(let i=0;i<n;i++){
    let x,y;
    if(layoutFn){ [x,y] = layoutFn(i,n,cx,cy,R); }
    else { const ang = -Math.PI/2 + i*2*Math.PI/n; x = cx + R*Math.cos(ang); y = cy + R*Math.sin(ang); }
    vertices.push({id:i, label: String.fromCharCode(65+(i%26)) + (i>=26?Math.floor(i/26):''), x, y});
  }
  edgeList.forEach(([a,b]) => edgeSet.add(edgeKey(a,b)));
  viewBox = {...VIEW_DEFAULT};
  render();
}
const GRAPH_PRESETS = {
  'K4': () => loadGraph(4, [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]),
  'K5': () => loadGraph(5, [[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]),
  'C5': () => loadGraph(5, [[0,1],[1,2],[2,3],[3,4],[4,0]]),
  'C6': () => loadGraph(6, [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]),
  'K33': () => {
    const edges=[]; for(let i=0;i<3;i++) for(let j=3;j<6;j++) edges.push([i,j]);
    loadGraph(6, edges, (i,n,cx,cy,R) => i<3 ? [cx-160, cy-140+i*140] : [cx+160, cy-140+(i-3)*140]);
  },
  'Petersen': () => {
    const edges=[];
    for(let i=0;i<5;i++) edges.push([i,(i+1)%5]);
    for(let i=0;i<5;i++) edges.push([5+i,5+((i+2)%5)]);
    for(let i=0;i<5;i++) edges.push([i,5+i]);
    loadGraph(10, edges, (i,n,cx,cy,R) => {
      if(i<5){ const ang=-Math.PI/2 + i*2*Math.PI/5; return [cx+R*Math.cos(ang), cy+R*Math.sin(ang)]; }
      const ang=-Math.PI/2 + (i-5)*2*Math.PI/5; return [cx+(R*0.5)*Math.cos(ang), cy+(R*0.5)*Math.sin(ang)];
    });
  },
  'Arbol': () => loadGraph(7, [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]], (i,n,cx,cy,R) => {
    const levels = [[0],[1,2],[3,4,5,6]];
    for(const lvl of levels){ const idx = lvl.indexOf(i); if(idx>=0){ const li = levels.indexOf(lvl); const y = 90 + li*170; const x = cx + (idx - (lvl.length-1)/2) * 170; return [x,y]; } }
    return [cx,cy];
  }),
  'Rueda': () => {
    const edges=[]; for(let i=1;i<=5;i++){ edges.push([0,i]); edges.push([i, i===5?1:i+1]); }
    loadGraph(6, edges, (i,n,cx,cy,R) => i===0 ? [cx,cy] : (()=>{ const ang=-Math.PI/2+(i-1)*2*Math.PI/5; return [cx+R*Math.cos(ang), cy+R*Math.sin(ang)]; })());
  }
};

/* ---------- Generador paramétrico de familias de grafos ---------- */
const GENERATOR_LIMITS = {
  Kn: {n:[1,12]}, Cn: {n:[3,30]}, Pn: {n:[2,30]},
  Kmn: {m:[1,10], n:[1,10]}, Wn: {n:[3,20]}, Sn: {n:[1,25]}, Nn: {n:[1,30]}
};
function generateGraph(family, n, m){
  if(family === 'Kn'){
    const edges=[]; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) edges.push([i,j]);
    loadGraph(n, edges); // layout circular por defecto
  }
  else if(family === 'Cn'){
    const edges=[]; for(let i=0;i<n;i++) edges.push([i,(i+1)%n]);
    loadGraph(n, edges);
  }
  else if(family === 'Pn'){
    const edges=[]; for(let i=0;i<n-1;i++) edges.push([i,i+1]);
    const margin=90;
    loadGraph(n, edges, (i,nn,cx,cy,R) => {
      const usable = 760 - 2*margin;
      const x = n===1 ? cx : margin + (usable * i/(n-1));
      return [x, cy];
    });
  }
  else if(family === 'Kmn'){
    const total = m+n;
    const edges=[]; for(let i=0;i<m;i++) for(let j=m;j<total;j++) edges.push([i,j]);
    loadGraph(total, edges, (i,nn,cx,cy,R) => {
      if(i<m){ const step = 460/Math.max(m,1); return [cx-190, cy - (m-1)*step/2 + i*step]; }
      const k=i-m; const step = 460/Math.max(n,1); return [cx+190, cy - (n-1)*step/2 + k*step];
    });
  }
  else if(family === 'Wn'){
    const total = n+1;
    const edges=[]; for(let i=1;i<=n;i++){ edges.push([0,i]); edges.push([i, i===n?1:i+1]); }
    loadGraph(total, edges, (i,nn,cx,cy,R) => i===0 ? [cx,cy] : (()=>{ const ang=-Math.PI/2+(i-1)*2*Math.PI/n; return [cx+R*Math.cos(ang), cy+R*Math.sin(ang)]; })());
  }
  else if(family === 'Sn'){
    const total = n+1;
    const edges=[]; for(let i=1;i<=n;i++) edges.push([0,i]);
    loadGraph(total, edges, (i,nn,cx,cy,R) => i===0 ? [cx,cy] : (()=>{ const ang=-Math.PI/2+(i-1)*2*Math.PI/n; return [cx+R*Math.cos(ang), cy+R*Math.sin(ang)]; })());
  }
  else if(family === 'Nn'){
    loadGraph(n, []);
  }
}
function runGenerator(){
  const family = $('#genFamily').value;
  const errorBox = $('#genError');
  errorBox.textContent = '';
  const limits = GENERATOR_LIMITS[family];
  const n = parseInt($('#genN').value, 10);
  const m = parseInt($('#genM').value, 10);
  try{
    if(!Number.isInteger(n) || n < limits.n[0] || n > limits.n[1]){
      throw new Error(`n debe ser un entero entre ${limits.n[0]} y ${limits.n[1]} para esta familia.`);
    }
    if(family === 'Kmn'){
      if(!Number.isInteger(m) || m < limits.m[0] || m > limits.m[1]){
        throw new Error(`m debe ser un entero entre ${limits.m[0]} y ${limits.m[1]}.`);
      }
    }
    generateGraph(family, n, m);
  }catch(e){
    errorBox.textContent = '⚠ ' + e.message;
  }
}

/* =========================================================
   3. RENDERIZADO SVG DEL GRAFO
   ========================================================= */
function render(){
  renderGraphSVG();
  renderInvariants();
  renderMatrices();
}

let viewBox = {x:0, y:0, w:760, h:540};
const VIEW_DEFAULT = {x:0, y:0, w:760, h:540};
let vertexRadius = 22;
let panState = null;

function applyViewBox(){
  const svg = $('#graphCanvas');
  svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}

function renderGraphSVG(){
  const svg = $('#graphCanvas');
  svg.innerHTML = '';
  applyViewBox();

  let coloring = null;
  if(showColoring && vertices.length>0){
    coloring = chromaticNumber(currentGraph()).coloring;
  }

  // Resaltado de subgrafo K5 / K3,3 (literal, no minor)
  let k5k33 = null;
  if(showK5K33 && vertices.length>=5){
    const n = vertices.length;
    const adjM = Array.from({length:n},()=>Array(n).fill(false));
    edgeSet.forEach(key => { const [a,b]=key.split('-').map(Number); adjM[a][b]=true; adjM[b][a]=true; });
    const k5 = findK5Subgraph(n, adjM);
    if(k5) k5k33 = { type:'K5', verts: new Set(k5) };
    else {
      const k33 = findK33Subgraph(n, adjM);
      if(k33) k5k33 = { type:'K33', groupA: new Set(k33.groupA), groupB: new Set(k33.groupB) };
    }
  }
  function isHighlightEdge(i,j){
    if(!k5k33) return false;
    if(k5k33.type === 'K5') return k5k33.verts.has(i) && k5k33.verts.has(j);
    return (k5k33.groupA.has(i) && k5k33.groupB.has(j)) || (k5k33.groupA.has(j) && k5k33.groupB.has(i));
  }
  function isHighlightVertex(idx){
    if(!k5k33) return false;
    if(k5k33.type === 'K5') return k5k33.verts.has(idx);
    return k5k33.groupA.has(idx) || k5k33.groupB.has(idx);
  }

  // Resaltado de cordalidad: si es cordal, orden de eliminación perfecta; si no, el hoyo (ciclo sin cuerdas)
  let chordalInfo = null;
  if(showChordalHighlight && vertices.length>0){
    const n = vertices.length;
    chordalInfo = checkChordal(n, edgeListOf(currentGraph()));
  }
  function isHoleEdge(i,j){
    if(!chordalInfo || chordalInfo.chordal || !chordalInfo.hole) return false;
    const h = chordalInfo.hole;
    for(let k=0;k<h.length;k++){
      const a=h[k], b=h[(k+1)%h.length];
      if((a===i&&b===j)||(a===j&&b===i)) return true;
    }
    return false;
  }
  function isHoleVertex(idx){ return chordalInfo && !chordalInfo.chordal && chordalInfo.hole && chordalInfo.hole.includes(idx); }

  // aristas primero (para que queden debajo de los vértices)
  Array.from(edgeSet).forEach(key => {
    const [i,j] = key.split('-').map(Number);
    if(!vertices[i] || !vertices[j]) return;
    const line = document.createElementNS(SVG_NS,'line');
    line.setAttribute('x1', vertices[i].x); line.setAttribute('y1', vertices[i].y);
    line.setAttribute('x2', vertices[j].x); line.setAttribute('y2', vertices[j].y);
    const highlighted = isHighlightEdge(i,j);
    const holeEdge = isHoleEdge(i,j);
    let strokeColor = 'var(--ink-soft)', strokeW = '2.4';
    if(highlighted){ strokeColor = 'var(--violet)'; strokeW = '3.6'; }
    else if(holeEdge){ strokeColor = 'var(--rose)'; strokeW = '3.6'; }
    line.setAttribute('stroke', strokeColor);
    line.setAttribute('stroke-width', strokeW);
    line.setAttribute('style','cursor:pointer;');
    line.dataset.edgeKey = key;
    line.addEventListener('click', (e) => { e.stopPropagation(); onEdgeClick(key); });
    line.addEventListener('mouseenter', () => { if(!highlighted && !holeEdge) line.setAttribute('stroke','var(--gold-bright)'); });
    line.addEventListener('mouseleave', () => { if(!highlighted && !holeEdge) line.setAttribute('stroke','var(--ink-soft)'); });
    svg.appendChild(line);
  });

  vertices.forEach((v,idx) => {
    const g = document.createElementNS(SVG_NS,'g');
    g.setAttribute('style','cursor:pointer;');
    const isSelected = selectedForEdge === idx;
    const isHL = isHighlightVertex(idx);
    const isHoleV = isHoleVertex(idx);
    let fill = coloring ? COLOR_PALETTE[coloring[idx] % COLOR_PALETTE.length] : (isSelected ? 'rgba(242,180,23,.25)' : 'var(--gold)');
    let stroke = isSelected ? 'var(--gold-bright)' : (coloring ? 'rgba(0,0,0,.35)' : 'var(--gold-deep)');
    if(isHL){ stroke = 'var(--violet)'; }
    else if(isHoleV){ stroke = 'var(--rose)'; }

    const circle = document.createElementNS(SVG_NS,'circle');
    circle.setAttribute('cx', v.x); circle.setAttribute('cy', v.y); circle.setAttribute('r', vertexRadius);
    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', (isSelected||isHL||isHoleV) ? 3.2 : 1.8);
    g.appendChild(circle);

    const text = document.createElementNS(SVG_NS,'text');
    text.setAttribute('x', v.x); text.setAttribute('y', v.y+5);
    text.setAttribute('text-anchor','middle');
    text.setAttribute('class','vlabel');
    text.setAttribute('font-size', Math.max(10, vertexRadius*0.7));
    if(coloring){ text.setAttribute('fill', '#0b0f1a'); }
    text.textContent = v.label;
    g.appendChild(text);

    if(chordalInfo && chordalInfo.chordal){
      const posInOrder = chordalInfo.order.indexOf(idx);
      const badge = document.createElementNS(SVG_NS,'text');
      badge.setAttribute('x', v.x + vertexRadius*0.75);
      badge.setAttribute('y', v.y - vertexRadius*0.75);
      badge.setAttribute('text-anchor','middle');
      badge.setAttribute('font-size', Math.max(9, vertexRadius*0.45));
      badge.setAttribute('fill', 'var(--cyan)');
      badge.setAttribute('font-family', "'Spline Sans Mono', monospace");
      badge.textContent = posInOrder + 1;
      g.appendChild(badge);
    }

    g.addEventListener('mousedown', (e) => onVertexMouseDown(e, idx));
    g.addEventListener('click', (e) => { e.stopPropagation(); onVertexClick(idx); });
    svg.appendChild(g);
  });
}

/* ---------- Interacción: agregar/mover/eliminar/pan/zoom ---------- */
function svgPoint(svg, evt){
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function onCanvasClick(evt){
  const svg = $('#graphCanvas');
  const p = svgPoint(svg, evt);
  if(mode === 'vertex'){
    vertices.push({id: nextVertexId++, label: nextLabel(), x:p.x, y:p.y});
    render();
  }
}
function onVertexClick(idx){
  if(mode === 'edge'){
    if(selectedForEdge === null){ selectedForEdge = idx; renderGraphSVG(); return; }
    if(selectedForEdge === idx){ selectedForEdge = null; renderGraphSVG(); return; }
    const key = edgeKey(selectedForEdge, idx);
    if(edgeSet.has(key)) edgeSet.delete(key); else edgeSet.add(key);
    selectedForEdge = null;
    render();
  } else if(mode === 'delete'){
    // eliminar vértice: hay que reindexar aristas
    const removedIdx = idx;
    vertices.splice(removedIdx,1);
    const newEdges = new Set();
    edgeSet.forEach(key => {
      let [a,b] = key.split('-').map(Number);
      if(a===removedIdx || b===removedIdx) return;
      if(a>removedIdx) a--; if(b>removedIdx) b--;
      newEdges.add(edgeKey(a,b));
    });
    edgeSet = newEdges;
    render();
  }
}
function onEdgeClick(key){
  if(mode === 'delete'){ edgeSet.delete(key); render(); }
  else if(mode === 'edge'){ edgeSet.delete(key); render(); }
}
function onVertexMouseDown(evt, idx){
  if(mode !== 'move') return;
  evt.stopPropagation();
  draggingVertex = idx;
  const svg = $('#graphCanvas');
  const p = svgPoint(svg, evt);
  dragOffset = { x: p.x - vertices[idx].x, y: p.y - vertices[idx].y };
}
// Arrastrar el fondo del lienzo desplaza la vista (pan); un clic real (sin
// arrastre) sigue haciendo lo que corresponda al modo activo (p. ej. agregar vértice).
document.addEventListener('DOMContentLoaded', () => {
  const svg = $('#graphCanvas');
  svg.addEventListener('mousedown', (evt) => {
    if(draggingVertex !== null) return;
    if(evt.target !== svg) return; // el clic empezó sobre un vértice o arista, no el fondo
    panState = { startX: evt.clientX, startY: evt.clientY, vb: {...viewBox}, moved:false };
  });
});
document.addEventListener('mousemove', (evt) => {
  if(draggingVertex !== null){
    const svg = $('#graphCanvas');
    const p = svgPoint(svg, evt);
    vertices[draggingVertex].x = p.x - dragOffset.x;
    vertices[draggingVertex].y = p.y - dragOffset.y;
    renderGraphSVG();
    return;
  }
  if(panState){
    const svg = $('#graphCanvas');
    const dx = evt.clientX - panState.startX, dy = evt.clientY - panState.startY;
    if(Math.abs(dx) > 4 || Math.abs(dy) > 4) panState.moved = true;
    if(panState.moved){
      const scale = viewBox.w / svg.clientWidth;
      viewBox.x = panState.vb.x - dx*scale;
      viewBox.y = panState.vb.y - dy*scale;
      applyViewBox();
    }
  }
});
document.addEventListener('mouseup', (evt) => {
  if(panState && !panState.moved){
    onCanvasClick(evt); // fue un clic real, no un arrastre: aplicamos la acción del modo
  }
  panState = null;
  draggingVertex = null;
});
function onWheelZoom(evt){
  evt.preventDefault();
  const svg = $('#graphCanvas');
  const p = svgPoint(svg, evt);
  const factor = evt.deltaY > 0 ? 1.1 : 0.9;
  const newW = Math.min(3000, Math.max(120, viewBox.w * factor));
  const newH = newW * (viewBox.h/viewBox.w);
  // mantener el punto bajo el cursor fijo al hacer zoom
  viewBox.x = p.x - (p.x - viewBox.x) * (newW/viewBox.w);
  viewBox.y = p.y - (p.y - viewBox.y) * (newH/viewBox.h);
  viewBox.w = newW; viewBox.h = newH;
  applyViewBox();
}
function zoomBy(factor){
  const cx = viewBox.x + viewBox.w/2, cy = viewBox.y + viewBox.h/2;
  const newW = Math.min(3000, Math.max(120, viewBox.w * factor));
  const newH = newW * (viewBox.h/viewBox.w);
  viewBox.x = cx - newW/2; viewBox.y = cy - newH/2;
  viewBox.w = newW; viewBox.h = newH;
  applyViewBox();
}
function fitView(){
  if(vertices.length === 0){ viewBox = {...VIEW_DEFAULT}; applyViewBox(); return; }
  const pad = vertexRadius + 40;
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  vertices.forEach(v => { minX=Math.min(minX,v.x); maxX=Math.max(maxX,v.x); minY=Math.min(minY,v.y); maxY=Math.max(maxY,v.y); });
  minX-=pad; maxX+=pad; minY-=pad; maxY+=pad;
  let w = Math.max(200, maxX-minX), h = Math.max(150, maxY-minY);
  const targetRatio = VIEW_DEFAULT.w / VIEW_DEFAULT.h;
  if(w/h > targetRatio) h = w/targetRatio; else w = h*targetRatio;
  const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
  viewBox = { x: cx-w/2, y: cy-h/2, w, h };
  applyViewBox();
}
function changeVertexRadius(delta){
  vertexRadius = Math.max(10, Math.min(40, vertexRadius+delta));
  renderGraphSVG();
}
function exportPNG(){
  const svg = $('#graphCanvas');
  const serializer = new XMLSerializer();
  let svgStr = serializer.serializeToString(svg);
  // resolvemos las variables CSS a valores concretos: un <img>/canvas no puede leer var(--...)
  const cssVars = {
    '--ink-soft':'#9fb0d0','--gold':'#f2b417','--gold-deep':'#c8901a','--gold-bright':'#ffd24a',
    '--line':'#1f2e4a'
  };
  Object.entries(cssVars).forEach(([k,v]) => { svgStr = svgStr.split(`var(${k})`).join(v); });
  const img = new Image();
  const svgBlob = new Blob([svgStr], {type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    const scale = 2; // exportar a mayor resolución
    const canvas = document.createElement('canvas');
    canvas.width = viewBox.w * scale; canvas.height = viewBox.h * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1020'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, viewBox.w, viewBox.h);
    URL.revokeObjectURL(url);
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'grafo-omai.png';
      a.click();
    });
  };
  img.src = url;
}
function copyLatexSource(key){
  const text = latexSources[key];
  if(!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
}


/* =========================================================
   4. INVARIANTES Y MATRICES (LaTeX)
   ========================================================= */
function renderKatexInto(el, latex, displayMode){
  try{ window.katex.render(latex, el, {throwOnError:false, displayMode: !!displayMode}); }
  catch(e){ el.textContent = latex; }
}
function matrixToLatex(M, rowLabels, colLabels){
  let body = M.map(row => row.join(' & ')).join(' \\\\ ');
  let latex = `\\begin{bmatrix} ${body} \\end{bmatrix}`;
  return latex;
}
function renderInvariants(){
  const g = currentGraph();
  const n = g.n, m = edgeListOf(g).length;
  $('#chipOrder').textContent = n + (n===1?' vértice':' vértices');
  $('#chipSize').textContent = m + (m===1?' arista':' aristas');

  if(n === 0){
    $('#invariantsCard').innerHTML = `<div class="hint-block">Agrega al menos un vértice para calcular invariantes.</div>`;
    $('#chipChromatic').textContent = 'χ = —';
    $('#colorLegendBlock').style.display = 'none';
    return;
  }

  const degrees = vertices.map((_,i) => degree(g,i));
  const clique = cliqueNumber(g);
  const chromatic = chromaticNumber(g);
  const connected = isConnected(g);
  const comps = connectedComponents(g);
  const bipartite = isBipartite(g);
  const maxEdges = n*(n-1)/2;
  const density = maxEdges>0 ? (m/maxEdges) : 0;
  const regular = degrees.length>0 && degrees.every(d => d===degrees[0]);
  const edgeList = edgeListOf(g);
  const planar = isPlanar(n, edgeList);
  const spanTrees = connected ? spanningTreeCount(n, edgeList) : 0;
  let algebraicConn = null;
  if(n >= 2){
    const L = laplacianMatrix(g);
    const eig = jacobiEigenvalues(L);
    algebraicConn = eig[1] ? eig[1].val : 0;
  }
  const adjM = adjacencyMatrix(g).map(row => row.map(v=>!!v));
  const k5found = findK5Subgraph(n, adjM);
  const k33found = findK33Subgraph(n, adjM);
  const chordalRes = checkChordal(n, edgeList);

  $('#chipChromatic').textContent = 'χ = ' + chromatic.number;

  $('#invariantsCard').innerHTML = `<div class="readout-grid">
    <div class="row"><span class="rk">Orden (vértices)</span><span class="rv">${n}</span></div>
    <div class="row"><span class="rk">Tamaño (aristas)</span><span class="rv">${m}</span></div>
    <div class="row"><span class="rk">Número de clan ω(G)</span><span class="rv">${clique.number}</span></div>
    <div class="row"><span class="rk">Número cromático χ(G)</span><span class="rv">${chromatic.number}</span></div>
    <div class="row"><span class="rk">Secuencia de grados</span><span class="rv">${degrees.slice().sort((a,b)=>b-a).join(', ')}</span></div>
    <div class="row"><span class="rk">Grado mín / máx</span><span class="rv">${Math.min(...degrees)} / ${Math.max(...degrees)}</span></div>
    <div class="row"><span class="rk">¿Regular?</span><span class="rv">${regular ? 'Sí' : 'No'}</span></div>
    <div class="row"><span class="rk">¿Conexo?</span><span class="rv">${connected ? 'Sí' : 'No'}</span></div>
    <div class="row"><span class="rk">Componentes conexas</span><span class="rv">${comps}</span></div>
    <div class="row"><span class="rk">¿Bipartito?</span><span class="rv">${bipartite ? 'Sí' : 'No'}</span></div>
    <div class="row"><span class="rk">¿Planar?</span><span class="rv" style="color:${planar?'var(--good)':'var(--bad)'}">${planar ? 'Sí' : 'No'}</span></div>
    <div class="row"><span class="rk">¿Contiene K₅ o K₃,₃?</span><span class="rv" style="color:${(k5found||k33found)?'var(--bad)':'var(--good)'}">${k5found ? 'Sí (K₅)' : (k33found ? 'Sí (K₃,₃)' : 'No')}</span></div>
    <div class="row"><span class="rk">¿Cordal?</span><span class="rv" style="color:${chordalRes.chordal?'var(--good)':'var(--bad)'}">${chordalRes.chordal ? 'Sí' : 'No'}</span></div>
    <div class="row"><span class="rk">Densidad</span><span class="rv">${(density*100).toFixed(1)}%</span></div>
    <div class="row"><span class="rk">Conectividad algebraica λ₂</span><span class="rv">${algebraicConn===null ? '—' : algebraicConn.toFixed(4)}</span></div>
    <div class="row"><span class="rk">Árboles generadores</span><span class="rv">${connected ? spanTrees : '— (no conexo)'}</span></div>
  </div>`;

  if(showColoring){
    $('#colorLegendBlock').style.display = '';
    let html = '';
    const usedColors = Array.from(new Set(chromatic.coloring));
    usedColors.sort((a,b)=>a-b).forEach(c => {
      const members = vertices.filter((_,i)=>chromatic.coloring[i]===c).map(v=>v.label);
      html += `<div class="color-legend-row"><span class="color-dot" style="background:${COLOR_PALETTE[c%COLOR_PALETTE.length]}"></span> Color ${c+1}: ${members.join(', ')}</div>`;
    });
    $('#colorLegend').innerHTML = html;
  } else {
    $('#colorLegendBlock').style.display = 'none';
  }
}

let latexSources = {};
function renderMatrices(){
  const g = currentGraph();
  if(g.n === 0){
    ['matAdj','matDeg','matLap','matInc','matSpectrum'].forEach(id => $('#'+id).innerHTML = '<div class="hint-block">Agrega vértices para ver las matrices.</div>');
    latexSources = {};
    return;
  }
  const A = adjacencyMatrix(g);
  const D = degreeMatrix(g);
  const L = laplacianMatrix(g);
  const {matrix:I, edges} = incidenceMatrix(g);

  latexSources.adj = `A = ${matrixToLatex(A)}`;
  latexSources.deg = `D = ${matrixToLatex(D)}`;
  latexSources.lap = `L = D - A = ${matrixToLatex(L)}`;
  renderKatexInto($('#matAdj'), latexSources.adj, true);
  renderKatexInto($('#matDeg'), latexSources.deg, true);
  renderKatexInto($('#matLap'), latexSources.lap, true);
  if(edges.length === 0){
    $('#matInc').innerHTML = '<div class="hint-block">Sin aristas — la matriz de incidencia está vacía.</div>';
    latexSources.inc = '';
  } else {
    latexSources.inc = `M = ${matrixToLatex(I)}`;
    renderKatexInto($('#matInc'), latexSources.inc, true);
  }

  // Espectro laplaciano (teoría algebraica de grafos)
  const eig = jacobiEigenvalues(L);
  const vals = eig.map(p => p.val);
  const rounded = vals.map(v => Math.abs(v) < 1e-6 ? 0 : Math.round(v*1000)/1000);
  const spectrumLatex = `\\operatorname{spec}(L) = \\{${rounded.join(',\\ ')}\\}`;
  latexSources.spec = spectrumLatex;
  const algConn = eig.length>1 ? eig[1].val : 0;
  const nTrees = isConnected(g) ? spanningTreeCount(g.n, edges) : 0;
  let html = `<div id="spectrumLatexBox"></div>
    <div class="hint-block" style="margin-top:12px;">
      <b>Conectividad algebraica</b> (λ₂, valor de Fiedler): <span style="color:var(--gold-bright)">${algConn.toFixed(4)}</span> — mide qué tan "bien conectado" está el grafo (0 si es disconexo).<br><br>
      <b>Número de árboles generadores</b> (teorema de Kirchhoff, producto de eigenvalores no nulos entre n): <span style="color:var(--gold-bright)">${isConnected(g) ? nTrees : 'no aplica (grafo no conexo)'}</span>
    </div>`;
  $('#matSpectrum').innerHTML = html;
  renderKatexInto($('#spectrumLatexBox'), spectrumLatex, true);
}

/* =========================================================
   5. GALERÍA DE GRAFOS DE EJEMPLO Y VISTAS
   ========================================================= */
const PRESET_LIST = [
  {name:'K4 (completo)', key:'K4'},
  {name:'K5 (completo)', key:'K5'},
  {name:'C5 (ciclo impar)', key:'C5'},
  {name:'C6 (ciclo par)', key:'C6'},
  {name:'K3,3 (bipartito)', key:'K33'},
  {name:'Grafo de Petersen', key:'Petersen'},
  {name:'Árbol binario', key:'Arbol'},
  {name:'Rueda W5', key:'Rueda'},
];
function renderPresets(){
  $('#presets').innerHTML = PRESET_LIST.map(p => `<div class="preset" data-key="${p.key}"><span class="pname">${p.name}</span></div>`).join('');
  $$('#presets .preset').forEach(el => {
    el.addEventListener('click', () => { GRAPH_PRESETS[el.dataset.key](); });
  });
}
const VIEW_HINTS = {
  grafo: 'Haz clic en el lienzo para agregar un vértice (según el modo activo arriba).',
  matrices: 'Todas las matrices se generan automáticamente a partir del grafo actual.',
  glosario: 'Definiciones y teoremas de referencia, en LaTeX.'
};
function switchView(view){
  $$('#viewSelector .preset').forEach(p => p.classList.toggle('active', p.dataset.view===view));
  $$('.stage-view').forEach(v => v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $('#stageHint').textContent = VIEW_HINTS[view];
  if(view === 'matrices') renderMatrices();
  if(view === 'glosario') renderGlossary();
}

/* =========================================================
   6. MINIMIZAR CRUCES (Tutte si es planar, fuerza dirigida si no)
   ========================================================= */
function minimizeCrossings(){
  const n = vertices.length;
  if(n < 3) return;
  const edgeList = Array.from(edgeSet).map(k => k.split('-').map(Number));
  let pos = tutteEmbedding(n, edgeList);
  let usedTutte = true;
  if(!pos){
    pos = forceDirectedLayout(n, edgeList, 760, 540, 400);
    usedTutte = false;
  }
  vertices.forEach((v,i) => { if(pos[i]){ v.x = pos[i].x; v.y = pos[i].y; } });
  viewBox = {...VIEW_DEFAULT};
  render();
  fitView();
  const crossings = countCrossings(pos, edgeList);
  $('#stageHint').textContent = usedTutte
    ? `Grafo planar: reubicado con embebido de Tutte — ${crossings} cruce(s).`
    : `Grafo no planar: reubicado con diseño de fuerzas — ${crossings} cruce(s) (el mínimo teórico puede ser mayor que 0).`;
}

/* =========================================================
   7. GLOSARIO (definiciones y teoremas en LaTeX)
   ========================================================= */
const GLOSSARY = [
  {term:'Grafo', body:'Un grafo es un par <span class="kx">G = (V, E)</span>, donde <span class="kx">V</span> es un conjunto finito de vértices y <span class="kx">E</span> es un conjunto de aristas, cada una uniendo dos vértices de <span class="kx">V</span>. En este simulador trabajamos con grafos simples (sin lazos ni aristas múltiples) y no dirigidos.'},
  {term:'Grado de un vértice', body:'El grado <span class="kx">\\deg(v)</span> de un vértice <span class="kx">v</span> es el número de aristas incidentes a él. La suma de todos los grados siempre es par: <span class="kxd">\\sum_{v \\in V} \\deg(v) = 2|E|</span> (lema del apretón de manos).'},
  {term:'Número de clan ω(G)', body:'El número de clan (o número de clique) <span class="kx">\\omega(G)</span> es el tamaño del subgrafo completo más grande contenido en <span class="kx">G</span>. Encontrarlo es NP-difícil en general; este simulador usa el algoritmo de Bron–Kerbosch con pivote.'},
  {term:'Número cromático χ(G)', body:'El número cromático <span class="kx">\\chi(G)</span> es la menor cantidad de colores necesarios para colorear los vértices de forma que ningún par de vértices adyacentes comparta color. Siempre se cumple <span class="kxd">\\omega(G) \\le \\chi(G)</span>, y esta desigualdad puede ser estricta (por ejemplo, en cualquier ciclo impar <span class="kx">C_{2k+1}</span>: <span class="kx">\\omega = 2</span> pero <span class="kx">\\chi = 3</span>).'},
  {term:'Grafo planar y Teorema de Kuratowski', body:'Un grafo es planar si puede dibujarse en el plano sin que sus aristas se crucen. El <b>Teorema de Kuratowski</b> establece que <span class="kx">G</span> es planar si y solo si no contiene una subdivisión de <span class="kx">K_5</span> ni de <span class="kx">K_{3,3}</span>. El grafo de Petersen es el ejemplo clásico de un grafo no planar que NO contiene ninguno de los dos como subgrafo literal — solo como <i>minor</i>, lo cual exige un algoritmo de planaridad genuino (aquí implementamos DMP) en vez de solo buscar esos subgrafos.'},
  {term:'Fórmula de Euler', body:'Para todo grafo planar conexo con <span class="kx">n</span> vértices, <span class="kx">m</span> aristas y <span class="kx">f</span> caras (incluida la exterior): <span class="kxd">n - m + f = 2</span>. De aquí se deduce la cota <span class="kxd">m \\le 3n - 6</span> para <span class="kx">n \\ge 3</span>, y <span class="kx">m \\le 2n-4</span> si además es bipartito.'},
  {term:'Grafo cordal y orden de eliminación perfecta', body:'Un grafo es cordal si todo ciclo de longitud <span class="kx">\\ge 4</span> tiene una cuerda (una arista entre dos vértices no consecutivos del ciclo). Un grafo es cordal si y solo si admite un <b>orden de eliminación perfecta</b>: un orden <span class="kx">v_1,\\dots,v_n</span> tal que, para cada <span class="kx">v_i</span>, sus vecinos posteriores en el orden forman un clan. Se detecta con <i>Maximum Cardinality Search</i> (MCS); si el orden que produce MCS falla la prueba, el grafo definitivamente no es cordal (y existe un "hoyo": un ciclo inducido sin cuerdas).'},
  {term:'Matriz de adyacencia', body:'<span class="kx">A \\in \\{0,1\\}^{n\\times n}</span>, donde <span class="kx">A_{ij}=1</span> si y solo si los vértices <span class="kx">i,j</span> son adyacentes. Es simétrica para grafos no dirigidos, con diagonal nula (sin lazos).'},
  {term:'Matriz de incidencia', body:'<span class="kx">M \\in \\{0,1\\}^{n\\times m}</span>, donde cada columna representa una arista y tiene exactamente dos unos: en las filas de sus dos vértices extremos.'},
  {term:'Matriz laplaciana y Teorema de Kirchhoff', body:'La laplaciana es <span class="kxd">L = D - A</span>, donde <span class="kx">D</span> es la matriz diagonal de grados. Es simétrica, semidefinida positiva, y siempre tiene a 0 como eigenvalor (con vector propio constante). El <b>Teorema del árbol matricial de Kirchhoff</b> dice que el número de árboles generadores de <span class="kx">G</span> es igual a cualquier cofactor de <span class="kx">L</span> (el determinante de <span class="kx">L</span> quitando una fila y columna cualquiera), y también al producto de los eigenvalores no nulos dividido entre <span class="kx">n</span>.'},
  {term:'Conectividad algebraica (valor de Fiedler)', body:'Es el segundo eigenvalor más pequeño de la laplaciana, <span class="kx">\\lambda_2(L)</span>. Es cero si y solo si el grafo es disconexo, y en general mientras más grande, "mejor conectado" está el grafo. Su eigenvector asociado (vector de Fiedler) se usa para particionar grafos (clustering espectral).'},
];
function renderGlossary(){
  const container = $('#glossaryContent');
  container.innerHTML = GLOSSARY.map((e,i) => `
    <div class="gloss-entry">
      <div class="gloss-term">${e.term}</div>
      <div class="gloss-body" id="gloss-body-${i}">${e.body}</div>
    </div>
  `).join('');
  GLOSSARY.forEach((e,i) => {
    const el = $('#gloss-body-'+i);
    el.querySelectorAll('.kx, .kxd').forEach(span => {
      const displayMode = span.classList.contains('kxd');
      renderKatexInto(span, span.textContent, displayMode);
    });
  });
}

/* =========================================================
   WIRING DE EVENTOS
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const svg = $('#graphCanvas');

  $$('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      selectedForEdge = null;
      $$('.mode-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      svg.classList.remove('mode-move','mode-delete');
      if(mode==='move') svg.classList.add('mode-move');
      if(mode==='delete') svg.classList.add('mode-delete');
      const hints = {
        vertex: 'Haz clic en el lienzo para agregar un vértice. Arrastra el fondo para mover la vista.',
        edge: 'Haz clic en dos vértices para agregar o quitar la arista entre ellos.',
        move: 'Arrastra un vértice para reposicionarlo.',
        delete: 'Haz clic en un vértice o una arista para eliminarla.'
      };
      $('#stageHint').textContent = hints[mode];
      renderGraphSVG();
    });
  });

  $('#colorToggle').addEventListener('change', (e) => {
    showColoring = e.target.checked;
    $('#colorToggleWrap').classList.toggle('on', showColoring);
    render();
  });

  $('#k5Toggle').addEventListener('change', (e) => {
    showK5K33 = e.target.checked;
    $('#k5ToggleWrap').classList.toggle('on', showK5K33);
    renderGraphSVG();
  });
  $('#chordalToggle').addEventListener('change', (e) => {
    showChordalHighlight = e.target.checked;
    $('#chordalToggleWrap').classList.toggle('on', showChordalHighlight);
    renderGraphSVG();
  });
  $('#btnMinCross').addEventListener('click', minimizeCrossings);

  $('#btnClear').addEventListener('click', () => {
    vertices = []; edgeSet = new Set(); selectedForEdge = null; nextVertexId = 0;
    viewBox = {...VIEW_DEFAULT};
    render();
  });

  $('#btnFit').addEventListener('click', fitView);
  $('#btnZoomIn').addEventListener('click', () => zoomBy(0.85));
  $('#btnZoomOut').addEventListener('click', () => zoomBy(1/0.85));
  $('#btnVertexBigger').addEventListener('click', () => changeVertexRadius(3));
  $('#btnVertexSmaller').addEventListener('click', () => changeVertexRadius(-3));
  $('#btnExportPNG').addEventListener('click', exportPNG);

  $$('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      copyLatexSource(btn.dataset.copy);
      const original = btn.textContent;
      btn.textContent = '¡Copiado!'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1400);
    });
  });

  $$('#viewSelector .preset').forEach(p => p.addEventListener('click', () => switchView(p.dataset.view)));

  $('#genFamily').addEventListener('change', () => {
    const family = $('#genFamily').value;
    const limits = GENERATOR_LIMITS[family];
    $('#genMWrap').style.display = family === 'Kmn' ? '' : 'none';
    $('#genN').min = limits.n[0]; $('#genN').max = limits.n[1];
    $('#genError').textContent = '';
  });
  $('#btnGenerate').addEventListener('click', runGenerator);

  renderPresets();
  GRAPH_PRESETS['K4'](); // grafo inicial de ejemplo
});
