import { useState } from "react";
import { QrCode, CheckCircle2, XCircle, Clock, Utensils } from "lucide-react";
import QRCodeModal from "./QRCodeModal";

function MyOrderCard({ order, isActiveOrder }) {
  const [showQR, setShowQR] = useState(false);

  const status = (order.status || "preparing").toLowerCase();

  // Progress steps: Preparing (0%) -> Ready (50%) -> Delivered (100%)
  const getProgressPercentage = (currStatus) => {
    switch (currStatus) {
      case "ready":
        return "50%";
      case "delivered":
      case "completed":
        return "100%";
      case "cancelled":
        return "0%";
      case "preparing":
      default:
        return "0%";
    }
  };

  const formattedDate = new Date(
    order.createdAt || Date.now(),
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const itemsText = order.items?.map((i) => i.name).join(", ");
  const itemCount =
    order.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;

  if (isActiveOrder) {
    return (
      <>
        <div className="bg-white dark:bg-[#2B2D30] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-6 border border-slate-100 dark:border-zinc-800">
          {/* Top Bar */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-[#167CC2]/10 text-[#167CC2] text-[10px] font-extrabold uppercase tracking-wider">
                  ORDER #{order.pickupToken || order._id?.slice(-4)}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#D2F535] text-[#1E1F21] text-[11px] font-extrabold flex items-center gap-1 capitalize">
                  <Utensils size={12} />
                  <span>{order.status || "Preparing"}</span>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-[#1E1F21] dark:text-white pt-1">
                {order.canteenName || "Campus Cafe"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
                <Clock size={13} />
                Estimated Time: {order.estimatedTime || "15-20 Mins"}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              <span className="text-xl font-extrabold text-[#167CC2]">
                Rs. {Number(order.totalAmount || 0).toFixed(2)}
              </span>

              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="px-4 py-2.5 rounded-full bg-[#167CC2] hover:opacity-90 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-opacity cursor-pointer"
              >
                <QrCode size={15} />
                <span>Show QR</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-extrabold text-[#1E1F21] dark:text-white">
                  Rs. {Number(item.price || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Tracker (Preparing -> Ready -> Delivered) */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[11px] font-extrabold text-zinc-400">
              <span
                className={
                  ["preparing", "ready", "delivered", "completed"].includes(
                    status,
                  )
                    ? "text-[#167CC2]"
                    : ""
                }
              >
                Preparing
              </span>
              <span
                className={
                  ["ready", "delivered", "completed"].includes(status)
                    ? "text-[#167CC2]"
                    : ""
                }
              >
                Ready
              </span>
              <span
                className={
                  ["delivered", "completed"].includes(status)
                    ? "text-[#167CC2]"
                    : ""
                }
              >
                Delivered
              </span>
            </div>

            <div className="w-full h-2 bg-[#F3F4F6] dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#167CC2] transition-all duration-500 rounded-full"
                style={{ width: getProgressPercentage(status) }}
              />
            </div>
          </div>
        </div>

        <QRCodeModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          qrCodeUrl={order.qrCodeUrl}
          pickupToken={order.pickupToken}
          tokenId={order._id}
        />
      </>
    );
  }

  // Past Orders Card
  return (
    <>
      <div className="bg-white dark:bg-[#2B2D30] rounded-[28px] p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs border border-slate-100 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>{formattedDate}</span>
            <span className="text-sm font-extrabold text-[#167CC2]">
              Rs. {Number(order.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-extrabold text-[#1E1F21] dark:text-white">
            {order.canteenName || "Campus Vendor"}
          </h4>

          <p className="text-[11px] text-zinc-400 font-semibold">
            {itemCount} {itemCount === 1 ? "Item" : "Items"}
          </p>

          {itemsText && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal line-clamp-1">
              {itemsText}
            </p>
          )}
        </div>

        {/* Footer: Delivered / Status Badge + Show QR */}
        <div className="flex items-center justify-between gap-2 border-t pt-3 border-zinc-100 dark:border-zinc-800">
          <div>
            {status === "cancelled" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-extrabold">
                <XCircle size={13} />
                Cancelled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                <CheckCircle2 size={13} />
                Delivered
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="px-4 py-1.5 rounded-full bg-[#167CC2]/10 hover:bg-[#167CC2]/20 text-[#167CC2] font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode size={13} />
            <span>Show QR</span>
          </button>
        </div>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrCodeUrl={order.qrCodeUrl}
        pickupToken={order.pickupToken}
        tokenId={order._id}
      />
    </>
  );
}

export default MyOrderCard;
