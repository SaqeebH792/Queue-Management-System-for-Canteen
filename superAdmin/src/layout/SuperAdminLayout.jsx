import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="page-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-57.5">
        <Navbar onMenu={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-62px)] px-4 py-6 sm:px-6 lg:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default SuperAdminLayout;
