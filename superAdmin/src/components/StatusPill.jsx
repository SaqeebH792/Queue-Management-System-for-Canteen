const StatusPill = ({ status }) => <span className={`status-pill status-${String(status || "unknown").toLowerCase()}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status || "Unknown"}</span>;
export default StatusPill;
