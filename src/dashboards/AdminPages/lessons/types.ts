export type Material = {
  id: string;
  lessonTitle: string;
  description: string;
  files: ("Excel" | "PDF")[];
};

export type Task = {
  id: string;
  lessonTitle: string;
  taskTitle: string;
  files: ("Excel" | "PDF")[];
};

export type Exam = {
  id: string;
  lessonTitle: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  image?: string | null;
};

export type ExamFormData = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  image?: File | string | null;   // ← shu qatorni qo'shing
};

export type Lesson = {
  id: string;
  courseName: string;
  topic: string;
  description: string;
  videoFileName: string;
  videoFileSize: string;
  materials: Material[];
  tasks: Task[];
  exams: Exam[];
};

export type MaterialFormData = {
  description: string;
  files: ("Excel" | "PDF")[];
  lessonTitle?: string;
};

export type TaskFormData = {
  taskTitle: string;
  files: ("Excel" | "PDF")[];
  lessonTitle?: string;
};

// ─── API response type for lesson-files ───────────────────────────────────────
export type LessonFile = {
  id: number;
  file: string;          // filename, e.g. "pccf_d5a385c3...pdf"
  note: string;          // notes / izoh
  lesson: { name: string };
  createdAt: string;
};

// ─── API response type for homework ───────────────────────────────────────────
export type Homework = {
  id: number;
  task: string;
  file: string | null;
  lessonId: string;
  createdAt: string;
  lesson?: {
    id: string;
    name: string;
  };
};
