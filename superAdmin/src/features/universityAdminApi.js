import api from "../api/axios";
export const getUniversityAdmins = async (params) => (await api.get("/super-admin/university-admins", { params })).data;
export const deactivateUniversityAdmin = async (adminId) => (await api.patch(`/universityadmin/${adminId}/deactivate`)).data;
