import { StudentSidebar } from "@/dashboards/StudentsPages/layout/StudentSidebar";
import { StudentTopbar } from "@/dashboards/StudentsPages/layout/StudentTopbar";
import { RoleGuard } from "@/components/guards/role-guard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#F0F1F2",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <StudentSidebar />

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
          <StudentTopbar />

          {/* Page content */}
          <main
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "24px 0",
              gap: "24px",
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
