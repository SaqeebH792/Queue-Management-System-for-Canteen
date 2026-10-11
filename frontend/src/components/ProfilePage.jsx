import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Pencil, Loader2, User, ShieldCheck, Mail, Lock } from "lucide-react";
import { requestOtp, updateProfile, updatePassword } from "../routes/student.routes";

const ProfilePage = ({ user, isLoading }) => {
  const [activeTab, setActiveTab] = useState("personal");

  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!avatar) {
      setPreview(user?.avatar || "");
      return;
    }
    const objectUrl = URL.createObjectURL(avatar);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar, user]);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image size should be less than 5MB.");
      return;
    }

    setAvatar(file);
    toast.info("New photo selected. Click 'Save Changes' to update.");
  };

  const handleRemoveImage = () => {
    setAvatar(null);
    setPreview(user?.avatar || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRequestOtp = async () => {
    if (!newEmail.trim()) {
      toast.warning("Please enter your new email address.");
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast.warning("New email cannot be the same as your current email.");
      return;
    }

    setOtpLoading(true);

    toast.promise(
      requestOtp({
        oldEmail: user?.email,
        newEmail,
      }),
      {
        loading: "Sending verification code...",
        success: () => {
          setShowOtpField(true);
          setCountdown(60);
          return "Verification code sent to your new email.";
        },
        error: error => error?.response?.data?.message || "Failed to send verification code.",
        finally: () => setOtpLoading(false),
      }
    );
  };

  const handleSavePersonalDetails = async () => {
    if (avatar) {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append("avatar", avatar);

      toast.promise(updateProfile(formData), {
        loading: "Uploading profile photo...",
        success: () => {
          setAvatar(null);
          return "Profile photo updated successfully!";
        },
        error: error => error?.response?.data?.message || "Failed to update profile photo.",
        finally: () => setAvatarLoading(false),
      });
    }

    if (newEmail.trim() && newEmail.toLowerCase() !== user?.email?.toLowerCase()) {
      if (!showOtpField) {
        toast.warning("Please click 'Get OTP' to send a verification code first.");
        return;
      }

      if (!otp.trim()) {
        toast.warning("Please enter the verification code sent to your email.");
        return;
      }

      setEmailLoading(true);
      const formData = new FormData();
      formData.append("oldEmail", user?.email);
      formData.append("newEmail", newEmail);
      formData.append("confirmationOTP", otp);

      toast.promise(updateProfile(formData), {
        loading: "Updating email address...",
        success: () => {
          setNewEmail("");
          setOtp("");
          setShowOtpField(false);
          setCountdown(0);
          return "Email address updated successfully!";
        },
        error: error => error?.response?.data?.message || "Failed to update email address.",
        finally: () => setEmailLoading(false),
      });
    }
  };

  const handleUpdatePassword = async e => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.warning("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.warning("New password must be at least 8 characters long.");
      return;
    }

    setPasswordLoading(true);

    toast.promise(
      updatePassword({
        currentPassword,
        newPassword,
      }),
      {
        loading: "Updating password...",
        success: () => {
          setCurrentPassword("");
          setNewPassword("");
          return "Password updated successfully.";
        },
        error: error => error?.response?.data?.message || "Failed to update password.",
        finally: () => setPasswordLoading(false),
      }
    );
  };

  if (isLoading || !user) {
    return (
      <>
        <Helmet>
          <title>Update Profile</title>
        </Helmet>
        <div className="w-full h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#167CC2]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Update Profile - Campus Canteen</title>
      </Helmet>

      <div className="w-full min-h-screen space-y-6 font-sans text-[#1E1F21] dark:text-zinc-100 transition-colors duration-200">
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1F21] dark:text-white">
            Update Profile
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Manage your personal details and account security preferences.
          </p>
        </div>

        <div className="inline-flex p-1 bg-[#F3F4F6] dark:bg-[#2B2D30] rounded-full gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "personal"
                ? "bg-[#D2F535] text-[#1E1F21] shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-[#1E1F21] dark:hover:text-white"
            }`}
          >
            <User size={14} />
            <span>Personal Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-[#D2F535] text-[#1E1F21] shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-[#1E1F21] dark:hover:text-white"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Security</span>
          </button>
        </div>

        <div className="w-full bg-white dark:bg-[#1E1F21] border border-zinc-100 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6 transition-colors duration-200">
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="bg-[#F3F4F6] dark:bg-[#2B2D30] border border-zinc-200/80 dark:border-zinc-700/50 rounded-[22px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 relative ring-2 ring-white dark:ring-zinc-800">
                    <img
                      src={preview || "/default-avatar.png"}
                      alt={user?.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#167CC2] text-white hover:bg-[#167CC2]/90 transition-colors cursor-pointer shadow-md"
                    aria-label="Upload photo"
                  >
                    <Pencil size={12} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-extrabold text-[#1E1F21] dark:text-white">
                    Profile Picture
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Recommended dimensions: 400x400px. Maximum size: 5MB (JPG or PNG).
                  </p>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-[#2B2D30] border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                    >
                      Remove Selected Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider  text-zinc-400">
                    Current Official Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={16}
                    />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-zinc-100 dark:bg-[#2B2D30] border-none text-zinc-400 dark:text-zinc-500 text-xs font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                      New Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                        size={16}
                      />
                      <input
                        type="email"
                        placeholder="new.email@university.edu"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F3F4F6] dark:bg-[#2B2D30] border-none text-[#1E1F21] dark:text-zinc-100 text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={otpLoading || countdown > 0}
                    className="w-full py-3 px-4 rounded-full bg-[#F3F4F6] hover:bg-zinc-200 dark:bg-[#2B2D30] dark:hover:bg-zinc-700 text-[#1E1F21] dark:text-zinc-200 text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      "Get OTP"
                    )}
                  </button>
                </div>
                {showOtpField && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                      Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full md:w-1/2 px-4 py-3 rounded-full bg-[#F3F4F6] dark:bg-[#2B2D30] border-none text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 text-xs font-bold tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                    />
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewEmail("");
                    setOtp("");
                    setShowOtpField(false);
                    setAvatar(null);
                    setPreview(user?.avatar || "");
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#F3F4F6] hover:bg-zinc-200 dark:bg-[#2B2D30] dark:hover:bg-zinc-700 text-[#1E1F21] dark:text-zinc-200 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePersonalDetails}
                  disabled={avatarLoading || emailLoading}
                  className="px-6 py-2.5 rounded-full bg-[#167CC2] hover:bg-[#167CC2]/90 text-white text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2"
                >
                  {avatarLoading || emailLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={16}
                    />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={16}
                    />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium pl-2">
                    Must be at least 8 characters containing uppercase, lowercase, number, and
                    symbol.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#F3F4F6] hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#1E1F21] dark:text-zinc-200 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 rounded-full bg-[#167CC2] hover:bg-[#167CC2]/90 text-white text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
export default ProfilePage;
