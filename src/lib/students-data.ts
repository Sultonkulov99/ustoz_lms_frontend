import type { StaticImageData } from "next/image";
import mentorImage from "@/assets/images/mentor.png";
import mentorImage2 from "@/assets/images/mentor2.png";

export type Student = {
  id: string;
  name: string;
  avatar: StaticImageData | null;
  phone: string;
  role: string;
  createdAt: string;
  status: "Faol" | "Faol emas";
};

export const initialStudents: Student[] = [
  {
    id: "1",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: mentorImage,
    phone: "+998 99 999 99 99",
    role: "Student",
    createdAt: "2023-04-09 14:21:44",
    status: "Faol",
  },
  {
    id: "2",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: mentorImage2,
    phone: "+998 99 999 99 99",
    role: "Student",
    createdAt: "2023-04-09 14:21:44",
    status: "Faol",
  },
  {
    id: "3",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: null,
    phone: "+998 99 999 99 99",
    role: "Student",
    createdAt: "2023-04-09 14:21:44",
    status: "Faol",
  },
];