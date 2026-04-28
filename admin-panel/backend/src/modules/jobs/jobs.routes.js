import { Router } from 'express';
import { validate } from '../../middlewares/validationMiddleware.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { requireVerifiedEmployer } from '../../middlewares/roleMiddleware.js';
import {
  createJobSchema,
  addRequirementSchema,
  addBenefitSchema,
  setDeadlineSchema,
  extendDeadlineSchema,
} from './jobs.validation.js';
import {
  createJobController,
  getJobController,
  getAllActiveJobsController,
  getMyJobsController,
  deleteJobController,
  activateJobController,
  deactivateJobController,
  addRequirementController,
  addBenefitController,
  setDeadlineController,
  extendDeadlineController,
  markAsUrgentController,
  unmarkAsUrgentController,
  getJobViewsController,
  generateJobFromPromptController
} from './jobs.controller.js';

// ─── Routes ──────────────────────────────────────────────────────────────
const router = Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────
// Get all active jobs (public)
router.get('/all', getAllActiveJobsController);

// Get job views (public)
router.get('/:jobId/views', getJobViewsController);

// ─── EMPLOYER ONLY ROUTES ───────────────────────────────────────────────
// Get employer's own jobs (must be before /:jobId route)
router.get(
  '/employer/myJobs',
  authMiddleware,
  requireVerifiedEmployer,
  getMyJobsController
);

// Create new job (employer only)
router.post(
  '/',
  authMiddleware,
  requireVerifiedEmployer,
  validate(createJobSchema),
  createJobController
);

// Get specific job by ID (public - increments views)
router.get('/:jobId', getJobController);

// Delete job (employer only)
router.delete(
  '/:jobId',
  authMiddleware,
  requireVerifiedEmployer,
  deleteJobController
);

// Activate job (employer only)
router.patch(
  '/:jobId/activate',
  authMiddleware,
  requireVerifiedEmployer,
  activateJobController
);

// Deactivate job (employer only)
router.patch(
  '/:jobId/deactivate',
  authMiddleware,
  requireVerifiedEmployer,
  deactivateJobController
);

// Add requirement (employer only)
router.patch(
  '/:jobId/requirements',
  authMiddleware,
  requireVerifiedEmployer,
  validate(addRequirementSchema),
  addRequirementController
);

// Add benefit (employer only)
router.patch(
  '/:jobId/benefits',
  authMiddleware,
  requireVerifiedEmployer,
  validate(addBenefitSchema),
  addBenefitController
);

// Set deadline (employer only)
router.patch(
  '/:jobId/deadline',
  authMiddleware,
  requireVerifiedEmployer,
  validate(setDeadlineSchema),
  setDeadlineController
);

// Extend deadline (employer only)
router.patch(
  '/:jobId/deadline/extend',
  authMiddleware,
  requireVerifiedEmployer,
  validate(extendDeadlineSchema),
  extendDeadlineController
);

// Mark as urgent (employer only)
router.patch(
  '/:jobId/urgent',
  authMiddleware,
  requireVerifiedEmployer,
  markAsUrgentController
);

// Unmark as urgent (employer only)
router.patch(
  '/:jobId/urgent/remove',
  authMiddleware,
  requireVerifiedEmployer,
  unmarkAsUrgentController
);

// POST /jobs/generate  — AI-powered job generation
router.post(
  '/generate',
  authMiddleware,
  requireVerifiedEmployer,
  generateJobFromPromptController  // No Zod validate() here — AI output is validated inside the service
);

export default router;
