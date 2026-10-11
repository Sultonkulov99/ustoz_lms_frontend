import { StudentsList } from "@/dashboards/AdminPages/users/students-list";

export const metadata = {
  title: "O'quvchilar | Admin Panel | ResearchBridge",
  description: "O'quvchilar ro'yxati.",
};

export default function StudentsPage() {
  return <StudentsList />;
}