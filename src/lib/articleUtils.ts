const MIN_CONTENT_LENGTH = 100;
const WORDS_PER_MINUTE = 230;

export function wordCount(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(html: string): string {
  if (!html) return '< 1 min';
  const minutes = Math.max(1, Math.round(wordCount(html) / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

export function estimateReadingMinutes(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / WORDS_PER_MINUTE));
}

export function hasSubstantiveContent(html: string): boolean {
  if (!html || html.trim().length < MIN_CONTENT_LENGTH) return false;
  const text = html.replace(/<[^>]*>/g, '');
  return text.trim().length >= MIN_CONTENT_LENGTH;
}
