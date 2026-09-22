import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { NavLink } from "react-router-dom";

function Navbar({ user, profileLinks = [], isLoading = false }) {
  const { darkMode, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const currentUser = user?.data?.user || user;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitial = () => {
    if (currentUser?.email && typeof currentUser?.email === "string") {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <header className="h-16 w-full bg-white/80 dark:bg-[#1E1F21]/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors font-sans text-[#1E1F21] dark:text-zinc-100">
      {/* Title / Section Placeholder */}
      <div className="text-xs sm:text-sm font-extrabold text-[#1E1F21] dark:text-white"></div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell Component */}
        <NotificationBell />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-[#D2F535]" />
          ) : (
            <Moon className="w-4 h-4 text-[#1E1F21]" />
          )}
        </button>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Profile Icon Dropdown Trigger */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-[#167CC2] text-white font-extrabold text-xs shadow-xs flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#167CC2]/40 transition-all cursor-pointer"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              getUserInitial()
            )}
          </button>

          {/* Quick Popover Menu for Profile */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E1F21] border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-lg p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <p className="text-xs font-extrabold text-[#1E1F21] dark:text-white truncate">
                  {currentUser?.name || "Admin Account"}
                </p>
                <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">
                  {currentUser?.email || "admin@system.com"}
                </p>
              </div>

              <div className="pt-1 space-y-0.5">
                {profileLinks.map((pLink, idx) =>
                  pLink.onClick ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        pLink.onClick();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      {pLink.icon && (
                        <span className="w-4 h-4 shrink-0">{pLink.icon}</span>
                      )}
                      <span>{pLink.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={idx}
                      to={pLink.to}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-[#F3F4F6] dark:hover:bg-zinc-800 transition-colors"
                    >
                      {pLink.icon && (
                        <span className="w-4 h-4 shrink-0">{pLink.icon}</span>
                      )}
                      <span>{pLink.label}</span>
                    </NavLink>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
