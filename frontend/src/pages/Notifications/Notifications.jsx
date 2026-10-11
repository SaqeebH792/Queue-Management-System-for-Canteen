import { useEffect } from "react";
import { Bell, Inbox, CheckCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

import { socket } from "../../sockets/sockets";
import {
  fetchNotifications,
  readAllNotifications,
  addNotification,
} from "../../store/notificationSlice";

import NotificationItem from "./NotificationItem";

function Notifications() {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector(state => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());

    const handleNewNotification = notification => {
      dispatch(addNotification(notification));
      toast.info(notification.message || "You have a new notification!", {
        icon: "🔔",
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(readAllNotifications());
  };

  const unreadCount = items.filter(item => !item.isRead).length;

  if (loading && items.length === 0) {
    return (
      <div className="w-full min-h-screen text-[#1E1F21] dark:text-zinc-100 transition-colors duration-300 px-4 sm:px-6 lg:p-8 font-sans pt-22 sm:pt-30">
        <div className="w-full max-w-full bg-white dark:bg-[#1E1F21] border border-zinc-100 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xs animate-pulse">
          <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800/80 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                <div className="h-3 w-64 bg-zinc-100 dark:bg-zinc-800/60 rounded-full" />
              </div>
            </div>
            <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="p-4 rounded-2xl bg-[#F3F4F6] dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                    <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800/60 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Notifications | Portal</title>
      </Helmet>

      <div className="w-full min-h-screen text-[#1E1F21] dark:text-zinc-100 transition-colors duration-300 px-4 sm:px-6 lg:px-8 font-sans pt-6">
        <div className="w-full max-w-full bg-white dark:bg-[#1E1F21] border border-zinc-100 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xs transition-all duration-300 mt-[10%]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800/80 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#167CC2]/10 text-[#167CC2] shrink-0">
                <Bell size={24} strokeWidth={2.2} />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1F21] dark:text-white">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <span className="px-3 py-1 rounded-full bg-[#D2F535] text-[#1E1F21] text-xs font-extrabold border border-[#D2F535]">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Real-time updates and order notifications
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 hover:bg-[#167CC2] hover:text-white dark:hover:bg-[#167CC2] text-zinc-700 dark:text-zinc-300 font-extrabold text-xs transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
              >
                <CheckCheck size={16} />
                Mark All as Read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="p-5 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-4 border border-zinc-200/50 dark:border-zinc-700/50">
                <Inbox size={40} strokeWidth={1.5} />
              </div>

              <h2 className="text-lg font-extrabold text-[#1E1F21] dark:text-white mb-1">
                No Notifications
              </h2>

              <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                Order status logs and system notifications will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {items.map(notification => (
                <NotificationItem key={notification._id} notification={notification} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Notifications;
