import { startTransition, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';
import styles from './Menu.module.css';

/** Only items that work are listed; Change name, Location, Help and Delete account come later. */
function MenuItems({ variant, onNavigate }: { variant: 'drawer' | 'sidebar'; onNavigate?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const itemClass = ({ isActive }: { isActive: boolean }) => `${styles.item} ${isActive ? styles.active : ''}`;

  return (
    <ul className={styles.list} data-variant={variant}>
      {variant === 'sidebar' && (
        <li>
          <NavLink to="/home" className={itemClass} onClick={onNavigate}>
            <Icon name="home" size={18} />
            Home screen
          </NavLink>
        </li>
      )}
      <li>
        <NavLink to="/thresholds" className={itemClass} onClick={onNavigate}>
          <Icon name="sliders" size={variant === 'sidebar' ? 18 : 20} />
          Edit thresholds
        </NavLink>
      </li>
      <li>
        <button type="button" className={styles.item} onClick={toggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={variant === 'sidebar' ? 18 : 20} />
          {variant === 'sidebar'
            ? theme === 'dark'
              ? 'Light mode'
              : 'Dark mode'
            : theme === 'dark'
              ? 'Switch to light mode'
              : 'Change to dark mode'}
        </button>
      </li>
      <li>
        <button
          type="button"
          className={styles.item}
          onClick={() => {
            // Same transition as the navigation, so the protected page doesn't redirect to Log in first
            startTransition(signOut);
            onNavigate?.();
            navigate('/');
          }}
        >
          <Icon name="logOut" size={variant === 'sidebar' ? 18 : 20} />
          Sign out
        </button>
      </li>
    </ul>
  );
}

export function Sidebar({ tone = 'default' }: { tone?: 'default' | 'sky' }) {
  return (
    <nav className={styles.sidebar} data-tone={tone} aria-label="Main">
      <MenuItems variant="sidebar" />
    </nav>
  );
}

/** Mobile menu: a native modal dialog, so focus is trapped and Escape closes it. */
export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-label="Menu"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={onClose}>
          <Icon name="arrowLeft" size={30} strokeWidth={1.6} title="Close menu" />
        </button>
        <MenuItems variant="drawer" onNavigate={onClose} />
      </div>
    </dialog>
  );
}
