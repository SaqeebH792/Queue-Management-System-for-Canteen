import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants.js";
import { authPlugin } from "../utils/authPlugin.js";

const universityAdminSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    universityName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: ROLES.UNIVERSITY_ADMIN,
    },
    status: {
      type: String,
      enum: ["inactive", "active", "suspended"],
      default: "inactive",
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

universityAdminSchema.index(
  {
    universityId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

universityAdminSchema.plugin(authPlugin, { tokenFields: ["role"] });
export const UniversityAdmin = mongoose.model("UniversityAdmin", universityAdminSchema);
