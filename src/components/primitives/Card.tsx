import { HTMLAttributes, forwardRef, ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds `hover:bg-white/15` for clickable cards. Defaults to false. */
  interactive?: boolean;
  /** Internal padding token. `md` (1.5rem) matches existing components. */
  padding?: Padding;
}

const PADDING_CLASSES: Record<Padding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

/**
 * Glassmorphic surface used throughout the marketing site and admin panel.
 * Centralises radius, blur, border and background opacity so the look stays
 * consistent (and so Bloque G can introduce a light-theme equivalent in
 * one place).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, padding = 'md', className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20',
        PADDING_CLASSES[padding],
        interactive ? 'transition-colors hover:bg-white/15 cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, icon, action }) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div className="flex items-start gap-3">
      {icon && <div className="text-white/60 mt-0.5">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);
