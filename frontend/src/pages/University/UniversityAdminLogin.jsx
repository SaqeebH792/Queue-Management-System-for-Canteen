import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

import { loginUniversityAdmin } from "../../routes/university.routes";
import { verifyAuth } from "../../store/authSlice";
import Form from "../../components/Form";
import { Helmet } from "react-helmet-async";

const UniversityAdminLogin = () => {
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
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "Enter Your Email",
        required: true,
      },
      {
        label: "Password",
        name: "password",
        type: "password",
        placeholder: "Enter Password",
        required: true,
      },
    ],
    []
  );

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Frontend validation
    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await loginUniversityAdmin({
        email,
        password,
      });

      try {
        await dispatch(verifyAuth()).unwrap();
      } catch (authError) {
        toast.error(
          typeof authError === "string"
            ? authError
            : authError?.message || "Failed to verify session"
        );
        setLoading(false);
        return;
      }

      toast.success("Login Successful");

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login failed:", error);

      if (error?.response?.status === 429) {
        toast.error("Too many login attempts. Please try again later.");
        return;
      }

      toast.error(error?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | Login</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#121314] font-sans text-[#1E1F21] dark:text-zinc-100 relative flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#167CC2]/10 dark:bg-[#167CC2]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#D2F535]/20 dark:bg-[#D2F535]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md z-10">
          <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-xs border border-zinc-100 dark:border-zinc-800 transition-all duration-300">
            <Form
              title="Admin Sign In"
              fields={fields}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              submitButtonText="Login"
              resetPasswordText="Forgot Password?"
              resetPasswordLink="/admin/resetPassword"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversityAdminLogin;
