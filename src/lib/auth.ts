// JWT tokendan joriy foydalanuvchi ID'sini olish.
// Rating funksiyasida ishlatilgan mantiq bilan bir xil, endi umumiy joyga chiqarildi.
export function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? null;
  } catch {
    return null;
  }
}