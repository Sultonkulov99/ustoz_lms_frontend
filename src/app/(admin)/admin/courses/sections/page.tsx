import { Suspense } from "react";
import { AdminSectionsList } from "@/dashboards/AdminPages/lessons/AdminSectionsList";

export const metadata = {
  title: "Bo'limlar | Admin Panel | ResearchBridge",
  description: "Kurs bo'limlari ro'yxati.",
};

export default function SectionsPage() {
  return (
    <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
      <AdminSectionsList />
    </Suspense>
  );
}
