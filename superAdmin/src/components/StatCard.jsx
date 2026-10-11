const StatCard = ({ title, value, subtitle, icon: Icon, tone = "blue" }) => {
  const tones = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    purple: "bg-violet-500/10 text-violet-400",
    red: "bg-rose-500/10 text-rose-400",
  };
  return (
    <div className="panel group p-5 transition hover:border-white/12 hover:bg-[#181e24]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.blue}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};
export default StatCard;
