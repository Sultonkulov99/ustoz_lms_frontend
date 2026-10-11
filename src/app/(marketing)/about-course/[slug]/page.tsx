import { CourseDetailView } from "@/components/sections/marketing/about-course/course-detail-view";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailView courseId={slug} />;
}