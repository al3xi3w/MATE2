/* ===== Motor de grafos: estructura, algoritmos y dibujo SVG =====
   Un grafo es: { labels:[...], edges:[[i,j,w?]], directed?:bool, pos?:[[x,y]] }
   (posiciones en un lienzo 0..100 x 0..100) */
(function () {
  const GR = {};
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = rnd(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  GR.rnd = rnd; GR.shuffle = shuffle;
  GR.pick = (arr) => arr[rnd(0, arr.length - 1)];

  GR.letters = (n) => 'abcdefghijklmnopqrstuvwxyz'.slice(0, n).split('');
  GR.circlePos = (n, r = 38, cx = 50, cy = 50, rot = -Math.PI / 2) =>
    Array.from({ length: n }, (_, i) => [cx + r * Math.cos(rot + (2 * Math.PI * i) / n), cy + r * Math.sin(rot + (2 * Math.PI * i) / n)]);

  GR.n = (g) => g.labels.length;
  GR.adj = (g) => {
    const A = Array.from({ length: GR.n(g) }, () => []);
    g.edges.forEach(([u, v, w], k) => { A[u].push({ v, w: w ?? 1, k }); if (!g.directed) A[v].push({ v: u, w: w ?? 1, k }); });
    return A;
  };
  GR.hasEdge = (g, u, v) => g.edges.some(([a, b]) => (a === u && b === v) || (!g.directed && a === v && b === u));
  GR.degrees = (g) => {
    const d = Array(GR.n(g)).fill(0);
    g.edges.forEach(([u, v]) => { d[u]++; d[v]++; });
    return d;
  };
  GR.components = (g, ignoreIsolated = false) => {
    const A = GR.adj({ ...g, directed: false }), n = GR.n(g), seen = Array(n).fill(false), comps = [];
    for (let s = 0; s < n; s++) {
      if (seen[s]) continue;
      if (ignoreIsolated && A[s].length === 0) { seen[s] = true; continue; }
      const st = [s], c = []; seen[s] = true;
      while (st.length) { const u = st.pop(); c.push(u); A[u].forEach(({ v }) => { if (!seen[v]) { seen[v] = true; st.push(v); } }); }
      comps.push(c.sort((a, b) => a - b));
    }
    return comps;
  };
  GR.isConnected = (g) => GR.components(g).length === 1;

  GR.bipartite = (g) => {
    const n = GR.n(g), A = GR.adj(g), col = Array(n).fill(-1), par = Array(n).fill(-1);
    for (let s = 0; s < n; s++) {
      if (col[s] !== -1) continue;
      col[s] = 0; const q = [s];
      while (q.length) {
        const u = q.shift();
        for (const { v } of A[u]) {
          if (col[v] === -1) { col[v] = 1 - col[u]; par[v] = u; q.push(v); }
          else if (col[v] === col[u]) {
            // reconstruir ciclo impar
            const pu = [u], pv = [v];
            let a = u, b = v;
            const anc = new Set([u]); while (par[a] !== -1) { a = par[a]; pu.push(a); anc.add(a); }
            while (!anc.has(b)) { b = par[b]; pv.push(b); }
            const lca = b; const cyc = pu.slice(0, pu.indexOf(lca) + 1).concat(pv.slice(0, pv.length - 1).reverse());
            return { ok: false, oddCycle: cyc };
          }
        }
      }
    }
    return { ok: true, colors: col };
  };

  // Euler: clasificación + recorrido (Hierholzer)
  GR.euler = (g) => {
    const d = GR.degrees(g), odd = d.map((x, i) => (x % 2 ? i : -1)).filter((x) => x >= 0);
    const conn = GR.components(g, true).length <= 1 && g.edges.length > 0;
    let type = 'ninguno';
    if (conn && odd.length === 0) type = 'ciclo';
    else if (conn && odd.length === 2) type = 'camino';
    let trail = null;
    if (type !== 'ninguno') {
      const start = type === 'camino' ? odd[0] : g.edges[0][0];
      const A = GR.adj(g), used = Array(g.edges.length).fill(false), ptr = Array(GR.n(g)).fill(0);
      const st = [start], out = [];
      while (st.length) {
        const u = st[st.length - 1];
        while (ptr[u] < A[u].length && used[A[u][ptr[u]].k]) ptr[u]++;
        if (ptr[u] === A[u].length) out.push(st.pop());
        else { const e = A[u][ptr[u]]; used[e.k] = true; st.push(e.v); }
      }
      trail = out.reverse();
    }
    return { degrees: d, odd, connected: conn, type, trail };
  };

  // Hamilton por búsqueda exhaustiva (grafos pequeños)
  GR.hamilton = (g, cycle = true) => {
    const n = GR.n(g), A = GR.adj(g).map((l) => l.map((e) => e.v));
    const path = [], seen = Array(n).fill(false);
    const go = (u) => {
      if (path.length === n) return !cycle || A[u].includes(path[0]);
      for (const v of A[u]) if (!seen[v]) { seen[v] = true; path.push(v); if (go(v)) return true; path.pop(); seen[v] = false; }
      return false;
    };
    const starts = cycle ? [0] : [...Array(n).keys()];
    for (const s of starts) { path.length = 0; seen.fill(false); seen[s] = true; path.push(s); if (go(s)) return cycle ? [...path, path[0]] : [...path]; }
    return null;
  };
  GR.dirac = (g) => { const n = GR.n(g), d = GR.degrees(g); return n >= 3 && d.every((x) => x >= n / 2); };
  GR.ore = (g) => {
    const n = GR.n(g), d = GR.degrees(g), fails = [];
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (!GR.hasEdge(g, u, v) && d[u] + d[v] < n) fails.push([u, v]);
    return { ok: n >= 3 && fails.length === 0, fails };
  };

  // Dijkstra con tabla de etiquetas (d_min, v_i) como en clase.
  // Empates: se elige el vértice que aparece primero en la lista de vértices.
  GR.dijkstra = (g, s) => {
    const n = GR.n(g), A = GR.adj(g);
    const d = Array(n).fill(Infinity), prev = Array(n).fill(-1), perm = Array(n).fill(false);
    d[s] = 0; const steps = [];
    for (let it = 0; it < n; it++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!perm[i] && d[i] < Infinity && (u === -1 || d[i] < d[u])) u = i;
      if (u === -1) break;
      perm[u] = true;
      const updated = [];
      for (const { v, w } of A[u]) if (!perm[v] && d[u] + w < d[v]) { d[v] = d[u] + w; prev[v] = u; updated.push(v); }
      steps.push({ u, d: d.slice(), prev: prev.slice(), perm: perm.slice(), updated });
    }
    return { d, prev, steps };
  };
  GR.pathTo = (prev, t) => { const p = [t]; while (prev[p[0]] !== -1) p.unshift(prev[p[0]]); return p; };

  GR.adjMatrix = (g) => {
    const n = GR.n(g), M = Array.from({ length: n }, () => Array(n).fill(0));
    g.edges.forEach(([u, v]) => { M[u][v]++; if (!g.directed && u !== v) M[v][u]++; });
    return M;
  };
  GR.matMul = (X, Y) => X.map((r) => Y[0].map((_, j) => r.reduce((s, x, k) => s + x * Y[k][j], 0)));
  GR.complement = (g) => {
    const n = GR.n(g), e = [];
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (!GR.hasEdge(g, u, v)) e.push([u, v]);
    return { labels: g.labels, edges: e, pos: g.pos };
  };

  // Isomorfismo (fuerza bruta, n <= 7)
  GR.isomorphism = (g, h) => {
    const n = GR.n(g);
    if (n !== GR.n(h) || g.edges.length !== h.edges.length) return null;
    const dg = GR.degrees(g), dh = GR.degrees(h);
    const Mg = GR.adjMatrix(g), Mh = GR.adjMatrix(h), f = Array(n).fill(-1), used = Array(n).fill(false);
    const go = (i) => {
      if (i === n) return true;
      for (let j = 0; j < n; j++) {
        if (used[j] || dg[i] !== dh[j]) continue;
        let ok = true;
        for (let k = 0; k < i; k++) if (Mg[i][k] !== Mh[j][f[k]]) { ok = false; break; }
        if (!ok) continue;
        f[i] = j; used[j] = true; if (go(i + 1)) return true; used[j] = false; f[i] = -1;
      }
      return false;
    };
    return go(0) ? f.slice() : null;
  };

  GR.randomGraph = (n, p = 0.45, connected = true) => {
    for (let t = 0; t < 500; t++) {
      const e = [];
      for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (Math.random() < p) e.push([u, v]);
      const g = { labels: GR.letters(n), edges: e, pos: GR.circlePos(n) };
      if (!connected || GR.isConnected(g)) return g;
    }
    return { labels: GR.letters(n), edges: Array.from({ length: n }, (_, i) => [i, (i + 1) % n]), pos: GR.circlePos(n) };
  };

  // ---------- Dibujo SVG ----------
  // opts: { hi: Set de índices de aristas resaltadas, hiColor, nodeFill:{i:color}, nodeNote:{i:texto}, size, edgeLabels:true }
  GR.svg = (g, opts = {}) => {
    const n = GR.n(g), pos = g.pos || GR.circlePos(n);
    const W = opts.width || 320, H = opts.height || 260, pad = 26;
    const X = (x) => pad + (x / 100) * (W - 2 * pad), Y = (y) => pad + (y / 100) * (H - 2 * pad);
    const hi = opts.hi || new Set(), hiColor = opts.hiColor || 'var(--accent)';
    const r = opts.r || 11;
    let s = `<svg class="gsvg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${opts.aria || 'grafo'}">`;
    if (g.directed) s += `<defs><marker id="arr${opts.uid || ''}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)"/></marker><marker id="arrh${opts.uid || ''}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${hiColor}"/></marker></defs>`;
    const pairCount = {};
    g.edges.forEach(([u, v, w], k) => {
      const key = [Math.min(u, v), Math.max(u, v)].join('-');
      pairCount[key] = (pairCount[key] || 0) + 1;
      const idx = pairCount[key] - 1;
      const [x1, y1] = [X(pos[u][0]), Y(pos[u][1])], [x2, y2] = [X(pos[v][0]), Y(pos[v][1])];
      const isHi = hi.has(k);
      const stroke = isHi ? hiColor : 'var(--ink-3)', sw = isHi ? 3.6 : 1.8;
      if (u === v) { // bucle
        s += `<circle cx="${x1}" cy="${y1 - r - 9}" r="10" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
        return;
      }
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      // curvatura para aristas paralelas o arcos opuestos en digrafos
      const reverseExists = g.directed && g.edges.some(([a, b]) => a === v && b === u);
      let bend = 0;
      if (idx > 0) bend = (idx % 2 ? 1 : -1) * Math.ceil(idx / 2) * 22;
      if (reverseExists) bend = 16;
      const mx = (x1 + x2) / 2 - (dy / L) * bend, my = (y1 + y2) / 2 + (dx / L) * bend;
      // recortar en el borde del nodo para las flechas
      let ex = x2, ey = y2;
      if (g.directed) { const ddx = x2 - mx, ddy = y2 - my, dl = Math.hypot(ddx, ddy); ex = x2 - (ddx / dl) * (r + 2); ey = y2 - (ddy / dl) * (r + 2); }
      const marker = g.directed ? ` marker-end="url(#${isHi ? 'arrh' : 'arr'}${opts.uid || ''})"` : '';
      s += `<path d="M${x1},${y1} Q${mx},${my} ${ex},${ey}" fill="none" stroke="${stroke}" stroke-width="${sw}"${marker}/>`;
      if (w !== undefined && opts.edgeLabels !== false) {
        const lx = (x1 + 2 * mx + x2) / 4, ly = (y1 + 2 * my + y2) / 4;
        s += `<g class="wlab"><rect x="${lx - 9}" y="${ly - 8}" width="18" height="15" rx="4"/><text x="${lx}" y="${ly + 4}" text-anchor="middle">${w}</text></g>`;
      }
    });
    for (let i = 0; i < n; i++) {
      const fill = (opts.nodeFill && opts.nodeFill[i]) || 'var(--node)';
      s += `<circle cx="${X(pos[i][0])}" cy="${Y(pos[i][1])}" r="${r}" fill="${fill}" stroke="var(--ink-2)" stroke-width="1.4"/>`;
      s += `<text x="${X(pos[i][0])}" y="${Y(pos[i][1]) + 4}" text-anchor="middle" class="nlab">${g.labels[i]}</text>`;
      if (opts.nodeNote && opts.nodeNote[i] !== undefined) {
        const above = pos[i][1] < 50;
        s += `<text x="${X(pos[i][0])}" y="${Y(pos[i][1]) + (above ? -r - 5 : r + 14)}" text-anchor="middle" class="nnote">${opts.nodeNote[i]}</text>`;
      }
    }
    return s + '</svg>';
  };

  GR.edgeIndexSet = (g, seq, closed = false) => {
    const set = new Set();
    for (let i = 0; i + 1 < seq.length; i++) {
      const [a, b] = [seq[i], seq[i + 1]];
      const k = g.edges.findIndex(([u, v], idx) => !set.has(idx) && ((u === a && v === b) || (!g.directed && u === b && v === a)));
      if (k >= 0) set.add(k);
    }
    return set;
  };
  GR.seqStr = (g, seq) => seq.map((i) => g.labels[i]).join(' → ');
  GR.edgeStr = (g, [u, v]) => g.labels[u] + g.labels[v];

  // ---------- Grafos fijos de clase y exámenes ----------
  GR.fixed = {
    // Diapositiva Dijkstra (Epp): vértice inicial a, final z
    dijkClase: { labels: ['a', 'b', 'c', 'd', 'e', 'z'], pos: [[0, 50], [30, 5], [30, 95], [72, 5], [72, 95], [100, 50]],
      edges: [[0, 1, 3], [0, 2, 4], [1, 3, 6], [1, 4, 5], [2, 4, 6], [3, 4, 2], [3, 5, 7], [4, 5, 12]] },
    dijkClase2: { labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'z'], pos: [[0, 50], [28, 5], [52, 5], [76, 5], [28, 95], [52, 95], [76, 95], [100, 50]],
      edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 7, 20], [1, 5, 7], [2, 6, 8], [0, 4, 4], [4, 5, 1], [5, 6, 1], [6, 7, 1]] },
    dijkAK: { labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      pos: [[55, 0], [22, 12], [50, 25], [82, 30], [52, 45], [95, 50], [5, 50], [30, 65], [72, 72], [10, 85], [45, 98]],
      edges: [[0, 1, 4], [0, 3, 6], [1, 6, 4], [2, 3, 1], [2, 6, 6], [2, 4, 3], [2, 5, 7], [4, 7, 2], [4, 5, 2], [6, 7, 5], [7, 8, 3], [5, 8, 2], [7, 9, 3], [9, 8, 5], [9, 10, 4], [8, 10, 5]] },
    dijkDir: { labels: ['A', 'B', 'C', 'D', 'E'], directed: true, pos: [[0, 50], [45, 5], [45, 95], [100, 5], [100, 95]],
      edges: [[0, 1, 10], [0, 2, 3], [1, 2, 1], [2, 1, 4], [1, 3, 2], [2, 3, 8], [2, 4, 2], [3, 4, 7], [4, 3, 9]] },
    // Examen 2021-2 s1, P4 (sin ciclo hamiltoniano)
    hamExam: (() => {
      const P = GR.circlePos(6, 48, 50, 50, -Math.PI / 2), Q = GR.circlePos(6, 27, 50, 50, -Math.PI / 2);
      // orden interior: I1(arriba), P(der-arriba), I3, Q(abajo), I5, R(izq-arriba)
      const inner = [Q[0], [72, 37], Q[2], [50, 77], Q[4], [28, 37]];
      const labels = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'i1', 'P', 'i3', 'Q', 'i5', 'R', 'M', 'X', 'Y', 'C'];
      const pos = [...P, ...inner, [50, 37], [38, 58], [62, 58], [50, 50]];
      const e = [];
      for (let i = 0; i < 6; i++) { e.push([i, (i + 1) % 6]); e.push([6 + i, 6 + ((i + 1) % 6)]); e.push([i, 6 + i]); }
      e.push([11, 12], [12, 7], [11, 13], [13, 9], [7, 14], [14, 9], [15, 12], [15, 13], [15, 14]);
      return { labels, pos, edges: e };
    })(),
  };

  window.GR = GR;
})();
