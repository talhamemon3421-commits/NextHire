import { catchAsync } from '../../utils/catchAsync.js';
import {
  createJobService,
  getJobService,
  getAllActiveJobsService,
  getJobsByEmployerService,
  deleteJobService,
  activateJobService,
  deactivateJobService,
  addRequirementService,
  addBenefitService,
  setDeadlineService,
  extendDeadlineService,
  markAsUrgentService,
  unmarkAsUrgentService,
  getJobViewsService,
  generateJobFromPromptService
} from './jobs.service.js';

// ─── CREATE JOB ──────────────────────────────────────────────────────────
export const createJobController = catchAsync(async (req, res) => {
  const jobData = req.body;
  const employerId = req.user.userId;

  const job = await createJobService(jobData, employerId);

  res.status(201).json({
    success: true,
    message: 'Job posted successfully',
    data: job,
  });
});

// ─── GET JOB BY ID ───────────────────────────────────────────────────────
export const getJobController = catchAsync(async (req, res) => {
  const { jobId } = req.params;

  const job = await getJobService(jobId);

  res.status(200).json({
    success: true,
    message: 'Job retrieved successfully',
    data: job,
  });
});

// ─── GET ALL ACTIVE JOBS ─────────────────────────────────────────────────
export const getAllActiveJobsController = catchAsync(async (req, res) => {
  const jobs = await getAllActiveJobsService();

  res.status(200).json({
    success: true,
    message: 'Active jobs retrieved successfully',
    data: jobs,
  });
});

// ─── GET MY JOBS (Employer) ──────────────────────────────────────────────
export const getMyJobsController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;

  const jobs = await getJobsByEmployerService(employerId);

  res.status(200).json({
    success: true,
    message: 'Your jobs retrieved successfully',
    data: jobs,
  });
});

// ─── DELETE JOB ──────────────────────────────────────────────────────────
export const deleteJobController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const result = await deleteJobService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// ─── ACTIVATE JOB ───────────────────────────────────────────────────────
export const activateJobController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const job = await activateJobService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: 'Job activated successfully',
    data: job,
  });
});

// ─── DEACTIVATE JOB ─────────────────────────────────────────────────────
export const deactivateJobController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const job = await deactivateJobService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: 'Job deactivated successfully',
    data: job,
  });
});

// ─── ADD REQUIREMENT ────────────────────────────────────────────────────
export const addRequirementController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { requirement } = req.body;
  const employerId = req.user.userId;

  const job = await addRequirementService(jobId, requirement, employerId);

  res.status(200).json({
    success: true,
    message: 'Requirement added successfully',
    data: job,
  });
});

// ─── ADD BENEFIT ────────────────────────────────────────────────────────
export const addBenefitController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { benefit } = req.body;
  const employerId = req.user.userId;

  const job = await addBenefitService(jobId, benefit, employerId);

  res.status(200).json({
    success: true,
    message: 'Benefit added successfully',
    data: job,
  });
});

// ─── SET DEADLINE ───────────────────────────────────────────────────────
export const setDeadlineController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { deadline } = req.body;
  const employerId = req.user.userId;

  const job = await setDeadlineService(jobId, deadline, employerId);

  res.status(200).json({
    success: true,
    message: 'Deadline set successfully',
    data: job,
  });
});

// ─── EXTEND DEADLINE ────────────────────────────────────────────────────
export const extendDeadlineController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { daysToExtend } = req.body;
  const employerId = req.user.userId;

  const job = await extendDeadlineService(jobId, daysToExtend, employerId);

  res.status(200).json({
    success: true,
    message: 'Deadline extended successfully',
    data: job,
  });
});

// ─── MARK AS URGENT ────────────────────────────────────────────────────
export const markAsUrgentController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const job = await markAsUrgentService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: 'Job marked as urgent successfully',
    data: job,
  });
});

// ─── UNMARK AS URGENT ──────────────────────────────────────────────────
export const unmarkAsUrgentController = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  const job = await unmarkAsUrgentService(jobId, employerId);

  res.status(200).json({
    success: true,
    message: 'Job unmarked as urgent successfully',
    data: job,
  });
});

// ─── GET JOB VIEWS ────────────────────────────────────────────────────
export const getJobViewsController = catchAsync(async (req, res) => {
  const { jobId } = req.params;

  const result = await getJobViewsService(jobId);

  res.status(200).json({
    success: true,
    message: 'Job views retrieved successfully',
    data: result,
  });
});

// Controller — add to your jobs controller file

export const generateJobFromPromptController = catchAsync(async (req, res) => {
  const { prompt } = req.body;

  const generatedData = await generateJobFromPromptService(prompt);

  res.status(200).json({  // 200 not 201 since nothing is created
    success: true,
    message: 'Job data generated successfully',
    data: generatedData,
  });
});
