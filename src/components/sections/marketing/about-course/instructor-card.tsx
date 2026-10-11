import Image from "next/image";
import { Star } from "lucide-react";
import IconUser from "@/assets/images/IconUser.png";

type Props = {
  name?: string;
  imageUrl?: string | null;
  job?: string;
  coursesCount?: number;
  studentsCount?: number;
  viewsCount?: number;
  rating?: number;
};

export function CourseInstructorCard({
  name = "",
  imageUrl = null,
  job = "",
  coursesCount = 0,
  studentsCount = 0,
  viewsCount = 0,
  rating = 0,
}: Props) {
  const stats = [
    { value: String(studentsCount), label: "O'quvchilar" },
    { value: String(coursesCount), label: "Kurslar" },
    { value: String(viewsCount), label: "Ko'rishlar" },
  ];

  return (
    <div
      className="flex w-full max-w-none lg:max-w-[429px] flex-col gap-4 rounded-2xl sm:rounded-[8px] border border-border/80 sm:border-2 bg-white px-4 py-3.5 sm:px-6 sm:py-3 shadow-xs"
      style={{
        borderColor: "#E4E2E2",
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative size-12 sm:size-16 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60">
          <Image
            src={imageUrl || IconUser}
            alt={name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold leading-none text-black">
            {name}
          </span>
          <span className="text-sm font-normal leading-none" style={{ color: "#636C79" }}>
            {job}
          </span>
          <div className="mt-1 flex items-center gap-1">
            <Star
              className="size-4"
              style={{ color: rating > 0 ? "#FCB823" : "#E0E3E6" }}
              fill="currentColor"
              stroke="none"
            />
            <span className="text-sm font-normal leading-none" style={{ color: "#636C79" }}>
              {rating > 0 ? rating.toFixed(1) : "0"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-2 px-5 ${index === 0 ? "pl-0" : ""} ${
              index !== stats.length - 1 ? "border-r border-[#F1F2F4]" : ""
            }`}
          >
            <span className="text-lg font-semibold leading-none text-foreground">
              {stat.value}
            </span>
            <span className="text-sm font-normal leading-none" style={{ color: "#636C79" }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}