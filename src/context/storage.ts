import type { ZodType } from 'zod';

/** localStorage keeps a value across visits; sessionStorage only until the tab is closed. */
type StorageArea = 'localStorage' | 'sessionStorage';

/**
 * Reads a JSON value from browser storage and validates it with a Zod schema.
 * Returns the fallback when storage is unavailable, empty or holds invalid data.
 */
export function readStored<T>(
  key: string,
  schema: ZodType<T>,
  fallback: T,
  area: StorageArea = 'localStorage',
): T {
  try {
    const raw = window[area].getItem(key);
    if (raw === null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown, area: StorageArea = 'localStorage'): void {
  try {
    if (value === null) window[area].removeItem(key);
    else window[area].setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the app keeps working in memory.
  }
}
