# 🧭 Campo de Direcciones — Observatorio de Matemáticas Avanzadas para Ingeniería

Simulador interactivo de **campos de direcciones (slope fields)** para el estudio de ecuaciones diferenciales ordinarias de primer orden de la forma:

$$\frac{dy}{dx} = f(x, y)$$

Recurso educativo abierto desarrollado para el **Observatorio de Matemáticas Avanzadas para Ingeniería**.

---

## ✨ Características

- **Cualquier ecuación** `y' = f(x, y)`: el estudiante escribe la expresión y se renderiza automáticamente en **LaTeX** (vía KaTeX).
- **Galería de ecuaciones notables**: logística, sinusoidal, Newton (enfriamiento), bistable, separables, no autónomas, etc.
- **Curvas solución exactas**: integración numérica **Runge–Kutta de 4.º orden (RK4)**, bidireccional.
  - **Clic** en cualquier punto del plano: traza la curva que pasa por él.
  - **Clic sostenido + arrastre**: traza múltiples curvas siguiendo el recorrido del cursor (una nueva curva cada vez que el arrastre avanza una distancia mínima), ideal para explorar rápidamente el comportamiento del campo en toda una región.
- **Color por pendiente**: las flechas cambian de color según la magnitud de `y'`.
- **Fondo por signo**: regiones crecientes (verde) y decrecientes (rosa).
- **Detección automática de equilibrios** `y* = cte` con clasificación de estabilidad (estable / inestable / semiestable).
- **Análisis del punto** bajo el cursor: coordenadas, pendiente, ángulo y comportamiento local.
- **Diseño responsive**: funciona en computador, tableta y móvil (incluye soporte táctil para el arrastre).
- Archivo único, sin dependencias locales.

## 🚀 Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `campo-de-direcciones`).
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `app.js`
   - `.nojekyll`
   - `README.md`
3. Ve a **Settings → Pages**.
4. En **Source**, elige la rama `main` y la carpeta `/ (root)`. Guarda.
5. En pocos minutos tu simulador estará disponible en:
   `https://<tu-usuario>.github.io/campo-de-direcciones/`

> El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## 🧪 Uso local

No requiere instalación ni servidor. Abre `index.html` directamente en cualquier navegador moderno con conexión a internet (carga KaTeX y math.js desde CDN).

## 🛠️ Tecnología

| Componente | Uso |
|---|---|
| [math.js](https://mathjs.org/) | Análisis y evaluación de la expresión `f(x, y)` |
| [KaTeX](https://katex.org/) | Renderizado de expresiones matemáticas en LaTeX |
| Canvas 2D | Dibujo del campo, curvas y ejes |
| RK4 | Integración numérica de las curvas solución |

## 📐 Sobre la matemática

El campo de direcciones representa, en cada punto `(x, y)`, un pequeño segmento con la pendiente `f(x, y)` que tendría una solución que pasara por allí. Las curvas solución se obtienen integrando hacia adelante y hacia atrás desde el punto seleccionado con RK4, cuyo error local es de orden `O(h⁵)`.

Los **equilibrios** se buscan como valores `y*` constantes donde `f(x, y*) = 0` para todo `x`; su estabilidad se determina por el signo de `f` justo por encima y por debajo de `y*`.

## 📄 Licencia

© 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.

Este recurso forma parte del **Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)**, un proyecto original de Daniel Steven Moran Pizarro. Queda prohibida su reproducción, distribución, modificación o uso total o parcial sin autorización previa y por escrito del autor.

Para solicitar permisos de uso académico o institucional, contactar a: dmbourbaki@gmail.com
