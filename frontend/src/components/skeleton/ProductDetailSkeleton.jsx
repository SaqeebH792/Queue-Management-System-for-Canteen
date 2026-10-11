const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans animate-pulse">
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="h-4 w-32 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-4/3 w-full bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-2xl border border-[#F9F3F1]/40 dark:border-[#2B2D30]/40" />
            <div className="flex items-center gap-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-24 h-24 rounded-xl bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md shrink-0 border border-[#F9F3F1]/40 dark:border-[#2B2D30]/40"
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-lg" />
              <div className="h-4 w-1/2 bg-[#F9F3F1]/50 dark:bg-[#2B2D30]/40 backdrop-blur-md rounded-md" />
            </div>

            <div className="h-10 w-32 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-lg" />

            <div className="space-y-2 border-t border-[#F9F3F1] dark:border-[#2B2D30]/60 pt-4">
              <div className="h-4 w-24 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-md" />
              <div className="h-3.5 w-full bg-[#F9F3F1]/50 dark:bg-[#2B2D30]/40 backdrop-blur-md rounded" />
              <div className="h-3.5 w-5/6 bg-[#F9F3F1]/50 dark:bg-[#2B2D30]/40 backdrop-blur-md rounded" />
              <div className="h-3.5 w-2/3 bg-[#F9F3F1]/50 dark:bg-[#2B2D30]/40 backdrop-blur-md rounded" />
            </div>

            <div className="flex gap-2">
              <div className="h-6 w-24 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-md" />
              <div className="h-6 w-28 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 backdrop-blur-md rounded-md" />
            </div>

            <div className="border border-[#F9F3F1] dark:border-[#2B2D30]/80 rounded-xl p-4 bg-[#F9F3F1]/30 dark:bg-[#2B2D30]/30 backdrop-blur-md space-y-4">
              <div className="h-4 w-40 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 rounded" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-1 text-center">
                    <div className="h-6 w-12 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 rounded mx-auto" />
                    <div className="h-3 w-8 bg-[#F9F3F1]/50 dark:bg-[#2B2D30]/40 rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border border-[#F9F3F1] dark:border-[#2B2D30]/80 rounded-xl bg-[#F9F3F1]/30 dark:bg-[#2B2D30]/30 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-9 w-28 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 rounded-lg" />
                <div className="h-5 w-20 bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 rounded" />
              </div>
              <div className="h-11 w-full bg-[#F9F3F1]/80 dark:bg-[#2B2D30]/60 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailSkeleton;
