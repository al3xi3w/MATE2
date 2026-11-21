/* ===== Sección 1: Teoría (basada en las clases) + quiz por tema ===== */
(function () {
  const G = window.GR, F = G.fixed;
  const g = (labels, edges, pos, extra = {}) => ({ labels, edges, pos, ...extra });
  const svg = (gr, o = {}) => `<figure class="fig">${G.svg(gr, o)}${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}</figure>`;
  const row = (...figs) => `<div class="figrow">${figs.join('')}</div>`;
  const K = (n, r = 38) => { const e = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]); return g(Array.from({ length: n }, (_, i) => `${i + 1}`), e, G.circlePos(n, r)); };
  const C = (n) => g(Array.from({ length: n }, (_, i) => `${i + 1}`), Array.from({ length: n }, (_, i) => [i, (i + 1) % n]), G.circlePos(n));
  const box = (cls, title, body) => `<div class="box ${cls}"><div class="box-t">${title}</div>${body}</div>`;
  const def = (t, b) => box('def', t, b), ex = (t, b) => box('ex', t, b), tip = (b) => box('tip', 'Truco de examen', b), warn = (t, b) => box('warn', t, b);

  const W6 = (() => { const p = G.circlePos(5); return g(['1', '2', '3', '4', '5', '0'], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4]], [...p, [50, 50]]); })();
  const Q3 = g(['000', '100', '010', '110', '001', '101', '011', '111'], [[0, 1], [0, 2], [1, 3], [2, 3], [4, 5], [4, 6], [5, 7], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7]],
    [[10, 90], [60, 90], [10, 40], [60, 40], [40, 60], [90, 60], [40, 10], [90, 10]]);
  const K33 = g(['u1', 'u2', 'u3', 'w1', 'w2', 'w3'], [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]], [[15, 10], [50, 10], [85, 10], [15, 90], [50, 90], [85, 90]]);
  const konig = g(['A', 'B', 'C', 'D'], [[0, 1], [0, 1], [0, 2], [0, 2], [0, 3], [1, 3], [2, 3]], [[35, 50], [35, 5], [35, 95], [90, 50]]);
  const bow = g(['a', 'b', 'c', 'd', 'e'], [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4]], [[5, 15], [5, 85], [50, 50], [95, 15], [95, 85]]);
  const tsp = g(['A', 'B', 'C', 'D'], [[0, 1, 30], [1, 2, 30], [2, 3, 25], [3, 0, 40], [0, 2, 50], [1, 3, 35]], [[5, 5], [95, 5], [95, 95], [5, 95]]);
  const mstG = g(['1', '2', '3', '4', '5', '6'], [[0, 1, 4], [1, 3, 5], [0, 2, 2], [2, 3, 1], [2, 5, 3], [3, 5, 6], [0, 4, 3], [4, 2, 6], [4, 5, 2]],
    [[40, 5], [85, 5], [40, 50], [85, 45], [0, 95], [75, 95]]);
  const mstT = new Set([0, 2, 3, 6, 8]), mstT2 = new Set([0, 1, 2, 7, 4]);
  const spanG = g(['v0', 'v1', 'v2', 'v3', 'v4', 'v5'], [[0, 5], [5, 4], [4, 1], [4, 2], [1, 2], [2, 3]], [[10, 90], [50, 90], [90, 90], [90, 10], [50, 10], [10, 10]]);

  const T = [];
  // ---------------- GRAFOS ----------------
  T.push({ id: 'basicos', unit: 'Grafos', title: 'Conceptos básicos y tipos de grafo', src: 'Guía de Grafos §1',
    html: `${def('Grafo no dirigido', `Un grafo es un par $G=(V,E)$: $V$ es un conjunto no vacío de <b>vértices</b> y $E$ un conjunto de <b>aristas</b>. Cada arista $e=\\{u,v\\}$ está asociada a un par no ordenado de vértices: $e$ es <i>incidente</i> en $u$ y $v$, y $u,v$ son <i>adyacentes</i>.`)}
    <table class="tbl"><thead><tr><th>Tipo</th><th>Característica</th></tr></thead><tbody>
    <tr><td>Grafo simple</td><td>Sin bucles y sin aristas paralelas.</td></tr>
    <tr><td>Multigrafo</td><td>Tiene aristas múltiples (paralelas) entre el mismo par de vértices.</td></tr>
    <tr><td>Pseudografo</td><td>Tiene bucles (arista de un vértice a sí mismo).</td></tr>
    <tr><td>Grafo dirigido (digrafo)</td><td>Cada arista es un par ordenado $(u,v)$: empieza en $u$ y termina en $v$.</td></tr>
    <tr><td>Grafo ponderado</td><td>Cada arista tiene un peso real no negativo (distancia, costo, tiempo…).</td></tr></tbody></table>
    ${ex('Ejercicio resuelto (clase)', `$V=\\{a,b,c,d,e\\}$, $E=\\{\\{a,b\\},\\{b,b\\},\\{b,c\\},\\{c,d\\},\\{d,b\\},\\{b,e\\},\\{e,a\\}\\}$.
      ${svg(g(['a', 'b', 'c', 'd', 'e'], [[0, 1], [1, 1], [1, 2], [2, 3], [3, 1], [1, 4], [4, 0]], [[10, 50], [45, 55], [85, 20], [90, 85], [35, 95]]), { width: 260, height: 200 })}
      5 vértices y 7 aristas. Como $\\{b,b\\}$ es un bucle, es un <b>pseudografo</b> (no es simple). Adyacentes a $b$: $a,c,d,e$ y el propio $b$ (por el bucle).`)}
    ${tip('Los puntos son vértices; las líneas, aristas. Un cruce de líneas <b>no</b> es un vértice si no está marcado. Un vértice sin aristas es un <b>vértice aislado</b>.')}`,
    quiz: [
      { q: 'Un grafo tiene un bucle en el vértice $b$ y ninguna arista paralela. ¿Qué tipo de grafo es?', opts: [
        { t: 'Grafo simple', why: 'Un grafo simple no puede tener bucles.' },
        { t: 'Multigrafo', why: 'Multigrafo se refiere a aristas paralelas, y aquí no hay.' },
        { t: 'Pseudografo', ok: true, why: 'Tener un bucle lo convierte en pseudografo.' },
        { t: 'Digrafo', why: 'Nada indica que las aristas tengan dirección.' }] },
      { q: 'En un dibujo, dos aristas se cruzan en un punto sin marcar. ¿Ese cruce es un vértice?', opts: [
        { t: 'Sí, siempre', why: 'Solo son vértices los puntos marcados.' },
        { t: 'No, si no está marcado como vértice', ok: true, why: 'Un cruce de líneas no es vértice salvo que esté dibujado como tal.' },
        { t: 'Solo si el grafo es dirigido', why: 'La dirección no tiene relación con esto.' }] },
      { q: 'En un grafo ponderado, ¿qué representa el peso de una arista?', opts: [
        { t: 'El grado de sus extremos', why: 'El grado es una propiedad de los vértices.' },
        { t: 'Un número real no negativo asociado a la arista (distancia, costo, tiempo…)', ok: true, why: 'Es la definición de la clase.' },
        { t: 'La cantidad de aristas paralelas', why: 'Eso describe un multigrafo, no un peso.' }] },
    ] });

  T.push({ id: 'grado', unit: 'Grafos', title: 'Grado, apretón de manos y score', src: 'Guía de Grafos §2–3',
    html: `${def('Grado', `$\\operatorname{grad}(v)$ = número de aristas incidentes en $v$. <b>Un bucle cuenta 2.</b><br>En un digrafo: $\\operatorname{grad}^-(v)$ = grado de entrada (aristas que llegan) y $\\operatorname{grad}^+(v)$ = grado de salida (aristas que salen).`)}
    ${box('thm', 'Teoremas fundamentales', `<ol><li><b>Lema del apretón de manos:</b> $\\displaystyle\\sum_{v\\in V}\\operatorname{grad}(v) = 2|E|$.</li><li>Todo grafo no dirigido tiene un <b>número par de vértices de grado impar</b>.</li><li>En un digrafo: $\\displaystyle\\sum \\operatorname{grad}^-(v) = \\sum \\operatorname{grad}^+(v) = |E|$.</li></ol>`)}
    ${def('Score (secuencia de grados)', 'La secuencia $(\\operatorname{grad}(v_1),\\dots,\\operatorname{grad}(v_n))$, escrita en orden no decreciente. Grafos isomorfos tienen el mismo score; pero <b>mismo score no implica isomorfos</b>.')}
    ${ex('Ejercicio de clase: existencia', `a) 5 vértices de grado 2: <b>sí</b>, $C_5$ (suma 10, 5 aristas).<br>b) 9 vértices de grado 3: <b>no</b>, suma $27$ impar.<br>c) Grados $1,1,2,3$: <b>no</b>, suma $7$ impar.<br>d) Grados $1,1,3,3$: suma 8 par, pero <b>no como grafo simple</b>: con 4 vértices, un vértice de grado 3 es adyacente a todos; con dos de grado 3, los otros tendrían grado $\\ge 2$. Sí existe como multigrafo.`)}
    ${ex('Ejercicio de clase: ¿existe un grafo simple con grados 4,4,4,4,4,2?', `$n=6$, grado máximo posible 5 ✓, suma 22 ⇒ 11 aristas. Miramos el <b>complemento</b>: grados $5-\\operatorname{grad}$: $1,1,1,1,1,3$. Ese existe ($f$ unido a $a,b,c$ y la arista $de$), así que su complemento tiene el score pedido. <b>Sí existe.</b>
      ${row(svg(g(GR.letters(6), [[5, 0], [5, 1], [5, 2], [3, 4]], G.circlePos(6)), { width: 220, height: 190, cap: 'complemento: 1,1,1,1,1,3' }), svg(G.complement(g(GR.letters(6), [[5, 0], [5, 1], [5, 2], [3, 4]], G.circlePos(6))), { width: 220, height: 190, cap: 'grafo pedido: 4,4,4,4,4,2' }))}`)}
    ${ex('Digrafo (clase)', `$E=\\{(a,b),(b,d),(c,a),(c,e),(e,c)\\}$
      ${svg(g(['a', 'b', 'c', 'd', 'e'], [[0, 1], [1, 3], [2, 0], [2, 4], [4, 2]], [[10, 20], [55, 10], [30, 85], [95, 30], [80, 90]], { directed: true }), { width: 260, height: 190, uid: 'dg1' })}
      <table class="tbl small"><tr><th></th><th>a</th><th>b</th><th>c</th><th>d</th><th>e</th><th>Σ</th></tr><tr><td>grad⁻</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>5</td></tr><tr><td>grad⁺</td><td>1</td><td>1</td><td>2</td><td>0</td><td>1</td><td>5</td></tr></table>Ambas sumas valen $5=|E|$ ✓`)}
    ${tip('Si la suma de grados es impar, el grafo no existe. Si dice «grafo simple», además revisa que ningún grado supere $n-1$ y que sea realizable sin aristas paralelas (truco: si hay $k$ vértices de grado $n-1$, todos los demás tienen grado $\\ge k$; o pasa al complemento).')}`,
    quiz: [
      { q: 'Un grafo tiene grados $2,2,3,3,4$. ¿Cuántas aristas tiene?', opts: [
        { t: '14', why: '14 es la suma de grados, que es $2|E|$, no $|E|$.' }, { t: '7', ok: true, why: '$\\sum\\operatorname{grad} = 14 = 2|E| \\Rightarrow |E| = 7$.' }, { t: '5', why: '5 es el número de vértices.' }, { t: 'No existe', why: 'La suma es par; no hay contradicción.' }] },
      { q: '¿Existe un grafo con 9 vértices, todos de grado 3?', opts: [
        { t: 'Sí, uno 3-regular', why: 'Para ser 3-regular con 9 vértices la suma sería $27$, impar.' },
        { t: 'No, porque la suma de grados sería 27 (impar)', ok: true, why: 'Contradice el apretón de manos (habría 9 vértices de grado impar, cantidad impar).' },
        { t: 'Solo como multigrafo', why: 'El apretón de manos vale también para multigrafos: no existe de ningún tipo.' }] },
      { q: '¿Un bucle cuántas unidades aporta al grado de su vértice?', opts: [{ t: '1', why: 'Error clásico: el bucle toca al vértice por sus dos extremos.' }, { t: '2', ok: true, why: 'Un bucle cuenta 2 en el grado.' }, { t: '0', why: 'Sí es una arista incidente.' }] },
      { q: 'Dos grafos tienen el mismo score. Entonces…', opts: [
        { t: 'Son isomorfos', why: 'Falso: $C_6$ y $C_3\\cup C_3$ tienen score $(2,2,2,2,2,2)$ y no son isomorfos.' },
        { t: 'No se puede concluir que sean isomorfos', ok: true, why: 'El score es condición necesaria, no suficiente.' },
        { t: 'Tienen distinto número de aristas', why: 'Mismo score ⇒ misma suma de grados ⇒ mismo número de aristas.' }] },
      { q: 'En un digrafo con 7 aristas, $\\sum_v \\operatorname{grad}^-(v)$ vale:', opts: [{ t: '14', why: 'Eso sería en un grafo no dirigido (suma total de grados).' }, { t: '7', ok: true, why: 'Cada arista llega a exactamente un vértice: $\\sum\\operatorname{grad}^- = |E|$.' }, { t: '3.5', why: 'No tiene sentido un valor no entero.' }] },
    ] });

  T.push({ id: 'caminos', unit: 'Grafos', title: 'Trayectorias, caminos, circuitos y conexidad', src: 'Guía de Grafos §4',
    html: `${def('Definiciones según la clase', `<ul><li><b>Trayectoria:</b> secuencia alternada $v_0e_1v_1\\cdots e_nv_n$ donde aristas consecutivas comparten vértice. <u>Puede repetir vértices</u>.</li><li><b>Longitud:</b> número de aristas $n$ (no de vértices).</li><li><b>Camino:</b> trayectoria que <u>no repite vértices</u>. Si visita $k$ vértices, su longitud es $k-1$.</li><li><b>Circuito:</b> camino cerrado (primer y último vértice coinciden).</li><li><b>Conexo:</b> existe un camino entre cualquier par de vértices; si no, es disconexo y sus partes conexas maximales son las <b>componentes conexas</b>.</li><li><b>Puente:</b> arista cuya eliminación aumenta el número de componentes.</li></ul>`)}
    ${ex('Componentes (clase)', `${svg(g(GR.letters(6), [[0, 1], [1, 2], [2, 0], [3, 4]], [[5, 20], [40, 10], [20, 80], [60, 30], [90, 70], [75, 95]]), { width: 260, height: 180 })}No es conexo: componentes $\\{a,b,c\\}$, $\\{d,e\\}$, $\\{f\\}$ ⇒ <b>3 componentes</b> (un vértice aislado también es componente).`)}
    ${ex('Puentes (clase)', `${svg(g(GR.letters(5), [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]], [[5, 15], [5, 85], [40, 50], [70, 50], [97, 50]]), { width: 260, height: 160, hi: new Set([3, 4]), hiColor: 'var(--bad)' })}Puentes: $cd$ y $de$. Las aristas del triángulo no lo son: siempre queda otra ruta.`)}
    ${tip('Para decidir si es conexo, parte de un vértice y «pinta» todo lo alcanzable. Si queda algo sin pintar, es disconexo. <b>Una arista que está en un ciclo nunca es puente.</b>')}`,
    quiz: [
      { q: 'La ruta $a$–$b$–$c$–$d$–$e$ tiene longitud…', opts: [{ t: '5', why: 'Son 5 vértices, pero la longitud cuenta aristas.' }, { t: '4', ok: true, why: 'Usa $ab, bc, cd, de$: 4 aristas.' }, { t: '3', why: 'Cuenta de nuevo las aristas.' }] },
      { q: '$a$–$b$–$a$ es…', opts: [{ t: 'Un camino de longitud 2', why: 'Un camino no repite vértices y aquí se repite $a$.' }, { t: 'Una trayectoria de longitud 2 que no es camino', ok: true, why: 'Las trayectorias pueden repetir vértices; los caminos no.' }, { t: 'Un circuito', why: 'Un circuito es un camino cerrado; vuelve por la misma arista y repite vértices.' }] },
      { q: 'Si una arista pertenece a un ciclo, entonces…', opts: [{ t: 'Es puente', why: 'Al quitarla, el resto del ciclo mantiene conectados a sus extremos.' }, { t: 'No es puente', ok: true, why: 'Siempre queda otra ruta entre sus extremos.' }, { t: 'Depende del grado', why: 'No depende del grado: basta con estar en un ciclo.' }] },
      { q: 'Un grafo tiene un vértice aislado y el resto conectado. ¿Cuántas componentes tiene?', opts: [{ t: '1', why: 'El vértice aislado no se alcanza desde los demás.' }, { t: '2', ok: true, why: 'El bloque conectado y el vértice aislado.' }, { t: '0', why: 'Todo grafo con vértices tiene al menos una componente.' }] },
    ] });

  T.push({ id: 'familias', unit: 'Grafos', title: 'Familias: $K_n$, $C_n$, $W_n$, $Q_n$, regulares y bipartitos', src: 'Guía de Grafos §5',
    html: `<table class="tbl"><thead><tr><th>Familia</th><th>$|V|$</th><th>$|E|$</th><th>Grados</th></tr></thead><tbody>
      <tr><td>Completo $K_n$</td><td>$n$</td><td>$\\frac{n(n-1)}{2}$</td><td>todos $n-1$</td></tr>
      <tr><td>Ciclo $C_n$ $(n\\ge3)$</td><td>$n$</td><td>$n$</td><td>todos 2</td></tr>
      <tr><td>Rueda $W_n$ <b>(clase, $n\\ge4$)</b></td><td>$n$</td><td>$2(n-1)$</td><td>centro $n-1$; resto 3</td></tr>
      <tr><td>Hipercubo $Q_n$</td><td>$2^n$</td><td>$n\\,2^{n-1}$</td><td>todos $n$</td></tr>
      <tr><td>$k$-regular</td><td>$n$</td><td>$\\frac{nk}{2}$</td><td>todos $k$</td></tr>
      <tr><td>Bipartito completo $K_{m,n}$</td><td>$m+n$</td><td>$mn$</td><td>$n$ en un lado, $m$ en el otro</td></tr></tbody></table>
    ${row(svg(K(5), { width: 180, height: 170, cap: '$K_5$: 10 aristas' }), svg(C(5), { width: 180, height: 170, cap: '$C_5$' }), svg(W6, { width: 180, height: 170, cap: '$W_6$ (clase) = $C_5$ + centro' }), svg(Q3, { width: 180, height: 170, cap: '$Q_3$: 8 vértices, 12 aristas', r: 13 }))}
    ${warn('Cuidado con la notación de la rueda', 'En clase $W_n$ tiene <b>$n$ vértices en total</b> ($C_{n-1}$ + centro). Algunos libros (Rosen) llaman $W_n$ a $C_n$ + centro ($n+1$ vértices, $2n$ aristas). <b>En el examen usa la convención de clase.</b>')}
    ${def('Hipercubo $Q_n$', 'Vértices: las $2^n$ cadenas binarias de longitud $n$; dos son adyacentes si difieren en <b>exactamente un bit</b>.')}
    ${def('Bipartito', '$V = V_1\\cup V_2$ disjuntos y toda arista va de $V_1$ a $V_2$. <b>Criterio:</b> $G$ es bipartito $\\iff$ no tiene ciclos de longitud impar. En particular $C_n$ es bipartito $\\iff n$ es par.')}
    ${row(svg(K33, { width: 230, height: 170, cap: '$K_{3,3}$: 6 vértices, 9 aristas', nodeFill: { 0: 'var(--c1)', 1: 'var(--c1)', 2: 'var(--c1)', 3: 'var(--c2)', 4: 'var(--c2)', 5: 'var(--c2)' }, r: 13 }))}
    ${tip('Para probar si es bipartito, colorea alternando dos colores. Si una arista une dos vértices del mismo color, no lo es. <b>Encontrar un triángulo (o cualquier ciclo impar) basta para decir que no es bipartito.</b>')}`,
    quiz: [
      { q: '¿Cuántas aristas tiene $W_8$ según la convención de clase?', opts: [{ t: '16', why: 'Esa es la convención de Rosen ($C_8$ + centro).' }, { t: '14', ok: true, why: '$2(n-1) = 2\\cdot 7 = 14$: 7 del ciclo + 7 rayos.' }, { t: '28', why: 'Eso sería $K_8$.' }] },
      { q: '$Q_4$ tiene…', opts: [{ t: '16 vértices y 32 aristas', ok: true, why: '$2^4 = 16$, $4\\cdot2^3 = 32$.' }, { t: '16 vértices y 64 aristas', why: 'Se suma $n\\cdot 2^n = 64$ sin dividir entre 2.' }, { t: '8 vértices y 12 aristas', why: 'Ese es $Q_3$.' }] },
      { q: '¿$C_7$ es bipartito?', opts: [{ t: 'Sí', why: '$C_7$ es un ciclo impar.' }, { t: 'No, porque es un ciclo de longitud impar', ok: true, why: 'Bipartito ⇔ sin ciclos impares.' }] },
      { q: 'Un grafo 4-regular con 10 vértices tiene…', opts: [{ t: '40 aristas', why: 'Falta dividir entre 2.' }, { t: '20 aristas', ok: true, why: '$|E| = nk/2 = 10\\cdot4/2$.' }, { t: '14 aristas', why: 'No corresponde a ninguna fórmula.' }] },
      { q: '¿Cuántas aristas tiene $K_{4,3}$?', opts: [{ t: '7', why: '7 es el número de vértices.' }, { t: '12', ok: true, why: '$mn = 4\\cdot 3$.' }, { t: '21', why: 'Eso es $K_7$.' }] },
    ] });

  T.push({ id: 'subgrafos', unit: 'Grafos', title: 'Subgrafos, complemento e isomorfismo', src: 'Guía de Grafos §6–7',
    html: `${def('Subgrafos', `<ul><li><b>Subgrafo:</b> $H=(W,F)$ con $W\\subseteq V$, $F\\subseteq E$.</li><li><b>Inducido por $W$:</b> los vértices de $W$ y <u>todas</u> las aristas de $G$ con ambos extremos en $W$.</li><li><b>Recubridor (generador):</b> contiene todos los vértices de $G$.</li><li><b>Unión:</b> $G_1\\cup G_2 = (V_1\\cup V_2, E_1\\cup E_2)$.</li></ul>`)}
    ${def('Complemento $\\overline{G}$', 'Mismos vértices; contiene exactamente las aristas que le faltan a $G$ para ser $K_n$. $$|E(\\overline G)| = \\tfrac{n(n-1)}{2} - |E(G)|,\\qquad \\operatorname{grad}_{\\overline G}(v) = (n-1) - \\operatorname{grad}_G(v).$$')}
    ${ex('Complemento de $P_4$ (clase)', `${row(svg(g(GR.letters(4), [[0, 1], [1, 2], [2, 3]], [[5, 50], [35, 50], [65, 50], [95, 50]]), { width: 220, height: 90, cap: '$G$: a–b–c–d' }), svg(g(GR.letters(4), [[0, 2], [0, 3], [1, 3]], [[5, 50], [35, 50], [65, 50], [95, 50]]), { width: 220, height: 150, cap: '$\\overline G$: ac, ad, bd' }))}$K_4$ tiene 6 aristas, $G$ tiene 3 ⇒ $\\overline G$ tiene 3. Curiosidad: $\\overline G$ es el camino $c$–$a$–$d$–$b$, otro $P_4$.`)}
    ${def('Isomorfismo', '$G_1\\cong G_2$ si existe $f:V_1\\to V_2$ <b>biyectiva</b> tal que $u,v$ adyacentes en $G_1 \\iff f(u),f(v)$ adyacentes en $G_2$.<br><b>Invariantes (condiciones necesarias):</b> mismo nº de vértices, de aristas, mismo score, mismas componentes, mismos ciclos de cada longitud… Si una falla ⇒ no son isomorfos. Si todas coinciden, todavía hay que construir $f$.')}
    ${ex('Mismo score, no isomorfos (clase)', `${row(svg(C(6), { width: 180, height: 160, cap: '$C_6$' }), svg(g(GR.letters(6), [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]], [[10, 20], [40, 20], [25, 80], [60, 20], [90, 20], [75, 80]]), { width: 220, height: 160, cap: '$C_3\\cup C_3$' }))}Ambos: 6 vértices, 6 aristas, score $(2,2,2,2,2,2)$. <b>No</b> son isomorfos: $C_6$ es conexo y el otro tiene 2 componentes (y triángulos).`)}
    ${tip('Primero intenta descartar con invariantes (rápido). Para demostrar isomorfismo, empareja vértices del mismo grado y verifica <b>todas</b> las aristas.')}`,
    quiz: [
      { q: 'Un grafo simple tiene 6 vértices y 8 aristas. Su complemento tiene…', opts: [{ t: '7 aristas', ok: true, why: '$K_6$ tiene 15 aristas: $15-8 = 7$.' }, { t: '8 aristas', why: 'El complemento tiene las aristas que faltan, no las mismas.' }, { t: '22 aristas', why: 'Se usó $n^2-|E|$ en vez de $n(n-1)/2 - |E|$.' }] },
      { q: 'En un grafo con 7 vértices, $v$ tiene grado 2. En $\\overline G$, $v$ tiene grado…', opts: [{ t: '5', why: 'Se usó $n - 2$; la fórmula es $(n-1) - 2 = 4$.' }, { t: '4', ok: true, why: '$\\operatorname{grad}_{\\overline G}(v) = (n-1) - \\operatorname{grad}_G(v) = 6-2 = 4$.' }, { t: '2', why: 'Los grados cambian en el complemento.' }] },
      { q: '¿Pueden ser isomorfos dos grafos con scores $(1,1,2,2)$ y $(1,2,2,3)$?', opts: [{ t: 'Sí, si se reetiquetan', why: 'El score es invariante: si difiere, nunca son isomorfos.' }, { t: 'No', ok: true, why: 'Scores distintos (y además 3 vs. 4 aristas).' }] },
      { q: 'El subgrafo inducido por $W$ contiene…', opts: [{ t: 'Algunas aristas entre vértices de $W$', why: 'Eso es un subgrafo cualquiera, no necesariamente inducido.' }, { t: 'Todas las aristas de $G$ con ambos extremos en $W$', ok: true, why: 'Es la definición: $E(H) = E(G)\\cap\\binom{W}{2}$.' }, { t: 'Todos los vértices de $G$', why: 'Eso define al subgrafo recubridor.' }] },
    ] });

  T.push({ id: 'matrices', unit: 'Grafos', title: 'Matrices de adyacencia e incidencia', src: 'Guía de Grafos §8',
    html: `${def('Matriz de adyacencia $A_G$ ($n\\times n$)', `$a_{ij} = 1$ si $\\{v_i,v_j\\}\\in E$, si no $0$.<ul><li>Depende del orden de los vértices (hasta $n!$ matrices para un grafo).</li><li>Grafo simple no dirigido: <b>simétrica</b>, diagonal de ceros, suma de la fila $i$ = $\\operatorname{grad}(v_i)$.</li><li>Multigrafo: $a_{ij}$ = número de aristas entre $v_i$ y $v_j$.</li><li>Bucle en $v_i$: en clase se anota $a_{ii} = 1$ (¡pero aporta 2 al grado!).</li><li>Digrafo: $a_{ij}=1$ si hay arista de $v_i$ a $v_j$; fila $i$ suma $\\operatorname{grad}^+$, columna $j$ suma $\\operatorname{grad}^-$.</li></ul>`)}
    ${box('thm', 'Teoremas con potencias de A (grafo simple)', '<ol><li>La entrada $(i,j)$ de $A^k$ es el <b>número de trayectorias de longitud $k$</b> de $v_i$ a $v_j$ (pueden repetir vértices).</li><li>$(A^2)_{ii} = \\operatorname{grad}(v_i)$, así que $\\operatorname{traza}(A^2) = \\sum \\operatorname{grad}(v) = 2|E|$.</li></ol>')}
    ${ex('Ejercicio resuelto (clase)', `${svg(g(GR.letters(4), [[0, 1], [0, 2], [1, 2], [2, 3]], [[10, 15], [10, 85], [55, 50], [95, 50]]), { width: 230, height: 150 })}
      $$A=\\begin{pmatrix}0&1&1&0\\\\1&0&1&0\\\\1&1&0&1\\\\0&0&1&0\\end{pmatrix},\\ A^2=\\begin{pmatrix}2&1&1&1\\\\1&2&1&1\\\\1&1&3&0\\\\1&1&0&1\\end{pmatrix},\\ A^3=\\begin{pmatrix}2&3&4&1\\\\3&2&4&1\\\\4&4&2&3\\\\1&1&3&0\\end{pmatrix}$$
      Diagonal de $A^2$: $2,2,3,1$ = grados. $\\operatorname{traza}(A^2) = 8 = 2|E|$ ⇒ $|E|=4$. $(A^3)_{a,c} = 4$: $abac,\\ acac,\\ acbc,\\ acdc$. $(A^2)_{c,d} = 0$.`)}
    ${def('Matriz de incidencia $M$ ($n\\times m$)', 'Filas = vértices, columnas = aristas. <b>No dirigido:</b> $m_{ij}=1$ si $v_i$ es incidente con $e_j$ (cada columna tiene dos unos; fila $i$ suma $\\operatorname{grad}(v_i)$ sin bucles). <b>Dirigido:</b> $m_{ij}=1$ si $v_i$ es el inicio de $e_j$, $-1$ si es el final, $0$ si no.')}
    ${tip('Siempre <b>escribe el orden</b> de vértices (y de aristas) que usas antes de dar la matriz.')}`,
    quiz: [
      { q: 'Si la diagonal de $A^2$ de un grafo simple es $(3,2,2,1,2)$, ¿cuántas aristas tiene?', opts: [{ t: '10', why: '10 es la traza, igual a $2|E|$.' }, { t: '5', ok: true, why: '$\\operatorname{traza}(A^2) = 10 = 2|E|$.' }, { t: '4', why: 'Revisa la suma: $3+2+2+1+2 = 10$.' }] },
      { q: 'La entrada $(i,j)$ de $A^3$ cuenta…', opts: [{ t: 'Caminos (sin repetir vértices) de longitud 3', why: 'Cuenta trayectorias: pueden repetir vértices.' }, { t: 'Trayectorias de longitud 3 de $v_i$ a $v_j$', ok: true, why: 'Teorema de potencias de la matriz de adyacencia.' }, { t: 'Aristas entre $v_i$ y $v_j$', why: 'Eso es $A$, no $A^3$.' }] },
      { q: 'En la matriz de incidencia de un digrafo, cada columna tiene…', opts: [{ t: 'Dos unos', why: 'Eso es en el caso no dirigido.' }, { t: 'Un $1$ (inicio) y un $-1$ (final)', ok: true, why: 'Convención de clase para digrafos.' }, { t: 'Solo un 1', why: 'Falta marcar el vértice final con $-1$.' }] },
      { q: 'La matriz de adyacencia de un grafo simple no dirigido es siempre…', opts: [{ t: 'Simétrica con diagonal de ceros', ok: true, why: 'Sin bucles ⇒ diagonal 0; no dirigido ⇒ $a_{ij}=a_{ji}$.' }, { t: 'Triangular', why: 'No hay razón para que lo sea.' }, { t: 'Única', why: 'Depende del orden de los vértices.' }] },
    ] });

  T.push({ id: 'euler', unit: 'Grafos', title: 'Caminos y ciclos eulerianos', src: 'Guía de Grafos §9 · Examen 2021-2',
    html: `${def('Euler: importan las ARISTAS', 'Un <b>camino euleriano</b> pasa por <u>todas las aristas exactamente una vez</u> (puede repetir vértices). Un <b>ciclo euleriano</b> es un camino euleriano cerrado.')}
    ${box('thm', 'Teorema y corolario', '<b>Teorema.</b> $G$ (grafo o multigrafo no dirigido) tiene ciclo euleriano $\\iff$ $G$ es conexo y <b>todos</b> sus vértices tienen grado par.<br><b>Corolario.</b> $G$ tiene camino euleriano $\\iff$ es conexo y tiene <b>0 o 2</b> vértices de grado impar. Si son 2, el camino empieza en uno y termina en el otro.')}
    <table class="tbl"><thead><tr><th>Conexo y…</th><th>Conclusión</th></tr></thead><tbody><tr><td>0 vértices impares</td><td>Ciclo euleriano (y también camino)</td></tr><tr><td>2 vértices impares</td><td>Camino euleriano abierto, sin ciclo</td></tr><tr><td>4 o más impares</td><td>Ni camino ni ciclo</td></tr></tbody></table>
    ${ex('Puentes de Königsberg (clase)', `${svg(konig, { width: 240, height: 200 })}Multigrafo conexo con grados $A=5$, $B=3$, $C=3$, $D=3$: <b>4 vértices impares</b> ⇒ ni camino ni ciclo euleriano (Euler, 1736).`)}
    ${ex('Familias (clase)', '$K_5$: todos grado 4 ⇒ ciclo. En general $K_n$ tiene ciclo euleriano $\\iff n$ impar. $K_4$: 4 vértices de grado 3 ⇒ nada. $K_{2,3}$: 2 impares ⇒ camino $u1v2u3v$.')}
    ${tip('Orden de trabajo: (1) ¿es conexo? (ignorando vértices aislados); (2) cuenta los vértices de grado impar; (3) si son 2, empieza el recorrido en uno de ellos. <b>Para «borrar aristas y lograr camino euleriano»</b> (examen 2021-2): cada arista borrada cambia la paridad de sus dos extremos; borra aristas que unan pares de vértices impares, sin desconectar el grafo.')}`,
    quiz: [
      { q: 'Un grafo conexo tiene exactamente 4 vértices de grado impar. ¿Tiene camino euleriano?', opts: [{ t: 'Sí', why: 'Se necesitan 0 o 2 vértices impares.' }, { t: 'No', ok: true, why: 'Por el corolario: 4 impares ⇒ ni camino ni ciclo.' }, { t: 'Solo ciclo', why: 'El ciclo exige 0 impares.' }] },
      { q: '¿Para qué $n\\ge3$ tiene $K_n$ un ciclo euleriano?', opts: [{ t: '$n$ par', why: 'Con $n$ par cada grado $n-1$ es impar.' }, { t: '$n$ impar', ok: true, why: 'Grado $n-1$ par ⇔ $n$ impar; además $K_n$ es conexo.' }, { t: 'Todo $n$', why: '$K_4$ es contraejemplo.' }] },
      { q: 'Un grafo tiene todos sus grados pares pero es disconexo (dos componentes con aristas). ¿Tiene ciclo euleriano?', opts: [{ t: 'Sí, los grados son pares', why: 'El teorema exige además conexidad.' }, { t: 'No', ok: true, why: 'No se puede pasar de una componente a otra.' }] },
      { q: 'En un camino euleriano abierto, ¿dónde empieza?', opts: [{ t: 'En cualquier vértice', why: 'Solo si hay 0 impares (ciclo).' }, { t: 'En uno de los dos vértices de grado impar', ok: true, why: 'Y termina en el otro.' }, { t: 'En el de mayor grado', why: 'El grado máximo no importa.' }] },
      { q: 'Al borrar una arista $uv$ de un grafo…', opts: [{ t: 'Solo cambia la paridad de $u$', why: 'Cambian ambos extremos.' }, { t: 'Cambia la paridad del grado de $u$ y de $v$', ok: true, why: 'Cada uno pierde 1 de grado.' }, { t: 'No cambia ninguna paridad', why: 'Restar 1 cambia la paridad.' }] },
    ] });

  T.push({ id: 'hamilton', unit: 'Grafos', title: 'Caminos y ciclos hamiltonianos (y viajero)', src: 'Guía de Grafos §10 · Examen 2021-2',
    html: `${def('Hamilton: importan los VÉRTICES', 'Sea $|V|\\ge3$. Un <b>ciclo hamiltoniano</b> pasa por cada vértice exactamente una vez y regresa al inicial. Un <b>camino hamiltoniano</b> es un camino (no cerrado) con todos los vértices exactamente una vez.')}
    ${box('thm', 'Condiciones suficientes (no hay criterio «si y solo si»)', '<b>Dirac:</b> $G$ simple, $n\\ge3$ y $\\operatorname{grad}(v)\\ge \\frac n2$ para todo $v$ ⇒ ciclo hamiltoniano.<br><b>Ore:</b> $G$ simple, $n\\ge3$ y $\\operatorname{grad}(u)+\\operatorname{grad}(v)\\ge n$ para cada par $u,v$ <u>no adyacentes</u> ⇒ ciclo hamiltoniano.<br>Si no se cumplen, <b>no se concluye nada</b> (p. ej. $C_n$ es hamiltoniano y no cumple Dirac para $n\\ge5$).')}
    ${box('thm', 'Proposición de clase (para NEGAR)', 'Si $G$ tiene ciclo hamiltoniano, tiene un subgrafo $H$ que: (1) contiene todos los vértices; (2) es conexo; (3) tiene igual número de aristas que de vértices; (4) <b>cada vértice de $H$ tiene grado 2</b>.<br>Consecuencias: <ul><li>Un vértice de grado 1 impide el ciclo.</li><li>Si $\\operatorname{grad}(v)=2$, sus dos aristas están en el ciclo (forzadas).</li><li>Si un vértice queda forzado a usar 3+ aristas ⇒ no hay ciclo.</li><li>Si las aristas forzadas cierran un ciclo que no pasa por todos los vértices ⇒ no hay ciclo.</li><li>$K_{m,n}$ con $m\\ne n$ no tiene ciclo hamiltoniano (el ciclo alterna lados).</li></ul>')}
    ${ex('Demostrar que no hay ciclo hamiltoniano (clase)', `${svg(bow, { width: 240, height: 160, hi: new Set([0, 1, 2, 3, 4, 5]), hiColor: 'var(--bad)' })}$a,b,d,e$ tienen grado 2 ⇒ sus aristas están forzadas: $ab,ac,bc,cd,ce,de$. Entonces $c$ tendría grado 4 en $H$, contradicción. <b>No hay ciclo hamiltoniano</b> (sí hay camino: $abcde$).`)}
    ${ex('Dirac y Ore (clase)', 'a) $K_{3,3}$: $n=6$, grados $3\\ge 3$ ⇒ Dirac ⇒ sí ($u_1w_1u_2w_2u_3w_3u_1$).<br>b) $K_4$ sobre $\\{a,b,c,d\\}$ + $x$ unido a $a,b$: Dirac falla ($2<2.5$), pero pares no adyacentes $\\{x,c\\},\\{x,d\\}$: $2+3=5\\ge5$ ⇒ Ore ⇒ sí ($xacdbx$).')}
    ${ex('Problema del viajero (clase)', `${svg(tsp, { width: 220, height: 200, hi: new Set([0, 1, 2, 3]) })}Con 4 ciudades hay $(4-1)! = 6$ rutas desde $A$ (3 pares inversos): $ABCDA = 125$, $ABDCA = 140$, $ACBDA = 155$. <b>Mínimo: 125 km</b> ($ABCDA$ o su inversa).`)}
    <table class="tbl"><thead><tr><th>Euleriano</th><th>Hamiltoniano</th></tr></thead><tbody><tr><td>Todas las <b>aristas</b> una vez</td><td>Todos los <b>vértices</b> una vez</td></tr><tr><td>Puede repetir vértices</td><td>No repite vértices; no necesita usar todas las aristas</td></tr><tr><td>Criterio exacto: conexo + nº de impares (0 o 2)</td><td>Sin criterio exacto: Dirac/Ore para afirmar; proposición del subgrafo $H$ para negar</td></tr></tbody></table>
    ${tip('Para negar Hamilton en el examen: marca primero las aristas <b>forzadas</b> (vértices de grado 2), luego razona por casos con un vértice clave (p. ej. «el vértice central» del examen 2021-2) usando simetría para reducir casos.')}`,
    quiz: [
      { q: '¿$K_{3,5}$ tiene ciclo hamiltoniano?', opts: [{ t: 'Sí, por Dirac', why: 'Dirac exige grado $\\ge 4$ y los vértices del lado de 5 tienen grado 3.' }, { t: 'No, porque los lados tienen distinto tamaño', ok: true, why: 'Un ciclo en un bipartito alterna lados, necesita $m=n$.' }] },
      { q: 'Un grafo simple con 8 vértices tiene todos los grados $\\ge 4$. ¿Qué se puede asegurar?', opts: [{ t: 'Tiene ciclo euleriano', why: 'No se sabe si todos los grados son pares.' }, { t: 'Tiene ciclo hamiltoniano (Dirac)', ok: true, why: '$4\\ge 8/2$.' }, { t: 'Nada', why: 'Dirac sí aplica.' }] },
      { q: 'Un grafo no cumple Dirac ni Ore. Entonces…', opts: [{ t: 'No es hamiltoniano', why: 'Son condiciones suficientes, no necesarias.' }, { t: 'No se puede concluir nada', ok: true, why: 'Ej.: $C_6$ es hamiltoniano y no cumple ninguna.' }] },
      { q: 'Si $\\operatorname{grad}(v) = 2$ en un grafo con ciclo hamiltoniano, entonces…', opts: [{ t: 'Sus dos aristas están en el ciclo', ok: true, why: 'En $H$ cada vértice tiene grado exactamente 2.' }, { t: 'Solo una de sus aristas está en el ciclo', why: 'Necesita entrar y salir.' }, { t: 'No se puede saber', why: 'Está forzado.' }] },
      { q: 'Con 5 ciudades, ¿cuántas rutas hay desde un origen fijo en el problema del viajero (contando ambos sentidos)?', opts: [{ t: '$5! = 120$', why: 'El origen está fijo.' }, { t: '$4! = 24$', ok: true, why: '$(n-1)!$; serían $12$ si no importa el sentido.' }, { t: '$12$', why: 'Eso es $(n-1)!/2$, sin distinguir sentido.' }] },
    ] });

  T.push({ id: 'dijkstra', unit: 'Grafos', title: 'Árbol expandido, árbol expandido mínimo y Dijkstra', src: 'Diapositivas DIJKSTRA',
    html: `${def('Árbol expandido (generador / recubridor)', 'Sea $G=(V,E)$ no dirigido. $T_1=(V_1,E_1)$ es un <b>árbol expandido</b> si contiene <u>todos los vértices</u> de $G$ y <u>no tiene circuitos</u>.')}
    ${ex('Todos los árboles expandidos (clase)', `${svg(spanG, { width: 230, height: 150 })}El único circuito es $v_1v_2v_4$; para eliminarlo se quita <b>una</b> de sus 3 aristas ⇒ <b>3 árboles expandidos</b>:
      ${row(...[[2], [3], [4]].map(([k]) => svg(spanG, { width: 150, height: 110, hi: new Set([0, 1, 2, 3, 4, 5].filter((x) => x !== k)) })))}`)}
    ${def('Árbol expandido mínimo', 'Para un grafo conexo <b>pesado</b>: árbol expandido con el <b>menor peso total</b> posible comparado con los otros árboles expandidos.')}
    ${ex('Dos árboles expandidos (clase)', `${row(svg(mstG, { width: 220, height: 180, hi: mstT, cap: '$T$: peso 4+2+1+3+2 = 12' }), svg(mstG, { width: 220, height: 180, hi: mstT2, cap: "$T'$: peso 4+5+2+6+3 = 20" }))}Ambos tienen los 6 vértices y 5 aristas sin circuitos; $T$ pesa menos.`)}
    ${def('Algoritmo de Dijkstra (clase)', `Encuentra la trayectoria más corta desde un vértice inicial en un grafo pesado con <b>pesos positivos</b>.<ol><li>Se da un vértice inicial $v_0$ y se considera el árbol $T = \\{v_0\\}$. La distancia de un vértice a sí mismo es 0.</li><li>Se etiqueta cada vértice con el par $(d_{\\min}, v_i)$: $d_{\\min}$ = distancia acumulada mínima, $v_i$ = vértice anterior.</li><li>En cada paso: el vértice <b>temporal</b> con menor $d_{\\min}$ pasa a <b>permanente</b>; se actualizan las etiquetas de sus vecinos temporales: si $d(u) + w(u,v) < d(v)$, la etiqueta de $v$ pasa a $(d(u)+w(u,v),\\ u)$.</li><li>Se repite hasta que el vértice final pedido sea permanente. El camino se lee <b>hacia atrás</b> siguiendo los $v_i$.</li></ol>`)}
    ${ex('Ejemplo de clase: de $a$ a $z$', (() => { const r = G.dijkstra(F.dijkClase, 0); const p = G.pathTo(r.prev, 5); return `${svg(F.dijkClase, { width: 330, height: 200, hi: G.edgeIndexSet(F.dijkClase, p), nodeNote: Object.fromEntries(r.d.map((d, i) => [i, `(${d},${r.prev[i] < 0 ? '–' : F.dijkClase.labels[r.prev[i]]})`])) })}
      Orden en que se hacen permanentes: $a(0), b(3), c(4), e(8), d(9), z(16)$. Camino más corto: $\\boxed{a\\to b\\to d\\to z}$ con longitud <b>16</b>.`; })())}
    ${ex('Digrafo (clase): de $A$ a todos', (() => { const r = G.dijkstra(F.dijkDir, 0); const hi = new Set(); r.prev.forEach((p, v) => { if (p >= 0) hi.add(F.dijkDir.edges.findIndex(([a, b]) => a === p && b === v)); }); return `${svg(F.dijkDir, { width: 330, height: 210, uid: 'dd', hi, nodeNote: Object.fromEntries(r.d.map((d, i) => [i, d])) })}Permanentes: $A(0), C(3), E(5), B(7), D(9)$. Árbol de caminos mínimos: $A\\to C$, $C\\to B$, $C\\to E$, $B\\to D$. En un digrafo solo se avanza en el sentido de la flecha.`; })())}
    ${warn('Dijkstra NO es «árbol expandido mínimo»', 'Dijkstra minimiza la distancia <b>desde el vértice inicial</b> a cada vértice; el árbol que forma (los $v_i$) es un árbol de caminos más cortos, que no tiene por qué ser el de menor peso total.')}
    ${tip('Presenta siempre la <b>tabla de etiquetas</b> paso a paso (una columna por vértice). Marca cuál vértice se hace permanente en cada paso. Al final, reconstruye el camino hacia atrás y da la longitud. Si hay empate, dilo y elige uno (convención de esta web: el que va primero en orden alfabético).')}`,
    quiz: [
      { q: 'En Dijkstra, ¿qué vértice pasa a permanente en cada paso?', opts: [{ t: 'El vecino más cercano al último permanente', why: 'Se compara la distancia acumulada desde el inicio, no la arista.' }, { t: 'El temporal con menor distancia acumulada $d_{\\min}$', ok: true, why: 'Es la regla del algoritmo.' }, { t: 'El de mayor grado', why: 'El grado no interviene.' }] },
      { q: 'La etiqueta $(9, b)$ en el vértice $d$ significa…', opts: [{ t: 'El peso de la arista $bd$ es 9', why: 'Es la distancia acumulada desde el inicio.' }, { t: 'La menor distancia conocida a $d$ es 9 y se llega desde $b$', ok: true, why: '$(d_{\\min}, v_i)$: distancia y vértice anterior.' }] },
      { q: '¿Dijkstra funciona con pesos negativos?', opts: [{ t: 'Sí, siempre', why: 'La clase lo enuncia para pesos positivos.' }, { t: 'No: el algoritmo es para pesos positivos', ok: true, why: 'Un vértice permanente podría mejorar después con pesos negativos.' }] },
      { q: 'Un árbol expandido de un grafo conexo con 6 vértices…', opts: [{ t: 'Contiene los 6 vértices y no tiene circuitos', ok: true, why: 'Es la definición de la clase.' }, { t: 'Contiene todas las aristas', why: 'Si tuviera todas, tendría los circuitos del grafo.' }, { t: 'Es único', why: 'El ejemplo de clase tiene 3 árboles expandidos.' }] },
      { q: 'En el ejemplo de clase ($a\\to z$), ¿por qué $e$ se hace permanente antes que $d$?', opts: [{ t: 'Porque $d(e)=8 < d(d)=9$', ok: true, why: '$e$ llega por $b$: $3+5=8$; $d$ por $b$: $3+6=9$.' }, { t: 'Porque $e$ va antes alfabéticamente', why: 'No hay empate: $8<9$.' }] },
    ] });

  // ---------------- RECURRENCIAS ----------------
  T.push({ id: 'rec-def', unit: 'Recurrencias', title: 'Relaciones de recurrencia: definición y modelado', src: 'MD2 Cap. 3 · Recurrencia 1',
    html: `${def('Relación de recurrencia', 'Para la secuencia $a_0,a_1,a_2,\\dots$ es una igualdad que relaciona $a_n$ con algunos de los términos anteriores $a_0,\\dots,a_{n-1}$. Las <b>condiciones iniciales</b> son los valores de algunos de los primeros términos.')}
    ${ex('Motivación: ordenamiento burbuja (clase)', 'Si $a_n$ = número de comparaciones para ordenar $n$ números: $$a_n = a_{n-1} + (n-1),\\quad n\\ge2,\\quad a_1=0.$$ Resolviendo (Ej. 4): $a_n = \\frac{n(n-1)}{2}$.')}
    ${ex('Ejemplo 1 (clase)', 'Si $S_n$ = cantidad de subconjuntos de un conjunto de $n$ elementos: $S_n = 2S_{n-1}$, con $S_0 = 1$ (cada subconjunto de $n-1$ elementos se toma con o sin el nuevo elemento).')}
    ${ex('Ejemplo 2 (clase): secuencia de segundo orden', '$7, 16, 29, 46, 67, \\dots$ Diferencias: $9,13,17,21$; segundas diferencias: $4,4,4$ (constantes). Extendiendo hacia atrás: $a_0 = 2$, $b_0=5$. $$a_n = a_{n-1} + 4n + 1,\\ a_0 = 2\\quad\\Longrightarrow\\quad a_n = 2n^2+3n+2.$$ (Verificado: $a_1=7, a_2=16, a_3=29, a_4=46, a_5=67$.)')}
    ${ex('Ejemplo 3 (clase): cadenas de $n$ bits sin el patrón 111', `Casos según cómo empieza la cadena (exhaustivos y excluyentes):<ol><li>Empieza con <b>0</b>: lo que sigue ($n-1$ bits) no contiene 111 ⇒ $a_{n-1}$.</li><li>Empieza con <b>10</b>: siguen $n-2$ bits ⇒ $a_{n-2}$.</li><li>Empieza con <b>11</b>: lo siguiente debe ser 0 (si no, aparece 111) ⇒ empieza con <b>110</b> ⇒ $a_{n-3}$.</li></ol>Por el principio de la suma: $$a_n = a_{n-1}+a_{n-2}+a_{n-3},\\ n\\ge4,\\quad a_1=2,\\ a_2=4,\\ a_3=7.$$`)}
    ${ex('Ejemplo 9 (clase): $n$ bits sin dos 0 consecutivos', 'Empieza con 1 ⇒ $a_{n-1}$; empieza con 0 ⇒ el siguiente es 1 (empieza con 01) ⇒ $a_{n-2}$. $$a_n = a_{n-1}+a_{n-2},\\quad a_1 = 2,\\ a_2 = 3.$$')}
    ${tip('Para modelar cadenas: divide en casos según el <b>inicio</b> de la cadena hasta que lo que queda sea «una cadena válida más corta». Calcula las condiciones iniciales contando a mano ($a_1, a_2, \\dots$) y comprueba un término con la recurrencia.')}`,
    quiz: [
      { q: 'Para las cadenas de $n$ bits sin 111, ¿cuál es $a_4$?', opts: [{ t: '13', ok: true, why: '$a_4 = a_3+a_2+a_1 = 7+4+2$.' }, { t: '16', why: '16 son todas las cadenas de 4 bits; hay que quitar 0111, 1110, 1111.' }, { t: '11', why: 'Revisa: $7+4+2$.' }] },
      { q: 'En el caso «empieza con 11» (sin 111), ¿por qué queda $a_{n-3}$?', opts: [{ t: 'Porque el tercer bit es forzosamente 0', ok: true, why: 'La cadena empieza con 110 y lo que sigue ($n-3$ bits) es libre de 111.' }, { t: 'Porque se quitan los dos 1', why: 'Eso daría $a_{n-2}$, que permitiría un 1 en tercera posición.' }] },
      { q: '$S_n$ = número de subconjuntos de un conjunto de $n$ elementos cumple…', opts: [{ t: '$S_n = S_{n-1} + 1$', why: 'Se duplica, no se suma 1.' }, { t: '$S_n = 2S_{n-1}$, $S_0=1$', ok: true, why: 'Cada subconjunto viejo se toma con o sin el nuevo elemento.' }, { t: '$S_n = nS_{n-1}$', why: 'Eso da $n!$.' }] },
      { q: 'Cadenas de $n$ bits sin dos 0 consecutivos: $a_1, a_2$ valen…', opts: [{ t: '$2, 3$', ok: true, why: 'n=1: 0, 1. n=2: 01, 10, 11.' }, { t: '$2, 4$', why: '00 no es válida.' }, { t: '$1, 2$', why: 'Con 1 bit, ambas cadenas son válidas.' }] },
    ] });

  T.push({ id: 'rec-1', unit: 'Recurrencias', title: 'Recurrencias de primer orden', src: 'MD2 Cap. 3 · Recurrencia 1',
    html: `${def('Lineal de primer orden con coeficientes constantes', '$$a_n + c\\,a_{n-1} = f(n).$$ Si $f(n) = 0$ es <b>homogénea</b>.')}
    ${box('thm', 'Caso homogéneo', 'La solución de $a_n = -c\\,a_{n-1}$, $n\\ge1$, con $a_0 = A$ es $$a_n = A(-c)^n,\\quad n\\ge0.$$')}
    ${box('thm', 'Caso $a_n = a_{n-1} + f(n)$: por iteración', 'Desenrollando: $a_n = a_0 + f(1) + f(2) + \\cdots + f(n) = a_0 + \\sum_{i=1}^n f(i)$. Funciona si la suma es conocida (p. ej. $\\sum i = \\frac{n(n+1)}2$, $\\sum i^2 = \\frac{n(n+1)(2n+1)}6$). Si no (p. ej. $f(n) = (n^2+1)\\sin n$), se usan los métodos de la parte no homogénea.')}
    ${ex('Ejemplo 4', '$a_n = a_{n-1} + (n-1)$, $a_1=0$: $a_n = 0+1+2+\\cdots+(n-1) = \\frac{n(n-1)}{2}$.')}
    ${ex('Ejemplo 5', '$a_n = a_{n-1} + 2n$, $a_0 = 0$: $a_n = 2(1+2+\\cdots+n) = n(n+1)$.')}
    ${ex('Ejemplo 6 (coeficientes variables)', '$a_n = n\\,a_{n-1}$, $a_0 = 1$: $a_n = n(n-1)\\cdots 1\\cdot a_0 = n!$.')}
    ${ex('Ejemplo 8 (Recurrencia 2)', '$a_n = a_{n-1} + 3n$, $a_0=-2$: $a_n = -2 + 3\\frac{n(n+1)}{2}$.')}
    ${ex('Ejemplo 9 (Recurrencia 2)', '$a_{n+1} = a_n + (n+1)^2$, $a_1 = 1$: $a_n = 1^2+2^2+\\cdots+n^2 = \\frac{n(n+1)(2n+1)}{6}$.')}
    ${tip('Al iterar, escribe 3–4 pasos explícitos ($a_1 = \\dots$, $a_2 = \\dots$) para que se vea el patrón, y <b>cuida desde qué índice empieza la suma</b> (depende de la condición inicial: $a_0$ o $a_1$). Comprueba la fórmula con un valor pequeño.')}`,
    quiz: [
      { q: 'La solución de $a_n = 5a_{n-1}$, $a_0 = 3$ es…', opts: [{ t: '$a_n = 3\\cdot 5^n$', ok: true, why: '$a_n = A(-c)^n$ con $-c = 5$, $A=3$.' }, { t: '$a_n = 5\\cdot 3^n$', why: 'Se intercambiaron base y constante.' }, { t: '$a_n = 3(-5)^n$', why: 'Aquí $a_n - 5a_{n-1}=0$, o sea $c = -5$, $-c = 5$.' }] },
      { q: '$a_n = a_{n-1} + 2n$, $a_0 = 0$. ¿$a_3$?', opts: [{ t: '12', ok: true, why: '$2+4+6 = 12 = 3\\cdot4$.' }, { t: '6', why: 'Ese es $a_2$.' }, { t: '9', why: 'Suma $2(1+2+3)$.' }] },
      { q: '$a_n = n a_{n-1}$, $a_0=1$ tiene solución…', opts: [{ t: '$n!$', ok: true, why: 'Producto $n(n-1)\\cdots1$.' }, { t: '$n^n$', why: 'Los factores van bajando.' }, { t: '$2^n$', why: 'El factor no es constante.' }] },
      { q: '¿Por qué $a_n = a_{n-1} + (n^2+1)\\sin n$ es difícil por iteración?', opts: [{ t: 'Porque la suma $\\sum (i^2+1)\\sin i$ no tiene forma cerrada sencilla', ok: true, why: 'Comentario de la clase.' }, { t: 'Porque no es lineal', why: 'Sí es lineal en $a_n$.' }] },
    ] });

  T.push({ id: 'rec-2', unit: 'Recurrencias', title: 'Segundo orden homogéneas: ecuación característica', src: 'MD2 Cap. 3 · Recurrencia 1',
    html: `${def('Lineal de segundo orden con coeficientes constantes', '$$c_n a_n + c_{n-1}a_{n-1} + c_{n-2}a_{n-2} = f(n).$$ Homogénea si $f(n)=0$. Probando $a_n = c\\,r^n$ ($c,r\\neq0$) se obtiene la <b>ecuación característica</b>: $$c_n r^2 + c_{n-1} r + c_{n-2} = 0.$$')}
    <table class="tbl"><thead><tr><th>Raíces</th><th>Solución general</th></tr></thead><tbody>
      <tr><td>Reales distintas $r_1\\neq r_2$</td><td>$a_n = A r_1^n + B r_2^n$, $A,B\\in\\mathbb R$</td></tr>
      <tr><td>Reales iguales $r_1=r_2=r$</td><td>$a_n = A r^n + B\\,n\\,r^n$</td></tr>
      <tr><td>Complejas $a\\pm bi$</td><td>$a_n = A r_1^n + B r_2^n$, $A,B\\in\\mathbb C$; con Moivre: $a_n = (\\sqrt{a^2+b^2})^n\\big((A+B)\\cos(\\theta n) + (A-B)i\\sin(\\theta n)\\big)$, $\\theta = \\arg(a+bi)$</td></tr></tbody></table>
    ${ex('Ejemplo 7: $a_n + a_{n-1} - 6a_{n-2} = 0$, $a_0=1$, $a_1=2$', '$r^2 + r - 6 = 0 \\Rightarrow r = 2,\\ -3$. $a_n = A2^n + B(-3)^n$. $A + B = 1$, $2A - 3B = 2$ ⇒ $A=1$, $B=0$. $$a_n = 2^n.$$')}
    ${ex('Ejemplo 8: Fibonacci $F_n = F_{n-1}+F_{n-2}$, $F_0=0$, $F_1=1$', '$r^2 - r - 1 = 0 \\Rightarrow r = \\frac{1\\pm\\sqrt5}{2}$. $$F_n = \\frac1{\\sqrt5}\\left(\\frac{1+\\sqrt5}2\\right)^n - \\frac1{\\sqrt5}\\left(\\frac{1-\\sqrt5}2\\right)^n.$$')}
    ${ex('Ejemplo 9: sin dos 0 consecutivos, $a_n = a_{n-1}+a_{n-2}$, $a_1=2$, $a_2=3$', 'Mismas raíces $\\varphi,\\psi = \\frac{1\\pm\\sqrt5}2$. Con $a_1=2$, $a_2=3$: $$a_n = \\frac{5+3\\sqrt5}{10}\\left(\\frac{1+\\sqrt5}2\\right)^n + \\frac{5-3\\sqrt5}{10}\\left(\\frac{1-\\sqrt5}2\\right)^n$$ (es $a_n = F_{n+2}$; verificado para $n=1..19$).')}
    ${ex('Ejemplo 10: $a_{n+2} = 4a_{n+1} - 4a_n$, $a_0=1$, $a_1=3$', '$r^2-4r+4 = 0 \\Rightarrow r=2$ doble. $a_n = (A + Bn)2^n$. $A=1$; $2(1+B)=3 \\Rightarrow B=\\frac12$. $$a_n = 2^n + n\\,2^{n-1}.$$')}
    ${ex('Ejemplo 11: $a_n = 2(a_{n-1} - a_{n-2})$, $a_0=1$, $a_1=2$', '$r^2-2r+2=0 \\Rightarrow r = 1\\pm i$, $\\rho=\\sqrt2$, $\\theta=\\frac\\pi4$. $a_n = (\\sqrt2)^n(C\\cos\\frac{n\\pi}4 + D\\sin\\frac{n\\pi}4)$ con $C = A+B$, $D=(A-B)i$. $C = 1$; $\\sqrt2(\\frac{\\sqrt2}2 + D\\frac{\\sqrt2}2) = 2 \\Rightarrow D=1$. $$a_n = (\\sqrt2)^n\\left(\\cos\\tfrac{n\\pi}4 + \\sin\\tfrac{n\\pi}4\\right).$$')}
    ${tip('Pasa todo a un lado para escribir la ecuación característica <b>con los signos correctos</b>: $a_n = p\\,a_{n-1} + q\\,a_{n-2}$ ⇒ $r^2 - p\\,r - q = 0$. Si las condiciones iniciales son $a_1, a_2$ (no $a_0,a_1$), sustituye $n=1,2$.')}`,
    quiz: [
      { q: 'La ecuación característica de $a_n = 5a_{n-1} - 6a_{n-2}$ es…', opts: [{ t: '$r^2 - 5r + 6 = 0$', ok: true, why: 'Pasando todo a un lado: $a_n - 5a_{n-1} + 6a_{n-2} = 0$.' }, { t: '$r^2 + 5r - 6 = 0$', why: 'Error de signos.' }, { t: '$r^2 - 5r - 6 = 0$', why: 'El $-6a_{n-2}$ pasa como $+6$.' }] },
      { q: 'Si la ecuación característica tiene raíz doble $r=3$, la solución general es…', opts: [{ t: '$A3^n + B3^n$', why: 'Es en realidad una sola constante: no alcanza para 2 condiciones iniciales.' }, { t: '$A3^n + Bn3^n$', ok: true, why: 'Caso 2: se multiplica por $n$.' }, { t: '$(A+B)3^n$', why: 'Mismo problema: solo una constante efectiva.' }] },
      { q: 'Las raíces de $r^2 - 2r + 2 = 0$ son…', opts: [{ t: '$1\\pm i$', ok: true, why: '$r = \\frac{2\\pm\\sqrt{4-8}}{2} = 1\\pm i$.' }, { t: '$2, 1$', why: 'Ese polinomio sería $r^2-3r+2$.' }, { t: '$-1\\pm i$', why: 'Error de signo.' }] },
      { q: 'Para $1+i$, el módulo y el argumento son…', opts: [{ t: '$\\sqrt2$ y $\\pi/4$', ok: true, why: '$\\sqrt{1^2+1^2}$; $\\arctan(1/1)$.' }, { t: '$2$ y $\\pi/4$', why: 'El módulo es $\\sqrt{a^2+b^2}$.' }, { t: '$\\sqrt2$ y $\\pi/2$', why: '$\\pi/2$ es el argumento de $i$.' }] },
    ] });

  T.push({ id: 'rec-k', unit: 'Recurrencias', title: 'Orden $k$ y no homogéneas: solución particular', src: 'MD2 Cap. 3 · Recurrencia 2',
    html: `${def('Lineal de orden $k$', '$$c_0a_n + c_1a_{n-1} + \\cdots + c_ka_{n-k} = f(n),\\quad c_0\\neq0,\\ c_k\\neq0.$$ Homogénea si $f(n)=0$; si no, no homogénea. Ecuación característica: $c_0r^k + c_1r^{k-1}+\\cdots+c_k = 0$.')}
    ${box('thm', 'Solución homogénea con multiplicidades', 'Si las raíces distintas son $r_1,\\dots,r_t$ con multiplicidades $m_1,\\dots,m_t$ ($\\sum m_i = k$): $$a_n = \\sum_{i=1}^t \\big(A_{i,0} + A_{i,1}n + \\cdots + A_{i,m_i-1}n^{m_i-1}\\big)r_i^n.$$ <b>Ejemplo 2:</b> raíces 2, 5, 9 con multiplicidades 3, 2, 1: $a_n = (A_{1,0}+A_{1,1}n+A_{1,2}n^2)2^n + (A_{2,0}+A_{2,1}n)5^n + A_{3,0}9^n$.')}
    ${ex('Ejemplo 3: $a_n + 3a_{n-1}+3a_{n-2}+a_{n-3} = 0$, $a_0=1$, $a_1=-2$, $a_2=-1$', '$r^3+3r^2+3r+1 = (r+1)^3 = 0$: $r=-1$ triple. $a_n = (A+Bn+Cn^2)(-1)^n$. $A = 1$; $-(1+B+C) = -2$; $1+2B+4C = -1$ ⇒ $A=1$, $B=3$, $C=-2$. $$a_n = (1+3n-2n^2)(-1)^n.$$')}
    ${warn('Errata en la diapositiva', 'La diapositiva escribe $(1-3n-2n^2)(-1)^n$, pero con $B=3$ (lo que la misma diapositiva calcula) queda $(1+3n-2n^2)(-1)^n$. Comprobación: $n=1$: $(1+3-2)(-1) = -2$ ✓; con la versión de la diapositiva saldría $4$ ✗.')}
    ${box('thm', 'No homogénea: $a_n = a_n^{(h)} + a_n^{(p)}$', 'Si $f(n) = (b_0 + b_1n + \\cdots + b_tn^t)\\,s^n$:<ul><li>Si $s$ <b>no</b> es raíz de la ecuación característica: $a_n^{(p)} = (B_0 + B_1n + \\cdots + B_tn^t)s^n$.</li><li>Si $s$ es raíz de multiplicidad $m$: $a_n^{(p)} = n^m(B_0 + B_1n + \\cdots + B_tn^t)s^n$.</li></ul>Un polinomio solo ($f(n) = 2n$) es el caso $s = 1$.<br><b>Importante:</b> las constantes $A,B$ se calculan con las condiciones iniciales <u>después</u> de sumar $a^{(h)} + a^{(p)}$.')}
    <table class="tbl"><thead><tr><th>Ejemplo de clase</th><th>Raíces</th><th>$s$</th><th>Forma de $a^{(p)}$</th><th>Resultado (verificado)</th></tr></thead><tbody>
      <tr><td>Ej. 4: $a_n = a_{n-1}+6a_{n-2}+2^n$, $a_0=0,a_1=1$</td><td>$3,-2$</td><td>2 (no raíz)</td><td>$B\\,2^n$</td><td>$B=-1$; $a_n = 3^n - 2^n$</td></tr>
      <tr><td>Ej. 5: $a_n - 3a_{n-1} = 5\\cdot3^n$, $a_0=2$</td><td>$3$</td><td>3 (raíz, $m=1$)</td><td>$Bn\\,3^n$</td><td>$B=5$; $a_n = (2+5n)3^n$</td></tr>
      <tr><td>Ej. 6: $a_n = 3a_{n-1}+2n$, $a_1=3$</td><td>$3$</td><td>1 (no raíz)</td><td>$B_0 + B_1n$</td><td>$B_1=-1, B_0=-\\frac32$; $a_n = \\frac{11}{6}3^n - n - \\frac32$</td></tr>
      <tr><td>Ej. 7: $a_n+4a_{n-1}+4a_{n-2} = 7n(-2)^n$</td><td>$-2$ doble</td><td>$-2$ (raíz, $m=2$)</td><td>$n^2(B_0+B_1n)(-2)^n$</td><td>$B_0=\\frac72, B_1=\\frac76$; $a_n = (A+Bn)(-2)^n + n^2(\\frac72+\\frac76n)(-2)^n$</td></tr>
      <tr><td>Ej. 8: $a_n = a_{n-1}+3n$, $a_0=-2$</td><td>$1$</td><td>1 (raíz, $m=1$)</td><td>$n(B_0+B_1n)$</td><td>$a_n = -2 + \\frac32n + \\frac32n^2$</td></tr>
      <tr><td>Ej. 9: $a_{n+1}=a_n+(n+1)^2$, $a_1=1$</td><td>$1$</td><td>1 (raíz)</td><td>$n(B_0+B_1n+B_2n^2)$</td><td>$a_n = \\frac{n(n+1)(2n+1)}6$</td></tr></tbody></table>
    ${tip('<b>Antes</b> de proponer la particular, compara $s$ con las raíces. Es el error más frecuente: si $s$ es raíz y no multiplicas por $n^m$, al sustituir llegas a un absurdo tipo $0 = 5$.')}`,
    quiz: [
      { q: '$a_n = 5a_{n-1} - 6a_{n-2} + 7\\cdot 2^n$. La particular tiene la forma…', opts: [{ t: '$B\\,2^n$', why: '$2$ es raíz de $r^2-5r+6$.' }, { t: '$Bn\\,2^n$', ok: true, why: 'Raíces 2 y 3: $s=2$ es raíz simple ⇒ multiplicar por $n$.' }, { t: '$Bn^2\\,2^n$', why: 'La multiplicidad de 2 es 1, no 2.' }] },
      { q: '$a_n = 2a_{n-1} + 3n$. La particular tiene la forma…', opts: [{ t: '$B_0 + B_1 n$', ok: true, why: '$f(n) = 3n\\cdot 1^n$, $s=1$ y la raíz es 2: no coincide.' }, { t: '$Bn$', why: 'Hay que incluir todo el polinomio de grado 1: $B_0 + B_1n$.' }, { t: '$n(B_0+B_1n)$', why: 'Solo si 1 fuera raíz.' }] },
      { q: 'Raíces 2 (mult. 3) y 5 (mult. 1). ¿Cuántas constantes tiene la solución homogénea?', opts: [{ t: '2', why: 'Hay tantas constantes como el orden $k$.' }, { t: '4', ok: true, why: '$3 + 1 = 4 = k$.' }, { t: '3', why: 'Falta la de la raíz 5.' }] },
      { q: '¿En qué momento se usan las condiciones iniciales en una no homogénea?', opts: [{ t: 'Sobre $a^{(h)}$ antes de hallar $a^{(p)}$', why: 'Error frecuente: las condiciones se cumplen para la solución completa.' }, { t: 'Sobre $a^{(h)} + a^{(p)}$', ok: true, why: 'La solución completa es la que debe cumplirlas.' }] },
    ] });

  window.TEORIA = T;
})();
