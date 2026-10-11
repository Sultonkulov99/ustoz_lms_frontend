"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClass = (href: string) =>
  cn(
    "relative text-base font-medium text-foreground",
    "after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-800 after:ease-in-out",
    "hover:after:scale-x-100",
    pathname === href && "after:scale-x-100"
  );

  const mobileLinkClass = (href: string) =>
    cn(
      "block w-full rounded-lg px-4 py-3 text-base font-medium text-foreground",
      pathname === href ? "bg-muted text-primary" : "hover:bg-muted"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* <Link
          href="/"
          className="text-2xl font-extrabold leading-tight tracking-[0.32px] text-primary sm:text-[32px] sm:leading-[44px]"
        >
          ResearchBridge
        </Link> */}

          <Link
            href="/"
            className="flex origin-left items-center gap-2 whitespace-nowrap transition-transform duration-1500 ease-in-out hover:scale-110"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                width: "6px",
                height: "28px",
                background: "linear-gradient(180deg, #BC000D 0%, #FF3B3B 100%)",
                borderRadius: "3px",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: "22px",
                letterSpacing: "-0.5px",
              }}
            >
              <span style={{ color: "#000" }}>Research</span>
              <span style={{ color: "#BC000D" }}>Bridge</span>
            </span>
          </Link>

        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/courses" className={linkClass("/courses")}>
              Kurslar
            </Link>
            <Link href="/contact" className={linkClass("/contact")}>
              Aloqa
            </Link>
          </nav>

          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Kirish</Link>
          </Button>

          {/* Mobil hamburger tugmasi — faqat md dan kichik ekranlarda ko'rinadi */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-lg border border-border md:hidden"
            aria-label={mobileMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menyu paneli */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/courses"
              className={mobileLinkClass("/courses")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Kurslar
            </Link>
            <Link
              href="/contact"
              className={mobileLinkClass("/contact")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Aloqa
            </Link>
            <Button size="sm" asChild className="mt-2 w-full">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Kirish
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}