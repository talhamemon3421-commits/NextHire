import { apiFetch } from "@/shared/lib/http";

export type GenerateJobRequest = { prompt: string };

export type CreateJobPayload = {
  title: string;
  description: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | "freelance";
  location?: string | null;
  isRemote: boolean;
  experienceLevel: "entry" | "junior" | "mid" | "senior" | "lead";
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  salary?: {
    min?: number | null;
    max?: number | null;
    currency: "PKR" | "USD";
  };
};

export type JobResponse = {
  success: boolean;
  message?: string;
  data: CreateJobPayload; // Same shape output generally
};

export async function generateJobFromPrompt(prompt: string) {
  return apiFetch<JobResponse>("/jobs/generate", {
    method: "POST",
    json: { prompt }
  });
}

export async function createJob(jobData: CreateJobPayload) {
  return apiFetch<{ success: boolean; message: string; data: any }>("/jobs", {
    method: "POST",
    json: jobData
  });
}

export async function getMyJobs() {
  return apiFetch<{ success: boolean; message: string; data: any[] }>("/jobs/employer/myJobs");
}

export type UpdateJobPayload = Partial<CreateJobPayload> & {
  isActive?: boolean;
  isUrgent?: boolean;
  deadline?: string | null;
};

export async function updateJob(jobId: string, data: UpdateJobPayload) {
  return apiFetch<{ success: boolean; message: string; data: any }>(`/jobs/${jobId}`, {
    method: "PATCH",
    json: data,
  });
}
