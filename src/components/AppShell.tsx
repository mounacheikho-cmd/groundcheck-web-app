import type { ReactNode } from 'react';
import { Sidebar } from './Menu';
import { useIsDesktop } from './useMediaQuery';
import styles from './AppShell.module.css';

/** Signed-in screens: content plus the orange sidebar from the desktop frames. */
export function AppShell({
  children,
  className,
  sidebarTone = 'default',
}: {
  children: ReactNode;
  className?: string;
  sidebarTone?: 'default' | 'sky';
}) {
  const isDesktop = useIsDesktop();
  return (
    <div className={`${styles.shell} ${className ?? ''}`}>
      <main className={styles.main}>{children}</main>
      {isDesktop && <Sidebar tone={sidebarTone} />}
    </div>
  );
}
