import { z } from 'zod';

export const TASK_IDS = ['dig', 'spray', 'prune'] as const;
export type TaskId = (typeof TASK_IDS)[number];

export const TASK_LABELS: Record<TaskId, string> = {
  dig: 'Dig',
  spray: 'Spray',
  prune: 'Prune',
};

export function isTaskId(value: string | undefined): value is TaskId {
  return TASK_IDS.includes(value as TaskId);
}

/** A limit is a number, or null when the user sets "no limit". */
const limit = z.number().nullable();

export const thresholdsSchema = z
  .object({
    minWind: limit,
    maxWind: limit,
    minRain: limit,
    maxRain: limit,
    minTemp: limit,
    maxTemp: limit,
  })
  .refine((t) => t.minWind === null || t.maxWind === null || t.minWind <= t.maxWind, {
    message: 'Min wind must not be higher than max wind',
    path: ['minWind'],
  })
  .refine((t) => t.minRain === null || t.maxRain === null || t.minRain <= t.maxRain, {
    message: 'Min rain must not be higher than max rain',
    path: ['minRain'],
  })
  .refine((t) => t.minTemp === null || t.maxTemp === null || t.minTemp <= t.maxTemp, {
    message: 'Min temp must not be higher than max temp',
    path: ['minTemp'],
  });

export type Thresholds = z.infer<typeof thresholdsSchema>;

export const thresholdSetSchema = z.object({
  dig: thresholdsSchema,
  spray: thresholdsSchema,
  prune: thresholdsSchema,
});

export type ThresholdSet = z.infer<typeof thresholdSetSchema>;

/** One hour of forecast, in the location's local time. */
export interface HourlyPoint {
  /** Local time as returned by Open-Meteo, e.g. "2026-09-29T08:00". */
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windGusts: number;
}

export type Metric = 'wind' | 'rain' | 'temp';
export type DecisionState = 'go' | 'caution' | 'no-go';

export interface Check {
  metric: Metric | 'gusts';
  bound: 'min' | 'max';
  limit: number;
  value: number;
  time: string;
  status: 'ok' | 'near' | 'breach';
}

export interface Decision {
  task: TaskId;
  state: DecisionState;
  /** One sentence explaining the state, shown on the result card. */
  headline: string;
  /** Local time the status is valid until, or null when unknown. */
  validUntil: string | null;
  /** Every limit that was checked, for "Why this status?". */
  checks: Check[];
  /** The forecast hour the decision is based on. */
  current: HourlyPoint;
}
