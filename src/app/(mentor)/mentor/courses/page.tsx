"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { MentorCourses } from "@/dashboards/MentorPages/courses/MentorCoursesList";
import { getCurrentUserId } from "@/lib/auth";

export default function MentorCoursesPage() {
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const id = getCurrentUserId();
    setMyId(id ? String(id) : null);
  }, []);

  if (!myId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin text-[#BC000D]" size={32} />
      </div>
    );
  }

  return <MentorCourses mentorId={myId} />;
}