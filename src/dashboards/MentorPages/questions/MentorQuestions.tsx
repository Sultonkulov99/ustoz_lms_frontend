// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { apiFetch } from "@/lib/api-client";
// import { getCurrentUserId } from "@/lib/auth";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useQuestionsSocket } from "@/lib/questions-socket";
// import { Search, ChevronDown, Send, Paperclip, X } from "lucide-react";

// const FILES_BASE_URL = "/files/public";

// type Course = {
//   id: string;
//   name: string;
// };

// type QuestionAnswer = {
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
// };

// type Question = {
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
// };

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

// export function MentorQuestions() {
//   const { t } = useLanguage();
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   // Notification'dan kelgan deep-link parametrlari — har safar URL o'zgarganda
//   // (sahifa allaqachon ochiq bo'lsa ham) qayta ishlaydi.
//   const lastHandledDeepLinkRef = useRef<string | null>(null);

//   const [courses, setCourses] = useState<Course[]>([]);
//   const [coursesLoading, setCoursesLoading] = useState(true);
//   const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
//   const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [questionsLoading, setQuestionsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
//   const [answerText, setAnswerText] = useState("");
//   const [answerFile, setAnswerFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [sending, setSending] = useState(false);

//   const { socket, connected } = useQuestionsSocket(selectedCourseId);
//   const listEndRef = useRef<HTMLDivElement>(null);

//   // O'z kurslarini yuklash
//   useEffect(() => {
//     const fetchMyCourses = async () => {
//       setCoursesLoading(true);
//       const myId = getCurrentUserId();
//       if (!myId) {
//         setCoursesLoading(false);
//         return;
//       }
//       try {
//         const res = await apiFetch(`/courses/my?offset=0&limit=100`);
//         if (res.ok) {
//           const resData = await res.json();
//           const list: Course[] = Array.isArray(resData?.data)
//             ? resData.data.map((c: any) => ({ id: c.id, name: c.name }))
//             : [];
//           setCourses(list);
//           if (list.length > 0) setSelectedCourseId(list[0].id);
//         }
//       } catch (err) {
//         console.error("Mentor courses fetch error:", err);
//       } finally {
//         setCoursesLoading(false);
//       }
//     };
//     fetchMyCourses();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Tanlangan kurs bo'yicha savollarni yuklash
//   useEffect(() => {
//     if (!selectedCourseId) return;
//     const fetchQuestions = async () => {
//       setQuestionsLoading(true);
//       setError(null);
//       try {
//         const res = await apiFetch(
//           `/questions/course/${selectedCourseId}?offset=0&limit=50`
//         );
//         if (res.ok) {
//           const resData = await res.json();
//           const list: Question[] = Array.isArray(resData?.data) ? resData.data : [];
//           setQuestions(list);
//           setSelectedQuestionId(null);
//         } else {
//           setError(t("table.noDataFound"));
//         }
//       } catch (err) {
//         console.error("Questions fetch error:", err);
//         setError(t("table.noDataFound"));
//       } finally {
//         setQuestionsLoading(false);
//       }
//     };
//     fetchQuestions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCourseId]);

//   // Notification'dan deep-link orqali kelganda — URL har o'zgarganda ishlaydi,
//   // sahifa allaqachon ochiq turgan bo'lsa ham (mount bo'lishini kutmaydi).
//   useEffect(() => {
//     const courseId = searchParams.get("courseId");
//     const questionId = searchParams.get("questionId");
//     if (!courseId || !questionId) return;

//     const linkKey = `${courseId}:${questionId}`;
//     if (lastHandledDeepLinkRef.current === linkKey) return; // shu link allaqachon ishlangan

//     // Kerakli kurs hali tanlanmagan bo'lsa — avval kursni almashtiramiz,
//     // savollar yuklangach shu effekt qayta ishga tushadi (questions o'zgarganda).
//     if (courseId !== selectedCourseId) {
//       setSelectedCourseId(courseId);
//       return;
//     }

//     const target = questions.find((q) => q.id === Number(questionId));
//     if (!target) return; // hali yuklanmagan bo'lishi mumkin, keyingi renderda qayta tekshiriladi

//     lastHandledDeepLinkRef.current = linkKey;
//     setSelectedQuestionId(target.id);
//     if (!target.read) {
//       apiFetch(`/questions/read/${target.id}`, { method: "POST" }).catch(() => {});
//       setQuestions((prev) =>
//         prev.map((item) => (item.id === target.id ? { ...item, read: true } : item))
//       );
//     }
//     router.replace("/mentor/questions");
//   }, [searchParams, selectedCourseId, questions, router]);

//   // Real-time: yangi savol va javoblarni tinglash
//   useEffect(() => {
//     if (!socket) return;

//     const onNewQuestion = (question: Question) => {
//       setQuestions((prev) => [question, ...prev]);
//     };

//     const onNewAnswer = (answer: QuestionAnswer & { questionId?: number }) => {
//       setQuestions((prev) =>
//         prev.map((q) =>
//           q.id === (answer as any).questionId ? { ...q, answer, read: true } : q
//         )
//       );
//     };

//     socket.on("newQuestion", onNewQuestion);
//     socket.on("newAnswer", onNewAnswer);

//     return () => {
//       socket.off("newQuestion", onNewQuestion);
//       socket.off("newAnswer", onNewAnswer);
//     };
//   }, [socket]);

//   const filteredQuestions = questions.filter((q) => {
//     const query = searchQuery.toLowerCase().trim();
//     if (!query) return true;
//     return (
//       q.from.fullName.toLowerCase().includes(query) ||
//       q.text.toLowerCase().includes(query)
//     );
//   });

//   const selectedCourse = courses.find((c) => c.id === selectedCourseId);
//   const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

//   const handleSelectQuestion = async (q: Question) => {
//     setSelectedQuestionId(q.id);
//     if (!q.read) {
//       try {
//         await apiFetch(`/questions/read/${q.id}`, { method: "POST" });
//         setQuestions((prev) =>
//           prev.map((item) => (item.id === q.id ? { ...item, read: true } : item))
//         );
//       } catch (err) {
//         console.error("Read question error:", err);
//       }
//     }
//   };

//   const handleSendAnswer = async () => {
//     if (!selectedQuestionId || (!answerText.trim() && !answerFile) || sending) return;
//     setSending(true);
//     try {
//       const formData = new FormData();
//       formData.append("text", answerText.trim() || " ");
//       if (answerFile) {
//         formData.append("file", answerFile);
//       }
//       const res = await apiFetch(`/questions/answer/${selectedQuestionId}`, {
//         method: "POST",
//         body: formData,
//       });
//       if (res.ok) {
//         const answer = await res.json();
//         setQuestions((prev) =>
//           prev.map((q) =>
//             q.id === selectedQuestionId ? { ...q, answer, read: true } : q
//           )
//         );
//         setAnswerText("");
//         setAnswerFile(null);
//       }
//     } catch (err) {
//       console.error("Send answer error:", err);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="font-inter flex h-full flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-[#0D1017] sm:text-2xl">
//             {t("sidebar.qa")}
//           </h1>
//           <p className="mt-1 text-xs text-[#374151] sm:text-[13px]">
//             {selectedCourse?.name || ""}
//           </p>
//         </div>
//         <div className="flex items-center gap-1.5 text-xs font-medium">
//           <span
//             className="size-2 rounded-full"
//             style={{ background: connected ? "#16A34A" : "#DC2626" }}
//           />
//           <span style={{ color: connected ? "#16A34A" : "#DC2626" }}>
//             {connected ? "online" : "offline"}
//           </span>
//         </div>
//       </div>

//       {/* Kurs tanlash */}
//       <div className="relative w-full sm:w-80">
//         <button
//           onClick={() => setCourseDropdownOpen((v) => !v)}
//           disabled={coursesLoading || courses.length === 0}
//           className="flex h-11 w-full items-center justify-between rounded-lg border border-[#E0E3E6] bg-white px-3.5 text-sm text-[#0D1017] disabled:cursor-not-allowed"
//         >
//           <span className="truncate">
//             {coursesLoading
//               ? t("common.loading")
//               : selectedCourse?.name || t("common.selectCourse")}
//           </span>
//           <ChevronDown
//             size={16}
//             color="#636C79"
//             className="shrink-0 transition-transform duration-200"
//             style={{ transform: courseDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
//           />
//         </button>

//         {courseDropdownOpen && (
//           <>
//             <div
//               onClick={() => setCourseDropdownOpen(false)}
//               className="fixed inset-0 z-[999]"
//             />
//             <div className="absolute left-0 right-0 top-full z-[1000] mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-[#E0E3E6] bg-white py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
//               {courses.length === 0 ? (
//                 <div className="px-3.5 py-2.5 text-[13px] text-[#9CA3AF]">
//                   {t("common.noCoursesFound")}
//                 </div>
//               ) : (
//                 courses.map((c) => (
//                   <div
//                     key={c.id}
//                     onClick={() => {
//                       setSelectedCourseId(c.id);
//                       setCourseDropdownOpen(false);
//                     }}
//                     className="cursor-pointer px-3.5 py-2.5 text-sm"
//                     style={{
//                       color: c.id === selectedCourseId ? "#2563EB" : "#0D1017",
//                       background: c.id === selectedCourseId ? "#F3F4F6" : "#ffffff",
//                       fontWeight: c.id === selectedCourseId ? 600 : 500,
//                     }}
//                   >
//                     {c.name}
//                   </div>
//                 ))
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Ikki panelli: savollar ro'yxati + suhbat oynasi */}
//       <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
//         {/* Savollar ro'yxati */}
//         <div className="flex w-full flex-col rounded-xl border border-[#E0E3E6] bg-white lg:w-[360px] lg:shrink-0">
//           <div className="border-b border-[#E0E3E6] p-3">
//             <div className="relative">
//               <Search
//                 size={16}
//                 color="#636C79"
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//               />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder={t("common.searchPlaceholder")}
//                 className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-4 text-sm text-[#0D1017] outline-none"
//               />
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             {questionsLoading ? (
//               <div className="flex justify-center py-10">
//                 <div className="size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
//               </div>
//             ) : error ? (
//               <div className="px-4 py-8 text-center text-sm text-[#DC2626]">{error}</div>
//             ) : filteredQuestions.length === 0 ? (
//               <div className="px-4 py-8 text-center text-sm text-[#636C79]">
//                 {t("table.noDataFound")}
//               </div>
//             ) : (
//               filteredQuestions.map((q) => (
//                 <div
//                   key={q.id}
//                   onClick={() => handleSelectQuestion(q)}
//                   className="flex cursor-pointer items-start gap-3 border-b border-[#F0F1F2] px-4 py-3.5"
//                   style={{
//                     background: q.id === selectedQuestionId ? "#F3F4F6" : "#ffffff",
//                   }}
//                 >
//                   <div
//                     className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
//                     style={{ background: getAvatarColor(q.from.fullName) }}
//                   >
//                     {q.from.image ? (
//                       <img
//                         src={`${FILES_BASE_URL}/${q.from.image}`}
//                         alt={q.from.fullName}
//                         className="absolute inset-0 h-full w-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-xs font-bold text-white">
//                         {getInitial(q.from.fullName)}
//                       </span>
//                     )}
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center justify-between gap-2">
//                       <p className="truncate text-sm font-semibold text-[#0D1017]">
//                         {q.from.fullName}
//                       </p>
//                       {!q.read && (
//                         <span className="size-2 shrink-0 rounded-full bg-[#2563EB]" />
//                       )}
//                     </div>
//                     <p className="mt-0.5 truncate text-xs text-[#636C79]">{q.text}</p>
//                     <p className="mt-1 text-[11px] text-[#9CA3AF]">
//                       {formatDate(q.createdAt)}
//                       {q.answer && (
//                         <span className="ml-2 font-medium text-[#16A34A]">
//                           {t("common.answered") || "Javob berilgan"}
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Suhbat oynasi */}
//         <div className="flex flex-1 flex-col rounded-xl border border-[#E0E3E6] bg-white">
//           {!selectedQuestion ? (
//             <div className="flex flex-1 items-center justify-center text-sm text-[#636C79]">
//               {t("common.selectCourse") ? "Savolni tanlang" : "Savolni tanlang"}
//             </div>
//           ) : (
//             <>
//               <div className="border-b border-[#E0E3E6] px-4 py-3.5">
//                 <p className="text-sm font-semibold text-[#0D1017]">
//                   {selectedQuestion.from.fullName}
//                 </p>
//               </div>

//               <div className="flex-1 space-y-4 overflow-y-auto p-4">
//                 {/* Savol - chap tomonda */}
//                 <div className="flex items-start gap-2.5">
//                   <div
//                     className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
//                     style={{ background: getAvatarColor(selectedQuestion.from.fullName) }}
//                   >
//                     {getInitial(selectedQuestion.from.fullName)}
//                   </div>
//                   <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[#F3F4F6] px-4 py-2.5">
//                     <p className="text-sm text-[#0D1017]">{selectedQuestion.text}</p>
//                     {selectedQuestion.file && (
//                       <a
//                         href={`${FILES_BASE_URL}/${selectedQuestion.file}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         download={selectedQuestion.file.split("/").pop()}
//                         className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#2563EB] underline"
//                       >
//                         <Paperclip size={13} />
//                         {selectedQuestion.file.split("/").pop()}
//                       </a>
//                     )}
//                     <p className="mt-1 text-[11px] text-[#9CA3AF]">
//                       {formatDate(selectedQuestion.createdAt)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Javob - o'ng tomonda */}
//                 {selectedQuestion.answer && (
//                   <div className="flex items-start justify-end gap-2.5">
//                     <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[#2563EB] px-4 py-2.5">
//                       <p className="text-sm text-white">{selectedQuestion.answer.text}</p>
//                       {selectedQuestion.answer.file && (
//                         <a
//                           href={`${FILES_BASE_URL}/${selectedQuestion.answer.file}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           download={selectedQuestion.answer.file.split("/").pop()}
//                           className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white underline"
//                         >
//                           <Paperclip size={13} />
//                           {selectedQuestion.answer.file.split("/").pop()}
//                         </a>
//                       )}
//                       <p className="mt-1 text-[11px] text-[#DBEAFE]">
//                         {formatDate(selectedQuestion.answer.createdAt)}
//                       </p>
//                     </div>
//                     <div
//                       className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
//                       style={{ background: getAvatarColor(selectedQuestion.answer.answeredBy.fullName) }}
//                     >
//                       {getInitial(selectedQuestion.answer.answeredBy.fullName)}
//                     </div>
//                   </div>
//                 )}
//                 <div ref={listEndRef} />
//               </div>

//               {/* Javob yozish - faqat javob hali yo'q bo'lsa */}
//               {!selectedQuestion.answer && (
//               <div className="border-t border-[#E0E3E6] p-3">
//                 {answerFile && (
//                   <div className="mb-2 flex items-center justify-between rounded-lg bg-[#F3F4F6] px-3 py-2 text-xs">
//                     <span className="truncate text-[#0D1017]">{answerFile.name}</span>
//                     <button onClick={() => setAnswerFile(null)} className="shrink-0 text-[#DC2626]">
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-2">
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     className="hidden"
//                     onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
//                   />
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#E0E3E6] text-[#636C79]"
//                   >
//                     <Paperclip size={18} />
//                   </button>
//                   <input
//                     type="text"
//                     value={answerText}
//                     onChange={(e) => setAnswerText(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") handleSendAnswer();
//                     }}
//                     placeholder="Javob yozing..."
//                     className="font-inter h-11 flex-1 rounded-lg border border-[#E0E3E6] bg-white px-4 text-sm text-[#0D1017] outline-none"
//                   />
//                   <button
//                     onClick={handleSendAnswer}
//                     disabled={(!answerText.trim() && !answerFile) || sending}
//                     className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white disabled:cursor-not-allowed disabled:opacity-40"
//                   >
//                     <Send size={18} />
//                   </button>
//                 </div>
//               </div>
//             )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUserId } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuestionsSocket } from "@/lib/questions-socket";
import { Search, ChevronDown, Send, Paperclip, X } from "lucide-react";
import DOMPurify from "dompurify";

const FILES_BASE_URL = "/files/public";

type Course = {
  id: string;
  name: string;
};

type QuestionAnswer = {
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
};

type Question = {
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
};

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

// Savol matni endi rich-text (HTML) bo'lishi mumkin — qisqa preview qatorida
// (ro'yxatda) va qidiruvda teglarsiz, oddiy matn ko'rinishida ishlatiladi.
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function MentorQuestions() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Notification'dan kelgan deep-link parametrlari — har safar URL o'zgarganda
  // (sahifa allaqachon ochiq bo'lsa ham) qayta ishlaydi.
  const lastHandledDeepLinkRef = useRef<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);

  const { socket, connected } = useQuestionsSocket(selectedCourseId);
  const listEndRef = useRef<HTMLDivElement>(null);

  // O'z kurslarini yuklash
  useEffect(() => {
    const fetchMyCourses = async () => {
      setCoursesLoading(true);
      const myId = getCurrentUserId();
      if (!myId) {
        setCoursesLoading(false);
        return;
      }
      try {
        const res = await apiFetch(`/courses/my?offset=0&limit=100`);
        if (res.ok) {
          const resData = await res.json();
          const list: Course[] = Array.isArray(resData?.data)
            ? resData.data.map((c: any) => ({ id: c.id, name: c.name }))
            : [];
          setCourses(list);
          if (list.length > 0) setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error("Mentor courses fetch error:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tanlangan kurs bo'yicha savollarni yuklash
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      setError(null);
      try {
        const res = await apiFetch(
          `/questions/course/${selectedCourseId}?offset=0&limit=50`
        );
        if (res.ok) {
          const resData = await res.json();
          const list: Question[] = Array.isArray(resData?.data) ? resData.data : [];
          setQuestions(list);
          setSelectedQuestionId(null);
        } else {
          setError(t("table.noDataFound"));
        }
      } catch (err) {
        console.error("Questions fetch error:", err);
        setError(t("table.noDataFound"));
      } finally {
        setQuestionsLoading(false);
      }
    };
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  // Notification'dan deep-link orqali kelganda — URL har o'zgarganda ishlaydi,
  // sahifa allaqachon ochiq turgan bo'lsa ham (mount bo'lishini kutmaydi).
  useEffect(() => {
    const courseId = searchParams.get("courseId");
    const questionId = searchParams.get("questionId");
    if (!courseId || !questionId) return;

    const linkKey = `${courseId}:${questionId}`;
    if (lastHandledDeepLinkRef.current === linkKey) return; // shu link allaqachon ishlangan

    // Kerakli kurs hali tanlanmagan bo'lsa — avval kursni almashtiramiz,
    // savollar yuklangach shu effekt qayta ishga tushadi (questions o'zgarganda).
    if (courseId !== selectedCourseId) {
      setSelectedCourseId(courseId);
      return;
    }

    const target = questions.find((q) => q.id === Number(questionId));
    if (!target) return; // hali yuklanmagan bo'lishi mumkin, keyingi renderda qayta tekshiriladi

    lastHandledDeepLinkRef.current = linkKey;
    setSelectedQuestionId(target.id);
    if (!target.read) {
      apiFetch(`/questions/read/${target.id}`, { method: "POST" }).catch(() => {});
      setQuestions((prev) =>
        prev.map((item) => (item.id === target.id ? { ...item, read: true } : item))
      );
    }
    router.replace("/mentor/questions");
  }, [searchParams, selectedCourseId, questions, router]);

  // Real-time: yangi savol va javoblarni tinglash
  useEffect(() => {
    if (!socket) return;

    const onNewQuestion = (question: Question) => {
      setQuestions((prev) => [question, ...prev]);
    };

    const onNewAnswer = (answer: QuestionAnswer & { questionId?: number }) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === (answer as any).questionId ? { ...q, answer, read: true } : q
        )
      );
    };

    socket.on("newQuestion", onNewQuestion);
    socket.on("newAnswer", onNewAnswer);

    return () => {
      socket.off("newQuestion", onNewQuestion);
      socket.off("newAnswer", onNewAnswer);
    };
  }, [socket]);

  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      q.from.fullName.toLowerCase().includes(query) ||
      stripHtml(q.text).toLowerCase().includes(query)
    );
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  const handleSelectQuestion = async (q: Question) => {
    setSelectedQuestionId(q.id);
    if (!q.read) {
      try {
        await apiFetch(`/questions/read/${q.id}`, { method: "POST" });
        setQuestions((prev) =>
          prev.map((item) => (item.id === q.id ? { ...item, read: true } : item))
        );
      } catch (err) {
        console.error("Read question error:", err);
      }
    }
  };

  const handleSendAnswer = async () => {
    if (!selectedQuestionId || (!answerText.trim() && !answerFile) || sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", answerText.trim() || " ");
      if (answerFile) {
        formData.append("file", answerFile);
      }
      const res = await apiFetch(`/questions/answer/${selectedQuestionId}`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const answer = await res.json();
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === selectedQuestionId ? { ...q, answer, read: true } : q
          )
        );
        setAnswerText("");
        setAnswerFile(null);
      }
    } catch (err) {
      console.error("Send answer error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="font-inter flex h-full flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0D1017] sm:text-2xl">
            {t("sidebar.qa")}
          </h1>
          <p className="mt-1 text-xs text-[#374151] sm:text-[13px]">
            {selectedCourse?.name || ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className="size-2 rounded-full"
            style={{ background: connected ? "#16A34A" : "#DC2626" }}
          />
          <span style={{ color: connected ? "#16A34A" : "#DC2626" }}>
            {connected ? "online" : "offline"}
          </span>
        </div>
      </div>

      {/* Kurs tanlash */}
      <div className="relative w-full sm:w-80">
        <button
          onClick={() => setCourseDropdownOpen((v) => !v)}
          disabled={coursesLoading || courses.length === 0}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-[#E0E3E6] bg-white px-3.5 text-sm text-[#0D1017] disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {coursesLoading
              ? t("common.loading")
              : selectedCourse?.name || t("common.selectCourse")}
          </span>
          <ChevronDown
            size={16}
            color="#636C79"
            className="shrink-0 transition-transform duration-200"
            style={{ transform: courseDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {courseDropdownOpen && (
          <>
            <div
              onClick={() => setCourseDropdownOpen(false)}
              className="fixed inset-0 z-[999]"
            />
            <div className="absolute left-0 right-0 top-full z-[1000] mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-[#E0E3E6] bg-white py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              {courses.length === 0 ? (
                <div className="px-3.5 py-2.5 text-[13px] text-[#9CA3AF]">
                  {t("common.noCoursesFound")}
                </div>
              ) : (
                courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      setCourseDropdownOpen(false);
                    }}
                    className="cursor-pointer px-3.5 py-2.5 text-sm"
                    style={{
                      color: c.id === selectedCourseId ? "#2563EB" : "#0D1017",
                      background: c.id === selectedCourseId ? "#F3F4F6" : "#ffffff",
                      fontWeight: c.id === selectedCourseId ? 600 : 500,
                    }}
                  >
                    {c.name}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Ikki panelli: savollar ro'yxati + suhbat oynasi */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        {/* Savollar ro'yxati */}
        <div className="flex w-full flex-col rounded-xl border border-[#E0E3E6] bg-white lg:w-[360px] lg:shrink-0">
          <div className="border-b border-[#E0E3E6] p-3">
            <div className="relative">
              <Search
                size={16}
                color="#636C79"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.searchPlaceholder")}
                className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-4 text-sm text-[#0D1017] outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {questionsLoading ? (
              <div className="flex justify-center py-10">
                <div className="size-6 animate-spin rounded-full border-[3px] border-[#E0E3E6] border-t-[#2563EB]" />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-[#DC2626]">{error}</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#636C79]">
                {t("table.noDataFound")}
              </div>
            ) : (
              filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className="flex cursor-pointer items-start gap-3 border-b border-[#F0F1F2] px-4 py-3.5"
                  style={{
                    background: q.id === selectedQuestionId ? "#F3F4F6" : "#ffffff",
                  }}
                >
                  <div
                    className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ background: getAvatarColor(q.from.fullName) }}
                  >
                    {q.from.image ? (
                      <img
                        src={`${FILES_BASE_URL}/${q.from.image}`}
                        alt={q.from.fullName}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {getInitial(q.from.fullName)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#0D1017]">
                        {q.from.fullName}
                      </p>
                      {!q.read && (
                        <span className="size-2 shrink-0 rounded-full bg-[#2563EB]" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#636C79]">{stripHtml(q.text)}</p>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">
                      {formatDate(q.createdAt)}
                      {q.answer && (
                        <span className="ml-2 font-medium text-[#16A34A]">
                          {t("common.answered") || "Javob berilgan"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suhbat oynasi */}
        <div className="flex flex-1 flex-col rounded-xl border border-[#E0E3E6] bg-white">
          {!selectedQuestion ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#636C79]">
              {t("common.selectCourse") ? "Savolni tanlang" : "Savolni tanlang"}
            </div>
          ) : (
            <>
              <div className="border-b border-[#E0E3E6] px-4 py-3.5">
                <p className="text-sm font-semibold text-[#0D1017]">
                  {selectedQuestion.from.fullName}
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {/* Savol - chap tomonda */}
                <div className="flex items-start gap-2.5">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: getAvatarColor(selectedQuestion.from.fullName) }}
                  >
                    {getInitial(selectedQuestion.from.fullName)}
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[#F3F4F6] px-4 py-2.5">
                    <div
                      className="text-sm text-[#0D1017] [&_code]:rounded [&_code]:bg-white [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_p]:m-0"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedQuestion.text) }}
                    />
                    {selectedQuestion.file && (
                      <a
                        href={`${FILES_BASE_URL}/${selectedQuestion.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedQuestion.file.split("/").pop()}
                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#2563EB] underline"
                      >
                        <Paperclip size={13} />
                        {selectedQuestion.file.split("/").pop()}
                      </a>
                    )}
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">
                      {formatDate(selectedQuestion.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Javob - o'ng tomonda */}
                {selectedQuestion.answer && (
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[#2563EB] px-4 py-2.5">
                      <p className="text-sm text-white">{selectedQuestion.answer.text}</p>
                      {selectedQuestion.answer.file && (
                        <a
                          href={`${FILES_BASE_URL}/${selectedQuestion.answer.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={selectedQuestion.answer.file.split("/").pop()}
                          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white underline"
                        >
                          <Paperclip size={13} />
                          {selectedQuestion.answer.file.split("/").pop()}
                        </a>
                      )}
                      <p className="mt-1 text-[11px] text-[#DBEAFE]">
                        {formatDate(selectedQuestion.answer.createdAt)}
                      </p>
                    </div>
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: getAvatarColor(selectedQuestion.answer.answeredBy.fullName) }}
                    >
                      {getInitial(selectedQuestion.answer.answeredBy.fullName)}
                    </div>
                  </div>
                )}
                <div ref={listEndRef} />
              </div>

              {/* Javob yozish - faqat javob hali yo'q bo'lsa */}
              {!selectedQuestion.answer && (
              <div className="border-t border-[#E0E3E6] p-3">
                {answerFile && (
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-[#F3F4F6] px-3 py-2 text-xs">
                    <span className="truncate text-[#0D1017]">{answerFile.name}</span>
                    <button onClick={() => setAnswerFile(null)} className="shrink-0 text-[#DC2626]">
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#E0E3E6] text-[#636C79]"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendAnswer();
                    }}
                    placeholder="Javob yozing..."
                    className="font-inter h-11 flex-1 rounded-lg border border-[#E0E3E6] bg-white px-4 text-sm text-[#0D1017] outline-none"
                  />
                  <button
                    onClick={handleSendAnswer}
                    disabled={(!answerText.trim() && !answerFile) || sending}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}