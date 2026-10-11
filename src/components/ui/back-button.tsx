"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="md"
      className="w-fit mb-4"
      onClick={() => router.back()}
    >
      <ArrowLeft className="size-4" />
      Ortga
    </Button>
  );
}