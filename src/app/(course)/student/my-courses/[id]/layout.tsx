import { StudentTopbar } from "@/dashboards/StudentsPages/layout/StudentTopbar";
import { RoleGuard } from "@/components/guards/role-guard";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "#F0F1F2",
          overflow: "hidden",
        }}
      >
        <StudentTopbar />
        <main style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>{children}</main>
      </div>
    </RoleGuard>
  );
}
