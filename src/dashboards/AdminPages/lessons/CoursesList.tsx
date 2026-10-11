"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  Eye,
  SlidersVertical,
  X,
  Link2,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { SuccessModal } from "@/components/modals/success-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type Course = {
  id: string;
  selected: boolean;
  banner: string;
  name: string;
  sections: number;
  level: string;
  price: string;
  status: "Faol" | "Nofaol";
  published: boolean;
  introVideo?: string;
  description?: string;
  sana?: string;
  mentor?: string;
  assistant?: string;
  assistantId?: number;
  salesCount?: number;
};

// ─── API helpers ───────────────────────────────────────────────────────────────

const FILES_BASE_URL = "/files/public";

function mapCourses(items: any[]): Course[] {
  return items.map((item: any) => ({
    id: String(item.id),
    selected: false,
    banner: item.banner ? `${FILES_BASE_URL}/${item.banner}` : "/images/admin/banner1.png",
    name: item.name || "Nomsiz kurs",
    sections: 0,
    level: item.level || "-",
    price: item.price
      ? Number(item.price).toLocaleString("uz-UZ").replace(/,/g, " ")
      : "0",
    status: item.published ? "Faol" : "Nofaol",
    published: Boolean(item.published),
    description: item.about,
    mentor: item.mentor?.fullName,
    assistant: item.assistants?.[0]?.user?.fullName,
    salesCount: item._count?.purchases ?? 0,
    sana: item.createdAt ? new Date(item.createdAt).toLocaleString("uz-UZ") : undefined,
  }));
}

// ─── Pagination helpers ───────────────────────────────────────────────────────

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ─── Publish Toggle Switch ─────────────────────────────────────────────────────

function PublishToggle({
  published,
  loading,
  onToggle,
}: {
  published: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      title={published ? t("courses.unpublish") : t("courses.publish")}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "11px",
        background: published ? "#22C55E" : "#D1D5DB",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 0.2s",
        opacity: loading ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: published ? "21px" : "3px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

type CourseFormData = {
  banner: string;
  bannerFile?: File | null;
  introVideo: string;
  introVideoFile?: File | null;
  name: string;
  description: string;
  price: string;
};

const emptyForm: CourseFormData = {
  banner: "",
  bannerFile: null,
  introVideo: "",
  introVideoFile: null,
  name: "",
  description: "",
  price: "",
};

type FormSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  direction?: "up" | "down";
};

function CustomFormSelect({ value, onChange, options, placeholder, direction = "down" }: FormSelectProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const displayPlaceholder = placeholder || t("common.enterValue");

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          height: "44px",
          border: "1px solid #E0E3E6",
          borderRadius: "8px",
          padding: "0 14px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          color: value ? "#0D1017" : "#9CA3AF",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        <span>{selectedOption ? selectedOption.label : displayPlaceholder}</span>
        <ChevronDown size={16} color="#636C79" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              background: "#ffffff",
              border: "1px solid #E0E3E6",
              borderRadius: "8px",
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto",
              ...(direction === "up"
                ? {
                  bottom: "100%",
                  marginBottom: "4px",
                  boxShadow: "0 -10px 30px rgba(0,0,0,0.1)",
                }
                : {
                  top: "100%",
                  marginTop: "4px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }),
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: opt.value === value ? "#2563EB" : "#0D1017",
                  background: opt.value === value ? "#F3F4F6" : "#ffffff",
                  cursor: "pointer",
                  fontWeight: opt.value === value ? 600 : 500,
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = "#ffffff";
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type CourseModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => void;
};

function CourseModal({ open, onClose, mode, initialData, onSubmit }: CourseModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<CourseFormData>({ ...emptyForm, ...initialData });
  const [bannerPreview, setBannerPreview] = useState<string>(initialData?.banner || "");
  const [videoName, setVideoName] = useState<string>("");

  useEffect(() => {
    if (open) {
      const merged = { ...emptyForm, ...initialData };
      setForm(merged);
      setBannerPreview(initialData?.banner || "");
      setVideoName("");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
    setForm((prev) => ({ ...prev, bannerFile: file, banner: url }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoName(file.name);
    setForm((prev) => ({ ...prev, introVideoFile: file, introVideo: file.name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 xs:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 xs:p-6 sm:p-8"
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0D1017", margin: 0 }}>
            {mode === "add" ? t("common.add") : t("common.edit")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px" }}
          >
            <X size={20} color="#636C79" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ paddingBottom: "140px" }}>
          {/* Banner + Intro Video */}
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            {/* Banner */}
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", marginBottom: "8px" }}>
                {t("table.banner")}
              </p>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #E0E3E6",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  background: "#FAFBFC",
                  minHeight: "120px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "10px", position: "absolute", inset: 0 }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
                    }}
                  />
                ) : (
                  <>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#F0F1F2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                      <Plus size={18} color="#636C79" />
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", textAlign: "center", margin: 0 }}>
                      <span style={{ color: "#2563EB", fontWeight: 500 }}>{t("courses.clickToUpload")}</span> {t("courses.orDragDrop")}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#9CA3AF", margin: "4px 0 0" }}>
                      {t("courses.bannerHint")}
                    </p>
                  </>
                )}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerChange} />
              </label>
            </div>

            {/* Intro Video — endi tanlangan fayl nomi va check belgisi bilan */}
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", marginBottom: "8px" }}>
                {t("courses.introVideo")}
              </p>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: videoName ? "2px solid #22C55E" : "2px dashed #E0E3E6",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  background: videoName ? "#F0FDF4" : "#FAFBFC",
                  minHeight: "120px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: videoName ? "#DCFCE7" : "#F0F1F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                  }}
                >
                  {videoName ? (
                    <Check size={18} color="#22C55E" />
                  ) : (
                    <Plus size={18} color="#636C79" />
                  )}
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", textAlign: "center", margin: 0 }}>
                  {videoName ? (
                    <span style={{ color: "#16A34A", fontWeight: 500 }}>{videoName}</span>
                  ) : (
                    <>
                      <span style={{ color: "#2563EB", fontWeight: 500 }}>{t("courses.clickToUpload")}</span> {t("courses.orDragDrop")}
                    </>
                  )}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#9CA3AF", margin: "4px 0 0" }}>
                  {t("courses.videoHint")}
                </p>
                <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoChange} />
              </label>
            </div>
          </div>

          {/* Kurs nomi */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.courseName")}
            </label>
            <input
              type="text"
              placeholder={t("common.enterValue")}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
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
            />
          </div>

          {/* Kurs haqida */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("courses.aboutCourse")}
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
            />
          </div>

          {/* Narxi */}
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: "#0D1017", display: "block", marginBottom: "6px" }}>
              {t("table.price")}
            </label>
            <input
              type="text"
              placeholder={t("courses.pricePlaceholder")}
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
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
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full xs:w-fit" style={{ height: "44px", borderRadius: "8px" }}>
            ✓ {t("common.save")}
          </Button>
        </form>
      </div>
    </div>
  );
}


function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-[380px] rounded-[20px] bg-white p-6 pt-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)] xs:p-10 xs:pt-12">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", width: "100px", height: "100px", borderRadius: "50%", background: "#FEE2E2" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#ffffff", fontSize: "36px", fontWeight: 700, lineHeight: 1 }}>?</span>
          </div>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "17px", color: "#0D1017", marginBottom: "28px", lineHeight: 1.4 }}>
          {t("common.confirmDelete")}
        </p>
        <div className="flex flex-col gap-2.5 xs:flex-row xs:justify-center xs:gap-3">
          <button onClick={onClose} style={{ padding: "11px 28px", borderRadius: "8px", border: "1px solid #E0E3E6", background: "#ffffff", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer", color: "#374151" }}>
            {t("common.cancel")}
          </button>
          <button onClick={onConfirm} style={{ padding: "11px 28px", borderRadius: "8px", border: "none", background: "#EF4444", color: "#ffffff", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer" }}>
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Details Modal ────────────────────────────────────────────────────────────

type CourseDetailModalProps = {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAssignAssistant: () => void;
  onRemoveAssistant: () => void;
};

function CourseDetailModal({
  open,
  onClose,
  course,
  onEdit,
  onDelete,
  onAssignAssistant,
  onRemoveAssistant,
}: CourseDetailModalProps) {
  const { t } = useLanguage();
  if (!open || !course) return null;

  const actionButtonStyle = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid #E0E3E6",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 xs:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] xs:p-6 sm:p-8">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "16px",
            borderBottom: "1px solid #F0F1F2",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#0D1017",
              margin: 0,
            }}
          >
            {t("common.details")}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={onClose} style={actionButtonStyle} title={t("common.close")}>
              <Eye size={16} color="#636C79" />
            </button>
            <button onClick={() => onEdit(course.id)} style={actionButtonStyle} title={t("common.edit")}>
              <Pencil size={16} color="#636C79" />
            </button>
            <button onClick={() => onDelete(course.id)} style={actionButtonStyle} title={t("common.delete")}>
              <Trash2 size={16} color="#636C79" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Kurs nomi */}
          <div>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#636C79",
                margin: "0 0 6px 0",
              }}
            >
              {t("table.courseName")}
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                color: "#0D1017",
                margin: 0,
              }}
            >
              {course.name}
            </p>
          </div>

          {/* Banner Image */}
          <div style={{ width: "100%" }}>
            <div className="relative w-full h-[160px] xs:h-[220px] rounded-xl overflow-hidden" style={{ background: "#FAFBFC" }}>
              <img
                src={course.banner}
                alt={course.name}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              <Link2 size={16} color="#2563EB" />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                Banner.jpg
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 xs:grid-cols-2">
            {/* Row 1 */}
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("table.level")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D1017", margin: 0 }}>
                {course.level}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("table.price")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D1017", margin: 0 }}>
                {course.price} so'm
              </p>
            </div>

            {/* Row 2 */}
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("table.createdAt")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D1017", margin: 0 }}>
                {course.sana || "—"}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("role.mentor")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D1017", margin: 0 }}>
                {course.mentor || "—"}
              </p>
            </div>

            {/* Row 3 */}
            <div className="xs:col-span-2">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("role.assistant")}
              </p>
              {course.assistant && course.assistant !== "—" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#0D1017",
                    }}
                  >
                    {course.assistant}
                  </span>
                  <button
                    onClick={onRemoveAssistant}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={t("courses.removeAssistant")}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "4px" }}>
                  <button
                    onClick={onAssignAssistant}
                    style={{
                      background: "#2563EB",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      outline: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
                  >
                    {t("courses.assignAssistant")}
                  </button>
                </div>
              )}
            </div>

            {/* Row 4 */}
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("courses.salesCount")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D1017", margin: 0 }}>
                {course.salesCount !== undefined ? course.salesCount : "—"}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#636C79", margin: "0 0 6px 0" }}>
                {t("table.status")}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D1017", margin: 0 }}>
                {course.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Assign Assistant Modal ───────────────────────────────────────────────────

type AssignAssistantModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (assistantId: string) => void;
  assistants: { id: string; fullName: string }[];
};

function AssignAssistantModal({ open, onClose, onSave, assistants }: AssignAssistantModalProps) {
  const { t } = useLanguage();
  const [selectedAssistantId, setSelectedAssistantId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedAssistantId("");
      setDropdownOpen(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!selectedAssistantId) return;
    onSave(selectedAssistantId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1010] flex items-center justify-center p-2 xs:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[480px] rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] xs:p-6 sm:p-8">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "16px",
            borderBottom: "1px solid #F0F1F2",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#0D1017",
              margin: 0,
            }}
          >
            {t("courses.assignAssistant")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color="#636C79" />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                color: "#0D1017",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {t("courses.selectAssistant")}
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "44px",
                  border: "1px solid #E0E3E6",
                  borderRadius: "8px",
                  padding: "0 14px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: selectedAssistantId ? "#0D1017" : "#9CA3AF",
                  background: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  outline: "none",
                }}
              >
                <span>
                  {selectedAssistantId
                    ? assistants.find((ast) => ast.id === selectedAssistantId)?.fullName
                    : t("common.enterValue")}
                </span>
                <ChevronDown size={16} color="#636C79" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 1020,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "6px",
                      background: "#ffffff",
                      border: "1px solid #E0E3E6",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      zIndex: 1030,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {assistants.length === 0 ? (
                      <div style={{ padding: "12px", fontSize: "14px", color: "#636C79", textAlign: "center" }}>
                        {t("courses.noAssistants")}
                      </div>
                    ) : (
                      assistants.map((ast) => (
                        <div
                          key={ast.id}
                          onClick={() => {
                            setSelectedAssistantId(ast.id);
                            setDropdownOpen(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            fontSize: "14px",
                            color: selectedAssistantId === ast.id ? "#2563EB" : "#0D1017",
                            background: selectedAssistantId === ast.id ? "#EFF6FF" : "#ffffff",
                            cursor: "pointer",
                            transition: "background 0.15s",
                            fontWeight: selectedAssistantId === ast.id ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (selectedAssistantId !== ast.id) e.currentTarget.style.background = "#F9FAFB";
                          }}
                          onMouseLeave={(e) => {
                            if (selectedAssistantId !== ast.id) e.currentTarget.style.background = "#ffffff";
                          }}
                        >
                          {ast.fullName}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "4px" }}>
            <button
              onClick={handleSave}
              disabled={!selectedAssistantId}
              style={{
                background: selectedAssistantId ? "#EF4444" : "#94A3B8",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor: selectedAssistantId ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                outline: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => selectedAssistantId && (e.currentTarget.style.background = "#DC2626")}
              onMouseLeave={(e) => selectedAssistantId && (e.currentTarget.style.background = "#EF4444")}
            >
              <Check size={16} />
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CoursesList() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assistantsList, setAssistantsList] = useState<{ id: string; fullName: string }[]>([]);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Level filter states
  const [showLevelFilter, setShowLevelFilter] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  // Modals
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successType, setSuccessType] = useState<"add" | "edit">("add");

  // Detail Modal States
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Bitta kurs statusini badge orqali to'g'ridan-to'g'ri almashtirish uchun holat
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);

  // Debounce searchVal -> searchInput
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchInput(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Load assistants list only when the Assign modal is opened
  useEffect(() => {
    if (isAssignOpen) {
      const fetchAssistants = async () => {
        try {
          const response = await apiFetch("/users?limit=1000&role=ASSISTANT");
          if (response.ok) {
            const resData = await response.json();
            if (resData && Array.isArray(resData.data)) {
              setAssistantsList(resData.data.map((ast: any) => ({
                id: String(ast.id),
                fullName: ast.fullName || "Ismsiz assistent",
              })));
            }
          }
        } catch (err) {
          console.error("Error fetching assistants:", err);
        }
      };
      fetchAssistants();
    }
  }, [isAssignOpen]);

  // Fetch courses dynamically from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `/courses?offset=${offset}&limit=${itemsPerPage}`;
      if (searchInput.trim()) {
        url += `&search=${encodeURIComponent(searchInput.trim())}`;
      }
      if (selectedLevel) {
        url += `&level=${selectedLevel}`;
      }
      const response = await apiFetch(url);
      if (response.ok) {
        const resData = await response.json();
        if (resData) {
          setTotalCourses(resData.total || 0);
          if (Array.isArray(resData.data)) {
            const mapped = resData.data.map((item: any) => {
              // Read assigned assistants list directly from the item.assistants array
              const assignedAssistantName = Array.isArray(item.assistants)
                ? item.assistants.map((ast: any) => ast.user?.fullName).filter(Boolean).join(", ")
                : "";
              const firstAssistant = Array.isArray(item.assistants) && item.assistants.length > 0
                ? item.assistants[0].user
                : null;

              return {
                id: String(item.id),
                selected: false,
                banner: item.banner ? `/files/public/${item.banner}` : "/images/admin/banner1.png",
                name: item.name || "Nomsiz kurs",
                sections: 0,
                level: item.level || "BEGINNER",
                price: item.price ? Number(item.price).toLocaleString("uz-UZ") : "0",
                status: item.published ? "Faol" : "Nofaol",
                introVideo: item.introVideo || "",
                description: item.about || "",
                sana: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : "",
                mentor: item.mentor?.fullName || "Mentor biriktirilmagan",
                assistant: assignedAssistantName || "—",
                assistantId: firstAssistant ? firstAssistant.id : undefined,
                salesCount: item._count?.purchases || 0,
              };
            });
            setCourses(mapped);
          } else {
            setCourses([]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, itemsPerPage, searchInput, selectedLevel]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, selectedLevel]);

  // Checkbox select all
  const allSelected = courses.length > 0 && courses.every((c) => c.selected);
  const toggleSelectAll = () => setCourses((prev) => prev.map((c) => ({ ...c, selected: !allSelected })));
  const toggleSelect = (id: string) =>
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)));



  const totalPages = Math.max(1, Math.ceil(totalCourses / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = courses;

  const rangeStart = totalCourses === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCourses);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Add
  const handleAdd = async (data: CourseFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("about", data.description);
      formData.append("price", data.price);

      if (data.bannerFile) {
        formData.append("banner", data.bannerFile);
      }
      if (data.introVideoFile) {
        formData.append("introVideo", data.introVideoFile);
      }

      const response = await apiFetch("/courses/create", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchCourses();
        setIsAddOpen(false);
        setSuccessType("add");
        setSuccessMsg("Muvaffaqiyatli qo'shildi");
        setIsSuccessOpen(true);
      } else {
        const errData = await response.json();
        alert(Array.isArray(errData?.message) ? errData.message.join(", ") : (errData?.message || "Xatolik yuz berdi"));
      }
    } catch (err) {
      console.error("Error creating course:", err);
      alert("Tizimda xatolik yuz berdi");
    }
  };

  // ─── Edit — real API (multipart/form-data) ──────────────────────────────────
  const editingCourse = courses.find((c) => c.id === editingId) ?? null;
  const editingData: Partial<CourseFormData> | undefined = editingCourse
    ? {
      banner: editingCourse.banner,
      name: editingCourse.name,
      description: editingCourse.description ?? "",
      price: editingCourse.price.replace(/\s/g, ""),
    }
    : undefined;

  // ─── Delete — real API ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await apiFetch(`/courses/delete/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "O'chirishda xatolik yuz berdi.");
      }
      setDeleteId(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi.");
    }
  };

  // ─── Edit — real API ─────────────────────────────────────────────────────────
  const handleEdit = async (data: CourseFormData) => {
    if (!editingId) return;
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("about", data.description);
      formData.append("price", data.price);

      if (data.bannerFile) {
        formData.append("banner", data.bannerFile);
      }
      if (data.introVideoFile) {
        formData.append("introVideo", data.introVideoFile);
      }

      const response = await apiFetch(`/courses/update/${editingId}`, {
        method: "PATCH",
        body: formData,
      });

      if (response.ok) {
        fetchCourses();
        setEditingId(null);
        setSuccessType("edit");
        setSuccessMsg("Muvaffaqiyatli o'zgartirildi");
        setIsSuccessOpen(true);
      } else {
        const errData = await response.json();
        alert(Array.isArray(errData?.message) ? errData.message.join(", ") : (errData?.message || "Xatolik yuz berdi"));
      }
    } catch (err) {
      console.error("Error updating course:", err);
      alert("Tizimda xatolik yuz berdi");
    }
  };

  // Publish/Unpublish toggle action (checkbox + "Faollashtirilgan" switch orqali, bir nechta kursga)
  const handleTogglePublish = async () => {
    const selectedCourses = courses.filter((c) => c.selected);
    if (selectedCourses.length === 0) return;

    // Check if all selected courses are currently active (ON state)
    const isCurrentlyAllActive = selectedCourses.every((c) => c.status === "Faol");

    try {
      setLoading(true);
      await Promise.all(
        selectedCourses.map(async (course) => {
          // If the switch was ON, we turn all OFF (unpublish).
          // If the switch was OFF (including mixed state), we turn all ON (publish).
          const endpoint = isCurrentlyAllActive
            ? `/courses/unpublish/${course.id}`
            : `/courses/publish/${course.id}`;
          await apiFetch(endpoint, {
            method: "POST",
          });
        })
      );
      await fetchCourses();
    } catch (err) {
      console.error("Error toggling publish status:", err);
      alert("Statusni o'zgartirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Bitta kursning statusini "Faol/Nofaol" badge'iga bosib, to'g'ridan-to'g'ri almashtirish
  const handleSingleTogglePublish = async (course: Course) => {
    if (togglingCourseId) return; // boshqa so'rov tugashini kutamiz
    const endpoint =
      course.status === "Faol"
        ? `/courses/unpublish/${course.id}`
        : `/courses/publish/${course.id}`;

    try {
      setTogglingCourseId(course.id);
      const response = await apiFetch(endpoint, { method: "POST" });
      if (response.ok) {
        await fetchCourses();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || "Statusni o'zgartirishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Error toggling single course publish:", err);
      alert("Tizimda xatolik yuz berdi");
    } finally {
      setTogglingCourseId(null);
    }
  };

  // Details & Assistant helpers
  const detailCourse = courses.find((c) => c.id === detailCourseId) ?? null;

  const handleAssignAssistant = async (assistantIdStr: string) => {
    if (!detailCourseId) return;
    try {
      setLoading(true);
      const response = await apiFetch("/courses/assign-assistant", {
        method: "POST",
        body: JSON.stringify({
          assistantId: Number(assistantIdStr),
          courseId: detailCourseId,
        }),
      });
      if (response.ok) {
        setDetailCourseId(null);
        await fetchCourses();
      } else {
        const errData = await response.json();
        alert(errData.message || "Assistent biriktirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Error assigning assistant:", err);
      alert("Tizimda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssistant = async () => {
    if (!detailCourseId || !detailCourse || !detailCourse.assistantId) return;
    try {
      setLoading(true);
      const response = await apiFetch("/courses/unassign-assistant", {
        method: "POST",
        body: JSON.stringify({
          assistantId: Number(detailCourse.assistantId),
          courseId: detailCourseId,
        }),
      });
      if (response.ok) {
        setDetailCourseId(null);
        await fetchCourses();
      } else {
        const errData = await response.json();
        alert(errData.message || "Assistentni o'chirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Error unassigning assistant:", err);
      alert("Tizimda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // ─── XLS export — to'liq ro'yxatni alohida so'rov bilan olib eksport qiladi ──
  const handleExportXls = async () => {
    try {
      const response = await apiFetch(`/courses?offset=0&limit=10000`);
      if (!response.ok) return;
      const resData = await response.json();
      const items = mapCourses(Array.isArray(resData.data) ? resData.data : []);

      const XLSX = await import("xlsx");
      const rows = items.map((c) => ({
        ID: c.id,
        "Kurs nomi": c.name,
        Darajasi: c.level,
        Narxi: c.price,
        Holati: c.status,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kurslar");
      XLSX.writeFile(wb, "kurslar.xlsx");
    } catch (err) {
      console.error("XLS Export error:", err);
    }
  };

  // Pagination Controls (search-row) — mobil uchun gorizontal scroll bilan
  const PaginationControls = () => (
    <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 text-sm text-[#374151] [-ms-overflow-style:none] [scrollbar-width:none] md:w-auto md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
      <span className="mr-1 hidden shrink-0 whitespace-nowrap xs:inline">{t("pagination.perPage")}</span>
      <div className="mr-2 shrink-0 xs:mr-3">
        <PageLimitDropdown
          value={itemsPerPage}
          onChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 xs:gap-1.5">
        {getVisiblePages(safePage, totalPages).map((page, idx) =>
          page === "..." ? (
            <span key={`e-${idx}`} className="px-0.5 xs:px-1">...</span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page as number)}
              className="font-inter flex size-7 shrink-0 items-center justify-center rounded-md text-sm font-medium xs:size-8"
              style={{
                border: page === safePage ? "1px solid #E0E3E6" : "none",
                background: page === safePage ? "#ffffff" : "transparent",
                color: page === safePage ? "#0D1017" : "#636C79",
              }}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => goToPage(safePage + 1)}
        disabled={safePage === totalPages}
        className="font-inter ml-1 flex h-7 shrink-0 items-center whitespace-nowrap rounded-md border border-[#E0E3E6] px-2.5 text-sm font-medium text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40 xs:h-8 xs:px-3"
      >
        {t("common.next")}
      </button>
    </div>
  );

  const RangeInfo = () => (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[#374151] xs:gap-3 sm:text-sm">
      <span className="whitespace-nowrap">{t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")} {totalCourses} {t("pagination.items")}</span>
      <button
        onClick={handleExportXls}
        className="font-inter flex shrink-0 items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2 py-1.5 text-xs text-[#0D1017] xs:px-2.5 sm:text-[13px]"
      >
        <div className="relative flex h-4 w-3.5 shrink-0 items-center justify-center">
          <img
            src="/images/admin/Page.png"
            alt="excel"
            className="h-auto w-full"
          />
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] font-extrabold leading-none tracking-tighter text-white">
            XLS
          </span>
        </div>
        <span className="whitespace-nowrap">
          <span className="hidden xs:inline">({totalCourses}) </span>
          {t("pagination.downloadXls")}
        </span>
      </button>
    </div>
  );

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 xs:mb-5 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="m-0 text-lg font-bold text-[#0D1017] xs:text-xl sm:text-2xl">{t("courses.title")}</h1>
          <p className="mt-1 text-[11px] text-[#374151] xs:text-xs sm:text-sm">
            {t("courses.title")}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 xs:flex-row xs:items-center">
          {/* Faollashtirilgan toggle — faqat biror checkbox belgilanganda ko'rinadi */}
          {courses.some((c) => c.selected) && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handleTogglePublish}
                disabled={loading}
                style={{
                  width: "40px", height: "22px", borderRadius: "11px",
                  background: courses.filter((c) => c.selected).every((c) => c.status === "Faol") ? "#2563EB" : "#D1D5DB",
                  border: "none", cursor: loading ? "not-allowed" : "pointer", position: "relative", transition: "background 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <span style={{
                  position: "absolute", top: "3px",
                  left: courses.filter((c) => c.selected).every((c) => c.status === "Faol") ? "21px" : "3px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "#ffffff", transition: "left 0.2s",
                }} />
              </button>
              <span style={{ fontSize: "13px", color: "#636C79" }}>{t("table.activated")}</span>
            </div>
          )}
          <Button onClick={() => setIsAddOpen(true)} className="w-full xs:w-auto" style={{ height: "40px", borderRadius: "8px", gap: "6px" }}>
            <Plus size={16} /> {t("common.add")}
          </Button>
        </div>
      </div>

      {/* Search + Pagination */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-center md:justify-between">
        {/* Search input with filter icon inside */}
        <div className="relative w-full shrink-0 xs:max-w-[360px] sm:w-80 md:w-96">
          <Search size={16} color="#636C79" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            style={{
              width: "100%", height: "40px", border: "1px solid #E0E3E6", borderRadius: "8px",
              paddingLeft: "40px", paddingRight: "64px",
              fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#0D1017",
              outline: "none", boxSizing: "border-box", background: "#ffffff",
            }}
          />
          {searchVal && (
            <button onClick={() => setSearchVal("")}
              style={{ position: "absolute", right: "36px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
            >
              <X size={14} color="#9CA3AF" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowLevelFilter(!showLevelFilter)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <SlidersVertical size={16} color={selectedLevel ? "#2563EB" : "#374151"} />
          </button>

          {/* Level Filter Popover */}
          {showLevelFilter && (
            <>
              <div
                onClick={() => setShowLevelFilter(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 999,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "#ffffff",
                  border: "1px solid #E0E3E6",
                  borderRadius: "8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  width: "180px",
                  padding: "6px 0",
                }}
              >
                <div style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>
                  {t("courses.levelFilterTitle")}
                </div>
                {[
                  { value: "", label: t("common.all") },
                  { value: "BEGINNER", label: "Beginner" },
                  { value: "PRE_INTERMEDIATE", label: "Pre-Intermediate" },
                  { value: "INTERMEDIATE", label: "Intermediate" },
                  { value: "UPPER_INTERMEDIATE", label: "Upper-Intermediate" },
                  { value: "ADVANCED", label: "Advanced" },
                ].map((lvl) => (
                  <div
                    key={lvl.value}
                    onClick={() => {
                      setSelectedLevel(lvl.value);
                      setShowLevelFilter(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      color: lvl.value === selectedLevel ? "#2563EB" : "#0D1017",
                      background: lvl.value === selectedLevel ? "#F3F4F6" : "#ffffff",
                      cursor: "pointer",
                      fontWeight: lvl.value === selectedLevel ? 600 : 500,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (lvl.value !== selectedLevel) e.currentTarget.style.background = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      if (lvl.value !== selectedLevel) e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    {lvl.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        <PaginationControls />
      </div>

      {/* ── Mobil / planshet: karta ko'rinishi (<768px) ── */}
      <div className="flex flex-col gap-2.5 xs:gap-3 md:hidden">
        {loading ? (
          <div className="flex justify-center px-4 py-10">
            <div className="size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
            {searchVal ? `"${searchVal}" bo'yicha hech narsa topilmadi` : "Ma'lumot topilmadi"}
          </div>
        ) : (
          paginated.map((course) => (
            <div key={course.id} className="rounded-2xl border border-[#F0F1F2] bg-white p-3.5 shadow-sm xs:p-4">
              <div className="flex items-start gap-2.5 xs:gap-3">
                <input
                  type="checkbox"
                  checked={course.selected}
                  onChange={() => toggleSelect(course.id)}
                  className="mt-1 size-4 shrink-0 cursor-pointer"
                />
                <div className="h-11 w-[72px] shrink-0 overflow-hidden rounded-md xs:h-12 xs:w-20">
                  <img
                    src={course.banner}
                    alt="banner"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/courses/sections?courseId=${course.id}&courseName=${encodeURIComponent(course.name || "")}`}
                    className="block truncate text-sm font-semibold text-[#2563EB] hover:underline"
                  >
                    {course.name}
                  </Link>
                  <p className="mt-1 truncate text-xs text-[#636C79]">
                    {course.level} <span className="mx-1">•</span> {course.price} so&apos;m
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#F5F5F5] pt-3">
                <button
                  onClick={() => handleSingleTogglePublish(course)}
                  disabled={togglingCourseId === course.id}
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    background: course.status === "Faol" ? "#D1FAE5" : "#FEE2E2",
                    color: course.status === "Faol" ? "#065F46" : "#991B1B",
                    border: "none",
                    cursor: togglingCourseId === course.id ? "not-allowed" : "pointer",
                    opacity: togglingCourseId === course.id ? 0.6 : 1,
                  }}
                  title={course.status === "Faol" ? t("status.draft") : t("status.published")}
                >
                  {togglingCourseId === course.id ? "..." : course.status}
                </button>
                <div className="flex items-center gap-1.5 xs:gap-2">
                  <button
                    onClick={() => setDetailCourseId(course.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white xs:size-9"
                    aria-label={t("common.details")}
                  >
                    <Eye size={14} color="#374151" />
                  </button>
                  <button
                    onClick={() => setEditingId(course.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white xs:size-9"
                    aria-label={t("common.edit")}
                  >
                    <Pencil size={14} color="#374151" />
                  </button>
                  <button
                    onClick={() => setDeleteId(course.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white xs:size-9"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── md va undan katta: jadval ko'rinishi (≥768px) ── */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
                <th className="w-11 border-r border-[#E0E3E6] px-3 py-3.5 md:px-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                </th>
                <th className="border-r border-[#E0E3E6] px-2 py-3.5 text-left font-semibold text-[#0D1017] whitespace-nowrap md:px-3">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {t("table.banner")}
                    <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                  </div>
                </th>
                <th className="min-w-[180px] border-r border-[#E0E3E6] px-3 py-3.5 text-left font-semibold text-[#0D1017] md:px-4 lg:min-w-[260px]">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {t("table.courseName")}
                    <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                  </div>
                </th>

                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    Narxi
                    <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                  </div>
                </th>
                <th className="border-r border-[#E0E3E6] px-3 py-3.5 text-left font-semibold text-[#0D1017] md:px-4">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    Holati
                    <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                  </div>
                </th>
                <th className="px-3 py-3.5 text-left font-semibold text-[#0D1017] md:px-4">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                    <div style={{ display: "inline-block", width: "24px", height: "24px", borderRadius: "50%", border: "3px solid #E0E3E6", borderTopColor: "#2563EB", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
                    {searchVal ? `"${searchVal}" bo'yicha hech narsa topilmadi` : "Ma'lumot topilmadi"}
                  </td>
                </tr>
              ) : (
                paginated.map((course) => (
                  <tr key={course.id} className="border-b border-[#E0E3E6] last:border-b-0">
                    <td className="border-r border-[#E0E3E6] px-3 py-4 md:px-4">
                      <input type="checkbox" checked={course.selected} onChange={() => toggleSelect(course.id)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                    </td>
                    <td className="border-r border-[#E0E3E6] px-2 py-3 md:px-3">
                      <div style={{ width: "84px", height: "40px", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                        <img
                          src={course.banner}
                          alt="banner"
                          style={{ objectFit: "contain", width: "100%", height: "100%" }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F3F4F6'/><text x='50' y='50' fill='%239CA3AF' font-family='sans-serif' font-size='10' text-anchor='middle' alignment-baseline='middle'>Rasm yo'q</text></svg>";
                          }}
                        />
                      </div>
                    </td>
                    <td className="border-r border-[#E0E3E6] px-3 py-4 md:px-4">
                      <Link
                        href={`/admin/courses/sections?courseId=${course.id}&courseName=${encodeURIComponent(course.name || "")}`}
                        className="font-medium text-[#2563EB] hover:underline"
                      >
                        {course.name}
                      </Link>
                      {/* lg kenglikdan kichikda Narxi/Darajasi ustunlari yashirin bo'lgani uchun ixcham ko'rinishda ko'rsatiladi */}
                      <p className="mt-1 text-xs text-[#636C79] lg:hidden">
                        {course.level} <span className="mx-1">•</span> {course.price} so&apos;m
                      </p>
                    </td>

                    <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017] lg:table-cell">{course.price}</td>
                    <td className="border-r border-[#E0E3E6] px-3 py-4 md:px-4">
                      <button
                        onClick={() => handleSingleTogglePublish(course)}
                        disabled={togglingCourseId === course.id}
                        className="whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium"
                        style={{
                          background: course.status === "Faol" ? "#D1FAE5" : "#FEE2E2",
                          color: course.status === "Faol" ? "#065F46" : "#991B1B",
                          border: "none",
                          cursor: togglingCourseId === course.id ? "not-allowed" : "pointer",
                          opacity: togglingCourseId === course.id ? 0.6 : 1,
                        }}
                        title={course.status === "Faol" ? "Nashrdan olish" : "Nashr qilish"}
                      >
                        {togglingCourseId === course.id ? "..." : course.status}
                      </button>
                    </td>
                    <td className="px-3 py-4 md:px-4">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <button onClick={() => setDetailCourseId(course.id)} className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white">
                          <Eye size={14} color="#374151" />
                        </button>
                        <button onClick={() => setEditingId(course.id)} className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white">
                          <Pencil size={14} color="#374151" />
                        </button>
                        <button onClick={() => setDeleteId(course.id)} className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white">
                          <Trash2 size={14} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom XLS Controls */}
      <div className="mt-4 flex items-center justify-start">
        <RangeInfo />
      </div>

      {/* Modals */}
      <CourseModal open={isAddOpen} onClose={() => setIsAddOpen(false)} mode="add" onSubmit={handleAdd} />
      <CourseModal open={editingId !== null} onClose={() => setEditingId(null)} mode="edit" initialData={editingData} onSubmit={handleEdit} />
      <DeleteConfirmModal open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)} onConfirm={handleDelete} />
      <SuccessModal open={isSuccessOpen} onOpenChange={setIsSuccessOpen} title={successMsg} type={successType} />

      <CourseDetailModal
        open={detailCourseId !== null}
        onClose={() => setDetailCourseId(null)}
        course={detailCourse}
        onEdit={(id) => {
          setDetailCourseId(null);
          setEditingId(id);
        }}
        onDelete={(id) => {
          setDetailCourseId(null);
          setDeleteId(id);
        }}
        onAssignAssistant={() => setIsAssignOpen(true)}
        onRemoveAssistant={handleRemoveAssistant}
      />

      <AssignAssistantModal
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onSave={handleAssignAssistant}
        assistants={assistantsList}
      />
    </div>
  );
}