"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpModal } from "@/components/modals/otp-modal";
import { ContactAdminModal } from "@/components/modals/contact-admin-modal";
import { API_AUTH_URL } from "@/lib/config";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isContactAdminOpen, setIsContactAdminOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [courseId, setCourseId] = useState<string>("");

  const router = useRouter();
  const hasCheckedRef = useRef(false);

  // Faqat "Sotib olish" tugmasi orqali kelinganda sahifa ko'rsatiladi.
  // To'g'ridan-to'g'ri /register manzili yozilsa — bosh sahifaga qaytariladi.
  // Shu bilan birga sotib olinayotgan kurs id'si ham shu yerdan o'qiladi.
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const canAccess = sessionStorage.getItem("canAccessRegister");
    const storedCourseId = sessionStorage.getItem("purchaseCourseId");

    if (canAccess === "true") {
      setIsAllowed(true);
      setCourseId(storedCourseId || "");
      sessionStorage.removeItem("canAccessRegister");
      sessionStorage.removeItem("purchaseCourseId");
    } else {
      router.replace("/");
    }
    setCheckingAccess(false);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi!");
      return;
    }

    setIsOtpModalOpen(true);
  };

  const handleOtpSubmit = async (code: string) => {
    setError("");
    setIsLoading(true);
    setIsOtpModalOpen(false);

    try {
      const formattedPhone = phone.trim().startsWith("+") ? phone.trim() : "+" + phone.trim();

      const params = new URLSearchParams();
      if (courseId) {
        params.set("courseId", courseId);
      }
      const url = params.toString()
        ? `${API_AUTH_URL}/register?${params.toString()}`
        : `${API_AUTH_URL}/register`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp: code,
          fullName: fullName.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ro'yxatdan o'tishda xatolik yuz berdi. Kod yoki ma'lumotlarni tekshiring.");
      }

      // Ro'yxatdan muvaffaqiyatli o'tdi — endi login sahifasiga emas,
      // adminga murojaat qilish haqidagi modalni ko'rsatamiz.
      setIsContactAdminOpen(true);
    } catch (err: any) {
      setError(err.message || "Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactAdminClose = (open: boolean) => {
    setIsContactAdminOpen(open);
    if (!open) {
      router.push("/login");
    }
  };

  // Ruxsat tekshirilayotgan yoki ruxsat yo'q paytda hech narsa ko'rsatilmaydi
  if (checkingAccess || !isAllowed) {
    return null;
  }

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-6 py-16"
      style={{ background: "#FBF9F8" }}
    >
      <div
        className="w-full max-w-[500px] rounded-[24px] bg-white p-12"
        style={{ boxShadow: "0px 1px 2px 0px #0000000D" }}
      >
        <h1 className="text-center text-[32px] font-bold leading-[44px] tracking-[0.32px] text-foreground">
          Ro&apos;yxatdan o&apos;tish
        </h1>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="font-bold text-foreground">
              To&apos;liq ismingizni kiriting{" "}
              <span className="text-destructive">*</span>
            </label>
            <div className="flex h-16 items-center gap-2 rounded-[12px] border-2 border-[#926F6A]/20 bg-white px-6">
              <input
                id="fullName"
                type="text"
                required
                placeholder="Kiritish"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full outline-none placeholder:text-muted-foreground bg-transparent text-foreground"
              />
              <User className="size-5 shrink-0 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-bold text-foreground">
              Telefon raqamingiz <span className="text-destructive">*</span>
            </label>
            <div className="flex h-16 items-center gap-2 rounded-[12px] border-2 border-[#926F6A]/20 bg-white px-6">
              <input
                id="phone"
                type="tel"
                required
                placeholder="+998"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full outline-none placeholder:text-muted-foreground bg-transparent text-foreground"
              />
              <Phone className="size-5 shrink-0 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-bold text-foreground">
              Parolni kiriting <span className="text-destructive">*</span>
            </label>
            <div className="flex h-16 items-center gap-2 rounded-[12px] border-2 border-[#926F6A]/20 bg-white px-6">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none placeholder:text-muted-foreground bg-transparent text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-muted-foreground" />
                ) : (
                  <Eye className="size-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="font-bold text-foreground">
              Parolni tasdiqlang <span className="text-destructive">*</span>
            </label>
            <div className="flex h-16 items-center gap-2 rounded-[12px] border-2 border-[#926F6A]/20 bg-white px-6">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full outline-none placeholder:text-muted-foreground bg-transparent text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5 text-muted-foreground" />
                ) : (
                  <Eye className="size-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Kutib turing..." : "Davom etish"}
            <ArrowRight className="size-5" />
          </Button>
        </form>
      </div>

      <OtpModal
        open={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        onSubmit={handleOtpSubmit}
      />

      <ContactAdminModal
        open={isContactAdminOpen}
        onOpenChange={handleContactAdminClose}
      />
    </div>
  );
}