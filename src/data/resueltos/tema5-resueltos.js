export const tema5Resueltos = [
  {
    id: 't5-r1',
    statement: 'Muestra de 36 baterías con tiempo medio de carga X̄ = 78 min y σ poblacional 6 min. IC al 95% para la media μ.',
    sourceNote: 'Ejercicio estándar de IC para la media (σ conocida)',
    type: 'Intervalo de confianza para μ',
    relatedConcepts: ['t5-s5'],
    solution: [
      { step: 1, title: 'Identificación del caso', content: '<p>σ poblacional conocida y n = 36 ≥ 30, así que usamos la distribución Normal.</p>' },
      { step: 2, title: 'Valor crítico', content: '<p>Para 95% de confianza, α = 0.05, z_{α/2} = 1.96.</p>' },
      { step: 3, title: 'Error', content: '<p>Error = z_{α/2} · σ/√n = 1.96 · 6/√36 = 1.96 · 1 = 1.96.</p>' },
      { step: 4, title: 'Intervalo', content: '<p>IC: X̄ ± error = 78 ± 1.96 = (<strong>76.04, 79.96</strong>) minutos.</p>' }
    ],
    finalAnswer: '<strong>IC 95% para μ: (76.04, 79.96) minutos.</strong>',
    notes: 'Si n < 30, habría que asumir normalidad de la población o usar t-Student si σ es desconocida.'
  },
  {
    id: 't5-r2',
    statement: 'Muestra de 16 piezas con X̄ = 25.4 mm y S = 0.6 mm (cuasidesviación muestral). Población normal. IC al 99% para μ.',
    sourceNote: 'Ejercicio estándar de IC con t-Student',
    type: 'Intervalo de confianza con σ desconocida',
    relatedConcepts: ['t5-s5'],
    solution: [
      { step: 1, title: 'Identificación', content: '<p>σ desconocida y n = 16 < 30, así que usamos t-Student con n − 1 = 15 grados de libertad.</p>' },
      { step: 2, title: 'Valor crítico', content: '<p>α = 0.01, t_{15, 0.005} ≈ 2.947.</p>' },
      { step: 3, title: 'Error', content: '<p>Error = t · S/√n = 2.947 · 0.6/4 = 2.947 · 0.15 ≈ 0.442.</p>' },
      { step: 4, title: 'Intervalo', content: '<p>IC: 25.4 ± 0.442 = (<strong>24.958, 25.842</strong>) mm.</p>' }
    ],
    finalAnswer: '<strong>IC 99% para μ: (24.96, 25.84) mm.</strong>',
    notes: 'A mayor confianza, mayor amplitud del intervalo.'
  },
  {
    id: 't5-r3',
    statement: 'Contraste sobre la duración media de un componente. H₀: μ = 1000 h, H₁: μ ≠ 1000. Muestra n = 49, X̄ = 985, σ = 35. Nivel α = 0.05.',
    sourceNote: 'Ejercicio estándar de contraste bilateral para μ',
    type: 'Contraste de hipótesis sobre la media',
    relatedConcepts: ['t5-s6'],
    solution: [
      { step: 1, title: 'Estadístico de contraste', content: '<p>Como σ es conocida y n grande, usamos Z = (X̄ − μ₀)/(σ/√n).</p>' },
      { step: 2, title: 'Cálculo', content: '<p>Z = (985 − 1000)/(35/√49) = −15/5 = <strong>−3</strong>.</p>' },
      { step: 3, title: 'Región crítica', content: '<p>Bilateral con α = 0.05: rechazamos H₀ si |Z| > z_{0.025} = 1.96.</p>' },
      { step: 4, title: 'Decisión', content: '<p>|−3| = 3 > 1.96 ⇒ <strong>rechazamos H₀</strong>. La duración media es significativamente distinta de 1000 horas.</p>' },
      { step: 5, title: 'p-valor', content: '<p>p-valor = 2·P(Z < −3) ≈ 2·0.00135 = 0.0027 < 0.05 ⇒ confirma rechazar H₀.</p>' }
    ],
    finalAnswer: '<strong>Z = −3, p ≈ 0.003. Se rechaza H₀: la duración media difiere de 1000 h.</strong>',
    notes: 'Cuando p < α, hay evidencia suficiente contra H₀. Cuando p > α, no hay evidencia para rechazar (no significa que H₀ sea cierta).'
  }
];
