import { Attachment, Chapter, Course } from "@prisma/client";

export interface CourseFormProps {
  initialData: {
    chapters: any[];
    attachments: any[];
  } & Course;
  courseSlug: string;
}
export interface ChapterFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}
