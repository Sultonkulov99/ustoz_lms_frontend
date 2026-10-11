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

 const glowColor = "rgba(34, 197, 94, 0.15)";
  const iconBgColor = "#22C55E";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1500,
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
          padding: "40px 32px",
          width: "100%",
          maxWidth: "360px",
          position: "relative",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        {/* Glow Ring Wrapper */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: glowColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {/* Solid Check Circle */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: iconBgColor,
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
