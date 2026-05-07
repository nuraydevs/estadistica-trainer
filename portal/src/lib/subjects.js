// Catálogo central de asignaturas del portal.
// `loader` devuelve una promesa con un módulo que exporta `mount(container, ctx)`.
// Si `loader` es null, la asignatura aparece como "próximamente".

export const SUBJECTS = [
  {
    slug: 'estadistica',
    name: 'Estadística',
    description: 'Probabilidad, distribuciones y ejercicios resueltos.',
    professor: '',
    available: true,
    loader: () => import('@apps/estadistica/src/main.js')
  },
  {
    slug: 'fisica',
    name: 'Física II',
    description: 'Electromagnetismo, óptica y ondas.',
    professor: '',
    available: false,
    loader: null
  },
  {
    slug: 'tecnologia',
    name: 'Tecnología de la Fabricación',
    description: 'Procesos de fabricación y materiales.',
    professor: '',
    available: false,
    loader: null
  },
  {
    slug: 'programacion-c',
    name: 'Programación en C',
    description: 'Punteros, memoria y estructuras de datos.',
    professor: '',
    available: false,
    loader: null
  },
  {
    slug: 'matematicas',
    name: 'Matemáticas',
    description: 'Álgebra, cálculo y métodos numéricos.',
    professor: '',
    available: false,
    loader: null
  }
];

export function getSubject(slug) {
  return SUBJECTS.find((s) => s.slug === slug) ?? null;
}
