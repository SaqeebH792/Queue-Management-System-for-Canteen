import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

function VerifyOrder() {
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // null | true | false
  const [message, setMessage] = useState("");

  // Stop & Cleanup Camera
  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      const state = scannerRef.current.getState();
      // State 2 = SCANNING, State 3 = PAUSED
      if (state === 2 || state === 3) {
        await scannerRef.current.stop();
      }
      await scannerRef.current.clear();
    } catch (err) {
      console.warn("Scanner stop/clear warning:", err?.message || err);
    } finally {
      scannerRef.current = null;
    }
  }, []);

  // Verify Order API
  const verifyOrder = useCallback(async payload => {
    setLoading(true);
    setSuccess(null);

    toast.promise(
      axiosInstance.post("/users/scanQR", payload, {
        withCredentials: true,
      }),
      {
        loading: "Verifying order...",
        success: response => {
          const successMsg = response?.data?.message || "Order verified successfully!";
          setSuccess(true);
          setMessage(successMsg);
          setOrderId("");
          setToken("");

          setTimeout(() => {
            setMessage("");
            setSuccess(null);
          }, 3500);

          setLoading(false);
          return successMsg;
        },
        error: err => {
          const errMsg = err.response?.data?.message || "Failed to verify order.";
          setSuccess(false);
          setMessage(errMsg);
          setLoading(false);
          return errMsg;
        },
      }
    );
  }, []);

  // Handle Camera Open / Close Actions
  function handleOpenCamera() {
    setMessage("");
    setSuccess(null);
    setCameraOpen(true);
  }

  async function handleCloseCamera() {
    await stopScanner();
    setCameraOpen(false);
  }

  // Camera Scanner Lifecycle
  useEffect(() => {
    if (!cameraOpen) return;

    let mounted = true;
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    async function startScanner() {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          async decodedText => {
            if (isScanningRef.current) return;
            isScanningRef.current = true;

            try {
              const qr = JSON.parse(decodedText);
              await stopScanner();
              if (mounted) setCameraOpen(false);

              await verifyOrder({
                orderId: qr.orderId,
                token: qr.token,
              });
            } catch (err) {
              console.error("QR Payload Error:", err);
              setSuccess(false);
              const errMsg = "Invalid QR Code format. Expected JSON payload.";
              setMessage(errMsg);
              toast.error(errMsg);
            } finally {
              isScanningRef.current = false;
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera Access Error:", err);
        if (mounted) {
          setCameraOpen(false);
          setSuccess(false);
          const errMsg = "Unable to access camera. Check permissions.";
          setMessage(errMsg);
          toast.error(errMsg);
        }
      }
    }

    startScanner();
    return () => {
      mounted = false;
      stopScanner();
    };
  }, [cameraOpen, stopScanner, verifyOrder]);

  // Manual Verification
  function handleSubmit(e) {
    e.preventDefault();
    if (!orderId.trim() || !token.trim()) return;

    verifyOrder({ orderId, token });
  }

  const INPUT_BASE_CLASS =
    "w-full rounded-full border border-zinc-200/80 dark:border-zinc-700/60 bg-[#F8F9FA] dark:bg-zinc-800/60 px-4 py-3 text-[#1A202C] dark:text-zinc-100 placeholder-zinc-400 focus:border-[#FF6B00] outline-none transition-all duration-200 text-xs sm:text-sm font-medium";

  const LABEL_CLASS =
    "block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2";

  const BUTTON_PRIMARY_CLASS =
    "w-full px-6 py-3 rounded-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer";

  return (
    <>
      <Helmet>
        <title>Verify Order</title>
      </Helmet>

      <div className="w-full text-[#2D3748] dark:text-zinc-100 font-sans space-y-6">
        {/* Header Title & Scanner Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A202C] dark:text-white leading-tight">
              Scan Pickup QR
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Verify student cafeteria orders via live camera scanner or manual tokens.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs self-start sm:self-auto">
            <span
              className={`h-2 w-2 rounded-full ${
                cameraOpen ? "bg-[#16A34A] animate-pulse" : "bg-zinc-400"
              }`}
            />
            Scanner: {cameraOpen ? "Live" : "Standby"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Camera Viewport Section */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-300">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 min-h-80 flex flex-col items-center justify-center border border-zinc-800">
              {!cameraOpen ? (
                <button
                  type="button"
                  onClick={handleOpenCamera}
                  className="w-full h-full p-8 flex flex-col items-center justify-center text-center group cursor-pointer transition-all"
                >
                  <div className="p-4 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] group-hover:scale-110 group-hover:bg-[#FF6B00] group-hover:text-white transition-all duration-300 mb-4">
                    <Camera size={36} />
                  </div>

                  <h2 className="text-lg font-bold text-white mb-1">Initialize Camera</h2>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                    Click here to grant camera access and begin scanning receipt QR codes.
                  </p>
                </button>
              ) : (
                <div className="relative w-full h-full min-h-80 flex items-center justify-center">
                  <div id="reader" className="w-full h-full" />

                  {/* Camera Frame Target Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-60 h-60 border-2 border-[#FF6B00]/50 rounded-2xl relative">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FF6B00] rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#FF6B00] rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#FF6B00] rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FF6B00] rounded-br-lg" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cameraOpen && (
              <button
                type="button"
                onClick={handleCloseCamera}
                className="mt-4 w-full py-2.5 rounded-full bg-[#FAFBFD] dark:bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-700 dark:text-zinc-300 font-bold text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                Turn Off Scanner Camera
              </button>
            )}
          </div>

          {/* Manual Override & Verification Result Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-300">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-4">
                Manual Override Terminal
              </span>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={LABEL_CLASS}>Token ID</label>
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    placeholder="e.g. 64b8f01..."
                    className={INPUT_BASE_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Pickup Token</label>
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="e.g. #1024"
                    className={INPUT_BASE_CLASS}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !orderId.trim() || !token.trim()}
                  className={BUTTON_PRIMARY_CLASS}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Commit Order Verification</span>
                  )}
                </button>
              </form>
            </div>

            {/* Live Output Feed Status Card */}
            <div className="bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-300">
              {message ? (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 transition-all duration-200 ${
                    success
                      ? "bg-[#DCFCE7] border-[#16A34A]/20 text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-[#FFEDEC] border-[#E03A3A]/20 text-[#E03A3A] dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {success ? (
                      <CheckCircle2 size={20} className="text-[#16A34A] dark:text-emerald-400" />
                    ) : (
                      <AlertCircle size={20} className="text-[#E03A3A] dark:text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {success ? "Verification Passed" : "Rejected"}
                    </p>
                    <p className="text-sm font-medium mt-0.5">{message}</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Awaiting Input Stream
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Ready for QR scan or manual input verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VerifyOrder;
