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
    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-bold tracking-tight">AI Assistant Shortcuts</h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {shortcuts.map((shortcut, idx) => (
          <Link
            key={idx}
            to={shortcut.to}
            className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border text-foreground hover:bg-accent hover:border-amber-500/50 transition-all rounded-lg text-xs font-bold group shadow-sm"
          >
            <span className="text-amber-500 group-hover:scale-125 transition-transform">+</span> 
            {shortcut.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
