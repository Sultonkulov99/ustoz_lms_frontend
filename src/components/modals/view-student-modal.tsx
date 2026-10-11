"use client";

import Image from "next/image";
import { User, X, Phone, Calendar, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export type ViewStudentData = {
  name: string;
  avatar: any;
  phone: string;
  role: string;
  createdAt: string;
  status: string;
};

type ViewStudentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: ViewStudentData | null;
};

export function ViewStudentModal({ open, onOpenChange, student }: ViewStudentModalProps) {
  const { t } = useLanguage();
  if (!open || !student) return null;

  const handleClose = () => onOpenChange(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl bg-card p-8"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">{t("modal.studentDetails")}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.close")}
            className="text-foreground hover:text-muted-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          {student.avatar && (typeof student.avatar === "string" ? student.avatar.trim() !== "" : true) ? (
            <Image
              src={student.avatar}
              alt={student.name}
              width={80}
              height={80}
              className="size-20 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <User className="size-9 text-muted-foreground" />
            </div>
          )}

          <p className="mt-4 text-lg font-bold text-foreground">{student.name}</p>
          <p className="text-sm text-muted-foreground">{student.role}</p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Phone className="size-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{student.phone}</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{student.createdAt}</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{student.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}