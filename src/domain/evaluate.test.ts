import { describe, expect, it } from 'vitest';
import { evaluate, NoForecastError } from './evaluate';
import { DEFAULT_THRESHOLDS } from './thresholds';
import type { HourlyPoint, Thresholds } from './types';

const NOW = '2026-09-29T08:10';

/** Builds consecutive hourly points starting at `start`; unspecified values are calm weather. */
function hours(values: Partial<HourlyPoint>[], start = '2026-09-29T08:00'): HourlyPoint[] {
  const startMs = Date.parse(`${start}:00Z`);
  return values.map((v, i) => ({
    time: new Date(startMs + i * 3_600_000).toISOString().slice(0, 16),
    temperature: 15,
    precipitation: 0,
    windSpeed: 10,
    windGusts: 12,
    ...v,
  }));
}

const calm = hours([{}, {}, {}, {}]);
const spray = DEFAULT_THRESHOLDS.spray;
const dig = DEFAULT_THRESHOLDS.dig;
const prune = DEFAULT_THRESHOLDS.prune;

describe('evaluate', () => {
  describe('GO', () => {
    it('is GO when all four hours are within limits and outside the margins', () => {
      const d = evaluate('spray', calm, spray, NOW);
      expect(d.state).toBe('go');
      expect(d.headline).toBe('All your thresholds are met. You can go until 12:00.');
      expect(d.validUntil).toBe('12:00');
    });

    it('rolls "until" over midnight', () => {
      const late = hours([{}, {}, {}, {}], '2026-09-29T20:00');
      const d = evaluate('spray', late, spray, '2026-09-29T20:05');
      expect(d.headline).toBe('All your thresholds are met. You can go until 00:00.');
    });

    it('ignores limits set to "no limit"', () => {
      const still = hours([{ windSpeed: 0, windGusts: 0 }, {}, {}, {}]);
      expect(evaluate('prune', still, prune, NOW).state).toBe('go');
    });

    it('gives rain no margin: just under the max is still GO', () => {
      const drizzle = hours([{ precipitation: 3.9 }, {}, {}, {}]);
      expect(evaluate('dig', drizzle, dig, NOW).state).toBe('go');
    });
  });

  describe('NO-GO', () => {
    it('is NO-GO when the current hour breaks a limit, until the first hour back in range', () => {
      const windy = hours([{ windSpeed: 20 }, { windSpeed: 20 }, {}, {}]);
      const d = evaluate('spray', windy, spray, NOW);
      expect(d.state).toBe('no-go');
      expect(d.headline).toBe('Wind is above limit until 10:00.');
      expect(d.validUntil).toBe('10:00');
    });

    it('says "for the next 4 hours" when the limit stays broken', () => {
      const windy = hours([{ windSpeed: 50 }, { windSpeed: 50 }, { windSpeed: 50 }, { windSpeed: 50 }]);
      const d = evaluate('dig', windy, dig, NOW);
      expect(d.headline).toBe('Wind is above limit for the next 4 hours.');
      expect(d.validUntil).toBeNull();
    });

    it('treats any rain above the max as a breach', () => {
      const wet = hours([{ precipitation: 0.3 }, {}, {}, {}]);
      const d = evaluate('spray', wet, spray, NOW);
      expect(d.state).toBe('no-go');
      expect(d.headline).toBe('Rain is above limit until 09:00.');
    });

    it('breaks on minimum limits too (low wind for spraying)', () => {
      const still = hours([{ windSpeed: 3 }, {}, {}, {}]);
      const d = evaluate('spray', still, spray, NOW);
      expect(d.state).toBe('no-go');
      expect(d.headline).toBe('Wind is below limit until 09:00.');
    });

    it('names temperature in full', () => {
      const frost = hours([{ temperature: -2 }, { temperature: -1 }, {}, {}]);
      const d = evaluate('dig', frost, dig, NOW);
      expect(d.headline).toBe('Temperature is below limit until 10:00.');
    });

    it('beats CAUTION when both apply', () => {
      const mixed = hours([{ windSpeed: 20 }, { windGusts: 30 }, {}, {}]);
      expect(evaluate('spray', mixed, spray, NOW).state).toBe('no-go');
    });
  });

  describe('CAUTION', () => {
    it('is CAUTION when a later hour breaks a limit', () => {
      const later = hours([{}, {}, { windSpeed: 20 }, {}]);
      const d = evaluate('spray', later, spray, NOW);
      expect(d.state).toBe('caution');
      expect(d.headline).toBe('Wind may rise above limit at 10:00.');
      expect(d.validUntil).toBe('10:00');
    });

    it('is CAUTION when gusts exceed the max wind', () => {
      const gusty = hours([{}, { windGusts: 18 }, {}, {}]);
      const d = evaluate('spray', gusty, spray, NOW);
      expect(d.state).toBe('caution');
      expect(d.headline).toBe('Wind gusts may rise above limit at 09:00.');
    });

    it('says "now" when gusts are over the limit in the current hour', () => {
      const gustyNow = hours([{ windGusts: 20 }, {}, {}, {}]);
      const d = evaluate('spray', gustyNow, spray, NOW);
      expect(d.state).toBe('caution');
      expect(d.headline).toBe('Wind gusts are above limit now.');
    });

    it('is CAUTION when wind is within 10% of its limit', () => {
      const close = hours([{ windSpeed: 14 }, {}, {}, {}]);
      const d = evaluate('spray', close, spray, NOW);
      expect(d.state).toBe('caution');
      expect(d.headline).toBe('Wind is close to your limit (14 of 15 km/h).');
    });

    it('is CAUTION when temperature is within 2 °C of its range', () => {
      const warm = hours([{ temperature: 26 }, {}, {}, {}]);
      const d = evaluate('spray', warm, spray, NOW);
      expect(d.state).toBe('caution');
      expect(d.headline).toBe('Temperature is close to your limit (26 of 27 °C).');
    });

    it('prefers a coming breach over a near-limit value', () => {
      const both = hours([{ windSpeed: 14 }, {}, { precipitation: 1 }, {}]);
      expect(evaluate('spray', both, spray, NOW).headline).toBe('Rain may rise above limit at 10:00.');
    });
  });

  describe('window and checks', () => {
    it('starts the window at the current hour and ignores earlier hours', () => {
      const day = hours(
        [{ windSpeed: 90 }, { windSpeed: 90 }, {}, {}, {}, {}, {}],
        '2026-09-29T06:00',
      );
      const d = evaluate('spray', day, spray, NOW);
      expect(d.state).toBe('go');
      expect(d.current.time).toBe('2026-09-29T08:00');
    });

    it('lists every checked limit for "Why this status?"', () => {
      const d = evaluate('spray', calm, spray, NOW);
      const currentWindMax = d.checks.find(
        (c) => c.metric === 'wind' && c.bound === 'max' && c.time === '08:00',
      );
      expect(currentWindMax).toMatchObject({ limit: 15, value: 10, status: 'ok' });
      // 5 limits (min/max wind, max rain, min/max temp) + gusts, for 4 hours
      expect(d.checks).toHaveLength(24);
    });

    it('throws when there is no forecast for the current hour', () => {
      expect(() => evaluate('spray', [], spray, NOW)).toThrow(NoForecastError);
    });

    it('uses a custom threshold set', () => {
      const strict: Thresholds = { ...spray, maxWind: 8 };
      expect(evaluate('spray', calm, strict, NOW).state).toBe('no-go');
    });
  });
});
