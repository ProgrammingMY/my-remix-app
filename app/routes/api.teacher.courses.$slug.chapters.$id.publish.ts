import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
      return redirect("/login", {
        headers,
      });
    }

    const db = drizzle(env.DB_drizzle, { schema });

    const courseOwner = await db.query.course.findFirst({
      where: and(
        eq(schema.course.slug, params.slug!),
        eq(schema.course.userId, user.id)
      ),
    });

    if (!courseOwner) {
      return jsonWithError("Error", "Course not found");
    }

    const { wantPublish } = (await request.json()) as {
      wantPublish: boolean;
    };

    // for unpublish chapter
    if (!wantPublish) {
      await db
        .update(schema.chapter)
        .set({
          isPublished: false,
        })
        .where(
          and(
            eq(schema.chapter.id, params.id!),
            eq(schema.chapter.courseId, courseOwner.id)
          )
        );

      const publishedChaptersinCourse = await db.query.chapter.findMany({
        where: and(
          eq(schema.chapter.courseId, courseOwner.id),
          eq(schema.chapter.isPublished, true)
        ),
      });

      if (!publishedChaptersinCourse.length) {
        await db
          .update(schema.course)
          .set({
            isPublished: false,
          })
          .where(
            and(
              eq(schema.course.id, courseOwner.id),
              eq(schema.course.userId, user.id)
            )
          );
      }

      return jsonWithSuccess("Success", "Chapter unpublished successfully.");
    } else {
      // for publish chapter
      const chapter = await db.query.chapter.findFirst({
        where: and(
          eq(schema.chapter.courseId, courseOwner.id),
          eq(schema.chapter.id, params.id!)
        ),
        with: {
          bunnyData: true,
        },
      });

      if (
        !chapter ||
        !chapter.bunnyData ||
        !chapter.title ||
        !chapter.videoId
      ) {
        return jsonWithError("Error", "Missing required fields");
      }

      const publishedChapter = await db
        .update(schema.chapter)
        .set({
          isPublished: true,
        })
        .where(
          and(
            eq(schema.chapter.id, params.id!),
            eq(schema.chapter.courseId, courseOwner.id)
          )
        );

      return jsonWithSuccess("Success", "Chapter published successfully.");
    }
  } catch (error) {
    console.log("[COURSE ID CHAPTERS PUBLISH]", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
