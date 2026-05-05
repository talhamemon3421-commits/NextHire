import { apiFetch } from "../../../shared/lib/http";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected";

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedBy: { _id: string; name: string } | string;
  note: string | null;
  createdAt: string;
}

export interface ApplicationData {
  _id: string;
  job: { _id: string; title: string; postedBy?: string };
  applicant: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    bio?: string;
  };
  coverLetter: string | null;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  interview: { date: string | null; link: string | null };
  hiringNotes: string | null;
  isWithdrawn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: ApplicationData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApplicationStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    interview: number;
    accepted: number;
    rejected: number;
  };
}

export interface AIRecommendation {
  score: number;
  recommendation: "yes" | "maybe" | "no";
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface AIRankingEntry {
  applicationId: string;
  name: string;
  score: number;
  rank: number;
  pros: string[];
  cons: string[];
}

// ─── Query helpers ────────────────────────────────────────────────────────────
function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /api/applications/employer/all */
export async function getEmployerApplications(query?: {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
}) {
  const qs = buildQuery(query || {});
  return apiFetch<ApplicationsResponse>(`/applications/employer/all${qs}`);
}

/** GET /api/applications/job/:jobId */
export async function getJobApplications(
  jobId: string,
  query?: {
    status?: ApplicationStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }
) {
  const qs = buildQuery(query || {});
  return apiFetch<ApplicationsResponse>(`/applications/job/${jobId}${qs}`);
}

/** GET /api/applications/:applicationId */
export async function getApplication(applicationId: string) {
  return apiFetch<{ success: boolean; message: string; data: ApplicationData }>(
    `/applications/${applicationId}`
  );
}

/** PATCH /api/applications/:applicationId/status */
export async function updateApplicationStatus(
  applicationId: string,
  body: {
    status: ApplicationStatus;
    note?: string;
    interviewDate?: string;
    interviewLink?: string;
    hiringNotes?: string;
  }
) {
  return apiFetch<{ success: boolean; message: string; data: ApplicationData }>(
    `/applications/${applicationId}/status`,
    { method: "PATCH", json: body }
  );
}

/** PATCH /api/applications/:applicationId/interview */
export async function scheduleInterview(
  applicationId: string,
  body: { date: string; link?: string }
) {
  return apiFetch<{ success: boolean; message: string; data: ApplicationData }>(
    `/applications/${applicationId}/interview`,
    { method: "PATCH", json: body }
  );
}

/** PATCH /api/applications/:applicationId/notes */
export async function updateHiringNotes(
  applicationId: string,
  hiringNotes: string
) {
  return apiFetch<{ success: boolean; message: string; data: ApplicationData }>(
    `/applications/${applicationId}/notes`,
    { method: "PATCH", json: { hiringNotes } }
  );
}

/** GET /api/applications/employer/stats */
export async function getEmployerStats() {
  return apiFetch<ApplicationStatsResponse>(`/applications/employer/stats`);
}

/** GET /api/applications/job/:jobId/stats */
export async function getJobStats(jobId: string) {
  return apiFetch<ApplicationStatsResponse>(`/applications/job/${jobId}/stats`);
}

/** GET /api/applications/:applicationId/ai-recommendation */
export async function getAIRecommendation(applicationId: string) {
  return apiFetch<{ success: boolean; message: string; data: AIRecommendation }>(
    `/applications/${applicationId}/ai-recommendation`
  );
}

/** GET /api/applications/job/:jobId/ai-ranking */
export async function getAIRanking(jobId: string) {
  return apiFetch<{ success: boolean; message: string; data: AIRankingEntry[] }>(
    `/applications/job/${jobId}/ai-ranking`
  );
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export interface CandidateApplication {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CandidateData {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  bio: string | null;
  applications: CandidateApplication[];
  totalApplications: number;
  latestStatus: ApplicationStatus;
  firstAppliedAt: string;
  lastAppliedAt: string;
}

export interface CandidatesResponse {
  success: boolean;
  message: string;
  data: {
    candidates: CandidateData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** GET /api/applications/employer/candidates */
export async function getCandidates(query?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const qs = buildQuery(query || {});
  return apiFetch<CandidatesResponse>(`/applications/employer/candidates${qs}`);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface JobPerformanceData {
  jobId: string;
  title: string;
  views: number;
  applications: number;
  shortlisted: number;
  interviews: number;
  accepted: number;
  rejected: number;
  conversionRate: string | number;
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: {
    overview: {
      activeJobs: number;
      totalApplications: number;
      interviewsScheduled: number;
      offersExtended: number;
    };
    funnel: {
      pending: number;
      reviewing: number;
      shortlisted: number;
      interview: number;
      accepted: number;
      rejected: number;
    };
    jobPerformance: JobPerformanceData[];
    timeToHireDays: number;
  };
}

/** GET /api/applications/employer/reports */
export async function getEmployerReports() {
  return apiFetch<ReportsResponse>(`/applications/employer/reports`);
}
