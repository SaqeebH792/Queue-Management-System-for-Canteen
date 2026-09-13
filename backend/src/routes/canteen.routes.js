import { Router } from "express";
import { ROLES } from "../constants.js";
// Middlewares
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";
import { uploadCsv, uploadImage } from "../middlewares/multer.middleware.js";
import { apiLimiter, loginLimiter } from "../middlewares/rateLimiter.middleware.js";
// Controllers
import {
  loginCanteenAdmin,
  getOrders,
  listProduct,
  updateStatus,
  deleteProduct,
} from "../controllers/canteenAdmin.controllers.js";
import { scanQRCode } from "../controllers/scanQR.controllers.js";
import { CanteenAdmin } from "../models/CanteenAdmin.model.js";
import { logoutUser } from "../controllers/logout.controllers.js";

const router = Router();
// Canteen Admin Routes
router.route("/canteenAdmin/login").post(loginLimiter, loginCanteenAdmin);
router
  .route("/upload/product")
  .post(verifyJWT, authorizeRole(ROLES.CANTEEN_ADMIN), uploadImage.single("image"), listProduct);
// Canteen Admin Fetche all Orders
router.route("/getOrders").get(verifyJWT, authorizeRole(ROLES.CANTEEN_ADMIN), getOrders);
// Canteen Admin Update Status Of Order
router
  .route("/order/:orderId/status")
  .patch(verifyJWT, authorizeRole(ROLES.CANTEEN_ADMIN), updateStatus);
// Logout Canteen Admin
router
  .route("/canteenAdmin/logout")
  .post(verifyJWT, authorizeRole(ROLES.CANTEEN_ADMIN), logoutUser(CanteenAdmin));
router.route("/product/:id").delete(verifyJWT, authorizeRole(ROLES.CANTEEN_ADMIN), deleteProduct);

// Canteen Admin Scan QR Before Delivering Order to verify
router.route("/scanQR").post(verifyJWT, authorizeRole(ROLES.CANTEEN_ADMIN), scanQRCode);

export default router;
