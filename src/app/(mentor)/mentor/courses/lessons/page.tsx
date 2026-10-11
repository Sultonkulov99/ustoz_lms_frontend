import { Suspense } from "react";
import { LessonsList } from "@/dashboards/AdminPages/lessons/LessonsList";

export const metadata = {
  title: "Darslar | Mentor Panel | ResearchBridge",
  description: "Darslar ro'yxati, materiallar, vazifalar va imtihonlar.",
};

export default function MentorLessonsPage() {
  return (
    <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
      <LessonsList basePath="/mentor/courses" />
    </Suspense>
  );
}