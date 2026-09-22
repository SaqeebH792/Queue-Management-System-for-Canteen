import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

import { loginCanteenAdmin } from "../../routes/canteen.routes";
import { socket } from "../../sockets/sockets";
import { verifyAuth } from "../../store/authSlice";
import Form from "../../components/Form";

function CanteenAdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const fields = useMemo(
    () => [
      {
        label: "Institutional Email",
        name: "email",
        type: "email",
        placeholder: "Enter Email",
        required: true,
      },
      {
        label: "Password",
        name: "password",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
    [],
  );

  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleLoginProcess = async () => {
    setLoading(true);
    try {
      const response = await loginCanteenAdmin(formData);
      const user = response?.data?.user;

      if (!user) {
        throw new Error("Invalid response from server");
      }

      socket.connect();
      socket.emit("joinCanteen", {
        universityId: user.universityId,
        adminId: user._id,
      });

      await dispatch(verifyAuth()).unwrap();
      navigate("/canteenAdmin/dashboard", { replace: true });

      return user;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.promise(handleLoginProcess(), {
      loading: "Signing in...",
      success: "Login successful",
      error: (error) =>
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials.",
    });
  };

  return (
    <>
      <Helmet>
        <title>EduAdmin SaaS | Canteen Portal Login</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#121314] font-sans text-[#1E1F21] dark:text-zinc-100 relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 overflow-hidden">
        {/* Ambient Background Glow Accents */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#167CC2]/10 dark:bg-[#167CC2]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#D2F535]/20 dark:bg-[#D2F535]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md space-y-6 text-center z-10">
          {/* Header Branding */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1F21] dark:text-white tracking-tight">
              EduAdmin SaaS
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-[#167CC2] dark:text-[#D2F535] uppercase tracking-wider">
              Canteen Portal
            </p>
          </div>

          {/* Form Card Container */}
          <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-xs border border-zinc-100 dark:border-zinc-800 transition-all duration-300 text-left">
            <Form
              title="Staff Login"
              fields={fields}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              submitButtonText="Sign In to Canteen Portal"
              resetPasswordText="Forgot Password?"
              resetPasswordLink="/forgot-password"
            />
          </div>

          {/* Footer Security Note */}
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Secure Institutional Access • Requires Authorized Credentials
          </p>
        </div>
      </div>
    </>
  );
}

export default CanteenAdminLogin;
