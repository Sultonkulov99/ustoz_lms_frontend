
// "use client";

// import Image from "next/image";
// import { useState, useEffect, useRef } from "react";
// import {
//   ChevronRight,
//   Check,
//   MessageCircle,
//   Download,
//   X,
//   Send,
//   ArrowLeft,
//   Menu,
//   Paperclip,
// } from "lucide-react";
// import { useRouter, useParams, useSearchParams } from "next/navigation";
// import { apiFetch } from "@/lib/api-client";
// import { API_BASE_URL } from "@/lib/config";
// import { useLanguage } from "@/contexts/LanguageContext";
// import DOMPurify from "dompurify";
// import { QuestionRichEditor } from "@/components/ui/QuestionRichEditor";

// // MUHIM: bu yerda nisbiy yo'l ("/files/public") emas, backendning TO'LIQ domeni
// // bilan birlashtirilgan yo'l ishlatiladi. Sabab: bu qiymat oddiy <img>/<a> teglarida
// // to'g'ridan-to'g'ri ishlatiladi (apiFetch orqali emas), shuning uchun brauzer uni
// // joriy sahifa domeni (localhost:3000 yoki frontend domeni) asosida hal qiladi, backend
// // domeni (masalan 63.180.181.4:4000) asosida emas. Agar shu yerda nisbiy yo'l qolsa,
// // barcha rasm/fayl so'rovlari 404 bilan tugaydi.
// const FILES_BASE_URL = `${API_BASE_URL}/files/public`;

// type Tab = "qa" | "materiallar" | "vazifalar" | "imtihonlar";

// interface ApiLesson {
//   id: string;
//   name: string;
//   views: any[];
// }

// interface ApiLessonGroup {
//   id: number;
//   name: string;
//   lessons: ApiLesson[];
// }

// interface LessonDetail {
//   id: string;
//   name: string;
//   about: string;
//   groupId: number;
//   homework: {
//     id: number;
//     task: string;
//     file: string;
//     lessonId: string;
//     updatedAt: string | null;
//     createdAt: string;
//   } | null;
//   youtube_link: string | null;
//   lessonFiles: { id: number; file: string; note: string; lessonId: string; createdAt: string }[];
// }

// interface HomeworkSubmission {
//   id: number;
//   text: string;
//   file: string;
//   reason: string | null;
//   status: "PENDING" | "APPROVED" | "REJECTED" | string;
//   homeworkId: number;
//   userId: number;
//   updatedAt: string | null;
//   createdAt: string;
// }

// interface TestQuestion {
//   id: number;
//   question: string;
//   variantA: string;
//   variantB: string;
//   variantC: string;
//   variantD: string;
//   // Mentor savolga rasm biriktirgan bo'lsa, backend shu maydonda fayl nomini
//   // qaytaradi (masalan "pccf_62bbdb4a-....png"), aks holda null.
//   // MUHIM: bu fayl PRIVATE (COURSE_CONTENT) sifatida saqlanadi
//   // (uploads/private/files/ ichida, "pccf_" prefiksi bilan), PUBLIC emas!
//   // Shuning uchun uni oddiy <img src="..."> bilan ko'rsatib bo'lmaydi —
//   // backend /files/private/lesson-file/:lessonId/:name JWT token talab qiladi,
//   // <img> tegi esa Authorization header yubora olmaydi. Pastda shu rasm
//   // apiFetch (token bilan) orqali blob sifatida yuklanadi va Object URL
//   // sifatida ko'rsatiladi (handleDownloadMaterial funksiyasidagi patternga o'xshash).
//   image?: string | null;
// }

// interface TestResult {
//   passed: boolean;
//   corrects: number;
//   wrongs: number;
// }

// // ── Q&A (savol-javob) uchun tiplar — backend /questions endpointi bilan mos ──
// interface QuestionAnswer {
//   id: number;
//   text: string;
//   file: string | null;
//   createdAt: string;
//   answeredBy: {
//     id: number;
//     fullName: string;
//     image: string | null;
//     role: string;
//   };
// }

// interface QuestionItem {
//   id: number;
//   text: string;
//   file: string | null;
//   read: boolean;
//   createdAt: string;
//   from: {
//     id: number;
//     fullName: string;
//     image: string | null;
//   };
//   answer: QuestionAnswer | null;
// }

// function getYoutubeEmbedUrl(url: string | null): string | null {
//   if (!url) return null;
//   let videoId: string | null = null;

//   const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
//   const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);

//   if (shortMatch) videoId = shortMatch[1];
//   else if (longMatch) videoId = longMatch[1];

//   if (!videoId) return null;
//   return `https://www.youtube.com/embed/${videoId}`;
// }

// // Fayl nomi (yoki qisman yo'l) asosida to'liq, ishlaydigan URL hosil qiladi.
// // - Agar backend allaqachon to'liq URL (http/https bilan boshlanadigan) qaytarsa,
// //   o'zgarishsiz ishlatiladi.
// // - Aks holda FILES_BASE_URL (backendning to'liq domeni) bilan birlashtiriladi.
// // - Boshida "/" bo'lsa, dublikat "//" hosil bo'lmasligi uchun tozalanadi.
// //
// // DIQQAT: bu funksiya faqat PUBLIC fayllar (masalan foydalanuvchi avatarlari,
// // Q&A ilova fayllari) uchun ishlatiladi. Imtihon savoli rasmi kabi PRIVATE
// // fayllar uchun ishlatilmaydi — ular uchun pastdagi useEffect (blob orqali
// // yuklash) ishlatiladi.
// function resolveFileSrc(file: string | null | undefined): string | null {
//   if (!file) return null;
//   if (file.startsWith("http://") || file.startsWith("https://")) return file;
//   const cleanFile = file.startsWith("/") ? file.slice(1) : file;
//   return `${FILES_BASE_URL}/${cleanFile}`;
// }

// function getCurrentUserId(): number | null {
//   if (typeof window === "undefined") return null;
//   const token = localStorage.getItem("token");
//   if (!token) return null;
//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     return payload?.id ?? null;
//   } catch {
//     return null;
//   }
// }

// function getInitial(name: string): string {
//   if (!name) return "?";
//   return name.trim().charAt(0).toUpperCase();
// }

// function getAvatarColor(name: string): string {
//   const colors = ["#BC000D", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
//   if (!name) return colors[0];
//   const charCode = name.trim().toUpperCase().charCodeAt(0) || 0;
//   return colors[charCode % colors.length];
// }

// function formatDate(iso: string) {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return iso;
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
// }

// const quizQuestions = [
//   {
//     id: 1,
//     text: "Quyidagilardan qaysi biri CSS-da matn rangini o'zgartiradi?",
//     options: ["font-size", "color", "background", "border"],
//     correctIndex: 1,
//   },
//   {
//     id: 2,
//     text: "CSS-da qaysi xususiyat meros bo'lib o'tadi?",
//     options: ["margin", "padding", "font-family", "border"],
//     correctIndex: 2,
//   },
//   {
//     id: 3,
//     text: "HTML-da eng katta sarlavha qaysi teg?",
//     options: ["<h6>", "<h3>", "<h1>", "<header>"],
//     correctIndex: 2,
//   },
//   {
//     id: 4,
//     text: "CSS-da element o'lchamini belgilash uchun qaysi birlik qo'llaniladi?",
//     options: ["px", "kg", "cm (faqat)", "dp"],
//     correctIndex: 0,
//   },
//   {
//     id: 5,
//     text: "Quyidagilardan qaysi biri formatlash tegi emas?",
//     options: ["<span>", "<strong>", "<mark>", "<div>"],
//     correctIndex: 0,
//   },
// ];

// export function StudentCourseDetail() {
//   const { t } = useLanguage();
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const courseId = params?.id as string;

//   const [groups, setGroups] = useState<ApiLessonGroup[]>([]);
//   const [groupsLoading, setGroupsLoading] = useState(true);
//   const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
//   const [courseName, setCourseName] = useState("");

//   const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
//   const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
//   const [lessonLoading, setLessonLoading] = useState(false);

//   const [viewedLessonIds, setViewedLessonIds] = useState<Set<string>>(new Set());

//   const [activeTab, setActiveTab] = useState<Tab>("qa");
//   const [showAskModal, setShowAskModal] = useState(false);
//   const [questionText, setQuestionText] = useState("");
//   const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
//   const [questionFile, setQuestionFile] = useState<File | null>(null);
//   const [questionSubmitting, setQuestionSubmitting] = useState(false);
//   const [questionError, setQuestionError] = useState<string | null>(null);

//   // ── Q&A: haqiqiy savollar ro'yxati ──
//   const [questions, setQuestions] = useState<QuestionItem[]>([]);
//   const [questionsLoading, setQuestionsLoading] = useState(false);
//   const [questionsError, setQuestionsError] = useState<string | null>(null);

//   // ── Notification'dan deep-link orqali kelgan savolni scroll+highlight qilish uchun ──
//   const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
//   const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);
//   const lastHandledDeepLinkRef = useRef<string | null>(null);

//   const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
//   const [homeworkLoading, setHomeworkLoading] = useState(false);
//   const [homeworkText, setHomeworkText] = useState("");
//   const [homeworkFile, setHomeworkFile] = useState<File | null>(null);
//   const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);

//   const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
//   const [testLoading, setTestLoading] = useState(false);
//   const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
//   const [testResult, setTestResult] = useState<TestResult | null>(null);
//   const [testSubmitting, setTestSubmitting] = useState(false);

//   const [testAlreadyPassed, setTestAlreadyPassed] = useState(false);

//   // ── Imtihon savoli rasmi: PRIVATE fayl bo'lgani uchun apiFetch (token bilan)
//   // orqali blob sifatida yuklanadi va Object URL sifatida saqlanadi ──
//   const [examQuestionImageUrl, setExamQuestionImageUrl] = useState<string | null>(null);
//   const [examQuestionImageLoading, setExamQuestionImageLoading] = useState(false);
//   const [examQuestionImageError, setExamQuestionImageError] = useState<string | null>(null);

//   // Mobil sidebar (drawer) holati
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  

//   // ── Q&A: kurs bo'yicha savollarni yuklash ──
//   // MUHIM: /questions/course/:id — MENTOR-only endpoint, STUDENT uchun 403 qaytaradi.
//   // STUDENT uchun to'g'ri endpoint — /questions/mine?courseId=... (Swagger orqali tasdiqlangan).
//   const fetchQuestions = async () => {
//     if (!courseId) return;
//     setQuestionsLoading(true);
//     setQuestionsError(null);
//     try {
//       const res = await apiFetch(
//         `/questions/mine?offset=0&limit=50&courseId=${courseId}`,
//         { cache: "no-store" }
//       );
//       if (res.ok) {
//         const data = await res.json();
//         setQuestions(Array.isArray(data?.data) ? data.data : []);
//       } else {
//         const errBody = await res.text();
//         console.error("questions/mine xato javobi:", res.status, errBody);
//         setQuestionsError("Savollarni yuklab bo'lmadi");
//       }
//     } catch (err) {
//       console.error("Fetch questions error:", err);
//       setQuestionsError("Savollarni yuklab bo'lmadi");
//     } finally {
//       setQuestionsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuestions();
//   }, [courseId]);

//   // ── Notification'dan (?questionId=...) kelinganda: Q&A tabga o'tish,
//   // MAJBURIY ravishda eng so'nggi savollar ro'yxatini qayta yuklab (eski 'questions'
//   // state'iga tayanmasdan — sahifa allaqachon ochiq bo'lsa mentor javobi eski
//   // state'da bo'lmasligi mumkin), so'ng o'sha savolga scroll qilish va ajratib ko'rsatish ──
//   useEffect(() => {
//     const questionIdParam = searchParams.get("questionId");
//     if (!questionIdParam || !courseId) return;
//     if (lastHandledDeepLinkRef.current === questionIdParam) return;
//     lastHandledDeepLinkRef.current = questionIdParam; // darhol belgilaymiz — qayta ishga tushmasin

//     let cancelled = false;
//     const targetId = Number(questionIdParam);

//     (async () => {
//       setActiveTab("qa");
//       try {
//         const res = await apiFetch(
//           `/questions/mine?offset=0&limit=50&courseId=${courseId}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok || cancelled) return;
//         const data = await res.json();
//         const freshQuestions: QuestionItem[] = Array.isArray(data?.data) ? data.data : [];
//         if (cancelled) return;
//         setQuestions(freshQuestions);

//         const target = freshQuestions.find((q) => q.id === targetId);
//         if (!target) return;

//         // Tab almashgach va ro'yxat render bo'lgach scroll qilamiz
//         setTimeout(() => {
//           const el = questionRefs.current[targetId];
//           if (el) {
//             el.scrollIntoView({ behavior: "smooth", block: "center" });
//           }
//         }, 150);

//         setHighlightedQuestionId(targetId);
//         setTimeout(() => setHighlightedQuestionId(null), 3000);
//       } catch (err) {
//         console.error("Deep-link uchun savollarni qayta yuklashda xatolik:", err);
//       } finally {
//         if (!cancelled) {
//           // URL'ni tozalaymiz, lekin kurs sahifasida qolamiz
//           router.replace(`/student/my-courses/${courseId}`);
//         }
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [searchParams, courseId, router]);

//   const handleAskSubmit = async () => {
//     if (!courseId || !questionText.trim() || questionSubmitting) return;
//     setQuestionSubmitting(true);
//     setQuestionError(null);
//     try {
//       const formData = new FormData();
//       formData.append("text", questionText.trim());
//       if (questionFile) formData.append("file", questionFile);

//       const res = await apiFetch(`/questions/create/${courseId}`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const errBody = await res.text();
//         console.error("questions/create xato javobi:", res.status, errBody);
//         throw new Error("Savol yuborishda xatolik yuz berdi");
//       }

//       setQuestionText("");
//       setQuestionFile(null);
//       setShowAskModal(false);
//       // Yangi savolni ro'yxatga qo'shish uchun qayta yuklaymiz
//       await fetchQuestions();
//     } catch (err) {
//       console.error("Ask question error:", err);
//       setQuestionError("Savol yuborib bo'lmadi, qayta urinib ko'ring");
//     } finally {
//       setQuestionSubmitting(false);
//     }
//   };

//   const handleDownloadMaterial = async (file: string, displayName?: string) => {
//     if (!lessonDetail?.id) return;
//     try {
//       const response = await apiFetch(
//         `/files/private/lesson-file/${lessonDetail.id}/${file}`
//       );
//       if (!response.ok) {
//         alert("Faylni yuklab olishda xatolik yuz berdi.");
//         return;
//       }
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       const ext = file.includes(".") ? file.split(".").pop() : "";
//       link.download = displayName
//         ? ext
//           ? `${displayName}.${ext}`
//           : displayName
//         : file;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Material download error:", err);
//       alert("Faylni yuklab olishda xatolik yuz berdi.");
//     }
//   };

//   const [rating, setRating] = useState(0);
//   const [ratingSubmitting, setRatingSubmitting] = useState(false);
//   const [ratingSubmitted, setRatingSubmitted] = useState(false);
//   const [ratingError, setRatingError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!courseId) return;
//     const fetchMyRating = async () => {
//       try {
//         const res = await apiFetch(
//           `/course-rating/list/${courseId}?offset=0&limit=100`
//         );
//         if (!res.ok) return;
//         const resData = await res.json();
//         const myUserId = getCurrentUserId();
//         const mine = Array.isArray(resData?.data)
//           ? resData.data.find((r: any) => r.user?.id === myUserId)
//           : null;
//         if (mine) {
//           setRating(mine.rate);
//           setRatingSubmitted(true);
//         }
//       } catch (err) {
//         console.error("Rating list fetch error:", err);
//       }
//     };
//     fetchMyRating();
//   }, [courseId]);

//   const submitRating = async (star: number) => {
//     if (!courseId || ratingSubmitting || ratingSubmitted) return;
//     setRating(star);
//     setRatingSubmitting(true);
//     setRatingError(null);
//     try {
//       const res = await apiFetch("/course-rating", {
//         method: "POST",
//         body: JSON.stringify({
//           rate: star,
//           comment: "",
//           courseId,
//         }),
//       });
//       if (!res.ok) {
//         const errBody = await res.text();
//         console.error("course-rating xato javobi:", res.status, errBody);
//         throw new Error("Baholashda xatolik yuz berdi");
//       }
//       setRatingSubmitted(true);
//     } catch (err) {
//       console.error("Rating submit error:", err);
//       setRatingError("Baholab bo'lmadi, qayta urinib ko'ring");
//     } finally {
//       setRatingSubmitting(false);
//     }
//   };
//   const [quizStarted, setQuizStarted] = useState(false);
//   const [tabQuizStarted, setTabQuizStarted] = useState(false);
//   const [showExamPage, setShowExamPage] = useState(false);

//   const [currentQ, setCurrentQ] = useState(0);
//   const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
//     Array(quizQuestions.length).fill(null)
//   );
//   const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
//   const [answerConfirmed, setAnswerConfirmed] = useState(false);
//   const [quizDone, setQuizDone] = useState(false);

//   const resetQuiz = () => {
//     setCurrentQ(0);
//     setUserAnswers(Array(quizQuestions.length).fill(null));
//     setSelectedAnswer(null);
//     setAnswerConfirmed(false);
//     setQuizDone(false);
//   };

//   const [homeworkSubmitted, setHomeworkSubmitted] = useState(false);
//   const [examCompleted, setExamCompleted] = useState(false);
//   const [showWarning, setShowWarning] = useState(false);
//   const [showSuccessToast, setShowSuccessToast] = useState(false);
//   const [successToastMsg, setSuccessToastMsg] = useState("");
//   const [lessonBlockedMessage, setLessonBlockedMessage] = useState<string | null>(null);

//   const showSuccess = (msg: string) => {
//     setSuccessToastMsg(msg);
//     setShowSuccessToast(true);
//     setTimeout(() => setShowSuccessToast(false), 4000);
//   };

//   useEffect(() => {
//     if (!courseId) return;

//     const fetchGroups = async () => {
//       try {
//        const res = await apiFetch(
//           `/lesson-group/mine-all/${courseId}?offset=0&limit=50&include_lessons=true`
//         );
//         if (!res.ok) throw new Error("Darslarni olishda xatolik");
//         const data = await res.json();

//        // Har bir guruh ichidagi darslarni nomidagi raqam bo'yicha (masalan
//         // "2-dars..." dagi 2) saralaymiz — bu darsning haqiqiy tartib raqami.
//         // Backend ro'yxatni ishonchli tartibda qaytarmaydi, bu esa "Keyingi
//         // dars" navigatsiyasini (getNextLessonId) ham buzadi, shuning uchun
//         // tartibni to'liq frontendda hisoblaymiz. Agar nomda raqam bo'lmasa —
//         // id bo'yicha (yaratilish tartibi) saralanadi.
//         const getLessonOrder = (l: ApiLesson): number => {
//           const match = String(l.name || "").match(/^(\d+)/);
//           return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
//         };
//         const sortedGroups: ApiLessonGroup[] = (data.data || []).map((g: ApiLessonGroup) => ({
//           ...g,
//           lessons: [...g.lessons].sort((a, b) => {
//             const orderDiff = getLessonOrder(a) - getLessonOrder(b);
//             if (orderDiff !== 0) return orderDiff;
//             return Number(a.id) - Number(b.id);
//           }),
//         }));

//         setGroups(sortedGroups);

//         const viewed = new Set<string>();
//         sortedGroups.forEach((g: ApiLessonGroup) => {
//           g.lessons.forEach((l) => {
//             if (l.views && l.views.length > 0) viewed.add(l.id);
//           });
//         });
//         setViewedLessonIds(viewed);

//         if (sortedGroups.length > 0) {
//           setExpandedGroups({ [sortedGroups[0].id]: true });
//         }

//         const firstGroupWithLessons = sortedGroups.find(
//           (g: ApiLessonGroup) => g.lessons.length > 0
//         );
//         if (firstGroupWithLessons) {
//           setSelectedLessonId(firstGroupWithLessons.lessons[0].id);
//         }
//       } catch (err) {
//         console.error("Fetch groups error:", err);
//       } finally {
//         setGroupsLoading(false);
//       }
//     };

//     const fetchCourseName = async () => {
//       try {
//         const res = await apiFetch(`/purchased-courses/mine/${courseId}`);
//         if (res.ok) {
//           const data = await res.json();
//           setCourseName(data.course?.name || "");
//         }
//       } catch (err) {
//         console.error("Fetch course error:", err);
//       }
//     };

//     fetchGroups();
//     fetchCourseName();
//   }, [courseId]);

//   useEffect(() => {
//     if (!selectedLessonId) return;

//     const fetchLesson = async () => {
//       setLessonLoading(true);
//       setLessonBlockedMessage(null);
//       try {
//         const res = await apiFetch(`/lessons/single/${selectedLessonId}`);
//         if (!res.ok) {
//           const errBody = await res.text();
//           console.error("lessons/single xato:", res.status, errBody);

//           let parsedMessage = "";
//           try {
//             parsedMessage = JSON.parse(errBody)?.message || "";
//           } catch {}

//           if (
//             res.status === 400 &&
//             (parsedMessage === "You should pass test first" ||
//               parsedMessage === "You should pass the previous lesson test first")
//           ) {
//             setLessonBlockedMessage(
//               "Bu darsni ko'rish uchun avvalgi darsning imtihonini topshiring."
//             );
//             setLessonDetail(null);
//             return;

//             // Faqat KUTILMAGAN xatolarni konsolga chiqaramiz
//             console.error("lessons/single xato:", res.status, errBody);
//             throw new Error("Darsni olishda xatolik");
//           }

//           throw new Error("Darsni olishda xatolik");
//         }
//         const data: LessonDetail = await res.json();
//         setLessonDetail(data);
//       } catch (err) {
//         console.error("Fetch lesson error:", err);
//         setLessonDetail(null);
//       } finally {
//         setLessonLoading(false);
//       }
//     };

//     fetchLesson();
//   }, [selectedLessonId]);

//   const markLessonAsViewed = async (lessonId: string) => {
//     if (viewedLessonIds.has(lessonId)) return;
//     try {
//       const res = await apiFetch(`/lessons/view/${lessonId}`, {
//         method: "PUT",
//         body: JSON.stringify({ view: true }),
//       });
//       if (res.ok) {
//         setViewedLessonIds((prev) => new Set(prev).add(lessonId));
//       } else {
//         const errBody = await res.text();
//         console.error("lessons/view xato:", res.status, errBody);
//       }
//     } catch (err) {
//       console.error("Mark viewed error:", err);
//     }
//   };

//   const toggleGroup = (id: number) => {
//     setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const getNextLessonId = (): string | null => {
//     const allLessons: { id: string }[] = [];
//     groups.forEach((g) => {
//       g.lessons.forEach((l) => allLessons.push({ id: l.id }));
//     });
//     const currentIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
//     if (currentIndex === -1 || currentIndex + 1 >= allLessons.length) return null;
//     return allLessons[currentIndex + 1].id;
//   };

//   const embedUrl = getYoutubeEmbedUrl(lessonDetail?.youtube_link || null);
//   const videoWatched = selectedLessonId ? viewedLessonIds.has(selectedLessonId) : false;

//   const handleNextLesson = () => {
//   // Agar darsda video umuman bo'lmasa, "ko'rilgan" deb hisoblanadi (talab qilinmaydi)
//   const videoRequired = !!embedUrl;
//   const effectiveVideoWatched = !videoRequired || videoWatched;

//   // Agar darsga vazifa biriktirilmagan bo'lsa, "topshirilgan" deb hisoblanadi (talab qilinmaydi)
//   const homeworkRequired = !!lessonDetail?.homework;
//   const homeworkDone =
//     !homeworkRequired ||
//     (homeworkSubmissions.length > 0 && homeworkSubmissions[0]?.status !== "REJECTED");

//   const testDone = testAlreadyPassed || testResult?.passed || testQuestions.length === 0;

//   if (!effectiveVideoWatched || !homeworkDone) {
//     setShowWarning(true);
//     setTimeout(() => setShowWarning(false), 4000);
//     return;
//   }
//   if (!testDone) {
//     setActiveTab("imtihonlar");
//     setShowWarning(true);
//     setTimeout(() => setShowWarning(false), 5000);
//     return;
//   }

//     const nextLessonId = getNextLessonId();
//     if (nextLessonId) {
//       setSelectedLessonId(nextLessonId);
//       setActiveTab("qa");
//       showSuccess("Keyingi darsga muvaffaqiyatli o'tildi!");
//     } else {
//       showSuccess("Siz kursning oxirgi darsini yakunladingiz!");
//     }
//   };

//   const fetchHomeworkSubmissions = async (silent = false) => {
//     if (!lessonDetail?.id) return;
//     if (!silent) setHomeworkLoading(true);
//     try {
//       const response = await apiFetch(
//         `/homework/submission/mine/${lessonDetail.id}?offset=0&limit=8`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setHomeworkSubmissions(data.data || []);
//       }
//     } catch (err) {
//       console.error("Homework fetch error:", err);
//     } finally {
//       if (!silent) setHomeworkLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHomeworkSubmissions();
//   }, [lessonDetail?.id]);

//   const handleSubmitHomework = async () => {
//     if (!lessonDetail?.id || !homeworkFile) {
//       alert("Iltimos, faylni tanlang.");
//       return;
//     }
//     setIsSubmittingHomework(true);
//     try {
//       const formData = new FormData();
//       formData.append("text", homeworkText);
//       formData.append("file", homeworkFile);

//       const response = await apiFetch(
//         `/homework/submission/submit/${lessonDetail.id}`,
//         { method: "POST", body: formData }
//       );

//       if (!response.ok) {
//         alert("Vazifani yuborishda xatolik yuz berdi.");
//         return;
//       }

//       setHomeworkText("");
//       setHomeworkFile(null);
//       await fetchHomeworkSubmissions(true);
//     } catch (err) {
//       console.error("Homework submit error:", err);
//       alert("Vazifani yuborishda xatolik yuz berdi.");
//     } finally {
//       setIsSubmittingHomework(false);
//     }
//   };

//   const fetchTestQuestions = async () => {
//     setTestQuestions([]);
//     setTestResult(null);
//     setTestAnswers({});
//     setCurrentQ(0);
//     setTestAlreadyPassed(false);

//     if (!lessonDetail?.id) {
//       setTestLoading(false);
//       return;
//     }

//     setTestLoading(true);
//     try {
//       const res = await apiFetch(`/tests/lesson/${lessonDetail.id}/`);
//       if (res.ok) {
//         const data = await res.json();
//         setTestQuestions(Array.isArray(data) ? data : []);
//       } else {
//         const errBody = await res.text();
//         let parsedMessage = "";
//         try {
//           parsedMessage = JSON.parse(errBody)?.message || "";
//         } catch {}

//         if (parsedMessage === "You already passed this test") {
//           // Bu kutilgan holat — xato emas
//           setTestAlreadyPassed(true);
//           setExamCompleted(true);
//         } else {
//           // Faqat haqiqiy, kutilmagan xatoларни log qilamiz
//           console.error("tests/lesson xato:", res.status, errBody);
//         }
//         setTestQuestions([]);
//       }
//     } catch (err) {
//       console.error("Test questions fetch error:", err);
//       setTestQuestions([]);
//     } finally {
//       setTestLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTestQuestions();
//   }, [lessonDetail?.id]);

//   // ── Imtihon savoli rasmi: joriy savol yoki dars o'zgarganda, agar savolga
//   // rasm biriktirilgan bo'lsa (q.image), uni apiFetch orqali (Authorization
//   // header bilan) blob sifatida yuklab, Object URL sifatida saqlaymiz.
//   // Bu PRIVATE endpoint (/files/private/lesson-file/:lessonId/:name) auth
//   // talab qilgani uchun oddiy <img src> ishlamaydi.
//   useEffect(() => {
//     let objectUrl: string | null = null;
//     let cancelled = false;

//     const currentImage = testQuestions[currentQ]?.image;
//     setExamQuestionImageUrl(null);
//     setExamQuestionImageError(null);   // ← qo'shildi

//     if (!currentImage || !lessonDetail?.id) {
//       setExamQuestionImageLoading(false);
//       return;
//     }

//     setExamQuestionImageLoading(true);

//     (async () => {
//       try {
//         const res = await apiFetch(
//           `/files/private/lesson-file/${lessonDetail.id}/${currentImage}`
//         );
//         if (!res.ok) {
//           const errBody = await res.text().catch(() => "");
//           console.error("Savol rasmini yuklashda xato javob:", res.status, errBody);
//           if (!cancelled) {
//             // ← Studentga (va bizga debug uchun) ko'rinadigan xabar
//             setExamQuestionImageError(
//               res.status === 401 || res.status === 403
//                 ? "Sessiya muddati tugagan bo'lishi mumkin. Sahifani yangilab ko'ring."
//                 : "Rasmni yuklab bo'lmadi."
//             );
//           }
//           return;
//         }
//         const blob = await res.blob();
//         if (cancelled) return;

//         // Backend xato bo'lsa ham 200 qaytarib, HTML/JSON yuborishi mumkin —
//         // shunday holatni ham aniqlaymiz
//         if (!blob.type.startsWith("image/")) {
//           console.error("Kutilmagan content-type:", blob.type);
//           setExamQuestionImageError("Rasm formati noto'g'ri.");
//           return;
//         }

//         objectUrl = window.URL.createObjectURL(blob);
//         setExamQuestionImageUrl(objectUrl);
//       } catch (err) {
//         console.error("Savol rasmini yuklashda xatolik:", err);
//         if (!cancelled) setExamQuestionImageError("Tarmoq xatosi yuz berdi.");
//       } finally {
//         if (!cancelled) setExamQuestionImageLoading(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//       if (objectUrl) window.URL.revokeObjectURL(objectUrl);
//     };
//   }, [currentQ, testQuestions, lessonDetail?.id]);

//   const handleSubmitTest = async () => {
//     if (!lessonDetail?.id || testQuestions.length === 0) return;
//     setTestSubmitting(true);
//     try {
//       const answersPayload = testQuestions.map((q) => ({
//         id: q.id,
//         answer: testAnswers[q.id] || "",
//       }));

//       const res = await apiFetch("/tests/pass", {
//         method: "POST",
//         body: JSON.stringify({
//           lessonId: lessonDetail.id,
//           answers: answersPayload,
//         }),
//       });

//       if (!res.ok) {
//         const errBody = await res.text();
//         console.error("tests/pass xato:", res.status, errBody);
//         alert("Testni yuborishda xatolik yuz berdi.");
//         return;
//       }

//       const data = await res.json();
//       setTestResult({ passed: data.passed, corrects: data.corrects, wrongs: data.wrongs });
//       if (data.passed) {
//         setExamCompleted(true);
//       }
//     } catch (err) {
//       console.error("Test submit error:", err);
//       alert("Testni yuborishda xatolik yuz berdi.");
//     } finally {
//       setTestSubmitting(false);
//     }
//   };

//   const resetTestFlow = () => {
//     setCurrentQ(0);
//     setTestAnswers({});
//     setTestResult(null);
//   };

//   const statusLabel = (status: string) => {
//     if (status === "APPROVED") return "Qabul qilindi";
//     if (status === "REJECTED") return "Rad etildi";
//     return "Tekshirilmoqda";
//   };

//   const statusColors = (status: string) => {
//     if (status === "APPROVED") return { bg: "#DCFCE7", text: "#16A34A" };
//     if (status === "REJECTED") return { bg: "#FEE2E2", text: "#DC2626" };
//     return { bg: "#FEF3C7", text: "#CA8A04" };
//   };

//   // ── Chapdagi darslar ro'yxati (sidebar ichi) — mobil drawer va desktop
//   // sidebar'da qayta ishlatiladi, kod takrorlanmasligi uchun funksiyaga chiqarildi
//   const sidebarContent = (
//     <>
//       <div className="shrink-0 p-4">
//         <button
//           onClick={() => {
//             router.push("/student/my-courses");
//           }}
//           className="font-inter flex w-full items-center justify-center gap-2 rounded-lg border border-[#E0E3E6] bg-white px-3.5 py-2.5 text-sm font-medium text-[#BC000D] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all"
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = "#FFF1F1";
//             e.currentTarget.style.borderColor = "#BC000D";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = "#ffffff";
//             e.currentTarget.style.borderColor = "#E0E3E6";
//           }}
//         >
//           <ArrowLeft size={16} />
//           Kurslar ro&apos;yxatiga qaytish
//         </button>
//       </div>

//       <div className="font-inter shrink-0 border-b border-[#F0F1F2] px-4 py-3.5 text-[15px] font-bold text-black">
//         {courseName || "Yuklanmoqda..."}
//       </div>

//       <div className="flex-1 overflow-y-auto">
//         {groupsLoading ? (
//           <div className="p-5 text-center text-[#636C79]">Yuklanmoqda...</div>
//         ) : (
//           groups.map((group) => (
//             <div key={group.id} className="border-b border-[#F0F1F2]">
//               <button
//                 onClick={() => toggleGroup(group.id)}
//                 className="flex w-full items-center justify-between px-4 py-3 text-left"
//               >
//                 <div className="font-inter text-sm font-semibold text-black">{group.name}</div>
//                 <ChevronRight
//                   size={16}
//                   color="#636C79"
//                   className="shrink-0 transition-transform duration-200"
//                   style={{ transform: expandedGroups[group.id] ? "rotate(90deg)" : "rotate(0deg)" }}
//                 />
//               </button>

//               {expandedGroups[group.id] && group.lessons.length > 0 && (
//                 <div className="pb-1.5">
//                   {group.lessons.map((lesson) => {
//                     const isActive = lesson.id === selectedLessonId;
//                     const isViewed = viewedLessonIds.has(lesson.id);
//                     return (
//                       <div
//                         key={lesson.id}
//                         onClick={() => {
//                           setSelectedLessonId(lesson.id);
//                           setMobileSidebarOpen(false);
//                         }}
//                         className="flex cursor-pointer items-start gap-2.5 px-4 py-2"
//                         style={{ background: isActive ? "#EEF3FF" : "transparent" }}
//                       >
//                         <div className="mt-0.5 size-5 shrink-0 rounded-full bg-[#BC000D]" />
//                         <div className="flex-1">
//                           <div
//                             className="font-inter text-[13px] text-black"
//                             style={{ fontWeight: isActive ? 600 : 400 }}
//                           >
//                             {lesson.name}
//                           </div>
//                         </div>
//                         {isViewed && (
//                           <Check size={13} color="#636C79" className="mt-1 shrink-0" />
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//               {expandedGroups[group.id] && group.lessons.length === 0 && (
//                 <div className="px-4 py-2 text-[13px] text-[#636C79]">
//                   Darslar hali qo&apos;shilmagan
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </>
//   );

//   return (
//     <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#F0F1F2] xs:h-[calc(100vh-72px)] md:h-[calc(100vh-80px)]">
//       {/* Mobil: hamburger tugma */}
//       <button
//         onClick={() => setMobileSidebarOpen(true)}
//         className="fixed left-3 top-[76px] z-40 flex size-10 items-center justify-center rounded-[10px] border border-[#E0E3E6] bg-white shadow-sm lg:hidden"
//         aria-label="Darslar ro'yxatini ochish"
//       >
//         <Menu size={20} color="#000000" />
//       </button>

//       {/* Mobil: overlay */}
//       {mobileSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 lg:hidden"
//           onClick={() => setMobileSidebarOpen(false)}
//         />
//       )}

//       {/* Mobil: drawer sidebar */}
//       <aside
//         className="fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col rounded-r-xl bg-white transition-transform duration-300 ease-in-out lg:hidden"
//         style={{ transform: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
//       >
//         {sidebarContent}
//       </aside>

//       {/* Desktop: doimiy sidebar */}
//       <aside className="hidden h-full w-[300px] min-w-[300px] shrink-0 flex-col overflow-y-auto rounded-r-xl border-r border-[#F0F1F2] bg-white lg:flex xl:w-[360px] xl:min-w-[360px]">
//         {sidebarContent}
//       </aside>

//       {/* ── Right: main content ── */}
//       <div className="flex min-w-0 flex-1 flex-col gap-0 overflow-y-auto p-2.5 xs:p-3 sm:p-4">
//         {showExamPage ? (
//           /* ── Full-Page Exam View ── */
//           <div className="min-h-full rounded-lg bg-white p-4 sm:p-6">
//             {(!examCompleted || showWarning) && (
//               <div className="mb-5 flex items-center gap-3 rounded-md border-l-4 border-[#BC000D] bg-[#FFF1F1] px-4 py-3.5 sm:mb-6 sm:px-5">
//                 <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#BC000D]">
//                   <span className="text-sm font-bold text-white">!</span>
//                 </div>
//                 <div>
//                   <div className="font-inter mb-0.5 text-xs font-bold text-[#BC000D] sm:text-[13px]">
//                     Siz moduldagi darslarni tugatmadingiz
//                   </div>
//                   <div className="font-inter text-xs text-[#636C79]">
//                     Iltimos, to&apos;liq yakunlang va imtihon savollarini topshiring
//                   </div>
//                 </div>
//               </div>
//             )}

//             {!quizStarted ? (
//               <div>
//                 <h2 className="font-inter mb-4 text-lg font-bold leading-snug text-black sm:text-xl">
//                   CSSda shriftlar va meros bo&apos;lib o&apos;tadigan xususiyatlar
//                 </h2>
//                 <div className="mb-6 flex flex-col gap-3.5">
//                   <div className="flex gap-2.5">
//                     <span className="font-inter w-[140px] shrink-0 text-sm text-[#636C79] sm:w-40">
//                       Darajasi:
//                     </span>
//                     <span className="font-inter text-sm font-semibold text-black">O&apos;rta</span>
//                   </div>
//                   <div className="flex gap-2.5">
//                     <span className="font-inter w-[140px] shrink-0 text-sm text-[#636C79] sm:w-40">
//                       Bajarish vaqti:
//                     </span>
//                     <span className="font-inter text-sm font-semibold text-black">Cheksiz</span>
//                   </div>
//                   <div className="flex gap-2.5">
//                     <span className="font-inter w-[140px] shrink-0 text-sm text-[#636C79] sm:w-40">
//                       O&apos;zlashtiriladigan ball:
//                     </span>
//                     <span className="font-inter text-sm font-semibold text-black">5</span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => setQuizStarted(true)}
//                   className="font-inter mb-6 rounded-lg bg-[#BC000D] px-6 py-3 text-sm font-semibold text-white sm:mb-8 sm:px-7 sm:text-[15px]"
//                 >
//                   Testni boshlash
//                 </button>

//                 <div className="mb-5 h-px bg-[#F0F1F2] sm:mb-6" />

//                 <div className="flex flex-col gap-4">
//                   {[
//                     { label: "Natijangiz", value: "-" },
//                     { label: "Sarflangan vaqt", value: "-" },
//                     { label: "O\u02bczlashtrilgan ball", value: "-" },
//                   ].map((item) => (
//                     <div key={item.label}>
//                       <div className="font-inter mb-1 text-[13px] text-[#636C79]">{item.label}</div>
//                       <div className="font-inter text-base font-semibold text-black">{item.value}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : quizDone ? (
//               (() => {
//                 const score = userAnswers.filter(
//                   (a, i) => a === quizQuestions[i].correctIndex
//                 ).length;
//                 const total = quizQuestions.length;
//                 const passed = score >= Math.ceil(total * 0.6);
//                 return (
//                   <div className="py-5 text-center">
//                     <div
//                       className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full text-2xl sm:size-20 sm:text-3xl"
//                       style={{ background: passed ? "#E6F9F0" : "#FFF1F1" }}
//                     >
//                       {passed ? "✓" : "✗"}
//                     </div>
//                     <div className="font-inter mb-2 text-lg font-bold text-black sm:text-xl">
//                       {passed ? "Tabriklaymiz!" : "Harakat qiling!"}
//                     </div>
//                     <div className="font-inter mb-6 text-sm text-[#636C79] sm:text-[15px]">
//                       {score}/{total} ta savol to&apos;g&apos;ri javoblandi
//                     </div>
//                     <div className="mx-auto mb-7 flex max-w-[360px] flex-col gap-3 text-left">
//                       {[
//                         { label: t("exam.yourResult"), value: `${Math.round((score / total) * 100)}%` },
//                         { label: t("exam.correctAnswers"), value: `${score} ${t("pagination.items")}` },
//                         { label: t("exam.wrongAnswers"), value: `${total - score} ${t("pagination.items")}` },
//                       ].map((item) => (
//                         <div
//                           key={item.label}
//                           className="flex justify-between border-b border-[#F0F1F2] py-2.5"
//                         >
//                           <span className="font-inter text-sm text-[#636C79]">{item.label}</span>
//                           <span className="font-inter text-sm font-bold text-black">{item.value}</span>
//                         </div>
//                       ))}
//                     </div>
//                     {passed ? (
//                       <button
//                         onClick={() => {
//                           setExamCompleted(true);
//                           setShowExamPage(false);
//                           resetQuiz();
//                           showSuccess(t("exam.examPassedSuccess"));
//                         }}
//                         className="font-inter rounded-lg bg-[#12B76A] px-7 py-3 text-sm font-semibold text-white sm:px-8 sm:text-[15px]"
//                       >
//                         {t("exam.finish")}
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => resetQuiz()}
//                         className="font-inter rounded-lg bg-[#BC000D] px-7 py-3 text-sm font-semibold text-white sm:px-8 sm:text-[15px]"
//                       >
//                         {t("exam.retake")}
//                       </button>
//                     )}
//                   </div>
//                 );
//               })()
//             ) : (
//               (() => {
//                 const q = quizQuestions[currentQ];
//                 return (
//                   <div>
//                     <div className="mb-5">
//                       <div className="mb-2 flex justify-between">
//                         <span className="font-inter text-sm font-semibold text-black">
//                           Savol: {currentQ + 1}/{quizQuestions.length}
//                         </span>
//                       </div>
//                       <div className="flex gap-1">
//                         {quizQuestions.map((_, n) => (
//                           <div
//                             key={n}
//                             className="h-1.5 flex-1 rounded-[3px]"
//                             style={{
//                               background:
//                                 n < currentQ
//                                   ? userAnswers[n] === quizQuestions[n].correctIndex
//                                     ? "#12B76A"
//                                     : "#BC000D"
//                                   : n === currentQ
//                                   ? "#BC000D"
//                                   : "#E0E3E6",
//                             }}
//                           />
//                         ))}
//                       </div>
//                     </div>

//                     <div className="font-inter mb-4 text-[15px] font-semibold text-black">
//                       {currentQ + 1}. {q.text}
//                     </div>

//                     <div className="mb-5 flex flex-col gap-2.5">
//                       {q.options.map((opt, idx) => {
//                         let borderColor = "#E0E3E6";
//                         let bgColor = "#fff";
//                         let textColor = "#000";
//                         if (answerConfirmed) {
//                           if (idx === q.correctIndex) {
//                             borderColor = "#12B76A";
//                             bgColor = "#E6F9F0";
//                             textColor = "#12B76A";
//                           } else if (idx === selectedAnswer) {
//                             borderColor = "#BC000D";
//                             bgColor = "#FFF1F1";
//                             textColor = "#BC000D";
//                           }
//                         } else if (selectedAnswer === idx) {
//                           borderColor = "#BC000D";
//                           bgColor = "#FFF1F1";
//                         }
//                         return (
//                           <label
//                             key={idx}
//                             className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-all"
//                             style={{ border: `1px solid ${borderColor}`, background: bgColor }}
//                           >
//                             <span
//                               className="font-inter text-sm font-medium"
//                               style={{ color: textColor }}
//                             >
//                               {String.fromCharCode(65 + idx)}) {opt}
//                             </span>
//                             <input
//                               type="radio"
//                               name="quiz-fs"
//                               disabled={answerConfirmed}
//                               checked={selectedAnswer === idx}
//                               onChange={() => !answerConfirmed && setSelectedAnswer(idx)}
//                               className="size-[18px]"
//                               style={{
//                                 accentColor:
//                                   idx === q.correctIndex && answerConfirmed
//                                     ? "#12B76A"
//                                     : "#BC000D",
//                               }}
//                             />
//                           </label>
//                         );
//                       })}
//                     </div>

//                     <div className="flex justify-between gap-3">
//                       <button
//                         onClick={() => {
//                           setQuizStarted(false);
//                           resetQuiz();
//                         }}
//                         className="font-inter rounded-lg bg-[#F0F1F2] px-5 py-2.5 text-sm font-medium text-black sm:px-6"
//                       >
//                         {t("common.cancel")}
//                       </button>
//                       {!answerConfirmed ? (
//                         <button
//                           disabled={selectedAnswer === null}
//                           onClick={() => {
//                             if (selectedAnswer === null) return;
//                             const updated = [...userAnswers];
//                             updated[currentQ] = selectedAnswer;
//                             setUserAnswers(updated);
//                             setAnswerConfirmed(true);
//                           }}
//                           className="font-inter rounded-lg px-6 py-2.5 text-sm font-medium text-white sm:px-7"
//                           style={{
//                             background: selectedAnswer === null ? "#F5C2C2" : "#BC000D",
//                             cursor: selectedAnswer === null ? "not-allowed" : "pointer",
//                           }}
//                         >
//                           Tasdiqlash
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             if (currentQ + 1 < quizQuestions.length) {
//                               setCurrentQ(currentQ + 1);
//                               setSelectedAnswer(null);
//                               setAnswerConfirmed(false);
//                             } else {
//                               setQuizDone(true);
//                             }
//                           }}
//                           className="font-inter rounded-lg bg-[#BC000D] px-6 py-2.5 text-sm font-medium text-white sm:px-7"
//                         >
//                           {currentQ + 1 < quizQuestions.length ? "Keyingi savol →" : "Natijani ko'rish"}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })()
//             )}
//           </div>
//         ) : (
//           /* ── Normal Video + Tabs Card View ── */
//           <div className="rounded-lg bg-white">
//             {/* Header row */}
//             <div className="flex flex-col gap-3 border-b border-[#F0F1F2] px-4 py-3.5 xs:flex-row xs:items-center xs:justify-between sm:px-5">
//               <span className="font-inter min-w-0 truncate pl-10 text-base font-bold text-black xs:pl-0 sm:text-[17px]">
//                 {lessonLoading ? "Yuklanmoqda..." : lessonDetail?.name || "Dars tanlanmagan"}
//               </span>
//               <button
//                 onClick={handleNextLesson}
//                 className="font-inter flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#BC000D] px-4 py-2.5 text-sm font-medium text-white"
//               >
//                 Keyingi dars
//                 <ChevronRight size={16} />
//               </button>
//             </div>

//             {/* Video player */}
//             <div className="box-border px-3 pt-3 xs:px-4 xs:pt-4 sm:px-5 sm:pt-4">
//               {lessonLoading ? (
//                 <div className="font-inter flex h-[200px] items-center justify-center rounded-xl bg-[#F0F1F2] text-sm text-[#636C79] xs:h-[260px] sm:h-[340px] lg:h-[420px]">
//                   Video yuklanmoqda...
//                 </div>
//               ) : lessonBlockedMessage ? (
//                 <div className="font-inter box-border flex min-h-[200px] items-center justify-center rounded-xl bg-[#FFF1F1] p-5 text-center text-sm font-semibold text-[#BC000D] xs:min-h-[260px] sm:min-h-[340px] sm:text-[15px] lg:min-h-[420px]">
//                   {lessonBlockedMessage}
//                 </div>
//               ) : embedUrl ? (
//                 <div className="relative w-full overflow-hidden rounded-xl">
//                   <div className="h-[200px] xs:h-[260px] sm:h-[340px] lg:h-[420px]">
//                     <iframe
//                       src={embedUrl}
//                       title={lessonDetail?.name || "Video"}
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                       onLoad={() => {
//                         if (selectedLessonId) markLessonAsViewed(selectedLessonId);
//                       }}
//                       className="h-full w-full border-none"
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div className="font-inter flex h-[200px] items-center justify-center rounded-xl bg-[#F0F1F2] text-sm text-[#636C79] xs:h-[260px] sm:h-[340px] lg:h-[420px]">
//                   Bu darsda video mavjud emas
//                 </div>
//               )}
//             </div>

//             {/* Dars tavsifi */}

//             {lessonDetail?.about && (
//               <div className="px-3 pt-3 xs:px-4 xs:pt-4 sm:px-5">
//                 <p className="font-inter m-0 whitespace-pre-line text-sm text-[#636C79]">{lessonDetail.about}</p>
//               </div>
//             )}

//             {/* Rating */}
//             <div className="mt-2 border-b border-[#F0F1F2] px-3 pb-2.5 pt-3 text-center xs:px-4 xs:pt-4 sm:px-5">
//               <div className="font-inter mb-1.5 text-sm font-semibold text-black sm:text-[15px]">
//                 {ratingSubmitted ? "Baholaganingiz uchun rahmat!" : "Darsni baholashni istaysizmi?"}
//               </div>
//               <div className="flex justify-center gap-1">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <button
//                     key={star}
//                     onClick={() => submitRating(star)}
//                     disabled={ratingSubmitting}
//                     className="px-0.5 text-xl leading-none xs:text-2xl"
//                     style={{
//                       color: star <= rating ? "#F59E0B" : "#E0E3E6",
//                       cursor: ratingSubmitting ? "not-allowed" : "pointer",
//                       opacity: ratingSubmitting ? 0.6 : 1,
//                     }}
//                   >
//                     ★
//                   </button>
//                 ))}
//               </div>
//               {ratingError && (
//                 <div className="font-inter mt-1.5 text-xs text-[#DC2626]">{ratingError}</div>
//               )}
//             </div>

//             {/* Tabs — mobilda gorizontal scroll */}
//             <div className="flex gap-1 overflow-x-auto border-b border-[#F0F1F2] px-3 pt-2.5 xs:px-4 sm:px-5 sm:pt-2.5">
//               {(["qa", "materiallar", "vazifalar", "imtihonlar"] as Tab[]).map((tab) => {
//                 const labels: Record<Tab, string> = {
//                   qa: "Q&A",
//                   materiallar: t("courses.resources"),
//                   vazifalar: t("courses.assignments"),
//                   imtihonlar: t("courses.exams"),
//                 };
//                 return (
//                   <button
//                     key={tab}
//                     onClick={() => setActiveTab(tab)}
//                     className="font-inter -mb-px shrink-0 whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium transition-all xs:px-4"
//                     style={{
//                       color: activeTab === tab ? "#ffffff" : "#636C79",
//                       background: activeTab === tab ? "#BC000D" : "transparent",
//                     }}
//                   >
//                     {labels[tab]}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Tab content */}
//             <div className="p-4 sm:p-5">
//               {/* Q&A */}
//               {activeTab === "qa" && (
//                 <div>
//                   <div className="mb-4 flex flex-col gap-3 xs:flex-row xs:items-start xs:justify-between">
//                     <div>
//                       <div className="font-inter text-base font-bold text-black sm:text-[17px]">
//                         Savol va javoblar
//                       </div>
//                       <div className="font-inter mt-0.5 text-[13px] text-[#636C79]">
//                         Savollar: {questions.length} ta · Javoblar:{" "}
//                         {questions.filter((q) => q.answer).length} ta
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setShowAskModal(true)}
//                       className="font-inter shrink-0 whitespace-nowrap rounded-lg bg-[#BC000D] px-4 py-2.5 text-sm font-medium text-white"
//                     >
//                       Savol so&apos;rash
//                     </button>
//                   </div>

//                   <div className="font-inter mb-3 text-sm font-bold text-black">
//                     Barcha savollar
//                   </div>

//                   {questionsLoading ? (
//                     <div className="font-inter py-6 text-center text-sm text-[#636C79]">
//                       Yuklanmoqda...
//                     </div>
//                   ) : questionsError ? (
//                     <div className="font-inter py-6 text-center text-sm text-[#DC2626]">
//                       {questionsError}
//                     </div>
//                   ) : questions.length === 0 ? (
//                     <div className="font-inter py-6 text-center text-sm text-[#636C79]">
//                       Hali savollar yo&apos;q. Birinchi bo&apos;lib savol bering!
//                     </div>
//                   ) : (
//                     questions.map((q) => {
//                       const isHighlighted = highlightedQuestionId === q.id;
//                       return (
//                         <div
//                           key={q.id}
//                           ref={(el) => {
//                             questionRefs.current[q.id] = el;
//                           }}
//                           className="border-t border-[#F0F1F2] py-3.5 transition-colors duration-700"
//                           style={{
//                             background: isHighlighted ? "#FFF7E0" : "transparent",
//                             borderRadius: isHighlighted ? "10px" : 0,
//                             paddingLeft: isHighlighted ? "10px" : 0,
//                             paddingRight: isHighlighted ? "10px" : 0,
//                             boxShadow: isHighlighted ? "0 0 0 2px #F5C445 inset" : "none",
//                           }}
//                         >
//                           {/* Savol */}
//                           <div className="flex gap-3">
//                             <div
//                               className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white xs:size-10"
//                               style={{ background: getAvatarColor(q.from.fullName) }}
//                             >
//                               {q.from.image ? (
//                                 <img
//                                   src={resolveFileSrc(q.from.image) ?? undefined}
//                                   alt={q.from.fullName}
//                                   className="h-full w-full object-cover"
//                                 />
//                               ) : (
//                                 getInitial(q.from.fullName)
//                               )}
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <div className="font-inter mb-1 text-sm font-semibold text-[#BC000D]">
//                                 {q.from.fullName}
//                               </div>
//                               <div className="font-inter mb-1.5 text-sm text-[#344054]">
//                                 {q.text}
//                               </div>
//                               {q.file && (
//                                 <a
//                                   href={resolveFileSrc(q.file) ?? undefined}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   download={q.file.split("/").pop()}
//                                   className="font-inter mb-1.5 flex w-fit items-center gap-1.5 text-xs font-medium text-[#2563EB] underline"
//                                 >
//                                   <Paperclip size={13} />
//                                   {q.file.split("/").pop()}
//                                 </a>
//                               )}
//                               <div className="font-inter text-[11px] text-[#9CA3AF]">
//                                 {formatDate(q.createdAt)}
//                               </div>
//                             </div>
//                           </div>

//                           {/* Mentor javobi (agar mavjud bo'lsa) */}
//                           {q.answer && (
//                             <div className="ml-11 mt-3 flex gap-3 xs:ml-[52px]">
//                               <div
//                                 className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
//                                 style={{ background: getAvatarColor(q.answer.answeredBy.fullName) }}
//                               >
//                                 {q.answer.answeredBy.image ? (
//                                   <img
//                                     src={resolveFileSrc(q.answer.answeredBy.image) ?? undefined}
//                                     alt={q.answer.answeredBy.fullName}
//                                     className="h-full w-full object-cover"
//                                   />
//                                 ) : (
//                                   getInitial(q.answer.answeredBy.fullName)
//                                 )}
//                               </div>
//                               <div className="min-w-0 flex-1 rounded-lg bg-[#F8F9FA] px-3.5 py-2.5">
//                                 <div className="font-inter mb-1 text-[13px] font-semibold text-[#16A34A]">
//                                   {q.answer.answeredBy.fullName}{" "}
//                                   <span className="font-normal text-[#9CA3AF]">(mentor)</span>
//                                 </div>
//                                 <div className="font-inter mb-1.5 text-sm text-[#344054]">
//                                   {q.answer.text}
//                                 </div>
//                                 {q.answer.file && (
//                                   <a
//                                     href={resolveFileSrc(q.answer.file) ?? undefined}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     download={q.answer.file.split("/").pop()}
//                                     className="font-inter mb-1.5 flex w-fit items-center gap-1.5 text-xs font-medium text-[#2563EB] underline"
//                                   >
//                                     <Paperclip size={13} />
//                                     {q.answer.file.split("/").pop()}
//                                   </a>
//                                 )}
//                                 <div className="font-inter text-[11px] text-[#9CA3AF]">
//                                   {formatDate(q.answer.createdAt)}
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                           {!q.answer && (
//                             <div className="font-inter ml-11 mt-2 text-[12px] text-[#9CA3AF] xs:ml-[52px]">
//                               Hali javob berilmagan
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })
//                   )}
//                 </div>
//               )}

//               {/* Materiallar */}
//               {activeTab === "materiallar" && (
//                 <div>
//                   <div className="font-inter mb-3.5 text-base font-bold text-black sm:text-[17px]">
//                     Materiallar
//                   </div>
//                   {lessonDetail?.lessonFiles && lessonDetail.lessonFiles.length > 0 ? (
//                     lessonDetail.lessonFiles.map((mat) => (
//                       <div
//                         key={mat.id}
//                         className="flex items-center justify-between gap-2 border-b border-[#F0F1F2] py-3"
//                       >
//                         <div className="flex min-w-0 items-center gap-2.5">
//                           <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#FFE5E5]">
//                             <span className="text-[9px] font-bold text-[#BC000D]">PDF</span>
//                           </div>
//                           <span className="font-inter truncate text-sm text-black">
//                             {mat.note || mat.file}
//                           </span>
//                         </div>
//                         <button
//                           onClick={() => handleDownloadMaterial(mat.file, mat.note)}
//                           className="shrink-0 cursor-pointer text-[#636C79]"
//                         >
//                           <Download size={18} />
//                         </button>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="font-inter py-3 text-sm text-[#636C79]">Materiallar mavjud emas.</p>
//                   )}
//                 </div>
//               )}

//               {/* Vazifalar */}
//               {activeTab === "vazifalar" && (
//                 <div>
//                   {lessonDetail?.homework && (
//                     <div className="mb-5 rounded-[10px] border border-[#E0E3E6] bg-[#F8F9FA] p-3.5 sm:p-4">
//                       <div className="font-inter mb-1.5 text-sm font-bold text-black">
//                         Topshiriq
//                       </div>
//                       <div
//                         className="font-inter text-sm text-[#344054]"
//                         style={{ marginBottom: lessonDetail.homework.file ? "10px" : 0 }}
//                       >
//                         {lessonDetail.homework.task}
//                       </div>
//                       {lessonDetail.homework.file && (
//                         <button
//                           onClick={() => handleDownloadMaterial(lessonDetail.homework!.file)}
//                           className="font-inter inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] font-medium text-[#344054]"
//                         >
//                           <Download size={14} />
//                           Topshiriq faylini yuklab olish
//                         </button>
//                       )}
//                     </div>
//                   )}

//                   <div className="mb-5 flex flex-col gap-2">
//                     {homeworkLoading ? (
//                       <div className="font-inter py-3 text-sm text-[#636C79]">Yuklanmoqda...</div>
//                     ) : homeworkSubmissions.length > 0 ? (
//                       homeworkSubmissions.map((sub) => {
//                         const isPdf = sub.file.toLowerCase().endsWith(".pdf");
//                         const colors = statusColors(sub.status);
//                         return (
//                           <div
//                             key={sub.id}
//                             className="flex items-center justify-between gap-3 border-b border-[#F0F1F2] py-3"
//                           >
//                             <div className="flex min-w-0 items-center gap-2.5">
//                               <div
//                                 className="flex size-8 shrink-0 items-center justify-center rounded-md"
//                                 style={{ background: isPdf ? "#E53E3E" : "#FFF1F1" }}
//                               >
//                                 <span
//                                   className="text-[9px] font-bold"
//                                   style={{ color: isPdf ? "#ffffff" : "#BC000D" }}
//                                 >
//                                   {isPdf ? "PDF" : "FILE"}
//                                 </span>
//                               </div>
//                               <div className="min-w-0">
//                                 <div className="font-inter truncate text-sm text-black">
//                                   {sub.text || sub.file}
//                                 </div>
//                                 {sub.status === "REJECTED" && sub.reason && (
//                                   <div className="font-inter mt-0.5 text-xs text-[#DC2626]">
//                                     Sabab: {sub.reason}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                             <span
//                               className="font-inter shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold"
//                               style={{ backgroundColor: colors.bg, color: colors.text }}
//                             >
//                               {statusLabel(sub.status)}
//                             </span>
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="font-inter py-3 text-sm text-[#636C79]">
//                         Hali vazifa topshirilmagan.
//                       </div>
//                     )}
//                   </div>

//                   {(homeworkSubmissions.length === 0 ||
//                     homeworkSubmissions[0]?.status === "REJECTED") && (
//                     <>
//                       <div className="font-inter mb-3 text-sm font-semibold text-black">
//                         Vazifa faylini yuklang
//                       </div>

//                       <textarea
//                         value={homeworkText}
//                         onChange={(e) => setHomeworkText(e.target.value)}
//                         placeholder="Izoh (ixtiyoriy)..."
//                         className="font-inter mb-2.5 box-border w-full resize-y rounded-lg border border-[#E0E3E6] p-3 text-[13px]"
//                         style={{ minHeight: "70px" }}
//                       />

//                       <div className="mb-3 flex w-full flex-col items-stretch gap-2.5 rounded-lg border border-[#E0E3E6] bg-[#F8F9FA] p-3 xs:flex-row xs:items-center">
//                         <label className="font-inter inline-flex items-center gap-1.5 rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
//                           <span className="flex items-center text-[13px]">
//                             <svg
//                               width="14"
//                               height="14"
//                               viewBox="0 0 20 20"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                             >
//                               <path
//                                 d="M16.6666 9.16666L9.58329 16.25C8.47829 17.355 6.97913 17.9765 5.41663 17.9765C3.85413 17.9765 2.35496 17.355 1.24996 16.25C0.144959 15.145 0.144959 13.6458 1.24996 12.0833L8.33329 5.00001C9.07 4.2633 10.07 3.84902 11.1125 3.84902C12.1549 3.84902 13.1549 4.2633 13.8916 5.00001C14.6283 5.73672 15.0425 6.73672 15.0425 7.77918C15.0425 8.82163 14.6283 9.82163 13.8916 10.5583L6.80829 17.6417"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             </svg>
//                           </span>
//                           Yuklash
//                           <input
//                             type="file"
//                             className="hidden"
//                             onChange={(e) => {
//                               if (e.target.files?.[0]) {
//                                 setHomeworkFile(e.target.files[0]);
//                               }
//                             }}
//                           />
//                         </label>
//                         <span className="font-inter truncate text-[13px] text-[#636C79]">
//                           {homeworkFile ? homeworkFile.name : "Fayl yuklanmagan"}
//                         </span>
//                       </div>

//                       <button
//                         onClick={handleSubmitHomework}
//                         disabled={isSubmittingHomework || !homeworkFile}
//                         className="font-inter w-full rounded-lg py-2.5 text-sm font-semibold text-white xs:w-auto xs:px-5"
//                         style={{
//                           backgroundColor: !homeworkFile || isSubmittingHomework ? "#A0A6AD" : "#4F46E5",
//                           cursor: !homeworkFile || isSubmittingHomework ? "not-allowed" : "pointer",
//                         }}
//                       >
//                         {isSubmittingHomework ? "Yuborilmoqda..." : "Yuborish"}
//                       </button>
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* Imtihonlar */}
//               {activeTab === "imtihonlar" && (
//                 <div>
//                   {testLoading ? (
//                     <div className="font-inter py-3 text-sm text-[#636C79]">
//                       Savollar yuklanmoqda...
//                     </div>
//                   ) : testAlreadyPassed ? (
//                     <div className="font-inter inline-flex items-center gap-2 rounded-lg bg-[#E6F9F0] px-5 py-3 text-sm font-semibold text-[#12B76A] sm:text-[15px]">
//                       ✓ Siz bu testni allaqachon muvaffaqiyatli topshirgansiz
//                     </div>
//                   ) : testQuestions.length === 0 ? (
//                     <div className="font-inter py-3 text-sm text-[#636C79]">
//                       Bu darsda test mavjud emas.
//                     </div>
//                   ) : testResult ? (
//                     <div className="py-5 text-center">
//                       <div
//                         className="mx-auto mb-4 flex size-[72px] items-center justify-center rounded-full text-[28px]"
//                         style={{ background: testResult.passed ? "#E6F9F0" : "#FFF1F1" }}
//                       >
//                         {testResult.passed ? "✓" : "✗"}
//                       </div>
//                       <div className="font-inter mb-1.5 text-lg font-bold text-black sm:text-xl">
//                         {testResult.passed ? "Tabriklaymiz!" : "Harakat qiling!"}
//                       </div>
//                       <div className="font-inter mb-5 text-sm text-[#636C79]">
//                         {testResult.corrects}/{testResult.corrects + testResult.wrongs} ta savol to&apos;g&apos;ri javoblandi
//                       </div>
//                       <div className="mb-6 flex flex-col gap-2.5 text-left">
//                         {[
//                           { label: t("exam.correctAnswers"), value: `${testResult.corrects} ${t("pagination.items")}` },
//                           { label: t("exam.wrongAnswers"), value: `${testResult.wrongs} ${t("pagination.items")}` },
//                         ].map((item) => (
//                           <div
//                             key={item.label}
//                             className="flex justify-between border-b border-[#F0F1F2] py-2"
//                           >
//                             <span className="font-inter text-sm text-[#636C79]">{item.label}</span>
//                             <span className="font-inter text-sm font-bold text-black">{item.value}</span>
//                           </div>
//                         ))}
//                       </div>
//                       {testResult.passed ? (
//                           <button
//                             onClick={() => {
//                               setExamCompleted(true);
//                               const nextLessonId = getNextLessonId();
//                               if (nextLessonId) {
//                                 setSelectedLessonId(nextLessonId);
//                                 setActiveTab("qa");
//                                 showSuccess("Imtihon topshirildi! Keyingi darsga o'tildi.");
//                               } else {
//                                 showSuccess("Siz kursning oxirgi darsini yakunladingiz!");
//                               }
//                             }}
//                             className="font-inter rounded-lg bg-[#12B76A] px-7 py-2.5 text-sm font-semibold text-white"
//                           >
//                             Yakunlash
//                           </button>
//                         ) : (
//                         <button
//                           onClick={resetTestFlow}
//                           className="font-inter rounded-lg bg-[#BC000D] px-7 py-2.5 text-sm font-semibold text-white"
//                         >
//                           {t("exam.retake")}
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     (() => {
//                       const q = testQuestions[currentQ];
//                       const options: { key: string; label: string }[] = [
//                         { key: "variantA", label: q.variantA },
//                         { key: "variantB", label: q.variantB },
//                         { key: "variantC", label: q.variantC },
//                         { key: "variantD", label: q.variantD },
//                       ];
//                       const selected = testAnswers[q.id];
//                       const isLast = currentQ + 1 === testQuestions.length;
//                       // MUHIM: bu endi private endpointdan blob sifatida yuklab
//                       // olingan Object URL — resolveExamImageSrc/resolveFileSrc
//                       // ORQALI EMAS, chunki bu fayl public emas (token talab qiladi).
//                       const questionImageSrc = examQuestionImageUrl;

//                       return (
//                         <div>
//                           <div className="mb-4">
//                             <div className="mb-1.5 flex justify-between">
//                               <span className="font-inter text-[13px] font-semibold text-black">
//                                 Savol: {currentQ + 1}/{testQuestions.length}
//                               </span>
//                             </div>
//                             <div className="flex gap-1">
//                               {testQuestions.map((tq, n) => (
//                                 <div
//                                   key={tq.id}
//                                   className="h-1.5 flex-1 rounded-[3px]"
//                                   style={{
//                                     background: testAnswers[tq.id]
//                                       ? "#12B76A"
//                                       : n === currentQ
//                                       ? "#BC000D"
//                                       : "#E0E3E6",
//                                   }}
//                                 />
//                               ))}
//                             </div>
//                           </div>

//                           <div className="font-inter mb-3.5 text-sm font-semibold text-black">
//                             {currentQ + 1}. {q.question}
//                           </div>

//                           {/* Mentor yuklagan savol rasmi (agar mavjud bo'lsa) */}
//                           {q.image && examQuestionImageLoading && !questionImageSrc && (
//                             <div className="font-inter mb-4 text-xs text-[#636C79]">
//                               Rasm yuklanmoqda...
//                             </div>
//                             )}
//                             {examQuestionImageError && (
//                               <div className="font-inter mb-4 text-xs text-[#DC2626]">
//                                 {examQuestionImageError}
//                               </div>
//                             )}
//                             {questionImageSrc && (
//                               <div className="mb-4">
//                                 <img
//                                   src={questionImageSrc}
//                                   alt="Savol rasmi"
//                                   className="max-h-[280px] w-auto max-w-full rounded-lg border border-[#E0E3E6] object-contain"
//                                   onError={(e) => {
//                                     console.error("Savol rasmi yuklanmadi:", questionImageSrc);
//                                     setExamQuestionImageError("Rasmni ko'rsatishda xatolik yuz berdi.");
//                                     (e.target as HTMLImageElement).style.display = "none";
//                                   }}
//                                 />
//                               </div>
//                             )}
//                           {/* {questionImageSrc && (
//                             <div className="mb-4">
//                               <img
//                                 src={questionImageSrc}
//                                 alt="Savol rasmi"
//                                 className="max-h-[280px] w-auto max-w-full rounded-lg border border-[#E0E3E6] object-contain"
//                                 onError={(e) => {
//                                   console.error("Savol rasmi yuklanmadi:", questionImageSrc);
//                                   (e.target as HTMLImageElement).style.display = "none";
//                                 }}
//                               />
//                             </div>
//                           )} */}

//                           <div className="mb-4 flex flex-col gap-2">
//                             {options.map((opt) => {
//                               const isChecked = selected === opt.key;
//                               return (
//                                 <label
//                                   key={opt.key}
//                                   className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 transition-all"
//                                   style={{
//                                     border: `1px solid ${isChecked ? "#BC000D" : "#E0E3E6"}`,
//                                     background: isChecked ? "#FFF1F1" : "#fff",
//                                   }}
//                                 >
//                                   <span className="font-inter text-[13px] font-medium text-black">
//                                     {opt.key.replace("variant", "")}) {opt.label}
//                                   </span>
//                                   <input
//                                     type="radio"
//                                     name={`test-q-${q.id}`}
//                                     checked={isChecked}
//                                     onChange={() => setTestAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
//                                     className="size-4"
//                                     style={{ accentColor: "#BC000D" }}
//                                   />
//                                 </label>
//                               );
//                             })}
//                           </div>

//                           <div className="flex justify-between gap-2.5">
//                             <button
//                               onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
//                               disabled={currentQ === 0}
//                               className="font-inter rounded-lg bg-[#F0F1F2] px-5 py-2.5 text-[13px] font-medium text-black"
//                               style={{
//                                 cursor: currentQ === 0 ? "not-allowed" : "pointer",
//                                 opacity: currentQ === 0 ? 0.5 : 1,
//                               }}
//                             >
//                               Orqaga
//                             </button>
//                             {!isLast ? (
//                               <button
//                                 disabled={!selected}
//                                 onClick={() => setCurrentQ((c) => c + 1)}
//                                 className="font-inter rounded-lg px-6 py-2.5 text-[13px] font-medium text-white"
//                                 style={{
//                                   background: !selected ? "#F5C2C2" : "#BC000D",
//                                   cursor: !selected ? "not-allowed" : "pointer",
//                                 }}
//                               >
//                                 Keyingi →
//                               </button>
//                             ) : (
//                               <button
//                                 disabled={!selected || testSubmitting}
//                                 onClick={handleSubmitTest}
//                                 className="font-inter rounded-lg px-6 py-2.5 text-[13px] font-medium text-white"
//                                 style={{
//                                   background: !selected || testSubmitting ? "#F5C2C2" : "#BC000D",
//                                   cursor: !selected || testSubmitting ? "not-allowed" : "pointer",
//                                 }}
//                               >
//                                 {testSubmitting ? "Yuborilmoqda..." : "Yakunlash"}
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })()
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Ask modal ── */}
//       {showAskModal && (
//         <div
//           className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-3"
//           onClick={(e) => {
//             if (e.target === e.currentTarget) setShowAskModal(false);
//           }}
//         >
//           <div className="w-full max-w-[500px] rounded-xl bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] sm:p-7">
//             <div className="mb-5 flex items-center justify-between">
//               <span className="font-inter text-base font-bold text-black sm:text-lg">
//                 Savol so&apos;rash
//               </span>
//               <button
//                 onClick={() => setShowAskModal(false)}
//                 className="text-[#636C79]"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="font-inter mb-2 text-sm text-[#636C79]">Savol matni</div>
//             <QuestionRichEditor value={questionText} onChange={setQuestionText} />
//             <div className="mt-3">
//               <label className="font-inter inline-flex items-center gap-1.5 rounded-lg border border-[#E0E3E6] px-3.5 py-2 text-[13px] text-[#374151]">
//                 {questionFile ? questionFile.name : "Fayl biriktirish (ixtiyoriy)"}
//                 <input
//                   type="file"
//                   onChange={(e) => setQuestionFile(e.target.files?.[0] ?? null)}
//                   className="hidden"
//                 />
//               </label>
//             </div>

//             {questionError && (
//               <div className="font-inter mt-2.5 text-[13px] text-[#DC2626]">{questionError}</div>
//             )}

//             <button
//               onClick={handleAskSubmit}
//               disabled={questionSubmitting || !questionText.trim()}
//               className="font-inter mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#BC000D] px-6 py-2.5 text-sm font-medium text-white xs:w-auto"
//               style={{
//                 cursor: questionSubmitting || !questionText.trim() ? "not-allowed" : "pointer",
//                 opacity: questionSubmitting || !questionText.trim() ? 0.6 : 1,
//               }}
//             >
//               <Send size={15} />
//               {questionSubmitting ? "Yuborilmoqda..." : "Yuborish"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Floating Warning Toast ── */}
//       {showWarning && (
//         <div className="fixed right-3 top-4 z-[9999] flex w-[calc(100vw-24px)] max-w-[360px] items-center gap-3 rounded-lg border border-[#E0E3E6] border-l-4 border-l-[#BC000D] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] xs:right-4">
//           <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#BC000D]">
//             <span className="font-inter text-sm font-bold leading-none text-white">!</span>
//           </div>
//           <div className="flex-1">
//             <div className="font-inter mb-1 text-sm font-bold leading-snug text-black">
//               Siz moduldagi darslarni tugatmadingiz
//             </div>
//             <div className="font-inter text-[13px] leading-snug text-[#636C79]">
//               Iltimos, to&apos;liq yakunlang va imtihon savollarini topshiring
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Success Toast ── */}
//       {showSuccessToast && (
//         <div className="fixed right-3 top-4 z-[9999] flex w-[calc(100vw-24px)] max-w-[360px] items-center gap-3 rounded-lg border border-[#E0E3E6] border-l-4 border-l-[#12B76A] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] xs:right-4">
//           <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#12B76A]">
//             <span className="font-inter text-sm font-bold leading-none text-white">✓</span>
//           </div>
//           <div className="flex-1">
//             <div className="font-inter text-sm font-bold leading-snug text-black">
//               {successToastMsg}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Check,
  MessageCircle,
  Download,
  X,
  Send,
  ArrowLeft,
  Menu,
  Paperclip,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";
import { useLanguage } from "@/contexts/LanguageContext";
import DOMPurify from "dompurify";
import { QuestionRichEditor } from "@/components/ui/QuestionRichEditor";

type Tab = "qa" | "materiallar" | "vazifalar" | "imtihonlar";

interface ApiLesson {
  id: string;
  name: string;
  views: any[];
}

interface ApiLessonGroup {
  id: number;
  name: string;
  lessons: ApiLesson[];
}

interface LessonDetail {
  id: string;
  name: string;
  about: string;
  groupId: number;
  homework: {
    id: number;
    task: string;
    file: string;
    lessonId: string;
    updatedAt: string | null;
    createdAt: string;
  } | null;
  youtube_link: string | null;
  lessonFiles: { id: number; file: string; note: string; lessonId: string; createdAt: string }[];
}

interface HomeworkSubmission {
  id: number;
  text: string;
  file: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  homeworkId: number;
  userId: number;
  updatedAt: string | null;
  createdAt: string;
}

interface TestQuestion {
  id: number;
  question: string;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  // Mentor savolga rasm biriktirgan bo'lsa, backend shu maydonda fayl nomini
  // qaytaradi (masalan "pccf_62bbdb4a-....png"), aks holda null.
  // MUHIM: bu fayl PRIVATE (COURSE_CONTENT) sifatida saqlanadi
  // (uploads/private/files/ ichida, "pccf_" prefiksi bilan), PUBLIC emas!
  // Shuning uchun uni oddiy <img src="..."> bilan ko'rsatib bo'lmaydi —
  // backend /files/private/lesson-file/:lessonId/:name JWT token talab qiladi,
  // <img> tegi esa Authorization header yubora olmaydi. Pastda shu rasm
  // apiFetch (token bilan) orqali blob sifatida yuklanadi va Object URL
  // sifatida ko'rsatiladi (handleDownloadMaterial funksiyasidagi patternga o'xshash).
  image?: string | null;
}

interface TestResult {
  passed: boolean;
  corrects: number;
  wrongs: number;
}

// ── Q&A (savol-javob) uchun tiplar — backend /questions endpointi bilan mos ──
interface QuestionAnswer {
  id: number;
  text: string;
  file: string | null;
  createdAt: string;
  answeredBy: {
    id: number;
    fullName: string;
    image: string | null;
    role: string;
  };
}

interface QuestionItem {
  id: number;
  text: string;
  file: string | null;
  read: boolean;
  createdAt: string;
  from: {
    id: number;
    fullName: string;
    image: string | null;
  };
  answer: QuestionAnswer | null;
}

function getYoutubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  let videoId: string | null = null;

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);

  if (shortMatch) videoId = shortMatch[1];
  else if (longMatch) videoId = longMatch[1];

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

// Fayl nomi (yoki qisman yo'l) asosida to'liq, ishlaydigan URL hosil qiladi.
// - Agar backend allaqachon to'liq URL (http/https bilan boshlanadigan) qaytarsa,
//   o'zgarishsiz ishlatiladi.
// - Aks holda FILES_BASE_URL (backendning to'liq domeni) bilan birlashtiriladi.
// - Boshida "/" bo'lsa, dublikat "//" hosil bo'lmasligi uchun tozalanadi.
//
// DIQQAT: bu funksiya faqat PUBLIC fayllar (masalan foydalanuvchi avatarlari,
// Q&A ilova fayllari) uchun ishlatiladi. Imtihon savoli rasmi kabi PRIVATE
// fayllar uchun ishlatilmaydi — ular uchun pastdagi useEffect (blob orqali
// yuklash) ishlatiladi.
function resolveFileSrc(file: string | null | undefined): string | null {
  if (!file) return null;
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const cleanFile = file.startsWith("/") ? file.slice(1) : file;
  return `${FILES_BASE_URL}/${cleanFile}`;
}

function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

function getInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ["#BC000D", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
  if (!name) return colors[0];
  const charCode = name.trim().toUpperCase().charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Rich-text editordan kelgan HTML "bo'sh" hisoblanadimi yoki yo'qmi shuni
// tekshiradi — Tiptap bo'sh bo'lsa ham "<p></p>" kabi HTML qaytaradi,
// shuning uchun oddiy .trim() bu yerda ishlamaydi.
function isQuestionEmpty(html: string): boolean {
  return !html.replace(/<[^>]*>/g, "").trim();
}

const quizQuestions = [
  {
    id: 1,
    text: "Quyidagilardan qaysi biri CSS-da matn rangini o'zgartiradi?",
    options: ["font-size", "color", "background", "border"],
    correctIndex: 1,
  },
  {
    id: 2,
    text: "CSS-da qaysi xususiyat meros bo'lib o'tadi?",
    options: ["margin", "padding", "font-family", "border"],
    correctIndex: 2,
  },
  {
    id: 3,
    text: "HTML-da eng katta sarlavha qaysi teg?",
    options: ["<h6>", "<h3>", "<h1>", "<header>"],
    correctIndex: 2,
  },
  {
    id: 4,
    text: "CSS-da element o'lchamini belgilash uchun qaysi birlik qo'llaniladi?",
    options: ["px", "kg", "cm (faqat)", "dp"],
    correctIndex: 0,
  },
  {
    id: 5,
    text: "Quyidagilardan qaysi biri formatlash tegi emas?",
    options: ["<span>", "<strong>", "<mark>", "<div>"],
    correctIndex: 0,
  },
];

export function StudentCourseDetail() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params?.id as string;

  const [groups, setGroups] = useState<ApiLessonGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [courseName, setCourseName] = useState("");

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  const [viewedLessonIds, setViewedLessonIds] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<Tab>("qa");
  const [showAskModal, setShowAskModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // ── Q&A: haqiqiy savollar ro'yxati ──
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // ── Notification'dan deep-link orqali kelgan savolni scroll+highlight qilish uchun ──
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);
  const lastHandledDeepLinkRef = useRef<string | null>(null);

  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [homeworkText, setHomeworkText] = useState("");
  const [homeworkFile, setHomeworkFile] = useState<File | null>(null);
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);

  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testSubmitting, setTestSubmitting] = useState(false);

  const [testAlreadyPassed, setTestAlreadyPassed] = useState(false);

  // ── Imtihon savoli rasmi: PRIVATE fayl bo'lgani uchun apiFetch (token bilan)
  // orqali blob sifatida yuklanadi va Object URL sifatida saqlanadi ──
  const [examQuestionImageUrl, setExamQuestionImageUrl] = useState<string | null>(null);
  const [examQuestionImageLoading, setExamQuestionImageLoading] = useState(false);
  const [examQuestionImageError, setExamQuestionImageError] = useState<string | null>(null);

  // Mobil sidebar (drawer) holati
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  

  // ── Q&A: kurs bo'yicha savollarni yuklash ──
  // MUHIM: /questions/course/:id — MENTOR-only endpoint, STUDENT uchun 403 qaytaradi.
  // STUDENT uchun to'g'ri endpoint — /questions/mine?courseId=... (Swagger orqali tasdiqlangan).
  const fetchQuestions = async () => {
    if (!courseId) return;
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const res = await apiFetch(
        `/questions/mine?offset=0&limit=50&courseId=${courseId}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data?.data) ? data.data : []);
      } else {
        const errBody = await res.text();
        console.error("questions/mine xato javobi:", res.status, errBody);
        setQuestionsError("Savollarni yuklab bo'lmadi");
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      setQuestionsError("Savollarni yuklab bo'lmadi");
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  // ── Notification'dan (?questionId=...) kelinganda: Q&A tabga o'tish,
  // MAJBURIY ravishda eng so'nggi savollar ro'yxatini qayta yuklab (eski 'questions'
  // state'iga tayanmasdan — sahifa allaqachon ochiq bo'lsa mentor javobi eski
  // state'da bo'lmasligi mumkin), so'ng o'sha savolga scroll qilish va ajratib ko'rsatish ──
  useEffect(() => {
    const questionIdParam = searchParams.get("questionId");
    if (!questionIdParam || !courseId) return;
    if (lastHandledDeepLinkRef.current === questionIdParam) return;
    lastHandledDeepLinkRef.current = questionIdParam; // darhol belgilaymiz — qayta ishga tushmasin

    let cancelled = false;
    const targetId = Number(questionIdParam);

    (async () => {
      setActiveTab("qa");
      try {
        const res = await apiFetch(
          `/questions/mine?offset=0&limit=50&courseId=${courseId}`,
          { cache: "no-store" }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const freshQuestions: QuestionItem[] = Array.isArray(data?.data) ? data.data : [];
        if (cancelled) return;
        setQuestions(freshQuestions);

        const target = freshQuestions.find((q) => q.id === targetId);
        if (!target) return;

        // Tab almashgach va ro'yxat render bo'lgach scroll qilamiz
        setTimeout(() => {
          const el = questionRefs.current[targetId];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 150);

        setHighlightedQuestionId(targetId);
        setTimeout(() => setHighlightedQuestionId(null), 3000);
      } catch (err) {
        console.error("Deep-link uchun savollarni qayta yuklashda xatolik:", err);
      } finally {
        if (!cancelled) {
          // URL'ni tozalaymiz, lekin kurs sahifasida qolamiz
          router.replace(`/student/my-courses/${courseId}`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, courseId, router]);

  const handleAskSubmit = async () => {
    if (!courseId || isQuestionEmpty(questionText) || questionSubmitting) return;
    setQuestionSubmitting(true);
    setQuestionError(null);
    try {
      const formData = new FormData();
      formData.append("text", questionText);
      if (questionFile) formData.append("file", questionFile);

      const res = await apiFetch(`/questions/create/${courseId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("questions/create xato javobi:", res.status, errBody);
        throw new Error("Savol yuborishda xatolik yuz berdi");
      }

      setQuestionText("");
      setQuestionFile(null);
      setShowAskModal(false);
      // Yangi savolni ro'yxatga qo'shish uchun qayta yuklaymiz
      await fetchQuestions();
    } catch (err) {
      console.error("Ask question error:", err);
      setQuestionError("Savol yuborib bo'lmadi, qayta urinib ko'ring");
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleDownloadMaterial = async (file: string, displayName?: string) => {
    if (!lessonDetail?.id) return;
    try {
      const response = await apiFetch(
        `/files/private/lesson-file/${lessonDetail.id}/${file}`
      );
      if (!response.ok) {
        alert("Faylni yuklab olishda xatolik yuz berdi.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const ext = file.includes(".") ? file.split(".").pop() : "";
      link.download = displayName
        ? ext
          ? `${displayName}.${ext}`
          : displayName
        : file;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Material download error:", err);
      alert("Faylni yuklab olishda xatolik yuz berdi.");
    }
  };

  const [rating, setRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const fetchMyRating = async () => {
      try {
        const res = await apiFetch(
          `/course-rating/list/${courseId}?offset=0&limit=100`
        );
        if (!res.ok) return;
        const resData = await res.json();
        const myUserId = getCurrentUserId();
        const mine = Array.isArray(resData?.data)
          ? resData.data.find((r: any) => r.user?.id === myUserId)
          : null;
        if (mine) {
          setRating(mine.rate);
          setRatingSubmitted(true);
        }
      } catch (err) {
        console.error("Rating list fetch error:", err);
      }
    };
    fetchMyRating();
  }, [courseId]);

  const submitRating = async (star: number) => {
    if (!courseId || ratingSubmitting || ratingSubmitted) return;
    setRating(star);
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      const res = await apiFetch("/course-rating", {
        method: "POST",
        body: JSON.stringify({
          rate: star,
          comment: "",
          courseId,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error("course-rating xato javobi:", res.status, errBody);
        throw new Error("Baholashda xatolik yuz berdi");
      }
      setRatingSubmitted(true);
    } catch (err) {
      console.error("Rating submit error:", err);
      setRatingError("Baholab bo'lmadi, qayta urinib ko'ring");
    } finally {
      setRatingSubmitting(false);
    }
  };
  const [quizStarted, setQuizStarted] = useState(false);
  const [tabQuizStarted, setTabQuizStarted] = useState(false);
  const [showExamPage, setShowExamPage] = useState(false);

  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerConfirmed, setAnswerConfirmed] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const resetQuiz = () => {
    setCurrentQ(0);
    setUserAnswers(Array(quizQuestions.length).fill(null));
    setSelectedAnswer(null);
    setAnswerConfirmed(false);
    setQuizDone(false);
  };

  const [homeworkSubmitted, setHomeworkSubmitted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMsg, setSuccessToastMsg] = useState("");
  const [lessonBlockedMessage, setLessonBlockedMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessToastMsg(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  useEffect(() => {
    if (!courseId) return;

    const fetchGroups = async () => {
      try {
       const res = await apiFetch(
          `/lesson-group/mine-all/${courseId}?offset=0&limit=50&include_lessons=true`
        );
        if (!res.ok) throw new Error("Darslarni olishda xatolik");
        const data = await res.json();

       // Har bir guruh ichidagi darslarni nomidagi raqam bo'yicha (masalan
        // "2-dars..." dagi 2) saralaymiz — bu darsning haqiqiy tartib raqami.
        // Backend ro'yxatni ishonchli tartibda qaytarmaydi, bu esa "Keyingi
        // dars" navigatsiyasini (getNextLessonId) ham buzadi, shuning uchun
        // tartibni to'liq frontendda hisoblaymiz. Agar nomda raqam bo'lmasa —
        // id bo'yicha (yaratilish tartibi) saralanadi.
        const getLessonOrder = (l: ApiLesson): number => {
          const match = String(l.name || "").match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
        };
        const sortedGroups: ApiLessonGroup[] = (data.data || []).map((g: ApiLessonGroup) => ({
          ...g,
          lessons: [...g.lessons].sort((a, b) => {
            const orderDiff = getLessonOrder(a) - getLessonOrder(b);
            if (orderDiff !== 0) return orderDiff;
            return Number(a.id) - Number(b.id);
          }),
        }));

        setGroups(sortedGroups);

        const viewed = new Set<string>();
        sortedGroups.forEach((g: ApiLessonGroup) => {
          g.lessons.forEach((l) => {
            if (l.views && l.views.length > 0) viewed.add(l.id);
          });
        });
        setViewedLessonIds(viewed);

        if (sortedGroups.length > 0) {
          setExpandedGroups({ [sortedGroups[0].id]: true });
        }

        const firstGroupWithLessons = sortedGroups.find(
          (g: ApiLessonGroup) => g.lessons.length > 0
        );
        if (firstGroupWithLessons) {
          setSelectedLessonId(firstGroupWithLessons.lessons[0].id);
        }
      } catch (err) {
        console.error("Fetch groups error:", err);
      } finally {
        setGroupsLoading(false);
      }
    };

    const fetchCourseName = async () => {
      try {
        const res = await apiFetch(`/purchased-courses/mine/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourseName(data.course?.name || "");
        }
      } catch (err) {
        console.error("Fetch course error:", err);
      }
    };

    fetchGroups();
    fetchCourseName();
  }, [courseId]);

  useEffect(() => {
    if (!selectedLessonId) return;

    const fetchLesson = async () => {
      setLessonLoading(true);
      setLessonBlockedMessage(null);
      try {
        const res = await apiFetch(`/lessons/single/${selectedLessonId}`);
        if (!res.ok) {
          const errBody = await res.text();
          console.error("lessons/single xato:", res.status, errBody);

          let parsedMessage = "";
          try {
            parsedMessage = JSON.parse(errBody)?.message || "";
          } catch {}

          if (
            res.status === 400 &&
            (parsedMessage === "You should pass test first" ||
              parsedMessage === "You should pass the previous lesson test first")
          ) {
            setLessonBlockedMessage(
              "Bu darsni ko'rish uchun avvalgi darsning imtihonini topshiring."
            );
            setLessonDetail(null);
            return;

            // Faqat KUTILMAGAN xatolarni konsolga chiqaramiz
            console.error("lessons/single xato:", res.status, errBody);
            throw new Error("Darsni olishda xatolik");
          }

          throw new Error("Darsni olishda xatolik");
        }
        const data: LessonDetail = await res.json();
        setLessonDetail(data);
      } catch (err) {
        console.error("Fetch lesson error:", err);
        setLessonDetail(null);
      } finally {
        setLessonLoading(false);
      }
    };

    fetchLesson();
  }, [selectedLessonId]);

  const markLessonAsViewed = async (lessonId: string) => {
    if (viewedLessonIds.has(lessonId)) return;
    try {
      const res = await apiFetch(`/lessons/view/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify({ view: true }),
      });
      if (res.ok) {
        setViewedLessonIds((prev) => new Set(prev).add(lessonId));
      } else {
        const errBody = await res.text();
        console.error("lessons/view xato:", res.status, errBody);
      }
    } catch (err) {
      console.error("Mark viewed error:", err);
    }
  };

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getNextLessonId = (): string | null => {
    const allLessons: { id: string }[] = [];
    groups.forEach((g) => {
      g.lessons.forEach((l) => allLessons.push({ id: l.id }));
    });
    const currentIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
    if (currentIndex === -1 || currentIndex + 1 >= allLessons.length) return null;
    return allLessons[currentIndex + 1].id;
  };

  const embedUrl = getYoutubeEmbedUrl(lessonDetail?.youtube_link || null);
  const videoWatched = selectedLessonId ? viewedLessonIds.has(selectedLessonId) : false;

  const handleNextLesson = () => {
  // Agar darsda video umuman bo'lmasa, "ko'rilgan" deb hisoblanadi (talab qilinmaydi)
  const videoRequired = !!embedUrl;
  const effectiveVideoWatched = !videoRequired || videoWatched;

  // Agar darsga vazifa biriktirilmagan bo'lsa, "topshirilgan" deb hisoblanadi (talab qilinmaydi)
  const homeworkRequired = !!lessonDetail?.homework;
  const homeworkDone =
    !homeworkRequired ||
    (homeworkSubmissions.length > 0 && homeworkSubmissions[0]?.status !== "REJECTED");

  const testDone = testAlreadyPassed || testResult?.passed || testQuestions.length === 0;

  if (!effectiveVideoWatched || !homeworkDone) {
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 4000);
    return;
  }
  if (!testDone) {
    setActiveTab("imtihonlar");
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 5000);
    return;
  }

    const nextLessonId = getNextLessonId();
    if (nextLessonId) {
      setSelectedLessonId(nextLessonId);
      setActiveTab("qa");
      showSuccess("Keyingi darsga muvaffaqiyatli o'tildi!");
    } else {
      showSuccess("Siz kursning oxirgi darsini yakunladingiz!");
    }
  };

  const fetchHomeworkSubmissions = async (silent = false) => {
    if (!lessonDetail?.id) return;
    if (!silent) setHomeworkLoading(true);
    try {
      const response = await apiFetch(
        `/homework/submission/mine/${lessonDetail.id}?offset=0&limit=8`
      );
      if (response.ok) {
        const data = await response.json();
        setHomeworkSubmissions(data.data || []);
      }
    } catch (err) {
      console.error("Homework fetch error:", err);
    } finally {
      if (!silent) setHomeworkLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworkSubmissions();
  }, [lessonDetail?.id]);

  const handleSubmitHomework = async () => {
    if (!lessonDetail?.id || !homeworkFile) {
      alert("Iltimos, faylni tanlang.");
      return;
    }
    setIsSubmittingHomework(true);
    try {
      const formData = new FormData();
      formData.append("text", homeworkText);
      formData.append("file", homeworkFile);

      const response = await apiFetch(
        `/homework/submission/submit/${lessonDetail.id}`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        alert("Vazifani yuborishda xatolik yuz berdi.");
        return;
      }

      setHomeworkText("");
      setHomeworkFile(null);
      await fetchHomeworkSubmissions(true);
    } catch (err) {
      console.error("Homework submit error:", err);
      alert("Vazifani yuborishda xatolik yuz berdi.");
    } finally {
      setIsSubmittingHomework(false);
    }
  };

  const fetchTestQuestions = async () => {
    setTestQuestions([]);
    setTestResult(null);
    setTestAnswers({});
    setCurrentQ(0);
    setTestAlreadyPassed(false);

    if (!lessonDetail?.id) {
      setTestLoading(false);
      return;
    }

    setTestLoading(true);
    try {
      const res = await apiFetch(`/tests/lesson/${lessonDetail.id}/`);
      if (res.ok) {
        const data = await res.json();
        setTestQuestions(Array.isArray(data) ? data : []);
      } else {
        const errBody = await res.text();
        let parsedMessage = "";
        try {
          parsedMessage = JSON.parse(errBody)?.message || "";
        } catch {}

        if (parsedMessage === "You already passed this test") {
          // Bu kutilgan holat — xato emas
          setTestAlreadyPassed(true);
          setExamCompleted(true);
        } else {
          // Faqat haqiqiy, kutilmagan xatoларни log qilamiz
          console.error("tests/lesson xato:", res.status, errBody);
        }
        setTestQuestions([]);
      }
    } catch (err) {
      console.error("Test questions fetch error:", err);
      setTestQuestions([]);
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    fetchTestQuestions();
  }, [lessonDetail?.id]);

  // ── Imtihon savoli rasmi: joriy savol yoki dars o'zgarganda, agar savolga
  // rasm biriktirilgan bo'lsa (q.image), uni apiFetch orqali (Authorization
  // header bilan) blob sifatida yuklab, Object URL sifatida saqlaymiz.
  // Bu PRIVATE endpoint (/files/private/lesson-file/:lessonId/:name) auth
  // talab qilgani uchun oddiy <img src> ishlamaydi.
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const currentImage = testQuestions[currentQ]?.image;
    setExamQuestionImageUrl(null);
    setExamQuestionImageError(null);   // ← qo'shildi

    if (!currentImage || !lessonDetail?.id) {
      setExamQuestionImageLoading(false);
      return;
    }

    setExamQuestionImageLoading(true);

    (async () => {
      try {
        const res = await apiFetch(
          `/files/private/lesson-file/${lessonDetail.id}/${currentImage}`
        );
        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          console.error("Savol rasmini yuklashda xato javob:", res.status, errBody);
          if (!cancelled) {
            // ← Studentga (va bizga debug uchun) ko'rinadigan xabar
            setExamQuestionImageError(
              res.status === 401 || res.status === 403
                ? "Sessiya muddati tugagan bo'lishi mumkin. Sahifani yangilab ko'ring."
                : "Rasmni yuklab bo'lmadi."
            );
          }
          return;
        }
        const blob = await res.blob();
        if (cancelled) return;

        // Backend xato bo'lsa ham 200 qaytarib, HTML/JSON yuborishi mumkin —
        // shunday holatni ham aniqlaymiz
        if (!blob.type.startsWith("image/")) {
          console.error("Kutilmagan content-type:", blob.type);
          setExamQuestionImageError("Rasm formati noto'g'ri.");
          return;
        }

        objectUrl = window.URL.createObjectURL(blob);
        setExamQuestionImageUrl(objectUrl);
      } catch (err) {
        console.error("Savol rasmini yuklashda xatolik:", err);
        if (!cancelled) setExamQuestionImageError("Tarmoq xatosi yuz berdi.");
      } finally {
        if (!cancelled) setExamQuestionImageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [currentQ, testQuestions, lessonDetail?.id]);

  const handleSubmitTest = async () => {
    if (!lessonDetail?.id || testQuestions.length === 0) return;
    setTestSubmitting(true);
    try {
      const answersPayload = testQuestions.map((q) => ({
        id: q.id,
        answer: testAnswers[q.id] || "",
      }));

      const res = await apiFetch("/tests/pass", {
        method: "POST",
        body: JSON.stringify({
          lessonId: lessonDetail.id,
          answers: answersPayload,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("tests/pass xato:", res.status, errBody);
        alert("Testni yuborishda xatolik yuz berdi.");
        return;
      }

      const data = await res.json();
      setTestResult({ passed: data.passed, corrects: data.corrects, wrongs: data.wrongs });
      if (data.passed) {
        setExamCompleted(true);
      }
    } catch (err) {
      console.error("Test submit error:", err);
      alert("Testni yuborishda xatolik yuz berdi.");
    } finally {
      setTestSubmitting(false);
    }
  };

  const resetTestFlow = () => {
    setCurrentQ(0);
    setTestAnswers({});
    setTestResult(null);
  };

  const statusLabel = (status: string) => {
    if (status === "APPROVED") return "Qabul qilindi";
    if (status === "REJECTED") return "Rad etildi";
    return "Tekshirilmoqda";
  };

  const statusColors = (status: string) => {
    if (status === "APPROVED") return { bg: "#DCFCE7", text: "#16A34A" };
    if (status === "REJECTED") return { bg: "#FEE2E2", text: "#DC2626" };
    return { bg: "#FEF3C7", text: "#CA8A04" };
  };

  // ── Chapdagi darslar ro'yxati (sidebar ichi) — mobil drawer va desktop
  // sidebar'da qayta ishlatiladi, kod takrorlanmasligi uchun funksiyaga chiqarildi
  const sidebarContent = (
    <>
      <div className="shrink-0 p-4">
        <button
          onClick={() => {
            router.push("/student/my-courses");
          }}
          className="font-inter flex w-full items-center justify-center gap-2 rounded-lg border border-[#E0E3E6] bg-white px-3.5 py-2.5 text-sm font-medium text-[#BC000D] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFF1F1";
            e.currentTarget.style.borderColor = "#BC000D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#E0E3E6";
          }}
        >
          <ArrowLeft size={16} />
          Kurslar ro&apos;yxatiga qaytish
        </button>
      </div>

      <div className="font-inter shrink-0 border-b border-[#F0F1F2] px-4 py-3.5 text-[15px] font-bold text-black">
        {courseName || "Yuklanmoqda..."}
      </div>

      <div className="flex-1 overflow-y-auto">
        {groupsLoading ? (
          <div className="p-5 text-center text-[#636C79]">Yuklanmoqda...</div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="border-b border-[#F0F1F2]">
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="font-inter text-sm font-semibold text-black">{group.name}</div>
                <ChevronRight
                  size={16}
                  color="#636C79"
                  className="shrink-0 transition-transform duration-200"
                  style={{ transform: expandedGroups[group.id] ? "rotate(90deg)" : "rotate(0deg)" }}
                />
              </button>

              {expandedGroups[group.id] && group.lessons.length > 0 && (
                <div className="pb-1.5">
                  {group.lessons.map((lesson) => {
                    const isActive = lesson.id === selectedLessonId;
                    const isViewed = viewedLessonIds.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setMobileSidebarOpen(false);
                        }}
                        className="flex cursor-pointer items-start gap-2.5 px-4 py-2"
                        style={{ background: isActive ? "#EEF3FF" : "transparent" }}
                      >
                        <div className="mt-0.5 size-5 shrink-0 rounded-full bg-[#BC000D]" />
                        <div className="flex-1">
                          <div
                            className="font-inter text-[13px] text-black"
                            style={{ fontWeight: isActive ? 600 : 400 }}
                          >
                            {lesson.name}
                          </div>
                        </div>
                        {isViewed && (
                          <Check size={13} color="#636C79" className="mt-1 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {expandedGroups[group.id] && group.lessons.length === 0 && (
                <div className="px-4 py-2 text-[13px] text-[#636C79]">
                  Darslar hali qo&apos;shilmagan
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#F0F1F2] xs:h-[calc(100vh-72px)] md:h-[calc(100vh-80px)]">
      {/* Mobil: hamburger tugma */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed left-3 top-[76px] z-40 flex size-10 items-center justify-center rounded-[10px] border border-[#E0E3E6] bg-white shadow-sm lg:hidden"
        aria-label="Darslar ro'yxatini ochish"
      >
        <Menu size={20} color="#000000" />
      </button>

      {/* Mobil: overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobil: drawer sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col rounded-r-xl bg-white transition-transform duration-300 ease-in-out lg:hidden"
        style={{ transform: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop: doimiy sidebar */}
      <aside className="hidden h-full w-[300px] min-w-[300px] shrink-0 flex-col overflow-y-auto rounded-r-xl border-r border-[#F0F1F2] bg-white lg:flex xl:w-[360px] xl:min-w-[360px]">
        {sidebarContent}
      </aside>

      {/* ── Right: main content ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-0 overflow-y-auto p-2.5 xs:p-3 sm:p-4">
        {showExamPage ? (
          /* ── Full-Page Exam View ── */
          <div className="min-h-full rounded-lg bg-white p-4 sm:p-6">
            {(!examCompleted || showWarning) && (
              <div className="mb-5 flex items-center gap-3 rounded-md border-l-4 border-[#BC000D] bg-[#FFF1F1] px-4 py-3.5 sm:mb-6 sm:px-5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#BC000D]">
                  <span className="text-sm font-bold text-white">!</span>
                </div>
                <div>
                  <div className="font-inter mb-0.5 text-xs font-bold text-[#BC000D] sm:text-[13px]">
                    Siz moduldagi darslarni tugatmadingiz
                  </div>
                  <div className="font-inter text-xs text-[#636C79]">
                    Iltimos, to&apos;liq yakunlang va imtihon savollarini topshiring
                  </div>
                </div>
              </div>
            )}

            {!quizStarted ? (
              <div>
                <h2 className="font-inter mb-4 text-lg font-bold leading-snug text-black sm:text-xl">
                  CSSda shriftlar va meros bo&apos;lib o&apos;tadigan xususiyatlar
                </h2>
                <div className="mb-6 flex flex-col gap-3.5">
                  <div className="flex gap-2.5">
                    <span className="font-inter w-[140px] shrink-0 text-sm text-[#636C79] sm:w-40">
                      Darajasi:
                    </span>
                    <span className="font-inter text-sm font-semibold text-black">O&apos;rta</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-inter w-[140px] shrink-0 text-sm text-[#636C79] sm:w-40">
                      Bajarish vaqti:
                    </span>
                    <span className="font-inter text-sm font-semibold text-black">Cheksiz</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-inter w-[140px] shrink-0 text-sm text-[#636C79] sm:w-40">
                      O&apos;zlashtiriladigan ball:
                    </span>
                    <span className="font-inter text-sm font-semibold text-black">5</span>
                  </div>
                </div>

                <button
                  onClick={() => setQuizStarted(true)}
                  className="font-inter mb-6 rounded-lg bg-[#BC000D] px-6 py-3 text-sm font-semibold text-white sm:mb-8 sm:px-7 sm:text-[15px]"
                >
                  Testni boshlash
                </button>

                <div className="mb-5 h-px bg-[#F0F1F2] sm:mb-6" />

                <div className="flex flex-col gap-4">
                  {[
                    { label: "Natijangiz", value: "-" },
                    { label: "Sarflangan vaqt", value: "-" },
                    { label: "O\u02bczlashtrilgan ball", value: "-" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="font-inter mb-1 text-[13px] text-[#636C79]">{item.label}</div>
                      <div className="font-inter text-base font-semibold text-black">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : quizDone ? (
              (() => {
                const score = userAnswers.filter(
                  (a, i) => a === quizQuestions[i].correctIndex
                ).length;
                const total = quizQuestions.length;
                const passed = score >= Math.ceil(total * 0.6);
                return (
                  <div className="py-5 text-center">
                    <div
                      className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full text-2xl sm:size-20 sm:text-3xl"
                      style={{ background: passed ? "#E6F9F0" : "#FFF1F1" }}
                    >
                      {passed ? "✓" : "✗"}
                    </div>
                    <div className="font-inter mb-2 text-lg font-bold text-black sm:text-xl">
                      {passed ? "Tabriklaymiz!" : "Harakat qiling!"}
                    </div>
                    <div className="font-inter mb-6 text-sm text-[#636C79] sm:text-[15px]">
                      {score}/{total} ta savol to&apos;g&apos;ri javoblandi
                    </div>
                    <div className="mx-auto mb-7 flex max-w-[360px] flex-col gap-3 text-left">
                      {[
                        { label: t("exam.yourResult"), value: `${Math.round((score / total) * 100)}%` },
                        { label: t("exam.correctAnswers"), value: `${score} ${t("pagination.items")}` },
                        { label: t("exam.wrongAnswers"), value: `${total - score} ${t("pagination.items")}` },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between border-b border-[#F0F1F2] py-2.5"
                        >
                          <span className="font-inter text-sm text-[#636C79]">{item.label}</span>
                          <span className="font-inter text-sm font-bold text-black">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {passed ? (
                      <button
                        onClick={() => {
                          setExamCompleted(true);
                          setShowExamPage(false);
                          resetQuiz();
                          showSuccess(t("exam.examPassedSuccess"));
                        }}
                        className="font-inter rounded-lg bg-[#12B76A] px-7 py-3 text-sm font-semibold text-white sm:px-8 sm:text-[15px]"
                      >
                        {t("exam.finish")}
                      </button>
                    ) : (
                      <button
                        onClick={() => resetQuiz()}
                        className="font-inter rounded-lg bg-[#BC000D] px-7 py-3 text-sm font-semibold text-white sm:px-8 sm:text-[15px]"
                      >
                        {t("exam.retake")}
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              (() => {
                const q = quizQuestions[currentQ];
                return (
                  <div>
                    <div className="mb-5">
                      <div className="mb-2 flex justify-between">
                        <span className="font-inter text-sm font-semibold text-black">
                          Savol: {currentQ + 1}/{quizQuestions.length}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {quizQuestions.map((_, n) => (
                          <div
                            key={n}
                            className="h-1.5 flex-1 rounded-[3px]"
                            style={{
                              background:
                                n < currentQ
                                  ? userAnswers[n] === quizQuestions[n].correctIndex
                                    ? "#12B76A"
                                    : "#BC000D"
                                  : n === currentQ
                                  ? "#BC000D"
                                  : "#E0E3E6",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="font-inter mb-4 text-[15px] font-semibold text-black">
                      {currentQ + 1}. {q.text}
                    </div>

                    <div className="mb-5 flex flex-col gap-2.5">
                      {q.options.map((opt, idx) => {
                        let borderColor = "#E0E3E6";
                        let bgColor = "#fff";
                        let textColor = "#000";
                        if (answerConfirmed) {
                          if (idx === q.correctIndex) {
                            borderColor = "#12B76A";
                            bgColor = "#E6F9F0";
                            textColor = "#12B76A";
                          } else if (idx === selectedAnswer) {
                            borderColor = "#BC000D";
                            bgColor = "#FFF1F1";
                            textColor = "#BC000D";
                          }
                        } else if (selectedAnswer === idx) {
                          borderColor = "#BC000D";
                          bgColor = "#FFF1F1";
                        }
                        return (
                          <label
                            key={idx}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-all"
                            style={{ border: `1px solid ${borderColor}`, background: bgColor }}
                          >
                            <span
                              className="font-inter text-sm font-medium"
                              style={{ color: textColor }}
                            >
                              {String.fromCharCode(65 + idx)}) {opt}
                            </span>
                            <input
                              type="radio"
                              name="quiz-fs"
                              disabled={answerConfirmed}
                              checked={selectedAnswer === idx}
                              onChange={() => !answerConfirmed && setSelectedAnswer(idx)}
                              className="size-[18px]"
                              style={{
                                accentColor:
                                  idx === q.correctIndex && answerConfirmed
                                    ? "#12B76A"
                                    : "#BC000D",
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex justify-between gap-3">
                      <button
                        onClick={() => {
                          setQuizStarted(false);
                          resetQuiz();
                        }}
                        className="font-inter rounded-lg bg-[#F0F1F2] px-5 py-2.5 text-sm font-medium text-black sm:px-6"
                      >
                        {t("common.cancel")}
                      </button>
                      {!answerConfirmed ? (
                        <button
                          disabled={selectedAnswer === null}
                          onClick={() => {
                            if (selectedAnswer === null) return;
                            const updated = [...userAnswers];
                            updated[currentQ] = selectedAnswer;
                            setUserAnswers(updated);
                            setAnswerConfirmed(true);
                          }}
                          className="font-inter rounded-lg px-6 py-2.5 text-sm font-medium text-white sm:px-7"
                          style={{
                            background: selectedAnswer === null ? "#F5C2C2" : "#BC000D",
                            cursor: selectedAnswer === null ? "not-allowed" : "pointer",
                          }}
                        >
                          Tasdiqlash
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (currentQ + 1 < quizQuestions.length) {
                              setCurrentQ(currentQ + 1);
                              setSelectedAnswer(null);
                              setAnswerConfirmed(false);
                            } else {
                              setQuizDone(true);
                            }
                          }}
                          className="font-inter rounded-lg bg-[#BC000D] px-6 py-2.5 text-sm font-medium text-white sm:px-7"
                        >
                          {currentQ + 1 < quizQuestions.length ? "Keyingi savol →" : "Natijani ko'rish"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        ) : (
          /* ── Normal Video + Tabs Card View ── */
          <div className="rounded-lg bg-white">
            {/* Header row */}
            <div className="flex flex-col gap-3 border-b border-[#F0F1F2] px-4 py-3.5 xs:flex-row xs:items-center xs:justify-between sm:px-5">
              <span className="font-inter min-w-0 truncate pl-10 text-base font-bold text-black xs:pl-0 sm:text-[17px]">
                {lessonLoading ? "Yuklanmoqda..." : lessonDetail?.name || "Dars tanlanmagan"}
              </span>
              <button
                onClick={handleNextLesson}
                className="font-inter flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#BC000D] px-4 py-2.5 text-sm font-medium text-white"
              >
                Keyingi dars
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Video player */}
            <div className="box-border px-3 pt-3 xs:px-4 xs:pt-4 sm:px-5 sm:pt-4">
              {lessonLoading ? (
                <div className="font-inter flex h-[200px] items-center justify-center rounded-xl bg-[#F0F1F2] text-sm text-[#636C79] xs:h-[260px] sm:h-[340px] lg:h-[420px]">
                  Video yuklanmoqda...
                </div>
              ) : lessonBlockedMessage ? (
                <div className="font-inter box-border flex min-h-[200px] items-center justify-center rounded-xl bg-[#FFF1F1] p-5 text-center text-sm font-semibold text-[#BC000D] xs:min-h-[260px] sm:min-h-[340px] sm:text-[15px] lg:min-h-[420px]">
                  {lessonBlockedMessage}
                </div>
              ) : embedUrl ? (
                <div className="relative w-full overflow-hidden rounded-xl">
                  <div className="h-[200px] xs:h-[260px] sm:h-[340px] lg:h-[420px]">
                    <iframe
                      src={embedUrl}
                      title={lessonDetail?.name || "Video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        if (selectedLessonId) markLessonAsViewed(selectedLessonId);
                      }}
                      className="h-full w-full border-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="font-inter flex h-[200px] items-center justify-center rounded-xl bg-[#F0F1F2] text-sm text-[#636C79] xs:h-[260px] sm:h-[340px] lg:h-[420px]">
                  Bu darsda video mavjud emas
                </div>
              )}
            </div>

            {/* Dars tavsifi */}

            {lessonDetail?.about && (
              <div className="px-3 pt-3 xs:px-4 xs:pt-4 sm:px-5">
                <p className="font-inter m-0 whitespace-pre-line text-sm text-[#636C79]">{lessonDetail.about}</p>
              </div>
            )}

            {/* Rating */}
            <div className="mt-2 border-b border-[#F0F1F2] px-3 pb-2.5 pt-3 text-center xs:px-4 xs:pt-4 sm:px-5">
              <div className="font-inter mb-1.5 text-sm font-semibold text-black sm:text-[15px]">
                {ratingSubmitted ? "Baholaganingiz uchun rahmat!" : "Darsni baholashni istaysizmi?"}
              </div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => submitRating(star)}
                    disabled={ratingSubmitting}
                    className="px-0.5 text-xl leading-none xs:text-2xl"
                    style={{
                      color: star <= rating ? "#F59E0B" : "#E0E3E6",
                      cursor: ratingSubmitting ? "not-allowed" : "pointer",
                      opacity: ratingSubmitting ? 0.6 : 1,
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {ratingError && (
                <div className="font-inter mt-1.5 text-xs text-[#DC2626]">{ratingError}</div>
              )}
            </div>

            {/* Tabs — mobilda gorizontal scroll */}
            <div className="flex gap-1 overflow-x-auto border-b border-[#F0F1F2] px-3 pt-2.5 xs:px-4 sm:px-5 sm:pt-2.5">
              {(["qa", "materiallar", "vazifalar", "imtihonlar"] as Tab[]).map((tab) => {
                const labels: Record<Tab, string> = {
                  qa: "Q&A",
                  materiallar: t("courses.resources"),
                  vazifalar: t("courses.assignments"),
                  imtihonlar: t("courses.exams"),
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="font-inter -mb-px shrink-0 whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium transition-all xs:px-4"
                    style={{
                      color: activeTab === tab ? "#ffffff" : "#636C79",
                      background: activeTab === tab ? "#BC000D" : "transparent",
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-4 sm:p-5">
              {/* Q&A */}
              {activeTab === "qa" && (
                <div>
                  <div className="mb-4 flex flex-col gap-3 xs:flex-row xs:items-start xs:justify-between">
                    <div>
                      <div className="font-inter text-base font-bold text-black sm:text-[17px]">
                        Savol va javoblar
                      </div>
                      <div className="font-inter mt-0.5 text-[13px] text-[#636C79]">
                        Savollar: {questions.length} ta · Javoblar:{" "}
                        {questions.filter((q) => q.answer).length} ta
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAskModal(true)}
                      className="font-inter shrink-0 whitespace-nowrap rounded-lg bg-[#BC000D] px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Savol so&apos;rash
                    </button>
                  </div>

                  <div className="font-inter mb-3 text-sm font-bold text-black">
                    Barcha savollar
                  </div>

                  {questionsLoading ? (
                    <div className="font-inter py-6 text-center text-sm text-[#636C79]">
                      Yuklanmoqda...
                    </div>
                  ) : questionsError ? (
                    <div className="font-inter py-6 text-center text-sm text-[#DC2626]">
                      {questionsError}
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="font-inter py-6 text-center text-sm text-[#636C79]">
                      Hali savollar yo&apos;q. Birinchi bo&apos;lib savol bering!
                    </div>
                  ) : (
                    questions.map((q) => {
                      const isHighlighted = highlightedQuestionId === q.id;
                      return (
                        <div
                          key={q.id}
                          ref={(el) => {
                            questionRefs.current[q.id] = el;
                          }}
                          className="border-t border-[#F0F1F2] py-3.5 transition-colors duration-700"
                          style={{
                            background: isHighlighted ? "#FFF7E0" : "transparent",
                            borderRadius: isHighlighted ? "10px" : 0,
                            paddingLeft: isHighlighted ? "10px" : 0,
                            paddingRight: isHighlighted ? "10px" : 0,
                            boxShadow: isHighlighted ? "0 0 0 2px #F5C445 inset" : "none",
                          }}
                        >
                          {/* Savol */}
                          <div className="flex gap-3">
                            <div
                              className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white xs:size-10"
                              style={{ background: getAvatarColor(q.from.fullName) }}
                            >
                              {q.from.image ? (
                                <img
                                  src={resolveFileSrc(q.from.image) ?? undefined}
                                  alt={q.from.fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getInitial(q.from.fullName)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-inter mb-1 text-sm font-semibold text-[#BC000D]">
                                {q.from.fullName}
                              </div>
                              <div
                                className="font-inter mb-1.5 text-sm text-[#344054] [&_code]:rounded [&_code]:bg-[#F3F4F6] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_p]:m-0"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.text) }}
                              />
                              {q.file && (
                                <a
                                  href={resolveFileSrc(q.file) ?? undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={q.file.split("/").pop()}
                                  className="font-inter mb-1.5 flex w-fit items-center gap-1.5 text-xs font-medium text-[#2563EB] underline"
                                >
                                  <Paperclip size={13} />
                                  {q.file.split("/").pop()}
                                </a>
                              )}
                              <div className="font-inter text-[11px] text-[#9CA3AF]">
                                {formatDate(q.createdAt)}
                              </div>
                            </div>
                          </div>

                          {/* Mentor javobi (agar mavjud bo'lsa) */}
                          {q.answer && (
                            <div className="ml-11 mt-3 flex gap-3 xs:ml-[52px]">
                              <div
                                className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
                                style={{ background: getAvatarColor(q.answer.answeredBy.fullName) }}
                              >
                                {q.answer.answeredBy.image ? (
                                  <img
                                    src={resolveFileSrc(q.answer.answeredBy.image) ?? undefined}
                                    alt={q.answer.answeredBy.fullName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitial(q.answer.answeredBy.fullName)
                                )}
                              </div>
                              <div className="min-w-0 flex-1 rounded-lg bg-[#F8F9FA] px-3.5 py-2.5">
                                <div className="font-inter mb-1 text-[13px] font-semibold text-[#16A34A]">
                                  {q.answer.answeredBy.fullName}{" "}
                                  <span className="font-normal text-[#9CA3AF]">(mentor)</span>
                                </div>
                                <div
                                  className="font-inter mb-1.5 text-sm text-[#344054] [&_code]:rounded [&_code]:bg-white [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_p]:m-0"
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.answer.text) }}
                                />
                                {q.answer.file && (
                                  <a
                                    href={resolveFileSrc(q.answer.file) ?? undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={q.answer.file.split("/").pop()}
                                    className="font-inter mb-1.5 flex w-fit items-center gap-1.5 text-xs font-medium text-[#2563EB] underline"
                                  >
                                    <Paperclip size={13} />
                                    {q.answer.file.split("/").pop()}
                                  </a>
                                )}
                                <div className="font-inter text-[11px] text-[#9CA3AF]">
                                  {formatDate(q.answer.createdAt)}
                                </div>
                              </div>
                            </div>
                          )}

                          {!q.answer && (
                            <div className="font-inter ml-11 mt-2 text-[12px] text-[#9CA3AF] xs:ml-[52px]">
                              Hali javob berilmagan
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Materiallar */}
              {activeTab === "materiallar" && (
                <div>
                  <div className="font-inter mb-3.5 text-base font-bold text-black sm:text-[17px]">
                    Materiallar
                  </div>
                  {lessonDetail?.lessonFiles && lessonDetail.lessonFiles.length > 0 ? (
                    lessonDetail.lessonFiles.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between gap-2 border-b border-[#F0F1F2] py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#FFE5E5]">
                            <span className="text-[9px] font-bold text-[#BC000D]">PDF</span>
                          </div>
                          <span className="font-inter truncate text-sm text-black">
                            {mat.note || mat.file}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadMaterial(mat.file, mat.note)}
                          className="shrink-0 cursor-pointer text-[#636C79]"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="font-inter py-3 text-sm text-[#636C79]">Materiallar mavjud emas.</p>
                  )}
                </div>
              )}

              {/* Vazifalar */}
              {activeTab === "vazifalar" && (
                <div>
                  {lessonDetail?.homework && (
                    <div className="mb-5 rounded-[10px] border border-[#E0E3E6] bg-[#F8F9FA] p-3.5 sm:p-4">
                      <div className="font-inter mb-1.5 text-sm font-bold text-black">
                        Topshiriq
                      </div>
                      <div
                        className="font-inter text-sm text-[#344054]"
                        style={{ marginBottom: lessonDetail.homework.file ? "10px" : 0 }}
                      >
                        {lessonDetail.homework.task}
                      </div>
                      {lessonDetail.homework.file && (
                        <button
                          onClick={() => handleDownloadMaterial(lessonDetail.homework!.file)}
                          className="font-inter inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] font-medium text-[#344054]"
                        >
                          <Download size={14} />
                          Topshiriq faylini yuklab olish
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mb-5 flex flex-col gap-2">
                    {homeworkLoading ? (
                      <div className="font-inter py-3 text-sm text-[#636C79]">Yuklanmoqda...</div>
                    ) : homeworkSubmissions.length > 0 ? (
                      homeworkSubmissions.map((sub) => {
                        const isPdf = sub.file.toLowerCase().endsWith(".pdf");
                        const colors = statusColors(sub.status);
                        return (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-3 border-b border-[#F0F1F2] py-3"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div
                                className="flex size-8 shrink-0 items-center justify-center rounded-md"
                                style={{ background: isPdf ? "#E53E3E" : "#FFF1F1" }}
                              >
                                <span
                                  className="text-[9px] font-bold"
                                  style={{ color: isPdf ? "#ffffff" : "#BC000D" }}
                                >
                                  {isPdf ? "PDF" : "FILE"}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-inter truncate text-sm text-black">
                                  {sub.text || sub.file}
                                </div>
                                {sub.status === "REJECTED" && sub.reason && (
                                  <div className="font-inter mt-0.5 text-xs text-[#DC2626]">
                                    Sabab: {sub.reason}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span
                              className="font-inter shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {statusLabel(sub.status)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="font-inter py-3 text-sm text-[#636C79]">
                        Hali vazifa topshirilmagan.
                      </div>
                    )}
                  </div>

                  {(homeworkSubmissions.length === 0 ||
                    homeworkSubmissions[0]?.status === "REJECTED") && (
                    <>
                      <div className="font-inter mb-3 text-sm font-semibold text-black">
                        Vazifa faylini yuklang
                      </div>

                      <textarea
                        value={homeworkText}
                        onChange={(e) => setHomeworkText(e.target.value)}
                        placeholder="Izoh (ixtiyoriy)..."
                        className="font-inter mb-2.5 box-border w-full resize-y rounded-lg border border-[#E0E3E6] p-3 text-[13px]"
                        style={{ minHeight: "70px" }}
                      />

                      <div className="mb-3 flex w-full flex-col items-stretch gap-2.5 rounded-lg border border-[#E0E3E6] bg-[#F8F9FA] p-3 xs:flex-row xs:items-center">
                        <label className="font-inter inline-flex items-center gap-1.5 rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                          <span className="flex items-center text-[13px]">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                d="M16.6666 9.16666L9.58329 16.25C8.47829 17.355 6.97913 17.9765 5.41663 17.9765C3.85413 17.9765 2.35496 17.355 1.24996 16.25C0.144959 15.145 0.144959 13.6458 1.24996 12.0833L8.33329 5.00001C9.07 4.2633 10.07 3.84902 11.1125 3.84902C12.1549 3.84902 13.1549 4.2633 13.8916 5.00001C14.6283 5.73672 15.0425 6.73672 15.0425 7.77918C15.0425 8.82163 14.6283 9.82163 13.8916 10.5583L6.80829 17.6417"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          Yuklash
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setHomeworkFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        <span className="font-inter truncate text-[13px] text-[#636C79]">
                          {homeworkFile ? homeworkFile.name : "Fayl yuklanmagan"}
                        </span>
                      </div>

                      <button
                        onClick={handleSubmitHomework}
                        disabled={isSubmittingHomework || !homeworkFile}
                        className="font-inter w-full rounded-lg py-2.5 text-sm font-semibold text-white xs:w-auto xs:px-5"
                        style={{
                          backgroundColor: !homeworkFile || isSubmittingHomework ? "#A0A6AD" : "#4F46E5",
                          cursor: !homeworkFile || isSubmittingHomework ? "not-allowed" : "pointer",
                        }}
                      >
                        {isSubmittingHomework ? "Yuborilmoqda..." : "Yuborish"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Imtihonlar */}
              {activeTab === "imtihonlar" && (
                <div>
                  {testLoading ? (
                    <div className="font-inter py-3 text-sm text-[#636C79]">
                      Savollar yuklanmoqda...
                    </div>
                  ) : testAlreadyPassed ? (
                    <div className="font-inter inline-flex items-center gap-2 rounded-lg bg-[#E6F9F0] px-5 py-3 text-sm font-semibold text-[#12B76A] sm:text-[15px]">
                      ✓ Siz bu testni allaqachon muvaffaqiyatli topshirgansiz
                    </div>
                  ) : testQuestions.length === 0 ? (
                    <div className="font-inter py-3 text-sm text-[#636C79]">
                      Bu darsda test mavjud emas.
                    </div>
                  ) : testResult ? (
                    <div className="py-5 text-center">
                      <div
                        className="mx-auto mb-4 flex size-[72px] items-center justify-center rounded-full text-[28px]"
                        style={{ background: testResult.passed ? "#E6F9F0" : "#FFF1F1" }}
                      >
                        {testResult.passed ? "✓" : "✗"}
                      </div>
                      <div className="font-inter mb-1.5 text-lg font-bold text-black sm:text-xl">
                        {testResult.passed ? "Tabriklaymiz!" : "Harakat qiling!"}
                      </div>
                      <div className="font-inter mb-5 text-sm text-[#636C79]">
                        {testResult.corrects}/{testResult.corrects + testResult.wrongs} ta savol to&apos;g&apos;ri javoblandi
                      </div>
                      <div className="mb-6 flex flex-col gap-2.5 text-left">
                        {[
                          { label: t("exam.correctAnswers"), value: `${testResult.corrects} ${t("pagination.items")}` },
                          { label: t("exam.wrongAnswers"), value: `${testResult.wrongs} ${t("pagination.items")}` },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex justify-between border-b border-[#F0F1F2] py-2"
                          >
                            <span className="font-inter text-sm text-[#636C79]">{item.label}</span>
                            <span className="font-inter text-sm font-bold text-black">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      {testResult.passed ? (
                          <button
                            onClick={() => {
                              setExamCompleted(true);
                              const nextLessonId = getNextLessonId();
                              if (nextLessonId) {
                                setSelectedLessonId(nextLessonId);
                                setActiveTab("qa");
                                showSuccess("Imtihon topshirildi! Keyingi darsga o'tildi.");
                              } else {
                                showSuccess("Siz kursning oxirgi darsini yakunladingiz!");
                              }
                            }}
                            className="font-inter rounded-lg bg-[#12B76A] px-7 py-2.5 text-sm font-semibold text-white"
                          >
                            Yakunlash
                          </button>
                        ) : (
                        <button
                          onClick={resetTestFlow}
                          className="font-inter rounded-lg bg-[#BC000D] px-7 py-2.5 text-sm font-semibold text-white"
                        >
                          {t("exam.retake")}
                        </button>
                      )}
                    </div>
                  ) : (
                    (() => {
                      const q = testQuestions[currentQ];
                      const options: { key: string; label: string }[] = [
                        { key: "variantA", label: q.variantA },
                        { key: "variantB", label: q.variantB },
                        { key: "variantC", label: q.variantC },
                        { key: "variantD", label: q.variantD },
                      ];
                      const selected = testAnswers[q.id];
                      const isLast = currentQ + 1 === testQuestions.length;
                      // MUHIM: bu endi private endpointdan blob sifatida yuklab
                      // olingan Object URL — resolveExamImageSrc/resolveFileSrc
                      // ORQALI EMAS, chunki bu fayl public emas (token talab qiladi).
                      const questionImageSrc = examQuestionImageUrl;

                      return (
                        <div>
                          <div className="mb-4">
                            <div className="mb-1.5 flex justify-between">
                              <span className="font-inter text-[13px] font-semibold text-black">
                                Savol: {currentQ + 1}/{testQuestions.length}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {testQuestions.map((tq, n) => (
                                <div
                                  key={tq.id}
                                  className="h-1.5 flex-1 rounded-[3px]"
                                  style={{
                                    background: testAnswers[tq.id]
                                      ? "#12B76A"
                                      : n === currentQ
                                      ? "#BC000D"
                                      : "#E0E3E6",
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="font-inter mb-3.5 text-sm font-semibold text-black">
                            {currentQ + 1}. {q.question}
                          </div>

                          {/* Mentor yuklagan savol rasmi (agar mavjud bo'lsa) */}
                          {q.image && examQuestionImageLoading && !questionImageSrc && (
                            <div className="font-inter mb-4 text-xs text-[#636C79]">
                              Rasm yuklanmoqda...
                            </div>
                            )}
                            {examQuestionImageError && (
                              <div className="font-inter mb-4 text-xs text-[#DC2626]">
                                {examQuestionImageError}
                              </div>
                            )}
                            {questionImageSrc && (
                              <div className="mb-4">
                                <img
                                  src={questionImageSrc}
                                  alt="Savol rasmi"
                                  className="max-h-[280px] w-auto max-w-full rounded-lg border border-[#E0E3E6] object-contain"
                                  onError={(e) => {
                                    console.error("Savol rasmi yuklanmadi:", questionImageSrc);
                                    setExamQuestionImageError("Rasmni ko'rsatishda xatolik yuz berdi.");
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                          {/* {questionImageSrc && (
                            <div className="mb-4">
                              <img
                                src={questionImageSrc}
                                alt="Savol rasmi"
                                className="max-h-[280px] w-auto max-w-full rounded-lg border border-[#E0E3E6] object-contain"
                                onError={(e) => {
                                  console.error("Savol rasmi yuklanmadi:", questionImageSrc);
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          )} */}

                          <div className="mb-4 flex flex-col gap-2">
                            {options.map((opt) => {
                              const isChecked = selected === opt.key;
                              return (
                                <label
                                  key={opt.key}
                                  className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 transition-all"
                                  style={{
                                    border: `1px solid ${isChecked ? "#BC000D" : "#E0E3E6"}`,
                                    background: isChecked ? "#FFF1F1" : "#fff",
                                  }}
                                >
                                  <span className="font-inter text-[13px] font-medium text-black">
                                    {opt.key.replace("variant", "")}) {opt.label}
                                  </span>
                                  <input
                                    type="radio"
                                    name={`test-q-${q.id}`}
                                    checked={isChecked}
                                    onChange={() => setTestAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                                    className="size-4"
                                    style={{ accentColor: "#BC000D" }}
                                  />
                                </label>
                              );
                            })}
                          </div>

                          <div className="flex justify-between gap-2.5">
                            <button
                              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
                              disabled={currentQ === 0}
                              className="font-inter rounded-lg bg-[#F0F1F2] px-5 py-2.5 text-[13px] font-medium text-black"
                              style={{
                                cursor: currentQ === 0 ? "not-allowed" : "pointer",
                                opacity: currentQ === 0 ? 0.5 : 1,
                              }}
                            >
                              Orqaga
                            </button>
                            {!isLast ? (
                              <button
                                disabled={!selected}
                                onClick={() => setCurrentQ((c) => c + 1)}
                                className="font-inter rounded-lg px-6 py-2.5 text-[13px] font-medium text-white"
                                style={{
                                  background: !selected ? "#F5C2C2" : "#BC000D",
                                  cursor: !selected ? "not-allowed" : "pointer",
                                }}
                              >
                                Keyingi →
                              </button>
                            ) : (
                              <button
                                disabled={!selected || testSubmitting}
                                onClick={handleSubmitTest}
                                className="font-inter rounded-lg px-6 py-2.5 text-[13px] font-medium text-white"
                                style={{
                                  background: !selected || testSubmitting ? "#F5C2C2" : "#BC000D",
                                  cursor: !selected || testSubmitting ? "not-allowed" : "pointer",
                                }}
                              >
                                {testSubmitting ? "Yuborilmoqda..." : "Yakunlash"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Ask modal ── */}
      {showAskModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAskModal(false);
          }}
        >
          <div className="w-full max-w-[500px] rounded-xl bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-inter text-base font-bold text-black sm:text-lg">
                Savol so&apos;rash
              </span>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-[#636C79]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="font-inter mb-2 text-sm text-[#636C79]">Savol matni</div>
            <QuestionRichEditor value={questionText} onChange={setQuestionText} />
            <div className="mt-3">
              <label className="font-inter inline-flex items-center gap-1.5 rounded-lg border border-[#E0E3E6] px-3.5 py-2 text-[13px] text-[#374151]">
                {questionFile ? questionFile.name : "Fayl biriktirish (ixtiyoriy)"}
                <input
                  type="file"
                  onChange={(e) => setQuestionFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            {questionError && (
              <div className="font-inter mt-2.5 text-[13px] text-[#DC2626]">{questionError}</div>
            )}

            <button
              onClick={handleAskSubmit}
              disabled={questionSubmitting || isQuestionEmpty(questionText)}
              className="font-inter mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#BC000D] px-6 py-2.5 text-sm font-medium text-white xs:w-auto"
              style={{
                cursor: questionSubmitting || isQuestionEmpty(questionText) ? "not-allowed" : "pointer",
                opacity: questionSubmitting || isQuestionEmpty(questionText) ? 0.6 : 1,
              }}
            >
              <Send size={15} />
              {questionSubmitting ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Warning Toast ── */}
      {showWarning && (
        <div className="fixed right-3 top-4 z-[9999] flex w-[calc(100vw-24px)] max-w-[360px] items-center gap-3 rounded-lg border border-[#E0E3E6] border-l-4 border-l-[#BC000D] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] xs:right-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#BC000D]">
            <span className="font-inter text-sm font-bold leading-none text-white">!</span>
          </div>
          <div className="flex-1">
            <div className="font-inter mb-1 text-sm font-bold leading-snug text-black">
              Siz moduldagi darslarni tugatmadingiz
            </div>
            <div className="font-inter text-[13px] leading-snug text-[#636C79]">
              Iltimos, to&apos;liq yakunlang va imtihon savollarini topshiring
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {showSuccessToast && (
        <div className="fixed right-3 top-4 z-[9999] flex w-[calc(100vw-24px)] max-w-[360px] items-center gap-3 rounded-lg border border-[#E0E3E6] border-l-4 border-l-[#12B76A] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] xs:right-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#12B76A]">
            <span className="font-inter text-sm font-bold leading-none text-white">✓</span>
          </div>
          <div className="flex-1">
            <div className="font-inter text-sm font-bold leading-snug text-black">
              {successToastMsg}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}