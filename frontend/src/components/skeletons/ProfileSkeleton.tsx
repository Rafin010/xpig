import { Skeleton } from '../ui/Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen pb-20">
      <Skeleton className="h-48 md:h-64 w-full rounded-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-24 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-black" />
          <div className="flex-1 pb-4 flex flex-col items-center sm:items-start w-full">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="w-32 h-10 rounded-full mb-4" />
        </div>
      </div>
    </div>
  )
}
