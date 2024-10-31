import { Attachment } from "@prisma/client";
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

    // POST METHOD
    if (request.method === "POST") {
      const values = (await request.json()) as Attachment[];

      const attachment = await db.attachment.createMany({
        data: values.map((value) => ({
          ...value,
          courseId: courseOwner.id,
        })),
      });

      return jsonWithSuccess("Success", "Attachment created successfully.");
    }

    // DELETE METHOD
    else if (request.method === "DELETE") {
      const { id } = (await request.json()) as {
        id: string;
      };
      const attachment = await db.attachment.delete({
        where: {
          id,
          courseId: courseOwner.id,
        },
      });

      return jsonWithSuccess("Success", "Attachment deleted successfully.");
    }
  } catch (error) {
    console.log("[COURSE ID ATTACHMENT]", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
