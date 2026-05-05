export const tema3 = {
  id: 3,
  title: 'Variable aleatoria',
  source: 'EINDUS-T3.pdf',
  sections: [
    {
      id: 't3-s1',
      title: 'Concepto de variable aleatoria',
      content: `
        <p>Una <strong>variable aleatoria</strong> (v.a.) es una función X: Ω → ℝ que asigna un valor numérico a cada suceso elemental. Se denota con letra mayúscula (X, Y) y los valores que toma con minúsculas.</p>
        <p>El conjunto de valores que toma X se llama <strong>soporte</strong> y se denota S_X.</p>
        <ul>
          <li><strong>Discreta:</strong> S_X es finito o infinito numerable.</li>
          <li><strong>Continua:</strong> S_X es infinito no numerable (intervalo de ℝ).</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't3-s2',
      title: 'V.a. discreta: función masa de probabilidad',
      content: `
        <p>La <strong>función masa de probabilidad</strong> (f.m.p.) p(x) de una v.a. discreta verifica:</p>
        <ul>
          <li>0 ≤ P(X = xᵢ) ≤ 1 para todo i.</li>
          <li>Σ P(X = xᵢ) = 1.</li>
        </ul>
        <p>Se puede expresar en tabla o analíticamente. Para calcular probabilidades en intervalos, se suman:</p>
        <p style="text-align:center">P(a ≤ X ≤ b) = P(X = a) + ... + P(X = b)</p>
        <p>En v.a. discretas SÍ importa si los extremos son estrictos: P(X &lt; a) ≠ P(X ≤ a).</p>
      `,
      examples: []
    },
    {
      id: 't3-s3',
      title: 'Función de distribución',
      content: `
        <p>La <strong>función de distribución</strong> F(x) = P(X ≤ x) recoge la probabilidad acumulada hasta x.</p>
        <ul>
          <li>En v.a. discretas: escalonada. F(x) = Σ P(X = xᵢ) para xᵢ ≤ x.</li>
          <li>En v.a. continuas: continua. F(x) = ∫_{-∞}^{x} f(t) dt.</li>
        </ul>
        <p>Propiedades: 0 ≤ F(x) ≤ 1, no decreciente, F(−∞) = 0, F(+∞) = 1.</p>
        <p>Útil: P(a &lt; X ≤ b) = F(b) − F(a).</p>
      `,
      examples: []
    },
    {
      id: 't3-s4',
      title: 'Esperanza, varianza y momentos',
      content: `
        <p><strong>Esperanza</strong> (media o valor esperado) de X:</p>
        <ul>
          <li>Discreta: E[X] = Σ xᵢ · P(X = xᵢ).</li>
          <li>Continua: E[X] = ∫ x · f(x) dx.</li>
        </ul>

        <p><strong>Varianza:</strong> Var(X) = E[(X − μ)²] = E[X²] − E[X]². Mide la dispersión respecto a la media.</p>
        <p><strong>Desviación típica:</strong> σ(X) = √Var(X).</p>

        <p><strong>Propiedades:</strong></p>
        <ul>
          <li>E[k] = k, E[kX] = k·E[X], E[X+Y] = E[X] + E[Y].</li>
          <li>Var(k) = 0, Var(kX) = k²·Var(X), Var(k + X) = Var(X).</li>
          <li>Si X e Y son independientes, Var(X+Y) = Var(X) + Var(Y).</li>
        </ul>

        <p><strong>Momentos:</strong></p>
        <ul>
          <li>Respecto al origen: αᵣ = E[Xʳ]. En particular α₁ = μ.</li>
          <li>Respecto a la media: μᵣ = E[(X − μ)ʳ]. μ₂ = Var(X).</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't3-s5',
      title: 'Moda, mediana y cuantiles',
      content: `
        <p><strong>Moda</strong> Mo: valor que maximiza P(X = xᵢ) (discreta) o f(x) (continua).</p>
        <p><strong>Mediana</strong> Me: P(X ≤ Me) ≥ 1/2 y P(X ≥ Me) ≥ 1/2. En continuas, F(Me) = 0.5.</p>
        <p><strong>Cuantil</strong> de orden α: x_α tal que F(x_α) = α en continuas (P(X ≤ x_α) ≥ α en discretas).</p>
      `,
      examples: []
    },
    {
      id: 't3-s6',
      title: 'V.a. continua: función de densidad',
      content: `
        <p>En v.a. continuas, P(X = a) = 0 para todo a (probabilidad puntual nula). Por eso usamos la <strong>función de densidad</strong> f(x) que verifica:</p>
        <ul>
          <li>f(x) ≥ 0 para todo x ∈ ℝ.</li>
          <li>∫_{-∞}^{+∞} f(x) dx = 1 (área total bajo la curva = 1).</li>
        </ul>
        <p>La probabilidad de un intervalo es el área bajo f:</p>
        <p style="text-align:center">P(a ≤ X ≤ b) = ∫_a^b f(x) dx</p>
        <p>En v.a. continuas, P(a ≤ X ≤ b) = P(a &lt; X &lt; b) (los extremos no influyen).</p>
        <p>Relación con F: f(x) = F'(x), F(x) = ∫_{-∞}^x f(t) dt.</p>
      `,
      examples: []
    },
    {
      id: 't3-s7',
      title: 'Desigualdad de Chebyshev',
      content: `
        <p>Para cualquier variable aleatoria con media μ y desviación típica σ, y cualquier k > 0:</p>
        <p style="text-align:center">P(|X − μ| ≥ k·σ) ≤ 1/k²</p>
        <p>Equivalentemente: P(|X − μ| &lt; k·σ) ≥ 1 − 1/k².</p>
        <p>Útil cuando NO conocemos la distribución exacta de X. Da cotas conservadoras (suelen ser amplias).</p>
        <p>Ejemplo típico: con k = 2, al menos el 75% de los datos están a menos de 2 desviaciones típicas de la media. Con k = 3, al menos el 88.9%.</p>
      `,
      examples: []
    }
  ]
};
