// Metadata estática de asignaturas legible desde el backend.
// Mantén sincronizado con portal/src/lib/subjects.js (el frontend).
// (El frontend no se puede importar tal cual aquí porque tiene
// import dinámico a apps/* que sólo Vite resuelve.)

export const SUBJECTS_META = {
  estadistica: {
    name: 'Estadística',
    professor: '' // ← rellena cuando lo sepas
  },
  fisica: {
    name: 'Física II',
    professor: ''
  },
  tecnologia: {
    name: 'Tecnología de la Fabricación',
    professor: ''
  },
  'programacion-c': {
    name: 'Programación en C',
    professor: ''
  },
  matematicas: {
    name: 'Matemáticas',
    professor: ''
  }
};

export function getSubjectMeta(slug) {
  return SUBJECTS_META[slug] || { name: slug, professor: '' };
}
