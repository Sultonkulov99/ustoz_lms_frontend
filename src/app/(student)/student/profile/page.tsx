"use client";

import { useEffect, useRef, useState } from "react";
import { Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StudentPersonalInfoPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch("/my/profile");
        if (response.ok) {
          const data = await response.json();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");

          setAvatarUrl(data.image ? `/files/public/${data.image}` : null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await apiFetch("/my/profile", {
        method: "PATCH",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFullName(data.fullName || fullName);
        if (data.image) {
          setAvatarUrl(`/files/public/${data.image}`);
          localStorage.setItem("image", data.image);
        }
        if (data.fullName) {
          localStorage.setItem("fullName", data.fullName);
        }
        setSelectedFile(null);
        setPreviewUrl(null);

        // Topbar'ga profil yangilanganini xabar berish
        window.dispatchEvent(new Event("profile-updated"));

        alert(t("profile.updatedSuccess"));
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || "Xatolik yuz berdi.");
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

  const displayedAvatar = previewUrl || avatarUrl;

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="mb-8 flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 cursor-pointer rounded-full"
          title={t("common.selectImage")}
        >
          {displayedAvatar ? (
            <img
              src={displayedAvatar}
              alt={fullName}
              className="size-16 rounded-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23F3F4F6'/><circle cx='50' cy='40' r='20' fill='%239CA3AF'/><path d='M50 65c-20 0-35 10-35 20v5h70v-5c0-10-15-20-35-20z' fill='%239CA3AF'/></svg>";
              }}
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <User className="size-8 text-muted-foreground" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            displayedAvatar ? handleRemoveImage() : fileInputRef.current?.click()
          }
          className="rounded-[8px] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          {displayedAvatar ? t("common.removeImage") : t("common.selectImage")}
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

        <Button type="submit" size="default" className="mt-2 w-fit" disabled={saving}>
          <Check className="size-4" />
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}