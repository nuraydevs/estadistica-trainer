export const STORAGE_KEY = 'estadistica-trainer-v2';

function defaultState() {
  return {
    exerciseStatus: {},        // {id: {status, hintsUsed, ...}}
    seccionesLeidas: {},       // {sectionId: true}
    formulasMarcadas: {},      // {formulaId: true}
    aprendizajeCompletado: {}, // {unitId: true}
    quizHistorial: {}          // {quizId: {aciertos, fallos, ultimaRespuesta}}
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Ejercicios (BlockView original)
export function defaultExerciseStatus() {
  return {
    status: 'pending',
    hintsUsed: 0,
    typeAttempts: [],
    answerAttempts: [],
    solutionShown: false
  };
}

export function getExerciseStatus(state, id) {
  return state.exerciseStatus[id] || defaultExerciseStatus();
}

export function setExerciseStatus(state, id, patch) {
  const current = getExerciseStatus(state, id);
  state.exerciseStatus[id] = { ...current, ...patch };
  saveState(state);
}

export function resetExercise(state, id) {
  delete state.exerciseStatus[id];
  saveState(state);
}

// ─── Secciones de teoría
export function marcarSeccionLeida(state, sectionId, leida = true) {
  if (leida) state.seccionesLeidas[sectionId] = true;
  else delete state.seccionesLeidas[sectionId];
  saveState(state);
}

export function isSeccionLeida(state, sectionId) {
  return !!state.seccionesLeidas[sectionId];
}

// ─── Fórmulas marcadas
export function toggleFormulaMarcada(state, formulaId) {
  if (state.formulasMarcadas[formulaId]) delete state.formulasMarcadas[formulaId];
  else state.formulasMarcadas[formulaId] = true;
  saveState(state);
}

export function isFormulaMarcada(state, formulaId) {
  return !!state.formulasMarcadas[formulaId];
}

// ─── Aprendizaje
export function marcarUnidadCompletada(state, unitId) {
  state.aprendizajeCompletado[unitId] = true;
  saveState(state);
}

export function isUnidadCompletada(state, unitId) {
  return !!state.aprendizajeCompletado[unitId];
}

// ─── Quiz
export function registrarRespuestaQuiz(state, qId, acierto) {
  const prev = state.quizHistorial[qId] || { aciertos: 0, fallos: 0, ultimaRespuesta: null };
  state.quizHistorial[qId] = {
    aciertos: prev.aciertos + (acierto ? 1 : 0),
    fallos: prev.fallos + (acierto ? 0 : 1),
    ultimaRespuesta: acierto
  };
  saveState(state);
}

export function getQuizStats(state, qId) {
  return state.quizHistorial[qId] || { aciertos: 0, fallos: 0, ultimaRespuesta: null };
}

export function clearAll(state) {
  Object.assign(state, defaultState());
  saveState(state);
}
