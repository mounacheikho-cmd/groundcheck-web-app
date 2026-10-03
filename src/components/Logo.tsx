import { ASSETS } from '../assets';
import { useTheme } from '../context/ThemeContext';
import styles from './Logo.module.css';

/** The GroundCheck logo: the round landscape from Figma with the name curved above it. */
export function Logo({ width = 283.36, className }: { width?: number; className?: string }) {
  const { theme } = useTheme();
  const cx = 141.73;
  const cy = 175.12;
  const r = 138.4;
  const start = (-76 * Math.PI) / 180;
  const end = (76 * Math.PI) / 180;
  const arc = `M ${cx + r * Math.sin(start)} ${cy - r * Math.cos(start)} A ${r} ${r} 0 0 1 ${cx + r * Math.sin(end)} ${cy - r * Math.cos(end)}`;

  return (
    <svg
      className={`${styles.logo} ${className ?? ''}`}
      width={width}
      height={(width * 303) / 283.36}
      viewBox="0 0 283.36 303"
      role="img"
      aria-label="GroundCheck"
    >
      <image href={ASSETS.logo[theme]} x="13.83" y="47.24" width="255.8" height="255.76" preserveAspectRatio="none" />
      <path id="logo-arc" d={arc} fill="none" />
      {/* 50.4 %: in Figma the name is centred slightly right of the top */}
      <text className={styles.name}>
        <textPath href="#logo-arc" startOffset="50.4%" textAnchor="middle">
          GroundCheck
        </textPath>
      </text>
    </svg>
  );
}
