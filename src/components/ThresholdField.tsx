import { useId } from 'react';
import { RANGES, UNITS } from '../domain/thresholds';
import type { Metric } from '../domain/types';
import styles from './ThresholdField.module.css';

const STEPS: Record<Metric, number[]> = {
  wind: Array.from({ length: 21 }, (_, i) => i * 5),
  rain: [0, 0.5, 1, 2, 3, 4, 5, 7.5, 10, 15, 20],
  temp: Array.from({ length: RANGES.temp.max - -20 + 1 }, (_, i) => -20 + i),
};

const METRIC_LABEL: Record<Metric, string> = { wind: 'wind', rain: 'rain', temp: 'temp' };

interface ThresholdFieldProps {
  task: string;
  metric: Metric;
  bound: 'min' | 'max';
  value: number | null;
  invalid?: boolean;
  onChange: (value: number | null) => void;
}

/** One pill from the Figma thresholds screen: label on the left, picker on the right. */
export function ThresholdField({ task, metric, bound, value, invalid, onChange }: ThresholdFieldProps) {
  const id = useId();
  const options = value === null || STEPS[metric].includes(value) ? STEPS[metric] : [...STEPS[metric], value].sort((a, b) => a - b);
  const label = `${bound === 'max' ? 'Max' : 'Min'} ${METRIC_LABEL[metric]}`;

  return (
    <div className={styles.field} data-metric={metric} data-bound={bound}>
      <label htmlFor={id} className={styles.label}>
        {label}
        <span className="visually-hidden">
          {' '}
          for {task}, in {UNITS[metric]}
        </span>
      </label>
      <div className={styles.picker}>
        <select
          id={id}
          className={styles.select}
          value={value === null ? '' : String(value)}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="">none</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <span className={styles.unit} aria-hidden="true">
          {UNITS[metric]}
        </span>
      </div>
    </div>
  );
}
