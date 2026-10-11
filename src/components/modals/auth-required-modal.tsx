"use client";
// bu modal eslatma chiqarish uchun agar ruyxatdan utmagan bulsa userga login qilishni taklif qiladi
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AuthRequiredModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthRequiredModal({
  open,
  onOpenChange,
}: AuthRequiredModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      <DialogContent className="w-[375px] max-w-[375px] min-w-[375px] h-[250px] max-h-[250px] flex flex-col items-center justify-center gap-[18px] rounded-[16px] p-5 text-center">
        <DialogHeader className="gap-2">
          <DialogTitle
            className="text-center text-2xl font-bold leading-[30px]"
            style={{ color: "#151515" }}
          >
            Eslatma
          </DialogTitle>
          <DialogDescription
            className="mx-auto max-w-[297px] text-center text-sm leading-5"
            style={{ color: "#9092A3" }}
          >
            Izoh qoldirish uchun shaxsiy kabinetga kiring yoki ro&apos;yxatdan
            o&apos;ting
          </DialogDescription>
        </DialogHeader>

        <Button
          size="default"
          className="flex h-12 w-[251px] items-center justify-center gap-2.5 rounded-[8px] px-5"
          onClick={() => router.push("/login")}
        >
          <User className="size-5" />
          Kirish / Ro&apos;yxatdan o&apos;tish
        </Button>
      </DialogContent>
    </Dialog>
  );
}