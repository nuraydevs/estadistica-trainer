export const tema1Quiz = [
  {
    id: 'q-t1-1',
    tema: 1,
    concept: 'Tipos de variables',
    question: 'El nivel de inglés codificado como ninguno, bajo, medio, alto, bilingüe es una variable:',
    options: ['Cuantitativa discreta', 'Cuantitativa continua', 'Cualitativa nominal', 'Cualitativa ordinal'],
    correctIndex: 3,
    explanation: 'Las categorías se pueden ordenar: variable cualitativa ordinal.'
  },
  {
    id: 'q-t1-2',
    tema: 1,
    concept: 'Media',
    question: 'La media de [4, 6, 8, 10] es:',
    options: ['6', '7', '8', '9'],
    correctIndex: 1,
    explanation: '(4+6+8+10)/4 = 28/4 = 7.'
  },
  {
    id: 'q-t1-3',
    tema: 1,
    concept: 'Mediana',
    question: 'La mediana de [2, 4, 6, 8, 100] es:',
    options: ['6', '24', '8', '50'],
    correctIndex: 0,
    explanation: 'Tras ordenar (ya están), valor central de 5 datos: 6. La mediana es robusta a outliers (a diferencia de la media, que aquí daría 24).'
  },
  {
    id: 'q-t1-4',
    tema: 1,
    concept: 'Histograma',
    question: 'Si los intervalos del histograma NO son del mismo ancho, la altura de cada rectángulo debe ser:',
    options: ['La frecuencia absoluta', 'La frecuencia relativa', 'La densidad', 'El centro del intervalo'],
    correctIndex: 2,
    explanation: 'Si los intervalos son distintos, las áreas (no las alturas) deben ser proporcionales a la frecuencia. Por eso la altura es la densidad = frecuencia relativa / amplitud.'
  },
  {
    id: 'q-t1-5',
    tema: 1,
    concept: 'CV',
    question: 'Una distribución con media 0 tiene coeficiente de variación:',
    options: ['0', '1', 'Indefinido', 'Igual a la varianza'],
    correctIndex: 2,
    explanation: 'CV = S/|x̄|. Si la media es 0, el CV no está definido (división por cero).'
  },
  {
    id: 'q-t1-6',
    tema: 1,
    concept: 'Asimetría',
    question: 'En una distribución con asimetría positiva (sesgo a la derecha):',
    options: ['x̄ < Me < Mo', 'x̄ = Me = Mo', 'x̄ > Me > Mo', 'x̄ < Mo < Me'],
    correctIndex: 2,
    explanation: 'Sesgo a la derecha: la cola larga está a valores altos, lo que tira de la media hacia arriba. x̄ > Me > Mo.'
  },
  {
    id: 'q-t1-7',
    tema: 1,
    concept: 'Cuartiles',
    question: 'Q₃ deja por debajo el:',
    options: ['25%', '50%', '75%', '100%'],
    correctIndex: 2,
    explanation: 'Q₃ es el percentil 75: el 75% de los datos están por debajo.'
  },
  {
    id: 'q-t1-8',
    tema: 1,
    concept: 'Curtosis',
    question: 'Una distribución con coeficiente de curtosis g₂ < 0 es:',
    options: ['Mesocúrtica', 'Leptocúrtica', 'Platicúrtica', 'Asimétrica'],
    correctIndex: 2,
    explanation: 'g₂ < 0 indica platicúrtica: menos apuntada que la normal.'
  }
];
