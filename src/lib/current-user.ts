"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { FILES_BASE_URL } from "@/lib/config";
import mentorImage from "@/assets/images/mentor.png";

export type CurrentUser = {
  name: string;
  phone: string;
  email: string;
  avatar: string | null;
  role: string;
};

// Backend ulanganda bu — auth/session orqali keladigan haqiqiy foydalanuvchi
// ma'lumoti bilan almashtiriladi. Hozircha AdminTopbar va Profil sahifalari
// aynan shu bitta obyektdan o'qiydi — ikkita alohida manba yaratilmasin.
export const currentUser: CurrentUser = {
  name: "Mahmudov Rahmonbergan",
  phone: "+998 90 701 21 61",
  email: "",
  avatar: null,
  role: "ADMIN",
};
