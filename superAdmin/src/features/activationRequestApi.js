import api from "../api/axios";
export const getActivationRequests = async params =>
  (await api.get("/superAdmin/activationRequest", { params })).data;
export const updateActivationRequest = async (requestId, data) =>
  (await api.patch(`/superAdmin/activationRequest/requests/${requestId}`, data)).data;
