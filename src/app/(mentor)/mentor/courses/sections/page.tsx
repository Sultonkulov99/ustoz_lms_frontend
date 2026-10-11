"use client";

import { useSearchParams } from "next/navigation";
import { MentorSectionsList } from "@/dashboards/MentorPages/courses/MentorSectionsList";

export default function MentorSectionsPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("courseId") || "";
  const courseName = searchParams?.get("courseName")
    ? decodeURIComponent(searchParams.get("courseName")!)
    : "";

  return <MentorSectionsList courseId={courseId} courseName={courseName} />;
}