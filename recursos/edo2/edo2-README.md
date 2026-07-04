# 🌀 Respuesta de Segundo Orden — Observatorio de Matemáticas Avanzadas para Ingeniería

Simulador interactivo de **ecuaciones diferenciales de segundo orden con coeficientes constantes** para el estudio de sistemas dinámicos amortiguados:

$$y'' + b\,y' + k\,y = F, \qquad y(0)=y_0,\;\; y'(0)=v_0$$

Recurso educativo abierto desarrollado para el **Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)**.

---

## ✨ Características

- **Sistema de referencia + sistema variable**: el Panel A es siempre un sistema de referencia totalmente fijo (sin deslizador); el Panel B comparte los mismos parámetros base pero con UN deslizador en el parámetro que elijas, para comparar contra la referencia.
- **Tú eliges qué parámetro varía**: un selector `b` / `k` decide cuál coeficiente se controla con el deslizador del Panel B. (`F` queda deliberadamente fuera: no aparece en el discriminante `b²−4k`, así que nunca cambia el régimen, solo desplaza el equilibrio — no aporta valor pedagógico como variable de comparación.)
- **Ecuaciones grandes y dinámicas**: arriba de los paneles, dos ecuaciones diferenciales con los números reales sustituidos (no símbolos genéricos) — una para el sistema de referencia y otra para el sistema variable — que se actualizan en vivo mientras mueves el deslizador.
- **Rango de deslizador configurable**: define el mínimo y máximo según lo que tenga sentido para tu ejercicio de esa acreditación.
- **Solución analítica exacta**: cada curva se calcula con la fórmula cerrada correspondiente a su régimen (no integración numérica), validada contra SymPy.
- **Clasificación automática** según el discriminante `b² − 4k`:
  - 🟦 **Sobreamortiguado** — raíces reales distintas.
  - 🟧 **Crítico** — raíz real doble.
  - 🟥 **Subamortiguado** — raíces complejas conjugadas.
  - 🟪 **Sin amortiguamiento** — raíces imaginarias puras (`b = 0`).
- **Propiedades derivadas**: raíces características, valor de equilibrio `y_eq = F/k`, periodo y frecuencia angular (regímenes oscilatorios), tiempo de asentamiento aproximado (criterio 2%).
- **Solución simbólica en LaTeX**: muestra la forma general `y(t)` con `C₁`, `C₂` para el régimen detectado.
- **Envolvente exponencial**: visualiza la curva de decaimiento que enmarca la oscilación subamortiguada.
- **Diseño responsive**: funciona en computador, tableta y móvil.

## 🔁 Reutilización entre acreditaciones

Para cada nueva certificación, simplemente:
1. Elige qué parámetro variará (`b` o `k`) según el enfoque del ejercicio.
2. Escribe el valor del otro parámetro elegible y de `F` en "Parámetros constantes" — estos son compartidos por ambos paneles.
3. Define el valor de referencia (Panel A) y ajusta el rango del deslizador si lo necesitas.
4. Mueve el deslizador del Panel B para explorar y comparar contra la referencia.

No es necesario editar código ni archivos: todo se configura desde la interfaz.

## 🚀 Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `respuesta-segundo-orden`).
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `app.js`
   - `.nojekyll`
   - `README.md`
3. Ve a **Settings → Pages**.
4. En **Source**, elige la rama `main` y la carpeta `/ (root)`. Guarda.
5. En pocos minutos tu simulador estará disponible en:
   `https://<tu-usuario>.github.io/respuesta-segundo-orden/`

> El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## 🧪 Uso local

No requiere instalación ni servidor. Abre `index.html` directamente en cualquier navegador moderno con conexión a internet (carga KaTeX desde CDN).

## 🛠️ Tecnología

| Componente | Uso |
|---|---|
| [KaTeX](https://katex.org/) | Renderizado de expresiones matemáticas en LaTeX |
| Canvas 2D | Dibujo de las curvas `y(t)`, ejes y envolventes |
| Solución analítica cerrada | Sin integración numérica: fórmulas exactas por régimen |

## 📐 Sobre la matemática

Para `y'' + b\,y' + k\,y = F`, la ecuación característica `λ² + bλ + k = 0` tiene discriminante `b² − 4k`, que determina el comportamiento:

- **Δ > 0** (sobreamortiguado): `y(t) = y_eq + C₁e^{r₁t} + C₂e^{r₂t}`, con `r₁, r₂` raíces reales distintas.
- **Δ = 0** (crítico): `y(t) = y_eq + (C₁ + C₂t)e^{rt}`, con `r` raíz real doble.
- **Δ < 0, b > 0** (subamortiguado): `y(t) = y_eq + e^{αt}(C₁\cos(ωt) + C₂\sin(ωt))`, con raíces `α ± iω`.
- **b = 0** (sin amortiguamiento): `y(t) = y_eq + C₁\cos(ωt) + C₂\sin(ωt)`, oscilación sostenida sin decaimiento.

En todos los casos, `y_eq = F/k` es el valor de equilibrio al que converge (o alrededor del cual oscila) el sistema, y las constantes `C₁`, `C₂` se determinan a partir de las condiciones iniciales `y(0)=y₀`, `y'(0)=v₀`.

## 📄 Licencia

© 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.

Este recurso forma parte del **Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)**, un proyecto original de Daniel Steven Moran Pizarro. Queda prohibida su reproducción, distribución, modificación o uso total o parcial sin autorización previa y por escrito del autor.

Para solicitar permisos de uso académico o institucional, contactar a: dmbourbaki@gmail.com

---
