import { Skeleton } from '../ui/Skeleton';

export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[16/9] rounded-lg" />
      <div className="flex gap-3 mt-1 px-1">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 w-full pt-1">
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[60%]" />
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
