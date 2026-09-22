export function HeroSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-pulse">
      {/* Text Content Skeleton */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-12 bg-slate-200 dark:bg-[#2B2D30] rounded-2xl w-4/5" />
          <div className="h-12 bg-slate-200 dark:bg-[#2B2D30] rounded-2xl w-3/5" />
        </div>
        <div className="space-y-2 max-w-md">
          <div className="h-4 bg-slate-200 dark:bg-[#2B2D30] rounded-lg w-full" />
          <div className="h-4 bg-slate-200 dark:bg-[#2B2D30] rounded-lg w-11/12" />
          <div className="h-4 bg-slate-200 dark:bg-[#2B2D30] rounded-lg w-4/5" />
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-12 w-36 bg-slate-200 dark:bg-[#2B2D30] rounded-full" />
          <div className="h-12 w-44 bg-slate-200 dark:bg-[#2B2D30] rounded-full" />
        </div>
      </div>

      {/* Hero Image Skeleton */}
      <div className="relative">
        <div className="w-full h-95 sm:h-115 bg-slate-200 dark:bg-[#2B2D30] rounded-3xl" />
      </div>
    </section>
  );
}
