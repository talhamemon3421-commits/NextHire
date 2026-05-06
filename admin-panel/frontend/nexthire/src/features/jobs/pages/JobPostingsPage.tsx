import React, { useEffect, useState } from "react";
import { Download, Plus, Search, Calendar, MapPin, Briefcase, Eye, UserCircle2, Pencil } from "lucide-react";
import { PostJobModal } from "../components/PostJobModal";
import { EditJobModal } from "../components/EditJobModal";
import { getMyJobs } from "../api/jobsApi";
import { cn } from "../../../shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

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

  const handleExport = () => {
    if (!filteredJobs.length) return;

    let csv = "JOB POSTINGS EXPORT\n";
    csv += "Title,Status,Type,Location,Experience Level,Applications,Views,Remote,Urgent,Deadline,Created At\n";

    filteredJobs.forEach((job) => {
      const title = `"${String(job.title || "").replace(/"/g, '""')}"`;
      const status = job.status || (job.isActive ? "Active" : "Closed");
      const jobType = job.jobType || "";
      const location = `"${String(job.location || "").replace(/"/g, '""')}"`;
      const experienceLevel = job.experienceLevel || "";
      const applications = job.applicationCount || 0;
      const views = job.views || 0;
      const isRemote = job.isRemote ? "Yes" : "No";
      const isUrgent = job.isUrgent ? "Yes" : "No";
      const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString() : "";
      const createdAt = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "";

      csv += `${title},${status},${jobType},${location},${experienceLevel},${applications},${views},${isRemote},${isUrgent},${deadline},${createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexthire-job-postings-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your active and past job listings.</p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1 sm:flex-none gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-2 mb-6 flex items-center gap-4 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search postings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm focus:outline-none placeholder-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading jobs...</span>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No postings found</h3>
          <p className="text-sm text-muted-foreground mb-6">You don't have any job postings matching "{filter}".</p>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="gap-2">
            Create your first job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job._id || job.id} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                  {job.title}
                </h2>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                  (job.status === "active" || (!job.status && job.isActive)) && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  job.status === "draft" && "bg-muted text-muted-foreground border-border",
                  (job.status === "closed" || (!job.status && !job.isActive)) && "bg-destructive/10 text-destructive border-destructive/20"
                )}>
                  {job.status || (job.isActive ? "Active" : "Closed")}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-muted-foreground mb-6">
                {job.location && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}</span>
                )}
                <span className="flex items-center gap-1.5 capitalize"><Briefcase className="w-3.5 h-3.5 text-primary" /> {job.jobType}</span>
                {job.experienceLevel && (
                  <span className="flex items-center gap-1.5 capitalize text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20"><UserCircle2 className="w-3.5 h-3.5" /> {job.experienceLevel}</span>
                )}
              </div>

              <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/50 pt-5 mb-5">
                <div className="bg-accent/30 rounded-xl p-3 border border-border/30">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Applications</div>
                  <div className="text-xl font-bold">{job.applicationCount || 0}</div>
                </div>
                <div className="bg-accent/30 rounded-xl p-3 border border-border/30">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Views</div>
                  <div className="text-xl font-bold flex items-center justify-between">
                    {job.views || 0}
                    <Eye className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                {job.deadline ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(job.deadline).toLocaleDateString()}
                  </div>
                ) : <span />}
                <button
                  onClick={() => setEditingJob(job)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:scale-105 transition-transform"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Posting
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
