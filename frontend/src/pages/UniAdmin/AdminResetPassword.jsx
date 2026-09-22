import ForgotPassword from "../../components/ResetPassword";

import {
  requestResettOtp,
  resetAdminPassword,
} from "../../routes/university.routes";
import { Helmet } from "react-helmet-async";

const AdminResetPassword = () => {
  return (
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>

      <ForgotPassword
        requestOtpApi={requestResettOtp}
        resetPasswordApi={resetAdminPassword}
      />
    </>
  );
};

export default AdminResetPassword;
