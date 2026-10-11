import { useState } from "react";
import { loginStudent } from "../../routes/student.routes";
import { useNavigate } from "react-router-dom";
import Form from "../../components/Form";
import { socket } from "../../sockets/sockets";
import { useDispatch } from "react-redux";
import { verifyStudentAuth } from "../../store/studentAuthSlice";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

function StudentLogin() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fields = [
    {
      label: "Registration No",
      type: "text",
      name: "registrationNo",
      placeholder: "Enter Registration No",
      required: true,
    },
    {
      label: "CNIC",
      type: "text",
      name: "cnic",
      placeholder: "12345-1234567-9",
      required: true,
    },
    {
      label: "Password",
      type: "password",
      name: "password",
      placeholder: "Enter Password",
      required: true,
    },
  ];

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const toastId = toast.loading("Signing you in...");

    try {
      setLoading(true);

      const response = await loginStudent(formData);
      const { user } = response.data;

      console.log(user);
      if (socket.connected) {
        socket.emit("join", {
          role: user.role,
          userId: user._id,
          universityId: user.universityId,
        });
      } else {
        socket.emit("join", {
          role: user.role,
          userId: user._id,
          universityId: user.universityId,
        });
        socket.connect();
      }

      await dispatch(verifyStudentAuth()).unwrap();

      toast.success("Welcome back!", { id: toastId });
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.response?.data?.message ||
            error?.message ||
            "Login failed! Please check your credentials.";

      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login To Your Account | Student Portal</title>
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-[#1E1F21] dark:text-zinc-100 transition-colors duration-300 overflow-hidden">
        <div className="relative w-full max-w-md z-10">
          <div className="bg-white dark:bg-[#292a2d] rounded-[28px] p-6 sm:p-8 shadow-xs transition-all duration-300">
            <Form
              title="Login"
              fields={fields}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              submitButtonText="Login"
              linkText="Signup"
              link="/student/signup"
              resetPasswordText="Forget Password"
              resetPasswordLink="/student/resetPassword"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentLogin;
