export type MentorCourse = {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  category: string;
  categoryColorClass: string;
  rating: number;
  price: number;
};

// Kategoriya nomiga qarab teg rangini belgilaydi — loyihaning asosiy
// (--primary/--accent) ranglaridan tashqari, kategoriyalarni bir-biridan
// vizual ajratish uchun qo'shimcha rang palitrasi
export const categoryColors: Record<string, string> = {
  Frontend: "bg-orange-500",
  Backend: "bg-accent",
  "Grafik dizayn": "bg-rose-500",
  SMM: "bg-emerald-500",
  Marketing: "bg-violet-500",
};

export const mentorCourses: MentorCourse[] = [
  {
    id: "c1",
    mentorId: "1",
    title: "Frontend dasturlash",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    category: "Frontend",
    categoryColorClass: categoryColors.Frontend,
    rating: 4.5,
    price: 250000,
  },
  {
    id: "c2",
    mentorId: "1",
    title: "Grafik Dizayn",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    category: "Grafik dizayn",
    categoryColorClass: categoryColors["Grafik dizayn"],
    rating: 4.5,
    price: 250000,
  },
  {
    id: "c3",
    mentorId: "1",
    title: "Grafik Dizayn",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    category: "Grafik dizayn",
    categoryColorClass: categoryColors["Grafik dizayn"],
    rating: 4.5,
    price: 250000,
  },
  {
    id: "c4",
    mentorId: "1",
    title: "Grafik Dizayn",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    category: "Grafik dizayn",
    categoryColorClass: categoryColors["Grafik dizayn"],
    rating: 4.5,
    price: 250000,
  },
  {
    id: "c5",
    mentorId: "2",
    title: "Node.js asoslari",
    description: "Backend dunyosiga birinchi qadam — server, API va ma'lumotlar bazasi bilan ishlash",
    category: "Backend",
    categoryColorClass: categoryColors.Backend,
    rating: 4.8,
    price: 300000,
  },
];

export function getMentorCourses(mentorId: string): MentorCourse[] {
  return mentorCourses.filter((course) => course.mentorId === mentorId);
}

export function getMentorAverageRating(mentorId: string): number {
  const courses = getMentorCourses(mentorId);
  if (courses.length === 0) return 0;
  const total = courses.reduce((sum, course) => sum + course.rating, 0);
  return Math.round((total / courses.length) * 10) / 10;
}