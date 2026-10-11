"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export type Testimonial = {
  id: string | number;
  name: string;
  role: string;
  quote: string;
};

// Standart toza izohlar (Backend ulanmaguncha yoki zaxira uchun)
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote:
      "Darslar juda tushunarli va amaliyotga boy bo'ldi. Mentorlar har bir savolga erinmasdan javob berishdi. Kurs davomida real loyihalar ustida ishlab, bilimlarimni sezilarli darajada mustahkamlab oldim.",
    name: "Xurshid Istamov",
    role: "Frontend kursi o'quvchisi",
  },
  {
    id: 2,
    quote:
      "Noldan boshlagan edim. O'quv platformasi juda qulay, video darslar sifati yuqori. Ayniqsa, berilgan amaliy vazifalar orqali haqiqiy dasturlash ko'nikmalarini egallash imkoni berildi.",
    name: "Madina Aliyeva",
    role: "UI/UX dizayn o'quvchisi",
  },
  {
    id: 3,
    quote:
      "Arxitektura va zamonaviy texnologiyalar bilan ishlash bo'yicha ajoyib kurs. Nazariya bilan birga amaliy topshiriqlar mukammal muvozanatda tuzilgan. Katta rahmat!",
    name: "Javohir Toshpo'latov",
    role: "Backend kursi o'quvchisi",
  },
];

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);

  // Backend ulashga 100% tayyor: kelajakda /testimonials yoki /reviews API qo'shilganda darhol ishlaydi
  useEffect(() => {
    let isCancelled = false;

    const fetchTestimonials = async () => {
      try {
        const response = await apiFetch("/testimonials");
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : data?.data;
          if (Array.isArray(list) && list.length > 0 && !isCancelled) {
            setItems(
              list.map((item: Record<string, unknown>, idx: number) => ({
                id: (item.id as string | number) || idx,
                name: (item.authorName as string) || (item.name as string) || (item.fullName as string) || "O'quvchi",
                role: (item.role as string) || (item.courseName as string) || "Kurs o'quvchisi",
                quote: (item.content as string) || (item.comment as string) || (item.quote as string) || (item.text as string) || "",
              }))
            );
          }
        }
      } catch {
        // Backendda hozircha endpoint bo'lmasa, standart izohlar xatosiz ko'rsatiladi
      }
    };

    fetchTestimonials();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12">
      {/* Sarlavha qismi: Toza, sodda va ortiqcha bezaklarsiz */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#1B1C1C] sm:text-3xl lg:title_32 dark:text-foreground">
          Izohlar
        </h2>
        <p className="mt-1.5 text-sm text-[#5F5E5E] sm:text-base dark:text-muted-foreground">
          O&apos;quvchilarimiz tomonidan qoldirilgan izohlar
        </p>
      </div>

      {/* Grid: items-stretch tufayli barcha kartalar bir xil bo'yda turadi */}
      <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((testimonial) => (
          <div
            key={testimonial.id}
            className="flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-shadow duration-200 hover:shadow-md"
          >
            <div>
              {/* Oddiy toza quote belgisi: platforma brend qizil rangida */}
              <Quote className="size-6 text-primary fill-primary sm:size-7" />

              {/* Izoh matni: Matn uzunligidan qat'i nazar kartalar bir xil balandlikda turadi */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7 line-clamp-5">
                {testimonial.quote}
              </p>
            </div>

            {/* Muallif qismi: mt-auto orqali barcha kartalarda pastda tekis bitta chiziqda turadi */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm font-bold text-foreground sm:text-base">
                {testimonial.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {testimonial.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}