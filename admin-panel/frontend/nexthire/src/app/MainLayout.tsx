import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../features/dashboard/components/Sidebar";
import { ChatbotWidget } from "../features/chat/components/ChatbotWidget";

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto relative">
        <Outlet />
      </div>
      <ChatbotWidget />
    </div>
  );
}
