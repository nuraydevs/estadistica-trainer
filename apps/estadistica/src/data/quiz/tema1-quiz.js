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
  },

  // ── Centralización y dispersión (6) ─────────────────────────
  {
    id: 'q-t1-9', tema: 1, concept: 'Media ponderada', difficulty: 'medio',
    question: 'La nota final pondera Examen 60%, Prácticas 30%, Asistencia 10%. Si un alumno saca 4, 8 y 10 respectivamente, su nota es:',
    options: ['7.33', '5.80', '6.40', '7.00'],
    correctIndex: 1,
    explanation: '0.6·4 + 0.3·8 + 0.1·10 = 2.4 + 2.4 + 1 = 5.8.'
  },
  {
    id: 'q-t1-10', tema: 1, concept: 'Moda', difficulty: 'facil',
    question: 'En una variable cualitativa, ¿qué medida de centralización se puede usar?',
    options: ['Media', 'Mediana', 'Moda', 'Las tres'],
    correctIndex: 2,
    explanation: 'Solo la moda tiene sentido en variables cualitativas; la media y mediana requieren orden numérico.'
  },
  {
    id: 'q-t1-11', tema: 1, concept: 'Varianza muestral', difficulty: 'medio',
    question: '¿Por qué la varianza muestral divide entre n-1 en vez de n?',
    options: [
      'Por convención',
      'Para que el estimador sea insesgado de σ²',
      'Para que sea menor',
      'Para que sea positivo'
    ],
    correctIndex: 1,
    explanation: 'Dividir entre n-1 (corrección de Bessel) hace que E[s²] = σ² (estimador insesgado).'
  },
  {
    id: 'q-t1-12', tema: 1, concept: 'Desviación típica', difficulty: 'facil',
    question: 'La desviación típica está en las mismas unidades que:',
    options: ['La varianza', 'La media', 'El rango cuadrático', 'Ninguna'],
    correctIndex: 1,
    explanation: 'La desviación típica = √varianza, vuelve a las unidades originales (igual que la media).'
  },
  {
    id: 'q-t1-13', tema: 1, concept: 'Rango intercuartílico', difficulty: 'medio',
    question: 'El rango intercuartílico (IQR) se define como:',
    options: ['Q₃ - Q₁', 'Máximo - Mínimo', 'Mediana - Moda', '2·desviación típica'],
    correctIndex: 0,
    explanation: 'IQR = Q₃ - Q₁. Contiene el 50% central de los datos y es robusto a outliers.'
  },
  {
    id: 'q-t1-14', tema: 1, concept: 'Coeficiente de variación', difficulty: 'medio',
    question: 'Dos máquinas tienen σ₁=2 (media 50) y σ₂=4 (media 200). ¿Cuál es más estable relativamente?',
    options: ['Máquina 1', 'Máquina 2', 'Igual de estables', 'No se puede comparar'],
    correctIndex: 1,
    explanation: 'CV₁ = 2/50 = 0.04; CV₂ = 4/200 = 0.02. La 2 es más estable porque su dispersión relativa a la media es menor.'
  },

  // ── Frecuencias y representaciones (6) ──────────────────────
  {
    id: 'q-t1-15', tema: 1, concept: 'Frecuencia relativa', difficulty: 'facil',
    question: 'Si en 200 lanzamientos sale "5" exactamente 32 veces, su frecuencia relativa es:',
    options: ['0.16', '0.32', '0.05', '32'],
    correctIndex: 0,
    explanation: 'fᵣ = nᵢ/N = 32/200 = 0.16.'
  },
  {
    id: 'q-t1-16', tema: 1, concept: 'Frecuencia acumulada', difficulty: 'medio',
    question: 'En la frecuencia acumulada Fᵢ del último valor, ¿qué se cumple siempre?',
    options: ['Fₖ = 0', 'Fₖ = N (suma total)', 'Fₖ = nₖ', 'Fₖ = 1/k'],
    correctIndex: 1,
    explanation: 'La frecuencia acumulada del último valor es la suma de todas las frecuencias absolutas, es decir, N.'
  },
  {
    id: 'q-t1-17', tema: 1, concept: 'Diagrama de barras', difficulty: 'facil',
    question: '¿Cuál de estas representaciones NO es adecuada para una variable cualitativa?',
    options: ['Diagrama de barras', 'Diagrama de sectores', 'Histograma', 'Tabla de frecuencias'],
    correctIndex: 2,
    explanation: 'El histograma se usa para variables cuantitativas continuas (intervalos numéricos). Para cualitativas se usa diagrama de barras o sectores.'
  },
  {
    id: 'q-t1-18', tema: 1, concept: 'Tabla de frecuencias', difficulty: 'facil',
    question: '¿Qué columna NO suele aparecer en una tabla de frecuencias?',
    options: ['Frecuencia absoluta', 'Frecuencia relativa', 'Frecuencia acumulada', 'Coeficiente de correlación'],
    correctIndex: 3,
    explanation: 'El coef. de correlación es de 2 variables, no de una tabla de frecuencias.'
  },
  {
    id: 'q-t1-19', tema: 1, concept: 'Histograma', difficulty: 'medio',
    question: 'En un histograma con intervalos de igual amplitud, el área de cada barra es proporcional a:',
    options: ['La amplitud', 'La frecuencia absoluta', 'El centro de clase', 'La densidad'],
    correctIndex: 1,
    explanation: 'Con amplitudes iguales, el área (= altura·amplitud) es proporcional a la frecuencia. Por eso la altura suele igualarse a la frecuencia.'
  },
  {
    id: 'q-t1-20', tema: 1, concept: 'Diagrama de cajas', difficulty: 'medio',
    question: 'En un boxplot, los puntos fuera de los bigotes representan habitualmente:',
    options: ['La mediana', 'Los cuartiles', 'Los outliers', 'La media'],
    correctIndex: 2,
    explanation: 'Los bigotes se extienden hasta 1.5·IQR. Los puntos más allá son outliers.'
  },

  // ── Regresión y correlación (5) ─────────────────────────────
  {
    id: 'q-t1-21', tema: 1, concept: 'Coeficiente de correlación', difficulty: 'facil',
    question: 'El coeficiente de correlación lineal r:',
    options: [
      'Siempre es positivo',
      'Está entre -1 y 1',
      'Es proporcional a la varianza',
      'Es 0 si y solo si las variables son independientes'
    ],
    correctIndex: 1,
    explanation: 'r ∈ [-1, 1]. Mide intensidad y signo de la relación LINEAL. r=0 sólo implica ausencia de relación lineal, no independencia.'
  },
  {
    id: 'q-t1-22', tema: 1, concept: 'Recta de regresión', difficulty: 'medio',
    question: 'En la recta de regresión Y sobre X, el método de mínimos cuadrados minimiza:',
    options: [
      'La suma de errores',
      'La suma de los cuadrados de los errores verticales (Y - Ŷ)²',
      'La suma de los cuadrados de las distancias perpendiculares',
      'La media de los residuos'
    ],
    correctIndex: 1,
    explanation: 'MCO minimiza Σ(yᵢ - ŷᵢ)², el error vertical (en la dirección de la variable dependiente).'
  },
  {
    id: 'q-t1-23', tema: 1, concept: 'Coeficiente de determinación R²', difficulty: 'medio',
    question: 'R² = 0.85 en una regresión lineal simple significa:',
    options: [
      'El 85% de los datos están sobre la recta',
      'Hay 85% de probabilidad de que el modelo sea correcto',
      'El 85% de la variabilidad de Y se explica por X',
      'La pendiente es 0.85'
    ],
    correctIndex: 2,
    explanation: 'R² mide la proporción de varianza de Y explicada por la regresión. R² = r² en regresión simple.'
  },
  {
    id: 'q-t1-24', tema: 1, concept: 'Correlación vs causalidad', difficulty: 'medio',
    question: 'En verano aumentan las ventas de helado y los ahogamientos en piscinas. r ≈ 0.9. ¿Qué se puede concluir?',
    options: [
      'Comer helado provoca ahogamientos',
      'Hay una causa común (calor): correlación no implica causalidad',
      'Es un error de muestreo',
      'r < 1 implica que no hay relación'
    ],
    correctIndex: 1,
    explanation: 'Correlación ≠ causalidad. La temperatura causa ambos efectos: es una variable confusora.'
  },
  {
    id: 'q-t1-25', tema: 1, concept: 'Pendiente de regresión', difficulty: 'medio',
    question: 'En la regresión Y = a + bX, si b = 2.5, significa que:',
    options: [
      'Cuando X=0, Y=2.5',
      'r = 2.5',
      'Por cada unidad que aumenta X, Y aumenta 2.5 unidades en media',
      'Hay 2.5 errores por dato'
    ],
    correctIndex: 2,
    explanation: 'b es la pendiente: cambio esperado en Y por unidad de X.'
  },

  // ── Cuartiles y percentiles (5) ─────────────────────────────
  {
    id: 'q-t1-26', tema: 1, concept: 'Mediana', difficulty: 'facil',
    question: 'La mediana coincide con:',
    options: ['Q₁', 'Q₂', 'Q₃', 'P₂₅'],
    correctIndex: 1,
    explanation: 'La mediana es Q₂ (segundo cuartil) y también P₅₀.'
  },
  {
    id: 'q-t1-27', tema: 1, concept: 'Percentil', difficulty: 'medio',
    question: 'En una prueba, tu percentil 90 significa que:',
    options: [
      'Acertaste el 90% de las preguntas',
      'Tu nota fue 90 sobre 100',
      'El 90% de los examinados sacó nota inferior o igual a la tuya',
      'Estás entre el 10% peor'
    ],
    correctIndex: 2,
    explanation: 'Pₖ deja por debajo el k% de las observaciones. Estás en el top 10%.'
  },
  {
    id: 'q-t1-28', tema: 1, concept: 'Cuartiles', difficulty: 'facil',
    question: 'Q₁ se interpreta como:',
    options: [
      'El valor que deja el 25% de los datos por debajo',
      'El primer dato',
      'La cuarta parte del rango',
      'La media de los menores'
    ],
    correctIndex: 0,
    explanation: 'Q₁ = P₂₅: el 25% de los datos son ≤ Q₁.'
  },
  {
    id: 'q-t1-29', tema: 1, concept: 'Posición percentil', difficulty: 'dificil',
    question: 'En una muestra ordenada de 80 datos, ¿qué posición ocupa aproximadamente el percentil 30?',
    options: ['La posición 30', 'La posición 24', 'La posición 30/80', 'La posición 8'],
    correctIndex: 1,
    explanation: 'P₃₀ está en la posición 30/100 · 80 = 24 (en general k/100·N).'
  },
  {
    id: 'q-t1-30', tema: 1, concept: 'IQR y outliers', difficulty: 'medio',
    question: 'Un dato se considera outlier (regla 1.5·IQR) si está:',
    options: [
      'Por encima de la media',
      'Por encima de Q₃ + 1.5·IQR o por debajo de Q₁ - 1.5·IQR',
      'A más de 3 desviaciones típicas',
      'En el 1% extremo'
    ],
    correctIndex: 1,
    explanation: 'La regla de Tukey usa los bigotes a 1.5·IQR de los cuartiles.'
  }
];
