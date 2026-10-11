import { useEffect } from "react";
import { Check } from "lucide-react";

type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: "add" | "edit";
};

export function SuccessModal({ open, onClose, message, type = "add" }: SuccessModalProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  // Sahifadagi "To'landi" statusi bilan bir xil yashil ranglar
  // (halo fon: #DCFCE7 / #F0FDF4 uslubi, doira: #16A34A) — add va edit
  // uchun bir xil, endi "type" ko'k rangni belgilamaydi.
  const iconColor = "#16A34A";
  const glowColor = "#DCFCE7";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px 24px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: glowColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={28} color="#ffffff" strokeWidth={3} />
          </div>
        </div>

        <h3
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            color: "#0D1017",
            margin: 0,
          }}
        >
          {message}
        </h3>
      </div>
    </div>
  );
}