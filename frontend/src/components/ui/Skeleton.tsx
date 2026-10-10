export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`animate-pulse rounded-md bg-[#1f1f1f] ${className}`} {...props} />
  )
}
