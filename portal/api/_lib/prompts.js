// System prompt del tutor + análisis del historial para inyectar
// "session insights" dinámicamente.

import { getSubjectMeta } from './subjects-meta.js';

const BASE_PROMPT = ({ subjectName, professorClause }) => `Eres el tutor de ${subjectName} para la UAL (Universidad de Almería),
especializado en ayudar a estudiantes de 1.º de Ingeniería Electrónica
Industrial a aprobar los exámenes de ${professorClause}.

QUIÉN ERES:
Eres como un compañero de curso que ya aprobó esta asignatura con nota
y conoce exactamente cómo funciona. No eres un profesor. No eres un
libro. Eres alguien que ya pasó por esto y sabe los trucos.

TU CONOCIMIENTO VIENE DE:
Los documentos adjuntos son el temario oficial de la asignatura tal
como lo imparte el profesor. Todo lo que sabes sobre esta asignatura
viene de ahí. Si algo no está en esos documentos, lo dices con un
"esto no aparece en tu temario oficial".

CÓMO RESPONDES SEGÚN EL TIPO DE PREGUNTA:

1. PREGUNTA CONCEPTUAL ("¿qué es X?" / "no entiendo Y"):
   - Explica el concepto en 3-4 líneas máximo.
   - Pon SIEMPRE un ejemplo concreto y simple.
   - Termina con: "¿Lo ves claro o quieres que lo enfoque de otra manera?".

2. PREGUNTA DE EJERCICIO ("¿cómo resuelvo esto?"):
   - NO des la solución directa.
   - Primero pregunta: "¿Ya identificaste qué tipo de ejercicio es?".
   - Da una pista sobre cómo identificarlo.
   - Si ya lo identificó, guía el primer paso.
   - Sólo das la solución completa si la pide explícitamente con
     "dame la solución" o "no llego, dímelo".

3. "¿QUÉ CAE EN EL EXAMEN?":
   - Basándote en los documentos, identifica los temas con más
     ejercicios y más desarrollo teórico.
   - Sé directo: "Esto cae seguro", "Esto suele caer", "Esto rara vez".
   - Da el consejo práctico de en qué orden estudiar.

4. "EXPLÍCAME EL TEMA X":
   - Estructura como resumen de estudio.
   - Primero lo esencial (lo que cae en examen).
   - Luego el detalle teórico si lo pide.
   - Termina con "¿Quieres que te ponga un ejercicio para ver si lo
     has entendido?".

5. "PONME UN EJERCICIO":
   - Genera uno del mismo estilo y dificultad que los del PDF.
   - Espera a que responda antes de dar la solución.
   - Cuando responda, evalúa su resolución paso a paso.
   - Señala exactamente dónde falló si falló.

6. "HE RESUELTO ESTO ASÍ... ¿ESTÁ BIEN?":
   - Lee su resolución.
   - Si está bien: confirma y explica por qué es correcto.
   - Si hay error: señala EXACTAMENTE el paso donde falla.
   - Nunca digas sólo "incorrecto". Siempre explica el porqué.

7. PREGUNTA FUERA DEL TEMARIO:
   - "Eso no está en el temario de esta asignatura.
     Si quieres te ayudo con [tema relacionado que SÍ está]."

TONO Y ESTILO:
- Tutea siempre.
- Directo, sin rodeos, sin paja motivacional.
- Cuando algo es importante: "Ojo con esto, suele caer en examen".
- Cuando algo es difícil: "Esto es lo que más cuesta, normal que te
  cueste. Vamos por partes.".
- Máximo 5 párrafos por respuesta. Si necesitas más, pregunta si
  quiere que continúes.
- Usa listas cuando expliques pasos. Usa párrafos para conceptos.
- Si te piden fórmulas, escríbelas en notación de texto plano legible
  (P(A∩B), σ², λ·t, etc.) — no LaTeX.

LO QUE TE DIFERENCIA DE CHATGPT Y NOTEBOOKLM:
- Sabes exactamente qué pone este profesor en sus exámenes.
- No inventas ejercicios genéricos: los adaptas al estilo del PDF.
- Conoces el nivel de dificultad real de esta asignatura en la UAL.
- Recuerdas lo que el estudiante ha fallado antes en esta sesión y
  lo tienes en cuenta cuando explicas.`;

const SUBJECT_TOPIC_HINTS = {
  estadistica: [
    'probabilidad', 'condicionada', 'bayes', 'total', 'binomial', 'poisson',
    'normal', 'tipificada', 'exponencial', 'distribución', 'discreta',
    'continua', 'media', 'varianza', 'desviación', 'esperanza', 'momento',
    'función de distribución', 'densidad', 'cuantil', 'percentil', 'cdf', 'pdf',
    'independencia', 'sucesos', 'combinatoria', 'permutación', 'variación',
    'combinación'
  ]
};

const FAILURE_PATTERNS = [
  /\bno me sale\b/i,
  /\bme he liado\b/i,
  /\bno entiendo\b/i,
  /\bno lo pillo\b/i,
  /\bno sé\b/i,
  /\bme equivoqu[ée]\b/i,
  /\bno llego\b/i,
  /\bestoy perdid[oa]\b/i
];

const HINT_REQUEST = /\b(pista|ayuda|cómo se hace|por dónde empiezo)\b/i;
const SOLUTION_REQUEST = /\b(dame la solución|dímelo|resuélvelo|enséñame la solución)\b/i;

export function analyzeHistory(history = [], subjectSlug = '') {
  const failedConcepts = new Set();
  const askedTopics = new Set();
  let userTurns = 0;
  let hintRequests = 0;
  let solutionRequests = 0;
  let failureSignals = 0;

  const topicHints = SUBJECT_TOPIC_HINTS[subjectSlug] || [];

  for (const msg of history) {
    if (!msg?.content) continue;
    const text = String(msg.content).toLowerCase();
    if (msg.role !== 'model') {
      userTurns += 1;
      for (const hint of topicHints) {
        if (text.includes(hint)) askedTopics.add(hint);
      }
      if (FAILURE_PATTERNS.some((re) => re.test(text))) {
        failureSignals += 1;
        // El último topic mencionado lo registramos como fallido si hay señal
        for (const hint of topicHints) {
          if (text.includes(hint)) failedConcepts.add(hint);
        }
      }
      if (HINT_REQUEST.test(text)) hintRequests += 1;
      if (SOLUTION_REQUEST.test(text)) solutionRequests += 1;
    }
  }

  // Heurística simple del nivel
  let level = 'medio';
  if (userTurns >= 3) {
    if (failureSignals >= 2 || solutionRequests >= 2) level = 'básico';
    else if (hintRequests === 0 && failureSignals === 0 && userTurns >= 4) level = 'avanzado';
  }

  return {
    failedConcepts: Array.from(failedConcepts),
    askedTopics: Array.from(askedTopics),
    level,
    userTurns,
    hintRequests,
    solutionRequests,
    failureSignals
  };
}

function buildInsightsBlock(insights) {
  const lines = [];
  if (insights.userTurns === 0) {
    lines.push('Es la primera intervención del estudiante en esta sesión.');
  } else {
    lines.push(`Mensajes previos del estudiante en esta sesión: ${insights.userTurns}.`);
    if (insights.failedConcepts.length) {
      lines.push(
        `Conceptos en los que ha mostrado dudas: ${insights.failedConcepts.join(', ')}. ` +
        `Si vuelves a tocar alguno, refuerza la explicación con un ejemplo extra.`
      );
    }
    if (insights.askedTopics.length) {
      lines.push(
        `Temas tocados ya: ${insights.askedTopics.join(', ')}. Evita repetir lo mismo, conecta con lo que ya se vio.`
      );
    }
    if (insights.level === 'básico') {
      lines.push('Nivel inferido: básico. Ve más despacio, menos jerga, más ejemplos.');
    } else if (insights.level === 'avanzado') {
      lines.push('Nivel inferido: avanzado. Puedes ir directo al grano.');
    } else {
      lines.push('Nivel inferido: medio.');
    }
  }
  return lines.join('\n');
}

function buildLongTermBlock(profile) {
  if (!profile) return '';
  const lines = [];
  const total = profile.total_exercises_done || 0;
  const failed = profile.total_exercises_failed || 0;
  const successRate = total ? Math.round(((total - failed) / total) * 100) : null;
  const mastered = profile.concepts_mastered || [];
  const weak = (profile.concepts_weak || []).map((w) => w.concept || w);
  const broken = profile.concepts_broken || [];

  lines.push('PERFIL DE ESTE ALUMNO (memoria persistente):');
  if (profile.streak_days >= 1) lines.push(`- Lleva ${profile.streak_days} día${profile.streak_days === 1 ? '' : 's'} estudiando seguidos.`);
  lines.push(`- Conceptos que domina: ${mastered.length ? mastered.join(', ') : 'aún pocos'}.`);
  lines.push(`- Conceptos frágiles (falla a veces): ${weak.length ? weak.join(', ') : 'ninguno aún'}.`);
  lines.push(`- Conceptos rotos (falla siempre): ${broken.length ? broken.join(', ') : 'ninguno'}.`);
  if (total > 0) {
    lines.push(`- Ha resuelto ${total} ejercicios. Tasa de éxito: ${successRate}%.`);
  }

  lines.push('');
  lines.push('INSTRUCCIONES BASADAS EN EL PERFIL:');
  lines.push('- Si pregunta sobre un concepto ROTO: empieza con "Sé que esto te cuesta. Vamos muy despacio, paso a paso."');
  lines.push('- Si pregunta sobre un concepto DOMINADO: responde más rápido, menos detalle, sube el nivel.');
  if (profile.last_study_date) {
    const daysSince = Math.floor((Date.now() - new Date(profile.last_study_date).getTime()) / 86400000);
    if (daysSince > 3) {
      lines.push(`- Lleva ${daysSince} días sin estudiar: menciona brevemente que es bueno retomar.`);
    }
  }
  if (successRate !== null) {
    if (successRate < 40) lines.push('- Tasa de éxito <40%: prioriza ejercicios básicos, no avances a temas nuevos.');
    else if (successRate > 80) lines.push('- Tasa de éxito >80%: propón retos más difíciles.');
  }
  return lines.join('\n');
}

export function buildSystemPrompt({ subjectSlug, context, history, profile = null }) {
  const meta = getSubjectMeta(subjectSlug);
  const subjectName = meta.name;
  const professorClause = meta.professor && meta.professor.trim()
    ? `tu profesor (${meta.professor})`
    : 'tu profesor';

  const insights = analyzeHistory(history, subjectSlug);
  const insightsBlock = buildInsightsBlock(insights);

  const ctxLine = context && context.trim()
    ? `\n\nContexto actual del estudiante: está en ${subjectName} → ${context.trim()}.`
    : `\n\nContexto actual del estudiante: está en ${subjectName} (sección no especificada).`;

  const sessionBlock = `\n\nMEMORIA DE ESTA SESIÓN:\n${insightsBlock}`;
  const longTermBlock = profile ? `\n\n${buildLongTermBlock(profile)}` : '';

  return BASE_PROMPT({ subjectName, professorClause }) + ctxLine + sessionBlock + longTermBlock;
}
