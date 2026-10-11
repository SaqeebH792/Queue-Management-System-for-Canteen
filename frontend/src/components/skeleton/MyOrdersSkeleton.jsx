export const ActiveOrderSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-6 border border-slate-100 dark:border-zinc-800 animate-pulse">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="h-6 w-44 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-36 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="h-7 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 w-28 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
          <div className="h-4 w-14 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="flex justify-between">
          <div className="h-3 w-14 bg-slate-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-14 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        </div>
        <div className="w-full h-2 bg-[#F3F4F6] dark:bg-zinc-800 rounded-full" />
      </div>
    </div>
  );
};

export const PastOrderSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs border border-slate-100 dark:border-zinc-800 animate-pulse">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        </div>

        <div className="h-5 w-36 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-3 w-16 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
      </div>

      <div className="flex items-center justify-between gap-2 border-t pt-3 border-zinc-100 dark:border-zinc-800">
        <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full" />
        <div className="h-7 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full" />
      </div>
    </div>
  );
};

export const MyOrdersSkeleton = () => {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <ActiveOrderSkeleton />
      </section>

      <section className="space-y-4">
        <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PastOrderSkeleton />
          <PastOrderSkeleton />
          <PastOrderSkeleton />
        </div>
      </section>
    </div>
  );
};

export default MyOrdersSkeleton;
