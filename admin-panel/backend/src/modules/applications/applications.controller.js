import { catchAsync } from '../../utils/catchAsync.js';
import {
  getJobApplicationsService,
  getApplicationService,
  updateApplicationStatusService,
  scheduleInterviewService,
  updateHiringNotesService,
  getJobApplicationStatsService,
  getEmployerApplicationStatsService,
  getAllEmployerApplicationsService,
  getAIRecommendationService,
  getAIRankingService,
  getCandidatesService,
  getEmployerReportsService,
} from './applications.service.js';

// ─── GET ALL APPLICATIONS FOR A JOB ──────────────────────────────────────────
// GET /applications/job/:jobId
export const getJobApplicationsController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;
  const query = req.query; // validated by middleware

  const result = await getJobApplicationsService(jobId, employerId, query);

  res.status(200).json({
    success: true,
    message: 'Applications fetched successfully',
    data: result,
  });
});

// ─── GET ALL APPLICATIONS ACROSS ALL EMPLOYER JOBS ────────────────────────────
// GET /applications/employer/all
export const getAllEmployerApplicationsController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;
  const query = req.query; // validated by middleware

  const result = await getAllEmployerApplicationsService(employerId, query);

  res.status(200).json({
    success: true,
    message: 'All employer applications fetched successfully',
    data: result,
  });
});

// ─── GET SINGLE APPLICATION ───────────────────────────────────────────────────
// GET /applications/:applicationId
export const getApplicationController = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const employerId = req.user.userId;

  const application = await getApplicationService(applicationId, employerId);

  res.status(200).json({
    success: true,
    message: 'Application fetched successfully',
    data: application,
  });
});

// ─── UPDATE APPLICATION STATUS ────────────────────────────────────────────────
// PATCH /applications/:applicationId/status
export const updateApplicationStatusController = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const employerId = req.user.userId;
  const { status, note, interviewDate, interviewLink, hiringNotes } = req.body;

  const updated = await updateApplicationStatusService(applicationId, employerId, {
    status,
    note,
    interviewDate,
    interviewLink,
    hiringNotes,
  });

  res.status(200).json({
    success: true,
    message: `Application status updated to '${status}'`,
    data: updated,
  });
});

// ─── SCHEDULE INTERVIEW ───────────────────────────────────────────────────────
// PATCH /applications/:applicationId/interview
export const scheduleInterviewController = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const employerId = req.user.userId;
  const { date, link } = req.body;

  const updated = await scheduleInterviewService(applicationId, employerId, {
    date,
    link,
  });

  res.status(200).json({
    success: true,
    message: 'Interview scheduled successfully',
    data: updated,
  });
});

// ─── UPDATE HIRING NOTES ──────────────────────────────────────────────────────
// PATCH /applications/:applicationId/notes
export const updateHiringNotesController = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const employerId = req.user.userId;
  const { hiringNotes } = req.body;

  const updated = await updateHiringNotesService(applicationId, employerId, hiringNotes);

  res.status(200).json({
    success: true,
    message: 'Hiring notes updated successfully',
    data: updated,
  });
});

// ─── GET APPLICATION STATS FOR A JOB ─────────────────────────────────────────
// GET /applications/job/:jobId/stats
export const getJobApplicationStatsController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const stats = await getJobApplicationStatsService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: 'Application stats fetched successfully',
    data: stats,
  });
});

// ─── GET STATS ACROSS ALL EMPLOYER JOBS ──────────────────────────────────────
// GET /applications/employer/stats
export const getEmployerApplicationStatsController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;

  const stats = await getEmployerApplicationStatsService(employerId);

  res.status(200).json({
    success: true,
    message: 'Employer application stats fetched successfully',
    data: stats,
  });
});

// ─── AI: GET RECOMMENDATION FOR SINGLE APPLICANT ─────────────────────────────
// GET /applications/:applicationId/ai-recommendation
export const getAIRecommendationController = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const employerId = req.user.userId;

  const recommendation = await getAIRecommendationService(applicationId, employerId);

  res.status(200).json({
    success: true,
    message: 'AI recommendation generated successfully',
    data: recommendation,
  });
});

// ─── AI: RANK ALL APPLICANTS FOR A JOB ───────────────────────────────────────
// GET /applications/job/:jobId/ai-ranking
export const getAIRankingController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const ranking = await getAIRankingService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: 'AI ranking generated successfully',
    data: ranking,
  });
});

// ─── GET UNIQUE CANDIDATES ───────────────────────────────────────────────────
// GET /applications/employer/candidates
export const getCandidatesController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;
  const query = req.query;

  const result = await getCandidatesService(employerId, query);

  res.status(200).json({
    success: true,
    message: 'Candidates fetched successfully',
    data: result,
  });
});

// ─── GET EMPLOYER REPORTS ────────────────────────────────────────────────────
// GET /applications/employer/reports
export const getEmployerReportsController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;

  const result = await getEmployerReportsService(employerId);

  res.status(200).json({
    success: true,
    message: 'Reports fetched successfully',
    data: result,
  });
});