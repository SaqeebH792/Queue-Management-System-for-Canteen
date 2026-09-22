import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyRegistration } from "../../routes/student.routes";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  KeyRound,
  Mail,
} from "lucide-react";

export default function VerifyStudentOtp() {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);

  const [formData, setFormData] = useState({
    otp: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("studentRegistration");

    if (!data) {
      toast.error("Registration session expired. Please register again.");

      navigate("/student/signup", {
        replace: true,
      });

      return;
    }

    try {
      setStudentData(JSON.parse(data));
    } catch (err) {
      toast.error("Invalid session state. Please register again.");
      navigate("/student/signup", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "otp") {
      setFormData((prev) => ({
        ...prev,
        otp: value.replace(/\D/g, "").slice(0, 6),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPasswordRequirements = (pwd) => [
    { label: "8+ characters", met: pwd.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(pwd) },
    { label: "Lowercase letter", met: /[a-z]/.test(pwd) },
    { label: "Number", met: /\d/.test(pwd) },
    { label: "Special symbol", met: /[@$!%*#/.()?&]/.test(pwd) },
  ];

  const requirements = getPasswordRequirements(formData.password);
  const isPasswordValid = requirements.every((req) => req.met);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentData) return;

    if (formData.otp.length !== 6) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please satisfy all password requirements.");
      return;
    }

    const toastId = toast.loading("Verifying code & creating account...");

    try {
      setLoading(true);

      const response = await verifyRegistration({
        registrationNo: studentData.registrationNo,
        cnic: studentData.cnic,
        email: studentData.email,
        otp: formData.otp,
        password: formData.password,
      });

      toast.success(response?.message || "Registration successful!", {
        id: toastId,
      });

      sessionStorage.removeItem("studentRegistration");

      navigate("/student/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Verification Error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.response?.data?.message ||
            error?.message ||
            "Verification failed. Please try again.";

      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!studentData) return null;

  return (
    <>
      <Helmet>
        <title>Verify Email | Student Portal</title>
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 overflow-hidden">
        {/* Card Container */}
        <div className="relative w-full max-w-md z-10">
          <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#167CC2]/10 text-[#167CC2] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={24} />
              </div>

              <h2 className="text-2xl font-extrabold text-[#1E1F21] dark:text-white tracking-tight">
                Verify Email
              </h2>

              <p className="text-xs font-semibold text-zinc-400">
                Please enter the code sent to
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-xs font-extrabold text-[#167CC2]">
                <Mail size={13} />
                <span>{studentData.email}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* OTP Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                  OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6 digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-extrabold tracking-widest text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                  />
                  <KeyRound
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create strong password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                />

                {/* Real-time Password Requirements Indicator */}
                <div className="pt-2 px-1 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-zinc-400 block">
                    Password Requirements:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {requirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-1.5 text-[11px] font-bold ${
                          req.met
                            ? "text-emerald-500"
                            : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {req.met ? (
                          <CheckCircle2 size={13} className="shrink-0" />
                        ) : (
                          <Circle size={13} className="shrink-0" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading || formData.otp.length !== 6 || !isPasswordValid
                }
                className="w-full py-3.5 px-4 rounded-full bg-[#167CC2] hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? "Creating Account..." : "Verify & Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
