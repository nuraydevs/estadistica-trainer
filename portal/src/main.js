import './styles/main.css';
import { getSession, signOut, fetchProfile, fetchUserSubjects, onAuthChange } from './lib/auth.js';
import { render as renderLogin } from './pages/Login.js';
import { render as renderHub } from './pages/Hub.js';
import { render as renderSubject } from './pages/SubjectView.js';
import { render as renderAdmin } from './pages/AdminPanel.js';
import { render as renderHeader } from './components/Header.js';

const root = document.getElementById('portal-root');

const state = {
  session: null,
  profile: null,
  unlockedSlugs: [],
  view: 'login', // 'login' | 'hub' | 'subject' | 'admin'
  currentSubject: null,
  currentSubjectInstance: null
};

async function init() {
  state.session = await getSession();
  if (state.session) {
    await loadUserContext();
    state.view = 'hub';
  } else {
    state.view = 'login';
  }
  rerender();
}

onAuthChange(async (session) => {
  const wasLoggedIn = !!state.session;
  state.session = session;
  if (!session) {
    state.profile = null;
    state.unlockedSlugs = [];
    state.view = 'login';
    rerender();
    return;
  }
  if (!wasLoggedIn) {
    await loadUserContext();
    state.view = 'hub';
    rerender();
  }
});

async function loadUserContext() {
  if (!state.session) return;
  const userId = state.session.user.id;
  const [profile, subjects] = await Promise.all([
    fetchProfile(userId),
    fetchUserSubjects(userId)
  ]);
  if (!profile) {
    // Usuario en auth pero no en public.users → migración no aplicada o trigger falló.
    state.profile = {
      id: userId,
      email: state.session.user.email,
      full_name: state.session.user.user_metadata?.full_name || '',
      is_admin: false,
      active: true
    };
  } else if (!profile.active) {
    alert('Tu cuenta está desactivada. Contacta con un administrador.');
    await signOut();
    return;
  } else {
    state.profile = profile;
  }
  state.unlockedSlugs = subjects.map((s) => s.subject_slug);
}

async function rerender() {
  // Limpiar instancia previa de sub-app si la había
  try {
    state.currentSubjectInstance?.unmount?.();
  } catch {}
  state.currentSubjectInstance = null;

  root.innerHTML = '';

  if (state.view === 'login' || !state.session) {
    renderLogin(root, { onLoggedIn: async () => { /* onAuthChange refresca */ } });
    return;
  }

  // Header siempre visible para usuarios logueados
  root.appendChild(
    renderHeader({
      profile: state.profile,
      view: state.view,
      onGoHub: () => goHub(),
      onGoAdmin: () => { state.view = 'admin'; rerender(); },
      onLogout: async () => { await signOut(); }
    })
  );

  const shell = document.createElement('div');
  shell.className = 'portal-shell';
  root.appendChild(shell);

  if (state.view === 'hub') {
    renderHub(shell, {
      profile: state.profile,
      unlockedSlugs: state.unlockedSlugs,
      onOpenSubject: (subject) => {
        state.currentSubject = subject;
        state.view = 'subject';
        rerender();
      }
    });
    return;
  }

  if (state.view === 'admin') {
    if (!state.profile?.is_admin) {
      goHub();
      return;
    }
    await renderAdmin(shell, {
      profile: state.profile,
      onBack: () => goHub()
    });
    return;
  }

  if (state.view === 'subject' && state.currentSubject) {
    state.currentSubjectInstance = await renderSubject(shell, {
      subject: state.currentSubject,
      profile: state.profile,
      onBack: () => goHub()
    });
  }
}

function goHub() {
  state.view = 'hub';
  state.currentSubject = null;
  rerender();
}

init();
