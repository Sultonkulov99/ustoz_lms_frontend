"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface PageLimitDropdownProps {
  value: number;
  onChange: (val: number) => void;
  options?: number[];
}

export function PageLimitDropdown({
  value,
  onChange,
  options = [10, 25, 50],
}: PageLimitDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "none",
          background: "transparent",
          padding: "0 4px",
          outline: "none",
          color: "#0D1017",
          fontWeight: 500,
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <span>{value}</span>
        <ChevronDown size={14} color="#636C79" />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            marginTop: "4px",
            background: "#ffffff",
            border: "1px solid #E0E3E6",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            zIndex: 1000,
            minWidth: "75px",
            padding: "4px 0",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: opt === value ? "#F3F4F6" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "13px",
                color: "#0D1017",
                fontFamily: "Inter, sans-serif",
                fontWeight: opt === value ? 600 : 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = opt === value ? "#F3F4F6" : "transparent";
              }}
            >
              <span>{opt}</span>
              {opt === value && <Check size={12} color="#BC000D" strokeWidth={3} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
