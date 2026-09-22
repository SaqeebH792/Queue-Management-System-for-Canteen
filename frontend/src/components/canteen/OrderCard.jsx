import { Check, ArrowRight } from "lucide-react";

// Helper to configure button appearance & target status per state
const GET_TRANSITION_CONFIG = (currentStatus) => {
  switch (currentStatus) {
    case "Pending":
      return {
        nextStatus: "Accepted",
        label: "Accept Order",
        buttonClass:
          "bg-[#167CC2] hover:bg-[#1368A3] text-white cursor-pointer",
      };
    case "Accepted":
      return {
        nextStatus: "Preparing",
        label: "Mark as Preparing",
        buttonClass:
          "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer",
      };
    case "Preparing":
      return {
        nextStatus: "Ready",
        label: "Mark as Ready",
        buttonClass:
          "bg-[#D2F535] hover:bg-[#c2e42d] text-[#1E1F21] cursor-pointer",
      };
    case "Ready":
      return {
        nextStatus: "Delivered",
        label: "Mark as Delivered",
        buttonClass:
          "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
      };
    case "Delivered":
    default:
      return {
        nextStatus: null,
        label: "Order Delivered",
        buttonClass:
          "bg-[#F3F4F6] dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed",
      };
  }
};

const GET_STATUS_BADGE = (status) => {
  switch (status) {
    case "Pending":
      return {
        style:
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        accent: "border-l-zinc-400",
      };
    case "Accepted":
      return {
        style:
          "bg-[#167CC2]/10 text-[#167CC2] dark:bg-[#167CC2]/20 dark:text-sky-300 border-[#167CC2]/30",
        accent: "border-l-[#167CC2]",
      };
    case "Preparing":
      return {
        style:
          "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30",
        accent: "border-l-amber-500",
      };
    case "Ready":
      return {
        style: "bg-[#D2F535] text-[#1E1F21] border-[#D2F535]",
        accent: "border-l-[#D2F535]",
      };
    case "Delivered":
      return {
        style:
          "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30",
        accent: "border-l-emerald-500",
      };
    default:
      return {
        style:
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        accent: "border-l-zinc-300 dark:border-l-zinc-700",
      };
  }
};

const OrderCard = ({ order, onStatusChange }) => {
  const currentStatus = order?.status || "Pending";
  const badge = GET_STATUS_BADGE(currentStatus);
  const transition = GET_TRANSITION_CONFIG(currentStatus);
  const isCompleted =
    currentStatus === "Delivered" || currentStatus === "Cancelled";

  // Calculate or extract total price
  const totalPrice =
    order?.totalPrice ??
    order?.totalAmount ??
    order?.items?.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0,
    ) ??
    0;

  // Extract student details safely
  const studentName = order?.student?.name || order?.customerName || "Student";
  const registrationNo =
    order?.student?.registrationNo ||
    order?.student?.regNo ||
    order?.student?.rollNo ||
    order?.registrationNo;

  return (
    <div
      className={`bg-white dark:bg-[#1E1F21] border-zinc-100 dark:border-zinc-800 border-l-4 rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full font-sans text-[#1E1F21] dark:text-zinc-100`}
    >
      <div>
        {/* Header: Full Order ID & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Order ID
            </span>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono break-all leading-tight">
              {order?._id}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shrink-0 border ${badge.style}`}
          >
            {currentStatus}
          </span>
        </div>

        {/* Customer / Student Information */}
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-extrabold text-[#1E1F21] dark:text-white leading-snug">
            {studentName}
          </h3>
          {registrationNo && (
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
              Reg No: {registrationNo}
            </p>
          )}
        </div>

        {/* Item Summary List */}
        <div className="space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mb-4">
          {order?.items?.map((item, idx) => (
            <div
              key={item._id || idx}
              className="flex items-center justify-between text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold px-2 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-[#167CC2] text-xs">
                  {item.quantity}x
                </span>
                <span className="font-bold text-[#1E1F21] dark:text-zinc-200">
                  {item.name}
                </span>
              </div>
              {item.price > 0 && (
                <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 font-mono">
                  Rs. {item.price * item.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Total Price & Dynamic Next Status Button */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Total Amount
          </span>
          <span className="text-base sm:text-lg font-extrabold text-[#1E1F21] dark:text-white font-mono">
            Rs. {Number(totalPrice)}
          </span>
        </div>

        <button
          type="button"
          disabled={isCompleted || !transition.nextStatus}
          onClick={() => onStatusChange(order?._id, transition.nextStatus)}
          className={`w-full py-3 px-4 rounded-full font-extrabold text-xs tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-xs ${
            transition.buttonClass
          }`}
        >
          {isCompleted ? (
            <span className="flex items-center gap-1.5">
              Completed <Check size={16} />
            </span>
          ) : (
            <>
              <span>{transition.label}</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
