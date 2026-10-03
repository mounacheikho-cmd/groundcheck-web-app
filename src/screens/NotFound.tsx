import { ButtonLink } from '../components/Button';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>This page doesn’t exist. Let’s get you back on solid ground.</p>
      <ButtonLink to="/">Go to start</ButtonLink>
    </main>
  );
}
