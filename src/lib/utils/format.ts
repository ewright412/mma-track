/**
 * Returns the correct singular or plural form based on count.
 * Example: pluralize(1, 'session') → '1 session'
 *          pluralize(3, 'session') → '3 sessions'
 *          pluralize(2, 'day', 'days') → '2 days'
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural ?? singular + 's');
  return `${count} ${word}`;
}
