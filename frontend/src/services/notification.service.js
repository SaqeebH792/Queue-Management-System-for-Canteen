import axiosInstance from "../api/axiosInstance";

export const getNotifications = () => {
  return axiosInstance.get("/users/notifications");
};

export const markNotificationAsRead = (id) => {
  return axiosInstance.patch(`/users/notifications/${id}/read`);
};
export const markAllNotificationsAsRead = () => {
  return axiosInstance.patch("/users/notifications/read-all");
};
export const clearNotifications = () => {
  return axiosInstance.delete("/users/notifications/clear");
};
