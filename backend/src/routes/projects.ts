import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorizeRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  getMyProjects,
  getProject,
  createProject,
  linkFreelancer,
  persistMilestones,
  upsertContract,
  signContract,
} from "../controllers/projectController";
import { createContractSchema, persistMilestonesSchema, signContractSchema } from "../types/schemas";

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

router.post(
  "/:projectId/milestones",
  authenticate,
  authorizeRole("CLIENT"),
  validateBody(persistMilestonesSchema),
  asyncHandler(persistMilestones)
);

router.post(
  "/:projectId/contract",
  authenticate,
  authorizeRole("CLIENT"),
  validateBody(createContractSchema),
  asyncHandler(upsertContract)
);

router.post(
  "/:projectId/sign",
  authenticate,
  validateBody(signContractSchema),
  asyncHandler(signContract)
);

export { router as projectRouter };
