# 🌊 Series de Fourier — Observatorio de Matemáticas Avanzadas para Ingeniería

Simulador interactivo de **Series de Fourier**: observa cómo la suma de senos y cosenos converge hacia una función periódica

$$f(t) = f(t+T)$$

Recurso educativo abierto para el estudio de **Matemáticas Avanzadas para Ingeniería**. Es un recurso complementario independiente, sin asociación a una tarea o letra específica.

---

## ✨ Características

- **Tres niveles de la serie, en orden**: primero todos los términos expandidos —en **forma exacta** (fracciones con π cuando la función pertenece a la galería clásica) seguida de la **forma decimal**, fluyendo horizontalmente como texto normal y saltando de línea automáticamente según el ancho disponible (cada término se renderiza de forma independiente, así que el salto lo decide el navegador, no un cálculo previo)— luego la forma compacta trigonométrica (Σ), y luego la forma compacta compleja/exponencial. Para una función personalizada, solo se muestra la forma decimal (los coeficientes se obtienen por integración numérica, así que no existe una expresión exacta general que mostrar).
- **Fórmula general explícita de aₙ y bₙ**: debajo de la forma compacta trigonométrica, cuando la función pertenece a la galería clásica se muestra la expresión cerrada de aₙ y bₙ en función de n (por casos cuando depende de la paridad, por ejemplo "aₙ = 4/(nπ) si n es impar, 0 si n es par"). Para una función personalizada no se muestra, porque no existe una fórmula general cerrada para una función arbitraria.
- **Galería de funciones clásicas**: onda cuadrada, diente de sierra, triangular, pulso rectangular y semi-rectificada — cada una con sus coeficientes calculados (en forma cerrada cuando existe, o por integración numérica).
- **Función personalizada**: escribe tu propia f(t) en un periodo (por ejemplo `t^2-1`, `abs(sin(t))`, `sin(t)+0.5*cos(2*t)`) con un parser de expresiones propio — sin usar `eval`, por seguridad. Soporta `+ − * / ^`, paréntesis, y las funciones `sin cos tan abs sqrt exp log`.
- **Deslizador de número de armónicos N**, con **botón de reproducción automática** que anima la convergencia de N=0 hasta el máximo y se detiene ahí (no vuelve a 0 automáticamente); si lo presionas de nuevo estando en el máximo, reinicia para que puedas ver la convergencia otra vez. Tres velocidades de animación.
- **Panel principal interactivo** (zoom con scroll, arrastre para desplazar la vista): f(t) objetivo superpuesta con la suma parcial S_N(t), mostrando varios periodos a la vez.
- **Panel de armónicos individuales**: cada término aₙcos(nω₀t) + bₙsin(nω₀t) dibujado por separado con su propio color, para ver cómo se construye la suma.
- **Detección automática del fenómeno de Gibbs**: cuando f(t) tiene una discontinuidad de salto, el simulador marca el "sobrepaso" característico (~9% del salto) que persiste sin importar cuántos términos se agreguen.
- **Tabla de coeficientes** aₙ, bₙ y panel de convergencia (error RMS respecto a f(t) en un periodo).
- **Diseño responsive**: funciona en computador, tableta y móvil (con soporte táctil básico para pan).

## 🚀 Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `series-de-fourier`).
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `app.js`
   - `.nojekyll`
   - `README.md`
3. Ve a **Settings → Pages**.
4. En **Source**, elige la rama `main` y la carpeta `/ (root)`. Guarda.
5. En pocos minutos tu simulador estará disponible en:
   `https://<tu-usuario>.github.io/series-de-fourier/`

> El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## 🧪 Uso local

No requiere instalación ni servidor. Abre `index.html` directamente en cualquier navegador moderno con conexión a internet (carga KaTeX desde CDN).

## 🛠️ Tecnología

| Componente | Uso |
|---|---|
| [KaTeX](https://katex.org/) | Renderizado de las dos formas de la serie en LaTeX |
| Canvas 2D | Dibujo de f(t), S_N(t) y los armónicos individuales |
| Parser de expresiones propio | Evalúa la función personalizada del usuario sin `eval`/`Function`, por seguridad |
| Integración de Simpson | Calcula aₙ, bₙ numéricamente cuando no hay fórmula cerrada |

## 📐 Sobre la matemática

Para una función periódica f(t) = f(t+T), con ω₀ = 2π/T, la serie de Fourier en forma trigonométrica es:

$$f(t) \approx \frac{a_0}{2} + \sum_{n=1}^{N} \left[a_n\cos(n\omega_0 t) + b_n\sin(n\omega_0 t)\right]$$

con coeficientes

$$a_0 = \frac{2}{T}\int_0^T f(t)\,dt, \qquad a_n = \frac{2}{T}\int_0^T f(t)\cos(n\omega_0 t)\,dt, \qquad b_n = \frac{2}{T}\int_0^T f(t)\sin(n\omega_0 t)\,dt$$

La forma compleja equivalente usa cₙ = (aₙ − i bₙ)/2, con f(t) ≈ Σ cₙe^(inω₀t) para n de −N a N.

**Sobre la velocidad de convergencia**: cuando f(t) es continua, los coeficientes decaen como 1/n² o más rápido, y la serie converge uniformemente (sin el fenómeno de Gibbs). Cuando f(t) tiene una discontinuidad de salto, los coeficientes decaen solo como 1/n, y aparece el fenómeno de Gibbs: la suma parcial siempre sobrepasa el valor de la función en un ~9% del tamaño del salto, justo antes y después de la discontinuidad — un sobrepaso que **no desaparece** al aumentar N, solo se concentra cada vez más cerca del punto de salto.

## 📄 Licencia

© 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.

Este recurso forma parte del **Observatorio de Matemáticas Avanzadas para Ingeniería (OMAI)**, un proyecto original de Daniel Steven Moran Pizarro. Queda prohibida su reproducción, distribución, modificación o uso total o parcial sin autorización previa y por escrito del autor.

Para solicitar permisos de uso académico o institucional, contactar a: dmbourbaki@gmail.com

---

<p align="center"><sub>Simulador de Series de Fourier · Matemáticas Avanzadas para Ingeniería</sub></p>
