/* ===== Editor interactivo de grafos + laboratorio + graficador de recurrencias ===== */
(function () {
  const G = window.GR;
  const W = 520, H = 340, PAD = 24;
  const NS = 'http://www.w3.org/2000/svg';

  class GraphEditor {
    constructor(root, opts = {}) {
      this.root = root; this.opts = opts; this.nodes = []; this.edges = []; this.sel = -1; this.hist = []; this.uid = Math.random().toString(36).slice(2, 7);
      root.innerHTML = `<div class="ed-bar">
          <span class="ed-help">Clic en vacío: vértice · clic en dos vértices: arista · arrastra para mover · clic en arista: borrarla</span>
          ${opts.weighted ? '<label class="ed-w">peso <input type="number" min="1" value="1" class="ed-weight"></label>' : ''}
          <button class="btn sm ed-undo" type="button">Deshacer</button>
          <button class="btn sm ed-del" type="button">Borrar vértice</button>
          <button class="btn sm ed-clear" type="button">Limpiar</button></div>
        <svg class="ed-svg" viewBox="0 0 ${W} ${H}" role="application" aria-label="lienzo para dibujar un grafo"></svg>`;
      this.svg = root.querySelector('svg');
      root.querySelector('.ed-undo').onclick = () => this.undo();
      root.querySelector('.ed-del').onclick = () => this.deleteSelected();
      root.querySelector('.ed-clear').onclick = () => { this.snap(); this.nodes = []; this.edges = []; this.sel = -1; this.render(); };
      this.svg.addEventListener('pointerdown', (e) => this.down(e));
      this.svg.addEventListener('pointermove', (e) => this.move(e));
      this.svg.addEventListener('pointerup', (e) => this.up(e));
      this.svg.addEventListener('pointerleave', () => { this.drag = null; });
      this.render();
    }
    snap() { this.hist.push(JSON.stringify({ n: this.nodes, e: this.edges })); if (this.hist.length > 60) this.hist.shift(); }
    undo() { const s = this.hist.pop(); if (!s) return; const o = JSON.parse(s); this.nodes = o.n; this.edges = o.e; this.sel = -1; this.render(); }
    pt(e) { const r = this.svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; }
    hitNode([x, y]) { for (let i = this.nodes.length - 1; i >= 0; i--) { const n = this.nodes[i]; if (Math.hypot(n.x - x, n.y - y) < 16) return i; } return -1; }
    nextLabel() { const used = new Set(this.nodes.map((n) => n.l)); for (const c of 'abcdefghijklmnopqrstuvwxyz') if (!used.has(c)) return c; return 'v' + this.nodes.length; }
    down(e) {
      const p = this.pt(e); const i = this.hitNode(p);
      if (e.target.dataset.edge !== undefined) { this.snap(); this.edges.splice(+e.target.dataset.edge, 1); this.render(); return; }
      this.drag = { i, start: p, moved: false };
      if (i >= 0) this.svg.setPointerCapture(e.pointerId);
    }
    move(e) {
      if (!this.drag || this.drag.i < 0) return;
      const p = this.pt(e);
      if (!this.drag.moved && Math.hypot(p[0] - this.drag.start[0], p[1] - this.drag.start[1]) > 4) { this.drag.moved = true; this.snap(); }
      if (this.drag.moved) { const n = this.nodes[this.drag.i]; n.x = Math.min(W - PAD, Math.max(PAD, p[0])); n.y = Math.min(H - PAD, Math.max(PAD, p[1])); this.render(false); }
    }
    up(e) {
      const d = this.drag; this.drag = null; if (!d) return;
      if (d.moved) { this.render(); return; }
      const p = this.pt(e);
      if (d.i < 0) { // vértice nuevo
        if (this.sel >= 0) { this.sel = -1; this.render(); return; }
        this.snap(); this.nodes.push({ x: p[0], y: p[1], l: this.nextLabel() }); this.render(); return;
      }
      if (this.sel < 0) { this.sel = d.i; this.render(); return; }
      if (this.sel === d.i) { this.sel = -1; this.render(); return; }
      const [u, v] = [this.sel, d.i];
      const k = this.edges.findIndex(([a, b]) => (a === u && b === v) || (a === v && b === u));
      this.snap();
      if (k >= 0) this.edges.splice(k, 1);
      else { const wi = this.root.querySelector('.ed-weight'); this.edges.push(this.opts.weighted ? [u, v, Math.max(1, parseInt(wi.value, 10) || 1)] : [u, v]); }
      this.sel = this.opts.chain ? d.i : -1; this.render();
    }
    deleteSelected() {
      if (this.sel < 0) return; this.snap(); const s = this.sel;
      this.edges = this.edges.filter(([a, b]) => a !== s && b !== s).map(([a, b, w]) => [a > s ? a - 1 : a, b > s ? b - 1 : b, w].filter((x) => x !== undefined));
      this.nodes.splice(s, 1); this.sel = -1; this.render();
    }
    graph() {
      return { labels: this.nodes.map((n) => n.l), edges: this.edges.map((e) => e.slice()),
        pos: this.nodes.map((n) => [((n.x - PAD) / (W - 2 * PAD)) * 100, ((n.y - PAD) / (H - 2 * PAD)) * 100]) };
    }
    load(gr) {
      this.snap(); const pos = gr.pos || G.circlePos(gr.labels.length);
      this.nodes = gr.labels.map((l, i) => ({ l, x: PAD + (pos[i][0] / 100) * (W - 2 * PAD), y: PAD + (pos[i][1] / 100) * (H - 2 * PAD) }));
      this.edges = gr.edges.map((e) => e.slice()); this.sel = -1; this.render();
    }
    render(notify = true) {
      let s = '';
      this.edges.forEach(([u, v, w], k) => {
        const a = this.nodes[u], b = this.nodes[v];
        s += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="ed-edge"/>`;
        s += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="ed-hit" data-edge="${k}"><title>clic para borrar</title></line>`;
        if (w !== undefined) { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; s += `<g class="wlab" pointer-events="none"><rect x="${mx - 10}" y="${my - 9}" width="20" height="16" rx="4"/><text x="${mx}" y="${my + 4}" text-anchor="middle">${w}</text></g>`; }
      });
      this.nodes.forEach((n, i) => {
        s += `<circle cx="${n.x}" cy="${n.y}" r="14" class="ed-node${i === this.sel ? ' sel' : ''}"/><text x="${n.x}" y="${n.y + 5}" text-anchor="middle" class="nlab" pointer-events="none">${n.l}</text>`;
      });
      if (!this.nodes.length) s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="ed-empty">Haz clic para crear el primer vértice</text>`;
      this.svg.innerHTML = s;
      if (notify && this.opts.onChange) this.opts.onChange(this.graph());
    }
  }

  // ---------- Análisis para el laboratorio ----------
  const analyze = (g) => {
    const n = G.n(g); if (!n) return '<p class="muted">Dibuja un grafo para ver su análisis.</p>';
    const d = G.degrees(g), comps = G.components(g), bip = G.bipartite(g), eu = G.euler(g);
    const L = (i) => g.labels[i];
    const rows = [];
    rows.push(['Vértices / aristas', `$|V| = ${n}$, $|E| = ${g.edges.length}$ &nbsp;(suma de grados $= ${d.reduce((a, b) => a + b, 0)} = 2|E|$ ✓)`]);
    rows.push(['Score', `$(${[...d].sort((a, b) => a - b).join(',')})$`]);
    rows.push(['Conexo', comps.length === 1 ? 'Sí' : `No: ${comps.length} componentes ${comps.map((c) => `$\\{${c.map(L).join(',')}\\}$`).join(' ')}`]);
    rows.push(['Bipartito', bip.ok ? `Sí: $V_1 = \\{${g.labels.filter((_, i) => bip.colors[i] === 0).join(',')}\\}$, $V_2 = \\{${g.labels.filter((_, i) => bip.colors[i] === 1).join(',')}\\}$` : `No: ciclo impar $${bip.oddCycle.map(L).join('')}$`]);
    rows.push(['Euler', `Impares: ${eu.odd.length ? '$' + eu.odd.map(L).join(',') + '$' : 'ninguno'} ⇒ ` + (eu.type === 'ciclo' ? `<b>ciclo euleriano</b>: $${eu.trail.map(L).join('')}$` : eu.type === 'camino' ? `<b>camino euleriano</b>: $${eu.trail.map(L).join('')}$` : '<b>ni camino ni ciclo</b>' + (comps.length > 1 ? ' (no es conexo)' : ''))]);
    if (n <= 11) {
      const hc = n >= 3 ? G.hamilton(g) : null, hp = G.hamilton(g, false);
      rows.push(['Hamilton', (hc ? `<b>ciclo</b>: $${hc.map(L).join('')}$` : '<b>sin ciclo</b>') + ' · ' + (hp ? `camino: $${hp.map(L).join('')}$` : 'sin camino') + ` · Dirac: ${G.dirac(g) ? 'se cumple' : 'no'} · Ore: ${G.ore(g).ok ? 'se cumple' : 'no'}`]);
    }
    const A = G.adjMatrix(g);
    rows.push(['Matriz de adyacencia', `orden $${g.labels.join(',')}$: $\\begin{pmatrix}${A.map((r) => r.join('&')).join('\\\\')}\\end{pmatrix}$`]);
    return `<table class="tbl an">${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</table>`;
  };

  // ---------- Graficador de recurrencias ----------
  const toJS = (expr) => {
    let s = String(expr).trim().replace(/\^/g, '**').replace(/π|pi/gi, 'PI').replace(/√/g, 'sqrt');
    s = s.replace(/(\d)\s*(?=[a-zA-Z(])/g, '$1*').replace(/\)\s*(?=[\da-zA-Z(])/g, ')*').replace(/\bn\s*\(/g, 'n*(');
    if (/[^0-9n+\-*/().,\s a-zA-Z_]/.test(s)) throw new Error('caracter no permitido');
    const words = s.match(/[a-zA-Z_]+/g) || [];
    const ok = new Set(['n', 'sqrt', 'cos', 'sin', 'tan', 'PI', 'abs', 'floor', 'round', 'exp', 'log', 'pow', 'fact']);
    words.forEach((w) => { if (!ok.has(w)) throw new Error(`«${w}» no reconocido`); });
    const fact = (k) => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };
    // eslint-disable-next-line no-new-func
    const fn = new Function('n', 'M', 'fact', `const {sqrt,cos,sin,tan,PI,abs,floor,round,exp,log,pow}=M; return (${s});`);
    return (n) => fn(n, Math, fact);
  };
  const plotSeq = (ns, rec, form) => {
    const all = [...rec, ...form.filter((x) => Number.isFinite(x))];
    let lo = Math.min(0, ...all), hi = Math.max(0, ...all); if (hi === lo) hi = lo + 1;
    const w = 520, h = 260, pl = 52, pr = 12, pt = 14, pb = 30;
    const X = (i) => pl + ((i + 0.5) / ns.length) * (w - pl - pr), Y = (v) => pt + ((hi - v) / (hi - lo)) * (h - pt - pb);
    const bw = Math.max(4, ((w - pl - pr) / ns.length) * 0.6);
    let s = `<svg viewBox="0 0 ${w} ${h}" class="plot" role="img" aria-label="gráfica de la sucesión">`;
    for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4; s += `<line x1="${pl}" x2="${w - pr}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" class="tick">${Math.abs(v) >= 1e5 ? v.toExponential(1) : +v.toFixed(2)}</text>`; }
    s += `<line x1="${pl}" x2="${w - pr}" y1="${Y(0)}" y2="${Y(0)}" class="axis"/>`;
    ns.forEach((n, i) => {
      const v = rec[i]; s += `<rect x="${X(i) - bw / 2}" y="${Math.min(Y(v), Y(0))}" width="${bw}" height="${Math.max(1, Math.abs(Y(v) - Y(0)))}" class="bar"><title>a_${n} = ${v}</title></rect>`;
      s += `<text x="${X(i)}" y="${h - 10}" text-anchor="middle" class="tick">${n}</text>`;
      if (Number.isFinite(form[i])) s += `<circle cx="${X(i)}" cy="${Y(form[i])}" r="4.5" class="dot"><title>fórmula(${n}) = ${form[i]}</title></circle>`;
    });
    return s + '</svg>';
  };

  window.EDITOR = { GraphEditor, analyze, toJS, plotSeq };
})();
