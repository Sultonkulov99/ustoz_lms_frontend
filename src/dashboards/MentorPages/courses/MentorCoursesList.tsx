


"use client";

import { useEffect, useState } from "react";
import { Search, Eye, SlidersVertical, X, Plus } from "lucide-react";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const FILES_BASE_URL = "/course-banners/public";

type MentorCourse = {
  id: string;
  banner: string;
  name: string;
  about: string;
  level: string;
  price: string;
  category: string;
  status: "Faol" | "Nofaol";
  mentorJob: string;
  purchases: number;
  rates: number;
  sana?: string;
};

function mapCourses(items: any[]): MentorCourse[] {
  return items.map((item: any) => ({
    id: String(item.id),
    banner: item.banner ? `${FILES_BASE_URL}/${item.banner}` : "/images/admin/banner1.png",
    name: item.name || "Nomsiz kurs",
    about: item.about || "",
    level: item.level || "-",
    price: item.price
      ? Number(item.price).toLocaleString("uz-UZ").replace(/,/g, " ")
      : "0",
    category: item.category?.name || "-",
    status: item.published ? "Faol" : "Nofaol",
    mentorJob: item.mentor?.job || "-",
    purchases: item._count?.purchases ?? 0,
    rates: item._count?.rates ?? 0,
    sana: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : undefined,
  }));
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

// ─── Batafsil modal ────────────────────────────────────────────────────────

function CourseDetailModal({
  open,
  onClose,
  course,
}: {
  open: boolean;
  onClose: () => void;
  course: MentorCourse | null;
}) {
  const { t } = useLanguage();
  if (!open || !course) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">
        <div className="mb-4 flex items-center justify-between border-b border-[#F0F1F2] pb-4 sm:mb-5">
          <h2 className="font-inter text-base font-semibold text-[#0D1017] sm:text-lg">
            {t("common.details")}
          </h2>
          <button onClick={onClose} aria-label={t("common.close")} className="p-1">
            <X size={20} color="#636C79" />
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:gap-4">
          <div>
            <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("table.courseName")}</p>
            <p className="font-inter text-[15px] font-semibold text-[#0D1017] sm:text-base">
              {course.name}
            </p>
          </div>

          {/* object-contain: rasm qirqilmasdan, to'liq ko'rinadi */}
          <div className="relative h-[160px] w-full overflow-hidden rounded-xl bg-white sm:h-[220px]">
            <img
              src={course.banner}
              alt={course.name}
              className="h-full w-full object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
              }}
            />
          </div>

          {course.about && (
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("courses.aboutCourse")}</p>
              <p className="font-inter text-sm leading-relaxed text-[#374151]">
                {course.about}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("table.level")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">{course.level}</p>
            </div>
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("table.price")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">
                {course.price}
              </p>
            </div>
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("table.category")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">{course.category}</p>
            </div>
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("table.date")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">
                {course.sana || "—"}
              </p>
            </div>
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("courses.salesCount")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">
                {course.purchases}
              </p>
            </div>
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("courses.ratingsCount")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">{course.rates}</p>
            </div>
            <div>
              <p className="font-inter mb-1.5 text-xs text-[#636C79]">{t("table.status")}</p>
              <p className="font-inter text-sm font-semibold text-[#0D1017]">
                {course.status === "Faol" || course.status === ("ACTIVE" as any) ? t("status.active") : t("status.inactive")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kurs qo'shish modal (admin panelidagi kabi: level va kategoriya YO'Q) ──

function AddCourseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [introVideo, setIntroVideo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setAbout("");
    setPrice("");
    setBanner(null);
    setBannerPreview(null);
    setIntroVideo(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIntroVideo(file);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("about", about.trim());
      formData.append("price", price);
      if (banner) formData.append("banner", banner);
      if (introVideo) formData.append("introVideo", introVideo);

      // mentorId frontend'dan yuborilmaydi — backend uni auth tokendan aniqlaydi
      const response = await apiFetch("/courses/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Kurs yaratishda xatolik yuz berdi.");
      }

      onCreated();
      handleClose();
    } catch (err: any) {
      console.error("Kurs yaratish xatosi:", err);
      setError(err.message || "Kurs yaratishda xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">
        <div className="mb-5 flex items-center justify-between border-b border-[#F0F1F2] pb-4">
          <h2 className="font-inter text-lg font-semibold text-[#0D1017]">Qo&apos;shish</h2>
          <button onClick={handleClose} className="p-1">
            <X size={20} color="#636C79" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Banner va Intro video */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="font-inter mb-1.5 text-sm text-[#0D1017]">Banner</p>
              <label className="flex h-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#D0D5DD] bg-[#FAFBFC] text-center">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="banner preview"
                    className="h-full w-full rounded-xl bg-white object-contain"
                  />
                ) : (
                  <>
                    <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-[#F0F1F2]">
                      <Plus size={16} color="#636C79" />
                    </span>
                    <span className="font-inter px-3 text-xs text-[#636C79]">
                      <span className="text-[#2563EB]">Bu yerga bosing</span> yoki faylni suring
                    </span>
                    <span className="font-inter mt-1 px-3 text-[11px] text-[#9CA3AF]">
                      SVG, PNG, JPG or GIF (max. 800×400px)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/gif"
                  className="hidden"
                  onChange={handleBannerChange}
                />
              </label>
            </div>

            <div>
              <p className="font-inter mb-1.5 text-sm text-[#0D1017]">Intro video</p>
              <label className="flex h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] bg-[#FAFBFC] text-center">
                <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-[#F0F1F2]">
                  <Plus size={16} color="#636C79" />
                </span>
                <span className="font-inter px-3 text-xs text-[#636C79]">
                  <span className="text-[#2563EB]">Bu yerga bosing</span> yoki faylni suring
                </span>
                <span className="font-inter mt-1 px-3 text-[11px] text-[#9CA3AF]">
                  {introVideo ? introVideo.name : ".mp4 fayl kengaytma mumkin (max. 5 Mb)"}
                </span>
                <input
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </label>
            </div>
          </div>

          {/* Kurs nomi */}
          <div>
            <p className="font-inter mb-1.5 text-sm text-[#0D1017]">Kurs nomi</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kiriting"
              className="font-inter h-11 w-full rounded-lg border border-[#E0E3E6] px-3.5 text-sm text-[#0D1017] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* Kurs haqida */}
          <div>
            <p className="font-inter mb-1.5 text-sm text-[#0D1017]">Kurs haqida</p>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Kiriting"
              rows={4}
              className="font-inter w-full resize-none rounded-lg border border-[#E0E3E6] px-3.5 py-2.5 text-sm text-[#0D1017] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* Narxi */}
          <div>
            <p className="font-inter mb-1.5 text-sm text-[#0D1017]">Narxi</p>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00 so'm"
              className="font-inter h-11 w-full rounded-lg border border-[#E0E3E6] px-3.5 text-sm text-[#0D1017] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>

          {error && <p className="text-sm text-[#DC2626]">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="font-inter mt-1 flex h-11 items-center justify-center gap-1.5 rounded-lg bg-[#BC000D] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saqlanmoqda..." : "✓ Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Asosiy komponent ──────────────────────────────────────────────────────

export function MentorCourses({ mentorId }: { mentorId?: string }) {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<MentorCourse[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchVal, setSearchVal] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearchInput(searchVal), 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `/courses/my?offset=${offset}&limit=${itemsPerPage}`;
      if (searchInput.trim()) {
        url += `&search=${encodeURIComponent(searchInput.trim())}`;
      }
      const response = await apiFetch(url);
      if (response.ok) {
        const resData = await response.json();
        setTotalCourses(resData.total ?? 0);
        setCourses(mapCourses(Array.isArray(resData.data) ? resData.data : []));
      } else {
        throw new Error("Kurslarni yuklashda xatolik yuz berdi.");
      }
    } catch (err: any) {
      console.error("Mentor courses fetch error:", err);
      setError(err.message || "Kurslarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchInput]);

  const totalPages = Math.max(1, Math.ceil(totalCourses / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const rangeStart = totalCourses === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCourses);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const detailCourse = courses.find((c) => c.id === detailCourseId) ?? null;

  const handleCourseCreated = () => {
    // Yangi kurs qo'shilgach ro'yxatni birinchi sahifadan qayta yuklaymiz
    setCurrentPage(1);
    fetchCourses();
  };

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151] sm:gap-1.5">
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
            onClick={() => goToPage(page as number)}
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
    <div className="font-sans flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0D1017] sm:text-2xl">{t("sidebar.myCourses")}</h1>
          <p className="mt-1 text-xs text-[#374151] sm:text-sm">
            {t("sidebar.materials")} <span className="mx-1">•</span> {t("sidebar.myCourses")}
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="font-inter flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#BC000D] px-4 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          {t("common.add")}
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80 lg:shrink-0">
          <Search
            size={16}
            color="#636C79"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("common.search")}
            className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-10 text-sm text-[#0D1017] outline-none"
          />
          {searchVal ? (
            <button
              onClick={() => setSearchVal("")}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center"
            >
              <X size={14} color="#9CA3AF" />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
              <SlidersVertical size={16} color="#374151" />
            </span>
          )}
        </div>

        <PaginationControls />
      </div>

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-[#DC2626]">{error}</div>
        ) : courses.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
            {t("common.noData")}
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white">
                  <img
                    src={course.banner}
                    alt="banner"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/mentor/courses/sections?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`}
                    className="font-inter block truncate text-[15px] font-semibold text-[#2563EB]"
                  >
                    {course.name}
                  </Link>
                  <p className="font-inter mt-0.5 text-sm font-bold text-[#0D1017]">
                    {course.price}
                  </p>
                </div>

                <button
                  onClick={() => setDetailCourseId(course.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                  title={t("common.edit")}
                >
                  <Eye size={14} color="#374151" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#F5F5F5] pt-3">
                <span className="font-inter rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                  {course.category}
                </span>
                <span className="font-inter rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
                  {course.level}
                </span>
                <span
                  className="font-inter rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: course.status === "Faol" || course.status === ("ACTIVE" as any) ? "#D1FAE5" : "#FEE2E2",
                    color: course.status === "Faol" || course.status === ("ACTIVE" as any) ? "#065F46" : "#991B1B",
                  }}
                >
                  {course.status === "Faol" || course.status === ("ACTIVE" as any) ? t("status.active") : t("status.inactive")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── sm va undan katta: jadval ko'rinishi ── */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] sm:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                <th className="border-r border-[#E0E3E6] px-2 py-3.5 text-left font-semibold text-[#0D1017] lg:px-4">
                  {t("table.banner")}
                </th>
                <th className="min-w-[160px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:min-w-[220px]">
                  {t("table.courseName")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.price")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-[#0D1017]">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
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
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#9CA3AF]">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-[#E0E3E6]">
                    <td className="border-r border-[#E0E3E6] px-2 py-3 lg:px-4">
                      <div className="relative h-10 w-[72px] overflow-hidden rounded-md bg-white lg:w-[84px]">
                        <img
                          src={course.banner}
                          alt="banner"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
                          }}
                        />
                      </div>
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-4 font-medium">
                      <Link
                        href={`/mentor/courses/sections?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`}
                        className="font-medium text-[#2563EB] hover:underline"
                      >
                        {course.name}
                      </Link>
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017]">
                      {course.price}
                    </td>
                    <td className="border-r border-[#E0E3E6] px-4 py-4">
                      <span
                        className="inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: course.status === "Faol" || course.status === ("ACTIVE" as any) ? "#D1FAE5" : "#FEE2E2",
                          color: course.status === "Faol" || course.status === ("ACTIVE" as any) ? "#065F46" : "#991B1B",
                        }}
                      >
                        {course.status === "Faol" || course.status === ("ACTIVE" as any) ? t("status.active") : t("status.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setDetailCourseId(course.id)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        title={t("common.edit")}
                      >
                        <Eye size={14} color="#374151" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-[#374151]">
        {t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")} {totalCourses}{t("pagination.items")}
      </div>

      <CourseDetailModal open={detailCourseId !== null} onClose={() => setDetailCourseId(null)} course={detailCourse} />
      <AddCourseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleCourseCreated}
      />
    </div>
  );
}