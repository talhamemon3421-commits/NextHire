
import Job from '../jobs/jobs.model.js';
import AppError from '../../utils/AppError.js';
import Application, { EMPLOYER_ALLOWED_STATUSES } from './applications.model.js';
import { evaluateSingleApplicant, rankApplicants } from '../../services/Google_Gemini_API/index.js';

// ─── Lifecycle transition map ─────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  pending:     ['reviewing'],
  reviewing:   ['shortlisted', 'rejected'],
  shortlisted: ['interview'],
  interview:   ['accepted', 'rejected'],
};

// ─── Helper: verify job ownership ────────────────────────────────────────────
const assertJobOwnership = async (jobId, employerId) => {
  const job = await Job.findById(jobId).select('postedBy').lean();
  if (!job) throw new AppError('Job not found', 404);
  if (job.postedBy.toString() !== employerId.toString()) {
    throw new AppError('You are not authorised to manage this job', 403);
  }
  return job;
};

// ─── Helper: verify application belongs to employer's job ────────────────────
const assertApplicationOwnership = async (applicationId, employerId) => {
  const application = await Application.findById(applicationId)
    .populate('job', 'postedBy title')
    .lean();

  if (!application) throw new AppError('Application not found', 404);

  if (application.job.postedBy.toString() !== employerId.toString()) {
    throw new AppError('You are not authorised to manage this application', 403);
  }

  return application;
};

// ─── GET APPLICATIONS FOR A JOB ──────────────────────────────────────────────
export const getJobApplicationsService = async (jobId, employerId, query) => {
  await assertJobOwnership(jobId, employerId);

  const result = await Application.getApplicationsByJob(jobId, query);
  return result;
};

// ─── GET SINGLE APPLICATION ───────────────────────────────────────────────────
export const getApplicationService = async (applicationId, employerId) => {
  const application = await Application.getApplicationForEmployer(
    applicationId,
    employerId
  );

  if (!application) throw new AppError('Application not found', 404);

  return application;
};

// ─── UPDATE STATUS (with strict lifecycle enforcement) ────────────────────────
export const updateApplicationStatusService = async (
  applicationId,
  employerId,
  { status, note, interviewDate, interviewLink, hiringNotes }
) => {
  const existing = await assertApplicationOwnership(applicationId, employerId);

  if (existing.isWithdrawn) {
    throw new AppError('Cannot change status of a withdrawn application', 400);
  }

  // 1. Validate the status is employer-allowed
  if (!EMPLOYER_ALLOWED_STATUSES.includes(status)) {
    throw new AppError(`Invalid status. Allowed: ${EMPLOYER_ALLOWED_STATUSES.join(', ')}`, 400);
  }

  // 2. Enforce strict lifecycle transitions
  const currentStatus = existing.status;
  const allowedNextStatuses = VALID_TRANSITIONS[currentStatus];

  if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
    const allowed = allowedNextStatuses ? allowedNextStatuses.join(', ') : 'none';
    throw new AppError(
      `Cannot transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowed}`,
      400
    );
  }

  // 3. If transitioning to 'interview', require date and schedule it
  if (status === 'interview') {
    if (!interviewDate) {
      throw new AppError('Interview date is required when moving to interview status', 400);
    }

    const parsedDate = new Date(interviewDate);
    if (parsedDate <= new Date()) {
      throw new AppError('Interview date must be in the future', 400);
    }

    const application = await Application.findById(applicationId);
    application.interview = { date: parsedDate, link: interviewLink || null };
    application.status = 'interview';
    application.statusHistory.push({
      status: 'interview',
      changedBy: employerId,
      note: note || 'Interview scheduled',
    });

    return await application.save();
  }

  // 4. If accepting/rejecting from interview, require hiringNotes
  if (['accepted', 'rejected'].includes(status) && currentStatus === 'interview') {
    if (!hiringNotes) {
      throw new AppError('Hiring notes are required when accepting or rejecting after interview', 400);
    }

    const application = await Application.findById(applicationId);
    application.hiringNotes = hiringNotes;
    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: employerId,
      note: note || `Application ${status}`,
    });

    return await application.save();
  }

  // 5. Standard transition (pending→reviewing, reviewing→shortlisted/rejected)
  const updated = await Application.updateStatus(
    applicationId,
    status,
    employerId,
    note
  );

  return updated;
};

// ─── SCHEDULE INTERVIEW ───────────────────────────────────────────────────────
export const scheduleInterviewService = async (
  applicationId,
  employerId,
  { date, link }
) => {
  const existing = await assertApplicationOwnership(applicationId, employerId);

  if (existing.isWithdrawn) {
    throw new AppError('Cannot schedule interview for a withdrawn application', 400);
  }

  if (['accepted', 'rejected'].includes(existing.status)) {
    throw new AppError(
      `Cannot schedule interview for an application with status '${existing.status}'`,
      400
    );
  }

  const updated = await Application.scheduleInterview(
    applicationId,
    { date: new Date(date), link },
    employerId
  );

  return updated;
};

// ─── UPDATE HIRING NOTES ──────────────────────────────────────────────────────
export const updateHiringNotesService = async (
  applicationId,
  employerId,
  hiringNotes
) => {
  await assertApplicationOwnership(applicationId, employerId);

  const updated = await Application.updateHiringNotes(applicationId, hiringNotes);
  return updated;
};

// ─── GET STATUS STATS FOR A JOB ───────────────────────────────────────────────
export const getJobApplicationStatsService = async (jobId, employerId) => {
  await assertJobOwnership(jobId, employerId);

  const stats = await Application.getStatusStats(jobId);

  // Fill zeros for statuses that have no applications yet
  const filled = Object.fromEntries(
    ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'].map(
      (s) => [s, stats[s] ?? 0]
    )
  );

  const total = Object.values(filled).reduce((sum, n) => sum + n, 0);
  return { total, ...filled };
};

// ─── GET STATS ACROSS ALL EMPLOYER JOBS ──────────────────────────────────────
export const getEmployerApplicationStatsService = async (employerId) => {
  const raw = await Application.getEmployerStats(employerId);

  const filled = Object.fromEntries(
    ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'].map(
      (s) => [s, 0]
    )
  );

  raw.forEach(({ _id, count }) => {
    filled[_id] = count;
  });

  const total = Object.values(filled).reduce((sum, n) => sum + n, 0);
  return { total, ...filled };
};

// ─── GET ALL APPLICATIONS ACROSS ALL EMPLOYER JOBS ───────────────────────────
export const getAllEmployerApplicationsService = async (employerId, query) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = query;

  // First get all jobs belonging to this employer
  const jobs = await Job.find({ postedBy: employerId }).select('_id').lean();
  const jobIds = jobs.map((j) => j._id);

  if (!jobIds.length) {
    return { applications: [], total: 0, page, limit, totalPages: 0 };
  }

  const filter = { job: { $in: jobIds } };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicant', 'name email profilePicture phone location skills bio')
      .populate('job', 'title')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ─── AI: SINGLE APPLICANT RECOMMENDATION ─────────────────────────────────────
export const getAIRecommendationService = async (applicationId, employerId) => {
  // Fetch full application with populated applicant + job
  const application = await Application.findById(applicationId)
    .populate('applicant', 'name email skills bio location phone')
    .populate('job', 'title description requirements responsibilities skills experienceLevel jobType location')
    .lean();

  if (!application) throw new AppError('Application not found', 404);
  if (application.job.postedBy && application.job.postedBy.toString() !== employerId.toString()) {
    // Need to verify ownership via the job
    const job = await Job.findById(application.job._id || application.job).select('postedBy').lean();
    if (!job || job.postedBy.toString() !== employerId.toString()) {
      throw new AppError('Not authorised', 403);
    }
  }

  const jobData = {
    title: application.job.title,
    description: application.job.description,
    requirements: application.job.requirements,
    responsibilities: application.job.responsibilities,
    skills: application.job.skills,
    experienceLevel: application.job.experienceLevel,
    jobType: application.job.jobType,
    location: application.job.location,
  };

  const applicantData = {
    name: application.applicant.name,
    email: application.applicant.email,
    skills: application.applicant.skills,
    bio: application.applicant.bio,
    location: application.applicant.location,
    coverLetter: application.coverLetter,
  };

  const result = await evaluateSingleApplicant(jobData, applicantData);
  return result;
};

// ─── AI: RANK ALL APPLICANTS FOR A JOB ───────────────────────────────────────
export const getAIRankingService = async (jobId, employerId) => {
  await assertJobOwnership(jobId, employerId);

  const job = await Job.findById(jobId)
    .select('title description requirements responsibilities skills experienceLevel jobType location')
    .lean();

  if (!job) throw new AppError('Job not found', 404);

  const applications = await Application.find({ job: jobId })
    .populate('applicant', 'name email skills bio location')
    .lean();

  if (!applications.length) {
    throw new AppError('No applications found for this job', 404);
  }

  // Cap at 20 to avoid huge Gemini prompts
  const capped = applications.slice(0, 20);

  const jobData = {
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    skills: job.skills,
    experienceLevel: job.experienceLevel,
    jobType: job.jobType,
    location: job.location,
  };

  const applicantProfiles = capped.map((app) => ({
    applicationId: app._id.toString(),
    name: app.applicant?.name || 'Unknown',
    email: app.applicant?.email || '',
    skills: app.applicant?.skills || [],
    bio: app.applicant?.bio || '',
    location: app.applicant?.location || '',
    coverLetter: app.coverLetter || '',
    currentStatus: app.status,
  }));

  const result = await rankApplicants(jobData, applicantProfiles);
  return result;
};

// ─── GET UNIQUE CANDIDATES (deduplicated by applicant) ───────────────────────
export const getCandidatesService = async (employerId, query = {}) => {
  const { search, page = 1, limit = 30 } = query;

  // Get all employer job IDs
  const jobs = await Job.find({ postedBy: employerId }).select('_id title').lean();
  const jobIds = jobs.map((j) => j._id);
  const jobMap = Object.fromEntries(jobs.map((j) => [j._id.toString(), j.title]));

  if (!jobIds.length) {
    return { candidates: [], total: 0, page, limit, totalPages: 0 };
  }

  // Get all applications for those jobs, grouped data
  const applications = await Application.find({ job: { $in: jobIds } })
    .populate('applicant', 'name email profilePicture phone location skills bio')
    .populate('job', 'title')
    .sort({ createdAt: -1 })
    .lean();

  // Group by applicant ID
  const candidateMap = new Map();

  for (const app of applications) {
    if (!app.applicant?._id) continue;
    const applicantId = app.applicant._id.toString();

    if (!candidateMap.has(applicantId)) {
      candidateMap.set(applicantId, {
        _id: applicantId,
        name: app.applicant.name || 'Unknown',
        email: app.applicant.email || '',
        profilePicture: app.applicant.profilePicture || null,
        phone: app.applicant.phone || null,
        location: app.applicant.location || null,
        skills: app.applicant.skills || [],
        bio: app.applicant.bio || null,
        applications: [],
        totalApplications: 0,
        latestStatus: app.status,
        firstAppliedAt: app.createdAt,
        lastAppliedAt: app.createdAt,
      });
    }

    const candidate = candidateMap.get(applicantId);
    candidate.applications.push({
      applicationId: app._id.toString(),
      jobId: (app.job?._id || app.job).toString(),
      jobTitle: app.job?.title || jobMap[(app.job?._id || app.job).toString()] || 'Unknown',
      status: app.status,
      appliedAt: app.createdAt,
    });
    candidate.totalApplications++;

    // Track latest activity
    if (new Date(app.createdAt) > new Date(candidate.lastAppliedAt)) {
      candidate.lastAppliedAt = app.createdAt;
      candidate.latestStatus = app.status;
    }
  }

  let candidates = Array.from(candidateMap.values());

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    candidates = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
    );
  }

  // Sort by most recent activity
  candidates.sort((a, b) => new Date(b.lastAppliedAt) - new Date(a.lastAppliedAt));

  const total = candidates.length;
  const skip = (page - 1) * limit;
  const paginated = candidates.slice(skip, skip + limit);

  return {
    candidates: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ─── GET EMPLOYER REPORTS & ANALYTICS ────────────────────────────────────────
export const getEmployerReportsService = async (employerId) => {
  // 1. Get all jobs belonging to the employer
  const jobs = await Job.find({ postedBy: employerId }).select('_id title').lean();
  const jobIds = jobs.map((j) => j._id);

  if (!jobIds.length) {
    return {
      overview: { activeJobs: 0, totalApplications: 0, interviewsScheduled: 0, offersExtended: 0 },
      funnel: { pending: 0, reviewing: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 },
      jobPerformance: [],
      timeToHireDays: 0,
    };
  }

  // 2. Fetch all applications for these jobs
  const applications = await Application.find({ job: { $in: jobIds } }).lean();

  const funnel = { pending: 0, reviewing: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 };
  const jobPerfMap = new Map();
  let totalHireTimeMs = 0;
  let hiredCount = 0;

  jobs.forEach(j => {
    jobPerfMap.set(j._id.toString(), {
      jobId: j._id.toString(),
      title: j.title,
      views: 0, // Placeholder
      applications: 0,
      shortlisted: 0,
      interviews: 0,
      accepted: 0,
      rejected: 0,
    });
  });

  for (const app of applications) {
    const jobId = app.job.toString();
    const status = app.status;

    // Funnel counts
    if (funnel[status] !== undefined) funnel[status]++;

    // Job Performance counts
    if (jobPerfMap.has(jobId)) {
      const perf = jobPerfMap.get(jobId);
      perf.applications++;
      if (status === 'shortlisted') perf.shortlisted++;
      if (status === 'interview') perf.interviews++;
      if (status === 'accepted') perf.accepted++;
      if (status === 'rejected') perf.rejected++;
    }

    // Time-to-Hire calculation
    if (status === 'accepted' && app.statusHistory && app.statusHistory.length > 0) {
      // Find the first event (usually pending/created)
      const firstEvent = app.statusHistory.reduce((earliest, h) => 
        new Date(h.createdAt) < new Date(earliest.createdAt) ? h : earliest
      , app.statusHistory[0]);
      
      const acceptedEvent = app.statusHistory.find(h => h.status === 'accepted');
      
      if (firstEvent && acceptedEvent) {
        const timeToHire = new Date(acceptedEvent.createdAt) - new Date(firstEvent.createdAt);
        if (timeToHire > 0) {
          totalHireTimeMs += timeToHire;
          hiredCount++;
        }
      }
    }
  }

  const overview = {
    activeJobs: jobs.length,
    totalApplications: applications.length,
    interviewsScheduled: funnel.interview,
    offersExtended: funnel.accepted,
  };

  const timeToHireDays = hiredCount > 0 ? (totalHireTimeMs / hiredCount) / (1000 * 60 * 60 * 24) : 0;
  
  const jobPerformance = Array.from(jobPerfMap.values()).map(jp => {
    // Calculate conversion rate (accepted / applications)
    jp.conversionRate = jp.applications > 0 ? ((jp.accepted / jp.applications) * 100).toFixed(1) : 0;
    return jp;
  });

  return {
    overview,
    funnel,
    jobPerformance: jobPerformance.sort((a, b) => b.applications - a.applications),
    timeToHireDays: parseFloat(timeToHireDays.toFixed(1)),
  };
};