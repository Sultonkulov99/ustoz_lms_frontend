"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role || !allowedRoles.includes(role)) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F0F1F2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#BC000D]" size={36} />
          <span className="text-sm text-gray-500 font-medium font-sans">
            Ruxsat tekshirilmoqda...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
