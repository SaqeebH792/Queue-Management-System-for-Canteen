import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X, Loader2, UserCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginStudent } from "../../routes/student.routes";
import { verifyStudentAuth } from "../../store/studentAuthSlice";
import { socket } from "../../sockets/sockets";

function LoginModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    registrationNo: "",
    cnic: "",
    password: "",
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const registrationNo = formData.registrationNo.trim();
    const cnic = formData.cnic.trim();
    const password = formData.password;

    if (!registrationNo || !cnic || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginStudent({
        registrationNo,
        cnic,
        password,
      });

      const { user } = response.data;

      // Connect socket
      socket.connect();
      socket.emit("Join", user._id);

      try {
        await dispatch(verifyStudentAuth()).unwrap();
      } catch (authErr) {
        socket.disconnect();
        setError(
          typeof authErr === "string"
            ? authErr
            : authErr?.message || "Failed to verify session.",
        );
        return;
      }

      // Reset Form
      setFormData({
        registrationNo: "",
        cnic: "",
        password: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-2xl z-10 transition-all transform animate-scale-up border border-zinc-100 dark:border-zinc-800"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-[#1E1F21] dark:hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#167CC2]/10 text-[#167CC2] flex items-center justify-center mx-auto">
            <UserCheck size={22} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E1F21] dark:text-white">
            Login Required
          </h2>
          <p className="text-xs font-semibold text-zinc-400">
            Sign in to continue placing your order.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                Registration No
              </label>
              <input
                type="text"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                required
                placeholder="Enter Registration No"
                className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                CNIC
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="12345-1234567-9"
                required
                className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#1E1F21] dark:text-zinc-200">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter Password"
                className="w-full px-4 py-3 rounded-[20px] bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-xs font-medium text-[#1E1F21] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-extrabold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#167CC2] hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default LoginModal;
