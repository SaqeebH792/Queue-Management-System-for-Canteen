import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import axios from "../../api/axiosInstance";

import ActivationMainPanel from "../../components/university/ActivationMainPanel";
import ActivationHistory from "../../components/university/RequestsHistory";
import ActivationRequestSkeleton from "../../components/university/ActivationRequestSkeleton";

import { ShieldCheck, Clock, History, RotateCw } from "lucide-react";

function ActivationRequest() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState({
    status: "not_requested",
    currentRequest: null,
    history: [],
  });

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStatus = useCallback(async (showToastNotice = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const res = await axios.get("users/activation-request", {
        signal: abortControllerRef.current.signal,
      });

      if (!isMountedRef.current) return;

      const payload = res?.data?.data || {};

      if (payload.history) {
        setData(payload);
      } else {
        setData({
          status: payload.status || "not_requested",
          currentRequest: payload.request || null,
          history: payload.request ? [payload.request] : [],
        });
      }

      if (showToastNotice) {
        toast.success("Activation status refreshed");
      }
    } catch (err) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.error("Error fetching activation status:", err);
      if (isMountedRef.current) {
        toast.error(err?.response?.data?.message || "Failed to load activation status");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStatus]);

  const requestActivation = async () => {
    try {
      setActionLoading(true);
      await axios.post("users/activation-request");
      toast.success("Activation request submitted successfully!");
      await fetchStatus();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request.");
    } finally {
      if (isMountedRef.current) {
        setActionLoading(false);
      }
    }
  };

  const cancelRequest = async () => {
    try {
      setActionLoading(true);
      await axios.patch("users/activation-request/cancel");
      toast.info("Activation request cancelled.");
      await fetchStatus();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel request.");
    } finally {
      if (isMountedRef.current) {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return <ActivationRequestSkeleton />;
  }

  const totalRequests = data.history?.length || 0;
  const isPending = data.status === "pending" || data.status === "requested";
  const isApproved = data.status === "active" || data.status === "approved";

  return (
    <>
      <Helmet>
        <title>Account Activation | Admin Portal</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Account Activation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:bg-[#D2F535]/10 dark:text-[#D2F535] border border-emerald-500/20 dark:border-[#D2F535]/20">
                Portal Verification
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Submit administrative activation requests to unlock full platform capabilities, manage
              canteen staff limits, and access advanced dashboard metrics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchStatus(true)}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-full transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RotateCw size={13} className={actionLoading ? "animate-spin" : ""} />
            Refresh Status
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1E1F21] border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm dark:shadow-xl transition-colors">
            <div className="p-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-600 dark:text-zinc-300">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Current Status
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white capitalize mt-0.5">
                {data.status.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1F21] border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm dark:shadow-xl transition-colors">
            <div
              className={`p-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl ${
                isPending
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-400 dark:text-zinc-400"
              }`}
            >
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Active Queue
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {isPending ? "Under Review" : isApproved ? "Fully Verified" : "Idle"}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1F21] border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm dark:shadow-xl transition-colors">
            <div className="p-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-emerald-600 dark:text-[#D2F535]">
              <History size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Submission Logs
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {totalRequests} {totalRequests === 1 ? "Record" : "Records"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <ActivationMainPanel
              status={data.status}
              currentRequest={data.currentRequest}
              actionLoading={actionLoading}
              onRequest={requestActivation}
              onCancel={cancelRequest}
            />
          </div>
          <div className="lg:col-span-4">
            <ActivationHistory history={data.history} />
          </div>
        </div>
      </div>
    </>
  );
}
export default ActivationRequest;
