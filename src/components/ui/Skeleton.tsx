interface SkeletonProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-[#1a1a24] animate-pulse rounded-xl ${className}`} />
  );
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-[#1a1a24] animate-pulse rounded h-4 ${className}`} />
  );
}

export function SkeletonCircle({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-[#1a1a24] animate-pulse rounded-full ${className}`} />
  );
}
