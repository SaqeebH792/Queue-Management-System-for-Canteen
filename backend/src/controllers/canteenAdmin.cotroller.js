import mongoose from "mongoose";
// Models
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { CanteenAdmin } from "../models/canteenAdmin.model.js";
import { Student } from "../models/student.model.js";
// Utils
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
// Others
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
// Canteen Admin Login
const loginCanteenAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new apiError(400, "All fields are required");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }

  const canteenAdminRecord = await CanteenAdmin.findOne({
    email: normalizedEmail,
  });

  if (!canteenAdminRecord) {
    throw new apiError(401, "Invalid Credentials");
  }

  if (canteenAdminRecord.isActive === false) {
    throw new apiError(403, "Account disabled");
  }

  const isPasswordValid = await canteenAdminRecord.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(canteenAdminRecord);

  const loggedInUser = await CanteenAdmin.findById(canteenAdminRecord._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
        },
        "Login successful"
      )
    );
});

// Canteen Admin List Products

const CATEGORY_MAP = Object.freeze({
  "fast food": "Fast Food",
  drinks: "Drinks",
  fries: "Fries",
  snacks: "Snacks",
  desserts: "Desserts",
});

const listProduct = asyncHandler(async (req, res) => {
  const { name, price, category, description = "" } = req.body;

  // Validate required fields
  const trimmedName = name?.trim();
  const normalizedCategory = CATEGORY_MAP[category?.trim().toLowerCase()];

  if (!trimmedName || !normalizedCategory || price == null) {
    throw new apiError(400, "Name, category and price are required");
  }

  // Validate product name
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    throw new apiError(400, "Product name must be between 2 and 100 characters");
  }

  // Validate price
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new apiError(400, "Invalid price");
  }

  if (numericPrice > 100000) {
    throw new apiError(400, "Price exceeds allowed limit");
  }

  // Validate uploaded image
  if (!req.file?.path) {
    throw new apiError(400, "Product image is required");
  }

  // Upload image
  const image = await uploadOnCloudinary(req.file.path);

  if (!image?.secure_url || !image?.public_id) {
    throw new apiError(500, "Image upload failed");
  }

  let product;

  try {
    product = await Product.create({
      universityId: req.user.universityId,
      canteenAdminId: req.user._id,
      name: trimmedName,
      price: numericPrice,
      category: normalizedCategory,
      description: description.trim(),
      image: image.secure_url,
      imagePublicId: image.public_id,
      isAvailable: true,
    });
  } catch (error) {
    // Roll back uploaded image
    await cloudinary.uploader.destroy(image.public_id).catch(() => {});
    throw error;
  }

  return res.status(201).json(
    new apiResponse(
      201,
      {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image,
        isAvailable: product.isAvailable,
      },
      "Product created successfully"
    )
  );
});
// Get All order from database / Filter based on Category & Status / Search based on Student Name, Registration No or Cnic
const allowedStatuses = ["Pending", "Accepted", "Ready", "Preparing", "Delivered", "Cancelled"];
const getOrders = asyncHandler(async (req, res) => {
  const universityId = req.user.universityId;
  const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 50));
  const { search, status, cursorCreatedAt, cursorId } = req.query;

  const conditions = [
    {
      universityId,
    },
  ];

  // Status filter

  if (status && status !== "all") {
    if (!allowedStatuses.includes(status)) {
      throw new apiError(400, "Invalid order status");
    }
    conditions.push({
      status,
    });
  }

  // Search student

  if (search?.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const students = await Student.find({
      universityId,
      $or: [
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
          cnic: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ],
    })
      .select("_id")
      .lean();

    const studentIds = students.map(student => student._id);
    if (studentIds.length === 0) {
      return res.status(200).json(
        new apiResponse(
          200,
          {
            orders: [],
            pagination: {
              hasNextPage: false,
              nextCursor: null,
            },
          },
          "Orders fetched successfully"
        )
      );
    }

    conditions.push({
      studentId: {
        $in: studentIds,
      },
    });
  }

  // Cursor validation
  if (cursorCreatedAt && cursorId) {
    if (!mongoose.Types.ObjectId.isValid(cursorId)) {
      throw new apiError(400, "Invalid cursor id");
    }
    const cursorDate = new Date(cursorCreatedAt);
    if (Number.isNaN(cursorDate.getTime())) {
      throw new apiError(400, "Invalid cursor date");
    }
    conditions.push({
      $or: [
        {
          createdAt: {
            $lt: cursorDate,
          },
        },

        {
          createdAt: cursorDate,

          _id: {
            $lt: new mongoose.Types.ObjectId(cursorId),
          },
        },
      ],
    });
  }

  const orders = await Order.aggregate([
    {
      $match: {
        $and: conditions,
      },
    },

    {
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },

    {
      $limit: limit + 1,
    },

    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },

    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        status: 1,
        items: 1,
        createdAt: 1,
        "student._id": 1,
        "student.name": 1,
        "student.registrationNo": 1,
        "student.cnic": 1,
      },
    },
  ]);

  const hasNextPage = orders.length > limit;
  const data = hasNextPage ? orders.slice(0, limit) : orders;
  let nextCursor = null;
  if (hasNextPage) {
    const lastOrder = data[data.length - 1];
    nextCursor = {
      cursorCreatedAt: lastOrder.createdAt,
      cursorId: lastOrder._id,
    };
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        orders: data,
        pagination: {
          hasNextPage,
          nextCursor,
        },
      },

      "Orders fetched successfully"
    )
  );
});

export { loginCanteenAdmin, listProduct, getOrders };
