import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

/** Figma "button dark" (primary) and "button light" (secondary). */
export function Button({
  variant = 'primary',
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', className, children, ...rest }: CommonProps & LinkProps) {
  return (
    <Link className={`${styles.button} ${styles[variant]} ${className ?? ''}`} {...rest}>
      {children}
    </Link>
  );
}
