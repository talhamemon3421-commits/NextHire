import React from "react";
import { cn } from "@/shared/lib/cn";

export function RecentApplicants() {
  const applicants = [
    {
      name: "Zain Ahmed",
      role: "Flight Instructor",
      initials: "ZA",
      bgColor: "bg-primary/10 text-primary",
      status: "New",
      statusColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      name: "Sara Rashid",
      role: "Ground Ops Lead",
      initials: "SR",
      bgColor: "bg-emerald-500/10 text-emerald-500",
      status: "Interview",
      statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      name: "Usman Khan",
      role: "Chief Instructor",
      initials: "UK",
      bgColor: "bg-amber-500/10 text-amber-500",
      status: "Screening",
      statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      name: "Fatima Iqbal",
      role: "Admin Officer",
      initials: "FI",
      bgColor: "bg-purple-500/10 text-purple-500",
      status: "Offer",
      statusColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">Recent applicants</h2>
        <button className="text-sm font-semibold text-primary hover:underline transition-all">
          See all
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {applicants.map((app, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-current/10 shadow-inner",
                  app.bgColor
                )}
              >
                {app.initials}
              </div>
              <div>
                <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {app.name}
                </div>
                <div className="text-xs text-muted-foreground">{app.role}</div>
              </div>
            </div>
            <div
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
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
