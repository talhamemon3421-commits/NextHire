import React, { useEffect, useState } from "react";
import {
  Search,
  UserCheck,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Users,
} from "lucide-react";
import {
  getCandidates,
  type CandidateData,
  type ApplicationStatus,
} from "../../applications/api/applicationsApi";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  reviewing: { label: "Reviewing", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  shortlisted: { label: "Shortlisted", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  interview: { label: "Interview", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  accepted: { label: "Accepted", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
};

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCandidates = async (search?: string) => {
    setIsLoading(true);
    try {
      const res = await getCandidates({ search, limit: 50 });
      setCandidates(res.data.candidates);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates(searchInput || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const initialsColors = [
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "bg-teal-500/10 text-teal-500 border-teal-500/20",
  ];
  const getColor = (name: string) =>
    initialsColors[(name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % initialsColors.length];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getBestStatus = (candidate: CandidateData): ApplicationStatus => {
    const priority: ApplicationStatus[] = ["accepted", "interview", "shortlisted", "reviewing", "pending", "rejected"];
    for (const s of priority) {
      if (candidate.applications.some((a) => a.status === s)) return s;
    }
    return "pending";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} unique candidate{total !== 1 ? "s" : ""} in your talent pool
          </p>
        </div>
      </div>

      <div className="relative mb-6 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name, email, skills, or location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Loading candidates...</span>
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-card rounded-[2rem] border border-border p-16 text-center shadow-sm">
          <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-xl font-bold mb-2">No candidates found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
            {searchInput
              ? `No candidates matching "${searchInput}"`
              : "Candidates will appear here once people apply to your jobs."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => {
            const isExpanded = expandedId === candidate._id;
            const bestStatus = getBestStatus(candidate);
            const bestCfg = STATUS_CONFIG[bestStatus];

            return (
              <div
                key={candidate._id}
                className={cn(
                  "bg-card rounded-2xl border transition-all duration-300 overflow-hidden",
                  isExpanded ? "border-primary/50 shadow-lg ring-1 ring-primary/10" : "border-border hover:border-primary/30 hover:shadow-md"
                )}
              >
                <div
                  className="p-5 flex flex-col items-start gap-4 cursor-pointer sm:flex-row sm:items-center sm:gap-6"
                  onClick={() => setExpandedId(isExpanded ? null : candidate._id)}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black border border-current/10 shadow-inner shrink-0",
                      getColor(candidate.name)
                    )}
                  >
                    {getInitials(candidate.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold truncate">
                        {candidate.name}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-sm",
                        bestCfg.bg,
                        bestCfg.color
                      )}>
                        {bestCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1.5 truncate group hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {candidate.email}
                      </span>
                      {candidate.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {candidate.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start sm:gap-8 shrink-0 bg-accent/20 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-border/50 sm:border-0">
                    <div className="text-center">
                      <div className="text-lg font-black tracking-tighter">{candidate.totalApplications}</div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Apps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black text-muted-foreground uppercase">{timeAgo(candidate.lastAppliedAt)}</div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Active</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border/50 shadow-sm transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 px-5 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
                      <div className="space-y-4">
                        {candidate.phone && (
                          <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground bg-accent/30 p-2 rounded-lg border border-border/30">
                            <Phone className="w-4 h-4 text-primary" />
                            {candidate.phone}
                          </div>
                        )}
                        {candidate.bio && (
                          <div className="bg-accent/30 rounded-2xl p-4 border border-border/30 shadow-inner">
                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">Background Profile</div>
                            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                              {candidate.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {candidate.skills.length > 0 && (
                        <div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-3">Core Competencies</div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" /> Applications Tracker ({candidate.totalApplications})
                      </div>
                      <div className="bg-accent/20 rounded-2xl overflow-hidden border border-border shadow-inner">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] bg-accent/30 border-b border-border/50">
                                <th className="px-5 py-3">Applied Job Position</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Submission</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {candidate.applications.map((app) => {
                                const appCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                                return (
                                  <tr key={app.applicationId} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-5 py-3.5 text-xs font-bold">
                                      {app.jobTitle}
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <span className={cn(
                                        "px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-sm",
                                        appCfg.bg,
                                        appCfg.color
                                      )}>
                                        {appCfg.label}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-muted-foreground">
                                      {timeAgo(app.appliedAt)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
