import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  ReactNode,
  useId,
} from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  /** Optional icon shown inside the input on the left. */
  leftIcon?: ReactNode;
  /** Optional element shown inside on the right (e.g. password toggle). */
  rightSlot?: ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {}

const fieldClasses = (hasError: boolean) =>
  [
    'w-full bg-white/10 border rounded-xl text-white placeholder-white/40',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:border-transparent',
    'transition-colors',
    hasError ? 'border-red-500/60' : 'border-white/20',
  ].join(' ');

/**
 * Standard text input with a label, hint and inline error.
 * Replaces hand-rolled input markup spread across Contact, Translation
 * and admin forms — picks up the same focus ring, padding and error
 * styling everywhere.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightSlot, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={[
              fieldClasses(Boolean(error)),
              leftIcon ? 'pl-10' : 'pl-4',
              rightSlot ? 'pr-10' : 'pr-4',
              'py-3',
            ].join(' ')}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="text-white/50 text-xs mt-1.5">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-red-300 text-xs mt-1.5" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[fieldClasses(Boolean(error)), 'px-4 py-3 resize-none'].join(' ')}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-white/50 text-xs mt-1.5">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-red-300 text-xs mt-1.5" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
