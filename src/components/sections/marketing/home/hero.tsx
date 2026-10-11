import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedHeadline } from "./animated-headline";

export function Hero() {
  return (
    <section className="relative min-h-[500px] overflow-hidden border-b border-border/80 bg-[#FAF8F7] sm:min-h-[560px] lg:h-[620px] dark:bg-background">
      {/* 1. Ko'p qatlamli atmosfera nurlari (Ambient Lighting) */}
      <div className="pointer-events-none absolute -top-28 right-0 size-[620px] rounded-full bg-primary/8 blur-[140px] dark:bg-primary/14" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 size-[420px] rounded-full bg-primary/4 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-[340px] rounded-full bg-orange-400/5 blur-[110px]" />

      {/* 2. Nozik texnologik to'r (Blueprint Grid) */}
      <svg
        className="pointer-events-none absolute inset-0 size-full stroke-neutral-300/35 [mask-image:radial-gradient(ellipse_at_70%_45%,white_20%,transparent_80%)] dark:stroke-neutral-800/35"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero-tech-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 40V.5H40" fill="none" strokeWidth="1" />
            <circle
              cx="0.5"
              cy="0.5"
              r="1"
              className="fill-neutral-400/40 dark:fill-neutral-600/40"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-tech-grid)" />
      </svg>

      {/* 3. ResearchBridge: Me'moriy ko'prik + Bilim & IT elementlari (Center & Right) */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-full lg:w-4/5 overflow-hidden">
        <svg
          viewBox="0 0 1000 620"
          className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-[96%] w-auto max-w-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="hero-bridge-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#BC000D" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#BC000D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E53935" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient
              id="cable-glow-grad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#BC000D" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#BC000D" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="deck-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BC000D" stopOpacity="0.08" />
              <stop offset="40%" stopColor="#BC000D" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#BC000D" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Pastki suv to'lqinlari va akslanish chiziqlari */}
          <line
            x1="120"
            y1="510"
            x2="1000"
            y2="510"
            stroke="#BC000D"
            strokeWidth="1"
            strokeOpacity="0.12"
            strokeDasharray="20 12"
          />
          <line
            x1="220"
            y1="522"
            x2="980"
            y2="522"
            stroke="#BC000D"
            strokeWidth="0.8"
            strokeOpacity="0.08"
            strokeDasharray="14 18"
          />

          {/* Pastki tayanch arkalar (Foundation Arch Spans) */}
          <path
            d="M 120,440 Q 280,380 440,440"
            stroke="#BC000D"
            strokeWidth="2.5"
            strokeOpacity="0.25"
            fill="none"
          />
          <path
            d="M 440,440 Q 600,375 760,440"
            stroke="#BC000D"
            strokeWidth="2.5"
            strokeOpacity="0.25"
            fill="none"
          />
          <path
            d="M 760,440 Q 880,395 1000,440"
            stroke="#BC000D"
            strokeWidth="2"
            strokeOpacity="0.2"
            fill="none"
          />

          {/* Asosiy osma kabellar (Main Suspension Cables) */}
          <path
            d="M 80,180 Q 440,490 740,210 Q 860,340 1000,240"
            stroke="url(#hero-bridge-grad)"
            strokeWidth="3.5"
            fill="none"
          />
          <path
            d="M 80,195 Q 440,505 740,225 Q 860,355 1000,255"
            stroke="url(#hero-bridge-grad)"
            strokeWidth="2"
            strokeOpacity="0.7"
            fill="none"
          />

          {/* Ko'prik ustunlari (Pylon 1 - Markaziy baland minora) */}
          <g>
            <line
              x1="432"
              y1="80"
              x2="432"
              y2="480"
              stroke="#BC000D"
              strokeWidth="2"
              strokeOpacity="0.35"
            />
            <line
              x1="448"
              y1="80"
              x2="448"
              y2="480"
              stroke="#BC000D"
              strokeWidth="2"
              strokeOpacity="0.35"
            />
            <line
              x1="440"
              y1="65"
              x2="440"
              y2="480"
              stroke="#BC000D"
              strokeWidth="3.5"
              strokeOpacity="0.5"
            />

            {/* Minora bog'lovchilari (Trusses) */}
            <line
              x1="432"
              y1="130"
              x2="448"
              y2="130"
              stroke="#BC000D"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            <line
              x1="432"
              y1="210"
              x2="448"
              y2="210"
              stroke="#BC000D"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            <line
              x1="432"
              y1="290"
              x2="448"
              y2="290"
              stroke="#BC000D"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            <line
              x1="432"
              y1="370"
              x2="448"
              y2="370"
              stroke="#BC000D"
              strokeWidth="2"
              strokeOpacity="0.4"
            />

            <line
              x1="432"
              y1="130"
              x2="448"
              y2="210"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <line
              x1="448"
              y1="130"
              x2="432"
              y2="210"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <line
              x1="432"
              y1="210"
              x2="448"
              y2="290"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <line
              x1="448"
              y1="210"
              x2="432"
              y2="290"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />

            <polygon
              points="440,55 432,78 448,78"
              fill="#BC000D"
              fillOpacity="0.6"
            />
            <circle cx="440" cy="55" r="5" fill="#BC000D" />
            <circle
              cx="440"
              cy="55"
              r="11"
              stroke="#BC000D"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
          </g>

          {/* Ko'prik ustunlari (Pylon 2 - O'ngdagi minora) */}
          <g>
            <line
              x1="733"
              y1="130"
              x2="733"
              y2="480"
              stroke="#BC000D"
              strokeWidth="1.8"
              strokeOpacity="0.3"
            />
            <line
              x1="747"
              y1="130"
              x2="747"
              y2="480"
              stroke="#BC000D"
              strokeWidth="1.8"
              strokeOpacity="0.3"
            />
            <line
              x1="740"
              y1="115"
              x2="740"
              y2="480"
              stroke="#BC000D"
              strokeWidth="3"
              strokeOpacity="0.4"
            />

            <polygon
              points="740,108 733,128 747,128"
              fill="#BC000D"
              fillOpacity="0.5"
            />
            <circle cx="740" cy="108" r="4.5" fill="#BC000D" />
            <circle
              cx="740"
              cy="108"
              r="9"
              stroke="#BC000D"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
          </g>

          {/* Asosiy yo'l qavati (Roadway Deck) */}
          <line
            x1="50"
            y1="440"
            x2="1000"
            y2="440"
            stroke="url(#deck-grad)"
            strokeWidth="4.5"
          />
          <line
            x1="50"
            y1="448"
            x2="1000"
            y2="448"
            stroke="#BC000D"
            strokeWidth="2"
            strokeDasharray="10 6"
            strokeOpacity="0.25"
          />

          {/* Vertikal osma simlar (Vertical Suspenders) */}
          {[
            120, 150, 180, 210, 240, 270, 300, 330, 360, 390,
            490, 520, 550, 580, 610, 640, 670, 700,
            780, 810, 840, 870, 900, 930
          ].map((x) => (
            <line
              key={x}
              x1={x}
              y1="230"
              x2={x}
              y2="440"
              stroke="url(#cable-glow-grad)"
              strokeWidth="1.1"
              strokeDasharray="4 3"
            />
          ))}

          {/* ======================================================== */}
          {/* MARKAZIY VA O'NG BILIM & IT ELEMENTLARI (Knowledge & IT) */}
          {/* ======================================================== */}

          {/* 1. Code Brackets < / > (Dasturlash belgisi - Markazroqda) */}
          <g transform="translate(180, 190)">
            <rect
              x="-24"
              y="-24"
              width="48"
              height="48"
              rx="12"
              fill="#BC000D"
              fillOpacity="0.05"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <path
              d="M -8,-6 L -14,0 L -8,6"
              stroke="#BC000D"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.6"
            />
            <path
              d="M 8,-6 L 14,0 L 8,6"
              stroke="#BC000D"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.6"
            />
            <path
              d="M -2,8 L 2,-8"
              stroke="#BC000D"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
          </g>

          {/* 2. Scientific Atom / Research Node (Ilmiy tadqiqot belgisi) */}
          <g transform="translate(290, 130)">
            <rect
              x="-22"
              y="-22"
              width="44"
              height="44"
              rx="12"
              fill="#BC000D"
              fillOpacity="0.04"
              stroke="#BC000D"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
            <circle cx="0" cy="0" r="3.5" fill="#BC000D" fillOpacity="0.7" />
            <ellipse
              cx="0"
              cy="0"
              rx="16"
              ry="6"
              transform="rotate(30)"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="16"
              ry="6"
              transform="rotate(-30)"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
          </g>

          {/* 3. Academic Cap / Knowledge (Bitiruv kepkasi - Yuqori markaz) */}
          <g transform="translate(320, 270)">
            <rect
              x="-22"
              y="-22"
              width="44"
              height="44"
              rx="12"
              fill="#BC000D"
              fillOpacity="0.04"
              stroke="#BC000D"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
            <path
              d="M 0,-7 L 13,-1 L 0,5 L -13,-1 Z"
              fill="#BC000D"
              fillOpacity="0.2"
              stroke="#BC000D"
              strokeWidth="1.4"
              strokeOpacity="0.5"
            />
            <path
              d="M -9,2 L -9,7 C -9,10.5 9,10.5 9,7 L 9,2"
              stroke="#BC000D"
              strokeWidth="1.3"
              strokeOpacity="0.5"
            />
            <line
              x1="13"
              y1="-1"
              x2="13"
              y2="7"
              stroke="#BC000D"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
          </g>

          {/* 4. Function / Code object { } */}
          <g transform="translate(560, 140)">
            <rect
              x="-20"
              y="-20"
              width="40"
              height="40"
              rx="10"
              fill="#BC000D"
              fillOpacity="0.04"
              stroke="#BC000D"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
            <text
              x="0"
              y="6"
              textAnchor="middle"
              fontSize="16"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#BC000D"
              fillOpacity="0.6"
            >
              &#123; &#125;
            </text>
          </g>

          {/* 5. Terminal / CLI Prompt (Markaz pastrog'i) */}
          <g transform="translate(230, 360)">
            <rect
              x="-24"
              y="-16"
              width="48"
              height="32"
              rx="8"
              fill="#BC000D"
              fillOpacity="0.04"
              stroke="#BC000D"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
            <path
              d="M -15,-5 L -9,0 L -15,5"
              stroke="#BC000D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.5"
            />
            <line
              x1="-5"
              y1="5"
              x2="7"
              y2="5"
              stroke="#BC000D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
          </g>

          {/* 6. Binary Data Stream (0101 kodlar oqimi) */}
          <text
            x="170"
            y="426"
            fontSize="10"
            fontFamily="monospace"
            fill="#BC000D"
            fillOpacity="0.32"
            letterSpacing="3"
          >
            01001001 01010100
          </text>
          <text
            x="500"
            y="426"
            fontSize="10"
            fontFamily="monospace"
            fill="#BC000D"
            fillOpacity="0.3"
            letterSpacing="3"
          >
            01010011 01000011 01001001
          </text>

          {/* 7. Bog'lovchi elektron tarmoq yo'laklari (Circuit Traces & Constellation) */}
          <path
            d="M 180,190 L 290,130 L 440,65 L 560,140 L 740,115"
            stroke="#BC000D"
            strokeWidth="1"
            strokeOpacity="0.18"
            strokeDasharray="6 6"
            fill="none"
          />
          <path
            d="M 180,190 L 230,360 L 320,270 L 440,440"
            stroke="#BC000D"
            strokeWidth="1"
            strokeOpacity="0.16"
            strokeDasharray="5 5"
            fill="none"
          />

          <path
            d="M 230,376 L 230,440 L 270,440"
            stroke="#BC000D"
            strokeWidth="1.2"
            strokeOpacity="0.25"
            fill="none"
          />
          <circle cx="270" cy="440" r="3" fill="#BC000D" fillOpacity="0.5" />

          <path
            d="M 320,292 L 320,380 L 380,380 L 380,440"
            stroke="#BC000D"
            strokeWidth="1.2"
            strokeOpacity="0.2"
            fill="none"
          />
          <circle cx="380" cy="440" r="3" fill="#BC000D" fillOpacity="0.5" />
        </svg>

        {/* Chap tomonga yumshoq o'chish gradienti (matn o'qilishi 100% tiniq bo'lishi uchun) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(250,248,247,1) 0%, rgba(250,248,247,0.85) 18%, rgba(250,248,247,0.15) 50%, rgba(250,248,247,0) 75%)",
          }}
        />
      </div>

      {/* 4. Asosiy matn va O'zbek tilidagi 2 ta toza tugma */}
      <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="flex w-full max-w-2xl flex-col gap-5 py-2">
          <AnimatedHeadline className="w-full max-w-[672px] text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl sm:leading-[1.15] md:text-5xl lg:text-[60px] lg:leading-[60px] lg:tracking-[-0.6px]" />

          <p className="max-w-[512px] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg lg:text-[22px] lg:leading-[34px] lg:tracking-[0.44px]">
            ResearchBridge bilan yangi ko&apos;nikmalarni o&apos;rganing. Bizning
            kurslarimiz soha mutaxassislari tomonidan ishlab chiqilgan bo&apos;lib,
            oson va tushunarli tilda dars beriladi.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center mt-6 gap-5 sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto px-7">
              <Link href="/courses">
                <Compass className="size-5 mr-2" />
                Kurslarni ko&apos;rish
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto bg-white/80 px-7 dark:bg-card"
            >
              <Link href="/about">Batafsil ma&apos;lumot</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}