import { supabase } from './supabase.js';

export async function askTutor({ question, subject, context, history }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  if (!session) throw new Error('Sin sesión activa.');

  const res = await fetch('/api/tutor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      question,
      subject,
      context: context || '',
      history: history || [],
      userId: session.user.id
    })
  });

  let body;
  try { body = await res.json(); } catch { body = { error: 'bad_response' }; }

  if (!res.ok) {
    const err = new Error(body.message || 'Error del tutor');
    err.code = body.error || `http_${res.status}`;
    err.status = res.status;
    err.payload = body;
    throw err;
  }
  return body; // { answer, tokensUsed, questionsToday, dailyLimit }
}

export async function fetchConversation(subjectSlug) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('tutor_conversations')
    .select('messages')
    .eq('user_id', userId)
    .eq('subject_slug', subjectSlug)
    .maybeSingle();
  if (error) {
    console.warn('[tutor] fetchConversation', error);
    return [];
  }
  return Array.isArray(data?.messages) ? data.messages : [];
}

export async function clearConversation(subjectSlug) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return;
  await supabase
    .from('tutor_conversations')
    .delete()
    .eq('user_id', userId)
    .eq('subject_slug', subjectSlug);
}

export async function fetchTodayUsage(subjectSlug) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return { questionsToday: 0 };
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('tutor_usage')
    .select('questions_count')
    .eq('user_id', userId)
    .eq('subject_slug', subjectSlug)
    .eq('date', today)
    .maybeSingle();
  return { questionsToday: data?.questions_count ?? 0 };
}
