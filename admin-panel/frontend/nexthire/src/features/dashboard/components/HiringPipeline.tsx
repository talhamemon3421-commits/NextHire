import React from "react";
import { Link } from "react-router-dom";
import type { ReportsResponse } from "../../applications/api/applicationsApi";

interface Props {
  funnel?: ReportsResponse["data"]["funnel"];
}

export function HiringPipeline({ funnel }: Props) {
  const f = funnel || { pending: 0, reviewing: 0, shortlisted: 0, interview: 0, offered: 0, accepted: 0, rejected: 0 };
  const total = f.pending + f.reviewing + f.shortlisted + f.interview + f.offered + f.accepted + f.rejected;
  const getW = (val: number) => total > 0 ? `${Math.max((val / total) * 100, 3)}%` : "0%";

  const segments = [
    { label: "Pending", value: f.pending, color: "bg-primary", width: getW(f.pending) },
    { label: "Reviewing", value: f.reviewing, color: "bg-blue-400", width: getW(f.reviewing) },
    { label: "Shortlisted", value: f.shortlisted, color: "bg-blue-300", width: getW(f.shortlisted) },
    { label: "Interview", value: f.interview, color: "bg-blue-200", width: getW(f.interview) },
    { label: "Offered", value: f.offered, color: "bg-emerald-400", width: getW(f.offered), textDark: true },
    { label: "Accepted", value: f.accepted, color: "bg-emerald-200", width: getW(f.accepted), textDark: true },
  ].filter(s => s.value > 0);

  if (segments.length === 0) {
    segments.push({ label: "No Applications", value: 0, color: "bg-muted", width: "100%", textDark: true });
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">Hiring pipeline</h2>
        <Link to="/reports" className="text-sm font-semibold text-primary hover:underline transition-all">
          View report
        </Link>
      </div>

      <div className="flex w-full h-8 rounded-lg overflow-hidden mb-4 shadow-inner">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className={`${seg.color} flex items-center justify-center text-[11px] font-bold transition-all duration-500`}
            style={{ width: seg.width }}
            title={`${seg.label}: ${seg.value}`}
          >
            {parseFloat(seg.width) > 5 && (
              <span className={seg.textDark ? "text-slate-900" : "text-white"}>
                {seg.value}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
            <div className={`w-2.5 h-2.5 rounded-sm ${seg.color} shadow-sm`} />
            <span>{seg.label} <span className="font-bold text-foreground/80">{seg.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
