import axiosInstance from "../api/axiosInstance";

export const loginUniversityAdmin = async (loginData) => {
  const response = await axiosInstance.post("/users/admin/login", loginData);

  return response.data;
};
// University Admin Signup
export const adminSignup = async (signupData) => {
  console.log(signupData);
  const response = await axiosInstance.post(
    "/users/admin/register",
    signupData,
  );
  return response.data;
};
// University Admin Verify OTP
export const verifyOtp = async (otpData) => {
  const response = await axiosInstance.post("/users/admin/verify", otpData);
  return response.data;
};

// University Admin Login

export const loginAdmin = async (loginData) => {
  const response = await axiosInstance.post("/users/admin/login", loginData);
  return response.data;
};

// Verify the University Admin before Accessing Dashboard if Admin is Loggedin or not
export const verifyUniversityAdmin = async () => {
  console.log("Mounting Admin Verify");
  const response = await axiosInstance.get("/users/verify");
  return response.data;
};

// Extra Routes
// University Admin Register Canteen Admin
export const registerCanteenAdmin = async (signupData) => {
  const response = await axiosInstance.post(
    "/users/register/canteen-admin",
    signupData,
  );
  return response.data;
};
// University Admin Upload Student's Data
export const uploadStudents = async (dataFile) => {
  const response = await axiosInstance.post("/users/students/upload", dataFile);
  console.log(response);
  return response.data;
};
// Fetch All Student to Show on Admin Dashboard
export const getAllStudents = async (params) => {
  const response = await axiosInstance.get("/users/uploadedStudents", {
    params,
  });
  return response.data;
};

// Update student's Status or Delete Student
export const updateStudentStatus = async (id, isActive) => {
  const response = axiosInstance.patch(`/users/students/${id}/status`, {
    isActive,
  });
  return response.data;
};
// Delete
export const deleteStudent = async (id) => {
  const response = await axiosInstance.delete(`/users/students/${id}`);
  return response.data;
};

// Logout User
export const logoutUser = async () => {
  const response = await axiosInstance.post(`/users/admin/logout`);
  return response.data;
};

export const requestActivation = async () => {
  const response = await axiosInstance.post("/admin/request-activation");

  return response.data;
};

export const requestResettOtp = async (data) => {
  const response = await axiosInstance.post(
    "/users/students/forgotPassword/requestOtp",
    data,
  );

  return response.data;
};

export const resetAdminPassword = async (data) => {
  const response = await axiosInstance.post(
    "/users/students/forgotPassword/resetPassword",
    data,
  );

  return response.data;
};
