import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { apiError } from "./apiError.js";

const PREP_TIME_MAP = {
  "Fast Food": 6,
  Drinks: 2,
  Fries: 2,
  Snacks: 2,
  Desserts: 5,
};

// Calculate realistic preparation time
const calculatePrepTime = (category, quantity) => {
  const baseTime = PREP_TIME_MAP[category] || 5;

  if (quantity <= 1) {
    return baseTime;
  }

  // Additional items take less time because kitchen batches them
  const extraTime = (quantity - 1) * (baseTime * 0.15);

  return Math.ceil(baseTime + extraTime);
};

export const calculateOrder = async (items, universityId) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new apiError(400, "Items are required");
  }

  if (!universityId) {
    throw new apiError(400, "University ID required");
  }

  // Merge duplicate products
  const itemMap = new Map();

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new apiError(400, "Invalid item data");
    }

    const existing = itemMap.get(item.productId) || 0;

    itemMap.set(item.productId, existing + item.quantity);
  }

  const productIds = [...itemMap.keys()];

  // One database query instead of N queries
  const products = await Product.find({
    _id: {
      $in: productIds,
    },
    universityId,
  });

  if (products.length !== productIds.length) {
    throw new apiError(404, "Some products were not found");
  }

  const productMap = new Map(products.map(product => [product._id.toString(), product]));

  let orderItems = [];
  let totalAmount = 0;
  let currentOrderTime = 0;

  for (const [productId, quantity] of itemMap) {
    const product = productMap.get(productId);

    if (!product.isAvailable) {
      throw new apiError(400, `${product.name} is unavailable`);
    }

    const itemTotal = product.price * quantity;

    totalAmount += itemTotal;

    currentOrderTime += calculatePrepTime(product.category, quantity);

    orderItems.push({
      productId: product._id,

      name: product.name,

      category: product.category,

      price: product.price,

      image: product.image,

      quantity,

      totalAmount,
    });
  }

  // Get current kitchen queue
  const pendingOrders = await Order.find({
    universityId,
    status: "Pending",
  }).select("items");

  let queueWorkload = 0;

  for (const order of pendingOrders) {
    for (const item of order.items) {
      queueWorkload += calculatePrepTime(item.category, item.quantity);
    }
  }

  const kitchenCapacity = 1;

  const estimatedTime = Math.ceil(queueWorkload + currentOrderTime);

  return {
    orderItems,

    totalAmount,

    estimatedTime,
  };
};
