import React, { useState } from "react";
import {
  X,
  Clock,
  Eye,
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import {
  updateApplicationStatus,
  getAIRecommendation,
  type ApplicationData,
  type ApplicationStatus,
  type AIRecommendation,
} from "../api/applicationsApi";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock },
  reviewing: { label: "Reviewing", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: UserCheck },
  interview: { label: "Interview", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: CalendarCheck },
  accepted: { label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
};

const VALID_TRANSITIONS: Record<string, { status: ApplicationStatus; label: string; variant: string }[]> = {
  pending: [{ status: "reviewing", label: "Start Review", variant: "bg-blue-600 hover:bg-blue-700 text-white" }],
  reviewing: [
    { status: "shortlisted", label: "Shortlist", variant: "bg-purple-600 hover:bg-purple-700 text-white" },
    { status: "rejected", label: "Reject", variant: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  shortlisted: [{ status: "interview", label: "Schedule Interview", variant: "bg-indigo-600 hover:bg-indigo-700 text-white" }],
  interview: [
    { status: "accepted", label: "Accept", variant: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    { status: "rejected", label: "Reject", variant: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
};

interface Props {
  application: ApplicationData;
  onClose: () => void;
  onUpdated: () => void;
}

export function ApplicationDetailDrawer({ application, onClose, onUpdated }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Interview fields
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLink, setInterviewLink] = useState("");

  // Hiring notes (for accept/reject after interview)
  const [hiringNotes, setHiringNotes] = useState("");

  // AI recommendation
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Track which action requires extra inputs
  const [pendingAction, setPendingAction] = useState<ApplicationStatus | null>(null);

  const app = application;
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const actions = VALID_TRANSITIONS[app.status] || [];

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const handleAction = async (targetStatus: ApplicationStatus) => {
    // If we need extra input, show the form first
    if (targetStatus === "interview" && !pendingAction) {
      setPendingAction("interview");
      return;
    }
    if (
      (targetStatus === "accepted" || targetStatus === "rejected") &&
      app.status === "interview" &&
      !pendingAction
    ) {
      setPendingAction(targetStatus);
      return;
    }

    setIsUpdating(true);
    setError("");
    try {
      await updateApplicationStatus(app._id, {
        status: targetStatus,
        note: note || undefined,
        interviewDate: targetStatus === "interview" ? interviewDate : undefined,
        interviewLink: targetStatus === "interview" ? interviewLink || undefined : undefined,
        hiringNotes:
          (targetStatus === "accepted" || targetStatus === "rejected") && app.status === "interview"
            ? hiringNotes
            : undefined,
      });
      onUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAIRecommendation = async () => {
    setIsLoadingAI(true);
    try {
      const res = await getAIRecommendation(app._id);
      setAiResult(res.data);
    } catch (err: any) {
      setError(err.message || "AI recommendation failed");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-900">Application Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Applicant Info ── */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
              {getInitials(app.applicant?.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{app.applicant?.name}</h3>
              <div className="space-y-1 mt-1.5">
                {app.applicant?.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5" /> {app.applicant.email}
                  </div>
                )}
                {app.applicant?.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5" /> {app.applicant.phone}
                  </div>
                )}
                {app.applicant?.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" /> {app.applicant.location}
                  </div>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </div>
          </div>

          {/* Job applied for */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200/60">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Applied for</div>
            <div className="text-sm font-semibold text-slate-800">{app.job?.title}</div>
          </div>

          {/* ── Skills ── */}
          {app.applicant?.skills && app.applicant.skills.length > 0 && (
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {app.applicant.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Cover Letter ── */}
          {app.coverLetter && (
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" /> Cover Letter
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200/60">
                {app.coverLetter}
              </div>
            </div>
          )}

          {/* ── Interview Info ── */}
          {app.interview?.date && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="text-[11px] text-indigo-500 font-semibold uppercase tracking-wider mb-2">Interview Scheduled</div>
              <div className="text-sm font-medium text-indigo-900">
                {new Date(app.interview.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {app.interview.link && (
                <a
                  href={app.interview.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 underline mt-1 inline-block"
                >
                  Join meeting link
                </a>
              )}
            </div>
          )}

          {/* ── Hiring Notes ── */}
          {app.hiringNotes && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="text-[11px] text-emerald-500 font-semibold uppercase tracking-wider mb-2">Hiring Notes</div>
              <div className="text-sm text-emerald-900">{app.hiringNotes}</div>
            </div>
          )}

          {/* ── Status Timeline ── */}
          {app.statusHistory && app.statusHistory.length > 0 && (
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Status History</div>
              <div className="space-y-0">
                {app.statusHistory.map((entry, idx) => {
                  const entryCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                  const EntryIcon = entryCfg.icon;
                  return (
                    <div key={idx} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${entryCfg.bg}`}>
                          <EntryIcon className={`w-3.5 h-3.5 ${entryCfg.color}`} />
                        </div>
                        {idx < app.statusHistory.length - 1 && (
                          <div className="w-px flex-1 bg-slate-200 min-h-[20px]" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className={`text-xs font-semibold ${entryCfg.color}`}>
                          {entryCfg.label}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {entry.changedBy &&
                            typeof entry.changedBy === "object" &&
                            ` · by ${entry.changedBy.name}`}
                        </div>
                        {entry.note && (
                          <div className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-lg px-3 py-2">
                            {entry.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── AI Recommendation ── */}
          <div>
            <button
              onClick={handleAIRecommendation}
              disabled={isLoadingAI}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 text-violet-700 rounded-xl text-sm font-medium hover:from-violet-100 hover:to-indigo-100 transition-all disabled:opacity-50"
            >
              {isLoadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get AI Assessment
                </>
              )}
            </button>

            {aiResult && (
              <div className="mt-3 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-200 space-y-3">
                {/* Score + Recommendation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-violet-800">{aiResult.score}</div>
                    <div className="text-xs text-violet-500">/100</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      aiResult.recommendation === "yes"
                        ? "bg-emerald-100 text-emerald-700"
                        : aiResult.recommendation === "maybe"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {aiResult.recommendation}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-sm text-slate-700">{aiResult.summary}</p>

                {/* Strengths */}
                <div>
                  <div className="text-[11px] font-semibold text-emerald-600 uppercase mb-1">Strengths</div>
                  <ul className="space-y-1">
                    {aiResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <div className="text-[11px] font-semibold text-red-600 uppercase mb-1">Weaknesses</div>
                  <ul className="space-y-1">
                    {aiResult.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          {actions.length > 0 && (
            <div className="border-t border-slate-200 pt-5 space-y-3">
              {/* Optional note */}
              <input
                type="text"
                placeholder="Add a note (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />

              {/* Interview form */}
              {pendingAction === "interview" && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 space-y-3">
                  <div className="text-xs font-semibold text-indigo-700">Schedule Interview</div>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(new Date(e.target.value).toISOString())}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <input
                    type="url"
                    placeholder="Meeting link (optional)"
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    onClick={() => handleAction("interview")}
                    disabled={isUpdating || !interviewDate}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                    Confirm Interview
                  </button>
                </div>
              )}

              {/* Hiring notes form */}
              {(pendingAction === "accepted" || pendingAction === "rejected") && (
                <div className={`rounded-xl p-4 border space-y-3 ${
                  pendingAction === "accepted" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                }`}>
                  <div className={`text-xs font-semibold ${
                    pendingAction === "accepted" ? "text-emerald-700" : "text-red-700"
                  }`}>
                    Hiring Notes (required)
                  </div>
                  <textarea
                    placeholder="Add your hiring notes..."
                    value={hiringNotes}
                    onChange={(e) => setHiringNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                  <button
                    onClick={() => handleAction(pendingAction)}
                    disabled={isUpdating || !hiringNotes.trim()}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                      pendingAction === "accepted"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {pendingAction === "accepted" ? "Confirm Accept" : "Confirm Reject"}
                  </button>
                </div>
              )}

              {/* Standard action buttons */}
              {!pendingAction && (
                <div className="flex gap-2">
                  {actions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => handleAction(action.status)}
                      disabled={isUpdating}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${action.variant} disabled:opacity-50`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
