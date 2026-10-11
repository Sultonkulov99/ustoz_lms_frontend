"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, GraduationCap, BookOpen, ShieldCheck, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/lib/api-client";

export function AdminDashboard() {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({
    admins: 0,
    mentors: 0,
    students: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await apiFetch("/users/dashboard-info");
        if (res.ok) {
          const resData = await res.json();
          console.log("Dashboard Info API Response:", resData);
          if (active) {
            const statsData = resData.data || resData || {};
            setCounts({
              admins: statsData.admins ?? statsData.adminsCount ?? statsData.totalAdmins ?? statsData.admin ?? 0,
              mentors: statsData.mentors ?? statsData.mentorsCount ?? statsData.totalMentors ?? statsData.mentor ?? 0,
              students: statsData.students ?? statsData.studentsCount ?? statsData.totalStudents ?? statsData.student ?? 0,
              courses: statsData.courses ?? statsData.coursesCount ?? statsData.totalCourses ?? statsData.course ?? 0,
            });
          }
        }
      } catch (err) {
        console.error("Dashboard Info fetch error:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      value: counts.admins,
      labelKey: "dashboard.totalAdmins" as const,
      icon: ShieldCheck,
      color: "#BC000D",
      bg: "#FFF1F1",
      href: "/admin/users/admins",
    },
    {
      value: counts.mentors,
      labelKey: "dashboard.totalMentors" as const,
      icon: UserCheck,
      color: "#7C3AED",
      bg: "#F3EEFF",
      href: "/admin/users/mentors",
    },
   
    {
      value: counts.students,
      labelKey: "dashboard.totalStudents" as const,
      icon: GraduationCap,
      color: "#16A34A",
      bg: "#E8F8EF",
      href: "/admin/users/students",
    },
    {
      value: counts.courses,
      labelKey: "dashboard.totalCourses" as const,
      icon: BookOpen,
      color: "#D97706",
      bg: "#FEF3C7",
      href: "/admin/courses",
    },
  ];

  return (
    <div className="flex-1 bg-[#F0F1F2] overflow-y-auto p-4 md:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-1 mb-7">
        <span className="font-bold text-xl md:text-2xl text-black font-sans">
          {t("dashboard.title")}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#3F444D] font-medium font-sans">
            {t("dashboard.subtitle")}
          </span>
          <span className="text-[#3F444D] text-sm">•</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.labelKey}
              href={stat.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#E0E3E6]/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer no-underline"
              style={{ minHeight: "154px" }}
            >
              <div className="flex items-center justify-between">
                {/* Icon */}
                <div
                  className="size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: stat.bg }}
                >
                  <Icon size={24} color={stat.color} strokeWidth={2} />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                {/* Value */}
                <div className="font-extrabold text-3xl md:text-4xl text-[#0D1017] font-sans leading-none flex items-center min-h-10">
                  {loading ? (
                    <Loader2 className="animate-spin" size={26} color={stat.color} />
                  ) : (
                    stat.value
                  )}
                </div>

                {/* Label */}
                <div className="text-sm font-semibold text-[#636C79] font-sans">
                  {t(stat.labelKey)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}