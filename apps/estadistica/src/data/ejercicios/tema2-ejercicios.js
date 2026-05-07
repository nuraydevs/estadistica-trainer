export const tema2Ejercicios = [
  {
    id: 't2-ej1',
    numero: 1,
    statement: 'Una fábrica produce botellas de cristal defectuosas con burbujas, cuerpos extraños o grietas. P(burbujas)=0.3, P(grietas)=0.32, P(cuerpos)=0.27, P(burbujas∩cuerpos)=0.15, P(cuerpos∩grietas)=0.17, P(los tres)=0.07, P(ninguno)=0.55. Calcula: (a) P(defectuosa). (b) P(burbujas y grietas). (c) Solo burbujas y grietas. (d) Solo burbujas.',
    sourceNote: 'Ejercicio 1 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Probabilidad de unión/intersección'
  },
  {
    id: 't2-ej2',
    numero: 2,
    statement: 'Electrodomésticos con defectos A o B. 70% tienen defecto A, 40% defecto B, 30% ambos. (a) P(A | B̄). (b) P(B | defectuoso). (c) ¿Son A y B independientes o incompatibles?',
    sourceNote: 'Ejercicio 2 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Condicionada y dependencia'
  },
  {
    id: 't2-ej3',
    numero: 3,
    statement: 'Lanzamos 4 veces una moneda. Calcula la probabilidad de: (a) obtener una cara. (b) En los dos primeros lanzamientos salen caras. (c) En el último lanzamiento se obtiene la segunda cara. (d) En dos lanzamientos consecutivos no se obtiene el mismo resultado.',
    sourceNote: 'Ejercicio 3 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Combinatoria y Laplace'
  },
  {
    id: 't2-ej4',
    numero: 4,
    statement: 'Lotería con boletos numerados del 1 al 50. Se sacan 2 boletos. (a) Probabilidad de que ambos sean menores que 20. (b) Probabilidad de que uno sea menor que 20 y el otro mayor que 20.',
    sourceNote: 'Ejercicio 4 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Combinatoria'
  },
  {
    id: 't2-ej5',
    numero: 5,
    statement: 'Lavadoras producidas en dos fábricas A y B. 20% de la marca son defectuosas, 30% de las de B son defectuosas, A produce el doble que B. (a) P(no defectuosa y de B). (b) P(defectuosa y de A). (c) P(B | defectuosa). (d) En 4 lavadoras, P(al menos una defectuosa). (e) Indicar dos sucesos incompatibles o independientes.',
    sourceNote: 'Ejercicio 5 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Probabilidad total y Bayes'
  },
  {
    id: 't2-ej6',
    numero: 6,
    statement: 'Fábrica con 3 líneas. Defectos por línea (mancha, fisura, problema pestaña, defecto superficial, otro): L1: 15,50,21,10,4 (500 defectuosas); L2: 12,44,28,8,8 (400); L3: 20,40,24,15,2 (600). (a) P(de la línea 1). (b) P(fisura). (c) P(mancha | L1). (d) P(L1 | defecto superficial).',
    sourceNote: 'Ejercicio 6 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Tabla de contingencia / Bayes'
  },
  {
    id: 't2-ej7',
    numero: 7,
    statement: 'Flash con tres baterías A, B, C independientes. Probabilidades de fallo: 0.1, 0.05, 0.2. Funciona si al menos 2 de 3 funcionan. (a) P(no funcione). (b) Si no funciona, P(las 3 fallaron).',
    sourceNote: 'Ejercicio 7 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Independencia'
  },
  {
    id: 't2-ej8',
    numero: 8,
    statement: 'Test de contaminación. P(positivo | contaminado) = 0.80, P(negativo | no contaminado) = 0.90, P(contaminado) = 0.40. (a) P(positivo). (b) P(contaminado | positivo). (c) P(realmente contaminado | 2 positivos y 1 negativo en 3 tests).',
    sourceNote: 'Ejercicio 8 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Bayes'
  },
  {
    id: 't2-ej9',
    numero: 9,
    statement: 'Control de calidad por etapas independientes. P(detectar defecto en etapa) = 0.60. (a) P(detectar antes de la 3ª etapa | defectuoso). (b) P(pasa el control | defectuoso) tras 3 etapas. (c) Con 10% defectuosos, P(pase la inspección). (d) Si pasó el control, P(es defectuoso).',
    sourceNote: 'Ejercicio 9 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Probabilidad total y Bayes'
  },
  {
    id: 't2-ej10',
    numero: 10,
    statement: 'Mensaje con 0 y 1. De cada 7 dígitos, 3 son 0 y 4 son 1. P(0 → 1 erróneo) = 1/3, P(1 → 0 erróneo) = 1/4. P(se envíe un símbolo como 1 sin error)?',
    sourceNote: 'Ejercicio 10 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Bayes'
  },
  {
    id: 't2-ej11',
    numero: 11,
    statement: 'Dos máquinas A y B independientes. P(A defectuosa)=0.10, P(B defectuosa)=0.05. Se selecciona una de cada. (a) P(ambas defectuosas). (b) P(ninguna defectuosa). (c) P(haya sido B | solo una defectuosa).',
    sourceNote: 'Ejercicio 11 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Independencia y condicionada'
  },
  {
    id: 't2-ej12',
    numero: 12,
    statement: 'Grupo de 23 personas. (a) P(todas tengan cumpleaños distintos) suponiendo independencia. (b) P(al menos dos compartan cumpleaños).',
    sourceNote: 'Ejercicio 12 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Combinatoria / paradoja del cumpleaños'
  },
  {
    id: 't2-ej13',
    numero: 13,
    statement: 'Auditoría de servidores. 50% memoria excesiva, 40% CPU excesiva, 10% ambos. (a) P(memoria | CPU). (b) P(memoria | algún problema). (c) ¿Son incompatibles e independientes? (d) Con P(caída | con CPU)=1/5 y P(caída | sin CPU)=1/10, P(caída).',
    sourceNote: 'Ejercicio 13 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Condicionada / dependencia / probabilidad total'
  },
  {
    id: 't2-ej14',
    numero: 14,
    statement: 'Tres lotes de microchips A, B, C. 2/5 son de A, 1/5 de C. Tasa de fallo: 31.25% en A, 50% en B, 25% en C. (a) P(falle). (b) ¿Es superar la prueba independiente del lote A? (c) P(A o B | falló).',
    sourceNote: 'Ejercicio 14 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Probabilidad total / Bayes'
  },
  {
    id: 't2-ej15',
    numero: 15,
    statement: 'Tanque de gas en zona sísmica. P(explosión | terremoto ≥ 5) = 0.4, P(explosión | sin terremoto) = 0.05, P(explosión) = 0.1. (a) P(terremoto ≥ 5). (b) P(terremoto | hubo explosión). (c) ¿Son incompatibles o independientes?',
    sourceNote: 'Ejercicio 15 PDF EINDUS-T2-ejercicios',
    hasSolution: true,
    type: 'Probabilidad total / Bayes'
  }
];
