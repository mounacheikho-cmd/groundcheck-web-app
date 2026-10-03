import type { HourlyPoint } from '../domain/types';
import styles from './StatCards.module.css';

/** The three small Wind / Rain / Temp tiles under the result card, with units. */
export function StatCards({ current }: { current: HourlyPoint }) {
  const stats = [
    { label: 'Wind', value: `${Math.round(current.windSpeed)} km/h` },
    { label: 'Rain', value: `${current.precipitation} mm` },
    { label: 'Temp', value: `${Math.round(current.temperature)} °C` },
  ];
  return (
    <dl className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.tile}>
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
