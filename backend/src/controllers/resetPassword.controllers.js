// Models
import { Student } from "../models/student.model.js";
import { ProfileOtp } from "../models/profileOtp.model.js";
// Utils
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { sendOtp } from "../utils/sendOTP.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ResetPasswordOtp } from "../models/resetPassword.model.js";

export const resetPasswordController = ({ Model, OtpModel, sendOtp }) => {
  //  Request OTP
  const requestOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      throw new apiError(400, "Email is Required");
    }

    const user = await Model.findOne({ email });
    if (!user) {
      throw new apiError(403, "Invalid email");
    }

    await OtpModel.deleteMany({
      email,
      type: "Reset Password",
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpRecord = await OtpModel.create({
      email,
      code: otp,
      type: "Reset Password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendOtp(email, otp);

    const otpData = await OtpModel.findById(otpRecord._id).select("-code");

    return res
      .status(201)
      .json(new apiResponse(201, otpData, "Verification code sent successfully."));
  });

  // Reset Password

  const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new apiError(400, "All Fields are Required");
    }

    const user = await Model.findOne({ email });
    if (!user) {
      throw new apiError(404, "Account not found.");
    }

    const otpRecord = await OtpModel.findOne({
      email,
      type: "Reset Password",
    });

    if (!otpRecord) {
      throw new apiError(400, "Verification record not found");
    }

    // Check expiry
    if (otpRecord.expiresAt < Date.now()) {
      await OtpModel.deleteOne({ email, type: "Reset Password" });
      throw new apiError(400, "OTP has expired");
    }

    // Check validity
    if (otp !== otpRecord.code) {
      throw new apiError(400, "Invalid OTP");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    // Clean up used OTP
    await OtpModel.deleteOne({ email, type: "Reset Password" });

    return res.status(200).json(new apiResponse(200, null, "Password reset successfully."));
  });

  return { requestOtp, resetPassword };
};

export const resetPassword = resetPasswordController({
  Model: Student,
  OtpModel: ResetPasswordOtp,
  sendOtp: sendOtp,
});
