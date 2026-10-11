import { useState } from "react";
import { ChevronDown } from "lucide-react";

type CustomDarsSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: { id: string; topic: string }[];
  placeholder?: string;
};

export function CustomDarsSelect({ value, onChange, options, placeholder = "Veb dasturlashga kirish" }: CustomDarsSelectProps) {
  const [open, setOpen] = useState(false);

  // Find the selected topic
  const selectedOption = options.find((o) => o.topic === value) || options.find((o) => o.topic === placeholder);
  const displayValue = selectedOption ? selectedOption.topic : placeholder;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          border: "1px solid #E0E3E6",
          borderRadius: "8px",
          padding: "10px 14px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          color: "#0D1017",
          background: "#ffffff",
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{displayValue}</span>
        <ChevronDown size={16} color="#636C79" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1099,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              background: "#ffffff",
              border: "1px solid #E0E3E6",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              zIndex: 1100,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.topic);
                  setOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: opt.topic === displayValue ? "#BC000D" : "#0D1017",
                  background: opt.topic === displayValue ? "#FEF2F2" : "#ffffff",
                  cursor: "pointer",
                  fontWeight: opt.topic === displayValue ? 600 : 500,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (opt.topic !== displayValue) e.currentTarget.style.background = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  if (opt.topic !== displayValue) e.currentTarget.style.background = "#ffffff";
                }}
              >
                {opt.topic}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
