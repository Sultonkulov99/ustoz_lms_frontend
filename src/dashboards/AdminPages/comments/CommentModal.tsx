"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { CommentGroup, CommentItem, CommentFormData } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

type CommentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CommentFormData) => void;
  mode?: "add" | "edit";
  initialGroup?: CommentGroup | null;
  initialComment?: CommentItem | null;
};

export function CommentModal({
  open,
  onClose,
  onSubmit,
  mode = "add",
  initialGroup,
  initialComment,
}: CommentModalProps) {
  const { t } = useLanguage();
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [date, setDate] = useState("");
  const [hasActions, setHasActions] = useState(true);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const ratingOptions = [
    { value: 5, label: `5 - ${t("modal.rating5")}` },
    { value: 4, label: `4 - ${t("modal.rating4")}` },
    { value: 3, label: `3 - ${t("modal.rating3")}` },
    { value: 2, label: `2 - ${t("modal.rating2")}` },
    { value: 1, label: `1 - ${t("modal.rating1")}` },
  ];

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialGroup && initialComment) {
        setAuthorName(initialGroup.authorName);
        setContent(initialComment.content);
        setRating(initialComment.rating);
        setDate(initialComment.date || "");
        setHasActions(!!initialComment.hasActions);
      } else {
        setAuthorName("");
        setContent("");
        setRating(3);
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, "0")}.${String(
          now.getMonth() + 1
        ).padStart(2, "0")}.${now.getFullYear()}`;
        setDate(formattedDate);
        setHasActions(true);
      }
      setIsRatingDropdownOpen(false);
      setErrors({});
    }
  }, [open, mode, initialGroup, initialComment]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!authorName.trim()) newErrors.authorName = t("common.nameRequired");
    if (!content.trim()) newErrors.content = t("common.requiredField");
    if (rating < 1 || rating > 5) newErrors.rating = t("common.requiredField");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      authorName,
      content,
      rating,
      date: hasActions ? date : "",
      hasActions,
    });
  };

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
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={20} color="#636C79" />
        </button>

        <h2
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            color: "#0D1017",
            margin: "0 0 24px 0",
          }}
        >
          {mode === "add" ? t("modal.addComment") : t("modal.editComment")}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Author Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {t("table.commentAuthor")}
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("common.enterValue")}
              style={{
                height: "44px",
                padding: "0 14px",
                borderRadius: "8px",
                border: errors.authorName ? "1px solid #EF4444" : "1px solid #E0E3E6",
                outline: "none",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              }}
            />
            {errors.authorName && (
              <span style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px" }}>{errors.authorName}</span>
            )}
          </div>

          {/* Rating */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
            <label
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {t("modal.rating")}
            </label>
            
            <div style={{ position: "relative", width: "100%" }}>
              <button
                type="button"
                onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                style={{
                  width: "100%",
                  height: "44px",
                  border: "1px solid #E0E3E6",
                  borderRadius: "8px",
                  padding: "0 14px",
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
                <span>{ratingOptions.find((opt) => opt.value === rating)?.label || `3 - ${t("modal.rating3")}`}</span>
                <ChevronDown size={16} color="#636C79" style={{ transform: isRatingDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {isRatingDropdownOpen && (
                <>
                  <div
                    onClick={() => setIsRatingDropdownOpen(false)}
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
                      padding: "4px 0",
                    }}
                  >
                    {ratingOptions.map((opt) => {
                      const isSelected = opt.value === rating;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setRating(opt.value);
                            setIsRatingDropdownOpen(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            fontSize: "14px",
                            color: isSelected ? "#BC000D" : "#0D1017",
                            background: isSelected ? "#FEF2F2" : "#ffffff",
                            cursor: "pointer",
                            fontWeight: isSelected ? 600 : 500,
                            transition: "background 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#F9FAFB";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#ffffff";
                          }}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check size={14} color="#BC000D" strokeWidth={3} />}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Date Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="hasActions"
                checked={hasActions}
                onChange={(e) => setHasActions(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label
                htmlFor="hasActions"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {t("modal.showDateAndActions")}
              </label>
            </div>

            {hasActions && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                <label
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#636C79",
                  }}
                >
                  {t("table.date")}
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="01.01.2024"
                  style={{
                    height: "40px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid #E0E3E6",
                    outline: "none",
                    fontSize: "14px",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {t("table.comment")}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("common.enterValue")}
              style={{
                minHeight: "100px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: errors.content ? "1px solid #EF4444" : "1px solid #E0E3E6",
                outline: "none",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                resize: "vertical",
              }}
            />
            {errors.content && (
              <span style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px" }}>{errors.content}</span>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "11px 28px",
                borderRadius: "8px",
                border: "1px solid #E0E3E6",
                background: "#ffffff",
                color: "#636C79",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              style={{
                padding: "11px 28px",
                borderRadius: "8px",
                border: "none",
                background: "#BC000D",
                color: "#ffffff",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
