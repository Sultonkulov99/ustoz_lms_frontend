"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Pencil, Trash2, X, SlidersVertical, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { AddStudentModal, type AddStudentFormData } from "@/components/modals/add-student-modal";
import { ViewStudentModal } from "@/components/modals/view-student-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SuccessModal } from "@/components/modals/success-modal";
import { ErrorAlertModal } from "@/components/modals/error-alert-modal";
import { type Student } from "@/lib/students-data";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

// Sahifa raqamlarini "1 2 3 ... 15" ko'rinishida hosil qiladi
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

function resolveAvatarSrc(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http") || avatar.startsWith("/")) return avatar;
  return `/files/public/${avatar}`;
}

function mapStudents(items: any[]): Student[] {
  return items.map((item: any) => ({
    id: String(item.id),
    name: item.fullName || "Ism kiritilmagan",
    avatar: item.image || null,
    phone: item.phone || "",
    createdAt: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : "",
    role: "Student",
    status: (item.status === "ACTIVE" ? "Faol" : "Faol emas") as "Faol" | "Faol emas",
  }));
}

export function StudentsList() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Muvaffaqiyatli qo'shildi");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounce searchVal into searchInput
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchInput(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const fetchStudents = async () => {
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const searchParam = searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : "";
      const response = await apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=STUDENT${searchParam}`);
      if (response.ok) {
        const resData = await response.json();
        if (resData && Array.isArray(resData.data)) {
          setStudents(mapStudents(resData.data));
          setTotalCount(resData.total || resData.data.length);
        }
      }
    } catch (err) {
      console.error("Students fetch error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage, searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = students;

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCount);

  const handleClearSearch = () => {
    setSearchVal("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const editingStudent = students.find((student) => student.id === editingStudentId) ?? null;
  const viewingStudent = students.find((student) => student.id === viewingStudentId) ?? null;

  const editingStudentFormData: Partial<AddStudentFormData> | undefined = editingStudent
    ? { fullName: editingStudent.name, phone: editingStudent.phone }
    : undefined;

  const handleAddStudent = async (data: AddStudentFormData) => {
    try {
      const response = await apiFetch("/users/create/student", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "O'quvchi qo'shishda xatolik yuz berdi.");
      }

      setSuccessMessage("Muvaffaqiyatli qo'shildi");
      setIsSuccessModalOpen(true);
      fetchStudents();
      setIsAddModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "O'quvchi qo'shishda xatolik yuz berdi.");
      setIsErrorModalOpen(true);
    }
  };
  const handleEditStudent = async (data: AddStudentFormData) => {
    if (!editingStudentId || !editingStudent) return;
    try {
      const body: any = {};
      if (data.phone !== editingStudent.phone) body.phone = data.phone;
      if (data.fullName !== editingStudent.name) body.fullName = data.fullName;
      if (data.password) body.password = data.password;

      if (Object.keys(body).length === 0) {
        setEditingStudentId(null);
        return;
      }

      const response = await apiFetch(`/users/student/${editingStudentId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Talabani yangilashda xatolik yuz berdi.");
      }

      setSuccessMessage("Muvaffaqiyatli yangilandi");
      setIsSuccessModalOpen(true);
      fetchStudents();
      setEditingStudentId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Talabani yangilashda xatolik yuz berdi.");
      setIsErrorModalOpen(true);
    }
  };

  // ---------------------------------------------------------------------
  // Talabani o'chirish: backend'dan kelgan xabar endi o'qib tekshiriladi.
  // Agar talaba kurs sotib olgani sababli o'chirib bo'lmasa (backend
  // "User has purchased courses..." deb qaytaradi), foydalanuvchiga
  // aynan shu holat uchun tushunarli o'zbekcha xabar ko'rsatiladi.
  // Boshqa turdagi xatolar uchun umumiy xabar qolaveradi.
  // ---------------------------------------------------------------------
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await apiFetch(`/users/${deleteTargetId}`, { method: "DELETE" });

      if (response.ok) {
        setDeleteTargetId(null);
        setSuccessMessage("Muvaffaqiyatli o'chirildi");
        setIsSuccessModalOpen(true);
        fetchStudents();
        return;
      }

      // Xato bo'lsa — backend javobini o'qib, sababini aniqlaymiz
      let backendMessage = "";
      try {
        const errData = await response.json();
        backendMessage = Array.isArray(errData?.message)
          ? errData.message.join(" ")
          : errData?.message || "";
      } catch {
        // Javob JSON bo'lmasa, bo'sh qoldiramiz — pastda umumiy xabar chiqadi
      }

      if (
        backendMessage.toLowerCase().includes("purchased courses") ||
        backendMessage.includes("sotib olingan kurslar")
      ) {
        setErrorMessage("Talaba kurs sotib olgan, talabani o'chirolmaysiz!");
      } else {
        setErrorMessage("O'quvchini o'chirishda xatolik yuz berdi.");
      }
      setIsErrorModalOpen(true);
    } catch (err) {
      console.error("Error deleting student:", err);
      setErrorMessage("Tizimda xatolik yuz berdi");
      setIsErrorModalOpen(true);
    }
  };

  const handleExportXls = async () => {
    const XLSX = await import("xlsx");
    try {
      const searchParam = searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : "";
      let allData: any[] = [];
      let offset = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await apiFetch(`/users?limit=${limit}&offset=${offset}&role=STUDENT${searchParam}`);
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
        const rows = allData.map((student: any) => ({
          ID: String(student.id),
          "F.I.Sh": student.fullName || "Ism kiritilmagan",
          "Telefon raqami": student.phone || "",
          Rol: "Student",
          "Yaratilgan vaqt": student.createdAt ? student.createdAt.slice(0, 19).replace("T", " ") : "",
          Holat: student.status === "ACTIVE" ? "Faol" : "Faol emas",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar");
        XLSX.writeFile(workbook, "oquvchilar.xlsx");
      }
    } catch (err) {
      console.error("XLS Export error:", err);
    }
  };

  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const StudentAvatar = ({ student, className }: { student: Student; className: string }) => {
    const src = resolveAvatarSrc(student.avatar as string | null);

    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
        style={{ background: src ? "#F3F4F6" : getAvatarColor(student.name) }}
      >
        {src ? (
          <img
            loading="lazy"
            src={src}
            alt={student.name}
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
          style={{ display: src ? "none" : "flex" }}
        >
          {src ? <User className="size-4" /> : getInitial(student.name)}
        </div>
      </div>
    );
  };

  const RangeInfo = () => (
    <div className="flex flex-wrap items-center gap-3 text-sm text-[#374151]">
      <span>
        {t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")} {totalCount}{t("pagination.items")}
      </span>
      <button
        type="button"
        onClick={handleExportXls}
        className="font-inter flex items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2.5 py-1.5 text-[13px] text-[#0D1017]"
      >
        <div className="relative flex h-4 w-3.5 items-center justify-center">
          <img src="/images/admin/Page.png" alt="excel" className="h-auto w-full" />
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] font-extrabold leading-none tracking-tighter text-white">
            XLS
          </span>
        </div>
        <span className="hidden xs:inline">({totalCount}) {t("pagination.downloadXls")}</span>
      </button>
    </div>
  );

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151]">
      <span className="mr-1 whitespace-nowrap">{t("pagination.perPage")}</span>
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
        {t("pagination.next")}
      </button>
    </div>
  );
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Sarlavha */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("users.students")}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("users.usersLabel")} <span className="mx-1">•</span> {t("users.students")}
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="self-end sm:self-auto">
          <Plus className="size-4" />
          {t("common.add")}
        </Button>
      </div>

      {/* Qidiruv */}
      <div className="mb-5 sm:mb-6">
        <div className="relative w-full xs:max-w-[360px] sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
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

      {searchInput && (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          &quot;{searchInput}&quot; ({totalCount})
          <button type="button" onClick={handleClearSearch} className="text-primary underline hover:no-underline ml-2">
            {t("common.clearFilter")}
          </button>
        </p>
      )}

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {paginatedStudents.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">
            {t("common.noData")}
          </div>
        ) : (
          paginatedStudents.map((student) => (
            <div key={student.id} className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <StudentAvatar student={student} className="size-9 xs:size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0D1017]">{student.name}</p>
                  <p className="truncate text-xs text-[#636C79]">{student.phone}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingStudentId(student.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.details")}
                  >
                    <Eye size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStudentId(student.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.edit")}
                  >
                    <Pencil size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(student.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#F5F5F5] pt-3 xs:gap-2">
                <span className="font-inter rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                  {t("role.student")}
                </span>
                <span
                  className="font-inter rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: student.status === "Faol" ? "#F0FDF4" : "#FEF2F2",
                    color: student.status === "Faol" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {student.status === "Faol" ? t("status.active") : t("status.inactive")}
                </span>
                <span className="font-inter text-xs text-[#9CA3AF]">{student.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── sm va undan katta: jadval ko'rinishi ── */}
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
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="border-b border-[#E0E3E6]">
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017] lg:table-cell">
                    {student.id}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={student} className="size-8" />
                      <span className="font-medium text-[#0D1017]">{student.name}</span>
                    </div>
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] md:table-cell">
                    {student.phone}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] lg:table-cell">
                    {student.role}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] lg:table-cell">
                    {student.createdAt}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <span
                      className="inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: student.status === "Faol" ? "#F0FDF4" : "#FEF2F2",
                        color: student.status === "Faol" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {student.status === "Faol" ? t("status.active") : t("status.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingStudentId(student.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label={t("common.details")}
                      >
                        <Eye size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingStudentId(student.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label={t("common.edit")}
                      >
                        <Pencil size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(student.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label={t("common.delete")}
                      >
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#636C79]">
                    {searchInput ? `"${searchInput}" bo'yicha hech narsa topilmadi` : "Ma'lumot topilmadi"}
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

      <AddStudentModal
        open={isAddModalOpen || editingStudentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingStudentId(null);
          }
        }}
        onSubmit={editingStudentId ? handleEditStudent : handleAddStudent}
        mode={editingStudentId ? "edit" : "add"}
        initialData={editingStudentId ? editingStudentFormData : undefined}
      />

      <ViewStudentModal
        open={viewingStudentId !== null}
        onOpenChange={(open) => !open && setViewingStudentId(null)}
        student={viewingStudent}
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        title={successMessage}
      />

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ErrorAlertModal
        open={isErrorModalOpen}
        onOpenChange={setIsErrorModalOpen}
        message={errorMessage}
      />
    </div>
  );
}