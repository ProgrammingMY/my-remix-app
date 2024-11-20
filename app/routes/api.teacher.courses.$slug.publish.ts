import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";
import { SafeUserType } from "~/lib/types";
import { isTeacher } from "~/lib/isTeacher";

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    const { user, headers } = (await isAuthenticated(request, env)) as {
      user: SafeUserType;
      headers: Headers;
    };

    if (!user) {
      return redirect("/login", {
        headers,
      });
    }

    if (!isTeacher(user)) {
      return redirect("/user", {
        headers,
      });
    }

    // for unpublish course
    const { wantPublish } = (await request.json()) as { wantPublish: boolean };

    const db = drizzle(env.DB_drizzle, { schema });

    if (!wantPublish) {
      const course = await db.query.course.findFirst({
        where: and(
          eq(schema.course.slug, params.slug!),
          eq(schema.course.userId, user.id)
        ),
      });

      if (!course) {
        return jsonWithError("Error", "Course not found");
      }

      await db
        .update(schema.course)
        .set({
          isPublished: false,
        })
        .where(
          and(
            eq(schema.course.slug, params.slug!),
            eq(schema.course.userId, user.id)
          )
        );

      return jsonWithSuccess("Success", "Course unpublished successfully.");
    } else {
      // for publish course
      const course = await db.query.course.findFirst({
        where: and(
          eq(schema.course.slug, params.slug!),
          eq(schema.course.userId, user.id)
        ),
      });

      if (!course) {
        return jsonWithError("Error", "Course not found");
      }

      const chapters = await db.query.chapter.findMany({
        where: eq(schema.chapter.courseId, course.id),
      });

      const hasPublishedChapters = chapters.some(
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

      await db
        .update(schema.course)
        .set({
          isPublished: true,
        })
        .where(
          and(
            eq(schema.course.slug, params.slug!),
            eq(schema.course.userId, user.id)
          )
        );

      return jsonWithSuccess("Success", "Course published successfully.");
    }
  } catch (error) {
    console.log("[COURSE PUBLISH]", error);
    return new Response("Internal server error", { status: 500 });
  }
};
