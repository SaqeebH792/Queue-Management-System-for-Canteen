import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import NotificationListener from "./pages/Notifications/NotificationListener";
import { Provider } from "react-redux";
import { store } from "./store/store";
import ProtectedRoute from "./routes/ProtectedRoute";
import Notifications from "./pages/Notifications/Notifications";

import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
// University Admin
import RegisterAdmin from "./pages/University/RegisterAdmin";
import UniversityAdminLogin from "./pages/University/UniversityAdminLogin";
import UniversityAdminDashboard from "./pages/University/UniversityAdminDashboard";
import UpdateAdminProfile from "./pages/UniAdmin/UpdateAdminProfile";
import RequestActivation from "./pages/UniAdmin/RequestActivation";
import VerifyAdmin from "./pages/University/VerifyAdmin";
// Uni Admin Features
import RegisterCanteenAdmin from "./pages/UniAdmin/RegisterCanteenAdmin";
import UploadStudents from "./pages/UniAdmin/UploadStudents";

// Student

import StudentProtectedRoute from "./routes/StudentProtectedRoute";
import StudentLayout from "./layout/StudentLayout";
import LandingPage from "./pages/Student/LandingPage";
import Studentsignup from "./pages/Student/Studentsignup";
import VerifyStudentOtp from "./pages/Student/VerifyStudentOtp";
import StudentLogin from "./pages/Student/StudentLogin";
import ProductDetail from "./pages/Student/ProductDetail";
import MyOrders from "./pages/Student/MyOrders";
import UpdateStudentProfile from "./pages/Student/UpdateStudentProfile";
// Canteen Admin
import CanteenAdminLogin from "./pages/Canteen/CanteenAdminLogin";
import CanteenAdminDashboard from "./pages/Canteen/CanteenAdminDashboard";
import AdminLayout from "./layout/AdminLayout";
import CanteenLayout from "./layout/CanteenLayout";
import Analytics from "./pages/Canteen/Analytics";
import UploadProducst from "./pages/Canteen/UploadProducst";
import Products from "./pages/Canteen/Products";
import UpdateCanteenAdminProfile from "./pages/Canteen/UpdateCanteenAdminProfile";
// Combine
import ResetPassword from "./components/ResetPassword";
import VerifyOrder from "./pages/Canteen/VerifyOrder";
import AdminResetPassword from "./pages/UniAdmin/AdminResetPassword";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Student Layout */}
      <Route element={<StudentLayout />}>
        {/* Public routes */}
        <Route index element={<LandingPage />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="student/signup" element={<Studentsignup />} />
        <Route path="/student/verify" element={<VerifyStudentOtp />} />
        <Route path="student/login" element={<StudentLogin />} />
        <Route path="student/resetPassword" element={<ResetPassword />} />
        {/* Protected routes */}
        <Route element={<StudentProtectedRoute />}>
          <Route path="myOrders" element={<MyOrders />} />
          <Route path="updateProfile" element={<UpdateStudentProfile />} />
        </Route>
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* University Admin Public Routes */}
      <Route path="/admin/register" element={<RegisterAdmin />} />
      <Route path="/admin/verify" element={<VerifyAdmin />} />
      <Route path="/admin/login" element={<UniversityAdminLogin />} />
      <Route path="/admin/resetPassword" element={<AdminResetPassword />} />
      {/* University Admin Protected */}
      <Route
        element={
          <ProtectedRoute
            redirectTo="/admin/login"
            allowedRoles={["University Admin"]}
          />
        }
      >
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<UniversityAdminDashboard />} />
          <Route path="register-canteen" element={<RegisterCanteenAdmin />} />
          <Route path="uploadStudents" element={<UploadStudents />} />
          <Route path="updateProfile" element={<UpdateAdminProfile />} />
          <Route path="activateAccount" element={<RequestActivation />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Canteen Public */}
      <Route path="/canteenAdmin/login" element={<CanteenAdminLogin />} />

      {/* Canteen Protected */}
      <Route
        element={
          <ProtectedRoute
            redirectTo="/canteenAdmin/login"
            allowedRoles={["Canteen Admin"]}
          />
        }
      >
        <Route path="/canteenAdmin/dashboard" element={<CanteenLayout />}>
          <Route index element={<CanteenAdminDashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="uploadProducts" element={<UploadProducst />} />
          <Route path="verifyOrder" element={<VerifyOrder />} />
          <Route path="updateProfile" element={<UpdateCanteenAdminProfile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>
    </>,
  ),
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          <NotificationListener />
          <RouterProvider router={router} />
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                zIndex: 9999,
              },
            }}
          />
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
);
