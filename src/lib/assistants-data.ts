import type { StaticImageData } from "next/image";
import mentorImage from "@/assets/images/mentor.png";
import mentorImage2 from "@/assets/images/mentor2.png";
import mentorImage3 from "@/assets/images/mentor3.png";

export type Assistant = {
  id: string;
  name: string;
  avatar: any;
  assignedCourse: string;
  phone: string;
  role: string;
  createdAt: string;
  status: "Faol" | "Faol emas";
  password?: string;
};

export const initialAssistants: Assistant[] = [
  {
    id: "1",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: mentorImage,
    assignedCourse: "Web dizayn",
    phone: "+998 99 999 99 99",
    role: "Assistent",
    createdAt: "2023-04-09 14:2...",
    status: "Faol",
    password: "•••••••",
  },
  {
    id: "2",
    name: "Istamov Xurshid Hazratqul o'g'li",
    avatar: mentorImage2,
    assignedCourse: "Frontend",
    phone: "+998 99 999 99 99",
    role: "Assistent",
    createdAt: "2023-04-09 14:2...",
    status: "Faol",
    password: "•••••••",
  },
];

// Yangi assistent qo'shilganda ishlatiladigan standart avatar
export const defaultAssistantAvatar = mentorImage3;