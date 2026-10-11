"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_AUTH_URL } from "@/lib/config";

const TELEGRAM_BOT_USERNAME = "@lms_otpbot";
const TELEGRAM_BOT_LINK = "https://t.me/lms_otpbot";

function normalizePhone(input: string): { formatted: string; isValid: boolean } {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 9) {
    digits = "998" + digits;
  }
  const isValid = digits.length === 12 && digits.startsWith("998");
  return {
    formatted: `+${digits}`,
    isValid,
  };
}

export default function ResetPasswordPage() {
  const router = useRouter();

  // 1: Phone, 2: OTP, 3: New Password, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [phoneInput, setPhoneInput] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Submit Phone Number
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneInput.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }

    const { formatted, isValid } = normalizePhone(phoneInput);
    if (!isValid) {
      setError(
        "Telefon raqami noto'g'ri kiritildi (+998 90 123 45 67 formatida kiriting)."
      );
      return;
    }

    setFormattedPhone(formatted);
    setStep(2);
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Iltimos, 6 xonali tasdiqlash kodini kiriting.");
      return;
    }

    setOtp(cleanOtp);
    setStep(3);
  };

  // Clipboard paste for OTP
  const handlePasteOtp = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanDigits = text.replace(/\D/g, "").slice(0, 6);
      if (cleanDigits) {
        setOtp(cleanDigits);
      }
    } catch {
      // Clipboard ruxsat berilmasa
    }
  };

  // Step 3: Submit New Password -> API call
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Iltimos, yangi parolni kiriting.");
      return;
    }

    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_AUTH_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp: otp.trim(),
          password: password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let msg = "Parolni yangilashda xatolik yuz berdi.";
        if (data?.message) {
          if (Array.isArray(data.message)) {
            msg = data.message.join(", ");
          } else if (typeof data.message === "string") {
            msg = data.message;
          }
        }
        throw new Error(msg);
      }

      // Agar backend bevosita login tokenlarini qaytarsa — avtomatik kirib ketadi
      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data.role) localStorage.setItem("role", data.role);
        if (data.fullName) localStorage.setItem("fullName", data.fullName);
        if (data.image) {
          localStorage.setItem("image", data.image);
        } else {
          localStorage.removeItem("image");
        }

        if (data.role === "SUPER_ADMIN" || data.role === "ADMIN") {
          router.push("/admin");
        } else if (data.role === "MENTOR") {
          router.push("/mentor");
        } else {
          router.push("/student/my-courses");
        }
        return;
      }

      // Aks holda muvaffaqiyat ekranini ko'rsatamiz
      setStep(4);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6"
      style={{ background: "#FBF9F8" }}
    >
      <div
        className="w-full max-w-[460px] rounded-[24px] bg-white p-7 shadow-xs transition-all sm:p-9"
        style={{ boxShadow: "0px 1px 2px 0px #0000000D" }}
      >
        {/* Full-width Step Progress Bar */}
        {step <= 3 && (
          <div className="mb-7 w-full px-1">
            <div className="relative flex items-center justify-between">
              {/* Progress track line spanning full width between outer circles */}
              <div className="absolute left-4 right-4 top-3.5 h-[2px] -translate-y-1/2 bg-muted" />
              <div
                className="absolute left-4 top-3.5 h-[2px] -translate-y-1/2 bg-primary transition-all duration-300"
                style={{
                  width:
                    step === 1
                      ? "0%"
                      : step === 2
                      ? "50%"
                      : "calc(100% - 32px)",
                }}
              />

              {[
                { num: 1, label: "Telefon" },
                { num: 2, label: "OTP kod" },
                { num: 3, label: "Yangi parol" },
              ].map((s) => {
                const isCompleted = step > s.num;
                const isCurrent = step === s.num;
                return (
                  <div
                    key={s.num}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "border-2 border-border bg-white text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? "✓" : s.num}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium transition-colors ${
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isCompleted
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Error Notice */}
        {error && (
          <div
            className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive sm:text-sm"
            role="alert"
          >
            <p>{error}</p>
            {step === 3 &&
              (error.toLowerCase().includes("kod") ||
                error.toLowerCase().includes("otp")) && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-destructive underline hover:opacity-80"
                >
                  <ArrowLeft className="size-3" />
                  Kodni qayta kiritish uchun orqaga qaytish
                </button>
              )}
          </div>
        )}

        {/* STEP 1: Phone Number */}
        {step === 1 && (
          <div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Phone className="size-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Parolni tiklash
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Hisobingizga bog&apos;langan telefon raqamingizni kiriting.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-foreground sm:text-sm">
                  Telefon raqami <span className="text-destructive">*</span>
                </label>
                <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 shadow-2xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    id="phone"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    autoComplete="tel"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-xs">
                Davom etish
                <ArrowRight className="size-4" />
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-primary transition-colors hover:underline sm:text-sm"
              >
                <ArrowLeft className="size-4" />
                Kirish sahifasiga qaytish
              </Link>
            </form>
          </div>
        )}

        {/* STEP 2: Telegram Bot OTP Confirmation */}
        {step === 2 && (
          <div>
            <div className="flex flex-col items-center text-center">
              {/* Red brand icon */}
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Send className="size-6" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Tasdiqlash kodi
              </h1>

              {/* Minimalist subtitle with direct link to bot */}
              <p className="mt-1.5 text-sm text-muted-foreground">
                Kod{" "}
                <a
                  href={TELEGRAM_BOT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {TELEGRAM_BOT_USERNAME}
                  <ExternalLink className="size-3" />
                </a>{" "}
                telegram botiga yuborildi
              </p>

              {/* Phone indicator with change link */}
              <p className="mt-1 text-xs text-muted-foreground">
                Telefon:{" "}
                <strong className="font-semibold text-foreground">
                  {formattedPhone}
                </strong>{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  className="font-medium text-primary underline hover:opacity-80"
                >
                  (O&apos;zgartirish)
                </button>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="otpCode" className="text-xs font-semibold text-foreground sm:text-sm">
                    Tasdiqlash kodi <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteOtp}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Copy className="size-3" />
                    Joylashtirish
                  </button>
                </div>

                <div className="flex h-12 items-center rounded-xl border border-border bg-background px-3.5 shadow-2xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <input
                    id="otpCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="h-full w-full bg-transparent text-center font-mono text-base tracking-[8px] text-foreground outline-none placeholder:tracking-[8px] placeholder:text-muted-foreground"
                    autoComplete="one-time-code"
                    required
                    autoFocus
                  />
                </div>
                <span className="text-center text-[11px] text-muted-foreground">
                  Botdan olgan 6 xonali kodni kiriting
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" className="h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-xs">
                  Davom etish
                  <ArrowRight className="size-4" />
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground sm:text-sm"
                >
                  <ArrowLeft className="size-4" />
                  Orqaga qaytish
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <div>
            <div className="flex flex-col items-center text-center">
              {/* Red brand icon */}
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="size-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Yangi parol
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Hisobingiz uchun yangi xavfsiz parol o&apos;rnating.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 flex flex-col gap-4">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-xs font-semibold text-foreground sm:text-sm">
                  Yangi parol <span className="text-destructive">*</span>
                </label>
                <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 shadow-2xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Lock className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 8 ta belgi"
                    className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    autoComplete="new-password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground sm:text-sm">
                  Parolni tasdiqlang <span className="text-destructive">*</span>
                </label>
                <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 shadow-2xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Lock className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolni qayta kiriting"
                    className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-xs"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Yangilanmoqda...
                    </>
                  ) : (
                    <>
                      Parolni yangilash
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground sm:text-sm"
                  disabled={isLoading}
                >
                  <ArrowLeft className="size-4" />
                  Kodni o&apos;zgartirish
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-5 py-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Parol yangilandi!
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Hisobingiz paroli muvaffaqiyatli o&apos;zgartirildi. Endi yangi
                parol bilan tizimga kirishingiz mumkin.
              </p>
            </div>
            <Button asChild size="lg" className="h-12 w-full rounded-xl font-semibold shadow-xs">
              <Link href="/login">Kirish sahifasiga o&apos;tish</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
