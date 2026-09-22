import React, { useState } from "react";
import {
  SlidersHorizontal,
  Calendar,
  History,
  ArrowUpDown,
} from "lucide-react";

export default function RequestsHistory({ history = [] }) {
  const [sortOrder, setSortOrder] = useState("desc");

  // Toggle sort order between newest and oldest first
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "in_review":
      case "requested":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            • IN REVIEW
          </span>
        );
      case "approved":
      case "active":
      case "activated":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            • ACTIVATED
          </span>
        );
      case "cancelled":
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            • {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            • {status ? status.toUpperCase() : "REQUESTED"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1F21] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl transition-colors duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activity Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Audit history of your activation requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          title={`Sort ${sortOrder === "desc" ? "Oldest First" : "Newest First"}`}
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {sortedHistory.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/30">
            <History className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
              No activation history recorded yet.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              Submitted account requests will automatically log here.
            </p>
          </div>
        ) : (
          sortedHistory.map((req, idx) => {
            const reqId = req._id
              ? `REQ-${req._id.substring(req._id.length - 6).toUpperCase()}`
              : `REQ-00${idx + 1}`;

            const formattedDate = req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A";

            return (
              <div
                key={req._id || idx}
                className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-3 transition-colors hover:border-slate-300 dark:hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500">
                    {reqId}
                  </span>
                  {getStatusBadge(req.status)}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Main Institutional Portal
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Account Verification Request
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
