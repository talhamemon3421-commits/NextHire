import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  Rocket
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { EditEmployerProfileModal } from "./EditEmployerProfileModal";
import { useState, useEffect } from "react";
import { getEmployerProfile } from "../../auth/api/employersApi";
import { getMyJobs } from "../../jobs/api/jobsApi";
import { getEmployerStats } from "../../applications/api/applicationsApi";
import { env } from "@/shared/config/env";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [jobCount, setJobCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);

  useEffect(() => {
    getEmployerProfile().then(res => {
      if (res.data) setProfile(res.data);
    }).catch(console.error);

    getMyJobs().then(res => {
      setJobCount(res.data?.length ?? 0);
    }).catch(console.error);

    getEmployerStats().then(res => {
      const d = res.data;
      setAppCount(d.total ?? 0);
      setInterviewCount(d.interview ?? 0);
    }).catch(console.error);
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Job Postings", href: "/jobs", icon: FileText, badge: jobCount || undefined },
    { label: "Applications", href: "/applications", icon: Users, badge: appCount || undefined },
    { label: "Candidates", href: "/candidates", icon: UserCheck },
  ];

  const scheduleItems = [
    { label: "Interviews", href: "/interviews", icon: Calendar, badge: interviewCount || undefined },
  ];

  const insightItems = [
    { label: "Reports", href: "/reports", icon: BarChart2 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col h-dvh shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#0070f3] rounded-lg w-8 h-8 flex items-center justify-center shrink-0 shadow-sm">
             <Rocket className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight text-white">BinLaden Aero</div>
            <div className="text-xs text-slate-400">Employer Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-6">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Main</div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive ? "bg-[#0070f3] text-white font-medium shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isActive ? "bg-white/20" : "bg-slate-800 text-slate-300")}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Schedule</div>
          <ul className="space-y-1">
            {scheduleItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive ? "bg-[#0070f3] text-white font-medium shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isActive ? "bg-white/20" : "bg-slate-800 text-slate-300")}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Insights</div>
          <ul className="space-y-1">
            {insightItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive ? "bg-[#0070f3] text-white font-medium shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between group hover:bg-slate-800 p-2 rounded-xl transition-colors">
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-slate-700">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture.startsWith('/api') ? `${env.apiBaseUrl}${profile.profilePicture.substring(4)}` : profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.name ? profile.name.substring(0, 2).toUpperCase() : "..."
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white group-hover:text-white truncate">
                {profile?.name || "Loading..."}
              </div>
              <div className="text-xs text-slate-400">Employer Profile</div>
            </div>
          </div>
          <button className="p-2 cursor-pointer rounded-lg hover:bg-slate-700 transition">
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
          </button>
        </div>
      </div>

      {isProfileModalOpen && (
        <EditEmployerProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onSaved={() => {
            getEmployerProfile().then(res => setProfile(res.data));
          }}
        />
      )}
    </aside>
  );
}
