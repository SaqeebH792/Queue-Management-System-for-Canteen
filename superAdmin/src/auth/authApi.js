import api from "../api/axios";
export const loginSuperAdmin = async (data) => (await api.post("/superAdmin/login", data)).data;
export const logoutSuperAdmin = async () => (await api.post("/superAdmin/logout")).data;
