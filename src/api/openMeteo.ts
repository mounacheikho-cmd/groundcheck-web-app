import { z } from 'zod';
import type { HourlyPoint } from '../domain/types';

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

export const ASCHAFFENBURG: Place = { name: 'Aschaffenburg', latitude: 49.9769, longitude: 9.1523 };

const HOURLY_VARS = ['temperature_2m', 'precipitation', 'wind_speed_10m', 'wind_gusts_10m'] as const;

const series = z.array(z.number().nullable());

/** The part of the Open-Meteo response the app relies on, checked at runtime. */
export const forecastResponseSchema = z.object({
  timezone: z.string(),
  utc_offset_seconds: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: series,
    precipitation: series,
    wind_speed_10m: series,
    wind_gusts_10m: series,
  }),
});

export type ForecastResponse = z.infer<typeof forecastResponseSchema>;

export interface Forecast {
  place: Place;
  timezone: string;
  utcOffsetSeconds: number;
  points: HourlyPoint[];
  fetchedAt: number;
}

export function forecastUrl(place: Place): string {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    hourly: HOURLY_VARS.join(','),
    timezone: 'auto',
    forecast_days: '2',
    wind_speed_unit: 'kmh',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

/** Converts the column-based response into hourly points, skipping hours with missing values. */
export function toPoints(data: ForecastResponse): HourlyPoint[] {
  const h = data.hourly;
  const points: HourlyPoint[] = [];
  h.time.forEach((time, i) => {
    const temperature = h.temperature_2m[i];
    const precipitation = h.precipitation[i];
    const windSpeed = h.wind_speed_10m[i];
    const windGusts = h.wind_gusts_10m[i];
    if (temperature == null || precipitation == null || windSpeed == null || windGusts == null) return;
    points.push({ time, temperature, precipitation, windSpeed, windGusts });
  });
  return points;
}

/** Current time at the forecast location, in Open-Meteo's local format ("YYYY-MM-DDTHH:mm"). */
export function localNow(utcOffsetSeconds: number, now = Date.now()): string {
  return new Date(now + utcOffsetSeconds * 1000).toISOString().slice(0, 16);
}

export async function fetchForecast(place: Place, signal?: AbortSignal): Promise<Forecast> {
  const res = await fetch(forecastUrl(place), { signal });
  if (!res.ok) throw new Error(`Weather service answered ${res.status}`);
  const data = forecastResponseSchema.parse(await res.json());
  return {
    place,
    timezone: data.timezone,
    utcOffsetSeconds: data.utc_offset_seconds,
    points: toPoints(data),
    fetchedAt: Date.now(),
  };
}
