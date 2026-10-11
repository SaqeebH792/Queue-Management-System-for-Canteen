import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { socket } from "../../sockets/sockets";
import { addNotification } from "../../store/notificationSlice";
import { fetchNotifications } from "../../store/notificationSlice";
const ROLE_MAP = {
  Student: "Student",
  "Canteen Admin": "CanteenAdmin",
  "University Admin": "UniversityAdmin",
  "Super Admin": "SuperAdmin",
  SuperAdmin: "SuperAdmin",
  UniversityAdmin: "UniversityAdmin",
  CanteenAdmin: "CanteenAdmin",
};

function NotificationListener() {
  const dispatch = useDispatch();

  const adminAuth = useSelector(state => state.auth);
  const studentAuth = useSelector(state => state.studentAuth);

  const currentUser = adminAuth.user?.data?.user || adminAuth.user || studentAuth.user || null;

  const isAuthenticated = adminAuth.isAuthenticated || studentAuth.isAuthenticated;

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, currentUser, dispatch]);
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    if (!currentUser._id) return;

    const role = ROLE_MAP[currentUser.role] || currentUser.role;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join", {
      role,
      userId: currentUser._id,
      universityId: currentUser.universityId || null,
    });

    const handleNotification = notification => {
      dispatch(addNotification(notification));

      toast(notification.title || "Notification", {
        description: notification.message || "You have a new notification.",
      });
    };
    socket.off("newNotification");
    socket.on("newNotification", handleNotification);

    return () => {
      socket.off("newNotification", handleNotification);
    };
  }, [dispatch, currentUser, isAuthenticated]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated && !studentAuth.isAuthenticated) {
      if (socket.connected) {
        socket.disconnect();
        console.log("Socket disconnected");
      }
    }
  }, [adminAuth.isAuthenticated, studentAuth.isAuthenticated]);

  return null;
}

export default NotificationListener;
