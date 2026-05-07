export const EXAM_DATES = {
  ordinaria: new Date('2026-06-17T09:00:00'),
  extraordinaria: new Date('2026-07-03T09:00:00')
};

export function daysUntil(date) {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatCountdown(date = EXAM_DATES.ordinaria) {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs <= 0) return 'Hoy es el examen';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} días · ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function startCountdownTicker(callback, intervalMs = 60000) {
  callback();
  return setInterval(callback, intervalMs);
}
