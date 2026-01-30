"use client";

import DashboardShell from "@/components/DashboardShell";
import OnboardingExperience from "@/components/onboarding/OnboardingExperience";
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  const { preferences, isLoading } = useSettings();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin" />
      </main>
    );
  }

  if (!preferences.hasCompletedOnboarding) {
    return (
      <main className="min-h-screen">
        <OnboardingExperience />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <DashboardShell />
    </main>
  );
}
