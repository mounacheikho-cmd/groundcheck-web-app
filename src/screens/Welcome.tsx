import { useNavigate } from 'react-router';
import { ButtonLink } from '../components/Button';
import { Decor, type Layer } from '../components/Decor';
import { Logo } from '../components/Logo';
import { useIsDesktop } from '../components/useMediaQuery';
import { useAuth } from '../context/AuthContext';
import styles from './Welcome.module.css';

const MOBILE: Layer[] = [
  { asset: 'welcomeTop', x: -156, y: -256, w: 700, h: 700 },
  { asset: 'bottomWaves', x: -179, y: 769, w: 723, h: 550, fromBottom: true },
];

const DESKTOP: Layer[] = [
  // Ellipse fitted to the desktop frame's curve (Figma 52:1639).
  { asset: 'welcomeTop', x: -447.4, y: -518.4, w: 2735.1, h: 950 },
  { asset: 'bottomWaves', x: -629, y: 691, w: 1840, h: 1399.7, fromBottom: true },
];

export function Welcome() {
  const isDesktop = useIsDesktop();
  const { signInDemo } = useAuth();
  const navigate = useNavigate();

  return (
    <main className={styles.screen}>
      <Decor
        layers={isDesktop ? DESKTOP : MOBILE}
        frame={isDesktop ? { width: 1280, height: 832 } : { width: 390, height: 844 }}
        align={isDesktop ? 'left' : 'center'}
      />
      <div className={styles.content}>
        <Logo className={styles.logo} width={isDesktop ? 410.5 : 283.36} />
        <div className={styles.intro}>
          <h1 className={styles.title}>Welcome!</h1>
          <p className={styles.subtitle}>Please sign up or log in to continue</p>
        </div>
        <div className={styles.actions}>
          <ButtonLink to="/signup" className={styles.button}>
            Sign Up
          </ButtonLink>
          <ButtonLink to="/login" variant="secondary" className={styles.button}>
            Log in
          </ButtonLink>
          <button
            type="button"
            className={styles.demo}
            onClick={async () => {
              await signInDemo();
              navigate('/home');
            }}
          >
            Just looking? Try the demo
          </button>
        </div>
      </div>
    </main>
  );
}
