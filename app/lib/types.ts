import { Attachment, Chapter, Course } from "@prisma/client";
import { CourseType } from "~/db/schema.server";

export interface CourseFormProps {
  initialData: CourseType;
  courseSlug: string;
}
export interface ChapterFormProps {
  initialData: Chapter;
  courseSlug: string;
  chapterId: string;
}
