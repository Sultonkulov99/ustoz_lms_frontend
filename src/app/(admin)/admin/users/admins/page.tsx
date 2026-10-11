import { AdminsList } from "@/dashboards/AdminPages/users/admins-list";

export const metadata = {
  title: "Administratorlar | Admin Panel | ResearchBridge",
  description: "Administratorlar ro'yxati.",
};

export default function AdminsPage() {
  return <AdminsList />;
}