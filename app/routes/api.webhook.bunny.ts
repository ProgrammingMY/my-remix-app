import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";

interface BunnyWebhookData {
  VideoGuid: string;
  VideoLibraryId: number;
  Status: number;
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // make sure request is from bunny

    const { env } = context.cloudflare;

    const data = (await request.json()) as BunnyWebhookData;

    if (data) {
      const db = drizzle(env.DB_drizzle, { schema });

      await db
        .update(schema.bunnyData)
        .set({
          status: data.Status,
        })
        .where(
          and(
            eq(schema.bunnyData.videoId, data.VideoGuid),
            eq(schema.bunnyData.libraryId, data.VideoLibraryId)
          )
        );
    }

    return json({ message: "ok" });
  } catch (error) {
    console.log("WEBHOOK BUNNY ERROR", error);
    return new Response("Internal server error", { status: 500 });
  }
};
