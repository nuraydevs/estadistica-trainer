export const tema4Quiz = [
  {
    id: 'q-t4-1',
    tema: 4,
    concept: 'Identificar Binomial',
    question: '¿Cuál de estos es un caso de distribución Binomial?',
    options: [
      'Tiempo hasta el siguiente fallo',
      'Número de defectuosas en 50 piezas con misma p',
      'Llamadas a un call center por hora',
      'Altura de una persona elegida al azar'
    ],
    correctIndex: 1,
    explanation: 'Binomial: n ensayos independientes con dos resultados y misma p.'
  },
  {
    id: 'q-t4-2',
    tema: 4,
    concept: 'Esperanza Binomial',
    question: 'Si X → B(20, 0.3), E[X] vale:',
    options: ['0.3', '6', '20', '4.2'],
    correctIndex: 1,
    explanation: 'E[X] = n·p = 20·0.3 = 6.'
  },
  {
    id: 'q-t4-3',
    tema: 4,
    concept: 'Identificar Poisson',
    question: 'Recibes 4 llamadas por hora de media. ¿Qué distribución usas para modelar el número de llamadas en una hora?',
    options: ['Binomial', 'Normal', 'Poisson(4)', 'Exp(4)'],
    correctIndex: 2,
    explanation: 'Cuentas eventos en un intervalo, λ = 4: Poisson(4).'
  },
  {
    id: 'q-t4-4',
    tema: 4,
    concept: 'Poisson reproductividad',
    question: 'Si recibes 2.5 reclamaciones diarias (Poisson), en una semana la media es:',
    options: ['2.5', '7', '17.5', 'No se puede saber'],
    correctIndex: 2,
    explanation: 'Por reproductividad: 7 días · 2.5 = 17.5.'
  },
  {
    id: 'q-t4-5',
    tema: 4,
    concept: 'Exponencial',
    question: 'Vida media de un componente = 5 horas, distribuida Exp. λ vale:',
    options: ['5', '0.5', '0.2', '1/25'],
    correctIndex: 2,
    explanation: 'En Exp(λ), media = 1/λ, así que λ = 1/5 = 0.2.'
  },
  {
    id: 'q-t4-6',
    tema: 4,
    concept: 'Falta de memoria',
    question: 'Componente Exp con media 4 h. Lleva funcionando 2 h. ¿Cuál es la P(dure 3 h más)?',
    options: ['Igual que P(X > 3) en uno nuevo', 'Mayor que en uno nuevo', 'Menor que en uno nuevo', 'No se puede calcular'],
    correctIndex: 0,
    explanation: 'Falta de memoria: P(X > t₁ + t₂ | X > t₁) = P(X > t₂). Las 2 h transcurridas no influyen.'
  },
  {
    id: 'q-t4-7',
    tema: 4,
    concept: 'Tipificación Normal',
    question: 'X → N(60, 9). El valor tipificado de X = 78 es:',
    options: ['1', '2', '0.5', '18'],
    correctIndex: 1,
    explanation: 'Z = (78 − 60)/9 = 18/9 = 2.'
  },
  {
    id: 'q-t4-8',
    tema: 4,
    concept: 'Comparar relativos',
    question: 'Pedro: 70 kg en N(75, 10). Ana: 55 kg en N(60, 5). ¿Quién pesa más en términos relativos respecto a su población?',
    options: ['Pedro', 'Ana', 'Igual', 'No se puede saber'],
    correctIndex: 0,
    explanation: 'Z_Pedro = (70−75)/10 = −0.5. Z_Ana = (55−60)/5 = −1. Pedro está menos lejos por debajo.'
  },
  {
    id: 'q-t4-9',
    tema: 4,
    concept: 'Aproximaciones',
    question: '¿Cuándo se puede aproximar B(n,p) por una Normal?',
    options: ['Siempre', 'Cuando n·p > 5 y p ≤ 0.5', 'Cuando n < 30', 'Solo si p = 0.5'],
    correctIndex: 1,
    explanation: 'Aproximación válida: np > 5 y p ≤ ½. Aplica corrección por continuidad.'
  }
];
