import { Router } from 'express';
import {
  validate,
  validateQuery,
} from '../../middlewares/validationMiddleware.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { requireVerifiedEmployer } from '../../middlewares/roleMiddleware.js';

import {
  updateStatusSchema,
  scheduleInterviewSchema,
  updateHiringNotesSchema,
  getApplicationsQuerySchema,
} from './applications.validation.js';

import {
  getJobApplicationsController,
  getAllEmployerApplicationsController,
  getApplicationController,
  updateApplicationStatusController,
  scheduleInterviewController,
  updateHiringNotesController,
  getJobApplicationStatsController,
  getEmployerApplicationStatsController,
  getAIRecommendationController,
  getAIRankingController,
  getCandidatesController,
  getEmployerReportsController,
} from './applications.controller.js';

const router = Router();

// All routes require authenticated, verified employers
router.use(authMiddleware, requireVerifiedEmployer);

// ─── EMPLOYER-WIDE ROUTES ────────────────────────────────────────────────────

// GET /api/applications/employer/stats
router.get('/employer/stats', getEmployerApplicationStatsController);

// GET /api/applications/employer/reports
router.get('/employer/reports', getEmployerReportsController);

// GET /api/applications/employer/all?status=&page=&limit=&sortBy=&order=
router.get(
  '/employer/all',
  validateQuery(getApplicationsQuerySchema),
  getAllEmployerApplicationsController
);

// GET /api/applications/employer/candidates?search=&page=&limit=
router.get('/employer/candidates', getCandidatesController);

// ─── JOB-SCOPED ROUTES ───────────────────────────────────────────────────────

// GET /api/applications/job/:jobId/stats
router.get('/job/:jobId/stats', getJobApplicationStatsController);

// GET /api/applications/job/:jobId/ai-ranking
router.get('/job/:jobId/ai-ranking', getAIRankingController);

// GET /api/applications/job/:jobId?status=&page=&limit=&sortBy=&order=
router.get(
  '/job/:jobId',
  validateQuery(getApplicationsQuerySchema),
  getJobApplicationsController
);

// ─── APPLICATION-LEVEL ROUTES ────────────────────────────────────────────────

// GET /api/applications/:applicationId/ai-recommendation
router.get('/:applicationId/ai-recommendation', getAIRecommendationController);

// GET /api/applications/:applicationId
router.get('/:applicationId', getApplicationController);

// PATCH /api/applications/:applicationId/status
router.patch(
  '/:applicationId/status',
  validate(updateStatusSchema),
  updateApplicationStatusController
);

// PATCH /api/applications/:applicationId/interview
router.patch(
  '/:applicationId/interview',
  validate(scheduleInterviewSchema),
  scheduleInterviewController
);

// PATCH /api/applications/:applicationId/notes
router.patch(
  '/:applicationId/notes',
  validate(updateHiringNotesSchema),
  updateHiringNotesController
);

export default router;