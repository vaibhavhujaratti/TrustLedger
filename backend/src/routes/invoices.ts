import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/auth";
import { createInvoice } from "../controllers/invoiceController";

const router = Router();

router.post(
  "/:projectId",
  authenticate,
  asyncHandler(createInvoice)
);

export { router as invoiceRouter };
