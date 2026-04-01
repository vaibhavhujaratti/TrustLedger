import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/auth";
import { markNotificationRead, myNotifications } from "../controllers/notificationController";

const router = Router();

router.get("/", authenticate, asyncHandler(myNotifications));
router.patch("/:id/read", authenticate, asyncHandler(markNotificationRead));

export { router as notificationRouter };

