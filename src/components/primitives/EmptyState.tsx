import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional Lucide icon component or any node. Defaults to Inbox. */
  icon?: ReactNode;
  /** A primary call-to-action — usually a `<Button>`. */
  action?: ReactNode;
  className?: string;
}

/**
 * Lonely-looking lists shouldn't say "0" with no context. Use this in
 * place of bare empty divs in admin tables (no leads yet, no reviews,
 * etc.) and on public pages when a search yields nothing.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => (
  <div
    className={[
      'flex flex-col items-center justify-center text-center py-12 px-6',
      'bg-white/5 border border-white/10 rounded-2xl',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 mb-4">
      {icon ?? <Inbox className="w-6 h-6" />}
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {description && (
      <p className="text-white/60 text-sm mt-1 max-w-sm">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
