import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Form from "../../components/Form";
import { studentSignup } from "../../routes/student.routes";
import { Helmet } from "react-helmet-async";

function StudentSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registrationNo: "",
    cnic: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const fields = [
    {
      label: "Registration No",
      type: "text",
      name: "registrationNo",
      placeholder: "Enter University Registration No",
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
      label: "Email",
      type: "email",
      name: "email",
      placeholder: "Enter Email",
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
    const toastId = toast.loading("Sending verification code...");

    try {
      setLoading(true);

      const sanitizedPayload = {
        registrationNo: formData.registrationNo.trim(),
        cnic: formData.cnic.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      await studentSignup(sanitizedPayload);

      sessionStorage.setItem("studentRegistration", JSON.stringify(sanitizedPayload));

      toast.success("OTP sent successfully!", { id: toastId });

      navigate("/student/verify", {
        replace: true,
      });
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.response?.data?.message ||
            error?.message ||
            "Failed to send OTP. Please try again.";

      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register with Us | Student Portal</title>
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 overflow-hidden">
        <div className="relative w-full max-w-md z-10">
          <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 sm:p-8 shadow-xs transition-all duration-300">
            <Form
              title="Student Signup"
              fields={fields}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              submitButtonText="Send OTP"
              linkText="Login"
              link="/student/login"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentSignup;
