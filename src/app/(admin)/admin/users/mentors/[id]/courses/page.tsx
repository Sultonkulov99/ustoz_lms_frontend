import { MentorCourses } from "@/dashboards/AdminPages/users/mentor-courses";

export default async function MentorCoursesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MentorCourses mentorId={id} />;
}