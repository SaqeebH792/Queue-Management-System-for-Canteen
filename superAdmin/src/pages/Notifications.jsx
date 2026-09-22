import { useEffect, useState } from "react";
import { Bell, CheckCheck, Clock3 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications } from "../features/notifications/notificationApi";
import { markAllRead, setNotifications } from "../features/notifications/notificationSlice";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const Notifications = () => {
  const dispatch=useDispatch(); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const notifications=useSelector(s=>s.notifications.notifications);
  useEffect(()=>{(async()=>{try{const r=await getNotifications();dispatch(setNotifications(r.data||[]))}catch(e){setError(e.response?.data?.message||"Failed to load notifications")}finally{setLoading(false)}})()},[dispatch]);
  return <div className="fade-in"><PageHeader title="Notifications" description="System and activation updates delivered to the Super Admin." action={notifications.length>0&&<button onClick={()=>dispatch(markAllRead())} className="btn-secondary flex items-center gap-2"><CheckCheck size={15}/>Mark all read</button>}/>
    {error&&<div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
    <div className="panel overflow-hidden">{loading?<div className="flex h-64 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-blue-500"/></div>:notifications.length===0?<EmptyState message="You're all caught up. No notifications available."/>:<div>{notifications.map((n,i)=><div key={n._id||i} className="border-b border-white/[.05] px-5 py-5 last:border-b-0"><div className="flex gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.type==='ActivationApproved'?'bg-emerald-500/10 text-emerald-400':n.type==='ActivationRejected'?'bg-rose-500/10 text-rose-400':'bg-blue-500/10 text-blue-400'}`}><Bell size={17}/></div><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><h3 className="text-sm font-semibold text-slate-200">{n.title||"Notification"}</h3><div className="flex items-center gap-1 text-[10px] text-slate-600"><Clock3 size={12}/>{n.createdAt?new Date(n.createdAt).toLocaleString():""}</div></div><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{n.message}</p></div></div></div>)}</div>}</div>
  </div>;
};
export default Notifications;
