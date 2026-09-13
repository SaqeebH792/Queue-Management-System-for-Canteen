import mongoose from "mongoose";

const orderNotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
      index: true,
    },
    recipientModel: {
      type: String,
      enum: ["Student", "CanteenAdmin"],
      required: true,
      index: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    canteenAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CanteenAdmin",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "OrderPlaced",
        "OrderAccepted",
        "OrderPreparing",
        "OrderReady",
        "OrderCompleted",
        "OrderCancelled",
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderNotificationSchema.index({
  recipient: 1,
  recipientModel: 1,
  createdAt: -1,
});

orderNotificationSchema.index({
  recipient: 1,
  isRead: 1,
});

export const OrderNotification = mongoose.model("OrderNotification", orderNotificationSchema);
