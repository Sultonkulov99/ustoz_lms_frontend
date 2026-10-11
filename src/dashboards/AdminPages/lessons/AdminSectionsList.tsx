"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  SlidersVertical,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SuccessModal } from "./SuccessModal";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

export interface SectionLessonItem {
  id: string;
  name: string;
}

export interface CourseSection {
  id: string;
  name: string;
  lessonsCount: number;
  lessons: SectionLessonItem[];
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

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function SectionModal({
  open,
  onClose,
  onSubmit,
  mode,
  initialName = "",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  mode: "add" | "edit";
  initialName?: string;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setError(false);
      setSaving(false);
    }
  }, [open, initialName]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl bg-white p-5 sm:p-7 shadow-xl border border-[#E0E3E6]"
      >
        <div className="flex items-center justify-between border-b border-[#E0E3E6] pb-4">
          <h2 className="text-lg font-bold text-[#0D1017] sm:text-xl font-sans">
            {mode === "edit" ? "Bo'limni tahrirlash" : "Yangi bo'lim qo'shish"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-[#636C79] hover:text-[#0D1017] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="sectionName" className="text-sm font-semibold text-[#0D1017] font-sans">
              Bo&apos;lim nomi
            </label>
            <input
              id="sectionName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Masalan: 1. Kirish va asosiy tushunchalar"
              className={`h-11 rounded-lg border bg-white px-4 text-sm text-[#0D1017] outline-none transition-colors placeholder:text-[#9CA3AF] ${
                error
                  ? "border-[#DC2626] focus:border-[#DC2626]"
                  : "border-[#E0E3E6] focus:border-[#BC000D]"
              }`}
            />
            {error && (
              <p className="text-xs text-[#DC2626] font-medium font-sans">
                {t("common.requiredField")}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-lg border border-[#E0E3E6] bg-white text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-6 rounded-lg bg-[#BC000D] text-sm font-medium text-white hover:bg-[#99000B] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminSectionsList() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("courseId") || "";
  const courseName = searchParams?.get("courseName") || "Kurs";

  const [allSections, setAllSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchVal, setSearchVal] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<CourseSection | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successType, setSuccessType] = useState<"add" | "edit">("add");

  const fetchSections = async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch(
        `/lesson-group/all/${courseId}?offset=0&limit=100&include_lessons=true`
      );
      if (response.ok) {
        const resData = await response.json();
        const list: any[] = Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
          ? resData
          : [];

        const getSectionOrder = (item: any): number => {
          const match = String(item.name || "").match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
        };

        const sorted = [...list].sort((a: any, b: any) => {
          const orderDiff = getSectionOrder(a) - getSectionOrder(b);
          if (orderDiff !== 0) return orderDiff;
          return Number(a.id) - Number(b.id);
        });

        setAllSections(
          sorted.map((item: any) => ({
            id: String(item.id),
            name: item.name || "Nomsiz bo'lim",
            lessonsCount: Array.isArray(item.lessons) ? item.lessons.length : 0,
            lessons: Array.isArray(item.lessons) ? item.lessons : [],
          }))
        );
      }
    } catch (err) {
      console.error("Admin sections fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const filteredSections = useMemo(() => {
    if (!searchVal.trim()) return allSections;
    const q = normalize(searchVal);
    return allSections.filter((s) => normalize(s.name).includes(q));
  }, [allSections, searchVal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal]);

  const totalCount = filteredSections.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedSections = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredSections.slice(start, start + itemsPerPage);
  }, [filteredSections, safePage, itemsPerPage]);

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCount);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Add Section
  const handleAddSection = async (name: string) => {
    try {
      const response = await apiFetch("/lesson-group", {
        method: "POST",
        body: JSON.stringify({ name, courseId }),
      });

      if (response.ok) {
        setIsAddOpen(false);
        setCurrentPage(1);
        setSuccessMessage("Bo'lim muvaffaqiyatli qo'shildi");
        setSuccessType("add");
        setIsSuccessOpen(true);
        fetchSections();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "Bo'lim qo'shishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Add section error:", err);
      alert("Bo'lim qo'shishda xatolik yuz berdi");
    }
  };

  // Edit Section
  const handleEditSection = async (name: string) => {
    if (!editingSection) return;
    try {
      const response = await apiFetch(`/lesson-group/${editingSection.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          courseId: Number(courseId) || courseId,
        }),
      });
      if (response.ok) {
        setSuccessMessage("Bo'lim muvaffaqiyatli o'zgartirildi");
        setSuccessType("edit");
        setIsSuccessOpen(true);
        setEditingSection(null);
        fetchSections();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Error editing section:", err);
      alert("Xatolik yuz berdi");
    }
  };

  // Delete Section
  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      const response = await apiFetch(`/lesson-group/${deletingSection.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSuccessMessage("Bo'lim o'chirildi");
        setSuccessType("edit");
        setIsSuccessOpen(true);
        setDeletingSection(null);
        fetchSections();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Error deleting section:", err);
      alert("Xatolik yuz berdi");
    } finally {
      setDeletingSection(null);
    }
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 font-sans">
      {/* Sarlavha va Breadcrumb */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0D1017] sm:text-2xl m-0">
            {t("courses.sectionsLabel")}
          </h1>
          <p className="mt-1.5 text-xs text-[#636C79] sm:text-sm flex items-center flex-wrap gap-1.5">
            <Link href="/admin/courses" className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors">
              {t("courses.coursesLabel")}
            </Link>
            <span className="text-[#9CA3AF]">•</span>
            <span className="text-[#636C79]">{courseName}</span>
            <span className="text-[#9CA3AF]">•</span>
            <span className="text-[#0D1017] font-semibold">{t("courses.sectionsLabel")}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          style={{
            height: "40px",
            borderRadius: "8px",
            background: "#BC000D",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          className="self-start sm:self-auto hover:bg-[#99000B] transition-colors"
        >
          <Plus size={16} /> Yangi bo&apos;lim qo&apos;shish
        </button>
      </div>

      {/* Qidiruv va sahifalash */}
      <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-10 text-sm text-[#0D1017] outline-none transition-colors focus:border-[#BC000D]"
          />
          {searchVal ? (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-[#636C79] hover:text-[#0D1017]"
              aria-label={t("common.clearSearch")}
            >
              <X className="size-4" />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
              <SlidersVertical size={16} color="#636C79" />
            </span>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151]">
          <span className="mr-1 hidden xs:inline whitespace-nowrap">{t("pagination.perPage")}</span>
          <div className="mr-2 inline-block">
            <PageLimitDropdown
              value={itemsPerPage}
              onChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
          {getVisiblePages(safePage, totalPages).map((page, idx) =>
            page === "..." ? (
              <span key={`e-${idx}`} className="px-1 text-[#9CA3AF]">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(Number(page))}
                className="flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors"
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
            className="ml-1 flex h-8 items-center whitespace-nowrap rounded-md border border-[#E0E3E6] px-3 text-sm font-medium text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors"
          >
            {t("common.next")}
          </button>
        </div>
      </div>

      {/* ── Mobil / planshet: karta ko'rinishi (<768px) ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-7 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#BC000D]" />
          </div>
        ) : paginatedSections.length === 0 ? (
          <div className="rounded-xl border border-[#E0E3E6] bg-white p-8 text-center text-sm text-[#636C79]">
            {searchVal ? `"${searchVal}" bo'yicha hech narsa topilmadi` : "Hozircha bo'limlar yo'q"}
          </div>
        ) : (
          paginatedSections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-xl border border-[#E0E3E6] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="shrink-0 text-xs font-semibold text-[#9CA3AF] mt-0.5">
                    #{String((safePage - 1) * itemsPerPage + index + 1)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/courses/lessons?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&sectionId=${section.id}&sectionName=${encodeURIComponent(section.name)}`}
                      className="block truncate text-sm font-semibold text-[#2563EB] hover:underline"
                    >
                      {section.name}
                    </Link>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#1D4ED8]">
                      <BookOpen size={12} />
                      {section.lessonsCount} ta dars
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#F5F5F5] pt-3">
                <Link
                  href={`/admin/courses/lessons?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&sectionId=${section.id}&sectionName=${encodeURIComponent(section.name)}`}
                  className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white text-[#374151] hover:bg-[#F9FAFB]"
                  title="Darslarni ko'rish"
                >
                  <Eye size={14} />
                </Link>
                <button
                  onClick={() => setEditingSection(section)}
                  className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white text-[#374151] hover:bg-[#F9FAFB]"
                  title={t("common.edit")}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeletingSection(section)}
                  className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white text-[#DC2626] hover:bg-[#FEF2F2]"
                  title={t("common.delete")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Jadval ko'rinishi (≥768px) ── */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
                <th className="w-14 border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  #
                </th>
                <th className="min-w-[260px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  Bo&apos;lim nomi
                </th>
                <th className="w-40 border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  Darslar soni
                </th>
                <th className="w-36 px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="inline-block size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#BC000D]" />
                  </td>
                </tr>
              ) : paginatedSections.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#636C79]">
                    {searchVal ? `"${searchVal}" bo'yicha hech narsa topilmadi` : "Hozircha bo'limlar yo'q"}
                  </td>
                </tr>
              ) : (
                paginatedSections.map((section, index) => (
                  <tr
                    key={section.id}
                    className="border-b border-[#E0E3E6] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="border-r border-[#E0E3E6] px-4 py-3.5 text-[#636C79] font-medium">
                      {(safePage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-3.5">
                      <Link
                        href={`/admin/courses/lessons?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&sectionId=${section.id}&sectionName=${encodeURIComponent(section.name)}`}
                        className="font-medium text-[#2563EB] hover:underline"
                      >
                        {section.name}
                      </Link>
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                        <BookOpen size={12} />
                        {section.lessonsCount} ta dars
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/courses/lessons?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&sectionId=${section.id}&sectionName=${encodeURIComponent(section.name)}`}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                          title="Darslarni ko'rish"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => setEditingSection(section)}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                          title={t("common.edit")}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingSection(section)}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                          title={t("common.delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pastdagi oraliq ma'lumoti */}
      <div className="mt-4 text-xs sm:text-sm text-[#636C79]">
        {t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")}{" "}
        {totalCount} {t("pagination.items")}
      </div>

      {/* Modallar */}
      <SectionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSection}
        mode="add"
      />

      <SectionModal
        open={editingSection !== null}
        onClose={() => setEditingSection(null)}
        onSubmit={handleEditSection}
        mode="edit"
        initialName={editingSection?.name}
      />

      <DeleteConfirmModal
        open={deletingSection !== null}
        onOpenChange={(open) => !open && setDeletingSection(null)}
        onConfirm={handleDeleteSection}
        title={`"${deletingSection?.name}" bo'limini o'chirishni xohlaysizmi?`}
      />

      <SuccessModal
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
        type={successType}
      />
    </div>
  );
}
