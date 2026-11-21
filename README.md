# MATE2 — Web de estudio para el Examen Final

Sitio estático (sin build): abre `index.html` en el navegador o publícalo con GitHub Pages.

## Secciones
1. **Teoría** — 13 temas (grafos, Dijkstra, recurrencias) basados en las clases, con quiz por tema y explicación de cada opción.
2. **Cómo resolver** — receta, trampas y ejemplo resuelto por tipo de ejercicio, con botón «Otro ejemplo» que genera datos nuevos; guía para responder casos y preguntas de marcar.
3. **Práctica** — problemas para resolver (exámenes 2021-2 adaptados, propuestos de la guía, ejemplos de clase), verdadero/falso con justificación, tareas para graficar grafos con verificación automática, laboratorio de Dijkstra y graficador de recurrencias.
4. **Simulacro** — examen de 4 preguntas (20 pts) generado al azar, con temporizador y autoevaluación.
5. **Formulario** — resumen de fórmulas y convenciones.

## Material fuente
`Temas/` (Guía de Grafos, DIJKSTRA.pptx, MD2 Cap. 3 Recurrencia 1 y 2) y `Examenes pasados/` (2021-2).
Las preguntas de BFS (y Prim) de exámenes pasados se trabajan con **Dijkstra**.

## Estructura
- `index.html`, `css/styles.css`
- `js/graph.js` (algoritmos y dibujo de grafos), `js/rec.js` (solucionador exacto de recurrencias)
- `js/teoria.js`, `js/resolver.js`, `js/practica.js` (contenido), `js/editor.js` (editor/graficadores), `js/app.js` (interfaz)
