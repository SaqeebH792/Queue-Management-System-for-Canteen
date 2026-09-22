import ForgotPassword from "../components/ForgotPassword";

import {
  requestStudentOtp,
  resetStudentPassword,
} from "../../routes/student.routes";
import { Helmet } from "react-helmet-async";

const StudentForgotPassword = () => {
  return (
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>

      <ForgotPassword
        requestOtpApi={requestStudentOtp}
        resetPasswordApi={resetStudentPassword}
      />
    </>
  );
};

export default StudentForgotPassword;
