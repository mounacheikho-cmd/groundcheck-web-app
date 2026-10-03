import { describe, expect, it } from 'vitest';
import fixture from './fixtures/aschaffenburg.json';
import { evaluate } from '../domain/evaluate';
import { DEFAULT_THRESHOLDS } from '../domain/thresholds';
import { ASCHAFFENBURG, forecastResponseSchema, forecastUrl, localNow, toPoints } from './openMeteo';

describe('Open-Meteo client', () => {
  it('asks for hourly wind, gusts, rain and temperature in km/h and local time', () => {
    const url = new URL(forecastUrl(ASCHAFFENBURG));
    expect(url.hostname).toBe('api.open-meteo.com');
    expect(url.searchParams.get('hourly')).toBe(
      'temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m',
    );
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
  });

  it('parses a real response into hourly points', () => {
    const data = forecastResponseSchema.parse(fixture);
    const points = toPoints(data);
    expect(points).toHaveLength(48);
    expect(points[8]).toEqual({
      time: '2026-09-29T08:00',
      temperature: 16.7,
      precipitation: 0,
      windSpeed: 4.5,
      windGusts: 10.8,
    });
  });

  it('skips hours with missing values', () => {
    const data = forecastResponseSchema.parse(fixture);
    const broken = { ...data, hourly: { ...data.hourly, temperature_2m: [null, ...data.hourly.temperature_2m.slice(1)] } };
    expect(toPoints(broken)).toHaveLength(47);
  });

  it('rejects a response without hourly data', () => {
    expect(() => forecastResponseSchema.parse({ timezone: 'Europe/Berlin' })).toThrow();
  });

  it('converts "now" to the location\'s local time', () => {
    const utcNoon = Date.parse('2026-09-29T12:00:00Z');
    expect(localNow(7200, utcNoon)).toBe('2026-09-29T14:00');
  });

  it('produces a decision from real data', () => {
    const points = toPoints(forecastResponseSchema.parse(fixture));
    // 08:00 in Aschaffenburg: 4.5 km/h wind is below the 5 km/h spraying minimum
    const spray = evaluate('spray', points, DEFAULT_THRESHOLDS.spray, '2026-09-29T08:20');
    expect(spray.state).toBe('no-go');
    expect(spray.headline).toBe('Wind is below limit until 10:00.');
    // Digging only cares about strong wind, rain and frost
    expect(evaluate('dig', points, DEFAULT_THRESHOLDS.dig, '2026-09-29T08:20').state).toBe('go');
  });
});
