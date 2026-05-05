import React from "react";
import { TrendingUp, Minus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ReportsResponse } from "../../applications/api/applicationsApi";

interface Props {
  data?: ReportsResponse["data"]["overview"];
}

export function StatsOverview({ data }: Props) {
  const stats = [
    {
      title: "Active postings",
      value: data?.activeJobs ?? "-",
      trend: "Total live",
      trendUp: true,
    },
    {
      title: "Total applications",
      value: data?.totalApplications ?? "-",
      trend: "All time",
      trendUp: true,
    },
    {
      title: "Interviews scheduled",
      value: data?.interviewsScheduled ?? "-",
      trend: "Active pipeline",
      trendUp: null,
    },
    {
      title: "Offers extended",
      value: data?.offersExtended ?? "-",
      trend: "Accepted offers",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="text-sm text-slate-500 mb-2">{stat.title}</div>
          <div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight my-3">{stat.value}</div>
            <div className={cn(
              "text-xs flex items-center gap-1 font-medium",
              stat.trendUp === true ? "text-emerald-500" : "text-slate-400"
            )}>
              {stat.trendUp && <TrendingUp className="w-3 h-3" />}
              {stat.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
