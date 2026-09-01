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

// Update Status, Generate QR Code and Send Notification when Status Changes

const ORDER_TRANSITIONS = Object.freeze({
  Pending: ["Accepted"],
  Accepted: ["Preparing"],
  Preparing: ["Ready"],
  Ready: ["Delivered"],
  Delivered: [],
});
const NOTIFICATIONS = Object.freeze({
  Accepted: {
    title: "Order Accepted",
    message: "Your order has been accepted.",
    type: "OrderAccepted",
  },

  Preparing: {
    title: "Preparing Order",
    message: "Your food is being prepared.",
    type: "OrderPreparing",
  },

  Ready: {
    title: "Order Ready",
    message: "Your order is ready for pickup.",
    type: "OrderReady",
  },

  Delivered: {
    title: "Order Completed",
    message: "Your order has been delivered.",
    type: "OrderCompleted",
  },
});

const updateStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new apiError(400, "Invalid order id");
  }

  if (!status) {
    throw new apiError(400, "Status is required");
  }

  const session = await mongoose.startSession();

  let uploadedQr = null;
  let notification = null;

  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new apiError(404, "Order not found");
    }

    // University check
    if (!order.universityId.equals(req.user.universityId)) {
      throw new apiError(403, "Unauthorized");
    }

    // Canteen admin ownership check
    if (!order.canteenAdminId.equals(req.user._id)) {
      throw new apiError(403, "You are not allowed to update this order");
    }

    const nextStates = ORDER_TRANSITIONS[order.status] ?? [];

    if (!nextStates.includes(status)) {
      throw new apiError(400, `Cannot change ${order.status} to ${status}`);
    }

    // Generate QR
    if (status === "Accepted" && !order.pickupToken) {
      const pickupToken = crypto.randomBytes(3).toString("hex");

      const qrPayload = JSON.stringify({
        token: pickupToken,
      });

      const tempDir = path.join(process.cwd(), "public", "temp");

      await mkdir(tempDir, {
        recursive: true,
      });

      const filePath = path.join(tempDir, `qr-${order._id}-${Date.now()}.png`);

      await QRCode.toFile(filePath, qrPayload);

      uploadedQr = await uploadOnCloudinary(filePath);

      if (!uploadedQr) {
        throw new apiError(500, "QR generation failed");
      }

      order.pickupToken = pickupToken;
      order.qrCodeUrl = uploadedQr.secure_url;
      order.qrUsed = false;
    }

    if (status === "Delivered") {
      if (order.qrUsed) {
        throw new apiError(400, "QR already used");
      }

      order.qrUsed = true;
    }

    order.status = status;

    await order.save({
      session,
    });

    // Create notification inside transaction

    const notify = NOTIFICATIONS[status];

    if (notify) {
      notification = await OrderNotification.create(
        [
          {
            recipient: order.studentId,
            recipientModel: "Student",

            universityId: order.universityId,

            canteenAdminId: order.canteenAdminId,

            orderId: order._id,

            title: notify.title,

            message: notify.message,

            type: notify.type,

            link: "/student/orders",
          },
        ],
        {
          session,
        }
      );

      notification = notification[0];
    }

    await session.commitTransaction();

    // Socket notification after transaction success

    if (notification) {
      try {
        const io = getSocketIO();

        // Only this student receives it
        io.to(order.studentId.toString()).emit("newNotification", notification);

        io.to(order.studentId.toString()).emit("orderStatusUpdated", {
          orderId: order._id,
          status,
        });
      } catch (socketError) {
        console.error("Socket notification failed:", socketError.message);
      }
    }

    return res.status(200).json(
      new apiResponse(
        200,
        {
          orderId: order._id,
          status: order.status,
          qrCodeUrl: order.qrCodeUrl ?? null,
        },
        "Order status updated successfully"
      )
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (uploadedQr?.public_id) {
      await cloudinary.uploader.destroy(uploadedQr.public_id).catch(() => {});
    }

    throw error;
  } finally {
    await session.endSession();
  }
});

// Delete Products
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid product id");
  }
  // Find and delete in a single database query
  const product = await Product.findOneAndDelete({
    _id: id,
    universityId: req.user.universityId,
    canteenAdminId: req.user._id,
  }).select("imagePublicId");

  if (!product) {
    throw new apiError(404, "Product not found");
  }

  // Delete image from Cloudinary
  if (product.imagePublicId) {
    try {
      const result = await cloudinary.uploader.destroy(product.imagePublicId);

      // "not found" is acceptable because the image is already gone
      if (result.result !== "ok" && result.result !== "not found") {
        logger?.error?.(
          `Unexpected Cloudinary response while deleting image: ${JSON.stringify(result)}`
        );
      }
    } catch (error) {
      logger?.error?.(`Cloudinary cleanup failed for ${product.imagePublicId}: ${error.message}`);
    }
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        deletedProductId: id,
      },
      "Product deleted successfully"
    )
  );
});
export { loginCanteenAdmin, listProduct, getOrders ,  updateStatus, deleteProduct};
