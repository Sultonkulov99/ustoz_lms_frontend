import { CourseDetailView } from "@/components/sections/marketing/about-course/course-detail-view";

type Props = { params: Promise<{ id: string }> };

export default async function StudentCourseDetailPage({ params }: Props) {
  const { id } = await params;
  return <CourseDetailView courseId={id} variant="student" />;
}