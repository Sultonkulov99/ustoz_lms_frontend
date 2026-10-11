"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type AddSectionFormData = {
  categoryId: string;
  name: string;
};

type AddSectionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AddSectionFormData) => void;
  mode: "add" | "edit";
  initialData?: AddSectionFormData | null;
  defaultCategoryId: string;
  courseName: string;
};

export function AddSectionModal({
  open,
  onOpenChange,
  onSave,
  mode,
  initialData,
  defaultCategoryId,
  courseName,
}: AddSectionModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<AddSectionFormData>({
    categoryId: defaultCategoryId,
    name: "",
  });

  useEffect(() => {
    if (open) {
      setForm(initialData ?? { categoryId: defaultCategoryId, name: "" });
    }
  }, [open, initialData, defaultCategoryId]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? t("modal.addSection") : t("modal.editSection")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {t("common.assignedCourse")}
            </label>
            <input
              value={courseName}
              disabled
              style={{ background: "#F3F4F6", cursor: "not-allowed", color: "#636C79" }}
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {t("modal.sectionTitle")}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("common.enterValue")}
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <Button size="default" className="mt-2 w-full" onClick={handleSave}>
          <Check className="size-4" />
          {t("common.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}