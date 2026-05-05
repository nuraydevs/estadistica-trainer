export const tema2Aprendizaje = {
  tema: 2,
  units: [
    {
      id: 't2-u1',
      concept: 'Probabilidad de la unión',
      explanation: '<p>Para sucesos compatibles A y B: P(A∪B) = P(A) + P(B) − P(A∩B). Si A y B son incompatibles, P(A∩B) = 0 y la fórmula se simplifica.</p>',
      example: 'En una baraja, A = "es oro" (P=0.25), B = "es rey" (P=0.10). P(A∩B) = 1/40 (rey de oros). P(A∪B) = 0.25 + 0.10 − 0.025 = 0.325.',
      miniExercise: {
        question: 'Si P(A) = 0.4, P(B) = 0.3 y P(A∩B) = 0.1, calcula P(A∪B).',
        answer: 0.6,
        tolerance: 0.001,
        feedback: { correct: '0.4 + 0.3 − 0.1 = 0.6.', wrong: 'Aplica P(A∪B) = P(A) + P(B) − P(A∩B).' }
      }
    },
    {
      id: 't2-u2',
      concept: 'Complementario y "al menos uno"',
      explanation: '<p>P(Ā) = 1 − P(A). Atajo importantísimo: para "al menos uno" en n eventos independientes con probabilidad p cada uno, P(al menos 1) = 1 − (1−p)ⁿ.</p>',
      example: 'En 4 lavadoras independientes con probabilidad de defecto 0.20: P(al menos una defectuosa) = 1 − 0.8⁴ = 1 − 0.4096 = 0.5904.',
      miniExercise: {
        question: 'En 5 tiradas de moneda, ¿cuál es la probabilidad de obtener al menos una cara?',
        answer: 0.9688,
        tolerance: 0.001,
        feedback: { correct: '1 − P(ninguna cara) = 1 − 0.5⁵ = 1 − 0.03125 = 0.96875.', wrong: 'Calcula P(no salga cara nunca) y resta de 1.' }
      }
    },
    {
      id: 't2-u3',
      concept: 'Probabilidad condicionada',
      explanation: '<p>P(A | B) = P(A ∩ B) / P(B). Significa "probabilidad de A SABIENDO que ya ha ocurrido B". OJO: P(A | B̄) NO es 1 − P(A | B).</p>',
      example: 'P(memoria | CPU) = P(memoria ∩ CPU) / P(CPU) = 0.10 / 0.40 = 0.25.',
      miniExercise: {
        question: 'P(A) = 0.5, P(B) = 0.4, P(A∩B) = 0.2. Calcula P(A | B).',
        answer: 0.5,
        tolerance: 0.001,
        feedback: { correct: 'P(A|B) = 0.2/0.4 = 0.5.', wrong: 'P(A|B) = P(A∩B) / P(B).' }
      }
    },
    {
      id: 't2-u4',
      concept: 'Independencia',
      explanation: '<p>A y B son independientes si P(A ∩ B) = P(A) · P(B). Equivalente a P(A | B) = P(A): saber B no aporta información sobre A. Si dos sucesos con probabilidad positiva son incompatibles, NUNCA son independientes.</p>',
      example: 'Si P(A) = 0.5, P(B) = 0.4 y P(A∩B) = 0.2, son independientes (0.5·0.4 = 0.2).',
      miniExercise: {
        question: 'P(A) = 0.6, P(B) = 0.5, P(A∩B) = 0.4. ¿Son independientes? (1 = sí, 0 = no)',
        answer: 0,
        tolerance: 0.5,
        feedback: { correct: 'P(A)·P(B) = 0.30 ≠ 0.40. NO son independientes.', wrong: 'Compara P(A)·P(B) con P(A∩B).' }
      }
    },
    {
      id: 't2-u5',
      concept: 'Probabilidad total',
      explanation: '<p>Cuando hay varias causas {Aᵢ} que forman una partición de Ω y nos preguntan por un efecto B: P(B) = Σ P(Aᵢ) · P(B | Aᵢ). Las probabilidades de cada Aᵢ deben sumar 1.</p>',
      example: 'Tres fábricas A (30%), B (30%), C (40%) con P(defectuoso | fábrica) = 0.02, 0.03, 0.05. P(defectuoso) = 0.3·0.02 + 0.3·0.03 + 0.4·0.05 = 0.035.',
      miniExercise: {
        question: 'Dos fábricas: A (60%, defectos 0.1) y B (40%, defectos 0.05). P(defectuoso).',
        answer: 0.08,
        tolerance: 0.001,
        feedback: { correct: '0.6·0.1 + 0.4·0.05 = 0.06 + 0.02 = 0.08.', wrong: 'Suma cada P(Aᵢ)·P(B|Aᵢ).' }
      }
    },
    {
      id: 't2-u6',
      concept: 'Teorema de Bayes',
      explanation: '<p>P(Aᵢ | B) = [P(Aᵢ) · P(B|Aᵢ)] / P(B). Permite invertir condicionadas: dada una evidencia B, ¿qué causa Aᵢ es más probable? P(B) se calcula con probabilidad total.</p>',
      example: 'Si P(B) = 0.035 y P(B | fábrica B) = 0.03 con P(fábrica B) = 0.3: P(B | def) = 0.03·0.3/0.035 ≈ 0.2571.',
      miniExercise: {
        question: 'P(A) = 0.4, P(B|A) = 0.5, P(B) = 0.3. Calcula P(A|B).',
        answer: 0.667,
        tolerance: 0.01,
        feedback: { correct: 'P(A|B) = (0.4·0.5)/0.3 = 0.2/0.3 ≈ 0.667.', wrong: 'Numerador P(A)·P(B|A); divide por P(B).' }
      }
    }
  ]
};
