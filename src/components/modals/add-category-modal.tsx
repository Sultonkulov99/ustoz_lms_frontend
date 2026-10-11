"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type AddCategoryFormData = {
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddCategoryFormData) => void;
  mode?: "add" | "edit";
  initialData?: Partial<AddCategoryFormData>;
};

export function AddCategoryModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "add",
  initialData,
}: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  // Modal ochilganda: "edit" bo'lsa initialData bilan, "add" bo'lsa bo'sh holatdan boshlaydi
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    onSubmit({ name });
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
            {mode === "edit" ? t("modal.editCategory") : t("modal.addCategory")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.close")}
            className="text-foreground hover:text-muted-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="categoryName" className="text-sm font-bold text-foreground">
              {t("modal.categoryName")}
            </label>
            <input
              id="categoryName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              placeholder={t("common.enterValue")}
              className={`h-11 rounded-lg border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground ${
                error
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-ring"
              }`}
            />
            {error && <p className="text-sm text-destructive">{t("common.requiredField")}</p>}
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