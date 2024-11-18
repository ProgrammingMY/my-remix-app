import { ChapterType, CourseType } from "~/db/schema.server";

export interface CourseFormProps {
  initialData: CourseType;
  courseSlug: string;
}
export interface ChapterFormProps {
  initialData: ChapterType;
  courseSlug: string;
  chapterId: string;
}

export interface SafeUserType {
  email: string;
  name: string;
  imageUrl: string | null;
  id: string;
  emailVerified: boolean;
  role: {
    name: string;
  };
}
