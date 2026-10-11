import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  ClipboardCheck,
  ShieldCheck,
  Bell,
  LogOut,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { logout } from "../auth/authSlice";
import { logoutSuperAdmin } from "../auth/authApi";

const groups = [
  { label: "Overview", items: [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Management",
    items: [
      { name: "Activation Requests", path: "/activation-requests", icon: ClipboardCheck },
      { name: "University Admins", path: "/university-admins", icon: ShieldCheck },
    ],
  },
  { label: "System", items: [{ name: "Notifications", path: "/notifications", icon: Bell }] },
];

const Sidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { superAdmin } = useSelector(s => s.auth);
  const { unreadCount } = useSelector(s => s.notifications);

  const handleLogout = async () => {
    try {
      await logoutSuperAdmin();
    } catch (error) {
      console.debug("Logout request failed", error);
    }
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}
      <aside
        className={`mobile-sidebar sidebar-transition fixed inset-y-0 left-0 z-40 flex w-57.5 flex-col border-r border-white/6 bg-[#151a1f] lg:translate-x-0 ${open ? "open" : ""}`}
      >
        <div className="flex h-15.5 items-center justify-between border-b border-white/6 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/20">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">UniBite</p>
              <p className="text-[10px] text-slate-500">Super Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-scrollbar flex-1 overflow-y-auto px-3 py-5">
          {groups.map(group => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-600">
                {group.label}
              </p>
              <nav className="space-y-1">
                {group.items.map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-[#202830] text-white" : "text-slate-400 hover:bg-white/[.035] hover:text-slate-200"}`
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="flex-1">{name}</span>
                    {name === "Notifications" && unreadCount > 0 && (
                      <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/2.5 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-200">Super Admin</p>
              <p className="truncate text-[10px] text-slate-500">
                {superAdmin?.email || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
