// El Tema 5 no tiene PDF de ejercicios separado en el material UAL proporcionado.
// Estos son enunciados estándar de inferencia para preparar el examen, alineados
// con el contenido teórico del PDF EINDUS-T5.

export const tema5Ejercicios = [
  {
    id: 't5-ej1',
    numero: 1,
    statement: 'En una muestra de 36 baterías de litio el tiempo medio de carga ha resultado X̄ = 78 minutos, con desviación típica poblacional σ = 6 minutos. Construye un intervalo de confianza al 95% para la media poblacional μ.',
    sourceNote: 'Ejercicio estándar de IC para μ con σ conocida',
    hasSolution: true,
    type: 'Intervalo de confianza para la media (σ conocida)'
  },
  {
    id: 't5-ej2',
    numero: 2,
    statement: 'Una muestra de 16 piezas mecanizadas tiene media X̄ = 25.4 mm y cuasidesviación típica S = 0.6 mm. Suponiendo normalidad, construye un IC al 99% para la media poblacional.',
    sourceNote: 'Ejercicio estándar de IC para μ con σ desconocida (t-Student)',
    hasSolution: true,
    type: 'Intervalo de confianza para la media (σ desconocida)'
  },
  {
    id: 't5-ej3',
    numero: 3,
    statement: 'En 200 lavadoras testadas, 18 resultaron defectuosas. Construye un IC al 95% para la proporción p de lavadoras defectuosas.',
    sourceNote: 'Ejercicio estándar de IC para proporción',
    hasSolution: true,
    type: 'Intervalo de confianza para una proporción'
  },
  {
    id: 't5-ej4',
    numero: 4,
    statement: 'Se desea contrastar si la duración media de un componente es 1000 horas. Una muestra de n=49 componentes da X̄ = 985 h y σ conocida = 35 h. Plantea el contraste H₀: μ = 1000 frente a H₁: μ ≠ 1000 a un nivel α = 0.05.',
    sourceNote: 'Ejercicio estándar de contraste bilateral para μ',
    hasSolution: true,
    type: 'Contraste de hipótesis sobre la media'
  },
  {
    id: 't5-ej5',
    numero: 5,
    statement: 'Un fabricante asegura que como mucho el 5% de sus piezas son defectuosas. En 250 piezas inspeccionadas, 18 son defectuosas. Contrasta H₀: p ≤ 0.05 frente a H₁: p > 0.05 al nivel α = 0.05.',
    sourceNote: 'Ejercicio estándar de contraste unilateral para proporción',
    hasSolution: true,
    type: 'Contraste de hipótesis sobre proporción'
  },
  {
    id: 't5-ej6',
    numero: 6,
    statement: 'Se quiere comprobar si una muestra de tamaño n=40 sigue una distribución normal. Las pruebas habituales son Shapiro-Wilk y Kolmogorov-Smirnov-Lilliefors. Si el p-valor de Shapiro-Wilk es 0.018, ¿qué conclusión sacas al nivel α = 0.05?',
    sourceNote: 'Ejercicio estándar de contraste de normalidad',
    hasSolution: true,
    type: 'Contraste de normalidad'
  }
];
