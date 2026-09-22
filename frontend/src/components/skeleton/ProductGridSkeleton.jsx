// components/skeleton/ProductGridSkeleton.jsx
import React from "react";

export function ProductGridSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="bg-[#FBECE5] dark:bg-[#1E1F21] rounded-3xl p-4 border border-[#E0BBAA] dark:border-[#2E3035] space-y-4 shadow-xs"
          >
            <div className="w-full h-48 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-2xl" />
            <div className="space-y-2">
              <div className="h-5 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-lg w-3/4" />
              <div className="h-4 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-lg w-1/2" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#E0BBAA]/60 dark:border-[#2E3035]">
              <div className="h-6 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-lg w-20" />
              <div className="h-9 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-full w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between bg-[#FBECE5] dark:bg-[#1E1F21] p-4 rounded-2xl border border-[#E0BBAA] dark:border-[#2E3035]">
        <div className="h-8 w-24 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-xl" />
        <div className="h-7 w-20 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-xl" />
        <div className="h-8 w-24 bg-[#EBC8B8] dark:bg-[#2A2D32] rounded-xl" />
      </div>
    </div>
  );
}

export default ProductGridSkeleton;
