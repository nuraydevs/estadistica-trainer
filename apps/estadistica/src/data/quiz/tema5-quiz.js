export const tema5Quiz = [
  {
    id: 'q-t5-1',
    tema: 5,
    concept: 'Población vs muestra',
    question: 'X̄ = 78 minutos calculado con 36 baterías. ¿X̄ es un parámetro o un estadístico?',
    options: ['Parámetro', 'Estadístico', 'Variable aleatoria poblacional', 'Estimador insesgado, pero no estadístico'],
    correctIndex: 1,
    explanation: 'X̄ se calcula con la muestra, así que es un estadístico (a la vez es estimador del parámetro μ).'
  },
  {
    id: 'q-t5-2',
    tema: 5,
    concept: 'Cuasivarianza',
    question: 'El estimador insesgado de la varianza poblacional σ² usa como denominador:',
    options: ['n', 'n − 1', 'n + 1', '√n'],
    correctIndex: 1,
    explanation: 'La cuasivarianza S² = Σ(Xᵢ−X̄)²/(n−1) es insesgado. Con denominador n queda sesgado.'
  },
  {
    id: 'q-t5-3',
    tema: 5,
    concept: 'IC con σ conocida',
    question: 'IC al 95% para μ con n=36, X̄=78, σ=6. Margen de error:',
    options: ['1.96', '6', '0.5', '5.88'],
    correctIndex: 0,
    explanation: 'Error = z·σ/√n = 1.96·6/6 = 1.96.'
  },
  {
    id: 'q-t5-4',
    tema: 5,
    concept: 'Distribución para μ con σ desconocida',
    question: 'IC para μ con σ desconocida y n=10 (población normal). ¿Qué distribución?',
    options: ['N(0, 1)', 't-Student con 9 g.l.', 'χ² con 10 g.l.', 'F-Snedecor'],
    correctIndex: 1,
    explanation: 'Cuando σ es desconocida y n pequeña: t-Student con n−1 = 9 grados de libertad.'
  },
  {
    id: 'q-t5-5',
    tema: 5,
    concept: 'Tipos de error',
    question: 'Rechazar H₀ siendo cierta es un error de:',
    options: ['Tipo I (probabilidad α)', 'Tipo II (probabilidad β)', 'No es un error', 'De potencia'],
    correctIndex: 0,
    explanation: 'Error tipo I = falso positivo. Su probabilidad es α (nivel de significación).'
  },
  {
    id: 'q-t5-6',
    tema: 5,
    concept: 'p-valor',
    question: 'p-valor = 0.02, α = 0.05. La decisión correcta es:',
    options: ['No se puede decidir', 'No rechazar H₀', 'Rechazar H₀', 'Aumentar la muestra'],
    correctIndex: 2,
    explanation: 'p < α ⇒ se rechaza H₀.'
  },
  {
    id: 'q-t5-7',
    tema: 5,
    concept: 'Confianza vs significación',
    question: 'Un IC al 95% tiene asociado un nivel de significación α =',
    options: ['0.95', '0.05', '0.025', '0.50'],
    correctIndex: 1,
    explanation: 'Confianza = 1 − α. 0.95 = 1 − 0.05.'
  },
  {
    id: 'q-t5-8',
    tema: 5,
    concept: 'Contraste bilateral',
    question: 'En H₀: μ = 100, H₁: μ ≠ 100, con α = 0.05, se rechaza H₀ si:',
    options: ['|Z| > 1.645', '|Z| > 1.96', '|Z| > 2.33', 'Z > 1.96'],
    correctIndex: 1,
    explanation: 'Bilateral: usa z_{α/2} = z_{0.025} = 1.96.'
  }
];
