import type { Decision } from '../domain/types';
import { TASK_LABELS } from '../domain/types';
import { Icon } from './Icon';
import styles from './DecisionCard.module.css';

const STATE_LABEL = { go: 'GO', caution: 'Caution', 'no-go': 'NO-GO' } as const;

interface DecisionCardProps {
  decision: Decision;
  onRefresh?: () => void;
  refreshing?: boolean;
}

/** The result card: task, GO / CAUTION / NO-GO and the reason. */
export function DecisionCard({ decision, onRefresh, refreshing }: DecisionCardProps) {
  return (
    <section className={styles.card} data-state={decision.state} aria-live="polite" aria-labelledby="decision-state">
      <p className={styles.task}>{TASK_LABELS[decision.task]}</p>
      {onRefresh && (
        <button
          type="button"
          className={styles.refresh}
          onClick={onRefresh}
          disabled={refreshing}
          data-spinning={refreshing || undefined}
        >
          <Icon name="refresh" size={16} title="Refresh forecast" />
        </button>
      )}
      <h1 id="decision-state" className={styles.state}>
        <span className="visually-hidden">Status for {TASK_LABELS[decision.task]}: </span>
        {STATE_LABEL[decision.state]}
      </h1>
      <p className={styles.headline}>{decision.headline}</p>
    </section>
  );
}
