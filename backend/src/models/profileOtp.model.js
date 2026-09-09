import mongoose from "mongoose";
import { authPlugin } from "../utils/authPlugin.js";
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    oldEmail: {
      type: String,
      required: true,
    },
    newEmail: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["Update Profile"],
      required: true,
    },
  },
  { timestamps: true }
);

otpSchema.plugin(authPlugin, { tokenFields: ["oldEmail", "type"] });
export const ProfileOtp = mongoose.model("ProfileOtp", otpSchema);
