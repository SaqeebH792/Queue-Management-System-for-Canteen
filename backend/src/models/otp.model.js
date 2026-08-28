import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Register Admin", "Register Student"],
      required: true,
    },

    // ===== Admin Registration Fields =====
    domain: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "Register Admin";
      },
    },

    universityName: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "Register Admin";
      },
    },

    // ===== Student Registration Fields =====
    registrationNo: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "Register Student";
      },
    },

    cnic: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "Register Student";
      },
    },

    code: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index(
  {
    email: 1,
    type: 1,
  },
  {
    unique: true,
  }
);
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// OTP Hashing
otpSchema.pre("save", async function (next) {
  if (!this.isModified("code")) return;

  const salt = await bcrypt.genSalt(10);
  this.code = await bcrypt.hash(this.code, salt);

  next;
});

export const Otp = mongoose.model("Otp", otpSchema);
