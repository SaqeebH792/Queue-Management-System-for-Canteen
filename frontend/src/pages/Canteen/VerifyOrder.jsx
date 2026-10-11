import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  RotateCcw,
  KeyRound,
  ScanLine,
  X,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

import axiosInstance from "../../api/axiosInstance";

function VerifyOrder() {
  const readerRef = useRef(null);
  const scannerRef = useRef(null);

  const isProcessingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const mountedRef = useRef(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [token, setToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState("");
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  const loadingRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner || isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;

    try {
      const state = scanner.getState();

      if (state === 2) {
        await scanner.stop();
      }

      scanner.clear();
    } catch (error) {
      console.warn("Scanner cleanup warning:", error?.message || error);
    } finally {
      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }

      isStoppingRef.current = false;
    }
  }, []);

  const clearVerificationState = useCallback(() => {
    if (!mountedRef.current) return;

    setSuccess(null);
    setMessage("");
    setVerifiedOrder(null);
  }, []);

  const verifyOrder = useCallback(async payload => {
    if (!payload?.qrData && !payload?.token) {
      const errorMessage = "Pickup token or QR code payload is required.";
      setSuccess(false);
      setMessage(errorMessage);
      toast.error(errorMessage);
      return false;
    }

    if (loadingRef.current) {
      return false;
    }

    loadingRef.current = true;
    setLoading(true);
    setSuccess(null);
    setMessage("");
    setVerifiedOrder(null);

    try {
      const response = await axiosInstance.post("/users/scanQR", payload);
      const responseData = response?.data;

      const successMessage = responseData?.message || "Order delivered successfully.";
      const order = responseData?.data?.order || null;

      setSuccess(true);
      setMessage(successMessage);
      setVerifiedOrder(order);

      setToken("");
      toast.success(successMessage);

      return true;
    } catch (error) {
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message || "Failed to verify order.";

      setSuccess(false);
      setMessage(errorMessage);
      setVerifiedOrder(null);

      if (statusCode === 400) {
        toast.error(errorMessage);
      } else if (statusCode === 401 || statusCode === 403) {
        toast.error("You are not authorized to verify this order.");
      } else {
        toast.error("Something went wrong while verifying the order.");
      }

      return false;
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleQrResult = useCallback(
    async decodedText => {
      if (isProcessingRef.current || loadingRef.current || !mountedRef.current) {
        return;
      }

      isProcessingRef.current = true;

      try {
        await stopScanner();

        if (!mountedRef.current) return;

        setCameraOpen(false);
        await verifyOrder({
          qrData: decodedText,
        });
      } catch (error) {
        console.error("QR processing error:", error);

        if (!mountedRef.current) return;

        const errorMessage = error?.message || "Unable to read this QR code.";
        setSuccess(false);
        setMessage(errorMessage);
        setVerifiedOrder(null);

        toast.error(errorMessage);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [stopScanner, verifyOrder]
  );

  const startScanner = useCallback(async () => {
    const readerElement = readerRef.current;

    if (!readerElement || !mountedRef.current || scannerRef.current) {
      return;
    }

    isProcessingRef.current = false;
    const scanner = new Html5Qrcode(readerElement.id);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        async decodedText => {
          if (!mountedRef.current) return;
          await handleQrResult(decodedText);
        },
        () => {}
      );
    } catch (error) {
      console.error("Camera access error:", error);

      if (mountedRef.current) {
        setCameraOpen(false);
        setSuccess(false);
        setMessage("Unable to access the camera. Please allow camera permission and try again.");
        toast.error("Unable to access camera. Please check camera permissions.");
      }

      await stopScanner();
    }
  }, [handleQrResult, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;

    const initializeScanner = async () => {
      if (cancelled || !mountedRef.current) return;

      await new Promise(resolve => requestAnimationFrame(resolve));

      if (cancelled || !mountedRef.current) return;

      await startScanner();
    };

    initializeScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [cameraOpen, startScanner, stopScanner]);

  const handleOpenCamera = () => {
    if (loading) return;
    isProcessingRef.current = false;
    clearVerificationState();
    setCameraOpen(true);
  };

  const handleCloseCamera = async () => {
    await stopScanner();
    if (!mountedRef.current) return;
    setCameraOpen(false);
    isProcessingRef.current = false;
  };

  const handleScanAgain = async () => {
    if (loading) return;
    await stopScanner();
    isProcessingRef.current = false;
    clearVerificationState();
    setCameraOpen(false);

    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setCameraOpen(true);
      }
    });
  };

  const handleReset = async () => {
    await stopScanner();
    isProcessingRef.current = false;
    setCameraOpen(false);
    setToken("");
    clearVerificationState();
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (loading) return;

    const trimmedToken = token.trim();

    if (!trimmedToken) {
      const errorMessage = "Please enter the pickup token.";
      setSuccess(false);
      setMessage(errorMessage);
      setVerifiedOrder(null);
      toast.error(errorMessage);
      return;
    }
    await verifyOrder({
      token: trimmedToken,
    });
  };

  return (
    <div className="w-full space-y-6 text-[#2D3748] dark:text-zinc-100 font-sans">
      <Helmet>
        <title>Verify Order | Admin Portal</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A202C] dark:text-white">
            Verify Order
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
            Scan a student's pickup QR code or verify the order manually using their pickup token.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 min-h-60 sm:min-h-70 flex flex-col items-center justify-center shadow-xs p-4 sm:p-6">
              {!cameraOpen ? (
                <button
                  type="button"
                  onClick={handleOpenCamera}
                  disabled={loading}
                  className="w-full h-full py-10 px-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-4 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] group-hover:scale-110 group-hover:bg-[#FF6B00] group-hover:text-white transition-all duration-300 mb-4 shadow-xs">
                    <Camera size={28} />
                  </div>
                  <h2 className="text-base font-extrabold text-[#1A202C] dark:text-white mb-1.5 group-hover:text-[#FF6B00] transition-colors">
                    Start Camera Scanner
                  </h2>
                  <p className="text-xs font-semibold text-zinc-400 max-w-xs leading-relaxed">
                    Activate the camera and scan the student's pickup QR code.
                  </p>
                </button>
              ) : (
                <div className="relative w-full h-full min-h-60 sm:min-h-70 flex items-center justify-center bg-zinc-950 rounded-xl overflow-hidden">
                  <div id="reader" ref={readerRef} className="w-full h-full" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-48 h-48 border-2 border-[#FF6B00]/30 rounded-2xl relative flex items-center justify-center backdrop-blur-[1px]">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FF6B00] rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#FF6B00] rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#FF6B00] rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FF6B00] rounded-br-lg" />
                      <QrCode size={36} className="text-[#FF6B00]/50 animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 text-white text-xs font-bold shadow-lg hover:bg-zinc-900 transition-all cursor-pointer backdrop-blur-md border border-zinc-700"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#FF6B00] animate-ping" />
                      <span>Camera Active</span>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Manual Verification
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Enter the pickup token directly if the QR code cannot be scanned.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="relative sm:col-span-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="text"
                    value={token}
                    aria-label="Pickup Token"
                    onChange={e => setToken(e.target.value)}
                    placeholder="Enter Pickup Token"
                    autoComplete="off"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm font-medium bg-[#F8F9FA] dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 focus:border-[#FF6B00] rounded-full text-[#1A202C] dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token.trim()}
                  className="sm:col-span-4 px-5 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Verify Token</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
              <div
                className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${
                  success === true
                    ? "bg-[#DCFCE7] dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-[#16A34A] dark:text-emerald-400"
                    : success === false
                      ? "bg-[#FFEDEC] dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-[#E03A3A] dark:text-rose-400"
                      : "bg-[#FAFBFD] dark:bg-zinc-800/80 border-zinc-100 dark:border-zinc-800 text-[#1A202C] dark:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {success === true && <CheckCircle2 size={20} className="text-[#16A34A]" />}
                  {success === false && <AlertCircle size={20} className="text-[#E03A3A]" />}
                  {success === null && <QrCode size={20} className="text-zinc-400" />}
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    {success === true
                      ? "Order Delivered"
                      : success === false
                        ? "Verification Failed"
                        : "Verification Output"}
                  </span>
                </div>

                {success !== null && (
                  <span
                    className={`text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase ${
                      success ? "bg-[#16A34A] text-white" : "bg-[#E03A3A] text-white"
                    }`}
                  >
                    {success ? "DELIVERED" : "REJECTED"}
                  </span>
                )}
              </div>

              <div className="p-6 space-y-6">
                {success === true && verifiedOrder ? (
                  <>
                    <div className="p-4 rounded-xl flex items-start gap-3 bg-[#DCFCE7] dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-[#16A34A] dark:text-emerald-400"
                      />
                      <div className="text-xs font-bold leading-relaxed text-[#1A202C] dark:text-zinc-100">
                        {message}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-zinc-400">Order Status</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                          Delivered
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-zinc-400">Order ID</span>
                        <span className="text-xs font-bold text-[#1A202C] dark:text-zinc-200 break-all text-right font-mono">
                          {verifiedOrder?._id || "—"}
                        </span>
                      </div>

                      {verifiedOrder?.pickedAt && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-semibold text-zinc-400">Collected At</span>
                          <span className="text-xs font-bold text-[#1A202C] dark:text-zinc-200 text-right">
                            {new Date(verifiedOrder.pickedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : message ? (
                  <div
                    className={`p-4 rounded-xl flex items-start gap-3 ${
                      success === false
                        ? "bg-[#FFEDEC] dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-[#E03A3A] dark:text-rose-400"
                        : "bg-[#F8F9FA] dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-[#1A202C] dark:text-zinc-100"
                    }`}
                  >
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-[#E03A3A] dark:text-rose-400"
                    />
                    <div className="text-xs font-bold leading-relaxed">{message}</div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <div className="p-3.5 w-fit mx-auto rounded-full bg-[#FF6B00]/10 text-[#FF6B00]">
                      <ScanLine size={28} />
                    </div>
                    <p className="text-xs font-extrabold text-[#1A202C] dark:text-white">
                      Awaiting Order Input
                    </p>
                    <p className="text-xs font-semibold text-zinc-400 max-w-35 mx-auto leading-normal">
                      Scan a pickup QR code or enter the pickup token manually.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                  {success !== null ? (
                    <>
                      <button
                        type="button"
                        onClick={handleScanAgain}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <ScanLine size={16} />
                        <span>Scan Next Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-[#F8F9FA] dark:hover:bg-zinc-700/80 font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <RotateCcw size={15} />
                        <span>Clear</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-[#F8F9FA] dark:hover:bg-zinc-700/80 font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RotateCcw size={15} />
                      <span>Reset / Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOrder;
