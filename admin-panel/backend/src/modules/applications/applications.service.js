
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
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  const toDateKey = (date) => new Date(date).toISOString().slice(0, 10);

  const safeRate = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(1)) : 0);
  const safeAvgDays = (totalMs, count) => (count > 0 ? Number((totalMs / count / MS_IN_DAY).toFixed(1)) : 0);

  const buildEmptyResponse = () => ({
    overview: {
      activeJobs: 0,
      totalApplications: 0,
      interviewsScheduled: 0,
      offersExtended: 0,
      hiredCandidates: 0,
      activePipelineCandidates: 0,
      offerAcceptanceRate: 0,
      overallConversionRate: 0,
      avgApplicationsPerJob: 0,
      avgTimeToHireDays: 0,
    },
    funnel: {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      accepted: 0,
      rejected: 0,
    },
    timeline: [],
    statusVelocityDays: {
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      accepted: 0,
      rejected: 0,
    },
    conversion: {
      pendingToReviewing: 0,
      reviewingToShortlisted: 0,
      shortlistedToInterview: 0,
      interviewToOffered: 0,
      offeredToAccepted: 0,
      acceptancePerApplication: 0,
      rejectionPerApplication: 0,
    },
    bottlenecks: {
      biggestDropStage: 'none',
      biggestDropRate: 0,
      averageDecisionDays: 0,
    },
    distributions: {
      byJobType: [],
      byExperienceLevel: [],
    },
    skillsDemand: [],
    jobPerformance: [],
    timeToHireDays: 0,
  });

  // 1. Get all jobs belonging to the employer
  const jobs = await Job.find({ postedBy: employerId })
    .select('_id title views applicationCount jobType experienceLevel skills createdAt isActive')
    .lean();
  const jobIds = jobs.map((j) => j._id);

  if (!jobIds.length) {
    return buildEmptyResponse();
  }

  // 2. Fetch all applications for these jobs
  const applications = await Application.find({ job: { $in: jobIds } }).lean();

  const funnel = { pending: 0, reviewing: 0, shortlisted: 0, interview: 0, offered: 0, accepted: 0, rejected: 0 };
  const jobPerfMap = new Map();
  const timelineMap = new Map();

  const velocityAccumulator = {
    reviewing: { totalMs: 0, count: 0 },
    shortlisted: { totalMs: 0, count: 0 },
    interview: { totalMs: 0, count: 0 },
    offered: { totalMs: 0, count: 0 },
    accepted: { totalMs: 0, count: 0 },
    rejected: { totalMs: 0, count: 0 },
  };

  const stageCounts = {
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    offered: 0,
    accepted: 0,
    rejected: 0,
  };

  const timeToHireAccumulator = { totalMs: 0, count: 0 };
  const decisionAccumulator = { totalMs: 0, count: 0 };

  const byJobTypeMap = new Map();
  const byExperienceMap = new Map();
  const skillsDemandMap = new Map();

  jobs.forEach(j => {
    if (j.jobType) byJobTypeMap.set(j.jobType, (byJobTypeMap.get(j.jobType) || 0) + 1);
    if (j.experienceLevel) byExperienceMap.set(j.experienceLevel, (byExperienceMap.get(j.experienceLevel) || 0) + 1);

    const jobSkills = Array.isArray(j.skills) ? j.skills : [];
    jobSkills.forEach((skill) => {
      if (!skill) return;
      const key = String(skill).trim().toLowerCase();
      if (!key) return;
      skillsDemandMap.set(key, (skillsDemandMap.get(key) || 0) + 1);
    });

    jobPerfMap.set(j._id.toString(), {
      jobId: j._id.toString(),
      title: j.title,
      views: j.views || 0,
      applications: 0,
      shortlisted: 0,
      interviews: 0,
      offered: 0,
      accepted: 0,
      rejected: 0,
      recentApplications7d: 0,
      recentHires30d: 0,
      avgTimeToDecisionDays: 0,
      shortlistingRate: 0,
      interviewRate: 0,
      offerRate: 0,
      conversionRate: 0,
      acceptanceRate: 0,
    });
  });

  const now = new Date();
  const timelineDays = 30;
  const cutoff30d = new Date(now.getTime() - 30 * MS_IN_DAY);
  const cutoff7d = new Date(now.getTime() - 7 * MS_IN_DAY);

  for (let i = timelineDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * MS_IN_DAY);
    const key = toDateKey(d);
    timelineMap.set(key, {
      date: key,
      applications: 0,
      interviews: 0,
      offers: 0,
      hires: 0,
      rejections: 0,
    });
  }

  for (const app of applications) {
    const jobId = app.job.toString();
    const status = app.status || 'pending';
    const createdAt = new Date(app.createdAt);
    const statusHistory = Array.isArray(app.statusHistory) ? app.statusHistory : [];
    const timelineKey = toDateKey(createdAt);

    // Funnel counts
    if (funnel[status] !== undefined) funnel[status]++;
    if (stageCounts[status] !== undefined) stageCounts[status]++;
    if (timelineMap.has(timelineKey)) timelineMap.get(timelineKey).applications++;

    // Job Performance counts
    if (jobPerfMap.has(jobId)) {
      const perf = jobPerfMap.get(jobId);
      perf.applications++;
      if (status === 'shortlisted') perf.shortlisted++;
      if (status === 'interview') perf.interviews++;
      if (status === 'offered') perf.offered++;
      if (status === 'accepted') perf.accepted++;
      if (status === 'rejected') perf.rejected++;
      if (createdAt >= cutoff7d) perf.recentApplications7d++;
      if (status === 'accepted' && createdAt >= cutoff30d) perf.recentHires30d++;
    }

    const eventByStatus = new Map();
    for (const h of statusHistory) {
      if (!h?.status || !h?.createdAt) continue;
      if (!eventByStatus.has(h.status)) {
        eventByStatus.set(h.status, new Date(h.createdAt));
      }
    }

    ['reviewing', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected'].forEach((targetStatus) => {
      if (!eventByStatus.has(targetStatus)) return;
      const delta = eventByStatus.get(targetStatus) - createdAt;
      if (delta > 0 && velocityAccumulator[targetStatus]) {
        velocityAccumulator[targetStatus].totalMs += delta;
        velocityAccumulator[targetStatus].count += 1;
      }
    });

    const firstDecisionDate =
      eventByStatus.get('accepted') ||
      eventByStatus.get('rejected') ||
      eventByStatus.get('offered');

    if (firstDecisionDate) {
      const decisionMs = firstDecisionDate - createdAt;
      if (decisionMs > 0) {
        decisionAccumulator.totalMs += decisionMs;
        decisionAccumulator.count += 1;
      }
    }

    if (eventByStatus.get('interview')) {
      const interviewKey = toDateKey(eventByStatus.get('interview'));
      if (timelineMap.has(interviewKey)) timelineMap.get(interviewKey).interviews++;
    }

    if (eventByStatus.get('offered')) {
      const offerKey = toDateKey(eventByStatus.get('offered'));
      if (timelineMap.has(offerKey)) timelineMap.get(offerKey).offers++;
    }

    if (eventByStatus.get('accepted')) {
      const hireKey = toDateKey(eventByStatus.get('accepted'));
      if (timelineMap.has(hireKey)) timelineMap.get(hireKey).hires++;

      const timeToHire = eventByStatus.get('accepted') - createdAt;
      if (timeToHire > 0) {
        timeToHireAccumulator.totalMs += timeToHire;
        timeToHireAccumulator.count += 1;
      }
    }

    if (eventByStatus.get('rejected')) {
      const rejKey = toDateKey(eventByStatus.get('rejected'));
      if (timelineMap.has(rejKey)) timelineMap.get(rejKey).rejections++;
    }

    if (jobPerfMap.has(jobId)) {
      const perf = jobPerfMap.get(jobId);
      const decisionDate =
        eventByStatus.get('accepted') ||
        eventByStatus.get('rejected') ||
        eventByStatus.get('offered');

      if (decisionDate) {
        const decisionMs = decisionDate - createdAt;
        if (decisionMs > 0) {
          if (!perf._decisionMs) {
            perf._decisionMs = 0;
            perf._decisionCount = 0;
          }
          perf._decisionMs += decisionMs;
          perf._decisionCount += 1;
        }
      }
    }
  }

  const totalApplications = applications.length;
  const interviewsScheduled = funnel.interview;
  const offersExtended = funnel.offered + funnel.accepted;
  const hiredCandidates = funnel.accepted;
  const activePipelineCandidates = funnel.reviewing + funnel.shortlisted + funnel.interview + funnel.offered;

  const timeline = Array.from(timelineMap.values());

  const statusVelocityDays = {
    reviewing: safeAvgDays(velocityAccumulator.reviewing.totalMs, velocityAccumulator.reviewing.count),
    shortlisted: safeAvgDays(velocityAccumulator.shortlisted.totalMs, velocityAccumulator.shortlisted.count),
    interview: safeAvgDays(velocityAccumulator.interview.totalMs, velocityAccumulator.interview.count),
    offered: safeAvgDays(velocityAccumulator.offered.totalMs, velocityAccumulator.offered.count),
    accepted: safeAvgDays(velocityAccumulator.accepted.totalMs, velocityAccumulator.accepted.count),
    rejected: safeAvgDays(velocityAccumulator.rejected.totalMs, velocityAccumulator.rejected.count),
  };

  const conversion = {
    pendingToReviewing: safeRate(stageCounts.reviewing, stageCounts.pending),
    reviewingToShortlisted: safeRate(stageCounts.shortlisted, stageCounts.reviewing),
    shortlistedToInterview: safeRate(stageCounts.interview + stageCounts.offered + stageCounts.accepted, stageCounts.shortlisted),
    interviewToOffered: safeRate(stageCounts.offered + stageCounts.accepted, stageCounts.interview),
    offeredToAccepted: safeRate(stageCounts.accepted, stageCounts.offered + stageCounts.accepted),
    acceptancePerApplication: safeRate(stageCounts.accepted, totalApplications),
    rejectionPerApplication: safeRate(stageCounts.rejected, totalApplications),
  };

  const dropOffByStage = [
    { stage: 'pending->reviewing', rate: Math.max(0, 100 - conversion.pendingToReviewing) },
    { stage: 'reviewing->shortlisted', rate: Math.max(0, 100 - conversion.reviewingToShortlisted) },
    { stage: 'shortlisted->interview', rate: Math.max(0, 100 - conversion.shortlistedToInterview) },
    { stage: 'interview->offered', rate: Math.max(0, 100 - conversion.interviewToOffered) },
    { stage: 'offered->accepted', rate: Math.max(0, 100 - conversion.offeredToAccepted) },
  ];
  const topDrop = dropOffByStage.sort((a, b) => b.rate - a.rate)[0] || { stage: 'none', rate: 0 };

  const bottlenecks = {
    biggestDropStage: topDrop.stage,
    biggestDropRate: Number(topDrop.rate.toFixed(1)),
    averageDecisionDays: safeAvgDays(decisionAccumulator.totalMs, decisionAccumulator.count),
  };

  const distributions = {
    byJobType: Array.from(byJobTypeMap.entries()).map(([label, count]) => ({
      label,
      count,
      percentage: safeRate(count, jobs.length),
    })),
    byExperienceLevel: Array.from(byExperienceMap.entries()).map(([label, count]) => ({
      label,
      count,
      percentage: safeRate(count, jobs.length),
    })),
  };

  const skillsDemand = Array.from(skillsDemandMap.entries())
    .map(([skill, demandScore]) => ({ skill, demandScore }))
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 12);

  const overview = {
    activeJobs: jobs.length,
    totalApplications,
    interviewsScheduled,
    offersExtended,
    hiredCandidates,
    activePipelineCandidates,
    offerAcceptanceRate: safeRate(hiredCandidates, offersExtended),
    overallConversionRate: safeRate(hiredCandidates, totalApplications),
    avgApplicationsPerJob: Number((totalApplications / jobs.length).toFixed(1)),
    avgTimeToHireDays: safeAvgDays(timeToHireAccumulator.totalMs, timeToHireAccumulator.count),
  };

  const timeToHireDays = safeAvgDays(timeToHireAccumulator.totalMs, timeToHireAccumulator.count);

  const jobPerformance = Array.from(jobPerfMap.values()).map(jp => {
    const denominator = jp.applications;
    jp.shortlistingRate = safeRate(jp.shortlisted, denominator);
    jp.interviewRate = safeRate(jp.interviews + jp.offered + jp.accepted, denominator);
    jp.offerRate = safeRate(jp.offered + jp.accepted, denominator);
    jp.conversionRate = safeRate(jp.accepted, denominator);
    jp.acceptanceRate = safeRate(jp.accepted, jp.offered + jp.accepted);

    if (jp._decisionCount > 0) {
      jp.avgTimeToDecisionDays = safeAvgDays(jp._decisionMs, jp._decisionCount);
    }

    delete jp._decisionMs;
    delete jp._decisionCount;
    return jp;
  });

  return {
    overview,
    funnel,
    timeline,
    statusVelocityDays,
    conversion,
    bottlenecks,
    distributions,
    skillsDemand,
    jobPerformance: jobPerformance.sort((a, b) => b.applications - a.applications),
    timeToHireDays,
  };
};