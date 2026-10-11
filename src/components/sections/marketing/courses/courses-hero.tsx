"use client";

import { Search } from "lucide-react";

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function CoursesHero({ searchQuery, onSearchChange }: Props) {
  return (
    <section className="border-b border-border/60 bg-[#FAF8F7] py-7 sm:py-9">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          Barcha kurslar
        </span>

        <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          O&apos;zingizga mos kursni tanlang
        </h1>

        <p className="mx-auto mt-1.5 max-w-lg text-sm text-muted-foreground sm:text-base">
          Zamonaviy kasblar va texnologiyalarni tajribali mutaxassislar bilan noldan o&apos;rganing
        </p>

        {/* Yaxshilangan va ixcham qidiruv qutisi */}
        <div className="mx-auto mt-5 w-full max-w-lg">
          <div className="relative flex items-center rounded-xl border border-border/80 bg-white shadow-2xs transition-all duration-200 focus-within:border-primary focus-within:shadow-xs focus-within:ring-4 focus-within:ring-primary/10 hover:border-primary/40">
            <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
            <input
              id="course-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Kurs nomi yoki mavzu bo'yicha qidiring..."
              className="h-11 w-full rounded-xl bg-transparent pl-10 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:h-12 sm:text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Qidiruvni tozalash"
                className="absolute right-3 flex size-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
