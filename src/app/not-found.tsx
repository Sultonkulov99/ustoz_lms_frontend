import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary sm:size-24">
            <span className="text-3xl font-black tracking-wider sm:text-4xl">404</span>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Sahifa topilmadi
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Kechirasiz, siz qidirayotgan sahifa mavjud emas, o&apos;chirilgan yoki manzili o&apos;zgargan bo&apos;lishi mumkin.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 rounded-xl text-sm font-semibold">
              <Link href="/">
                <Home className="size-4" />
                Bosh sahifaga qaytish
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl text-sm font-semibold"
            >
              <Link href="/courses">
                <Compass className="size-4" />
                Kurslarni ko&apos;rish
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
