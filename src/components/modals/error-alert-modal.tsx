"use client";

type ErrorAlertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
};

export function ErrorAlertModal({
  open,
  onOpenChange,
  message,
  title = "Xatolik yuz berdi",
}: ErrorAlertModalProps) {
  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      // Diqqat: tashqariga bosilganda ATAYLAB yopilmaydi — foydalanuvchi
      // xato matnini o'qib, faqat OK tugmasi orqali yopishi mumkin.
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "48px 40px 40px",
          width: "380px",
          maxWidth: "90vw",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Outer halo + inner circle — qizil undov belgisi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "#FEE2E2",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#EF4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "36px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              !
            </span>
          </div>
        </div>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "17px",
            color: "#0D1017",
            marginBottom: "8px",
            lineHeight: 1.4,
          }}
        >
          {title}
        </p>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            color: "#636C79",
            marginBottom: "28px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleClose}
            style={{
              padding: "11px 40px",
              borderRadius: "8px",
              border: "none",
              background: "#EF4444",
              color: "#ffffff",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}