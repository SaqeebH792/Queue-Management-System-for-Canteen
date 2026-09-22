import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function StudentProtectedRoute() {
  const { loading, isAuthenticated } = useSelector(
    (state) => state.studentAuth,
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}

export default StudentProtectedRoute;
