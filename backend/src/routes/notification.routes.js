import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
} from "../controllers/notifications.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/notifications").get(getNotifications);
router.patch("/notifications/read-all", markAllNotificationsRead);
router.patch("/notifications/:notificationId/read", markNotificationAsRead);

export default router;
