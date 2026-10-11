import { Laptop, Users, Award } from "lucide-react";

const features = [
  {
    icon: Laptop,
    title: "Amaliy loyihalar",
    description: "Real keyslar va shaxsiy kuchli portfolio yaratish.",
  },
  {
    icon: Users,
    title: "Kuchli mentorlar",
    description: "Senior mutaxassislardan jonli amaliy ta'lim.",
  },
  {
    icon: Award,
    title: "Xalqaro sertifikat",
    description: "Karyera va ishga joylashishda doimiy ko'mak.",
  },
];

/*
 * Hover effektlari (hammasi 1.5 soniya, "Kurs yo'nalishlari" bilan bir xil):
 * - element yuqoriga ko'tariladi
 * - ikona qutisi kattalashadi va qizil soya oladi
 * - qutining ichiga pastdan qizil gradient chiqadi
 * - ikona 360° aylanadi va qizil yetib kelganda oqqa o'tadi
 * Qizil rang: "Browse Courses" tugmasi rangi (#AC000D).
 */
const styles = `
.wc-item {
  transition: transform 1500ms ease-in-out;
}
.wc-item:hover {
  transform: translateY(-6px);
}

.wc-box {
  transition: transform 1500ms ease-in-out, box-shadow 1500ms ease-in-out,
    border-color 1500ms ease-in-out;
}
.wc-item:hover .wc-box {
  transform: scale(1.08);
  border-color: rgba(172, 0, 13, 0.5);
  box-shadow: 0 24px 40px -16px rgba(172, 0, 13, 0.4);
}

.wc-rise {
  transform: translateY(100%);
  transition: transform 1500ms ease-in-out;
  background: linear-gradient(
    to top,
    #AC000D 0%,
    rgba(172, 0, 13, 0.9) 40%,
    rgba(172, 0, 13, 0.4) 80%,
    rgba(172, 0, 13, 0.1) 100%
  );
}
.wc-item:hover .wc-rise {
  transform: translateY(0);
}

.wc-spin {
  transform-origin: center;
  transition: transform 1500ms ease-in-out, color 900ms ease-in-out;
}
.wc-item:hover .wc-spin {
  transform: rotate(360deg) scale(1.12);
  color: #ffffff;
  transition-delay: 0ms, 500ms;
}

@media (prefers-reduced-motion: reduce) {
  .wc-item, .wc-box, .wc-rise, .wc-spin { transition: none !important; }
  .wc-item:hover, .wc-item:hover .wc-box, .wc-item:hover .wc-spin { transform: none !important; }
}
`;

export function WhyChooseUs() {
  return (
    <section className="bg-[#FAF8F7] py-10 sm:py-14 lg:py-16 dark:bg-neutral-900/30">
      <style>{styles}</style>

      {/* Sarlavha qismi */}
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1B1C1C] sm:text-4xl lg:text-[44px] lg:leading-[52px] dark:text-foreground">
          Nima uchun bizni tanlashadi?
        </h2>
        <p className="mt-2.5 text-base text-[#5F5E5E] sm:text-lg lg:text-[19px] dark:text-muted-foreground">
          Sifatli ta&apos;lim va professional natija birinchi o&apos;rinda.
        </p>
      </div>

      {/* 3 ta element */}
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-10 px-4 sm:mt-12 sm:grid-cols-3 sm:gap-8 sm:px-6 lg:gap-12">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="wc-item group flex flex-col items-center text-center"
            >
              {/* Ikona qutisi: ichiga pastdan qizil gradient chiqadi */}
              <div className="wc-box relative flex size-22 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm sm:size-24 dark:bg-card">
                <span
                  aria-hidden="true"
                  className="wc-rise pointer-events-none absolute inset-0"
                />
                <span className="wc-spin relative z-10 inline-flex text-primary">
                  <Icon className="size-11 sm:size-12" strokeWidth={1.8} />
                </span>
              </div>

              {/* Sarlavha */}
              <h3 className="mt-6 text-xl font-bold text-[#1B1C1C] transition-colors duration-[1500ms] group-hover:text-primary sm:text-2xl lg:text-[26px] dark:text-foreground">
                {feature.title}
              </h3>

              {/* Tavsif */}
              <p className="mt-2.5 max-w-[320px] text-base leading-relaxed text-[#5F5E5E] lg:text-[17px] lg:leading-7 dark:text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}