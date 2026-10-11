"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, Plus, Trash2, ImagePlus } from "lucide-react";
import { ExamFormData } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";
import { FILES_BASE_URL } from "@/lib/config"; // ← qo'shildi (yo'lni loyihangizga moslang)
import { apiFetch } from "@/lib/api-client";

type ExamModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Partial<ExamFormData>;
  onSubmit: (data: ExamFormData | ExamFormData[]) => void;
  lessonId?: string;
};

const emptyQuestion: ExamFormData = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  image: null,
};

// Backend'dan kelgan rasm qiymatini to'liq, brauzer ocha oladigan URL'ga aylantiradi.
function resolveImageUrl(image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${FILES_BASE_URL}/${image}`;
}

// Kichik rasm tanlash/preview komponenti — savol bloki ichida ishlatiladi
function ImagePickerField({
  image,
  onChange,
  label,
  lessonId,
}: {
  image: File | string | null | undefined;
  onChange: (file: File | null) => void;
  label: string;
  lessonId?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
  let objectUrl: string | null = null;
  let cancelled = false;

  const loadImage = async () => {
    if (image instanceof File) {
      objectUrl = URL.createObjectURL(image);

      if (!cancelled) {
        setPreviewUrl(objectUrl);
      }

      return;
    }

    if (typeof image === "string" && image && lessonId) {
      try {
        setPreviewUrl(null);

        const response = await apiFetch(
          `/files/private/lesson-file/${lessonId}/${image}`
        );

        if (!response.ok) {
          throw new Error(
            `Rasm yuklanmadi: ${response.status}`
          );
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setPreviewUrl(objectUrl);
        }
      } catch (error) {
        console.error("Test rasmi yuklanmadi:", error);

        if (!cancelled) {
          setPreviewUrl(null);
        }
      }

      return;
    }

    setPreviewUrl(null);
  };

  loadImage();

  return () => {
    cancelled = true;

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [image, lessonId]);

  return (
    <div>
      <label
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "13px",
          color: "#0D1017",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />

      {previewUrl ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={previewUrl}
            alt="Savol rasmi"
            style={{
              height: "88px",
              width: "auto",
              borderRadius: "8px",
              border: "1px solid #E0E3E6",
              objectFit: "cover",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#EF4444",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Rasmni olib tashlash"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            height: "44px",
            border: "1px dashed #E0E3E6",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#636C79",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <ImagePlus size={15} /> Rasm tanlash (ixtiyoriy)
        </button>
      )}
    </div>
  );
}


export function ExamModal({ 
  open, 
  onClose, 
  mode, 
  lessonId,
  initialData, 
  onSubmit
}: ExamModalProps) {
  const { t } = useLanguage();
  // For 'add' mode, we manage an array of questions.
  // For 'edit' mode, we manage a single question.
  const [questions, setQuestions] = useState<ExamFormData[]>([{ ...emptyQuestion }]);

  const [editForm, setEditForm] = useState<ExamFormData>({ ...emptyQuestion });

  useEffect(() => {
    if (open) {
      if (mode === "add") {
        setQuestions([{ ...emptyQuestion }]);
      } else {
        setEditForm({
          ...emptyQuestion,
          ...initialData,
        });
      }
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  const handleAddQuestionBlock = () => {
    setQuestions((prev) => [...prev, { ...emptyQuestion }]);
  };

  const handleRemoveQuestionBlock = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof ExamFormData,
    value: string | File | null
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "add") {
      onSubmit(questions);
    } else {
      onSubmit(editForm);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 16, 23, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
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
          maxWidth: mode === "add" ? "680px" : "480px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0D1017", margin: 0 }}>
            {mode === "add" ? t("exam.add") : t("exam.edit")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("common.close")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <X size={20} color="#636C79" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {mode === "add" ? (
            // Add mode: Render multiple question forms
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {questions.map((q, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #E0E3E6",
                    borderRadius: "12px",
                    padding: "20px",
                    background: "#F9FAFB",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#636C79" }}>
                      {index + 1}-{t("exam.questionNum")}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionBlock(index)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#DC2626",
                          display: "flex",
                          alignItems: "center",
                          padding: "4px",
                          borderRadius: "4px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title={t("common.delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Savol matni */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                        {t("exam.questionText")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("common.enterValue")}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
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
                        }}
                      />
                    </div>

                    {/* Savol rasmi (ixtiyoriy) */}
                    <ImagePickerField
                      image={q.image}
                      onChange={(file) => handleQuestionChange(index, "image", file)}
                      label="Savol rasmi (ixtiyoriy)"
                    />

                    {/* Options A, B, C, D in a Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {/* Option A */}
                      <div>
                        <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                          {t("exam.answerA")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("common.enterValue")}
                          value={q.optionA}
                          onChange={(e) => handleQuestionChange(index, "optionA", e.target.value)}
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
                          }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctOption === "A"}
                            onChange={() => handleQuestionChange(index, "correctOption", "A")}
                            style={{ cursor: "pointer" }}
                          />
                          {t("exam.correctAnswer")}
                        </label>
                      </div>

                      {/* Option B */}
                      <div>
                        <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                          {t("exam.answerB")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("common.enterValue")}
                          value={q.optionB}
                          onChange={(e) => handleQuestionChange(index, "optionB", e.target.value)}
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
                          }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctOption === "B"}
                            onChange={() => handleQuestionChange(index, "correctOption", "B")}
                            style={{ cursor: "pointer" }}
                          />
                          {t("exam.correctAnswer")}
                        </label>
                      </div>

                      {/* Option C */}
                      <div>
                        <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                          {t("exam.answerC")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("common.enterValue")}
                          value={q.optionC}
                          onChange={(e) => handleQuestionChange(index, "optionC", e.target.value)}
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
                          }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctOption === "C"}
                            onChange={() => handleQuestionChange(index, "correctOption", "C")}
                            style={{ cursor: "pointer" }}
                          />
                          {t("exam.correctAnswer")}
                        </label>
                      </div>

                      {/* Option D */}
                      <div>
                        <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                          {t("exam.answerD")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("common.enterValue")}
                          value={q.optionD}
                          onChange={(e) => handleQuestionChange(index, "optionD", e.target.value)}
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
                          }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctOption === "D"}
                            onChange={() => handleQuestionChange(index, "correctOption", "D")}
                            style={{ cursor: "pointer" }}
                          />
                          {t("exam.correctAnswer")}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddQuestionBlock}
                style={{
                  width: "100%",
                  border: "2px dashed #E0E3E6",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "transparent",
                  color: "#2563EB",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                  e.currentTarget.style.background = "#EFF6FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E0E3E6";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Plus size={16} /> {t("exam.addMore")}
              </button>
            </div>
          ) : (
            // Edit mode: Render single form
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Savol matni */}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                  {t("exam.questionText")}
                </label>
                <input
                  type="text"
                  placeholder={t("common.enterValue")}
                  value={editForm.question}
                  onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
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
                  }}
                />
              </div>

              {/* Savol rasmi (ixtiyoriy) */}
              <ImagePickerField
                image={editForm.image}
                onChange={(file) => setEditForm((p) => ({ ...p, image: file }))}
                label="Savol rasmi (ixtiyoriy)"
                lessonId={lessonId}
              />

              {/* Option A */}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                  {t("exam.answerA")}
                </label>
                <input
                  type="text"
                  placeholder={t("common.enterValue")}
                  value={editForm.optionA}
                  onChange={(e) => setEditForm((p) => ({ ...p, optionA: e.target.value }))}
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
                  }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#636C79", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.correctOption === "A"}
                    onChange={() => setEditForm((p) => ({ ...p, correctOption: "A" }))}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  {t("exam.markCorrect")}
                </label>
              </div>

              {/* Option B */}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                  {t("exam.answerB")}
                </label>
                <input
                  type="text"
                  placeholder={t("common.enterValue")}
                  value={editForm.optionB}
                  onChange={(e) => setEditForm((p) => ({ ...p, optionB: e.target.value }))}
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
                  }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#636C79", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.correctOption === "B"}
                    onChange={() => setEditForm((p) => ({ ...p, correctOption: "B" }))}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  {t("exam.markCorrect")}
                </label>
              </div>

              {/* Option C */}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                  {t("exam.answerC")}
                </label>
                <input
                  type="text"
                  placeholder={t("common.enterValue")}
                  value={editForm.optionC}
                  onChange={(e) => setEditForm((p) => ({ ...p, optionC: e.target.value }))}
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
                  }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#636C79", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.correctOption === "C"}
                    onChange={() => setEditForm((p) => ({ ...p, correctOption: "C" }))}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  {t("exam.markCorrect")}
                </label>
              </div>

              {/* Option D */}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
                  {t("exam.answerD")}
                </label>
                <input
                  type="text"
                  placeholder={t("common.enterValue")}
                  value={editForm.optionD}
                  onChange={(e) => setEditForm((p) => ({ ...p, optionD: e.target.value }))}
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
                  }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#636C79", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.correctOption === "D"}
                    onChange={() => setEditForm((p) => ({ ...p, correctOption: "D" }))}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  {t("exam.markCorrect")}
                </label>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: "fit-content",
              height: "44px",
              borderRadius: "8px",
              background: "#BC000D",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 20px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              alignSelf: "flex-end",
            }}
          >
            <Check size={16} /> {t("common.save")}
          </button>
        </form>
      </div>
    </div>
  );
}