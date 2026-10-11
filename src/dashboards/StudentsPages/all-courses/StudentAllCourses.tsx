"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, X, Send } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
};

type Course = {
  id: string;
  title: string;
  bannerUrl: string | null;
  categoryId: string | null;
  category: string;
  level: string;
  instructor: string;
  mentorImageUrl: string | null;
  description: string;
  price: string;
};

// ─── Config ──────────────────────────────────────────────────────────────────

const FILES_BASE_URL = "/files/public";
const TELEGRAM_ADMIN_LINK = "https://t.me/Sultonqulov99";
const ITEMS_PER_PAGE = 9;

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #C4B5FD 100%)",
  "linear-gradient(135deg, #7C2D12 0%, #EA580C 50%, #FDBA74 100%)",
  "linear-gradient(135deg, #164E63 0%, #0891B2 50%, #67E8F9 100%)",
  "linear-gradient(135deg, #831843 0%, #DB2777 50%, #F9A8D4 100%)",
  "linear-gradient(135deg, #14532D 0%, #16A34A 50%, #86EFAC 100%)",
];

function pickGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

function formatPrice(price: string) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return num.toLocaleString("uz-UZ").replace(/,/g, " ");
}

function isValidImage(img: any): boolean {
  if (!img || typeof img !== "string") return false;
  const trimmed = img.trim();
  return (
    trimmed.length > 0 &&
    trimmed !== "null" &&
    trimmed !== "undefined" &&
    trimmed !== "none"
  );
}

function mapCourses(items: any[]): Course[] {
  return items
    .filter((item: any) => isValidImage(item?.banner))
    .map((item: any) => ({
      id: String(item.id),
      title: item.name || "Nomsiz kurs",
      bannerUrl: `${FILES_BASE_URL}/${item.banner.trim()}`,
      categoryId: item.category?.id ? String(item.category.id) : null,
      category: item.category?.name || "",
      level: item.level || "",
      instructor: item.mentor?.fullName?.trim() || "Noma'lum",
      mentorImageUrl: isValidImage(item.mentor?.image)
        ? `${FILES_BASE_URL}/${item.mentor.image.trim()}`
        : null,
      description: item.about || "",
      price: item.price || "0",
    }));
}

// ─── Star rating ─────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = value >= i + 1;
        const half = !filled && value > i && value < i + 1;
        return (
          <div key={i} className="relative size-4">
            <Star className="absolute inset-0 size-4 text-[#E0E3E6]" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : half ? "50%" : "0%" }}
            >
              <Star className="size-4 fill-[#F5A623] text-[#F5A623]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sotib olish modali — Telegram admin bilan bog'lanishga yo'naltiradi ──────

function PurchaseModal({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) {
  if (!course) return null;

  const handleGoToTelegram = () => {
    window.open(TELEGRAM_ADMIN_LINK, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">
        <div className="mb-2 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#636C79] transition-colors hover:bg-[#F0F1F2]"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#EAF6FF]">
          <Send size={26} color="#229ED9" />
        </div>

        <h2 className="font-inter mb-2 text-lg font-bold text-[#0D1017]">
          {course.title}
        </h2>

        <p className="font-inter mb-6 text-sm leading-relaxed text-[#636C79]">
          Kursni sotib olish uchun Telegram orqali admin bilan bog&apos;laning
        </p>

        <button
          onClick={handleGoToTelegram}
          className="font-inter flex w-full items-center justify-center gap-2 rounded-lg bg-[#229ED9] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Send size={16} />
          Telegram orqali bog&apos;lanish
        </button>
      </div>
    </div>
  );
}

// ─── Asosiy komponent ──────────────────────────────────────────────────────

export function StudentAllCourses() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [rawCourses, setRawCourses] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [purchaseCourse, setPurchaseCourse] = useState<Course | null>(null);

  // Kategoriyalarni yuklash
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch(`/course-category/all?offset=0&limit=100`);
        if (response.ok) {
          const resData = await response.json();
          if (resData && Array.isArray(resData.data)) {
            setCategories(
              resData.data.map((item: any) => ({
                id: String(item.id),
                name: item.name || "Nomsiz kategoriya",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    };
    fetchCategories();
  }, []);

  // Barcha kurslarni yuklash — umumiy kurslar katalogi endpointidan
  // (Catalog.tsx'dagi kabi), talaba sotib olgan kurslar ro'yxatidan emas.
  useEffect(() => {
    let cancelled = false;
    const fetchAllCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/courses?offset=0&limit=1000`);
        if (response.ok) {
          const resData = await response.json();
          if (!cancelled && resData && Array.isArray(resData.data)) {
            setRawCourses(resData.data);
          }
        } else {
          throw new Error("Kurslarni yuklashda xatolik yuz berdi.");
        }
      } catch (err: any) {
        console.error("Courses fetch error:", err);
        if (!cancelled) setError(err.message || "Kurslarni yuklashda xatolik yuz berdi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAllCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  // Kategoriya + qidiruv bo'yicha filtrlash (frontendda, Catalog.tsx'dagi kabi)
  const filteredRawCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawCourses.filter((item: any) => {
      if (!item.published) return false;
      // Backenddan rasm (banner) kelmasa, kurs kartasi chiqmaydi
      if (!isValidImage(item.banner)) return false;
      if (selectedCategoryId && String(item.category?.id) !== String(selectedCategoryId)) {
        return false;
      }
      if (q && !String(item.name || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rawCourses, selectedCategoryId, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery]);

  const totalCount = filteredRawCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const courses = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return mapCourses(filteredRawCourses.slice(start, start + ITEMS_PER_PAGE));
  }, [filteredRawCourses, safePage]);

  // Har bir sahifadagi kurslar uchun reytinglarni yuklash
  useEffect(() => {
    if (courses.length === 0) return;
    let cancelled = false;

    const fetchRatings = async () => {
      const entries = await Promise.all(
        courses.map(async (course) => {
          try {
            const res = await apiFetch(`/course-rating/list/${course.id}?offset=0&limit=100`);
            if (!res.ok) return [course.id, null] as const;
            const resData = await res.json();
            const items: any[] = Array.isArray(resData.data) ? resData.data : [];
            if (items.length === 0) return [course.id, null] as const;

            const values = items
              .map((item: any) => Number(item.rating ?? item.score ?? item.value))
              .filter((v: number) => !Number.isNaN(v));

            if (values.length === 0) return [course.id, null] as const;

            const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
            return [course.id, avg] as const;
          } catch {
            return [course.id, null] as const;
          }
        })
      );

      if (!cancelled) {
        setRatings((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    };

    fetchRatings();
    return () => {
      cancelled = true;
    };
  }, [courses]);

  // "Sotib olish" bosilganda: darhol Telegram modalini ochamiz (asosiy UX
  // shu — talaba admin bilan bog'lanishi kerak), shu bilan bir vaqtda
  // backendda PENDING holatida to'lov yozuvini yaratamiz, shunda bu
  // "Payments" jadvalida (admin panelda) darhol ko'rinadi. Agar talaba
  // bu kursni allaqachon bosgan bo'lsa (yoki sotib olgan bo'lsa), backend
  // 400 qaytaradi — buni jim e'tiborsiz qoldiramiz, chunki yozuv
  // allaqachon mavjud.
  const handlePurchaseClick = async (course: Course) => {
    setPurchaseCourse(course);
    try {
      const res = await apiFetch("/purchased-courses/purchase", {
        method: "POST",
        body: JSON.stringify({ courseId: course.id }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.warn("Purchase (pending) create warning:", res.status, errBody);
      }
    } catch (err) {
      console.error("Purchase request error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-inter text-xl font-bold text-[#0D1017] sm:text-2xl">
          Barcha kurslar
        </h1>
        <p className="font-inter mt-1 text-xs text-[#636C79] sm:text-sm">
          Kurslar <span className="mx-1">•</span> Barcha kurslar
        </p>
      </div>

      {/* Kategoriya filtri */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className="font-inter rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: selectedCategoryId === null ? "#BC000D" : "#ffffff",
            color: selectedCategoryId === null ? "#ffffff" : "#374151",
            border: "1px solid",
            borderColor: selectedCategoryId === null ? "#BC000D" : "#E0E3E6",
          }}
        >
          Barcha kurslar
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className="font-inter rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: selectedCategoryId === cat.id ? "#BC000D" : "#ffffff",
              color: selectedCategoryId === cat.id ? "#ffffff" : "#374151",
              border: "1px solid",
              borderColor: selectedCategoryId === cat.id ? "#BC000D" : "#E0E3E6",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Qidiruv */}
      <div className="relative w-full max-w-[420px]">
        <Search
          size={18}
          color="#636C79"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kursni qidirish"
          className="font-inter h-12 w-full rounded-xl border border-[#E0E3E6] bg-white pl-11 pr-4 text-sm text-[#0D1017] outline-none transition-colors focus:border-[#BC000D]"
        />
      </div>

      {/* Kurslar ro'yxati */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#BC000D]" />
        </div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-[#DC2626]">{error}</div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#9CA3AF]">
          {searchQuery ? `"${searchQuery}" bo'yicha hech qanday kurs topilmadi.` : "Hozircha kurslar mavjud emas."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const rating = ratings[course.id];
            return (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#F0F1F2] bg-white shadow-sm"
              >
                <div className="relative h-44 w-full shrink-0 overflow-hidden">
                  {course.bannerUrl ? (
                    <Image
                      src={course.bannerUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ background: pickGradient(course.title) }}
                    >
                      <span className="px-6 text-center text-base font-bold leading-6 text-white/90">
                        {course.title}
                      </span>
                    </div>
                  )}
                  {course.category && (
                    <span className="font-inter absolute left-3 top-3 rounded-full bg-[#BC000D]/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {course.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[#F0F1F2]">
                      {course.mentorImageUrl && (
                        <Image
                          src={course.mentorImageUrl}
                          alt={course.instructor}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-inter truncate text-sm font-semibold text-[#0D1017]">
                      {course.instructor}
                    </span>
                  </div>

                  <h3 className="font-inter mb-1.5 text-base font-bold leading-snug text-[#0D1017] line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="font-inter mb-3 flex-1 text-[13px] leading-relaxed text-[#636C79] line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mb-3 flex items-center gap-2">
                    <StarRating value={rating ?? 0} />
                    {rating != null && rating > 0 && (
                      <span className="font-inter text-xs font-semibold text-[#636C79]">
                        ({rating.toFixed(1)})
                      </span>
                    )}
                  </div>

                  <div className="mb-4 border-t border-[#F0F1F2] pt-3">
                    <p className="font-inter text-xs text-[#636C79]">Kurs narxi:</p>
                    <p className="font-inter mt-0.5 text-lg font-bold text-[#0D1017]">
                      {formatPrice(course.price)}{" "}
                      <span className="text-xs font-semibold uppercase text-[#636C79]">so&apos;m</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 xs:flex-row">
                    <Link
                      href={`/student/all-courses/${course.id}`}
                      className="font-inter flex-1 rounded-lg border border-[#E0E3E6] px-4 py-2.5 text-center text-sm font-semibold text-[#0D1017] transition-colors hover:bg-[#F9FAFB]"
                    >
                      Batafsil
                    </Link>
                    <button
                      onClick={() => handlePurchaseClick(course)}
                      className="font-inter flex-1 rounded-lg bg-[#BC000D] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Sotib olish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sahifalash */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex size-9 items-center justify-center rounded-lg border border-[#E0E3E6] text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>
          <span className="font-inter text-sm font-semibold text-[#0D1017]">
            {totalPages} tadan {safePage}-sahifa
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex size-9 items-center justify-center rounded-lg border border-[#E0E3E6] text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}

      <PurchaseModal course={purchaseCourse} onClose={() => setPurchaseCourse(null)} />
    </div>
  );
}