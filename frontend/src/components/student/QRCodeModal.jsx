import { useEffect } from "react";
import ReactDOM from "react-dom";
import { X, QrCode } from "lucide-react";

function QRCodeModal({ isOpen, onClose, qrCodeUrl, pickupToken, tokenId }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Card Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-xs z-10 transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6 pr-6">
          <div className="inline-flex p-3 rounded-full bg-[#167CC2]/10 text-[#167CC2] mb-1">
            <QrCode size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-[#1E1F21] dark:text-white leading-tight">
            Pickup Pass
          </h2>
          <p className="text-xs font-semibold text-zinc-400 max-w-60 mx-auto leading-relaxed">
            Show this code to counter staff to collect your meal.
          </p>
        </div>

        {/* Ticket Container */}
        <div className="bg-[#F3F4F6] dark:bg-zinc-800/60 rounded-3xl p-5 space-y-4">
          {/* QR Image Frame */}
          <div className="w-48 h-48 mx-auto bg-white p-3 rounded-[20px] shadow-xs flex items-center justify-center">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Pickup QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <QrCode size={36} strokeWidth={1.5} />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-center">
                  QR Code Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Ticket Cutout Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t-2 border-dashed border-zinc-200 dark:border-zinc-700" />
            <div className="absolute -left-8 w-5 h-5 bg-white dark:bg-[#1E1F21] rounded-full" />
            <div className="absolute -right-8 w-5 h-5 bg-white dark:bg-[#1E1F21] rounded-full" />
          </div>

          {/* Details Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                Pickup Token
              </span>
              <span className="text-lg font-extrabold text-[#167CC2]">
                #{pickupToken || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                Token ID
              </span>
              <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 max-w-35 truncate">
                {tokenId || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default QRCodeModal;
