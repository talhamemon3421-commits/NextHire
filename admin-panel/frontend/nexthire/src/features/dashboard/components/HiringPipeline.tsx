import React from "react";
import { Link } from "react-router-dom";
import type { ReportsResponse } from "../../applications/api/applicationsApi";

interface Props {
  funnel?: ReportsResponse["data"]["funnel"];
}

export function HiringPipeline({ funnel }: Props) {
  // If no funnel data yet, provide fallbacks
  const f = funnel || { pending: 0, reviewing: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 };
  
  // Total applications that started the funnel
  const total = f.pending + f.reviewing + f.shortlisted + f.interview + f.accepted + f.rejected;
  
  // To show a continuous pipeline we could show active in each stage. 
  // Let's visualize the distribution across current statuses.
  const getW = (val: number) => total > 0 ? `${Math.max((val / total) * 100, 3)}%` : "0%";

  const segments = [
    { label: "Pending", value: f.pending, color: "bg-blue-600", width: getW(f.pending) },
    { label: "Reviewing", value: f.reviewing, color: "bg-[#0da2ff]", width: getW(f.reviewing) },
    { label: "Shortlisted", value: f.shortlisted, color: "bg-[#5bb8ff]", width: getW(f.shortlisted) },
    { label: "Interview", value: f.interview, color: "bg-[#96d3ff]", width: getW(f.interview) },
    { label: "Accepted", value: f.accepted, color: "bg-[#cceaff]", width: getW(f.accepted), textDark: true },
  ].filter(s => s.value > 0); // Only show segments that have values, or handle empty state

  if (segments.length === 0) {
    segments.push({ label: "No Applications", value: 0, color: "bg-slate-200", width: "100%", textDark: true });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-slate-800">Hiring pipeline</h2>
        <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View report
        </Link>
      </div>

      <div className="flex w-full h-8 rounded overflow-hidden mb-4">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className={`${seg.color} flex items-center justify-center text-[11px] font-bold transition-all`}
            style={{ width: seg.width }}
            title={`${seg.label}: ${seg.value}`}
          >
            {parseFloat(seg.width) > 5 && (
              <span className={seg.textDark ? "text-blue-900" : "text-white"}>
                {seg.value}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-sm ${seg.color}`} />
            <span>{seg.label} {seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
