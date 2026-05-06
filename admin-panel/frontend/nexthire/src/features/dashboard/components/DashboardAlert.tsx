import React from "react";

interface Props {
  count?: number;
}

export function DashboardAlert({ count = 0 }: Props) {
  if (count === 0) return null;

  return (
    <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-3 mb-6 border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"></div>
      <p className="text-sm font-medium">
        <span className="font-bold text-primary">{count} pending application{count !== 1 && 's'}</span> awaiting your review.
      </p>
    </div>
  );
}
