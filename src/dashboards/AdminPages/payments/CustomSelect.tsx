import { useState } from "react";
import { ChevronDown } from "lucide-react";

type CustomSelectProps = {
  value: number;
  onChange: (val: number) => void;
  options: number[];
};

export function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          border: "none",
          background: "transparent",
          padding: "0 20px 0 4px",
          outline: "none",
          color: "#0D1017",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span>{value}</span>
        <ChevronDown size={14} color="#0D1017" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              marginBottom: "8px",
              background: "#ffffff",
              border: "1px solid #E0E3E6",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              zIndex: 100,
              minWidth: "60px",
              overflow: "hidden",
            }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  color: opt === value ? "#3B82F6" : "#0D1017",
                  background: opt === value ? "#EFF6FF" : "#ffffff",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: opt === value ? 600 : 500,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (opt !== value) e.currentTarget.style.background = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  if (opt !== value) e.currentTarget.style.background = "#ffffff";
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
