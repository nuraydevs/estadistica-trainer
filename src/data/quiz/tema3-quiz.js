export const tema3Quiz = [
  {
    id: 'q-t3-1',
    tema: 3,
    concept: 'Tipo de v.a.',
    question: 'El tiempo entre llegadas a una ventanilla es una variable aleatoria:',
    options: ['Discreta', 'Continua', 'Cualitativa', 'Mixta'],
    correctIndex: 1,
    explanation: 'El tiempo es continuo (toma valores en un intervalo de ℝ).'
  },
  {
    id: 'q-t3-2',
    tema: 3,
    concept: 'F.m.p.',
    question: 'En una v.a. discreta, ¿cuánto debe sumar Σ P(X = xᵢ)?',
    options: ['0', '0.5', '1', '∞'],
    correctIndex: 2,
    explanation: 'La suma de probabilidades sobre todo el soporte es 1.'
  },
  {
    id: 'q-t3-3',
    tema: 3,
    concept: 'V.a. continua',
    question: 'Para una v.a. continua, P(X = a) vale:',
    options: ['1', '0.5', '0', 'Depende de f(a)'],
    correctIndex: 2,
    explanation: 'En continuas la probabilidad puntual es siempre 0. Solo tienen sentido las probabilidades en intervalos.'
  },
  {
    id: 'q-t3-4',
    tema: 3,
    concept: 'Función de distribución',
    question: 'Si F(2) = 0.4 y F(5) = 0.9, ¿cuánto vale P(2 < X ≤ 5)?',
    options: ['0.5', '1.3', '0.4', '0.9'],
    correctIndex: 0,
    explanation: 'P(2 < X ≤ 5) = F(5) − F(2) = 0.9 − 0.4 = 0.5.'
  },
  {
    id: 'q-t3-5',
    tema: 3,
    concept: 'Esperanza',
    question: 'Si E[X] = 5 y E[Y] = 3 con X e Y independientes, E[X + Y] vale:',
    options: ['8', '15', '5.66', 'No se puede calcular'],
    correctIndex: 0,
    explanation: 'La esperanza es lineal: E[X + Y] = E[X] + E[Y] = 8.'
  },
  {
    id: 'q-t3-6',
    tema: 3,
    concept: 'Varianza',
    question: 'Si Var(X) = 4 y k = 3, Var(kX) vale:',
    options: ['12', '36', '4', '7'],
    correctIndex: 1,
    explanation: 'Var(kX) = k²·Var(X) = 9·4 = 36.'
  },
  {
    id: 'q-t3-7',
    tema: 3,
    concept: 'Chebyshev',
    question: 'Por Chebyshev, ¿cuál es la cota mínima para P(|X − μ| < 2σ)?',
    options: ['0.5', '0.75', '0.9', '0.95'],
    correctIndex: 1,
    explanation: 'P ≥ 1 − 1/k² con k=2: 1 − 1/4 = 0.75.'
  },
  {
    id: 'q-t3-8',
    tema: 3,
    concept: 'Densidad',
    question: '¿Puede una función de densidad f(x) tomar valores mayores que 1?',
    options: ['Nunca', 'Sí, siempre que ∫f = 1', 'Solo si la v.a. es discreta', 'Solo en distribuciones uniformes'],
    correctIndex: 1,
    explanation: 'f(x) ≥ 0 y el área total es 1, pero en intervalos cortos f puede valer más de 1.'
  }
];
