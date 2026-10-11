"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SecurityPage() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Bo'sh maydonlarni tekshirish
    if (!currentPassword.trim()) {
      setError(t("profile.enterCurrentPassword"));
      return;
    }
    if (!newPassword.trim()) {
      setError(t("profile.enterNewPassword"));
      return;
    }
    if (!confirmPassword.trim()) {
      setError(t("profile.enterConfirmPassword"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("profile.passwordMismatch"));
      return;
    }
    if (newPassword === currentPassword) {
      setError(t("profile.passwordSame"));
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch("/my/password/update", {
        method: "PATCH",
        body: JSON.stringify({
          password: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || "Xatolik yuz berdi.");
      }

      setSuccess(t("profile.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-sm text-foreground">
            {t("profile.currentPassword")}
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-border bg-background px-4 pr-11 text-sm text-foreground outline-none focus:border-ring"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label={showCurrent ? t("login.hidePassword") : t("login.showPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="newPassword" className="text-sm text-foreground">
            {t("profile.newPassword")}
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-border bg-background px-4 pr-11 text-sm text-foreground outline-none focus:border-ring"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? t("login.hidePassword") : t("login.showPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm text-foreground">
            {t("profile.confirmPassword")}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-border bg-background px-4 pr-11 text-sm text-foreground outline-none focus:border-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? t("login.hidePassword") : t("login.showPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
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