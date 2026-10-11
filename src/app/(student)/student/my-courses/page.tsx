import { StudentMyCourses } from "@/dashboards/StudentsPages/my-courses/StudentMyCourses";

export const metadata = {
  title: "Mening kurslarim | ResearchBridge",
  description: "O'zingizning kurslaringizni kuzating va davom ettiring.",
};

export default function MyCoursesPage() {
  return <StudentMyCourses />;
}
