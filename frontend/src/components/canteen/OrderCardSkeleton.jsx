export const DashboardHeaderSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Title & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          {/* Active Orders Heading Skeleton */}
          <div className="h-8 w-48 bg-gray-200 dark:bg-[#2A2D32] rounded-lg mb-2" />
          {/* Subtitle Skeleton */}
          <div className="h-4 w-64 bg-gray-200 dark:bg-[#2A2D32] rounded" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-200 dark:bg-[#2A2D32] rounded-lg" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-[#2A2D32] rounded-lg" />
        </div>
      </div>

      {/* Search Bar & Filter Dropdown Skeleton */}
      <div className="mb-6 flex gap-2">
        <div className="h-10 flex-1 bg-gray-200 dark:bg-[#2A2D32] rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-[#2A2D32] rounded-lg" />
      </div>
    </div>
  );
};

export const OrderCardSkeleton = () => {
  return (
    <div className="border border-gray-200 dark:border-[#2E3035] border-l-4 border-l-gray-300 dark:border-l-[#3A3D44] rounded-xl p-5 shadow-sm bg-white dark:bg-[#1E1F21] flex flex-col justify-between h-75 animate-pulse">
      <div>
        {/* Header: Order ID & Badge Skeleton */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-16 bg-gray-200 dark:bg-[#2A2D32] rounded" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
        </div>

        {/* Customer / Student Information Skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#2A2D32] rounded" />
        </div>

        {/* Item Summary List Skeleton */}
        <div className="space-y-3 border-t border-gray-100 dark:border-[#2E3035] pt-3 mb-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-[#2A2D32] rounded" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-[#2A2D32] rounded" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="pt-3 border-t border-gray-100 dark:border-[#2E3035] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-[#2A2D32] rounded" />
        </div>
        <div className="h-10 w-full bg-gray-200 dark:bg-[#2A2D32] rounded-lg" />
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
