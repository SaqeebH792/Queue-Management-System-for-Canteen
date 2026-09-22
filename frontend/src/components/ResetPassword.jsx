import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

// Import your fallback API services directly
import {
  requestStudentOtp,
  resetStudentPassword,
} from "../routes/student.routes";
const ResetPassword = ({
  requestOtpApi = requestStudentOtp,
  resetPasswordApi = resetStudentPassword,
}) => {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Request OTP Handler
  const handleRequestOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setOtpLoading(true);
      await requestOtpApi({ email: email.trim() });

      toast.success("Verification code sent to your email!");
      setOtpRequested(true);
      setCountdown(60);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to send verification code.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setResetLoading(true);
      await resetPasswordApi({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword,
      });

      toast.success("Password reset successfully! Redirecting...");

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpRequested) {
      handleRequestOtp();
    } else {
      handleResetPassword();
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | Student Portal</title>
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 overflow-hidden">
        <div className="relative w-full max-w-md z-10">
          <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="p-2 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-[#1E1F21] dark:text-zinc-200 hover:opacity-80 transition-all cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-10 h-10 rounded-full bg-[#167CC2]/10 text-[#167CC2] flex items-center justify-center">
                <KeyRound size={20} />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-extrabold text-[#1E1F21] dark:text-white tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
                {otpRequested
                  ? "Enter the code sent to your email and set your new password."
                  : "Enter your registered email address to receive a verification code."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    disabled={otpRequested}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <Mail
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                </div>
              </div>

              {!otpRequested ? (
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3.5 px-4 rounded-full bg-[#167CC2] hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              ) : (
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpRequested(false)}
                    className="text-xs font-semibold text-zinc-400 hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={countdown > 0 || otpLoading}
                    className="text-xs font-extrabold text-[#167CC2] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Resend code in ${countdown}s`
                      : "Resend Code"}
                  </button>
                </div>
              )}

              {/* Step 2 Inputs */}
              {otpRequested && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                      Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-extrabold tracking-widest text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                      />
                      <ShieldCheck
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                      />
                      <Lock
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3.5 px-4 rounded-full bg-[#167CC2] hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
