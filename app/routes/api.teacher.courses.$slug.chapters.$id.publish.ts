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

    const courseOwner = await db.query.Course.findFirst({
      where: and(
        eq(schema.Course.slug, params.slug!),
        eq(schema.Course.userId, user.id)
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
        .update(schema.Chapter)
        .set({
          isPublished: false,
        })
        .where(
          and(
            eq(schema.Chapter.id, params.id!),
            eq(schema.Chapter.courseId, courseOwner.id)
          )
        );

      const publishedChaptersinCourse = await db.query.Chapter.findMany({
        where: and(
          eq(schema.Chapter.courseId, courseOwner.id),
          eq(schema.Chapter.isPublished, true)
        ),
      });

      if (!publishedChaptersinCourse.length) {
        await db
          .update(schema.Course)
          .set({
            isPublished: false,
          })
          .where(
            and(
              eq(schema.Course.id, courseOwner.id),
              eq(schema.Course.userId, user.id)
            )
          );
      }

      return jsonWithSuccess("Success", "Chapter unpublished successfully.");
    } else {
      // for publish chapter
      const chapter = await db.query.Chapter.findFirst({
        where: and(
          eq(schema.Chapter.courseId, courseOwner.id),
          eq(schema.Chapter.id, params.id!)
        ),
      });

      const muxData = await db.query.MuxData.findFirst({
        where: eq(schema.MuxData.chapterId, params.id!),
      });

      if (!chapter || !muxData || !chapter.title || !chapter.uploadId) {
        return jsonWithError("Error", "Missing required fields");
      }

      const publishedChapter = await db
        .update(schema.Chapter)
        .set({
          isPublished: true,
        })
        .where(
          and(
            eq(schema.Chapter.id, params.id!),
            eq(schema.Chapter.courseId, courseOwner.id)
          )
        );

      return jsonWithSuccess("Success", "Chapter published successfully.");
    }
  } catch (error) {
    console.log("[COURSE ID CHAPTERS PUBLISH]", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
