import React, { useState } from "react";
import { Download, Plus } from "lucide-react";
import { PostJobModal } from "../../jobs/components/PostJobModal";

export function DashboardTopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-3">
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-4 h-4 text-slate-400" />
          Export
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </button>
      </div>

      {isModalOpen && <PostJobModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
