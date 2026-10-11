import { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { X, Clock, AlertTriangle, Loader2, Lock, Banknote, Check } from "lucide-react";
import { toast } from "sonner";
import { estimateOrder, createOrder } from "../../routes/student.routes";

function OrderSummaryModal({ isOpen, onClose, product, quantity, onOrderSuccess }) {
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedPickupSlot, setSelectedPickupSlot] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !product?._id) return;

    const fetchEstimate = async () => {
      try {
        setLoadingEstimate(true);
        setError("");

        const response = await estimateOrder([
          {
            productId: product._id,
            quantity,
          },
        ]);

        setEstimate(response.data);
      } catch (err) {
        const errMsg = err?.response?.data?.message || "Unable to calculate estimated pickup time.";
        setError(errMsg);
        toast.error("Estimation failed", { description: errMsg });
      } finally {
        setLoadingEstimate(false);
      }
    };

    fetchEstimate();
  }, [isOpen, product, quantity]);

  const timeSlots = useMemo(() => {
    if (!isOpen) return [];

    const slots = [];

    const estimatedPrepMinutes = parseInt(estimate?.estimatedTime, 10) || 15;

    const baseTime = new Date(Date.now() + estimatedPrepMinutes * 60 * 1000);
    const firstSlot = new Date(baseTime);

    slots.push({
      id: "slot-0",
      label: firstSlot.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      timeString: firstSlot.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      isoString: firstSlot.toISOString(),
      minutesFromNow: estimatedPrepMinutes,
    });

    const roundedBase = new Date(baseTime);

    roundedBase.setSeconds(0);
    roundedBase.setMilliseconds(0);

    const minutes = roundedBase.getMinutes();

    const next30MinuteMark = minutes <= 30 ? 30 : 60;

    roundedBase.setMinutes(next30MinuteMark);

    for (let i = 0; i < 3; i++) {
      const slotDate = new Date(roundedBase.getTime() + i * 30 * 60 * 1000);

      const formattedTime = slotDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      slots.push({
        id: `slot-${i + 1}`,
        label: formattedTime,
        timeString: formattedTime,
        isoString: slotDate.toISOString(),
        minutesFromNow: Math.round((slotDate.getTime() - Date.now()) / 60000),
      });
    }

    return slots;
  }, [isOpen, estimate]);

  useEffect(() => {
    if (timeSlots.length > 0 && !selectedPickupSlot) {
      setSelectedPickupSlot(timeSlots[0]);
    }
  }, [timeSlots, selectedPickupSlot]);

  const handleConfirmOrder = async () => {
    if (!selectedPickupSlot?.isoString) {
      toast.error("Please select a pickup time.");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await createOrder(
        [
          {
            productId: product._id,
            canteenAdminId: product.canteenAdminId,
            quantity,
            specialInstructions,
            paymentMethod: "CASH_ON_DELIVERY",
          },
        ],
        selectedPickupSlot?.isoString
      );

      toast.success("Order Placed Successfully!", {
        description: `Your order for ${product?.name} has been placed.`,
      });

      if (onOrderSuccess) {
        onOrderSuccess(response.data);
      }

      onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Unable to place order.";

      toast.error("Order Failed", {
        description: errMsg,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isOpen) return null;

  const unitPrice = product?.price || 0;
  const subtotal = estimate?.totalAmount || unitPrice * quantity;
  const grandTotal = subtotal;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-white dark:bg-[#1E1F21] rounded-[28px] shadow-xs overflow-hidden transition-all my-auto max-h-[90vh] flex flex-col z-10"
      >
        <div className="px-6 py-4 bg-white dark:bg-[#1E1F21] border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-extrabold text-[#1E1F21] dark:text-white tracking-tight">
            Checkout
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-[#F3F4F6] dark:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {loadingEstimate ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#167CC2] animate-spin" />
              <p className="text-xs font-semibold text-zinc-400">
                Calculating order estimate & options...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-[20px] bg-rose-500/10 text-rose-500 flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#F3F4F6] dark:bg-zinc-800/60 rounded-[28px] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-[#1E1F21] dark:text-white" />
                    <h3 className="text-base font-extrabold text-[#1E1F21] dark:text-white">
                      Pickup Details
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-semibold">
                    Choose when you would like to pick up your order from{" "}
                    <span className="font-extrabold text-[#1E1F21] dark:text-white">
                      {product?.canteenName || "Campus Cafe"}
                    </span>
                    .
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {timeSlots.map(slot => {
                      const isSelected = selectedPickupSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedPickupSlot(slot)}
                          className={`p-3 rounded-[20px] text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#167CC2] text-white"
                              : "bg-white dark:bg-[#1E1F21] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          <span className="block text-xs font-extrabold uppercase tracking-wider">
                            {slot.label}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSelected ? "text-white/80" : "text-zinc-400"
                            }`}
                          >
                            Today
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#F3F4F6] dark:bg-zinc-800/60 rounded-[28px] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 border-t-2 border-[#167CC2] pt-2">
                    <Banknote size={18} className="text-[#1E1F21] dark:text-white" />
                    <h3 className="text-base font-extrabold text-[#1E1F21] dark:text-white">
                      Payment Method
                    </h3>
                  </div>

                  <div className="p-4 rounded-[20px] bg-white dark:bg-[#1E1F21] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-[#167CC2]/10 text-[#167CC2]">
                        <Banknote size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1E1F21] dark:text-white">
                          Cash on Delivery
                        </p>
                        <p className="text-[11px] font-semibold text-zinc-400">
                          Pay with cash at counter upon pickup
                        </p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#167CC2] text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-[#F3F4F6] dark:bg-zinc-800/60 rounded-[28px] p-6 space-y-6 sticky top-0">
                  <h3 className="text-lg font-extrabold text-[#1E1F21] dark:text-white">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1F21] text-[#167CC2] font-extrabold text-[10px]">
                          {quantity}x
                        </span>
                        <div>
                          <p className="font-extrabold text-[#1E1F21] dark:text-white">
                            {product?.name || "Meal Item"}
                          </p>
                          {product?.category && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1F21] text-[9px] font-extrabold text-zinc-400 uppercase mt-1">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-extrabold text-[#167CC2]">Rs: {subtotal}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-extrabold text-[#1E1F21] dark:text-white">
                        Rs: {subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Campus Fee</span>
                      <span className="font-extrabold text-[#1E1F21] dark:text-white">Rs: 0.0</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-[#1E1F21] dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-extrabold text-[#167CC2]">Rs: {grandTotal}</span>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      disabled={placingOrder}
                      className="w-full py-3.5 px-4 rounded-full bg-[#167CC2] hover:opacity-90 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {placingOrder ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>Confirm Order</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-zinc-400 font-semibold leading-normal">
                      By confirming, you agree to pay Rs: {grandTotal} in cash upon pickup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OrderSummaryModal;
