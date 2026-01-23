"use client";

import DashboardShell from "@/components/DashboardShell";
import OnboardingExperience from "@/components/onboarding/OnboardingExperience";
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  return (
    <main className="min-h-screen">
      <DashboardShell />
    </main>
  );
}
