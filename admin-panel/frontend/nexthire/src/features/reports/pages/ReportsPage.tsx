import React, { useEffect, useState } from "react";
import {
  BarChart2,
  Download,
  Clock,
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { getEmployerReports, type ReportsResponse } from "../../applications/api/applicationsApi";

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

    // 1. Overview data
    let csv = "REPORT: OVERVIEW\n";
    csv += `Active Jobs,Total Applications,Interviews Scheduled,Offers Extended,Average Time-to-Hire (Days)\n`;
    csv += `${data.overview.activeJobs},${data.overview.totalApplications},${data.overview.interviewsScheduled},${data.overview.offersExtended},${data.timeToHireDays}\n\n`;

    // 2. Funnel data
    csv += "REPORT: HIRING FUNNEL\n";
    csv += `Stage,Count\n`;
    csv += `Pending,${data.funnel.pending}\n`;
    csv += `Reviewing,${data.funnel.reviewing}\n`;
    csv += `Shortlisted,${data.funnel.shortlisted}\n`;
    csv += `Interview,${data.funnel.interview}\n`;
    csv += `Accepted,${data.funnel.accepted}\n`;
    csv += `Rejected,${data.funnel.rejected}\n\n`;

    // 3. Job Performance data
    csv += "REPORT: JOB PERFORMANCE\n";
    csv += `Job Title,Total Applications,Shortlisted,Interviews,Accepted,Rejected,Conversion Rate (%)\n`;
    data.jobPerformance.forEach(jp => {
      // Escape commas in title
      const title = `"${jp.title.replace(/"/g, '""')}"`;
      csv += `${title},${jp.applications},${jp.shortlisted},${jp.interviews},${jp.accepted},${jp.rejected},${jp.conversionRate}\n`;
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
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const f = data.funnel;
  const totalFunnel = f.pending + f.reviewing + f.shortlisted + f.interview + f.accepted + f.rejected;
  
  // Calculate funnel step percentages relative to the total applications
  const getP = (val: number) => totalFunnel > 0 ? ((val / totalFunnel) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track your hiring pipeline and job performance
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Clock className="w-4 h-4 text-blue-500" />
            Time to Hire
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {data.timeToHireDays > 0 ? `${data.timeToHireDays} days` : "-"}
          </div>
          <div className="text-xs text-slate-400 mt-1">Average across all accepted offers</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Target className="w-4 h-4 text-emerald-500" />
            Overall Conversion
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {totalFunnel > 0 ? ((f.accepted / totalFunnel) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Applications resulting in an offer</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Users className="w-4 h-4 text-purple-500" />
            Active Pipeline
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {f.reviewing + f.shortlisted + f.interview}
          </div>
          <div className="text-xs text-slate-400 mt-1">Candidates currently in process</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Rejection Rate
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {totalFunnel > 0 ? ((f.rejected / totalFunnel) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Candidates rejected</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/80 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            Hiring Funnel Breakdown
          </h2>
          
          <div className="space-y-4">
            {[
              { label: "Pending", count: f.pending, color: "bg-amber-500" },
              { label: "Reviewing", count: f.reviewing, color: "bg-blue-500" },
              { label: "Shortlisted", count: f.shortlisted, color: "bg-purple-500" },
              { label: "Interview", count: f.interview, color: "bg-indigo-500" },
              { label: "Accepted", count: f.accepted, color: "bg-emerald-500" },
              { label: "Rejected", count: f.rejected, color: "bg-red-500" },
            ].map((stage, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{stage.label}</span>
                  <span className="text-slate-500 font-medium">
                    {stage.count} <span className="text-slate-300">({getP(stage.count)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                    style={{ width: `${getP(stage.count)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Job Performance</h2>
            <p className="text-xs text-slate-500 mt-1">Application conversion rates per active posting</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Apps</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Shortlisted</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Interviews</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Hires</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.jobPerformance.map((job) => (
                  <tr key={job.jobId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600 font-medium">
                      {job.applications}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {job.shortlisted}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {job.interviews}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {job.accepted > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {job.accepted}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-slate-800">{job.conversionRate}%</div>
                    </td>
                  </tr>
                ))}
                {data.jobPerformance.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                      No jobs or applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
