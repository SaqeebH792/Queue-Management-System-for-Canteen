import axiosInstance from "../api/axiosInstance";

export const getNotifications = async () => {
  const response = await axiosInstance.get("/users/notifications");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axiosInstance.patch(
    `/users/notifications/${notificationId}/read`,
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.patch("/users/notifications/read-all");
  return response.data;
};
