import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket/socket";
import { addNotification } from "../features/notifications/notificationSlice";

const NotificationListener = () => {
  const dispatch = useDispatch();
  const { superAdmin } = useSelector((s) => s.auth);
  useEffect(() => {
    if (!superAdmin?._id) return;
    socket.connect();
    socket.emit("join", superAdmin._id);
    const handler = (notification) => dispatch(addNotification(notification));
    socket.on("newNotification", handler);
    return () => { socket.off("newNotification", handler); socket.disconnect(); };
  }, [dispatch, superAdmin?._id]);
  return null;
};
export default NotificationListener;
