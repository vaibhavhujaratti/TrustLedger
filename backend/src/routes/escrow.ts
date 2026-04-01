import { Router } from "express";
import { depositEscrow } from "../controllers/escrowController";
import { validateBody } from "../middleware/validate";
import { authenticate, authorizeRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { depositSchema } from "../types/schemas";

const router = Router({ mergeParams: true });

router.post(
  "/:projectId/deposit",
  authenticate,
  authorizeRole("CLIENT"),
  validateBody(depositSchema),
  asyncHandler(depositEscrow)
);

export { router as escrowRouter };
