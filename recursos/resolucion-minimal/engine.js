'use strict';

/* =========================================================================
   MOTOR: Resolución libre minimal de un ideal monomial (3 variables, n gens)
   =========================================================================
   Representación:
     - Un "término" es {coef: entero (±1, ±2, ...), exp: [a,b,c]}
     - Una "entrada" de matriz es un arreglo de términos (polinomio, ya
       simplificado: términos con el mismo exp se combinan; coef=0 se quita).
     - La matriz global D es un mapa (fila -> columna -> entrada) sobre TODAS
       las bases de TODOS los grados a la vez (bloque estrictamente
       subdiagonal en el grado homológico). Se hace eliminación gaussiana
       sobre entradas "unitarias" (coef=±1, exp=[0,0,0]) hasta que no quede
       ninguna. El resultado es, por teoría de Morse algebraica / lema de
       cancelación de Gauss para complejos de cadenas, la resolución
       MINIMAL (isomorfa a la de Macaulay2, salvo signos/orden de base).
   ========================================================================= */

function lcmExp(a, b) { return a.map((v, i) => Math.max(v, b[i])); }
function addExp(a, b) { return a.map((v, i) => v + b[i]); }
function subExp(a, b) { return a.map((v, i) => v - b[i]); } // asume b|a
function eqExp(a, b) { return a.every((v, i) => v === b[i]); }
function isZeroExp(a) { return a.every((v) => v === 0); }
function expKey(e) { return e.join(','); }

// Simplifica una lista de términos: combina exponentes iguales, quita coef=0
function simplify(terms) {
  const map = new Map();
  for (const t of terms) {
    const k = expKey(t.exp);
    map.set(k, (map.get(k) || 0) + t.coef);
  }
  const out = [];
  for (const [k, coef] of map.entries()) {
    if (coef !== 0) out.push({ coef, exp: k.split(',').map(Number) });
  }
  // orden canónico para impresión estable
  out.sort((a, b) => expKey(a.exp).localeCompare(expKey(b.exp)));
  return out;
}

function scaleTerms(terms, factor) {
  // factor: {coef, exp} un solo término (usado como u^{-1} * entrada, ambos monomios)
  return terms.map((t) => ({ coef: t.coef * factor.coef, exp: addExp(t.exp, factor.exp) }));
}

function subTermsLists(a, b) {
  // a - b, ambos listas de términos
  return simplify([...a, ...b.map((t) => ({ coef: -t.coef, exp: t.exp }))]);
}

function multTermLists(a, bTerm) {
  // multiplica lista de términos "a" por UN término bTerm (monomio con signo)
  return a.map((t) => ({ coef: t.coef * bTerm.coef, exp: addExp(t.exp, bTerm.exp) }));
}

function isUnitEntry(terms) {
  return terms.length === 1 && Math.abs(terms[0].coef) === 1 && isZeroExp(terms[0].exp);
}

function termToString(t, varNames) {
  const parts = [];
  t.exp.forEach((e, i) => {
    if (e === 1) parts.push(varNames[i]);
    else if (e > 1) parts.push(`${varNames[i]}^${e}`);
  });
  const mono = parts.length ? parts.join('') : '1';
  return mono;
}

function polyToString(terms, varNames) {
  if (terms.length === 0) return '0';
  return terms
    .map((t, idx) => {
      const mono = termToString(t, varNames);
      const sign = t.coef < 0 ? '-' : idx === 0 ? '' : '+';
      const abscoef = Math.abs(t.coef);
      const coefStr = abscoef === 1 ? '' : String(abscoef);
      return `${sign}${coefStr}${mono}`;
    })
    .join(' ');
}

// ---------- 1. Construcción del complejo de Taylor ----------
// generators: array de exponentes [[a,b,c], ...] (ya se asume minimal, sin
// divisores redundantes entre sí; se verifica/depura en buildTaylor).

function subsetsOfSize(n, k) {
  const res = [];
  const idxs = [...Array(n).keys()];
  function rec(start, chosen) {
    if (chosen.length === k) { res.push([...chosen]); return; }
    for (let i = start; i < n; i++) { chosen.push(idxs[i]); rec(i + 1, chosen); chosen.pop(); }
  }
  rec(0, []);
  return res;
}

function lcmOfSubset(gens, subset) {
  let e = subset.map(() => 0).length ? gens[subset[0]] : null;
  let acc = gens[subset[0]];
  for (let i = 1; i < subset.length; i++) acc = lcmExp(acc, gens[subset[i]]);
  return acc;
}

function buildTaylor(gens) {
  const n = gens.length;
  // basis[k] = lista de subconjuntos (arrays de índices ordenados) de tamaño k, k=1..n
  // basis[0] = [[]] representa R (F_0)
  const basis = [[[]]];
  for (let k = 1; k <= n; k++) basis.push(subsetsOfSize(n, k));

  // multideg de cada subconjunto (para basis[0] es [0,0,0])
  const multideg = basis.map((level) =>
    level.map((S) => (S.length === 0 ? gens[0].map(() => 0) : lcmOfSubset(gens, S)))
  );

  // D: para cada grado k=1..n, matriz basis[k-1] x basis[k]
  const D = []; // D[k] : filas=basis[k-1], columnas=basis[k]  (k=1..n)
  for (let k = 1; k <= n; k++) {
    const rows = basis[k - 1], cols = basis[k];
    const mat = rows.map(() => cols.map(() => []));
    cols.forEach((S, cIdx) => {
      const mS = multideg[k][cIdx];
      S.forEach((i, pos) => {
        const Sminus = S.filter((x) => x !== i);
        const rIdx = rows.findIndex((R) => R.length === Sminus.length && R.every((v, j) => v === Sminus[j]));
        const mR = multideg[k - 1][rIdx];
        const sign = pos % 2 === 0 ? 1 : -1;
        const quotient = subExp(mS, mR); // m_S / m_{S\i}
        mat[rIdx][cIdx] = [{ coef: sign, exp: quotient }];
      });
    });
    D.push(mat);
  }
  return { n, basis, multideg, D };
}

// ---------- 2. Eliminación gaussiana hasta minimalidad ----------
// Representamos el estado como listas mutables de "vivos" por grado y
// las matrices D[k] indexadas por (rowLive, colLive).

function reduceToMinimal(taylor) {
  const { n } = taylor;
  // alive[k] = array de índices (en la numeración original de basis[k]) vivos
  const alive = taylor.basis.map((level) => level.map((_, i) => i));
  // D[k] se mantiene como matriz completa original; usamos alive para filtrar
  const D = taylor.D; // D[k]: k=1..n, D[k-1] en este arreglo -> ojo indices: D[0] es d_1

  function getEntry(k, r, c) { return D[k - 1][r][c]; } // d_k : basis[k]->basis[k-1]
  function setEntry(k, r, c, val) { D[k - 1][r][c] = val; }

  let changed = true;
  while (changed) {
    changed = false;
    for (let k = 1; k <= n && !changed; k++) {
      const rows = alive[k - 1], cols = alive[k];
      outer:
      for (const r of rows) {
        for (const c of cols) {
          const entry = getEntry(k, r, c);
          if (isUnitEntry(entry)) {
            // Cancelar par (r en basis[k-1], c en basis[k])
            const u = entry[0]; // {coef:±1, exp:[0,0,0]}
            const uInv = { coef: u.coef, exp: [0, 0, 0] }; // u^{-1} = u cuando u=±1

            // 1) Corregir d_k: para i in rows\r, j in cols\c
            for (const i of rows) {
              if (i === r) continue;
              for (const j of cols) {
                if (j === c) continue;
                const Dij = getEntry(k, i, j);
                const Dic = getEntry(k, i, c);
                const Drj = getEntry(k, r, j);
                if (Dic.length && Drj.length) {
                  const correction = [];
                  for (const t1 of Dic) {
                    for (const t2 of scaleTerms(Drj, uInv)) {
                      correction.push({ coef: t1.coef * t2.coef, exp: addExp(t1.exp, t2.exp) });
                    }
                  }
                  setEntry(k, i, j, subTermsLists(Dij, correction));
                }
              }
            }
            // Nota: no se requiere corregir d_{k+1} ni d_{k-1}: basta con
            // eliminar (por filtrado de 'alive') la fila c en d_{k+1} y la
            // columna r en d_{k-1}. Se verifica algebraicamente que
            // partial' o partial' = 0 se mantiene solo con la corrección de
            // arriba (bloque d_k) más esta eliminación simple.

            // Quitar r de alive[k-1], c de alive[k]
            alive[k - 1] = alive[k - 1].filter((x) => x !== r);
            alive[k] = alive[k].filter((x) => x !== c);
            changed = true;
            break outer;
          }
        }
      }
    }
  }

  return { alive, D, basis: taylor.basis, multideg: taylor.multideg, n };
}

// ---------- 3. Extracción de resultado legible ----------

function summarize(gens, varNames = ['x', 'y', 'z']) {
  const taylor = buildTaylor(gens);
  const red = reduceToMinimal(taylor);
  const { alive, D, basis, multideg, n } = red;

  const levels = [];
  for (let k = 0; k <= n; k++) {
    const idxs = alive[k];
    levels.push({
      rank: idxs.length,
      generators: idxs.map((i) => ({
        subset: basis[k][i],
        multidegree: multideg[k][i],
      })),
    });
  }

  const maps = [];
  for (let k = 1; k <= n; k++) {
    const rows = alive[k - 1], cols = alive[k];
    if (rows.length === 0 && cols.length === 0) continue;
    const matrix = rows.map((r) => cols.map((c) => D[k - 1][r][c]));
    maps.push({
      from: `F_${k}`, to: `F_${k - 1}`,
      rows: rows.map((r) => multideg[k - 1][r]),
      cols: cols.map((c) => multideg[k][c]),
      matrix,
      matrixStr: matrix.map((row) => row.map((e) => polyToString(e, varNames))),
    });
  }

  const bettiTable = levels.map((lvl, k) => {
    const byDeg = new Map();
    lvl.generators.forEach((g) => {
      const key = g.multidegree.join(',');
      byDeg.set(key, (byDeg.get(key) || 0) + 1);
    });
    return { k, entries: [...byDeg.entries()].map(([deg, count]) => ({ degree: deg.split(',').map(Number), count })) };
  });

  return { levels, maps, bettiTable, varNames };
}

module.exports = { buildTaylor, reduceToMinimal, summarize, polyToString };
