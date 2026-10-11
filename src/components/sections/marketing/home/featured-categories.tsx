
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Globe,
  MonitorSmartphone,
  Palette,
  ScrollText,
  ShieldPlus,
  type LucideIcon,
} from "lucide-react";

/*
 * Hover effektlari (hammasi 1.5 soniya):
 * - karta yuqoriga ko'tariladi
 * - pastdan qizil gradient chiqadi (kartaning pastki ~60% qismigacha, tepasi shaffof)
 * - ikonalar to'liq aylanadi, burchakdagi xira ikona kattalashib aylanadi
 * - "Darslarni ko'rish" oqqa o'tadi, strelka o'ngga suriladi
 * Qizil rang: "Browse Courses" tugmasi rangi (#AC000D).
 */
const styles = `
@keyframes rb-rise {
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}
@keyframes rb-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(12px) rotate(6deg); }
}

.rb-card {
  transition: transform 1500ms ease-in-out, box-shadow 1500ms ease-in-out;
}
.rb-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 48px -16px rgba(172, 0, 13, 0.28);
}

.rb-rise-layer {
  transform: translateY(100%);
  transition: transform 1500ms ease-in-out;
  background: linear-gradient(
    to top,
    #AC000D 0%,
    rgba(172, 0, 13, 0.88) 30%,
    rgba(172, 0, 13, 0.35) 70%,
    rgba(172, 0, 13, 0) 100%
  );
}
.rb-card:hover .rb-rise-layer { transform: translateY(0); }

.rb-spin {
  transform-origin: center;
  transition:
    transform 1500ms ease-in-out,
    background-color 1500ms ease-in-out,
    color 1500ms ease-in-out;
}
.rb-card:hover .rb-spin { transform: rotate(360deg) scale(1.15); }

.rb-corner {
  opacity: 0.12;
  transform-origin: center;
  transition: transform 1500ms ease-in-out, opacity 1500ms ease-in-out;
}
.rb-card:hover .rb-corner { transform: rotate(120deg) scale(1.25); opacity: 0.25; }

@media (prefers-reduced-motion: reduce) {
  .rb-anim, .rb-float { animation: none !important; }
  .rb-card, .rb-rise-layer, .rb-spin, .rb-corner { transition: none !important; }
  .rb-card:hover, .rb-card:hover .rb-spin, .rb-card:hover .rb-corner { transform: none !important; }
}
`;

type CategoryCardProps = {
  delay: number;
  Icon: LucideIcon;
  title: string;
  description: string;
  /** joylashuv (col-span), fon rangi va padding */
  className: string;
  /** "big" — katta ikonali karta, "small" — doira ichidagi ikonali karta */
  variant: "big" | "small";
  /** ikona, burchakdagi ikona va "Darslarni ko'rish" rangi */
  ink: string;
  titleInk: string;
  bodyInk: string;
  cornerPos: string;
};

function CategoryCard({
  delay,
  Icon,
  title,
  description,
  className,
  variant,
  ink,
  titleInk,
  bodyInk,
  cornerPos,
}: CategoryCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rb-anim rb-card group relative flex flex-col justify-between overflow-hidden rounded-2xl cursor-default select-none ${
        visible ? "" : "opacity-0"
      } ${className}`}
      style={{
        animation: visible
          ? `rb-rise 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms backwards`
          : undefined,
      }}
    >
      {/* Pastdan sekin ko'tariladigan qizil gradient */}
      <span
        aria-hidden="true"
        className="rb-rise-layer pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
      />

      {/* Burchakdagi katta xira ikona */}
      <div
        aria-hidden="true"
        className={`rb-corner pointer-events-none absolute z-2 h-50 w-50 ${ink} ${cornerPos}`}
      >
        <div
          className="h-full w-full"
          style={{ animation: "rb-float 7s ease-in-out infinite" }}
        >
          <Icon strokeWidth={1} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      <div className="relative z-10">
        {variant === "big" ? (
          <div className={ink}>
            <span className="rb-spin inline-block">
              <Icon className="size-12" strokeWidth={1.8} />
            </span>
          </div>
        ) : (
          <div className="rb-spin flex size-13 items-center justify-center rounded-full bg-[#E4E2E1] text-[#1B1C1C] group-hover:bg-primary group-hover:text-white dark:bg-neutral-800 dark:text-foreground">
            <Icon className="size-6" strokeWidth={1.9} />
          </div>
        )}

        <h3
          className={`mt-5 text-xl font-bold transition-colors duration-1500 ${
            variant === "big"
              ? "sm:text-2xl lg:text-[26px]"
              : "sm:text-[21px]"
          } ${titleInk}`}
        >
          {title}
        </h3>

        <p
          className={`mt-2.5 text-sm font-medium leading-relaxed transition-colors duration-1500 sm:text-[15px] ${
            variant === "big" ? "max-w-xl lg:text-base" : ""
          } ${bodyInk}`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturedCategories() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:px-16 lg:py-14">
      <style>{styles}</style>

      {/* Sarlavha qismi */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-[#1B1C1C] dark:text-foreground sm:text-[26px] md:text-[28px] lg:title_32">
          Kurs yo&apos;nalishlari
        </h2>
        <p className="mt-1 text-sm text-[#5F5E5E] dark:text-muted-foreground sm:text-[15px] md:text-base lg:desc_18">
          O&apos;zingizga ma&apos;qul bo&apos;lgan sohani tanlang
        </p>
      </div>

      {/* Grid (8+4 yuqorida, 4+4+4 pastda) */}
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-12">
        {/* 1. Katta moviy karta: Raqamli savodxonlik */}
        <CategoryCard
          delay={0}
          Icon={MonitorSmartphone}
          title="Raqamli savodxonlik"
          description="Smartfonlar, kompyuter va internetdan foydalanishni eng noldan o'rganing."
          className="bg-[#DCEEFB] p-6 sm:col-span-2 sm:p-8 md:p-9 lg:col-span-8 dark:bg-[#0c2333]"
          variant="big"
          ink="text-[#001E2F] dark:text-[#BAE6FD]"
          titleInk="text-[#001E2F] group-hover:text-[#000F17] dark:text-[#BAE6FD] dark:group-hover:text-white"
          bodyInk="text-[#1A2E3B] group-hover:text-[#001424] dark:text-[#BAE6FD]/90 dark:group-hover:text-white"
          cornerPos="-right-10 -top-10"
        />

        {/* 2. Pushti karta: Salomatlik */}
        <CategoryCard
          delay={120}
          Icon={ShieldPlus}
          title="Salomatlik"
          description="Sog'lom turmush tarzi va parvarishlash bo'yicha mutaxassislar maslahati."
          className="bg-[#FFDAD5] p-6 sm:col-span-1 sm:p-8 lg:col-span-4 dark:bg-[#341412]"
          variant="big"
          ink="text-[#410001] dark:text-[#FFDAD5]"
          titleInk="text-[#410001] group-hover:text-[#250001] dark:text-[#FFDAD5] dark:group-hover:text-white"
          bodyInk="text-[#331111] group-hover:text-[#180506] dark:text-[#FFDAD5]/90 dark:group-hover:text-white"
          cornerPos="-bottom-12 -right-12"
        />

        {/* 3. Kichik karta: San'at va ijod */}
        <CategoryCard
          delay={240}
          Icon={Palette}
          title="San'at va ijod"
          description="Rasm chizish, to'qish va boshqa qiziqarli mashg'ulotlar."
          className="border border-[#E4E2E2] bg-[#FBFBFB] p-6 sm:col-span-1 sm:p-7 lg:col-span-4 dark:border-neutral-800 dark:bg-card"
          variant="small"
          ink="text-primary"
          titleInk="text-[#1B1C1C] group-hover:text-black dark:text-foreground dark:group-hover:text-white"
          bodyInk="text-[#262626] group-hover:text-black dark:text-neutral-200 dark:group-hover:text-white"
          cornerPos="-right-10 -top-10"
        />

        {/* 4. Kichik karta: Tillar */}
        <CategoryCard
          delay={360}
          Icon={Globe}
          title="Tillar"
          description="Yangi tillarni oson va stressiz o'rganish usullari."
          className="border border-[#E4E2E2] bg-[#FBFBFB] p-6 sm:col-span-1 sm:p-7 lg:col-span-4 dark:border-neutral-800 dark:bg-card"
          variant="small"
          ink="text-primary"
          titleInk="text-[#1B1C1C] group-hover:text-black dark:text-foreground dark:group-hover:text-white"
          bodyInk="text-[#262626] group-hover:text-black dark:text-neutral-200 dark:group-hover:text-white"
          cornerPos="-right-10 -top-10"
        />

        {/* 5. Kichik karta: Tarix va Madaniyat */}
        <CategoryCard
          delay={480}
          Icon={ScrollText}
          title="Tarix va Madaniyat"
          description="Dunyo tarixi va boy madaniy merosimiz haqida suhbatlar."
          className="border border-[#E4E2E2] bg-[#FBFBFB] p-6 sm:col-span-1 sm:p-7 lg:col-span-4 dark:border-neutral-800 dark:bg-card"
          variant="small"
          ink="text-primary"
          titleInk="text-[#1B1C1C] group-hover:text-black dark:text-foreground dark:group-hover:text-white"
          bodyInk="text-[#262626] group-hover:text-black dark:text-neutral-200 dark:group-hover:text-white"
          cornerPos="-right-10 -top-10"
        />
      </div>
    </section>
  );
}