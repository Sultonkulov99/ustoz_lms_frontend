"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type AddMentorFormData = {
  fullName: string;
  phone: string;
  password: string;
  experience: string;
  profession: string;
  website: string;
  bio: string;
  facebook: string;
  telegram: string;
  linkedin: string;
  instagram: string;
  github: string;
};

const emptyForm: AddMentorFormData = {
  fullName: "",
  phone: "",
  password: "",
  experience: "",
  profession: "",
  website: "",
  bio: "",
  facebook: "",
  telegram: "",
  linkedin: "",
  instagram: "",
  github: "",
};

// ---------------------------------------------------------------------------
// Backend'dan (class-validator) kelgan ingliz tilidagi xato xabarlarini
// foydalanuvchiga tushunarli o'zbek tiliga o'giradi.
// ---------------------------------------------------------------------------
const FIELD_LABELS: Record<string, string> = {
  fullName: "F.I.Sh",
  phone: "Telefon raqam",
  password: "Parol",
  experience: "Tajriba",
  profession: "Kasb",
  website: "Veb-sayt",
  bio: "Bio",
  facebook: "Facebook",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  github: "GitHub",
};

function translateOneMessage(raw: string): string {
  const msg = raw.trim();
  const fieldKey = msg.match(/^(\w+)\s/)?.[1];
  const label = (fieldKey && FIELD_LABELS[fieldKey]) || fieldKey || "Maydon";

  let m: RegExpMatchArray | null;

  if ((m = msg.match(/must not be greater than (\d+)/))) {
    return `${label} ${m[1]} dan katta bo'lishi mumkin emas`;
  }
  if ((m = msg.match(/must not be less than (\d+)/))) {
    return `${label} ${m[1]} dan kichik bo'lishi mumkin emas`;
  }
  if (msg.includes("must be a number")) {
    return `${label} faqat raqamlardan iborat bo'lishi kerak`;
  }
  if ((m = msg.match(/must be longer than or equal to (\d+) characters/))) {
    return `${label} kamida ${m[1]} ta belgidan iborat bo'lishi kerak`;
  }
  if ((m = msg.match(/must be shorter than or equal to (\d+) characters/))) {
    return `${label} ko'pi bilan ${m[1]} ta belgidan iborat bo'lishi kerak`;
  }
  if (msg.includes("should not be empty") || msg.includes("must be defined")) {
    return `${label} to'ldirilishi shart`;
  }
  if (msg.includes("must be a valid phone")) {
    return `${label} noto'g'ri formatda kiritilgan`;
  }

  // Tanilmagan xabar bo'lsa — asl matnni qaytaramiz (butunlay yo'qolib ketmasin)
  return msg;
}

/** Vergul bilan ajratilgan yoki massiv ko'rinishidagi xato xabarlarini o'zbekchaga o'giradi */
export function translateApiError(message: string | string[]): string {
  const parts = Array.isArray(message) ? message : message.split(",");
  return parts.map((p) => translateOneMessage(p)).join("\n");
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Muvaffaqiyatli bo'lsa hech narsa qaytarmasin (yoki resolve bo'lsin).
   * Xatolik bo'lsa `throw new Error(message)` qiling — message backend
   * qaytargan xabar (string yoki vergul bilan ajratilgan) bo'lishi kerak.
   */
  onSubmit: (data: AddMentorFormData) => Promise<void>;
  /** "add" — bo'sh forma bilan qo'shish, "edit" — mavjud ma'lumot bilan tahrirlash */
  mode?: "add" | "edit";
  /** "edit" rejimida oldindan to'ldiriladigan qiymatlar */
  initialData?: Partial<AddMentorFormData>;
};

function FormField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  autoComplete = "off",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
          style={icon ? { paddingRight: "2.5rem" } : undefined}
        />
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

export function AddMentorModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "add",
  initialData,
}: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<AddMentorFormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal ochilganda: "edit" bo'lsa initialData bilan to'ldiradi,
  // "add" bo'lsa bo'sh formadan boshlaydi
  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, ...initialData });
      setFieldError("");
      setApiError("");
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const update = (field: keyof AddMentorFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (isSubmitting) return; // yuborilayotganda tasodifan yopilmasin
    onOpenChange(false);
  };

  const handleSave = async () => {
    setApiError("");

    if (!form.fullName.trim()) {
      setFieldError(t("common.requiredField"));
      return;
    }
    setFieldError("");
    setIsSubmitting(true);

    try {
      await onSubmit(form);
      // Faqat muvaffaqiyatli bo'lganda modal yopiladi va forma tozalanadi
      onOpenChange(false);
    } catch (err) {
      // Xatolik bo'lsa: modal OCHIQ qoladi, kiritilgan ma'lumotlar SAQLANADI,
      // xato esa modal ichida, o'zbek tilida ko'rsatiladi.
      const rawMessage =
        err instanceof Error ? err.message : String(err ?? "");
      setApiError(translateApiError(rawMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      // Diqqat: tashqariga (fon qismiga) bosilganda ATAYLAB hech narsa
      // qilinmaydi — modal faqat X tugmasi bosilganda yopiladi.
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-8">
        {/* Sarlavha */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">
            {mode === "edit" ? t("common.edit") : t("common.add")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-foreground hover:text-muted-foreground"
            aria-label={t("common.cancel")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* API xatosi (backend'dan kelgan, o'zbekchaga o'girilgan) */}
        {apiError && (
          <div className="mb-4 whitespace-pre-line rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        {/* Asosiy maydonlar */}
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <FormField
              label={t("table.fullName")}
              value={form.fullName}
              onChange={update("fullName")}
              placeholder={t("common.enterValue")}
              autoComplete="off"
            />
            {fieldError && (
              <p className="mt-1 text-sm text-destructive">{fieldError}</p>
            )}
          </div>

          <FormField
            label={t("table.phone")}
            value={form.phone}
            onChange={update("phone")}
            placeholder="+998"
            autoComplete="off"
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              {t("auth.passwordPlaceholder")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password")(e.target.value)}
                placeholder="******"
                autoComplete="new-password"
                name="mentor-password-field"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Ikki ustunli qism: Mentor haqida ma'lumot / Ijtimoiy tarmoqlar */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {/* Chap ustun */}
          <div className="flex flex-col gap-4">
            <h3 className="border-b border-border pb-2 text-base font-bold text-foreground">
              {t("common.mentorSummary")}
            </h3>

            <FormField
              label={t("common.experience")}
              value={form.experience}
              onChange={update("experience")}
              placeholder={t("common.enterValue")}
            />

            <FormField
              label={t("common.profession")}
              value={form.profession}
              onChange={update("profession")}
              placeholder={t("common.enterValue")}
            />

            <FormField
              label={t("common.website")}
              value={form.website}
              onChange={update("website")}
              placeholder="http://"
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {t("common.bio")}
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => update("bio")(e.target.value)}
                placeholder={t("common.enterValue")}
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
              />
            </div>
          </div>

          {/* O'ng ustun */}
          <div className="flex flex-col gap-4">
            <h3 className="border-b border-border pb-2 text-base font-bold text-foreground">
              {t("common.socialMedia")}
            </h3>

            <FormField
              label="Facebook"
              value={form.facebook}
              onChange={update("facebook")}
              placeholder="Facebook.com"
              icon={<FaFacebookF className="size-4" />}
            />

            <FormField
              label="Telegram"
              value={form.telegram}
              onChange={update("telegram")}
              placeholder="Telegram.me"
              icon={<FaTelegramPlane className="size-4" />}
            />

            <FormField
              label="LinkedIn"
              value={form.linkedin}
              onChange={update("linkedin")}
              placeholder="LinkedIn"
              icon={<FaLinkedinIn className="size-4" />}
            />

            <FormField
              label="Instagram"
              value={form.instagram}
              onChange={update("instagram")}
              placeholder="Instagram.com"
              icon={<FaInstagram className="size-4" />}
            />

            <FormField
              label="GitHub"
              value={form.github}
              onChange={update("github")}
              placeholder="GitHub.com"
              icon={<FaGithub className="size-4" />}
            />
          </div>
        </div>

        {/* Saqlash tugmasi */}
        <div className="mt-8">
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}