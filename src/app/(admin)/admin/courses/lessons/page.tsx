import { Suspense } from "react";
import { LessonsList } from "@/dashboards/AdminPages/lessons/LessonsList";

export const metadata = {
  title: "Darslar | Admin Panel | ResearchBridge",
  description: "Darslar ro'yxati, materiallar, vazifalar va imtihonlar.",
};

export default function LessonsPage() {
  return (
    <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
      <LessonsList />
    </Suspense>
  );
}
