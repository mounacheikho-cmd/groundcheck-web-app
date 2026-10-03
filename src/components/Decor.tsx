import type { CSSProperties } from 'react';
import { ASSETS, EXPORT_PADDING, type AssetName } from '../assets';
import { useTheme } from '../context/ThemeContext';
import styles from './Decor.module.css';

/** One illustration layer, positioned with its box from the Figma frame (in px). */
export interface Layer {
  asset: AssetName;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Measure `y` from the bottom of the frame instead of the top. */
  fromBottom?: boolean;
  rotate?: number;
  opacity?: number;
  /** Extra CSS filter from Figma (e.g. a drop shadow on the whole group). */
  filter?: string;
}

interface DecorProps {
  layers: Layer[];
  /** Frame size the coordinates come from: 390 × 844 (mobile) or 1280 × 832 (desktop). */
  frame: { width: number; height: number };
  /** Mobile frames are centred horizontally; desktop frames start at the left edge of the centred design. */
  align?: 'center' | 'left';
  className?: string;
}

function boxStyle(layer: Layer, frameHeight: number): CSSProperties {
  const [t, r, b, l] = EXPORT_PADDING[layer.asset] ?? [0, 0, 0, 0];
  const width = layer.w * (1 + l + r);
  const height = layer.h * (1 + t + b);
  const left = layer.x - layer.w * l;
  const top = layer.y - layer.h * t;
  const style: CSSProperties = { left, width, height, opacity: layer.opacity, filter: layer.filter };
  if (layer.fromBottom) style.bottom = frameHeight - (top + height);
  else style.top = top;
  if (layer.rotate) style.transform = `rotate(${layer.rotate}deg)`;
  return style;
}

/**
 * Decorative background made of Figma illustrations. Hidden from assistive technology.
 * Content is laid out separately with normal CSS so it stays responsive and accessible.
 */
export function Decor({ layers, frame, align = 'center', className }: DecorProps) {
  const { theme } = useTheme();
  return (
    <div className={`${styles.decor} ${className ?? ''}`} aria-hidden="true">
      <div
        className={styles.frame}
        data-align={align}
        style={{ width: frame.width, '--frame-width': `${frame.width}px` } as CSSProperties}
      >
        {layers.map((layer, i) => (
          <img
            key={`${layer.asset}-${i}`}
            className={styles.layer}
            src={ASSETS[layer.asset][theme]}
            alt=""
            style={boxStyle(layer, frame.height)}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
