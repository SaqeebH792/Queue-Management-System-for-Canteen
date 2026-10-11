import axiosInstance from "../api/axiosInstance";
export const loginCanteenAdmin = async credentials => {
  const response = await axiosInstance.post("/users/canteenAdmin/login", credentials);
  return response.data;
};
export const getOrders = async params => {
  const response = await axiosInstance.get("/users/getOrders", {
    params,
  });
  return response.data;
};

export const uploadProducts = async uploadData => {
  const response = await axiosInstance.post("/users/upload/product", uploadData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteProduct = async id => {
  const response = await axiosInstance.delete(`/users/product/${id}`);
  return response.data;
};

export const verifyCanteenAdmin = async () => {
  console.log("Mounting Canteen Admin Verify");
  const response = await axiosInstance.get("/users/verify");

  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.patch(
    `/users/order/${orderId}/status`,
    { status },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const scanQR = async payload => {
  const response = await axiosInstance.post("/users/scanQR", payload);

  return response.data;
};
