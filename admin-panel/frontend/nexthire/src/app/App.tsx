import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { JobPostingsPage } from "../features/jobs/pages/JobPostingsPage";
import { ApplicationsPage } from "../features/applications/pages/ApplicationsPage";
import { InterviewsPage } from "../features/interviews/pages/InterviewsPage";
import { CandidatesPage } from "../features/candidates/pages/CandidatesPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { MainLayout } from "./MainLayout";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobPostingsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
