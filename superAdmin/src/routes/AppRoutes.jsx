import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ActivationRequests from "../pages/ActivationRequests";
import UniversityAdmins from "../pages/UniversityAdmins";
import Notifications from "../pages/Notifications";
import ProtectedRoute from "./ProtectedRoutes";
import SuperAdminLayout from "../layout/SuperAdminLayout";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activation-requests" element={<ActivationRequests />} />
          <Route path="/university-admins" element={<UniversityAdmins />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);
export default AppRoutes;
