"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: backend orqali bildirishnoma sozlamalarini saqlash
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <h2 className="text-lg font-bold text-foreground">Pochta bildirishnomalari</h2>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-6">
        <label className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifications}
            onClick={() => setEmailNotifications((prev) => !prev)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              emailNotifications ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                emailNotifications ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-foreground">Bildirishnomalarni qabul qilish</span>
        </label>

        <Button type="submit" size="default" className="w-fit">
          <Check className="size-4" />
          Saqlash
        </Button>
      </form>
    </div>
  );
}