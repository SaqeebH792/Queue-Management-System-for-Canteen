export const DashboardHeaderSkeleton = () => {
  return (
    <div className="w-full animate-pulse space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-36 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full" />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="h-11 flex-1 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-11 w-full sm:w-40 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
};

export const OrderCardSkeleton = () => {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-zinc-800">
      <td className="py-4 px-6">
        <div className="h-4 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
      </td>

      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-zinc-800 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-36 bg-slate-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="space-y-1.5">
          <div className="h-4 w-44 bg-slate-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="h-4 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
      </td>

      <td className="py-4 px-6">
        <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full" />
      </td>

      <td className="py-4 px-6 text-right">
        <div className="flex justify-end">
          <div className="h-8 w-24 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        </div>
      </td>
    </tr>
  );
};

export default OrderCardSkeleton;
