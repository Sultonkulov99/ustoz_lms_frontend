"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";
import { CourseHero } from "./about-course-hero";
import { Comments } from "./comments";
import { CourseCurriculum, type Section } from "./course-curriculum";
import { CourseInstructorCard } from "./instructor-card";
import { CoursePurchaseCard } from "./purchase-card";

type CourseDetail = {
  id: string;
  name: string;
  about: string;
  bannerUrl: string | null;
  level: string;
  price: string;
  purchases: number;
  mentor: {
    id: number;
    fullName: string;
    imageUrl: string | null;
    job: string;
    experience: number | null;
  };
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function mapSections(raw: Array<Record<string, unknown>>): Section[] {
  const getLessonOrder = (l: Record<string, unknown>): number => {
    const name = String(l.name ?? l.title ?? "");
    const match = name.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  };

  return raw.map((group) => {
    const rawLessons = Array.isArray(group.lessons) ? (group.lessons as Array<Record<string, unknown>>) : [];
    const sortedLessons = [...rawLessons].sort((a, b) => {
      const orderDiff = getLessonOrder(a) - getLessonOrder(b);
      if (orderDiff !== 0) return orderDiff;
      return String(a.name ?? a.title ?? "").localeCompare(String(b.name ?? b.title ?? ""));
    });

    return {
      title: (group.name as string) || (group.title as string) || "Bo'lim",
      lessons: sortedLessons.map((lesson) => ({
        title: (lesson.name as string) || (lesson.title as string) || "Dars",
        duration:
          typeof lesson.duration === "number"
            ? formatDuration(lesson.duration)
            : (lesson.duration as string) || "",
        locked: (lesson.locked ?? lesson.isLocked ?? true) as boolean,
      })),
    };
  });
}

type Props = {
  courseId: string;
  // "marketing" (standart) — mehmon foydalanuvchi uchun (/about-course/[slug]),
  //   "Sotib olish" tugmasi /register'ga yo'naltiradi, FinalCta ko'rinadi.
  // "student" — tizimga kirgan talaba uchun (/student/all-courses/[id]),
  //   "Sotib olish" Telegram admin bilan bog'lanish modalini ochadi,
  //   marketing uchun mo'ljallangan FinalCta bloki yashiriladi.
  variant?: "marketing" | "student";
};

export function CourseDetailView({ courseId, variant = "marketing" }: Props) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [mentorCoursesCount, setMentorCoursesCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseRes = await apiFetch(`/courses/single/${courseId}`);
        if (!courseRes.ok) {
          throw new Error("Kurs topilmadi.");
        }
        const c = await courseRes.json();

        if (cancelled) return;

        setCourse({
          id: c.id,
          name: c.name || "Nomsiz kurs",
          about: c.about || "",
          bannerUrl: c.banner ? `${FILES_BASE_URL}/${c.banner}` : null,
          level: c.level || "",
          price: c.price || "0",
          purchases: c._count?.purchases ?? 0,
          mentor: {
            id: c.mentor?.id,
            fullName: c.mentor?.fullName?.trim() || "Noma'lum",
            imageUrl: c.mentor?.image ? `${FILES_BASE_URL}/${c.mentor.image}` : null,
            job: c.mentor?.mentorProfile?.job || "Instruktor",
            experience: c.mentor?.mentorProfile?.experience ?? null,
          },
        });

        // Curriculum (bo'limlar)
        try {
          const curriculumRes = await apiFetch(
            `/lesson-group/all/${courseId}?offset=0&limit=100&include_lessons=true`
          );
          if (curriculumRes.ok) {
            const curriculumData = await curriculumRes.json();
            if (!cancelled && Array.isArray(curriculumData.data)) {
              setSections(mapSections(curriculumData.data));
            }
          }
        } catch (err) {
          console.error("Curriculum fetch error:", err);
        }

        // Mentorning boshqa kurslari soni
        if (c.mentor?.id) {
          try {
            const mentorCoursesRes = await apiFetch(
              `/courses?offset=0&limit=1&mentor_id=${c.mentor.id}`
            );
            if (mentorCoursesRes.ok) {
              const mentorCoursesData = await mentorCoursesRes.json();
              if (!cancelled) {
                setMentorCoursesCount(mentorCoursesData.total ?? 0);
              }
            }
          } catch (err) {
            console.error("Mentor courses count fetch error:", err);
          }
        }

        // Kurs reytingi
        try {
          const ratingRes = await apiFetch(
            `/course-rating/list/${courseId}?offset=0&limit=100`
          );
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json();
            const items: Array<Record<string, unknown>> = Array.isArray(ratingData.data) ? ratingData.data : [];
            if (!cancelled && items.length > 0) {
              const values = items
                .map((item) => Number(item.rating ?? item.score ?? item.value))
                .filter((v: number) => !Number.isNaN(v));
              if (values.length > 0) {
                setRating(values.reduce((sum, v) => sum + v, 0) / values.length);
              }
            }
          }
        } catch (err) {
          console.error("Rating fetch error:", err);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Kursni yuklashda xatolik yuz berdi.";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-[#5D3F3B]">
        Kurs yuklanmoqda...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-red-600">
        {error || "Kurs topilmadi."}
      </div>
    );
  }

  const lessonsCount = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="bg-[#EFEDED]">
      <CourseHero
        name={course.name}
        about={course.about}
        level={course.level}
        purchases={course.purchases}
        lessonsCount={lessonsCount}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_429px] w-full items-start gap-8">
          {/* Purchase Card: Mobilda qahramon fonidan keyin darhol chiqadi (-mt-8 sm:-mt-12), desktopda esa o'ng ustunda floating turadi */}
          <div className="relative z-10 flex w-full flex-col gap-5 -mt-8 sm:-mt-12 lg:-mt-[272px] order-1 lg:order-2">
            <CoursePurchaseCard
              courseId={course.id}
              bannerUrl={course.bannerUrl}
              title={course.name}
              price={course.price}
              about={course.about}
              rating={rating}
              variant={variant}
            />
            {/* Instruktor kartasi desktopda purchase card tagida */}
            <div className="hidden lg:block">
              <CourseInstructorCard
                name={course.mentor.fullName}
                imageUrl={course.mentor.imageUrl}
                job={course.mentor.job}
                coursesCount={mentorCoursesCount}
                studentsCount={course.purchases}
                viewsCount={0}
                rating={0}
              />
            </div>
          </div>

          {/* Darslar mundarijasi, mobilda instruktor va izohlar */}
          <div className="flex w-full flex-col gap-8 pt-2 sm:pt-4 lg:pt-12 order-2 lg:order-1">
            <CourseCurriculum sections={sections} />

            {/* Mobilda instruktor mundarijadan keyin ko'rinadi */}
            <div className="block lg:hidden">
              <CourseInstructorCard
                name={course.mentor.fullName}
                imageUrl={course.mentor.imageUrl}
                job={course.mentor.job}
                coursesCount={mentorCoursesCount}
                studentsCount={course.purchases}
                viewsCount={0}
                rating={0}
              />
            </div>

            <Comments />
          </div>
        </div>
      </div>
    </div>
  );
}