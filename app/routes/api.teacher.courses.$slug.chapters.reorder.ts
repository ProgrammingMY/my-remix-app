import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import * as schema from "~/db/schema.server";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { ChapterType } from "~/db/schema.server";
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

    const formData = await request.formData();
    const list = JSON.parse(formData.get("data") as string) as ChapterType[];

    for (let item of list) {
      await db
        .update(schema.chapter)
        .set({
          position: item.position,
        })
        .where(eq(schema.chapter.id, item.id));
    }

    return jsonWithSuccess("Success", "Chapters reordered successfully.");
  } catch (error) {
    console.log("[REORDER CHAPTERS] ERROR", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
