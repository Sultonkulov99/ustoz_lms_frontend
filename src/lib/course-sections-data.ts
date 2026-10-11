export type CourseSection = {
  id: string;
  name: string;
  categoryId: string;
};

export const initialSections: CourseSection[] = [
  { id: "1", name: "Veb dasturlashga kirish", categoryId: "1" },
  { id: "2", name: "CSS asoslari", categoryId: "1" },
];