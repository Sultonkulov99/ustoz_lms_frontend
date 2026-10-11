import { CourseHero } from "@/components/sections/marketing/about-course/about-course-hero";
import { Comments } from "@/components/sections/marketing/about-course/comments";
import { CourseCurriculum } from "@/components/sections/marketing/about-course/course-curriculum";
import { CourseInstructorCard } from "@/components/sections/marketing/about-course/instructor-card";
import { CoursePurchaseCard } from "@/components/sections/marketing/about-course/purchase-card";

export default function CoursePage() {
  return (
    <div className="bg-[#EFEDED]">
      <CourseHero />

      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_429px]">
          {/* Chap ustun — o'z holicha, Hero tagidan boshlanadi */}
          <div className="flex flex-col gap-8 pt-12">
            <CourseCurriculum />
            <Comments />
          </div>

          {/* O'ng ustun — Hero ichiga "kirib" turadi */}
          <div className="flex flex-col gap-5 lg:-mt-[272px]">
            <CoursePurchaseCard />
            <CourseInstructorCard />
          </div>
        </div>
      </div>
    </div>
  );
}