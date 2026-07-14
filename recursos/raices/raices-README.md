# 🌀 Raíces de un Polinomio — Observatorio de Matemáticas Avanzadas para Ingeniería

Simulador interactivo de las raíces de un polinomio con coeficientes reales, mostradas en el plano complejo. Mueve los coeficientes y observa cómo las raíces se desplazan, colisionan en el eje real y se separan de nuevo en pares complejos conjugados — la geometría detrás del **Teorema Fundamental del Álgebra**:

$$\text{Todo polinomio de grado } n \text{ tiene exactamente } n \text{ raíces complejas (contando multiplicidad)}$$

Recurso educativo abierto, complementario e independiente, para el estudio de **Matemáticas Avanzadas para Ingeniería**.

---

## ✨ Características

- **Doble modo de interacción**:
  - **Coeficientes → raíces**: mueve los deslizadores de los coeficientes a₀...aₙ y observa las raíces recalcularse y desplazarse en tiempo real en el plano complejo.
  - **Raíces → coeficientes**: arrastra directamente una raíz en el plano complejo con el mouse. Si la raíz es compleja, su conjugada se mueve automáticamente en espejo (para que los coeficientes del polinomio reconstruido sigan siendo reales); el polinomio y su forma factorizada se actualizan en vivo.
- **Grado seleccionable de 2 a 6**, mostrando dinámicamente el número correcto de deslizadores de coeficientes.
- **Dos visores interactivos lado a lado**: la curva y = p(x) sobre la recta real (con sus raíces reales marcadas donde cruza el eje x), y el plano complejo con todas las raíces — ambos con zoom (scroll) y arrastre de vista (pan) independientes.
- **El fenómeno de colisión y bifurcación, visible**: cuando dos raíces complejas conjugadas se acercan al eje real, colisionan exactamente cuando la curva y=p(x) es tangente al eje x, y luego se separan en dos raíces reales distintas — el mismo evento visto simultáneamente en ambos paneles.
- **Solución exacta vía el método de Durand–Kerner**: encuentra todas las raíces (reales y complejas) simultáneamente, con aritmética compleja propia en JavaScript — sin librerías externas. Validado contra `numpy.roots` para grados 2 a 6, incluyendo casos de raíces múltiples y coeficientes arbitrarios.
- **Panel del Teorema Fundamental del Álgebra**: cuenta cuántas raíces son reales y cuántas complejas, siempre sumando exactamente el grado del polinomio.
- **Tabla de raíces** con su valor exacto y tipo (real o compleja).
- **Diseño responsive**: funciona en computador, tableta y móvil (con soporte táctil básico para arrastre y pan).

## 🚀 Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `raices-de-polinomios`).
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `app.js`
   - `.nojekyll`
   - `README.md`
3. Ve a **Settings → Pages**.
4. En **Source**, elige la rama `main` y la carpeta `/ (root)`. Guarda.
5. En pocos minutos tu simulador estará disponible en:
   `https://<tu-usuario>.github.io/raices-de-polinomios/`

> El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## 🧪 Uso local

No requiere instalación ni servidor. Abre `index.html` directamente en cualquier navegador moderno con conexión a internet (carga KaTeX desde CDN).

## 🛠️ Tecnología

| Componente | Uso |
|---|---|
| [KaTeX](https://katex.org/) | Renderizado del polinomio y su forma factorizada en LaTeX |
| Canvas 2D | Dibujo de la curva y=p(x), el plano complejo y las raíces |
| Durand–Kerner | Método iterativo que encuentra todas las raíces de un polinomio simultáneamente, con aritmética compleja implementada manualmente |

## 📐 Sobre la matemática

**De coeficientes a raíces — método de Durand–Kerner**: dado un polinomio mónico p(x) = xⁿ + ... + a₀, el método itera simultáneamente n aproximaciones iniciales (distribuidas en un círculo) usando

$$r_i \leftarrow r_i - \frac{p(r_i)}{\prod_{j \neq i}(r_i - r_j)}$$

hasta que todas convergen. A diferencia de Newton-Raphson (que encuentra una raíz a la vez), este método encuentra las n raíces —incluidas las complejas— en un solo proceso iterativo.

**De raíces a coeficientes**: dado un conjunto de raíces r₁, ..., rₙ, el polinomio se reconstruye expandiendo el producto

$$p(x) = (x-r_1)(x-r_2)\cdots(x-r_n)$$

Si las raíces complejas vienen en pares conjugados exactos, este producto da coeficientes reales por construcción — razón por la cual, al arrastrar una raíz compleja, su conjugada debe moverse en espejo: es la única forma de que el polinomio resultante siga teniendo coeficientes reales.

**La bifurcación en el eje real**: para un polinomio cuadrático x²+bx+c, el discriminante b²−4c determina el tipo de raíces. Cuando el discriminante pasa de negativo a positivo (al variar un coeficiente), las dos raíces complejas conjugadas viajan hacia el eje real, colisionan exactamente cuando el discriminante es cero (raíz doble, tangencia de la parábola con el eje x), y luego se separan en dos raíces reales distintas. Este simulador generaliza visualmente ese fenómeno a polinomios de grado superior.

## 📄 Licencia

© 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.

Este recurso forma parte del **Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)**, un proyecto original de Daniel Steven Moran Pizarro. Queda prohibida su reproducción, distribución, modificación o uso total o parcial sin autorización previa y por escrito del autor.

Para solicitar permisos de uso académico o institucional, contactar a: dmbourbaki@gmail.com

---

<p align="center"><sub>Simulador de Raíces de Polinomios · Matemáticas Avanzadas para Ingeniería</sub></p>
