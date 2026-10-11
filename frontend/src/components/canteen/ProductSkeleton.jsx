function ProductSkeleton() {
  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-350 mx-auto animate-pulse mt-[8%]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="h-6 sm:h-7 w-32 sm:w-36 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
          <div className="h-3.5 sm:h-4 w-48 sm:w-56 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
        </div>
        <div className="h-9 sm:h-10 w-full sm:w-40 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
      </div>

      <div className="bg-white dark:bg-[#1E1F21] border border-gray-200 dark:border-[#2E3035] rounded-lg shadow-xs overflow-hidden">
        <div className="p-3 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 dark:border-[#2E3035]">
          <div className="h-9 w-full md:max-w-md bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="h-9 flex-1 md:w-36 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
            <div className="h-9 w-9 bg-gray-200 dark:bg-[#2A2D32] rounded-md shrink-0" />
            <div className="hidden sm:block h-9 w-16 bg-gray-200 dark:bg-[#2A2D32] rounded-md shrink-0" />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-170">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#26272B]">
                <th className="py-3 px-4 sm:px-6 w-20">
                  <div className="h-4 w-10 bg-gray-300 dark:bg-[#33353A] rounded" />
                </th>
                <th className="py-3 px-4 sm:px-6">
                  <div className="h-4 w-28 bg-gray-300 dark:bg-[#33353A] rounded" />
                </th>
                <th className="py-3 px-4 sm:px-6">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-[#33353A] rounded" />
                </th>
                <th className="py-3 px-4 sm:px-6">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-[#33353A] rounded" />
                </th>
                <th className="py-3 px-4 sm:px-6">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-[#33353A] rounded" />
                </th>
                <th className="py-3 px-4 sm:px-6 text-right">
                  <div className="h-4 w-12 bg-gray-300 dark:bg-[#33353A] rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2E3035]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 sm:px-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gray-200 dark:bg-[#2A2D32]" />
                  </td>
                  <td className="py-3 px-4 sm:px-6 space-y-2">
                    <div className="h-4 w-32 sm:w-44 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                  </td>
                  <td className="py-3 px-4 sm:px-6">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                  </td>
                  <td className="py-3 px-4 sm:px-6">
                    <div className="h-4 w-12 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                  </td>
                  <td className="py-3 px-4 sm:px-6">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right">
                    <div className="h-7 w-7 bg-gray-200 dark:bg-[#2A2D32] rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="p-3.5 rounded-lg border border-gray-200 dark:border-[#2E3035] bg-white dark:bg-[#1E1F21] flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-md bg-gray-200 dark:bg-[#2A2D32] shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                    <div className="h-4 w-12 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                  </div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="h-3.5 w-20 bg-gray-200 dark:bg-[#2A2D32] rounded" />
                    <div className="h-5 w-16 bg-gray-200 dark:bg-[#2A2D32] rounded-md" />
                  </div>
                </div>
              </div>
              <div className="pt-2.5 border-t border-gray-100 dark:border-[#2E3035] flex justify-end">
                <div className="h-7 w-16 bg-gray-200 dark:bg-[#2A2D32] rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-[#2E3035]">
          <div className="h-4 w-40 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          <div className="flex items-center gap-1.5">
            <div className="h-8 w-8 bg-gray-200 dark:bg-[#2A2D32] rounded" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-[#2A2D32] rounded" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-[#2A2D32] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSkeleton;
