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
  Zap,
  Target,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import {
  updateApplicationStatus,
  getAIRecommendation,
  type ApplicationData,
  type ApplicationStatus,
  type AIRecommendation,
} from "../api/applicationsApi";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  reviewing: { label: "Reviewing", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", icon: UserCheck },
  interview: { label: "Interview", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20", icon: CalendarCheck },
  accepted: { label: "Accepted", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

const VALID_TRANSITIONS: Record<string, { status: ApplicationStatus; label: string; variant: string }[]> = {
  pending: [{ status: "reviewing", label: "Start Review", variant: "bg-blue-600 hover:bg-blue-700 text-white" }],
  reviewing: [
    { status: "shortlisted", label: "Shortlist", variant: "bg-purple-600 hover:bg-purple-700 text-white" },
    { status: "rejected", label: "Reject", variant: "bg-red-500/10 hover:bg-red-500/20 text-red-500" },
  ],
  shortlisted: [{ status: "interview", label: "Schedule Interview", variant: "bg-indigo-600 hover:bg-indigo-700 text-white" }],
  interview: [
    { status: "accepted", label: "Accept", variant: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    { status: "rejected", label: "Reject", variant: "bg-red-500/10 hover:bg-red-500/20 text-red-500" },
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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card z-[110] shadow-2xl border-l border-border/50 flex flex-col animate-slide-in-right">
        
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-[0.1em]">Application Intel</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Recruitment Pipeline v4.0</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-accent rounded-2xl transition-all duration-300 hover:rotate-90 text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 p-6 bg-accent/20 rounded-[2.5rem] border border-border shadow-inner">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shadow-lg border border-primary/20 shrink-0">
              {getInitials(app.applicant?.name)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{app.applicant?.name}</h3>
                  <div className={`mt-2 flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {app.applicant?.email && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {app.applicant.email}
                  </div>
                )}
                {app.applicant?.phone && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {app.applicant.phone}
                  </div>
                )}
                {app.applicant?.location && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {app.applicant.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Target className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Targeted Position
              </div>
              <div className="text-lg font-black text-foreground">{app.job?.title}</div>
            </div>
          </div>

          {app.applicant?.skills && app.applicant.skills.length > 0 && (
            <div className="space-y-4">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" /> Skill Matrix
              </div>
              <div className="flex flex-wrap gap-2">
                {app.applicant.skills.map((s, i) => (
                  <span key={i} className="px-4 py-2 bg-accent/30 text-foreground rounded-xl text-xs font-black border border-border shadow-sm hover:border-primary/30 transition-colors">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {app.coverLetter && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] ml-1">
                <FileText className="w-3.5 h-3.5 text-primary" /> Candidate Brief
              </div>
              <div className="bg-accent/20 rounded-[2rem] p-6 text-sm text-foreground/80 font-medium leading-relaxed border border-border shadow-inner italic">
                "{app.coverLetter}"
              </div>
            </div>
          )}

          {app.interview?.date && (
            <div className="bg-indigo-500/10 rounded-[2rem] p-6 border border-indigo-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <CalendarCheck className="w-20 h-20 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mb-3">Interview Scheduled</div>
                <div className="text-lg font-black text-foreground">
                  {new Date(app.interview.date).toLocaleDateString("en-US", {
                    weekday: "long",
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
                    className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-4 hover:underline"
                  >
                    Launch Meeting Space <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {app.hiringNotes && (
            <div className="bg-emerald-500/10 rounded-[2rem] p-6 border border-emerald-500/20">
              <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Hiring Intel
              </div>
              <div className="text-sm font-bold text-foreground leading-relaxed">{app.hiringNotes}</div>
            </div>
          )}

          <div className="space-y-6">
            <Button
              onClick={handleAIRecommendation}
              disabled={isLoadingAI}
              variant="outline"
              className="w-full h-auto py-5 rounded-[2rem] border-primary/20 bg-primary/5 hover:bg-primary/10 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                 {isLoadingAI ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <BrainCircuit className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Engage Neural Assessment</span>
                  </>
                )}
              </div>
            </Button>

            {aiResult && (
              <div className="bg-accent/30 rounded-[2.5rem] p-8 border border-border shadow-2xl space-y-8 animate-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Match Potential</div>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-black text-primary tracking-tighter">{aiResult.score}</span>
                      <span className="text-lg font-bold text-muted-foreground/30 mb-2">/100</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl",
                    aiResult.recommendation === "yes" ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                    aiResult.recommendation === "maybe" ? "bg-amber-500 text-white shadow-amber-500/20" : 
                    "bg-red-500 text-white shadow-red-500/20"
                  )}>
                    Verdict: {aiResult.recommendation}
                  </div>
                </div>

                <div className="p-6 bg-card rounded-3xl border border-border/50 text-sm font-bold leading-relaxed shadow-inner italic">
                  "{aiResult.summary}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Key Strengths</div>
                    <ul className="space-y-3">
                      {aiResult.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Critical Gaps</div>
                    <ul className="space-y-3">
                      {aiResult.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-foreground/80">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {app.statusHistory && app.statusHistory.length > 0 && (
            <div className="space-y-6">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] ml-1">Lifecycle Tracking</div>
              <div className="space-y-6 relative ml-4">
                <div className="absolute left-[-1.1rem] top-4 bottom-4 w-px bg-border/50" />
                {app.statusHistory.map((entry, idx) => {
                  const entryCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                  const EntryIcon = entryCfg.icon;
                  return (
                    <div key={idx} className="relative pl-6">
                      <div className={cn(
                        "absolute left-[-2rem] top-0 w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm z-10",
                        entryCfg.bg
                      )}>
                        <EntryIcon className={cn("w-4 h-4", entryCfg.color)} />
                      </div>
                      <div>
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", entryCfg.color)}>
                          {entryCfg.label}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground mt-1">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {entry.changedBy && typeof entry.changedBy === "object" && (
                            <span className="opacity-50"> · System Operator: {entry.changedBy.name}</span>
                          )}
                        </div>
                        {entry.note && (
                          <div className="text-[11px] font-medium text-foreground/70 mt-2 bg-accent/10 rounded-xl px-4 py-2 border border-border/30">
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

        </div>

        {actions.length > 0 && (
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border p-8 space-y-6">
            {!pendingAction && (
              <input
                type="text"
                placeholder="Attach tactical note to status change..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-6 py-4 bg-accent/30 border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner outline-none"
              />
            )}

            {pendingAction === "interview" && (
              <div className="bg-indigo-500/10 rounded-[2rem] p-6 border border-indigo-500/20 space-y-6 animate-in slide-in-from-bottom duration-300">
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" /> Finalize Interview Parameters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(new Date(e.target.value).toISOString())}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <input
                    type="url"
                    placeholder="Virtual HQ Link"
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <Button
                  onClick={() => handleAction("interview")}
                  disabled={isUpdating || !interviewDate}
                  className="w-full h-auto py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarCheck className="w-4 h-4 mr-2" />}
                  CONFIRM SCHEDULE
                </Button>
              </div>
            )}

            {(pendingAction === "accepted" || pendingAction === "rejected") && (
              <div className={cn(
                "rounded-[2rem] p-6 border space-y-6 animate-in slide-in-from-bottom duration-300",
                pendingAction === "accepted" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
              )}>
                <div className={cn(
                  "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                  pendingAction === "accepted" ? "text-emerald-500" : "text-red-500"
                )}>
                  <ShieldCheck className="w-4 h-4" /> Execution Feedback Required
                </div>
                <textarea
                  placeholder="Elaborate on the hiring decision..."
                  value={hiringNotes}
                  onChange={(e) => setHiringNotes(e.target.value)}
                  rows={3}
                  className="w-full px-6 py-4 bg-card border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-inner"
                />
                <Button
                  onClick={() => handleAction(pendingAction)}
                  disabled={isUpdating || !hiringNotes.trim()}
                  className={cn(
                    "w-full h-auto py-4 rounded-xl font-black uppercase tracking-widest",
                    pendingAction === "accepted" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {pendingAction === "accepted" ? "CONFIRM ONBOARDING" : "CONFIRM TERMINATION"}
                </Button>
              </div>
            )}

            {!pendingAction && (
              <div className="flex gap-4">
                {actions.map((action) => (
                  <Button
                    key={action.status}
                    onClick={() => handleAction(action.status)}
                    disabled={isUpdating}
                    className={cn(
                      "flex-1 h-auto py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl border-0",
                      action.variant
                    )}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {error && (
              <div className="text-[10px] font-bold text-red-500 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20 animate-in shake duration-500">
                <AlertCircle className="w-3 h-3 inline mr-1" /> {error}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
