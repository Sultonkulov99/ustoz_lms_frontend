export type Payment = {
  id: string;
  buyerName: string;
  buyerAvatar?: string;
  buyerPhone?: string;
  courseName: string;
  direction: string;
  amount: string;
  date: string;
  status: "To'landi" | "Kutilmoqda" | "Rad etildi";
  paymentType: string;
  courseId: string;
  userId: number;
};

export type PaymentFormData = {
  buyerName: string;
  buyerPhone?: string;
  courseName: string;
  direction: string;
  amount: string;
  paymentType: string;
  status: "To'landi" | "Kutilmoqda" | "Rad etildi";
};