import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/university/Sidebar";
import Navbar from "../components/Navbar";
import { verifyAuth, logoutAction } from "../store/authSlice";

import { LayoutDashboard, Upload, Utensils, UserPlus, User, LogOut } from "lucide-react";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(verifyAuth());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAction()).unwrap();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (err) {
      console.error("Logout runtime error:", err);

      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  const links = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Student Upload",
      to: "/admin/dashboard/uploadStudents",
      icon: Upload,
    },
    {
      label: "Register Canteen",
      to: "/admin/dashboard/register-canteen",
      icon: Utensils,
    },
    {
      label: "Activation Requests",
      to: "/admin/dashboard/activateAccount",
      icon: UserPlus,
    },
  ];

  const profileLinks = [
    {
      label: "Update Profile",
      to: "/admin/dashboard/updateProfile",
      icon: <User className="w-4 h-4" />,
    },
    {
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex transition-colors duration-300 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />

        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <Sidebar links={links} profileLinks={profileLinks} user={user} brandName="EduAdmin Portal" />

      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Navbar user={isAuthenticated ? user : null} profileLinks={profileLinks} />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full h-full mx-auto flex justify-center items-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
