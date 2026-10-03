import { useCallback, useSyncExternalStore } from 'react';

export const DESKTOP_QUERY = '(min-width: 1024px)';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True from 1024 px, where the desktop frames (1280 × 832) take over. */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
