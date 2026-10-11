"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Assistant } from "@/lib/assistants-data";
import { apiFetch } from "@/lib/api-client";
import { ChevronDown } from "lucide-react";

export type AddAssistantFormData = {
  name: string;
  phone: string;
  password: string;
  assignedCourse: string; // will store the course ID
};

type AddAssistantModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AddAssistantFormData) => void;
  mode: "add" | "edit";
  initialData?: Assistant | null;
};

const emptyForm: AddAssistantFormData = {
  name: "",
  phone: "",
  password: "",
  assignedCourse: "",
};

export function AddAssistantModal({
  open,
  onOpenChange,
  onSave,
  mode,
  initialData,
}: AddAssistantModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<AddAssistantFormData>(emptyForm);
  const [nameError, setNameError] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          name: initialData.name,
          phone: initialData.phone,
          password: "",
          assignedCourse: (initialData as any).courseId || "",
        });
      } else {
        setForm(emptyForm);
      }
      setNameError("");
      setDropdownOpen(false);

      // Fetch courses only when the modal is opened
      const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
          const res = await apiFetch("/courses");
          if (res.ok) {
            const resData = await res.json();
            if (resData && Array.isArray(resData.data)) {
              setCourses(resData.data);
            }
          }
        } catch (err) {
          console.error("Error loading courses for assistant selection:", err);
        } finally {
          setLoadingCourses(false);
        }
      };
      fetchCourses();
    }
  }, [open, mode, initialData]);

  const handleSave = () => {
    if (!form.name.trim()) {
      setNameError(t("common.nameRequired"));
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? t("modal.addAssistant") : t("modal.editAssistant")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t("table.fullName")}</label>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (nameError) setNameError("");
              }}
              placeholder={t("common.enterValue")}
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
            />
            {nameError && <span className="text-xs text-destructive">{nameError}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t("table.phone")}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+998 __ ___ __ __"
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-medium text-foreground">{t("common.assignedCourse")}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full h-11 items-center justify-between rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background text-foreground text-left"
              >
                <span>
                  {form.assignedCourse
                    ? courses.find((c) => String(c.id) === String(form.assignedCourse))?.name || t("common.selectCourse")
                    : (loadingCourses ? t("common.coursesLoading") : t("common.selectCourse"))}
                </span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 w-full z-50 rounded-lg border border-border bg-white py-1 shadow-lg max-h-60 overflow-y-auto">
                    <div
                      onClick={() => {
                        setForm({ ...form, assignedCourse: "" });
                        setDropdownOpen(false);
                      }}
                      className="cursor-pointer px-3 py-2.5 text-sm text-muted-foreground hover:bg-slate-50 transition-colors"
                    >
                      {t("common.selectCourse")}
                    </div>
                    {courses.map((course) => {
                      const isSelected = String(course.id) === String(form.assignedCourse);
                      return (
                        <div
                          key={course.id}
                          onClick={() => {
                            setForm({ ...form, assignedCourse: String(course.id) });
                            setDropdownOpen(false);
                          }}
                          className={`cursor-pointer px-3 py-2.5 text-sm transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-foreground hover:bg-slate-50"
                          }`}
                        >
                          {course.name}
                        </div>
                      );
                    })}
                    {courses.length === 0 && !loadingCourses && (
                      <div className="px-3 py-2.5 text-sm text-muted-foreground text-center">
                        {t("common.noCoursesFound")}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t("auth.passwordPlaceholder")}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={mode === "edit" ? t("common.leavePasswordEmpty") : t("auth.passwordPlaceholder")}
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <Button size="default" className="mt-2 w-full" onClick={handleSave}>
          {t("common.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}