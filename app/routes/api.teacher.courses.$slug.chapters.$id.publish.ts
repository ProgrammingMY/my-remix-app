import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { createPrismaClient } from "~/utils/prisma.server";
import { createSupabaseServerClient } from "~/utils/supabase.server";

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

    const db = createPrismaClient(env);

    const courseOwner = await db.course.findUnique({
      where: {
        slug: params.slug,
        userId: user.id,
      },
    });

    if (!courseOwner) {
      return jsonWithError("Error", "Course not found");
    }

    const { wantPublish } = (await request.json()) as {
      wantPublish: boolean;
    };
    // for unpublish chapter
    if (!wantPublish) {
      await db.chapter.update({
        where: {
          id: params.id,
          courseId: courseOwner.id,
        },
        data: {
          isPublished: false,
        },
      });

      const publishedChaptersinCourse = await db.chapter.findMany({
        where: {
          courseId: courseOwner.id,
          isPublished: true,
        },
      });

      if (!publishedChaptersinCourse.length) {
        await db.course.update({
          where: {
            id: courseOwner.id,
          },
          data: {
            isPublished: false,
          },
        });
      }

      return jsonWithSuccess("Success", "Chapter unpublished successfully.");
    } else {
      // for publish chapter
      const chapter = await db.chapter.findUnique({
        where: {
          courseId: courseOwner.id,
          id: params.id,
        },
      });

      const muxData = await db.muxData.findUnique({
        where: {
          chapterId: params.id,
        },
      });

      if (!chapter || !muxData || !chapter.title || !chapter.uploadId) {
        return jsonWithError("Error", "Missing required fields");
      }

      const publishedChapter = await db.chapter.update({
        where: {
          id: params.id,
          courseId: courseOwner.id,
        },
        data: {
          isPublished: true,
        },
      });

      return jsonWithSuccess("Success", "Chapter published successfully.");
    }
  } catch (error) {
    console.log("[COURSE ID CHAPTERS PUBLISH]", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
