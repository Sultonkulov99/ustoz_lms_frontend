"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

interface MentorProfile {
  about: string;
  job: string;
  experience: number;
  telegram: string | null;
  instagram: string | null;
  linkedin: string | null;
  facebook: string | null;
  github: string | null;
  website: string | null;
}

interface MentorListItem {
  id: number;
  fullName: string;
  mentorProfile: MentorProfile | null;
}

const emptyForm = {
  job: "",
  experience: "",
  about: "",
  telegram: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  github: "",
  website: "",
};

export default function MentorInfoPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/users/mentor/mine");
        if (!res.ok) throw new Error("Mentor ma'lumotlarini olishda xatolik");
        const data = await res.json();
        const p: MentorProfile | null = data?.mentorProfile ?? null;

        if (p) {
          setForm({
            job: p.job || "",
            experience: p.experience != null ? String(p.experience) : "",
            about: p.about || "",
            telegram: p.telegram || "",
            facebook: p.facebook || "",
            instagram: p.instagram || "",
            linkedin: p.linkedin || "",
            github: p.github || "",
            website: p.website || "",
          });
        }
      } catch (err) {
        console.error("Fetch mentor info error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Bo'sh URL maydonlarini yubormaymiz (backend bo'sh satrni URL sifatida qabul qilmaydi)
      const body: Record<string, any> = {
        job: form.job,
        experience: form.experience ? Number(form.experience) : 0,
        about: form.about,
      };

      const urlFields: (keyof typeof emptyForm)[] = [
        "telegram",
        "facebook",
        "instagram",
        "linkedin",
        "github",
        "website",
      ];

      for (const field of urlFields) {
        const value = form[field].trim();
        if (value) {
          body[field] = value;
        }
      }

      const res = await apiFetch("/my/mentor-profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = Array.isArray(errData?.message)
          ? errData.message.join(", ")
          : errData?.message || "Xatolik yuz berdi.";
        throw new Error(msg);
      }

      setSuccess("Kasbiy ma'lumotlar muvaffaqiyatli saqlandi.");
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card p-8">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="font-inter rounded-xl border border-border bg-card p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="job" className="text-sm text-foreground">
              {t("mentor.jobLabel")}
            </label>
            <input
              id="job"
              type="text"
              value={form.job}
              onChange={(e) => handleChange("job", e.target.value)}
              placeholder={t("mentor.jobPlaceholder")}
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="experience" className="text-sm text-foreground">
              {t("mentor.experienceLabel")}
            </label>
            <input
              id="experience"
              type="number"
              min={0}
              value={form.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder={t("mentor.experiencePlaceholder")}
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="about" className="text-sm text-foreground">
            {t("mentor.aboutLabel")}
          </label>
          <textarea
            id="about"
            value={form.about}
            onChange={(e) => handleChange("about", e.target.value)}
            rows={4}
            placeholder={t("mentor.aboutPlaceholder")}
            className="rounded-[8px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-ring resize-none"
          />
        </div>

        <div className="h-px bg-border" />

        <p className="text-sm font-medium text-foreground">{t("mentor.socialNetworks")}</p>
        <p className="-mt-3 text-xs text-muted-foreground">
          {t("mentor.socialNetworksHint")}
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="telegram" className="text-sm text-foreground">
              Telegram
            </label>
            <input
              id="telegram"
              type="url"
              value={form.telegram}
              onChange={(e) => handleChange("telegram", e.target.value)}
              placeholder="https://t.me/username"
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="instagram" className="text-sm text-foreground">
              Instagram
            </label>
            <input
              id="instagram"
              type="url"
              value={form.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="https://instagram.com/username"
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="facebook" className="text-sm text-foreground">
              Facebook
            </label>
            <input
              id="facebook"
              type="url"
              value={form.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
              placeholder="https://facebook.com/username"
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="linkedin" className="text-sm text-foreground">
              LinkedIn
            </label>
            <input
              id="linkedin"
              type="url"
              value={form.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="github" className="text-sm text-foreground">
              GitHub
            </label>
            <input
              id="github"
              type="url"
              value={form.github}
              onChange={(e) => handleChange("github", e.target.value)}
              placeholder="https://github.com/username"
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="website" className="text-sm text-foreground">
              {t("common.website")}
            </label>
            <input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://example.com"
              className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button type="submit" size="default" className="mt-2 w-fit" disabled={saving}>
          <Check className="size-4" />
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}