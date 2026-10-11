"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUserId } from "@/lib/auth";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { useLanguage } from "@/contexts/LanguageContext";

const FILES_BASE_URL = "/files/public";

type Course = {
  id: string;
  name: string;
};

type PurchasedStudent = {
  amount: string;
  paidVia: string | null;
  purchasedAt: string;
  user: {
    id: number;
    fullName: string;
    image: string | null;
    phone: string;
  };
};

function formatAmount(amount: string) {
  const num = Number(amount);
  if (Number.isNaN(num)) return amount;
  return num.toLocaleString("uz-UZ").replace(/,/g, " ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function getInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ["#BC000D", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
  if (!name) return colors[0];
  const charCode = name.trim().toUpperCase().charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export function MentorStudents() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  const [students, setStudents] = useState<PurchasedStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMyCourses = async () => {
      setCoursesLoading(true);
      const myId = getCurrentUserId();
      if (!myId) {
        setCoursesLoading(false);
        return;
      }
      try {
        const res = await apiFetch(`/courses/my?offset=0&limit=100`);
        if (res.ok) {
          const resData = await res.json();
          const list: Course[] = Array.isArray(resData?.data)
            ? resData.data.map((c: any) => ({ id: c.id, name: c.name }))
            : [];
          setCourses(list);
          if (list.length > 0) setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error("Mentor courses fetch error:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchStudents = async () => {
      setStudentsLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const res = await apiFetch(
          `/purchased-courses/course/${selectedCourseId}/students?offset=${offset}&limit=${itemsPerPage}`
        );
        if (res.ok) {
          const resData = await res.json();
          setStudents(Array.isArray(resData?.data) ? resData.data : []);
          setTotal(typeof resData?.total === "number" ? resData.total : 0);
        } else {
          setError(t("table.noDataFound"));
        }
      } catch (err) {
        console.error("Mentor students fetch error:", err);
        setError(t("table.noDataFound"));
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedCourseId, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourseId]);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.user.fullName.toLowerCase().includes(q) ||
      s.user.phone.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const PaginationButtons = () => (
    <>
      {getVisiblePages(safePage, totalPages).map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} className="px-1 text-[#374151]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(Number(page))}
            className="font-inter flex size-8 items-center justify-center rounded-md text-sm font-medium"
            style={{
              border: page === safePage ? "1px solid #E0E3E6" : "none",
              background: page === safePage ? "#ffffff" : "transparent",
              color: page === safePage ? "#0D1017" : "#636C79",
            }}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => goToPage(safePage + 1)}
        disabled={safePage === totalPages}
        className="font-inter ml-1 flex h-8 items-center whitespace-nowrap rounded-md border border-[#E0E3E6] px-3 text-sm font-medium text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("common.next")}
      </button>
    </>
  );

  return (
    <div className="font-inter flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0D1017] sm:text-2xl">
          {t("sidebar.myStudents")}
        </h1>
        <p className="mt-1 text-xs text-[#374151] sm:text-[13px]">
          {t("sidebar.myCourses")} <span className="mx-1">•</span> {t("sidebar.students")}
        </p>
      </div>

      {/* Kurs tanlash */}
      <div className="relative w-full sm:w-80">
        <button
          onClick={() => setCourseDropdownOpen((v) => !v)}
          disabled={coursesLoading || courses.length === 0}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-[#E0E3E6] bg-white px-3.5 text-sm text-[#0D1017] disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {coursesLoading
              ? t("common.loading")
              : selectedCourse?.name || t("common.selectCourse")}
          </span>
          <ChevronDown
            size={16}
            color="#636C79"
            className="shrink-0 transition-transform duration-200"
            style={{ transform: courseDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {courseDropdownOpen && (
          <>
            <div
              onClick={() => setCourseDropdownOpen(false)}
              className="fixed inset-0 z-[999]"
            />
            <div className="absolute left-0 right-0 top-full z-[1000] mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-[#E0E3E6] bg-white py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              {courses.length === 0 ? (
                <div className="px-3.5 py-2.5 text-[13px] text-[#9CA3AF]">
                  {t("common.noCoursesFound")}
                </div>
              ) : (
                courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      setCourseDropdownOpen(false);
                    }}
                    className="cursor-pointer px-3.5 py-2.5 text-sm"
                    style={{
                      color: c.id === selectedCourseId ? "#2563EB" : "#0D1017",
                      background: c.id === selectedCourseId ? "#F3F4F6" : "#ffffff",
                      fontWeight: c.id === selectedCourseId ? 600 : 500,
                    }}
                  >
                    {c.name}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Search + Pagination */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80 lg:shrink-0">
          <Search
            size={16}
            color="#636C79"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-4 text-sm text-[#0D1017] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151] sm:gap-1">
          <span className="mr-1 whitespace-nowrap">{t("common.perPage")}</span>
          <div className="mr-3 inline-block">
            <PageLimitDropdown
              value={itemsPerPage}
              onChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
          <PaginationButtons />
        </div>
      </div>

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {studentsLoading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-[#DC2626]">{error}</div>
        ) : !selectedCourseId ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">{t("common.selectCourse")}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">
            {t("table.noStudentsFound")}
          </div>
        ) : (
          filteredStudents.map((s) => (
            <div
              key={s.user.id}
              className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: getAvatarColor(s.user.fullName) }}
                >
                  {s.user.image ? (
                    <img
                      src={`${FILES_BASE_URL}/${s.user.image}`}
                      alt={s.user.fullName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {getInitial(s.user.fullName)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0D1017]">
                    {s.user.fullName}
                  </p>
                  <p className="truncate text-xs text-[#636C79]">{s.user.phone}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#0D1017]">
                  {formatAmount(s.amount)} so&apos;m
                </span>
              </div>
              <div className="mt-3 border-t border-[#F5F5F5] pt-2.5 text-xs text-[#636C79]">
                {t("table.purchasedDate")}: {formatDate(s.purchasedAt)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── sm va undan katta: jadval ko'rinishi ── */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell lg:w-[60px] lg:px-4">
                  {t("table.id")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.student")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] md:table-cell">
                  {t("table.phone")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.price")}
                </th>
                <th className="hidden px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.purchasedDate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {studentsLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="mx-auto size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#DC2626]">
                    {error}
                  </td>
                </tr>
              ) : !selectedCourseId ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#636C79]">
                    {t("common.selectCourse")}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#636C79]">
                    {t("table.noStudentsFound")}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.user.id} className="border-b border-[#E0E3E6]">
                    <td className="hidden border-r border-[#E0E3E6] px-4 py-4 font-medium text-[#0D1017] lg:table-cell">
                      {s.user.id}
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                          style={{ background: getAvatarColor(s.user.fullName) }}
                        >
                          {s.user.image ? (
                            <img
                              src={`${FILES_BASE_URL}/${s.user.image}`}
                              alt={s.user.fullName}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-white">
                              {getInitial(s.user.fullName)}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-[#0D1017]">{s.user.fullName}</span>
                      </div>
                    </td>
                    <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] md:table-cell">
                      {s.user.phone}
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-4 font-semibold text-[#0D1017]">
                      {formatAmount(s.amount)} so&apos;m
                    </td>
                    <td className="hidden px-4 py-4 text-[#636C79] lg:table-cell">
                      {formatDate(s.purchasedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-[#374151]">{t("common.showingPage")} {total > 0 ? (safePage - 1) * itemsPerPage + 1 : 0}-{Math.min(safePage * itemsPerPage, total)} {t("common.of")} {total}</div>
    </div>
  );
}