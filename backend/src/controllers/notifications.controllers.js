import mongoose from "mongoose";

// Models
import { Notification } from "../models/notification.model.js";
import { OrderNotification } from "../models/orderNotification.model.js";

// Utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const getRecipientModel = role => {
  const roleMap = {
    Student: "Student",
    "Canteen Admin": "CanteenAdmin",
    "University Admin": "UniversityAdmin",
    "Super Admin": "SuperAdmin",
  };

  return roleMap[role] || null;
};

const isOrderNotificationRole = role => {
  return role === "Student" || role === "Canteen Admin";
};

const isSystemNotificationRole = role => {
  return role === "University Admin" || role === "Super Admin";
};

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const recipientModel = getRecipientModel(role);

  if (!recipientModel) {
    throw new apiError(400, "Invalid user role");
  }

  let notifications = [];

  // FIX: Fetch notifications using .find() instead of running updates or referencing undefined variables
  if (isOrderNotificationRole(role)) {
    notifications = await OrderNotification.find({
      recipient: userId,
      recipientModel,
    })
      .sort({ createdAt: -1 })
      .lean();
  } else if (isSystemNotificationRole(role)) {
    notifications = await Notification.find({
      recipient: userId,
      recipientModel,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  return res
    .status(200)
    .json(new apiResponse(200, notifications, "Notifications fetched successfully"));
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new apiError(400, "Invalid notification id");
  }

  const userId = req.user._id;
  const role = req.user.role;

  const recipientModel = getRecipientModel(role);

  if (!recipientModel) {
    throw new apiError(400, "Invalid user role");
  }

  let notification = null;

  const updateQuery = {
    $set: {
      isRead: true,
      readAt: new Date(),
    },
  };

  // FIX: Replaced non-existent .returnDocument() with .findOneAndUpdate()
  if (isOrderNotificationRole(role)) {
    notification = await OrderNotification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
        recipientModel,
      },
      updateQuery,
      { new: true }
    );
  } else if (isSystemNotificationRole(role)) {
    notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
        recipientModel,
      },
      updateQuery,
      { new: true }
    );
  }

  if (!notification) {
    throw new apiError(404, "Notification not found");
  }

  return res.status(200).json(new apiResponse(200, notification, "Notification marked as read"));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const recipientModel = getRecipientModel(role);

  if (!recipientModel) {
    throw new apiError(400, "Invalid user role");
  }

  const update = {
    $set: {
      isRead: true,
      readAt: new Date(),
    },
  };

  let result;

  if (isOrderNotificationRole(role)) {
    result = await OrderNotification.updateMany(
      {
        recipient: userId,
        recipientModel,
        isRead: false,
      },
      update
    );
  } else if (isSystemNotificationRole(role)) {
    result = await Notification.updateMany(
      {
        recipient: userId,
        recipientModel,
        isRead: false,
      },
      update
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        modifiedCount: result?.modifiedCount || 0,
      },
      "All notifications marked as read"
    )
  );
});

export { getNotifications, markNotificationAsRead, markAllNotificationsRead };
