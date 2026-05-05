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
    if (!dateStr) return { label: "Not scheduled", color: "text-slate-400", urgent: false };
    const diff = new Date(dateStr).getTime() - Date.now();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 0) return { label: "Completed", color: "text-emerald-600", urgent: false };
    if (hours < 24) return { label: "Today", color: "text-red-600", urgent: true };
    if (hours < 48) return { label: "Tomorrow", color: "text-amber-600", urgent: true };
    const days = Math.ceil(hours / 24);
    return { label: `In ${days} days`, color: "text-blue-600", urgent: false };
  };

  // Sort: soonest interviews first
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
        className={`bg-white rounded-xl border transition-all ${
          timeStatus.urgent
            ? "border-amber-200 shadow-amber-100/50 shadow-md"
            : "border-slate-200/80 hover:border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="p-5">
          {/* Top row: Applicant + Time Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                {getInitials(app.applicant?.name)}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {app.applicant?.name || "Unknown"}
                </div>
                <div className="text-xs text-slate-500">{app.applicant?.email}</div>
              </div>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                timeStatus.urgent
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : timeStatus.label === "Completed"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              {timeStatus.label}
            </div>
          </div>

          {/* Job */}
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-4">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{app.job?.title}</span>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
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
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
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

          {/* Meeting Link */}
          {app.interview?.link && (
            <a
              href={app.interview.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors mb-4"
            >
              <Video className="w-4 h-4" />
              Join Meeting
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}

          {/* Actions: Accept / Reject */}
          {!isExpanded ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setExpandedId(app._id);
                }}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Accept
              </button>
              <button
                onClick={() => {
                  setExpandedId(app._id);
                  setHiringNotes((prev) => ({ ...prev, [app._id]: prev[app._id] || "" }));
                }}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="text-xs font-semibold text-slate-600">Hiring Notes (required)</div>
              <textarea
                placeholder="Write your assessment of this candidate..."
                value={hiringNotes[app._id] || ""}
                onChange={(e) =>
                  setHiringNotes((prev) => ({ ...prev, [app._id]: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleDecision(app._id, "accepted")}
                  disabled={
                    actionLoading === app._id || !hiringNotes[app._id]?.trim()
                  }
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading === app._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Confirm Accept
                </button>
                <button
                  onClick={() => handleDecision(app._id, "rejected")}
                  disabled={
                    actionLoading === app._id || !hiringNotes[app._id]?.trim()
                  }
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading === app._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Reject
                </button>
              </div>
              <button
                onClick={() => setExpandedId(null)}
                className="w-full text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Interviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {interviews.length} scheduled interview{interviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium">
            {upcoming.filter((a) => getTimeStatus(a.interview?.date || null).urgent).length} urgent
          </span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-medium">
            {upcoming.length} upcoming
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-medium">
            {past.length} completed
          </span>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm text-emerald-700 font-medium animate-slide-in-right">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by candidate name or job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading interviews...</span>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <CalendarX2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No interviews scheduled</h3>
          <p className="text-sm text-slate-500">
            Interviews will appear here once you schedule them from the Applications tab.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map(renderCard)}
              </div>
            </div>
          )}

          {/* Past/Completed section */}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed ({past.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {past.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
