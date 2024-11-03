import { Chapter } from "@prisma/client";
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import * as schema from "~/db/schema.server";
import { drizzle } from "drizzle-orm/d1";
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

    const formData = await request.formData();
    const list = JSON.parse(formData.get("data") as string) as Chapter[];

    for (let item of list) {
      await db
        .update(schema.Chapter)
        .set({
          position: item.position,
        })
        .where(eq(schema.Chapter.id, item.id));
    }

    return jsonWithSuccess("Success", "Chapters reordered successfully.");
  } catch (error) {
    console.log("[REORDER CHAPTERS] ERROR", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
