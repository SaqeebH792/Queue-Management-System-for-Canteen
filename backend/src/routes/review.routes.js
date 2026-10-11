import { Router } from "express";

import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controllers.js";

import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/product/:productId", getProductReviews);

router.post("/", verifyJWT, addReview);

router.patch("/:reviewId", verifyJWT, updateReview);

router.delete("/:reviewId", verifyJWT, deleteReview);

export default router;
