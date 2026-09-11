import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: ["Fast Food", "Drinks", "Fries", "Snacks", "Desserts"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    image: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

productSchema.index({
  universityId: 1,
  isAvailable: 1,
});

productSchema.index({
  name: "text",
  category: "text",
});

export const Product = mongoose.model("Product", productSchema);
