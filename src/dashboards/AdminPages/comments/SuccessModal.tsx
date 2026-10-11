"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: "add" | "edit" | "delete";
};

export function SuccessModal({ open, onClose, message, type = "add" }: SuccessModalProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const isAdd = type === "add";
  const glowColor = isAdd ? "#DCFCE7" : "#E0F2FE";
  const circleColor = isAdd ? "#22C55E" : "#2563EB";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          width: "320px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: glowColor,
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: circleColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={28} color="#ffffff" strokeWidth={3} />
          </div>
        </div>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "16px",
            color: "#0D1017",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
