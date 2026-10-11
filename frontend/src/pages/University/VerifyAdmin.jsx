import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { verifyOtp } from "../../routes/university.routes";

const maskEmail = emailStr => {
  if (!emailStr || !emailStr.includes("@")) return emailStr;

  const [localPart, domainPart] = emailStr.split("@");

  let maskedLocal = localPart;
  if (localPart.length > 3) {
    const visiblePrefix = localPart.slice(0, 3);
    const visibleSuffix = localPart.slice(-1);
    maskedLocal = `${visiblePrefix}${"*".repeat(localPart.length - 4 || 3)}${visibleSuffix}`;
  } else if (localPart.length > 1) {
    maskedLocal = `${localPart[0]}${"*".repeat(localPart.length - 1)}`;
  }

  const domainParts = domainPart.split(".");
  const domainName = domainParts[0];
  const domainExt = domainParts.slice(1).join(".");

  let maskedDomain = domainName;
  if (domainName.length > 2) {
    maskedDomain = `${domainName[0]}${"*".repeat(domainName.length - 2)}${domainName.slice(-1)}`;
  }

  return `${maskedLocal}@${maskedDomain}.${domainExt}`;
};

function VerifyAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    otp: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("verifyEmail") || "";

  useEffect(() => {
    if (!email) {
      toast.error("Registration session expired. Please register again.");
      navigate("/admin/register", { replace: true });
    }
  }, [navigate, email]);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === "otp") {
      setFormData(prev => ({
        ...prev,
        otp: value.replace(/\D/g, "").slice(0, 6),
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email) return;

    if (formData.otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp({
        email,
        otp: formData.otp,
        password: formData.password,
      });

      toast.success(response?.message || "Verification successful.");

      sessionStorage.removeItem("verifyEmail");

      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  const LABEL_CLASS =
    "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300";

  const INPUT_CLASS =
    "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B0F17] px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white dark:bg-[#131926] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all duration-300 my-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors duration-300">
            Verify OTP
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
            Enter the OTP sent to
          </p>

          <p className="font-semibold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 break-all mt-1">
            {maskEmail(email)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={LABEL_CLASS}>OTP Code</label>

            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              required
              className={`${INPUT_CLASS} font-mono tracking-widest`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              required
              className={INPUT_CLASS}
            />
          </div>

          <button
            type="submit"
            disabled={loading || formData.otp.length !== 6 || formData.password.length < 8}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all duration-300 disabled:opacity-40 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default VerifyAdmin;
