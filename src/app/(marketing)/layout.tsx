import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FinalCta } from "@/components/sections/marketing/about-course/final-cta";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <FinalCta />
      <Footer />
    </div>
  );
}