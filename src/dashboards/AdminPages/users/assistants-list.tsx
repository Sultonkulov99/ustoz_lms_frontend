"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Pencil, Trash2, Plus, X, SlidersVertical, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import {
  AddAssistantModal,
  type AddAssistantFormData,
} from "@/components/modals/add-assistant-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SuccessModal } from "@/components/modals/success-modal";
import { ViewAssistantModal } from "@/components/modals/view-assistant-modal";
import { type Assistant } from "@/lib/assistants-data";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
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

function mapAssistants(items: any[]): Assistant[] {
  return items.map((item: any) => ({
    id: String(item.id),
    name: item.fullName || "Ism kiritilmagan",
    avatar: item.image ? `/files/public/${item.image}` : null,
    assignedCourse: item.course?.name || "Kiritilmagan",
    courseId: item.course?.id ? String(item.course.id) : "",
    phone: item.phone || "",
    role: "Assistent",
    createdAt: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : "",
    status: (item.status === "ACTIVE" ? "Faol" : "Faol emas") as "Faol" | "Faol emas",
  }));
}

export function AssistantsList() {
  const { t } = useLanguage();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce searchVal into search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
        const response = await apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=ASSISTANT${searchParam}`);
        if (response.ok) {
          const resData = await response.json();
          if (resData && Array.isArray(resData.data)) {
            setAssistants(mapAssistants(resData.data));
            setTotalCount(resData.total || resData.data.length);
          }
        }
      } catch (err) {
        console.error("Assistants fetch error:", err);
      }
    };
    fetchAssistants();
  }, [currentPage, itemsPerPage, search, reloadTrigger]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAssistants = assistants;

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCount);
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const editingAssistant = assistants.find((item) => item.id === editingId) ?? null;
  const viewingAssistant = assistants.find((item) => item.id === viewingId) ?? null;

  const handleClearSearch = () => {
    setSearchVal("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleSave = async (data: AddAssistantFormData) => {
    try {
      if (editingId) {
        const current = assistants.find((item) => item.id === editingId) ?? null;
        if (!current) return;

        const body: any = {};
        if (data.phone !== current.phone) body.phone = data.phone;
        if (data.name !== current.name) body.fullName = data.name;
        if (data.password) body.password = data.password;

        if (Object.keys(body).length === 0) {
          setEditingId(null);
          return;
        }

        const response = await apiFetch(`/users/assistant/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Assistentni yangilashda xatolik yuz berdi.");
        }

        setSuccessMessage("Muvaffaqiyatli yangilandi");
        setReloadTrigger((prev) => prev + 1);
        setEditingId(null);
      } else {
        const response = await apiFetch("/users/create/assistant", {
          method: "POST",
          body: JSON.stringify({
            phone: data.phone,
            fullName: data.name,
            password: data.password || "123456",
            courseId: data.assignedCourse,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Assistent qo'shishda xatolik yuz berdi.");
        }

        setSuccessMessage("Muvaffaqiyatli qo'shildi");
        setReloadTrigger((prev) => prev + 1);
      }
    } catch (err: any) {
      alert(err.message || "Assistent qo'shishda xatolik yuz berdi.");
    }
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const response = await apiFetch(`/users/${deletingId}`, { method: "DELETE" });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Assistentni o'chirishda xatolik yuz berdi.");
      }

      setDeletingId(null);
      setSuccessMessage("Muvaffaqiyatli o'chirildi");
      setReloadTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message || "Assistentni o'chirishda xatolik yuz berdi.");
    }
  };

  const handleExport = async () => {
    const XLSX = await import("xlsx");
    try {
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      let allData: any[] = [];
      let offset = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await apiFetch(`/users?limit=${limit}&offset=${offset}&role=ASSISTANT${searchParam}`);
        if (response.ok) {
          const resData = await response.json();
          if (resData && Array.isArray(resData.data)) {
            allData = [...allData, ...resData.data];
            if (resData.data.length < limit || allData.length >= (resData.total || 0)) {
              hasMore = false;
            } else {
              offset += limit;
            }
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      if (allData.length > 0) {
        const rows = allData.map((item: any) => ({
          ID: String(item.id),
          "F.I.Sh": item.fullName || "Ism kiritilmagan",
          "Biriktirilgan kurs": item.course?.name || "Frontend",
          "Telefon raqami": item.phone || "",
          Rol: "Assistent",
          "Yaratilgan vaqt": item.createdAt ? item.createdAt.slice(0, 19).replace("T", " ") : "",
          Holat: item.status === "ACTIVE" ? "Faol" : "Faol emas",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Assistentlar");
        XLSX.writeFile(workbook, "assistentlar.xlsx");
      }
    } catch (err) {
      console.error("XLS Export error:", err);
    }
  };

  const AssistantAvatar = ({ assistant, className }: { assistant: Assistant; className: string }) => {
    const hasRealAvatar =
      assistant.avatar && typeof assistant.avatar === "string" && !assistant.avatar.includes("mentor-1.png");

    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
        style={{ background: hasRealAvatar ? "#F3F4F6" : getAvatarColor(assistant.name) }}
      >
        {hasRealAvatar ? (
          <img
            loading="lazy"
            src={assistant.avatar as string}
            alt={assistant.name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              const fallback = img.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="avatar-fallback font-inter flex h-full w-full items-center justify-center text-sm font-bold text-white"
          style={{ display: hasRealAvatar ? "none" : "flex" }}
        >
          {hasRealAvatar ? <User className="size-4" /> : getInitial(assistant.name)}
        </div>
      </div>
    );
  };

  const RangeInfo = () => (
    <div className="flex flex-wrap items-center gap-3 text-sm text-[#374151]">
      <span>
        Sahifada {rangeStart}-{rangeEnd} gacha. Umumiy {totalCount}ta
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
        <span className="hidden xs:inline">({totalCount}) Yuklab olish .XLS</span>
      </button>
    </div>
  );

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151]">
      <span className="mr-1 whitespace-nowrap">Bir sahifada:</span>
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
        Keyingi
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Sarlavha */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("users.assistants")}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("users.usersLabel")} <span className="mx-1">•</span> {t("users.assistants")}
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="w-full xs:w-auto">
          <Plus className="size-4" />
          {t("common.add")}
        </Button>
      </div>

      {/* Qidiruv */}
      <div className="mb-5 sm:mb-6">
        <div className="relative w-full xs:max-w-[360px] sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("common.search")}
            className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-10 text-sm text-[#0D1017] outline-none"
          />
          {searchVal ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground hover:text-foreground"
              aria-label={t("common.clearFilter")}
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

      {/* Qidiruv natijasi haqida ma'lumot */}
      {search && (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          &quot;{search}&quot; ({totalCount})
          <button type="button" onClick={handleClearSearch} className="ml-2 text-primary underline hover:no-underline">
            {t("common.clearFilter")}
          </button>
        </p>
      )}

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {paginatedAssistants.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">
            {t("common.noData")}
          </div>
        ) : (
          paginatedAssistants.map((assistant) => (
            <div key={assistant.id} className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AssistantAvatar assistant={assistant} className="size-9 xs:size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0D1017]">{assistant.name}</p>
                  <p className="truncate text-xs text-[#636C79]">{assistant.phone || "—"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingId(assistant.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.details")}
                  >
                    <Eye size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(assistant.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.edit")}
                  >
                    <Pencil size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(assistant.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#F5F5F5] pt-3 xs:gap-2">
                <span className="font-inter truncate rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                  {assistant.assignedCourse}
                </span>
                <span
                  className="font-inter rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: assistant.status === "Faol" ? "#F0FDF4" : "#FEF2F2",
                    color: assistant.status === "Faol" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {assistant.status === "Faol" ? t("status.active") : t("status.inactive")}
                </span>
                <span className="font-inter text-xs text-[#9CA3AF]">{assistant.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── sm va undan katta: jadval ko'rinishi (≥640px) ── */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                <th className="hidden w-20 border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.id")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.fullName")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] md:table-cell">
                  {t("table.courseName")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] md:table-cell">
                  {t("table.phone")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.role")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.createdAt")}
                </th>
                <th className="w-[110px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.status")}
                </th>
                <th className="w-[130px] px-4 py-3.5 text-center font-semibold text-[#0D1017]">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssistants.map((assistant) => (
                <tr key={assistant.id} className="border-b border-[#E0E3E6]">
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017] lg:table-cell">
                    {assistant.id}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <AssistantAvatar assistant={assistant} className="size-8" />
                      <span className="font-medium text-[#0D1017]">{assistant.name}</span>
                    </div>
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] md:table-cell">
                    {assistant.assignedCourse}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] md:table-cell">
                    {assistant.phone}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] lg:table-cell">
                    {assistant.role}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] lg:table-cell">
                    {assistant.createdAt}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <span
                      className="inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: assistant.status === "Faol" ? "#F0FDF4" : "#FEF2F2",
                        color: assistant.status === "Faol" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {assistant.status === "Faol" ? t("status.active") : t("status.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingId(assistant.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label={t("common.details")}
                      >
                        <Eye size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(assistant.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label={t("common.edit")}
                      >
                        <Pencil size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(assistant.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label={t("common.delete")}
                      >
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedAssistants.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#636C79]">
                    {search ? `"${search}" bo'yicha hech narsa topilmadi` : "Ma'lumot topilmadi"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pastki panel */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <RangeInfo />
        <PaginationControls />
      </div>

      <AddAssistantModal
        open={isAddOpen || editingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingId(null);
          }
        }}
        onSave={handleSave}
        mode={editingId ? "edit" : "add"}
        initialData={editingAssistant}
      />

      <DeleteConfirmModal
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
      />

      <ViewAssistantModal
        open={viewingId !== null}
        onOpenChange={(open) => !open && setViewingId(null)}
        assistant={viewingAssistant}
      />

      <SuccessModal
        open={successMessage !== null}
        onOpenChange={(open) => !open && setSuccessMessage(null)}
        title={successMessage ?? ""}
      />
    </div>
  );
}