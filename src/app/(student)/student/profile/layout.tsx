"use client";

import { ProfileTabs } from "@/dashboards/StudentsPages/profile/profile-tabs";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t("profile.settingsTitle")}</h1>

      <div className="flex gap-6">
        <ProfileTabs />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}