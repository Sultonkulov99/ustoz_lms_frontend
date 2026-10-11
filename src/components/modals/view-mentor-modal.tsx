"use client";

import Image from "next/image";
import { X, Pencil, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

export type ViewMentorData = {
  name: string;
  avatar: string;
  profession: string;
  phone: string;
  role: string;
  createdAt: string;
  experience?: string;
  courses?: string[];
  website?: string;
  socials?: {
    facebook?: string;
    telegram?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: ViewMentorData | null;
  loading?: boolean;
  onEdit: () => void;
};

// Sarlavha + qalin qiymat juftligi (masalan "Telefon raqami" / "+998...")
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

// Ijtimoiy tarmoq — qora doira ichida oq icon, havola mavjud bo'lsagina bosiladigan
function SocialIconLink({
  href,
  icon,
  label,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
}) {
  const disabled = !href;

  return (
    <a
      href={disabled ? undefined : href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
      className={`flex size-11 items-center justify-center rounded-full bg-foreground text-background ${
        disabled ? "cursor-not-allowed opacity-30" : "hover:opacity-80"
      }`}
    >
      {icon}
    </a>
  );
}

export function ViewMentorModal({ open, onOpenChange, mentor, loading, onEdit }: Props) {
  const { t } = useLanguage();
  if (!open) return null;

  const socials = mentor?.socials ?? {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-card p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sarlavha */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">{t("modal.aboutMentor")}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-foreground hover:text-muted-foreground"
            aria-label={t("common.close")}
          >
            <X className="size-5" />
          </button>
        </div>

        {loading || !mentor ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Avatar + ism + kasb */}
            <div className="mb-6 flex items-center gap-4">
              {mentor.avatar && !mentor.avatar.includes("mentor-1.png") ? (
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="size-16 rounded-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = null;
                    img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23F3F4F6'/><circle cx='50' cy='40' r='20' fill='%239CA3AF'/><path d='M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z' fill='%239CA3AF'/></svg>";
                  }}
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-muted" style={{ flexShrink: 0 }}>
                  <User className="size-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-foreground">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.profession || "—"}</p>
              </div>
            </div>

            {/* To'liq ma'lumotlar */}
            <h3 className="mb-3 border-b border-border pb-2 text-base font-bold text-foreground">
              {t("common.details")}
            </h3>
            <div className="mb-6 flex flex-col gap-3">
              <InfoRow label={t("table.phone")} value={mentor.phone} />
              <InfoRow label={t("table.role")} value={mentor.role} />
              <InfoRow label={t("table.createdAt")} value={mentor.createdAt} />
              <InfoRow label={t("common.experience")} value={mentor.experience ? `${mentor.experience} ${t("pagination.items") === "ta" ? "yil" : t("pagination.items") === "шт." ? "лет" : "years"}` : "—"} />
              <InfoRow label={`${t("common.profession")}:`} value={mentor.profession || "—"} />
            </div>

            {/* Kurslar */}
            <h3 className="mb-3 border-b border-border pb-2 text-base font-bold text-foreground">
              {t("common.courses")}
            </h3>
            <div className="mb-6 flex flex-col gap-3">
              {mentor.courses && mentor.courses.length > 0 ? (
                mentor.courses.map((course) => (
                  <InfoRow key={course} label={t("table.courseName")} value={course} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("common.noCoursesAssigned")}</p>
              )}
            </div>

            {/* Ijtimoiy tarmoqlar + Tahrirlash */}
            <h3 className="mb-3 border-b border-border pb-2 text-base font-bold text-foreground">
              {t("common.socialPages")}
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SocialIconLink
                  href={socials.facebook}
                  icon={<FaFacebookF className="size-4" />}
                  label="Facebook"
                />
                <SocialIconLink
                  href={socials.telegram}
                  icon={<FaTelegramPlane className="size-4" />}
                  label="Telegram"
                />
                <SocialIconLink
                  href={socials.instagram}
                  icon={<FaInstagram className="size-4" />}
                  label="Instagram"
                />
                <SocialIconLink
                  href={socials.linkedin}
                  icon={<FaLinkedinIn className="size-4" />}
                  label="LinkedIn"
                />
                <SocialIconLink
                  href={socials.github}
                  icon={<FaGithub className="size-4" />}
                  label="GitHub"
                />

                {mentor.website ? (
                  <a
                    href={mentor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center rounded-full bg-muted px-5 text-sm font-medium text-foreground hover:opacity-80"
                  >
                    {t("common.portfolio")}
                  </a>
                ) : (
                  <span className="flex h-11 cursor-not-allowed items-center rounded-full bg-muted px-5 text-sm font-medium text-muted-foreground opacity-50">
                    {t("common.portfolio")}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onEdit}
                className="flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Pencil className="size-4" />
                {t("common.edit")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}