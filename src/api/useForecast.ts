import { useQuery } from '@tanstack/react-query';
import { ASCHAFFENBURG, fetchForecast, type Place } from './openMeteo';

/** Fresh enough for decisions; Open-Meteo updates its models roughly hourly. */
const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useForecast(place: Place = ASCHAFFENBURG) {
  return useQuery({
    queryKey: ['forecast', place.latitude, place.longitude],
    queryFn: ({ signal }) => fetchForecast(place, signal),
    staleTime: FIFTEEN_MINUTES,
    refetchInterval: FIFTEEN_MINUTES,
  });
}
