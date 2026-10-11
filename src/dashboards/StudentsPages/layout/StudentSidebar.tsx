"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, LayoutGrid, PanelLeftClose } from "lucide-react";


const menuItemsConfig = [
  {
    icon: LayoutGrid,
    key: "sidebar.allCourses",
    href: "/student/all-courses",
  },
  {
    icon: BookOpen,
    key: "sidebar.myCourses",
    href: "/student/my-courses",
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const saved = localStorage.getItem("studentSidebarCollapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("studentSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  const isLinkActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <aside
      style={{
        width: collapsed ? "80px" : "320px",
        minWidth: collapsed ? "80px" : "320px",
        background: "#0D1017",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease, min-width 0.3s ease",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Link
            href="/"
            className="flex origin-left items-center gap-2 whitespace-nowrap transition-transform duration-1500 ease-in-out hover:scale-105"
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
              <span style={{ color: "#fff" }}>Research</span>
              <span style={{ color: "#BC000D" }}>Bridge</span>
            </span>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: "10px",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ffffff",
            flexShrink: 0,
            marginLeft: collapsed ? "auto" : "0",
          }}
        >
          <PanelLeftClose
            size={20}
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div style={{ padding: "20px 20px 8px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "8px 10px",
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "17px",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              {t("sidebar.panel")}
            </span>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          padding: collapsed ? "8px 12px" : "8px 20px",
        }}
      >
        {menuItemsConfig.map((item) => {
          const Icon = item.icon;
          const label = t(item.key as Parameters<typeof t>[0]);
          const isActive = isLinkActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-md no-underline transition-colors",
                isActive
                  ? "bg-[#BC000D]/[0.15] text-[#FF3B3B]"
                  : "text-white hover:bg-white/[0.06]"
              )}
              style={{
                gap: "10px",
                padding: collapsed ? "10px" : "8px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <Icon size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "14px",
                    lineHeight: "17px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}