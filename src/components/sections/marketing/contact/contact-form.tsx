"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: forma yuborish logikasi
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:rounded-3xl sm:p-10 lg:p-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Bog&apos;lanish
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl lg:text-4xl">
            Savollaringiz bo&apos;lsa murojaat qiling
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-5 sm:mt-10 sm:gap-6"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="fullName"
              className="text-sm font-semibold text-foreground sm:text-base"
            >
              F.I.SH
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Kiriting"
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-13 sm:px-5 sm:text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone"
              className="text-sm font-semibold text-foreground sm:text-base"
            >
              Telefon raqamingiz
            </label>
            <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:h-13 sm:px-5">
              <span className="shrink-0 text-sm font-bold text-foreground sm:text-base">
                UZ
              </span>
              <span className="h-6 w-px shrink-0 bg-border" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998"
                className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sm font-semibold text-foreground sm:text-base"
            >
              Xabar
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Savolingiz yoki xabaringizni yozing..."
              className="resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:p-5 sm:text-base"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-2 h-12 w-full rounded-xl text-base font-bold shadow-xs transition-all hover:shadow-md active:scale-[0.99] sm:h-13 sm:text-lg"
          >
            Yuborish
          </Button>
        </form>
      </div>
    </section>
  );
}