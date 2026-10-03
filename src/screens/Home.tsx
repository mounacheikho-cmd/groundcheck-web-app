import { useState } from 'react';
import { Link } from 'react-router';
import { useForecast } from '../api/useForecast';
import { ASCHAFFENBURG, localNow } from '../api/openMeteo';
import { AppShell } from '../components/AppShell';
import { Decor, type Layer } from '../components/Decor';
import { Icon } from '../components/Icon';
import { MenuDrawer } from '../components/Menu';
import { WeatherCard } from '../components/WeatherCard';
import { useIsDesktop } from '../components/useMediaQuery';
import { useAuth } from '../context/AuthContext';
import { greetingName } from '../context/displayName';
import { useTheme } from '../context/ThemeContext';
import { selectWindow } from '../domain/evaluate';
import { TASK_IDS, TASK_LABELS, type HourlyPoint } from '../domain/types';
import styles from './Home.module.css';

const MOBILE: Layer[] = [
  { asset: 'headerWave', x: -156, y: -87, w: 700, h: 192 },
  { asset: 'bottomWaves', x: -179, y: 769, w: 723, h: 550, fromBottom: true },
];

const DESKTOP: Layer[] = [
  { asset: 'headerWaveDesktop', x: -380.07, y: -267.15, w: 2039.68, h: 546.4, rotate: 1 },
  { asset: 'bottomWaves', x: -629, y: 691, w: 1840, h: 1399.7, fromBottom: true },
];

export function Home() {
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const forecast = useForecast();
  const name = greetingName(user?.name ?? '') || 'there';

  let current: HourlyPoint | undefined;
  if (forecast.data) {
    try {
      current = selectWindow(forecast.data.points, localNow(forecast.data.utcOffsetSeconds))[0];
    } catch {
      current = undefined;
    }
  }

  return (
    <AppShell>
      <Decor
        layers={isDesktop ? DESKTOP : MOBILE}
        frame={isDesktop ? { width: 1280, height: 832 } : { width: 390, height: 844 }}
        align={isDesktop ? 'left' : 'center'}
      />
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.hello} data-long={Array.from(name).length > 8 || undefined}>
            Hello, {name}
          </h1>
          {!isDesktop && (
            <div className={styles.icons}>
              <button type="button" className={styles.iconButton} onClick={toggleTheme}>
                <Icon
                  name={theme === 'dark' ? 'sun' : 'moon'}
                  size={26}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="menu" size={30} title="Open menu" />
              </button>
            </div>
          )}
        </header>

        <section className={styles.weather} aria-labelledby="today">
          <h2 id="today" className={styles.sectionTitle}>
            Today’s weather
          </h2>
          <WeatherCard
            place={ASCHAFFENBURG.name}
            current={current}
            status={current ? 'success' : forecast.isError || forecast.data ? 'error' : 'pending'}
            onRetry={() => void forecast.refetch()}
          />
        </section>

        <section className={styles.tasks} aria-labelledby="choose">
          <h2 id="choose" className={styles.sectionTitle}>
            Choose your task
          </h2>
          <ul className={styles.taskList}>
            {TASK_IDS.map((task) => (
              <li key={task}>
                <Link to={`/result/${task}`} className={styles.task} data-task={task}>
                  {TASK_LABELS[task]}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {!isDesktop && (
          <Link to="/thresholds" className={styles.thresholds}>
            Thresholds
            <Icon name="sliders" size={30} />
          </Link>
        )}
      </div>
      {!isDesktop && <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />}
    </AppShell>
  );
}
