import { AuthHeader } from "@/components/layout/auth-header";
import { AuthFooter } from "@/components/layout/auth-footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F7]">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center">{children}</main>
      <AuthFooter />
    </div>
  );
}