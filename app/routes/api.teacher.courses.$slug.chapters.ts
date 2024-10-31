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
    const data = Object.fromEntries(formData.entries());
    const title = data.title as string;

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: params.slug,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    await db.chapter.create({
      data: {
        courseId: courseOwner.id,
        position: newPosition,
        title,
      },
    });

    return jsonWithSuccess("Success", "Chapter created successfully.");
  } catch (error) {
    return jsonWithError("Error", "Something went wrong.");
  }
};
