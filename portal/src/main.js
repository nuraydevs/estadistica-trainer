import './styles/main.css';
import { getSession, signOut, fetchProfile, fetchUserSubjects, onAuthChange } from './lib/auth.js';
import { render as renderLogin } from './pages/Login.js';
import { render as renderHub } from './pages/Hub.js';
import { render as renderSubject } from './pages/SubjectView.js';
import { render as renderAdmin } from './pages/AdminPanel.js';
import { render as renderCommunity } from './pages/Community.js';
import { render as renderHeader } from './components/Header.js';
import { fetchProfile as fetchSocialProfile } from './lib/presence.js';
import { openProfileSetup } from './components/ProfileSetup.js';

const root = document.getElementById('portal-root');

const state = {
  session: null,
  profile: null,
  socialProfile: null,
  unlockedSlugs: [],
  view: 'login', // login | hub | community | subject | admin
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
    state.socialProfile = null;
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

  // Carga perfil social
  try {
    state.socialProfile = await fetchSocialProfile();
  } catch { state.socialProfile = null; }

  // Primer login → sugerimos personalizar (no bloquea)
  if (!state.socialProfile) {
    openProfileSetup({ userId, fullName: state.profile.full_name, email: state.profile.email })
      .then((saved) => { if (saved) { state.socialProfile = saved; rerender(); } })
      .catch(() => {});
  }
}

async function reloadSocialProfile() {
  try { state.socialProfile = await fetchSocialProfile(); } catch {}
  rerender();
}

async function rerender() {
  try { state.currentSubjectInstance?.unmount?.(); } catch {}
  state.currentSubjectInstance = null;

  root.innerHTML = '';

  if (state.view === 'login' || !state.session) {
    renderLogin(root, { onLoggedIn: async () => {} });
    return;
  }

  root.appendChild(
    renderHeader({
      profile: state.profile,
      socialProfile: state.socialProfile,
      view: state.view,
      onGoHub: () => goHub(),
      onGoCommunity: () => { state.view = 'community'; rerender(); },
      onGoAdmin: () => { state.view = 'admin'; rerender(); },
      onLogout: async () => { await signOut(); },
      onEditProfile: async () => {
        const userId = state.session.user.id;
        await openProfileSetup({ userId, fullName: state.profile.full_name, email: state.profile.email });
        await reloadSocialProfile();
      }
    })
  );

  const shell = document.createElement('div');
  shell.className = 'portal-shell';
  root.appendChild(shell);

  if (state.view === 'hub') {
    renderHub(shell, {
      profile: state.profile,
      socialProfile: state.socialProfile,
      unlockedSlugs: state.unlockedSlugs,
      onOpenSubject: (subject) => {
        state.currentSubject = subject;
        state.view = 'subject';
        rerender();
      },
      onGoCommunity: () => { state.view = 'community'; rerender(); }
    });
    return;
  }

  if (state.view === 'community') {
    await renderCommunity(shell, { profile: state.profile });
    return;
  }

  if (state.view === 'admin') {
    if (!state.profile?.is_admin) { goHub(); return; }
    await renderAdmin(shell, { profile: state.profile, onBack: () => goHub() });
    return;
  }

  if (state.view === 'subject' && state.currentSubject) {
    state.currentSubjectInstance = await renderSubject(shell, {
      subject: state.currentSubject,
      profile: state.profile,
      socialProfile: state.socialProfile,
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
