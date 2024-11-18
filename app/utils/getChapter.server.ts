import { and, asc, eq, gt } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { AttachmentType, ChapterType } from "~/db/schema.server";

interface getChapterProps {
  userId: string;
  courseSlug: string;
  chapterId: string;
  db: DrizzleD1Database<typeof schema>;
}

export const getChapter = async ({
  userId,
  courseSlug,
  chapterId,
  db,
}: getChapterProps) => {
  try {
    const course = await db.query.course.findFirst({
      where: and(
        eq(schema.course.isPublished, true),
        eq(schema.course.slug, courseSlug)
      ),
      columns: {
        price: true,
        id: true,
      },
    });

    const chapter = await db.query.chapter.findFirst({
      where: and(
        eq(schema.chapter.id, chapterId),
        eq(schema.chapter.isPublished, true)
      ),
    });

    if (!course || !chapter) {
      throw new Error("Chapter/course not found");
    }

    const purchase = await db.query.purchase.findFirst({
      where: and(
        eq(schema.purchase.userId, userId),
        eq(schema.purchase.courseId, course.id)
      ),
    });

    let bunnyData = null;
    let attachments: AttachmentType[] = [];
    let nextChapter: ChapterType | undefined = undefined;

    if (purchase) {
      attachments = await db.query.attachment.findMany({
        where: eq(schema.attachment.courseId, course.id),
      });
    }

    if (chapter.isFree || purchase) {
      bunnyData = await db.query.bunnyData.findFirst({
        where: eq(schema.bunnyData.chapterId, chapterId),
      });

      nextChapter = await db.query.chapter.findFirst({
        where: and(
          eq(schema.chapter.courseId, course.id),
          eq(schema.chapter.isPublished, true),
          gt(schema.chapter.position, chapter.position)
        ),
        orderBy: [asc(schema.chapter.position)],
      });
    }

    const userProgress = await db.query.userProgress.findFirst({
      where: and(
        eq(schema.userProgress.userId, userId),
        eq(schema.userProgress.chapterId, chapterId)
      ),
    });

    return {
      chapter,
      course,
      bunnyData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      bunnyData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
