import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type CustomDropdownProps = {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
};

export function CustomDropdown({ value, onChange, options, placeholder }: CustomDropdownProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const displayPlaceholder = placeholder || t("common.enterValue");
  const displayValue = value || displayPlaceholder;

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
          color: value ? "#0D1017" : "#636C79",
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
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    fontSize: "14px",
                    color: isSelected ? "#BC000D" : "#0D1017",
                    background: isSelected ? "#FEF2F2" : "#ffffff",
                    cursor: "pointer",
                    fontWeight: isSelected ? 600 : 500,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
