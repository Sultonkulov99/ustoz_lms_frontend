"use client";

import { Lock, LockOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type Lesson = {
  title: string;
  duration?: string;
  locked?: boolean;
};

export type Section = {
  title: string;
  lessons: Lesson[];
};

type Props = {
  sections?: Section[];
};

export function CourseCurriculum({ sections = [] }: Props) {
  if (sections.length === 0) {
    return (
      <div
        className="w-full rounded-[16px] border-2 bg-white p-8 text-center text-muted-foreground"
        style={{ borderColor: "#E4E2E2" }}
      >
        Bu kursga hali bo&apos;lim qo&apos;shilmagan.
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-[16px] border-2 bg-white p-8"
      style={{ paddingTop: "4px", paddingBottom: "4px" }}
    >
      <Accordion type="single" collapsible defaultValue={sections[0]?.title}>
        {sections.map((section, sIdx) => (
          <AccordionItem
            key={`${section.title}-${sIdx}`}
            value={section.title}
            className="border-b border-[#F1F2F4]"
          >
            <AccordionTrigger className="py-5 text-[20px] font-medium leading-9 tracking-[0.48px] text-muted-foreground hover:no-underline [&>svg]:size-6">
              {section.title}
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-col gap-6 pb-4">
                {section.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Bu bo&apos;limga hali dars qo&apos;shilmagan.
                  </p>
                ) : (
                  section.lessons.map((lesson, idx) => (
                    <div
                      key={`${lesson.title}-${idx}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "#F7F7F8" }}
                        >
                          {lesson.locked !== false ? (
                            <Lock className="size-5 text-muted-foreground" />
                          ) : (
                            <LockOpen className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-sm leading-7.5 text-muted-foreground">
                          {lesson.title}
                        </span>
                      </div>

                      {lesson.duration ? (
                        <span className="text-sm leading-7.5 text-muted-foreground">
                          {lesson.duration}
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}