import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactUs() {
  return (
    <section className="flex justify-center px-4 pt-2 pb-6 sm:pt-4 sm:pb-8 lg:pt-4 lg:pb-10">
      <div
        className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs sm:rounded-3xl sm:p-8 lg:p-10"
        style={{
          background: "#FBF9F8",
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[40px] lg:leading-[48px]">
            Biz bilan bog&apos;lanish
          </h2>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Savollaringiz bormi? Formani to&apos;ldiring, tez orada siz bilan bog&apos;lanamiz
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              Ismingiz
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ismingizni yozing"
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground shadow-2xs outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-semibold text-foreground">
              Telefon raqamingiz
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground shadow-2xs outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="telegram" className="text-sm font-semibold text-foreground">
              Telegram username
            </label>
            <div className="flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-4 shadow-2xs transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Send className="size-4 shrink-0 text-primary" />
              <input
                id="telegram"
                type="text"
                placeholder="@username"
                className="w-full text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-xs transition-all hover:shadow-md sm:h-14 sm:text-lg">
            Jo&apos;natish
          </Button>
        </form>
      </div>
    </section>
  );
}