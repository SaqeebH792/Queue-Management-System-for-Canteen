import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { registerCanteenAdmin } from "../../routes/university.routes";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  BadgeAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  Mail,
} from "lucide-react";

function RegisterCanteenAdmin({ user }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Extract user details & status
  const currentUser = user?.data?.user;
  const adminStatus = currentUser?.status || "inactive";
  const isInactive = adminStatus.toLowerCase() === "inactive";
  const canteenAdminCount = currentUser?.canteenAdminCount || 0;

  // Password requirement validator
  const getPasswordRequirements = pwd => [
    { label: "8+ characters", met: pwd.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(pwd) },
    { label: "Lowercase letter", met: /[a-z]/.test(pwd) },
    { label: "Number", met: /\d/.test(pwd) },
    { label: "Special symbol", met: /[@$!%*#/.()?&]/.test(pwd) },
  ];

  const requirements = getPasswordRequirements(formData.password);
  const isPasswordValid = requirements.every(req => req.met);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Guard rule: Limit registration for inactive accounts
    if (isInactive && canteenAdminCount >= 2) {
      toast.error(
        "Inactive account limit reached. Inactive admins can register up to 2 canteen admins."
      );
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password must meet all security requirements.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerCanteenAdmin({
        email,
        password,
      });

      toast.success(response?.message || "Canteen admin registered successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register Canteen Admin - University Admin</title>
      </Helmet>

      <div className="w-full min-h-auto space-y-6 font-sans text-[#1E1F21] dark:text-zinc-100 transition-colors duration-200">
        {/* Navigation & Header */}
        <div className="w-full space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#1E1F21] dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer mb-1 font-semibold"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1F21] dark:text-white">
                Register Canteen Admin
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Create new administrative credentials for canteen personnel.
              </p>
            </div>

            {/* Admin Status Pill */}
            <div className="self-start sm:self-auto shrink-0">
              {isInactive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#B2B0FF] text-[#1E1F21]">
                  <BadgeAlert size={14} />
                  Inactive Account
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#D2F535] text-[#1E1F21]">
                  <ShieldCheck size={14} />
                  Active Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Restriction Notice */}
        {isInactive && showNotice && (
          <div className="w-full flex items-start justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 dark:text-amber-300 text-xs font-medium">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-extrabold text-amber-900 dark:text-amber-200">
                  Account Registration Limit
                </p>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Inactive accounts can register up to{" "}
                  <strong className="text-[#1E1F21] dark:text-white">2 Canteen Admins</strong>.
                  Currently registered:{" "}
                  <strong className="text-[#1E1F21] dark:text-white">{canteenAdminCount}/2</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="p-1 hover:bg-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notice"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Registration Form Card - Full Width */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-[#1E1F21] border border-zinc-100 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6 transition-colors duration-200"
        >
          {/* Inputs Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Canteen Admin Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="canteen.staff@university.edu"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Account Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Security Requirements List */}
          <div className="pt-2">
            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-3">
              Password Security Checklist
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all ${
                    req.met
                      ? "bg-[#D2F535] text-[#1E1F21]"
                      : "bg-[#F3F4F6] dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {req.met ? (
                    <CheckCircle2 size={13} className="shrink-0 text-[#1E1F21]" />
                  ) : (
                    <XCircle size={13} className="shrink-0 text-zinc-400 dark:text-zinc-600" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={
                loading ||
                !formData.email ||
                !isPasswordValid ||
                (isInactive && canteenAdminCount >= 2)
              }
              className="flex-1 py-3 bg-[#167CC2] hover:bg-[#167CC2]/90 text-white font-extrabold text-xs rounded-full transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>Register Canteen Admin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="sm:w-36 py-3 bg-[#F3F4F6] hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#1E1F21] dark:text-zinc-200 font-extrabold text-xs rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default RegisterCanteenAdmin;
