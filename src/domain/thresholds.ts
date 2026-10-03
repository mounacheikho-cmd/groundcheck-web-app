import type { ThresholdSet } from './types';

/**
 * Starting values per task (km/h, mm/h, °C). Users can edit them.
 * Sources and reasoning are listed in the README ("Decision rules").
 */
export const DEFAULT_THRESHOLDS: ThresholdSet = {
  spray: { minWind: 5, maxWind: 15, minRain: null, maxRain: 0, minTemp: 5, maxTemp: 27 },
  dig: { minWind: null, maxWind: 40, minRain: null, maxRain: 4, minTemp: 0, maxTemp: 30 },
  prune: { minWind: null, maxWind: 40, minRain: null, maxRain: 0, minTemp: 0, maxTemp: 30 },
};

export const UNITS = { wind: 'km/h', rain: 'mm/h', temp: '°C' } as const;

/** Allowed input ranges for the thresholds form. */
export const RANGES = {
  wind: { min: 0, max: 150 },
  rain: { min: 0, max: 50 },
  temp: { min: -30, max: 50 },
} as const;
