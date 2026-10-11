"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive sm:size-20">
        <AlertCircle className="size-8 sm:size-10" />
      </div>

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Kutilmagan xatolik yuz berdi
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        Tizimda nosozlik yuz berdi. Sahifani qayta yuklab ko&apos;ring yoki bosh sahifaga qayting.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="lg"
          className="gap-2 rounded-xl text-sm font-semibold"
        >
          <RotateCcw className="size-4" />
          Qayta urinish
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="gap-2 rounded-xl text-sm font-semibold"
        >
          <Link href="/">
            <Home className="size-4" />
            Bosh sahifaga qaytish
          </Link>
        </Button>
      </div>
    </div>
  );
}
