import React, { useState, FormEvent } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { generateJobFromPrompt, createJob, type CreateJobPayload } from "../api/jobsApi";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {isSubmitting && !isSuccess && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-xl">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <div className="text-lg font-bold text-slate-800">Publishing Job...</div>
            <div className="text-sm text-slate-500 mt-1">Please wait while we create the posting.</div>
          </div>
        )}

        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Post a new job</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200 flex flex-col items-center justify-center text-center">
              <span className="font-bold text-base mb-1">🎉 Job posted successfully!</span>
              <span>Redirecting to your dashboard...</span>
            </div>
          )}

          {/* AI Auto-fill Section */}
          <div className="bg-[#FFF9EA] border border-orange-100 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-slate-800">AI Auto-fill — Describe the role and let AI complete the form</span>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="e.g. Senior Flight Instructor for a training center in Abb"
                className="flex-1 bg-white border border-orange-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAutoFill()}
              />
              <button 
                onClick={handleAutoFill}
                disabled={isGenerating}
                className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                <Sparkles className="w-4 h-4" /> Auto-fill
              </button>
            </div>
          </div>

          <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Job title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Senior Flight Instructor" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Experience Level</label>
                <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as any)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead/Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Employment type</label>
                <select value={jobType} onChange={e => setJobType(e.target.value as any)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Abbottabad, KPK" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Salary range (PKR)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Min" />
                  <span className="text-slate-400">-</span>
                  <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Max" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Job description</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" placeholder="Describe responsibilities, qualifications, and requirements..." />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Required qualifications</label>
                <textarea rows={4} value={requirements} onChange={e => setRequirements(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" placeholder="One per line" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Key responsibilities</label>
                <textarea rows={4} value={responsibilities} onChange={e => setResponsibilities(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" placeholder="One per line" />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-center gap-4 bg-slate-50/50">
          <button onClick={onClose} type="button" className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 transition">
            Save as draft
          </button>
          <button form="job-form" type="submit" disabled={isSubmitting || isSuccess} className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSuccess ? "Published!" : "Publish posting"}
          </button>
        </div>
      </div>
    </div>
  );
}
