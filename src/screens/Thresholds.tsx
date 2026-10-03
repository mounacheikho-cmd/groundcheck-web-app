import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '../components/AppShell';
import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { Decor, type Layer } from '../components/Decor';
import { ThresholdField } from '../components/ThresholdField';
import { useIsDesktop } from '../components/useMediaQuery';
import { useThresholds } from '../context/ThresholdsContext';
import { DEFAULT_THRESHOLDS } from '../domain/thresholds';
import { thresholdsSchema, TASK_LABELS, type Metric, type TaskId, type Thresholds as TaskThresholds, type ThresholdSet } from '../domain/types';
import styles from './Thresholds.module.css';

const MOBILE_ORDER: TaskId[] = ['spray', 'dig', 'prune'];
const DESKTOP_ORDER: TaskId[] = ['spray', 'prune', 'dig'];
const FIELDS: { metric: Metric; bound: 'min' | 'max'; key: keyof TaskThresholds }[] = [
  { metric: 'wind', bound: 'max', key: 'maxWind' },
  { metric: 'wind', bound: 'min', key: 'minWind' },
  { metric: 'rain', bound: 'max', key: 'maxRain' },
  { metric: 'rain', bound: 'min', key: 'minRain' },
  { metric: 'temp', bound: 'max', key: 'maxTemp' },
  { metric: 'temp', bound: 'min', key: 'minTemp' },
];

const DESKTOP_DECOR: Layer[] = [{ asset: 'windmillAlt', x: 629, y: 194.4, w: 393, h: 405.2 }];

type Errors = Partial<Record<TaskId, { message: string; fields: (keyof TaskThresholds)[] }>>;

function validate(draft: ThresholdSet): Errors {
  const errors: Errors = {};
  for (const task of MOBILE_ORDER) {
    const result = thresholdsSchema.safeParse(draft[task]);
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first.path[0] as keyof TaskThresholds;
      const pair = field.replace('min', 'max') as keyof TaskThresholds;
      errors[task] = { message: first.message, fields: [field, pair] };
    }
  }
  return errors;
}

export function Thresholds() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { thresholds, saveThresholds, resetThresholds } = useThresholds();
  const [draft, setDraft] = useState<ThresholdSet>(thresholds);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  function update(task: TaskId, key: keyof TaskThresholds, value: number | null) {
    setSaved(false);
    setDraft((d) => ({ ...d, [task]: { ...d[task], [key]: value } }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    saveThresholds(draft);
    setSaved(true);
    navigate(-1);
  }

  const order = isDesktop ? DESKTOP_ORDER : MOBILE_ORDER;

  return (
    <AppShell>
      <div className={styles.background} aria-hidden="true" />
      {isDesktop && <Decor layers={DESKTOP_DECOR} frame={{ width: 1280, height: 832 }} align="left" />}
      <div className={styles.layout}>
        {isDesktop && <BackButton label="Back" className={styles.backDesktop} />}
        <h1 className={styles.title}>Edit Thresholds</h1>
        <form className={styles.panel} onSubmit={onSubmit} noValidate>
          {!isDesktop && (
            <div className={styles.backRow}>
              <BackButton label="Back" />
            </div>
          )}
          {order.map((task) => (
            <fieldset key={task} className={styles.task} aria-describedby={errors[task] ? `${task}-error` : undefined}>
              <legend className={styles.taskName}>{TASK_LABELS[task]}</legend>
              <div className={styles.grid}>
                {FIELDS.map((f) => (
                  <ThresholdField
                    key={f.key}
                    task={TASK_LABELS[task]}
                    metric={f.metric}
                    bound={f.bound}
                    value={draft[task][f.key]}
                    invalid={errors[task]?.fields.includes(f.key)}
                    onChange={(v) => update(task, f.key, v)}
                  />
                ))}
              </div>
              {errors[task] && (
                <p id={`${task}-error`} className={styles.error} role="alert">
                  {errors[task]?.message}
                </p>
              )}
            </fieldset>
          ))}
          <div className={styles.actions}>
            <Button type="submit">Save</Button>
            {isDesktop && (
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            )}
            <p className={styles.intro}>Wind in km/h, rain in mm/h, temperature in °C. “none” means no limit.</p>
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                resetThresholds();
                setDraft(DEFAULT_THRESHOLDS);
                setErrors({});
              }}
            >
              Reset to recommended values
            </button>
            <p className="visually-hidden" role="status">
              {saved ? 'Thresholds saved' : ''}
            </p>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
