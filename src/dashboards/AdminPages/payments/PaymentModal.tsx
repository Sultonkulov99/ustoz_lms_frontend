"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { PaymentFormData } from "./types";
import { CustomDropdown } from "./CustomDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Partial<PaymentFormData>;
  onSubmit: (data: PaymentFormData) => void;
  submitting?: boolean;
  errorMessage?: string | null;
};

const buyerOptions = [
  "Istamov Xurshid Hazratqul o'g'li",
  "Istamov Firdavs Hazratqul o'g'li",
  "Sultonkulov Shaxzod",
  "Raxmonov Diyor",
];

const courseOptions = [
  "Frontend dasturlash",
  "Python dasturlash",
  "Java dasturlash",
];

const directionOptions = [
  "Veb dasturlash",
  "Sun'iy intellekt",
  "Mobil dasturlash",
];


const paymentTypeOptions = [
  "Payme",
  "Click",
  "Uzum",
  "Naqd",
];

const statusOptions = [
  "To'landi",
  "Kutilmoqda",
  "Rad etildi",
] as const;

// "Kurs narxi" maydoni <input type="number"> bo'lgani uchun, formatlangan
// qiymatdagi (masalan "250 000") oddiy va uzilmaydigan bo'shliqlarni olib
// tashlaymiz — aks holda brauzer bu qiymatni sonli input sifatida qabul
// qila olmaydi va forma noto'g'ri ishlaydi.
function normalizeAmountForInput(value?: string) {
  if (!value) return "";
  return value.replace(/[\s\u00A0]/g, "");
}

  export function PaymentModal({
    open,
    onClose,
    mode,
    initialData,
    onSubmit,
    submitting = false,
    errorMessage = null,
  }: PaymentModalProps) {
    const { t } = useLanguage();
    const [form, setForm] = useState<PaymentFormData>({
    buyerName: "",
    courseName: "",
    direction: "",
    paymentType: "",
    status: "To'landi",
    ...initialData,
    amount: normalizeAmountForInput(initialData?.amount),
  });

  useEffect(() => {
    if (open) {
      setForm({
        buyerName: "",
        courseName: "",
        direction: "",
        paymentType: "",
        status: "To'landi",
        ...initialData,
        amount: normalizeAmountForInput(initialData?.amount),
      });
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    onSubmit(form);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Modal Title and Close Button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0D1017", margin: 0 }}>
            {mode === "add" ? t("common.add") : t("common.edit")}
          </h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            aria-label={t("common.close")}
            style={{ background: "transparent", border: "none", cursor: submitting ? "not-allowed" : "pointer" }}
          >
            <X size={20} color="#636C79" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sotib oluvchi */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.buyer")}
            </label>
            <CustomDropdown
              value={form.buyerName}
              onChange={(val) => setForm((p) => ({ ...p, buyerName: val }))}
              options={buyerOptions}
              placeholder={t("common.enterValue")}
            />
          </div>

          {/* Kurs */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("courses.coursesLabel")}
            </label>
            <CustomDropdown
              value={form.courseName}
              onChange={(val) => setForm((p) => ({ ...p, courseName: val }))}
              options={courseOptions}
              placeholder={t("common.enterValue")}
            />
          </div>

          {/* Yo'nalish */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.direction")}
            </label>
            <CustomDropdown
              value={form.direction}
              onChange={(val) => setForm((p) => ({ ...p, direction: val }))}
              options={directionOptions}
              placeholder={t("common.enterValue")}
            />
          </div>

          {/* Kurs narxi */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.price")}
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder={t("common.enterValue")}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "8px",
                border: "1px solid #E4E6EB",
                padding: "0 14px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#0D1017",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* To'lov turi */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("payments.paymentType")}
            </label>
            <CustomDropdown
              value={form.paymentType}
              onChange={(val) => setForm((p) => ({ ...p, paymentType: val }))}
              options={paymentTypeOptions}
              placeholder={t("common.enterValue")}
            />
          </div>

          {/* Holati */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.status")}
            </label>
            <CustomDropdown
              value={form.status}
              onChange={(val) => setForm((p) => ({ ...p, status: val as "To'landi" | "Kutilmoqda" | "Rad etildi" }))}
              options={statusOptions as unknown as string[]}
              placeholder={t("common.enterValue")}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                background: "#FFF1F1",
                border: "1px solid #BC000D",
                borderRadius: "8px",
                padding: "10px 14px",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#BC000D",
                fontWeight: 500,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "fit-content",
              height: "44px",
              borderRadius: "8px",
              background: "#BC000D",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 20px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {submitting ? t("common.saving") : t("common.save")}
          </button>
        </form>
      </div>
    </div>
  );
}