/* ===== App: pestañas, render, quizzes, práctica, simulacro, formulario ===== */
(function () {
  const G = window.GR, T = window.TEORIA, RS = window.RESOLVER, PR = window.PRACTICA, ED = window.EDITOR, R = window.REC;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mate2:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mate2:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };
  const tex = (el) => { if (window.renderMathInElement) window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false }); };
  const esc = (s) => s;

  // ================= TEORÍA =================
  const renderTeoria = (id) => {
    const view = $('#view');
    const topic = T.find((t) => t.id === id) || T[0];
    const scores = store.get('quiz', {});
    const units = [...new Set(T.map((t) => t.unit))];
    const quiz = topic.quiz.map((q) => ({ ...q, opts: G.shuffle([...q.opts]) }));
    view.innerHTML = `<div class="split"><nav class="side" aria-label="Temas">${units.map((u) => `<div class="side-h">${u}</div>${T.filter((t) => t.unit === u).map((t) => `<a href="#teoria/${t.id}" class="side-a${t.id === topic.id ? ' on' : ''}"><span>${t.title}</span>${scores[t.id] !== undefined ? `<span class="pill ${scores[t.id] === t.quiz.length ? 'ok' : ''}">${scores[t.id]}/${t.quiz.length}</span>` : ''}</a>`).join('')}`).join('')}</nav>
      <article class="main"><div class="crumb">${topic.unit} · <span class="src">Fuente: ${topic.src}</span></div><h2>${topic.title}</h2>${topic.html}
      <section class="quiz" id="quiz"><h3>Quiz del tema</h3><p class="muted">Marca una opción: verás por qué cada alternativa es correcta o incorrecta.</p>${quiz.map((q, qi) => `<div class="q" data-q="${qi}"><div class="q-t"><b>${qi + 1}.</b> ${q.q}</div><div class="opts">${q.opts.map((o, oi) => `<button class="opt" type="button" data-o="${oi}"><span class="mark"></span><span>${o.t}</span></button>`).join('')}</div><div class="why"></div></div>`).join('')}<div class="quiz-score"></div></section>
      ${(() => { const i = T.indexOf(topic); return `<div class="pager">${i > 0 ? `<a class="btn" href="#teoria/${T[i - 1].id}">← ${T[i - 1].title}</a>` : '<span></span>'}${i < T.length - 1 ? `<a class="btn" href="#teoria/${T[i + 1].id}">${T[i + 1].title} →</a>` : ''}</div>`; })()}</article></div>`;
    const answered = {};
    $$('.q', view).forEach((qEl) => {
      const q = quiz[+qEl.dataset.q];
      $$('.opt', qEl).forEach((b) => b.addEventListener('click', () => {
        if (qEl.classList.contains('done')) return;
        qEl.classList.add('done');
        const chosen = q.opts[+b.dataset.o];
        answered[qEl.dataset.q] = !!chosen.ok;
        $$('.opt', qEl).forEach((bb, oi) => { const o = q.opts[oi]; bb.classList.add(o.ok ? 'right' : 'wrong'); if (bb === b) bb.classList.add('chosen'); bb.querySelector('.mark').textContent = o.ok ? '✓' : '✗'; });
        $('.why', qEl).innerHTML = `<p class="${chosen.ok ? 'good' : 'bad'}">${chosen.ok ? '¡Correcto!' : 'Incorrecto.'}</p><ul>${q.opts.map((o) => `<li><b>${o.ok ? '✓' : '✗'} ${o.t}:</b> ${o.why}</li>`).join('')}</ul>`;
        tex($('.why', qEl));
        if (Object.keys(answered).length === topic.quiz.length) {
          const sc = Object.values(answered).filter(Boolean).length;
          const all = store.get('quiz', {}); all[topic.id] = Math.max(sc, all[topic.id] ?? 0); store.set('quiz', all);
          $('.quiz-score', view).innerHTML = `<div class="box ${sc === topic.quiz.length ? 'ex' : 'tip'}"><b>Resultado: ${sc}/${topic.quiz.length}.</b> <button class="btn sm" type="button" id="retry">Reintentar</button></div>`;
          $('#retry').onclick = () => renderTeoria(topic.id);
          updateProgress();
        }
      }));
    });
    tex(view);
  };

  // ================= CÓMO RESOLVER =================
  const renderResolver = (id) => {
    const view = $('#view');
    const rec = RS.RECIPES.find((r) => r.id === id);
    const units = [...new Set(RS.RECIPES.map((r) => r.unit))];
    view.innerHTML = `<div class="split"><nav class="side" aria-label="Tipos de ejercicio"><a href="#resolver" class="side-a${!rec ? ' on' : ''}">Guía: cómo responder casos y preguntas de marcar</a>${units.map((u) => `<div class="side-h">${u}</div>${RS.RECIPES.filter((r) => r.unit === u).map((r) => `<a href="#resolver/${r.id}" class="side-a${rec && r.id === rec.id ? ' on' : ''}">${r.title}</a>`).join('')}`).join('')}</nav>
      <article class="main">${rec ? `<div class="crumb">${rec.unit} · Cómo resolver</div><h2>${rec.title}</h2>
        <p class="when"><b>Cuándo aparece:</b> ${rec.when}</p>
        <div class="cols2"><div class="card"><h3>Receta paso a paso</h3><ol class="recipe">${rec.steps.map((s) => `<li>${s}</li>`).join('')}</ol></div>
        <div class="card warnc"><h3>Trampas frecuentes</h3><ul>${rec.traps.map((s) => `<li>${s}</li>`).join('')}</ul></div></div>
        <div class="card"><div class="ex-head"><h3>Ejemplo resuelto</h3><button class="btn primary" type="button" id="otro">↻ Otro ejemplo</button></div><div id="exbox"></div></div>`
      : `<h2>Cómo responder en el examen</h2>${RS.GUIDES}`}</article></div>`;
    if (rec) {
      let first = true;
      const show = () => {
        const x = first && RS.FIXED[rec.id] ? RS.FIXED[rec.id]() : rec.gen(); first = false;
        $('#exbox').innerHTML = `<div class="enun">${x.enun}</div><details class="sol" open><summary>Solución completa</summary><div class="sol-b">${x.sol}</div></details>`;
        tex($('#exbox'));
      };
      $('#otro').onclick = show; show();
    }
    tex(view);
  };

  // ================= PRÁCTICA =================
  const renderPractica = (sub = 'problemas') => {
    const view = $('#view');
    const subs = [['problemas', 'Problemas para resolver'], ['vf', 'Verdadero o falso'], ['graficar', 'Graficar grafos'], ['lab', 'Laboratorio de grafos'], ['recplot', 'Graficar recurrencias']];
    view.innerHTML = `<div class="subtabs" role="tablist">${subs.map(([k, t]) => `<a href="#practica/${k}" class="subtab${k === sub ? ' on' : ''}" role="tab">${t}</a>`).join('')}</div><div id="pview"></div>`;
    const pv = $('#pview');
    if (sub === 'problemas') {
      const tags = ['Todos', ...new Set(PR.P.flatMap((p) => p.tags))];
      const done = store.get('probs', {});
      const draw = (tag) => {
        const list = PR.P.map((p, i) => ({ p, i })).filter(({ p }) => tag === 'Todos' || p.tags.includes(tag));
        pv.innerHTML = `<div class="filters">${tags.map((t) => `<button class="chip${t === tag ? ' on' : ''}" type="button" data-t="${t}">${t}</button>`).join('')}</div>
          <p class="muted">Intenta cada problema en papel antes de abrir la solución. Marca los que ya dominas.</p>
          ${list.map(({ p, i }) => `<div class="card prob"><div class="prob-h"><span class="src">${p.src}</span><label class="donecb"><input type="checkbox" data-i="${i}" ${done[i] ? 'checked' : ''}> dominado</label></div><div class="enun">${p.enun}</div><details class="sol"><summary>Ver solución</summary><div class="sol-b">${p.sol}</div></details></div>`).join('')}`;
        $$('.chip', pv).forEach((b) => (b.onclick = () => draw(b.dataset.t)));
        $$('.donecb input', pv).forEach((c) => (c.onchange = () => { const d = store.get('probs', {}); d[c.dataset.i] = c.checked; store.set('probs', d); updateProgress(); }));
        tex(pv);
      };
      draw('Todos');
    }
    if (sub === 'vf') {
      pv.innerHTML = `<p class="muted">Decide si cada afirmación es verdadera o falsa <b>y justifica</b> antes de ver la respuesta: si es verdadera, por qué; si es falsa, un contraejemplo o demostración.</p>
        <div class="vf-score" id="vfs"></div>
        ${PR.VF.map((x, i) => `<div class="card vf" data-i="${i}"><div class="vf-s"><b>${i + 1}.</b> ${x.s}</div><textarea class="just" rows="2" placeholder="Tu justificación (opcional)…"></textarea><div class="vf-btns"><button class="btn" type="button" data-a="1">Verdadero</button><button class="btn" type="button" data-a="0">Falso</button></div><div class="vf-r"></div></div>`).join('')}`;
      let ok = 0, tot = 0;
      $$('.vf', pv).forEach((c) => {
        const x = PR.VF[+c.dataset.i];
        $$('.vf-btns .btn', c).forEach((b) => (b.onclick = () => {
          if (c.classList.contains('done')) return; c.classList.add('done');
          const right = (b.dataset.a === '1') === x.v; tot++; if (right) ok++;
          b.classList.add(right ? 'right' : 'wrong');
          $('.vf-r', c).innerHTML = `<p class="${right ? 'good' : 'bad'}">${right ? '¡Bien!' : 'No.'} La afirmación es <b>${x.v ? 'VERDADERA' : 'FALSA'}</b>.</p><div><b>${x.v ? '¿Por qué es verdadera?' : 'Demostración de que es falsa:'}</b> ${x.j}</div>`;
          tex($('.vf-r', c));
          $('#vfs').innerHTML = `Aciertos: <b>${ok}/${tot}</b> de ${PR.VF.length}`;
        }));
      });
      tex(pv);
    }
    if (sub === 'graficar') {
      pv.innerHTML = `<p class="muted">Dibuja en el lienzo y pulsa <b>Comprobar</b>. El verificador analiza tu grafo (grados, conexidad, Euler, Hamilton, isomorfismo…).</p>
        <div class="cols2 draw"><div><div class="card"><label class="lbl" for="task">Tarea</label><select id="task">${PR.DRAW.map((d, i) => `<option value="${i}">${i + 1}. ${d.t.replace(/<[^>]+>/g, '').replace(/\$/g, '')}</option>`).join('')}</select><div id="taskt" class="enun"></div><div class="row"><button class="btn primary" type="button" id="chk">Comprobar</button><button class="btn" type="button" id="hint">Pista</button></div><div id="res"></div></div>
        <div class="card"><h3>Análisis en vivo</h3><div id="an"></div></div></div><div class="card"><div id="ed"></div></div></div>`;
      const ed = new ED.GraphEditor($('#ed'), { onChange: (g) => { $('#an').innerHTML = ED.analyze(g); tex($('#an')); } });
      const setTask = () => { const d = PR.DRAW[+$('#task').value]; $('#taskt').innerHTML = d.t; $('#res').innerHTML = ''; tex($('#taskt')); };
      $('#task').onchange = setTask; setTask();
      $('#chk').onclick = () => { const d = PR.DRAW[+$('#task').value]; const gr = ed.graph(); const ok = gr.labels.length > 0 && d.check(gr);
        $('#res').innerHTML = ok ? '<p class="good">✓ ¡Correcto! Tu grafo cumple lo pedido.</p>' : '<p class="bad">✗ Todavía no. Revisa el análisis en vivo para ver qué falta.</p>'; };
      $('#hint').onclick = () => { const d = PR.DRAW[+$('#task').value]; $('#res').innerHTML = `<p class="muted">${d.hint || 'Revisa la teoría del tema y el análisis en vivo.'}</p>`; tex($('#res')); };
    }
    if (sub === 'lab') {
      pv.innerHTML = `<p class="muted">Dibuja cualquier grafo <b>ponderado</b> (fija el peso antes de unir dos vértices) y ejecuta Dijkstra con su tabla de etiquetas. También puedes cargar los grafos de clase.</p>
        <div class="cols2 draw"><div class="card"><div class="row"><label class="lbl">Cargar: <select id="preset"><option value="">—</option><option value="dijkClase">Dijkstra clase (a→z)</option><option value="dijkClase2">Dijkstra clase 2 (a→z)</option><option value="dijkAK">Dijkstra A→K</option><option value="rand">Aleatorio</option></select></label></div>
          <div class="row"><label class="lbl">Inicio <select id="ds"></select></label><label class="lbl">Fin <select id="dt"></select></label><button class="btn primary" type="button" id="run">Ejecutar Dijkstra</button></div><div id="dres"></div><h3>Análisis</h3><div id="an"></div></div>
          <div class="card"><div id="ed"></div></div></div>`;
      const fill = (g) => { const opts = g.labels.map((l, i) => `<option value="${i}">${l}</option>`).join(''); const s = $('#ds'), t = $('#dt'); const sv = s.value, tv = t.value; s.innerHTML = opts; t.innerHTML = opts; if (sv && +sv < g.labels.length) s.value = sv; t.value = tv && +tv < g.labels.length ? tv : g.labels.length - 1; };
      const ed = new ED.GraphEditor($('#ed'), { weighted: true, onChange: (g) => { fill(g); $('#an').innerHTML = ED.analyze(g); tex($('#an')); } });
      $('#preset').onchange = (e) => { const v = e.target.value; if (!v) return; ed.load(v === 'rand' ? RS.genDijkGraph() : G.fixed[v]); fill(ed.graph()); $('#dt').value = ed.graph().labels.length - 1; };
      $('#run').onclick = () => { const g = ed.graph(); if (!g.labels.length) return; const s = +$('#ds').value, t = +$('#dt').value;
        g.edges = g.edges.map(([u, v, w]) => [u, v, w ?? 1]);
        const r = G.dijkstra(g, s); if (r.d[t] === Infinity) { $('#dres').innerHTML = '<p class="bad">No hay camino entre esos vértices.</p>'; return; }
        $('#dres').innerHTML = RS.dijkSolution(g, s, t); tex($('#dres')); };
    }
    if (sub === 'recplot') {
      const presets = [
        ['R1 Ej. 7', 2, '-1', '6', '0', 0, '1', '2', '2^n'], ['R1 Ej. 10', 2, '4', '-4', '0', 0, '1', '3', '2^n + n*2^(n-1)'], ['R1 Ej. 11 (complejas)', 2, '2', '-2', '0', 0, '1', '2', 'sqrt(2)^n*(cos(n*pi/4)+sin(n*pi/4))'],
        ['Fibonacci', 2, '1', '1', '0', 0, '0', '1', '(((1+sqrt(5))/2)^n - ((1-sqrt(5))/2)^n)/sqrt(5)'], ['R2 Ej. 4', 2, '1', '6', '2^n', 0, '0', '1', '3^n - 2^n'], ['R2 Ej. 5', 1, '3', '0', '5*3^n', 0, '2', '', '(2+5n)*3^n'],
        ['R2 Ej. 6', 1, '3', '0', '2n', 1, '3', '', '11/6*3^n - n - 3/2'], ['R1 Ej. 4 (burbuja)', 1, '1', '0', 'n-1', 1, '0', '', 'n(n-1)/2'], ['R2 Ej. 3 (errata)', 0, '', '', '', 0, '', '', '']];
      pv.innerHTML = `<p class="muted">Escribe una recurrencia $a_n = p\\,a_{n-1} + q\\,a_{n-2} + f(n)$ y tu fórmula cerrada. Las <b>barras</b> son los valores calculados con la recurrencia; los <b>puntos</b>, tu fórmula. Si coinciden, tu fórmula es correcta en esos términos. Usa <code>^</code> para potencias, <code>sqrt</code>, <code>cos</code>, <code>sin</code>, <code>pi</code>.</p>
        <div class="row wrap">${presets.map((p, i) => `<button class="chip" type="button" data-p="${i}">${p[0]}</button>`).join('')}</div>
        <div class="cols2"><div class="card form">
          <label>Orden <select id="ro"><option value="1">1</option><option value="2" selected>2</option><option value="3">3 (Ej. 3)</option></select></label>
          <label>$p$ (coef. de $a_{n-1}$) <input id="rp" value="-1"></label><label class="o2">$q$ (coef. de $a_{n-2}$) <input id="rq" value="6"></label><label class="o3">$r$ (coef. de $a_{n-3}$) <input id="rr" value="0"></label>
          <label>$f(n)$ <input id="rf" value="0"></label><label>Primer índice $n_0$ <input id="ri" value="0" type="number"></label>
          <label>$a_{n_0}$ <input id="ra0" value="1"></label><label class="o2">$a_{n_0+1}$ <input id="ra1" value="2"></label><label class="o3">$a_{n_0+2}$ <input id="ra2" value="0"></label>
          <label>Tu fórmula $a_n =$ <input id="rform" value="2^n"></label><label>Términos <input id="rN" value="10" type="number" min="3" max="25"></label>
          <button class="btn primary" type="button" id="rgo">Graficar</button></div>
          <div class="card"><div id="rplot"></div><div id="rtab"></div></div></div>`;
      const setOrder = () => { const o = +$('#ro').value; $$('.o2', pv).forEach((e) => (e.style.display = o >= 2 ? '' : 'none')); $$('.o3', pv).forEach((e) => (e.style.display = o >= 3 ? '' : 'none')); };
      $('#ro').onchange = setOrder;
      const go = () => {
        try {
          const o = +$('#ro').value, n0 = +$('#ri').value || 0, N = Math.min(25, Math.max(3, +$('#rN').value || 10));
          const p = +ED.toJS($('#rp').value || '0')(0), q = +ED.toJS($('#rq').value || '0')(0), rr = +ED.toJS($('#rr').value || '0')(0);
          const f = ED.toJS($('#rf').value || '0'), form = $('#rform').value.trim() ? ED.toJS($('#rform').value) : null;
          const a = [+ED.toJS($('#ra0').value)(0)]; if (o >= 2) a.push(+ED.toJS($('#ra1').value)(0)); if (o >= 3) a.push(+ED.toJS($('#ra2').value)(0));
          for (let k = a.length; k < N; k++) a.push(p * a[k - 1] + (o >= 2 ? q * a[k - 2] : 0) + (o >= 3 ? rr * a[k - 3] : 0) + f(n0 + k));
          const ns = a.map((_, k) => n0 + k), fv = ns.map((n) => (form ? form(n) : NaN));
          const okAll = form && a.every((v, k) => Math.abs(v - fv[k]) <= 1e-6 * Math.max(1, Math.abs(v)));
          $('#rplot').innerHTML = ED.plotSeq(ns, a, fv) + `<p class="legend"><span class="lg bar"></span> recurrencia &nbsp; <span class="lg dot"></span> tu fórmula</p>` + (form ? `<p class="${okAll ? 'good' : 'bad'}">${okAll ? '✓ Tu fórmula coincide con la recurrencia en los ' + N + ' términos.' : '✗ Tu fórmula no coincide en todos los términos (revisa la tabla).'}</p>` : '');
          $('#rtab').innerHTML = `<div class="scroll"><table class="tbl small"><tr><th>$n$</th>${ns.map((n) => `<th>${n}</th>`).join('')}</tr><tr><td>recurrencia</td>${a.map((v) => `<td>${+v.toFixed(4)}</td>`).join('')}</tr>${form ? `<tr><td>fórmula</td>${fv.map((v, k) => `<td class="${Math.abs(v - a[k]) <= 1e-6 * Math.max(1, Math.abs(a[k])) ? '' : 'odd'}">${Number.isFinite(v) ? +v.toFixed(4) : '—'}</td>`).join('')}</tr>` : ''}</table></div>`;
          tex($('#rtab'));
        } catch (e) { $('#rplot').innerHTML = `<p class="bad">No pude leer una expresión: ${e.message}. Usa * para multiplicar si hay dudas.</p>`; }
      };
      $$('.chip', pv).forEach((b) => (b.onclick = () => {
        const p = presets[+b.dataset.p];
        if (p[0].startsWith('R2 Ej. 3')) { $('#ro').value = '3'; $('#rp').value = '-3'; $('#rq').value = '-3'; $('#rr').value = '-1'; $('#rf').value = '0'; $('#ri').value = 0; $('#ra0').value = '1'; $('#ra1').value = '-2'; $('#ra2').value = '-1'; $('#rform').value = '(1-3n-2n^2)*(-1)^n'; setOrder(); go();
          $('#rplot').insertAdjacentHTML('beforeend', '<p class="muted">Esta es la fórmula <b>de la diapositiva</b>: no coincide. Cambia <code>-3n</code> por <code>+3n</code> y vuelve a graficar.</p>'); return; }
        $('#ro').value = String(p[1]); $('#rp').value = p[2]; $('#rq').value = p[3]; $('#rf').value = p[4]; $('#ri').value = p[5]; $('#ra0').value = p[6]; $('#ra1').value = p[7]; $('#rform').value = p[8]; setOrder(); go();
      }));
      $('#rgo').onclick = go; setOrder(); go(); tex(pv);
    }
  };

  // ================= SIMULACRO =================
  let timer = null;
  const renderSimulacro = () => {
    const view = $('#view');
    const best = store.get('sim', []);
    view.innerHTML = `<div class="main narrow"><h2>Simulacro de examen</h2>
      <p>Formato de los exámenes del curso (CS1022, «Tercer examen»): <b>4 preguntas de 5 puntos (20 pts)</b>, justificando todo. Las preguntas se generan con datos nuevos cada vez; la de BFS se reemplaza por <b>Dijkstra</b>.</p>
      <div class="row"><label class="lbl">Tiempo <select id="mins"><option>60</option><option selected>90</option><option>120</option></select> min</label><button class="btn primary" type="button" id="start">Generar examen</button></div>
      ${best.length ? `<p class="muted">Tus últimos simulacros: ${best.slice(-5).map((b) => `<b>${b.s}/20</b> (${b.d})`).join(' · ')}</p>` : ''}
      <div id="exam"></div></div>`;
    $('#start').onclick = () => {
      const pick = (id) => RS.RECIPES.find((r) => r.id === id);
      const qs = [
        G.pick([pick('euler'), pick('hamilton')]),
        G.pick([pick('existencia'), pick('iso'), pick('bipartito'), pick('matrices')]),
        pick('dijkstra'),
        G.pick([pick('recnh'), pick('rec2'), pick('modelar')]),
      ].map((r) => ({ r, x: r.gen() }));
      const mins = +$('#mins').value; let left = mins * 60;
      $('#exam').innerHTML = `<div class="timer" id="clock"></div>${qs.map(({ r, x }, i) => `<div class="card prob"><div class="prob-h"><b>${i + 1}. (5 pt.)</b> <span class="src">${r.title}</span></div><div class="enun">${x.enun}</div><textarea rows="4" placeholder="Borrador / respuesta (opcional; lo ideal es resolver en papel)…"></textarea><div class="sol-wrap" hidden><details class="sol" open><summary>Solución</summary><div class="sol-b">${x.sol}</div></details>
        <div class="rubric"><b>Autoevaluación:</b> <label><input type="checkbox" data-pt="2"> Planteamiento / criterio correcto (2)</label><label><input type="checkbox" data-pt="2"> Desarrollo y cálculos correctos (2)</label><label><input type="checkbox" data-pt="1"> Conclusión clara y justificada (1)</label></div></div></div>`).join('')}
        <div class="row"><button class="btn primary" type="button" id="finish">Terminar y ver soluciones</button></div><div id="final"></div>`;
      tex($('#exam'));
      const tick = () => { const m = Math.floor(left / 60), s = left % 60; $('#clock').textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`; if (left <= 0) { finish(); } left--; };
      clearInterval(timer); timer = setInterval(tick, 1000); tick();
      const finish = () => {
        clearInterval(timer); $('#clock').textContent = '⏱ terminado';
        $$('.sol-wrap', view).forEach((e) => (e.hidden = false)); $('#finish').hidden = true;
        const upd = () => { const s = $$('.rubric input:checked', view).reduce((a, c) => a + +c.dataset.pt, 0); $('#final').innerHTML = `<div class="box ex"><b>Puntaje autoevaluado: ${s}/20.</b> <button class="btn sm" type="button" id="save">Guardar resultado</button></div>`;
          $('#save').onclick = () => { const b = store.get('sim', []); b.push({ s, d: new Date().toLocaleDateString('es-PE') }); store.set('sim', b); $('#save').textContent = 'Guardado ✓'; }; };
        $$('.rubric input', view).forEach((c) => (c.onchange = upd)); upd(); tex(view);
      };
      $('#finish').onclick = finish;
    };
  };

  // ================= FORMULARIO =================
  const FORM = `<div class="main narrow"><h2>Formulario</h2><p class="muted">Todo lo que conviene tener en la cabeza el día del examen (basado en las clases).</p>
    <div class="card"><h3>Grafos: conteos</h3><table class="tbl"><tbody>
    <tr><th>Apretón de manos</th><td>$\\sum\\operatorname{grad}(v) = 2|E|$; número par de vértices de grado impar</td></tr>
    <tr><th>Digrafo</th><td>$\\sum\\operatorname{grad}^-(v) = \\sum\\operatorname{grad}^+(v) = |E|$</td></tr>
    <tr><th>$k$-regular, $n$ vértices</th><td>$|E| = nk/2$</td></tr>
    <tr><th>$K_n$</th><td>$|V| = n$, $|E| = \\frac{n(n-1)}2$, grado $n-1$</td></tr>
    <tr><th>$C_n$ ($n\\ge3$)</th><td>$|V| = |E| = n$, grado 2</td></tr>
    <tr><th>$W_n$ (clase)</th><td>$|V| = n$, $|E| = 2(n-1)$; centro $n-1$, resto 3</td></tr>
    <tr><th>$Q_n$</th><td>$|V| = 2^n$, $|E| = n2^{n-1}$, grado $n$</td></tr>
    <tr><th>$K_{m,n}$</th><td>$|V| = m+n$, $|E| = mn$</td></tr>
    <tr><th>Complemento</th><td>$|E(\\overline G)| = \\frac{n(n-1)}2 - |E(G)|$; $\\operatorname{grad}_{\\overline G}(v) = n-1-\\operatorname{grad}_G(v)$</td></tr></tbody></table></div>
    <div class="card"><h3>Grafos: criterios</h3><table class="tbl"><tbody>
    <tr><th>Bipartito</th><td>$\\iff$ sin ciclos impares; $C_n$ bipartito $\\iff n$ par</td></tr>
    <tr><th>Isomorfos</th><td>Invariantes: $|V|$, $|E|$, score, componentes, ciclos. Si coinciden, construir $f$ y verificar aristas</td></tr>
    <tr><th>Potencias de $A$</th><td>$(A^k)_{ij}$ = trayectorias de longitud $k$; $\\operatorname{traza}(A^2) = 2|E|$</td></tr>
    <tr><th>Incidencia</th><td>$n\\times m$; no dirigida 1/0; dirigida $+1$ inicio, $-1$ final</td></tr>
    <tr><th>Ciclo euleriano</th><td>conexo y todos los grados pares</td></tr>
    <tr><th>Camino euleriano</th><td>conexo y 0 o 2 vértices impares (empieza/termina en ellos)</td></tr>
    <tr><th>Dirac</th><td>simple, $n\\ge3$, $\\operatorname{grad}(v)\\ge n/2$ ⇒ ciclo hamiltoniano</td></tr>
    <tr><th>Ore</th><td>simple, $n\\ge3$, $\\operatorname{grad}(u)+\\operatorname{grad}(v)\\ge n$ (no adyacentes) ⇒ ciclo hamiltoniano</td></tr>
    <tr><th>Negar Hamilton</th><td>en el ciclo todo vértice tiene grado 2: grado 1 ⇒ no; grado 2 ⇒ aristas forzadas; 3+ forzadas o ciclo prematuro ⇒ no; $K_{m,n}$, $m\\ne n$ ⇒ no</td></tr>
    <tr><th>Viajero</th><td>$(n-1)!$ rutas desde un origen fijo ($(n-1)!/2$ sin importar sentido)</td></tr>
    <tr><th>Árbol expandido</th><td>todos los vértices, sin circuitos; mínimo = menor peso total</td></tr>
    <tr><th>Dijkstra</th><td>etiquetas $(d_{\\min}, v_i)$; temporal mínimo ⇒ permanente; actualizar si $d(u)+w<d(v)$; pesos positivos</td></tr></tbody></table></div>
    <div class="card"><h3>Recurrencias</h3><table class="tbl"><tbody>
    <tr><th>1er orden homogénea</th><td>$a_n = -c\\,a_{n-1}$, $a_0 = A$ ⇒ $a_n = A(-c)^n$</td></tr>
    <tr><th>$a_n = a_{n-1} + f(n)$</th><td>$a_n = a_0 + \\sum_{i=1}^n f(i)$; $\\sum i = \\frac{n(n+1)}2$, $\\sum i^2 = \\frac{n(n+1)(2n+1)}6$</td></tr>
    <tr><th>Ec. característica</th><td>$a_n = p\\,a_{n-1} + q\\,a_{n-2}$ ⇒ $r^2 - pr - q = 0$</td></tr>
    <tr><th>Raíces distintas</th><td>$Ar_1^n + Br_2^n$</td></tr>
    <tr><th>Raíz doble</th><td>$(A + Bn)r^n$; multiplicidad $m$: $(A_0 + A_1n + \\dots + A_{m-1}n^{m-1})r^n$</td></tr>
    <tr><th>Complejas $a\\pm bi$</th><td>$\\rho^n(C\\cos n\\theta + D\\sin n\\theta)$, $\\rho = \\sqrt{a^2+b^2}$, $\\theta = \\arg(a+bi)$</td></tr>
    <tr><th>Particular</th><td>$f(n) = P_t(n)s^n$: $s$ no raíz ⇒ $Q_t(n)s^n$; $s$ raíz de mult. $m$ ⇒ $n^mQ_t(n)s^n$</td></tr>
    <tr><th>No homogénea</th><td>$a_n = a^{(h)} + a^{(p)}$; condiciones iniciales al final</td></tr>
    <tr><th>Cadenas sin $k$ iguales seguidos</th><td>$a_n = a_{n-1} + \\cdots + a_{n-k}$ (sin 111: $a_1 = 2, a_2 = 4, a_3 = 7$; sin 00: $a_1 = 2, a_2 = 3$)</td></tr></tbody></table></div>
    <div class="card"><h3>Convenciones usadas en esta web</h3><ul>
    <li>Rueda $W_n$: $n$ vértices en total (convención de clase).</li>
    <li>Grado: un bucle cuenta 2; en la matriz de adyacencia se anota $a_{ii} = 1$ (clase).</li>
    <li>«Camino» = no repite vértices; «trayectoria» = puede repetir (clase).</li>
    <li>Dijkstra: en empates se hace permanente primero el vértice que va antes en orden alfabético / de índice; una etiqueta solo se cambia si la nueva distancia es <b>estrictamente</b> menor.</li>
    <li>Preguntas de BFS de exámenes pasados: reemplazadas por Dijkstra. Prim: reemplazado por Dijkstra.</li>
    <li>Recurrencias complejas: se usa $C = A+B$ y $D = (A-B)i$ (reales) en la fórmula de Moivre de la clase.</li></ul></div></div>`;

  // ================= Progreso y router =================
  const updateProgress = () => {
    const q = store.get('quiz', {}), p = store.get('probs', {});
    const qd = Object.keys(q).length, pd = Object.values(p).filter(Boolean).length;
    $('#progress').innerHTML = `Quizzes: <b>${qd}/${T.length}</b> · Problemas dominados: <b>${pd}/${PR.P.length}</b>`;
  };
  const route = () => {
    const [tab, sub] = (location.hash.slice(1) || 'teoria').split('/');
    $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
    clearInterval(timer);
    if (tab === 'teoria') renderTeoria(sub);
    else if (tab === 'resolver') renderResolver(sub);
    else if (tab === 'practica') renderPractica(sub);
    else if (tab === 'simulacro') renderSimulacro();
    else if (tab === 'formulario') { $('#view').innerHTML = FORM; tex($('#view')); }
    else renderTeoria();
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', route);
  const theme = store.get('theme', null); if (theme) document.documentElement.dataset.theme = theme;
  $('#themeBtn').onclick = () => { const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); const nx = cur === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = nx; store.set('theme', nx); };
  const start = () => { updateProgress(); route(); };
  if (window.renderMathInElement) start(); else window.addEventListener('load', start);
  void esc; void R;
})();
