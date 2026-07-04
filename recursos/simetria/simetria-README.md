# 🔷 Grupos de Simetría — Observatorio de Matemáticas Avanzadas para Ingeniería

Simulador interactivo de los **grupos diédricos** D_n y el **grupo de Klein** V₄: aplica rotaciones y reflexiones a un polígono regular, observa la tabla de Cayley iluminarse, y descubre en vivo la estructura algebraica detrás de la simetría geométrica.

Recurso educativo abierto, complementario e independiente, para el estudio de **Matemáticas Avanzadas para Ingeniería**.

---

## ✨ Características

- **Arrastra el polígono directamente con el mouse**: agarra cualquier vértice y muévelo — el vértice sigue al cursor de forma continua y fluida (la figura gira o se refleja en vivo, sin saltos discretos), tal como se sentiría agarrar la figura con la mano. Si lo llevas en arco por fuera de la figura, el simulador lo interpreta como una rotación; si lo arrastras atravesando cerca del centro hacia el lado opuesto, lo interpreta como una reflexión (verás la figura comprimirse momentáneamente en una línea al cruzar el eje, igual que la animación de los botones de reflexión). Al soltar, una animación corta lleva la figura desde donde quedó hasta la posición exacta de simetría más cercana (solo existen 2n posiciones válidas en D_n, no cualquier ángulo), y esa operación se agrega a la cadena de composición exactamente igual que si hubieras hecho clic en un botón — actualizando tabla de Cayley, permutación, ciclos y reticulado en conjunto.
- **Notación de Fraleigh en toda la interfaz**: ρ₀ (identidad), ρ₁, ρ₂... para rotaciones; δ₁, δ₂... para reflexiones con eje por dos vértices opuestos (diagonales); μ₁, μ₂... para reflexiones con eje por puntos medios de lados opuestos. La distinción δ/μ solo existe cuando n es par (en n impar, todo eje pasa por exactamente un vértice, así que se usa μ uniformemente).
- **Diagrama reticular de subgrupos**: un panel nuevo que calcula y dibuja *todos* los subgrupos del grupo diédrico activo, organizados en niveles según su orden (el grupo completo arriba, el subgrupo trivial {ρ₀} abajo), conectados por líneas que muestran la contención directa entre ellos — igual que el diagrama clásico de los libros de álgebra moderna, pero generado dinámicamente para cualquier D_n de 3 a 8, no solo D₄. Pasa el mouse sobre cualquier subgrupo para ver con cuáles otros se conecta directamente.
- **Resaltado de ruta con clic para fijar**: en el diagrama de permutación, pasar el mouse sobre cualquier vértice siempre ilumina su camino completo, sin importar si ya hay otra ruta fijada. Un **clic** fija esa ruta de forma persistente (vuelve a mostrarse en cuanto el mouse se aleja de cualquier otro vértice), y un segundo clic sobre la misma ruta la libera.
- **Historial de composición navegable**: cada clic en una operación se agrega al final de la lista. Haz clic en cualquier paso anterior para "viajar" ahí — el polígono se actualiza al instante, y los pasos posteriores quedan atenuados (visibles, no borrados) hasta que decidas aplicar algo nuevo desde ese punto, momento en el que el "futuro" anterior se descarta. Incluye botones de salto directo a inicio/final.
- **Notación de permutación, en dos vistas complementarias**: a la izquierda, la matriz de permutación clásica de dos líneas (vértices arriba, destinos abajo) junto con su forma factorizada en notación de ciclos (ej. "(1 2 3 4)" o "(1 3)(2 4)"); a la derecha, un **diagrama de composición paso a paso** con filas siempre fijas (1, 2, 3...n de arriba a abajo en *todas* las columnas, sin reordenar nunca) — una columna por cada operación activa de la cadena, conectadas por flechas que muestran el efecto de cada paso individual. **Pasa el mouse sobre cualquier vértice, en cualquier columna** (inicio, un paso intermedio, o el resultado final) para resaltar el camino completo de extremo a extremo al que pertenece, atenuando el resto del diagrama — no es necesario empezar desde la primera columna, ya que cada celda pertenece a exactamente una ruta.
- **Panel de generadores y órdenes**: tabla con el orden de cada elemento del grupo y cuántos elementos genera por sí solo. Resalta en dorado las rotaciones que generan todo el subgrupo de rotaciones (esto ocurre cuando el índice de la rotación es primo relativo con n). Incluye una nota aclaratoria de que D_n nunca es cíclico — ningún elemento genera el grupo completo por sí solo, a diferencia de Klein V₄ o un grupo cíclico.
- **Polígono regular de 3 a 8 lados**, generando el grupo diédrico D_n completo (2n elementos: n rotaciones + n reflexiones).
- **Botones discretos de operación**, con animación geométricamente honesta: las rotaciones giran suavemente en el plano, y las reflexiones se animan como un **giro real en 3D sobre el eje de simetría** — como una puerta sobre su bisagra, vista desde el frente. El polígono se va angostando progresivamente desde el primer instante (no permanece igual hasta colapsar de golpe a la mitad), pasa por verse "de canto" en el punto medio del giro, y se expande de nuevo del otro lado — con un sutil efecto de profundidad (los vértices que se alejan de la pantalla se ven más tenues y pequeños) que refuerza la sensación de volteo real.
- **Tabla de Cayley completa**, siempre visible, coloreada por tipo de elemento (rotación, reflexión, identidad), que resalta automáticamente la celda correspondiente a la última composición activa.
- **Modo Klein V₄**: para el cuadrado (D₄), aísla el subgrupo {e, rotación 180°, reflexión horizontal, reflexión vertical} y muestra su propia tabla de Cayley 4×4, su propia matriz de permutación, y su propio panel de generadores — el ejemplo más simple de un grupo no cíclico de orden 4.
- **Panel de axiomas de grupo**: confirma en vivo clausura, asociatividad, identidad e inversos para el grupo activo.
- **Panel del elemento actual**: muestra su descripción completa, su inverso, y su orden.
- **Ejes de reflexión dibujados** sobre el polígono como líneas de referencia.
- **Diseño responsive**: funciona en computador, tableta y móvil.

## 🚀 Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `grupos-de-simetria`).
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `app.js`
   - `.nojekyll`
   - `README.md`
3. Ve a **Settings → Pages**.
4. En **Source**, elige la rama `main` y la carpeta `/ (root)`. Guarda.
5. En pocos minutos tu simulador estará disponible en:
   `https://<tu-usuario>.github.io/grupos-de-simetria/`

> El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## 🧪 Uso local

No requiere instalación ni servidor. Abre `index.html` directamente en cualquier navegador moderno con conexión a internet (carga KaTeX desde CDN).

## 🛠️ Tecnología

| Componente | Uso |
|---|---|
| [KaTeX](https://katex.org/) | Renderizado de la notación de composición en LaTeX |
| Canvas 2D | Dibujo del polígono, sus transformaciones animadas y los ejes de reflexión |
| Aritmética modular propia | Composición exacta en D_n vía las 4 reglas algebraicas del grupo diédrico |

## 📐 Sobre la matemática

Los elementos de D_n se representan como rotaciones Rₖ (ángulo 2πk/n) y reflexiones Fₖ (eje a ángulo πk/n), para k=0,...,n−1. La composición de dos elementos (aplicar Y primero, luego X) sigue cuatro reglas, válidas para todo n:

$$R_a \circ R_b = R_{a+b} \qquad R_a \circ F_b = F_{a+b} \qquad F_a \circ R_b = F_{a-b} \qquad F_a \circ F_b = R_{a-b}$$

(todos los índices módulo n). Estas reglas se derivan de representar cada elemento como una matriz 2×2 y se validaron exhaustivamente contra el producto matricial directo para n=3 hasta n=8.

**El grupo de Klein V₄** es el subgrupo {e, R₁₈₀, F₀, F₂} de D₄: cerrado bajo composición, con los tres elementos no-identidad de orden 2 — la firma característica de un grupo isomorfo a ℤ₂×ℤ₂. A diferencia del grupo cíclico de orden 4, en Klein V₄ ningún elemento genera todo el grupo por sí solo.

**La acción sobre los vértices (permutación)**: cada elemento de D_n también puede describirse como una permutación de los n vértices del polígono, sin necesidad de matrices ni coordenadas:

$$R_k: \text{vértice } i \mapsto (i+k) \bmod n \qquad\qquad F_k: \text{vértice } i \mapsto (k-i) \bmod n$$

Estas fórmulas se validaron contra la acción geométrica real (aplicar la matriz 2×2 a cada vértice y verificar a qué otro vértice llega) para n=3 hasta n=8, con coincidencia exacta. Por ejemplo, en el cuadrado, R₁ envía 1→2→3→4→1 (un ciclo completo), mientras que F₀ fija los vértices 1 y 3 e intercambia 2↔4.

**Sobre los generadores**: D_n nunca es un grupo cíclico (para n≥3), así que ningún elemento individual genera los 2n elementos. Sin embargo, una rotación R_k sí genera **todo el subgrupo de rotaciones** (las n rotaciones) exactamente cuando k y n son primos entre sí — equivalentemente, cuando el orden de R_k es igual a n. En el cuadrado, R₁ y R₃ son generadores de las rotaciones; R₂ solo genera el subgrupo {e, R₂} de orden 2.

**Sobre el diagrama reticular**: encontrar todos los subgrupos de D_n se reduce, en la práctica, a calcular el subgrupo generado por cada elemento individual y por cada par de elementos — un resultado conocido de la teoría de grupos diédricos (todo subgrupo de D_n requiere a lo sumo dos generadores). Esto se validó exhaustivamente para D₄ comparando contra fuerza bruta total (revisar los 2⁸=256 subconjuntos posibles y verificar cuáles son cerrados bajo composición): ambos métodos coinciden exactamente en los mismos 10 subgrupos. Las aristas del reticulado conectan cada subgrupo con sus subgrupos **maximales** — aquellos contenidos en él sin que exista un subgrupo intermedio entre ambos.

**Sobre la animación de reflexión**: una reflexión F_k tiene su eje geométrico siempre fijo en el plano, en el ángulo πk/n — sin importar qué rotaciones o reflexiones se hayan aplicado antes (esas ya quedan "horneadas" en la posición actual de cada vértice). Animar la reflexión como un volteo real significa tomar la posición actual de cada vértice y rotarla en 3D, saliendo del plano de la pantalla, alrededor de ese eje fijo — usando la fórmula de rotación de Rodrigues — hasta completar 180°. La proyección de vuelta a 2D usa **perspectiva real** (no proyección paralela): cada vértice se escala según `camera_dist / (camera_dist - z)`, de modo que el lado que se acerca a la "cámara" se ve notoriamente más grande y brillante, y el que se aleja más pequeño y tenue.

En vez de pelear contra el hecho de que la silueta siempre se aplana en el punto medio del giro (es geometría inevitable), el simulador **abraza ese instante** como el momento más vivo de la animación: el contorno rígido del polígono se desvanece progresivamente a medida que se acerca a los 90° de giro, y cada vértice deja una **estela luminosa** —una cola de partículas que se desvanece, como una luciérnaga volando— mostrando el camino que recorrió. El resultado es una sensación etérea, de vértices que vuelan libres por un instante, en vez de una figura geométrica rígida que se aplasta. La estela se acumula en tiempo real mientras el vértice se mueve (tanto en animaciones automáticas como en el arrastre manual con el mouse) y se limpia en cuanto el polígono vuelve a estar quieto.

Para polígonos con más lados, en el instante exacto de mayor compresión (90° de giro) todos los vértices caerían sobre la misma línea recta y se volverían indistinguibles entre sí. Para evitarlo, se separan levemente en abanico —como las páginas de un libro abriéndose un poco— en la dirección perpendicular al eje, con una magnitud proporcional a sin(φ)⁴ (de modo que el efecto es casi imperceptible salvo muy cerca del punto medio del giro) y al índice de cada vértice (preservando siempre su orden alrededor del polígono, sin que dos vértices intercambien posición relativa). El resultado se mantiene fiel a la idea de "una hoja girando sobre su eje" sin necesitar mostrar ningún indicio de un entorno 3D explícito.

**Sobre el arrastre interactivo**: dado un vértice arrastrado y la posición actual del mouse, el simulador busca, entre los 2n elementos de D_n, cuál — compuesto con la transformación ya acumulada — coloca ese vértice más cerca del cursor. Esto resuelve el "snapping" sin necesidad de clasificar el gesto de antemano: la geometría decide sola. Sin embargo, un mismo punto final puede alcanzarse tanto por una rotación como por una reflexión distinta (son dos caminos geométricos diferentes que coinciden en ese vértice), así que el simulador registra la distancia mínima del mouse al centro durante todo el arrastre: si en algún momento el cursor se acercó mucho al centro (atravesando la figura), solo se consideran reflexiones como candidatas; si se mantuvo siempre alejado (un arco limpio), solo rotaciones. Esta desambiguación se validó comparando ambos modos sobre el mismo punto de destino, confirmando que efectivamente corresponden a transformaciones de la figura completa distintas, aunque ese vértice en particular termine en el mismo lugar.

Durante el seguimiento continuo en modo reflexión, el progreso del arrastre se mide proyectando la posición del mouse sobre el desplazamiento del vértice que más se mueve entre la posición inicial y la reflexión candidata — nunca sobre el vértice que el usuario agarró con la mano. Esto es importante: si el vértice arrastrado está cerca del eje de la reflexión hacia la que se dirige, apenas se desplaza entre el inicio y el final, y medir el progreso sobre un trayecto casi nulo es numéricamente inestable (pequeñas variaciones del mouse producen saltos erráticos que deforman toda la silueta, en vez de un volteo limpio). Usar siempre el vértice de máximo desplazamiento como referencia garantiza una transición estable y proporcional en todos los casos.

## 📄 Licencia

© 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.

Este recurso forma parte del **Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)**, un proyecto original de Daniel Steven Moran Pizarro. Queda prohibida su reproducción, distribución, modificación o uso total o parcial sin autorización previa y por escrito del autor.

Para solicitar permisos de uso académico o institucional, contactar a: dmbourbaki@gmail.com

---

<p align="center"><sub>Simulador de Grupos de Simetría · Matemáticas Avanzadas para Ingeniería</sub></p>
