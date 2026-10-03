/** Longest name accepted at sign-up. */
export const NAME_MAX_LENGTH = 30;

/** Longest name shown in the greeting, including the "…". */
const GREETING_MAX_LENGTH = 12;

/** The first name only; longer than 12 characters it is cut and ends in "…". */
export function greetingName(name: string): string {
  const chars = Array.from(name.trim().split(/\s+/)[0]); // an emoji or accented letter counts once
  if (chars.length <= GREETING_MAX_LENGTH) return chars.join('');
  return `${chars.slice(0, GREETING_MAX_LENGTH - 1).join('')}…`;
}
