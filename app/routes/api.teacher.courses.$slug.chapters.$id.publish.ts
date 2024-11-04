import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(
      request,
      env
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

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
      });

      const muxData = await db.query.muxData.findFirst({
        where: eq(schema.muxData.chapterId, params.id!),
      });

      if (!chapter || !muxData || !chapter.title || !chapter.uploadId) {
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
