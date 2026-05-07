export const tema4Ejercicios = [
  {
    id: 't4-ej1',
    numero: 1,
    statement: 'Longitud (cm) de radios con F(x) por tramos. ¿P(al menos el 75% de los radios de un lote de 40 superen el cm)?',
    sourceNote: 'Ejercicio 1 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'V.A. continua + Binomial'
  },
  {
    id: 't4-ej2',
    numero: 2,
    statement: 'Reacciones químicas: 40% con sustancia A (densidad triangular en 0..2), 60% con B (N(1, 0.8)). (a) ¿Con qué sustancia el tiempo medio es menor? (b) Tiempo del 25% que más tarda. (c) P(reacción A no saturada a 0.9s, tarde menos de 0.3s más). (d) P(saturación < 1s). (e) En 50 reacciones, P(en 20 no saturen antes del primer segundo).',
    sourceNote: 'Ejercicio 2 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Mezcla densidades + Normal + Binomial'
  },
  {
    id: 't4-ej3',
    numero: 3,
    statement: 'Circuito con 7 componentes. f(x) = 2e^(−2x) para x > 0 (en miles de horas). (a) Vida media. (b) P(componente > 600 h). (c) P(sistema > 600 h).',
    sourceNote: 'Ejercicio 3 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Exponencial + circuitos'
  },
  {
    id: 't4-ej4',
    numero: 4,
    statement: 'Vida útil de células fotovoltaicas con f(x) = k·e^(−x/5). (a) Vida media. (b) Mediana. (c) P(funcione 7 años más | ya 3). (d) P(>q) = 0.25 (percentil 75). (e) En cajas de 10, P(>3 superen 7 años). (f) Reparaciones P(λ=2): P(al menos una).',
    sourceNote: 'Ejercicio 4 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Exponencial + Binomial + Poisson'
  },
  {
    id: 't4-ej5',
    numero: 5,
    statement: 'Aparcamiento con p=0.25 cada día (5 días). (a) P(lunes y martes). (b) P(solamente lunes y martes). (c) P(al menos 3 días). (d) P(primera vez tercer día).',
    sourceNote: 'Ejercicio 5 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Binomial / Geométrica'
  },
  {
    id: 't4-ej6',
    numero: 6,
    statement: 'Circuito con C1, C2 (P(fallo<11h)=0.10) y C3 N(12, 2.2). (a) P(C3 lleva 8 h, no llegue a 3 h más). (b) P(circuito funcione ≥ 11 h).',
    sourceNote: 'Ejercicio 6 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Normal + circuito'
  },
  {
    id: 't4-ej7',
    numero: 7,
    statement: 'Fusible con vida exponencial media 2 años. Reparaciones Poisson media 3. (a) P(funcione ≥ 18 meses más | ya 1 año). (b) Duración mínima del 25% más duraderos. (c) P(no supere 5 reparaciones | ya 1). (d) En 6 fusibles, P(al menos 1 nunca reparado).',
    sourceNote: 'Ejercicio 7 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Exponencial + Poisson + Binomial'
  },
  {
    id: 't4-ej8',
    numero: 8,
    statement: 'Perfiles de aluminio. 80% en máquina A con f(x)=3(x−1)(3−x)/4, 1<x<3. 20% en B con N(2.5, 0.4). (a) Longitud modal por máquina. (b) Longitud media por máquina. (c) P(de A | longitud entre 2.25 y 2.75). (d) En 70 perfiles de B, P(más de 12 con longitud < 2 m).',
    sourceNote: 'Ejercicio 8 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Densidad + Normal + Bayes + Binomial'
  },
  {
    id: 't4-ej9',
    numero: 9,
    statement: 'Cortadoras: A con f(x)=(x−1)/2, 1<x<3. B con N(1.85, 0.24). (a) Diámetro medio en A. (b) Si A corta el 70%, P(de A | diámetro entre 1.9 y 2.2). (c) En 2000 piezas, ¿cuántas aceptables (diámetro a < 0.5 cm de su media) en A y B?',
    sourceNote: 'Ejercicio 9 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Densidad + Normal + Bayes'
  },
  {
    id: 't4-ej10',
    numero: 10,
    statement: 'Smart city. Demanda nocturna N(2.5, 0.75). Diurna con F(x) por tramos. (a) Demanda media diurna. (b) P(durante la noche | pico > 3.1 MWh). (c) Energía mínima para cubrir el 80% de la demanda diurna.',
    sourceNote: 'Ejercicio 10 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Densidad + Normal + Bayes'
  },
  {
    id: 't4-ej11',
    numero: 11,
    statement: 'Reparaciones de máquinas: simples (70%) con densidad fX, complejas (30%) con FY exponencial media 5. (a) P(compleja | reparación < 1 h). (b) P(reparación simple > P26 de complejas). (c) En 64 averías complejas, P(tiempo total > 300 h).',
    sourceNote: 'Ejercicio 11 PDF EINDUS-T4-ejercicios',
    hasSolution: true,
    type: 'Densidad + Exponencial + Bayes + TCL'
  }
];
