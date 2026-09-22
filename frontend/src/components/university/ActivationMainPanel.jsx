import React from "react";
import {
  Send,
  Loader2,
  XCircle,
  CheckCircle2,
  Clock,
  Mail,
  ShieldAlert,
} from "lucide-react";

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12.011 1.001c-6.066 0-11 4.934-11 11 0 1.936.505 3.821 1.465 5.485L1.001 23l5.688-1.451A10.95 10.95 0 0012.01 23c6.066 0 11-4.934 11-11s-4.934-10.999-10.999-10.999zm0 20.083a9.042 9.042 0 01-4.615-1.26l-.33-.196-3.428.875.908-3.344-.216-.343a9.032 9.032 0 01-1.393-4.832c0-4.992 4.062-9.054 9.054-9.054 4.993 0 9.055 4.062 9.055 9.054 0 4.993-4.062 9.055-9.035 9.055zm4.962-6.782c-.272-.136-1.611-.795-1.86-.886-.249-.091-.43-.136-.612.136-.182.272-.703.886-.862 1.067-.159.181-.318.204-.59.068-.272-.136-1.15-.424-2.19-1.352-.81-.722-1.357-1.613-1.516-1.885-.159-.272-.017-.419.119-.554.122-.122.272-.318.408-.476.136-.159.182-.272.272-.453.091-.182.045-.341-.023-.476-.068-.136-.612-1.474-.839-2.018-.222-.531-.448-.458-.612-.466-.159-.008-.341-.008-.522-.008s-.476.068-.725.341c-.249.272-.953.931-.953 2.27 0 1.339.976 2.632 1.112 2.814.136.182 1.928 2.944 4.672 4.128.653.282 1.163.45 1.56.577.656.208 1.253.179 1.725.109.528-.079 1.611-.658 1.838-1.293.227-.635.227-1.18.159-1.293-.068-.113-.249-.181-.521-.317z" />
  </svg>
);

export default function ActivationMainPanel({
  status,
  currentRequest,
  actionLoading,
  onRequest,
  onCancel,
}) {
  const isPending = status === "pending" || status === "requested";
  const isActive = status === "approved" || status === "active";
  const isRejected = status === "rejected";

  const whatsappNumber = "+923064857953";
  const contactEmail = "saqeebhassan792@gmail.com";

  return (
    <div className="bg-white dark:bg-[#1E1F21] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl transition-colors duration-200">
      {/* Header & Direct Channels */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Activation Request Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Manage your account's verification state or directly contact
            administration.
          </p>
        </div>

        {/* Contact Shortcuts */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mr-1 hidden sm:inline">
            Direct Support:
          </span>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Hello, I have an inquiry regarding my account activation request.",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent(
              "Account Activation Inquiry",
            )}&body=${encodeURIComponent(
              "Hello Admin,\n\nI am reaching out regarding my activation request.",
            )}`}
            title="Send Email"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Dynamic Status Callout Banners */}
      {isPending && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Activation Request Pending Review
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Submitted on{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentRequest?.createdAt
                    ? new Date(currentRequest.createdAt).toLocaleDateString(
                        undefined,
                        { dateStyle: "medium" },
                      )
                    : "recently"}
                </span>
                . Central administration is reviewing your account setup.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={actionLoading}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>Withdraw Request</span>
          </button>
        </div>
      )}

      {isActive && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Account Activated & Verified
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Your institutional portal is active. You have access to
              administrative features, roster uploading, and canteen management
              tools.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
              Request Not Approved
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Your previous request was not approved. You can submit a new
              request below or reach out directly to system administrators for
              details.
            </p>
          </div>
        </div>
      )}

      {/* Main Request Form & Information Card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isPending && !isActive) onRequest();
        }}
        className="space-y-6"
      >
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
            Verification Information
          </p>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            By submitting an activation request, your university administrator
            account will be flagged for priority manual review. Once approved,
            all system features will unlock immediately.
          </p>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isPending || isActive || actionLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#167CC2] hover:bg-[#167CC2]/90 text-white font-extrabold text-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Submit Activation Request</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
