import { Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function NotificationBell() {
  const notifications = useSelector((state) => state.notification?.items || []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const adminAuth = useSelector((state) => state.auth);
  const studentAuth = useSelector((state) => state.studentAuth);

  const currentUser =
    adminAuth?.user?.data?.user || adminAuth?.user || studentAuth?.user;

  const role = currentUser?.role;

  let notificationPath = "/notifications";

  switch (role) {
    case "University Admin":
    case "UniversityAdmin":
      notificationPath = "/admin/dashboard/notifications";
      break;

    case "Canteen Admin":
    case "CanteenAdmin":
      notificationPath = "/canteenAdmin/dashboard/notifications";
      break;

    case "Student":
    default:
      notificationPath = "/notifications";
  }

  return (
    <NavLink
      to={notificationPath}
      aria-label="Notifications"
      className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      <Bell className="w-5 h-5 transition-transform duration-200 hover:scale-110" />

      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#131926] shadow-xs">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </NavLink>
  );
}

export default NotificationBell;
