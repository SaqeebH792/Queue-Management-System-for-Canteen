import { useDispatch } from "react-redux";
import { ShoppingBag, Info } from "lucide-react";
import {
  readNotification,
  markNotificationReadLocally,
} from "../../store/notificationSlice";

function NotificationItem({ notification, close }) {
  const dispatch = useDispatch();

  const handleClick = () => {
    if (!notification.isRead) {
      dispatch(markNotificationReadLocally(notification._id));
      dispatch(readNotification(notification._id));
    }
    if (close) close();
  };

  const isUnread = !notification.isRead;
  const isOrder = Boolean(
    notification.orderId || notification.type === "ORDER",
  );

  const createdAtDate = notification.createdAt
    ? new Date(notification.createdAt)
    : new Date();

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.99] cursor-pointer group flex items-start gap-4 ${
        isUnread
          ? "bg-sky-50/60 hover:bg-sky-100/60 dark:bg-[#167CC2]/10 dark:hover:bg-[#167CC2]/15 border-[#167CC2]/30"
          : "bg-white hover:bg-zinc-50 dark:bg-[#2B2D30] dark:hover:bg-zinc-800/60 border-zinc-100 dark:border-zinc-800"
      }`}
    >
      <div
        className={`p-2.5 rounded-full shrink-0 ${
          isOrder
            ? "bg-[#167CC2]/10 text-[#167CC2]"
            : "bg-[#D2F535]/20 text-[#1E1F21] dark:text-[#D2F535]"
        }`}
      >
        {isOrder ? <ShoppingBag size={18} /> : <Info size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs sm:text-sm font-extrabold truncate ${
              isUnread
                ? "text-[#1E1F21] dark:text-white"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {notification.title ||
              (isOrder ? "Order Update" : "System Notification")}
          </p>

          <span className="text-[10px] font-bold text-zinc-400 shrink-0">
            {createdAtDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {createdAtDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>

          {isUnread && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#167CC2]">
              <span className="h-2 w-2 rounded-full bg-[#167CC2] animate-pulse" />
              Unread
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default NotificationItem;
