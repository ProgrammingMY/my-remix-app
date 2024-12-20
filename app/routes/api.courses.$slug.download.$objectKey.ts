import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    // make sure user is authenticated and purchased the course
    const { user } = await isAuthenticated(request, env);

    if (!user) {
      throw redirect("/login");
    }

    const { objectKey: key } = params;

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    // Decode the key before using it
    const decodedKey = decodeURIComponent(key);

    const db = drizzle(env.DB_drizzle, { schema });

    // check if attachment exists and user has purchased the course
    const course = await db.query.course.findFirst({
      where: and(eq(schema.course.slug, decodeURIComponent(params.slug!))),
      with: {
        attachments: {
          where: eq(schema.attachment.fileUrl, decodedKey),
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

    // Get the file directly from R2 using decoded key
    const object = await env.BUCKET.get(decodedKey);

    if (!object) {
      return new Response("Object not found", { status: 404 });
    }

    // Get the file headers
    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "application/octet-stream"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${course.attachments[0].fileName}"`
    );
    headers.set("Content-Length", object.size.toString());

    // Return the file stream directly
    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.log("[GET_OBJECT ERROR]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
