"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Download, Plus, Pencil, Copy, Trash2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ErrorAlertModal } from "@/components/modals/error-alert-modal";
import {
  AddExamModal,
  ExamFormData,
  ExamEditData,
} from "@/components/modals/add-exam-modal";

interface Lesson {
  id: string;
  topic: string;
  description: string;
  videoFileName: string;
}

interface LessonFile {
  id: number;
  file: string;
  note: string;
}

interface Homework {
  id: number;
  task: string;
  file: string | null;
}

interface Exam {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  // Backend'dan kelgan xom "answer" qiymati (masalan "variantC") — PATCH/duplicate
  // qilishda kerak bo'ladi.
  rawAnswer: "variantA" | "variantB" | "variantC" | "variantD";
  // Backend'dagi xom fayl nomi (masalan "pccf_....png") — edit/duplicate uchun.
  image?: string | null;
}

// Rasm manzilini backend'dan kelgan qiymatdan hosil qiladi.
// Agar rasm allaqachon to'liq URL bo'lsa, o'zgarishsiz qaytaradi.
function resolveExamImageSrc(image: string | null | undefined): string | null {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `/files/public/${image}`;
}

// Sahifalash tugmalari uchun ko'rinadigan sahifalar ro'yxatini hosil qiladi
// (masalan: 1 ... 4 5 6 ... 12). Boshqa komponentlardagi (MentorSectionsList,
// MentorCourses) bilan bir xil pattern.
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

export function MentorLessonsList({
  courseId,
  courseName,
  sectionId,
}: {
  courseId: string;
  courseName: string;
  sectionId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const lessonIdFromUrl = searchParams?.get("lessonId") || null;
  const tabFromUrl =
    (searchParams?.get("tab") as "materiallar" | "vazifalar" | "imtihonlar") || "materiallar";

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lessonIdFromUrl);
  const [activeTab, setActiveTab] = useState<"materiallar" | "vazifalar" | "imtihonlar">(tabFromUrl);
  const view: "lessons" | "details" = selectedLessonId ? "details" : "lessons";

  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [duplicatingExamId, setDuplicatingExamId] = useState<string | null>(null); // ← yangi

  useEffect(() => {
    setSelectedLessonId(searchParams?.get("lessonId") || null);
    setActiveTab(
      (searchParams?.get("tab") as "materiallar" | "vazifalar" | "imtihonlar") || "materiallar"
    );
  }, [searchParams]);

  const updateUrlParams = (newLessonId: string | null, newTab: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newLessonId) params.set("lessonId", newLessonId);
    else params.delete("lessonId");
    if (newTab) params.set("tab", newTab);
    else params.delete("tab");
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchLessons = async () => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/lesson-group/detail/${sectionId}`);
      if (response.ok) {
        const resData = await response.json();
        const list = Array.isArray(resData?.lessons)
          ? resData.lessons
          : Array.isArray(resData)
          ? resData
          : [];

        const getLessonOrder = (item: any): number => {
          const match = String(item.name || "").match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
        };
        const sortedList = [...list].sort((a: any, b: any) => {
          const orderDiff = getLessonOrder(a) - getLessonOrder(b);
          if (orderDiff !== 0) return orderDiff;
          return Number(a.id) - Number(b.id);
        });

        setLessons(
          sortedList.map((item: any) => ({
            id: String(item.id),
            topic: item.name || "Nomsiz dars",
            description: item.about || "",
            videoFileName: item.youtube_link || "",
          }))
        );
      }
    } catch (err) {
      console.error("Mentor lessons fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [sectionId]);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );

  // ── Materiallar ──
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const fetchLessonFiles = async (lessonId: string) => {
    setFilesLoading(true);
    try {
      const res = await apiFetch(`/lesson-files/lesson/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setLessonFiles(Array.isArray(data) ? data : []);
      } else {
        setLessonFiles([]);
      }
    } catch (err) {
      console.error("Mentor lesson files error:", err);
      setLessonFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // ── Vazifalar ──
  const [homework, setHomework] = useState<Homework | null>(null);
  const [homeworkLoading, setHomeworkLoading] = useState(false);

  const fetchHomework = async (lessonId: string) => {
    setHomeworkLoading(true);
    try {
      const res = await apiFetch(`/homework/lesson/${lessonId}?offset=0&limit=8`);
      if (res.status === 404 || !res.ok) {
        setHomework(null);
        return;
      }
      const resJson = await res.json();
      const list = resJson?.data;
      setHomework(Array.isArray(list) && list.length > 0 ? list[0] : null);
    } catch (err) {
      console.error("Mentor homework fetch error:", err);
      setHomework(null);
    } finally {
      setHomeworkLoading(false);
    }
  };

  // ── Imtihonlar ──
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isExamErrorModalOpen, setIsExamErrorModalOpen] = useState(false);
  const [isExamSuccessModalOpen, setIsExamSuccessModalOpen] = useState(false);
  const [examErrorMessage, setExamErrorMessage] = useState("");
  const [examSuccessMessage, setExamSuccessMessage] = useState("");

  const showExamSuccess = (message: string) => {
    setExamSuccessMessage(message);
    setIsExamSuccessModalOpen(true);
  };

  // Tahrirlanayotgan savol (null = "qo'shish" rejimi ochiq)
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  // Nusxalanayotgan (duplicate) savol id'si — tugmada spinner ko'rsatish uchun
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  // O'chirish tasdiqlash oynasi uchun
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Imtihonlar pagination (frontendda, backend hozircha to'liq ro'yxatni
  // qaytarganligi uchun) — sahifa o'zgarganda tartib raqami ((page-1)*perPage + idx + 1)
  // asosida hisoblanadi, shu tufayli 2-sahifada ham raqamlar davom etadi (1 dan
  // qayta boshlanmaydi).
  const [examsPage, setExamsPage] = useState(1);
  const [examsPerPage, setExamsPerPage] = useState(10);

  const fetchExams = async (lessonId: string) => {
    setExamsLoading(true);
    try {
      const res = await apiFetch(`/tests/lesson/details/${lessonId}`);
      if (!res.ok) {
        setExams([]);
        return;
      }
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: String(item.id),
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
        rawAnswer: (item.answer || "variantA") as Exam["rawAnswer"],
        image: item.image || null,
      }));
      setExams(mapped);
    } catch (err) {
      console.error("Mentor exams fetch error:", err);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLessonId && view === "details") {
      if (activeTab === "materiallar") fetchLessonFiles(selectedLessonId);
      else if (activeTab === "vazifalar") fetchHomework(selectedLessonId);
      else if (activeTab === "imtihonlar") {
        setExamsPage(1); // dars yoki tab almashganda 1-sahifadan boshlaymiz
        fetchExams(selectedLessonId);
      }
    }
  }, [selectedLessonId, activeTab, view]);

  // exams ro'yxati o'zgarganda (qo'shish/o'chirish/tahrirlash), agar joriy
  // sahifa endi mavjud bo'lmasa (masalan oxirgi elementni o'chirib
  // tashlaganda), sahifani mavjud oxirgi sahifaga qaytaramiz.
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(exams.length / examsPerPage));
    if (examsPage > totalPages) setExamsPage(totalPages);
  }, [exams.length, examsPerPage, examsPage]);

  const examsTotalPages = Math.max(1, Math.ceil(exams.length / examsPerPage));
  const examsSafePage = Math.min(examsPage, examsTotalPages);
  const examsRangeStart = exams.length === 0 ? 0 : (examsSafePage - 1) * examsPerPage + 1;
  const examsRangeEnd = Math.min(examsSafePage * examsPerPage, exams.length);
  const goToExamsPage = (p: number) =>
    setExamsPage(Math.min(Math.max(1, p), examsTotalPages));

  const paginatedExams = useMemo(() => {
    const start = (examsSafePage - 1) * examsPerPage;
    return exams.slice(start, start + examsPerPage);
  }, [exams, examsSafePage, examsPerPage]);

  const showExamError = (message: string) => {
    setExamErrorMessage(message);
    setIsExamErrorModalOpen(true);
  };

  // Yangi imtihon savolini yaratish.
  const handleAddExam = async (data: ExamFormData) => {
    if (!selectedLessonId) return;

    const formData = new FormData();
    formData.append("question", data.question);
    formData.append("lessonId", selectedLessonId);
    formData.append("variantA", data.variantA);
    formData.append("variantB", data.variantB);
    formData.append("variantC", data.variantC);
    formData.append("variantD", data.variantD);
    formData.append("answer", data.answer);
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await apiFetch("/tests/create", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Savol qo'shishda xatolik yuz berdi.");
    }

    if (selectedLessonId) fetchExams(selectedLessonId);
  };

  // Mavjud savolni tahrirlash (PATCH /tests/update/:id)
  const handleUpdateExam = async (data: ExamFormData) => {
    if (!editingExam) return;

    const formData = new FormData();
    formData.append("question", data.question);
    formData.append("variantA", data.variantA);
    formData.append("variantB", data.variantB);
    formData.append("variantC", data.variantC);
    formData.append("variantD", data.variantD);
    formData.append("answer", data.answer);

    if (data.image) {
      // Yangi rasm tanlangan — uni yuboramiz
      formData.append("image", data.image);
    } else if (data.removeImage) {
      // Rasmni olib tashlash so'ralgan — bo'sh qiymat yuboramiz
      // (Swagger namunasida ko'rilgan xatti-harakat: image="" => image: null)
      formData.append("image", "");
    }
    // Aks holda "image" maydoni umuman yuborilmaydi — backend mavjud rasmni saqlab qoladi

    const response = await apiFetch(`/tests/update/${editingExam.id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Savolni tahrirlashda xatolik yuz berdi.");
    }

    if (selectedLessonId) fetchExams(selectedLessonId);
  };

  

  // Modal "Saqlash" bosilganda — rejimga qarab create yoki update chaqiriladi
  const handleModalSubmit = async (data: ExamFormData) => {
    if (editingExam) {
      await handleUpdateExam(data);
    } else {
      await handleAddExam(data);
    }
  };

  // Savolni nusxalash (duplicate). Agar rasm bo'lsa, uni ham backend'dan
  // blob sifatida yuklab olib, yangi savolga fayl sifatida biriktiramiz.
  const handleDuplicateExam = async (exam: Exam) => {
    if (!selectedLessonId || duplicatingId) return;
    setDuplicatingId(exam.id);
    try {
      let imageFile: File | null = null;

      if (exam.image) {
        try {
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
        // Rasm yuklanmasa ham, savolning o'zini nusxalashda davom etamiz —
        // faqat rasmsiz nusxalanadi.
      }

      const formData = new FormData();
      formData.append("question", exam.question);
      formData.append("lessonId", selectedLessonId);
      formData.append("variantA", exam.optionA);
      formData.append("variantB", exam.optionB);
      formData.append("variantC", exam.optionC);
      formData.append("variantD", exam.optionD);
      formData.append("answer", exam.rawAnswer);
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

    fetchExams(selectedLessonId);
    showExamSuccess("Savolning nusxasi yaratildi va so'nggi savoldan keyin joylashtirildi");
    } catch (err) {
      console.error("Duplicate exam error:", err);
      showExamError(err instanceof Error ? err.message : "Savolni nusxalashda xatolik yuz berdi.");
    } finally {
      setDuplicatingId(null);
    }
  };

  // O'chirishni tasdiqlash oynasidan keyin haqiqiy o'chirish (DELETE /tests/:id)
  const confirmDeleteExam = async () => {
    if (!deleteTargetId || !selectedLessonId) return;
    setIsDeleting(true);
    try {
      const response = await apiFetch(`/tests/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Savolni o'chirishda xatolik yuz berdi.");
      }
      setDeleteTargetId(null);
      fetchExams(selectedLessonId);
    } catch (err) {
      console.error("Delete exam error:", err);
      setDeleteTargetId(null);
      showExamError(err instanceof Error ? err.message : "Savolni o'chirishda xatolik yuz berdi.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Material/homework faylini yuklab olish
  const handleDownloadFile = async (lessonId: string, file: string) => {
    try {
      const response = await apiFetch(`/files/private/lesson-file/${lessonId}/${file}`);
      if (!response.ok) {
        showExamError("Faylni yuklab olishda xatolik yuz berdi.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Fayl yuklab olish xatosi:", err);
      showExamError("Faylni yuklab olishda xatolik yuz berdi.");
    }
  };

  // AddExamModal'ga uzatiladigan "edit" ma'lumoti (tanlangan savol asosida)
  const editModalData: ExamEditData | null = editingExam
    ? {
        id: editingExam.id,
        question: editingExam.question,
        variantA: editingExam.optionA,
        variantB: editingExam.optionB,
        variantC: editingExam.optionC,
        variantD: editingExam.optionD,
        answer: editingExam.rawAnswer,
        imageUrl: resolveExamImageSrc(editingExam.image),
      }
    : null;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {view === "lessons" ? (
        <div>
          <div className="mb-4 sm:mb-6">
            <p className="text-xs text-[#636C79] sm:text-[13px]">
              <Link href="/mentor/courses" className="hover:underline" style={{ color: "#636C79", textDecoration: "none" }}>
                Mening kurslarim
              </Link>
              <span className="mx-1">•</span>
              <Link
                href={`/mentor/courses/sections?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`}
                className="hover:underline"
                style={{ color: "#636C79", textDecoration: "none" }}
              >
                {courseName}
              </Link>
              <span className="mx-1">•</span>
              Darslar
            </p>
            <h1 className="mt-1.5 text-lg font-bold text-[#0D1017] sm:text-xl md:text-2xl">
              Darslar
            </h1>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E0E3E6] bg-white">
            <table className="w-full min-w-[560px] border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                  <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                    Dars mavzusi
                  </th>
                  <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                    Dars haqida
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                    Video
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-[#9CA3AF] sm:py-12">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : lessons.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-[#9CA3AF] sm:py-12">
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-[#E0E3E6]">
                      <td
                        onClick={() => updateUrlParams(lesson.id, "materiallar")}
                        className="cursor-pointer border-r border-[#E0E3E6] px-3 py-3 font-medium text-[#2563EB] sm:px-4 sm:py-4"
                      >
                        {lesson.topic}
                      </td>
                      <td className="whitespace-pre-line border-r border-[#E0E3E6] px-3 py-3 text-[#374151] sm:px-4 sm:py-4">
                        {lesson.description}
                      </td>
                      <td className="px-3 py-3 text-[#374151] sm:px-4 sm:py-4">
                        {lesson.videoFileName ? "YouTube" : "Fayl yo'q"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 sm:mb-6">
            <p className="flex flex-wrap items-center gap-x-1 text-xs text-[#636C79] sm:text-[13px]">
              <Link href="/mentor/courses" className="hover:underline" style={{ color: "#636C79", textDecoration: "none" }}>
                Mening kurslarim
              </Link>
              <span>•</span>
              <Link
                href={`/mentor/courses/sections?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`}
                className="hover:underline"
                style={{ color: "#636C79", textDecoration: "none" }}
              >
                {courseName}
              </Link>
              <span>•</span>
              <span
                onClick={() => updateUrlParams(null, null)}
                className="cursor-pointer hover:underline"
                style={{ color: "#BC000D" }}
              >
                Darslar
              </span>
              <span>•</span>
              <span className="truncate">{activeLesson?.topic}</span>
            </p>
            <h1 className="mt-1.5 text-lg font-bold text-[#0D1017] sm:text-xl md:text-2xl">
              {activeLesson?.topic}
            </h1>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
            <div className="flex flex-wrap gap-2">
              {(["materiallar", "vazifalar", "imtihonlar"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const textMap = { materiallar: "Materiallar", vazifalar: "Vazifalar", imtihonlar: "Imtihonlar" };
                return (
                  <button
                    key={tab}
                    onClick={() => updateUrlParams(selectedLessonId, tab)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold sm:px-[18px] sm:py-2 sm:text-sm"
                    style={{
                      border: isActive ? "none" : "1px solid #E0E3E6",
                      background: isActive ? "#BC000D" : "#ffffff",
                      color: isActive ? "#ffffff" : "#636C79",
                    }}
                  >
                    {textMap[tab]}
                  </button>
                );
              })}
            </div>

            {activeTab === "imtihonlar" && (
              <button
                type="button"
                onClick={() => {
                  setEditingExam(null);
                  setIsAddExamModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:py-2 sm:text-sm"
                style={{ background: "#BC000D" }}
              >
                <Plus className="size-4" />
                Savol qo&apos;shish
              </button>
            )}
          </div>

          {activeTab === "materiallar" && (
            <div className="overflow-x-auto rounded-xl border border-[#E0E3E6] bg-white">
              <table className="w-full min-w-[420px] border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                    <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                      Izoh
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                      Fayl
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filesLoading ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-10 text-center text-[#9CA3AF] sm:py-12">
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : lessonFiles.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-10 text-center text-[#4B5563] sm:py-12">
                        Materiallar biriktirilmagan
                      </td>
                    </tr>
                  ) : (
                    lessonFiles.map((f) => (
                      <tr key={f.id} className="border-b border-[#E0E3E6]">
                        <td className="border-r border-[#E0E3E6] px-3 py-3 text-[#374151] sm:px-4 sm:py-4">
                          {f.note || "—"}
                        </td>
                        <td className="px-3 py-3 sm:px-4 sm:py-4">
                          <button
                            onClick={() => selectedLessonId && handleDownloadFile(selectedLessonId, f.file)}
                            className="inline-flex max-w-[160px] items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2.5 py-1.5 text-xs text-[#2563EB] sm:max-w-[240px] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[13px]"
                          >
                            <Download size={14} className="shrink-0" />
                            <span className="truncate">{f.file}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "vazifalar" && (
            <div className="overflow-x-auto rounded-xl border border-[#E0E3E6] bg-white">
              <table className="w-full min-w-[420px] border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                    <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                      Topshiriq
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">
                      Fayl
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {homeworkLoading ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-10 text-center text-[#9CA3AF] sm:py-12">
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : !homework ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-10 text-center text-[#4B5563] sm:py-12">
                        Vazifalar biriktirilmagan
                      </td>
                    </tr>
                  ) : (
                    <tr className="border-b border-[#E0E3E6]">
                      <td className="whitespace-pre-line border-r border-[#E0E3E6] px-3 py-3 text-[#374151] sm:px-4 sm:py-4">
                        {homework.task}
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">
                        {homework.file ? (
                          <button
                            onClick={() => selectedLessonId && homework.file && handleDownloadFile(selectedLessonId, homework.file)}
                            className="inline-flex max-w-[160px] items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2.5 py-1.5 text-xs text-[#2563EB] sm:max-w-[240px] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[13px]"
                          >
                            <Download size={14} className="shrink-0" />
                            <span className="truncate">{homework.file}</span>
                          </button>
                        ) : (
                          <span className="text-[#9CA3AF]">Fayl yo&apos;q</span>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "imtihonlar" && (
            <>
              <div className="overflow-x-auto rounded-xl border border-[#E0E3E6] bg-white">
                <table className="w-full min-w-[860px] border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">№</th>
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">Rasm</th>
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">Savol</th>
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">A</th>
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">B</th>
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">C</th>
                      <th className="border-r border-[#E0E3E6] px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">D</th>
                      <th className="px-3 py-3 text-left font-semibold text-[#0D1017] sm:px-4 sm:py-3.5">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examsLoading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-[#9CA3AF] sm:py-12">
                          Yuklanmoqda...
                        </td>
                      </tr>
                    ) : exams.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-[#4B5563] sm:py-12">
                          Imtihonlar biriktirilmagan
                        </td>
                      </tr>
                    ) : (
                      paginatedExams.map((e, idx) => {
                        const imgSrc = resolveExamImageSrc(e.image);
                        // Tartib raqami sahifadan qat'i nazar davom etadi:
                        // 1-sahifa: 1..10, 2-sahifa: 11..20 va h.k.
                        const rowNumber = (examsSafePage - 1) * examsPerPage + idx + 1;
                        return (
                          <tr key={e.id} className="border-b border-[#E0E3E6]">
                            <td className="border-r border-[#E0E3E6] px-3 py-3 sm:px-4 sm:py-4">{rowNumber}</td>
                            <td className="border-r border-[#E0E3E6] px-3 py-3 sm:px-4 sm:py-4">
                              {imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt="Savol rasmi"
                                  className="h-10 w-14 rounded object-cover"
                                />
                              ) : (
                                <span className="text-[#9CA3AF]">—</span>
                              )}
                            </td>
                            <td className="border-r border-[#E0E3E6] px-3 py-3 sm:px-4 sm:py-4">{e.question}</td>
                            {(["A", "B", "C", "D"] as const).map((opt) => {
                              const val = e[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"];
                              const isCorrect = e.correctOption === opt;
                              return (
                                <td
                                  key={opt}
                                  className="border-r border-[#E0E3E6] px-3 py-3 sm:px-4 sm:py-4"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span>{val}</span>
                                    {isCorrect && (
                                      <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] text-[#374151] sm:text-[11px]">
                                        To&apos;g&apos;ri
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-3 py-3 sm:px-4 sm:py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingExam(e);
                                    setIsAddExamModalOpen(true);
                                  }}
                                  title="Tahrirlash"
                                  className="flex size-7 items-center justify-center rounded-md border border-[#E0E3E6] text-[#374151] hover:bg-[#F3F4F6]"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateExam(e)}
                                  disabled={duplicatingId === e.id}
                                  title="Nusxalash"
                                  className="flex size-7 items-center justify-center rounded-md border border-[#E0E3E6] text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-50"
                                >
                                  {duplicatingId === e.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTargetId(e.id)}
                                  title="O'chirish"
                                  className="flex size-7 items-center justify-center rounded-md border border-[#E0E3E6] text-[#BC000D] hover:bg-[#FFF1F1]"
                                >
                                  <Trash2 size={14} />
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

              {/* ── Imtihonlar pagination paneli ── */}
              {!examsLoading && exams.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-[#374151]">
                    Sahifada {examsRangeStart}-{examsRangeEnd} gacha. Umumiy {exams.length}ta
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151]">
                    <span className="mr-1 whitespace-nowrap">Bir sahifada:</span>
                    <select
                      value={examsPerPage}
                      onChange={(e) => {
                        setExamsPerPage(Number(e.target.value));
                        setExamsPage(1);
                      }}
                      className="mr-3 h-8 rounded-md border border-[#E0E3E6] bg-white px-2 text-sm text-[#0D1017] outline-none"
                    >
                      {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    {getVisiblePages(examsSafePage, examsTotalPages).map((page, idx) =>
                      page === "..." ? (
                        <span key={`e-${idx}`} className="px-1">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToExamsPage(Number(page))}
                          className="flex size-8 items-center justify-center rounded-md text-sm font-medium"
                          style={{
                            border: page === examsSafePage ? "1px solid #E0E3E6" : "none",
                            background: page === examsSafePage ? "#ffffff" : "transparent",
                            color: page === examsSafePage ? "#0D1017" : "#636C79",
                          }}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => goToExamsPage(examsSafePage + 1)}
                      disabled={examsSafePage === examsTotalPages}
                      className="ml-1 flex h-8 items-center whitespace-nowrap rounded-md border border-[#E0E3E6] px-3 text-sm font-medium text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <AddExamModal
        open={isAddExamModalOpen}
        onOpenChange={(open) => {
          setIsAddExamModalOpen(open);
          if (!open) setEditingExam(null);
        }}
        editData={editModalData}
        onSubmit={handleModalSubmit}
      />

      <ErrorAlertModal
        open={isExamErrorModalOpen}
        onOpenChange={setIsExamErrorModalOpen}
        message={examErrorMessage}
      />

      {/* Muvaffaqiyat xabari */}
      <ErrorAlertModal
        open={isExamSuccessModalOpen}
        onOpenChange={setIsExamSuccessModalOpen}
        message={examSuccessMessage}
      />

      {/* O'chirishni tasdiqlash oynasi */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="mb-2 text-base font-bold text-[#0D1017]">
              Savolni o&apos;chirish
            </h3>
            <p className="mb-6 text-sm text-[#636C79]">
              Bu savolni o&apos;chirishga aminmisiz? Bu amalni bekor qilib bo&apos;lmaydi.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="rounded-lg border border-[#E0E3E6] px-4 py-2 text-sm font-medium text-[#374151] disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmDeleteExam}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-lg bg-[#BC000D] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}