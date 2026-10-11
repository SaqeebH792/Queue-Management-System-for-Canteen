import Review from "../models/review.model.js";
import { Product } from "../models/product.model.js";
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product, rating and comment are required",
      });
    }

    const numericRating = Number(rating);

    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const trimmedComment = comment.trim();

    if (trimmedComment.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Review must contain at least 3 characters",
      });
    }

    if (trimmedComment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 1000 characters",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingReview = await Review.findOne({
      productId,
      studentId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item",
      });
    }

    const universityId = product.universityId;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: "Product university information is missing",
      });
    }

    const author = req.user?.name || req.user?.userName || req.user?.email || "Student";

    const review = await Review.create({
      productId,
      studentId,
      universityId,
      rating: numericRating,
      comment: trimmedComment,
      author,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item",
      });
    }

    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .select("_id rating comment author createdAt studentId");

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const review = await Review.findOne({
      _id: reviewId,
      studentId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    if (comment !== undefined) {
      const trimmedComment = comment.trim();

      if (trimmedComment.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Review must contain at least 3 characters",
        });
      }

      if (trimmedComment.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Review cannot exceed 1000 characters",
        });
      }

      review.comment = trimmedComment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      studentId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};
