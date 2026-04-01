import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/auth";
import { createInvoice, getInvoice } from "../controllers/invoiceController";

const router = Router();

router.post(
  "/:projectId",
  authenticate,
  asyncHandler(createInvoice)
);

router.get(
  "/:projectId",
  authenticate,
  asyncHandler(getInvoice)
);

export { router as invoiceRouter };
