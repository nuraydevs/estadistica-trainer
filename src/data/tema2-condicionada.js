const TYPES = ['Probabilidad de unión/intersección', 'Condicionada', 'Independencia/incompatibilidad', 'Combinatoria'];

export const condicionadaBlock = {
  id: 'condicionada',
  tema: 2,
  title: 'Bloque 2 · Probabilidad básica y condicionada',
  priority: 'high',
  priorityLabel: 'Cae casi siempre',
  why: 'La base de toda probabilidad: sucesos, unión, intersección, complementario, condicionada e independencia. Sin esto no puedes hacer Bayes ni distribuciones. Suelen pedir un par de apartados con estos conceptos sueltos.',

  theory: {
    keyFormulas: [
      {
        label: 'Probabilidad de la unión',
        latex: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)',
        note: 'si A y B son incompatibles, P(A ∩ B) = 0'
      },
      {
        label: 'Complementario',
        latex: 'P(Ā) = 1 − P(A)',
        note: 'también P(Ā ∩ B̄) = 1 − P(A ∪ B) (Leyes de De Morgan)'
      },
      {
        label: 'Probabilidad condicionada',
        latex: 'P(A | B) = P(A ∩ B) / P(B)',
        note: 'requiere P(B) > 0'
      },
      {
        label: 'Independencia',
        latex: 'P(A ∩ B) = P(A) · P(B)',
        note: 'equivalente a P(A | B) = P(A)'
      }
    ],

    identify: [
      {
        signal: 'Te dan P(A), P(B), P(A∩B) y piden P(A∪B), P(Ā), o "ni A ni B"',
        type: '→ Probabilidad de unión/intersección'
      },
      {
        signal: '"Sabiendo que ha ocurrido B, ¿probabilidad de A?" o "Si X, ¿probabilidad de Y?"',
        type: '→ Condicionada'
      },
      {
        signal: 'Pregunta literalmente si dos sucesos son independientes o incompatibles',
        type: '→ Independencia/incompatibilidad'
      },
      {
        signal: 'Te dicen que dos sucesos ocurren "independientemente" (máquinas, baterías, lanzamientos)',
        type: '→ Usa P(A ∩ B) = P(A)·P(B) directamente'
      }
    ],

    template: [
      'Define los sucesos con letras claras (A, B, D...).',
      'Anota los datos del enunciado: P(A), P(B), P(A∩B), o las que te den.',
      'Identifica qué te piden: una unión, una intersección, una condicionada, o una pregunta cualitativa.',
      'Si es unión: aplica P(A∪B) = P(A) + P(B) − P(A∩B).',
      'Si es condicionada: aplica P(A|B) = P(A∩B) / P(B). Cuidado con qué condicionas a qué.',
      'Para "ni A ni B" usa De Morgan: P(Ā ∩ B̄) = 1 − P(A∪B).',
      'Para independencia: comprueba P(A)·P(B) = P(A∩B). Para incompatibilidad: P(A∩B) = 0.'
    ],

    complete: `
      <p><strong>Operaciones con sucesos.</strong> Sean A, B ⊆ Ω.</p>
      <ul>
        <li><em>Unión</em> (A ∪ B): ocurre A, ocurre B, o ambos.</li>
        <li><em>Intersección</em> (A ∩ B): ocurren A y B simultáneamente.</li>
        <li><em>Complementario</em> (Ā): los puntos de Ω que no están en A. Verifica Ā ∪ A = Ω.</li>
        <li><em>Diferencia</em> (A − B = A ∩ B̄): puntos de A que no están en B.</li>
        <li><em>Sucesos disjuntos o incompatibles</em>: A ∩ B = ∅.</li>
      </ul>

      <p><strong>Propiedades de la probabilidad.</strong></p>
      <ul>
        <li>0 ≤ P(A) ≤ 1.</li>
        <li>P(∅) = 0, P(Ω) = 1.</li>
        <li>P(Ā) = 1 − P(A).</li>
        <li>Si A y B son compatibles: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).</li>
        <li>P(A − B) = P(A) − P(A ∩ B).</li>
        <li>Leyes de De Morgan: P(A ∪ B) = P(Ā ∩ B̄), P(A ∩ B) = P(Ā ∪ B̄).</li>
      </ul>

      <p><strong>Probabilidad condicionada.</strong> La probabilidad de A sabiendo que ha ocurrido B se define como:</p>
      <p style="text-align:center"><em>P(A | B) = P(A ∩ B) / P(B)</em>, siempre que P(B) > 0.</p>
      <p>Condicionar a B equivale a restringir el espacio muestral original Ω al espacio B. Atención: el suceso que condiciona NO cambia, así que P(A | B̄) ≠ 1 − P(A | B).</p>

      <p><strong>Independencia.</strong> Dos sucesos A y B son <em>estadísticamente independientes</em> si y solo si:</p>
      <p style="text-align:center"><em>P(A ∩ B) = P(A) · P(B)</em></p>
      <p>Equivale a P(A | B) = P(A), es decir, saber que ha ocurrido B no aporta información sobre A.</p>

      <p><strong>Independientes ≠ incompatibles.</strong> Dos sucesos incompatibles con probabilidad positiva NO pueden ser independientes: si A ∩ B = ∅ entonces saber que ocurre uno te dice con seguridad que el otro no ocurre.</p>
    `
  },

  exercises: [
    {
      id: 'b1c-e1',
      statement: 'En cierta empresa, el 40% de sus empleados poseen título universitario, el 30% son mujeres y el 25% son mujeres con título universitario. Si se selecciona al azar un empleado, calcula la probabilidad de que sea varón y no tenga título universitario.',
      sourceNote: 'Ejercicio 1 del PDF teoría Tema 2',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'Te piden la probabilidad del complementario de la unión: ni mujer ni universitario. Es operación con unión e intersección.',
      hints: [
        'Define M = "es mujer" y U = "tiene título universitario". Datos: P(M)=0.30, P(U)=0.40, P(M∩U)=0.25.',
        'Por las leyes de De Morgan, "varón y sin título" = M̄ ∩ Ū = complementario de M ∪ U.',
        'Calcula primero P(M∪U) con la fórmula de la unión, y luego 1 − P(M∪U).'
      ],
      answer: 0.55,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sucesos. M = "el empleado es mujer", U = "tiene título universitario".',
        '<strong>Paso 2:</strong> datos. P(M) = 0.30, P(U) = 0.40, P(M ∩ U) = 0.25.',
        '<strong>Paso 3:</strong> "varón y sin título" = M̄ ∩ Ū. Por De Morgan, M̄ ∩ Ū = (M ∪ U)ᶜ.',
        '<strong>Paso 4:</strong> P(M ∪ U) = P(M) + P(U) − P(M ∩ U) = 0.30 + 0.40 − 0.25 = 0.45.',
        '<strong>Paso 5:</strong> P(M̄ ∩ Ū) = 1 − P(M ∪ U) = 1 − 0.45 = <strong>0.55</strong>.'
      ]
    },

    {
      id: 'b1c-e2',
      statement: 'Los electrodomésticos fabricados por una empresa pueden tener defectos de dos tipos A y B. El 70% presentan defectos de tipo A, el 40% presentan defectos de tipo B y el 30% presentan defectos de ambos tipos. Determina la probabilidad de que un electrodoméstico que no tiene defectos de tipo B presente defectos de tipo A.',
      sourceNote: 'Ejercicio 2.a del PDF de ejercicios Tema 2',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'La pregunta dice "que no tiene defectos de tipo B" como información dada y pregunta por A. Es una probabilidad condicionada P(A | B̄).',
      hints: [
        'Datos: P(A)=0.70, P(B)=0.40, P(A∩B)=0.30. Te piden P(A | B̄).',
        'Aplica la definición: P(A | B̄) = P(A ∩ B̄) / P(B̄).',
        'P(A ∩ B̄) = P(A) − P(A ∩ B) (la parte de A que no se solapa con B). P(B̄) = 1 − P(B).'
      ],
      answer: 0.6667,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> identificamos lo que se condiciona. "Que no tiene defectos B" = B̄. Buscamos P(A | B̄).',
        '<strong>Paso 2:</strong> aplicamos la definición: P(A | B̄) = P(A ∩ B̄) / P(B̄).',
        '<strong>Paso 3:</strong> P(A ∩ B̄) = P(A) − P(A ∩ B) = 0.70 − 0.30 = 0.40.',
        '<strong>Paso 4:</strong> P(B̄) = 1 − P(B) = 1 − 0.40 = 0.60.',
        '<strong>Paso 5:</strong> P(A | B̄) = 0.40 / 0.60 = <strong>0.6667</strong>.'
      ]
    },

    {
      id: 'b1c-e3',
      statement: 'En una auditoría de sistemas informáticos: el 50% de los servidores presentaron consumo excesivo de memoria durante el último mes; el 40% registraron consumo excesivo de CPU; y el 10% presentaron ambos problemas. Sabiendo que un servidor ha registrado un consumo excesivo de CPU, ¿cuál es la probabilidad de que también haya presentado un consumo excesivo de memoria?',
      sourceNote: 'Ejercicio 13.a del PDF de ejercicios Tema 2',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Te dan información sobre lo que ya ha ocurrido (CPU) y preguntan por otro suceso (memoria). Es condicionada P(M | C).',
      hints: [
        'Define M = "memoria excesiva", C = "CPU excesiva". Datos: P(M)=0.50, P(C)=0.40, P(M∩C)=0.10.',
        'Te piden P(M | C). Aplica la definición: P(M | C) = P(M ∩ C) / P(C).',
        'Sustituye los valores directamente.'
      ],
      answer: 0.25,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sucesos. M = "consumo excesivo de memoria", C = "consumo excesivo de CPU".',
        '<strong>Paso 2:</strong> datos. P(M) = 0.50, P(C) = 0.40, P(M ∩ C) = 0.10.',
        '<strong>Paso 3:</strong> aplicamos la fórmula: P(M | C) = P(M ∩ C) / P(C) = 0.10 / 0.40.',
        '<strong>Paso 4:</strong> P(M | C) = <strong>0.25</strong> (el 25%).'
      ]
    },

    {
      id: 'b1c-e4',
      statement: 'Los alumnos de Estadística de la Escuela Superior de Ingeniería tienen que realizar dos pruebas, una teórica y otra práctica. La probabilidad de que un estudiante apruebe la parte teórica es 0.6, la probabilidad de que apruebe la parte práctica es 0.8 y la probabilidad de que apruebe ambas pruebas es 0.5. ¿Son independientes los sucesos "aprobar la parte teórica" y "aprobar la parte práctica"?',
      sourceNote: 'Ejercicio 12 del PDF teoría Tema 2',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'Te preguntan literalmente si son independientes. Tienes que comprobar si P(T) · P(P) coincide con P(T ∩ P).',
      hints: [
        'Define T = "aprueba teórica", P = "aprueba práctica". Datos: P(T)=0.6, P(P)=0.8, P(T∩P)=0.5.',
        'Para que sean independientes, debe cumplirse P(T) · P(P) = P(T ∩ P).',
        'Calcula 0.6 · 0.8 y compara con 0.5.'
      ],
      answer: null,
      tolerance: null,
      textAnswer: 'No son independientes. P(T)·P(P) = 0.48, pero P(T∩P) = 0.5. Como 0.48 ≠ 0.5, los sucesos no son independientes.',
      solution: [
        '<strong>Paso 1:</strong> sucesos. T = "aprueba teórica", P = "aprueba práctica".',
        '<strong>Paso 2:</strong> datos. P(T) = 0.6, P(P) = 0.8, P(T ∩ P) = 0.5.',
        '<strong>Paso 3:</strong> condición de independencia: P(T) · P(P) = P(T ∩ P).',
        '<strong>Paso 4:</strong> P(T) · P(P) = 0.6 · 0.8 = 0.48.',
        '<strong>Paso 5:</strong> 0.48 ≠ 0.5, por tanto <strong>NO son independientes</strong>. Saber que un alumno aprobó teórica cambia la probabilidad de que apruebe práctica.'
      ]
    },

    {
      id: 'b1c-e5',
      statement: 'Dos máquinas A y B, que funcionan independientemente, producen un determinado tipo de pieza. La máquina A produce un 10% de piezas defectuosas y la máquina B un 5%. Se seleccionan al azar una pieza fabricada por cada una de las máquinas. ¿Cuál es la probabilidad de que ninguna pieza sea defectuosa?',
      sourceNote: 'Ejercicio 11.b del PDF de ejercicios Tema 2',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'El enunciado dice explícitamente que las máquinas funcionan independientemente. Aplicas P(intersección) = producto de probabilidades sobre los complementarios.',
      hints: [
        'Define DA = "pieza de A defectuosa", DB = "pieza de B defectuosa". P(DA)=0.10, P(DB)=0.05. Son independientes.',
        '"Ninguna defectuosa" = D̄A ∩ D̄B. Como son independientes, P(D̄A ∩ D̄B) = P(D̄A) · P(D̄B).',
        'Calcula P(D̄A) = 1 − 0.10 y P(D̄B) = 1 − 0.05, y multiplica.'
      ],
      answer: 0.855,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sucesos. DA = "la pieza de A es defectuosa", DB = "la pieza de B es defectuosa".',
        '<strong>Paso 2:</strong> datos. P(DA) = 0.10, P(DB) = 0.05. Son independientes.',
        '<strong>Paso 3:</strong> "ninguna defectuosa" = D̄A ∩ D̄B. Por independencia: P(D̄A ∩ D̄B) = P(D̄A) · P(D̄B).',
        '<strong>Paso 4:</strong> P(D̄A) = 1 − 0.10 = 0.90. P(D̄B) = 1 − 0.05 = 0.95.',
        '<strong>Paso 5:</strong> P(D̄A ∩ D̄B) = 0.90 · 0.95 = <strong>0.855</strong> (el 85.5%).'
      ]
    }
  ]
};
