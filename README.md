# Estadística Trainer

Entrenador interactivo en el navegador para preparar el examen de **Estadística** del Grado en Ingeniería Electrónica Industrial (UAL). Pensado para repasar partiendo casi de cero, en sesiones cortas, con foco en los bloques que más caen.

- Examen ordinaria: **17 jun 2026**
- Examen extraordinaria: **3 jul 2026**
- Profesores: Ana D. Maldonado, Rafael Cabañas (Dpto. Matemáticas)

## Captura

> _(Pendiente de añadir.)_

## Arrancar en local

Requiere [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

Para construir la versión de producción:

```bash
npm run build
npm run preview
```

## Cómo está organizado

```
src/
├── main.js               # punto de entrada, gestión de tabs y vistas
├── styles/main.css       # tema dark y todos los estilos
├── data/
│   ├── index.js          # exporta el array BLOCKS
│   └── tema2-bayes.js    # un archivo por bloque
├── components/           # cada componente exporta `render(container, props)`
└── utils/
    ├── storage.js        # persistencia en localStorage
    └── countdown.js      # cuenta atrás al examen
```

El estado de cada ejercicio (resuelto, fallado, pistas usadas, intentos) se guarda en `localStorage` bajo la clave `estadistica-trainer-v1`.

## Cómo añadir un bloque nuevo

1. **Crea un archivo** en `src/data/`, por ejemplo `tema4-binomial.js`.
2. **Exporta un objeto** con la forma estándar:

```js
export const binomialBlock = {
  id: 'binomial',
  tema: 4,
  title: 'Bloque 2 · Distribución Binomial',
  priority: 'priority',          // 'priority' | 'high' | 'medium'
  priorityLabel: 'Cae siempre',
  why: 'Una pregunta típica del Tema 4...',
  theory: {
    keyFormulas: [
      { label: 'P(X=k)', latex: 'C(n,k)·p^k·(1-p)^(n-k)', note: '' }
    ],
    identify: [
      { signal: 'n ensayos independientes con dos resultados', type: '→ Binomial' }
    ],
    template: [
      'Identifica n y p',
      'Aplica la fórmula o usa la tabla'
    ],
    complete: '<p>Teoría académica completa en HTML.</p>'
  },
  exercises: [
    {
      id: 'b2-e1',
      statement: 'Enunciado del ejercicio.',
      sourceNote: 'Ejercicio X del PDF Y',
      types: ['Binomial', 'Poisson', 'Normal', 'Hipergeométrica'],
      correctType: 0,
      typeExplanation: 'Por qué es Binomial.',
      hints: ['Pista 1', 'Pista 2', 'Pista 3'],
      answer: 0.32,
      tolerance: 0.005,
      textAnswer: null,
      solution: ['<strong>Paso 1:</strong> ...', '<strong>Paso 2:</strong> ...']
    }
  ]
};
```

3. **Regístralo** en `src/data/index.js`:

```js
import { bayesBlock } from './tema2-bayes.js';
import { binomialBlock } from './tema4-binomial.js'; // 👈 añade

export const BLOCKS = [
  bayesBlock,
  binomialBlock // 👈 añade
];
```

Recarga la app y el bloque aparece automáticamente en la pestaña del tema correspondiente.

### Tips para los datos

- **`correctType`** es el índice (0, 1, 2, 3) dentro del array `types`.
- **`answer`** es numérica. Si el ejercicio es de razonamiento, ponla a `null` y rellena `textAnswer` con la explicación esperada.
- **`tolerance`** funciona como `Math.abs(respuesta - answer) <= tolerance`. Para 4 decimales suele bastar `0.001`.
- **`hints`** se desbloquean en orden, una a una.
- **`solution`** acepta HTML inline (puedes usar `<strong>`, `<em>`, fracciones con `<sup>`/`<sub>`).

## Stack

- [Vite](https://vitejs.dev) 5
- JavaScript vainilla (sin frameworks)
- CSS propio (tema dark inspirado en Linear / Vercel)
- Persistencia con `localStorage`

## Licencia

MIT.
