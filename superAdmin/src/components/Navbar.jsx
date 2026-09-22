import { useState } from "react";
import { Bell, Menu, Moon, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenu }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { superAdmin } = useSelector((s) => s.auth);
  const { unreadCount, notifications } = useSelector((s) => s.notifications);
  const recent = notifications.slice(0, 3);

  return (
    <header className="sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-white/[.06] bg-[#0d1115]/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"><Menu size={20}/></button>
        <div className="hidden items-center gap-2 rounded-lg border border-white/[.06] bg-white/[.025] px-3 py-2 text-xs text-slate-500 md:flex"><Search size={15}/><span>Search UniBite</span><kbd className="ml-8 rounded border border-white/[.08] px-1.5 py-0.5 text-[9px]">⌘ K</kbd></div>
      </div>
      <div className="flex items-center gap-2">
        <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-200 sm:block"><Moon size={17}/></button>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><Bell size={18}/>{unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>
          {open && <>
            <button className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-11 z-40 w-[340px] overflow-hidden rounded-xl border border-white/[.08] bg-[#171d23] shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/[.06] px-4 py-3"><div><p className="text-sm font-semibold text-white">Notifications</p><p className="text-[11px] text-slate-500">{unreadCount} unread</p></div><button onClick={() => { setOpen(false); navigate('/notifications'); }} className="text-xs font-semibold text-blue-400 hover:text-blue-300">View all</button></div>
              {recent.length ? recent.map((n) => <div key={n._id} className="border-b border-white/[.04] px-4 py-3"><p className="text-xs font-semibold text-slate-200">{n.title}</p><p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{n.message}</p></div>) : <div className="px-4 py-8 text-center text-xs text-slate-500">No recent notifications</div>}
            </div>
          </>}
        </div>
        <div className="ml-1 flex items-center gap-2 border-l border-white/[.07] pl-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/90 text-[10px] font-bold text-white">SA</div><div className="hidden sm:block"><p className="text-xs font-semibold text-slate-200">Super Admin</p><p className="text-[10px] text-slate-500">{superAdmin?.email || "Admin"}</p></div></div>
      </div>
    </header>
  );
};
export default Navbar;
