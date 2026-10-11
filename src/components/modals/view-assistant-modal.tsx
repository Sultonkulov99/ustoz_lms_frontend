"use client";

import Image from "next/image";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Assistant } from "@/lib/assistants-data";

type ViewAssistantModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant: Assistant | null;
};

export function ViewAssistantModal({
  open,
  onOpenChange,
  assistant,
}: ViewAssistantModalProps) {
  const { t } = useLanguage();
  if (!assistant) return null;

  const hasAvatar = assistant.avatar && (typeof assistant.avatar === "string" ? assistant.avatar.trim() !== "" : true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modal.assistantDetails")}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 border-b border-border pb-4">
          {hasAvatar ? (
            <Image
              src={assistant.avatar}
              alt={assistant.name}
              width={64}
              height={64}
              className="size-16 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted" style={{ flexShrink: 0 }}>
              <User className="size-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-foreground">{assistant.name}</h3>
            <p className="text-sm text-muted-foreground">{assistant.role}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("table.phone")}</span>
            <span className="font-medium text-foreground">{assistant.phone}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("common.assignedCourse")}</span>
            <span className="font-medium text-foreground">
              {assistant.assignedCourse}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("table.createdAt")}</span>
            <span className="font-medium text-foreground">{assistant.createdAt}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("table.status")}</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {assistant.status}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}