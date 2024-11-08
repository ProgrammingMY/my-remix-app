import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY as string,
        secretAccessKey: env.R2_SECRET_KEY as string,
      },
      forcePathStyle: true,
    });

    const getObjectCommand = new GetObjectCommand({
      Bucket: env.CF_BUCKET_NAME,
      Key: key,
    });

    const signedURL = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 60, // 60 seconds
    });

    if (!signedURL) {
      return new Response("Object not found", { status: 404 });
    }

    return new Response(signedURL, {
      status: 200,
    });
  } catch (error) {
    console.log("[GET_OBJECT ERROR]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
