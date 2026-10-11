"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  SlidersVertical,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Payment, PaymentFormData } from "./types";
import { DeleteModal } from "./DeleteModal";
import { PaymentModal } from "./PaymentModal";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { SuccessModal } from "./SuccessModal";
import { useLanguage } from "@/contexts/LanguageContext";

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s()+-]/g, "");
}

function getInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#DB2777"];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function formatAmount(amount: string) {
  const num = Number(amount);
  if (Number.isNaN(num)) return amount;
  return num.toLocaleString("uz-UZ").replace(/,/g, " ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Backend javobini frontend Payment shakliga moslashtiradi
function mapPayments(items: any[]): Payment[] {
  return items.map((item: any) => ({
    id: `${item.user?.id}-${item.course?.id}`,
    buyerName: item.user?.fullName || "Noma'lum",
    buyerAvatar: item.user?.image ? `${FILES_BASE_URL}/${item.user.image}` : undefined,
    buyerPhone: item.user?.phone || item.user?.phoneNumber || "-",
    courseName: item.course?.name || "Nomsiz kurs",
    direction: item.course?.category?.name || "",
    amount: formatAmount(item.amount || "0"),
    date: formatDate(item.purchasedAt),
    status: item.status === "COMPLETED" ? "To'landi" : "Kutilmoqda",
    paymentType: "",
    courseId: item.course?.id || "",
    userId: item.user?.id || 0,
  }));
}

// Backendda faqat shu 2 holat mavjud (COMPLETED / PENDING). PUT endpointi
// courseId+userId qabul qilib, ular orasida TOGGLE qiladi (target statusni
// qabul qilmaydi). "Rad etildi" backendda yo'q, shuning uchun u bilan
// almashtirish uchun backend chaqirilmaydi (faqat lokal holatda qoladi).
function isBackendToggleableStatus(status: Payment["status"]): status is "To'landi" | "Kutilmoqda" {
  return status === "To'landi" || status === "Kutilmoqda";
}

export function PaymentsList() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  // Success Notification state
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"add" | "edit">("add");

  // Tasdiqlash — har bir qator uchun alohida yuklanish holati va xato matni
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Ro'yxatni backenddan yuklash — qayta ishlatish uchun alohida funksiya.
  // silent=true bo'lsa, loading spinner butun jadvalni almashtirmaydi
  // (masalan bitta qatorni tasdiqlagandan keyin qayta yuklashda ishlatiladi).
  const fetchPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      
      const response = await apiFetch("/purchased-courses/students");
      if (response.ok) {
        const resData = await response.json();
        if (resData && Array.isArray(resData.data)) {
          setPayments(mapPayments(resData.data));
        }
      } else {
        const errBody = await response.text();
        console.error("purchased-courses/students xato:", response.status, errBody);
        throw new Error("To'lovlarni yuklashda xatolik yuz berdi.");
      }
    } catch (err: any) {
      console.error("Payments fetch error:", err);
      if (!silent) setError(err.message || "To'lovlarni yuklashda xatolik yuz berdi.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [reloadTrigger]);

  // Filtering
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = normalize(searchQuery);
      return (
        normalize(p.buyerName).includes(q) ||
        normalize(p.courseName).includes(q) ||
        normalize(p.direction).includes(q) ||
        normalize(p.buyerPhone || "").includes(q)
      );
    });
  }, [payments, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPayments = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, safePage, itemsPerPage]);

  const rangeStart = filteredPayments.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, filteredPayments.length);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Actions — hozircha faqat frontend local state (backend endpoint berilmagan)
  const handleAddPayment = (data: PaymentFormData) => {
    const newPayment: Payment = {
      id: String(Date.now()),
      buyerName: data.buyerName,
      buyerAvatar: undefined,
      buyerPhone: data.buyerPhone || "-",
      courseName: data.courseName,
      direction: data.direction,
      amount: data.amount,
      date: formatDate(new Date().toISOString()),
      status: data.status,
      paymentType: data.paymentType,
      courseId: "",
      userId: 0,
    };

    setPayments((prev) => [...prev, newPayment]);
    setIsAddOpen(false);
    setSuccessMessage("Muvaffaqiyatli qo'shildi");
    setSuccessType("add");
    setIsSuccessOpen(true);
  };

  // Tahrirlash modalidan saqlash. Agar "Holati" backendda mavjud bo'lgan
  // ikkita qiymat (To'landi / Kutilmoqda) orasida o'zgartirilgan bo'lsa —
  // xuddi jadvaldagi "Tasdiqlash" tugmasi kabi PUT /purchased-courses/status
  // chaqiriladi (bu endpoint faqat TOGGLE qiladi, shuning uchun target status
  // emas, courseId+userId yuboriladi), so'ng ro'yxat backenddan qayta
  // yuklanadi — shu bilan ekrandagi holat har doim backenddagi HAQIQIY
  // holat bilan bir xil bo'ladi. Boshqa maydonlar (kurs, narx va h.k.) uchun
  // backendda alohida endpoint berilmaganligi sababli ular faqat lokal
  // holatda yangilanadi.
  const handleEditPayment = async (data: PaymentFormData) => {
    if (!editingPaymentId) return;
    const original = payments.find((p) => p.id === editingPaymentId);
    if (!original) return;

    setEditError(null);

    const statusChanged = data.status !== original.status;
    const shouldToggleOnBackend =
      statusChanged &&
      isBackendToggleableStatus(data.status) &&
      isBackendToggleableStatus(original.status);

    setIsSavingEdit(true);
    try {
      if (shouldToggleOnBackend) {
        const response = await apiFetch("/purchased-courses/status", {
          method: "PUT",
          body: JSON.stringify({
            courseId: original.courseId,
            userId: original.userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Holatni o'zgartirishda xatolik yuz berdi");
        }

        // Backenddan haqiqiy holatni qayta yuklaymiz — taxmin qilinmaydi.
        await fetchPayments(true);
      } else {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === editingPaymentId
              ? {
                  ...p,
                  buyerName: data.buyerName,
                  buyerPhone: data.buyerPhone ?? p.buyerPhone,
                  courseName: data.courseName,
                  direction: data.direction,
                  amount: data.amount,
                  paymentType: data.paymentType,
                  status: data.status,
                }
              : p
          )
        );
      }

      setIsEditOpen(false);
      setEditingPaymentId(null);
      setSuccessMessage("Muvaffaqiyatli o'zgartirildi");
      setSuccessType("edit");
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("Edit payment error:", err);
      setEditError("Holatni o'zgartirishda xatolik yuz berdi.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingPaymentId) return;
    setPayments((prev) => prev.filter((p) => p.id !== deletingPaymentId));
    setIsDeleteOpen(false);
    setDeletingPaymentId(null);
    setSuccessMessage("Muvaffaqiyatli o'chirildi");
    setSuccessType("edit");
    setIsSuccessOpen(true);
  };

  // To'lovni tasdiqlash / tasdiqni bekor qilish — ikkala yo'nalishda ham
  // ishlaydigan TOGGLE tugma. Backend endpointi (PUT /purchased-courses/status)
  // faqat courseId+userId qabul qiladi va holatni o'zi ichkarida almashtiradi.
  // MUHIM: frontend statusni ENDI TAXMIN QILMAYDI. PUT muvaffaqiyatli
  // bo'lgach, ro'yxatni backenddan "jim" (silent) qayta so'raymiz — shunda
  // ekrandagi holat har doim backenddagi HAQIQIY holat bilan bir xil bo'ladi
  // va refresh qilinganda "asl holatga qaytish" muammosi butunlay yo'qoladi.
  const handleConfirmPayment = async (payment: Payment) => {
    setConfirmError(null);
    setConfirmingId(payment.id);

    try {
      const response = await apiFetch("/purchased-courses/status", {
        method: "PUT",
        body: JSON.stringify({
          courseId: payment.courseId,
          userId: payment.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("So'rov muvaffaqiyatsiz tugadi");
      }

      // Ro'yxatni backenddan qayta yuklaymiz — bu safar taxmin yo'q,
      // faqat backend qaytargan haqiqiy status ko'rsatiladi.
      await fetchPayments(true);

      setSuccessMessage(
        payment.status === "To'landi" ? "Tasdiq bekor qilindi" : "Muvaffaqiyatli tasdiqlandi"
      );
      setSuccessType("edit");
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("Payment confirm error:", err);
      setConfirmError(payment.id);
    } finally {
      setConfirmingId(null);
    }
  };

  const currentEditingPayment = useMemo(() => {
    if (!editingPaymentId) return undefined;
    return payments.find((p) => p.id === editingPaymentId);
  }, [editingPaymentId, payments]);

  // Export to Excel mock handler
  const handleExportXLS = () => {
    alert("Excel yuklab olish simulyatsiyasi: " + filteredPayments.length + " ta to'lov yuklab olindi.");
  };

  // Shared Pagination Controls Component
  const PaginationControls = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#374151" }}>
      <span style={{ marginRight: "4px", whiteSpace: "nowrap" }}>{t("pagination.perPage")}</span>
      <div style={{ marginRight: "12px", display: "inline-block" }}>
        <PageLimitDropdown
          value={itemsPerPage}
          onChange={(val: number) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {getVisiblePages(safePage, totalPages).map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} style={{ padding: "0 4px" }}>...</span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page as number)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: page === safePage ? "1px solid #E0E3E6" : "none",
              background: page === safePage ? "#ffffff" : "transparent",
              color: page === safePage ? "#0D1017" : "#636C79",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(safePage + 1)}
        disabled={safePage === totalPages}
        style={{
          height: "32px",
          borderRadius: "6px",
          border: "1px solid #E0E3E6",
          background: "transparent",
          cursor: safePage === totalPages ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          opacity: 1,
          color: "#0D1017",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          marginLeft: "4px",
        }}
      >
        {t("pagination.next")}
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0D1017] m-0">{t("payments.title")}</h1>
          <p className="text-xs md:text-sm text-[#374151] mt-1">
            {t("users.usersLabel")} <span className="mx-1">•</span> {t("payments.title")}
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            height: "40px",
            borderRadius: "8px",
            background: "#BC000D",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          className="self-end sm:self-auto"
        >
          <Plus size={16} /> {t("common.add")}
        </button>
      </div>

      {/* Search + Pagination — bitta qatorda (Figma va CoursesList.tsx kabi) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div style={{ position: "relative", width: "320px", flexShrink: 0 }}>
          <Search size={16} color="#636C79" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.search")}
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid #E0E3E6",
              borderRadius: "8px",
              paddingLeft: "40px",
              paddingRight: "40px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#0D1017",
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} color="#9CA3AF" />
            </button>
          ) : (
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <SlidersVertical size={16} color="#374151" />
            </span>
          )}
        </div>

        <PaginationControls />
      </div>

      {/* Main Table */}
      <div style={{ border: "1px solid #E0E3E6", borderRadius: "12px", overflowX: "auto", background: "#ffffff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6", width: "60px" }}>
                {t("table.id")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                {t("table.buyer")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                {t("table.phone")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                {t("table.courseName")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                {t("table.direction")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                {t("table.amount")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                {t("table.date")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6", width: "100px" }}>
                {t("table.status")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#0D1017", width: "140px", borderRight: "1px solid #E0E3E6" }}>
                {t("table.confirmation")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#0D1017", width: "110px" }}>
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ padding: "48px", textAlign: "center" }}>
                  <div style={{ display: "inline-block", width: "24px", height: "24px", borderRadius: "50%", border: "3px solid #E0E3E6", borderTopColor: "#2563EB", animation: "spin 1s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "#DC2626" }}>
                  {error}
                </td>
              </tr>
            ) : paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "#636C79" }}>
                  {t("common.noData")}
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p) => {
                const isPaid = p.status === "To'landi" || p.status === ("COMPLETED" as any);
                const isConfirming = confirmingId === p.id;

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #E0E3E6" }}>
                    <td style={{ padding: "16px", color: "#0D1017", fontWeight: 500, borderRight: "1px solid #E0E3E6" }}>
                      {p.userId}
                    </td>
                    <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {p.buyerAvatar ? (
                          <img
                            src={p.buyerAvatar}
                            alt={p.buyerName}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: getAvatarColor(p.buyerName),
                              color: "#ffffff",
                              fontWeight: 600,
                              fontSize: "13px",
                            }}
                          >
                            {getInitial(p.buyerName)}
                          </div>
                        )}
                        <span style={{ fontWeight: 500, color: "#0D1017" }}>{p.buyerName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px", color: "#636C79", borderRight: "1px solid #E0E3E6", whiteSpace: "nowrap" }}>
                      {p.buyerPhone || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "#636C79", borderRight: "1px solid #E0E3E6" }}>
                      {p.courseName}
                    </td>
                    <td style={{ padding: "16px", color: "#636C79", borderRight: "1px solid #E0E3E6" }}>
                      {p.direction}
                    </td>
                    <td style={{ padding: "16px", color: "#0D1017", fontWeight: 600, borderRight: "1px solid #E0E3E6" }}>
                      {p.amount}
                    </td>
                    <td style={{ padding: "16px", color: "#636C79", borderRight: "1px solid #E0E3E6" }}>
                      {p.date}
                    </td>
                    <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "100px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: isPaid ? "#F0FDF4" : "#FFFBEB",
                          color: isPaid ? "#16A34A" : "#D97706",
                          textAlign: "center",
                        }}
                      >
                        {isPaid ? t("status.approved") : t("status.pending")}
                      </span>
                    </td>
                    <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <button
                          onClick={() => !isConfirming && handleConfirmPayment(p)}
                          disabled={isConfirming}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            height: "32px",
                            padding: "0 12px",
                            borderRadius: "6px",
                            border: "1px solid",
                            borderColor: isPaid ? "#DCFCE7" : "#E0E3E6",
                            background: isPaid ? "#F0FDF4" : "#ffffff",
                            color: isPaid ? "#16A34A" : "#0D1017",
                            cursor: isConfirming ? "not-allowed" : "pointer",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            fontWeight: 500,
                            width: "100%",
                            opacity: isConfirming ? 0.6 : 1,
                          }}
                        >
                          {isConfirming ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          {isPaid ? t("status.approved") : t("common.confirm")}
                        </button>
                        {confirmError === p.id && (
                          <span style={{ fontSize: "11px", color: "#DC2626" }}>
                            Xatolik yuz berdi
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setEditError(null);
                            setEditingPaymentId(p.id);
                            setIsEditOpen(true);
                          }}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            border: "1px solid #E0E3E6",
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#636C79",
                          }}
                          title={t("common.edit")}
                        >
                          <Pencil size={14} color="#374151" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingPaymentId(p.id);
                            setIsDeleteOpen(true);
                          }}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            border: "1px solid #E0E3E6",
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#DC2626",
                          }}
                          title={t("common.delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#374151" }}>
          <span>
            {t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")} {filteredPayments.length}{t("pagination.items")}
          </span>
          <button
            onClick={handleExportXLS}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #E0E3E6",
              borderRadius: "6px",
              background: "#ffffff",
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#0D1017",
            }}
          >
            <div style={{ position: "relative", width: "14px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/images/admin/Page.png"
                alt="excel"
                style={{ width: "100%", height: "auto" }}
              />
              <span style={{
                position: "absolute",
                bottom: "2px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "5px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: "-0.2px",
              }}>XLS</span>
            </div>
            <span>({filteredPayments.length}) {t("pagination.downloadXls")}</span>
          </button>
        </div>
      </div>

      <PaymentModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        mode="add"
        onSubmit={handleAddPayment}
      />

      <PaymentModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditError(null);
        }}
        mode="edit"
        initialData={currentEditingPayment}
        onSubmit={handleEditPayment}
        submitting={isSavingEdit}
        errorMessage={editError}
      />

      <DeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <SuccessModal
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
        type={successType}
      />
    </div>
  );
}