import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router';
import { useForecast } from '../api/useForecast';
import { localNow } from '../api/openMeteo';
import { AppShell } from '../components/AppShell';
import { BackButton } from '../components/BackButton';
import { ButtonLink } from '../components/Button';
import { DecisionCard } from '../components/DecisionCard';
import { Decor, type Layer } from '../components/Decor';
import { StatCards } from '../components/StatCards';
import { WhyStatus } from '../components/WhyStatus';
import { useIsDesktop } from '../components/useMediaQuery';
import { useThresholds } from '../context/ThresholdsContext';
import { evaluate } from '../domain/evaluate';
import { isTaskId, type DecisionState } from '../domain/types';
import styles from './Result.module.css';

const SCENES: Record<DecisionState, { mobile: Layer[]; desktop: Layer[] }> = {
  go: {
    mobile: [
      { asset: 'mountains', x: -235, y: 137, w: 727.337, h: 307 },
      { asset: 'sun', x: 185, y: -82, w: 264, h: 264 },
    ],
    desktop: [
      { asset: 'mountains', x: -318, y: 210, w: 1644.2, h: 694 },
      { asset: 'sun', x: 837, y: -249, w: 554, h: 554 },
    ],
  },
  caution: {
    mobile: [{ asset: 'cautionScene', x: 0, y: 0, w: 390, h: 409 }],
    desktop: [
      { asset: 'mountains', x: -318, y: 210, w: 1644.2, h: 694 },
      { asset: 'sun', x: 837, y: -249, w: 554, h: 554 },
      { asset: 'cloud', x: -119, y: -74, w: 508.7, h: 328 },
      { asset: 'cloud', x: 737, y: 168, w: 441.7, h: 284.8 },
    ],
  },
  'no-go': {
    mobile: [
      { asset: 'cloud', x: -99, y: -82, w: 259, h: 167 },
      { asset: 'cloud', x: 167, y: 218, w: 252, h: 167 },
      { asset: 'cloudC', x: 230, y: -15, w: 271.4, h: 175 },
      { asset: 'cloudC', x: -26, y: 107, w: 238.8, h: 154 },
    ],
    desktop: [
      { asset: 'cloud', x: -455, y: 334, w: 585, h: 377.2 },
      { asset: 'cloud', x: 264, y: 212, w: 645, h: 392.6 },
      { asset: 'cloud', x: 907, y: 720, w: 645, h: 392.6 },
      { asset: 'cloud', x: 61, y: 702, w: 552, h: 336 },
      { asset: 'cloud', x: 972, y: 226, w: 647, h: 393.8 },
      { asset: 'cloud', x: -26, y: -134, w: 473, h: 305 },
      { asset: 'cloud', x: 627, y: -171, w: 630.9, h: 406.8 },
    ],
  },
};

function formatTime(ms: number, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(ms);
}

export function Result() {
  const { task } = useParams();
  const isDesktop = useIsDesktop();
  const { thresholds } = useThresholds();
  const forecast = useForecast();

  const decision = useMemo(() => {
    if (!isTaskId(task) || !forecast.data) return null;
    try {
      return evaluate(task, forecast.data.points, thresholds[task], localNow(forecast.data.utcOffsetSeconds));
    } catch {
      return null;
    }
  }, [task, forecast.data, thresholds]);

  if (!isTaskId(task)) return <Navigate to="/home" replace />;

  const state: DecisionState = decision?.state ?? 'go';
  const scene = SCENES[state];
  const updatedAt = forecast.data ? formatTime(forecast.data.fetchedAt, forecast.data.timezone) : '';

  return (
    <AppShell sidebarTone={state === 'no-go' ? 'sky' : 'default'}>
      <div className={styles.background} data-state={state} aria-hidden="true" />
      <Decor
        layers={isDesktop ? scene.desktop : scene.mobile}
        frame={isDesktop ? { width: 1280, height: 832 } : { width: 390, height: 844 }}
        align={isDesktop ? 'left' : 'center'}
      />
      <div className={styles.panel} data-state={state}>
        <BackButton to="/home" label="Back to home" className={styles.back} />

        {decision ? (
          <>
            <DecisionCard
              decision={decision}
              onRefresh={() => void forecast.refetch()}
              refreshing={forecast.isFetching}
            />
            <StatCards current={decision.current} />
            {!isDesktop && (
              <ButtonLink to="/thresholds" className={styles.edit}>
                Edit Thresholds
              </ButtonLink>
            )}
            <div className={styles.meta}>
              <WhyStatus decision={decision} updatedAt={updatedAt} />
              <p className={styles.source}>
                Updated {updatedAt} · Weather data by{' '}
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
                  Open-Meteo
                </a>
              </p>
            </div>
          </>
        ) : forecast.isPending ? (
          <p className={styles.status} role="status">
            Checking the forecast…
          </p>
        ) : (
          <div className={styles.status} role="alert">
            <p>The forecast couldn’t be loaded, so there is no status right now.</p>
            <button type="button" className={styles.retry} onClick={() => void forecast.refetch()}>
              Try again
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
