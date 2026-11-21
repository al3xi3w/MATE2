/* ===== Sección 2: Cómo resolver — recetas + generadores de ejemplos ===== */
(function () {
  const G = window.GR, R = window.REC, { rnd, pick, shuffle } = G;
  const L = (g, i) => g.labels[i];
  const setStr = (g, arr) => `\\{${arr.map((i) => L(g, i)).join(',')}\\}`;
  const fig = (g, o = {}) => `<figure class="fig">${G.svg(g, o)}${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}</figure>`;
  const degTable = (g) => { const d = G.degrees(g); return `<table class="tbl small"><tr><th>vértice</th>${g.labels.map((l) => `<th>${l}</th>`).join('')}</tr><tr><td>grado</td>${d.map((x) => `<td class="${x % 2 ? 'odd' : ''}">${x}</td>`).join('')}</tr></table>`; };
  const pmatrix = (M) => `\\begin{pmatrix}${M.map((r) => r.join('&')).join('\\\\')}\\end{pmatrix}`;

  // ---------- Generadores de grafos ----------
  const genExist = () => {
    const kind = pick(['existe', 'existe', 'impar', 'excede', 'forzado']);
    const n = rnd(5, 7);
    if (kind === 'existe') {
      const g = G.randomGraph(n, 0.5, false); const d = G.degrees(g);
      const order = [...d.keys()].sort((a, b) => d[a] - d[b]);
      const seq = order.map((i) => d[i]);
      return { enun: `¿Existe un grafo <b>simple</b> con ${n} vértices cuyos grados sean $${seq.join(', ')}$? Si existe, dibújalo.`,
        sol: `<ol><li>Suma de grados: $${seq.join('+')} = ${seq.reduce((a, b) => a + b, 0)}$, <b>par</b> ⇒ tendría $|E| = ${seq.reduce((a, b) => a + b, 0) / 2}$ aristas. ✓</li><li>Grado máximo $${Math.max(...seq)} \\le n-1 = ${n - 1}$. ✓</li><li>Lo construimos (un ejemplo):</li></ol>${fig(g, { width: 260, height: 220 })}${degTable(g)}<p class="ans">Sí existe.</p>` };
    }
    if (kind === 'impar') {
      let seq; do { seq = Array.from({ length: n }, () => rnd(1, n - 1)).sort((a, b) => a - b); } while (seq.reduce((a, b) => a + b, 0) % 2 === 0);
      const s = seq.reduce((a, b) => a + b, 0), odd = seq.filter((x) => x % 2).length;
      return { enun: `¿Existe un grafo con ${n} vértices de grados $${seq.join(', ')}$?`,
        sol: `Suma de grados $= ${seq.join('+')} = ${s}$, que es <b>impar</b>. Por el lema del apretón de manos la suma debe ser $2|E|$ (par). Equivalentemente, habría ${odd} vértices de grado impar (cantidad impar). <p class="ans">No existe (ni siquiera como multigrafo).</p>` };
    }
    if (kind === 'excede') {
      let seq; do { seq = Array.from({ length: n - 1 }, () => rnd(1, n - 2)); seq.push(n); seq.sort((a, b) => a - b); } while (seq.reduce((a, b) => a + b, 0) % 2);
      return { enun: `¿Existe un grafo <b>simple</b> con ${n} vértices de grados $${seq.join(', ')}$?`,
        sol: `La suma es $${seq.reduce((a, b) => a + b, 0)}$ (par), pero en un grafo simple con $n=${n}$ vértices cada vértice puede ser adyacente como máximo a los otros $n-1 = ${n - 1}$. Un vértice de grado $${n}$ necesitaría aristas paralelas o bucles. <p class="ans">No existe como grafo simple.</p>` };
    }
    // forzado: k vértices de grado n-1 y alguno con grado < k
    const k = 2; let seq;
    do { seq = [n - 1, n - 1, 1, ...Array.from({ length: n - 3 }, () => rnd(2, n - 2))].sort((a, b) => a - b); } while (seq.reduce((a, b) => a + b, 0) % 2);
    return { enun: `¿Existe un grafo <b>simple</b> con ${n} vértices de grados $${seq.join(', ')}$?`,
      sol: `<ol><li>Suma $= ${seq.reduce((a, b) => a + b, 0)}$, par ✓. Grado máximo $${n - 1} = n-1$ ✓. Las pruebas rápidas no bastan.</li><li>Hay <b>${k} vértices de grado $n-1=${n - 1}$</b>: cada uno es adyacente a <u>todos</u> los demás.</li><li>Entonces cada uno de los otros vértices es adyacente al menos a esos ${k}, así que tiene grado $\\ge ${k}$.</li><li>Pero hay un vértice de grado 1. <b>Contradicción.</b></li></ol><p class="ans">No existe como grafo simple (como en el ejercicio de clase $1,1,3,3$).</p>` };
  };

  const genFamily = () => {
    const fam = pick(['K', 'C', 'W', 'Q', 'Kmn', 'reg', 'comp']);
    let enun, sol;
    if (fam === 'K') { const n = rnd(4, 12); enun = `Para $K_{${n}}$: número de vértices, aristas, grado de cada vértice. ¿Tiene ciclo euleriano?`;
      sol = `$|V| = ${n}$, $|E| = \\frac{${n}\\cdot${n - 1}}{2} = ${(n * (n - 1)) / 2}$, cada vértice tiene grado $n-1 = ${n - 1}$. Es conexo y el grado ${n - 1} es ${(n - 1) % 2 ? '<b>impar</b> ⇒ hay $' + n + '$ vértices impares ⇒ <b>no</b> tiene ciclo (ni camino) euleriano' : '<b>par</b> ⇒ <b>sí</b> tiene ciclo euleriano'}.`; }
    if (fam === 'C') { const n = rnd(3, 12); enun = `Para $C_{${n}}$: vértices, aristas y grados. ¿Es bipartito?`;
      sol = `$|V| = |E| = ${n}$, todos de grado 2. $C_n$ es bipartito $\\iff n$ par: ${n % 2 ? `<b>no</b> lo es (ciclo impar).` : `<b>sí</b> (alternando colores: posiciones impares / pares).`}`; }
    if (fam === 'W') { const n = rnd(5, 12); enun = `Para la rueda $W_{${n}}$ (<b>convención de clase</b>: $n$ vértices en total): vértices, aristas y grados. ¿Tiene ciclo euleriano?`;
      sol = `$W_{${n}} = C_{${n - 1}}$ + centro. $|V| = ${n}$, $|E| = 2(n-1) = ${2 * (n - 1)}$ (${n - 1} del ciclo + ${n - 1} rayos). Centro: grado $${n - 1}$; los otros $${n - 1}$ vértices: grado 3. Hay al menos $${n - 1}$ vértices de grado impar ⇒ <b>no</b> tiene ciclo ni camino euleriano.<br><i>Ojo:</i> con la convención de Rosen ($C_{${n}}$ + centro) tendría $${n + 1}$ vértices y $${2 * n}$ aristas.`; }
    if (fam === 'Q') { const n = rnd(2, 6); enun = `Para el hipercubo $Q_{${n}}$: vértices, aristas y grado de cada vértice.`;
      sol = `$|V| = 2^{${n}} = ${2 ** n}$; es $${n}$-regular, así que $|E| = \\frac{${n}\\cdot 2^{${n}}}{2} = ${n}\\cdot 2^{${n - 1}} = ${n * 2 ** (n - 1)}$. Cada vértice tiene grado $${n}$ (se puede cambiar cualquiera de sus ${n} bits).`; }
    if (fam === 'Kmn') { const m = rnd(1, 6), n = rnd(2, 7); enun = `Para $K_{${m},${n}}$: vértices, aristas y grados. ¿Tiene ciclo hamiltoniano?`;
      sol = `$|V| = ${m}+${n} = ${m + n}$, $|E| = ${m}\\cdot${n} = ${m * n}$. Los ${m} vértices de un lado tienen grado $${n}$; los ${n} del otro, grado $${m}$. ${m === n ? `Como $m=n=${m}$${m >= 2 ? ', sí: alternando lados $u_1w_1u_2w_2\\cdots u_' + m + 'w_' + m + 'u_1$ (también por Dirac: grado ' + m + ' $\\ge$ ' + m + ')' : ''}.` : `Como $${m}\\neq${n}$, <b>no</b>: un ciclo en un bipartito alterna lados y necesita igual cantidad de vértices en cada lado.`}`; }
    if (fam === 'reg') { let n, k; do { n = rnd(5, 14); k = rnd(2, n - 1); } while ((n * k) % 2); enun = `Un grafo ${k}-regular tiene ${n} vértices. ¿Cuántas aristas tiene?`;
      sol = `Por el apretón de manos: $2|E| = ${n}\\cdot${k} = ${n * k}$ ⇒ $|E| = ${(n * k) / 2}$.`; }
    if (fam === 'comp') { const n = rnd(5, 9), m = rnd(n - 1, (n * (n - 1)) / 2 - 2); enun = `Un grafo simple tiene ${n} vértices y ${m} aristas. ¿Cuántas aristas tiene su complemento? Si un vértice tiene grado 2 en $G$, ¿qué grado tiene en $\\overline G$?`;
      sol = `$K_{${n}}$ tiene $\\frac{${n}\\cdot${n - 1}}2 = ${(n * (n - 1)) / 2}$ aristas ⇒ $|E(\\overline G)| = ${(n * (n - 1)) / 2} - ${m} = ${(n * (n - 1)) / 2 - m}$. Grado en el complemento: $(n-1) - 2 = ${n - 3}$.`; }
    return { enun, sol };
  };

  const genEuler = () => {
    const want = pick(['ciclo', 'camino', 'ninguno']);
    let g, e;
    for (let t = 0; t < 2000; t++) { g = G.randomGraph(rnd(5, 7), 0.5, true); e = G.euler(g); if (e.type === want) break; }
    const oddL = e.odd.map((i) => L(g, i));
    let sol = `${degTable(g)}<ol><li>¿Conexo? <b>Sí</b> (desde cualquier vértice se alcanzan todos).</li><li>Vértices de grado impar: ${oddL.length ? `$${oddL.join(', ')}$ ⇒ <b>${oddL.length}</b>` : '<b>ninguno</b>'}.</li>`;
    if (e.type === 'ciclo') sol += `<li>Conexo y todos los grados pares ⇒ <b>tiene ciclo euleriano</b> (y por tanto camino).</li></ol>Un ciclo euleriano: $${G.seqStr(g, e.trail).replace(/→/g, '\\to')}$ (usa las ${g.edges.length} aristas una vez).`;
    else if (e.type === 'camino') sol += `<li>Conexo y exactamente 2 vértices impares ⇒ <b>tiene camino euleriano</b> que empieza en $${oddL[0]}$ y termina en $${oddL[1]}$; <b>no</b> tiene ciclo euleriano.</li></ol>Un camino: $${G.seqStr(g, e.trail).replace(/→/g, '\\to')}$.`;
    else sol += `<li>Hay ${oddL.length} vértices de grado impar (más de 2) ⇒ <b>ni camino ni ciclo euleriano</b>.</li></ol>`;
    return { enun: `Determina si el grafo tiene camino o ciclo euleriano. Si existe, escríbelo.${fig(g, { width: 260, height: 220 })}`,
      sol: (e.trail ? fig(g, { width: 240, height: 200, hi: new Set(g.edges.map((_, i) => i)), hiColor: 'var(--good)' }) : '') + sol };
  };

  // Argumentos simples para negar ciclo hamiltoniano
  const hamNoArgument = (g) => {
    const n = G.n(g), d = G.degrees(g), A = G.adj(g);
    const v1 = d.findIndex((x) => x <= 1);
    if (v1 >= 0) return `El vértice $${L(g, v1)}$ tiene grado ${d[v1]}: en un ciclo hamiltoniano cada vértice necesita 2 aristas (proposición del subgrafo $H$). <b>No hay ciclo hamiltoniano.</b>`;
    const forced = new Set();
    d.forEach((x, v) => { if (x === 2) A[v].forEach(({ k }) => forced.add(k)); });
    const fdeg = Array(n).fill(0); [...forced].forEach((k) => { fdeg[g.edges[k][0]]++; fdeg[g.edges[k][1]]++; });
    const deg2 = d.map((x, i) => (x === 2 ? L(g, i) : null)).filter(Boolean);
    const over = fdeg.findIndex((x) => x > 2);
    const forcedTxt = () => `Los vértices de grado 2 (${deg2.map((x) => `$${x}$`).join(', ')}) obligan a usar sus dos aristas: ${[...forced].map((k) => `$${G.edgeStr(g, g.edges[k])}$`).join(', ')}.`;
    if (over >= 0) return { text: `${forcedTxt()} Entonces $${L(g, over)}$ tendría ${fdeg[over]} aristas en el ciclo, pero en $H$ cada vértice tiene grado 2. <b>Contradicción: no hay ciclo hamiltoniano.</b>`, hi: forced };
    // ciclo prematuro con aristas forzadas
    const sub = { labels: g.labels, edges: [...forced].map((k) => g.edges[k]) };
    const comps = G.components(sub, true);
    for (const c of comps) {
      const m = sub.edges.filter(([u]) => c.includes(u)).length;
      if (m === c.length && c.length < n) return { text: `${forcedTxt()} Estas aristas ya cierran el ciclo $${setStr(g, c)}$ que no pasa por todos los vértices. <b>No hay ciclo hamiltoniano.</b>`, hi: forced };
    }
    const b = G.bipartite(g);
    if (b.ok && G.isConnected(g)) { const s0 = b.colors.filter((x) => x === 0).length; if (s0 * 2 !== n) return `El grafo es bipartito con lados de tamaños ${s0} y ${n - s0}. Un ciclo alterna lados, así que necesitaría lados iguales. <b>No hay ciclo hamiltoniano.</b>`; }
    return null;
  };
  const genHam = () => {
    const want = pick(['dirac', 'ore', 'buscar', 'no', 'no']);
    for (let t = 0; t < 4000; t++) {
      const n = rnd(5, 7);
      const g = G.randomGraph(n, want === 'dirac' ? 0.75 : want === 'ore' ? 0.62 : want === 'no' ? 0.38 : 0.5, true);
      const h = G.hamilton(g), dir = G.dirac(g), ore = G.ore(g), d = G.degrees(g);
      const intro = `${degTable(g)}$n = ${n}$, $\\frac n2 = ${n / 2}$.`;
      if (want === 'dirac' && dir) return { g, h, sol: `${intro}<br>Todos los grados son $\\ge ${n / 2}$ ⇒ por <b>Dirac</b> tiene ciclo hamiltoniano. Uno: $${G.seqStr(g, h).replace(/→/g, '\\to')}$.` };
      if (want === 'ore' && !dir && ore.ok) {
        const pairs = []; for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (!G.hasEdge(g, u, v)) pairs.push(`\\{${L(g, u)},${L(g, v)}\\}: ${d[u]}+${d[v]} = ${d[u] + d[v]}`);
        return { g, h, sol: `${intro}<br>Dirac <b>no</b> aplica (hay grados $< ${n / 2}$). Pares no adyacentes: $${pairs.join(';\\ ')}$, todos $\\ge ${n}$ ⇒ por <b>Ore</b> tiene ciclo hamiltoniano. Uno: $${G.seqStr(g, h).replace(/→/g, '\\to')}$.` };
      }
      if (want === 'buscar' && h && !ore.ok) return { g, h, sol: `${intro}<br>No cumple Dirac ni Ore (p. ej. $\\{${L(g, ore.fails[0][0])},${L(g, ore.fails[0][1])}\\}$ no adyacentes con suma $${d[ore.fails[0][0]] + d[ore.fails[0][1]]} < ${n}$), así que <u>no se concluye nada</u> con ellos: hay que <b>buscar</b> el ciclo. Lo encontramos: $${G.seqStr(g, h).replace(/→/g, '\\to')}$ ⇒ <b>sí</b> es hamiltoniano.` };
      if (want === 'no' && !h) {
        const arg = hamNoArgument(g);
        if (arg) { const txt = typeof arg === 'string' ? arg : arg.text; return { g, h: null, hi: arg.hi, sol: `${intro}<br>${txt}` }; }
      }
    }
    return genHam();
  };

  const layouts = {
    6: { labels: ['a', 'b', 'c', 'd', 'e', 'z'], pos: [[0, 50], [33, 5], [33, 95], [67, 5], [67, 95], [100, 50]], cand: [[0, 1], [0, 2], [1, 2], [1, 3], [1, 4], [2, 4], [2, 3], [3, 4], [3, 5], [4, 5]] },
    8: { labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'z'], pos: [[0, 50], [28, 5], [55, 5], [80, 5], [28, 95], [55, 95], [80, 95], [100, 50]], cand: [[0, 1], [0, 4], [1, 2], [2, 3], [3, 7], [4, 5], [5, 6], [6, 7], [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [4, 2], [5, 3]] },
  };
  const genDijkGraph = () => {
    const lay = layouts[pick([6, 6, 8])];
    for (;;) {
      const edges = lay.cand.filter(() => Math.random() < 0.78).map(([u, v]) => [u, v, rnd(1, 9)]);
      const g = { labels: lay.labels, pos: lay.pos, edges };
      if (G.isConnected(g) && !G.hasEdge(g, 0, lay.labels.length - 1)) return g;
    }
  };
  const dijkTable = (g, r, s, t) => {
    const n = G.n(g);
    let h = `<div class="scroll"><table class="tbl small dij"><thead><tr><th>Paso</th><th>Permanente</th>${g.labels.map((l) => `<th>${l}</th>`).join('')}</tr></thead><tbody>`;
    h += `<tr><td>0</td><td>—</td>${g.labels.map((_, i) => `<td>${i === s ? '(0, –)' : '∞'}</td>`).join('')}</tr>`;
    const last = r.steps.findIndex((x) => x.u === t);
    r.steps.slice(0, last + 1).forEach((st, k) => {
      h += `<tr><td>${k + 1}</td><td><b>${L(g, st.u)}</b></td>`;
      for (let i = 0; i < n; i++) {
        const lab = st.d[i] === Infinity ? '∞' : `(${st.d[i]}, ${st.prev[i] < 0 ? '–' : L(g, st.prev[i])})`;
        const cls = i === st.u ? 'perm-now' : st.perm[i] ? 'perm' : st.updated.includes(i) ? 'upd' : '';
        h += `<td class="${cls}">${st.perm[i] && i !== st.u ? '✓' : lab}</td>`;
      }
      h += '</tr>';
    });
    return h + '</tbody></table></div><p class="legend"><span class="perm-now">celda</span> = se hace permanente en ese paso · <span class="upd">celda</span> = etiqueta actualizada · ✓ = ya permanente</p>';
  };
  const dijkSolution = (g, s, t) => {
    const r = G.dijkstra(g, s);
    const stepsUntil = r.steps.slice(0, r.steps.findIndex((x) => x.u === t) + 1);
    const p = G.pathTo(r.prev, t);
    const detail = stepsUntil.map((st, k) => {
      const nb = G.adj(g)[st.u].filter(({ v }) => !r.steps.slice(0, k).some((x) => x.u === v));
      const upd = nb.map(({ v, w }) => { const old = k === 0 ? Infinity : (r.steps[k - 1].d[v]); const cand = st.d[st.u] + w; return `$${L(g, v)}$: $${st.d[st.u]}+${w} = ${cand}$ ${cand < old ? `$<$ ${old === Infinity ? '$\\infty$' : old} ⇒ <b>(${cand}, ${L(g, st.u)})</b>` : `$\\ge$ ${old} ⇒ se mantiene`}`; });
      return `<li><b>${L(g, st.u)}</b> pasa a permanente con $d=${st.d[st.u]}$.${upd.length ? ' Actualizamos vecinos temporales: ' + upd.join('; ') + '.' : ''}</li>`;
    }).join('');
    return `${dijkTable(g, r, s, t)}<ol class="steps">${detail}</ol>Reconstruyendo hacia atrás desde $${L(g, t)}$ con los vértices anteriores: <p class="ans">Camino más corto: $${G.seqStr(g, p).replace(/→/g, '\\to')}$, longitud $${r.d[t]}$.</p>${fig(g, { width: 330, height: 210, hi: G.edgeIndexSet(g, p), nodeNote: Object.fromEntries(r.d.map((d, i) => [i, d])) })}`;
  };
  const genDijk = () => { const g = genDijkGraph(); const t = G.n(g) - 1; return { enun: `Usando el algoritmo de Dijkstra, halla el camino más corto de $a$ a $z$. Indica la tabla de etiquetas $(d_{\\min}, v_i)$ paso a paso. <span class="conv">Convención: en empates se elige primero el vértice que va antes alfabéticamente.</span>${fig(g, { width: 330, height: 210 })}`, sol: dijkSolution(g, 0, t) }; };

  const genMatrix = () => {
    const n = rnd(4, 5); const g = G.randomGraph(n, 0.55, true);
    const A = G.adjMatrix(g), A2 = G.matMul(A, A), A3 = G.matMul(A2, A);
    const i = rnd(0, n - 1); let j = rnd(0, n - 1); if (j === i) j = (i + 1) % n;
    const k = pick([2, 3]); const Ak = k === 2 ? A2 : A3;
    // listar trayectorias
    const adj = G.adj(g).map((l) => l.map((e) => e.v)); const walks = [];
    const go = (p) => { if (p.length === k + 1) { if (p[k] === j) walks.push(p.map((x) => L(g, x)).join('')); return; } adj[p[p.length - 1]].forEach((v) => go([...p, v])); };
    go([i]);
    const tr = A2.reduce((s, r, q) => s + r[q], 0);
    return { enun: `Con el orden $${g.labels.join(',')}$: escribe la matriz de adyacencia $A$, calcula $A^${k}$ y responde: ¿cuántas trayectorias de longitud ${k} hay de $${L(g, i)}$ a $${L(g, j)}$? Usa $\\operatorname{traza}(A^2)$ para hallar $|E|$.${fig(g, { width: 230, height: 190 })}`,
      sol: `$$A = ${pmatrix(A)},\\quad A^2 = ${pmatrix(A2)}${k === 3 ? `,\\quad A^3 = ${pmatrix(A3)}` : ''}$$<ul><li>$(A^${k})_{${L(g, i)},${L(g, j)}} = ${Ak[i][j]}$ ⇒ hay <b>${Ak[i][j]}</b> trayectorias de longitud ${k}${walks.length ? ': ' + walks.map((w) => `$${w}$`).join(', ') : ''}.</li><li>Diagonal de $A^2$: $${A2.map((r, q) => r[q]).join(', ')}$ = grados. $\\operatorname{traza}(A^2) = ${tr} = 2|E|$ ⇒ $|E| = ${tr / 2}$ ✓ (hay ${g.edges.length} aristas).</li></ul>` };
  };

  const triangles = (g) => { const M = G.adjMatrix(g), n = G.n(g); let t = 0; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) if (M[a][b] && M[b][c] && M[a][c]) t++; return t; };
  const genIso = () => {
    for (;;) {
      const n = rnd(5, 6); const g = G.randomGraph(n, 0.5, true);
      const iso = Math.random() < 0.5;
      let h;
      const nums = Array.from({ length: n }, (_, i) => `${i + 1}`);
      if (iso) { const perm = shuffle([...Array(n).keys()]); h = { labels: nums, edges: g.edges.map(([u, v]) => [perm[u], perm[v]]), pos: G.circlePos(n) }; }
      else { // mover una arista
        const e = g.edges.map((x) => x.slice()); const k = rnd(0, e.length - 1); let u, v;
        do { u = rnd(0, n - 1); v = rnd(0, n - 1); } while (u === v || e.some(([a, b]) => (a === u && b === v) || (a === v && b === u)));
        e[k] = [u, v]; const perm = shuffle([...Array(n).keys()]); h = { labels: nums, edges: e.map(([a, b]) => [perm[a], perm[b]]), pos: G.circlePos(n) };
      }
      const f = G.isomorphism(g, h);
      if (iso !== !!f) continue;
      const sg = G.degrees(g).sort((a, b) => a - b), sh = G.degrees(h).sort((a, b) => a - b);
      const cg = G.components(g).length, ch = G.components(h).length, tg = triangles(g), th = triangles(h);
      let sol = `<table class="tbl small"><tr><th>Invariante</th><th>$G$</th><th>$H$</th></tr><tr><td>vértices</td><td>${n}</td><td>${n}</td></tr><tr><td>aristas</td><td>${g.edges.length}</td><td>${h.edges.length}</td></tr><tr><td>score</td><td>$(${sg.join(',')})$</td><td>$(${sh.join(',')})$</td></tr><tr><td>componentes</td><td>${cg}</td><td>${ch}</td></tr><tr><td>triángulos ($C_3$)</td><td>${tg}</td><td>${th}</td></tr></table>`;
      if (f) {
        const dg = G.degrees(g);
        sol += `Todos los invariantes coinciden. Construimos $f$ emparejando vértices del mismo grado: $$${g.labels.map((l, i) => `f(${l}) = ${h.labels[f[i]]}`).join(',\\ ')}$$ Verificación arista por arista: ${g.edges.map(([u, v]) => `$${L(g, u)}${L(g, v)} \\mapsto ${h.labels[f[u]]}${h.labels[f[v]]}$ ✓`).join(', ')}. Como $f$ es biyectiva y lleva las ${g.edges.length} aristas de $G$ en las ${h.edges.length} de $H$: <p class="ans">Son isomorfos.</p>`;
        void dg;
      } else {
        let why;
        if (sg.join() !== sh.join()) why = 'Los <b>scores son distintos</b>';
        else if (cg !== ch) why = 'Tienen distinto número de <b>componentes</b>';
        else if (tg !== th) why = `Tienen distinto número de <b>triángulos</b> (${tg} vs. ${th}); un isomorfismo lleva triángulos en triángulos`;
        else continue; // sin argumento sencillo: generar otro
        sol += `${why} ⇒ <p class="ans">No son isomorfos.</p>`;
      }
      return { enun: `¿Son isomorfos $G$ y $H$? Justifica.<div class="figrow">${fig(g, { width: 220, height: 190, cap: '$G$' })}${fig(h, { width: 220, height: 190, cap: '$H$' })}</div>`, sol };
    }
  };

  const genBip = () => {
    const want = Math.random() < 0.5;
    for (;;) {
      const g = G.randomGraph(rnd(5, 7), 0.45, true); const b = G.bipartite(g);
      if (b.ok !== want) continue;
      if (b.ok) { const V1 = [], V2 = []; b.colors.forEach((c, i) => (c ? V2 : V1).push(i)); const complete = V1.length * V2.length === g.edges.length;
        return { enun: `¿Es bipartito el grafo? Si lo es, indica $V_1$ y $V_2$; ¿es bipartito completo?${fig(g, { width: 240, height: 200 })}`,
          sol: `Coloreamos alternando dos colores desde $${L(g, 0)}$, propagando la regla «vecino ⇒ color contrario»:${fig(g, { width: 240, height: 200, nodeFill: Object.fromEntries(b.colors.map((c, i) => [i, c ? 'var(--c2)' : 'var(--c1)'])) })}Ninguna arista une dos vértices del mismo color. <p class="ans">Sí: $V_1 = ${setStr(g, V1)}$, $V_2 = ${setStr(g, V2)}$. ${complete ? `Además es completo: $K_{${V1.length},${V2.length}}$ ($${V1.length}\\cdot${V2.length} = ${g.edges.length}$ aristas).` : `No es bipartito completo: tendría $${V1.length}\\cdot${V2.length} = ${V1.length * V2.length}$ aristas y tiene ${g.edges.length}.`}</p>` }; }
      const cyc = b.oddCycle;
      return { enun: `¿Es bipartito el grafo? Justifica.${fig(g, { width: 240, height: 200 })}`,
        sol: `Buscamos un ciclo de longitud impar: $${[...cyc, cyc[0]].map((i) => L(g, i)).join('\\,')}$ tiene longitud <b>${cyc.length}</b> (impar).${fig(g, { width: 240, height: 200, hi: G.edgeIndexSet(g, [...cyc, cyc[0]]), hiColor: 'var(--bad)' })}Bipartito $\\iff$ sin ciclos impares. <p class="ans">No es bipartito.</p>` };
    }
  };

  // ---------- Recurrencias ----------
  const genStrings = () => {
    const s = R.gen.strings();
    const cases = []; for (let i = 0; i < s.k; i++) cases.push(`<li>Empieza con <b>${s.c.repeat(i)}${s.other}</b>: lo que sigue (${i + 1 === 1 ? '$n-1$' : `$n-${i + 1}$`} bits) es cualquier cadena válida ⇒ $a_{n-${i + 1}}$.</li>`);
    const N = s.k + 2;
    return { enun: `Sea $a_n$ el número de cadenas de $n$ bits que <b>no contienen</b> el patrón <code>${s.pat}</code>. Halla una relación de recurrencia y las condiciones iniciales. Calcula $a_{${N}}$.`,
      sol: `Clasificamos según cómo <b>empieza</b> la cadena (casos excluyentes y exhaustivos; no puede empezar con <code>${s.pat}</code>):<ol>${cases.join('')}</ol>Por el principio de la suma: $$a_n = ${Array.from({ length: s.k }, (_, i) => `a_{n-${i + 1}}`).join(' + ')},\\quad n\\ge ${s.k + 1}.$$ Condiciones iniciales: ${s.init.map((v, i) => `$a_{${i + 1}} = ${v}$`).join(', ')} (${s.k === 2 ? 'con 2 bits solo se excluye ' : 'con 3 bits solo se excluye '}<code>${s.pat}</code>; las cadenas más cortas son todas válidas).<br>Términos: ${s.seq.slice(0, N).map((v, i) => `$a_{${i + 1}}=${v}$`).join(', ')}. <p class="ans">$a_{${N}} = ${s.seq[N - 1]}$ (verificado contando las $2^{${N}}$ cadenas: ${s.brute[N - 1]}).</p>` };
  };
  const recBlock = (r, extra = '') => {
    const sol = R.solveRec(r), v = R.verifyTable(r, sol, 6);
    return { enun: `Resuelve $${R.recTex(r)}$, para $n\\ge ${r.i0 + r.order}$, con ${r.order === 1 ? `$a_{${r.i0}} = ${r.a0}$` : `$a_{${r.i0}} = ${r.a0}$ y $a_{${r.i0 + 1}} = ${r.a1}$`}.`,
      sol: `${extra}${sol.steps.map((s) => `<p>${s}</p>`).join('')}<p><b>Comprobación</b> (siempre conviene hacerla en el examen con 2–3 valores):</p>${v.html}` };
  };
  const genFirst = () => {
    const r = R.gen.first();
    let extra = '';
    if (r.p === 1) {
      const sg = (x, body, first) => (x === 0 ? '' : (x < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ') + (Math.abs(x) === 1 && body ? '' : Math.abs(x)) + body);
      const fTex = (sg(r.b0, '', true) + sg(r.b1, 'i', r.b0 === 0)) || '0';
      const res = `${r.a0}` + sg(r.b0, 'n', false) + sg(r.b1, '\\cdot\\frac{n(n+1)}{2}', false);
      extra = `<p><b>Método 1 (iteración, como en clase):</b> $a_1 = a_0 + f(1),\\ a_2 = a_0 + f(1) + f(2),\\dots$ ⇒ $a_n = a_0 + \\sum_{i=1}^{n} (${fTex}) = ${res}$.</p><p><b>Método 2 (ecuación característica + particular):</b></p>`;
    }
    return recBlock(r, extra);
  };

  const RECIPES = [
    { id: 'existencia', unit: 'Grafos', title: '¿Existe un grafo con estos grados?', when: 'Te dan una lista de grados (y a veces «simple») y preguntan si existe o piden dibujarlo.',
      steps: ['Suma los grados. Si es <b>impar</b> ⇒ no existe (apretón de manos). Si es par, $|E| = \\text{suma}/2$.', 'Si dice <b>simple</b>: ningún grado puede superar $n-1$.', 'Si hay $k$ vértices de grado $n-1$, todos los demás tienen grado $\\ge k$ (están unidos a ellos).', 'Si pasa las pruebas, <b>constrúyelo</b> (empieza por el vértice de mayor grado) o construye su complemento (grados $n-1-d$) cuando es más fácil.', 'Dibuja el grafo final y verifica el grado de cada vértice en una tabla.'],
      traps: ['Decir «sí existe» solo porque la suma es par (contraejemplo de clase: $1,1,3,3$ simple).', 'Olvidar que en multigrafos sí se permiten aristas paralelas: la pregunta dice qué tipo de grafo.', 'No mostrar la construcción: «existe» se justifica dibujando uno.'],
      gen: genExist },
    { id: 'familias', unit: 'Grafos', title: 'Contar vértices/aristas en familias y complemento', when: 'Preguntas de cálculo directo sobre $K_n$, $C_n$, $W_n$, $Q_n$, $K_{m,n}$, $k$-regulares, complemento.',
      steps: ['Identifica la familia y <b>la convención</b> (en $W_n$: $n$ vértices en total).', 'Aplica la fórmula de $|V|$ y $|E|$ (ver Formulario).', 'Para grados: $K_n\\to n-1$; $C_n\\to2$; $Q_n\\to n$; $W_n$: centro $n-1$ y resto 3.', 'Si preguntan Euler/bipartito/Hamilton, encadena con el criterio correspondiente.'],
      traps: ['Confundir $W_n$ de clase con el de Rosen.', 'En $Q_n$: $|E| = n2^{n-1}$, no $n2^n$.', 'Complemento: $\\frac{n(n-1)}2 - |E|$, no $n^2 - |E|$.'],
      gen: genFamily },
    { id: 'euler', unit: 'Grafos', title: 'Camino / ciclo euleriano', when: '«¿Se puede recorrer cada arista una sola vez?», «dibujar sin levantar el lápiz», «borrar aristas para que tenga camino euleriano».',
      steps: ['Verifica que sea <b>conexo</b> (ignorando vértices aislados).', 'Haz una <b>tabla de grados</b> y cuenta los impares.', '0 impares ⇒ ciclo; 2 impares ⇒ camino (empieza en un impar y termina en el otro); 4+ ⇒ ninguno.', 'Si existe, escríbelo explícitamente y verifica que usaste todas las aristas una vez.', '<b>Para «borrar $k$ aristas»:</b> cada arista borrada cambia la paridad de sus 2 extremos. Empareja los vértices impares con aristas entre ellos y bórralas, comprobando que el grafo siga conexo.'],
      traps: ['Confundir con Hamilton (vértices).', 'Olvidar verificar la conexidad.', 'Empezar el camino en un vértice par cuando hay 2 impares.'],
      gen: genEuler },
    { id: 'hamilton', unit: 'Grafos', title: 'Camino / ciclo hamiltoniano', when: '«¿Tiene ciclo/camino hamiltoniano?», «demuestre que no tiene ciclo hamiltoniano», problema del viajero.',
      steps: ['Para <b>afirmar</b>: prueba Dirac ($\\operatorname{grad}\\ge n/2$) u Ore (pares no adyacentes con suma $\\ge n$). Si no aplican, <b>busca</b> el ciclo y escríbelo.', 'Para <b>negar</b>: usa la proposición del subgrafo $H$ (todo vértice con grado exactamente 2 en el ciclo).', 'Marca aristas <b>forzadas</b>: las de vértices de grado 2.', 'Busca una contradicción: vértice con 3+ aristas forzadas, ciclo cerrado prematuro, vértice de grado 1, o $K_{m,n}$/bipartito con lados distintos.', 'Si hace falta, razona <b>por casos</b> sobre un vértice clave (qué 2 de sus aristas usa) y usa simetría.'],
      traps: ['Concluir «no es hamiltoniano» porque no cumple Dirac/Ore (son solo suficientes).', 'Olvidar que un ciclo hamiltoniano no necesita usar todas las aristas.', 'En el viajero, olvidar contar las rutas inversas o el regreso al inicio.'],
      gen: () => { const x = genHam(); return { enun: `¿El grafo tiene ciclo hamiltoniano? Justifica.${fig(x.g, { width: 260, height: 220 })}`, sol: (x.h ? fig(x.g, { width: 240, height: 200, hi: G.edgeIndexSet(x.g, x.h), hiColor: 'var(--good)' }) : x.hi ? fig(x.g, { width: 240, height: 200, hi: x.hi, hiColor: 'var(--bad)' }) : '') + x.sol }; } },
    { id: 'dijkstra', unit: 'Grafos', title: 'Algoritmo de Dijkstra (camino más corto)', when: '«Halle el camino más corto de $a$ a $z$», «distancias desde $A$ a todos». <b>Reemplaza a las preguntas de BFS</b> de exámenes pasados.',
      steps: ['Etiqueta el inicial con $(0,-)$ y los demás con $\\infty$.', 'Elige el vértice <b>temporal</b> con menor $d_{\\min}$ y hazlo <b>permanente</b>.', 'Para cada vecino temporal $v$ del nuevo permanente $u$: si $d(u)+w(uv) < d(v)$, cambia la etiqueta de $v$ a $(d(u)+w(uv),\\ u)$.', 'Repite hasta que el destino sea permanente (o todos, si piden «a todos»).', 'Reconstruye el camino <b>hacia atrás</b> con los vértices anteriores y da la longitud total.'],
      traps: ['Elegir el siguiente vértice por el peso de la arista y no por la distancia acumulada.', 'Actualizar vértices ya permanentes.', 'En digrafos, usar aristas en sentido contrario.', 'No mostrar la tabla: en el examen se pide «indique con cuidado los pasos».'],
      gen: genDijk },
    { id: 'matrices', unit: 'Grafos', title: 'Matriz de adyacencia y trayectorias de longitud $k$', when: 'Te piden $A$, $A^2$, $A^3$, número de trayectorias o número de aristas desde la matriz.',
      steps: ['Fija y <b>escribe el orden</b> de los vértices.', 'Arma $A$ (simétrica, diagonal 0 si es simple).', 'Multiplica: $(A^2)_{ij} = \\sum_k a_{ik}a_{kj}$.', '$(A^k)_{ij}$ = trayectorias de longitud $k$; enuméralas si son pocas para comprobar.', '$\\operatorname{traza}(A^2) = 2|E|$.'],
      traps: ['Contar caminos (sin repetir) en vez de trayectorias.', 'Olvidar que con bucle $a_{ii}=1$ pero aporta 2 al grado.'],
      gen: genMatrix },
    { id: 'iso', unit: 'Grafos', title: 'Isomorfismo', when: '«¿Son isomorfos $G$ y $H$?»',
      steps: ['Compara invariantes: vértices, aristas, score, componentes, ciclos de cada longitud (triángulos…).', 'Si alguno difiere ⇒ <b>no son isomorfos</b> (di cuál).', 'Si todos coinciden, construye $f$ emparejando vértices del mismo grado (y con vecinos de los mismos grados).', 'Verifica <b>todas</b> las aristas: $uv\\in E(G) \\iff f(u)f(v)\\in E(H)$.'],
      traps: ['Decir «son isomorfos» porque el score coincide.', 'Dar $f$ sin verificar las aristas.'],
      gen: genIso },
    { id: 'bipartito', unit: 'Grafos', title: '¿Es bipartito?', when: '«¿Es bipartito?», «indique los conjuntos $V_1$, $V_2$».',
      steps: ['Colorea un vértice con color 1; sus vecinos con color 2; los vecinos de estos con color 1…', 'Si una arista une dos del mismo color ⇒ hay un ciclo impar ⇒ no es bipartito (muestra el ciclo).', 'Si no, da $V_1$ y $V_2$.', '¿Completo? Debe tener $|V_1|\\cdot|V_2|$ aristas.'],
      traps: ['Basta un triángulo para negar.', 'Un grafo sin ciclos impares sí es bipartito aunque «no lo parezca» en el dibujo.'],
      gen: genBip },
    { id: 'modelar', unit: 'Recurrencias', title: 'Plantear una recurrencia (cadenas de bits)', when: '«Sea $a_n$ el número de cadenas de $n$ bits que no contienen…»',
      steps: ['Divide en casos según cómo <b>empieza</b> la cadena.', 'En cada caso identifica qué parte queda libre y que sea «una cadena válida más corta».', 'Suma los casos (principio de la suma).', 'Calcula las condiciones iniciales contando a mano (tantas como el orden).', 'Comprueba un término extra contando directamente.'],
      traps: ['Casos que se solapan o no cubren todo.', 'Dar menos condiciones iniciales que el orden de la recurrencia.', 'Olvidar que si empieza con «11» (sin 111) el siguiente bit es forzosamente 0.'],
      gen: genStrings },
    { id: 'rec1', unit: 'Recurrencias', title: 'Recurrencias de primer orden', when: '$a_n = c\\,a_{n-1} + f(n)$.',
      steps: ['Si $f=0$: $a_n = a_0\\,c^n$.', 'Si $c=1$: itera, $a_n = a_0 + \\sum f(i)$, y usa sumas conocidas.', 'Si no: homogénea $A\\,c^n$ + particular según $f(n)$ (compara $s$ con la raíz $c$).', 'Aplica la condición inicial a la solución completa y comprueba 2 valores.'],
      traps: ['Índice de inicio: si la condición es $a_1$, la suma o el exponente se ajustan.', 'Si $s = c$, la particular lleva un factor $n$.'],
      gen: genFirst },
    { id: 'rec2', unit: 'Recurrencias', title: 'Segundo orden homogénea', when: '$a_n = p\\,a_{n-1} + q\\,a_{n-2}$ con dos condiciones iniciales.',
      steps: ['Ecuación característica $r^2 - pr - q = 0$.', 'Raíces: distintas, doble o complejas.', 'Forma general según el caso (doble ⇒ $(A+Bn)r^n$; complejas ⇒ $\\rho^n(C\\cos n\\theta + D\\sin n\\theta)$).', 'Sistema 2×2 con las condiciones iniciales.', 'Respuesta y comprobación.'],
      traps: ['Signos al pasar a la ecuación característica.', 'Raíz doble sin el factor $n$.', 'Ángulo $\\theta$ mal calculado (usa el argumento de $a+bi$).'],
      gen: () => recBlock(R.gen.secondHom()) },
    { id: 'recnh', unit: 'Recurrencias', title: 'No homogénea (solución particular)', when: '$a_n = p\\,a_{n-1} + q\\,a_{n-2} + f(n)$ con $f(n) = (\\text{polinomio})\\cdot s^n$.',
      steps: ['Resuelve la homogénea asociada (raíces y $a^{(h)}$).', 'Escribe $f(n) = (b_0 + b_1n+\\dots)s^n$ e identifica $s$ ($s=1$ si es solo polinomio).', '¿$s$ es raíz? Si sí, de multiplicidad $m$, multiplica la propuesta por $n^m$.', 'Sustituye $a^{(p)}$ en la recurrencia e iguala coeficientes para hallar los $B_i$.', '$a_n = a^{(h)} + a^{(p)}$; recién ahora usa las condiciones iniciales.', 'Comprueba con 2–3 términos.'],
      traps: ['No multiplicar por $n^m$ cuando $s$ es raíz.', 'Proponer solo $Bn$ para $f(n)=3n$ (falta $B_0$).', 'Aplicar condiciones iniciales a $a^{(h)}$ sola.'],
      gen: () => recBlock(R.gen.secondNonHom()) },
  ];

  const FIXED = {
    dijkstra: () => ({ enun: `<b>Ejemplo de clase.</b> Usando el algoritmo de Dijkstra, halla el camino más corto de $a$ a $z$.${fig(G.fixed.dijkClase, { width: 330, height: 210 })}`, sol: dijkSolution(G.fixed.dijkClase, 0, 5) }),
    rec2: () => recBlock({ order: 2, p: 4, q: -4, b0: 0, b1: 0, s: 1, a0: 1, a1: 3, i0: 0 }, '<p><i>Ejemplo 10 de clase.</i></p>'),
    recnh: () => recBlock({ order: 2, p: 1, q: 6, b0: 1, b1: 0, s: 2, a0: 0, a1: 1, i0: 0 }, '<p><i>Ejemplo 4 de Recurrencia 2.</i></p>'),
    rec1: () => recBlock({ order: 1, p: 3, q: 0, b0: 0, b1: 2, s: 1, a0: 3, i0: 1 }, '<p><i>Ejemplo 6 de Recurrencia 2.</i></p>'),
  };

  const GUIDES = `
    <div class="card"><h3>Cómo responder un caso (pregunta de desarrollo)</h3>
    <p>Los exámenes del curso dicen: <b>«Es muy importante que justifique todas sus respuestas»</b> e «indique con cuidado los pasos». Estructura recomendada:</p>
    <ol><li><b>Datos y lo que piden.</b> Reescribe en una línea qué te dan (grafo, pesos, grados, recurrencia, condiciones iniciales) y qué te piden.</li>
    <li><b>Herramienta.</b> Nombra el teorema, criterio o algoritmo: «Por el lema del apretón de manos…», «Por el teorema de Euler…», «Por Dirac…», «Aplicamos Dijkstra desde $a$…», «Ecuación característica…».</li>
    <li><b>Verifica hipótesis.</b> Euler: conexo. Dirac/Ore: simple y $n\\ge3$. Dijkstra: pesos positivos. Recurrencia: lineal con coeficientes constantes.</li>
    <li><b>Desarrollo visible.</b> Tabla de grados, tabla de etiquetas de Dijkstra, sistema de ecuaciones para constantes. Dibuja el grafo y marca lo que usas (camino, árbol, aristas forzadas).</li>
    <li><b>Conclusión explícita</b> en una frase: «Por lo tanto, $G$ no tiene ciclo hamiltoniano», «La longitud mínima es 16 por $a\\to b\\to d\\to z$».</li>
    <li><b>Comprobación</b> rápida: sumar los grados otra vez, recalcular la longitud del camino, evaluar la fórmula en $n=0,1,2$.</li></ol>
    <p><b>Para «demuestre que NO…»</b>: no basta con «no lo encontré». Necesitas un argumento general (paridad, proposición del subgrafo $H$, contradicción por casos). <b>Para «¿existe…?»</b> con respuesta sí: muestra un ejemplo concreto. <b>Para «encuentre dos que no sean isomorfos»</b>: dibújalos y señala el invariante que los distingue.</p></div>
    <div class="card"><h3>Estrategia para preguntas de marcar</h3>
    <ul><li><b>Palabras clave que cambian todo:</b> «simple», «conexo», «dirigido», «camino» vs. «trayectoria», «ciclo» vs. «camino», «siempre», «solo si», «convención de clase» ($W_n$).</li>
    <li><b>Euler ↔ aristas, Hamilton ↔ vértices.</b> Si la opción habla de «todas las aristas una vez» es Euler.</li>
    <li><b>Descarta con números:</b> calcula $|E|$ por apretón de manos o la fórmula de la familia antes de leer las opciones; los distractores suelen ser $2|E|$ (olvidar dividir), $n$ (vértices en vez de aristas) o la convención de otro libro.</li>
    <li><b>Condiciones suficientes vs. necesarias:</b> «no cumple Dirac ⇒ no es hamiltoniano» es <u>falso</u>. «Mismo score ⇒ isomorfos» es <u>falso</u>.</li>
    <li><b>Recurrencias:</b> sustituye $n=0,1,2$ en cada opción y compara con los términos que da la recurrencia: descarta en segundos.</li>
    <li><b>Absolutos</b> («siempre», «nunca», «todo grafo») suelen ser falsos: busca un contraejemplo pequeño ($K_4$, $C_5$, $K_{1,3}$, dos triángulos).</li></ul></div>`;

  window.RESOLVER = { RECIPES, FIXED, GUIDES, dijkSolution, genDijkGraph };
})();
