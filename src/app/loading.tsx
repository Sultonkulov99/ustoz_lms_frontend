import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 px-4 py-16">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="animate-pulse text-sm font-medium text-muted-foreground">
        Yuklanmoqda...
      </p>
    </div>
  );
}
