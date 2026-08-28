import mongoose from "mongoose";
import { authPlugin } from "../utils/authPlugin.js";

const studentSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },

    registrationNo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    cnic: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return this.constructor.modelName === "Student";
      },
    },

    department: {
      type: String,
      required: true,
    },

    session: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
    },

    role: {
      type: String,
      enum: ["Student"],
      default: "Student",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// IMPORTANT
// uniqueness is per university

studentSchema.index(
  {
    universityId: 1,
    cnic: 1,
  },
  {
    unique: true,
  }
);

studentSchema.index(
  {
    universityId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

studentSchema.index(
  {
    universityId: 1,
    registrationNo: 1,
  },
  {
    unique: true,
  }
);

studentSchema.plugin(authPlugin, { tokenFields: ["role"] });

export const Student = mongoose.model("Student", studentSchema);
export const UploadedStudent = mongoose.model("UploadedStudent", studentSchema);
