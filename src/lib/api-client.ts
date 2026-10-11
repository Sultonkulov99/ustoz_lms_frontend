import { API_BASE_URL, API_AUTH_URL } from "./config";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

function isTokenExpired(token: string): boolean {
  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return true;
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    if (payload && typeof payload.exp === 'number') {
      // Buffer of 10 seconds to be safe
      return Date.now() >= payload.exp * 1000 - 10000;
    }
  } catch (err) {
    return true;
  }
  return false;
}

async function handleTokenRefresh(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const refreshResponse = await fetch(`${API_AUTH_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      if (refreshData.accessToken) {
        localStorage.setItem("token", refreshData.accessToken);
        if (refreshData.refreshToken) {
          localStorage.setItem("refreshToken", refreshData.refreshToken);
        }
        return refreshData.accessToken;
      }
    }
    
    // Clear tokens if refresh failed
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    window.location.href = "/login";
  } catch (err) {
    console.error("Refresh token error:", err);
  }
  return null;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 1. Proactively check if token is expired before request
  if (token && isTokenExpired(token)) {
    const newToken = await handleTokenRefresh();
    if (newToken) {
      token = newToken;
    }
  }

  // FormData yuborilganda Content-Type qo'yilmaydi — brauzer o'zi
  // to'g'ri boundary bilan multipart/form-data headerini qo'shadi.
  // Aks holda (masalan rasm yuklashda) so'rov noto'g'ri formatlanadi.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...options.headers,
  } as Record<string, string>;

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: FetchOptions = {
    ...options,
    headers,
  };

  let url = endpoint;
  if (!url.startsWith("http")) {
    if (url.startsWith("/files/") || url.startsWith("files/")) {
      url = url.startsWith("/") ? url : `/${url}`;
    } else {
      url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (netErr: any) {
    console.error("Network error encountered:", netErr);
    throw netErr;
  }

  // 2. Refresh token if server returns 401
  if (response.status === 401 && typeof window !== "undefined") {
    const newToken = await handleTokenRefresh();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  // 3. Handle 500/502/503/504 errors nicely
  if (response.status >= 500 && response.status <= 504) {
    console.error(`Server error: ${response.status} ${response.statusText} at ${url}`);
  }

  return response;
}