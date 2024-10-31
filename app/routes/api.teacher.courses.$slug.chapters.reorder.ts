import { Chapter } from "@prisma/client";
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

    const formData = await request.formData();
    const list = JSON.parse(formData.get("data") as string) as Chapter[];

    for (let item of list) {
      await db.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return jsonWithSuccess("Success", "Chapters reordered successfully.");
  } catch (error) {
    console.log("[REORDER CHAPTERS] ERROR", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
