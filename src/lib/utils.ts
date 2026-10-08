/**
 * Classnames utility for combining conditional Tailwind classes.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
