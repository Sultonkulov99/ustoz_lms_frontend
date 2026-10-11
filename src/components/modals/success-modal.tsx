"use client";

import { useEffect } from "react";

type SuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  duration?: number;
  type?: "add" | "edit" | "error";
};

export function SuccessModal({
  open,
  onOpenChange,
  title,
  duration = 2000,
  type = "add",
}: SuccessModalProps) {
  useEffect(() => {
    if (!open) return;
    const finalDuration = type === "error" ? 3500 : duration;
    const timer = setTimeout(() => {
      onOpenChange(false);
    }, finalDuration);
    return () => clearTimeout(timer);
  }, [open, duration, onOpenChange, type]);

  if (!open) return null;

  const isError = type === "error";

  const haloBg = isError ? "#FEE2E2" : "#DCFCE7";
  const circleBg = isError ? "#EF4444" : "#22C55E";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
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
        {/* Outer halo + inner circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: haloBg,
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: circleBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              {isError ? (
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </div>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "17px",
            color: "#0D1017",
            lineHeight: 1.4,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}