
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";
import IconUser from "@/assets/images/IconUser.png";

type Course = {
  id: string;
  title: string;
  bannerUrl: string | null;
  category: string;
  level: string;
  instructor: string;
  mentorImageUrl: string | null;
  role: string;
  description: string;
  price: string;
};

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
      title: item.name?.trim() || "Nomsiz kurs",
      bannerUrl: `${FILES_BASE_URL}/${item.banner.trim()}`,
      category: item.category?.name || "",
      level: item.level || "",
      instructor: item.mentor?.fullName?.trim() || "Noma'lum instruktor",
      mentorImageUrl: isValidImage(item.mentor?.image)
        ? `${FILES_BASE_URL}/${item.mentor.image.trim()}`
        : null,
      role: item.mentor?.mentorProfile?.job || "Senior Mutaxassis",
      description: item.about?.trim() || "",
      price: item.price || "0",
    }));
}

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_STEP = 6;

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = value >= i + 1;
        const half = !filled && value > i && value < i + 1;
        return (
          <div key={i} className="relative size-4 sm:size-4.5">
            <Star className="absolute inset-0 size-4 sm:size-4.5 text-[#E4E2E2] dark:text-neutral-700" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : half ? "50%" : "0%" }}
            >
              <Star className="size-4 sm:size-4.5 fill-[#F5A623] text-[#F5A623]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CourseCard({
  course,
  isLiked,
  rating,
  toggleLike,
}: {
  course: Course;
  isLiked?: boolean;
  rating?: number | null;
  toggleLike: (id: string) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const isFree = course.price === "0" || Number(course.price) === 0;

  if (hasError || !course.bannerUrl) {
    return null;
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30">
      {/* 1. Banner qismi: Mobilda ixchamroq (h-44), planshet va desktopda 16:9.
          object-contain: rasm qirqilmasdan, to'liq ko'rinadi (bo'sh joylar oq fon bilan to'ladi). */}
      <Link
        href={`/about-course/${course.id}`}
        className="relative h-44 sm:h-52 md:aspect-video w-full shrink-0 overflow-hidden bg-white dark:bg-neutral-900 block"
      >
        <Image
          src={course.bannerUrl}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setHasError(true)}
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* 2. Ma'lumotlar bloki: flex-1 va justify-between orqali pastki tugmalar doim 1 xil chiziqda turadi */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {/* Instruktor va Sevimlilar tugmasi: Qat'iy h-10 balandlik */}
        <div className="flex h-10 items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative size-8 sm:size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60 bg-muted">
              <Image
                src={course.mentorImageUrl ?? IconUser}
                alt={course.instructor}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <span className="text-sm sm:text-base font-bold text-foreground truncate">
              {course.instructor}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleLike(course.id)}
            aria-pressed={isLiked}
            aria-label={
              isLiked ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"
            }
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isLiked ? "fill-primary text-primary" : ""
              )}
            />
          </button>
        </div>

        {/* Kurs nomi: 1 qatorlik, sig'masa 2-qatorga o'tmaydi (truncate) */}
        <div className="mt-3 flex h-7 items-center overflow-hidden">
          <h3
            className="w-full text-base sm:text-lg font-bold leading-none text-foreground truncate"
            title={course.title}
          >
            <Link
              href={`/about-course/${course.id}`}
              className="transition-colors hover:text-primary block truncate"
            >
              {course.title}
            </Link>
          </h3>
        </div>

        {/* Kurs tavsifi: Qat'iy 2 qatorlik limit */}
        <div className="mt-2 flex h-10 items-start overflow-hidden">
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {course.description ||
              "Ushbu kurs bo'yicha batafsil ma'lumot va amaliy mashg'ulotlar kurs sahifasida taqdim etilgan."}
          </p>
        </div>

        {/* Reyting qismi: Qat'iy h-6 (24px) balandlik */}
        <div className="mt-3 flex h-6 items-center gap-1.5">
          <StarRating value={rating ?? 0} />
          <span className="ml-1 text-xs sm:text-sm font-semibold text-muted-foreground">
            ({rating != null && rating > 0 ? rating.toFixed(1) : "0"})
          </span>
        </div>

        {/* Narx va Tugma: mt-auto tufayli BARCHA kartalarda doimiy bitta chiziqda tekis turadi */}
        <div className="mt-auto border-t border-border/60 pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Kurs narxi:
          </p>
          <div className="mt-1 flex h-8 items-baseline gap-1.5">
            {isFree ? (
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                Bepul
              </span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {formatPrice(course.price)}
                </span>
                <span className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
                  uzs
                </span>
              </div>
            )}
          </div>

          {/* Kursni ko'rish tugmasi */}
          <Button
            size="lg"
            className="mt-4 w-full rounded-xl font-semibold shadow-xs transition-transform active:scale-[0.99]"
            asChild
          >
            <Link href={`/about-course/${course.id}`}>
              Kursni ko&apos;rish
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Catalog({
  categoryId,
  searchQuery,
}: {
  categoryId?: string | null;
  searchQuery: string;
}) {
  const [rawCourses, setRawCourses] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedCourses, setLikedCourses] = useState<Record<string, boolean>>({});
  const [extraCount, setExtraCount] = useState(0);
  const [prevFilter, setPrevFilter] = useState({ categoryId, searchQuery });

  if (
    prevFilter.categoryId !== categoryId ||
    prevFilter.searchQuery !== searchQuery
  ) {
    setPrevFilter({ categoryId, searchQuery });
    setExtraCount(0);
  }

  const visibleCount = INITIAL_VISIBLE_COUNT + extraCount;

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

  // Kategoriya + nashr holati + qidiruv bo'yicha filtrlash
  const filteredRawCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawCourses.filter((item: any) => {
      if (!item.published) return false;
      if (!isValidImage(item.banner)) return false;
      if (categoryId && String(item.category?.id) !== String(categoryId)) return false;
      if (q && !String(item.name || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rawCourses, categoryId, searchQuery]);

  // Ko'rsatiladigan kurslar: Dastlab 6 ta, "Ko'proq" bosilganda yana 6 tadan qo'shiladi
  const displayedCourses = useMemo(() => {
    return mapCourses(filteredRawCourses.slice(0, visibleCount));
  }, [filteredRawCourses, visibleCount]);

  useEffect(() => {
    if (displayedCourses.length === 0) return;
    let cancelled = false;

    const fetchRatings = async () => {
      const entries = await Promise.all(
        displayedCourses.map(async (course) => {
          try {
            const res = await apiFetch(
              `/course-rating/list/${course.id}?offset=0&limit=100`
            );
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
        setRatings(Object.fromEntries(entries));
      }
    };

    fetchRatings();
    return () => {
      cancelled = true;
    };
  }, [displayedCourses]);

  const toggleLike = (id: string) => {
    setLikedCourses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoadMore = () => {
    setExtraCount((prev) => prev + LOAD_MORE_STEP);
  };

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[360px] max-w-7xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-9 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Kurslar yuklanmoqda...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
          <p className="font-semibold">{error}</p>
        </div>
      </section>
    );
  }

  const hasMore = visibleCount < filteredRawCourses.length;
  const remainingCount = Math.max(0, filteredRawCourses.length - visibleCount);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24">
      {displayedCourses.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/80 bg-card/40 py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            Hech qanday kurs topilmadi
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Qidiruv so&apos;zini o&apos;zgartirib qayta urinib ko&apos;ring.
          </p>
        </div>
      ) : (
        /* Grid tuzilishi: Desktopda 3 ta ustun (2 qatorda 6 ta), Planshetda 2 ta ustun (3 qatorda 6 ta), Mobilda 1 ta */
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isLiked={likedCourses[course.id]}
              rating={ratings[course.id]}
              toggleLike={toggleLike}
            />
          ))}
        </div>
      )}

      {/* Agar kurslar 6 tadan ko'p bo'lsa: "Ko'proq kurslarni ko'rish" tugmasi */}
      {hasMore && (
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={handleLoadMore}
            className="group min-h-12 gap-2 rounded-xl border-2 border-primary/30 px-8 text-sm font-bold text-primary shadow-xs transition-all hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-95"
          >
            <span>Ko&apos;proq kurslarni ko&apos;rish</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              +{Math.min(LOAD_MORE_STEP, remainingCount)}
            </span>
            <ChevronDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </Button>
          <p className="text-xs font-medium text-muted-foreground">
            Jami {filteredRawCourses.length} ta kursdan {Math.min(visibleCount, filteredRawCourses.length)} tasi ko&apos;rsatilmoqda
          </p>
        </div>
      )}

      {/* Barcha kurslar to'liq ko'rsatilgan holatda (agar 6 tadan ko'p bo'lib hammasi ochilgan bo'lsa) */}
      {!hasMore && filteredRawCourses.length > INITIAL_VISIBLE_COUNT && (
        <div className="mt-12 text-center">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
            Barcha {filteredRawCourses.length} ta kurs to&apos;liq ko&apos;rsatildi
          </p>
        </div>
      )}
    </section>
  );
}