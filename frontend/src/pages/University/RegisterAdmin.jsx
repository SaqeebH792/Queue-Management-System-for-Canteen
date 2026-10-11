import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminSignup } from "../../routes/university.routes";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  Building2,
  Globe,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const normalizeDomain = domainStr => {
  if (!domainStr) return "";
  return domainStr
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
};

function RegisterAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    universityName: "",
    domain: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizedDomain = useMemo(() => normalizeDomain(formData.domain), [formData.domain]);
  const emailDomain = useMemo(
    () => formData.email.trim().toLowerCase().split("@")[1] || "",
    [formData.email]
  );
  const isDomainMatching = useMemo(() => {
    if (!normalizedDomain || !emailDomain) return null;
    return normalizedDomain === emailDomain;
  }, [normalizedDomain, emailDomain]);

  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      universityName: formData.universityName.trim(),
      domain: normalizedDomain,
      email: formData.email.trim().toLowerCase(),
    };

    if (!payload.universityName || !payload.domain || !payload.email) {
      toast.error("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailDomain !== payload.domain) {
      toast.error("Email domain does not match university domain");
      return;
    }

    try {
      setLoading(true);

      const response = await adminSignup(payload);

      toast.success(response?.message || "OTP sent successfully");

      sessionStorage.setItem("verifyEmail", payload.email);

      navigate("/admin/verify");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Too many attempts. Please wait before requesting another OTP.");
        return;
      }

      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>University Admin Registration | Campus Canteen</title>
      </Helmet>

      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#121315] text-[#1E1F21] dark:text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
        <div className="w-full max-w-xl my-auto">
          <div className="bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 md:p-10 shadow-xs space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1F21] dark:text-white">
                Register University
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto font-medium">
                Set up your institutional dashboard to manage campus students and canteen vendors.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="universityName"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-400"
                  >
                    University Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      id="universityName"
                      type="text"
                      name="universityName"
                      value={formData.universityName}
                      onChange={handleChange}
                      placeholder="Stanford University"
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="domain"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-400"
                  >
                    University Domain
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      id="domain"
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      placeholder="university.edu"
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium pl-2">
                    Omit <code className="text-[#167CC2] font-semibold">https://</code> prefix.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-400"
                >
                  Official Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@university.edu"
                    required
                    className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                  />
                </div>
              </div>
              {isDomainMatching !== null && (
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    isDomainMatching
                      ? "bg-[#D2F535]/15 border-[#D2F535]/40 text-[#1E1F21] dark:text-zinc-100"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {isDomainMatching ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#167CC2]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                  )}
                  <p className="text-xs font-bold leading-tight">
                    {isDomainMatching
                      ? `Domain matches: @${normalizedDomain}`
                      : `Email domain must match "@${normalizedDomain || "your-domain"}"`}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-[#167CC2] hover:bg-[#167CC2]/90 text-white font-extrabold rounded-full transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Verification OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium">
              <div className="text-zinc-500 dark:text-zinc-400">
                Already registered?{" "}
                <Link to="/admin/login" className="font-extrabold text-[#167CC2] hover:underline">
                  Sign In
                </Link>
              </div>

              <Link
                to="resetPassword"
                className="text-zinc-400 hover:text-[#1E1F21] dark:hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            Encrypted &amp; System-verified university authentication
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterAdmin;
