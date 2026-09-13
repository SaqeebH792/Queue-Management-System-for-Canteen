import { Router } from "express";
import { ROLES } from "../constants.js";
// Models
import { UniversityAdmin } from "../models/universityAdmin.model.js";
import { CanteenAdmin } from "../models/CanteenAdmin.model.js";
// Middlewares
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";
import { uploadCsv, uploadImage } from "../middlewares/multer.middleware.js";
// Controllers
import {
  registerUniAdmin,
  uploadStudents,
  requestOtp,
  registerCanteenAdmin,
  loginUniAdmin,
  getAllStudents,
  updateStudentStatus,
  requestActivation,
  updateProfile,
  getActivationRequest,
  cancelActivationRequest,
} from "../controllers/universityAdmin.controllers.js";
import { verifyAdmin } from "../controllers/auth.controllers.js";
import { logoutUser } from "../controllers/logout.controllers.js";
import {
  apiLimiter,
  loginLimiter,
  otpEmailLimiter,
  otpLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const router = Router();
// University Admin
router.route("/admin/register").post(otpLimiter, otpEmailLimiter, requestOtp);
router.route("/admin/verify").post(registerUniAdmin);
router.route("/admin/login").post(loginLimiter, loginUniAdmin);

// Secured Routes
// University Admin Upload Canteen Admin Credentials
router
  .route("/register/canteen-admin")
  .post(verifyJWT, authorizeRole(ROLES.UNIVERSITY_ADMIN), registerCanteenAdmin);

// University Admin Upload Students Data
router
  .route("/students/upload")
  .post(
    verifyJWT,
    authorizeRole(ROLES.UNIVERSITY_ADMIN),
    uploadCsv.single("csvFile"),
    uploadStudents
  );
// University Admin getAll Listed Students
router
  .route("/uploadedStudents")
  .get(verifyJWT, authorizeRole(ROLES.UNIVERSITY_ADMIN), getAllStudents);
// Logout Route
router.route("/admin/logout").post(verifyJWT, logoutUser(UniversityAdmin));

router.route("/verify").get(verifyJWT, verifyAdmin);
// Student Delete or Deactivate
router.route("/students/:id/status").patch(verifyJWT, updateStudentStatus);

// Update Profile Routes
router.route("/requestOtp").post(verifyJWT, apiLimiter, updateProfile.requestOtp);

router
  .route("/updateProfile")
  .patch(verifyJWT, uploadImage.single("avatar"), updateProfile.updateProfile);

router.route("/updatePassword").patch(verifyJWT, updateProfile.updatePassword);

router
  .route("/activation-request")
  .post(verifyJWT, authorizeRole(ROLES.UNIVERSITY_ADMIN), requestActivation);

router
  .route("/activation-request")
  .get(verifyJWT, authorizeRole(ROLES.UNIVERSITY_ADMIN), getActivationRequest);

router
  .route("/activation-request/cancel")
  .patch(verifyJWT, authorizeRole(ROLES.UNIVERSITY_ADMIN), cancelActivationRequest);
export default router;
