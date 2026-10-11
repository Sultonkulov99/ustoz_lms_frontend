"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type AddAdminFormData = {
  fullName: string;
  phone: string;
  password: string;
};

const emptyForm: AddAdminFormData = {
  fullName: "",
  phone: "",
  password: "",
};

type AddAdminModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddAdminFormData) => void;
  /** "add" — bo'sh forma bilan qo'shish, "edit" — mavjud ma'lumot bilan tahrirlash */
  mode?: "add" | "edit";
  /** "edit" rejimida oldindan to'ldiriladigan qiymatlar */
  initialData?: Partial<AddAdminFormData>;
};

export function AddAdminModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "add",
  initialData,
}: AddAdminModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<AddAdminFormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fullNameError, setFullNameError] = useState(false);

  // Modal ochilganda: "edit" bo'lsa initialData bilan to'ldiradi,
  // "add" bo'lsa bo'sh formadan boshlaydi
  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, ...initialData });
      setFullNameError(false);
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      setFullNameError(true);
      return;
    }

    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[454px] rounded-2xl bg-card p-8"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">
            {mode === "edit" ? t("common.edit") : t("common.add")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.cancel")}
            className="text-foreground hover:text-muted-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-bold text-foreground">
              {t("table.fullName")}
            </label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, fullName: e.target.value }));
                if (fullNameError) setFullNameError(false);
              }}
              placeholder={t("common.enterValue")}
              className={`h-11 rounded-lg border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground ${
                fullNameError
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-ring"
              }`}
            />
            {fullNameError && (
              <p className="text-sm text-destructive">{t("common.requiredField")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-bold text-foreground">
              {t("table.phone")}
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+998"
              className="h-11 rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-foreground">
              {t("auth.passwordPlaceholder")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
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

          <Button type="submit" size="sm" className="mt-2 w-full">
            <Check className="size-4" />
            {t("common.save")}
          </Button>
        </form>
      </div>
    </div>
  );
}