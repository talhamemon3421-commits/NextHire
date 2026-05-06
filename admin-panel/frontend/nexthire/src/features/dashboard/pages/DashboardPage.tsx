import React, { useEffect, useState } from "react";
import { getEmployerReports, type ReportsResponse } from "../../applications/api/applicationsApi";

import { DashboardTopBar } from "../components/DashboardTopBar";
import { DashboardAlert } from "../components/DashboardAlert";
import { StatsOverview } from "../components/StatsOverview";
import { HiringPipeline } from "../components/HiringPipeline";
import { RecentApplicants } from "../components/RecentApplicants";
import { AiShortcuts } from "../components/AiShortcuts";

export function DashboardPage() {
  const [reportsData, setReportsData] = useState<ReportsResponse["data"] | null>(null);

  useEffect(() => {
    getEmployerReports().then((res) => {
      setReportsData(res.data);
    }).catch(console.error);
  }, []);

  const handleExport = () => {
    if (!reportsData) return;

    let csv = "DASHBOARD OVERVIEW\n";
    csv += "Active Jobs,Total Applications,Interviews Scheduled,Offers Extended,Hired Candidates,Active Pipeline,Offer Acceptance Rate,Overall Conversion Rate,Avg Applications Per Job,Avg Time To Hire (Days)\n";
    csv += `${reportsData.overview.activeJobs},${reportsData.overview.totalApplications},${reportsData.overview.interviewsScheduled},${reportsData.overview.offersExtended},${reportsData.overview.hiredCandidates},${reportsData.overview.activePipelineCandidates},${reportsData.overview.offerAcceptanceRate},${reportsData.overview.overallConversionRate},${reportsData.overview.avgApplicationsPerJob},${reportsData.overview.avgTimeToHireDays}\n\n`;

    csv += "DASHBOARD FUNNEL\n";
    csv += "Pending,Reviewing,Shortlisted,Interview,Offered,Accepted,Rejected\n";
    csv += `${reportsData.funnel.pending},${reportsData.funnel.reviewing},${reportsData.funnel.shortlisted},${reportsData.funnel.interview},${reportsData.funnel.offered},${reportsData.funnel.accepted},${reportsData.funnel.rejected}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexthire-dashboard-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 h-full flex flex-col">
        <DashboardTopBar onExport={handleExport} />
          <DashboardAlert count={reportsData?.funnel?.pending} />
          <StatsOverview data={reportsData?.overview} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 flex-1">
            <HiringPipeline funnel={reportsData?.funnel} />
            <RecentApplicants />
          </div>

          <AiShortcuts />
    </div>
  );
}
