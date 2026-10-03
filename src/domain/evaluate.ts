import { UNITS } from './thresholds';
import type { Check, Decision, HourlyPoint, Metric, TaskId, Thresholds } from './types';

/** Number of forecast hours checked: the current hour plus the next three. */
export const WINDOW_HOURS = 4;

/** Wind counts as "close" within 10% of its limit; temperature within 2 °C; rain has no margin. */
const WIND_MARGIN_RATIO = 0.1;
const TEMP_MARGIN_C = 2;

export class NoForecastError extends Error {
  constructor() {
    super('No forecast available for the current hour.');
    this.name = 'NoForecastError';
  }
}

const METRIC_NAMES: Record<Metric, string> = {
  wind: 'Wind',
  rain: 'Rain',
  temp: 'Temperature',
};

interface Limit {
  metric: Metric | 'gusts';
  bound: 'min' | 'max';
  limit: number;
}

/** "2026-09-29T08:00" → "08:00" */
export function clock(time: string): string {
  return time.slice(11, 16);
}

function addHours(time: string, hours: number): string {
  return new Date(Date.parse(`${time}:00Z`) + hours * 3_600_000).toISOString().slice(0, 16);
}

function limitsOf(t: Thresholds): Limit[] {
  const pairs: [Metric, number | null, number | null][] = [
    ['wind', t.minWind, t.maxWind],
    ['rain', t.minRain, t.maxRain],
    ['temp', t.minTemp, t.maxTemp],
  ];
  const limits: Limit[] = [];
  for (const [metric, min, max] of pairs) {
    if (min !== null) limits.push({ metric, bound: 'min', limit: min });
    if (max !== null) limits.push({ metric, bound: 'max', limit: max });
  }
  if (t.maxWind !== null) limits.push({ metric: 'gusts', bound: 'max', limit: t.maxWind });
  return limits;
}

function valueOf(point: HourlyPoint, metric: Limit['metric']): number {
  switch (metric) {
    case 'wind':
      return point.windSpeed;
    case 'gusts':
      return point.windGusts;
    case 'rain':
      return point.precipitation;
    case 'temp':
      return point.temperature;
  }
}

function isNear({ metric, bound, limit }: Limit, value: number): boolean {
  if (metric === 'wind') {
    const margin = Math.abs(limit) * WIND_MARGIN_RATIO;
    return bound === 'max' ? value >= limit - margin : value <= limit + margin;
  }
  if (metric === 'temp') {
    return bound === 'max' ? value >= limit - TEMP_MARGIN_C : value <= limit + TEMP_MARGIN_C;
  }
  return false;
}

function check(point: HourlyPoint, l: Limit): Check {
  const value = valueOf(point, l.metric);
  const breach = l.bound === 'max' ? value > l.limit : value < l.limit;
  const status = breach ? 'breach' : isNear(l, value) ? 'near' : 'ok';
  return { ...l, value, time: clock(point.time), status };
}

function round(n: number): string {
  return String(Math.round(n * 10) / 10);
}

/** Picks the current hour and the following hours from a forecast. */
export function selectWindow(points: HourlyPoint[], nowLocal: string): HourlyPoint[] {
  const currentHour = `${nowLocal.slice(0, 13)}:00`;
  const start = points.findIndex((p) => p.time === currentHour);
  if (start === -1) throw new NoForecastError();
  return points.slice(start, start + WINDOW_HOURS);
}

/**
 * Turns a forecast and a task's thresholds into GO, CAUTION or NO-GO.
 *
 * - NO-GO: the current hour breaks a wind, rain or temperature limit.
 * - CAUTION: a later hour breaks one, gusts exceed the max wind, or a value is inside its margin.
 * - GO: everything else.
 *
 * @param nowLocal the current time at the forecast location, e.g. "2026-09-29T08:10"
 */
export function evaluate(
  task: TaskId,
  points: HourlyPoint[],
  thresholds: Thresholds,
  nowLocal: string,
): Decision {
  const window = selectWindow(points, nowLocal);
  const current = window[0];
  const limits = limitsOf(thresholds);
  const checks = window.flatMap((p) => limits.map((l) => check(p, l)));
  const base = { task, checks, current };

  // NO-GO: a wind, rain or temperature limit is broken right now.
  const nowBreach = checks.find(
    (c) => c.time === clock(current.time) && c.status === 'breach' && c.metric !== 'gusts',
  );
  if (nowBreach) {
    const recovery = window.find((p) => {
      const c = checks.find(
        (x) => x.time === clock(p.time) && x.metric === nowBreach.metric && x.bound === nowBreach.bound,
      );
      return c?.status !== 'breach';
    });
    const name = METRIC_NAMES[nowBreach.metric as Metric];
    const direction = nowBreach.bound === 'max' ? 'above' : 'below';
    const until = recovery ? clock(recovery.time) : null;
    return {
      ...base,
      state: 'no-go',
      headline: until
        ? `${name} is ${direction} limit until ${until}.`
        : `${name} is ${direction} limit for the next ${WINDOW_HOURS} hours.`,
      validUntil: until,
    };
  }

  // CAUTION: a limit breaks later in the window (gusts count here too).
  const laterBreach = checks.find((c) => c.status === 'breach');
  if (laterBreach) {
    const name = laterBreach.metric === 'gusts' ? 'Wind gusts' : METRIC_NAMES[laterBreach.metric];
    // Only gusts can be over the limit in the current hour without making it NO-GO.
    if (laterBreach.time === clock(current.time)) {
      return { ...base, state: 'caution', headline: `${name} are above limit now.`, validUntil: laterBreach.time };
    }
    const direction = laterBreach.bound === 'max' ? 'rise above' : 'drop below';
    return {
      ...base,
      state: 'caution',
      headline: `${name} may ${direction} limit at ${laterBreach.time}.`,
      validUntil: laterBreach.time,
    };
  }

  // CAUTION: a value is close to its limit.
  const near = checks.find((c) => c.status === 'near' && c.metric !== 'gusts');
  if (near) {
    const metric = near.metric as Metric;
    return {
      ...base,
      state: 'caution',
      headline: `${METRIC_NAMES[metric]} is close to your limit (${round(near.value)} of ${round(near.limit)} ${UNITS[metric]}).`,
      validUntil: near.time,
    };
  }

  const until = clock(addHours(window[window.length - 1].time, 1));
  return {
    ...base,
    state: 'go',
    headline: `All your thresholds are met. You can go until ${until}.`,
    validUntil: until,
  };
}
