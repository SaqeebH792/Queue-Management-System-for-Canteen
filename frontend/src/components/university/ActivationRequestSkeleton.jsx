const ActivationRequestSkeleton = () => {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-full sm:w-96 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3.5 w-64 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          <div className="space-y-4 py-4">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>

          <div className="pt-4 flex justify-end">
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                </div>
                <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationRequestSkeleton;
