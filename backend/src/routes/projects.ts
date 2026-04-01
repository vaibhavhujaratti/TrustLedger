import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorizeRole } from "../middleware/auth";
import { getMyProjects, getProject, createProject, linkFreelancer } from "../controllers/projectController";

const router = Router();

router.get("/", authenticate, asyncHandler(getMyProjects));
router.get("/:id", authenticate, asyncHandler(getProject));

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
