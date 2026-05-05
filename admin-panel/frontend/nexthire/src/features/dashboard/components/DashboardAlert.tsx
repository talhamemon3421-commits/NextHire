import React from "react";

interface Props {
  count?: number;
}

export function DashboardAlert({ count = 0 }: Props) {
  if (count === 0) return null;

  return (
    <div className="bg-[#f0f7ff] rounded-xl p-4 flex items-center gap-3 mb-5 border-0">
      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
      <p className="text-[13px] text-blue-900 leading-tight">
        <span className="font-semibold text-blue-700">{count} pending application{count !== 1 && 's'}</span> awaiting your review.
      </p>
    </div>
  );
}
