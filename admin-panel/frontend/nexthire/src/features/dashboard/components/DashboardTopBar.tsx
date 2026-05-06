import React, { useState } from "react";
import { Download, Plus } from "lucide-react";
import { PostJobModal } from "../../jobs/components/PostJobModal";
import { Button } from "@/shared/components/ui/Button";

interface DashboardTopBarProps {
  onExport?: () => void;
}

export function DashboardTopBar({ onExport }: DashboardTopBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="flex-1 sm:flex-none gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex-1 sm:flex-none gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Button>
      </div>

      {isModalOpen && <PostJobModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
