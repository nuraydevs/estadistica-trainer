const TYPES = ['Probabilidad Total', 'Bayes', 'Condicionada simple', 'Combinatoria'];

export const bayesBlock = {
  id: 'bayes',
  tema: 2,
  title: 'Bloque 1 · Probabilidad Total y Bayes',
  priority: 'priority',
  priorityLabel: 'Siempre cae',
  why: 'En todos los exámenes recientes hay un ejercicio de probabilidad total o de Bayes. Si dominas la plantilla aciertas seguro este bloque y aseguras 1,5 a 2 puntos del examen.',

  theory: {
    keyFormulas: [
      {
        label: 'Probabilidad Total',
        latex: 'P(B) = Σ P(Aᵢ) · P(B|Aᵢ)',
        note: 'cuando A₁, ..., Aₙ es una partición de Ω'
      },
      {
        label: 'Teorema de Bayes',
        latex: 'P(Aᵢ|B) = [P(Aᵢ) · P(B|Aᵢ)] / P(B)',
        note: 'P(B) se calcula con probabilidad total'
      }
    ],

    identify: [
      {
        signal: 'Hay varias "fuentes/causas" (fábricas, máquinas, urnas, grupos) y un suceso de interés',
        type: '→ Probabilidad Total o Bayes'
      },
      {
        signal: '"¿Cuál es la probabilidad de que ocurra B?" sin condicionar',
        type: '→ Probabilidad Total'
      },
      {
        signal: '"Sabiendo que ha ocurrido B, ¿probabilidad de que venga de Aᵢ?"',
        type: '→ Bayes'
      },
      {
        signal: 'El enunciado da P(causa) y P(efecto|causa) y te pregunta al revés',
        type: '→ Bayes'
      }
    ],

    template: [
      'Identifica las causas A₁, ..., Aₙ (deben sumar 1, ser excluyentes).',
      'Identifica el suceso de interés B.',
      'Anota P(Aᵢ) para cada i.',
      'Anota P(B|Aᵢ) para cada i.',
      'Si te piden P(B): aplica probabilidad total.',
      'Si te piden P(Aᵢ|B): aplica Bayes (numerador = P(Aᵢ)·P(B|Aᵢ); denominador = P(B)).'
    ],

    complete: `
      <p><strong>Partición del espacio muestral.</strong> Un conjunto de sucesos {A₁, A₂, ..., Aₙ} forma una partición del espacio muestral Ω si cumplen tres condiciones:</p>
      <ul>
        <li>Son <em>mutuamente excluyentes</em>: Aᵢ ∩ Aⱼ = ∅ para todo i ≠ j.</li>
        <li>Su unión cubre todo el espacio: A₁ ∪ A₂ ∪ ... ∪ Aₙ = Ω.</li>
        <li>Tienen probabilidad positiva: P(Aᵢ) &gt; 0 para todo i.</li>
      </ul>

      <p><strong>Teorema de la Probabilidad Total.</strong> Sea {A₁, ..., Aₙ} una partición de Ω y B un suceso cualquiera. Entonces:</p>
      <p style="text-align:center"><em>P(B) = P(A₁)·P(B|A₁) + P(A₂)·P(B|A₂) + ... + P(Aₙ)·P(B|Aₙ)</em></p>
      <p>Es decir, la probabilidad de B se obtiene como la media ponderada de las probabilidades condicionadas P(B|Aᵢ), usando como pesos las probabilidades a priori P(Aᵢ).</p>

      <p><strong>Teorema de Bayes.</strong> En las mismas condiciones:</p>
      <p style="text-align:center"><em>P(Aᵢ|B) = [P(Aᵢ) · P(B|Aᵢ)] / P(B)</em></p>
      <p>donde P(B) se obtiene mediante el Teorema de la Probabilidad Total.</p>

      <p><strong>Interpretación a priori vs. a posteriori.</strong> P(Aᵢ) es la probabilidad <em>a priori</em>: lo que sabes de la causa antes de observar el efecto. P(Aᵢ|B) es la probabilidad <em>a posteriori</em>: cómo cambia tu creencia sobre la causa una vez has observado B. Bayes es, esencialmente, una regla para actualizar creencias a la luz de evidencias.</p>
    `
  },

  exercises: [
    {
      id: 'b1-e1',
      statement: 'Una empresa dispone de tres fábricas A, B y C. La fábrica A produce el 30% del total, la B el 30% y la C el 40% restante. El 2% de la producción de A, el 3% de la de B y el 5% de la de C es defectuosa. Elegido un producto al azar, calcula la probabilidad de que sea defectuoso.',
      sourceNote: 'Ejercicio 14 del PDF teoría Tema 2',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'Hay tres fuentes (fábricas A, B, C) que forman una partición y te preguntan por P(D) sin condicionar. Es probabilidad total.',
      hints: [
        'Define los sucesos: A = "viene de la fábrica A", B = "fábrica B", C = "fábrica C", D = "es defectuoso". Son tres causas y un efecto.',
        'Anota las probabilidades: P(A)=0.30, P(B)=0.30, P(C)=0.40, P(D|A)=0.02, P(D|B)=0.03, P(D|C)=0.05.',
        'Aplica probabilidad total: P(D) = P(A)·P(D|A) + P(B)·P(D|B) + P(C)·P(D|C).'
      ],
      answer: 0.035,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> definimos los sucesos. A, B, C = "el producto viene de la fábrica A, B o C". D = "el producto es defectuoso".',
        '<strong>Paso 2:</strong> anotamos las probabilidades. P(A)=0.30, P(B)=0.30, P(C)=0.40. P(D|A)=0.02, P(D|B)=0.03, P(D|C)=0.05.',
        '<strong>Paso 3:</strong> A, B, C es una partición del espacio muestral, así que aplicamos probabilidad total.',
        '<strong>Paso 4:</strong> P(D) = 0.30·0.02 + 0.30·0.03 + 0.40·0.05 = 0.006 + 0.009 + 0.020 = <strong>0.035</strong> (es decir, el 3.5%).'
      ]
    },

    {
      id: 'b1-e2',
      statement: 'Misma empresa con tres fábricas A, B y C (30%, 30% y 40%). Producción defectuosa: 2%, 3% y 5%. Se elige un producto al azar y resulta ser defectuoso. ¿Cuál es la probabilidad de que proceda de la fábrica B?',
      sourceNote: 'Ejercicio 15 del PDF teoría Tema 2',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Te dan P(causa) y P(efecto|causa), y te preguntan al revés: P(causa|efecto). Eso es Bayes.',
      hints: [
        'La fórmula es P(B|D) = [P(B) · P(D|B)] / P(D). Necesitas el numerador y el denominador.',
        'Numerador: P(B) · P(D|B) = 0.30 · 0.03 = 0.009.',
        'Denominador P(D) ya lo calculaste en el ejercicio anterior: 0.035.'
      ],
      answer: 0.2571,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> nos piden P(B|D), la probabilidad a posteriori de que venga de la fábrica B sabiendo que es defectuoso.',
        '<strong>Paso 2:</strong> aplicamos Bayes: P(B|D) = [P(B) · P(D|B)] / P(D).',
        '<strong>Paso 3:</strong> numerador = 0.30 · 0.03 = 0.009.',
        '<strong>Paso 4:</strong> denominador (probabilidad total, ya calculada) = 0.035.',
        '<strong>Paso 5:</strong> P(B|D) = 0.009 / 0.035 ≈ <strong>0.2571</strong> (el 25.71%).'
      ]
    },

    {
      id: 'b1-e3',
      statement: 'Las lavadoras de una marca se producen en dos fábricas A y B. El 20% de las lavadoras de la marca son defectuosas. El 30% de las lavadoras de la fábrica B son defectuosas. La fábrica A produce el doble que la B. Calcula la probabilidad de que una lavadora de la fábrica A sea defectuosa.',
      sourceNote: 'Ejercicio 5 del PDF de ejercicios Tema 2 (adaptado)',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'Conocemos P(D) y todas las P(causa) excepto P(D|A), y planteamos la ecuación de probabilidad total despejando esa incógnita.',
      hints: [
        'Si A produce el doble que B, entonces P(A) = 2/3 y P(B) = 1/3 (deben sumar 1).',
        'Plantea la ecuación de probabilidad total con la incógnita: 0.20 = (2/3)·P(D|A) + (1/3)·0.30.',
        'Despeja P(D|A) de la ecuación.'
      ],
      answer: 0.15,
      tolerance: 0.005,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sucesos. A = "lavadora de la fábrica A", B = "lavadora de la fábrica B", D = "lavadora defectuosa".',
        '<strong>Paso 2:</strong> A produce el doble que B, así que P(A) = 2/3 y P(B) = 1/3.',
        '<strong>Paso 3:</strong> sabemos P(D) = 0.20 y P(D|B) = 0.30. Buscamos P(D|A).',
        '<strong>Paso 4:</strong> aplicamos probabilidad total: P(D) = P(A)·P(D|A) + P(B)·P(D|B) → 0.20 = (2/3)·P(D|A) + (1/3)·0.30.',
        '<strong>Paso 5:</strong> 0.20 = (2/3)·P(D|A) + 0.10 → (2/3)·P(D|A) = 0.10 → P(D|A) = 0.15. <strong>El 15%</strong> de las lavadoras de A son defectuosas.'
      ]
    },

    {
      id: 'b1-e4',
      statement: 'En una población, el 40% son hombres y el 60% mujeres. La probabilidad de que un hombre sea daltónico es 0.05 y la de que una mujer lo sea es 0.0025. Se elige una persona al azar y resulta ser daltónica. ¿Cuál es la probabilidad de que sea hombre?',
      sourceNote: 'Tipo clásico de Bayes',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Tienes dos causas (hombre/mujer), un efecto (ser daltónico) y te preguntan por la causa dada la evidencia. Bayes puro.',
      hints: [
        'Sucesos: H = "es hombre", M = "es mujer", D = "es daltónico". Datos: P(H)=0.40, P(M)=0.60, P(D|H)=0.05, P(D|M)=0.0025.',
        'Calcula primero P(D) por probabilidad total: P(D) = 0.40·0.05 + 0.60·0.0025 = 0.020 + 0.0015 = 0.0215.',
        'Aplica Bayes: P(H|D) = [P(H)·P(D|H)] / P(D) = 0.020 / 0.0215.'
      ],
      answer: 0.9302,
      tolerance: 0.005,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sucesos. H = hombre, M = mujer, D = daltónico.',
        '<strong>Paso 2:</strong> datos. P(H)=0.40, P(M)=0.60, P(D|H)=0.05, P(D|M)=0.0025.',
        '<strong>Paso 3:</strong> probabilidad total. P(D) = 0.40·0.05 + 0.60·0.0025 = 0.020 + 0.0015 = 0.0215.',
        '<strong>Paso 4:</strong> Bayes. P(H|D) = (0.40·0.05) / 0.0215 = 0.020 / 0.0215 ≈ <strong>0.9302</strong>.',
        '<strong>Interpretación:</strong> aunque hay más mujeres que hombres en la población, dado que alguien es daltónico es muy probable (≈93%) que sea hombre, porque la condicionada P(D|H) es 20 veces mayor.'
      ]
    },

    {
      id: 'b1-e5',
      statement: 'Un test médico para detectar una enfermedad tiene una sensibilidad del 99% (probabilidad de dar positivo si estás enfermo) y una especificidad del 95% (probabilidad de dar negativo si estás sano). La enfermedad afecta al 1% de la población. Si una persona da positivo en el test, ¿cuál es la probabilidad de que realmente esté enferma?',
      sourceNote: 'Bayes clásico, problema contraintuitivo',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Conocemos P(enfermedad) y P(positivo|enfermedad). Nos preguntan P(enfermedad|positivo). Bayes.',
      hints: [
        'Sucesos: E = "enfermo", S = "sano", + = "positivo". Datos: P(E)=0.01, P(S)=0.99, P(+|E)=0.99, P(+|S) = 1 - especificidad = 0.05.',
        'Probabilidad total: P(+) = P(E)·P(+|E) + P(S)·P(+|S) = 0.01·0.99 + 0.99·0.05 = 0.0099 + 0.0495 = 0.0594.',
        'Bayes: P(E|+) = [P(E)·P(+|E)] / P(+) = 0.0099 / 0.0594.'
      ],
      answer: 0.1667,
      tolerance: 0.005,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sucesos. E = enfermo, S = sano, + = positivo en el test.',
        '<strong>Paso 2:</strong> datos. P(E)=0.01, P(S)=0.99. Sensibilidad: P(+|E)=0.99. Especificidad 0.95 ⇒ P(+|S) = 1 − 0.95 = 0.05.',
        '<strong>Paso 3:</strong> probabilidad total. P(+) = 0.01·0.99 + 0.99·0.05 = 0.0099 + 0.0495 = 0.0594.',
        '<strong>Paso 4:</strong> Bayes. P(E|+) = (0.01·0.99) / 0.0594 = 0.0099 / 0.0594 ≈ <strong>0.1667</strong>.',
        '<strong>Comentario:</strong> solo un 16.7%, pese a un test "muy preciso". La intuición falla porque la enfermedad es muy rara: la mayoría de positivos son falsos positivos. Este es uno de los ejemplos clásicos para entender por qué la probabilidad a priori importa tanto.'
      ]
    }
  ]
};
