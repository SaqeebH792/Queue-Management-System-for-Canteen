import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready", "Delivered", "Cancelled"],
      default: "Pending",
    },
    pickupToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    qrGeneratedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    qrCodeUrl: {
      type: String,
    },
    pickedUpAt: {
      type: Date,
    },
    qrUsed: {
      type: Boolean,
      default: false,
    },
    queuePosition: {
      type: Number,
      default: 0,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    estimatedTime: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);
orderSchema.index({
  universityId: 1,
  createdAt: -1,
  _id: -1,
});

orderSchema.index({
  universityId: 1,
  status: 1,
  createdAt: -1,
  _id: -1,
});

export const Order = mongoose.model("Order", orderSchema);
