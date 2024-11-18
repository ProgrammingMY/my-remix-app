import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";
import { AttachmentType } from "~/db/schema.server";
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

    // POST METHOD
    if (request.method === "POST") {
      const values = (await request.json()) as AttachmentType[];

      await db.insert(schema.attachment).values(
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
        .delete(schema.attachment)
        .where(
          and(
            eq(schema.attachment.id, id),
            eq(schema.attachment.courseId, courseOwner.id)
          )
        );

      return jsonWithSuccess("Success", "Attachment deleted successfully.");
    }
  } catch (error) {
    console.log("[COURSE ID ATTACHMENT]", error);
    return jsonWithError("Error", "Something went wrong.");
  }
};
