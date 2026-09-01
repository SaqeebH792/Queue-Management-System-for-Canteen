import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants.js";
import { authPlugin } from "../utils/authPlugin.js";

const canteenAdminSchema = new mongoose.Schema(
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

    role: {
      type: String,
      default: ROLES.CANTEEN_ADMIN,
    },
    avatar: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

canteenAdminSchema.index(
  {
    universityId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);
canteenAdminSchema.plugin(authPlugin, { tokenFields: ["role"] });
export const CanteenAdmin = mongoose.model("CanteenAdmin", canteenAdminSchema);
