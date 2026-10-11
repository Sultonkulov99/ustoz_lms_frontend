import { AdminSidebar } from "@/dashboards/AdminPages/layout/AdminSidebar";
import { AdminTopbar } from "@/dashboards/AdminPages/layout/AdminTopbar";
import { RoleGuard } from "@/components/guards/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#F0F1F2",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "auto",
          }}
        >
          {/* Topbar */}
          <AdminTopbar />

          {/* Page content */}
          <main
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
