/**
 * Shared UI primitives. Every consumer should import from here so we can
 * evolve the component library without rewriting call sites.
 *
 * Existing primitives that already lived elsewhere:
 *  - <Pager>      → ../Pager
 *  - <Skeleton>, <SkeletonRows> → ../Skeleton
 *  - <ErrorBoundary> → ../ErrorBoundary
 *  - useToast()   → ../../contexts/ToastContext
 */
export { Button } from './Button';
export { Card, CardHeader } from './Card';
export { Badge } from './Badge';
export { Input, Textarea } from './Input';
export type { InputProps, TextareaProps } from './Input';
export { EmptyState } from './EmptyState';
