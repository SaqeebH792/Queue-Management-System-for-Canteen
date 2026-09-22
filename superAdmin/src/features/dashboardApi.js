import api from "../api/axios";
export const getDashboardStats = async () => (await api.get("/superAdmin/dashboard")).data;
