import { Attachment } from "@prisma/client";
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { createSupabaseServerClient } from "~/utils/supabase.server";
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

    // POST METHOD
    if (request.method === "POST") {
      const values = (await request.json()) as Attachment[];

      await db.insert(schema.Attachment).values(
        values.map((value) => ({
          ...value,
          courseId: courseOwner.id,
        }))
      );

      return jsonWithSuccess("Success", "Attachment created successfully.");
    }

    // DELETE METHOD
    else if (request.method === "DELETE") {
      const { id } = (await request.json()) as {
        id: string;
      };

      await db
        .delete(schema.Attachment)
        .where(
          and(
            eq(schema.Attachment.id, id),
            eq(schema.Attachment.courseId, courseOwner.id)
          )
        );

      return jsonWithSuccess("Success", "Attachment deleted successfully.");
    }
  } catch (error) {
    console.log("[COURSE ID ATTACHMENT]", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
