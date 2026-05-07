export const FORMULAS = [
  {
    tema: 1,
    temaTitle: 'Estadística descriptiva',
    sections: [
      {
        title: 'Frecuencias',
        formulas: [
          { id: 'f-fi', name: 'Frecuencia relativa', latex: 'fᵢ = nᵢ / N', when: 'Para expresar la proporción de un valor sobre el total', warning: null },
          { id: 'f-Ni', name: 'Frecuencia absoluta acumulada', latex: 'Nᵢ = n₁ + n₂ + ... + nᵢ', when: 'En variables cuantitativas u ordinales para acumular hasta xᵢ', warning: null }
        ]
      },
      {
        title: 'Tendencia central',
        formulas: [
          { id: 'f-media', name: 'Media aritmética', latex: 'x̄ = (Σ xᵢ · nᵢ) / N', when: 'Valor central de datos cuantitativos sin outliers fuertes', warning: 'Sensible a valores extremos. Si hay outliers, prefiere la mediana' },
          { id: 'f-mediana', name: 'Mediana', latex: 'Me = posición (N+1)/2 si impar, media de centrales si par', when: 'Cuando hay outliers o queremos un valor robusto', warning: null },
          { id: 'f-moda', name: 'Moda', latex: 'Mo = valor con mayor frecuencia', when: 'Para cualquier tipo de variable; en cualitativas es la única medida', warning: 'Puede no ser única (bimodal, trimodal)' }
        ]
      },
      {
        title: 'Dispersión',
        formulas: [
          { id: 'f-rango', name: 'Rango', latex: 'R = max − min', when: 'Idea rápida de la amplitud', warning: 'Sensible a outliers' },
          { id: 'f-RI', name: 'Rango intercuartílico', latex: 'RI = Q₃ − Q₁', when: 'Dispersión robusta del 50% central', warning: null },
          { id: 'f-var', name: 'Varianza', latex: 'S² = (Σ xᵢ² · nᵢ)/N − x̄²', when: 'Dispersión cuantitativa respecto a la media', warning: 'Unidades al cuadrado' },
          { id: 'f-sd', name: 'Desviación típica', latex: 'S = √(S²)', when: 'Misma unidad que la variable', warning: null },
          { id: 'f-CV', name: 'Coeficiente de variación', latex: 'V = S / |x̄|', when: 'Comparar dispersión entre escalas distintas', warning: 'No definido si x̄ = 0' }
        ]
      },
      {
        title: 'Posición',
        formulas: [
          { id: 'f-Qi', name: 'Cuartil i-ésimo', latex: 'posición p = N · i / 4', when: 'Q₁, Q₂, Q₃', warning: 'Si p es entero, promediar valores en p y p+1' },
          { id: 'f-Pi', name: 'Percentil i-ésimo', latex: 'posición p = N · i / 100', when: 'Pᵢ con i de 1 a 99', warning: null }
        ]
      },
      {
        title: 'Forma',
        formulas: [
          { id: 'f-g1', name: 'Asimetría de Fisher', latex: 'g₁ = m₃ / S³', when: 'Detectar sesgo. m₃ = (1/N) Σ (xᵢ−x̄)³', warning: 'g₁=0 simétrica, g₁>0 sesgo derecha, g₁<0 sesgo izquierda' },
          { id: 'f-g2', name: 'Curtosis', latex: 'g₂ = m₄ / S⁴ − 3', when: 'Apuntamiento respecto a la normal. m₄ = (1/N) Σ (xᵢ−x̄)⁴', warning: 'g₂=0 mesocúrtica, >0 leptocúrtica, <0 platicúrtica' }
        ]
      }
    ]
  },
  {
    tema: 2,
    temaTitle: 'Probabilidad',
    sections: [
      {
        title: 'Operaciones y propiedades básicas',
        formulas: [
          { id: 'f-laplace', name: 'Regla de Laplace', latex: 'P(A) = nº favorables / nº posibles', when: 'Espacios finitos y equiprobables', warning: 'Solo si TODOS los sucesos elementales son equiprobables' },
          { id: 'f-union', name: 'Probabilidad de la unión', latex: 'P(A∪B) = P(A) + P(B) − P(A∩B)', when: 'Cuando A y B son compatibles', warning: 'Si incompatibles, P(A∩B)=0 y se simplifica' },
          { id: 'f-complem', name: 'Complementario', latex: 'P(Ā) = 1 − P(A)', when: 'Atajo cuando es más fácil calcular el contrario', warning: 'Útil para "al menos uno"' }
        ]
      },
      {
        title: 'Combinatoria',
        formulas: [
          { id: 'f-perm', name: 'Permutaciones sin repetición', latex: 'Pₘ = m!', when: 'Ordenar m elementos distintos', warning: null },
          { id: 'f-var', name: 'Variaciones sin repetición', latex: 'V(m,n) = m! / (m−n)!', when: 'n elementos en orden, sin repetir', warning: null },
          { id: 'f-comb', name: 'Combinaciones sin repetición', latex: 'C(m,n) = m! / (n!(m−n)!)', when: 'n elementos sin orden, sin repetir', warning: null }
        ]
      },
      {
        title: 'Condicionada e independencia',
        formulas: [
          { id: 'f-cond', name: 'Probabilidad condicionada', latex: 'P(A | B) = P(A∩B) / P(B)', when: 'Cuando ya ha ocurrido B', warning: 'P(A|B̄) NO es 1 − P(A|B)' },
          { id: 'f-prod', name: 'Regla del producto', latex: 'P(A∩B) = P(A)·P(B|A)', when: 'Para descomponer una intersección', warning: null },
          { id: 'f-indep', name: 'Independencia', latex: 'P(A∩B) = P(A)·P(B)', when: 'Equivale a P(A|B) = P(A)', warning: 'No es lo mismo que incompatibles' }
        ]
      },
      {
        title: 'Probabilidad total y Bayes',
        formulas: [
          { id: 'f-total', name: 'Probabilidad total', latex: 'P(B) = Σ P(Aᵢ)·P(B|Aᵢ)', when: 'Hay varias causas {Aᵢ} que forman partición', warning: 'Las Aᵢ deben sumar 1 y ser excluyentes' },
          { id: 'f-bayes', name: 'Teorema de Bayes', latex: 'P(Aᵢ|B) = [P(Aᵢ)·P(B|Aᵢ)] / P(B)', when: '"Sabiendo que ocurrió B, ¿cuál es la causa?"', warning: 'P(B) se calcula con probabilidad total' }
        ]
      }
    ]
  },
  {
    tema: 3,
    temaTitle: 'Variable aleatoria',
    sections: [
      {
        title: 'V.A. discreta',
        formulas: [
          { id: 'f-fmp', name: 'Función masa de probabilidad', latex: 'p(xᵢ) = P(X = xᵢ);  Σ p(xᵢ) = 1', when: 'Para v.a. discretas', warning: null },
          { id: 'f-Edisc', name: 'Esperanza', latex: 'E[X] = Σ xᵢ · P(X = xᵢ)', when: 'Valor esperado en discretas', warning: null },
          { id: 'f-Vdisc', name: 'Varianza', latex: 'Var(X) = Σ (xᵢ − μ)² · pᵢ = E[X²] − μ²', when: 'Dispersión esperada', warning: null }
        ]
      },
      {
        title: 'V.A. continua',
        formulas: [
          { id: 'f-fdens', name: 'Función de densidad', latex: 'f(x) ≥ 0,  ∫ f(x) dx = 1', when: 'Modela continuas', warning: 'f(x) NO es probabilidad. Puede valer > 1' },
          { id: 'f-Pint', name: 'Probabilidad de un intervalo', latex: 'P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx', when: 'Para v.a. continuas', warning: 'P(X = a) = 0 siempre' },
          { id: 'f-Econt', name: 'Esperanza', latex: 'E[X] = ∫ x · f(x) dx', when: 'Continuas', warning: null }
        ]
      },
      {
        title: 'Función de distribución',
        formulas: [
          { id: 'f-F', name: 'Función de distribución', latex: 'F(x) = P(X ≤ x)', when: 'Acumulada hasta x', warning: 'En continuas, F\'(x) = f(x)' },
          { id: 'f-Pab', name: 'Diferencia de F', latex: 'P(a < X ≤ b) = F(b) − F(a)', when: 'Calcular probabilidad de un intervalo', warning: null }
        ]
      },
      {
        title: 'Desigualdades',
        formulas: [
          { id: 'f-cheb', name: 'Chebyshev', latex: 'P(|X − μ| < kσ) ≥ 1 − 1/k²', when: 'Cuando NO conocemos la distribución', warning: 'Es solo cota inferior' }
        ]
      }
    ]
  },
  {
    tema: 4,
    temaTitle: 'Modelos de probabilidad',
    sections: [
      {
        title: 'Binomial',
        formulas: [
          { id: 'f-bin-p', name: 'P(X = k)', latex: 'P(X=k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ', when: 'k éxitos en n ensayos independientes', warning: 'p constante en cada ensayo' },
          { id: 'f-bin-E', name: 'Media y varianza', latex: 'E[X] = np,  Var(X) = np(1−p)', when: 'Resumen de una B(n, p)', warning: null }
        ]
      },
      {
        title: 'Poisson',
        formulas: [
          { id: 'f-poi-p', name: 'P(X = k)', latex: 'P(X=k) = (λᵏ · e⁻λ) / k!', when: 'Eventos en un intervalo, λ = media', warning: null },
          { id: 'f-poi-E', name: 'Media y varianza', latex: 'E[X] = Var(X) = λ', when: 'Igualdad media-varianza', warning: 'Si no se cumple, no es Poisson' },
          { id: 'f-poi-rep', name: 'Reproductividad', latex: 'X₁ + X₂ → P(λ₁ + λ₂)', when: 'Para escalar el intervalo', warning: null }
        ]
      },
      {
        title: 'Exponencial',
        formulas: [
          { id: 'f-exp-f', name: 'Densidad', latex: 'f(x) = λ·e⁻λˣ,  x ≥ 0', when: 'Tiempos de vida, espera entre eventos', warning: null },
          { id: 'f-exp-F', name: 'Distribución', latex: 'F(x) = 1 − e⁻λˣ', when: 'P(X ≤ x). P(X > x) = e⁻λˣ', warning: null },
          { id: 'f-exp-mem', name: 'Falta de memoria', latex: 'P(X > t₁+t₂ | X > t₁) = P(X > t₂)', when: 'Condicionadas tipo "lleva funcionando..."', warning: 'Solo en exponencial' },
          { id: 'f-exp-E', name: 'Media y varianza', latex: 'E[X] = 1/λ,  Var(X) = 1/λ²', when: 'Si te dan media μ, λ = 1/μ', warning: null }
        ]
      },
      {
        title: 'Normal',
        formulas: [
          { id: 'f-norm-f', name: 'Densidad', latex: 'f(x) = (1/(σ√(2π)))·exp(−(x−μ)²/(2σ²))', when: 'Variables continuas simétricas', warning: 'Es densidad, no probabilidad' },
          { id: 'f-norm-Z', name: 'Tipificación', latex: 'Z = (X − μ) / σ → N(0, 1)', when: 'Antes de buscar en tabla N(0,1)', warning: 'Usa Z para comparar valores de poblaciones distintas' },
          { id: 'f-norm-rep', name: 'Reproductividad', latex: 'X₁+X₂ → N(μ₁+μ₂, √(σ₁²+σ₂²))', when: 'Suma de normales independientes', warning: null }
        ]
      },
      {
        title: 'Aproximaciones',
        formulas: [
          { id: 'f-bin-norm', name: 'Binomial → Normal', latex: 'B(n, p) ≈ N(np, √(np(1−p))) si np > 5', when: 'n grande, p no extrema', warning: 'Aplica corrección por continuidad: P(X≤k) ≈ P(Y≤k+0.5)' },
          { id: 'f-poi-norm', name: 'Poisson → Normal', latex: 'P(λ) ≈ N(λ, √λ) si λ ≥ 10', when: 'λ grande', warning: null },
          { id: 'f-bin-poi', name: 'Binomial → Poisson', latex: 'B(n, p) ≈ P(np) si n>30, p≤0.1', when: 'n grande y p pequeña', warning: null }
        ]
      }
    ]
  },
  {
    tema: 5,
    temaTitle: 'Inferencia estadística',
    sections: [
      {
        title: 'Estimadores',
        formulas: [
          { id: 'f-Xbar', name: 'Media muestral', latex: 'X̄ = (1/n) Σ Xᵢ', when: 'Estimador de μ', warning: 'Insesgado, eficiente' },
          { id: 'f-S2', name: 'Cuasivarianza', latex: 'S² = (1/(n−1)) Σ (Xᵢ − X̄)²', when: 'Estimador insesgado de σ²', warning: 'Denominador n−1, no n' },
          { id: 'f-phat', name: 'Proporción muestral', latex: 'p̂ = X / n', when: 'Estimador de p', warning: null }
        ]
      },
      {
        title: 'Intervalos de confianza',
        formulas: [
          { id: 'f-IC-mu-z', name: 'IC para μ con σ conocida', latex: 'X̄ ± z_{α/2} · σ/√n', when: 'σ poblacional conocida o n grande', warning: null },
          { id: 'f-IC-mu-t', name: 'IC para μ con σ desconocida', latex: 'X̄ ± t_{n−1, α/2} · S/√n', when: 'σ desconocida y n pequeña, población normal', warning: 'Usa t-Student con n−1 g.l.' },
          { id: 'f-IC-p', name: 'IC para proporción', latex: 'p̂ ± z_{α/2} · √(p̂(1−p̂)/n)', when: 'IC para p en muestras grandes', warning: 'Requiere n·p̂ y n·(1−p̂) > 5' },
          { id: 'f-IC-var', name: 'IC para σ²', latex: '((n−1)S²/χ²_{α/2}, (n−1)S²/χ²_{1−α/2})', when: 'IC para varianza poblacional', warning: 'Población normal' }
        ]
      },
      {
        title: 'Contrastes',
        formulas: [
          { id: 'f-Z-mu', name: 'Estadístico Z para μ', latex: 'Z = (X̄ − μ₀) / (σ/√n)', when: 'Contraste sobre μ con σ conocida', warning: 'Si σ desconocida y n pequeña, usa T' },
          { id: 'f-Z-p', name: 'Estadístico Z para p', latex: 'Z = (p̂ − p₀) / √(p₀(1−p₀)/n)', when: 'Contraste sobre proporción', warning: null },
          { id: 'f-pvalor', name: 'p-valor', latex: 'p = P(estadístico ≥ obs | H₀)', when: 'Decisión: si p < α se rechaza H₀', warning: 'p > α NO significa que H₀ sea cierta' }
        ]
      }
    ]
  }
];
