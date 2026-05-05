import React, { useEffect, useState } from "react";

import { Download, Plus, Search, Calendar, MapPin, Briefcase, Eye, UserCircle2, Pencil } from "lucide-react";
import { PostJobModal } from "../components/PostJobModal";
import { EditJobModal } from "../components/EditJobModal";
import { getMyJobs } from "../api/jobsApi";
import { cn } from "../../../shared/lib/cn";

export function JobPostingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const res = await getMyJobs();
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const filters = ["All", "Active", "Closed", "Remote", "Urgent"];

  const filteredJobs = jobs.filter(job => {
    // Search Query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = job.title?.toLowerCase().includes(q);
      const matchesLocation = job.location?.toLowerCase().includes(q);
      const matchesType = job.jobType?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesLocation && !matchesType) return false;
    }

    if (filter === "All") return true;
    if (filter === "Active") return job.isActive !== false; 
    if (filter === "Closed") return job.isActive === false;
    if (filter === "Remote") return job.isRemote === true;
    if (filter === "Urgent") return job.isUrgent === true;
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4 text-slate-400" />
                Export
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Post a Job
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search postings..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder-slate-400" 
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  filter === f 
                    ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-slate-400 animate-pulse">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No postings found</h3>
              <p className="text-sm text-slate-500 mb-6">You don't have any job postings matching "{filter}".</p>
              <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm">
                Create your first job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <div key={job._id || job.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-blue-300 transition hover:shadow-md flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition">
                      {job.title}
                    </h2>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      job.status === "active" && "bg-emerald-100 text-emerald-700",
                      job.status === "draft" && "bg-slate-100 text-slate-600",
                      job.status === "closed" && "bg-red-100 text-red-700",
                      (!job.status && job.isActive) && "bg-emerald-100 text-emerald-700",
                      (!job.status && !job.isActive) && "bg-red-100 text-red-700" 
                    )}>
                      {job.status || (job.isActive ? "Active" : "Closed")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-5">
                    {job.location && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    )}
                    <span className="flex items-center gap-1.5 capitalize"><Briefcase className="w-3.5 h-3.5" /> {job.jobType}</span>
                    {job.experienceLevel && (
                       <span className="flex items-center gap-1.5 capitalize text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md"><UserCircle2 className="w-3.5 h-3.5" /> {job.experienceLevel}</span>
                    )}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applications</div>
                      <div className="text-lg font-bold text-slate-800">{job.applicationCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Views</div>
                      <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {job.views || 0}
                        <Eye className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {job.deadline ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    ) : <span />}
                    <button
                      onClick={() => setEditingJob(job)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isModalOpen && (
            <PostJobModal onClose={() => {
              setIsModalOpen(false);
              fetchJobs();
            }} />
          )}

          {editingJob && (
            <EditJobModal
              job={editingJob}
              onClose={() => setEditingJob(null)}
              onSaved={fetchJobs}
            />
          )}
    </div>
  );
}
