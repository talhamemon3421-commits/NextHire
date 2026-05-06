import React, { useEffect, useState } from "react";
import {
  BarChart2,
  Download,
  Clock,
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  BriefcaseBusiness,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Rocket,
  Activity,
} from "lucide-react";
import { getEmployerReports, type ReportsResponse } from "../../applications/api/applicationsApi";
import { Button } from "@/shared/components/ui/Button";

export function ReportsPage() {
  const [data, setData] = useState<ReportsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getEmployerReports();
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;

    let csv = "REPORT: OVERVIEW\n";
    csv += `Active Jobs,Total Applications,Interviews Scheduled,Offers Extended,Average Time-to-Hire (Days)\n`;
    csv += `${data.overview.activeJobs},${data.overview.totalApplications},${data.overview.interviewsScheduled},${data.overview.offersExtended},${data.timeToHireDays}\n\n`;

    csv += "REPORT: HIRING FUNNEL\n";
    csv += `Stage,Count\n`;
    csv += `Pending,${data.funnel.pending}\n`;
    csv += `Reviewing,${data.funnel.reviewing}\n`;
    csv += `Shortlisted,${data.funnel.shortlisted}\n`;
    csv += `Interview,${data.funnel.interview}\n`;
    csv += `Offered,${data.funnel.offered}\n`;
    csv += `Accepted,${data.funnel.accepted}\n`;
    csv += `Rejected,${data.funnel.rejected}\n\n`;

    csv += "REPORT: PIPELINE CONVERSION\n";
    csv += "Pending->Reviewing,Reviewing->Shortlisted,Shortlisted->Interview,Interview->Offered,Offered->Accepted,Acceptance/App %,Rejection/App %\n";
    csv += `${data.conversion.pendingToReviewing},${data.conversion.reviewingToShortlisted},${data.conversion.shortlistedToInterview},${data.conversion.interviewToOffered},${data.conversion.offeredToAccepted},${data.conversion.acceptancePerApplication},${data.conversion.rejectionPerApplication}\n\n`;

    csv += "REPORT: STATUS VELOCITY (DAYS)\n";
    csv += "Reviewing,Shortlisted,Interview,Offered,Accepted,Rejected\n";
    csv += `${data.statusVelocityDays.reviewing},${data.statusVelocityDays.shortlisted},${data.statusVelocityDays.interview},${data.statusVelocityDays.offered},${data.statusVelocityDays.accepted},${data.statusVelocityDays.rejected}\n\n`;

    csv += "REPORT: JOB PERFORMANCE\n";
    csv += `Job Title,Views,Total Applications,Recent Apps 7d,Shortlisted,Interviews,Offers,Hires,Rejected,Shortlist Rate,Interview Rate,Offer Rate,Hire Conversion,Offer Acceptance,Avg Decision Days\n`;
    data.jobPerformance.forEach(jp => {
      const title = `"${jp.title.replace(/"/g, '""')}"`;
      csv += `${title},${jp.views},${jp.applications},${jp.recentApplications7d},${jp.shortlisted},${jp.interviews},${jp.offered},${jp.accepted},${jp.rejected},${jp.shortlistingRate},${jp.interviewRate},${jp.offerRate},${jp.conversionRate},${jp.acceptanceRate},${jp.avgTimeToDecisionDays}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexthire-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const f = data.funnel;
  const totalFunnel = f.pending + f.reviewing + f.shortlisted + f.interview + f.offered + f.accepted + f.rejected;
  const getP = (val: number) => totalFunnel > 0 ? ((val / totalFunnel) * 100).toFixed(1) : "0.0";

  const timeline = data.timeline || [];
  const timelineMax = timeline.reduce((m, t) => Math.max(m, t.applications), 0);
  const latest = timeline[timeline.length - 1];
  const previousWeek = timeline.slice(-14, -7);
  const currentWeek = timeline.slice(-7);
  const prevWeekApps = previousWeek.reduce((sum, d) => sum + d.applications, 0);
  const currWeekApps = currentWeek.reduce((sum, d) => sum + d.applications, 0);
  const weeklyMomentum = prevWeekApps > 0 ? (((currWeekApps - prevWeekApps) / prevWeekApps) * 100).toFixed(1) : "0.0";
  const momentumUp = Number(weeklyMomentum) >= 0;
  const hiringFlowScore = Number(
    (
      data.conversion.reviewingToShortlisted * 0.2 +
      data.conversion.shortlistedToInterview * 0.25 +
      data.conversion.interviewToOffered * 0.25 +
      data.conversion.offeredToAccepted * 0.3
    ).toFixed(1)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary via-blue-600 to-indigo-600 p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -left-14 -bottom-20 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
              <Rocket className="h-3.5 w-3.5" />
              Creative Hiring Intelligence
            </div>
            <h1 className="mt-4 text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">Analytics & Reports <br/>Command Center</h1>
            <p className="mt-3 text-sm text-white/80 max-w-2xl font-medium">
              Your pipeline story at a glance: trend momentum, conversion quality, and bottleneck pressure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md shadow-inner">
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Hiring Flow Score</div>
              <div className="text-3xl font-black mt-1">{hiringFlowScore}</div>
            </div>
            <Button
              onClick={handleExportCSV}
              variant="secondary"
              className="rounded-xl h-12 px-6 font-bold gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Time to Hire", value: data.overview.avgTimeToHireDays > 0 ? `${data.overview.avgTimeToHireDays}d` : "-", sub: "Average decision speed", icon: Clock, badge: "Velocity", color: "blue" },
          { label: "Hire Conversion", value: `${data.overview.overallConversionRate}%`, sub: "Applicant success rate", icon: Target, badge: "Efficiency", color: "emerald" },
          { label: "Active Pipeline", value: data.overview.activePipelineCandidates, sub: `${data.overview.avgApplicationsPerJob} avg apps/job`, icon: Users, badge: "Live", color: "purple" },
          { label: "Momentum", value: `${weeklyMomentum}%`, sub: "Weekly app growth", icon: TrendingUp, badge: "Weekly", color: "indigo", momentum: true },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <stat.icon className={cn("h-4 w-4", `text-${stat.color}-500`)} />
                {stat.label}
              </div>
              <span className={cn(
                "rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-tighter",
                stat.momentum ? (momentumUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500") : `bg-${stat.color}-500/10 text-${stat.color}-500`
              )}>
                {stat.momentum && (momentumUp ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />)}
                {stat.badge}
              </span>
            </div>
            <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
            <div className="mt-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-[2rem] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              30-Day Trend Pulse
            </h2>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Daily applications & hires</div>
          </div>
          <div className="space-y-3">
            {timeline.slice(-15).map((point) => {
              const appWidth = timelineMax > 0 ? `${Math.max(6, (point.applications / timelineMax) * 100)}%` : "6%";
              const hireWidth = timelineMax > 0 ? `${Math.max(4, (point.hires / timelineMax) * 100)}%` : "0%";
              return (
                <div key={point.date} className="grid grid-cols-[60px_1fr_40px] items-center gap-4 group">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{point.date.slice(5)}</div>
                  <div className="relative h-3 rounded-full bg-accent/50 overflow-hidden border border-border/20 shadow-inner">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-sm transition-all duration-1000" style={{ width: appWidth }} />
                    <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500/80 shadow-sm transition-all duration-1000 delay-100" style={{ width: hireWidth }} />
                  </div>
                  <div className="text-[10px] font-black text-right">{point.applications} <span className="text-muted-foreground/50">/</span> {point.hires}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-6 border-t border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center">
            Latest day: <span className="text-foreground">{latest?.applications ?? 0}</span> apps • <span className="text-foreground">{latest?.offers ?? 0}</span> offers • <span className="text-foreground">{latest?.hires ?? 0}</span> hires
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Funnel Story
          </h2>
          <div className="space-y-4">
            {[
              { label: "Pending", count: f.pending, color: "bg-amber-500" },
              { label: "Reviewing", count: f.reviewing, color: "bg-blue-500" },
              { label: "Shortlisted", count: f.shortlisted, color: "bg-purple-500" },
              { label: "Interview", count: f.interview, color: "bg-indigo-500" },
              { label: "Offered", count: f.offered, color: "bg-cyan-500" },
              { label: "Accepted", count: f.accepted, color: "bg-emerald-500" },
              { label: "Rejected", count: f.rejected, color: "bg-red-500" },
            ].map((stage, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 uppercase tracking-wide">
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span>
                    {stage.count} <span className="text-muted-foreground/50 font-medium">({getP(stage.count)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-accent/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 shadow-sm", stage.color)}
                    style={{ width: `${getP(stage.count)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-bold text-amber-500 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="leading-relaxed uppercase tracking-tight">
              Biggest drop-off at <span className="text-foreground underline decoration-amber-500/30 underline-offset-4">{data.bottlenecks.biggestDropStage}</span> ({data.bottlenecks.biggestDropRate}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Conversion Chain
          </h2>
          <div className="space-y-4">
            {[
              { label: "Pending → Reviewing", value: data.conversion.pendingToReviewing },
              { label: "Reviewing → Shortlisted", value: data.conversion.reviewingToShortlisted },
              { label: "Shortlisted → Interview", value: data.conversion.shortlistedToInterview },
              { label: "Interview → Offered", value: data.conversion.interviewToOffered },
              { label: "Offered → Accepted", value: data.conversion.offeredToAccepted },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground">{item.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-accent/50 overflow-hidden border border-border/20 shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-sm transition-all duration-1000" style={{ width: `${Math.max(item.value, 3)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Status Velocity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(data.statusVelocityDays).map(([status, days]) => (
              <div key={status} className="rounded-2xl border border-border p-4 bg-accent/30 shadow-sm group hover:border-primary/50 transition-colors">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{status}</div>
                <div className="text-2xl font-black mt-2 tracking-tighter">{days || "-"}{days ? "d" : ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-[2rem] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <h2 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
            <BriefcaseBusiness className="w-4 h-4 text-emerald-500" />
            Job Mix
          </h2>
          <div className="space-y-4">
            {data.distributions.byJobType.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[10px] font-bold mb-2 uppercase tracking-tight">
                  <span className="text-muted-foreground capitalize">{item.label}</span>
                  <span>{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-accent/50 rounded-full border border-border/20">
                  <div className="h-full bg-emerald-500 rounded-full shadow-sm" style={{ width: `${Math.max(item.percentage, 3)}%` }} />
                </div>
              </div>
            ))}
            {data.distributions.byJobType.length === 0 && <div className="text-xs text-muted-foreground">No job mix data yet.</div>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <h2 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-primary" />
            Skill Demand
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skillsDemand.slice(0, 10).map((item) => (
              <span
                key={item.skill}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary uppercase shadow-sm"
              >
                {item.skill}
                <span className="opacity-50">•</span>
                <span className="text-foreground">{item.demandScore}</span>
              </span>
            ))}
            {data.skillsDemand.length === 0 && <span className="text-xs text-muted-foreground">No skill data available.</span>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-card to-rose-500/5 p-6 lg:p-8 shadow-sm">
          <h2 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Risk Radar
          </h2>
          <div className="space-y-3">
            {[
              { label: "Largest pipeline loss", value: data.bottlenecks.biggestDropStage, sub: `${data.bottlenecks.biggestDropRate}% drop` },
              { label: "Avg decision time", value: `${data.bottlenecks.averageDecisionDays} days`, sub: "Across all stages" },
              { label: "Offer acceptance", value: `${data.overview.offerAcceptanceRate}%`, sub: "Quality of hire" },
            ].map((risk, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{risk.label}</div>
                <div className="font-black text-foreground mt-1.5 text-base tracking-tight">{risk.value}</div>
                <div className="text-[9px] font-bold text-rose-500 mt-1 uppercase tracking-tighter">{risk.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-accent/10">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Job Performance Matrix</h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">Awareness, pipeline depth, and outcome quality</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/30 border-b border-border/50">
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Job Title</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Views</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Apps</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Apps 7d</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Shortlist</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Interview</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Hires</th>
                <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Conv%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.jobPerformance.map((job) => (
                <tr key={job.jobId} className="hover:bg-accent/40 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">{job.title}</div>
                  </td>
                  <td className="px-8 py-5 text-right text-sm text-muted-foreground font-medium">{job.views}</td>
                  <td className="px-8 py-5 text-right text-sm font-black tracking-tight">{job.applications}</td>
                  <td className="px-8 py-5 text-right text-sm text-muted-foreground font-medium">{job.recentApplications7d}</td>
                  <td className="px-8 py-5 text-right text-sm text-muted-foreground font-medium">{job.shortlisted}</td>
                  <td className="px-8 py-5 text-right text-sm text-muted-foreground font-medium">{job.interviews}</td>
                  <td className="px-8 py-5 text-right">
                    {job.accepted > 0 ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {job.accepted}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/30 font-bold">0</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="text-sm font-black text-primary">{job.conversionRate}%</div>
                  </td>
                </tr>
              ))}
              {data.jobPerformance.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">
                    No jobs data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
