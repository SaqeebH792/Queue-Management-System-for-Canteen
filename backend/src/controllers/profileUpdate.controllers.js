// Utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
// Others
import crypto from "crypto";
import bcrypt from "bcrypt";
import validator from "validator";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute

export const updateProfileController = ({ OtpModel, uploadFn, sendOtp }) => {
  // Request OTP
  const requestOtp = asyncHandler(async (req, res) => {
    const Model = req.Model;

    const oldEmail = req.body.oldEmail?.trim().toLowerCase();
    const newEmail = req.body.newEmail?.trim().toLowerCase();

    if (!oldEmail || !newEmail) {
      throw new apiError(400, "Both current and new email addresses are required.");
    }

    if (!validator.isEmail(oldEmail) || !validator.isEmail(newEmail)) {
      throw new apiError(400, "Invalid email address.");
    }

    if (oldEmail === newEmail) {
      throw new apiError(400, "New email cannot be the same as the current email.");
    }

    const now = new Date();

    const [user, emailExists, recentOtp] = await Promise.all([
      // Check whether user Exists with email
      Model.findOne({
        _id: req.user._id,
        email: oldEmail,
      }).lean(),

      // Check wheter new changing email is already register with someone else
      Model.findOne({
        email: newEmail,
      }).lean(),

      // check whether otp is present or not
      OtpModel.findOne({
        userId: req.user._id,
        type: "Update Profile",
        createdAt: {
          $gt: new Date(Date.now() - OTP_COOLDOWN_MS),
        },
      }).lean(),
    ]);

    if (!user) {
      throw new apiError(403, "Current email is incorrect.");
    }

    if (emailExists) {
      throw new apiError(409, "Updated email address is already registered.");
    }

    if (recentOtp) {
      throw new apiError(429, "OTP already sent. Please wait before requesting another.");
    }

    // Remove previous OTPs for this user/type
    await OtpModel.deleteMany({
      userId: req.user._id,
      type: "Update Profile",
    });

    const otp = crypto.randomInt(100000, 1000000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const otpRecord = await OtpModel.create({
      userId: req.user._id,
      oldEmail,
      newEmail,
      code: hashedOtp,
      type: "Update Profile",
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
    });

    try {
      await sendOtp(otp, newEmail);
    } catch (error) {
      await OtpModel.deleteOne({
        _id: otpRecord._id,
      });

      throw new apiError(500, "Failed to send verification code.");
    }

    const otpData = otpRecord.toObject();
    delete otpData.code;

    return res
      .status(201)
      .json(new apiResponse(201, otpData, "Verification code sent successfully."));
  });

  // Update Profile
  const updateProfile = asyncHandler(async (req, res) => {
    const Model = req.Model;

    const oldEmail = req.body.oldEmail?.trim().toLowerCase();
    const newEmail = req.body.newEmail?.trim().toLowerCase();
    const confirmationOTP = req.body.confirmationOTP?.trim();

    const user = await Model.findById(req.user._id);
    if (!user) {
      throw new apiError(404, "User record not found.");
    }

    let avatarUrl = null;
    let otpRecord = null;

    // Email update
    if (newEmail && newEmail !== user.email) {
      if (!oldEmail || !confirmationOTP) {
        throw new apiError(400, "Current email and verification code are required.");
      }

      if (!validator.isEmail(newEmail)) {
        throw new apiError(400, "Invalid new email address.");
      }

      if (oldEmail !== user.email) {
        throw new apiError(403, "Current email is incorrect.");
      }

      // Find valid, non-expired OTP
      otpRecord = await OtpModel.findOne({
        userId: req.user._id,
        oldEmail,
        newEmail,
        type: "Update Profile",
        expiresAt: {
          $gt: new Date(),
        },
      });

      if (!otpRecord) {
        throw new apiError(400, "Verification code is invalid or has expired.");
      }

      const isValidOtp = await bcrypt.compare(confirmationOTP, otpRecord.code);

      if (!isValidOtp) {
        throw new apiError(400, "Invalid verification code.");
      }

      // Re-check email uniqueness before updating
      const emailExists = await Model.findOne({
        email: newEmail,
        _id: {
          $ne: user._id,
        },
      }).lean();

      if (emailExists) {
        throw new apiError(409, "Updated email address is already registered.");
      }
    }

    // Upload avatar if provided
    if (req.file) {
      const uploadedImage = await uploadFn(req.file.path);

      if (!uploadedImage?.secure_url) {
        throw new apiError(500, "Failed to upload avatar.");
      }

      avatarUrl = uploadedImage.secure_url;
    }

    const updatePayload = {
      ...(newEmail &&
        newEmail !== user.email && {
          email: newEmail,
        }),
      ...(avatarUrl && {
        avatar: avatarUrl,
      }),
    };

    if (Object.keys(updatePayload).length === 0) {
      throw new apiError(400, "No changes detected.");
    }

    const updatedUser = await Model.findByIdAndUpdate(
      user._id,
      {
        $set: updatePayload,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    // Delete OTP only after successful update
    if (otpRecord) {
      await OtpModel.deleteOne({
        _id: otpRecord._id,
      });
    }

    return res.status(200).json(new apiResponse(200, updatedUser, "Profile updated successfully."));
  });

  // Update Password
  const updatePassword = asyncHandler(async (req, res) => {
    const Model = req.Model;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new apiError(400, "Both current and new passwords are required.");
    }

    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      throw new apiError(
        400,
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    const user = await Model.findById(req.user._id);

    if (!user) {
      throw new apiError(404, "User record not found.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
      throw new apiError(400, "Current password is incorrect.");
    }

    // const isSamePassword = await user.isPasswordCorrect(newPassword);

    // if (isSamePassword) {
    //   throw new apiError(400, "New password cannot be the same as the current password.");
    // }

    user.password = newPassword;

    await user.save({
      validateBeforeSave: true,
    });

    return res.status(200).json(new apiResponse(200, null, "Password updated successfully."));
  });

  return { requestOtp, updateProfile, updatePassword };
};
