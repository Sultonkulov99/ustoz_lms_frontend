"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaTelegram,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";

type Mentor = {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  socials: {
    telegram: string | null;
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    github: string | null;
  };
};

type RawMentorResponse = {
  id: number;
  fullName?: string | null;
  image?: string | null;
  mentorProfile?: {
    id?: number;
    job?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    github?: string | null;
  } | null;
};

function isValidImage(img: unknown): img is string {
  if (!img || typeof img !== "string") return false;
  const trimmed = img.trim();
  return (
    trimmed.length > 0 &&
    trimmed !== "null" &&
    trimmed !== "undefined" &&
    trimmed !== "none"
  );
}

function cleanUrl(val?: string | null): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "none"
  ) {
    return null;
  }
  return trimmed;
}

function mapMentors(items: RawMentorResponse[]): Mentor[] {
  // 1. Agar mentorda rasm bo'lmasa u ko'rsatilmaydi!
  let withImages = items.filter((item) => isValidImage(item.image));

  // Test maqsadida: agar URL da ?mock=8 bo'lsa, 8 ta mentor bilan tekshirish imkoni
  if (
    typeof window !== "undefined" &&
    window.location.search.includes("mock=8") &&
    withImages.length >= 2
  ) {
    withImages = [
      ...withImages,
      { ...withImages[0], id: 998 },
      { ...withImages[1], id: 999 },
    ];
  }

  return withImages.map((item) => {
    const rawJob = item.mentorProfile?.job?.trim();
    const cleanRole =
      rawJob && rawJob !== "............" && rawJob !== "Mentor"
        ? rawJob
        : "Senior IT Mutaxassis";

    return {
      id: item.id,
      name: item.fullName?.trim() || "Mentor",
      role: cleanRole,
      imageUrl: `${FILES_BASE_URL}/${item.image!.trim()}`,
      // 2. Ijtimoiy tarmoqlar faqat backenddan kelganlari olinadi (bo'sh bo'lsa chiqmaydi)
      socials: {
        telegram: cleanUrl(item.mentorProfile?.telegram),
        linkedin: cleanUrl(item.mentorProfile?.linkedin),
        github: cleanUrl(item.mentorProfile?.github),
        instagram: cleanUrl(item.mentorProfile?.instagram),
        facebook: cleanUrl(item.mentorProfile?.facebook),
      },
    };
  });
}

function MentorCard({
  mentor,
  isDragging,
}: {
  mentor: Mentor;
  isDragging: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  // Agar rasm yuklashda xatolik bo'lsa — ko'rsatilmaydi
  if (hasError) return null;

  // Faqat backenddan kelgan mavjud ijtimoiy tarmoqlar
  const hasAnySocials = Object.values(mentor.socials).some(Boolean);

  return (
    <div className="group relative h-[260px] w-[180px] shrink-0 select-none overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40 sm:h-[340px] sm:w-[230px] md:h-[410px] md:w-[270px]">
      {/* 1. Mentor rasmi (mobilda ixcham, desktopda to'liq) */}
      <Image
        src={mentor.imageUrl}
        alt={mentor.name}
        fill
        sizes="(max-width: 640px) 180px, (max-width: 768px) 230px, 270px"
        draggable={false}
        onError={() => setHasError(true)}
        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />

      {/* 2. Pastki gradient va soya qatlami (hoverda pastki soya yanada quyuqlashadi) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-5 md:p-6 transition-all duration-300 group-hover:from-black/98 group-hover:via-black/75">
        {/* Ismi va Yo'nalishi — HOVERSIZ HAM DOIM KO'RINIB TURADI */}
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white drop-shadow-sm sm:text-lg md:text-[22px] line-clamp-1">
            {mentor.name}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-white/85 sm:text-xs md:text-sm line-clamp-1">
            {mentor.role}
          </p>
        </div>

        {/* Ijtimoiy tarmoqlar — FAQAT backendda bo'lsa chiqadi, bo'lmasa bo'sh turadi */}
        {hasAnySocials && (
          <div className="pointer-events-auto max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:mt-2.5 sm:group-hover:mt-3.5 group-hover:max-h-14 group-hover:opacity-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {mentor.socials.telegram && (
                <Link
                  href={mentor.socials.telegram}
                  aria-label="Telegram"
                  target="_blank"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  className="flex size-7 sm:size-8 md:size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[#229ED9] hover:text-white"
                >
                  <FaTelegram className="size-3.5 sm:size-4" />
                </Link>
              )}
              {mentor.socials.linkedin && (
                <Link
                  href={mentor.socials.linkedin}
                  aria-label="LinkedIn"
                  target="_blank"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  className="flex size-7 sm:size-8 md:size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[#0A66C2] hover:text-white"
                >
                  <FaLinkedin className="size-3.5 sm:size-4" />
                </Link>
              )}
              {mentor.socials.github && (
                <Link
                  href={mentor.socials.github}
                  aria-label="GitHub"
                  target="_blank"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  className="flex size-7 sm:size-8 md:size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[#24292e] hover:text-white"
                >
                  <FaGithub className="size-3.5 sm:size-4" />
                </Link>
              )}
              {mentor.socials.instagram && (
                <Link
                  href={mentor.socials.instagram}
                  aria-label="Instagram"
                  target="_blank"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  className="flex size-7 sm:size-8 md:size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[#E4405F] hover:text-white"
                >
                  <FaInstagram className="size-3.5 sm:size-4" />
                </Link>
              )}
              {mentor.socials.facebook && (
                <Link
                  href={mentor.socials.facebook}
                  aria-label="Facebook"
                  target="_blank"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  className="flex size-7 sm:size-8 md:size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[#1877F2] hover:text-white"
                >
                  <FaFacebook className="size-3.5 sm:size-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Mentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const totalDragRef = useRef(0);
  const [hasDraggedFar, setHasDraggedFar] = useState(false);

  const offsetRef = useRef(0);
  const oneSetWidthRef = useRef(0);

  // Haqiqiy konteyner kengligini ResizeObserver orqali aniq o'lchash
  useEffect(() => {
    if (mentors.length === 0) return;
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
  }, [mentors.length]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await apiFetch("/users/mentors");
        if (response.ok) {
          const resData = await response.json();
          if (Array.isArray(resData)) {
            setMentors(mapMentors(resData));
          }
        }
      } catch (err) {
        console.error("Mentors fetch error:", err);
      }
    };
    fetchMentors();
  }, []);

  // HISOBLASH VA ANIQ IF TEKSHIRUVI:
  // Har bir karta eni: md da 270px, sm da 230px, mobilda 180px + gap
  const isMd = typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  const isSm = typeof window !== "undefined" ? window.innerWidth >= 640 : true;
  const cardW = isMd ? 270 : isSm ? 230 : 180;
  const gap = isSm ? 24 : 16;

  // Barcha mavjud mentorlar bir qatorda turishi uchun kerak bo'ladigan umumiy kenglik
  const totalCardsWidth =
    mentors.length > 0
      ? mentors.length * cardW + (mentors.length - 1) * gap
      : 0;

  // Haqiqiy konteyner kengligi (agar observer hali o'lchamagan bo'lsa, ekran kengligidan padding ayirib olinadi)
  const effectiveContainerWidth =
    containerWidth > 0
      ? containerWidth
      : typeof window !== "undefined"
      ? window.innerWidth - (isSm ? 48 : 32)
      : 0;

  // ANIQ IF TEKSHIRUVI:
  // Agar barcha mentorlar ekran/konteyner kengligiga to'liq sig'sa — karusel KERAK EMAS (isOverflowing = false).
  // Faqat va faqat ekran kengligidan chiqib ketgandagina karusel rejimiga o'tadi (isOverflowing = true).
  const isOverflowing =
    effectiveContainerWidth > 0 &&
    mentors.length > 0 &&
    totalCardsWidth > effectiveContainerWidth;

  const oneSetWidth = mentors.length * (cardW + gap);

  useEffect(() => {
    oneSetWidthRef.current = oneSetWidth;
    if (isOverflowing && oneSetWidth > 0) {
      offsetRef.current = oneSetWidth;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${oneSetWidth}px, 0, 0)`;
      }
    }
  }, [isOverflowing, oneSetWidth]);

  // Yordamchi: track transformini yangilash va chegaralarni tekshirish
  const updateTransform = (nextOffset: number) => {
    const setW = oneSetWidthRef.current;
    if (setW > 0) {
      while (nextOffset >= setW * 2) {
        nextOffset -= setW;
      }
      while (nextOffset < setW) {
        nextOffset += setW;
      }
    }
    offsetRef.current = nextOffset;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(-${nextOffset}px, 0, 0)`;
    }
  };

  // 1. Doimiy aktiv chap tomonga mayin harakatlanish (Faqat sig'maganda)
  useEffect(() => {
    if (!isOverflowing) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Foydalanuvchi qo'li bilan ushlab turmagan paytda chap tomonga faol harakatlanadi
      if (!isDraggingRef.current) {
        const speed = 0.035;
        const nextOffset = offsetRef.current + delta * speed;
        updateTransform(nextOffset);
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isOverflowing]);

  // 2. Qo'l / Sichqoncha bilan o'ngga va chapga erkin surish (Mouse Drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOverflowing) return;
    if ((e.target as HTMLElement).closest("a")) return;

    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    setHasDraggedFar(false);
    lastXRef.current = e.pageX;
    totalDragRef.current = 0;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.pageX - lastXRef.current;
      lastXRef.current = e.pageX;

      totalDragRef.current += Math.abs(deltaX);
      if (totalDragRef.current > 6) {
        setHasDraggedFar(true);
      }

      updateTransform(offsetRef.current - deltaX);
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      setTimeout(() => setHasDraggedFar(false), 50);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const lastYRef = useRef(0);
  const dragDirectionRef = useRef<"horizontal" | "vertical" | null>(null);

  // 3. Sensorli ekranlar uchun barmoq bilan o'ngga va chapga surish (Touch Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOverflowing) return;
    if ((e.target as HTMLElement).closest("a")) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    setHasDraggedFar(false);
    lastXRef.current = e.touches[0].pageX;
    lastYRef.current = e.touches[0].pageY;
    dragDirectionRef.current = null;
    totalDragRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].pageY;
    const deltaX = currentX - lastXRef.current;
    const deltaY = currentY - lastYRef.current;

    if (!dragDirectionRef.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
        dragDirectionRef.current = "vertical";
        isDraggingRef.current = false;
        setIsDragging(false);
        return;
      }
      if (Math.abs(deltaX) > 5) {
        dragDirectionRef.current = "horizontal";
      }
    }

    if (dragDirectionRef.current === "vertical") {
      return;
    }

    lastXRef.current = currentX;
    lastYRef.current = currentY;

    totalDragRef.current += Math.abs(deltaX);
    if (totalDragRef.current > 6) {
      setHasDraggedFar(true);
    }

    updateTransform(offsetRef.current - deltaX);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragDirectionRef.current = null;
    setTimeout(() => setHasDraggedFar(false), 50);
  };

  // Navigatsiya tugmalari (chap/o'ng)
  const handleScrollBy = (offsetDelta: number) => {
    updateTransform(offsetRef.current + offsetDelta);
  };

  if (mentors.length === 0) {
    return null;
  }

  // Cheksiz karusel uchun 3 to'plam
  const displayMentors = isOverflowing
    ? [...mentors, ...mentors, ...mentors]
    : mentors;

  return (
    <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 lg:pt-16 lg:pb-10">
      {/* Sarlavha va Navigatsiya */}
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between px-4 sm:px-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1B1C1C] sm:text-3xl lg:title_32 dark:text-foreground">
            Tajribali Mentorlar
          </h2>
          <p className="mt-1.5 text-sm text-[#5F5E5E] sm:text-base dark:text-muted-foreground">
            Barcha kurslarimiz tajribali amaliyotchi mutaxassislar tomonidan tayyorlangan
          </p>
        </div>

        {/* Faqat sig'maganda chiqadigan chap/o'ng boshqaruv tugmalari */}
        {isOverflowing && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleScrollBy(-(cardW + gap))}
              aria-label="Oldingi mentorlar"
              className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-xs transition-colors hover:bg-neutral-100 dark:bg-card dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => handleScrollBy(cardW + gap)}
              aria-label="Keyingi mentorlar"
              className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-xs transition-colors hover:bg-neutral-100 dark:bg-card dark:hover:bg-neutral-800"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* Asosiy konteyner */}
      <div className="w-full px-4 sm:px-6">
        <div ref={containerRef} className="w-full">
          {/* 1. Kenglikka to'liq sig'sa — Karusel KERAK EMAS: Oddiy markazlashgan qator, takrorlanmaydi, aylanmaydi */}
          {!isOverflowing ? (
            <div className="flex w-full items-center justify-center gap-4 sm:gap-6 py-1">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  isDragging={false}
                />
              ))}
            </div>
          ) : (
          /* 2. Kenglikdan chiqib ketsa — Karusel rejimiga o'tadi va doimiy chapga harakatlanadi */
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-full py-1 select-none overflow-hidden touch-pan-y ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div
              ref={trackRef}
              className="flex gap-4 sm:gap-6 w-max will-change-transform"
            >
              {displayMentors.map((mentor, index) => (
                <MentorCard
                  key={`${mentor.id}-${index}`}
                  mentor={mentor}
                  isDragging={hasDraggedFar}
                />
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}