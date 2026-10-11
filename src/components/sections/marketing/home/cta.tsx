import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="relative w-full overflow-hidden bg-primary py-10 sm:py-14 lg:py-16">
      {/* 1. Yagona Katta Panoramik Ko'prik (Takrorlanuvchi pattern emas, 1 ta butun arxitektura) */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1440 280"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Mayin gradientlar */}
          <linearGradient id="cta-cable-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="16%" stopColor="white" stopOpacity="0.6" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="84%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="pylon-light" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Pastki suv sathidagi akslanish chiziqlari */}
        <line x1="0" y1="245" x2="1440" y2="245" stroke="white" strokeWidth="1.2" strokeOpacity="0.15" strokeDasharray="24 14" />
        <line x1="80" y1="258" x2="1360" y2="258" stroke="white" strokeWidth="0.8" strokeOpacity="0.1" strokeDasharray="16 20" />
        <line x1="180" y1="268" x2="1260" y2="268" stroke="white" strokeWidth="0.6" strokeOpacity="0.08" strokeDasharray="10 16" />

        {/* Poydevor arkalari (Foundation Arch Spans) */}
        <path d="M 0,210 Q 120,165 240,210" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" fill="none" />
        <path d="M 240,210 Q 720,150 1200,210" stroke="white" strokeWidth="3" strokeOpacity="0.3" fill="none" />
        <path d="M 1200,210 Q 1320,165 1440,210" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" fill="none" />

        <path d="M 20,210 Q 120,175 220,210" stroke="white" strokeWidth="1.2" strokeOpacity="0.15" fill="none" />
        <path d="M 260,210 Q 720,165 1180,210" stroke="white" strokeWidth="1.5" strokeOpacity="0.18" fill="none" />
        <path d="M 1220,210 Q 1320,175 1420,210" stroke="white" strokeWidth="1.2" strokeOpacity="0.15" fill="none" />

        {/* Asosiy ko'prik yo'li (Continuous Roadway Deck) */}
        <line x1="0" y1="200" x2="1440" y2="200" stroke="white" strokeWidth="4" strokeOpacity="0.45" />
        <line x1="0" y1="207" x2="1440" y2="207" stroke="white" strokeWidth="1.5" strokeDasharray="12 8" strokeOpacity="0.25" />

        {/* Osma kabellar (Main Suspension Cables - 3 qatlamli silliq katenariya) */}
        <path
          d="M 0,140 Q 120,80 240,40 Q 720,210 1200,40 Q 1320,80 1440,140"
          stroke="url(#cta-cable-grad)"
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
        <path
          d="M 0,156 Q 120,96 240,56 Q 720,226 1200,56 Q 1320,96 1440,156"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.15"
          fill="none"
        />

        {/* Chapdagi minora (Left Pylon Tower at x=240) */}
        <g>
          <line x1="233" y1="35" x2="233" y2="235" stroke="white" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="247" y1="35" x2="247" y2="235" stroke="white" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="240" y1="20" x2="240" y2="235" stroke="url(#pylon-light)" strokeWidth="4" />

          {/* Minora trusses (X-braces) */}
          <line x1="233" y1="75" x2="247" y2="75" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="233" y1="125" x2="247" y2="125" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="233" y1="170" x2="247" y2="170" stroke="white" strokeWidth="2" strokeOpacity="0.4" />

          <line x1="233" y1="75" x2="247" y2="125" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="247" y1="75" x2="233" y2="125" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="233" y1="125" x2="247" y2="170" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="247" y1="125" x2="233" y2="170" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />

          {/* Minora cho'qqisi va mayoq */}
          <polygon points="240,12 233,35 247,35" fill="white" fillOpacity="0.7" />
          <circle cx="240" cy="12" r="4.5" fill="white" />
          <circle cx="240" cy="12" r="10" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* O'ngdagi minora (Right Pylon Tower at x=1200) */}
        <g>
          <line x1="1193" y1="35" x2="1193" y2="235" stroke="white" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="1207" y1="35" x2="1207" y2="235" stroke="white" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="1200" y1="20" x2="1200" y2="235" stroke="url(#pylon-light)" strokeWidth="4" />

          {/* Minora trusses (X-braces) */}
          <line x1="1193" y1="75" x2="1207" y2="75" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="1193" y1="125" x2="1207" y2="125" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="1193" y1="170" x2="1207" y2="170" stroke="white" strokeWidth="2" strokeOpacity="0.4" />

          <line x1="1193" y1="75" x2="1207" y2="125" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="1207" y1="75" x2="1193" y2="125" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="1193" y1="125" x2="1207" y2="170" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="1207" y1="125" x2="1193" y2="170" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />

          {/* Minora cho'qqisi va mayoq */}
          <polygon points="1200,12 1193,35 1207,35" fill="white" fillOpacity="0.7" />
          <circle cx="1200" cy="12" r="4.5" fill="white" />
          <circle cx="1200" cy="12" r="10" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* Vertikal osma simlar (Suspender cables - Ritmik va simmetrik) */}
        {[
          50, 90, 130, 170, 205,
          275, 310, 350, 390, 430, 470, 510, 550, 590, 630, 670, 710,
          730, 770, 810, 850, 890, 930, 970, 1010, 1050, 1090, 1130, 1165,
          1235, 1270, 1310, 1350, 1390
        ].map((x) => (
          <line
            key={x}
            x1={x}
            y1={
              x < 240
                ? 140 - ((240 - x) / 240) * 100
                : x > 1200
                ? 140 - ((x - 1200) / 240) * 100
                : 40 + Math.pow((x - 720) / 480, 2) * 155
            }
            x2={x}
            y2="200"
            stroke="white"
            strokeWidth="1.1"
            strokeDasharray="4 3"
            strokeOpacity="0.25"
          />
        ))}

        {/* Ilm-fan tugunlari (Knowledge Bridge Beacons) */}
        <circle cx="480" cy="160" r="3" fill="white" fillOpacity="0.7" />
        <circle cx="720" cy="195" r="4" fill="white" fillOpacity="0.9" />
        <circle cx="960" cy="160" r="3" fill="white" fillOpacity="0.7" />
      </svg>

      {/* 2. Matn orqasidagi markaziy mayin soya (Matn 100% o'qilishi uchun) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 85% at 50% 50%, rgba(188,0,13,0.7) 0%, rgba(188,0,13,0) 100%)",
        }}
      />

      {/* 3. Markaziy kontent */}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-[40px] lg:leading-[48px] tracking-tight">
          Bugunoq o&apos;rganishni boshlang!
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
          Kelajak kasblarini ResearchBridge bilan egallang. Minglab talabalar va
          soha mutaxassislari safiga qo&apos;shiling.
        </p>

        <div className="mt-6 flex justify-center sm:mt-8">
          <Button
            size="lg"
            asChild
            className="h-12 w-full sm:w-auto bg-white px-8 text-sm font-bold text-primary shadow-lg hover:bg-neutral-100 hover:text-primary transition-all duration-300 hover:scale-105"
          >
            <Link href="/courses">Barcha kurslarni ko&apos;rish</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}