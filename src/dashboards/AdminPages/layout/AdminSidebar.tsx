"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  MessageSquare,
  ChevronDown,
  PanelLeftClose,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type MenuItem = {
  icon: React.ElementType;
  key: string;          // sidebar.xxx tarjima kaliti
  href?: string;
  childKeys?: { key: string; href: string }[];
};

// Har doim bir xil — faqat kalit, label emas
const menuItemsConfig: MenuItem[] = [
  {
    icon: LayoutDashboard,
    key: "sidebar.dashboard",
    href: "/admin",
  },
  {
    icon: Users,
    key: "sidebar.users",
    childKeys: [
      { key: "sidebar.admins",      href: "/admin/users/admins" },
      { key: "sidebar.mentors",     href: "/admin/users/mentors" },
      { key: "sidebar.students",    href: "/admin/users/students" },
    ],
  },
  {
    icon: BookOpen,
    key: "sidebar.materials",
    childKeys: [
      { key: "sidebar.allCourses",  href: "/admin/courses" },
      // { key: "sidebar.categories",  href: "/admin/courses/categories" },
    ],
  },
  {
    icon: CreditCard,
    key: "sidebar.payments",
    href: "/admin/payments",
  },
  {
    icon: MessageSquare,
    key: "sidebar.comments",
    href: "/admin/comments",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { t } = useLanguage();

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleParentClick = (key: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenMenus((prev) => (prev.includes(key) ? prev : [...prev, key]));
    } else {
      toggleMenu(key);
    }
  };

  const isChildActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const isParentActive = (item: MenuItem) =>
    !!item.childKeys?.some((child) => isChildActive(child.href));

  return (
    <aside
      style={{
        width: collapsed ? "80px" : "260px",
        minWidth: collapsed ? "80px" : "260px",
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
          gap: "16px",
          padding: collapsed ? "8px 12px" : "8px 20px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {menuItemsConfig.map((item) => {
          const Icon = item.icon;
          const label = t(item.key as Parameters<typeof t>[0]);
          const isActive = pathname === item.href;
          const isOpen = openMenus.includes(item.key);
          const hasChildren = !!item.childKeys?.length;
          const parentActive = hasChildren && isParentActive(item);

          if (hasChildren) {
            return (
              <div key={item.key}>
                <button
                  onClick={() => handleParentClick(item.key)}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex w-full items-center rounded-md border-none bg-transparent text-white transition-colors",
                    "hover:bg-white/[0.06]",
                    parentActive && "text-[#FF3B3B]"
                  )}
                  style={{
                    gap: "10px",
                    padding: collapsed ? "10px" : "8px 16px",
                    cursor: "pointer",
                    justifyContent: collapsed ? "center" : "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: parentActive ? 600 : 500,
                          fontSize: "14px",
                          lineHeight: "17px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div style={{ paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                    {item.childKeys!.map((child) => {
                      const isChActive = isChildActive(child.href);
                      const childLabel = t(child.key as Parameters<typeof t>[0]);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-lg no-underline transition-colors",
                            isChActive
                              ? "bg-white/[0.08] text-white"
                              : "text-white/85 hover:bg-white/[0.06] hover:text-white"
                          )}
                          style={{
                            padding: "10px 16px",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: isChActive ? 600 : 500,
                            fontSize: "14px",
                            lineHeight: "17px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {childLabel}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-md no-underline transition-colors",
                isActive ? "bg-[#BC000D]/[0.15] text-[#FF3B3B]" : "text-white hover:bg-white/[0.06]"
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