const UniversityDashboardSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="h-6 sm:h-7 w-48 sm:w-56 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-3.5 sm:h-4 w-64 sm:w-80 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 sm:w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0" />
            </div>
            <div className="h-7 sm:h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3 w-32 sm:w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="h-9 w-full sm:w-72 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="h-9 w-full sm:w-32 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800/60 rounded-xl shrink-0" />
          </div>
        </div>

        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/40">
          {[1, 2, 3, 4, 5].map(row => (
            <div key={row} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="space-y-1.5 pl-6">
                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/60 rounded" />
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
              </div>
              <div className="flex items-center justify-between pl-6 pt-1">
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60">
                <th className="p-4 w-10 text-center">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                </th>
                <th className="p-4">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </th>
                <th className="p-4">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </th>
                <th className="p-4">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                </th>
                <th className="p-4">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </th>
                <th className="p-4">
                  <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                </th>
                <th className="p-4">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </th>
                <th className="p-4 text-right">
                  <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {[1, 2, 3, 4, 5].map(row => (
                <tr key={row}>
                  <td className="p-4 text-center">
                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  </td>
                  <td className="p-4 space-y-2">
                    <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  </td>
                  <td className="p-4 space-y-1.5">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded order-2 sm:order-1" />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboardSkeleton;
