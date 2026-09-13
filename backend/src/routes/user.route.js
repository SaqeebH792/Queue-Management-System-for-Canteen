import { Router } from "express";
import { ROLES } from "../constants.js";
// Models
import { Student } from "../models/student.model.js";
// Middlewares
import { verifyJWT, optionalVerifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
import {
  apiLimiter,
  loginLimiter,
  otpEmailLimiter,
  otpLimiter,
} from "../middlewares/rateLimiter.middleware.js";
// Controllers
import {
  requestOtp,
  registerStudent,
  loginStudent,
  getProducts,
  getProductById,
  estimateOrder,
  createOrder,
  getMyOrders,
  cancelOrder,
  updateProfile,
} from "../controllers/student.controllers.js";
import { resetPassword } from "../controllers/resetPassword.controllers.js";
import { logoutUser } from "../controllers/logout.controllers.js";
import { verifyAdmin } from "../controllers/auth.controllers.js";

const router = Router();

// Student Registration & Login
router.route("/student/requestOtp").post(otpLimiter, otpEmailLimiter, requestOtp);
router.route("/student/register").post(registerStudent);
router.route("/student/login").post(loginLimiter, loginStudent);

// Food Fetch and Order
router.route("/products").get(optionalVerifyJWT, getProducts);
router.route("/product/:id").get(optionalVerifyJWT, getProductById);
router.route("/order/estimate").post(verifyJWT, authorizeRole(ROLES.STUDENT), estimateOrder);
router.route("/order/create").post(verifyJWT, authorizeRole(ROLES.STUDENT), createOrder);

// Get My Orders
router.route("/myOrders").get(verifyJWT, authorizeRole(ROLES.STUDENT), getMyOrders);

// Cancle Order if Status is Pending
router.route("/cancelOrder/:orderId").patch(verifyJWT, authorizeRole(ROLES.STUDENT), cancelOrder);
// Forget Password
router.route("/students/forgotPassword/requestOtp").post(apiLimiter, resetPassword.requestOtp);
router
  .route("/students/forgotPassword/resetPassword")
  .post(apiLimiter, resetPassword.resetPassword);

// Student Logout
router.route("/student/logout").post(verifyJWT, logoutUser(Student));

// Update Profile work for All types of user
router
  .route("/requestOtp")
  .post(
    verifyJWT,
    apiLimiter,
    authorizeRole(ROLES.STUDENT, ROLES.UNIVERSITY_ADMIN, ROLES.CANTEEN_ADMIN),
    updateProfile.requestOtp
  );

router
  .route("/updateProfile")
  .patch(
    verifyJWT,
    authorizeRole(ROLES.STUDENT, ROLES.UNIVERSITY_ADMIN, ROLES.CANTEEN_ADMIN),
    uploadImage.single("avatar"),
    updateProfile.updateProfile
  );

router
  .route("/updatePassword")
  .patch(
    verifyJWT,
    authorizeRole(ROLES.STUDENT, ROLES.UNIVERSITY_ADMIN, ROLES.CANTEEN_ADMIN),
    updateProfile.updatePassword
  );
export default router;
