import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function AiShortcuts() {
  const shortcuts = [
    { label: "Draft job post", to: "/jobs" },
    { label: "Prioritize applicants", to: "/applications" },
    { label: "Interview questions", to: "/interviews" },
    { label: "Draft offer letter", to: "/candidates" },
  ];

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-orange-600" />
        <h2 className="text-sm font-bold text-slate-800">AI Assistant Shortcuts</h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {shortcuts.map((shortcut, idx) => (
          <Link
            key={idx}
            to={shortcut.to}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors rounded-md text-xs font-medium"
          >
            <span className="text-orange-500 font-bold">+</span> {shortcut.label}
          </Link>
        ))}
      </div>

    </div>
  );
}
