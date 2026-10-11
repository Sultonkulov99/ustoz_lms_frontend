"use client";

import Image from "next/image";
import { Bell, Settings, ChevronDown, User, LogOut, CornerUpLeft } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";

interface Profile {
  id: number;
  phone: string;
  image: string | null;
  role: string;
  status: string;
  fullName: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  STUDENT: "O'quvchi",
  TEACHER: "O'qituvchi",
  ADMIN: "Administrator",
};

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

function formatNotifDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StudentTopbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t, languages, currentLanguage } = useLanguage();
  const { items, unreadCount, fetchList, markAsRead, markAllAsRead, removeFromList } =
    useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiFetch("/my/profile");
      if (!res.ok) throw new Error("Profilni olishda xatolik");
      const data: Profile = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Profil sahifasida ma'lumot saqlanganda shu event yuboriladi,
  // topbar buni eshitib, profilni qayta yuklaydi.
  useEffect(() => {
    function handleProfileUpdated() {
      fetchProfile();
    }
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [fetchProfile]);

  const handleNotifToggle = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      await fetchList();
    }
  };

  const handleNotifClick = async (notif: (typeof items)[number]) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    removeFromList(notif.id);
    setNotifOpen(false);
    if (notif.entityType === "question" && notif.entityId) {
      const [courseId, questionId] = notif.entityId.split(":");
      if (courseId && questionId) {
        router.push(`/student/my-courses/${courseId}?questionId=${questionId}`);
      }
    }
  };

  const displayName = profile?.fullName || "Foydalanuvchi";
  const displayRole = profile ? roleLabels[profile.role] || profile.role : "";
  const hasAvatar = !!profile?.image;
  const avatarSrc = hasAvatar ? `/files/public/${profile!.image}` : "";
  const avatarBg = hasAvatar ? "#D4D3D3" : getAvatarColor(displayName);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 bg-[#F0F1F2] px-3 xs:h-[72px] xs:px-4 sm:px-5 md:h-20 md:px-6">
      {/* Left: Page title */}
      <div className="flex min-w-0 items-center gap-2 xs:gap-2.5">
        <Image
          src="/images/student/Icon.png"
          alt="Student icon"
          width={18}
          height={18}
          className="shrink-0 xs:h-5 xs:w-5"
          style={{ objectFit: "contain" }}
        />
        <span
          className="truncate font-semibold text-black"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <span className="text-base xs:text-lg md:text-xl">Student</span>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex shrink-0 items-center gap-1.5 xs:gap-2 md:gap-3">

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={handleNotifToggle}
            className="relative flex size-9 items-center justify-center rounded-[10px] border border-[#E0E3E6] bg-white xs:size-11 md:size-12"
          >
            <Bell size={18} strokeWidth={1.5} color="#000000" className="xs:hidden" />
            <Bell size={20} strokeWidth={1.5} color="#000000" className="hidden xs:block" />
            {unreadCount > 0 && (
              <span
                className="absolute flex items-center justify-center rounded-full border border-white bg-[#EB4143] text-white"
                style={{
                  top: "6px",
                  right: "6px",
                  width: "16px",
                  height: "16px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "10px",
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div
            className="absolute right-0 top-full z-[100] flex max-h-96 w-[280px] flex-col overflow-y-auto rounded-xl border border-[#E0E3E6] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-200 xs:w-80"
            style={{
              opacity: notifOpen ? 1 : 0,
              transform: notifOpen ? "translateY(4px)" : "translateY(-8px)",
              pointerEvents: notifOpen ? "auto" : "none",
            }}
          >
            <div className="flex items-center justify-between border-b border-[#E0E3E6] px-4 py-2.5">
              <span className="font-inter text-sm font-semibold text-black">
                Bildirishnomalar
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="font-inter text-xs font-medium text-[#2563EB] hover:underline"
                >
                  Barchasini o'qilgan qilish
                </button>
              )}
            </div>

            {items.length === 0 && (
              <p className="font-inter px-4 py-6 text-center text-sm text-[#636C79]">
                Bildirishnoma yo'q
              </p>
            )}

            {items.map((notif) => (
              <button
                type="button"
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-[#F0F1F2] px-4 py-3 text-left transition-colors hover:bg-[#F7F8F9]"
                style={{ background: notif.read ? "transparent" : "#EFF6FF" }}
              >
                <span className="font-inter text-sm text-black">{notif.message}</span>
                <span className="font-inter text-xs text-[#636C79]">
                  {formatNotifDate(notif.createdAt)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings — juda tor ekranlarda joy tejash uchun yashiriladi */}
        <button
          className="hidden size-9 items-center justify-center rounded-[10px] border border-[#E0E3E6] bg-white xs:flex xs:size-11 md:size-12"
        >
          <Settings size={18} strokeWidth={1.5} color="#000000" className="md:hidden" />
          <Settings size={20} strokeWidth={1.5} color="#000000" className="hidden md:block" />
        </button>

        {/* Language Selector — barcha o'lchamlarda faqat bayroq ko'rinadi */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="relative z-[101] flex h-9 w-9 items-center justify-center border bg-white xs:h-11 xs:w-11 md:h-12 md:w-12"
            style={{
              borderColor: "#E0E3E6",
              borderRadius: langOpen ? "10px 10px 0px 0px" : "10px",
              borderBottom: langOpen ? "none" : "1px solid #E0E3E6",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>{currentLanguage.flag}</span>
          </button>

          <div
            className="absolute z-[100] flex w-max min-w-[160px] flex-col gap-1 border p-2"
            style={{
              top: "100%",
              right: 0,
              left: "auto",
              background: "#ffffff",
              borderRadius: "0px 0px 12px 12px",
              boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
              borderColor: "#E0E3E6",
              borderTop: "none",
              opacity: langOpen ? 1 : 0,
              transform: langOpen ? "translateY(0)" : "translateY(-8px)",
              pointerEvents: langOpen ? "auto" : "none",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {languages.map((langItem) => (
              <button
                key={langItem.code}
                onClick={() => {
                  setLang(langItem.code);
                  setLangOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: lang === langItem.code ? "#F0F1F2" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#000000",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#F0F1F2")
                }
                onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  lang === langItem.code ? "#F0F1F2" : "transparent")
                }
              >
                <span style={{ fontSize: "16px", lineHeight: 1 }}>{langItem.flag}</span>
                <span>{langItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile — mobilda faqat avatar+strelka, sm+da to'liq karta */}
        <div ref={profileRef} className="relative w-11 xs:w-12 sm:w-[190px] md:w-[220px]">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="relative z-[101] flex h-9 w-full items-center justify-center gap-2 border bg-white px-2 xs:h-11 sm:h-12 sm:justify-between sm:px-2.5 md:h-12"
            style={{
              borderColor: "#E0E3E6",
              borderRadius: profileOpen ? "10px 10px 0px 0px" : "10px",
              borderBottom: profileOpen ? "none" : "1px solid #E0E3E6",
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full xs:size-8"
                style={{
                  background: avatarBg,
                }}
              >
                {!profileLoading && hasAvatar ? (
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    width={32}
                    height={32}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                ) : !profileLoading ? (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {getInitial(displayName)}
                  </span>
                ) : null}
              </div>
              <div className="hidden min-w-0 flex-col items-start gap-0.5 sm:flex">
                <span
                  className="w-full truncate text-left"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "17px",
                    color: "#000000",
                  }}
                >
                  {profileLoading ? "Yuklanmoqda..." : displayName}
                </span>
                <span
                  className="w-full truncate text-left"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "15px",
                    color: "#636C79",
                  }}
                >
                  {profileLoading ? "" : displayRole}
                </span>
              </div>
            </div>
            <ChevronDown
              size={14}
              color="#636C79"
              className="hidden shrink-0 sm:block"
              style={{
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          <div
            className="absolute flex w-max min-w-[200px] flex-col gap-1 border p-2 xs:w-full xs:min-w-[220px]"
            style={{
              top: "100%",
              right: 0,
              background: "#ffffff",
              borderRadius: "0px 0px 12px 12px",
              boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
              borderColor: "#E0E3E6",
              borderTop: "none",
              opacity: profileOpen ? 1 : 0,
              transform: profileOpen ? "translateY(0)" : "translateY(-8px)",
              pointerEvents: profileOpen ? "auto" : "none",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#000000",
                width: "100%",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#F0F1F2")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
              }
            >
              <span style={{ fontFamily: "Inter, sans-serif" }}>{t("topbar.backToSite")}</span>
              <CornerUpLeft size={16} color="#000000" />
            </button>

            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/student/profile");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#000000",
                width: "100%",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#F0F1F2")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
              }
            >
              <span style={{ fontFamily: "Inter, sans-serif" }}>{t("topbar.profileInfo")}</span>
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#000000",
                width: "100%",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#F0F1F2")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
              }
            >
              <span style={{ fontFamily: "Inter, sans-serif" }}>{t("topbar.logout")}</span>
              <LogOut size={16} color="#000000" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}