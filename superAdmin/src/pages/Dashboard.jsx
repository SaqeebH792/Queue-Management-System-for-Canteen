/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, ClipboardCheck, GraduationCap, ShoppingBag, ShieldCheck, TrendingUp, XCircle } from "lucide-react";
import { getDashboardStats } from "../features/dashboardApi";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";

const num = (v) => new Intl.NumberFormat("en-US").format(v || 0);
const pct = (v, total) => total ? Math.round((v / total) * 100) : 0;

const Donut = ({ percent, color, label }) => (
  <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${percent}%, #2a323a ${percent}% 100%)` }}>
    <div className="absolute inset-[13px] flex flex-col items-center justify-center rounded-full bg-[#151a1f]">
      <span className="text-3xl font-semibold text-white">{percent}%</span><span className="mt-1 text-[11px] text-slate-500">{label}</span>
    </div>
  </div>
);

const ProgressRow = ({ label, value, total, color }) => {
  const p = pct(value, total);
  return <div>
    <div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: color }}/><span className="text-xs text-slate-400">{label}</span></div><span className="text-xs font-semibold text-slate-200">{num(value)}</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-[#293139]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, background: color }}/></div>
  </div>;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const fetchStats = async () => { try { setError(""); const r = await getDashboardStats(); setStats(r.data); } catch (e) { setError(e.response?.data?.message || "Failed to load dashboard statistics"); } finally { setLoading(false); } };
  useEffect(() => { fetchStats(); }, []);

  const requestTotal = useMemo(() => stats ? Object.values(stats.activationRequests || {}).reduce((a, b) => a + (Number(b) || 0), 0) : 0, [stats]);
  const universityActive = pct(stats?.universities?.active, stats?.universities?.total);
  const adminActive = pct(stats?.universityAdmins?.active, stats?.universityAdmins?.total);

  if (loading) return <Loader />;
  if (error) return <div className="flex min-h-[420px] items-center justify-center"><div className="panel max-w-md p-7 text-center"><XCircle className="mx-auto mb-3 text-rose-400"/><h2 className="font-semibold text-white">Unable to load dashboard</h2><p className="mt-1 text-sm text-slate-500">{error}</p><button onClick={fetchStats} className="btn-primary mt-5">Try again</button></div></div>;
  if (!stats) return null;

  return <div className="fade-in">
    <PageHeader title="Dashboard" description="A real-time overview of the UniBite platform." action={<div className="flex items-center gap-2 rounded-lg border border-white/[.07] bg-white/[.025] px-3 py-2 text-xs text-slate-400"><Activity size={15} className="text-blue-400"/> Platform overview</div>} />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total Universities" value={num(stats.universities.total)} subtitle={`${num(stats.universities.active)} currently active`} icon={Building2} tone="blue" />
      <StatCard title="University Admins" value={num(stats.universityAdmins.total)} subtitle={`${num(stats.universityAdmins.active)} active accounts`} icon={ShieldCheck} tone="purple" />
      <StatCard title="Total Students" value={num(stats.students.total)} subtitle="Registered across universities" icon={GraduationCap} tone="green" />
      <StatCard title="Total Orders" value={num(stats.orders.total)} subtitle="Orders recorded by UniBite" icon={ShoppingBag} tone="amber" />
    </div>

    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,.75fr)]">
      <div className="panel p-5 sm:p-6">
        <div className="flex items-start justify-between"><div><h2 className="text-base font-semibold text-white">University & Admin Status</h2><p className="mt-1 text-xs text-slate-500">Current account availability across the platform</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><Building2 size={17}/></div></div>
        <div className="mt-7 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center gap-6 sm:flex-row md:flex-col xl:flex-row"><Donut percent={universityActive} color="#3b82f6" label="Active"/><div className="w-full space-y-4"><ProgressRow label="Active Universities" value={stats.universities.active} total={stats.universities.total} color="#3b82f6"/><ProgressRow label="Inactive Universities" value={stats.universities.inactive} total={stats.universities.total} color="#64748b"/><div className="border-t border-white/[.06] pt-3"><div className="flex justify-between text-xs"><span className="text-slate-500">Total</span><span className="font-semibold text-white">{num(stats.universities.total)}</span></div></div></div></div>
          <div className="flex flex-col items-center gap-6 sm:flex-row md:flex-col xl:flex-row"><Donut percent={adminActive} color="#8b5cf6" label="Active"/><div className="w-full space-y-4"><ProgressRow label="Active Admins" value={stats.universityAdmins.active} total={stats.universityAdmins.total} color="#8b5cf6"/><ProgressRow label="Inactive Admins" value={stats.universityAdmins.inactive} total={stats.universityAdmins.total} color="#64748b"/><div className="border-t border-white/[.06] pt-3"><div className="flex justify-between text-xs"><span className="text-slate-500">Total</span><span className="font-semibold text-white">{num(stats.universityAdmins.total)}</span></div></div></div></div>
        </div>
      </div>

      <div className="panel p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-base font-semibold text-white">Activation Pipeline</h2><p className="mt-1 text-xs text-slate-500">Requests grouped by current status</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><ClipboardCheck size={17}/></div></div>
        <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-[#293139]">{[["pending",stats.activationRequests.pending,"#f59e0b"],["approved",stats.activationRequests.approved,"#34d399"],["rejected",stats.activationRequests.rejected,"#f87171"],["cancelled",stats.activationRequests.cancelled,"#64748b"]].map(([k,v,c]) => v > 0 && <div key={k} style={{width:`${pct(v,requestTotal)}%`,background:c}}/> )}</div>
        <div className="mt-7 space-y-5">
          <ProgressRow label="Pending" value={stats.activationRequests.pending} total={requestTotal} color="#f59e0b"/>
          <ProgressRow label="Approved" value={stats.activationRequests.approved} total={requestTotal} color="#34d399"/>
          <ProgressRow label="Rejected" value={stats.activationRequests.rejected} total={requestTotal} color="#f87171"/>
          <ProgressRow label="Cancelled" value={stats.activationRequests.cancelled} total={requestTotal} color="#64748b"/>
        </div>
        <div className="mt-6 border-t border-white/[.06] pt-4"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">Total requests</span><span className="text-lg font-semibold text-white">{num(requestTotal)}</span></div></div>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="panel p-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><GraduationCap size={17}/></div><div><p className="text-xs text-slate-500">Students</p><p className="text-xl font-semibold text-white">{num(stats.students.total)}</p></div></div><p className="mt-4 text-xs text-slate-500">Total registered student accounts.</p></div>
      <div className="panel p-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><ShoppingBag size={17}/></div><div><p className="text-xs text-slate-500">Orders</p><p className="text-xl font-semibold text-white">{num(stats.orders.total)}</p></div></div><p className="mt-4 text-xs text-slate-500">Total orders recorded across the platform.</p></div>
      <div className="panel p-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><TrendingUp size={17}/></div><div><p className="text-xs text-slate-500">Active coverage</p><p className="text-xl font-semibold text-white">{universityActive}%</p></div></div><p className="mt-4 text-xs text-slate-500">Share of universities currently active.</p></div>
    </div>
    <p className="mt-5 text-right text-[10px] text-slate-600">Data generated {stats.generatedAt ? new Date(stats.generatedAt).toLocaleString() : "recently"}</p>
  </div>;
};
export default Dashboard;
