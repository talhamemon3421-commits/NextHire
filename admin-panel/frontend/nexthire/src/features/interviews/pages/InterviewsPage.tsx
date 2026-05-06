import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  User,
  Briefcase,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarX2,
  Search,
} from "lucide-react";
import {
  getEmployerApplications,
  updateApplicationStatus,
  type ApplicationData,
} from "../../applications/api/applicationsApi";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

export function InterviewsPage() {
  const [interviews, setInterviews] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hiringNotes, setHiringNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await getEmployerApplications({ status: "interview", limit: 50 });
      setInterviews(res.data.applications);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleDecision = async (appId: string, decision: "accepted" | "rejected") => {
    const notes = hiringNotes[appId];
    if (!notes?.trim()) return;

    setActionLoading(appId);
    try {
      await updateApplicationStatus(appId, {
        status: decision,
        hiringNotes: notes,
      });
      setSuccessMsg(`Application ${decision} successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setExpandedId(null);
      fetchInterviews();
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = interviews.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.applicant?.name?.toLowerCase().includes(q) ||
      app.job?.title?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const getTimeStatus = (dateStr: string | null) => {
    if (!dateStr) return { label: "Not scheduled", color: "text-muted-foreground", urgent: false };
    const diff = new Date(dateStr).getTime() - Date.now();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 0) return { label: "Completed", color: "text-emerald-500", urgent: false };
    if (hours < 24) return { label: "Today", color: "text-red-500", urgent: true };
    if (hours < 48) return { label: "Tomorrow", color: "text-amber-500", urgent: true };
    const days = Math.ceil(hours / 24);
    return { label: `In ${days} days`, color: "text-primary", urgent: false };
  };

  const sorted = [...filtered].sort((a, b) => {
    const aDate = a.interview?.date ? new Date(a.interview.date).getTime() : Infinity;
    const bDate = b.interview?.date ? new Date(b.interview.date).getTime() : Infinity;
    return aDate - bDate;
  });

  const upcoming = sorted.filter(
    (a) => a.interview?.date && new Date(a.interview.date).getTime() > Date.now()
  );
  const past = sorted.filter(
    (a) => !a.interview?.date || new Date(a.interview.date).getTime() <= Date.now()
  );

  const renderCard = (app: ApplicationData) => {
    const timeStatus = getTimeStatus(app.interview?.date || null);
    const isExpanded = expandedId === app._id;

    return (
      <div
        key={app._id}
        className={cn(
          "bg-card rounded-2xl border transition-all duration-300 overflow-hidden",
          timeStatus.urgent
            ? "border-amber-500/50 shadow-lg shadow-amber-500/10"
            : "border-border hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
        )}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-bold shrink-0 shadow-inner">
                {getInitials(app.applicant?.name)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                  {app.applicant?.name || "Unknown"}
                </div>
                <div className="text-xs text-muted-foreground truncate font-medium">{app.applicant?.email}</div>
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                timeStatus.urgent
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : timeStatus.label === "Completed"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
              )}
            >
              <Clock className="w-3 h-3" />
              {timeStatus.label}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-accent/50 rounded-lg px-3 py-2.5 mb-5 border border-border/50">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{app.job?.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/80 bg-accent/30 p-2 rounded-lg border border-border/50">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>
                {app.interview?.date
                  ? new Date(app.interview.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/80 bg-accent/30 p-2 rounded-lg border border-border/50">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                {app.interview?.date
                  ? new Date(app.interview.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "—"}
              </span>
            </div>
          </div>

          {app.interview?.link && (
            <a
              href={app.interview.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-primary/20 transition-all mb-5 group shadow-sm"
            >
              <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Join Meeting
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
            </a>
          )}

          {!isExpanded ? (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setExpandedId(app._id);
                }}
                className="flex-1 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 border-0"
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExpandedId(app._id);
                  setHiringNotes((prev) => ({ ...prev, [app._id]: prev[app._id] || "" }));
                }}
                className="flex-1 rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 border-red-500/20"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-4 border-t border-border/50 pt-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Assessment Notes</div>
              <textarea
                placeholder="Write your feedback for this candidate..."
                value={hiringNotes[app._id] || ""}
                onChange={(e) =>
                  setHiringNotes((prev) => ({ ...prev, [app._id]: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-3 bg-accent/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDecision(app._id, "accepted")}
                  disabled={
                    actionLoading === app._id || !hiringNotes[app._id]?.trim()
                  }
                  className="flex-1 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 border-0"
                >
                  {actionLoading === app._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  )}
                  Confirm Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDecision(app._id, "rejected")}
                  disabled={
                    actionLoading === app._id || !hiringNotes[app._id]?.trim()
                  }
                  className="flex-1 rounded-xl font-bold"
                >
                  {actionLoading === app._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1.5" />
                  )}
                  Confirm Reject
                </Button>
              </div>
              <button
                onClick={() => setExpandedId(null)}
                className="w-full text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] py-1 transition-colors"
              >
                Cancel Action
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {interviews.length} scheduled interview{interviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
            {upcoming.filter((a) => getTimeStatus(a.interview?.date || null).urgent).length} urgent
          </span>
          <span className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
            {upcoming.length} upcoming
          </span>
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
            {past.length} completed
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm text-emerald-500 font-bold shadow-sm animate-in slide-in-from-right-4 duration-500">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="relative mb-6 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by candidate name or job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Loading interviews...</span>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-card rounded-[2rem] border border-border p-16 text-center shadow-sm">
          <CalendarX2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-xl font-bold mb-2">No interviews scheduled</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
            Interviews will appear here once you schedule them from the Applications tab.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Upcoming Interviews ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map(renderCard)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed Sessions ({past.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
