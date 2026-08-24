import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authPlugin } from "../utils/authPlugin.js";

const userSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["University Admin", "Canteen Admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.plugin(authPlugin, { tokenFields: ["role"] });
export const UniversityAdmin = mongoose.model("UniversityAdmin", userSchema);
export const CanteenAdmin = mongoose.model("CanteenAdmin", userSchema);
