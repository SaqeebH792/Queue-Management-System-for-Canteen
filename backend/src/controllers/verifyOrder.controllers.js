import mongoose from "mongoose";

// Models
import { Order } from "../models/order.model.js";
import { OrderNotification } from "../models/orderNotification.model.js";

// Utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

// Socket
import { getSocketIO } from "../socket.js";

const verifyOrder = asyncHandler(async (req, res) => {
  let { orderId, token, qrData } = req.body;

  let isQRVerification = false;

  if (qrData) {
    isQRVerification = true;

    try {
      const parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData;

      orderId = parsed?.orderId;
      token = parsed?.token;
    } catch {
      throw new apiError(400, "Invalid QR data.");
    }
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    throw new apiError(400, "Pickup token is required.");
  }

  token = token.trim();

  if (isQRVerification) {
    if (!orderId) {
      throw new apiError(400, "QR code does not contain a valid order ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new apiError(400, "QR code contains an invalid order ID.");
    }
  }

  const query = isQRVerification
    ? {
        _id: orderId,
        pickupToken: token,
        status: "Ready",
        qrUsed: false,
      }
    : {
        pickupToken: token,
        status: "Ready",
        qrUsed: false,
      };

  const order = await Order.findOneAndUpdate(
    query,
    {
      $set: {
        status: "Delivered",
        qrUsed: true,
        pickedAt: new Date(),
      },
    },
    {
      new: true,
    }
  );

  if (!order) {
    throw new apiError(
      400,
      isQRVerification
        ? "Invalid QR code, token, or order. The QR may already be used or the order may not be ready."
        : "Invalid pickup token, token already used, or order is not ready."
    );
  }

  const notification = await OrderNotification.create({
    recipient: order.studentId,
    recipientModel: "Student",

    universityId: order.universityId,

    canteenAdminId: order.canteenAdminId,

    orderId: order._id,

    title: "Order Completed",

    message: "Your order has been successfully collected.",

    type: "OrderCompleted",
  });

  const io = getSocketIO();

  const studentRoom = order.studentId.toString();

  io.to(studentRoom).emit("orderStatusUpdated", {
    orderId: order._id,
    status: "Delivered",
  });

  io.to(studentRoom).emit("newNotification", {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    orderId: notification.orderId,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        order,
        notification,
        verificationMethod: isQRVerification ? "QR" : "MANUAL",
      },
      "Order delivered successfully."
    )
  );
});

export { verifyOrder };
