import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorizeRole } from "../middleware/auth";
import { createProject, linkFreelancer } from "../controllers/projectController";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRole("CLIENT"),
  asyncHandler(createProject)
);

router.post(
  "/:projectId/link",
  authenticate,
  authorizeRole("CLIENT"),
  asyncHandler(linkFreelancer)
);

export { router as projectRouter };
