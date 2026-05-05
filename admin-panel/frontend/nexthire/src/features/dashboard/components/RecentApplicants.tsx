import React from "react";
import { cn } from "@/shared/lib/cn";

export function RecentApplicants() {
  const applicants = [
    {
      name: "Zain Ahmed",
      role: "Flight Instructor",
      initials: "ZA",
      bgColor: "bg-blue-50 text-blue-600",
      status: "New",
      statusColor: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    {
      name: "Sara Rashid",
      role: "Ground Ops Lead",
      initials: "SR",
      bgColor: "bg-emerald-50 text-emerald-600",
      status: "Interview",
      statusColor: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      name: "Usman Khan",
      role: "Chief Instructor",
      initials: "UK",
      bgColor: "bg-orange-50 text-orange-600",
      status: "Screening",
      statusColor: "bg-orange-50 text-orange-600 border border-orange-100",
    },
    {
      name: "Fatima Iqbal",
      role: "Admin Officer",
      initials: "FI",
      bgColor: "bg-purple-50 text-purple-600",
      status: "Offer",
      statusColor: "bg-purple-50 text-purple-600 border border-purple-100",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-slate-800">Recent applicants</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          See all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {applicants.map((app, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                  app.bgColor
                )}
              >
                {app.initials}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800 leading-tight">
                  {app.name}
                </div>
                <div className="text-xs text-slate-500">{app.role}</div>
              </div>
            </div>
            <div
              className={cn(
                "px-3 py-1 rounded-[10px] text-[11px] font-medium tracking-wide",
                app.statusColor
              )}
            >
              {app.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
