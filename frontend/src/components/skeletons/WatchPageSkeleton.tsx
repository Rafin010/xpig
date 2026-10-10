import { Skeleton } from '../ui/Skeleton';
import VideoCardSkeleton from './VideoCardSkeleton';

export default function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-black md:px-8 pb-20 pt-4 md:pt-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
        <div className="lg:col-span-2 px-4 md:px-0">
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          <div className="mt-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
          <Skeleton className="mt-6 h-24 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0 px-4 md:px-0 hidden lg:block">
          <Skeleton className="w-full h-64 rounded-xl" />
          <Skeleton className="w-full h-40 rounded-xl" />
          <Skeleton className="w-full h-32 rounded-xl" />
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 md:px-0 mt-12 mb-8">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6">
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
        </div>
      </div>
    </div>
  )
}
