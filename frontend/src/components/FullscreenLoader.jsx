import React from "react";
import { Loader2 } from "lucide-react";

export default function FullscreenLoader({ label = "Verifying session..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F17] transition-colors duration-300 select-none overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Center Card Container */}
      <div className="relative flex flex-col items-center p-8 rounded-3xl bg-white/40 dark:bg-[#131926]/40 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 max-w-xs w-full mx-4">
        {/* Animated Multi-Ring Spinner */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-5">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 dark:border-indigo-400/20 animate-ping opacity-75" />

          {/* Inner static border track */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-800" />

          {/* Rotating gradient spinner icon */}
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>

        {/* Text Details */}
        <div className="text-center space-y-1.5">
          <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
            {label}
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
            Please wait a moment
          </p>
        </div>

        {/* Bottom Indeterminate Progress Bar */}
        <div className="w-full h-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full animate-progress-slide" />
        </div>
      </div>
    </div>
  );
}
