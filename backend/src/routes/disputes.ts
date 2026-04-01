import { Router } from "express";
import { raiseDispute, getDispute, generateAiSummary, resolveDispute } from "../controllers/disputeController";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { raiseDisputeSchema, resolveDisputeSchema } from "../types/schemas";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(raiseDisputeSchema),
  asyncHandler(raiseDispute)
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(getDispute)
);

router.post(
  "/:id/ai-summary",
  authenticate,
  asyncHandler(generateAiSummary)
);

router.post(
  "/:id/resolve",
  authenticate,
  validateBody(resolveDisputeSchema),
  asyncHandler(resolveDispute)
);

export { router as disputeRouter };
