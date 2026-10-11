import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CourseHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <Link
          href="/"
          className="text-[32px] font-extrabold leading-[44px] tracking-[0.32px] text-primary"
        >
          Course
        </Link>

        <div className="flex items-center gap-10">
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/courses"
              className="text-base font-medium text-foreground underline-offset-8  hover:underline hover:decoration-primary hover:decoration-2"
            >
              Kurslar
            </Link>
            <Link
              href="/contact"
              className="text-base font-medium text-foreground underline-offset-8  hover:underline hover:decoration-primary hover:decoration-2"
            >
              Aloqa
            </Link>
          </nav>

          <Button size="sm" asChild>
            <Link href="/login">Kirish</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}