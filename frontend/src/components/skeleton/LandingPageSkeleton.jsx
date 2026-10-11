import { HeroSkeleton } from "./HeroSkeleton";
import ProductGridSkeleton from "./ProductGridSkeleton";

export default function LandingPageSkeleton() {
  return (
    <div className="min-h-screen text-[#2C1810] dark:text-[#E8E8E8] pt-18">
      <HeroSkeleton />

      <section className="max-w-7xl mx-auto px-6 py-12 space-y-8 ">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-[#2B2D30] rounded-xl w-48 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-[#2B2D30] rounded-lg w-64 animate-pulse" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 bg-slate-200 dark:bg-[#2B2D30] rounded-full shrink-0 animate-pulse"
            />
          ))}
        </div>

        <ProductGridSkeleton />
      </section>
    </div>
  );
}
