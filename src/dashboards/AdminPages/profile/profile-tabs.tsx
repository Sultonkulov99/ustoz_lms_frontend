"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProfileTabs() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs = [
    { label: t("profile.personalInfo"), href: "/admin/profile" },
    { label: t("profile.security"), href: "/admin/profile/security" },
    { label: t("profile.notifications"), href: "/admin/profile/notifications" },
  ];

  return (
    <nav className="flex w-[220px] shrink-0 flex-col gap-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-[8px] px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}