"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, StarHalf, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import CourseImage from "@/assets/images/kursni_sotib_olish.png";

// 5 ta yulduzchani reyting qiymatiga (masalan 4.5) mos ravishda
// to'liq/yarim/bo'sh holatda chizadi
function StarRating({ value, size = "size-4" }: { value: number; size?: string }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {Array.from({ length: 5 }).map((_, index) => {
        if (index < fullStars) {
          return <Star key={index} className={`${size} fill-yellow-500 text-yellow-500`} />;
        }
        if (index === fullStars && hasHalfStar) {
          return <StarHalf key={index} className={`${size} fill-yellow-500 text-yellow-500`} />;
        }
        return <Star key={index} className={`${size} text-border`} />;
      })}
    </div>
  );
}

function formatPrice(price: number) {
  return price.toLocaleString("uz-UZ").replace(/,/g, " ");
}

import { useLanguage } from "@/contexts/LanguageContext";

export function MentorCourses({ mentorId }: { mentorId: string }) {
  const { t } = useLanguage();
  const [mentor, setMentor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedCourseIds, setLikedCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMentorAndCourses = async () => {
      setLoading(true);
      try {
        // 1. Fetch mentor profile directly from detailed mentor API
        const mResponse = await apiFetch(`/users/mentor/${mentorId}`);
        if (mResponse.ok) {
          const detailed = await mResponse.json();
          setMentor({
            name: detailed.fullName || "Ism kiritilmagan",
            avatar: detailed.image ? `/files/public/${detailed.image}` : null,
            profession: detailed.mentorProfile?.job || detailed.job || "Mentor",
            rating: detailed.mentorProfile?.rating || "4.6",
          });
        } else {
          // Fallback to list search if single fetch fails
          const fallbackResponse = await apiFetch(`/users?limit=1000&role=MENTOR`);
          if (fallbackResponse.ok) {
            const mData = await fallbackResponse.json();
            if (mData && Array.isArray(mData.data)) {
              const found = mData.data.find((item: any) => String(item.id) === String(mentorId));
              if (found) {
                setMentor({
                  name: found.fullName || "Ism kiritilmagan",
                  avatar: found.image ? `/files/public/${found.image}` : null,
                  profession: found.mentorProfile?.job || found.job || "Mentor",
                  rating: found.mentorProfile?.rating || "4.6",
                });
              }
            }
          }
        }

        // 2. Fetch courses of the mentor
        const cResponse = await apiFetch(`/courses/mentor/${mentorId}`);
        if (cResponse.ok) {
          const cData = await cResponse.json();
          if (cData && Array.isArray(cData.data)) {
            setCourses(cData.data);
          }
        }
      } catch (err) {
        console.error("Error fetching mentor courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorAndCourses();
  }, [mentorId]);

  const toggleLike = (courseId: string) => {
    setLikedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("table.noData")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Sarlavha va breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("users.mentors")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link href="/admin/users/mentors" className="hover:text-foreground">
            {t("users.usersLabel")}
          </Link>
          <span className="mx-2">•</span>
          <Link href="/admin/users/mentors" className="hover:text-foreground">
            {t("users.mentors")}
          </Link>
          <span className="mx-2">•</span>
          {t("users.mentorCourses")}
        </p>
      </div>

      {/* Mentor profili */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        {mentor.avatar && !mentor.avatar.includes("mentor-1.png") ? (
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="size-16 rounded-full object-cover animate-fade-in"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.onerror = null;
              img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23F3F4F6'/><circle cx='50' cy='40' r='20' fill='%239CA3AF'/><path d='M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z' fill='%239CA3AF'/></svg>";
            }}
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-muted" style={{ flexShrink: 0 }}>
            <Star className="size-8 text-muted-foreground hidden" /> {/* dummy to avoid unused import if any */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-16">
              <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
              <circle cx="50" cy="40" r="20" fill="#9CA3AF" />
              <path d="M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z" fill="#9CA3AF" />
            </svg>
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-foreground">{mentor.name}</h2>
          <p className="text-sm text-muted-foreground">
            {mentor.profession || "Mentor"}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <Star className="size-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">{mentor.rating || "4.6"}</span>
          </div>
        </div>
      </div>

      {/* Kurslar grid'i */}
      {courses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          {t("common.noCoursesAssigned")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const isLiked = likedCourseIds.has(course.id);
            const bannerUrl = course.banner
              ? `/files/public/${course.banner}`
              : CourseImage.src;

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative h-32 w-full bg-slate-100">
                  <img
                    src={bannerUrl}
                    alt={course.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = CourseImage.src;
                    }}
                  />
                  <span
                    className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {course.category?.name || t("table.category")}
                  </span>
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${course.published ? "bg-green-600" : "bg-gray-500"
                      }`}
                  >
                    {course.published ? t("status.active") : t("status.inactive")}
                  </span>
                </div>

                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {mentor.avatar && !mentor.avatar.includes("mentor-1.png") ? (
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="size-6 rounded-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23F3F4F6'/><circle cx='50' cy='40' r='20' fill='%239CA3AF'/><path d='M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z' fill='%239CA3AF'/></svg>";
                          }}
                        />
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted" style={{ flexShrink: 0 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-6">
                            <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
                            <circle cx="50" cy="40" r="20" fill="#9CA3AF" />
                            <path d="M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z" fill="#9CA3AF" />
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground">{mentor.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleLike(course.id)}
                      className={`hover:text-primary ${isLiked ? "text-primary" : "text-muted-foreground"
                        }`}
                      aria-label="like"
                    >
                      <Heart
                        className="size-4"
                        fill={isLiked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <h3 className="mb-1 text-base font-bold text-foreground line-clamp-1">{course.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{course.about}</p>

                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
                    <StarRating value={5} />
                    <span className="text-sm text-muted-foreground">(5.0)</span>
                  </div>

                  <p className="text-xs text-muted-foreground">{t("courses.coursePrice")}</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(Number(course.price || 0)) || "0"}{" "}
                    <span className="text-sm font-medium uppercase text-muted-foreground">uzs</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}