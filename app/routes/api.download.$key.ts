import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
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

    const { key } = params;

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    // Decode the key before using it
    const decodedKey = decodeURIComponent(key);

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
