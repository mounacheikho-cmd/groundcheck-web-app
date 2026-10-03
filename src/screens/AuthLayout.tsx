import type { ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { Decor, type Layer } from '../components/Decor';
import { useIsDesktop } from '../components/useMediaQuery';
import styles from './AuthLayout.module.css';

const SCENES: Record<'login' | 'signup', { mobile: Layer[]; desktop: Layer[] }> = {
  login: {
    mobile: [
      { asset: 'mountains', x: -141, y: 227, w: 727.337, h: 307 },
      { asset: 'titleGlow', x: -8, y: 361.59, w: 275, h: 65.4 },
      { asset: 'sun', x: 63, y: -96, w: 264, h: 264 },
    ],
    desktop: [
      { asset: 'mountains', x: -318, y: 210, w: 1644.2, h: 694, fromBottom: true },
      { asset: 'sun', x: 837, y: -249, w: 554, h: 554 },
    ],
  },
  signup: {
    mobile: [
      { asset: 'cloud', x: -89, y: 96, w: 259, h: 167 },
      { asset: 'sun', x: 174, y: -55, w: 264, h: 264 },
      { asset: 'cloud', x: 256, y: 174, w: 225, h: 145.08 },
    ],
    desktop: [
      { asset: 'sun', x: 837, y: -249, w: 554, h: 554 },
      { asset: 'cloud', x: -253, y: 208, w: 643.6, h: 415 },
      { asset: 'cloud', x: 404, y: 521, w: 487.6, h: 314.4 },
      { asset: 'cloud', x: 147, y: -217, w: 473, h: 305 },
      { asset: 'cloud', x: 1014, y: 192, w: 487.6, h: 314.4 },
    ],
  },
};

interface AuthLayoutProps {
  variant: 'login' | 'signup';
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared layout of the Log in and Sign up screens (Figma 43:546, 43:478 and their desktop frames). */
export function AuthLayout({ variant, title, subtitle, children, footer }: AuthLayoutProps) {
  const isDesktop = useIsDesktop();
  const scene = SCENES[variant];
  return (
    <main className={styles.screen} data-variant={variant}>
      <Decor
        layers={isDesktop ? scene.desktop : scene.mobile}
        frame={isDesktop ? { width: 1280, height: 832 } : { width: 390, height: 844 }}
        align={isDesktop ? 'left' : 'center'}
      />
      <div className={styles.layout}>
        <BackButton to="/" label="Back to start" className={styles.back} />
        <header className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        <div className={styles.panel}>
          {children}
          <div className={styles.footer}>{footer}</div>
        </div>
      </div>
    </main>
  );
}
