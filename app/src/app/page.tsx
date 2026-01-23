"use client";

import DashboardShell from "@/components/DashboardShell";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <main className="min-h-screen">
      <ErrorBoundary>
        <DashboardShell />
      </ErrorBoundary>
    </main>
  );
}
