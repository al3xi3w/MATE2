/* ===== Recurrencias: fracciones exactas, solucionador y generador de ejemplos ===== */
(function () {
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  class F {
    constructor(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); this.n = n / g; this.d = d / g; }
    static of(x) { return x instanceof F ? x : new F(x, 1); }
    add(o) { o = F.of(o); return new F(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = F.of(o); return new F(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = F.of(o); return new F(this.n * o.n, this.d * o.d); }
    div(o) { o = F.of(o); return new F(this.n * o.d, this.d * o.n); }
    neg() { return new F(-this.n, this.d); }
    isZero() { return this.n === 0; }
    eq(o) { o = F.of(o); return this.n === o.n && this.d === o.d; }
    tex() { return this.d === 1 ? `${this.n}` : `${this.n < 0 ? '-' : ''}\\tfrac{${Math.abs(this.n)}}{${this.d}}`; }
    num() { return this.n / this.d; }
  }
  // Gauss con fracciones: M x = b
  const solve = (M, b) => {
    const n = M.length, A = M.map((r, i) => [...r.map(F.of), F.of(b[i])]);
    for (let c = 0; c < n; c++) {
      let p = c; while (p < n && A[p][c].isZero()) p++;
      if (p === n) return null;
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < n; r++) if (r !== c && !A[r][c].isZero()) {
        const f = A[r][c].div(A[c][c]);
        for (let k = c; k <= n; k++) A[r][k] = A[r][k].sub(f.mul(A[c][k]));
      }
    }
    return A.map((r, i) => r[n].div(r[i]));
  };
  const pow = (b, e) => { let r = new F(1); for (let i = 0; i < e; i++) r = r.mul(b); return r; };

  // ---------- Formato LaTeX ----------
  const sgnTerm = (coef, body, first) => { // coef: F, body: string (puede ser '')
    if (coef.isZero()) return '';
    const neg = coef.n < 0, abs = neg ? coef.neg() : coef;
    let c = abs.eq(1) && body ? '' : abs.tex();
    const s = (first ? (neg ? '-' : '') : (neg ? ' - ' : ' + ')) + c + (c && body ? (/^[\d(]/.test(body) ? '\\cdot ' : '\\,') : '') + body;
    return s;
  };
  const sum = (terms) => { let out = '', first = true; for (const [c, b] of terms) { const t = sgnTerm(F.of(c), b, first); if (t) { out += t; first = false; } } return out || '0'; };
  const powTex = (s) => (s < 0 ? `(${s})^n` : `${s}^n`);
  const polyTex = (coefs) => sum(coefs.map((c, i) => [c, i === 0 ? '' : i === 1 ? 'n' : `n^{${i}}`]));

  // Recurrencia: a_n = p a_{n-1} + q a_{n-2} + (b0 + b1 n) s^n   (orden 1 si q = 0 y order=1)
  const R = {};
  R.F = F; R.solve = solve;

  R.recTex = (r) => {
    const rhs = [];
    rhs.push([r.p, 'a_{n-1}']);
    if (r.order === 2) rhs.push([r.q, 'a_{n-2}']);
    let t = sum(rhs);
    const fz = r.b0 === 0 && r.b1 === 0;
    if (!fz) {
      const poly = polyTex([r.b0, r.b1]);
      const needPar = r.b0 !== 0 && r.b1 !== 0;
      let f;
      if (r.s === 1) f = poly;
      else f = (needPar ? `(${poly})\\cdot ` : poly === '1' ? '' : poly === '-1' ? '-' : poly + '\\cdot ') + powTex(r.s);
      t += (f.startsWith('-') ? ' - ' + f.slice(1) : ' + ' + f);
    }
    return `a_n = ${t}`;
  };
  R.f = (r, n) => new F(r.b0 + r.b1 * n).mul(pow(new F(r.s), n));
  R.terms = (r, N) => {
    const a = [F.of(r.a0)]; if (r.order === 2) a.push(F.of(r.a1));
    for (let n = a.length; n < N; n++) {
      let v = F.of(r.p).mul(a[n - 1]).add(R.f(r, n + r.i0));
      if (r.order === 2) v = v.add(F.of(r.q).mul(a[n - 2]));
      a.push(v);
    }
    return a;
  };

  // Resolver: raíces enteras (o complejas especiales); devuelve pasos en LaTeX y función de evaluación
  R.solveRec = (r) => {
    const steps = [];
    const order = r.order;
    // raíces
    let roots; // [{r, m}] reales enteras
    if (order === 1) roots = [{ r: r.p, m: 1 }];
    else {
      const disc = r.p * r.p + 4 * r.q;
      if (disc < 0) return R.solveComplex(r);
      const sq = Math.round(Math.sqrt(disc));
      const r1 = (r.p + sq) / 2, r2 = (r.p - sq) / 2;
      roots = r1 === r2 ? [{ r: r1, m: 2 }] : [{ r: r1, m: 1 }, { r: r2, m: 1 }];
    }
    const charEq = (order === 1 ? sum([[1, 'r'], [-r.p, '']]) : sum([[1, 'r^2'], [-r.p, 'r'], [-r.q, '']])) + ' = 0';
    steps.push(`<b>1. Ecuación característica</b> (de la parte homogénea $a_n = ${sum(order === 1 ? [[r.p, 'a_{n-1}']] : [[r.p, 'a_{n-1}'], [r.q, 'a_{n-2}']])}$): $$${charEq}$$`);
    const rootsTex = roots.map((x) => (x.m === 2 ? `r = ${x.r}\\ \\text{(doble)}` : `r = ${x.r}`)).join(',\\quad ');
    steps.push(`<b>2. Raíces:</b> $${rootsTex}$.`);
    // forma homogénea
    const hBasis = []; // funciones n -> F, y tex
    roots.forEach((x) => { for (let k = 0; k < x.m; k++) hBasis.push({ tex: [k ? 'n' : '', x.r === 1 ? '' : powTex(x.r)].filter(Boolean).join('\\,'), f: (n) => F.of(n ** k).mul(pow(new F(x.r), n)) }); });
    const names = ['A', 'B'];
    steps.push(`<b>3. Solución homogénea:</b> $a_n^{(h)} = ${hBasis.map((b, i) => names[i] + (b.tex ? '\\,' + b.tex : '')).join(' + ')}$` + (roots.some((x) => x.m === 2) ? ' (raíz doble ⇒ se multiplica por $n$ el segundo término).' : '.'));
    // particular
    const fz = r.b0 === 0 && r.b1 === 0;
    let pBasis = [], pCoef = [];
    if (!fz) {
      const m = (roots.find((x) => x.r === r.s) || { m: 0 }).m;
      const deg = r.b1 !== 0 ? 1 : 0;
      for (let k = 0; k <= deg; k++) pBasis.push({ k: k + m, tex: [k + m === 0 ? '' : k + m === 1 ? 'n' : `n^{${k + m}}`, r.s === 1 ? '' : powTex(r.s)].filter(Boolean).join('\\,'), f: (n) => F.of(n ** (k + m)).mul(pow(new F(r.s), n)) });
      const unk = pBasis.map((_, i) => `B_${i}`);
      const formTex = (m ? (m === 1 ? 'n' : `n^{${m}}`) : '') + (deg ? `(B_0 + B_1 n)` : 'B_0') + (r.s === 1 ? '' : powTex(r.s));
      steps.push(`<b>4. Solución particular:</b> $f(n) = ${(() => { const pt = polyTex([r.b0, r.b1]); if (r.s === 1) return pt; const nb = r.b0 !== 0 && r.b1 !== 0; return (pt === '1' ? '' : nb ? `(${pt})\\cdot ` : pt + '\\cdot ') + powTex(r.s); })()}$, con $s = ${r.s}$. ` +
        (m ? `Como $s=${r.s}$ <u>es raíz</u> de multiplicidad ${m}, se multiplica por $n^{${m}}$: ` : `Como $s=${r.s}$ <u>no es raíz</u> de la ecuación característica: `) + `$$a_n^{(p)} = ${formTex.replace(/^1(?=\()/, '')}$$`);
      // plantear: P(n) - p P(n-1) - q P(n-2) = f(n) para varios n
      const Pn = (n) => pBasis.map((b) => b.f(n));
      const rows = [], rhs = [];
      for (let n = 2; n < 2 + pBasis.length; n++) {
        const row = Pn(n).map((v, i) => { let x = v.sub(F.of(r.p).mul(Pn(n - 1)[i])); if (order === 2) x = x.sub(F.of(r.q).mul(Pn(n - 2)[i])); return x; });
        rows.push(row); rhs.push(R.f(r, n));
      }
      pCoef = solve(rows, rhs);
      steps.push(`Sustituyendo en la recurrencia e igualando coeficientes: $${pCoef.map((c, i) => `${unk[i]} = ${c.tex()}`).join(',\\ ')}$. Entonces $$a_n^{(p)} = ${sum(pBasis.map((b, i) => [pCoef[i], b.tex]))}$$`);
    } else steps.push('<b>4.</b> Es homogénea: no hay solución particular.');
    // constantes
    const init = order === 1 ? [[r.i0, r.a0]] : [[r.i0, r.a0], [r.i0 + 1, r.a1]];
    const nb = hBasis.length;
    const P = (n) => pBasis.reduce((s, b, i) => s.add(pCoef[i].mul(b.f(n))), new F(0));
    const M = init.map(([n]) => hBasis.slice(0, nb).map((b) => b.f(n)));
    const bb = init.map(([n, v]) => F.of(v).sub(P(n)));
    const C = solve(M, bb);
    const eqs = init.map(([n, v]) => `a_{${n}} = ${v}:\\ ${sum(hBasis.map((b, i) => [b.f(n), names[i]]))}${fz ? '' : ' + ' + `(${P(n).tex()})`} = ${v}`);
    steps.push(`<b>5. Condiciones iniciales</b> en $a_n = a_n^{(h)}${fz ? '' : '+a_n^{(p)}'}$: $$\\begin{aligned}${eqs.join('\\\\')}\\end{aligned}$$ $\\Rightarrow ${C.map((c, i) => `${names[i]} = ${c.tex()}`).join(',\\ ')}$.`);
    const allTerms = [...hBasis.map((b, i) => [C[i], b.tex]), ...pBasis.map((b, i) => [pCoef[i], b.tex])];
    const finalTex = `a_n = ${sum(allTerms)}`;
    steps.push(`<b>6. Respuesta:</b> $$\\boxed{${finalTex}}$$`);
    const evalN = (n) => hBasis.reduce((s, b, i) => s.add(C[i].mul(b.f(n))), new F(0)).add(P(n));
    return { steps, finalTex, evalN };
  };

  // Raíces complejas: casos de clase (1±i, ±i, 1±√3 i)
  R.complexCases = {
    '1+i': { p: 2, q: -2, rho: '\\sqrt{2}', theta: '\\pi/4', rhoN: Math.SQRT2, th: Math.PI / 4, roots: '1 \\pm i' },
    'i': { p: 0, q: -1, rho: '1', theta: '\\pi/2', rhoN: 1, th: Math.PI / 2, roots: '\\pm i' },
    '1+√3i': { p: 2, q: -4, rho: '2', theta: '\\pi/3', rhoN: 2, th: Math.PI / 3, roots: '1 \\pm \\sqrt{3}\\, i' },
  };
  R.solveComplex = (r) => {
    const cs = Object.values(R.complexCases).find((c) => c.p === r.p && c.q === r.q);
    const steps = [];
    steps.push(`<b>1. Ecuación característica:</b> $$${sum([[1, 'r^2'], [-r.p, 'r'], [-r.q, '']])} = 0$$`);
    steps.push(`<b>2. Raíces complejas conjugadas:</b> $r = ${cs.roots}$. Módulo $\\rho = ${cs.rho}$, argumento $\\theta = ${cs.theta}$.`);
    steps.push(`<b>3. Forma general</b> (Moivre, como en clase con $C = A+B$, $D = (A-B)i$ reales): $$a_n = \\rho^n\\big(C\\cos(n\\theta) + D\\sin(n\\theta)\\big) = (${cs.rho})^n\\big(C\\cos(\\tfrac{n${cs.theta.replace('\\pi/', '\\pi}{')}}) + D\\sin(\\tfrac{n${cs.theta.replace('\\pi/', '\\pi}{')}})\\big)$$`);
    const C = r.a0;
    const Dnum = (r.a1 / cs.rhoN - C * Math.cos(cs.th)) / Math.sin(cs.th);
    let Dtex;
    if (cs.theta === '\\pi/3') { const k = r.a1 - r.a0; Dtex = k === 0 ? '0' : `\\tfrac{${k}}{\\sqrt{3}}`; }
    else Dtex = `${Math.round(Dnum)}`;
    steps.push(`<b>4. Condiciones iniciales:</b> $n=0$: $C = ${C}$. $n=1$: $${cs.rho}\\,(C\\cos ${cs.theta} + D\\sin ${cs.theta}) = ${r.a1} \\Rightarrow D = ${Dtex}$.`);
    const th = cs.theta.replace('\\pi/', '\\pi}{');
    let finalTex = `a_n = (${cs.rho})^n\\left(${C}\\cos\\tfrac{n${th}} ${Dtex.startsWith('-') ? '' : '+'} ${Dtex}\\sin\\tfrac{n${th}}\\right)`;
    finalTex = finalTex.replace('(1\\cos', '(\\cos').replace('+ 1\\sin', '+ \\sin').replace(/\(0\\cos\\tfrac\{[^}]*\}\{\d\} \+ /, '(').replace(/\+ 0\\sin\\tfrac\{[^}]*\}\{\d\}/, '');
    steps.push(`<b>5. Respuesta:</b> $$\\boxed{${finalTex}}$$`);
    const evalN = (n) => ({ num: () => cs.rhoN ** n * (C * Math.cos(n * cs.th) + Dnum * Math.sin(n * cs.th)), tex() { return Math.round(this.num()).toString(); } });
    return { steps, finalTex, evalN };
  };

  // Tabla de verificación: valores por recurrencia vs fórmula
  R.verifyTable = (r, sol, N = 6) => {
    const t = R.terms(r, N);
    let ok = true;
    const rows = t.map((v, k) => {
      const n = r.i0 + k, fv = sol.evalN(n);
      const good = Math.abs(fv.num() - v.num()) < 1e-6 * Math.max(1, Math.abs(v.num()));
      ok = ok && good;
      return `<tr><td>$${n}$</td><td>$${v.tex()}$</td><td>$${fv instanceof F ? fv.tex() : fv.tex()}$</td><td>${good ? '✓' : '✗'}</td></tr>`;
    });
    return { ok, html: `<table class="tbl small"><thead><tr><th>$n$</th><th>por recurrencia</th><th>por fórmula</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table>` };
  };

  // ---------- Generadores ----------
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[rnd(0, a.length - 1)];
  R.gen = {};
  // Primer orden homogénea o con f(n) polinómica/exponencial
  R.gen.first = () => {
    const kind = pick(['iter', 'iter', 'exp']);
    if (kind === 'iter') { // a_n = a_{n-1} + b0 + b1 n  (se resuelve iterando: sumas)
      return { order: 1, p: 1, q: 0, b0: rnd(-3, 4), b1: pick([1, 2, 3, 4, -2]), s: 1, a0: rnd(-3, 5), i0: 0 };
    }
    const p = pick([2, 3, -2, 4]);
    let s = pick([2, 3, -1, 5]); const same = Math.random() < 0.35; if (same) s = p;
    return { order: 1, p, q: 0, b0: pick([1, 2, 3, 5, -4]), b1: 0, s, a0: rnd(0, 5), i0: 0 };
  };
  R.gen.secondHom = () => {
    const kind = pick(['dist', 'dist', 'double', 'complex']);
    if (kind === 'complex') { const c = pick(Object.values(R.complexCases)); return { order: 2, p: c.p, q: c.q, b0: 0, b1: 0, s: 1, a0: rnd(0, 3), a1: rnd(0, 4), i0: 0 }; }
    let r1, r2;
    if (kind === 'double') { r1 = r2 = pick([2, 3, -2, -1, 4]); }
    else { do { r1 = pick([1, 2, 3, 4, 5, -1, -2, -3]); r2 = pick([1, 2, 3, -1, -2, -3, -4]); } while (r1 === r2); }
    return { order: 2, p: r1 + r2, q: -r1 * r2, b0: 0, b1: 0, s: 1, a0: rnd(0, 3), a1: rnd(-2, 6), i0: 0 };
  };
  R.gen.secondNonHom = () => {
    let r1, r2; const dbl = Math.random() < 0.3;
    if (dbl) r1 = r2 = pick([2, -2, 3]); else do { r1 = pick([1, 2, 3, -1, -2, 4]); r2 = pick([1, 2, 3, -1, -2, -3]); } while (r1 === r2);
    const kind = pick(['exp', 'exp', 'poly']);
    let s, b0, b1;
    if (kind === 'exp') { s = Math.random() < 0.45 ? pick([r1, r2]) : pick([2, 3, 5, -1].filter((x) => x !== r1 && x !== r2)); b0 = pick([1, 2, 3, 4, 6]); b1 = 0; }
    else { s = 1; b0 = rnd(-2, 4); b1 = pick([1, 2, -1, 3]); }
    if (s === undefined) s = 2;
    return { order: 2, p: r1 + r2, q: -r1 * r2, b0, b1, s, a0: rnd(0, 3), a1: rnd(0, 5), i0: 0 };
  };

  // Recurrencias de cadenas: no contienen k símbolos c consecutivos
  R.gen.strings = () => {
    const k = pick([2, 3]), c = pick(['0', '1']);
    const init = []; for (let i = 1; i <= k; i++) init.push(i < k ? 2 ** i : 2 ** k - 1);
    const pat = c.repeat(k);
    const count = (n) => { let t = 0; for (let x = 0; x < 2 ** n; x++) { const s = x.toString(2).padStart(n, '0'); if (!s.includes(pat)) t++; } return t; };
    const seq = []; for (let n = 1; n <= 8; n++) seq.push(n <= k ? init[n - 1] : seq.slice(-k).reduce((a, b) => a + b, 0));
    const brute = []; for (let n = 1; n <= 8; n++) brute.push(count(n));
    return { k, c, pat, init, seq, brute, other: c === '0' ? '1' : '0' };
  };

  window.REC = R;
})();
