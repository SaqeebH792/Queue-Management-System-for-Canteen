import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { UniversityAdmin, canteenAdmin } from "../models/admins.model.js";
import { Otp } from "../models/otp.model.js";
import { University } from "../models/university.model.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import validator from "validator";

const sendOtp = async function (code, email) {
  console.log(`OTP ${code} sent to email ${email}`);
};

// OTP Request to Register Account
const requestOtp = asyncHandler(async (req, res) => {
  const { domain, email, name } = req.body;
  // Validate required fields
  if (!domain || !email || !name) {
    throw new apiError(400, "All fields are required");
  }
  // Normalize input
  const normalizedDomain = domain.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  // Validate by trimming if user Enter empty spaces
  if (!normalizedDomain || !normalizedEmail || !trimmedName) {
    throw new apiError(400, "All fields are required");
  }
  // Validate email
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }
  // Extract email domain
  const emailDomain = normalizedEmail.split("@")[1];
  // Verify domain ownership
  if (emailDomain !== normalizedDomain) {
    throw new apiError(400, "Email domain does not match");
  }
  // Check existing admin
  const existingUniversityAdmin = await UniversityAdmin.findOne({
    email: normalizedEmail,
  });
  if (existingUniversityAdmin) {
    throw new apiError(400, "Already registered");
  }
  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  // Hash OTP
  const hashedOtp = await bcrypt.hash(otp, 12);
  // Update OTP if user Already request
  const otpRecord = await Otp.findOneAndUpdate(
    {
      email: normalizedEmail,
    },
    {
      domain: normalizedDomain,
      email: normalizedEmail,
      name: trimmedName,
      code: hashedOtp,
      type: "Admin Registration",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  // Send OTP email
  try {
    await sendOtp(otp, normalizedEmail);
  } catch (error) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });
    throw new apiError(500, "Failed to send OTP");
  }

  // Remove sensitive data
  const response = otpRecord.toObject();
  delete response.code;
  return res.status(201).json(new apiResponse(201, response, "OTP sent successfully"));
});

// Register University Admin After OTP Verification

const registerUniAdmin = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    throw new apiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new apiError(400, "All fields are required");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }
  if (
    !validator.isStrongPassword(password, {
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
  // Check if User with Given Email is Already Register
  const existingAdmin = await UniversityAdmin.findOne({
    email: normalizedEmail,
  });

  if (existingAdmin) {
    throw new apiError(400, "Already registered");
  }
  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
  });

  if (!otpRecord) {
    throw new apiError(400, "OTP record not found");
  }

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    throw new apiError(400, "OTP expired");
  }
  const isOtpValid = bcrypt.compare(otp, otpRecord.code);
  if (!isOtpValid) {
    throw new apiError(400, "Invalid OTP");
  }

  // Check wheter Any university exists with given email only for double check
  let existingUniversity = await University.findOne({
    email: normalizedEmail,
  });

  if (!existingUniversity) {
    await University.create({
      email: normalizedEmail,
      domain: otpRecord.domain,
      name: otpRecord.name,
    });
  }

  const universityAdmin = await UniversityAdmin.create({
    universityId: university._id,
    domain: university.domain,
    email: normalizedEmail,
    password,
    role: "University Admin",
  });

  await Otp.deleteOne({
    _id: otpRecord._id,
  });

  // const createdAdmin = await UniversityAdmin.findById(universityAdmin._id).select("-password");
  const response = universityAdmin.toObject();
  delete response.password;
  console.log(response);
  return res.status(201).json(new apiResponse(201, response, "Registration Successful"));
});

// Login University Admin

const loginUniAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "All fields are Required");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new apiError(400, "All Fields are Required");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }
  // Check if User is Registered
  const universityAdmin = await UniversityAdmin.findOne({ normalizedEmail });
  if (!universityAdmin) {
    throw new apiError(401, "Invalid Credentials");
  }
  // Validate Password
  const isPasswordValid = await universityAdmin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(universityAdmin._id);

  const response = universityAdmin.toObject();
  delete response.password;
  delete response.refreshToken;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { user: response }, "Login Successful"));
});

// Canteen Admin Registration ---------------> By University Admin

const registerCanteenAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new apiError(400, "All fields are required");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new apiError(400, "All fields are required");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }

  if (
    !validator.isStrongPassword(password, {
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
  const existingCanteenAdmin = await CanteenAdmin.findOne({
    email: normalizedEmail,
  });

  if (existingCanteenAdmin) {
    throw new apiError(409, "Already registered");
  }

  const canteenAdmin = await CanteenAdmin.create({
    email: normalizedEmail,
    password,
    role: "Canteen Admin",
    universityId: req.user.universityId,
  });

  const response = canteenAdmin.toObject();
  delete response.password;

  return res.status(201).json(new apiResponse(201, response, "Admin registered successfully"));
});

export { requestOtp, registerUniAdmin, loginUniAdmin, registerCanteenAdmin };
