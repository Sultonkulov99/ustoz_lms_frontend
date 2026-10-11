"use client";

import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, FileText, Check, Trash2 } from "lucide-react";
import { Homework } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

const BASE_URL = "/api";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  lessonId: string;
  lessonTitle?: string;
  initialData?: Homework | null;
  onSaved: () => void;
};

export function TaskModal({ open, onClose, mode, lessonId, lessonTitle, initialData, onSaved }: Props) {
  const { t } = useLanguage();
  const [taskText, setTaskText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTaskText(initialData?.task || "");
      setSelectedFile(null);
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) {
      setError(t("homework.enterTask"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const form = new FormData();

      if (mode === "add") {
        form.append("task", taskText);
        form.append("lessonId", lessonId);
        if (selectedFile) {
          form.append("file", selectedFile);
        }

        const res = await fetch(`${BASE_URL}/homework/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `${res.status}`);
        }
      } else {
        // Edit mode (PATCH /api/homework/update/:id)
        if (!initialData) return;

        let hasChanges = false;
        if (taskText !== initialData.task) {
          form.append("task", taskText);
          hasChanges = true;
        }
        if (selectedFile) {
          form.append("file", selectedFile);
          hasChanges = true;
        }

        // Only send if changes exist
        if (hasChanges) {
          const res = await fetch(`${BASE_URL}/homework/update/${initialData.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          });

          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `${res.status}`);
          }
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "520px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0D1017", margin: 0 }}>
              {mode === "add" ? t("homework.add") : t("common.edit")}
            </h2>
            {lessonTitle && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#636C79", margin: "4px 0 0" }}>
                {lessonTitle}
              </p>
            )}
          </div>
          <button type="button" onClick={handleClose} aria-label={t("common.close")} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color="#636C79" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Topshiriq matni */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("homework.task")}
            </label>
            <textarea
              placeholder={t("homework.enterTask")}
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              rows={4}
              required
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
                resize: "vertical",
              }}
            />
          </div>

          {/* File drop zone */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("homework.optionalFile")}
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "1px dashed #E0E3E6",
                borderRadius: "12px",
                padding: "24px",
                background: "#FAFAFA",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                textAlign: "center",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid #E0E3E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  background: "#ffffff",
                }}
              >
                <UploadCloud size={20} color="#636C79" />
              </div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#636C79", margin: "0 0 4px" }}>
                <span style={{ color: "#2563EB", fontWeight: 600 }}>{t("courses.clickToUpload")}</span> {t("courses.orDragDrop")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
                {t("homework.formatHint")}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {/* Selected File / Existing File */}
          {(selectedFile || (mode === "edit" && initialData?.file)) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  border: "1px solid #E0E3E6",
                  borderRadius: "10px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={18} color="#2563EB" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, color: "#0D1017", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFile ? selectedFile.name : initialData?.file}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </p>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    aria-label={t("common.delete")}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#DC2626", margin: 0 }}>
              ⚠ {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              height: "44px",
              borderRadius: "8px",
              background: submitting ? "#9CA3AF" : "#BC000D",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "0 20px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
              width: "fit-content",
              opacity: submitting ? 0.8 : 1,
            }}
          >
            {submitting ? (
              <>
                <span style={{ width: "16px", height: "16px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                {t("common.saving")}
              </>
            ) : (
              <><Check size={16} /> {t("common.save")}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
