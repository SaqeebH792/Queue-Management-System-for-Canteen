import axiosInstance from "../api/axiosInstance";
// Canteen Admin Login & See All Order Routes
export const loginCanteenAdmin = async (credentials) => {
  const response = await axiosInstance.post(
    "/users/canteenAdmin/login",
    credentials,
  );
  return response.data;
};
// Fetches All Orders Placed By Student to show to Canteen Admin
export const getOrders = async (params) => {
  const response = await axiosInstance.get("/users/getOrders", {
    params,
  });
  return response.data;
};
// Upload the Products
export const uploadProducts = async (uploadData) => {
  const response = await axiosInstance.post(
    "/users/upload/product",
    uploadData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
// Delete any Listed Product

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/users/product/${id}`);
  return response.data;
};
// Verify Canteen Admin Before Accessing Dashboard if Admin is Authorized
export const verifyCanteenAdmin = async () => {
  console.log("Mounting Canteen Admin Verify");
  const response = await axiosInstance.get("/users/verify");

  return response.data;
};

// Update Order Status ___> Approve, Preparing, Ready, Delivered

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.patch(
    `/users/order/${orderId}/status`,
    { status },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

// Scan QR Code
export const scanQR = async (payload) => {
  const response = await axiosInstance.post("/users/scanQR", payload);

  return response.data;
};
