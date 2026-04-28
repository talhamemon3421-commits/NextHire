import Job from './jobs.model.js';
import Employer from '../users/employer.model.js';
import AppError from '../../utils/AppError.js';

// ─── CREATE JOB ──────────────────────────────────────────────────────────
// service
export const createJobService = async (jobData, employerId) => {
  if (!jobData.title || !jobData.description || !jobData.jobType || !jobData.experienceLevel) {
    throw new Error('Missing required fields: title, description, jobType, experienceLevel');
  }

  const job = await Job.createJob({ ...jobData, postedBy: employerId });
  return job;
};

// ─── GET JOB BY ID ───────────────────────────────────────────────────────
export const getJobService = async (jobId) => {
  const job = await Job.getJobById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  return job;
};

// ─── GET ALL ACTIVE JOBS ─────────────────────────────────────────────────
export const getAllActiveJobsService = async () => {
  const jobs = await Job.getAllActiveJobs();
  return jobs;
};

// ─── GET JOBS BY EMPLOYER ────────────────────────────────────────────────
export const getJobsByEmployerService = async (employerId) => {
  const jobs = await Job.getJobsByEmployer(employerId);
  return jobs;
};

// ─── DELETE JOB ──────────────────────────────────────────────────────────
export const deleteJobService = async (jobId, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  // Check if the employer owns this job
  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to delete this job',
      403,
      'UNAUTHORIZED_JOB_DELETE'
    );
  }

  await Job.deleteJob(jobId);
  return { message: 'Job deleted successfully' };
};

// ─── ACTIVATE JOB ───────────────────────────────────────────────────────
export const activateJobService = async (jobId, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.activateJob();
};

// ─── DEACTIVATE JOB ─────────────────────────────────────────────────────
export const deactivateJobService = async (jobId, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.deactivateJob();
};

// ─── ADD REQUIREMENT ────────────────────────────────────────────────────
export const addRequirementService = async (jobId, requirement, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.addRequirement(requirement);
};

// ─── ADD BENEFIT ────────────────────────────────────────────────────────
export const addBenefitService = async (jobId, benefit, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.addBenefit(benefit);
};

// ─── SET DEADLINE ───────────────────────────────────────────────────────
export const setDeadlineService = async (jobId, deadline, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.setDeadline(deadline);
};

// ─── EXTEND DEADLINE ────────────────────────────────────────────────────
export const extendDeadlineService = async (jobId, daysToExtend, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.extendDeadline(daysToExtend);
};

// ─── MARK AS URGENT ────────────────────────────────────────────────────
export const markAsUrgentService = async (jobId, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.markAsUrgent();
};

// ─── UNMARK AS URGENT ──────────────────────────────────────────────────
export const unmarkAsUrgentService = async (jobId, employerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError(
      'You are not authorized to modify this job',
      403,
      'UNAUTHORIZED_JOB_MODIFY'
    );
  }

  return await job.unmarkAsUrgent();
};

// ─── GET JOB VIEWS ────────────────────────────────────────────────────
export const getJobViewsService = async (jobId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  return { jobId, views: job.getViews() };
};
