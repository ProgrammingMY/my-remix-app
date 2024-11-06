import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    console.log(request);

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    // make sure user is authenticated and purchased the course
    const { supabaseClient } = createSupabaseServerClient(request, env);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw redirect("/login");
    }

    const { objectKey: key } = params;

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    const db = drizzle(env.DB_drizzle, { schema });

    // check if attachment exists and user has purchased the course
    const course = await db.query.course.findFirst({
      where: and(eq(schema.course.slug, params.slug!)),
      with: {
        attachments: {
          where: eq(schema.attachment.fileUrl, key),
        },
        purchases: {
          where: eq(schema.purchase.userId, user.id),
        },
      },
    });

    if (!course) {
      return new Response("Course not found", { status: 404 });
    }

    if (!course.attachments.length) {
      return new Response("Attachment not found in the course", {
        status: 404,
      });
    }

    if (!course.purchases.length) {
      return new Response("Course not purchased", { status: 404 });
    }

    const object = await env.BUCKET.get(key);

    const objects = await env.BUCKET.list();

    console.log(objects);

    if (!object) {
      return new Response("Object not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.etag);

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.log("[GET_OBJECT]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
