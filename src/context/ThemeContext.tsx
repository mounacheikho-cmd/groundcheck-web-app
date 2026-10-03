import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { readStored, writeStored } from './storage';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'gc.theme';
const themeSchema = z.enum(['light', 'dark']);

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Follows the system setting until the user picks a theme, then remembers the choice. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState<Theme | null>(() => readStored(STORAGE_KEY, themeSchema.nullable(), null));
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = chosen ?? system;

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const onChange = () => setSystem(query.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setChosen(next);
    writeStored(STORAGE_KEY, next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
