"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";
import { useLanguage } from "@/contexts/LanguageContext";

interface PurchasedCourse {
  id: string;
  name?: string;
  banner?: string;
  level?: string;
}

interface PurchasedCoursesResponse {
  total: number;
  data: PurchasedCourse[];
}

export function StudentMyCourses() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch("/purchased-courses/mine?offset=0&limit=8");
        if (!res.ok) throw new Error("Kurslarni olishda xatolik yuz berdi.");
        const data: PurchasedCoursesResponse = await res.json();
        setCourses(Array.isArray(data?.data) ? data.data : []);
      } catch (err: any) {
        setError(err.message || "Xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div
          className="size-9 rounded-full border-4 xs:size-10"
          style={{
            borderColor: "#F0F1F2",
            borderTopColor: "#BC000D",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 xs:p-5 sm:p-6">
        <p className="font-inter text-sm text-[#BC000D] xs:text-base">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 xs:gap-6">
      {/* Breadcrumb / Page title */}
      <div className="px-4 xs:px-5 sm:px-6">
        <h1 className="font-inter m-0 text-xl font-bold leading-tight text-black xs:text-2xl">
          Mening kurslarim
        </h1>
      </div>

      {courses.length === 0 ? (
        <div className="px-4 xs:px-5 sm:px-6">
          <p className="font-inter text-sm text-[#636C79] xs:text-[15px]">
            Siz hali birorta kurs sotib olmagansiz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 px-4 pb-5 xs:gap-6 xs:px-5 xs:pb-6 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: PurchasedCourse }) {
  const { t } = useLanguage();
  const router = useRouter();

  const bannerUrl = course.banner
    ? (course.banner.startsWith("http") || course.banner.startsWith("/")
        ? course.banner
        : `${FILES_BASE_URL}/${course.banner.trim()}`)
    : "/images/admin/banner1.png";

  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded transition-shadow duration-200"
      style={{
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")
      }
    >
      {/* Banner */}
      <div className="relative w-full" style={{ aspectRatio: "364/245" }}>
        <Image
          src={bannerUrl}
          alt={course.name || "Kurs"}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 640px) 90vw, (max-width: 1024px) 45vw, 364px"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4 xs:gap-4 xs:p-5">
        {/* Course title */}
        <div>
          <h2 className="font-inter m-0 text-base font-bold leading-snug text-black xs:text-lg xs:leading-6">
            {course.name}
          </h2>
        </div>

        {/* Button */}
        <button
          onClick={() => router.push(`/student/my-courses/${course.id}`)}
          className="font-inter h-11 w-full rounded-[10px] border-none text-sm font-medium leading-5 text-white transition-[background,transform] duration-200 xs:h-12"
          style={{
            background: "#BC000D",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#9E000B")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#BC000D")
          }
        >
          {t("courses.startWatching")}
        </button>
      </div>
    </div>
  );
}