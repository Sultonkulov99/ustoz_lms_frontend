"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ShoppingBag, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface MentorCourse {
  id: string;
  name: string;
  about: string;
  banner: string;
  level: "BEGINNER" | "PRE_INTERMEDIATE" | "INTERMEDIATE" | "ADVANCED" | string;
  published: boolean;
  price: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
  mentor: {
    job: string;
  };
  _count: {
    purchases: number;
    rates: number;
  };
}

interface CoursesResponse {
  total: number;
  data: MentorCourse[];
}

const PAGE_SIZE = 8;

function formatPrice(price: string): string {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return num.toLocaleString("uz-UZ") + " so'm";
}

import { useLanguage } from "@/contexts/LanguageContext";

export default function MentorDashboardPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("Mentor");

  const [allCourses, setAllCourses] = useState<MentorCourse[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [pageCourses, setPageCourses] = useState<MentorCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(localStorage.getItem("fullName") || "Mentor");
  }, []);

  useEffect(() => {
    const fetchAllForStats = async () => {
      try {
        const res = await apiFetch("/courses/my?offset=0&limit=1000");
        if (!res.ok) throw new Error("Statistikani olishda xatolik yuz berdi.");
        const data: CoursesResponse = await res.json();
        setAllCourses(data.data);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAllForStats();
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      setTableLoading(true);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const res = await apiFetch(`/courses/my?offset=${offset}&limit=${PAGE_SIZE}`);
        if (!res.ok) throw new Error("Kurslarni olishda xatolik yuz berdi.");
        const data: CoursesResponse = await res.json();
        setPageCourses(data.data);
        setTotal(data.total);
      } catch (err: any) {
        setError(err.message || "Xatolik yuz berdi.");
      } finally {
        setTableLoading(false);
      }
    };
    fetchPage();
  }, [page]);

  const publishedCount = allCourses.filter((c) => c.published).length;
  const totalPurchases = allCourses.reduce((sum, c) => sum + (c._count?.purchases || 0), 0);
  const totalRates = allCourses.reduce((sum, c) => sum + (c._count?.rates || 0), 0);

  const statCards = [
    {
      label: t("dashboard.totalCourses"),
      value: allCourses.length,
      icon: BookOpen,
      color: "#2563EB",
      bg: "#EEF3FF",
    },
    {
      label: t("dashboard.publishedCourses"),
      value: publishedCount,
      icon: CheckCircle2,
      color: "#12B76A",
      bg: "#E6F9F0",
    },
    {
      label: t("dashboard.purchasedCount"),
      value: totalPurchases,
      icon: ShoppingBag,
      color: "#BC000D",
      bg: "#FFF1F1",
    },
    {
      label: t("dashboard.totalRates"),
      value: totalRates,
      icon: Star,
      color: "#F59E0B",
      bg: "#FEF3E2",
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-5 lg:gap-6 lg:p-6">
      {/* Salomlashuv */}
      <div>
        <h1 className="font-inter text-xl font-bold text-black sm:text-2xl">
          {t("dashboard.welcome")}, {fullName}!
        </h1>
        <p className="font-inter mt-1 text-sm text-[#636C79]">
          {t("dashboard.mentorSubtitle")}
        </p>
      </div>

      {/* Statistika kartalari */}
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-[#E0E3E6] bg-white p-4 sm:gap-4 sm:p-5"
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-[10px] sm:size-12"
                style={{ background: stat.bg }}
              >
                <Icon size={20} color={stat.color} strokeWidth={2} className="sm:hidden" />
                <Icon size={22} color={stat.color} strokeWidth={2} className="hidden sm:block" />
              </div>
              <div className="min-w-0">
                <div className="font-inter text-xl font-bold leading-tight text-black sm:text-2xl">
                  {statsLoading ? "-" : stat.value}
                </div>
                <div className="font-inter mt-0.5 truncate text-xs text-[#636C79] sm:text-[13px]">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kurslar jadvali */}
      <div className="overflow-hidden rounded-xl border border-[#E0E3E6] bg-white">
        <div className="border-b border-[#F0F1F2] px-4 py-4 sm:px-5">
          <span className="font-inter text-[15px] font-bold text-black sm:text-base">
            {t("courses.myCourses")}
          </span>
        </div>

        {tableLoading ? (
          <div className="px-4 py-10 text-center text-sm text-[#636C79] sm:py-10">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="px-4 py-10 text-center text-sm text-[#BC000D] sm:py-10">{error}</div>
        ) : pageCourses.length === 0 ? (
          <div className="font-inter px-4 py-10 text-center text-sm text-[#636C79] sm:py-10">
            {t("courses.noCoursesCreated")}
          </div>
        ) : (
          <>
            {/* ── Mobil: karta ko'rinishi (sm dan pastda) ── */}
            <div className="flex flex-col gap-3 p-4 sm:hidden">
              {pageCourses.map((course) => {
                return (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm transition-shadow active:shadow-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#F0F1F2]">
                        {course.banner && (
                          <Image
                            src={`/course-banners/public/${course.banner}`}
                            alt={course.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-inter truncate text-[15px] font-semibold text-black">
                          {course.name}
                        </p>
                        <p className="font-inter mt-0.5 text-base font-bold text-[#BC000D]">
                          {formatPrice(course.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#F5F5F5] pt-3">
                      <span
                        className="font-inter inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: course.published ? "#E6F9F0" : "#F0F1F2",
                          color: course.published ? "#12B76A" : "#636C79",
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: course.published ? "#12B76A" : "#9CA3AF" }}
                        />
                        {course.published ? t("status.published") : t("status.draft")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── sm va undan katta: jadval ko'rinishi ── */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA]">
                    <th className="font-inter whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-[#636C79] lg:px-5">
                      {t("table.course")}
                    </th>
                    <th className="font-inter whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-[#636C79] lg:px-5">
                      {t("table.price")}
                    </th>
                    <th className="font-inter whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-[#636C79] lg:px-5">
                      {t("table.status")}
                    </th>
                    <th className="font-inter hidden whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-[#636C79] lg:table-cell lg:px-5">
                      {t("table.purchased")}
                    </th>
                    <th className="font-inter hidden whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-[#636C79] lg:table-cell lg:px-5">
                      {t("table.rate")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageCourses.map((course) => {
                    return (
                      <tr key={course.id} className="border-t border-[#F0F1F2]">
                        <td className="px-4 py-3.5 lg:px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#F0F1F2]">
                              {course.banner && (
                                <Image
                                  src={`/course-banners/public/${course.banner}`}
                                  alt={course.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <span className="font-inter text-sm font-semibold text-black">
                              {course.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 lg:px-5">
                          <span className="font-inter whitespace-nowrap text-sm font-semibold text-black">
                            {formatPrice(course.price)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 lg:px-5">
                          <span
                            className="font-inter inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{
                              background: course.published ? "#E6F9F0" : "#F0F1F2",
                              color: course.published ? "#12B76A" : "#636C79",
                            }}
                          >
                            {course.published ? t("status.published") : t("status.draft")}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3.5 lg:table-cell lg:px-5">
                          <span className="font-inter text-sm text-[#374151]">
                            {course._count?.purchases ?? 0}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3.5 lg:table-cell lg:px-5">
                          <div className="flex items-center gap-1">
                            <Star size={14} color="#F59E0B" fill="#F59E0B" />
                            <span className="font-inter text-sm text-[#374151]">
                              {course._count?.rates ?? 0}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-stretch gap-3 border-t border-[#F0F1F2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-5">
                <span className="font-inter text-center text-xs text-[#636C79] sm:text-left sm:text-[13px]">
                  {t("pagination.showingRange")} {(page - 1) * PAGE_SIZE + 1} {t("pagination.to")} {Math.min(page * PAGE_SIZE, total)} / {total} {t("pagination.items")}
                </span>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex size-9 items-center justify-center rounded-lg border border-[#E0E3E6] bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} color="#000000" />
                  </button>

                  <span className="font-inter px-2 text-[13px] font-semibold text-black">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex size-9 items-center justify-center rounded-lg border border-[#E0E3E6] bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={16} color="#000000" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}