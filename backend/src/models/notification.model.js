import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    activationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActivationRequest",
      default: null,
    },

    // Who generated this notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },

    senderModel: {
      type: String,
      enum: ["University Admin", "Super Admin"],
      required: true,
    },

    // Who will receive it
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },

    recipientModel: {
      type: String,
      enum: ["University Admin", "Super Admin"],
      required: true,
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

    link: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "ActivationRequested",
        "ActivationApproved",
        "ActivationRejected",
        "ActivationCancelled",
        "System",
      ],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
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

notificationSchema.index({
  recipient: 1,
  recipientModel: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  recipientModel: 1,
  isRead: 1,
});

export const Notification = mongoose.model("Notification", notificationSchema);
