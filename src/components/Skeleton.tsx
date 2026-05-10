interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`bg-white/10 rounded-lg animate-pulse ${className}`}
    aria-hidden="true"
  />
);

interface SkeletonRowsProps {
  rows?: number;
  rowClassName?: string;
}

export const SkeletonRows: React.FC<SkeletonRowsProps> = ({
  rows = 4,
  rowClassName = 'h-16 w-full',
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={rowClassName} />
    ))}
  </div>
);
