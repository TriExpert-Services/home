import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl',
  secondary:
    'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20',
  ghost:
    'bg-transparent hover:bg-white/10 text-white/80 hover:text-white',
  outline:
    'bg-transparent border-2 border-white/30 hover:border-white/60 text-white',
  destructive:
    'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2',
};

const ICON_SIZE: Record<Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * Single source of truth for buttons across the app.
 * Replaces ~50 inline style implementations that varied in radius,
 * padding and disabled state.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold rounded-xl',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className={`${ICON_SIZE[size]} animate-spin`} aria-hidden="true" />
        ) : (
          leftIcon && <span className={`${ICON_SIZE[size]} flex items-center`}>{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className={`${ICON_SIZE[size]} flex items-center`}>{rightIcon}</span>}
      </button>
    );
  },
);
Button.displayName = 'Button';
