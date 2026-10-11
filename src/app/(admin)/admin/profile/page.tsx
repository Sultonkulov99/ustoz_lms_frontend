"use client";

import { useEffect, useState } from "react";
import { Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PersonalInfoPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch("/my/profile");
        if (response.ok) {
          const data = await response.json();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setAvatar(data.image ? `/files/public/${data.image}` : null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiFetch("/my/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          phone,
        }),
      });
      if (response.ok) {
        alert(t("profile.updatedSuccess"));
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Xatolik yuz berdi.");
      }
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi.");
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
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="mb-8 flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={fullName}
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
        <button
          type="button"
          className="rounded-[8px] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t("common.removeImage")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm text-foreground">
            {t("profile.fullName")}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-[8px] border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm text-foreground">
            {t("profile.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            disabled
            className="h-11 cursor-not-allowed rounded-[8px] border border-border bg-muted px-4 text-sm text-muted-foreground outline-none"
          />
        </div>

        <Button type="submit" size="default" className="mt-2 w-fit">
          <Check className="size-4" />
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}