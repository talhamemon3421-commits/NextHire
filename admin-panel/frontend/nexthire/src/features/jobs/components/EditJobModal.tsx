import React, { useState, FormEvent } from "react";
import { X, Loader2, CheckCircle2, Save, Briefcase, Calendar, MapPin, DollarSign, Zap, Globe, AlertCircle } from "lucide-react";
import { updateJob, type UpdateJobPayload, type CreateJobPayload } from "../api/jobsApi";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-card rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-border/50">

        {/* Loading overlay */}
        {isSubmitting && !isSuccess && (
          <div className="absolute inset-0 z-[110] bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground uppercase tracking-[0.2em]">Synchronizing listing</h3>
          </div>
        )}

        {/* Success overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-[110] bg-emerald-500 flex flex-col items-center justify-center text-white animate-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 mb-6 animate-bounce" />
            <h3 className="text-3xl font-black tracking-tighter uppercase">Changes Secured!</h3>
            <p className="text-lg font-medium mt-2 opacity-90">Closing session...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border/50 bg-accent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Edit Job Posting</h2>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-0.5">Recruitment Strategy Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-muted-foreground hover:bg-accent rounded-2xl transition-all duration-300 hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold border border-red-500/20 animate-in shake duration-500">
              {error}
            </div>
          )}

          <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-10">

            {/* Status toggles row */}
            <div className="flex flex-wrap gap-6 p-6 bg-accent/20 rounded-[2rem] border border-border shadow-inner">
              {[
                { label: "Active listing", value: isActive, setter: setIsActive, color: "bg-emerald-500", icon: CheckCircle2 },
                { label: "Urgent hiring", value: isUrgent, setter: setIsUrgent, color: "bg-amber-500", icon: Zap },
                { label: "Remote job", value: isRemote, setter: setIsRemote, color: "bg-indigo-500", icon: Globe },
              ].map((item) => (
                <label key={item.label} className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    className={cn(
                      "w-12 h-6 rounded-full transition-all duration-300 relative border border-border/50",
                      item.value ? item.color : "bg-accent"
                    )}
                    onClick={() => item.setter(v => !v)}
                  >
                    <span className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300",
                      item.value ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                  <div className="flex items-center gap-2">
                    <item.icon className={cn("w-3.5 h-3.5", item.value ? item.color.replace('bg-', 'text-') : "text-muted-foreground")} />
                    <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", item.value ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Briefcase className="w-3 h-3 text-primary" /> Position Title
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-accent/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value as any)}
                  className="w-full bg-accent/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior Associate</option>
                  <option value="mid">Mid-Senior Level</option>
                  <option value="senior">Senior Staff</option>
                  <option value="lead">Lead / Manager</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Employment Type</label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value as any)}
                  className="w-full bg-accent/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="full-time">Full-time Regular</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Fixed Contract</option>
                  <option value="internship">Internship Program</option>
                  <option value="freelance">Freelance / Project</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" /> Location {isRemote && <span className="opacity-50">(optional for remote)</span>}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="e.g. London, UK"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" /> Application Deadline
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-primary" /> Compensation Range
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-accent/20 p-4 rounded-[2rem] border border-border shadow-inner">
                <select
                  value={salaryCurrency}
                  onChange={e => setSalaryCurrency(e.target.value as "PKR" | "USD")}
                  className="w-full sm:w-auto bg-card border border-border rounded-xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-6 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Minimum"
                  min={0}
                />
                <div className="w-4 h-0.5 bg-border rounded-full shrink-0 hidden sm:block" />
                <input
                  type="number"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-6 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Maximum"
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Job Description</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-accent/30 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                  <span>Required Qualifications</span>
                  <span className="opacity-50 text-[8px] font-bold">ONE PER LINE</span>
                </label>
                <textarea
                  rows={6}
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                  <span>Key Responsibilities</span>
                  <span className="opacity-50 text-[8px] font-bold">ONE PER LINE</span>
                </label>
                <textarea
                  rows={6}
                  value={responsibilities}
                  onChange={e => setResponsibilities(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                  <span>Perks & Benefits</span>
                  <span className="opacity-50 text-[8px] font-bold">ONE PER LINE</span>
                </label>
                <textarea
                  rows={4}
                  value={benefits}
                  onChange={e => setBenefits(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                  <span>Required Skills</span>
                  <span className="opacity-50 text-[8px] font-bold">ONE PER LINE</span>
                </label>
                <textarea
                  rows={4}
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-end gap-4 bg-accent/30">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-8 py-4 text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-accent transition-colors"
          >
            DISCARD CHANGES
          </button>
          <Button
            form="edit-job-form"
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full sm:w-auto h-auto py-4 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all border-0"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Syncing…</>
            ) : isSuccess ? (
              <><CheckCircle2 className="w-5 h-5 mr-2" /> Applied!</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> SECURE CHANGES</>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
