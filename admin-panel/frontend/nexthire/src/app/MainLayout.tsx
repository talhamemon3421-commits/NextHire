import React from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../features/dashboard/components/Sidebar";
import { ChatbotWidget } from "../features/chat/components/ChatbotWidget";

export function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative h-dvh overflow-hidden bg-background text-foreground font-sans antialiased">
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="relative h-dvh overflow-y-auto md:ml-64">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-sm font-bold tracking-tight">NextHire</div>
        </div>
        
        {/* Main Content Area */}
        <main className="min-h-full">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
