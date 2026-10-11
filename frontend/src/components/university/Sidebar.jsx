import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { X, PanelLeftClose, PanelLeft, Menu, Sparkles } from "lucide-react";

function Sidebar({
  links = [],
  profileLinks = [],
  user,
  isLoading = false,
  defaultCollapsed = false,
  onUpgrade,
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const universityName = user?.data?.user?.universityName || "";
  const role = user?.data?.role || "";

  const activateAccountLink = links.find(link => link.to?.includes("activateAccount"));

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else if (activateAccountLink?.to) {
      navigate(activateAccountLink.to);
    }
  };

  const renderIcon = (Icon, isActive) => {
    if (!Icon) return null;
    if (typeof Icon === "function" || (typeof Icon === "object" && Icon.render)) {
      const IconComponent = Icon;
      return (
        <IconComponent
          className={`w-5 h-5 shrink-0 transition-colors ${
            isActive ? "text-[#1E1F21]" : "text-zinc-400 group-hover:text-white"
          }`}
        />
      );
    }
    return <span className="w-5 h-5 shrink-0 flex items-center justify-center">{Icon}</span>;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-5 left-4 z-30 p-2.5 bg-[#1E1F21] text-white rounded-full shadow-md focus:outline-none"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#1E1F21] text-zinc-300 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } ${isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full justify-between p-4">
          <div className="space-y-6">
            <div
              className={`flex items-center transition-all ${
                isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"
              }`}
            >
              {(!isCollapsed || isMobileOpen) && (
                <NavLink
                  to="."
                  className="flex items-center gap-3 min-w-0 focus:outline-none group"
                >
                  <div className="w-9 h-9 rounded-2xl bg-[#D2F535] flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-[#1E1F21] text-base">
                      {universityName ? universityName.charAt(0).toUpperCase() : "F"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-sm font-extrabold text-white tracking-tight block truncate">
                      {universityName || "flux"}
                    </span>
                    {role && (
                      <p className="text-[11px] text-zinc-400 truncate font-medium">{role}</p>
                    )}
                  </div>
                </NavLink>
              )}

              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-all focus:outline-none"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeft className="w-5 h-5 text-[#D2F535]" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-1.5 text-zinc-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1.5">
              {links.map((link, index) => (
                <NavLink
                  key={link.to || index}
                  to={link.to}
                  end={link.end}
                  title={isCollapsed && !isMobileOpen ? link.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-white text-[#1E1F21]"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                    } ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {renderIcon(link.icon, isActive)}

                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate flex-1">{link.label}</span>
                      )}

                      {(!isCollapsed || isMobileOpen) && link.badge && (
                        <span className="bg-[#D2F535] text-[#1E1F21] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            {Boolean(activateAccountLink) && (!isCollapsed || isMobileOpen) && (
              <div className="bg-[#D2F535] text-[#1E1F21] rounded-3xl p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm tracking-tight">Upgrade to Pro</h4>
                    <Sparkles className="w-3.5 h-3.5 fill-[#1E1F21]" />
                  </div>
                  <p className="text-[11px] font-medium leading-tight text-[#1E1F21]/80">
                    Upgrade your account for a fuller experience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUpgradeClick}
                  className="w-full bg-[#1E1F21] text-white text-xs font-extrabold py-2.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Upgrade Now
                </button>
              </div>
            )}
            <div className="pt-2 space-y-1 border-t border-zinc-800">
              {profileLinks.map((pLink, idx) => {
                if (pLink.onClick) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={pLink.onClick}
                      title={isCollapsed && !isMobileOpen ? pLink.label : undefined}
                      className={`w-full group flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all ${
                        isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
                      }`}
                    >
                      {renderIcon(pLink.icon, false)}
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{pLink.label}</span>
                      )}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={idx}
                    to={pLink.to}
                    title={isCollapsed && !isMobileOpen ? pLink.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? "bg-white text-[#1E1F21]"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                      } ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {renderIcon(pLink.icon, isActive)}
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="truncate">{pLink.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
