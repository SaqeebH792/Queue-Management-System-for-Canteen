import axiosInstance from "../api/axiosInstance";

// Student Signup
export const studentSignup = async (signupData) => {
  const response = await axiosInstance.post(
    "/users/student/requestOtp",
    signupData,
  );
  return response.data;
};

export const verifyRegistration = async (signupData) => {
  const response = await axiosInstance.post(
    "/users/student/register",
    signupData,
  );
  return response.data;
};
// Student Login
export const loginStudent = async (loginData) => {
  const response = await axiosInstance.post("/users/student/login", loginData);
  return response.data;
};
// Fetches All Listed Products
export const getAllProducts = async (params) => {
  const response = await axiosInstance.get("/users/products", { params });
  return response.data;
};

// Fetch Single Product Based on Id
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/users/product/${id}`);
  return response.data;
};

// Verify User
export const verifyStudent = async () => {
  console.log("Mounting Student Verify");
  const response = await axiosInstance.get("/users/verify");
  return response.data;
};
//
export const estimateOrder = async (items) => {
  const response = await axiosInstance.post(
    "/users/order/estimate",
    {
      items,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
};
//
export const createOrder = async (items, pickupTime) => {
  const response = await axiosInstance.post(
    "/users/order/create",
    {
      items,
      pickupTime,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
};

// Fetch My Placed Orders

export const getMyOrders = async () => {
  const response = await axiosInstance.get("/users/myOrders");
  return response.data;
};

// Request OTP for Profile Update
export const requestOtp = async (data) => {
  const response = await axiosInstance.post("/users/requestOtp", data);
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await axiosInstance.patch("/users/updateProfile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updatePassword = async (data) => {
  const response = await axiosInstance.patch("/users/updatePassword", data);

  return response.data;
};

export const requestStudentOtp = async (data) => {
  const response = await axiosInstance.post(
    "/users/students/forgotPassword/requestOtp",
    data,
  );

  return response.data;
};

export const resetStudentPassword = async (data) => {
  const response = await axiosInstance.post(
    "/users/students/forgotPassword/resetPassword",
    data,
  );

  return response.data;
};

export const getNotifications = async () => {
  const response = await axiosInstance.get("users/notifications");

  return response.data;
};
