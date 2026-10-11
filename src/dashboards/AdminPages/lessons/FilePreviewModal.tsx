"use client";

import { useEffect, useState } from "react";
import { X, Download, FileText, Image as ImageIcon, Loader2, Video } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  return null;
}

type FilePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  fileName: string;
  lessonId: string;
  fileType: "video" | "file";
};

export function FilePreviewModal({ open, onClose, fileName, lessonId, fileType }: FilePreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !fileName) return;

    // Har gal modal ochilganda xatoliklarni va loading holatini tozalab tashlaymiz
    setLoading(true);
    setError(null);

    console.log("FilePreviewModal: open =", open, "fileName =", fileName, "lessonId =", lessonId);

    // Agar URL bo'lsa yoki lessonId berilmagan bo'lsa, blob orqali yuklamaymiz
    const isYoutube = fileName.includes("youtube") || fileName.includes("youtu.be");
    const isExternal = fileName.startsWith("http") || fileName.startsWith("www.") || isYoutube;
    if (isExternal || !lessonId) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchBlob = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          fileType === "video"
            ? `/files/private/video/${lessonId}/${fileName}`
            : `/files/private/lesson-file/${lessonId}/${fileName}`;

        console.log("Fetching private preview blob from:", endpoint);
        const res = await apiFetch(endpoint);
        if (!res.ok) {
          throw new Error(`Faylni yuklab bo'lmadi: status ${res.status}`);
        }
        const rawBlob = await res.blob();
        
        // Formulate correct MIME type based on extension to force correct rendering in browser
        const fileExt = fileName.split(".").pop()?.toLowerCase() ?? "";
        let mimeType = rawBlob.type;
        if (fileExt === "pdf") {
          mimeType = "application/pdf";
        } else if (["jpg", "jpeg"].includes(fileExt)) {
          mimeType = "image/jpeg";
        } else if (fileExt === "png") {
          mimeType = "image/png";
        } else if (fileExt === "gif") {
          mimeType = "image/gif";
        } else if (fileExt === "webp") {
          mimeType = "image/webp";
        } else if (fileExt === "svg") {
          mimeType = "image/svg+xml";
        } else if (fileType === "video" || ["mp4", "webm", "ogg", "mov", "avi"].includes(fileExt)) {
          mimeType = "video/mp4";
        }

        if (active) {
          const formattedBlob = new Blob([rawBlob], { type: mimeType });
          const localUrl = URL.createObjectURL(formattedBlob);
          setBlobUrl(localUrl);
        }
      } catch (err: any) {
        console.error("Private preview fetch error:", err);
        if (active) {
          setError(err.message || "Faylni yuklashda xatolik yuz berdi");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBlob();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    };
  }, [open, fileName, lessonId, fileType]);

  if (!open || !fileName) return null;

  const isPublicUrl = fileName.startsWith("http") || !lessonId;
  const publicUrl = fileName.startsWith("http") ? fileName : `/files/public/${fileName}`;
  const downloadUrl = isPublicUrl ? publicUrl : (blobUrl || "");

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const isVideo = fileType === "video" || ["mp4", "webm", "ogg", "mov", "avi"].includes(ext);
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);
  const isXls = ext === "xls" || ext === "xlsx";
  const isYoutube = fileName.includes("youtube") || fileName.includes("youtu.be");
  const youtubeEmbedUrl = isYoutube ? getYoutubeEmbedUrl(fileName) : null;
  const displayLabel = isYoutube || isVideo ? "Video" : isPdf ? "PDF" : isXls ? "Excel" : ext.toUpperCase() || "Fayl";

  const getEmbedUrl = () => {
    const activeUrl = isPublicUrl ? publicUrl : (blobUrl || "");
    if (isPdf) return activeUrl;
    if (isOffice && isPublicUrl) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const absoluteUrl = `${origin}${activeUrl}`;
      return `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    }
    return activeUrl;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 16, 23, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1000px",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #E0E3E6",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            {isPdf ? (
              <FileText size={20} color="#DC2626" />
            ) : isImage ? (
              <ImageIcon size={20} color="#2563EB" />
            ) : isVideo ? (
              <Video size={20} color="#7C3AED" />
            ) : (
              <FileText size={20} color="#16A34A" />
            )}
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                color: "#0D1017",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayLabel}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {downloadUrl && !isYoutube && (
              <a
                href={downloadUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  background: "#F3F4F6",
                  borderRadius: "8px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
              >
                <Download size={14} /> Yuklab olish
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#636C79",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, background: "#F9FAFB", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#636C79" }}>Fayl yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#DC2626", marginBottom: "16px" }}>
                {error}
              </p>
            </div>
          ) : isYoutube && youtubeEmbedUrl ? (
            <div style={{ width: "100%", height: "100%", background: "#000000" }}>
              <iframe
                src={youtubeEmbedUrl}
                title="YouTube video player"
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: "none" }}
              />
            </div>
          ) : isImage ? (
            <div style={{ padding: "24px", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
              <img
                src={downloadUrl || undefined}
                alt={fileName}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              />
            </div>
          ) : isVideo ? (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000000" }}>
              <video
                src={downloadUrl || undefined}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "100%", outline: "none" }}
              />
            </div>
          ) : isPdf || (isOffice && isPublicUrl) ? (
            <iframe
              src={getEmbedUrl() || undefined}
              title={fileName}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <FileText size={48} color="#9CA3AF" style={{ marginBottom: "16px" }} />
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#4B5563", marginBottom: "16px" }}>
                Ushbu fayl turini brauzerda to'g'ridan-to'g'ri ko'rish imkoni yo'q (Word/Excel)
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 20px",
                    background: "#BC000D",
                    borderRadius: "8px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                >
                  <Download size={16} /> Faylni yuklab olish
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
