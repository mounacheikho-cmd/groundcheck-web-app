import type { Check, Decision } from '../domain/types';
import { UNITS } from '../domain/thresholds';
import styles from './WhyStatus.module.css';

const NAMES: Record<Check['metric'], string> = {
  wind: 'Wind',
  gusts: 'Wind gusts',
  rain: 'Rain',
  temp: 'Temperature',
};

const STATUS: Record<Check['status'], string> = { ok: 'OK', near: 'Close', breach: 'Over limit' };

function unit(metric: Check['metric']) {
  return metric === 'gusts' ? UNITS.wind : UNITS[metric];
}

/**
 * Progressive disclosure asked for in the HCI evaluation: which limits were checked,
 * the forecast value and unit, and when.
 */
export function WhyStatus({ decision, updatedAt }: { decision: Decision; updatedAt: string }) {
  const now = decision.checks.filter((c) => c.time === decision.checks[0]?.time);
  const later = decision.checks.filter((c) => c.time !== decision.checks[0]?.time && c.status !== 'ok');
  const rows = [...now, ...later];

  return (
    <details className={styles.why}>
      <summary>Why this status?</summary>
      <table className={styles.table}>
        <caption className="visually-hidden">Limits checked for the next 4 hours</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Check</th>
            <th scope="col">Forecast</th>
            <th scope="col">Your limit</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={i} data-status={c.status}>
              <td>{c.time}</td>
              <td>{NAMES[c.metric]}</td>
              <td>
                {c.value} {unit(c.metric)}
              </td>
              <td>
                {c.bound} {c.limit} {unit(c.metric)}
              </td>
              <td>{STATUS[c.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.note}>
        Checked for the current hour and the next 3 hours. Forecast updated {updatedAt}. Product labels and
        local safety rules always come first.
      </p>
    </details>
  );
}
