import { ALL_QUIZ, QUIZ_BY_TEMA } from '../data/index.js';
import { getQuizStats, registrarRespuestaQuiz } from '../utils/storage.js';

export function render(container, { state }) {
  container.innerHTML = '';

  let mode = 'home';
  let questions = [];
  let current = 0;
  let selected = null;
  let mistakes = [];

  function startQuiz(nextQuestions) {
    questions = nextQuestions;
    current = 0;
    selected = null;
    mistakes = [];
    mode = questions.length ? 'active' : 'empty';
    rerender();
  }

  function renderHome() {
    container.innerHTML = '<h1>Quiz</h1>';
    const grid = document.createElement('div');
    grid.className = 'block-list';

    for (let tema = 1; tema <= 5; tema++) {
      grid.appendChild(quizCard(`Quiz Tema ${tema}`, QUIZ_BY_TEMA[tema] || [], () => startQuiz(QUIZ_BY_TEMA[tema] || [])));
    }

    grid.appendChild(quizCard('Quiz mixto', ALL_QUIZ, () => startQuiz(ALL_QUIZ)));
    grid.appendChild(quizCard('Quiz de mis fallos', failedQuestions(), () => startQuiz(failedQuestions())));
    container.appendChild(grid);
  }

  function quizCard(title, list, onClick) {
    const totals = list.reduce((acc, question) => {
      const stats = getQuizStats(state, question.id);
      acc.aciertos += stats.aciertos;
      acc.total += stats.aciertos + stats.fallos;
      return acc;
    }, { aciertos: 0, total: 0 });
    const pct = totals.total ? Math.round((totals.aciertos / totals.total) * 100) : 0;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'block-item';
    btn.innerHTML = `
      <div class="block-item__head">
        <span class="badge badge--medium">${list.length} preguntas</span>
        <span class="muted">${totals.total ? pct + '% aciertos' : 'sin historial'}</span>
      </div>
      <div class="block-item__title">${title}</div>
    `;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function renderActive() {
    container.innerHTML = '';
    const question = questions[current];
    const card = document.createElement('section');
    card.className = 'card quiz-card';
    card.innerHTML = `
      <div class="meta">Pregunta ${current + 1} de ${questions.length} · ${question.concept}</div>
      <h1>${question.question}</h1>
    `;

    const options = document.createElement('div');
    options.className = 'quiz-options';
    question.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--ghost quiz-option';
      btn.textContent = option;
      if (selected !== null) {
        btn.disabled = true;
        if (index === question.correctIndex) btn.classList.add('type-btn--correct');
        else if (index === selected) btn.classList.add('type-btn--wrong');
      }
      btn.addEventListener('click', () => {
        selected = index;
        const ok = index === question.correctIndex;
        registrarRespuestaQuiz(state, question.id, ok);
        if (!ok) mistakes.push(question);
        rerender();
      });
      options.appendChild(btn);
    });
    card.appendChild(options);

    if (selected !== null) {
      const explanation = document.createElement('p');
      explanation.className = 'feedback';
      explanation.textContent = question.explanation;
      card.appendChild(explanation);

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn btn--primary';
      next.textContent = current === questions.length - 1 ? 'Ver resultados' : 'Siguiente';
      next.addEventListener('click', () => {
        if (current === questions.length - 1) mode = 'results';
        else {
          current++;
          selected = null;
        }
        rerender();
      });
      card.appendChild(next);
    }

    container.appendChild(card);
  }

  function renderResults() {
    container.innerHTML = '';
    const ok = questions.length - mistakes.length;
    const card = document.createElement('section');
    card.className = 'card';
    card.innerHTML = `<h1>Resultado: ${ok}/${questions.length}</h1>`;

    if (mistakes.length > 0) {
      const list = document.createElement('ol');
      list.className = 'solution-steps';
      mistakes.forEach((question) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${question.concept}</strong><p>${question.question}</p><p class="muted">${question.explanation}</p>`;
        list.appendChild(li);
      });
      card.appendChild(list);

      const repeat = document.createElement('button');
      repeat.type = 'button';
      repeat.className = 'btn btn--primary';
      repeat.textContent = 'Repetir solo los fallos';
      repeat.addEventListener('click', () => startQuiz([...mistakes]));
      card.appendChild(repeat);
    } else {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'Sin fallos en esta ronda.';
      card.appendChild(p);
    }

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn--ghost';
    back.textContent = 'Volver a Quiz';
    back.addEventListener('click', () => {
      mode = 'home';
      rerender();
    });
    card.appendChild(back);
    container.appendChild(card);
  }

  function renderEmpty() {
    container.innerHTML = '';
    const card = document.createElement('section');
    card.className = 'card';
    card.innerHTML = '<h1>Quiz de mis fallos</h1><p class="muted">Todavía no hay preguntas con más fallos que aciertos.</p>';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn--ghost';
    back.textContent = 'Volver';
    back.addEventListener('click', () => {
      mode = 'home';
      rerender();
    });
    card.appendChild(back);
    container.appendChild(card);
  }

  function failedQuestions() {
    return ALL_QUIZ.filter((question) => {
      const stats = getQuizStats(state, question.id);
      return stats.fallos > stats.aciertos;
    });
  }

  function rerender() {
    if (mode === 'active') renderActive();
    else if (mode === 'results') renderResults();
    else if (mode === 'empty') renderEmpty();
    else renderHome();
  }

  rerender();
}
