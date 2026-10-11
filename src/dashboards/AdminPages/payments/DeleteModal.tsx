"use client";

type DeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

import { useLanguage } from "@/contexts/LanguageContext";

export function DeleteModal({ open, onClose, onConfirm }: DeleteModalProps) {
  const { t } = useLanguage();
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "48px 40px 40px",
          width: "380px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Outer halo + inner circle with question mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "#FEE2E2",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#EF4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: "36px", fontWeight: 700, lineHeight: 1 }}>?</span>
          </div>
        </div>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "17px",
            color: "#0D1017",
            marginBottom: "28px",
            lineHeight: 1.4,
          }}
        >
          {t("common.confirmDelete")}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "11px 28px",
              borderRadius: "8px",
              border: "1px solid #E0E3E6",
              background: "#ffffff",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "11px 28px",
              borderRadius: "8px",
              border: "none",
              background: "#EF4444",
              color: "#ffffff",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
