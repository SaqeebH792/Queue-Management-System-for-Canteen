import mongoose, { Model } from "mongoose";
// Models
import { Student } from "../models/student.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { UploadedStudent } from "../models/uploadStudents.model.js";
import { Otp } from "../models/otp.model.js";
import { calculateOrder } from "../utils/calculateOrder.js";
import { CanteenAdmin } from "../models/CanteenAdmin.model.js";
import { OrderNotification } from "../models/orderNotification.model.js";

// Utils
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// Others
import fs from "fs";
import { Readable } from "stream";
import { getSocketIO } from "../socket.js";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
// ---------------------------------- Register Student -------------------------------------------------

const requestOtp = asyncHandler(async (req, res) => {
  const { registrationNo, cnic, email } = req.body;
  // Validate required fields
  if (!registrationNo || !cnic || !email) {
    throw new apiError(400, "All fields are required");
  }
  // Normalize input
  const normalizedRegistrationNo = registrationNo.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCNIC = cnic.trim();

  // Validate by trimming if user Enter empty spaces
  if (!normalizedRegistrationNo || !normalizedCNIC || !normalizedEmail) {
    throw new apiError(400, "All fields are required");
  }
  // Validate email
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }

  // Check whether who is requesting OTP is Student of University
  const studentRecord = await UploadedStudent.findOne({
    registrationNo: normalizedRegistrationNo,
    cnic: normalizedCNIC,
  });
  if (!studentRecord) {
    throw new apiError(400, "Student Record not found");
  }
  const session = studentRecord.session?.trim();

  if (!session) {
    throw new apiError(400, "Invalid session");
  }

  const parts = session.split("-").map(part => part.trim());

  if (parts.length !== 2) {
    throw new apiError(400, "Invalid session format");
  }

  let endYear = parts[1];

  if (endYear.length === 2) {
    const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;
    endYear = currentCentury + Number(endYear);
  } else {
    endYear = Number(endYear);
  }

  const currentYear = new Date().getFullYear();

  // Session has ended
  if (endYear < currentYear) {
    throw new apiError(400, "Cannot Create Account! Session Ended");
  }
  const status = await studentRecord.isActive;
  if (status !== true) {
    throw new apiError(400, "Cannot Create Account! Session Expired");
  }
  // Check if any student with registrationNo and CNIC already registered
  const existingStudent = await Student.findOne({
    universityId: studentRecord.universityId,
    $or: [
      { registrationNo: normalizedRegistrationNo },
      { cnic: normalizedCNIC },
      { email: normalizedEmail },
    ],
  });

  if (existingStudent) {
    throw new apiError(400, "Already registered");
  }
  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const OTP_EXPIRY_MS = 10 * 60 * 1000;
  // Update OTP if user Already request
  const otpRecord = await Otp.findOneAndUpdate(
    {
      registrationNo: normalizedRegistrationNo,
      email: normalizedEmail,
      type: "Register Student",
    },
    {
      registrationNo: normalizedRegistrationNo,
      cnic: normalizedCNIC,
      email: normalizedEmail,
      code: hashedOtp,
      type: "Register Student",
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      otpAttempts: 0,
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  try {
    await sendOtp(otp, normalizedEmail);
  } catch (error) {
    throw new apiError(500, "Failed to send OTP");
  }

  // Remove sensitive data
  const response = otpRecord.toObject();
  delete response.code;
  return res.status(201).json(new apiResponse(201, response, "OTP sent successfully"));
});

// Student Registration
const registerStudent = asyncHandler(async (req, res, next) => {
  const { registrationNo, cnic, email, password, otp } = req.body;
  let avatar;
  if (!registrationNo || !cnic || !email || !password || !otp) {
    throw new apiError(400, "All Fields are Required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRegistrationNo = registrationNo.trim().toLowerCase();
  const normalizedCNIC = cnic.trim().toLowerCase();

  if (!normalizedRegistrationNo || !normalizedCNIC || !normalizedEmail || !password || !otp) {
    throw new apiError(400, "All Fields are Required");
  }
  // Validate Email Type
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }
  // validate Password if is Strong
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
  // Check if OTP record is available
  const otpRecord = await Otp.findOne({
    registrationNo: normalizedRegistrationNo,
    email: normalizedEmail,
    type: "Register Student",
  });
  if (!otpRecord) {
    throw new apiError(400, "Invalid or Expired OTP");
  }
  // Check Expiry
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    throw new apiError(400, "OTP expired");
  }
  // Count Attempts
  if (otpRecord.otpAttempts >= 5) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });
    throw new apiError(400, "Too many attempts. Request a new OTP.");
  }

  const isOtpValid = await bcrypt.compare(otp, otpRecord.code);

  if (!isOtpValid) {
    otpRecord.otpAttempts += 1;
    await otpRecord.save();
    throw new apiError(400, "Invalid OTP");
  }

  // Check if Student who is registering is valid university Student
  const studentRecord = await UploadedStudent.findOne({
    registrationNo: normalizedRegistrationNo,
    cnic: normalizedCNIC,
  });

  if (!studentRecord) {
    throw new apiError(400, "Student Record not Found");
  }
  // Check if Student with registration No and CNIC is already registered
  const existingStudent = await Student.findOne({
    universityId: studentRecord.universityId,
    $or: [
      { registrationNo: normalizedRegistrationNo },
      { cnic: normalizedCNIC },
      { email: normalizedEmail },
    ],
  });
  if (existingStudent) {
    throw new apiError(400, "Already Registered");
  }
  // Save student data

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = new Student({
      name: studentRecord.name,
      registrationNo: normalizedRegistrationNo,
      cnic: normalizedCNIC,
      email: normalizedEmail,
      password,
      avatar,
      universityId: studentRecord.universityId,
      isActive: true,
      isRegistered: true,
      session: studentRecord.session,
    });

    await student.save({ session });

    await Otp.deleteOne({ _id: otpRecord._id }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log("Something went wrong while creating:", error);
    throw error;
  } finally {
    session.endSession();
  }

  const createdStudent = await Student.findOne({
    registrationNo: normalizedRegistrationNo,
    cnic: normalizedCNIC,
  }).select("-password");
  return res.status(201).json(new apiResponse(201, createdStudent, "Registration Successful"));
});

// ----------------------------- Login Student Controller -----------------------------------------
const loginStudent = asyncHandler(async (req, res, next) => {
  const { registrationNo, cnic, password } = req.body;

  if (!registrationNo || !cnic || !password) {
    throw new apiError(400, "All Fields are Required");
  }
  const normalizedRegistrationNo = registrationNo.trim().toLowerCase();
  const normalizedCNIC = cnic.trim().toLowerCase();

  if (!normalizedRegistrationNo || !normalizedCNIC || !password) {
    throw new apiError(400, "All Fields are Required");
  }
  // Check if user is Registered or Not
  const studentRecord = await Student.findOne({
    registrationNo: normalizedRegistrationNo,
    cnic: normalizedCNIC,
  });

  if (!studentRecord) {
    throw new apiError(400, "Invalid Credentials");
  }

  const isPasswordValid = await studentRecord.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(400, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(studentRecord);
  const response = await Student.findById(studentRecord._id).select("-password -refreshToken");

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

// Get Food Items from Database
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, cursorDate, cursorId } = req.query;

  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const filter = {
    isAvailable: true,
  };
  if (req.user) {
    filter.universityId = req.user.universityId;
  }
  if (category) {
    filter.category = category.trim();
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        category: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (cursorDate && cursorId) {
    if (!mongoose.isValidObjectId(cursorId)) {
      throw new apiError(400, "Invalid cursor");
    }

    const date = new Date(cursorDate);

    if (isNaN(date)) {
      throw new apiError(400, "Invalid cursor date");
    }

    filter.$or = [
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
    ];
  }

  const products = await Product.find(filter)
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(limit)
    .select("name price image category description");

  const lastProduct = products[products.length - 1];

  return res.status(200).json(
    new apiResponse(
      200,
      {
        products,
        nextCursor: lastProduct
          ? {
              cursorDate: lastProduct.createdAt,
              cursorId: lastProduct._id,
            }
          : null,
        hasMore: products.length === limit,
      },
      "Products fetched successfully"
    )
  );
});

// Estimate the Pickup time when Creating Order
const estimateOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  const universityId = req.user?.universityId;

  if (!universityId) {
    throw new apiError(401, "Unauthorized request");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new apiError(400, "Order items are required");
  }

  const result = await calculateOrder(items, universityId);

  return res.status(200).json(
    new apiResponse(
      200,

      {
        items: result.orderItems,

        totalAmount: result.totalAmount,

        estimatedTime: result.estimatedTime,
      },

      "Order estimate calculated successfully"
    )
  );
});
// ---------------------------- Order Confirmation ---------------------------------------------------

const MAX_PENDING_ORDERS = 5;
const MAX_DAILY_ORDERS = 10;

const createOrder = asyncHandler(async (req, res) => {
  const universityId = req.user?.universityId;

  if (!universityId) {
    throw new apiError(401, "Unauthorized request");
  }

  const { items, pickupTime } = req.body;

  console.log(pickupTime);
  if (!Array.isArray(items) || items.length === 0) {
    throw new apiError(400, "Order items are required");
  }

  const canteenAdminId = items[0]?.canteenAdminId;

  if (!canteenAdminId) {
    throw new apiError(400, "Canteen admin is required");
  }

  // ---------------------------------------------
  // Validate pickup time
  // ---------------------------------------------

  if (!pickupTime) {
    throw new apiError(400, "Pickup time is required!");
  }

  const parsedPickupTime = new Date(pickupTime);

  if (Number.isNaN(parsedPickupTime.getTime())) {
    throw new apiError(400, "Invalid pickup time");
  }

  if (parsedPickupTime <= new Date()) {
    throw new apiError(400, "Pickup time must be in the future");
  }

  // ---------------------------------------------
  // Maximum pending orders
  // ---------------------------------------------

  const pendingOrders = await Order.countDocuments({
    studentId: req.user._id,
    status: "Pending",
  });

  if (pendingOrders >= MAX_PENDING_ORDERS) {
    throw new apiError(
      403,
      "You already have 5 pending orders. You can place more orders once they are delivered."
    );
  }

  // ---------------------------------------------
  // Maximum daily orders
  // ---------------------------------------------

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayOrders = await Order.countDocuments({
    studentId: req.user._id,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (todayOrders >= MAX_DAILY_ORDERS) {
    throw new apiError(403, "You have reached the maximum limit of 10 orders for today.");
  }

  // ---------------------------------------------
  // Calculate order
  // ---------------------------------------------

  const result = await calculateOrder(items, universityId);

  // ---------------------------------------------
  // Create order
  // ---------------------------------------------

  const order = await Order.create({
    studentId: req.user._id,
    universityId,
    canteenAdminId,

    items: result.orderItems,

    totalAmount: result.totalAmount,

    estimatedTime: result.estimatedTime,

    pickupTime: parsedPickupTime,

    status: "Pending",

    paymentStatus: "Pending",
  });

  // ---------------------------------------------
  // Notify canteen admin
  // ---------------------------------------------

  try {
    const canteenAdmin = await CanteenAdmin.findById(canteenAdminId);

    if (canteenAdmin) {
      const notification = await OrderNotification.create({
        recipient: canteenAdmin._id,
        recipientModel: "CanteenAdmin",

        universityId,
        canteenAdminId: canteenAdmin._id,

        orderId: order._id,

        title: "New Order",

        message: `A new order has been placed by ${req.user.name}.`,

        type: "OrderPlaced",
      });

      const io = getSocketIO();

      io.to(`CanteenAdmin:${canteenAdmin._id}`).emit("newNotification", notification);

      io.to(`canteen:${universityId}`).emit("newOrder", {
        orderId: order._id,
        totalAmount: order.totalAmount,
        estimatedTime: order.estimatedTime,
        pickupTime: order.pickupTime,
        status: order.status,
        createdAt: order.createdAt,
      });
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }

  return res.status(201).json(new apiResponse(201, order, "Order created successfully"));
});

// Get the Details of Product which user Select from all Products
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid product id");
  }

  const product = await Product.findOne({
    _id: id,
  })
    .select("name price category image isAvailable description canteenAdminId")
    .lean();

  if (!product) {
    throw new apiError(404, "Product not found");
  }

  return res.status(200).json(new apiResponse(200, product, "Product fetched successfully"));
});

// Fetch My Orders
const getMyOrders = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;
  const universityId = req.user?.universityId;

  if (!studentId || !universityId) {
    throw new apiError(401, "Unauthorized request");
  }

  const orders = await Order.find({
    studentId,
    universityId,
  })
    .select("items totalAmount status paymentStatus estimatedTime pickupToken qrCodeUrl createdAt")
    .sort({
      createdAt: -1,
    })
    .limit(50)
    .lean();

  return res
    .status(200)
    .json(new apiResponse(200, orders, "Previous 50 orders fetched successfully"));
});

// Cancel Order if Status is Pending
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const studentId = req.user?._id;
  const universityId = req.user?.universityId;

  if (!studentId || !universityId) {
    throw new apiError(401, "Unauthorized request");
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new apiError(400, "Invalid order id");
  }

  const order = await Order.findOne({
    _id: orderId,
    studentId,
    universityId,
    status: "Pending",
  });

  if (!order) {
    throw new apiError(404, "Order not found or cannot be cancelled");
  }

  const cancelWindow = 10 * 60 * 1000;

  if (Date.now() - order.createdAt.getTime() > cancelWindow) {
    throw new apiError(400, "Cancellation time expired");
  }

  order.status = "Cancelled";
  order.cancelledAt = new Date();

  await order.save();

  // Notify relevant canteen admin only
  try {
    const canteenAdmin = await CanteenAdmin.findById(order.canteenAdminId).select("_id");

    if (canteenAdmin) {
      const notification = await OrderNotification.create({
        recipient: canteenAdmin._id,
        recipientModel: "CanteenAdmin",

        universityId,

        canteenAdminId: canteenAdmin._id,

        orderId: order._id,

        title: "Order Cancelled",

        message: `${req.user.name} has cancelled the order ${order._id} `,

        type: "OrderCancelled",
      });

      const io = getSocketIO();

      io.to(canteenAdmin._id.toString()).emit("newNotification", notification);

      io.to(`canteen:${universityId}`).emit("orderCancelled", {
        orderId: order._id,
        status: order.status,
        cancelledAt: order.cancelledAt,
      });
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        orderId: order._id,
        status: order.status,
        cancelledAt: order.cancelledAt,
      },
      "Order cancelled successfully"
    )
  );
});

// Update Profile
import { updateProfileController } from "./profileUpdate.controllers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ProfileOtp } from "../models/profileOtp.model.js";
import { sendOtp } from "../utils/sendOTP.js";

export const updateProfile = updateProfileController({
  OtpModel: ProfileOtp,
  uploadFn: uploadOnCloudinary,
  sendOtp,
});

export {
  requestOtp,
  registerStudent,
  loginStudent,
  getProducts,
  getProductById,
  getMyOrders,
  estimateOrder,
  createOrder,
  cancelOrder,
};
