import { Router } from "express";

import {
  loginSuperAdmin,
  getDashboardStats,
  getActivationRequests,
  updateActivationRequest,
  deactivateUniversityAdmin,
  getUniversityAdmins,
} from "../controllers/superAdmin.controllers.js";
import { verifyAdmin } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { getNotifications } from "../controllers/notifications.controllers.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";

const router = Router();

router.post("/superAdmin/login", loginSuperAdmin);

router.get("/superAdmin/dashboard", verifyJWT, getDashboardStats);

router.get("/superAdmin/activationRequest", verifyJWT, getActivationRequests);

router.patch(
  "/superAdmin/activationRequest/requests/:requestId",
  verifyJWT,
  updateActivationRequest
);

router.get("/super-admin/university-admins", verifyJWT, getUniversityAdmins);

router.patch(
  "/super-admin/university-admins/:adminId/deactivate",
  verifyJWT,
  deactivateUniversityAdmin
);

export default router;
