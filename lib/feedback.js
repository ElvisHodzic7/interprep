// Feedback se u bazi čuva kao `feedback: { rating, summary, ... }`.
// Stariji zapisi imaju dodatni nivo `feedback: { feedback: { rating, ... } }`, pa podržavamo oba.
export const getFeedback = (candidate) =>
  candidate?.feedback?.feedback ?? candidate?.feedback ?? {};

const toNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// Rezultat kandidata na skali 0–10
export function getScore(candidate) {
  const r = getFeedback(candidate)?.rating;
  if (!r) return 0;

  // totalRating je suma 4 kategorije (0–40) -> skaliraj na 0–10
  if (r.totalRating != null) return Number((toNum(r.totalRating) / 4).toFixed(1));

  const parts = ['technicalSkills', 'communication', 'problemSolving', 'experience'].map((k) => toNum(r[k]));
  return Number((parts.reduce((a, b) => a + b, 0) / parts.length).toFixed(1));
}

// Boja rezultata: ≥7 zeleno, 5–7 žuto, <5 crveno
export const scoreColor = (score) =>
  score >= 7
    ? 'bg-green-100 text-green-700'
    : score >= 5
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700';

export const getTranscript = (candidate) =>
  getFeedback(candidate)?.transcript || candidate?.feedback?.transcript || '';

// Transkript je JSON niz Vapi poruka [{ role, content }] -> čitljiv dijalog
export function formatTranscript(transcript) {
  if (!transcript) return '';
  try {
    const messages = JSON.parse(transcript);
    if (!Array.isArray(messages)) return String(transcript);
    return messages
      .filter((m) => m?.role !== 'system' && m?.content)
      .map((m) => `${m.role === 'assistant' ? 'AI intervjuer' : 'Kandidat'}: ${m.content}`)
      .join('\n\n');
  } catch {
    return String(transcript);
  }
}
