import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_THRESHOLDS } from '../domain/thresholds';
import { thresholdSetSchema, type ThresholdSet } from '../domain/types';
import { readStored, writeStored } from './storage';

const STORAGE_KEY = 'gc.thresholds';

interface ThresholdsContextValue {
  thresholds: ThresholdSet;
  saveThresholds: (next: ThresholdSet) => void;
  resetThresholds: () => void;
}

const ThresholdsContext = createContext<ThresholdsContextValue | null>(null);

export function ThresholdsProvider({ children }: { children: ReactNode }) {
  const [thresholds, setThresholds] = useState<ThresholdSet>(() =>
    readStored(STORAGE_KEY, thresholdSetSchema, DEFAULT_THRESHOLDS),
  );

  const saveThresholds = useCallback((next: ThresholdSet) => {
    const valid = thresholdSetSchema.parse(next);
    setThresholds(valid);
    writeStored(STORAGE_KEY, valid);
  }, []);

  const resetThresholds = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    writeStored(STORAGE_KEY, null);
  }, []);

  const value = useMemo(
    () => ({ thresholds, saveThresholds, resetThresholds }),
    [thresholds, saveThresholds, resetThresholds],
  );
  return <ThresholdsContext.Provider value={value}>{children}</ThresholdsContext.Provider>;
}

export function useThresholds(): ThresholdsContextValue {
  const ctx = useContext(ThresholdsContext);
  if (!ctx) throw new Error('useThresholds must be used inside ThresholdsProvider');
  return ctx;
}
