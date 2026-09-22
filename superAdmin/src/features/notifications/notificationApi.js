import api from "../../api/axios";
export const getNotifications = async () => (await api.get("/notifications")).data;
