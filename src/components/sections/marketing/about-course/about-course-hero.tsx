"use client";

import { Clock, Users, BarChart2, Sparkles } from "lucide-react";

type Props = {
  name?: string;
  about?: string;
  level?: string;
  purchases?: number;
  lessonsCount?: number;
};

export function CourseHero({
  name = "",
  about = "",
  level = "",
  purchases = 0,
  lessonsCount = 0,
}: Props) {
  const metaItems = [
    lessonsCount > 0
      ? { icon: Clock, label: `${lessonsCount} ta dars` }
      : null,
    { icon: Users, label: `${purchases} marta sotib olindi` },
    level ? { icon: BarChart2, label: `Daraja: ${level}` } : null,
  ].filter(Boolean) as { icon: typeof Clock; label: string }[];

  return (
    <section
      className="relative z-0 flex min-h-[352px] w-full items-center overflow-hidden"
      style={{ background: "#BC000D" }}
    >
      {/* 1. Landingdagi Aniq Ko'prik Vektor Chizmalari (Bridge Architecture SVG) */}
      <svg
        className="pointer-events-none absolute inset-0 size-full select-none"
        viewBox="0 0 1440 280"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="detail-hero-cable-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="16%" stopColor="white" stopOpacity="0.6" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="84%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="detail-hero-pylon-light" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Pastki suv sathidagi akslanish chiziqlari */}
        <line x1="0" y1="245" x2="1440" y2="245" stroke="white" strokeWidth="1.2" strokeOpacity="0.15" strokeDasharray="24 14" />
        <line x1="80" y1="258" x2="1360" y2="258" stroke="white" strokeWidth="0.8" strokeOpacity="0.1" strokeDasharray="16 20" />
        <line x1="180" y1="268" x2="1260" y2="268" stroke="white" strokeWidth="0.6" strokeOpacity="0.08" strokeDasharray="10 16" />

        {/* Poydevor arkalari */}
        <path d="M 0,210 Q 120,165 240,210" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" fill="none" />
        <path d="M 240,210 Q 720,150 1200,210" stroke="white" strokeWidth="3" strokeOpacity="0.3" fill="none" />
        <path d="M 1200,210 Q 1320,165 1440,210" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" fill="none" />

        {/* Asosiy ko'prik yo'li */}
        <line x1="0" y1="200" x2="1440" y2="200" stroke="white" strokeWidth="4" strokeOpacity="0.45" />
        <line x1="0" y1="207" x2="1440" y2="207" stroke="white" strokeWidth="1.5" strokeDasharray="12 8" strokeOpacity="0.25" />

        {/* Osma kabellar */}
        <path
          d="M 0,140 Q 120,80 240,40 Q 720,210 1200,40 Q 1320,80 1440,140"
          stroke="url(#detail-hero-cable-grad)"
          strokeWidth="3.5"
          fill="none"
        />
        <path
          d="M 0,148 Q 120,88 240,48 Q 720,218 1200,48 Q 1320,88 1440,148"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.3"
          fill="none"
        />

        {/* Vertikal osma vantis simlari */}
        {[270, 310, 350, 390, 430, 470, 510, 550, 590, 630, 670, 710, 730, 770, 810, 850, 890, 930, 970, 1010, 1050, 1090, 1130, 1165].map((x) => (
          <line
            key={x}
            x1={x}
            y1={40 + Math.pow(Math.abs(x - 720) / 480, 1.8) * 160}
            x2={x}
            y2="200"
            stroke="white"
            strokeWidth="1.1"
            strokeDasharray="4 3"
            strokeOpacity="0.22"
          />
        ))}

        {/* Pilon chiroqlari */}
        <circle cx="240" cy="40" r="3.5" fill="white" fillOpacity="0.8" />
        <circle cx="1200" cy="40" r="3.5" fill="white" fillOpacity="0.8" />
      </svg>

      {/* 2. Radial mayin yorug'lik effekti */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 85% at 50% 50%, rgba(188,0,13,0.65) 0%, rgba(188,0,13,0) 100%)",
        }}
      />

      {/* 3. Tarkib qismi */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex w-full flex-col gap-4 sm:gap-5 lg:max-w-[600px] xl:max-w-[650px] lg:pr-8">
          {/* Chapdagi kurs nomi tepasiga minimal toza nishon */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
              <Sparkles className="size-3 text-amber-300" />
              <span>Onlayn Kurs</span>
            </span>
            {level && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/85">
                {level}
              </span>
            )}
          </div>

          <h1 className="text-[28px] leading-[36px] font-bold text-white sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[52px] break-words">
            {name}
          </h1>

          {about && (
            <p className="text-base sm:text-lg leading-relaxed text-white/90 line-clamp-3">
              {about}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-5 sm:gap-6">
            {metaItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm sm:text-base text-white/95">
                <item.icon className="size-5 shrink-0 text-white/80" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}