import { Inbox } from "lucide-react";
const EmptyState = ({ message = "No records found" }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[.04] text-slate-500">
      <Inbox size={20} />
    </div>
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);
export default EmptyState;
