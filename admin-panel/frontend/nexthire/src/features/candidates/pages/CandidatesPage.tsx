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

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  reviewing: { label: "Reviewing", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  shortlisted: { label: "Shortlisted", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  interview: { label: "Interview", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  accepted: { label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      fetchCandidates(searchInput || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const initialsColors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
    "bg-cyan-100 text-cyan-700",
    "bg-rose-100 text-rose-700",
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
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} unique candidate{total !== 1 ? "s" : ""} in your talent pool
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, skills, or location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading candidates...</span>
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No candidates found</h3>
          <p className="text-sm text-slate-500">
            {searchInput
              ? `No candidates matching "${searchInput}"`
              : "Candidates will appear here once people apply to your jobs."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => {
            const isExpanded = expandedId === candidate._id;
            const bestStatus = getBestStatus(candidate);
            const bestCfg = STATUS_CONFIG[bestStatus];

            return (
              <div
                key={candidate._id}
                className="bg-white rounded-xl border border-slate-200/80 hover:border-blue-200 transition-all"
              >
                {/* Main Row */}
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : candidate._id)}
                >
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getColor(
                      candidate.name
                    )}`}
                  >
                    {getInitials(candidate.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {candidate.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${bestCfg.bg} ${bestCfg.color}`}>
                        {bestCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" /> {candidate.email}
                      </span>
                      {candidate.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {candidate.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats + Expand */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-800">{candidate.totalApplications}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-500">{timeAgo(candidate.lastAppliedAt)}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Last Active</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    {/* Profile info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      {/* Left: contact + bio */}
                      <div className="space-y-3">
                        {candidate.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.phone}
                          </div>
                        )}
                        {candidate.bio && (
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Bio</div>
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">
                              {candidate.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: skills */}
                      {candidate.skills.length > 0 && (
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Skills</div>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium border border-blue-100"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Applications table */}
                    <div className="mt-2">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" /> Applications ({candidate.totalApplications})
                      </div>
                      <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200/60">
                        <table className="w-full">
                          <thead>
                            <tr className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              <th className="text-left px-4 py-2.5">Job Title</th>
                              <th className="text-left px-4 py-2.5">Status</th>
                              <th className="text-left px-4 py-2.5">Applied</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidate.applications.map((app) => {
                              const appCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                              return (
                                <tr key={app.applicationId} className="border-t border-slate-200/60">
                                  <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                                    {app.jobTitle}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${appCfg.bg} ${appCfg.color}`}>
                                      {appCfg.label}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-slate-500">
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
