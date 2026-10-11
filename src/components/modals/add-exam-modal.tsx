"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ExamFormData = {
  question: string;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  answer: "variantA" | "variantB" | "variantC" | "variantD";
  /** Yangi tanlangan fayl. null = o'zgarishsiz (edit rejimida) yoki rasm yo'q (create). */
  image: File | null;
  /** Faqat edit rejimida ishlatiladi: true bo'lsa, mavjud rasm o'chiriladi
   *  (backend'ga bo'sh "image" maydoni yuboriladi). */
  removeImage?: boolean;
};

const emptyForm: ExamFormData = {
  question: "",
  variantA: "",
  variantB: "",
  variantC: "",
  variantD: "",
  answer: "variantA",
  image: null,
  removeImage: false,
};

/** Tahrirlash rejimida modalga uzatiladigan boshlang'ich ma'lumot. */
export type ExamEditData = {
  id: string;
  question: string;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  answer: "variantA" | "variantB" | "variantC" | "variantD";
  /** Mavjud rasmni preview qilish uchun to'liq/ishlaydigan URL (yoki null). */
  imageUrl: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tahrirlash rejimi uchun: mavjud savol ma'lumoti. null/undefined bo'lsa — "qo'shish" rejimi. */
  editData?: ExamEditData | null;
  /** Muvaffaqiyatli bo'lsa hech narsa qaytarmasin. Xato bo'lsa
   *  `throw new Error(message)` qiling — shunda modal ochiq qoladi
   *  va xato shu yerda ko'rsatiladi. */
  onSubmit: (data: ExamFormData) => Promise<void>;
};

const ANSWER_OPTIONS: { value: ExamFormData["answer"]; label: string }[] = [
  { value: "variantA", label: "A varianti" },
  { value: "variantB", label: "B varianti" },
  { value: "variantC", label: "C varianti" },
  { value: "variantD", label: "D varianti" },
];

// Backend'dan (class-validator) kelgan xato xabarlarini o'zbek tiliga o'giradi
function translateExamError(raw: string): string {
  const parts = raw.split(",").map((p) => p.trim());
  const FIELD_LABELS: Record<string, string> = {
    question: "Savol",
    variantA: "A varianti",
    variantB: "B varianti",
    variantC: "C varianti",
    variantD: "D varianti",
    answer: "To'g'ri javob",
    lessonId: "Dars",
    image: "Rasm",
  };
  return parts
    .map((msg) => {
      const fieldKey = msg.match(/^(\w+)\s/)?.[1];
      const label = (fieldKey && FIELD_LABELS[fieldKey]) || fieldKey || "Maydon";
      if (msg.includes("should not be empty") || msg.includes("must be defined")) {
        return `${label} to'ldirilishi shart`;
      }
      return msg;
    })
    .join("\n");
}

export function AddExamModal({ open, onOpenChange, editData, onSubmit }: Props) {
  const isEditMode = !!editData;

  const [form, setForm] = useState<ExamFormData>(emptyForm);
  // Mavjud (backend'dagi) rasm URL'i — hali o'zgartirilmagan bo'lsa shu ko'rsatiladi
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  // Yangi tanlangan faylning lokal preview'i
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setForm({
        question: editData.question,
        variantA: editData.variantA,
        variantB: editData.variantB,
        variantC: editData.variantC,
        variantD: editData.variantD,
        answer: editData.answer,
        image: null,
        removeImage: false,
      });
      setExistingImageUrl(editData.imageUrl);
    } else {
      setForm(emptyForm);
      setExistingImageUrl(null);
    }
    setNewImagePreview(null);
    setFieldError("");
    setApiError("");
    setIsSubmitting(false);
  }, [open, editData]);

  if (!open) return null;

  const update = (field: keyof Omit<ExamFormData, "image" | "answer" | "removeImage">) => (
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file, removeImage: false }));
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImagePreview(url);
    } else {
      setNewImagePreview(null);
    }
  };

  // Rasmni butunlay olib tashlash (yangi tanlangan ham, mavjud ham)
  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: null, removeImage: true }));
    setNewImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSave = async () => {
    setApiError("");

    if (
      !form.question.trim() ||
      !form.variantA.trim() ||
      !form.variantB.trim() ||
      !form.variantC.trim() ||
      !form.variantD.trim()
    ) {
      setFieldError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    setFieldError("");
    setIsSubmitting(true);

    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : String(err ?? "");
      setApiError(translateExamError(rawMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rasm blokida ko'rsatiladigan preview: yangi tanlangan fayl > mavjud rasm > yo'q
  const displayedImage = newImagePreview || existingImageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-card p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">
            {isEditMode ? "Savolni tahrirlash" : "Savol qo'shish"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-foreground hover:text-muted-foreground"
            aria-label="Yopish"
          >
            <X className="size-5" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 whitespace-pre-line rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Savol matni */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Savol
            </label>
            <textarea
              value={form.question}
              onChange={(e) => update("question")(e.target.value)}
              placeholder="Savol matnini kiriting"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>

          {/* Savol rasmi (ixtiyoriy) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Savol rasmi (ixtiyoriy)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {displayedImage ? (
              <div className="relative inline-block">
                <img
                  src={displayedImage}
                  alt="Tanlangan rasm"
                  className="h-32 w-auto rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white"
                  aria-label="Rasmni olib tashlash"
                >
                  <X className="size-3.5" />
                </button>
                {/* Mavjud rasm o'rniga yangisini tanlash imkoniyati */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 block text-xs font-medium text-primary underline"
                >
                  Rasmni almashtirish
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground hover:border-ring"
              >
                <ImagePlus className="size-5" />
                Rasm tanlash
              </button>
            )}
          </div>

          {/* Variantlar */}
          {(
            [
              { key: "variantA", label: "A varianti" },
              { key: "variantB", label: "B varianti" },
              { key: "variantC", label: "C varianti" },
              { key: "variantD", label: "D varianti" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => update(key)(e.target.value)}
                placeholder={`${label} matni`}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
              />
            </div>
          ))}

          {/* To'g'ri javob */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              To&apos;g&apos;ri javob
            </label>
            <select
              value={form.answer}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  answer: e.target.value as ExamFormData["answer"],
                }))
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-ring"
            >
              {ANSWER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
        </div>

        <div className="mt-8">
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}