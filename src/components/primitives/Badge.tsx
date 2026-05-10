import { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-white/10 text-white/80 border-white/20',
  info:    'bg-blue-500/20 text-blue-200 border-blue-500/30',
  success: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  warning: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  danger:  'bg-red-500/20 text-red-200 border-red-500/30',
  brand:   'bg-brand-500/20 text-brand-200 border-brand-500/30',
};

/**
 * Inline status pill. Replaces ~10 ad-hoc spans that hardcoded colour
 * classes for status / priority labels.
 */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className = '', children, ...props }) => (
  <span
    className={[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      TONE_CLASSES[tone],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </span>
);
