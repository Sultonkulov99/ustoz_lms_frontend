
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #C4B5FD 100%)",
  "linear-gradient(135deg, #7C2D12 0%, #EA580C 50%, #FDBA74 100%)",
  "linear-gradient(135deg, #164E63 0%, #0891B2 50%, #67E8F9 100%)",
  "linear-gradient(135deg, #831843 0%, #DB2777 50%, #F9A8D4 100%)",
  "linear-gradient(135deg, #14532D 0%, #16A34A 50%, #86EFAC 100%)",
];

const TELEGRAM_ADMIN_LINK = "https://t.me/Sultonqulov99";

function pickGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

function formatPrice(price: string) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return num.toLocaleString("uz-UZ").replace(/,/g, " ");
}

function TelegramContactModal({
  open,
  title,
  onClose,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
}) {
  if (!open) return null;

  const handleGoToTelegram = () => {
    window.open(TELEGRAM_ADMIN_LINK, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">
        <div className="mb-2 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#636C79] transition-colors hover:bg-[#F0F1F2]"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#EAF6FF]">
          <Send size={26} color="#229ED9" />
        </div>

        <h2 className="font-inter mb-2 text-lg font-bold text-[#0D1017]">{title}</h2>

        <p className="font-inter mb-6 text-sm leading-relaxed text-[#636C79]">
          Kursni sotib olish uchun Telegram orqali admin bilan bog&apos;laning
        </p>

        <button
          onClick={handleGoToTelegram}
          className="font-inter flex w-full items-center justify-center gap-2 rounded-lg bg-[#229ED9] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Send size={16} />
          Telegram orqali bog&apos;lanish
        </button>
      </div>
    </div>
  );
}

type Props = {
  courseId?: string;
  bannerUrl?: string | null;
  title?: string;
  price?: string;
  about?: string;
  rating?: number;
  variant?: "marketing" | "student";
};

export function CoursePurchaseCard({
  courseId = "",
  bannerUrl = null,
  title = "",
  price = "0",
  about = "",
  rating = 0,
  variant = "marketing",
}: Props) {
  const router = useRouter();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const percentage = (rating / 5) * 100;

  const handleBuyClick = () => {
    if (variant === "student") {
      setIsContactModalOpen(true);
      return;
    }
    sessionStorage.setItem("canAccessRegister", "true");
    sessionStorage.setItem("purchaseCourseId", courseId);
    router.push("/register");
  };

  return (
    <div
      className="flex w-full max-w-none lg:max-w-[429px] flex-col gap-3.5 overflow-hidden rounded-2xl sm:rounded-xl border border-border/80 sm:border-2 bg-white shadow-xs"
      style={{
        borderColor: "#E4E2E2",
      }}
    >
      {/*
        Rasm endi tashqi kartaning o'ziga (padding'siz) joylashtirilgan.
        Shu bois uning kengligi va chap/o'ng chekkalari pastdagi narx
        blokining kengligi va chekkalari bilan bir xil (aynan shu bitta
        border ichida) — ya'ni ikkalasi tekis (flush) turadi.

        object-contain: rasm qirqilmasdan, to'liq ko'rinadi.
        bg-white: rasm atrofidagi bo'sh joylar toza ko'rinishi uchun.
      */}
      <div
        className="relative h-[160px] sm:h-[210px] lg:h-[245px] w-full shrink-0 bg-white"
        style={{ background: bannerUrl ? "#ffffff" : pickGradient(title) }}
      >
        {bannerUrl ? (
          <Image src={bannerUrl} alt={title} fill className="block object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-lg font-bold text-white/90">
            {title}
          </div>
        )}
      </div>

      {/* Narx, tavsif, reyting va tugma: qat'iy tartibda (narx -> desc -> star -> button) */}
      <div className="flex flex-col gap-3.5 p-4 sm:p-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold leading-[30px] text-foreground">
            {Number(price) === 0 ? "Bepul" : `${formatPrice(price)} UZS`}
          </span>
        </div>

        {/* 1. Narxdan keyin qat'iy desc (tavsif) chiqadi */}
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {about?.trim() ||
            "Ushbu kurs orqali siz zamonaviy texnologiyalar va amaliy loyihalar ustida professional darajada ishlashni o'rganasiz."}
        </p>

        {/* 2. Tavsifdan keyin star (reyting) chiqadi */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex gap-1">
            <div className="flex gap-1 text-[#E0E3E6] dark:text-neutral-700">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 sm:size-4.5" fill="currentColor" stroke="none" />
              ))}
            </div>
            <div
              className="absolute left-0 top-0 flex gap-1 overflow-hidden"
              style={{ width: `${percentage}%`, color: "#FCB823" }}
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 sm:size-4.5 shrink-0" fill="currentColor" stroke="none" />
              ))}
            </div>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
            ({rating > 0 ? rating.toFixed(1) : "0"})
          </span>
        </div>

        {/* 3. Sotib olish tugmasi */}
        <Button
          variant="default"
          size="lg"
          className="mt-1 w-full rounded-xl font-bold shadow-xs transition-transform active:scale-[0.99]"
          onClick={handleBuyClick}
        >
          Sotib olish
        </Button>
      </div>

      {variant === "student" && (
        <TelegramContactModal
          open={isContactModalOpen}
          title={title}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}