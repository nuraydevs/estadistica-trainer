# Física II

Asignatura pendiente de construir. Ver estructura de [`apps/estadistica`](../estadistica) como referencia.

## Cómo se conecta al portal

Cuando esté lista, expón un módulo `src/main.js` con:

```js
export function mount(container, ctx) { /* ... */ }
```

Después, en [`portal/src/lib/subjects.js`](../../portal/src/lib/subjects.js)
cambia esta entrada:

```js
{
  slug: 'fisica',
  name: 'Física II',
  available: true,
  loader: () => import('@apps/fisica/src/main.js')
}
```
