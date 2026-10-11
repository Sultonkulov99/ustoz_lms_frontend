"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileText, Check, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BASE_URL = "/api";

export type MaterialSubmitResult = {
  ok: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  lessonId: string;        // active lesson's UUID
  lessonTitle?: string;
  onSaved: () => void;     // called after successful POST to refetch
};

export function MaterialModal({ open, onClose, lessonId, lessonTitle, onSaved }: Props) {
  const { t } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setSelectedFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !names.has(f.name))];
    });
    // reset input so same file can be re-selected if removed
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...dropped.filter((f) => !names.has(f.name))];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError(t("material.selectAtLeastOne"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      selectedFiles.forEach((file) => form.append("files", file));
      form.append("lessonId", lessonId);
      form.append("notes", notes);

      const res = await fetch(`${BASE_URL}/lesson-files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : ""}`,
        },
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `${res.status} ${res.statusText}`);
      }

      // reset form
      setSelectedFiles([]);
      setNotes("");
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
    setSelectedFiles([]);
    setNotes("");
    setError(null);
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
              {t("material.add")}
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
          {/* Note / Izoh */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("material.note")}
            </label>
            <input
              type="text"
              placeholder={t("common.enterValue")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              }}
            />
          </div>

          {/* File drop zone */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("material.files")}
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
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedFiles.map((file, idx) => {
                const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
                const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                return (
                  <div
                    key={idx}
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
                        {file.name}
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>
                        {ext} • {sizeMB} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      aria-label={t("common.delete")}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                    >
                      <Trash2 size={16} color="#DC2626" />
                    </button>
                  </div>
                );
              })}
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
            disabled={submitting || selectedFiles.length === 0}
            style={{
              height: "44px",
              borderRadius: "8px",
              background: submitting || selectedFiles.length === 0 ? "#9CA3AF" : "#BC000D",
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
              cursor: submitting || selectedFiles.length === 0 ? "not-allowed" : "pointer",
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
