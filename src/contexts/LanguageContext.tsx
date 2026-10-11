"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type Lang, type TranslationKey, t as translate, LANGUAGES } from "@/i18n/translations";

// ─── Context shape ────────────────────────────────────────────────────────────
interface LanguageContextValue {
  /** Joriy til: "uz" | "ru" | "en" */
  lang: Lang;
  /** Tilni o'zgartirish */
  setLang: (lang: Lang) => void;
  /** Tarjima funksiyasi */
  t: (key: TranslationKey) => string;
  /** Mavjud tillar ro'yxati */
  languages: typeof LANGUAGES;
  /** Joriy tilning bayroq + label ma'lumotlari */
  currentLanguage: (typeof LANGUAGES)[number];
  /** true bo'lganda client mounted, localStorage o'qilgan */
  mounted: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR bilan mos kelishi uchun boshlang'ich qiymat "uz"
  // (server ham, client ham bir xil renderdan boshlanadi → hydration mismatch yo'q)
  const [lang, setLangState] = useState<Lang>("uz");
  const [mounted, setMounted] = useState(false);

  // Client mount bo'lganda localStorage dan tilni olamiz
  useEffect(() => {
    const saved = localStorage.getItem("app-lang") as Lang | null;
    if (saved && ["uz", "ru", "en"].includes(saved)) {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  // Tilni o'zgartirish + localStorage ga saqlash
  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("app-lang", newLang);
  }, []);

  // Tarjima funksiyasi — closure orqali joriy tilni biladi
  const tFn = useCallback(
    (key: TranslationKey): string => translate(lang, key),
    [lang]
  );

  const currentLanguage =
    LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: tFn,
        languages: LANGUAGES,
        currentLanguage,
        mounted,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
