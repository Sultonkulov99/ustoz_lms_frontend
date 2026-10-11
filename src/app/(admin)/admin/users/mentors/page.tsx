import { MentorsList } from "@/dashboards/AdminPages/users/mentors-list";

export const metadata = {
  title: "Mentorlar | Admin Panel | ResearchBridge",
  description: "Mentorlar ro'yxati.",
};

export default function MentorsPage() {
  return <MentorsList />;
}