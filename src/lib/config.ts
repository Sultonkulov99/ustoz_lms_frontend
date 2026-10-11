export const API_BASE_URL = "/api";
export const API_AUTH_URL = `${API_BASE_URL}/auth`;
export const FILES_BASE_URL = "/files/public";

// WebSocket uchun to'g'ridan-to'g'ri backend manzili kerak (rewrites orqali emas)
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.researchbridge.uz";