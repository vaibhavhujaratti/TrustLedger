import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/auth";
import { getMilestoneSuggestions, getContractDraft, getDisputeSummary } from "../controllers/aiController";

const router = Router();

// Wrap with shared auth guards; Gemini services natively proxy heavily via backend caching and checks
router.use(authenticate);

router.post("/milestones", asyncHandler(getMilestoneSuggestions));
router.post("/contracts", asyncHandler(getContractDraft));
router.post("/dispute-summary", asyncHandler(getDisputeSummary));

export { router as aiRouter };
