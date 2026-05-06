import React from "react";
import { TrendingUp } from "lucide-react";
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
      trend: `${data?.avgApplicationsPerJob ?? "-"} avg apps/job`,
      trendUp: true,
    },
    {
      title: "Total applications",
      value: data?.totalApplications ?? "-",
      trend: `${data?.overallConversionRate ?? "-"}% hire conversion`,
      trendUp: true,
    },
    {
      title: "Pipeline in progress",
      value: data?.activePipelineCandidates ?? "-",
      trend: `${data?.interviewsScheduled ?? "-"} interviews`,
      trendUp: true,
    },
    {
      title: "Hiring velocity",
      value: data?.avgTimeToHireDays ? `${data.avgTimeToHireDays}d` : "-",
      trend: `${data?.offerAcceptanceRate ?? "-"}% offer acceptance`,
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</div>
          <div>
            <div className="text-3xl font-bold tracking-tight py-2">{stat.value}</div>
            <div className={cn(
              "text-xs flex items-center gap-1 font-semibold mt-1",
              stat.trendUp === true ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {stat.trendUp && <TrendingUp className="w-3.5 h-3.5" />}
              {stat.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
