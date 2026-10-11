

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api-client";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  SlidersVertical,
  X,
  Link2,
  Check,
  UploadCloud,
  FileText,
  Copy,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

import { Lesson, Material, Task, Exam, MaterialFormData, TaskFormData, ExamFormData, LessonFile, Homework } from "./types";
import { CustomSelect } from "./CustomSelect";
import { SuccessModal } from "./SuccessModal";
import { TaskModal } from "./TaskModal";
import { ExamModal } from "./ExamModal";
import { MaterialModal } from "./MaterialModal";
import { FilePreviewModal } from "./FilePreviewModal";

const LESSON_FILES_BASE = "/api";

const initialLessons: Lesson[] = [];

// ─── Pagination helpers ───────────────────────────────────────────────────────

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}

// ─── Add/Edit Lesson Modal ───────────────────────────────────────────────────

type LessonFormData = {
  courseName: string;
  topic: string;
  description: string;
  videoFileName: string;
  videoFileSize: string;
};

const emptyForm: LessonFormData = {
  courseName: "",
  topic: "",
  description: "",
  videoFileName: "",
  videoFileSize: "",
};

type LessonModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Partial<LessonFormData>;
  onSubmit: (data: LessonFormData & { videoFile?: File | null }) => void;
};

function LessonModal({ open, onClose, mode, initialData, onSubmit }: LessonModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<LessonFormData>({ ...emptyForm, ...initialData });
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<"file" | "link">("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, ...initialData });
      setSelectedFile(null);
      const isUrl = !!(initialData?.videoFileName && (initialData.videoFileName.startsWith("http") || initialData.videoFileName.includes("youtube.com") || initialData.videoFileName.includes("youtu.be")));
      if (isUrl) {
        setVideoType("link");
        setYoutubeUrl(initialData?.videoFileName || "");
        setFileUploaded(false);
      } else {
        setVideoType("file");
        setYoutubeUrl("");
        setFileUploaded(!!initialData?.videoFileName);
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoType === "link" && !youtubeUrl.startsWith("https://")) {
      alert("Havola 'https://' bilan boshlanishi shart!");
      return;
    }
    onSubmit({
      ...form,
      videoFileName: videoType === "link" ? youtubeUrl : (fileUploaded ? form.videoFileName || "Dars_videosi.mp4" : ""),
      videoFileSize: videoType === "link" ? "YouTube video" : (fileUploaded ? form.videoFileSize || "4.2 MB" : ""),
      videoFile: videoType === "file" ? selectedFile : null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setForm((prev) => ({
        ...prev,
        videoFileName: file.name,
        videoFileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      }));
      setFileUploaded(true);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "560px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0D1017", margin: 0 }}>
              {mode === "add" ? t("lessons.addLesson") : t("lessons.editLesson")}
            </h2>
            {form.courseName && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "4px 0 0 0" }}>
                {form.courseName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px" }}
          >
            <X size={20} color="#636C79" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Dars nomi */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.lessonName")}
            </label>
            <input
              type="text"
              placeholder={t("common.enterValue")}
              value={form.topic}
              onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
              style={{
                width: "100%",
                height: "44px",
                border: "1px solid #E0E3E6",
                borderRadius: "8px",
                padding: "0 14px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#0D1017",
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          {/* Dars haqida */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("lessons.description")}
            </label>
            <textarea
              placeholder={t("common.enterValue")}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              style={{
                width: "100%",
                border: "1px solid #E0E3E6",
                borderRadius: "8px",
                padding: "10px 14px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#0D1017",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          {/* Video fayl upload card */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "8px" }}>
              {t("lessons.videoOrYoutube")}
            </label>

            {/* Video Mode Selection Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setVideoType("file")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: videoType === "file" ? "none" : "1px solid #E0E3E6",
                  background: videoType === "file" ? "#BC000D" : "#ffffff",
                  color: videoType === "file" ? "#ffffff" : "#636C79",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {t("lessons.fileType")}
              </button>
              <button
                type="button"
                onClick={() => setVideoType("link")}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: videoType === "link" ? "none" : "1px solid #E0E3E6",
                  background: videoType === "link" ? "#BC000D" : "#ffffff",
                  color: videoType === "link" ? "#ffffff" : "#636C79",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {t("lessons.linkType")}
              </button>
            </div>

            {videoType === "file" ? (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  style={{ display: "none" }}
                />
                {!fileUploaded ? (
                  <div
                    onClick={handleTriggerUpload}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #E0E3E6",
                      borderRadius: "12px",
                      padding: "24px",
                      cursor: "pointer",
                      background: "#FAFBFC",
                      minHeight: "120px",
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#F0F1F2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                      <UploadCloud size={18} color="#636C79" />
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", textAlign: "center", margin: 0 }}>
                      <span style={{ color: "#BC000D", fontWeight: 500 }}>{t("courses.clickToUpload")}</span> {t("courses.orDragDrop")}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#9CA3AF", margin: "4px 0 0" }}>
                      .mp4 yoki .MOV
                    </p>
                  </div>
                ) : (
                <div
                  style={{
                    border: "1px solid #E0E3E6",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "#ffffff",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src="/images/admin/File type icon (3).png"
                        alt="video"
                        style={{ width: "20px", height: "auto" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0D1017", margin: 0 }}>
                        {form.videoFileName || "Dars_videosi.mp4"}
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "2px 0 0" }}>
                        {form.videoFileSize || "4.2 MB"}
                      </p>
                    </div>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#BC000D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={12} color="#ffffff" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: "100%", background: "#BC000D" }}></div>
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#BC000D" }}>
                      100%
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => setFileUploaded(false)}
                    aria-label={t("common.delete")}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <X size={16} color="#EF4444" />
                  </button>
                </div>
              )}
              </>
            ) : (
              <input
                type="url"
                placeholder="https://..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                pattern="https://.*"
                style={{
                  width: "100%",
                  height: "44px",
                  border: "1px solid #E0E3E6",
                  borderRadius: "8px",
                  padding: "0 14px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#0D1017",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                required
              />
            )}
          </div>

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
            }}
          >
            <Check size={16} /> {t("common.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

type DeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteModal({ open, onClose, onConfirm }: DeleteModalProps) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#ffffff", borderRadius: "20px", padding: "48px 40px 40px", width: "380px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        {/* Question mark halo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", width: "100px", height: "100px", borderRadius: "50%", background: "#FEE2E2" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#ffffff", fontSize: "36px", fontWeight: 700, lineHeight: 1 }}>?</span>
          </div>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "17px", color: "#0D1017", marginBottom: "28px", lineHeight: 1.4 }}>
          {t("common.confirmDelete")}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "11px 28px", borderRadius: "8px", border: "1px solid #E0E3E6", background: "#ffffff", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer", color: "#374151" }}>
            {t("common.cancel")}
          </button>
          <button onClick={onConfirm} style={{ padding: "11px 28px", borderRadius: "8px", border: "none", background: "#BC000D", color: "#ffffff", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer" }}>
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export function LessonsList({ basePath = "/admin/courses" }: { basePath?: string }) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("courseId") || "1";
  const courseName = searchParams?.get("courseName") || "Frontend dasturlash";
  const sectionIdFromUrl = searchParams?.get("sectionId") || null;
  const sectionNameFromUrl = searchParams?.get("sectionName") || null;
  const [currentSectionName, setCurrentSectionName] = useState<string>(sectionNameFromUrl || "");

  // "Materiallar" (Assistent biriktirish) ustuni faqat admin panelida
  // ko'rsatiladi. Mentor panelida (basePath "/mentor" bilan boshlansa)
  // yashiriladi. Ikkala panelda ham yashirish uchun: `false` qiling.
  const showMaterialsColumn = !basePath.startsWith("/mentor");
  const lessonsColSpan = showMaterialsColumn ? 5 : 4;

  const [groupId, setGroupId] = useState<string | null>(sectionIdFromUrl);
  const [groupLoading, setGroupLoading] = useState(true);

  const coursesListUrl = basePath;

  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsPage, setDetailsPage] = useState(1);

  const router = useRouter();
  const pathname = usePathname();

  const lessonIdFromUrl = searchParams?.get("lessonId") || null;
  const tabFromUrl = (searchParams?.get("tab") as "materiallar" | "vazifalar" | "imtihonlar") || "materiallar";
  const viewFromUrl = lessonIdFromUrl ? "details" : "lessons";

  // View control: "lessons" (Image 1) or "details" (Image 5)
  const [view, setView] = useState<"lessons" | "details">(viewFromUrl);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lessonIdFromUrl);
  const [activeTab, setActiveTab] = useState<"materiallar" | "vazifalar" | "imtihonlar">(tabFromUrl);

  const updateUrlParams = (newLessonId: string | null, newTab: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newLessonId) {
      params.set("lessonId", newLessonId);
    } else {
      params.delete("lessonId");
    }
    if (newTab) {
      params.set("tab", newTab);
    } else {
      params.delete("tab");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const lessonId = searchParams?.get("lessonId") || null;
    const tab = (searchParams?.get("tab") as "materiallar" | "vazifalar" | "imtihonlar") || "materiallar";
    const viewVal = lessonId ? "details" : "lessons";

    setSelectedLessonId(lessonId);
    setActiveTab(tab);
    setView(viewVal);
  }, [searchParams]);

  useEffect(() => {
    setDetailsPage(1);
  }, [selectedLessonId, activeTab]);

  // Lesson Modals
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // Material Modals (under details view)
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);

  // Lesson files fetched from API
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const fetchLessonFiles = async (lessonId: string) => {
    setFilesLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch(`${LESSON_FILES_BASE}/lesson-files/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data: LessonFile[] = await res.json();
      setLessonFiles(data);
    } catch (err) {
      console.error("fetchLessonFiles error:", err);
      setLessonFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const [homework, setHomework] = useState<Homework | null>(null);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewLessonId, setPreviewLessonId] = useState("");
  const [previewFileType, setPreviewFileType] = useState<"video" | "file">("file");
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  interface BackgroundUpload {
    id: string;
    topic: string;
    description: string;
    progress: number;
    isEdit: boolean;
  }
  const [activeUploads, setActiveUploads] = useState<BackgroundUpload[]>([]);

  const fetchHomework = async (lessonId: string) => {
    setHomeworkLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch(`${LESSON_FILES_BASE}/homework/lesson/${lessonId}?offset=0&limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[fetchHomework] status: ${res.status} url: /homework/lesson/${lessonId}`);
      if (res.status === 404) {
        setHomework(null);
        return;
      }
      if (!res.ok) {
        console.warn(`fetchHomework failed: status ${res.status}`);
        setHomework(null);
        return;
      }
      const resJson = await res.json();
      console.log("[fetchHomework] Response data:", JSON.stringify(resJson).substring(0, 300));
      const list = resJson?.data;
      if (!list || !Array.isArray(list) || list.length === 0) {
        setHomework(null);
      } else {
        setHomework(list[0]);
      }
    } catch (err) {
      console.error("fetchHomework error:", err);
      setHomework(null);
    } finally {
      setHomeworkLoading(false);
    }
  };

  const handleDeleteHomework = async () => {
    if (!homework) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch(`${LESSON_FILES_BASE}/homework/delete/${homework.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setHomework(null);
    } catch (err) {
      console.error("Delete homework error:", err);
    } finally {
      setDeleteTaskId(null);
    }
  };

  const fetchExams = async (lessonId: string) => {
    setExamsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch(`${LESSON_FILES_BASE}/tests/lesson/details/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn(`fetchExams failed: status ${res.status}`);
        setExams([]);
        return;
      }
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: String(item.id),
        lessonTitle: item.lesson?.name || activeLesson?.topic || "",
        question: item.question,
        optionA: item.variantA,
        optionB: item.variantB,
        optionC: item.variantC,
        optionD: item.variantD,
        correctOption: (item.answer === "variantA"
          ? "A"
          : item.answer === "variantB"
          ? "B"
          : item.answer === "variantC"
          ? "C"
          : "D") as "A" | "B" | "C" | "D",
      image: item.image || null,
      }));
      setExams(mapped);
    } catch (err) {
      console.error("fetchExams error:", err);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLessonId && view === "details") {
      if (activeTab === "materiallar") {
        fetchLessonFiles(selectedLessonId);
      } else if (activeTab === "vazifalar") {
        fetchHomework(selectedLessonId);
      } else if (activeTab === "imtihonlar") {
        fetchExams(selectedLessonId);
      }
    }
  }, [selectedLessonId, activeTab, view]);

  // Task Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Exam Modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  // Nusxalanayotgan (duplicate) savol id'si — tugmada spinner ko'rsatish uchun
  const [duplicatingExamId, setDuplicatingExamId] = useState<string | null>(null);

  // Success Modal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"add" | "edit">("add");

  // Find active selected lesson details
  const activeLesson = useMemo(() => {
    return lessons.find((l) => l.id === selectedLessonId) ?? null;
  }, [lessons, selectedLessonId]);

  // Task and Exam selectors
  const activeTask = useMemo(() => {
    return activeLesson?.tasks.find((t) => t.id === editingTaskId) ?? null;
  }, [activeLesson, editingTaskId]);

  const editingTaskData = useMemo(() => {
    if (!activeTask) return undefined;
    return {
      taskTitle: activeTask.taskTitle,
      files: activeTask.files,
      lessonTitle: activeTask.lessonTitle,
    };
  }, [activeTask]);

  const activeExam = useMemo(() => {
    return exams.find((e) => e.id === editingExamId) ?? null;
  }, [exams, editingExamId]);

  const editingExamData = useMemo(() => {
    if (!activeExam) return undefined;
    return {
      question: activeExam.question,
      optionA: activeExam.optionA,
      optionB: activeExam.optionB,
      optionC: activeExam.optionC,
      optionD: activeExam.optionD,
      correctOption: activeExam.correctOption,
      image: activeExam.image,
    };
  }, [activeExam]);

  const paginatedMaterials = useMemo(() => {
    if (!activeLesson) return [];
    const start = (detailsPage - 1) * itemsPerPage;
    return activeLesson.materials.slice(start, start + itemsPerPage);
  }, [activeLesson, detailsPage, itemsPerPage]);

  const paginatedTasks = useMemo(() => {
    if (!activeLesson) return [];
    const start = (detailsPage - 1) * itemsPerPage;
    return activeLesson.tasks.slice(start, start + itemsPerPage);
  }, [activeLesson, detailsPage, itemsPerPage]);

  const paginatedExams = useMemo(() => {
    const start = (detailsPage - 1) * itemsPerPage;
    return exams.slice(start, start + itemsPerPage);
  }, [exams, detailsPage, itemsPerPage]);

  // Reusable Detail Table Footer with Pagination Controls
  const renderTableFooter = (totalCount: number) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    const pages = getVisiblePages(detailsPage, totalPages);

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", flexWrap: "wrap", gap: "12px" }}>
        {/* Left side: Export & info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#374151" }}>
          <span>
            {t("pagination.showingRange")} {(detailsPage - 1) * itemsPerPage + 1}-{Math.min(detailsPage * itemsPerPage, totalCount)} {t("pagination.to")} {t("pagination.total")} {totalCount}{t("pagination.items")}
          </span>
          <button
            onClick={handleExportXls}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #E0E3E6",
              borderRadius: "6px",
              background: "#ffffff",
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#0D1017",
            }}
          >
            <div style={{ position: "relative", width: "14px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/images/admin/Page.png"
                alt="excel"
                style={{ width: "100%", height: "auto" }}
              />
              <span style={{
                position: "absolute",
                bottom: "2px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "5px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: "-0.2px",
              }}>XLS</span>
            </div>
            <span>({totalCount}) {t("common.downloadXls")}</span>
          </button>
        </div>

        {/* Right side: Pagination controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#374151" }}>
          <span style={{ marginRight: "4px" }}>{t("pagination.perPage")}:</span>
          <CustomSelect
            value={itemsPerPage}
            onChange={(val) => {
              setItemsPerPage(val);
              setDetailsPage(1);
            }}
            options={[10, 25, 50]}
          />

          {pages.map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} style={{ padding: "0 4px", color: "#636C79" }}>...</span>
            ) : (
              <button
                key={page}
                onClick={() => setDetailsPage(Number(page))}
                style={{
                  width: "32px", height: "32px", borderRadius: "6px",
                  border: page === detailsPage ? "1px solid #E0E3E6" : "none",
                  background: page === detailsPage ? "#ffffff" : "transparent",
                  color: page === detailsPage ? "#0D1017" : "#636C79",
                  cursor: page === detailsPage ? "default" : "pointer",
                  fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px",
                }}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setDetailsPage((p) => Math.min(totalPages, p + 1))}
            disabled={detailsPage === totalPages}
            style={{
              height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6",
              background: "transparent", cursor: detailsPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
              padding: "0 12px",
              color: "#374151",
              fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", marginLeft: "4px"
            }}
          >
            {t("common.next")}
          </button>
        </div>
      </div>
    );
  };

  // Combine backend lessons with active background uploads
  const combinedLessons = useMemo(() => {
    const newUploadsMapped = activeUploads
      .filter((up) => !up.isEdit)
      .map((up) => ({
        id: up.id,
        courseName: courseName,
        topic: up.topic,
        description: up.description,
        videoFileName: "",
        materials: [],
        tasks: [],
        exams: [],
      }));
    return [...newUploadsMapped, ...lessons];
  }, [lessons, activeUploads, courseName]);

  // Search Filter (only in main list view)
  const filteredLessons = useMemo(() => {
    if (!searchInput.trim()) return combinedLessons;
    const q = searchInput.toLowerCase();
    return combinedLessons.filter(
      (l) => l.topic.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    );
  }, [combinedLessons, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / itemsPerPage));
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLessons.slice(start, start + itemsPerPage);
  }, [filteredLessons, currentPage, itemsPerPage]);

  // Darslarni berilgan guruhlar ro'yxati asosida state'ga joylash
  const applyLessonsFromGroups = async (groupsList: any[]) => {
    const getLessonOrder = (item: any): number => {
      const match = String(item.name || "").match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    };

    const allLessonStubs: any[] = [];
    for (const group of groupsList) {
      const list = Array.isArray(group?.lessons) ? group.lessons : [];
      const sortedList = [...list].sort((a: any, b: any) => {
        const orderDiff = getLessonOrder(a) - getLessonOrder(b);
        if (orderDiff !== 0) return orderDiff;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
      for (const item of sortedList) {
        allLessonStubs.push({
          ...item,
          groupId: group.id,
          groupName: group.name,
        });
      }
    }

    // Har bir dars uchun to'liq ma'lumotni yuklab olamiz
    const detailed: any[] = await Promise.all(
      allLessonStubs.map(async (item: any) => {
        try {
          const res = await apiFetch(`/lessons/single/${item.id}`);
          if (res.ok) {
            const full = await res.json();
            return { ...item, ...full };
          }
          return item;
        } catch (err) {
          console.error("Dars tafsilotini olishda xato:", item.id, err);
          return item;
        }
      })
    );

    const mapped: Lesson[] = detailed.map((item: any) => ({
      id: String(item.id),
      courseName: courseName,
      topic: item.name || "Nomsiz dars",
      description: item.about || "",
      videoFileName:
        (item.youtube_link && item.youtube_link !== "empty" ? item.youtube_link : "") ||
        (item.video && item.video !== "empty" ? item.video : "") ||
        "",
      videoFileSize:
        item.youtube_link && item.youtube_link !== "empty"
          ? "YouTube link"
          : item.video && item.video !== "empty"
          ? "Video fayl"
          : "",
      materials: Array.isArray(item.materials) ? item.materials : [],
      tasks: Array.isArray(item.tasks) ? item.tasks : [],
      exams: Array.isArray(item.exams) ? item.exams : [],
    }));
    setLessons(mapped);
  };

  // Kurs uchun bo'limlarni (lesson-group) topadi va tegishli bo'lim darslarini yuklaydi.
  const ensureGroupAndFetchLessons = async () => {
    if (!courseId) return;
    try {
      setGroupLoading(true);
      setLoading(true);

      const listRes = await apiFetch(
        `/lesson-group/all/${courseId}?offset=0&limit=100&include_lessons=true`
      );

      if (listRes.ok) {
        const listData = await listRes.json();
        const groups = Array.isArray(listData?.data) ? listData.data : [];

        // Agar URL'da aniq sectionId ko'rsatilgan bo'lsa, shu bo'limni tanlaymiz
        if (sectionIdFromUrl) {
          const targetGroup = groups.find((g: any) => String(g.id) === String(sectionIdFromUrl));
          if (targetGroup) {
            setGroupId(String(targetGroup.id));
            if (targetGroup.name) {
              setCurrentSectionName(targetGroup.name);
            }
            await applyLessonsFromGroups([targetGroup]);
            return;
          }
        }

        if (groups.length > 0) {
          const defaultGroup = groups.find((g: any) => g.name === "Asosiy") || groups[0];
          setGroupId(String(defaultGroup.id));
          if (defaultGroup.name) {
            setCurrentSectionName(defaultGroup.name);
          }
          await applyLessonsFromGroups(groups);
          return;
        }
      }

      // Mavjud bo'lim topilmadi — avtomatik yaratamiz agar sectionId berilmagan bo'lsa
      if (!sectionIdFromUrl) {
        const createRes = await apiFetch(`/lesson-group`, {
          method: "POST",
          body: JSON.stringify({ name: "Asosiy", courseId }),
        });

        if (createRes.ok) {
          const created = await createRes.json();
          setGroupId(String(created.id));
          setLessons([]);
        } else {
          console.error("Bo'lim avtomatik yaratilmadi:", await createRes.text().catch(() => ""));
        }
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error("Error ensuring lesson group:", err);
    } finally {
      setGroupLoading(false);
      setLoading(false);
    }
  };

  // Mavjud bo'limlar va darslarni qaytadan yuklab olish
  const fetchLessons = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const listRes = await apiFetch(
        `/lesson-group/all/${courseId}?offset=0&limit=100&include_lessons=true`
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const groups = Array.isArray(listData?.data) ? listData.data : [];

        if (sectionIdFromUrl || groupId) {
          const targetId = sectionIdFromUrl || groupId;
          const targetGroup = groups.find((g: any) => String(g.id) === String(targetId));
          if (targetGroup) {
            setGroupId(String(targetGroup.id));
            if (targetGroup.name) setCurrentSectionName(targetGroup.name);
            await applyLessonsFromGroups([targetGroup]);
            return;
          }
        }

        if (groups.length > 0) {
          if (!groupId) {
            const defaultGroup = groups.find((g: any) => g.name === "Asosiy") || groups[0];
            setGroupId(String(defaultGroup.id));
          }
          await applyLessonsFromGroups(groups);
        } else {
          setLessons([]);
        }
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ensureGroupAndFetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, sectionIdFromUrl]);

  const uploadBackground = (id: string, url: string, method: string, formData: FormData) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    let realProgress = 0;
    let virtualProgress = 0;
    let isCompleted = false;
    let serverSuccess = false;
    let serverErrorResponse = "";

    // Track the actual upload progress (bytes sent)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        realProgress = Math.round((event.loaded / event.total) * 100);
      }
    };

    // Smooth virtual progress interval (runs every 60ms)
    const interval = setInterval(() => {
      if (isCompleted) {
        if (serverSuccess) {
          // If successful, animate quickly to 100%
          virtualProgress = Math.min(100, virtualProgress + 8);
        } else {
          // If failed, clear and exit
          clearInterval(interval);
          setActiveUploads((prev) => prev.filter((up) => up.id !== id));
          alert(serverErrorResponse || "Dars yuklashda xatolik yuz berdi");
          return;
        }
      } else {
        // Easing interpolation: make virtual progress catch up to real progress smoothly
        if (realProgress === 100) {
          // Upload complete, server is saving/processing
          if (virtualProgress < 90) {
            virtualProgress += 0.22; // Even slower, takes ~24s to hit 90%
          } else if (virtualProgress < 98) {
            virtualProgress += 0.02; // Tiny crawl step to prevent hanging at 98%
          }
        } else {
          // Easing/Spring formula to follow the real progress
          const diff = realProgress - virtualProgress;
          if (diff > 0) {
            virtualProgress += Math.max(0.5, diff * 0.12);
          }
        }
      }

      const displayProgress = Math.round(virtualProgress);
      setActiveUploads((prev) =>
        prev.map((up) => (up.id === id ? { ...up, progress: displayProgress } : up))
      );

      // Once it hits 100% and is completed successfully
      if (virtualProgress >= 100) {
        clearInterval(interval);
        setActiveUploads((prev) => prev.filter((up) => up.id !== id));
        fetchLessons();
        setSuccessMessage(method === "POST" ? "Muvaffaqiyatli qo'shildi" : "Muvaffaqiyatli o'zgartirildi");
        setSuccessType(method === "POST" ? "add" : "edit");
        setIsSuccessOpen(true);
      }
    }, 60);

    xhr.onload = () => {
      isCompleted = true;
      if (xhr.status >= 200 && xhr.status < 300) {
        serverSuccess = true;
      } else {
        serverSuccess = false;
        serverErrorResponse = `Dars yuklashda xatolik yuz berdi (${xhr.status})`;
        console.error("Background upload failed:", xhr.status, xhr.responseText);
      }
    };

    xhr.onerror = () => {
      isCompleted = true;
      serverSuccess = false;
      serverErrorResponse = "Tarmoq xatosi. Aloqani tekshiring.";
    };

    xhr.send(formData);
  };

  // Add Lesson
  const handleAddLesson = async (data: LessonFormData & { videoFile?: File | null }) => {
    if (!groupId) {
      alert("Kurs ma'lumotlari hali tayyorlanmoqda, birozdan so'ng qayta urinib ko'ring.");
      return;
    }
    const tempId = "upload-" + Date.now();
    const newUpload: BackgroundUpload = {
      id: tempId,
      topic: data.topic,
      description: data.description,
      progress: 0,
      isEdit: false,
    };

    setActiveUploads((prev) => [...prev, newUpload]);
    setIsAddLessonOpen(false);

    const formData = new FormData();
    formData.append("name", data.topic);
    formData.append("about", data.description);
    formData.append("groupId", groupId);
    
    if (data.videoFile) {
      formData.append("video", data.videoFile);
    }
    if (data.videoFileName && (data.videoFileName.startsWith("http") || data.videoFileName.includes("youtube") || data.videoFileName.includes("youtu.be"))) {
      formData.append("youtube_link", data.videoFileName);
    }

    uploadBackground(tempId, "/api/lessons/create", "POST", formData);
  };

  // Edit Lesson
  const handleEditLesson = async (data: LessonFormData & { videoFile?: File | null }) => {
    if (!editingLessonId) return;
    const editingLesson = lessons.find((l) => l.id === editingLessonId);
    if (!editingLesson) return;

    const formData = new FormData();
    let hasChanges = false;

    if (data.topic !== editingLesson.topic) {
      formData.append("name", data.topic);
      hasChanges = true;
    }
    if (data.description !== editingLesson.description) {
      formData.append("about", data.description);
      hasChanges = true;
    }
    if (data.videoFile) {
      formData.append("video", data.videoFile);
      hasChanges = true;
    } else {
      const currentVideo = editingLesson.videoFileName;
      if (data.videoFileName !== currentVideo) {
        if (data.videoFileName.startsWith("http") || data.videoFileName.includes("youtube") || data.videoFileName.includes("youtu.be")) {
          formData.append("youtube_link", data.videoFileName);
          hasChanges = true;
        }
      }
    }

    if (!hasChanges) {
      setEditingLessonId(null);
      return;
    }

    const newUpload: BackgroundUpload = {
      id: editingLessonId,
      topic: data.topic,
      description: data.description,
      progress: 0,
      isEdit: true,
    };

    setActiveUploads((prev) => [...prev, newUpload]);
    setEditingLessonId(null);

    uploadBackground(editingLessonId, `/api/lessons/${editingLessonId}`, "PATCH", formData);
  };

  // Delete Lesson
  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;
    try {
      setSubmitting(true);
      const response = await apiFetch(`/lessons/${deleteLessonId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteLessonId(null);
        fetchLessons();
      } else {
        alert("Darsni o'chirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Tizimda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Material
  const handleAddMaterial = (data: MaterialFormData) => {
    if (!selectedLessonId || !activeLesson) return;
    const newMaterial: Material = {
      id: String(Date.now()),
      lessonTitle: activeLesson.topic,
      description: data.description,
      files: data.files,
    };
    setLessons((prev) =>
      prev.map((l) => (l.id === selectedLessonId ? { ...l, materials: [...l.materials, newMaterial] } : l))
    );
    setIsAddMaterialOpen(false);
    setSuccessMessage("Muvaffaqiyatli qo'shildi");
    setSuccessType("add");
    setIsSuccessOpen(true);
  };

  // Edit Material
  const handleEditMaterial = (data: MaterialFormData) => {
    if (!selectedLessonId || !editingMaterialId) return;
    const targetMaterialId = editingMaterialId;
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id !== selectedLessonId) return l;
        return {
          ...l,
          materials: l.materials.map((m) =>
            m.id === targetMaterialId ? { ...m, description: data.description, files: data.files } : m
          ),
        };
      })
    );
    setEditingMaterialId(null);
    setSuccessMessage("Muvaffaqiyatli o'zgartirildi");
    setSuccessType("edit");
    setIsSuccessOpen(true);
  };

  // Delete Material — calls API DELETE /lesson-files/{id}
  const handleDeleteMaterial = async () => {
    if (!deleteMaterialId) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch(`${LESSON_FILES_BASE}/lesson-files/${deleteMaterialId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `${res.status}`);
      }
      // refresh files list
      setLessonFiles((prev) => prev.filter((f) => String(f.id) !== deleteMaterialId));
    } catch (err) {
      console.error("Delete lesson file error:", err);
    } finally {
      setDeleteMaterialId(null);
    }
  };

  // CRUD Handlers for Tasks & Exams
  const handleAddTask = (data: TaskFormData) => {
    if (!selectedLessonId || !activeLesson) return;
    const newTask: Task = {
      id: String(Date.now()),
      lessonTitle: data.lessonTitle || activeLesson.topic,
      taskTitle: data.taskTitle,
      files: data.files,
    };
    setLessons((prev) =>
      prev.map((l) => (l.id === selectedLessonId ? { ...l, tasks: [...l.tasks, newTask] } : l))
    );
    setIsAddTaskOpen(false);
    setSuccessMessage("Muvaffaqiyatli qo'shildi");
    setSuccessType("add");
    setIsSuccessOpen(true);
  };

  const handleEditTask = (data: TaskFormData) => {
    if (!selectedLessonId || !editingTaskId) return;
    const targetTaskId = editingTaskId;
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id !== selectedLessonId) return l;
        return {
          ...l,
          tasks: l.tasks.map((t) =>
            t.id === targetTaskId ? { ...t, taskTitle: data.taskTitle, files: data.files, lessonTitle: data.lessonTitle || t.lessonTitle } : t
          ),
        };
      })
    );
    setEditingTaskId(null);
    setSuccessMessage("Muvaffaqiyatli o'zgartirildi");
    setSuccessType("edit");
    setIsSuccessOpen(true);
  };

  const handleDeleteTask = () => {
    if (!selectedLessonId) return;
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id !== selectedLessonId) return l;
        return {
          ...l,
          tasks: l.tasks.filter((t) => t.id !== deleteTaskId),
        };
      })
    );
    setDeleteTaskId(null);
  };

  // ---------------------------------------------------------------------
  // Imtihon savoli(lari)ni qo'shish. Har bir savol ALOHIDA
  // POST /tests/create ga FormData (multipart/form-data) sifatida
  // yuboriladi — chunki rasm faqat shu endpoint orqali qabul qilinadi
  // (/tests/create/many rasmni qo'llab-quvvatlamaydi, Swagger'ga qarang).
  // ---------------------------------------------------------------------
  const handleAddExam = async (data: ExamFormData | ExamFormData[]) => {
    if (!selectedLessonId) return;
    try {
      const examsArray = Array.isArray(data) ? data : [data];

      for (const item of examsArray) {
        const formData = new FormData();
        formData.append("question", item.question);
        formData.append("lessonId", selectedLessonId);
        formData.append("variantA", item.optionA);
        formData.append("variantB", item.optionB);
        formData.append("variantC", item.optionC);
        formData.append("variantD", item.optionD);
        formData.append(
          "answer",
          item.correctOption === "A"
            ? "variantA"
            : item.correctOption === "B"
            ? "variantB"
            : item.correctOption === "C"
            ? "variantC"
            : "variantD"
        );
        if (item.image instanceof File) {
          formData.append("image", item.image);
        }

        const res = await apiFetch("/tests/create", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Xatolik: ${res.status}`);
        }
      }

      await fetchExams(selectedLessonId);
      setIsAddExamOpen(false);
      setSuccessMessage("Muvaffaqiyatli qo'shildi");
      setSuccessType("add");
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("Error creating exam:", err);
      alert("Imtihon savolini qo'shishda xatolik yuz berdi");
    }
  };

   const handleEditExam = async (data: ExamFormData | ExamFormData[]) => {
  if (!selectedLessonId || !editingExamId) return;
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
    const editData = Array.isArray(data) ? data[0] : data;
    if (!editData) return;

    const answerField =
      editData.correctOption === "A"
        ? "variantA"
        : editData.correctOption === "B"
        ? "variantB"
        : editData.correctOption === "C"
        ? "variantC"
        : "variantD";

    const fd = new FormData();
    fd.append("question", editData.question);
    fd.append("variantA", editData.optionA);
    fd.append("variantB", editData.optionB);
    fd.append("variantC", editData.optionC);
    fd.append("variantD", editData.optionD);
    fd.append("answer", answerField);

    // Faqat foydalanuvchi yangi rasm tanlagan bo'lsa qo'shamiz.
    // Aks holda "image" maydonini FormData'ga umuman qo'shmaymiz —
    // shunda backend mavjud rasmni saqlab qoladi (updateTest'dagi
    // `payload?.image || test.image` mantig'i shunga mos).
    if (editData.image instanceof File) {
      fd.append("image", editData.image);
    }

    const res = await fetch(
      `${LESSON_FILES_BASE}/tests/update/${editingExamId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type qo'lda qo'yilmaydi — brauzer buni
          // to'g'ri boundary bilan o'zi qo'yadi (multipart/form-data).
        },
        body: fd,
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`${res.status}: ${errBody}`);
    }

    await fetchExams(selectedLessonId);
    setEditingExamId(null);
    setSuccessMessage("Muvaffaqiyatli o'zgartirildi");
    setSuccessType("edit");
    setIsSuccessOpen(true);
  } catch (err) {
    console.error("Error updating exam:", err);
    alert("Tahrirlashda xatolik yuz berdi");
  }
};

  const handleDeleteExam = async () => {
    if (!selectedLessonId || !deleteExamId) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
      const res = await fetch(`${LESSON_FILES_BASE}/tests/${deleteExamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await fetchExams(selectedLessonId);
    } catch (err) {
      console.error("Error deleting exam:", err);
      alert("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleteExamId(null);
    }
  };

  // Savolni nusxalash (duplicate). Rasm bo'lsa uni ham backend'dan
  // blob sifatida yuklab olib, yangi savolga fayl sifatida biriktiramiz.
  const handleDuplicateExam = async (exam: Exam) => {
    if (!selectedLessonId || duplicatingExamId) return;
    setDuplicatingExamId(exam.id);
    try {
      let imageFile: File | null = null;

      if (exam.image) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
          const imgRes = await apiFetch(
            `/files/private/lesson-file/${selectedLessonId}/${exam.image}`
          );
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            imageFile = new File([blob], exam.image, { type: blob.type || "image/png" });
          } else {
            console.error("Duplicate uchun rasmni yuklab bo'lmadi:", imgRes.status);
          }
        } catch (imgErr) {
          console.error("Duplicate uchun rasmni yuklashda xatolik:", imgErr);
        }
        // Rasm yuklanmasa ham, savolning o'zini nusxalashda davom etamiz.
      }

      const formData = new FormData();
      formData.append("question", exam.question);
      formData.append("lessonId", selectedLessonId);
      formData.append("variantA", exam.optionA);
      formData.append("variantB", exam.optionB);
      formData.append("variantC", exam.optionC);
      formData.append("variantD", exam.optionD);
      formData.append(
        "answer",
        exam.correctOption === "A"
          ? "variantA"
          : exam.correctOption === "B"
          ? "variantB"
          : exam.correctOption === "C"
          ? "variantC"
          : "variantD"
      );
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await apiFetch("/tests/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Savolni nusxalashda xatolik yuz berdi.");
      }

      await fetchExams(selectedLessonId);
      setSuccessMessage("Savolning nusxasi yaratildi va so'nggi savoldan keyin joylashtirildi");
      setSuccessType("add");
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("Duplicate exam error:", err);
      alert(err instanceof Error ? err.message : "Savolni nusxalashda xatolik yuz berdi.");
    } finally {
      setDuplicatingExamId(null);
    }
  };

  // Lesson actions variables
  const editingLesson = lessons.find((l) => l.id === editingLessonId);
  const editingLessonData = editingLesson
    ? {
      courseName: courseName,
      topic: editingLesson.topic,
      description: editingLesson.description,
      videoFileName: editingLesson.videoFileName,
      videoFileSize: editingLesson.videoFileSize,
    }
    : undefined;

  // Material actions variables
  const activeMaterial = activeLesson?.materials.find((m) => m.id === editingMaterialId);
  const editingMaterialData = activeMaterial
    ? {
      description: activeMaterial.description,
      files: activeMaterial.files,
    }
    : undefined;

  // XLS export mockup
  const handleExportXls = () => {
    alert("Excel yuklab olish simulyatsiya qilindi.");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 font-sans">
      {view === "lessons" ? (
        // ─── VIEW 1: Lessons List Table (Image 1) ────────────────────────────────────
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[#0D1017] m-0">
                  {t("table.lessons")}
                </h1>
                {currentSectionName && (
                  <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-0.5 text-xs font-semibold text-[#1D4ED8] border border-[#BFDBFE]">
                    {currentSectionName}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-[#636C79] sm:text-sm flex items-center flex-wrap gap-1.5">
                <Link href={coursesListUrl} className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors">
                  {t("courses.coursesLabel")}
                </Link>
                <span className="text-[#9CA3AF]">•</span>
                <Link
                  href={`/admin/courses/sections?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`}
                  className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors"
                >
                  {courseName}
                </Link>
                <span className="text-[#9CA3AF]">•</span>
                <Link
                  href={`/admin/courses/sections?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`}
                  className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors"
                >
                  {t("courses.sectionsLabel")}
                </Link>
                <span className="text-[#9CA3AF]">•</span>
                <span className="text-[#0D1017] font-semibold">{t("table.lessons")}</span>
              </p>
            </div>
            <button
              onClick={() => setIsAddLessonOpen(true)}
              disabled={groupLoading || !groupId}
              style={{
                height: "40px",
                borderRadius: "8px",
                background: groupLoading || !groupId ? "#E5E7EB" : "#BC000D",
                color: groupLoading || !groupId ? "#9CA3AF" : "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 16px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor: groupLoading || !groupId ? "not-allowed" : "pointer",
              }}
              className="self-end sm:self-auto"
            >
              <Plus size={16} /> {t("lessons.addLesson")}
            </button>
          </div>

          {/* Table Container */}
          <div style={{ border: "1px solid #E0E3E6", borderRadius: "12px", overflowX: "auto", background: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {t("table.topic")}
                      <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                    </div>
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {t("lessons.description")}
                      <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                    </div>
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {t("table.videoFile")}
                      <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                    </div>
                  </th>
                  {showMaterialsColumn && (
                    <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("table.materials")}</th>
                  )}
                  <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017" }}>{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loading || groupLoading ? (
                  <tr>
                    <td colSpan={lessonsColSpan} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : paginatedLessons.length === 0 ? (
                  <tr>
                    <td colSpan={lessonsColSpan} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
                      {t("table.noData")}
                    </td>
                  </tr>
                ) : (
                  paginatedLessons.map((lesson) => {
                    const activeUpload = activeUploads.find((up) => up.id === lesson.id);
                    return (
                      <tr key={lesson.id} style={{ borderBottom: "1px solid #E0E3E6" }}>
                        {/* Dars mavzusi */}
                        <td
                          onClick={() => {
                            if (!activeUpload || activeUpload.isEdit) {
                              updateUrlParams(lesson.id, "materiallar");
                            }
                          }}
                          style={{
                            padding: "16px",
                            color: activeUpload && !activeUpload.isEdit ? "#374151" : "#2563EB",
                            fontWeight: 500,
                            cursor: activeUpload && !activeUpload.isEdit ? "default" : "pointer",
                            borderRight: "1px solid #E0E3E6",
                            maxWidth: "280px",
                          }}
                          title={lesson.topic}
                        >
                          <div
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordBreak: "break-word",
                            }}
                          >
                            {lesson.topic}
                          </div>
                        </td>

                        {/* Dars haqida / Dars tavsifi */}
                        <td
                          style={{
                            padding: "16px",
                            color: "#374151",
                            maxWidth: "340px",
                            borderRight: "1px solid #E0E3E6",
                          }}
                          title={lesson.description || ""}
                        >
                          {lesson.description ? (
                            <div
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordBreak: "break-word",
                                lineHeight: "1.5",
                              }}
                            >
                              {lesson.description}
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF" }}>—</span>
                          )}
                        </td>

                        {/* Dars video fayli */}
                        <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                          {activeUpload ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", minWidth: "160px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>
                                  {activeUpload.isEdit ? t("common.saving") : t("common.loading")}
                                </span>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563EB" }}>
                                  {activeUpload.progress}%
                                </span>
                              </div>
                              <div style={{ width: "100%", height: "6px", background: "#E5E7EB", borderRadius: "9999px", overflow: "hidden" }}>
                                <div style={{ width: `${activeUpload.progress}%`, height: "100%", background: "#2563EB", transition: "width 0.15s ease-out" }} />
                              </div>
                            </div>
                          ) : lesson.videoFileName ? (
                            <div
                              onClick={() => {
                                setPreviewFileName(lesson.videoFileName);
                                setPreviewLessonId(lesson.id);
                                setPreviewFileType("video");
                                setIsPreviewOpen(true);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                background: "#F3F4F6",
                                color: "#374151",
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              {(() => {
                                const isYoutube =
                                  lesson.videoFileName.includes("youtube.com") ||
                                  lesson.videoFileName.includes("youtu.be");
                                if (isYoutube) {
                                  return (
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#FF0000" style={{ marginRight: "6px" }}>
                                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                  );
                                }
                                return (
                                  <img
                                    src="/images/admin/Icon (3).png"
                                    alt="video"
                                    style={{ width: "14px", height: "auto", marginRight: "6px" }}
                                  />
                                );
                              })()}
                              <span>
                                {lesson.videoFileName.includes("youtube.com") ||
                                lesson.videoFileName.includes("youtu.be")
                                  ? "YouTube"
                                  : "Video"}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF" }}>—</span>
                          )}
                        </td>

                        {/* Materiallar Biriktirish button (faqat admin panelida) */}
                        {showMaterialsColumn && (
                          <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                            <button
                              disabled={!!activeUpload}
                              onClick={() => {
                                updateUrlParams(lesson.id, "materiallar");
                              }}
                              style={{
                                background: activeUpload ? "#E5E7EB" : "#BC000D",
                                color: activeUpload ? "#9CA3AF" : "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 14px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: activeUpload ? "not-allowed" : "pointer",
                                outline: "none",
                              }}
                            >
                              {t("courses.assignAssistant")}
                            </button>
                          </td>
                        )}

                        {/* Amallar edit and delete */}
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              disabled={!!activeUpload}
                              onClick={() => setEditingLessonId(lesson.id)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                border: `1px solid ${activeUpload ? "#E5E7EB" : "#E0E3E6"}`,
                                background: activeUpload ? "#F9FAFB" : "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: activeUpload ? "not-allowed" : "pointer",
                              }}
                              title={t("common.edit")}
                            >
                              <Pencil size={14} color={activeUpload ? "#9CA3AF" : "#374151"} />
                            </button>
                            <button
                              disabled={!!activeUpload}
                              onClick={() => setDeleteLessonId(lesson.id)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                border: `1px solid ${activeUpload ? "#E5E7EB" : "#E0E3E6"}`,
                                background: activeUpload ? "#F9FAFB" : "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: activeUpload ? "not-allowed" : "pointer",
                              }}
                              title={t("common.delete")}
                            >
                              <Trash2 size={14} color={activeUpload ? "#9CA3AF" : "#DC2626"} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* XLS and Pagination Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px" }}>
            {/* XLS Download */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#374151" }}>
              <span>
                {t("pagination.showingRange")} {(currentPage - 1) * itemsPerPage + 1}-{currentPage * itemsPerPage} {t("pagination.to")} {t("pagination.total")} {filteredLessons.length}{t("pagination.items")}
              </span>
              <button
                onClick={handleExportXls}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "1px solid #E0E3E6",
                  borderRadius: "6px",
                  background: "#ffffff",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#0D1017",
                }}
              >
                <div style={{ position: "relative", width: "14px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src="/images/admin/Page.png"
                    alt="excel"
                    style={{ width: "100%", height: "auto" }}
                  />
                  <span style={{
                    position: "absolute",
                    bottom: "2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "5px",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1,
                    letterSpacing: "-0.2px",
                  }}>XLS</span>
                </div>
                <span>({filteredLessons.length}) {t("common.downloadXls")}</span>
              </button>
            </div>

            {/* Pagination controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#374151" }}>
              <span style={{ marginRight: "4px" }}>{t("pagination.perPage")}:</span>
              <CustomSelect
                value={itemsPerPage}
                onChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                options={[10, 25, 50]}
              />

              {getVisiblePages(currentPage, totalPages).map((page, idx) =>
                page === "..." ? (
                  <span key={`e-${idx}`} style={{ padding: "0 4px" }}>...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: "32px", height: "32px", borderRadius: "6px",
                      border: page === currentPage ? "1px solid #E0E3E6" : "none",
                      background: page === currentPage ? "#ffffff" : "transparent",
                      color: page === currentPage ? "#0D1017" : "#636C79",
                      cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px",
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6",
                  background: "transparent", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                  padding: "0 12px",
                  color: "#374151",
                  fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", marginLeft: "4px"
                }}
              >
                {t("common.next")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ─── VIEW 2: Materials / Tasks / Exams Details Page (Image 5) ───────────────────
        <div>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#636C79" }} className="flex items-center flex-wrap gap-1.5">
              <Link href={coursesListUrl} className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors">{t("courses.coursesLabel")}</Link>
              <span className="text-[#9CA3AF]">•</span>
              <Link href={`/admin/courses/sections?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`} className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors">{courseName}</Link>
              <span className="text-[#9CA3AF]">•</span>
              <Link href={`/admin/courses/sections?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`} className="text-[#636C79] hover:text-[#0D1017] hover:underline transition-colors">{t("courses.sectionsLabel")}</Link>
              <span className="text-[#9CA3AF]">•</span>
              <span onClick={() => updateUrlParams(null, null)} style={{ color: "#BC000D", cursor: "pointer" }} className="hover:underline">
                {t("table.lessons")}
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span className="text-[#0D1017] font-semibold">{activeLesson?.topic}</span>
            </p>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0D1017", margin: 0 }}>{activeLesson?.topic}</h1>
          </div>

          {/* Sub Tab Buttons & Add Button Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["materiallar", "vazifalar", "imtihonlar"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const textMap = {
                  materiallar: t("table.materials"),
                  vazifalar: t("table.homework"),
                  imtihonlar: t("table.exams"),
                };
                return (
                  <button
                    key={tab}
                    onClick={() => updateUrlParams(selectedLessonId, tab)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: isActive ? "none" : "1px solid #E0E3E6",
                      background: isActive ? "#BC000D" : "#ffffff",
                      color: isActive ? "#ffffff" : "#636C79",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {textMap[tab]}
                  </button>
                );
              })}
            </div>

            {/* Add button depending on active tab */}
            {activeTab === "materiallar" && (
              <button
                onClick={() => setIsAddMaterialOpen(true)}
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  background: "#22C55E",
                  color: "#ffffff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 16px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> {t("common.add")}
              </button>
            )}
            {activeTab === "vazifalar" && !homework && (
              <button
                onClick={() => setIsAddTaskOpen(true)}
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  background: "#22C55E",
                  color: "#ffffff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 16px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> {t("common.add")}
              </button>
            )}
            {activeTab === "imtihonlar" && (
              <button
                onClick={() => setIsAddExamOpen(true)}
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  background: "#22C55E",
                  color: "#ffffff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 16px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> {t("exam.add")}
              </button>
            )}
          </div>
          {/* Tab Content Display */}
          {activeTab === "materiallar" && (
            <div>
              {/* Materials Table */}
              <div style={{ border: "1px solid #E0E3E6", borderRadius: "12px", overflowX: "auto", background: "#ffffff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {t("table.lessonName")}
                          <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                        </div>
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {t("lessons.description")}
                          <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                        </div>
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {t("material.attachedFiles")}
                          <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                        </div>
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017" }}>{t("table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filesLoading ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
                          {t("common.loading")}
                        </td>
                      </tr>
                    ) : lessonFiles.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#4B5563" }}>
                          {t("table.noData")}
                        </td>
                      </tr>
                    ) : (
                      lessonFiles.map((f) => {
                        const ext = f.file.split(".").pop()?.toUpperCase() ?? "FILE";
                        const isPdf = ext === "PDF";
                        const isXls = ext === "XLS" || ext === "XLSX";
                        const iconSrc = isPdf
                          ? "/images/admin/Page (1).png"
                          : isXls
                          ? "/images/admin/Page.png"
                          : "/images/admin/Page (1).png";
                        const label = isPdf ? "PDF" : isXls ? "Excel" : ext;
                        return (
                          <tr key={f.id} style={{ borderBottom: "1px solid #E0E3E6" }}>
                            <td style={{ padding: "16px", color: "#0D1017", fontWeight: 500, borderRight: "1px solid #E0E3E6" }}>
                              {f.lesson.name}
                            </td>
                            <td
                              style={{
                                padding: "16px",
                                color: "#374151",
                                maxWidth: "320px",
                                borderRight: "1px solid #E0E3E6",
                              }}
                              title={f.note || ""}
                            >
                              {f.note ? (
                                <div
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    wordBreak: "break-word",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {f.note}
                                </div>
                              ) : (
                                <span style={{ color: "#9CA3AF" }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                              <div
                                onClick={() => {
                                  setPreviewFileName(f.file);
                                  setPreviewLessonId(selectedLessonId || "");
                                  setPreviewFileType("file");
                                  setIsPreviewOpen(true);
                                }}
                                style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", cursor: "pointer" }}
                                title={t("common.view")}
                              >
                                <div style={{ position: "relative", width: "14px", height: "18px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <img src={iconSrc} alt={label} style={{ width: "100%", height: "auto" }} />
                                  <span style={{ position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)", fontSize: "3.5px", fontWeight: 800, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>
                                    {label}
                                  </span>
                                </div>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500, color: "#2563EB", textDecoration: "underline" }}>
                                  {label}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <button
                                onClick={() => setDeleteMaterialId(String(f.id))}
                                style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                title={t("common.delete")}
                              >
                                <Trash2 size={14} color="#DC2626" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {renderTableFooter(lessonFiles.length)}
            </div>
          )}

          {activeTab === "vazifalar" && (
            <div>
              {/* Tasks Table */}
              <div style={{ border: "1px solid #E0E3E6", borderRadius: "12px", overflowX: "auto", background: "#ffffff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("table.lessonName")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("homework.assignmentText")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("homework.attachedFile")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017" }}>{t("table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeworkLoading ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
                          {t("common.loading")}
                        </td>
                      </tr>
                    ) : !homework ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#4B5563" }}>
                          {t("table.noData")}
                        </td>
                      </tr>
                    ) : (
                      <tr key={homework.id} style={{ borderBottom: "1px solid #E0E3E6" }}>
                        <td style={{ padding: "16px", color: "#0D1017", fontWeight: 500, borderRight: "1px solid #E0E3E6" }}>
                          {homework.lesson?.name || activeLesson?.topic}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            color: "#374151",
                            maxWidth: "320px",
                            borderRight: "1px solid #E0E3E6",
                          }}
                          title={homework.task || ""}
                        >
                          {homework.task ? (
                            <div
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordBreak: "break-word",
                                lineHeight: "1.5",
                              }}
                            >
                              {homework.task}
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                          {homework.file ? (() => {
                            const ext = homework.file.split(".").pop()?.toUpperCase() ?? "FILE";
                            const isPdf = ext === "PDF";
                            const isXls = ext === "XLS" || ext === "XLSX";
                            const iconSrc = isPdf
                              ? "/images/admin/Page (1).png"
                              : isXls
                              ? "/images/admin/Page.png"
                              : "/images/admin/Page (1).png";
                            const label = isPdf ? "PDF" : isXls ? "Excel" : ext;
                            return (
                              <div
                                onClick={() => {
                                  if (homework.file) {
                                    setPreviewFileName(homework.file);
                                    setPreviewLessonId(homework.lessonId || selectedLessonId || "");
                                    setPreviewFileType("file");
                                    setIsPreviewOpen(true);
                                  }
                                }}
                                style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", cursor: "pointer" }}
                                title={t("common.view")}
                              >
                                <div style={{ position: "relative", width: "14px", height: "18px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <img src={iconSrc} alt={label} style={{ width: "100%", height: "auto" }} />
                                  <span style={{ position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)", fontSize: "3.5px", fontWeight: 800, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>
                                    {label}
                                  </span>
                                </div>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500, color: "#2563EB", textDecoration: "underline", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {label}
                                </span>
                              </div>
                            );
                          })() : (
                            <span style={{ color: "#9CA3AF" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              onClick={() => setEditingTaskId(String(homework.id))}
                              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              title={t("common.edit")}
                            >
                              <Pencil size={14} color="#374151" />
                            </button>
                            <button
                              onClick={() => setDeleteTaskId(String(homework.id))}
                              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              title={t("common.delete")}
                            >
                              <Trash2 size={14} color="#DC2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {renderTableFooter(activeLesson?.tasks.length || 0)}
            </div>
          )}

          {activeTab === "imtihonlar" && (
            <div>
              {/* Exams Table */}
              <div style={{ border: "1px solid #E0E3E6", borderRadius: "12px", overflowX: "auto", background: "#ffffff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>№</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("exam.questionTitle")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("exam.optionA")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("exam.optionB")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("exam.optionC")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{t("exam.optionD")}</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017" }}>{t("table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExams.map((e, idx) => (
                      <tr key={e.id} style={{ borderBottom: "1px solid #E0E3E6" }}>
                        <td style={{ padding: "16px", color: "#0D1017", fontWeight: 500, borderRight: "1px solid #E0E3E6" }}>{(detailsPage - 1) * itemsPerPage + idx + 1}</td>
                        <td style={{ padding: "16px", color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>{e.question}</td>
                        <td style={{ padding: "16px", color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>{e.optionA}</span>
                            {e.correctOption === "A" && (
                              <span style={{ marginLeft: "8px", background: "#F3F4F6", color: "#374151", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: 500 }}>{t("exam.correctAnswer")}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>{e.optionB}</span>
                            {e.correctOption === "B" && (
                              <span style={{ marginLeft: "8px", background: "#F3F4F6", color: "#374151", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: 500 }}>{t("exam.correctAnswer")}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>{e.optionC}</span>
                            {e.correctOption === "C" && (
                              <span style={{ marginLeft: "8px", background: "#F3F4F6", color: "#374151", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: 500 }}>{t("exam.correctAnswer")}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>{e.optionD}</span>
                            {e.correctOption === "D" && (
                              <span style={{ marginLeft: "8px", background: "#F3F4F6", color: "#374151", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: 500 }}>{t("exam.correctAnswer")}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              onClick={() => setEditingExamId(e.id)}
                              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              title={t("common.edit")}
                            >
                              <Pencil size={14} color="#374151" />
                            </button>
                            <button
                              onClick={() => handleDuplicateExam(e)}
                              disabled={duplicatingExamId === e.id}
                              style={{
                                width: "32px", height: "32px", borderRadius: "6px",
                                border: "1px solid #E0E3E6", background: "#ffffff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: duplicatingExamId === e.id ? "not-allowed" : "pointer",
                                opacity: duplicatingExamId === e.id ? 0.6 : 1,
                              }}
                              title="Nusxalash"
                            >
                              {duplicatingExamId === e.id ? (
                                <Loader2 size={14} className="animate-spin" color="#374151" />
                              ) : (
                                <Copy size={14} color="#374151" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteExamId(e.id)}
                              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #E0E3E6", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              title={t("common.delete")}
                            >
                              <Trash2 size={14} color="#DC2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {examsLoading && (
                      <tr>
                        <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
                          {t("common.loading")}
                        </td>
                      </tr>
                    )}
                    {!examsLoading && exams.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#4B5563" }}>
                          {t("table.noData")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {renderTableFooter(exams.length)}
            </div>
          )}

        </div>
      )}

      {/* Modals for Lessons */}
      <LessonModal
        open={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        mode="add"
        initialData={{ courseName }}
        onSubmit={handleAddLesson}
      />
      <LessonModal
        open={editingLessonId !== null}
        onClose={() => setEditingLessonId(null)}
        mode="edit"
        initialData={editingLessonData}
        onSubmit={handleEditLesson}
      />
      <DeleteModal
        open={deleteLessonId !== null}
        onClose={() => setDeleteLessonId(null)}
        onConfirm={handleDeleteLesson}
      />

      {/* Modals for Materials */}
      <MaterialModal
        open={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        lessonId={selectedLessonId ?? ""}
        lessonTitle={activeLesson?.topic}
        onSaved={() => selectedLessonId && fetchLessonFiles(selectedLessonId)}
      />
      <DeleteModal
        open={deleteMaterialId !== null}
        onClose={() => setDeleteMaterialId(null)}
        onConfirm={handleDeleteMaterial}
      />

      {/* Modals for Tasks */}
      <TaskModal
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        mode="add"
        lessonId={selectedLessonId ?? ""}
        lessonTitle={activeLesson?.topic}
        onSaved={() => selectedLessonId && fetchHomework(selectedLessonId)}
      />
      <TaskModal
        open={editingTaskId !== null}
        onClose={() => setEditingTaskId(null)}
        mode="edit"
        lessonId={selectedLessonId ?? ""}
        lessonTitle={activeLesson?.topic}
        initialData={homework}
        onSaved={() => selectedLessonId && fetchHomework(selectedLessonId)}
      />
      <DeleteModal
        open={deleteTaskId !== null}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteHomework}
      />

      {/* Modals for Exams */}
      <ExamModal
        open={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        mode="add"
        onSubmit={handleAddExam}
      />
      <ExamModal
        open={editingExamId !== null}
        onClose={() => setEditingExamId(null)}
        mode="edit"
        initialData={editingExamData}
        onSubmit={handleEditExam}
        lessonId={selectedLessonId ?? ""}
      />
      <DeleteModal
        open={deleteExamId !== null}
        onClose={() => setDeleteExamId(null)}
        onConfirm={handleDeleteExam}
      />
      <SuccessModal
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
        type={successType}
      />
      <FilePreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        fileName={previewFileName}
        lessonId={previewLessonId}
        fileType={previewFileType}
      />
    </div>
  );
}