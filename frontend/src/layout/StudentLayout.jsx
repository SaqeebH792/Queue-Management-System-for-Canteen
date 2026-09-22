import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/student/Navbar";
import { verifyStudentAuth, logoutStudent } from "../store/studentAuthSlice";

import { User, LogOut } from "lucide-react";

function StudentLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.studentAuth);

  useEffect(() => {
    dispatch(verifyStudentAuth());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutStudent());
    navigate("/", { replace: true });
  };

  const links = [];
  if (isAuthenticated) {
    links.push({
      label: "My Orders",
      to: "/myOrders",
    });
  }

  const profileLinks = [
    {
      label: "Update Profile",
      to: "/updateProfile",
      icon: <User size={16} />,
      user,
    },
    {
      label: "Logout",
      icon: <LogOut size={16} />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbece5] dark:bg-[#1E1F21] text-[#2C1810] dark:text-[#E8E8E8] transition-colors duration-300 relative">
      {/* Warm Ambient Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#A93226]/5 dark:bg-[#A93226]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#F3E5E1]/30 dark:bg-[#2B2D30]/30 rounded-full blur-3xl" />
      </div>

      <header>
        <Navbar
          links={links}
          profileLinks={profileLinks}
          user={isAuthenticated ? user : null}
        />
      </header>

      {/* Top padding prevents fixed header overlap */}
      <main className="relative z-10 ">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
