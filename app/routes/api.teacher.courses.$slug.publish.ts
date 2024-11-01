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

    // for unpublish course
    const { wantPublish } = (await request.json()) as { wantPublish: boolean };

    if (!wantPublish) {
      const course = await db.course.findUnique({
        where: {
          slug: params.slug,
          userId: user.id,
        },
      });

      if (!course) {
        return jsonWithError("Error", "Course not found");
      }

      await db.course.update({
        where: {
          slug: params.slug,
          userId: user.id,
        },
        data: {
          isPublished: false,
        },
      });

      return jsonWithSuccess("Success", "Course unpublished successfully.");
    } else {
      // for publish course
      const course = await db.course.findUnique({
        where: {
          slug: params.slug,
          userId: user.id,
        },
        include: {
          chapters: {
            include: {
              muxData: true,
            },
          },
        },
      });

      if (!course) {
        return jsonWithError("Error", "Course not found");
      }

      const hasPublishedChapters = course.chapters.some(
        (chapter) => chapter.isPublished
      );

      if (
        !course.title ||
        !course.description ||
        !course.imageUrl ||
        !course.price ||
        !hasPublishedChapters
      ) {
        return jsonWithError("Error", "Missing required fields");
      }

      await db.course.update({
        where: {
          slug: params.slug,
          userId: user.id,
        },
        data: {
          isPublished: true,
        },
      });

      return jsonWithSuccess("Success", "Course published successfully.");
    }
  } catch (error) {
    console.log("[COURSE PUBLISH]", error);
    return new Response("Internal server error", { status: 500 });
  }
};
