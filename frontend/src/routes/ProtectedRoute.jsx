import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyAuth } from "../store/authSlice";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import FullscreenLoader from "../components/FullscreenLoader";
const ProtectedRoute = ({ redirectTo, allowedRoles = [] }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(verifyAuth());
  }, [dispatch]);
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  if (loading) {
    return <FullscreenLoader label="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.data?.user.role)
  ) {
    return <Navigate replace to="/admin/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
