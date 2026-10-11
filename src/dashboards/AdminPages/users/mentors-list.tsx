"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  SlidersVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { AddMentorModal, type AddMentorFormData } from "@/components/modals/add-mentor-modal";
import { ViewMentorModal } from "@/components/modals/view-mentor-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SuccessModal } from "@/components/modals/success-modal";
import { apiFetch } from "@/lib/api-client";
import { type Mentor } from "@/lib/mentors-data";
import Link from "next/link";
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

export function MentorsList() {
  const { t } = useLanguage();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [viewingMentorId, setViewingMentorId] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Muvaffaqiyatli qo'shildi");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchVal, setSearchVal] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchInput(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const searchParam = searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : "";
        const response = await apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=MENTOR${searchParam}`);
        if (response.ok) {
          const resData = await response.json();
          if (resData && Array.isArray(resData.data)) {
            const mapped = resData.data.map((item: any) => ({
              id: String(item.id),
              name: item.fullName || "Ism kiritilmagan",
              avatar: item.image ? `/files/public/${item.image}` : null,
              phone: item.phone || "",
              createdAt: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : "",
              role: "Mentor",
              password: item.password || "•••••••",
              status: (item.status === "ACTIVE" ? "Faol" : "Faol emas") as "Faol" | "Faol emas",
              experience: String(item.experience || "0"),
              profession: item.job || "O'qituvchi",
              website: item.website || "",
              bio: item.about || "",
              courses: Array.isArray(item.courses) ? item.courses.map((c: any) => c.name) : [],
              socials: {
                facebook: item.facebook || "",
                telegram: item.telegram || "",
                instagram: item.instagram || "",
                linkedin: item.linkedin || "",
                github: item.github || "",
              }
            }));

            // Eng yangi qo'shilgan/yaratilgan mentor ro'yxatning ENG
            // YUQORISIDA chiqishi uchun createdAt bo'yicha kamayish
            // tartibida saralaymiz (backend qaysi tartibda qaytarishidan
            // qat'i nazar, frontend'da har doim shu tartib ta'minlanadi).
            const sorted = [...mapped].sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt)
            );

            setMentors(sorted);
            setTotalCount(resData.total || resData.data.length);
          }
        }
      } catch (err) {
        console.error("Mentors fetch error:", err);
      }
    };
    fetchMentors();
  }, [currentPage, itemsPerPage, searchInput, reloadTrigger]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMentors = mentors;
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCount);

  const handleClearSearch = () => {
    setSearchVal("");
    setSearchInput("");
    setCurrentPage(1);
  };

  // ---------------------------------------------------------------------
  // MUHIM: bu funksiya endi xatoni `alert()` bilan ko'rsatmaydi — uni
  // qayta `throw` qiladi, shunda AddMentorModal o'zining ichki
  // try/catch'ida ushlab, o'zbek tiliga tarjima qilib, MODAL ICHIDA
  // ko'rsatadi (modal yopilmaydi, kiritilgan ma'lumotlar saqlanib qoladi).
  // ---------------------------------------------------------------------
  const handleAddMentor = async (data: AddMentorFormData) => {
    const payload: any = {
      phone: data.phone,
      fullName: data.fullName,
      password: data.password,
    };

    if (data.experience) payload.experience = Number(data.experience);
    if (data.profession) payload.job = data.profession;
    if (data.bio) payload.about = data.bio;
    if (data.telegram?.trim()) payload.telegram = data.telegram.trim();
    if (data.facebook?.trim()) payload.facebook = data.facebook.trim();
    if (data.instagram?.trim()) payload.instagram = data.instagram.trim();
    if (data.linkedin?.trim()) payload.linkedin = data.linkedin.trim();
    if (data.github?.trim()) payload.github = data.github.trim();
    if (data.website?.trim()) payload.website = data.website.trim();

    const response = await apiFetch("/users/create/mentor", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      // Xato shu yerda "yaratiladi" va yuqoriga (AddMentorModal'ga) uzatiladi.
      // AddMentorModal buni o'zi ushlab, o'zbekchaga tarjima qilib ko'rsatadi.
      throw new Error(errData.message || "Mentorni qo'shishda xatolik yuz berdi.");
    }

    setSuccessMessage("Muvaffaqiyatli qo'shildi");
    setIsSuccessModalOpen(true);
    // Yangi mentor har doim 1-sahifada (eng yuqorida) ko'rinishi uchun
    // sahifani boshiga qaytaramiz — yuqoridagi createdAt saralash bilan
    // birga u ro'yxatning eng tepasida chiqadi.
    setCurrentPage(1);
    setReloadTrigger((prev) => prev + 1);
  };

  const editingMentor = mentors.find((mentor) => mentor.id === editingMentorId) ?? null;

  const [viewingMentorData, setViewingMentorData] = useState<any>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  useEffect(() => {
    if (!viewingMentorId) {
      setViewingMentorData(null);
      return;
    }

    const fetchDetailedMentor = async () => {
      setIsViewLoading(true);
      try {
        const response = await apiFetch(`/users/mentor/${viewingMentorId}`);
        if (response.ok) {
          const detailed = await response.json();
          setViewingMentorData({
            name: detailed.fullName || "Ism kiritilmagan",
            avatar: detailed.image ? `/files/public/${detailed.image}` : null,
            profession: detailed.mentorProfile?.job || "Mentor",
            phone: detailed.phone || "—",
            role: detailed.role === "MENTOR" ? "Mentor" : "Foydalanuvchi",
            createdAt: detailed.createdAt ? detailed.createdAt.replace("T", " ").substring(0, 19) : "—",
            experience: detailed.mentorProfile?.experience ? String(detailed.mentorProfile.experience) : "0",
            courses: Array.isArray(detailed.courses) ? detailed.courses.map((c: any) => c.name) : [],
            website: detailed.mentorProfile?.website || "",
            about: detailed.mentorProfile?.about || "",
            socials: {
              facebook: detailed.mentorProfile?.facebook || "",
              telegram: detailed.mentorProfile?.telegram || "",
              instagram: detailed.mentorProfile?.instagram || "",
              linkedin: detailed.mentorProfile?.linkedin || "",
              github: detailed.mentorProfile?.github || "",
            }
          });
        }
      } catch (err) {
        console.error("Error fetching detailed mentor:", err);
      } finally {
        setIsViewLoading(false);
      }
    };

    fetchDetailedMentor();
  }, [viewingMentorId]);

  const editingMentorFormData: Partial<AddMentorFormData> | undefined = editingMentor
    ? {
        fullName: editingMentor.name,
        phone: editingMentor.phone,
        password: "",
        experience: editingMentor.experience ?? "",
        profession: editingMentor.profession ?? "",
        website: editingMentor.website ?? "",
        bio: editingMentor.bio ?? "",
        facebook: editingMentor.socials?.facebook ?? "",
        telegram: editingMentor.socials?.telegram ?? "",
        linkedin: editingMentor.socials?.linkedin ?? "",
        instagram: editingMentor.socials?.instagram ?? "",
        github: editingMentor.socials?.github ?? "",
      }
    : undefined;

  // handleAddMentor bilan bir xil mantiq: alert() yo'q, xato throw qilinadi,
  // AddMentorModal (mode="edit") uni ushlab o'zbekcha ko'rsatadi.
  const handleEditMentor = async (data: AddMentorFormData) => {
    if (!editingMentorId) return;

    const payload: any = {
      phone: data.phone,
      fullName: data.fullName,
    };

    if (data.password && data.password !== "•••••••" && data.password.trim() !== "") {
      payload.password = data.password;
    }
    if (data.experience) payload.experience = Number(data.experience);
    if (data.profession) payload.job = data.profession;
    if (data.bio) payload.about = data.bio;
    if (data.telegram?.trim()) payload.telegram = data.telegram.trim();
    if (data.facebook?.trim()) payload.facebook = data.facebook.trim();
    if (data.instagram?.trim()) payload.instagram = data.instagram.trim();
    if (data.linkedin?.trim()) payload.linkedin = data.linkedin.trim();
    if (data.github?.trim()) payload.github = data.github.trim();
    if (data.website?.trim()) payload.website = data.website.trim();

    const response = await apiFetch(`/users/mentor/${editingMentorId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Mentorni yangilashda xatolik yuz berdi.");
    }

    setEditingMentorId(null);
    setSuccessMessage("Muvaffaqiyatli yangilandi");
    setIsSuccessModalOpen(true);
    setReloadTrigger((prev) => prev + 1);
  };

  // Diqqat: DeleteConfirmModal alohida komponent bo'lgani va uni ko'rmaganim
  // uchun bu yerda hozircha xavfsizlik maqsadida `alert()` saqlab qolindi.
  // Agar DeleteConfirmModal faylini yuborsangiz, buni ham xuddi shunday
  // (modal ichida, o'zbekcha) ko'rsatiladigan qilib beraman.
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await apiFetch(`/users/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Mentorni o'chirishda xatolik yuz berdi.");
      }

      setDeleteTargetId(null);
      setSuccessMessage("Muvaffaqiyatli o'chirildi");
      setIsSuccessModalOpen(true);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message || "Mentorni o'chirishda xatolik yuz berdi.");
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
        const response = await apiFetch(`/users?limit=${limit}&offset=${offset}&role=MENTOR${searchParam}`);
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
        const rows = allData.map((mentor: any) => ({
          ID: String(mentor.id),
          "F.I.Sh": mentor.fullName || "Ism kiritilmagan",
          "Telefon raqam": mentor.phone || "",
          "Yaratilgan vaqt": mentor.createdAt ? mentor.createdAt.slice(0, 19).replace("T", " ") : "",
          Rol: "Mentor",
          Holati: mentor.status === "ACTIVE" ? "Faol" : "Faol emas",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mentorlar");
        XLSX.writeFile(workbook, "mentorlar.xlsx");
      }
    } catch (err) {
      console.error("XLS Export error:", err);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

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
          <span key={`e-${idx}`} className="px-1">...</span>
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

  const RangeInfo = () => (
    <div className="flex flex-wrap items-center gap-3 text-sm text-[#374151]">
      <span>
        {t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")} {totalCount}{t("pagination.items")}
      </span>
      <button
        onClick={handleExportXls}
        className="font-inter flex items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2.5 py-1.5 text-[13px] text-[#0D1017]"
      >
        <div className="relative flex h-4 w-3.5 items-center justify-center">
          <img src="/images/admin/Page.png" alt="excel" className="h-auto w-full" />
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] font-extrabold leading-none tracking-tighter text-white">
            XLS
          </span>
        </div>
        <span>({totalCount}) {t("pagination.downloadXls")}</span>
      </button>
    </div>
  );

  const MentorAvatar = ({ mentor, size }: { mentor: Mentor; size: number }) => (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size, background: getAvatarColor(mentor.name) }}
    >
      {mentor.avatar && !mentor.avatar.includes("mentor-1.png") ? (
        <img
          loading="lazy"
          src={mentor.avatar}
          alt={mentor.name}
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
        className="avatar-fallback font-inter flex h-full w-full items-center justify-center font-bold text-white"
        style={{
          display: mentor.avatar && !mentor.avatar.includes("mentor-1.png") ? "none" : "flex",
          fontSize: size * 0.42,
        }}
      >
        {getInitial(mentor.name)}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Sarlavha va breadcrumb */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("users.mentors")}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("users.usersLabel")} <span className="mx-1">•</span> {t("users.mentors")}
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          {t("common.add")}
        </Button>
      </div>

      {/* Qidiruv */}
      <div className="mb-5 sm:mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
            }}
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
      {searchInput && (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          &quot;{searchInput}&quot; ({totalCount})
          <button
            type="button"
            onClick={handleClearSearch}
            className="ml-2 text-primary underline hover:no-underline"
          >
            {t("common.clearFilter")}
          </button>
        </p>
      )}

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {paginatedMentors.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">
            {t("common.noData")}
          </div>
        ) : (
          paginatedMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <MentorAvatar mentor={mentor} size={36} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[#0D1017]">
                    {mentor.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#636C79]">{mentor.phone}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingMentorId(mentor.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.details")}
                  >
                    <Eye size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMentorId(mentor.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.edit")}
                  >
                    <Pencil size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(mentor.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#F5F5F5] pt-3">
                <span className="font-inter rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                  {t("role.mentor")}
                </span>
                <span
                  className="font-inter rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: mentor.status === "Faol" ? "#F0FDF4" : "#FEF2F2",
                    color: mentor.status === "Faol" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {mentor.status === "Faol" ? t("status.active") : t("status.inactive")}
                </span>
                <span className="font-inter text-xs text-[#9CA3AF]">{mentor.createdAt}</span>
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
                <th className="hidden w-[80px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.id")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.fullName")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] md:table-cell">
                  {t("table.phone")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.createdAt")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.role")}
                </th>
                <th className="w-[100px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.status")}
                </th>
                <th className="w-[120px] px-4 py-3.5 text-center font-semibold text-[#0D1017]">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedMentors.map((mentor) => (
                <tr key={mentor.id} className="border-b border-[#E0E3E6]">
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017] lg:table-cell">
                    {mentor.id}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <Link
                      href={`/admin/users/mentors/${mentor.id}/courses`}
                      className="flex items-center gap-3 no-underline hover:underline"
                    >
                      <MentorAvatar mentor={mentor} size={32} />
                      <span className="font-medium text-[#2563EB]">{mentor.name}</span>
                    </Link>
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] md:table-cell">
                    {mentor.phone}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] lg:table-cell">
                    {mentor.createdAt}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4 text-[#636C79]">
                    {mentor.role}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <span
                      className="inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: mentor.status === "Faol" ? "#F0FDF4" : "#FEF2F2",
                        color: mentor.status === "Faol" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {mentor.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingMentorId(mentor.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label="Profilni ko'rish"
                      >
                        <Eye size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMentorId(mentor.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label="Tahrirlash"
                      >
                        <Pencil size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(mentor.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label="O'chirish"
                      >
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedMentors.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#636C79]">
                    {searchInput
                      ? `"${searchInput}" bo'yicha hech narsa topilmadi`
                      : "Ma'lumot topilmadi"}
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

      <AddMentorModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddMentor}
      />

      <ViewMentorModal
        open={viewingMentorId !== null}
        onOpenChange={(open) => !open && setViewingMentorId(null)}
        mentor={viewingMentorData}
        loading={isViewLoading}
        onEdit={() => {
          if (viewingMentorId) {
            setEditingMentorId(viewingMentorId);
            setViewingMentorId(null);
          }
        }}
      />

      <AddMentorModal
        open={editingMentorId !== null}
        onOpenChange={(open) => !open && setEditingMentorId(null)}
        onSubmit={handleEditMentor}
        mode="edit"
        initialData={editingMentorFormData}
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
    </div>
  );
}