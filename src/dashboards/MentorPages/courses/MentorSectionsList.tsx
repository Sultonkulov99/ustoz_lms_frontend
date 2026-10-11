"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersVertical, X, Plus, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { SuccessModal } from "@/components/modals/success-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Section {
  id: string;
  name: string;
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
  onOpenChange,
  onSubmit,
  mode,
  initialName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  mode: "add" | "edit";
  initialName?: string;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName ?? "");
      setError(false);
      setSaving(false);
    }
  }, [open, initialName]);

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    setSaving(true);
    await onSubmit(name.trim());
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:px-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl bg-card p-5 sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {mode === "edit" ? t("modal.editSection") : t("modal.addSection")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.close")}
            className="text-foreground hover:text-muted-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="sectionName" className="text-sm font-bold text-foreground">
              {t("modal.sectionTitle")}
            </label>
            <input
              id="sectionName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              placeholder={t("common.enterValue")}
              className={`h-11 rounded-lg border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground ${
                error ? "border-destructive focus:border-destructive" : "border-border focus:border-ring"
              }`}
            />
            {error && <p className="text-sm text-destructive">{t("common.requiredField")}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function MentorSectionsList({
  courseId,
  courseName,
}: {
  courseId: string;
  courseName: string;
}) {
  const { t } = useLanguage();
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchVal, setSearchVal] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSections = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/lesson-group/all/${courseId}?offset=0&limit=1000`);
      if (response.ok) {
        const resData = await response.json();
        const list = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        setAllSections(
          list.map((item: any) => ({ id: String(item.id), name: item.name || "Nomsiz bo'lim" }))
        );
      }
    } catch (err) {
      console.error("Mentor sections fetch error:", err);
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

  const handleAddSection = async (name: string) => {
    try {
      const response = await apiFetch("/lesson-group", {
        method: "POST",
        body: JSON.stringify({ name, courseId }),
      });

      if (response.ok) {
        setIsAddOpen(false);
        setCurrentPage(1);
        setSuccessMessage("Muvaffaqiyatli qo'shildi");
        fetchSections();
      } else {
        alert("Bo'lim qo'shishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Add section error:", err);
      alert("Bo'lim qo'shishda xatolik yuz berdi");
    }
  };

  const handleEditSection = async (name: string) => {
    if (!editingSection) return;
    try {
      const response = await apiFetch(`/lesson-group/${editingSection.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          courseId: Number(courseId),
        }),
      });
      if (response.ok) {
        setSuccessMessage(t("modal.editSection"));
        setEditingSection(null);
        fetchSections();
      } else {
        const errData = await response.json();
        alert(errData.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Error editing section:", err);
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingId) return;
    try {
      const response = await apiFetch(`/lesson-group/${deletingId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSuccessMessage(t("modal.confirmDeleteText"));
        setDeletingId(null);
        fetchSections();
      } else {
        const errData = await response.json();
        alert(errData.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Error deleting section:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiFetch(`/course-category/all?offset=0&limit=10000`);
      if (!response.ok) return;
      const resData = await response.json();
      const items: any[] = Array.isArray(resData.data) ? resData.data : [];

      const rows = items.map((item) => ({
        ID: item.id,
        "Kategoriya nomi": item.name,
        Holati: item.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kategoriyalar");
      XLSX.writeFile(workbook, "kurs-kategoriyalari.xlsx");
    } catch (err) {
      console.error("XLS Export error:", err);
    }
  };

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151]">
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
      {getVisiblePages(safePage, totalPages).map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} className="px-1">
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
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("common.sections")}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            <Link href="/mentor/courses" className="hover:text-foreground">
              {t("sidebar.myCourses")}
            </Link>
            <span className="mx-2">•</span>
            <span>{courseName}</span>
            <span className="mx-2">•</span>
            {t("common.sections")}
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          {t("modal.addSection")}
        </Button>
      </div>

      {/* Qidiruv */}
      <div className="mb-5 sm:mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-10 text-sm text-[#0D1017] outline-none"
          />
          {searchVal ? (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center"
              aria-label={t("common.clearSearch")}
            >
              <X className="size-4" />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
              <SlidersVertical size={16} color="#374151" />
            </span>
          )}
        </div>
      </div>

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
          </div>
        ) : paginatedSections.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">
            {searchVal ? `"${searchVal}" ${t("table.noDataFound")}` : t("table.noDataFound")}
          </div>
        ) : (
          paginatedSections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-inter shrink-0 text-xs font-semibold text-[#9CA3AF]">
                  {String((safePage - 1) * itemsPerPage + index + 1)}
                </span>
                <Link
                  href={`/mentor/courses/lessons?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&sectionId=${section.id}&sectionName=${encodeURIComponent(section.name)}`}
                  className="font-inter truncate text-[15px] font-semibold text-[#2563EB]"
                >
                  {section.name}
                </Link>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(section)}
                  className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                  aria-label={t("common.edit")}
                >
                  <Pencil size={14} color="#374151" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(section.id)}
                  className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                  aria-label={t("common.delete")}
                >
                  <Trash2 size={14} color="#DC2626" />
                </button>
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
                <th className="w-[80px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:w-[100px]">
                  {t("table.id")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("modal.sectionTitle")}
                </th>
                <th className="w-[110px] px-4 py-3.5 text-center font-semibold text-[#0D1017] lg:w-[130px]">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center">
                    <div className="mx-auto size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
                  </td>
                </tr>
              ) : paginatedSections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[#636C79]">
                    {searchVal
                      ? `"${searchVal}" ${t("table.noDataFound")}`
                      : t("table.noDataFound")}
                  </td>
                </tr>
              ) : (
                paginatedSections.map((section, index) => (
                  <tr key={section.id} className="border-b border-[#E0E3E6]">
                    <td className="border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017]">
                      {String((safePage - 1) * itemsPerPage + index + 1)}
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-4">
                      <Link
                        href={`/mentor/courses/lessons?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&sectionId=${section.id}&sectionName=${encodeURIComponent(section.name)}`}
                        className="font-medium text-[#2563EB] hover:underline"
                      >
                        {section.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSection(section)}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                          aria-label={t("common.edit")}
                        >
                          <Pencil size={14} color="#374151" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(section.id)}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                          aria-label={t("common.delete")}
                        >
                          <Trash2 size={14} color="#DC2626" />
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

      {/* Pastki panel */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#374151]">
          <span>
            {t("common.showingPage")} {rangeStart}-{rangeEnd} {t("common.of")} {totalCount}
          </span>
          <button
            type="button"
            onClick={handleExport}
            className="font-inter flex items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2.5 py-1.5 text-[13px] text-[#0D1017]"
          >
            <div className="relative flex h-4 w-3.5 items-center justify-center">
              <img src="/images/admin/Page.png" alt="excel" className="h-auto w-full" />
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] font-extrabold leading-none tracking-tighter text-white">
                XLS
              </span>
            </div>
            <span>({totalCount}) {t("common.downloadXls")}</span>
          </button>
        </div>

        <PaginationControls />
      </div>

      <SectionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddSection}
        mode="add"
      />

      <SectionModal
        open={editingSection !== null}
        onOpenChange={(open) => !open && setEditingSection(null)}
        onSubmit={handleEditSection}
        mode="edit"
        initialName={editingSection?.name}
      />

      <DeleteConfirmModal
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDeleteSection}
      />

      <SuccessModal
        open={successMessage !== null}
        onOpenChange={(open) => !open && setSuccessMessage(null)}
        title={successMessage ?? ""}
      />
    </div>
  );
}