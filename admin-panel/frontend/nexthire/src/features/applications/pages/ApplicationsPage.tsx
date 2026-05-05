import React, { useEffect, useState } from "react";
import {
  Search,
  Users,
  Sparkles,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  UserCheck,
  CalendarCheck,
  Filter,
} from "lucide-react";
import {
  getEmployerApplications,
  getEmployerStats,
  type ApplicationData,
  type ApplicationStatus,
} from "../api/applicationsApi";
import { ApplicationDetailDrawer } from "../components/ApplicationDetailDrawer";
import { AIRankingModal } from "../components/AIRankingModal";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock },
  reviewing: { label: "Reviewing", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: UserCheck },
  interview: { label: "Interview", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: CalendarCheck },
  accepted: { label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
};

const FILTERS: (ApplicationStatus | "all")[] = [
  "all",
  "pending",
  "reviewing",
  "shortlisted",
  "interview",
  "accepted",
  "rejected",
];

export function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [showRanking, setShowRanking] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        getEmployerApplications(
          filter === "all" ? {} : { status: filter }
        ),
        getEmployerStats(),
      ]);
      setApplications(appsRes.data.applications);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const filtered = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.applicant?.name?.toLowerCase().includes(q) ||
      app.applicant?.email?.toLowerCase().includes(q) ||
      app.job?.title?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  const initialsColors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
  ];
  const getInitialsColor = (name: string) =>
    initialsColors[
      (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
        initialsColors.length
    ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stats.total ?? 0} total applications across all jobs
          </p>
        </div>
        <button
          onClick={() => setShowRanking(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          AI Rank Applicants
        </button>
      </div>

      {/* ── Stats Chips ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(
          ([key, cfg]) => (
            <div
              key={key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${cfg.bg} ${cfg.color}`}
            >
              <cfg.icon className="w-3.5 h-3.5" />
              {cfg.label}: {(stats as any)[key] ?? 0}
            </div>
          )
        )}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                filter === f
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Application Cards ── */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading applications...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No applications found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery
              ? `No results matching "${searchQuery}"`
              : `No ${filter !== "all" ? filter : ""} applications yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={app._id}
                onClick={() => setSelectedApp(app)}
                className="bg-white rounded-xl border border-slate-200/80 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Top: Avatar + Name + Status */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getInitialsColor(
                      app.applicant?.name
                    )}`}
                  >
                    {getInitials(app.applicant?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition">
                      {app.applicant?.name || "Unknown Applicant"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {app.applicant?.email}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 ${cfg.bg} ${cfg.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                </div>

                {/* Job Title */}
                <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-3 font-medium">
                  Applied for: <span className="text-slate-800">{app.job?.title}</span>
                </div>

                {/* Footer: Applied date + Skills peek */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {timeAgo(app.createdAt)}
                  </span>
                  {app.applicant?.skills && app.applicant.skills.length > 0 && (
                    <div className="flex items-center gap-1">
                      {app.applicant.skills.slice(0, 2).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {app.applicant.skills.length > 2 && (
                        <span className="text-[10px] text-slate-400">
                          +{app.applicant.skills.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={() => {
            setSelectedApp(null);
            fetchData();
          }}
        />
      )}

      {/* ── AI Ranking Modal ── */}
      {showRanking && (
        <AIRankingModal
          onClose={() => setShowRanking(false)}
        />
      )}
    </div>
  );
}
