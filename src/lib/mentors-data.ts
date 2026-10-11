import mentorImage from "@/assets/images/mentor.png";
import mentorImage2 from "@/assets/images/mentor2.png";

export type Mentor = {
  id: string;
  name: string;
  avatar: any;
  phone: string;
  createdAt: string;
  role: string;
  password: string;
  status: "Faol" | "Faol emas";
  experience?: string;
  profession?: string;
  website?: string;
  bio?: string;
  courses?: string[];
  socials?: {
    facebook?: string;
    telegram?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
};

export const initialMentors: Mentor[] = [
  {
    id: "1",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: mentorImage,
    phone: "+998 99 999 99 99",
    createdAt: "2023-04-09 14:21:44",
    role: "Mentor",
    password: "•••••••",
    status: "Faol",
    experience: "3",
    profession: "Full-stack software engineer",
    courses: ["React.js"],
  },
  {
    id: "2",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: mentorImage2,
    phone: "+998 99 999 99 99",
    createdAt: "2023-04-09 14:21:44",
    role: "Mentor",
    password: "•••••••",
    status: "Faol",
    experience: "5",
    profession: "Backend developer",
    courses: ["Node.js", "PostgreSQL"],
  },
];