"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type OtpModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (code: string) => void;
};

const TELEGRAM_BOT_USERNAME = "@lms_otpbot";
const TELEGRAM_BOT_LINK = "https://t.me/lms_otpbot";

export function OtpModal({ open, onOpenChange, onSubmit }: OtpModalProps) {
  const [code, setCode] = useState("");

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  const handleCopy = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text.replace(/\D/g, "").slice(0, 6));
    } catch {
      // clipboard o'qib bo'lmasa, jimgina e'tiborsiz qoldiramiz
    }
  };

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

        <h1 className="text-center text-[32px] font-bold leading-[44px] tracking-[0.32px] text-foreground">
          Tasdiqlash kodi
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="otpCode" className="font-bold text-foreground">
              Tasdiqlash kodi <span className="text-destructive">*</span>
            </label>
            <div className="flex h-16 items-center gap-2 rounded-[12px] border-2 border-[#926F6A]/20 bg-white px-6">
              <input
                id="otpCode"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000-000"
                className="w-full tracking-[4px] outline-none placeholder:tracking-[4px] placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Kodni joylashtirish"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-5" />
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Tasdiqlash kodi kiritilgan telefon raqamining telegram akkaunti orqali
            telegram bot:{" "}
            <Link
              href={TELEGRAM_BOT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline"
            >
              {TELEGRAM_BOT_USERNAME}
            </Link>{" "}
            dan tasdiqlash kodini oling!
          </p>

          <Button type="submit" size="lg" className="w-full">
            Davom etish
            <ArrowRight className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}