"use client";

import Link from "next/link";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactAdminModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ADMIN_TELEGRAM_USERNAME = "@Sultonqulov99";
const ADMIN_TELEGRAM_LINK = "https://t.me/Sultonqulov99";

export function ContactAdminModal({ open, onOpenChange }: ContactAdminModalProps) {
  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] rounded-[24px] bg-white p-12"
        style={{ boxShadow: "0px 1px 2px 0px #0000000D" }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Yopish"
          className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div
          className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full"
          style={{ background: "#F0FDF4" }}
        >
          <Send className="size-7" style={{ color: "#16A34A" }} />
        </div>

        <h1 className="text-center text-[28px] font-bold leading-[36px] tracking-[0.32px] text-foreground">
          Ro&apos;yxatdan muvaffaqiyatli o&apos;tdingiz!
        </h1>

        <p className="mt-4 text-center text-base leading-6 text-muted-foreground">
          Kursni xarid qilish uchun adminga murojaat qiling:{" "}
          <Link
            href={ADMIN_TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:underline"
          >
            {ADMIN_TELEGRAM_USERNAME}
          </Link>
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href={ADMIN_TELEGRAM_LINK} target="_blank" rel="noopener noreferrer">
            <Button type="button" size="lg" className="w-full">
              <Send className="size-5" />
              Telegramga o&apos;tish
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Keyinroq
          </button>
        </div>
      </div>
    </div>
  );
}