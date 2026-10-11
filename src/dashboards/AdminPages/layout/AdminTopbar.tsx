"use client";

import Image from "next/image";
import { Bell, Settings, ChevronDown, User, LogOut, CornerUpLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

function getInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ["#BC000D", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
  if (!name) return colors[0];
  const charCode = name.trim().toUpperCase().charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

export function AdminTopbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t, languages, currentLanguage } = useLanguage();

  const [user, setUser] = useState({
    name: "Foydalanuvchi",
    role: "",
    avatar: null as string | null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("fullName") || "Foydalanuvchi";
      const storedRole = localStorage.getItem("role") || "";
      const storedImage = localStorage.getItem("image");

      let formattedRole = storedRole;
      if (storedRole === "SUPER_ADMIN" || storedRole === "ADMIN") formattedRole = "Administrator";
      if (storedRole === "MENTOR") formattedRole = "Mentor";
      if (storedRole === "ASSISTANT") formattedRole = "Assistant";
      if (storedRole === "STUDENT") formattedRole = "O'quvchi";

      setUser({
        name: storedName,
        role: formattedRole,
        avatar: storedImage ? `/files/public/${storedImage}` : null,
      });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const avatarBg = user.avatar ? "#2563EB" : getAvatarColor(user.name);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between bg-[#F0F1F2] px-3 sm:h-20 sm:px-4 lg:px-6">
      {/* Left: Page title */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <Image
          src="/images/student/Icon.png"
          alt="Admin icon"
          width={20}
          height={20}
          className="hidden shrink-0 object-contain sm:block"
        />
        <span className="font-inter truncate text-base font-semibold leading-6 text-black sm:text-lg lg:text-xl">
          Admin
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        {/* Notification Bell */}
        <button className="relative flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#E0E3E6] bg-white sm:size-11 lg:size-12">
          <Bell size={18} strokeWidth={1.5} color="#000000" className="sm:hidden" />
          <Bell size={20} strokeWidth={1.5} color="#000000" className="hidden sm:block" />
          <span className="font-inter absolute right-1 top-1 flex size-[16px] items-center justify-center rounded-full border border-white bg-[#EB4143] text-[9px] font-medium leading-none text-white sm:right-1.5 sm:top-1.5 sm:size-[18px] sm:text-[10px]">
            5
          </span>
        </button>

        {/* Settings — mid+ ekranda ko'rinadi */}
        <button className="hidden size-11 shrink-0 items-center justify-center rounded-[10px] border border-[#E0E3E6] bg-white sm:flex lg:size-12">
          <Settings size={20} strokeWidth={1.5} color="#000000" />
        </button>

        {/* Language Switcher */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex h-10 items-center justify-between gap-1.5 rounded-[10px] border border-[#E0E3E6] bg-white px-2 sm:h-11 sm:gap-2 sm:px-3 lg:h-12 lg:px-4"
            style={{
              borderRadius: langOpen ? "10px 10px 0px 0px" : "10px",
              borderBottom: langOpen ? "none" : undefined,
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm leading-none sm:text-base">{currentLanguage.flag}</span>
              <span className="font-inter hidden whitespace-nowrap text-sm font-medium text-black lg:block">
                {currentLanguage.label}
              </span>
            </div>
            <ChevronDown
              size={14}
              color="#000000"
              className="hidden shrink-0 transition-transform duration-200 lg:block"
              style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div
            className="absolute left-0 top-full z-[100] flex w-max min-w-full flex-col gap-1 rounded-b-xl border border-t-0 border-[#E0E3E6] bg-white p-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-200"
            style={{
              opacity: langOpen ? 1 : 0,
              transform: langOpen ? "translateY(0)" : "translateY(-8px)",
              pointerEvents: langOpen ? "auto" : "none",
            }}
          >
            {languages.map((langItem) => (
              <button
                key={langItem.code}
                onClick={() => {
                  setLang(langItem.code);
                  setLangOpen(false);
                }}
                className="font-inter flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-[#F0F1F2]"
                style={{
                  background: currentLanguage.code === langItem.code ? "#F0F1F2" : "transparent",
                }}
              >
                <span className="text-base leading-none">{langItem.flag}</span>
                <span>{langItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative w-auto sm:w-[180px] lg:w-[240px]">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="relative z-[101] flex h-10 w-full items-center justify-between gap-1.5 rounded-[10px] border border-[#E0E3E6] bg-white px-1.5 sm:h-11 sm:gap-2 sm:px-2 lg:h-12 lg:px-2.5"
            style={{
              borderRadius: profileOpen ? "10px 10px 0px 0px" : "10px",
              borderBottom: profileOpen ? "none" : undefined,
            }}
          >
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <div
                className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full sm:size-8 lg:size-9"
                style={{ background: avatarBg }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const fallback = img.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="avatar-fallback font-inter flex h-full w-full items-center justify-center text-[13px] font-bold text-white lg:text-sm"
                  style={{ display: user.avatar ? "none" : "flex" }}
                >
                  {getInitial(user.name)}
                </div>
              </div>

              <div className="hidden min-w-0 max-w-[100px] flex-col items-start gap-0.5 overflow-hidden sm:flex lg:max-w-[145px]">
                <span className="font-inter w-full truncate text-left text-sm font-bold leading-[17px] text-black">
                  {user.name}
                </span>
                <span className="font-inter w-full truncate text-left text-xs font-medium leading-[15px] text-[#636C79]">
                  {user.role}
                </span>
              </div>
            </div>
            <ChevronDown
              size={14}
              color="#636C79"
              className="ml-1 hidden shrink-0 transition-transform duration-200 sm:block"
              style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div
            className="absolute right-0 top-full z-[100] flex w-max min-w-[200px] flex-col gap-1 rounded-b-xl border border-t-0 border-[#E0E3E6] bg-white p-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-200 sm:min-w-full"
            style={{
              opacity: profileOpen ? 1 : 0,
              transform: profileOpen ? "translateY(0)" : "translateY(-8px)",
              pointerEvents: profileOpen ? "auto" : "none",
            }}
          >
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/admin");
              }}
              className="font-inter flex w-full items-center justify-between whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-[#F0F1F2]"
            >
              <span>{t("topbar.backToSite")}</span>
              <CornerUpLeft size={16} color="#000000" />
            </button>

            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/admin/profile");
              }}
              className="font-inter flex w-full items-center justify-between whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-[#F0F1F2]"
            >
              <span>{t("topbar.profileInfo")}</span>
              <User size={16} color="#000000" />
            </button>

            <button
              onClick={() => {
                setProfileOpen(false);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("role");
                localStorage.removeItem("fullName");
                localStorage.removeItem("image");
                router.push("/login");
              }}
              className="font-inter flex w-full items-center justify-between whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-[#F0F1F2]"
            >
              <span>{t("topbar.logout")}</span>
              <LogOut size={16} color="#000000" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}