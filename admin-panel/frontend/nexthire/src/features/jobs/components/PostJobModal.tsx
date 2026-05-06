import React, { useState, FormEvent } from "react";
import { Sparkles, X, Loader2, Rocket, Zap, CheckCircle2 } from "lucide-react";
import { generateJobFromPrompt, createJob, type CreateJobPayload } from "../api/jobsApi";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

interface PostJobModalProps {
  onClose: () => void;
}

export function PostJobModal({ onClose }: PostJobModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<CreateJobPayload["experienceLevel"]>("mid");
  const [jobType, setJobType] = useState<CreateJobPayload["jobType"]>("full-time");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  async function handleAutoFill() {
    if (!prompt || prompt.length < 10) {
      setError("Please describe the role in at least 10 characters.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const res = await generateJobFromPrompt(prompt);
      if (res.data) {
        setTitle(res.data.title || "");
        if (res.data.experienceLevel) setExperienceLevel(res.data.experienceLevel);
        if (res.data.jobType) setJobType(res.data.jobType);
        setLocation(res.data.location || "");
        if (res.data.salary) {
          setSalaryMin(res.data.salary.min ? String(res.data.salary.min) : "");
          setSalaryMax(res.data.salary.max ? String(res.data.salary.max) : "");
        }
        setDescription(res.data.description || "");
        setRequirements((res.data.requirements || []).join("\n"));
        setResponsibilities((res.data.responsibilities || []).join("\n"));
      }
    } catch (err: any) {
      setError(err.message || "Failed to auto-fill. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateJobPayload = {
        title,
        experienceLevel,
        jobType,
        location: location || null,
        isRemote: !location,
        description,
        requirements: requirements.split("\n").map(r => r.trim()).filter(Boolean),
        responsibilities: responsibilities.split("\n").map(r => r.trim()).filter(Boolean),
        benefits: [],
        skills: [],
      };

      if (salaryMin || salaryMax) {
        payload.salary = {
          currency: "PKR",
          min: salaryMin ? parseInt(salaryMin, 10) : null,
          max: salaryMax ? parseInt(salaryMax, 10) : null,
        };
      }

      await createJob(payload);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-card rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-border/50">

        {isSubmitting && !isSuccess && (
          <div className="absolute inset-0 z-[110] bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Rocket className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground uppercase tracking-[0.2em]">Publishing Listing</h3>
            <p className="text-sm text-muted-foreground font-medium mt-2">Deploying your job to the talent marketplace...</p>
          </div>
        )}

        {isSuccess && (
          <div className="absolute inset-0 z-[110] bg-emerald-500 flex flex-col items-center justify-center text-white animate-in zoom-in duration-500">
            <CheckCircle2 className="w-24 h-24 mb-6 animate-bounce" />
            <h3 className="text-4xl font-black tracking-tighter">SUCCESSFULLY POSTED!</h3>
            <p className="text-lg font-medium mt-2 opacity-90">Redirecting to your dashboard...</p>
          </div>
        )}

        <div className="flex items-center justify-between p-8 border-b border-border/50 bg-accent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Deploy New Position</h2>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-0.5">Talent Acquisition Module</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-muted-foreground hover:bg-accent rounded-2xl transition-all duration-300 hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold border border-red-500/20 animate-in shake duration-500">
              {error}
            </div>
          )}

          <div className="relative group overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-black text-primary-foreground uppercase tracking-widest shadow-lg shadow-primary/20">AI Engine v2.0</div>
                <span className="text-xs font-bold text-muted-foreground">Smart Auto-fill Description</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Describe the role in one sentence (e.g. Senior Frontend Architect for a Fintech startup)..."
                  className="flex-1 bg-card border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAutoFill()}
                />
                <Button
                  onClick={handleAutoFill}
                  disabled={isGenerating}
                  className="rounded-2xl h-auto py-4 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all gap-3"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  GENERATE
                </Button>
              </div>
            </div>
          </div>

          <form id="job-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Position Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-accent/20 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" placeholder="e.g. Senior Product Designer" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Experience Level</label>
                <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as any)} className="w-full bg-accent/20 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none appearance-none cursor-pointer">
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior Associate</option>
                  <option value="mid">Mid-Senior Level</option>
                  <option value="senior">Senior Staff</option>
                  <option value="lead">Management / Lead</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Employment Type</label>
                <select value={jobType} onChange={e => setJobType(e.target.value as any)} className="w-full bg-accent/20 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none appearance-none cursor-pointer">
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
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Job Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-accent/20 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" placeholder="e.g. Islamabad (or leave for Remote)" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Annual Compensation (PKR)</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className="w-full bg-accent/20 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" placeholder="Min" />
                  <div className="w-4 h-0.5 bg-border rounded-full shrink-0" />
                  <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className="w-full bg-accent/20 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none" placeholder="Max" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Detailed Description</label>
              <textarea required rows={6} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-accent/20 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed" placeholder="Elaborate on the role, team dynamics, and expectations..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Candidate Qualifications</label>
                <textarea rows={6} value={requirements} onChange={e => setRequirements(e.target.value)} className="w-full bg-accent/20 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed" placeholder="One qualification per line..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Core Responsibilities</label>
                <textarea rows={6} value={responsibilities} onChange={e => setResponsibilities(e.target.value)} className="w-full bg-accent/20 border border-border rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none resize-none leading-relaxed" placeholder="One responsibility per line..." />
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-end gap-4 bg-accent/30">
          <button onClick={onClose} type="button" className="w-full sm:w-auto px-8 py-4 text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-accent transition-colors">
            Discard & Exit
          </button>
          <Button form="job-form" type="submit" disabled={isSubmitting || isSuccess} className="w-full sm:w-auto h-auto py-4 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all border-0">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Rocket className="w-5 h-5 mr-2" />}
            DEPLOY POSTING
          </Button>
        </div>
      </div>
    </div>
  );
}
