import mongoose from "mongoose";
import { authPlugin } from "../utils/authPlugin.js";

const resetPasswordOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Reset Password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resetPasswordOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

resetPasswordOtpSchema.index({
  email: 1,
  createdAt: -1,
});

resetPasswordOtpSchema.plugin(authPlugin, {
  tokenFields: ["email"],
});

export const ResetPasswordOtp = mongoose.model("ResetPasswordOtp", resetPasswordOtpSchema);
