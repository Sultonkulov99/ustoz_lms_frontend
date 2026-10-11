"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Download, Check, X, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type Course = {
  id: string;
  name: string;
};

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

type Submission = {
  id: number;
  file: string | null;
  text: string;
  status: SubmissionStatus;
  reason: string | null;
  createdAt: string;
  homework: {
    id: number;
    lessonId: string;
  };
  user: {
    id: number;
    image: string | null;
    fullName: string;
    phone: string;
  };
};

const FILES_BASE_URL = "/files/public";

const STATUS_FILTERS: { value: "ALL" | SubmissionStatus; label: string }[] = [
  { value: "ALL", label: "Barchasi" },
  { value: "PENDING", label: "Kutilmoqda" },
  { value: "APPROVED", label: "Tasdiqlangan" },
  { value: "REJECTED", label: "Rad etilgan" },
];

function statusLabel(status: SubmissionStatus) {
  if (status === "APPROVED") return "Qabul qilindi";
  if (status === "REJECTED") return "Rad etildi";
  return "Kutilmoqda";
}

function statusColors(status: SubmissionStatus) {
  if (status === "APPROVED") return { bg: "#DCFCE7", text: "#16A34A" };
  if (status === "REJECTED") return { bg: "#FEE2E2", text: "#DC2626" };
  return { bg: "#FEF3C7", text: "#CA8A04" };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getInitial(name: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

function getAvatarColor(name: string) {
  const colors = ["#BC000D", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
  const code = name?.trim()?.toUpperCase()?.charCodeAt(0) || 0;
  return colors[code % colors.length];
}

// ─── Fayl kengaytmasidan MIME type aniqlash ──────────────────────────────────
// Backend ba'zan noto'g'ri/umumiy Content-Type (masalan application/octet-stream)
// qaytarishi mumkin. Shu holatda brauzer PNG/PDF faylni xom matn sifatida ochib
// yuborishi mumkin. Shuning uchun fayl nomining kengaytmasiga qarab to'g'ri
// MIME type'ni o'zimiz aniqlab, blob'ni shu tur bilan qayta o'raymiz.

function getMimeType(fileName: string, fallback: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
    txt: "text/plain",
  };
  return map[ext] ?? fallback ?? "application/octet-stream";
}

// ─── Fayl ko'rish/yuklab olish (private endpoint, blob orqali) ───────────────

async function openSubmissionFile(lessonId: string, fileName: string) {
  try {
    const res = await apiFetch(`/files/private/lesson-file/${lessonId}/${fileName}`);
    if (!res.ok) {
      alert("Faylni ochishda xatolik yuz berdi.");
      return;
    }

    const rawBlob = await res.blob();

    // Fayl kengaytmasiga qarab to'g'ri MIME type bilan qayta o'raymiz —
    // aks holda brauzer PNG/PDF'ni xom matn sifatida ochib yuboradi.
    const correctMime = getMimeType(fileName, rawBlob.type);
    const typedBlob =
      rawBlob.type === correctMime ? rawBlob : new Blob([rawBlob], { type: correctMime });

    const url = window.URL.createObjectURL(typedBlob);

    // Rasm/PDF kabi turlarni yangi tabda ko'rish uchun ochamiz...
    const viewableTypes = ["image/", "application/pdf"];
    const isViewable = viewableTypes.some((t) => correctMime.startsWith(t));

    if (isViewable) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    // ...va shu bilan birga asl nomi bilan yuklab olish imkonini beramiz.
    // <a download> atributi orqali brauzer blob URL o'rniga aynan shu
    // nomni ishlatadi, aks holda tasodifiy/vaqtinchalik nom bilan saqlanadi.
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);

    if (!isViewable) {
      // Ko'rib bo'lmaydigan fayl turlari (docx, zip va h.k.) uchun
      // to'g'ridan-to'g'ri yuklab olishni ishga tushiramiz.
      link.click();
    }

    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    console.error("Fayl ochishda xatolik:", err);
    alert("Faylni ochishda xatolik yuz berdi.");
  }
}

// ─── Rad etish modali (sabab kiritish) ────────────────────────────────────────

function RejectModal({
  open,
  onClose,
  onConfirm,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1010] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-inter text-lg font-semibold text-[#0D1017]">
            Vazifani rad etish
          </h2>
          <button onClick={onClose} className="p-1 text-[#636C79]">
            <X size={20} />
          </button>
        </div>

        <label className="font-inter mb-1.5 block text-sm font-medium text-[#0D1017]">
          Rad etish sababi
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sababni kiriting..."
          rows={4}
          className="font-inter mb-4 w-full resize-none rounded-lg border border-[#E0E3E6] p-3 text-sm text-[#0D1017] outline-none focus:border-[#BC000D]"
        />

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="font-inter rounded-lg border border-[#E0E3E6] px-4 py-2.5 text-sm font-medium text-[#374151]"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || submitting}
            className="font-inter rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Yuborilmoqda..." : "Rad etish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Batafsil modal ────────────────────────────────────────────────────────

function SubmissionDetailModal({
  submission,
  onClose,
  onApprove,
  onOpenReject,
  actionLoading,
}: {
  submission: Submission | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onOpenReject: (id: number) => void;
  actionLoading: boolean;
}) {
  if (!submission) return null;
  const colors = statusColors(submission.status);
  const hasAvatar = !!submission.user.image;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="mb-5 flex items-center justify-between border-b border-[#F0F1F2] pb-4">
          <h2 className="font-inter text-lg font-semibold text-[#0D1017]">
            Vazifa tafsilotlari
          </h2>
          <button onClick={onClose} className="p-1 text-[#636C79]">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ background: hasAvatar ? "#D4D3D3" : getAvatarColor(submission.user.fullName) }}
          >
            {hasAvatar ? (
              <img
                src={`${FILES_BASE_URL}/${submission.user.image}`}
                alt={submission.user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-inter text-sm font-bold text-white">
                {getInitial(submission.user.fullName)}
              </span>
            )}
          </div>
          <div>
            <p className="font-inter text-sm font-semibold text-[#0D1017]">
              {submission.user.fullName}
            </p>
            <p className="font-inter text-xs text-[#636C79]">{submission.user.phone}</p>
          </div>
          <span
            className="font-inter ml-auto rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: colors.bg, color: colors.text }}
          >
            {statusLabel(submission.status)}
          </span>
        </div>

        <div className="mb-4">
          <p className="font-inter mb-1.5 text-xs text-[#636C79]">Izoh</p>
          <p className="font-inter text-sm leading-relaxed text-[#374151]">
            {submission.text || "Izoh qoldirilmagan"}
          </p>
        </div>

        {submission.file && (
          <div className="mb-4">
            <p className="font-inter mb-1.5 text-xs text-[#636C79]">Fayl</p>
            <button
              onClick={() => openSubmissionFile(submission.homework.lessonId, submission.file!)}
              className="font-inter inline-flex items-center gap-2 rounded-lg border border-[#E0E3E6] bg-[#F9FAFB] px-3.5 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F1F2]"
            >
              <FileText size={16} color="#BC000D" />
              Faylni ko&apos;rish / yuklab olish
              <Download size={14} />
            </button>
          </div>
        )}

        <div className="mb-5">
          <p className="font-inter mb-1.5 text-xs text-[#636C79]">Yuborilgan sana</p>
          <p className="font-inter text-sm text-[#374151]">{formatDate(submission.createdAt)}</p>
        </div>

        {submission.status === "REJECTED" && submission.reason && (
          <div className="mb-5 rounded-lg bg-[#FEF2F2] p-3.5">
            <p className="font-inter mb-1 text-xs font-semibold text-[#DC2626]">Rad etish sababi</p>
            <p className="font-inter text-sm text-[#7F1D1D]">{submission.reason}</p>
          </div>
        )}

        {submission.status === "PENDING" && (
          <div className="flex gap-2.5 border-t border-[#F0F1F2] pt-4">
            <button
              onClick={() => onOpenReject(submission.id)}
              disabled={actionLoading}
              className="font-inter flex-1 rounded-lg border border-[#DC2626] px-4 py-2.5 text-sm font-semibold text-[#DC2626] disabled:opacity-50"
            >
              Rad etish
            </button>
            <button
              onClick={() => onApprove(submission.id)}
              disabled={actionLoading}
              className="font-inter flex-1 rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {actionLoading ? "Yuborilmoqda..." : "Tasdiqlash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Asosiy komponent ──────────────────────────────────────────────────────

export function MentorHomeworkList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"ALL" | SubmissionStatus>("ALL");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Mentorning o'z kurslari ro'yxatini yuklash (filtr uchun)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch(`/courses/my?offset=0&limit=100`);
        if (res.ok) {
          const resData = await res.json();
          const items: Course[] = Array.isArray(resData.data)
            ? resData.data.map((c: any) => ({ id: String(c.id), name: c.name || "Nomsiz kurs" }))
            : [];
          setCourses(items);
          if (items.length > 0) setSelectedCourseId(items[0].id);
        }
      } catch (err) {
        console.error("Kurslarni yuklashda xatolik:", err);
      }
    };
    fetchCourses();
  }, []);

  const fetchSubmissions = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/homework/submissions/all?offset=0&limit=100&course_id=${selectedCourseId}`
      );
      if (!res.ok) throw new Error("Vazifalarni yuklashda xatolik yuz berdi.");
      const resData = await res.json();
      setTotal(resData.total ?? 0);
      setSubmissions(Array.isArray(resData.data) ? resData.data : []);
    } catch (err: any) {
      console.error("Submissions fetch error:", err);
      setError(err.message || "Vazifalarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filteredSubmissions = submissions.filter((s) =>
    statusFilter === "ALL" ? true : s.status === statusFilter
  );

  const detailSubmission = submissions.find((s) => s.id === detailId) ?? null;

  const handleCheck = async (submissionId: number, approved: boolean, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/homework/submission/check`, {
        method: "POST",
        body: JSON.stringify({
          submissionId,
          approved,
          reason: reason || "",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Amalni bajarishda xatolik yuz berdi.");
      }
      await fetchSubmissions();
      setDetailId(null);
      setRejectId(null);
    } catch (err: any) {
      alert(err.message || "Amalni bajarishda xatolik yuz berdi.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-inter text-xl font-bold text-[#0D1017] sm:text-2xl">
          Uy vazifalarini tekshirish
        </h1>
        <p className="font-inter mt-1 text-xs text-[#636C79] sm:text-sm">
          Materiallar <span className="mx-1">•</span> Uyga vazifalar
        </p>
      </div>

      {/* Kurs tanlash */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-[320px]">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="font-inter h-11 w-full rounded-lg border border-[#E0E3E6] bg-white px-3.5 text-sm text-[#0D1017] outline-none"
          >
            {courses.length === 0 && <option value="">Kurslar topilmadi</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filtri */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className="font-inter rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors"
              style={{
                background: statusFilter === f.value ? "#BC000D" : "#ffffff",
                color: statusFilter === f.value ? "#ffffff" : "#374151",
                border: "1px solid",
                borderColor: statusFilter === f.value ? "#BC000D" : "#E0E3E6",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ro'yxat */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#BC000D]" />
        </div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-[#DC2626]">{error}</div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#9CA3AF]">
          {submissions.length === 0
            ? "Bu kurs bo'yicha hali vazifa topshirilmagan."
            : "Ushbu filtr bo'yicha vazifalar topilmadi."}
        </div>
      ) : (
        <>
          {/* Mobil: karta ko'rinishi */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filteredSubmissions.map((s) => {
              const colors = statusColors(s.status);
              const hasAvatar = !!s.user.image;
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                      style={{ background: hasAvatar ? "#D4D3D3" : getAvatarColor(s.user.fullName) }}
                    >
                      {hasAvatar ? (
                        <img
                          src={`${FILES_BASE_URL}/${s.user.image}`}
                          alt={s.user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-inter text-xs font-bold text-white">
                          {getInitial(s.user.fullName)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-inter truncate text-sm font-semibold text-[#0D1017]">
                        {s.user.fullName}
                      </p>
                      <p className="font-inter truncate text-xs text-[#636C79]">
                        {formatDate(s.createdAt)}
                      </p>
                    </div>
                    <span
                      className="font-inter shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {statusLabel(s.status)}
                    </span>
                  </div>

                  <p className="font-inter mt-3 line-clamp-2 text-sm text-[#374151]">
                    {s.text || "Izoh qoldirilmagan"}
                  </p>

                  <button
                    onClick={() => setDetailId(s.id)}
                    className="font-inter mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E0E3E6] py-2.5 text-sm font-semibold text-[#0D1017]"
                  >
                    <Eye size={14} />
                    Batafsil
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop: jadval ko'rinishi */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] sm:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                    <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                      O&apos;quvchi
                    </th>
                    <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                      Izoh
                    </th>
                    <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                      Fayl
                    </th>
                    <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                      Sana
                    </th>
                    <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                      Holati
                    </th>
                    <th className="px-4 py-3.5 text-center font-semibold text-[#0D1017]">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((s) => {
                    const colors = statusColors(s.status);
                    const hasAvatar = !!s.user.image;
                    return (
                      <tr key={s.id} className="border-b border-[#E0E3E6]">
                        <td className="border-r border-[#E0E3E6] px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                              style={{
                                background: hasAvatar ? "#D4D3D3" : getAvatarColor(s.user.fullName),
                              }}
                            >
                              {hasAvatar ? (
                                <img
                                  src={`${FILES_BASE_URL}/${s.user.image}`}
                                  alt={s.user.fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="font-inter text-[11px] font-bold text-white">
                                  {getInitial(s.user.fullName)}
                                </span>
                              )}
                            </div>
                            <span className="font-inter font-medium text-[#0D1017]">
                              {s.user.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="border-r border-[#E0E3E6] px-4 py-3.5">
                          <p className="font-inter max-w-[220px] truncate text-[#374151]">
                            {s.text || "—"}
                          </p>
                        </td>
                        <td className="border-r border-[#E0E3E6] px-4 py-3.5">
                          {s.file ? (
                            <button
                              onClick={() => openSubmissionFile(s.homework.lessonId, s.file!)}
                              className="font-inter inline-flex items-center gap-1.5 text-[#2563EB] hover:underline"
                            >
                              <FileText size={14} />
                              Ko&apos;rish
                            </button>
                          ) : (
                            <span className="text-[#9CA3AF]">—</span>
                          )}
                        </td>
                        <td className="border-r border-[#E0E3E6] px-4 py-3.5 text-[#374151]">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="border-r border-[#E0E3E6] px-4 py-3.5">
                          <span
                            className="font-inter rounded-full px-3 py-1 text-xs font-semibold"
                            style={{ background: colors.bg, color: colors.text }}
                          >
                            {statusLabel(s.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {s.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setDetailId(s.id)}
                                title="Batafsil"
                                className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                              >
                                <Eye size={14} color="#374151" />
                              </button>
                              <button
                                onClick={() => handleCheck(s.id, true)}
                                disabled={actionLoading}
                                title="Tasdiqlash"
                                className="flex size-8 items-center justify-center rounded-md border border-[#16A34A] bg-[#F0FDF4] disabled:opacity-50"
                              >
                                <Check size={14} color="#16A34A" />
                              </button>
                              <button
                                onClick={() => setRejectId(s.id)}
                                disabled={actionLoading}
                                title="Rad etish"
                                className="flex size-8 items-center justify-center rounded-md border border-[#DC2626] bg-[#FEF2F2] disabled:opacity-50"
                              >
                                <X size={14} color="#DC2626" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDetailId(s.id)}
                              title="Batafsil"
                              className="mx-auto flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                            >
                              <Eye size={14} color="#374151" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="font-inter text-sm text-[#636C79]">
        Jami: {total} ta vazifa {statusFilter !== "ALL" && `(filtrlangan: ${filteredSubmissions.length})`}
      </div>

      <SubmissionDetailModal
        submission={detailSubmission}
        onClose={() => setDetailId(null)}
        onApprove={(id) => handleCheck(id, true)}
        onOpenReject={(id) => setRejectId(id)}
        actionLoading={actionLoading}
      />

      <RejectModal
        open={rejectId !== null}
        onClose={() => setRejectId(null)}
        onConfirm={(reason) => rejectId !== null && handleCheck(rejectId, false, reason)}
        submitting={actionLoading}
      />
    </div>
  );
}