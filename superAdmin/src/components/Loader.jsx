const Loader = ({ full = false }) => (
  <div className={full ? "min-h-screen flex items-center justify-center bg-[#0d1115]" : "flex min-h-[360px] items-center justify-center"}>
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
  </div>
);
export default Loader;
