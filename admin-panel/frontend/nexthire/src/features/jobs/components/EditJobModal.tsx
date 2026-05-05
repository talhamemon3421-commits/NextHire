import React, { useState, FormEvent } from "react";
import { X, Loader2, CheckCircle2, Save } from "lucide-react";
import { updateJob, type UpdateJobPayload, type CreateJobPayload } from "../api/jobsApi";

interface EditJobModalProps {
  job: any; // The full job object from the API
  onClose: () => void;
  onSaved: () => void;
}

export function EditJobModal({ job, onClose, onSaved }: EditJobModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form state from existing job
  const [title, setTitle] = useState<string>(job.title ?? "");
  const [description, setDescription] = useState<string>(job.description ?? "");
  const [jobType, setJobType] = useState<CreateJobPayload["jobType"]>(job.jobType ?? "full-time");
  const [experienceLevel, setExperienceLevel] = useState<CreateJobPayload["experienceLevel"]>(
    job.experienceLevel ?? "mid"
  );
  const [location, setLocation] = useState<string>(job.location ?? "");
  const [isRemote, setIsRemote] = useState<boolean>(job.isRemote ?? false);
  const [isUrgent, setIsUrgent] = useState<boolean>(job.isUrgent ?? false);
  const [isActive, setIsActive] = useState<boolean>(job.isActive ?? true);
  const [salaryMin, setSalaryMin] = useState<string>(
    job.salary?.min != null ? String(job.salary.min) : ""
  );
  const [salaryMax, setSalaryMax] = useState<string>(
    job.salary?.max != null ? String(job.salary.max) : ""
  );
  const [salaryCurrency, setSalaryCurrency] = useState<"PKR" | "USD">(
    job.salary?.currency ?? "PKR"
  );
  const [requirements, setRequirements] = useState<string>(
    (job.requirements ?? []).join("\n")
  );
  const [responsibilities, setResponsibilities] = useState<string>(
    (job.responsibilities ?? []).join("\n")
  );
  const [benefits, setBenefits] = useState<string>(
    (job.benefits ?? []).join("\n")
  );
  const [skills, setSkills] = useState<string>(
    (job.skills ?? []).join("\n")
  );
  const [deadline, setDeadline] = useState<string>(
    job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : ""
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: UpdateJobPayload = {
        title,
        description,
        jobType,
        experienceLevel,
        location: location || null,
        isRemote,
        isUrgent,
        isActive,
        requirements: requirements.split("\n").map(r => r.trim()).filter(Boolean),
        responsibilities: responsibilities.split("\n").map(r => r.trim()).filter(Boolean),
        benefits: benefits.split("\n").map(b => b.trim()).filter(Boolean),
        skills: skills.split("\n").map(s => s.trim()).filter(Boolean),
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };

      if (salaryMin || salaryMax) {
        payload.salary = {
          currency: salaryCurrency,
          min: salaryMin ? parseInt(salaryMin, 10) : null,
          max: salaryMax ? parseInt(salaryMax, 10) : null,
        };
      } else {
        // Explicitly clear salary if both are empty
        payload.salary = { currency: salaryCurrency, min: null, max: null };
      }

      await updateJob(job._id || job.id, payload);
      setIsSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update the job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Loading overlay */}
        {isSubmitting && !isSuccess && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-xl">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <div className="text-lg font-bold text-slate-800">Saving changes...</div>
            <div className="text-sm text-slate-500 mt-1">Please wait a moment.</div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Job Posting</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update any fields — only changed fields are sent to the server.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold">Job updated successfully!</span>
                <div className="text-xs text-emerald-600 mt-0.5">Refreshing the job list…</div>
              </div>
            </div>
          )}

          <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Status badges row */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${isActive ? "bg-blue-600" : "bg-slate-300"}`}
                  onClick={() => setIsActive(v => !v)}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Active listing</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${isUrgent ? "bg-amber-500" : "bg-slate-300"}`}
                  onClick={() => setIsUrgent(v => !v)}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isUrgent ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Urgent hiring</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${isRemote ? "bg-indigo-500" : "bg-slate-300"}`}
                  onClick={() => setIsRemote(v => !v)}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isRemote ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Remote job</span>
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Job title</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            {/* Experience + Job Type */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead / Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Employment type</label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Location + Deadline */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Location {isRemote && <span className="font-normal text-slate-400">(optional for remote)</span>}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Karachi, Pakistan"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Application deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Salary range</label>
              <div className="flex items-center gap-2">
                <select
                  value={salaryCurrency}
                  onChange={e => setSalaryCurrency(e.target.value as "PKR" | "USD")}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Min"
                  min={0}
                />
                <span className="text-slate-400 font-medium">—</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Max"
                  min={0}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Job description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            {/* Requirements + Responsibilities */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Required qualifications <span className="font-normal text-slate-400">(one per line)</span>
                </label>
                <textarea
                  rows={5}
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder={"Bachelor's degree\n3+ years experience\n..."}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Key responsibilities <span className="font-normal text-slate-400">(one per line)</span>
                </label>
                <textarea
                  rows={5}
                  value={responsibilities}
                  onChange={e => setResponsibilities(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder={"Lead the team\nDeliver features on time\n..."}
                />
              </div>
            </div>

            {/* Benefits + Skills */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Benefits <span className="font-normal text-slate-400">(one per line)</span>
                </label>
                <textarea
                  rows={4}
                  value={benefits}
                  onChange={e => setBenefits(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder={"Health insurance\nRemote-friendly\n..."}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Skills required <span className="font-normal text-slate-400">(one per line)</span>
                </label>
                <textarea
                  rows={4}
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder={"React\nNode.js\nPostgreSQL\n..."}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            form="edit-job-form"
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : isSuccess ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save changes</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
