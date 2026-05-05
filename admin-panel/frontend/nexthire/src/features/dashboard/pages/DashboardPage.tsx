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

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 h-full flex flex-col">
        <DashboardTopBar />
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
