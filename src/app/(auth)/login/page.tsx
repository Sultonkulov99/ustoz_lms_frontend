"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_AUTH_URL } from "@/lib/config";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAdminContact, setShowAdminContact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowAdminContact(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: login.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t("login.error.notFound"));
        }
        if (response.status === 403) {
          setShowAdminContact(true);
          throw new Error(t("login.error.notConfirmed"));
        }
        if (response.status === 401) {
          throw new Error(t("login.error.invalidCredentials"));
        }
        throw new Error(data.message || t("login.error.generic"));
      }

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.role) {
        localStorage.setItem("role", data.role);
      }
      if (data.fullName) {
        localStorage.setItem("fullName", data.fullName);
      }
      if (data.image) {
        localStorage.setItem("image", data.image);
      } else {
        localStorage.removeItem("image");
      }

      if (data.role === "SUPER_ADMIN" || data.role === "ADMIN") {
        router.push("/admin");
      } else if (data.role === "STUDENT") {
        router.push("/student/my-courses");
      } else if (data.role === "MENTOR") {
        router.push("/mentor");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || t("login.error.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="w-full max-w-[460px] rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all sm:p-10">
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn className="size-6" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t("login.title")}
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("login.subtitle")}
          </p>
        </div>

        <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Phone Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login" className="text-xs font-semibold text-foreground sm:text-sm">
              {t("login.phone")}
            </label>
            <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 shadow-2xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <User className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder={t("login.phonePlaceholder")}
                className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-foreground sm:text-sm">
              {t("login.password")}
            </label>
            <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 shadow-2xs transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <Lock className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive sm:text-sm">
              <p className="leading-relaxed">
                {error}
                {showAdminContact && (
                  <>
                    {" "}
                    {t("login.adminContact")}:{" "}
                    <a
                      href="https://t.me/Sultonqulov99"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline"
                    >
                      @Sultonqulov99
                    </a>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="mt-1 h-12 w-full gap-2 rounded-xl text-sm font-semibold shadow-xs transition-all hover:shadow-md sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("login.loading")}
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                {t("login.submit")}
              </>
            )}
          </Button>

          {/* Forgot Password Link */}
          <Link
            href="/forgot-password"
            className="text-center text-xs font-semibold text-primary transition-colors hover:underline sm:text-sm"
          >
            {t("login.forgotPassword")}
          </Link>
        </form>
      </div>
    </div>
  );
}