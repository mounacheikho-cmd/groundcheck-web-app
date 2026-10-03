import type { HourlyPoint } from '../domain/types';
import { ASSETS } from '../assets';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';
import styles from './WeatherCard.module.css';

interface WeatherCardProps {
  place: string;
  current?: HourlyPoint;
  status: 'pending' | 'error' | 'success';
  onRetry?: () => void;
}

function fmt(n: number) {
  return Math.round(n).toString();
}

/** "Today's weather" panel from the Home screen. */
export function WeatherCard({ place, current, status, onRetry }: WeatherCardProps) {
  const { theme } = useTheme();
  return (
    <div className={styles.card} aria-busy={status === 'pending'}>
      <img className={styles.sun} src={ASSETS.cardSun[theme]} alt="" aria-hidden="true" />
      <img className={styles.cloud} src={ASSETS.cardCloud[theme]} alt="" aria-hidden="true" />
      <p className={styles.place}>
        {place} <Icon name="navigation" size={10} className={styles.pin} />
      </p>
      {status === 'success' && current && (
        <>
          <p className={styles.temp}>
            <span className={styles.tempValue}>{fmt(current.temperature)}</span>
            <span className={styles.tempUnit}> °C</span>
          </p>
          <p className={styles.details}>
            Wind: {fmt(current.windSpeed)} km/h&nbsp;&nbsp;Rain: {current.precipitation} mm
          </p>
        </>
      )}
      {status === 'pending' && <p className={styles.message}>Loading forecast…</p>}
      {status === 'error' && (
        <div className={styles.message} role="alert">
          <p>Couldn’t load the forecast.</p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
