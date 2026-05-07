export const tema2Quiz = [
  {
    id: 'q-t2-1',
    tema: 2,
    concept: 'Probabilidad de la unión',
    question: 'Si P(A) = 0.5, P(B) = 0.4 y P(A∩B) = 0.2, ¿cuánto vale P(A∪B)?',
    options: ['0.7', '0.9', '0.3', '0.1'],
    correctIndex: 0,
    explanation: 'P(A∪B) = P(A) + P(B) − P(A∩B) = 0.5 + 0.4 − 0.2 = 0.7.'
  },
  {
    id: 'q-t2-2',
    tema: 2,
    concept: 'Independencia vs incompatibilidad',
    question: 'Dos sucesos A y B con probabilidad positiva son incompatibles. Entonces:',
    options: ['Son independientes', 'NO son independientes', 'Da igual, depende del caso', 'P(A) = P(B)'],
    correctIndex: 1,
    explanation: 'Si son incompatibles, P(A∩B) = 0. Para ser independientes haría falta P(A)·P(B) = 0, imposible si ambos son positivos.'
  },
  {
    id: 'q-t2-3',
    tema: 2,
    concept: 'Condicionada',
    question: 'P(A) = 0.3, P(B) = 0.5, P(A∩B) = 0.15. ¿Son independientes?',
    options: ['Sí', 'No', 'No se puede saber', 'Solo si P(A|B) = 0.3'],
    correctIndex: 0,
    explanation: 'P(A)·P(B) = 0.15 = P(A∩B). Sí son independientes.'
  },
  {
    id: 'q-t2-4',
    tema: 2,
    concept: 'Bayes',
    question: 'En Bayes, P(Aᵢ|B) = [P(Aᵢ)·P(B|Aᵢ)] / P(B). ¿Cómo se calcula P(B)?',
    options: ['Por suma directa', 'Con probabilidad total', 'Por independencia', 'P(B) = 1 − P(Bᵢ)'],
    correctIndex: 1,
    explanation: 'P(B) = Σ P(Aᵢ)·P(B|Aᵢ) — teorema de probabilidad total.'
  },
  {
    id: 'q-t2-5',
    tema: 2,
    concept: 'Complementario',
    question: 'En 4 lanzamientos de moneda, ¿cuál es la probabilidad de "al menos una cara"?',
    options: ['0.5', '0.75', '0.9375', '1.0'],
    correctIndex: 2,
    explanation: '1 − P(ninguna cara) = 1 − 0.5⁴ = 1 − 0.0625 = 0.9375.'
  },
  {
    id: 'q-t2-6',
    tema: 2,
    concept: 'Probabilidad condicionada',
    question: 'P(A∩B) = 0.2, P(B) = 0.5. P(A|B) =',
    options: ['0.1', '0.4', '0.7', '0.25'],
    correctIndex: 1,
    explanation: 'P(A|B) = P(A∩B)/P(B) = 0.2/0.5 = 0.4.'
  },
  {
    id: 'q-t2-7',
    tema: 2,
    concept: 'Bayes intuitivo',
    question: 'Test médico: sensibilidad 99%, especificidad 95%, prevalencia 1%. Si das positivo, ¿probabilidad de estar enfermo?',
    options: ['~99%', '~50%', '~17%', '~5%'],
    correctIndex: 2,
    explanation: 'Por Bayes ≈ 0.1667 (16.7%). Resultado contraintuitivo por la baja prevalencia.'
  },
  {
    id: 'q-t2-8',
    tema: 2,
    concept: 'Combinatoria',
    question: 'Número de formas de elegir 3 elementos de 10 sin importar orden:',
    options: ['30', '720', '120', '1000'],
    correctIndex: 2,
    explanation: 'Combinaciones: C(10, 3) = 10!/(3!·7!) = 120.'
  }
];
