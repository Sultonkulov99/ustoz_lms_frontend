"use client";

import { useState } from "react";
import { Catalog } from "@/components/sections/marketing/courses/catalog";
import { CoursesHero } from "@/components/sections/marketing/courses/courses-hero";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <CoursesHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Catalog searchQuery={searchQuery} />
    </div>
  );
}