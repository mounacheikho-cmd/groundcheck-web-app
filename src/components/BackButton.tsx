import { useNavigate } from 'react-router';
import { Icon } from './Icon';
import styles from './BackButton.module.css';

/** The arrow in the top-left corner of the Figma screens. */
export function BackButton({ to, label = 'Back', className }: { to?: string; label?: string; className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={`${styles.back} ${className ?? ''}`}
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <Icon name="arrowLeft" size={30} strokeWidth={1.6} title={label} />
    </button>
  );
}
