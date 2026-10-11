import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="flex w-full flex-col items-center gap-4 border-t border-border py-6 text-center sm:py-8">
      <Link
            href="/"
            className="flex origin-left items-center gap-2 whitespace-nowrap transition-transform duration-1500 ease-in-out hover:scale-110"
            style={{ textDecoration: "none" }}
          >
        <div
          style={{
            width: "6px",
            height: "28px",
            background: "linear-gradient(180deg, #BC000D 0%, #FF3B3B 100%)",
            borderRadius: "3px",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: "22px",
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#000" }}>Research</span>
          <span style={{ color: "#BC000D" }}>Bridge</span>
        </span>
      </Link>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-[30px] sm:leading-[38px]">
          Biz bilan muvaffaqiyatga erishing
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-xl sm:leading-[30px]">
          Eng kuchlilar biz bilan qoladi!
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col sm:max-w-none sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
        <button
          type="button"
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 sm:h-12 sm:text-base"
          style={{ background: "#F2F4F7", borderColor: "#E4E7EC" }}
        >
          <Play className="size-4 sm:size-5" />
          Intro video
        </button>

        <Button
          size="default"
          className="h-11 w-full sm:w-auto gap-2 rounded-lg border border-primary px-6 text-sm font-medium sm:h-12 sm:text-base"
          asChild
        >
          <Link href="/contact">Bog&apos;lanish</Link>
        </Button>
      </div>
    </section>
  );
}