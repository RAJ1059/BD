// Strips HTML tags and estimates reading time at ~200 words per minute.
export function estimateReadingTime(html = '') {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return minutes
}
