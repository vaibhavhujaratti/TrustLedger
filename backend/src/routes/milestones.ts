import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorizeRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { submitMilestoneSchema } from "../types/schemas";
import { submitMilestone, reviewMilestone, approveMilestone } from "../controllers/milestoneController";

const router = Router({ mergeParams: true });

// Endpoint handles FSM Submissions
router.post(
  "/:id/submit",
  authenticate,
  authorizeRole("FREELANCER"),
  validateBody(submitMilestoneSchema),
  asyncHandler(submitMilestone)
);

// Review triggered implicitly initially, or manually by client
router.post(
  "/:id/review",
  authenticate,
  authorizeRole("CLIENT"),
  asyncHandler(reviewMilestone)
);

// Release triggers processEscrowEvent automatically
router.post(
  "/:id/release",
  authenticate,
  authorizeRole("CLIENT"),
  asyncHandler(approveMilestone)
);

export { router as milestoneRouter };
