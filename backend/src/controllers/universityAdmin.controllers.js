import mongoose from "mongoose";
// Models
import { SuperAdmin } from "../models/superAdmin.model.js";
import { UniversityAdmin } from "../models/universityAdmin.model.js";
import { University } from "../models/university.model.js";
import { CanteenAdmin } from "../models/CanteenAdmin.model.js";
import { Otp } from "../models/otp.model.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import { UploadedStudent } from "../models/uploadStudents.model.js";
import { Student } from "../models/student.model.js";
import { ActivationRequest } from "../models/requestActivation.model.js";
// Utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
// Others
import XLSX from "xlsx";
import csv from "csv-parser";
import { Readable } from "stream";
import crypto from "crypto";
import bcrypt from "bcrypt";
import validator from "validator";
import { ROLES } from "../constants.js";
import { sendOtp } from "../utils/sendOTP.js";

// OTP Request to Register Account
const requestOtp = asyncHandler(async (req, res) => {
  const { domain, email, universityName } = req.body;
  // Validate required fields
  if (!domain || !email || !universityName) {
    throw new apiError(400, "All fields are required");
  }
  // Normalize input
  const normalizedDomain = domain.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  // Validate by trimming if user Enter empty spaces
  if (!normalizedDomain || !normalizedEmail || !universityName) {
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
      universityName: universityName,
      code: hashedOtp,
      type: "Register Admin",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    {
      returnDocument: "after",
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

  // Check expiration

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    throw new apiError(400, "OTP expired");
  }

  // Check attempts

  if (otpRecord.otpAttempts >= 5) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    throw new apiError(400, "Too many attempts. Request a new OTP.");
  }

  // Verify OTP

  const isOtpValid = await bcrypt.compare(otp, otpRecord.code);

  if (!isOtpValid) {
    otpRecord.otpAttempts += 1;
    await otpRecord.save();
    throw new apiError(400, "Invalid OTP");
  }

  // Check wheter Any university exists with given email only for double check
  let existingUniversity = await University.findOne({
    email: normalizedEmail,
  });

  let universityAdmin;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const university = new University({
      email: normalizedEmail,
      domain: otpRecord.domain,
      universityName: otpRecord.universityName,
    });

    await university.save({ session });

    universityAdmin = new UniversityAdmin({
      universityId: university._id,
      universityName: otpRecord.universityName,
      email: normalizedEmail,
      password,
      role: "University Admin",
    });
    await universityAdmin.save({ session });

    await Otp.deleteOne({ _id: otpRecord._id }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // const createdAdmin = await UniversityAdmin.findById(universityAdmin._id).select("-password");
  const response = await UniversityAdmin.findById(universityAdmin._id).select("-password");
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
  const universityAdmin = await UniversityAdmin.findOne({ email: normalizedEmail });
  if (!universityAdmin) {
    throw new apiError(401, "Invalid Credentials");
  }

  // Validate Password
  const isPasswordValid = await universityAdmin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(universityAdmin);

  const response = await UniversityAdmin.findById(universityAdmin._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { user: response }, "Login Successful"));
});

// Canteen Admin Registration ---------------> By University Admin
const INACTIVE_CANTEEN_ADMIN_LIMIT = 1;
const ACTIVE_CANTEEN_ADMIN_LIMIT = 5;

const registerCanteenAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

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

  const universityId = req.user.universityId;
  // Check if email already exists for this university
  const existingCanteenAdmin = await CanteenAdmin.findOne({
    universityId,
    email: normalizedEmail,
  });

  if (existingCanteenAdmin) {
    throw new apiError(409, "Canteen admin is already registered.");
  }

  // Determine registration limit based on admin status
  const maxAdmins = req.user.isActive ? ACTIVE_CANTEEN_ADMIN_LIMIT : INACTIVE_CANTEEN_ADMIN_LIMIT;

  // Count existing canteen admins
  const currentAdminCount = await CanteenAdmin.countDocuments({
    universityId,
  });

  if (currentAdminCount >= maxAdmins) {
    throw new apiError(
      403,
      req.user.isActive
        ? `You can register a maximum of ${ACTIVE_CANTEEN_ADMIN_LIMIT} canteen admins.`
        : `Inactive admins can register only ${INACTIVE_CANTEEN_ADMIN_LIMIT} canteen admin. Please activate your account to register more.`
    );
  }

  // Create canteen admin
  const canteenAdmin = await CanteenAdmin.create({
    email: normalizedEmail,
    password,
    role: ROLES.CANTEEN_ADMIN,
    universityId,
    universityName: req.user.universityName,
  });

  const response = canteenAdmin.toObject();
  delete response.password;

  return res
    .status(201)
    .json(new apiResponse(201, response, "Canteen admin registered successfully."));
});

// Upload Students Data CSV OR SLSX File
const REQUIRED_COLUMNS = ["fullName", "registrationNo", "email", "cnic", "session", "department"];

const BATCH_SIZE = 1000;

const normalizeCNIC = cnic => {
  return cnic.toString().replace(/[-\s]/g, "").trim();
};

const validateCNIC = cnic => {
  return /^\d{13}$/.test(cnic);
};

const uploadStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new apiError(400, "File is required");
  }

  const universityId = req.user.universityId;

  let rows = [];

  const extension = req.file.originalname.split(".").pop().toLowerCase();

  // CSV
  if (extension === "csv") {
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv())
        .on("data", data => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });
  }
  // Excel
  else {
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });
  }

  if (!rows.length) {
    throw new apiError(400, "File contains no data");
  }

  // Validate required columns
  const columns = Object.keys(rows[0]);
  const missingColumns = REQUIRED_COLUMNS.filter(col => !columns.includes(col));

  if (missingColumns.length) {
    throw new apiError(400, `Missing columns: ${missingColumns.join(", ")}`);
  }

  const errors = [];

  // Remove duplicate registration numbers inside uploaded file
  const studentMap = new Map();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    const email = row.email.toString().trim().toLowerCase();
    const cnic = normalizeCNIC(row.cnic);
    const registrationNo = row.registrationNo.toString().trim().toLowerCase();

    if (!row.fullName || !registrationNo || !email || !cnic || !row.session || !row.department) {
      errors.push({
        row: rowNumber,
        reason: "Missing required fields",
      });
      return;
    }

    if (!validator.isEmail(email)) {
      errors.push({
        row: rowNumber,
        reason: "Invalid email",
      });
      return;
    }

    if (!validateCNIC(cnic)) {
      errors.push({
        row: rowNumber,
        reason: "Invalid CNIC",
      });
      return;
    }

    studentMap.set(`${universityId}_${registrationNo}`, {
      universityId,
      name: row.fullName.toString().trim().replace(/\s+/g, " "),
      registrationNo,
      email,
      cnic,
      session: row.session.toString().trim(),
      department: row.department.toString().trim(),
      role: "Student",
    });
  });

  const students = Array.from(studentMap.values());

  // Upload limit for inactive admins
  if (!req.user.isActive) {
    const existingStudents = await UploadedStudent.find(
      {
        universityId,
        registrationNo: {
          $in: students.map(student => student.registrationNo),
        },
      },
      {
        registrationNo: 1,
        _id: 0,
      }
    );

    const existingRegistrationNos = new Set(
      existingStudents.map(student => student.registrationNo)
    );

    // Count only NEW students
    const newStudentsCount = students.filter(
      student => !existingRegistrationNos.has(student.registrationNo)
    ).length;

    const currentStudentCount = await UploadedStudent.countDocuments({
      universityId,
    });

    if (currentStudentCount + newStudentsCount > 100) {
      throw new apiError(
        403,
        `Inactive admins can upload a maximum of 100 students. Currently you have ${currentStudentCount} students and this upload would add ${newStudentsCount} new students.`
      );
    }
  }

  let inserted = 0;
  let updated = 0;

  // Batch Upsert
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE);

    const result = await UploadedStudent.bulkWrite(
      batch.map(student => ({
        updateOne: {
          filter: {
            universityId,
            registrationNo: student.registrationNo,
          },
          update: {
            $set: student,
          },
          upsert: true,
        },
      }))
    );

    inserted += result.upsertedCount || 0;
    updated += result.matchedCount || 0;
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalRows: rows.length,
        processed: students.length,
        inserted,
        updated,
        failed: errors.length,
        errors,
      },
      "Students imported successfully"
    )
  );
});

// Fetch All the Registered Students
const getAllStudents = asyncHandler(async (req, res) => {
  const { search, status, session, cursorCreatedAt, cursorId } = req.query;
  const query = {
    universityId: req.user.universityId,
  };

  if (search?.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      {
        name: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        registrationNo: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        email: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        cnic: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }
  if (status) {
    if (status !== "true" && status !== "false") {
      throw new apiError(400, "Invalid status");
    }
    query.isActive = status === "true";
  }
  if (session) {
    query.session = session;
  }
  if (cursorCreatedAt && cursorId) {
    if (!mongoose.Types.ObjectId.isValid(cursorId)) {
      throw new apiError(400, "Invalid cursor");
    }

    const date = new Date(cursorCreatedAt);
    if (isNaN(date)) {
      throw new apiError(400, "Invalid cursor date");
    }

    query.$and = [
      {
        $or: [
          {
            createdAt: {
              $lt: date,
            },
          },

          {
            createdAt: date,
            _id: {
              $lt: new mongoose.Types.ObjectId(cursorId),
            },
          },
        ],
      },
    ];
  }

  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const students = await UploadedStudent.find(query)
    .select(
      `
        name
        registrationNo
        email
        cnic
        session
        department
        isActive
        createdAt
        `
    )

    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(limit + 1)
    .lean();

  const hasNextPage = students.length > limit;

  if (hasNextPage) {
    students.pop();
  }

  const last = students[students.length - 1];
  return res.status(200).json(
    new apiResponse(
      200,
      {
        students,
        pagination: {
          hasNextPage,
          nextCursor: hasNextPage
            ? {
                cursorCreatedAt: last.createdAt,
                cursorId: last._id,
              }
            : null,
        },
      },

      "Students fetched successfully"
    )
  );
});
// Update Student Status Active, Inactive
const updateStudentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new apiError(400, "isActive must be boolean");
  }

  const uploadedStudent = await UploadedStudent.findOneAndUpdate(
    {
      _id: id,
      universityId: req.user.universityId,
    },
    {
      isActive,
    },
    {
      returnDocument: "after",
    }
  );

  if (!uploadedStudent) {
    throw new apiError(404, "Student not found");
  }
  return res.status(200).json(
    new apiResponse(
      200,
      {
        id: uploadedStudent._id,
        name: uploadedStudent.name,
        isActive: uploadedStudent.isActive,
      },
      `Student ${isActive ? "activated" : "deactivated"} successfully`
    )
  );
});

const requestActivation = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  let activationRequest;

  try {
    session.startTransaction();

    const universityId = req.user.universityId;

    const university = await University.findById(universityId).session(session);

    if (!university) {
      throw new apiError(404, "University not found");
    }

    if (university.status === "active") {
      throw new apiError(400, "University is already active");
    }

    const existingRequest = await ActivationRequest.findOne({
      universityId,
      status: "pending",
    }).session(session);

    if (existingRequest) {
      throw new apiError(409, "Activation request is already pending");
    }

    activationRequest = await ActivationRequest.create(
      [
        {
          universityId,
          requestedBy: req.user._id,
        },
      ],
      { session }
    );

    const request = activationRequest[0];

    // Fetch all Super Admins
    const superAdmins = await SuperAdmin.find({}, "_id").session(session);

    const notifications = superAdmins.map(admin => ({
      activationRequestId: request._id,

      sender: req.user._id,
      senderModel: "University Admin",

      recipient: admin._id,
      recipientModel: "Super Admin",

      title: "New Activation Request",

      message: `${university.name} has submitted an activation request.`,

      type: "ActivationRequested",

      link: `/admin/activation-requests/${request._id}`,
    }));

    const createdNotifications = await Notification.insertMany(notifications, {
      session,
    });

    await session.commitTransaction();

    // Socket Notification
    try {
      const io = getSocketIO();

      createdNotifications.forEach(notification => {
        io.to(notification.recipient.toString()).emit("newNotification", notification);
      });
    } catch (socketError) {
      console.error("Socket notification failed:", socketError.message);
    }

    return res
      .status(201)
      .json(new apiResponse(201, request, "Activation request submitted successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Get Request Status & History
const getActivationRequest = asyncHandler(async (req, res) => {
  const universityId = req.user.universityId;

  // Fetch all requests ordered by creation date (newest first)
  const history = await ActivationRequest.find({ universityId })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  if (!history || history.length === 0) {
    return res.status(200).json(
      new apiResponse(
        200,
        {
          status: "not_requested",
          currentRequest: null,
          history: [],
        },
        "No activation request found"
      )
    );
  }

  const currentRequest = history[0];

  return res.status(200).json(
    new apiResponse(
      200,
      {
        status: currentRequest.status,
        currentRequest,
        history,
      },
      "Activation requests fetched successfully"
    )
  );
});

// Cancel Activation Request
const cancelActivationRequest = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const universityId = req.user.universityId;

    const university = await University.findById(universityId).session(session);

    const request = await ActivationRequest.findOneAndUpdate(
      {
        universityId,
        status: "pending",
      },
      {
        status: "cancelled",
      },
      {
        new: true,
        session,
      }
    );

    if (!request) {
      throw new apiError(404, "No pending activation request found");
    }

    const superAdmins = await SuperAdmin.find({}, "_id").session(session);

    const notifications = superAdmins.map(admin => ({
      activationRequestId: request._id,

      sender: req.user._id,
      senderModel: "University Admin",

      recipient: admin._id,
      recipientModel: "Super Admin",

      title: "Activation Request Cancelled",

      message: `${university.name} cancelled its activation request.`,

      type: "System",

      link: `/admin/activation-requests/${request._id}`,
    }));

    const createdNotifications = await Notification.insertMany(notifications, {
      session,
    });

    await session.commitTransaction();

    try {
      const io = getSocketIO();

      createdNotifications.forEach(notification => {
        io.to(notification.recipient.toString()).emit("newNotification", notification);
      });
    } catch (socketError) {
      console.error("Socket notification failed:", socketError.message);
    }

    return res
      .status(200)
      .json(new apiResponse(200, request, "Activation request cancelled successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

import { updateProfileController } from "./profileUpdate.controllers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ProfileOtp } from "../models/profileOtp.model.js";
import { Notification } from "../models/notification.model.js";

// Admin Update Profile
export const updateProfile = updateProfileController({
  Model: UniversityAdmin,
  OtpModel: ProfileOtp,
  uploadFn: uploadOnCloudinary,
  sendOtp: sendOtp,
});

export {
  requestOtp,
  registerUniAdmin,
  loginUniAdmin,
  registerCanteenAdmin,
  uploadStudents,
  getAllStudents,
  updateStudentStatus,
  requestActivation,
  getActivationRequest,
  cancelActivationRequest,
};
