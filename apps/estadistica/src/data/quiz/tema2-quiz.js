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
  },

  // ── Probabilidad básica (8) ─────────────────────────────────
  {
    id: 'q-t2-9', tema: 2, concept: 'Espacio muestral', difficulty: 'facil',
    question: 'Al lanzar dos dados, ¿cuál es el cardinal del espacio muestral?',
    options: ['12', '36', '6', '21'],
    correctIndex: 1,
    explanation: '6 caras × 6 caras = 36 resultados ordenados.'
  },
  {
    id: 'q-t2-10', tema: 2, concept: 'Suceso complementario', difficulty: 'facil',
    question: 'Si P(A) = 0.7, entonces P(Aᶜ) =',
    options: ['0.7', '0.3', '0.5', 'No se puede saber'],
    correctIndex: 1,
    explanation: 'P(Aᶜ) = 1 - P(A) = 1 - 0.7 = 0.3.'
  },
  {
    id: 'q-t2-11', tema: 2, concept: 'Unión de sucesos', difficulty: 'medio',
    question: 'Si P(A) = 0.5, P(B) = 0.4 y P(A ∩ B) = 0.2, entonces P(A ∪ B) =',
    options: ['0.9', '0.7', '0.6', '0.10'],
    correctIndex: 1,
    explanation: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.5 + 0.4 - 0.2 = 0.7.'
  },
  {
    id: 'q-t2-12', tema: 2, concept: 'Sucesos incompatibles', difficulty: 'facil',
    question: 'Dos sucesos son incompatibles (mutuamente excluyentes) si:',
    options: ['Son independientes', 'Su intersección es vacía: P(A ∩ B) = 0', 'P(A) + P(B) = 1', 'Tienen la misma probabilidad'],
    correctIndex: 1,
    explanation: 'Incompatibles ⇔ no pueden ocurrir simultáneamente ⇔ A ∩ B = ∅.'
  },
  {
    id: 'q-t2-13', tema: 2, concept: 'Laplace', difficulty: 'facil',
    question: 'En una baraja de 52 cartas, ¿probabilidad de sacar un as?',
    options: ['1/52', '1/13', '1/4', '4/13'],
    correctIndex: 1,
    explanation: 'Hay 4 ases entre 52 cartas: 4/52 = 1/13 (regla de Laplace).'
  },
  {
    id: 'q-t2-14', tema: 2, concept: 'Probabilidad geométrica', difficulty: 'medio',
    question: 'En un círculo de radio 2, lanzas un punto al azar. ¿Probabilidad de caer en el círculo concéntrico de radio 1?',
    options: ['1/2', '1/4', '1/π', 'π/4'],
    correctIndex: 1,
    explanation: 'P = área pequeño / área grande = π·1² / π·2² = 1/4.'
  },
  {
    id: 'q-t2-15', tema: 2, concept: 'Permutaciones', difficulty: 'medio',
    question: '¿De cuántas formas se pueden ordenar 5 libros distintos en una estantería?',
    options: ['5', '25', '120', '32'],
    correctIndex: 2,
    explanation: 'P(5) = 5! = 120.'
  },
  {
    id: 'q-t2-16', tema: 2, concept: 'Variaciones', difficulty: 'dificil',
    question: '8 candidatos, 3 puestos diferentes (presidente, secretario, tesorero). ¿Cuántas asignaciones son posibles?',
    options: ['56', '336', '512', '24'],
    correctIndex: 1,
    explanation: 'V(8, 3) = 8·7·6 = 336 (importa el orden, sin repetición).'
  },

  // ── Condicionada e independencia (6) ────────────────────────
  {
    id: 'q-t2-17', tema: 2, concept: 'Probabilidad condicionada', difficulty: 'medio',
    question: 'P(A|B) = P(A ∩ B) / P(B) requiere que:',
    options: ['A y B sean incompatibles', 'P(B) > 0', 'P(A) > 0', 'A y B sean independientes'],
    correctIndex: 1,
    explanation: 'Para condicionar a B, B debe ser un suceso de probabilidad positiva.'
  },
  {
    id: 'q-t2-18', tema: 2, concept: 'Independencia', difficulty: 'medio',
    question: 'Si A y B son independientes, P(A ∩ B) =',
    options: ['P(A) + P(B)', 'P(A) · P(B)', '0', 'P(A) - P(B)'],
    correctIndex: 1,
    explanation: 'Independencia ⇔ P(A ∩ B) = P(A) · P(B).'
  },
  {
    id: 'q-t2-19', tema: 2, concept: 'Independencia vs incompatibilidad', difficulty: 'dificil',
    question: 'Si A y B son incompatibles con P(A), P(B) > 0, ¿pueden ser independientes?',
    options: ['Sí', 'No', 'Sólo si P(A) = P(B)', 'Sólo si P(A) = 0.5'],
    correctIndex: 1,
    explanation: 'Si A∩B=∅, P(A∩B)=0; pero independencia requiere P(A)·P(B)>0. Son propiedades incompatibles.'
  },
  {
    id: 'q-t2-20', tema: 2, concept: 'Sin reemplazamiento', difficulty: 'medio',
    question: 'Urna con 3 blancas y 2 negras, extraes 2 sin reemplazo. P(2ª blanca | 1ª blanca) =',
    options: ['3/5', '2/4 = 1/2', '3/4', '1/5'],
    correctIndex: 1,
    explanation: 'Tras sacar una blanca quedan 2 blancas y 2 negras: P = 2/4 = 1/2.'
  },
  {
    id: 'q-t2-21', tema: 2, concept: 'Regla del producto', difficulty: 'medio',
    question: 'P(A) = 0.4, P(B|A) = 0.5. P(A ∩ B) =',
    options: ['0.9', '0.2', '0.1', '0.5'],
    correctIndex: 1,
    explanation: 'P(A ∩ B) = P(A) · P(B|A) = 0.4 · 0.5 = 0.2.'
  },
  {
    id: 'q-t2-22', tema: 2, concept: 'Lanzamientos independientes', difficulty: 'facil',
    question: 'Lanzas 3 monedas. ¿Probabilidad de obtener 3 caras seguidas?',
    options: ['1/2', '1/4', '1/6', '1/8'],
    correctIndex: 3,
    explanation: 'Por independencia: (1/2)³ = 1/8.'
  },

  // ── Bayes y probabilidad total (8) ──────────────────────────
  {
    id: 'q-t2-23', tema: 2, concept: 'Probabilidad total', difficulty: 'medio',
    question: '3 líneas A, B, C producen 40%, 35% y 25%. Tasas de defecto: 2%, 3% y 5%. P(defectuoso) =',
    options: ['0.030', '0.0285', '0.04', '0.10'],
    correctIndex: 1,
    explanation: '0.4·0.02 + 0.35·0.03 + 0.25·0.05 = 0.0285.'
  },
  {
    id: 'q-t2-24', tema: 2, concept: 'Bayes', difficulty: 'medio',
    question: 'En el contexto anterior, si una pieza es defectuosa, P(que venga de C) =',
    options: ['0.25', '0.0125/0.0285 ≈ 0.439', '0.05', '0.10'],
    correctIndex: 1,
    explanation: 'P(C|D) = P(C)·P(D|C)/P(D) = (0.25·0.05)/0.0285 ≈ 0.439.'
  },
  {
    id: 'q-t2-25', tema: 2, concept: 'Falsos positivos', difficulty: 'dificil',
    question: 'Test sensibilidad 99% y especificidad 95%, prevalencia 0.5%. P(enf | +) ≈',
    options: ['0.99', '0.50', '0.09', '0.005'],
    correctIndex: 2,
    explanation: '(0.005·0.99) / (0.005·0.99 + 0.995·0.05) ≈ 0.0904. Baja prevalencia → muchos FP relativos.'
  },
  {
    id: 'q-t2-26', tema: 2, concept: 'Bayes con dos hipótesis', difficulty: 'medio',
    question: 'Urna A: 2 blancas y 8 negras. Urna B: 5 blancas y 5 negras. Eliges una al azar, sale blanca. P(B | blanca) =',
    options: ['1/2', '5/7', '2/7', '1/7'],
    correctIndex: 1,
    explanation: '(0.5·0.5)/(0.5·0.5+0.5·0.2) = 0.25/0.35 = 5/7.'
  },
  {
    id: 'q-t2-27', tema: 2, concept: 'Probabilidad total intuitiva', difficulty: 'facil',
    question: 'En una empresa 60% hombres, 40% mujeres. 5% hombres y 8% mujeres tienen carnet B. P(carnet B) =',
    options: ['0.06', '0.062', '0.13', '0.05'],
    correctIndex: 1,
    explanation: '0.6·0.05 + 0.4·0.08 = 0.062.'
  },
  {
    id: 'q-t2-28', tema: 2, concept: 'Partición', difficulty: 'medio',
    question: 'Para aplicar el teorema de la probabilidad total, los sucesos B₁..Bₙ deben formar:',
    options: ['Una sucesión cualquiera', 'Una partición de Ω (incompatibles y exhaustivos)', 'Una cadena de Markov', 'Sucesos equiprobables'],
    correctIndex: 1,
    explanation: 'Partición: ∪Bᵢ = Ω y Bᵢ ∩ Bⱼ = ∅ para i ≠ j.'
  },
  {
    id: 'q-t2-29', tema: 2, concept: 'Paradoja FP', difficulty: 'dificil',
    question: '¿Por qué un test con 95% fiabilidad puede dar muchos falsos positivos en una enfermedad rara?',
    options: [
      'Porque el test está mal calibrado',
      'Porque al ser pequeña la prevalencia, el grupo de sanos es enorme y el 5% de FP ahí supera al 95% de TP entre los pocos enfermos',
      'Porque 95% no es estadísticamente significativo',
      'Por la ley de los grandes números'
    ],
    correctIndex: 1,
    explanation: 'Paradoja del falso positivo: en términos absolutos, 5% de 99% sanos > 95% de 1% enfermos.'
  },
  {
    id: 'q-t2-30', tema: 2, concept: 'Bayes spam', difficulty: 'medio',
    question: 'Spam = 30% de emails. P("ganaste"|spam)=0.4; P("ganaste"|legítimo)=0.01. P(spam | "ganaste") ≈',
    options: ['0.40', '0.30', '0.94', '0.01'],
    correctIndex: 2,
    explanation: '(0.3·0.4)/(0.3·0.4+0.7·0.01) = 0.12/0.127 ≈ 0.945.'
  }
];
