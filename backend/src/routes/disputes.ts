import { Router } from "express";
import { raiseDispute } from "../controllers/disputeController";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { raiseDisputeSchema } from "../types/schemas";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(raiseDisputeSchema),
  asyncHandler(raiseDispute)
);

export { router as disputeRouter };
