import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  message: {
    success: false,
    message: "Too many requests. Try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const otpEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  keyGenerator: req => {
    const email = req.body?.email;

    if (typeof email !== "string") {
      return "unknown-email";
    }

    return email.trim().toLowerCase();
  },

  message: {
    success: false,
    message: "Too many OTP requests for this email. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});
