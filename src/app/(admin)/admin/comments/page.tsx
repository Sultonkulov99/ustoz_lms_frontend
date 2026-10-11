import { CommentsList } from "@/dashboards/AdminPages/comments/CommentsList";

export const metadata = {
  title: "Izohlar | Admin Panel | ResearchBridge",
  description: "Foydalanuvchilar qoldirgan izohlar ro'yxati, tahrirlash va o'chirish.",
};

export default function CommentsPage() {
  return <CommentsList />;
}
