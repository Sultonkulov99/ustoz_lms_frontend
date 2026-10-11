import { PaymentsList } from "@/dashboards/AdminPages/payments/PaymentsList";

export const metadata = {
  title: "To'lovlar | Admin Panel | ResearchBridge",
  description: "Foydalanuvchilar to'lovlari ro'yxati, yaratish, tahrirlash va o'chirish.",
};

export default function PaymentsPage() {
  return <PaymentsList />;
}
