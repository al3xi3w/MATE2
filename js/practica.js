/* ===== Sección 3: Práctica — problemas, verdadero/falso y tareas para graficar ===== */
(function () {
  const G = window.GR, F = G.fixed, RS = window.RESOLVER;
  const g = (labels, edges, pos, extra = {}) => ({ labels, edges, pos, ...extra });
  const fig = (gr, o = {}) => `<figure class="fig">${G.svg(gr, o)}${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}</figure>`;
  const row = (...f) => `<div class="figrow">${f.join('')}</div>`;

  // --- grafos de exámenes (adaptados) ---
  const K35 = (() => { const lab = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'], e = [];
    for (let i = 0; i < 3; i++) for (let j = 3; j < 8; j++) e.push([i, j, [2, 3, 4][i]]);
    return g(lab, e, [[20, 5], [50, 5], [80, 5], [0, 95], [25, 95], [50, 95], [75, 95], [100, 95]]); })();
  const K6abs = (() => { const lab = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'], e = [];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) e.push([i, j, j - i]);
    return g(lab, e, G.circlePos(6, 45)); })();
  const grid = (() => { const pts = [[1, 0], [2, 0], [3, 0], [4, 0]]; for (const y of [1, 2]) for (let x = 0; x < 6; x++) pts.push([x, y]); for (const y of [3, 4, 5]) for (let x = 1; x < 5; x++) pts.push([x, y]);
    const idx = (x, y) => pts.findIndex(([a, b]) => a === x && b === y), e = [];
    pts.forEach(([x, y], i) => { const r = idx(x + 1, y), d = idx(x, y + 1); if (r >= 0) e.push([i, r]); if (d >= 0) e.push([i, d]); });
    return { g: g(pts.map(() => ''), e, pts.map(([x, y]) => [x * 20, y * 20])), idx, pts }; })();
  const gridHamPath = [[1, 0], [1, 1], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [1, 4], [1, 5], [2, 5], [3, 5], [4, 5], [4, 4], [3, 4], [3, 3], [4, 3], [4, 2], [5, 2], [5, 1], [4, 1], [3, 1], [3, 2], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0]].map(([x, y]) => grid.idx(x, y));
  const gridDel = [[[2, 0], [3, 0]], [[2, 5], [3, 5]], [[1, 3], [1, 4]], [[4, 3], [4, 4]]].map(([a, b]) => grid.g.edges.findIndex(([u, v]) => (u === grid.idx(...a) && v === grid.idx(...b)) || (v === grid.idx(...a) && u === grid.idx(...b))));
  const gridOdd = grid.g.labels.map((_, i) => i).filter((i) => G.degrees(grid.g)[i] % 2);
  const dijkTo = (gr, s, t) => RS.dijkSolution(gr, s, t);

  const P = [];
  // ---------- Exámenes pasados (adaptados) ----------
  P.push({ src: 'Examen 2021-2 (s1) P3 — adaptado: Dijkstra en lugar de BFS', tags: ['Dijkstra', 'examen'],
    enun: `Considere el bipartito completo $K_{3,5}$ con partes $\\{v_1,v_2,v_3\\}$ y $\\{v_4,\\dots,v_8\\}$. Todas las aristas que salen de $v_1$ pesan 2, las de $v_2$ pesan 3 y las de $v_3$ pesan 4. <br>a) Use el <b>algoritmo de Dijkstra</b> desde $v_1$ para hallar la distancia mínima a cada vértice. Indique con cuidado los pasos y dibuje el árbol de caminos más cortos obtenido.<br>b) ¿Por qué la distancia de $v_1$ a $v_3$ no es 4? <span class="conv">Convención: empates ⇒ el de menor índice.</span>${fig(K35, { width: 340, height: 200, edgeLabels: false })}`,
    sol: (() => { const r = G.dijkstra(K35, 0); const hi = new Set(); r.prev.forEach((p, v) => { if (p >= 0) hi.add(K35.edges.findIndex(([a, b]) => (a === p && b === v) || (a === v && b === p))); });
      return `${dijkTo(K35, 0, 2)}<p>Distancias finales: $v_4,\\dots,v_8$: <b>2</b>; $v_2$: <b>5</b> ($v_1\\to v_4\\to v_2$: $2+3$); $v_3$: <b>6</b> ($v_1\\to v_4\\to v_3$: $2+4$). En el paso en que $v_4$ se hace permanente, $v_2$ y $v_3$ reciben $(5,v_4)$ y $(6,v_4)$; los demás $v_j$ ($j\\ge5$) dan el mismo valor, así que no los mejoran (empate: se mantiene $v_4$).</p>${fig(K35, { width: 340, height: 200, hi, edgeLabels: false, nodeNote: Object.fromEntries(r.d.map((d, i) => [i, d])) })}<p>b) En $K_{3,5}$ no hay arista $v_1v_3$ (están en la misma parte). Todo camino de $v_1$ a $v_3$ pasa por algún $v_j$ ($j\\ge4$): cuesta $2 + 4 = 6$.</p>`; })() });
  P.push({ src: 'Examen 2021-2 (s2) P4 — adaptado: Dijkstra en lugar de Prim', tags: ['Dijkstra', 'examen'],
    enun: `Considere el grafo completo $K_6$ con vértices $v_1,\\dots,v_6$ donde la arista $v_iv_j$ pesa $|i-j|$. Aplique el algoritmo de Dijkstra empezando en $v_3$ indicando los pasos (dibuje el grafo y el árbol obtenido). Justifique por qué la distancia mínima de $v_3$ a $v_j$ es exactamente $|3-j|$.${fig(K6abs, { width: 300, height: 260 })}`,
    sol: (() => { const r = G.dijkstra(K6abs, 2); const hi = new Set(); r.prev.forEach((p, v) => { if (p >= 0) hi.add(K6abs.edges.findIndex(([a, b]) => (a === p && b === v) || (a === v && b === p))); });
      const order = r.steps.map((s) => K6abs.labels[s.u]);
      return `${dijkTo(K6abs, 2, r.steps[r.steps.length - 1].u)}<p>Orden de permanentes: $${order.join(',\\ ')}$. Distancias: $d(v_1)=2,\\ d(v_2)=1,\\ d(v_3)=0,\\ d(v_4)=1,\\ d(v_5)=2,\\ d(v_6)=3$. Con la convención de empates, el árbol usa las aristas directas desde $v_3$ (las alternativas como $v_3v_4v_5$ empatan pero no mejoran).</p>${fig(K6abs, { width: 300, height: 260, hi, nodeNote: Object.fromEntries(r.d.map((d, i) => [i, d])) })}<p><b>Justificación general:</b> la arista directa $v_3v_j$ pesa $|3-j|$. Y cualquier trayectoria $v_3=u_0,u_1,\\dots,u_k=v_j$ pesa $\\sum|i_{t}-i_{t-1}| \\ge |\\sum (i_t - i_{t-1})| = |j-3|$ (desigualdad triangular). Luego ningún camino es más corto que la arista directa.</p>`; })() });
  P.push({ src: 'Examen 2021-2 (s1) P4', tags: ['Hamilton', 'examen'],
    enun: `Demuestre que el siguiente grafo no tiene ciclo hamiltoniano (sugerencia: utilice el vértice central).${fig(F.hamExam, { width: 320, height: 320, r: 10 })}<p class="note">Etiquetas añadidas para poder escribir la solución: $C$ es el vértice central; $M, X, Y$ sus vecinos; $R, P, Q$ los vértices del triángulo; $i_1,i_3,i_5$ el resto del círculo interior; $o_1,\\dots,o_6$ el círculo exterior.</p>`,
    sol: `<p><b>Datos.</b> $C$ tiene grado 3 (vecinos $M,X,Y$). $M,X,Y$ tienen grado 3: $M\\sim R,P,C$; $X\\sim R,Q,C$; $Y\\sim P,Q,C$. Los $o_k$ tienen grado 3. (16 vértices, 27 aristas.)</p>
      <p><b>Idea.</b> En un ciclo hamiltoniano cada vértice usa exactamente 2 de sus aristas (proposición del subgrafo $H$). $C$ usa 2 de sus 3 aristas; por la simetría del dibujo (giros de 120°) podemos suponer que usa $CM$ y $CX$, y <u>no</u> usa $CY$.</p>
      <p>Entonces $Y$ (grado 3, sin $CY$) está forzado a usar $YP$ y $YQ$. Además $M$ usa $MC$ y una de $MR, MP$; $X$ usa $XC$ y una de $XR, XQ$. Casos:</p>
      <ol><li><b>$M\\to P$ y $X\\to Q$:</b> se forma el ciclo $P\\,M\\,C\\,X\\,Q\\,Y\\,P$ de 6 vértices, que se cierra sin pasar por los 16. Contradicción.</li>
      <li><b>$M\\to R$ y $X\\to R$:</b> se forma el ciclo $R\\,M\\,C\\,X\\,R$ de 4 vértices. Contradicción.</li>
      <li><b>$M\\to P$ y $X\\to R$:</b> $P$ ya usa $PM$ y $PY$ (lleno), así que no usa $Pi_1$, $Pi_3$ ni $Po_2$. Entonces $o_2$ (vecinos $o_1,o_3,P$) debe usar $o_2o_1$ y $o_2o_3$; e $i_3$ (vecinos $P,Q,o_3$) debe usar $i_3Q$ e $i_3o_3$. Ahora $o_3$ usa $o_3o_2$ y $o_3i_3$ (lleno) y $Q$ usa $QY$ y $Qi_3$ (lleno). Pero $o_4$ tiene vecinos $o_3, o_5, Q$, y $o_3$ y $Q$ ya están llenos: $o_4$ solo podría usar 1 arista. Contradicción.</li>
      <li><b>$M\\to R$ y $X\\to Q$:</b> es el simétrico del caso 3 (reflexión que intercambia $M\\leftrightarrow X$ y $P\\leftrightarrow Q$). Contradicción.</li></ol>
      <p class="ans">En todos los casos hay contradicción ⇒ el grafo no tiene ciclo hamiltoniano. (Verificado además por búsqueda exhaustiva en computadora.)</p>` });
  P.push({ src: 'Examen 2021-2 (s2) P3', tags: ['Hamilton', 'Euler', 'examen'],
    enun: `Considere el siguiente grafo (cuadrícula).<br>a) ¿Tiene camino hamiltoniano?<br>b) Demuestre que se le pueden borrar 4 aristas de tal manera que el grafo resultante tenga camino euleriano (al borrar aristas no se alteran los vértices).${fig(grid.g, { width: 300, height: 300, r: 6 })}`,
    sol: `<p><b>a) Sí.</b> Un camino hamiltoniano (28 vértices, cada uno una vez):</p>${fig(grid.g, { width: 300, height: 300, r: 6, hi: G.edgeIndexSet(grid.g, gridHamPath), hiColor: 'var(--good)' })}<p>Empieza en la esquina superior izquierda de la fila de arriba y termina en la esquina superior derecha. <i>Comprobación de coherencia:</i> coloreando como tablero de ajedrez hay 14 vértices de cada color, como debe ser para un camino que alterna colores con 28 vértices.</p>
      <p><b>b)</b> Tabla de grados: los vértices de grado impar (grado 3) son exactamente <b>8</b> (en rojo): los dos del medio de la fila superior, los dos del medio de la fila inferior y los dos de cada costado de la parte de abajo. Con 8 impares no hay camino euleriano.</p>${fig(grid.g, { width: 300, height: 300, r: 6, hi: new Set(gridDel), hiColor: 'var(--bad)', nodeFill: Object.fromEntries(gridOdd.map((i) => [i, 'var(--bad)'])) })}
      <p>Borrar una arista $uv$ cambia la paridad de $u$ y de $v$. Los 8 impares se pueden emparejar en 4 pares <b>adyacentes</b> (aristas en rojo): borrando esas 4 aristas todos los grados quedan pares. El grafo sigue siendo conexo (cada vértice afectado conserva otras aristas hacia la cuadrícula). Por el teorema de Euler tiene <b>ciclo</b> euleriano, y en particular camino euleriano. ∎</p>` });

  // ---------- Dijkstra de clase ----------
  P.push({ src: 'Diapositivas Dijkstra — ejercicio 2', tags: ['Dijkstra'], enun: `Halle el camino más corto de $a$ a $z$.${fig(F.dijkClase2, { width: 340, height: 200 })}`, sol: dijkTo(F.dijkClase2, 0, 7) + '<p>Observa que el camino «obvio» por arriba ($a\\,b\\,c\\,d\\,z$) cuesta $1+1+1+20 = 23$.</p>' });
  P.push({ src: 'Diapositivas Dijkstra — ejercicio A a K', tags: ['Dijkstra'], enun: `Halle el camino más corto con vértice inicial $A$ y final $K$.${fig(F.dijkAK, { width: 320, height: 330 })}`,
    sol: dijkTo(F.dijkAK, 0, 10) + '<p><b>Hay empate:</b> $A\\,D\\,C\\,E\\,F\\,I\\,K$ y $A\\,D\\,C\\,E\\,H\\,J\\,K$ miden ambos $6+1+3+2+2+5 = 6+1+3+2+3+4 = 19$ (las diapositivas muestran ambas soluciones, en rojo y en azul).</p>' });
  P.push({ src: 'Diapositivas Dijkstra — digrafo', tags: ['Dijkstra'], enun: `Usando Dijkstra, halle la trayectoria más corta en el grafo dirigido desde $A$ a todos los otros vértices.${fig(F.dijkDir, { width: 330, height: 210, uid: 'pd' })}`, sol: dijkTo(F.dijkDir, 0, 3) + '<p>Distancias: $B=7$ ($A\\,C\\,B$), $C=3$, $D=9$ ($A\\,C\\,B\\,D$), $E=5$ ($A\\,C\\,E$). Nota: aunque existe $A\\to B$ directo (10), es mejor $A\\to C\\to B$ (3+4).</p>' });

  // ---------- Guía: 18 ejercicios propuestos ----------
  const guia = [
    ['Un grafo tiene grados $2,2,3,3,4$. ¿Cuántas aristas tiene?', 'Suma $= 14 = 2|E|$ ⇒ $|E| = 7$.'],
    ['¿Cuántos vértices y aristas tiene $K_{4,3}$?', '$|V| = 4+3 = 7$, $|E| = 4\\cdot3 = 12$.'],
    ['¿$C_5$ es bipartito? ¿Y $C_6$? Justifica.', '$C_5$ no: es un ciclo impar. $C_6$ sí: alternando colores, $\\{1,3,5\\}$ y $\\{2,4,6\\}$.'],
    ['Un grafo conexo tiene exactamente cuatro vértices de grado impar. ¿Tiene camino euleriano?', 'No: necesita 0 o 2 vértices de grado impar.'],
    ['Un grafo simple tiene 6 vértices y 8 aristas. ¿Cuántas aristas tiene su complemento?', '$K_6$ tiene 15 aristas; $15-8 = 7$.'],
    ['¿Existe un grafo simple con grados $3,3,3,3,3$?', 'No: la suma es 15, impar.'],
    ['Un grafo 4-regular tiene 10 vértices. ¿Cuántas aristas tiene?', '$|E| = \\frac{10\\cdot4}{2} = 20$.'],
    ['Para $Q_4$: número de vértices, aristas y grado de cada vértice.', '$2^4 = 16$ vértices, $4\\cdot2^3 = 32$ aristas, cada vértice de grado 4.'],
    ['Para $W_8$ (convención de clase): vértices, aristas, grados. ¿Tiene ciclo euleriano?', '8 vértices, $2\\cdot7 = 14$ aristas; el centro tiene grado 7 y los otros 7 vértices grado 3. Los 8 vértices tienen grado impar ⇒ ni ciclo ni camino euleriano. (Sí tiene ciclo hamiltoniano.)'],
    ['¿Para qué valores de $n\\ge3$ tiene $K_n$ un ciclo euleriano?', 'Cuando $n-1$ es par, es decir, $n$ impar.'],
    ['¿$K_{3,5}$ tiene ciclo hamiltoniano? ¿Y camino hamiltoniano?', 'No a ambos: un camino o ciclo en un bipartito alterna lados; con lados de 3 y 5 (difieren en más de 1) no se pueden recorrer todos.'],
    ['Un grafo simple tiene 8 vértices y cada vértice tiene grado al menos 4. ¿Qué puedes asegurar?', '$4\\ge \\frac82$: por Dirac tiene ciclo hamiltoniano.'],
    ['En un digrafo con 7 aristas, ¿cuánto vale $\\sum_v\\operatorname{grad}^-(v)$?', '$\\sum\\operatorname{grad}^-(v) = |E| = 7$.'],
    ['Sea $A$ la matriz de adyacencia de $C_4$ con vértices $v_1v_2v_3v_4$ en orden. ¿Cuántas trayectorias de longitud 2 hay de $v_1$ a $v_3$? ¿Cuánto vale $\\operatorname{traza}(A^2)$?', '$(A^2)_{13} = 2$ ($v_1v_2v_3$ y $v_1v_4v_3$). $\\operatorname{traza}(A^2) = 2+2+2+2 = 8 = 2|E|$.'],
    ['Si la diagonal de $A^2$ de un grafo simple es $(3,2,2,1,2)$, ¿cuántas aristas tiene el grafo?', '$\\operatorname{traza}(A^2) = 10 = 2|E|$ ⇒ $|E| = 5$.'],
    ['Escribe la matriz de incidencia del ciclo $C_3$ con $e_1 = v_1v_2$, $e_2 = v_2v_3$, $e_3 = v_3v_1$.', '$$M = \\begin{pmatrix}1&0&1\\\\1&1&0\\\\0&1&1\\end{pmatrix}$$ (filas $v_1,v_2,v_3$; columnas $e_1,e_2,e_3$).'],
    ['¿Pueden ser isomorfos dos grafos con scores $(1,1,2,2)$ y $(1,2,2,3)$?', 'No: tienen scores distintos (y además distinto número de aristas: 3 y 4).'],
    ['¿Cuál es la diferencia entre Euler y Hamilton?', 'Euler recorre todas las <b>aristas</b> una vez; Hamilton visita todos los <b>vértices</b> una vez.'],
  ];
  guia.forEach(([e, s], i) => P.push({ src: `Guía de Grafos — propuesto ${i + 1}`, tags: ['Grafos'], enun: e, sol: s }));

  // ---------- Recurrencias de clase ----------
  const recs = [
    ['R1 Ej. 2', 'Halle una relación de recurrencia para la secuencia $7, 16, 29, 46, 67,\\dots$ y una fórmula cerrada.', 'Diferencias $9,13,17,21$ (crecen de 4 en 4). Extendiendo hacia atrás $a_0 = 2$: $a_n = a_{n-1} + 4n + 1$, $a_0 = 2$. Iterando: $a_n = 2 + \\sum_{i=1}^n(4i+1) = 2 + 2n(n+1) + n = 2n^2+3n+2$. (Alternativa de segundo orden: $a_n = 2a_{n-1} - a_{n-2} + 4$.)'],
    ['R1 Ej. 4', 'Resuelva $a_n = a_{n-1} + (n-1)$, $n\\ge2$, $a_1 = 0$.', '$a_n = 0 + 1 + 2 + \\cdots + (n-1) = \\frac{n(n-1)}{2}$.'],
    ['R1 Ej. 5', 'Resuelva $a_n = a_{n-1} + 2n$, $n\\ge1$, $a_0 = 0$.', '$a_n = 2(1+\\cdots+n) = n(n+1)$.'],
    ['R1 Ej. 6', 'Resuelva $a_n = n\\,a_{n-1}$, $n\\ge1$, $a_0 = 1$.', '$a_n = n!$.'],
    ['R1 Ej. 7', 'Resuelva $a_n + a_{n-1} - 6a_{n-2} = 0$, $a_0 = 1$, $a_1 = 2$.', '$r^2+r-6 = (r-2)(r+3)$. $a_n = A2^n + B(-3)^n$, $A+B=1$, $2A-3B = 2$ ⇒ $A=1, B=0$: $a_n = 2^n$.'],
    ['R1 Ej. 8', 'Resuelva la recurrencia de Fibonacci $F_n = F_{n-1}+F_{n-2}$, $F_0=0$, $F_1=1$.', '$F_n = \\frac{1}{\\sqrt5}\\left(\\frac{1+\\sqrt5}{2}\\right)^n - \\frac{1}{\\sqrt5}\\left(\\frac{1-\\sqrt5}{2}\\right)^n$.'],
    ['R1 Ej. 9', 'Encuentre y resuelva una recurrencia para las cadenas de $n$ bits sin dos 0 consecutivos.', '$a_n = a_{n-1} + a_{n-2}$ (empieza con 1, o con 01), $a_1 = 2$, $a_2 = 3$. $a_n = \\frac{5+3\\sqrt5}{10}\\varphi^n + \\frac{5-3\\sqrt5}{10}\\psi^n$ con $\\varphi,\\psi = \\frac{1\\pm\\sqrt5}2$ (es $F_{n+2}$).'],
    ['R1 Ej. 10', 'Resuelva $a_{n+2} = 4a_{n+1} - 4a_n$, $a_0 = 1$, $a_1 = 3$.', 'Raíz doble 2: $a_n = (A+Bn)2^n$, $A=1$, $B=\\frac12$: $a_n = 2^n + n2^{n-1}$.'],
    ['R1 Ej. 11', 'Resuelva $a_n = 2(a_{n-1} - a_{n-2})$, $a_0 = 1$, $a_1 = 2$.', '$r = 1\\pm i$, $\\rho = \\sqrt2$, $\\theta = \\pi/4$: $a_n = (\\sqrt2)^n\\left(\\cos\\frac{n\\pi}4 + \\sin\\frac{n\\pi}4\\right)$. (Comprobación: $a_2 = 2(2-1) = 2$ y $2(\\cos\\frac\\pi2 + \\sin\\frac\\pi2) = 2$ ✓.)'],
    ['R2 Ej. 3', 'Resuelva $a_n + 3a_{n-1} + 3a_{n-2} + a_{n-3} = 0$, $a_0 = 1$, $a_1 = -2$, $a_2 = -1$.', '$(r+1)^3 = 0$: $a_n = (A+Bn+Cn^2)(-1)^n$, $A=1$, $B=3$, $C=-2$: $a_n = (1+3n-2n^2)(-1)^n$. <i>(La diapositiva tiene una errata de signo en el término $3n$.)</i>'],
    ['R2 Ej. 4', 'Resuelva $a_n = a_{n-1} + 6a_{n-2} + 2^n$, $a_0=0$, $a_1=1$.', 'Raíces 3, −2; $s=2$ no es raíz ⇒ $a^{(p)} = B2^n$: $4B = 2B + 6B + 4$ ⇒ $B = -1$. $a_n = A3^n + C(-2)^n - 2^n$ ⇒ $A = 1$, $C = 0$: $a_n = 3^n - 2^n$.'],
    ['R2 Ej. 5', 'Resuelva $a_n - 3a_{n-1} = 5\\cdot3^n$, $a_0 = 2$.', '$s = 3$ es raíz ⇒ $a^{(p)} = Bn3^n$: $Bn3^n - 3B(n-1)3^{n-1} = B3^n = 5\\cdot3^n$ ⇒ $B = 5$. $a_n = (2+5n)3^n$.'],
    ['R2 Ej. 6', 'Resuelva $a_n = 3a_{n-1} + 2n$, $a_1 = 3$.', '$a^{(p)} = B_0 + B_1n$: $B_1 = -1$, $B_0 = -\\frac32$. $a_n = A3^n - n - \\frac32$; $a_1 = 3A - \\frac52 = 3$ ⇒ $A = \\frac{11}6$. $a_n = \\frac{11}{6}3^n - n - \\frac32$ (comprobación: $a_2 = 13$ ✓).'],
    ['R2 Ej. 7', 'Halle la solución general de $a_n + 4a_{n-1} + 4a_{n-2} = 7n(-2)^n$.', 'Raíz $-2$ doble y $s = -2$ ⇒ $a^{(p)} = n^2(B_0 + B_1n)(-2)^n$. Igualando coeficientes: $B_1 = \\frac76$, $B_0 = \\frac72$. $$a_n = (A + Bn)(-2)^n + n^2\\left(\\tfrac72 + \\tfrac76 n\\right)(-2)^n.$$'],
    ['R2 Ej. 8', 'Resuelva $a_n = a_{n-1} + 3n$, $a_0 = -2$.', '$a_n = -2 + 3\\frac{n(n+1)}{2}$.'],
    ['R2 Ej. 9', 'Resuelva $a_{n+1} = a_n + (n+1)^2$, $a_1 = 1$.', '$a_n = 1^2 + \\cdots + n^2 = \\frac{n(n+1)(2n+1)}{6}$.'],
  ];
  recs.forEach(([s, e, so]) => P.push({ src: `Recurrencias — ${s}`, tags: ['Recurrencias'], enun: e, sol: so }));

  // ---------- Verdadero / Falso ----------
  const bow = g(['a', 'b', 'c', 'd', 'e'], [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4]], [[5, 15], [5, 85], [50, 50], [95, 15], [95, 85]]);
  const K4 = g(['a', 'b', 'c', 'd'], [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], [[10, 10], [90, 10], [90, 90], [10, 90]]);
  const C5 = g(['1', '2', '3', '4', '5'], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], G.circlePos(5));
  const tri = g(['a', 'b', 'c'], [[0, 1, 2], [0, 2, 2], [1, 2, 1]], [[50, 5], [10, 95], [90, 95]]);
  const VF = [
    { s: 'Todo grafo no dirigido tiene un número par de vértices de grado impar.', v: true, j: 'Por el apretón de manos $\\sum\\operatorname{grad}(v) = 2|E|$ es par. La suma de los grados pares es par, así que la suma de los grados impares también es par; una suma de números impares es par solo si hay una cantidad par de sumandos.' },
    { s: 'Si dos grafos tienen el mismo score, entonces son isomorfos.', v: false, j: `Contraejemplo de clase: $C_6$ y $C_3\\cup C_3$ tienen score $(2,2,2,2,2,2)$, pero $C_6$ es conexo y el otro tiene 2 componentes.${row(fig(g(['1', '2', '3', '4', '5', '6'], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], G.circlePos(6)), { width: 160, height: 140 }), fig(g(GR.letters(6), [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]], [[10, 20], [40, 20], [25, 80], [60, 20], [90, 20], [75, 80]]), { width: 200, height: 140 }))}` },
    { s: '$K_n$ tiene ciclo euleriano para todo $n\\ge3$.', v: false, j: `Contraejemplo: $K_4$. Todos sus vértices tienen grado 3 (impar), así que no tiene ni ciclo ni camino euleriano.${fig(K4, { width: 150, height: 130 })}Lo correcto: $K_n$ tiene ciclo euleriano $\\iff n$ es impar.` },
    { s: 'Todo grafo con ciclo euleriano tiene ciclo hamiltoniano.', v: false, j: `Contraejemplo («corbatín»): dos triángulos que comparten el vértice $c$. Grados $2,2,4,2,2$, todos pares y es conexo ⇒ ciclo euleriano $a\\,b\\,c\\,d\\,e\\,c\\,a$. Pero no hay ciclo hamiltoniano: $a,b,d,e$ tienen grado 2 y fuerzan las 6 aristas, dando grado 4 a $c$ en el ciclo.${fig(bow, { width: 220, height: 140 })}` },
    { s: 'Todo grafo hamiltoniano tiene ciclo euleriano.', v: false, j: `Contraejemplo: $K_4$ tiene ciclo hamiltoniano $a\\,b\\,c\\,d\\,a$ pero sus 4 vértices tienen grado 3 (impar) ⇒ no es euleriano.${fig(K4, { width: 150, height: 130, hi: new Set([0, 3, 5, 2]), hiColor: 'var(--good)' })}` },
    { s: 'Si un grafo simple no cumple el teorema de Dirac, entonces no tiene ciclo hamiltoniano.', v: false, j: `Dirac es condición <b>suficiente</b>, no necesaria. Contraejemplo: $C_5$ tiene grados 2 $< \\frac52$ y es hamiltoniano (él mismo es el ciclo).${fig(C5, { width: 150, height: 140 })}` },
    { s: '$C_n$ es bipartito si y solo si $n$ es par.', v: true, j: 'Si $n$ es par, colorea alternando: posiciones impares en $V_1$, pares en $V_2$; toda arista une consecutivos (colores distintos), incluida $v_nv_1$ porque $n$ es par. Si $n$ es impar, $C_n$ es un ciclo impar, y bipartito $\\iff$ sin ciclos impares.' },
    { s: '$Q_n$ es $n$-regular y tiene $n\\cdot2^{n-1}$ aristas.', v: true, j: 'Cada cadena de $n$ bits es adyacente a las $n$ cadenas que se obtienen cambiando un bit ⇒ grado $n$. Apretón de manos: $2|E| = n\\cdot2^n$ ⇒ $|E| = n2^{n-1}$.' },
    { s: 'La rueda $W_n$ (convención de clase) tiene $2n$ aristas.', v: false, j: 'En clase $W_n$ = $C_{n-1}$ + centro: $(n-1)$ aristas del ciclo + $(n-1)$ rayos $= 2(n-1)$. Ej.: $W_6$ tiene 10 aristas, no 12. ($2n$ es con la convención de Rosen.)' },
    { s: 'Una arista que pertenece a un ciclo puede ser puente.', v: false, j: 'Si $uv$ está en un ciclo, al quitarla el resto del ciclo sigue siendo un camino de $u$ a $v$: no aumenta el número de componentes. Luego nunca es puente.' },
    { s: 'El complemento de un grafo simple con $n$ vértices y $m$ aristas tiene $\\frac{n(n-1)}{2} - m$ aristas.', v: true, j: '$G$ y $\\overline G$ reparten las $\\frac{n(n-1)}2$ aristas de $K_n$ sin repetir: $|E(G)| + |E(\\overline G)| = |E(K_n)|$.' },
    { s: 'Existe un grafo simple con grados $1,1,3,3$.', v: false, j: 'Con 4 vértices, un vértice de grado 3 es adyacente a los otros 3. Si hay dos de grado 3, cada uno de los otros dos es adyacente a ambos ⇒ grado $\\ge 2$, no 1. (Como multigrafo sí existe.)' },
    { s: 'Existe un grafo simple con grados $4,4,4,4,4,2$.', v: true, j: `Su complemento tendría grados $1,1,1,1,1,3$: $f$ unido a $a,b,c$ más la arista $de$. Tomando el complemento obtenemos el grafo pedido:${fig(G.complement(g(GR.letters(6), [[5, 0], [5, 1], [5, 2], [3, 4]], G.circlePos(6))), { width: 180, height: 160 })}` },
    { s: '$K_{m,n}$ con $m\\neq n$ no tiene ciclo hamiltoniano.', v: true, j: 'Todo ciclo en un bipartito alterna entre los lados, así que usa la misma cantidad de vértices de cada lado. Un ciclo hamiltoniano usaría $m$ y $n$ vértices respectivamente ⇒ $m = n$.' },
    { s: 'Si un grafo conexo tiene exactamente 2 vértices de grado impar, tiene un camino euleriano que empieza en uno de ellos y termina en el otro.', v: true, j: 'Es el corolario del teorema de Euler visto en clase.' },
    { s: 'Para un grafo simple con matriz de adyacencia $A$: $\\operatorname{traza}(A^2) = |E|$.', v: false, j: '$(A^2)_{ii} = \\operatorname{grad}(v_i)$, así que $\\operatorname{traza}(A^2) = \\sum\\operatorname{grad} = 2|E|$. Contraejemplo: $K_2$: $A^2 = I$, traza 2, pero $|E| = 1$.' },
    { s: '$(A^k)_{ij}$ cuenta los caminos (sin repetir vértices) de longitud $k$ de $v_i$ a $v_j$.', v: false, j: 'Cuenta <b>trayectorias</b> (pueden repetir vértices). Contraejemplo: en $K_2$ con vértices $a,b$: $(A^2)_{aa} = 1$, que corresponde a $a\\,b\\,a$, que repite $a$.' },
    { s: 'En Dijkstra (pesos positivos), un vértice permanente nunca vuelve a mejorar su distancia.', v: true, j: 'Cuando $u$ se hace permanente tiene la menor $d$ entre los temporales. Cualquier otra trayectoria a $u$ sale del conjunto permanente por un vértice temporal $x$ con $d(x)\\ge d(u)$ y luego suma pesos positivos ⇒ no puede ser más corta.' },
    { s: 'El árbol que construye Dijkstra siempre es un árbol expandido mínimo.', v: false, j: `Contraejemplo: triángulo con $ab = 2$, $ac = 2$, $bc = 1$, desde $a$. Dijkstra usa $ab$ y $ac$ (peso total 4), pero el árbol expandido mínimo es $\\{bc, ab\\}$ (peso 3).${row(fig(tri, { width: 150, height: 130, hi: new Set([0, 1]), cap: 'Dijkstra: 4' }), fig(tri, { width: 150, height: 130, hi: new Set([0, 2]), hiColor: 'var(--good)', cap: 'mínimo: 3' }))}` },
    { s: 'Un árbol expandido de $G$ contiene todas las aristas de $G$.', v: false, j: 'Contiene todos los <b>vértices</b> y no tiene circuitos. Si $G$ tiene un circuito, alguna de sus aristas queda fuera. Ej. de clase: un grafo con un triángulo tiene 3 árboles expandidos, cada uno sin una arista del triángulo.' },
    { s: 'Si $n\\ge3$ y un vértice tiene grado 1, el grafo no tiene ciclo hamiltoniano.', v: true, j: 'En un ciclo hamiltoniano cada vértice tiene grado 2 dentro del ciclo (proposición del subgrafo $H$): necesita al menos 2 aristas.' },
    { s: 'En un digrafo, la suma de los grados de entrada es $|E|$.', v: true, j: 'Cada arista $(u,v)$ aporta exactamente 1 al grado de entrada de $v$.' },
    { s: 'Existe un grafo 3-regular con 9 vértices.', v: false, j: 'La suma de grados sería $27$, impar, contradiciendo el apretón de manos.' },
    { s: 'Un bucle aporta 1 al grado de su vértice.', v: false, j: 'Aporta 2 (convención de clase): la arista toca al vértice por sus dos extremos. Así se mantiene $\\sum\\operatorname{grad} = 2|E|$.' },
    { s: 'Si $G$ es simple, $n\\ge3$ y $\\operatorname{grad}(u)+\\operatorname{grad}(v)\\ge n$ para todo par $u,v$ no adyacentes, $G$ es hamiltoniano.', v: true, j: 'Es el teorema de Ore.' },
    { s: 'La solución de $a_n = 3a_{n-1}$, $a_0 = 2$ es $a_n = 2\\cdot3^n$.', v: true, j: 'Caso homogéneo de primer orden: $a_n = A(-c)^n$ con $-c = 3$, $A = a_0 = 2$. Comprobación: $a_1 = 6 = 3\\cdot2$ ✓.' },
    { s: 'Si la ecuación característica tiene raíz doble $r$, la solución general es $Ar^n + Br^n$.', v: false, j: '$Ar^n + Br^n = (A+B)r^n$ tiene una sola constante efectiva. Ej.: $a_{n+2} = 4a_{n+1} - 4a_n$, $a_0 = 1$, $a_1 = 3$: pediría $A+B = 1$ y $2(A+B) = 3$, imposible. Lo correcto es $(A + Bn)r^n$.' },
    { s: 'Para $a_n = 5a_{n-1} - 6a_{n-2} + 2^n$, la solución particular tiene la forma $B\\cdot2^n$.', v: false, j: '$2$ es raíz de $r^2 - 5r + 6$. Sustituyendo $B2^n$: $B2^{n-2}(4 - 10 + 6) = 0 \\neq 2^n$, absurdo. Como $s = 2$ es raíz simple, se propone $Bn\\,2^n$.' },
    { s: '$a_n = 2^n + n2^{n-1}$ satisface $a_n = 4a_{n-1} - 4a_{n-2}$ con $a_0 = 1$, $a_1 = 3$.', v: true, j: '$a_0 = 1$, $a_1 = 2 + 1 = 3$ ✓. $a_2 = 4 + 4 = 8$ y $4\\cdot3 - 4\\cdot1 = 8$ ✓. En general es la forma $(A+Bn)2^n$ con $A = 1$, $B = \\frac12$ (Ejemplo 10).' },
    { s: 'El número de cadenas de $n$ bits sin 111 cumple $a_n = a_{n-1}+a_{n-2}+a_{n-3}$ con $a_1 = 2$, $a_2 = 4$, $a_3 = 7$.', v: true, j: 'Casos: empieza con 0, con 10 o con 110 (Ejemplo 3 de clase). $a_3 = 8 - 1$ (solo se excluye 111). Comprobación: $a_4 = 13$ y contando: $16 - 3$ (0111, 1110, 1111) ✓.' },
    { s: '$a_n = n\\,a_{n-1}$ es una recurrencia lineal con coeficientes constantes.', v: false, j: 'Es lineal, pero el coeficiente $n$ <b>varía</b> con $n$ (la clase la llama «caso de coeficientes variables»). Su solución $n!$ no es de la forma $\\sum A r^n$.' },
    { s: 'En una recurrencia no homogénea, las condiciones iniciales se aplican a la solución homogénea.', v: false, j: 'Se aplican a $a_n = a^{(h)} + a^{(p)}$. Ej. 4 de clase: si se impone $a_0 = 0$, $a_1 = 1$ a $A3^n + C(-2)^n$ sola, se obtiene $A = \\frac15$, $C = -\\frac15$, que no da $a_2 = 5$.' },
    { s: 'La fórmula $(1-3n-2n^2)(-1)^n$ (escrita en la diapositiva) resuelve el Ejemplo 3 de Recurrencia 2.', v: false, j: 'Con $n = 1$ da $(1-3-2)(-1) = 4$, pero $a_1 = -2$. Con $B = 3$ (calculado en la misma diapositiva) la correcta es $(1+3n-2n^2)(-1)^n$: $n=1$ ⇒ $-2$ ✓, $n=2$ ⇒ $-1$ ✓.' },
    { s: '$a_n - a_{n-1} + a_{n-2} = n^2 + n + 1$ es una relación de recurrencia lineal no homogénea.', v: true, j: 'Es de la forma $c_0a_n + c_1a_{n-1} + c_2a_{n-2} = f(n)$ con coeficientes constantes y $f(n)\\neq0$ (Ejemplo 1 de Recurrencia 2).' },
  ];

  // ---------- Tareas para graficar (editor interactivo) ----------
  const score = (gr) => G.degrees(gr).sort((a, b) => a - b).join(',');
  const iso = (target) => (gr) => !!G.isomorphism(gr, target);
  const DRAW = [
    { t: 'Dibuja un grafo simple con grados $1, 2, 2, 3, 4$.', check: (gr) => score(gr) === '1,2,2,3,4', hint: 'Suma 12 ⇒ 6 aristas. Empieza por el vértice de grado 4 unido a todos.' },
    { t: 'Dibuja un grafo simple con grados $4,4,4,4,4,2$ (ejercicio de clase).', check: (gr) => score(gr) === '2,4,4,4,4,4', hint: 'Dibuja $K_6$ mentalmente y quita las aristas del complemento: $fa, fb, fc, de$.' },
    { t: 'Dibuja un grafo conexo con exactamente 2 vértices de grado impar (tiene camino euleriano pero no ciclo).', check: (gr) => G.isConnected(gr) && G.euler(gr).odd.length === 2 },
    { t: 'Dibuja un grafo con ciclo euleriano pero <b>sin</b> ciclo hamiltoniano.', check: (gr) => G.n(gr) >= 3 && G.euler(gr).type === 'ciclo' && !G.hamilton(gr), hint: 'Piensa en dos triángulos que comparten un vértice.' },
    { t: 'Dibuja un grafo con ciclo hamiltoniano pero <b>sin</b> camino euleriano.', check: (gr) => G.n(gr) >= 3 && !!G.hamilton(gr) && G.euler(gr).type === 'ninguno', hint: '$K_4$ funciona.' },
    { t: 'Dibuja un grafo hamiltoniano de 6 vértices que <b>no</b> cumpla Dirac.', check: (gr) => G.n(gr) === 6 && !!G.hamilton(gr) && !G.dirac(gr) },
    { t: 'Dibuja $W_6$ (convención de clase).', check: iso((() => { const p = G.circlePos(5); return g(['1', '2', '3', '4', '5', '0'], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4]], [...p, [50, 50]]); })()), hint: '6 vértices en total: $C_5$ + centro.' },
    { t: 'Dibuja $Q_3$.', check: iso(g(GR.letters(8), [[0, 1], [0, 2], [1, 3], [2, 3], [4, 5], [4, 6], [5, 7], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7]])), hint: 'Un cubo: 8 vértices, 12 aristas.' },
    { t: 'Dibuja el complemento de $C_5$. (¿Qué grafo obtienes?)', check: iso(C5), hint: 'El complemento de $C_5$ es otro $C_5$ (la estrella de cinco puntas).' },
    { t: 'Dibuja $K_{2,3}$ y comprueba que tiene camino euleriano.', check: iso(g(GR.letters(5), [[0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4]])) },
    { t: 'Dibuja un grafo bipartito con 6 vértices y 8 aristas.', check: (gr) => G.n(gr) === 6 && gr.edges.length === 8 && G.bipartite(gr).ok },
    { t: 'Dibuja un árbol expandido de $K_5$ (5 vértices, conexo, sin circuitos).', check: (gr) => G.n(gr) === 5 && G.isConnected(gr) && gr.edges.length === 4 },
    { t: 'Dibuja un grafo conexo con exactamente un puente.', check: (gr) => { if (!G.isConnected(gr)) return false; let b = 0; gr.edges.forEach((_, k) => { if (!G.isConnected({ ...gr, edges: gr.edges.filter((__, j) => j !== k) })) b++; }); return b === 1; } },
    { t: 'Dibuja un grafo de 6 vértices con score $(2,2,2,2,2,2)$ que <b>no</b> sea isomorfo a $C_6$.', hint: 'Mismo score no implica isomorfos: piensa en dos componentes.', check: (gr) => G.n(gr) === 6 && score(gr) === '2,2,2,2,2,2' && !G.isConnected(gr) },
  ];

  window.PRACTICA = { P, VF, DRAW };
})();
