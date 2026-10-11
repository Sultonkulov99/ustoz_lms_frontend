import { MentorSidebar } from "@/dashboards/MentorPages/layout/MentorSidebar";
import { MentorTopbar } from "@/dashboards/MentorPages/layout/MentorTopbar";
import { RoleGuard } from "@/components/guards/role-guard";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["MENTOR"]}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#F0F1F2",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <MentorSidebar />

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
          <MentorTopbar />

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