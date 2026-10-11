import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import NotificationBell from "../NotificationBell";

function Navbar({ links = [], profileLinks = [], user }) {
  const { darkMode, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitial = () => {
    if (user?.email && typeof user.email === "string") {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const linkStyle = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-[#A93226] dark:text-[#E74C3C] font-semibold"
        : "text-slate-700 dark:text-slate-300 hover:text-[#A93226] dark:hover:text-[#E74C3C]"
    }`;

  const mobileLinkStyle = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
      isActive
        ? "text-[#A93226] dark:text-[#E74C3C] bg-[#F3E5E1]/50 dark:bg-[#2B2D30] font-semibold"
        : "text-slate-700 dark:text-slate-300 hover:text-[#A93226] dark:hover:text-[#E74C3C] hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF3F0]/90 dark:bg-[#1E1F21]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/80 transition-colors duration-300">
      <div ref={mobileMenuRef} className="max-w-7xl mx-auto px-6 transition-all duration-300">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <NavLink
              to="/"
              className="text-2xl font-serif font-bold text-[#A93226] dark:text-[#E74C3C] tracking-tight transition-transform hover:scale-[1.01]"
            >
              UniBite
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link, index) => (
              <NavLink key={link.to || index} to={link.to} end={link.end} className={linkStyle}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user && <NotificationBell />}

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {!user ? (
              <NavLink
                to="/student/login"
                className="bg-[#A93226] hover:bg-[#8B0000] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm active:scale-95"
              >
                Order Now
              </NavLink>
            ) : (
              <div ref={profileRef} className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#A93226]/40 hover:border-[#A93226] transition-all duration-200 overflow-hidden focus:outline-none active:scale-95 shadow-xs"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#A93226] text-white font-semibold flex items-center justify-center text-sm">
                      {getUserInitial()}
                    </div>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white/95 dark:bg-[#2B2D30]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 transition-all">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {profileLinks.map((item, index) =>
                        item.onClick ? (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              item.onClick();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
                          >
                            {item.icon && (
                              <span className="w-4 h-4 text-slate-500 dark:text-slate-400">
                                {item.icon}
                              </span>
                            )}
                            {item.label}
                          </button>
                        ) : (
                          <NavLink
                            key={index}
                            to={item.to}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
                          >
                            {item.icon && (
                              <span className="w-4 h-4 text-slate-500 dark:text-slate-400">
                                {item.icon}
                              </span>
                            )}
                            {item.label}
                          </NavLink>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user && (
              <div className="md:hidden ml-1">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle Mobile Menu"
                  className="p-2.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {user && isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 py-4 space-y-3">
            <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation Menu
            </p>

            <div className="space-y-1 px-1">
              {links.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  end={link.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileLinkStyle}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
