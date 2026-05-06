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
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  reviewing: { label: "Reviewing", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", icon: UserCheck },
  interview: { label: "Interview", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-200/20", icon: CalendarCheck },
  accepted: { label: "Accepted", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
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
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "bg-teal-500/10 text-teal-500 border-teal-500/20",
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total ?? 0} total applications across all jobs
          </p>
        </div>
        <Button
          onClick={() => setShowRanking(true)}
          className="gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
        >
          <Sparkles className="w-4 h-4" />
          AI Rank Applicants
        </Button>
      </div>

      {/* Stats Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(
          ([key, cfg]) => (
            <div
              key={key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${cfg.bg} ${cfg.color} shadow-sm`}
            >
              <cfg.icon className="w-3.5 h-3.5" />
              {cfg.label}: <span className="text-foreground/80">{(stats as any)[key] ?? 0}</span>
            </div>
          )
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Application Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading applications...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No applications found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `No results matching "${searchQuery}"`
              : `No ${filter !== "all" ? filter : ""} applications yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={app._id}
                onClick={() => setSelectedApp(app)}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border border-current/10 shadow-inner ${getInitialsColor(
                      app.applicant?.name
                    )}`}
                  >
                    {getInitials(app.applicant?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                      {app.applicant?.name || "Unknown Applicant"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-medium">
                      {app.applicant?.email}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider shrink-0 ${cfg.bg} ${cfg.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                </div>

                <div className="text-xs font-semibold text-muted-foreground bg-accent/50 rounded-lg px-3 py-2.5 mb-4 border border-border/50">
                  Applied for: <span className="text-foreground">{app.job?.title}</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(app.createdAt)}
                  </span>
                  {app.applicant?.skills && app.applicant.skills.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {app.applicant.skills.slice(0, 2).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-accent border border-border text-muted-foreground rounded-md text-[10px] font-bold"
                        >
                          {s}
                        </span>
                      ))}
                      {app.applicant.skills.length > 2 && (
                        <span className="text-[10px] font-bold text-muted-foreground bg-accent px-1.5 py-1 rounded-md border border-border">
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

      {/* Detail Drawer */}
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

      {/* AI Ranking Modal */}
      {showRanking && (
        <AIRankingModal
          onClose={() => setShowRanking(false)}
        />
      )}
    </div>
  );
}
